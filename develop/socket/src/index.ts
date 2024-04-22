import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket as SocketIOSocket } from 'socket.io';
import { randomInt } from 'crypto';

const path = require('path'); // Import the 'path' module
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

const PORT: number = 3000;

// app.use(express.static(__dirname + '/public'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

interface PlayerRole {
    roomId: string;
    player: string;
}

let status: { [roomId: string]: { player1: { score: number; puzzle: number; }; player2: { score: number; puzzle: number; }; }; } = {};

const socketToPlayer: Map<string, PlayerRole> = new Map();

io.on('connection', (socket: SocketIOSocket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socketToPlayer.has(socket.id)) {
            const playerRole = socketToPlayer.get(socket.id)!;
            socket.leave(playerRole.roomId);
            console.log(`Player disconnected: ${playerRole.player}`);
            socketToPlayer.delete(socket.id);
        }
    });

    socket.on('joinRoom', (roomId: string) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || (room.size < 2)) {
            socket.join(roomId);
            const _room = io.sockets.adapter.rooms.get(roomId);
            const player = 'player' + (_room?.size || 0);
            socketToPlayer.set(socket.id, { roomId, player });
            socket.emit('joinRoomSuccess', { 'player': player, 'roomId': roomId });
            console.log(`User joined room ${roomId} as ${player}`);
        } else {
            socket.emit('joinRoomFailed', 'Room is full');
            console.log(`User tried to join room ${roomId}, but it's full`);
        }
    });

    socket.on('leaveRoom', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User left room ${roomId}`);
    });

    socket.on('message', (roomId: string, eventData: { event: string; data: any; }) => {
        socket.to(roomId).emit('message', eventData);
        console.log(`Message event sent to room ${roomId}`, eventData);

        const { event, data } = eventData;
        if (event === 'next') {
            const player = data.player;
            if (player === 'player1') {
                status[roomId].player1.puzzle += 1;
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: randomInt(1, 100) } });
            }
            else if (player === 'player2') {
                status[roomId].player2.puzzle += 1;
                io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: randomInt(1, 100) } });
            }
        }
    });

    socket.on('start', () => {
        if (socketToPlayer.has(socket.id)) {
            const playerRole = socketToPlayer.get(socket.id)!;
            const { roomId, player } = playerRole;
    
            // Check if the player is player 1
            if (player === 'player1') {
                console.log(`Start event sent to room ${roomId} by ${player}`);
                io.to(roomId).emit('start', player);
    
                if (!status[roomId]) {
                    const init = randomInt(1, 100);
                    status[roomId] = {
                        player1: { score: 0, puzzle: init },
                        player2: { score: 0, puzzle: init }
                    };
                    io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: init } });
                }
            } else {
                console.log(`Player ${player} tried to start the game, but only player1 can start.`);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
