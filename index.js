// var static = require('node-static');
// var http = require('http');
// var file = new(static.Server)();
// var app = http.createServer(function (req, res) {
//     file.serve(req, res);
// }).listen(2013);

const express = require('express');
const app = express();
const socket = require('socket.io');


/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log('~~~ Tuning in to the waves of port '+PORT+' ~~~'));

//socket setup
var io = socket(server);


/**
 * ===================================
 *              ROUTES
 * ===================================
 */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


/**
 * ===================================
 *            WebSockets
 * ===================================
 */
io.sockets.on('connection', function (socket) {
    function log() {
        var array = ['>>> '];
        for(let i=0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    } 

    socket.on('message', function (message) {
        log('Got Message: ', message);
        socket.broadcast.emit('message', message); //SHOULD BE FOR ROOM ONLY
    });

    socket.on('create or join', function (room) {
        let numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s).');
        log('Request to create or join room', room);

        if (numClients == 0) {
            socket.join(room);
            socket.emit('created ' + room);
        } else if ( numClients == 1) {
            io.sockets.in(room).emit('join ', room);
            socket.join(room);
            socket.emit('joined ', room);
        } else { // MAX 2 Clients
            socket.emit('full ', room);
        }

        socket.emit('emit(): client' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });


})
