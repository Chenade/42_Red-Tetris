class TetrisPlayer {
	constructor(socketId, roomId, player) {
		this.socketId = socketId;
		this.roomId = roomId;
		this.player = "";
		this.puzzle = 0;
		this.setPlayer(player);
		this.setPuzzle(0);
	}

	setPlayer(player) {
		this.player = player;
	}

	setPuzzle(puzzle) {
		this.puzzle = puzzle;
	}

	nextPuzzle() {	
		this.puzzle  = (this.puzzle + 1) % 7;
	}

	getPlayer() {
		return this.player;
	}

	getPuzzle() {
		return this.puzzle;
	}

	getRoomId() {
		return this.roomId;
	}

	getPlayerData() {
		return {
			room: this.roomId,
			player: this.player,
			puzzle: this.puzzle
		};
	}

	getPlayerDBySocketId(socketId) {
		if (this.socketId === socketId) {
			return this.getPlayerData();
		}
		return null;
	}

}

export default TetrisPlayer;