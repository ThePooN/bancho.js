const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");
const BanchoLobbyPlayerScore = require("../../lib/Multiplayer/BanchoLobbyPlayerScore");
const BanchoLobby = require("../../lib/Multiplayer/BanchoLobby");

class MultiplayerScoresSortingUnit extends TestUnit {
	constructor() {
		super();
		this.name = "MultiplayerScoresSortingUnit";
	}

	async run() {
		const _this = {
			scores: [
				new BanchoLobbyPlayerScore(500000, false, null),
				new BanchoLobbyPlayerScore(500000, true, null),
				new BanchoLobbyPlayerScore(1000000, true, null),
				new BanchoLobbyPlayerScore(800000, true, null),
				new BanchoLobbyPlayerScore(900000, false, null)
			]
		};
		const expectedScores = [
			new BanchoLobbyPlayerScore(1000000, true, null),
			new BanchoLobbyPlayerScore(800000, true, null),
			new BanchoLobbyPlayerScore(500000, true, null),
			new BanchoLobbyPlayerScore(900000, false, null),
			new BanchoLobbyPlayerScore(500000, false, null)
		];
		BanchoLobby.prototype.sortScores.apply(_this);
		if(JSON.stringify(_this.scores) == JSON.stringify(expectedScores))
			this.fulFillGoal(TestGoals.MultiplayerScoresSorting);
		else
			throw new Error("Sorted scores and expected sorting don't match! expected: " + JSON.stringify(expectedScores) + ", got: " + JSON.stringify(_this.scores));
	}
}

module.exports = new MultiplayerScoresSortingUnit();