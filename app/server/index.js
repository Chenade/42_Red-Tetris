import fs from 'fs';
import debug from 'debug';
import { randomInt } from 'crypto';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { log } from 'console';

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
var roomPlayers = new Map();

function joinRoom(roomId, socket, io)
{
	socket.join(roomId);
	var _room = io.sockets.adapter.rooms[roomId];
    var player = 'player' + ((_room === null || _room === void 0 ? void 0 : _room.length) || 0);
	socketToPlayer.set(socket.id, { roomId: roomId, player: player });
	socket.emit('joinRoomSuccess', { 'player': player, 'roomId': roomId });
}


const initEngine = io => {
	
	io.on('connection', function (socket) {
	console.log('A user connected');

    socket.on('disconnect', function () {
        // console.log('User disconnected');
        if (socketToPlayer.has(socket.id)) {
            var playerRole = socketToPlayer.get(socket.id);
            socket.leave(playerRole.roomId);
            // console.log("Player disconnected: ".concat(playerRole.player));
            socketToPlayer.delete(socket.id);
        }
    });

    socket.on('joinRoom', function (roomId) {
        var room = io.sockets.adapter.rooms[roomId];

		if (room)
		{
			if (status[roomId])
				socket.emit('joinRoomFailed', 'Room already start');
			else if (room.length > 1)
				socket.emit('joinRoomFailed', 'Room is full');
			else
				joinRoom(roomId, socket, io);
		}
		else
			joinRoom(roomId, socket, io);
    });
	
    socket.on('leaveRoom', function () {
		var socketInfo = socketToPlayer.get(socket.id);
		const roomId = socketInfo.roomId;
        socket.leave(roomId);
		socketToPlayer.delete(socket.id);
      	socket.to(socket.id).emit('leaveRoomSuccess', {});
		socket.to(roomId).emit('op_left', {})
    });

	socket.on('end', function (winner) {
		var socketInfo = socketToPlayer.get(socket.id);
		const roomId = socketInfo.roomId;
        socket.to(roomId).emit('gameOver', {winner: winner});
		socketToPlayer.delete(socket.id);
		delete status[roomId];
    });

    socket.on('message', function (eventData) {
		eventData = JSON.parse(eventData);
		var socketInfo = socketToPlayer.get(socket.id);
		const roomId = socketInfo.roomId, player = socketInfo.player;

        socket.to(roomId).emit('message', eventData);
        console.log("Message event sent to room ".concat(roomId), eventData);
        var event = eventData.event, 
			data = eventData.info;
        if (event === 'next') {
            // var player = data.player;
            if (player === 'player1') {
                status[roomId].player1.puzzle += 1;
                io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: status[roomId].player1.puzzle } });
                io.to(roomId).emit('message', { event: 'op_puzzle', data: {player: 'player1' , type: status[roomId].player1.puzzle } });
            }
            else if (player === 'player2') {
				status[roomId].player2.puzzle += 1;
                io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: status[roomId].player2.puzzle } });
				io.to(roomId).emit('message', { event: 'op_puzzle', data: {player: 'player2' , type: status[roomId].player2.puzzle } });
            }
        }
		else
		{
			io.to(roomId).emit('message', { event: 'op_'.concat(event)
			, data: {
				player: player === 'player1' ? 'player1' : 'player2',
				data: data } 
			});
		}
    });
    socket.on('start', function () {
        if (socketToPlayer.has(socket.id)) {
            var socketInfo = socketToPlayer.get(socket.id);
            const roomId = socketInfo.roomId, player = socketInfo.player;

			console.log("Start event sent to room ".concat(roomId, " by ").concat(player));
			
            // Check if the player is player 1
			if (player === 'player1') {
                io.to(roomId).emit('start', player);
                if (!status[roomId]) {
                    var init = (0, randomInt)(1, 7);
                    status[roomId] = {
                        player1: { score: 0, puzzle: init },
						player2: { score: 0, puzzle: init }
                    };
                    io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: init } });
                }
				else
				{
					io.to(roomId).emit('error', 'game cannot be started');

				}
            }
            else {
				io.to(roomId).emit('error', 'game cannot be started by you');
                console.log("Player ".concat(player, " tried to start the game, but only player1 can start."));
            }
        }
    });

});
}

export function create(params) {
  log("creating server")
  const promise = new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());

    const server = app.listen(params, () => {
      const io = new SocketIOServer(server, { cors: { origin: '*' } });

      log(`tetris listen on ${params.url}`);

      const stop = cb => {
        io.close();
        server.close(() => {
          log(`Engine stopped.`);
          cb();
        });
      };

      initEngine(io);
      resolve({ stop });
    });
    
  });

  return promise;
}

export default { create };