const BanchoLobby = require("./Multiplayer/BanchoLobby");
const BanchoChannel = require("./BanchoChannel");

/**
 * Represents a multiplayer channel on Bancho.
 * It is a classic discussion channel, with commands related to the linked lobby on Bancho.
 * 
 * @prop {BanchoLobby} lobby
 * 
 * @extends BanchoChannel
 * @extends EventEmitter
 */
class BanchoMultiplayerChannel extends BanchoChannel {
	constructor(banchojs, name) {
		super(banchojs, name);

		this.lobby = new BanchoLobby(this);
	}
}

module.exports = BanchoMultiplayerChannel;