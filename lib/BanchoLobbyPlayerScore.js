/**
 * Represents a score done by a player in a lobby
 * Only contains informations transmitted from IRC: score and pass/fail.
 * More details available when fetching the API
 * 
 * @prop {number} score
 * @prop {boolean} pass
 */
class BanchoLobbyPlayerScore {
	constructor(score, pass) {
		this.score = score;
		this.pass = pass;
	}
}

module.exports = BanchoLobbyPlayerScore;