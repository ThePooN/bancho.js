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
		this.callback = "callJoinCallback";
	}

	/**
	 * Emits the JOIN event
	 * 
	 * @fires BanchoClient#JOIN
	 * @param {BanchoClient} client 
	 * @param {string} username 
	 * @param {string} channel 
	 */
	emit(client, username, channel) {
		/**
		 * Fired when a user has joined a channel
		 * @event BanchoClient#JOIN
		 * @type {object}
		 * @prop {string} username
		 * @prop {string} channel
		 */
		client.emit("JOIN", {
			username: username, channel: channel
		});
	}

	handleCommand(client, command, splits) {
		const username = (splits[0].split("!"))[0].substr(1);
		const channel = splits[2].substr(1);
		this.emit(client, username, channel);
		
		if(client.username == username)
			client[this.callback](null, channel, true);
	}
}

module.exports = JoinCommand;