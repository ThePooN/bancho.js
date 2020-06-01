const IrcCommand = require("../IrcCommand");

/**
 * Received when someone disconnects from Bancho (with no other client opened)
 * @extends IrcCommand
 * @private
 */
class QuitCommand extends IrcCommand {
	constructor() {
		super();
	}

	handleCommand(client, command, splits) {
		const username = splits[0].substr(1, splits[0].indexOf("!") - 1);
		const user = client.getUser(username);
		/**
		 * Fired when a user has disconnected from Bancho (with no other client opened)
		 * @event BanchoClient#QUIT
		 * @type {BanchoUser}
		 */
		client.emit("QUIT", user);
		for(const channel of Object.values(client.channels))
			channel.channelMembers.delete(user.ircUsername);
	}
}

module.exports = QuitCommand;