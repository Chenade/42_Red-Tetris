import TetrisRoom from './TetrisRoom.js';
import TetrisPlayer from './TetrisPlayer.js';

class TetrisGame {
    constructor(io) {
        this.io = io;
        this.rooms = {};
        this.socketToPlayer = new Map();
    }

    init() {
        this.io.on('connection', socket => this.handleConnection(socket));
    }

    handleConnection(socket) {
        socket.on('disconnect', () => this.handleDisconnect(socket));
        socket.on('joinRoom', (roomId) => this.handleJoinRoom(socket, roomId));
        socket.on('leaveRoom', () => this.handleLeaveRoom(socket));
        socket.on('start', () => this.handleStart(socket));
        socket.on('stop', () => this.handleStop(socket));
        socket.on('end', (message) => this.handleEnd(socket, message));
        socket.on('message', (eventData) => this.handleMessage(socket, eventData));
    }

    handleDisconnect(socket) {
        const player = this.socketToPlayer.get(socket.id);
        if (player) {
            this.leaveRoom(socket);
            this.socketToPlayer.delete(socket.id);
        }
    }

    handleJoinRoom(socket, roomId) {
        let room = this.rooms[roomId];
        if (!room) {
            room = new TetrisRoom(roomId);
            this.rooms[roomId] = room;
        }

        if (room.status === 'playing') {
            socket.emit('joinRoomFailed', 'Room already started');
            return;
        }

        if (room.getPlayers().length >= 2) {
            socket.emit('joinRoomFailed', 'Room is full');
            return;
        }

        this.joinRoom(roomId, socket);
    }

    handleLeaveRoom(socket) {
        const player = this.socketToPlayer.get(socket.id);
        if (player) {
            this.leaveRoom(socket);
        }
    }

    handleStart(socket) {
        const player = this.socketToPlayer.get(socket.id);
        if (!player || player.player !== 'player1') {
            this.io.to(player.getRoomId()).emit('error', 'Game cannot be started by you');
            return;
        }

        const room = this.rooms[player.getRoomId()];
        if (room.status === 'playing') {
            this.io.to(player.getRoomId()).emit('error', 'Game already started');
            return;
        }

        room.startGame();
		this.io.to(player.getRoomId()).emit('message', { event: 'newPuzzle', data: { type: player.getPuzzle() } } ) ;
        this.io.to(player.getRoomId()).emit('start', player.role);
    }

    handleStop(socket) {
        const player = this.socketToPlayer.get(socket.id);
        if (!player || player.role !== 'player1') {
            this.io.to(player.getRoomId()).emit('error', 'Game cannot be stopped by you');
            return;
        }

        this.endGame(socket, 'Game stopped by player1');
    }

    handleEnd(socket, message) {
        this.endGame(socket, `${message} wins`);
    }

    handleMessage(socket, eventData) {
        try {
            eventData = JSON.parse(eventData);
        } catch (e) {
            console.error('Invalid message format', eventData);
            return;
        }

        const player = this.socketToPlayer.get(socket.id);
        const roomId = player.getRoomId();
        const { event, info } = eventData;

        if (event === 'next') {
            player.nextPuzzle();
            this.io.to(socket.id).emit('message', { event: 'newPuzzle', data: { type: player.getPuzzle() } });
        }

        this.io.to(roomId).emit('message', { event: `op_${event}`, data: { player: player.role, data: info } });
    }

    endGame(socket, message) {
        const player = this.socketToPlayer.get(socket.id);
        const roomId = player.getRoomId();
        if (!this.rooms[roomId]) {
            return;
        }
        this.rooms[roomId].endGame();
        socket.to(roomId).emit('gameOver', { message });
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

    leaveRoom(socket) {
		const player = this.socketToPlayer.get(socket.id);
		if (!player) return;

		const roomId = player.getRoomId();
		socket.leave(roomId);
		this.rooms[roomId].removePlayer(player.getPlayer());

		socket.to(roomId).emit('op_left', {});

		if (player.getPlayer() === 'player1') {
			if (this.rooms[roomId].getPlayers() && this.rooms[roomId].getPlayers().length > 1) {
				const otherPlayer = this.rooms[roomId].getPlayers()[0].id;
				if (otherPlayer) {
					const otherPlayerInstance = this.socketToPlayer.get(otherPlayer);
					otherPlayerInstance.setPlayer('player1');
					this.io.to(otherPlayer).emit('joinRoomSuccess', { player: 'player1', roomId });
				}
			} else {
				this.rooms[roomId].removePlayer(player.getPlayer());
				delete this.rooms[roomId];
			}
		}
	}
}

export default TetrisGame;
