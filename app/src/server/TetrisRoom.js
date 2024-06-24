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
		this.players = this.players.filter(p => p.player !== player);
	}

	startGame() {
		this.status = 'playing';
		const puzzle = Math.floor(Math.random() * 6);
		for (let player of this.players) {
			player.setPuzzle(puzzle);
		}
	}

	endGame() {
		this.status = 'waiting';
		for (let player of this.players) {
			player.setPuzzle(0);
		}
	}

	getPlayers() {
		return this.players;
	}

	getStatus() {
		return this.status;
	}
}

export default TetrisRoom;