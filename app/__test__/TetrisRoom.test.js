import TetrisRoom from '../src/server/TetrisRoom.js';

describe('TetrisRoom', () => {
	let room;
	let player1, player2;

	beforeEach(() => {
		room = new TetrisRoom('room1');
		player1 = { setPuzzle: jest.fn() };
		player2 = { setPuzzle: jest.fn() };
	});

	test('should initialize with given roomId', () => {
		expect(room.roomId).toBe('room1');
		expect(room.players).toEqual([]);
		expect(room.status).toBe('waiting');
	});

	test('should add a player', () => {
		room.addPlayer(player1);
		expect(room.getPlayers()).toContain(player1);
	});

	test('should remove a player', () => {
		room.addPlayer(player1);
		room.addPlayer(player2);
		room.removePlayer(player1);
		expect(room.getPlayers()).not.toContain(player1);
		expect(room.getPlayers()).toContain(player2);
	});

	test('should start the game and set a puzzle for each player', () => {
		room.addPlayer(player1);
		room.addPlayer(player2);
		room.startGame();

		expect(room.getStatus()).toBe('playing');
		expect(player1.setPuzzle).toHaveBeenCalled();
		expect(player2.setPuzzle).toHaveBeenCalled();
		expect(player1.setPuzzle).toHaveBeenCalledWith(expect.any(Number));
		expect(player2.setPuzzle).toHaveBeenCalledWith(expect.any(Number));
	});

	test('should end the game and reset the puzzle for each player', () => {
		room.addPlayer(player1);
		room.addPlayer(player2);
		room.startGame();
		room.endGame();

		expect(room.getStatus()).toBe('waiting');
		expect(player1.setPuzzle).toHaveBeenCalledWith(0);
		expect(player2.setPuzzle).toHaveBeenCalledWith(0);
	});
});
