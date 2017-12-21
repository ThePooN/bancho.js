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
	}

	/**
	 * Emits the PART event
	 * 
	 * @fires BanchoClient#PART
	 * @param {BanchoClient} client 
	 * @param {BanchoUser} user 
	 * @param {BanchoChannel} channel 
	 */
	emit(client, user, channel) {
		/**
		 * Fired when a user has left a channel
		 * @event BanchoClient#PART
		 * @type {object}
		 * @prop {BanchoUser} user
		 * @prop {BanchoChannel} channel
		 */
		client.emit("PART", {
			user: user, channel: channel
		});
		if(user.isClient() && channel.partCallback != null)
			channel.partCallback();
	}
}

module.exports = PartCommand;