import TetrisGame from '../src/server/TetrisGame';
import TetrisRoom from '../src/server/TetrisRoom';

jest.mock('../src/server/TetrisRoom'); // Mocking TetrisRoom

describe('TetrisGame_Join', () => {
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

	test('should handle joinRoom successfully', () => {
		const roomId = 'room1';
		mockIo.sockets.adapter.rooms[roomId] = { length: 0 };
		game.handleJoinRoom(mockSocket, roomId);

		expect(mockSocket.join).toHaveBeenCalledWith(roomId);
		expect(TetrisRoom).toHaveBeenCalledWith(roomId);
		expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomSuccess', expect.objectContaining({ roomId }));
		expect(mockSocket.to(roomId).emit).toHaveBeenCalledWith('op_joined', expect.objectContaining({ player: 'player1' }));
	});


	test('should handle joinRoom when room exists and is not playing and has less than 2 players', () => {
		const roomId = 'room1';
		const room = new TetrisRoom(roomId);
		game.rooms[roomId] = room;

		game.handleJoinRoom(mockSocket, roomId);

		expect(mockSocket.join).toHaveBeenCalledWith(roomId);
		expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomSuccess', expect.objectContaining({ roomId }));
	});

	test('should handle joinRoom when room exists but is playing', () => {
		const roomId = 'room1';
		const room = new TetrisRoom(roomId);
		room.status = 'playing';
		game.rooms[roomId] = room;

		game.handleJoinRoom(mockSocket, roomId);

		expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomFailed', 'Room already started');
	});

	test('should handle joinRoom when room exists and is full', () => {
		const roomId = 'room1';
		const room = new TetrisRoom(roomId);
		room.addPlayer({ id: 'player1', player: 'player1' });
		room.addPlayer({ id: 'player2', player: 'player2' });
		game.rooms[roomId] = room;

		game.handleJoinRoom(mockSocket, roomId);

		expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomFailed', 'Room is full');
		expect(mockSocket.join).not.toHaveBeenCalled(); // Ensure socket does not join the room again
	});


	test('should handle joinRoom when room does not exist and is created', () => {
		const roomId = 'room1';

		game.handleJoinRoom(mockSocket, roomId);

		expect(game.rooms[roomId]).toBeDefined();
		expect(mockSocket.join).toHaveBeenCalledWith(roomId);
		expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomSuccess', expect.objectContaining({ roomId }));
	});
});
