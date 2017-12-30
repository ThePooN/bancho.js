/**
 * Main Banchojs class
 * @prop {BanchoClient} BanchoClient The BanchoClient class (Client alias is kept for history purposes)
 * @prop {OutgoingBanchoMessage} OutgoingBanchoMessage The OutgoingMessage class to produce messages
 * @prop {ConnectStates} ConnectStates An enum containing all the possible ConnectStates of bancho.js
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