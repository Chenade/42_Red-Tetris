import { randomInt } from 'crypto';
import TetrisRoom from './TetrisRoom.js';


class TetrisGame {
	constructor(io) {
		this.io = io;
		this.status = {};
		this.socketToPlayer = new Map();
		this.rooms = [];
	}

	init() {
		this.io.on('connection', this.handleConnection.bind(this));
	}

	handleConnection(socket) {
		//   console.log('A user connected');

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
		if (this.socketToPlayer.has(socket.id)) {
			this.leaveRoom(socket);
		}
	}

	handleLeaveRoom(socket) {
		if (this.socketToPlayer.has(socket.id)) {
			this.leaveRoom(socket);
		}
	}

	leaveRoom(socket) {
		const { roomId, player } = this.socketToPlayer.get(socket.id);
		socket.leave(roomId);
		this.socketToPlayer.delete(socket.id);
		socket.to(roomId).emit('op_left', {});
		if (player === 'player1') {
			const otherPlayer = Array.from(this.io.sockets.adapter.rooms[roomId]).find(socketId => socketId !== socket.id);
			if (otherPlayer) {
				this.socketToPlayer.set(otherPlayer, { roomId, player: 'player1' });
				socket.to(otherPlayer).emit('joinRoomSuccess', { player: 'player1', roomId });
			}

		}

	}

	handleJoinRoom(socket, roomId) {
		const room = this.rooms[roomId];
		
		if (room) {
			if (room.status === 'playing') {
				socket.emit('joinRoomFailed', 'Room already started');
			} else if (room.players.length > 1) {
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
		const player = 'player' + (parseInt(this.io.sockets.adapter.rooms[roomId]?.length || 0) + 1);
		this.rooms[roomId].addPlayer({ id: socket.id, player });
		this.socketToPlayer.set(socket.id, { roomId, player });
		socket.emit('joinRoomSuccess', { player, roomId });
		socket.to(roomId).emit('op_joined', { player });
	}

	handleMessage(socket, eventData) {
		eventData = JSON.parse(eventData);

		const { roomId, player } = this.socketToPlayer.get(socket.id);
		socket.to(roomId).emit('message', eventData);
		console.log(`Message event sent to room ${roomId}`, eventData);

		const { event, info } = eventData;
		if (event === 'next') {
			if (player === 'player1') {
				this.status[roomId].player1.puzzle += 1;
				this.io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: this.status[roomId].player1.puzzle } });
				this.io.to(roomId).emit('message', { event: 'op_puzzle', data: { player: 'player1', type: this.status[roomId].player1.puzzle } });
			} else if (player === 'player2') {
				this.status[roomId].player2.puzzle += 1;
				this.io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: this.status[roomId].player2.puzzle } });
				this.io.to(roomId).emit('message', { event: 'op_puzzle', data: { player: 'player2', type: this.status[roomId].player2.puzzle } });
			}
		} else {
			this.io.to(roomId).emit('message', { event: `op_${event}`, data: { player: player === 'player1' ? 'player1' : 'player2', data: info } });
		}
	}

	handleStart(socket) {
		if (this.socketToPlayer.has(socket.id)) {
			const { roomId, player } = this.socketToPlayer.get(socket.id);
			console.log(`Start event sent to room ${roomId} by ${player}`);

			if (this.rooms[roomId].status === 'playing')
			{
				this.io.to(roomId).emit('error', 'Game already started');
			} else
			{
				if (player === 'player1') {
					this.io.to(roomId).emit('start', player);
					this.rooms[roomId].startGame();
					if (!this.status[roomId]) {
						const init = randomInt(1, 7);
						this.status[roomId] = {
							player1: { score: 0, puzzle: init },
							player2: { score: 0, puzzle: init }
						};
						this.io.to(roomId).emit('message', { event: 'newPuzzle', data: { type: init } });
					} else {
						this.io.to(roomId).emit('error', 'Game cannot be started');
					}
				} else {
					this.io.to(roomId).emit('error', 'Game cannot be started by you');
					console.log(`Player ${player} tried to start the game, but only player1 can start.`);
				}
			}
		}
	}

	handleEnd(winner) {
		if (this.rooms[roomId].status === 'playing')
		{
			this.endGame(winner.concat(' wins'));
		}
	}

	handleStop(socket) {
		if (this.rooms[roomId].status === 'playing')
		{
			if (this.socketToPlayer.has(socket.id)) {
				const { roomId, player } = this.socketToPlayer.get(socket.id);
				console.log(`Start event sent to room ${roomId} by ${player}`);
		
				if (player === 'player1') {
					this.endGame('Game stopped by player1');
				} else {
					this.io.to(roomId).emit('error', 'Game cannot be stop by you');
					console.log(`Player ${player} tried to start the game, but only player1 can start.`);
				}
			}
		}
	}

	endGame(message) {
		this.rooms[roomId].endGame();
		const { roomId } = this.socketToPlayer.get(socket.id);
		socket.to(roomId).emit('gameOver', { message });
		this.socketToPlayer.delete(socket.id);
	}

}

export default TetrisGame;
