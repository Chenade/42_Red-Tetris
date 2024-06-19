import TetrisPlayer from '../src/server/TetrisPlayer.js';

describe('TetrisPlayer', () => {
	let player;

	beforeEach(() => {
		player = new TetrisPlayer('socket1', 'room1', 'player1');
	});

	test('should initialize with given socketId, roomId, and player', () => {
		expect(player.socketId).toBe('socket1');
		expect(player.roomId).toBe('room1');
		expect(player.getPlayer()).toBe('player1');
		expect(player.getPuzzle()).toBe(0);
	});

	test('should set the player name', () => {
		player.setPlayer('player2');
		expect(player.getPlayer()).toBe('player2');
	});

	test('should set the puzzle number', () => {
		player.setPuzzle(3);
		expect(player.getPuzzle()).toBe(3);
	});

	test('should get the next puzzle number', () => {
		player.setPuzzle(5);
		player.nextPuzzle();
		expect(player.getPuzzle()).toBe(6);
		player.nextPuzzle();
		expect(player.getPuzzle()).toBe(0); // since it wraps around with % 7
	});

	test('should return player data', () => {
		const playerData = player.getPlayerData();
		expect(playerData).toEqual({
			room: 'room1',
			player: 'player1',
			puzzle: 0
		});
	});

	test('should return player data by socketId', () => {
		const playerData = player.getPlayerDBySocketId('socket1');
		expect(playerData).toEqual({
			room: 'room1',
			player: 'player1',
			puzzle: 0
		});
	});

	test('should return null if socketId does not match', () => {
		const playerData = player.getPlayerDBySocketId('socket2');
		expect(playerData).toBeNull();
	});
});
