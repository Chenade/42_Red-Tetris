import fs from 'fs';
import debug from 'debug';
import { randomInt } from 'crypto';
import cors from 'cors';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

const logerror = debug('tetris:error');
const loginfo = debug('tetris:info');

const initApp = (app, params, cb) => {
  const { host, port } = params;

  app.use(cors()); // Allow CORS for all routes


  app.get('/bundle.js', (req, res) => {
    fs.readFile(__dirname + '/../../build/bundle.js', (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading bundle.js');
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  app.get('/', (req, res) => {
    fs.readFile(__dirname + '/../../index.html', (err, data) => {
      if (err) {
        logerror(err);
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  const server = app.listen({ host, port }, () => {
    loginfo(`tetris listen on ${params.url}`);
    cb();
  });

  return server;
};

var status = {};
var socketToPlayer = new Map();

const initEngine = io => {
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
        var room = io.sockets.adapter.rooms[roomId];
        if (!room || (room.size < 2)) {
            socket.join(roomId);
            var _room = io.sockets.adapter.rooms[roomId];
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
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: (0, randomInt)(1, 100) } });
            }
            else if (player === 'player2') {
                status[roomId].player2.puzzle += 1;
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: (0, randomInt)(1, 100) } });
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
                    var init = (0, randomInt)(1, 100);
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
}

export function create(params) {
  const promise = new Promise((resolve, reject) => {
    const app = express();
    const server = initApp(app, params, () => {
      const io = socketIo(server);

      const stop = cb => {
        io.close();
        server.close(() => {
          loginfo(`Engine stopped.`);
          cb();
        });
      };

      initEngine(io);
      resolve({ stop });
    });
    
  });

  return promise;
}
