import TetrisRoom from './../src/server/TetrisRoom.js';

describe('TetrisRoom', () => {
	let room;

	beforeEach(() => {
		room = new TetrisRoom('room1');
	});

	test('should initialize with correct roomId and default values', () => {
		expect(room.roomId).toBe('room1');
		expect(room.players).toEqual([]);
		expect(room.status).toBe('waiting');
	});

	test('should add a player to the room', () => {
		room.addPlayer('player1');
		expect(room.players).toContain('player1');
	});

	test('should remove a player from the room', () => {
		room.addPlayer('player1');
		room.addPlayer('player2');
		room.removePlayer('player1');
		expect(room.players).not.toContain('player1');
		expect(room.players).toContain('player2');
	});

	test('should start the game', () => {
		room.startGame();
		expect(room.status).toBe('playing');
	});

	test('should end the game', () => {
		room.startGame();  // Ensure the game is started before ending it
		room.endGame();
		expect(room.status).toBe('end');
	});

	test('should return the list of players', () => {
		room.addPlayer('player1');
		room.addPlayer('player2');
		expect(room.getPlayers()).toEqual(['player1', 'player2']);
	});
});
