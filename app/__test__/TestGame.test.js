import TetrisGame from '../src/server/TetrisGame';
import TetrisRoom from '../src/server/TetrisRoom';

jest.mock('../src/server/TetrisRoom'); // Mocking TetrisRoom

describe('TetrisGame', () => {
	let mockIo;
	let mockSocket;
	let game;
	let room;

	beforeEach(() => {
		mockIo = {
			on: jest.fn(),
			to: jest.fn().mockReturnThis(),
			emit: jest.fn(),
			sockets: {
				adapter: {
					rooms: {}
				}
			}
		};

		mockSocket = {
			id: 'socket1',
			on: jest.fn(),
			emit: jest.fn(),
			join: jest.fn(),
			leave: jest.fn(),
			to: jest.fn().mockReturnThis()
		};

		game = new TetrisGame(mockIo);
		room = new TetrisRoom('room1');
		game.rooms['room1'] = room;
		game.socketToPlayer.set('socket1', { roomId: 'room1', player: 'player1' });

		room.endGame = jest.fn(); // Mocking endGame method
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should initialize and handle connection', () => {
		game.init();
		expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));

		const connectionHandler = mockIo.on.mock.calls[0][1];
		connectionHandler(mockSocket);
		expect(mockSocket.on).toHaveBeenCalledTimes(8); // 8 event listeners
	});

	test('should handle leaveRoom', () => {
		const roomId = 'room1';
		game.socketToPlayer.set(mockSocket.id, { roomId, player: 'player1' });
		game.rooms[roomId] = new TetrisRoom(roomId);

		game.handleLeaveRoom(mockSocket);
		expect(mockSocket.leave).toHaveBeenCalledWith(roomId);
		expect(game.socketToPlayer.has(mockSocket.id)).toBe(false);
		expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith('op_left', {});
	});

	test('should handle start game', () => {
		const roomId = 'room1';
		const room = new TetrisRoom(roomId);
		game.rooms[roomId] = room;
		game.socketToPlayer.set(mockSocket.id, { roomId, player: 'player1' });

		game.handleStart(mockSocket);
		expect(mockIo.to(roomId).emit).toHaveBeenCalledWith('start', 'player1');
		expect(room.startGame).toHaveBeenCalled();
	});

	test('should handle stop game', () => {
		const roomId = 'room1';
		const room = new TetrisRoom(roomId);
		room.status = 'playing';
		game.rooms[roomId] = room;
		game.socketToPlayer.set(mockSocket.id, { roomId, player: 'player1' });

		game.handleStop(mockSocket);
		expect(room.endGame).toHaveBeenCalled();
		expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith('gameOver', { message: 'Game stopped by player1' });
	});

	test('should handle message', () => {
		const roomId = 'room1';
		const eventData = JSON.stringify({ event: 'next', info: {} });
		const room = new TetrisRoom(roomId);
		game.rooms[roomId] = room;
		game.status[roomId] = { player1: { puzzle: 0 }, player2: { puzzle: 0 } };
		game.socketToPlayer.set(mockSocket.id, { roomId, player: 'player1' });

		game.handleMessage(mockSocket, eventData);
		expect(mockIo.to(mockSocket.id).emit).toHaveBeenCalledWith('message', expect.objectContaining({ event: 'newPuzzle' }));
	});

	test('should handle end game', () => {
		room.status = 'playing';
		game.handleEnd(mockSocket, 'player1');

		expect(room.endGame).toHaveBeenCalled();
		expect(mockSocket.to('room1').emit).toHaveBeenCalledWith('gameOver', { message: 'player1 wins' });
	});
});
