/**
 * The four different win conditions on Bancho
 * @enum
 * @type {number}
 * @readonly
 */
const BanchoLobbyWinConditions = {
	Score: 0,
	Accuracy: 1,
	Combo: 2,
	ScoreV2: 3
};

module.exports = Object.freeze(BanchoLobbyWinConditions);