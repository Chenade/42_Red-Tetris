import { randomInt } from 'crypto';

class TetrisGame {
	constructor(io) {
	  this.io = io;
	  this.status = {};
	  this.socketToPlayer = new Map();
	}
  
	init() {
	  this.io.on('connection', this.handleConnection.bind(this));
	}
  
	handleConnection(socket) {
	  console.log('A user connected');
  
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
	}
  
	handleDisconnect(socket) {
	  if (this.socketToPlayer.has(socket.id)) {
		const { roomId } = this.socketToPlayer.get(socket.id);
		socket.leave(roomId);
		this.socketToPlayer.delete(socket.id);
	  }
	}
  
	handleJoinRoom(socket, roomId) {
	  const room = this.io.sockets.adapter.rooms[roomId];
	  if (room) {
		if (this.status[roomId]) {
		  socket.emit('joinRoomFailed', 'Room already started');
		} else if (room.length > 1) {
		  socket.emit('joinRoomFailed', 'Room is full');
		} else {
		  this.joinRoom(roomId, socket);
		}
	  } else {
		this.joinRoom(roomId, socket);
	  }
	}
  
	joinRoom(roomId, socket) {
	  socket.join(roomId);
	  const player = 'player' + (this.io.sockets.adapter.rooms[roomId]?.length || 0);
	  this.socketToPlayer.set(socket.id, { roomId, player });
	  socket.emit('joinRoomSuccess', { player, roomId });
	}
  
	handleLeaveRoom(socket) {
	  const { roomId } = this.socketToPlayer.get(socket.id);
	  socket.leave(roomId);
	  this.socketToPlayer.delete(socket.id);
	  socket.to(socket.id).emit('leaveRoomSuccess', {});
	  socket.to(roomId).emit('op_left', {});
	}
  
	handleEnd(socket, winner) {
	  const { roomId } = this.socketToPlayer.get(socket.id);
	  socket.to(roomId).emit('gameOver', { winner });
	  this.socketToPlayer.delete(socket.id);
	  delete this.status[roomId];
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
  
		if (player === 'player1') {
		  this.io.to(roomId).emit('start', player);
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
  
  export default TetrisGame;
  