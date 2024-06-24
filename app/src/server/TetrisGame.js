import { randomInt } from 'crypto';
import TetrisRoom from './TetrisRoom.js';
import TetrisPlayer from './TetrisPlayer.js';

class TetrisGame {
	constructor(io) {
		this.io = io;
		this.status = {};
		this.socketToPlayer = new Map();
		this.rooms = {};
	}

	init() {
		this.io.on('connection', this.handleConnection.bind(this));
	}

	handleConnection(socket) {

		socket.on('connection', () => {
			// console.log('a user connected');
		});

		socket.on('disconnect', () => {
			this.handleDisconnect(socket);
		});

		socket.on('joinRoom', roomId => {
			this.handleJoinRoom(socket, roomId);
		});

		socket.on('leaveRoom', () => {
			this.handleLeaveRoom(socket);
		});

		socket.on('end', winner => {
			this.handleEnd(socket, winner);
		});

		socket.on('message', eventData => {
			this.handleMessage(socket, eventData);
		});

		socket.on('start', () => {
			this.handleStart(socket);
		});

		socket.on('stop', () => {
			this.handleStop(socket);
		});
	}

	handleDisconnect(socket) {
		const player = this.socketToPlayer.get(socket.id);
		if (player) {
			this.leaveRoom(socket);
			this.socketToPlayer.delete(socket.id);
		}
	}

	handleLeaveRoom(socket) {
		if (this.socketToPlayer.has(socket.id)) {
			this.leaveRoom(socket);
		}
	}

	leaveRoom(socket) {
		const player = this.socketToPlayer.get(socket.id);
		if (!player) return;

		const roomId = player.getRoomId();
		socket.leave(roomId);
		this.rooms[roomId]?.removePlayer(player.getPlayer());
		this.rooms[roomId].endGame();

		socket.to(roomId).emit('op_left', {});

		if (player.getPlayer() === 'player1') {
			const room = this.rooms[roomId];
			if (room.getPlayers() && room.getPlayers().length > 0) {
				const otherPlayer = this.rooms[roomId].getPlayers()[0];
				otherPlayer.setPlayer('player1');
				this.io.to(otherPlayer).emit('lead_change', 'player1');
			} else {
				this.rooms[roomId].removePlayer(player.getPlayer());
				delete this.rooms[roomId];
			}
		}
	}

	handleJoinRoom(socket, roomId) {
		const room = this.rooms[roomId];

		if (room) {
			if (room.status === 'playing') {
				socket.emit('joinRoomFailed', 'Room already started');
			} else if (room.getPlayers() && room.getPlayers().length >= 2) {
				socket.emit('joinRoomFailed', 'Room is full');
			} else {
				this.joinRoom(roomId, socket);
			}
		} else {
			this.rooms[roomId] = new TetrisRoom(roomId);
			this.joinRoom(roomId, socket);
		}
	}

	joinRoom(roomId, socket) {
		socket.join(roomId);
		const player = 'player' + (this.rooms[roomId].getPlayers().length + 1);
		const tetrisPlayer = new TetrisPlayer(socket.id, roomId, player);
		this.rooms[roomId].addPlayer(tetrisPlayer);
		this.socketToPlayer.set(socket.id, tetrisPlayer);
		socket.emit('joinRoomSuccess', { player, roomId });
		socket.to(roomId).emit('op_joined', { player });
	}

	handleMessage(socket, eventData) {
		eventData = JSON.parse(eventData);

		const player = this.socketToPlayer.get(socket.id);
		const roomId = player.getRoomId();
		socket.to(roomId).emit('message', eventData);
		// console.log(`Message event sent to room ${roomId}`, eventData);

		const { event, info } = eventData;
		if (event === 'next') {
			player.nextPuzzle();
			const playerPuzzle = player.getPuzzle();
			this.io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: playerPuzzle } });
			this.io.to(roomId).emit('message', { event: 'op_puzzle', data: { player: player.getPlayer(), type: playerPuzzle } });
		} else {
			this.io.to(roomId).emit('message', { event: `op_${event}`, data: { player: player.getPlayer(), data: info } });
		}
	}

	handleStart(socket) {
        if (this.socketToPlayer.has(socket.id)) {
            const player = this.socketToPlayer.get(socket.id);
            const roomId = player.getRoomId();
            
            if (roomId && this.rooms[roomId]) {
                if (this.rooms[roomId].status === 'playing') {
                    this.io.to(roomId).emit('error', 'Game already started');
                } else {
                    if (player.getPlayer() === 'player1') {
                        this.io.to(roomId).emit('start', player.getPlayer());
                        this.rooms[roomId].startGame();
						this.io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: player.getPuzzle() } } ) ;
                    } else {
                        this.io.to(roomId).emit('error', 'Game cannot be started by you');
                    }
                }
            } else {
                console.error(`Room with ID ${roomId} does not exist.`);
            }
        } else {
            console.error(`Player with socket ID ${socket.id} not found.`);
        }
    }

	handleEnd(socket, winner) {
        if (this.socketToPlayer.has(socket.id)) {
            const player = this.socketToPlayer.get(socket.id);
            const roomId = player.getRoomId();

            if (roomId && this.rooms[roomId]) {
                this.rooms[roomId].endGame(socket, `${winner} wins`);
            } else {
                console.error(`Room with ID ${roomId} does not exist.`);
            }
        } else {
            console.error(`Player with socket ID ${socket.id} not found.`);
        }
    }

	handleStop(socket) {
        if (this.socketToPlayer.has(socket.id)) {
            const player = this.socketToPlayer.get(socket.id);
            const roomId = player.getRoomId();

            if (roomId && this.rooms[roomId]) {
                if (player.getPlayer() === 'player1') {
                    this.rooms[roomId].endGame(socket, 'Game stopped by player1');
                } else {
                    this.io.to(roomId).emit('error', 'Game cannot be stopped by you');
                }
            } else {
                console.error(`Room with ID ${roomId} does not exist.`);
            }
        } else {
            console.error(`Player with socket ID ${socket.id} not found.`);
        }
    }
	endGame(socket, message) {
		const player = this.socketToPlayer.get(socket.id);
		if (!player) return;

		const roomId = player.getRoomId();
		this.rooms[roomId].endGame();
		socket.to(roomId).emit('gameOver', { message });
	}
}

export default TetrisGame;
