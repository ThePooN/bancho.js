const JoinCommand = require("./JoinCommand");

/**
 * Part IRC command
 * @description Received when we or someone leaves a channel. Executes leaves callbacks if that's us.
 * @extends {IrcCommand}
 * @private
 */
class PartCommand extends JoinCommand {
	constructor() {
		super();
		this.callback = "callPartCallback";
	}

	/**
	 * Emits the PART event
	 * 
	 * @fires BanchoClient#PART
	 * @param {BanchoClient} client 
	 * @param {string} username 
	 * @param {string} channel 
	 */
	emit(client, username, channel) {
		/**
		 * Fired when a user has left a channel
		 * @event BanchoClient#PART
		 * @type {object}
		 * @prop {string} username
		 * @prop {string} channel
		 */
		client.emit("PART", {
			username: username, channel: channel
		});
	}
}

module.exports = PartCommand;