class TetrisRoom {
	constructor(roomId) {
		this.roomId = roomId;
		this.players = [];
		this.status = 'waiting';
	}

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(player) {
		this.players = this.players.filter(p => p !== player);
	}

	startGame() {
		this.status = 'playing';
	}

	endGame() {
		this.status = 'end';
	}

	getPlayers() {
		return this.players;
	}
}

export default TetrisRoom;