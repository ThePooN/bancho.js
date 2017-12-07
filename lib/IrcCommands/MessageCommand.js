const IrcCommand = require("../IrcCommand");
const PrivateMessage = require("../PrivateMessage");
const ChannelMessage = require("../ChannelMessage");

/**
 * Message IRC command
 * @description Received when a message is sent in either channels or PMs.
 * @fires BanchoClient#PM
 * @fires BanchoClient#CM
 * @extends {IrcCommand}
 * @private
 */
class MessageCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const user = splits[0].substr(1, splits[0].indexOf("!") - 1);
		const channel = splits[2];
		const message = splits.slice(3).join(" ").substr(1);

		if(channel == client.username)
			/**
			 * Fired when a PM reaches us.
			 * @event BanchoClient#PM
			 * @type {PrivateMessage}
			 */
			client.emit("PM", new PrivateMessage(user, message));
		else
			/**
			 * Fired when a channel message reaches us.
			 * @event BanchoClient#CM
			 * @type {ChannelMessage}
			 */
			client.emit("CM", new ChannelMessage(user, message, channel));
	}
}

module.exports = MessageCommand;