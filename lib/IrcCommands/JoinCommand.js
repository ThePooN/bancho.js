const IrcCommand = require("../IrcCommand");

/**
 * Join IRC command
 * @description Received when we or someone joins a channel. Executes join callbacks if that's us.
 * @extends {IrcCommand}
 * @private
 */
class JoinCommand extends IrcCommand {
	constructor() {
		super();
	}

	/**
	 * Emits the JOIN event
	 * 
	 * @fires BanchoClient#JOIN
	 * @param {BanchoClient} client 
	 * @param {BanchoUser} user
	 * @param {BanchoChannel} channel 
	 */
	emit(client, user, channel) {
		/**
		 * Fired when a user has joined a channel
		 * @event BanchoClient#JOIN
		 * @type {object}
		 * @prop {BanchoUser} user
		 * @prop {BanchoChannel} channel
		 */
		client.emit("JOIN", {
			user: user, channel: channel
		});
		if(user.isClient() && channel.joinCallback != null)
			channel.joinCallback();
	}

	handleCommand(client, command, splits) {
		const user = client.getUser((splits[0].split("!"))[0].substr(1));
		const channel = client.getChannel(splits[2].substr(1));
		this.emit(client, user, channel);
	}
}

module.exports = JoinCommand;