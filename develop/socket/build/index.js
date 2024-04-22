"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var crypto_1 = require("crypto");
var path = require('path'); // Import the 'path' module
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server);
var PORT = 3000;
// app.use(express.static(__dirname + '/public'));
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
var status = {};
var socketToPlayer = new Map();
io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('disconnect', function () {
        console.log('User disconnected');
        if (socketToPlayer.has(socket.id)) {
            var playerRole = socketToPlayer.get(socket.id);
            socket.leave(playerRole.roomId);
            console.log("Player disconnected: ".concat(playerRole.player));
            socketToPlayer.delete(socket.id);
        }
    });
    socket.on('joinRoom', function (roomId) {
        var room = io.sockets.adapter.rooms.get(roomId);
        if (!room || (room.size < 2)) {
            socket.join(roomId);
            var _room = io.sockets.adapter.rooms.get(roomId);
            var player = 'player' + ((_room === null || _room === void 0 ? void 0 : _room.size) || 0);
            socketToPlayer.set(socket.id, { roomId: roomId, player: player });
            socket.emit('joinRoomSuccess', { 'player': player, 'roomId': roomId });
            console.log("User joined room ".concat(roomId, " as ").concat(player));
        }
        else {
            socket.emit('joinRoomFailed', 'Room is full');
            console.log("User tried to join room ".concat(roomId, ", but it's full"));
        }
    });
    socket.on('leaveRoom', function (roomId) {
        socket.leave(roomId);
        console.log("User left room ".concat(roomId));
    });
    socket.on('message', function (roomId, eventData) {
        socket.to(roomId).emit('message', eventData);
        console.log("Message event sent to room ".concat(roomId), eventData);
        var event = eventData.event, data = eventData.data;
        if (event === 'next') {
            var player = data.player;
            if (player === 'player1') {
                status[roomId].player1.puzzle += 1;
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: (0, crypto_1.randomInt)(1, 100) } });
            }
            else if (player === 'player2') {
                status[roomId].player2.puzzle += 1;
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: (0, crypto_1.randomInt)(1, 100) } });
            }
        }
    });
    socket.on('start', function () {
        if (socketToPlayer.has(socket.id)) {
            var playerRole = socketToPlayer.get(socket.id);
            var roomId = playerRole.roomId, player = playerRole.player;
            // Check if the player is player 1
            if (player === 'player1') {
                console.log("Start event sent to room ".concat(roomId, " by ").concat(player));
                io.to(roomId).emit('start', player);
                if (!status[roomId]) {
                    var init = (0, crypto_1.randomInt)(1, 100);
                    status[roomId] = {
                        player1: { score: 0, puzzle: init },
                        player2: { score: 0, puzzle: init }
                    };
                    io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: init } });
                }
            }
            else {
                console.log("Player ".concat(player, " tried to start the game, but only player1 can start."));
            }
        }
    });
});
server.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
