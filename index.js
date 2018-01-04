/**
 * Main Banchojs class
 * @prop {BanchoClient} BanchoClient The BanchoClient class (Client alias is kept for history purposes)
 * @prop {OutgoingBanchoMessage} OutgoingBanchoMessage The OutgoingMessage class to produce messages
 * @prop {ConnectStates} ConnectStates An enum containing all the possible ConnectStates of bancho.js
 * @prop {BanchoLobbyPlayerStates} BanchoLobbyPlayerStates An enum contains the different player states for players in lobbies
 * @prop {BanchoLobbyTeamModes} BanchoLobbyTeamModes An enum contains the 4 different team modes in Bancho
 * @prop {BanchoLobbyTeams} BanchoLobbyTeams An enum containing the 2 different teams in a multiplayer lobby
 * @prop {BanchoLobbyWinConditions} BanchoLobbyWinConditions An enum containing the 4 win conditions on Bancho
 */
class Banchojs {
	constructor() {
		this.Client = this.BanchoClient = require("./lib/BanchoClient");
		this.OutgoingBanchoMessage = require("./lib/OutgoingBanchoMessage");
		this.ConnectStates = require("./lib/ConnectStates");
		this.BanchoLobbyPlayerStates = require("./lib/BanchoLobbyPlayerStates");
		this.BanchoLobbyTeamModes = require("./lib/BanchoLobbyTeamModes");
		this.BanchoLobbyTeams = require("./lib/BanchoLobbyTeams");
		this.BanchoLobbyWinConditions = require("./lib/BanchoLobbyWinConditions");
	}
}

module.exports = new Banchojs();