const BanchoLobbyPlayerStates = require("./Enums/BanchoLobbyPlayerStates");

/**
 * Represents a player in a lobby
 * Don't consider the player in the lobby unless it is in the slots array
 * 
 * @prop {BanchoLobby} lobby
 * @prop {BanchoUser} user
 * @prop {Symbol} state ready/not ready/no map, see BanchoLobbyPlayerState
 * @prop {boolean} isHost
 * @prop {String} team Blue or Red, see BanchoLobbyTeams
 * @prop {Array<BanchoMod>} mods
 * @prop {BanchoLobbyPlayerScore} score
 */
class BanchoLobbyPlayer {
	constructor(lobby, user) {
		this.lobby = lobby;
		this.user = user;
		this.reset();
	}

	reset() {
		this.state = BanchoLobbyPlayerStates["Not Ready"];
		this.isHost = false;
		this.team = null;
		this.mods = [];
		this.score = null;
	}
}

module.exports = BanchoLobbyPlayer;