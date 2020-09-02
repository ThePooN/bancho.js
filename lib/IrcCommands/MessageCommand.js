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
		const user = client.getUser(splits[0].substr(1, splits[0].indexOf("!") - 1));
		const message = splits.slice(3).join(" ").substr(1);

		if(splits[2].toLowerCase() == client.username.toLowerCase())
			/**
			 * Fired when a PM is received, or sent from us (check for the `self` property).
			 * @event BanchoClient#PM
			 * @type {PrivateMessage}
			 */
			client.emit("PM", new PrivateMessage(user, message, false, client.getSelf()));
		else if(splits[2].indexOf("#") === -1)
			/**
			 * Fired when Bancho sends us back a PM that couldn't be sent.
			 * As far as we know, only happens when a PM is rejected because the recipient blocks messages from non-friends.
			 * @event BanchoClient#rejectedMessage
			 * @type {PrivateMessage}
			 */
			client.emit("rejectedMessage", new PrivateMessage(client.getSelf(), message, true, client.getUser(splits[2])));
		else
			/**
			 * Fired when a channel message is received, or sent from us (check for the `self` property).
			 * @event BanchoClient#CM
			 * @type {ChannelMessage}
			 */
			client.emit("CM", new ChannelMessage(user, message, false, client.getChannel(splits[2])));
	}
}

module.exports = MessageCommand;