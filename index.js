/**
 * Main Banchojs class
 * @prop {BanchoClient} BanchoClient The BanchoClient class (Client alias is kept for history purposes)
 * @prop {OutgoingBanchoMessage} OutgoingBanchoMessage The OutgoingMessage class to produce messages
 * @prop {ConnectStates} ConnectStates An enum containing all the possible ConnectStates of bancho.js
 * @prop {BanchoLobbyPlayerStates} BanchoLobbyPlayerStates An enum containing the different player states for players in lobbies
 * @prop {BanchoLobbyTeamModes} BanchoLobbyTeamModes An enum containing the 4 different team modes in Bancho
 * @prop {BanchoLobbyTeams} BanchoLobbyTeams An enum containing the 2 different teams in a multiplayer lobby
 * @prop {BanchoLobbyWinConditions} BanchoLobbyWinConditions An enum containing the 4 win conditions on Bancho
 */
class Banchojs {
	constructor() {
		this.Client = this.BanchoClient = require("./lib/BanchoClient");
		this.BanchoMessage = require("./lib/BanchoMessage");
		this.PrivateMessage = require("./lib/PrivateMessage");
		this.ChannelMessage = require("./lib/ChannelMessage");
		this.OutgoingBanchoMessage = require("./lib/OutgoingBanchoMessage");
		this.ConnectStates = require("./lib/Enums/ConnectStates");
		this.BanchoLobbyPlayerStates = require("./lib/Multiplayer/Enums/BanchoLobbyPlayerStates");
		this.BanchoLobbyTeamModes = require("./lib/Multiplayer/Enums/BanchoLobbyTeamModes");
		this.BanchoLobbyTeams = require("./lib/Multiplayer/Enums/BanchoLobbyTeams");
		this.BanchoLobbyWinConditions = require("./lib/Multiplayer/Enums/BanchoLobbyWinConditions");
		this.BanchoMods = require("./lib/Multiplayer/Enums/BanchoMods");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoMod.
	 * 
	 * @param {any} mod 
	 */
	isBanchoMod(mod) {
		return mod instanceof require("./lib/Multiplayer/BanchoMod");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoUser.
	 * 
	 * @param {any} user 
	 */
	isBanchoUser(user) {
		return user instanceof require("./lib/BanchoUser");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoChannel.
	 * 
	 * @param {any} channel 
	 */
	isBanchoChannel(channel) {
		return channel instanceof require("./lib/BanchoChannel");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoMultiplayerChannel.
	 * 
	 * @param {any} channel 
	 */
	isBanchoMultiplayerChannel(channel) {
		return channel instanceof require("./lib/BanchoMultiplayerChannel");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoLobby.
	 * 
	 * @param {any} lobby 
	 */
	isBanchoLobby(lobby) {
		return lobby instanceof require("./lib/Multiplayer/BanchoLobby");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoChannelMember.
	 * 
	 * @param {any} member 
	 */
	isBanchoChannelMember(member) {
		return member instanceof require("./lib/BanchoChannelMember");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of BanchoMessage.
	 * 
	 * @param {any} message 
	 */
	isBanchoMessage(message) {
		return message instanceof require("./lib/BanchoMessage");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of ChannelMessage.
	 * 
	 * @param {any} message 
	 */
	isChannelMessage(message) {
		return message instanceof require("./lib/ChannelMessage");
	}

	/**
	 * Compares the provided object and return true if the object is an instance of PrivateMessage.
	 * 
	 * @param {any} message 
	 */
	isPrivateMessage(message) {
		return message instanceof require("./lib/PrivateMessage");
	}
}

module.exports = new Banchojs();