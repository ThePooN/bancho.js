const IrcCommand = require("../IrcCommand");
const PrivateMessage = require("../PrivateMessage");
const ChannelMessage = require("../ChannelMessage");

class MessageCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const user = splits[0].substr(1, splits[0].indexOf("!") - 1);
		const channel = splits[2];
		const message = splits.slice(3).join(" ").substr(1);

		if(channel == client.username)
			client.emit("PM", new PrivateMessage(user, message));
		else
			client.emit("CM", new ChannelMessage(user, message, channel));
	}
}

module.exports = MessageCommand;