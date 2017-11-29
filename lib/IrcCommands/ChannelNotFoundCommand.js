const IrcCommand = require("../IrcCommand");

class ChannelNotFoundCommand extends IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		client.emit("nochannel", splits[3]);
		client.callJoinCallback(new Error("No such channel: "+splits[3]), splits[3], true, false);
	}
}

module.exports = ChannelNotFoundCommand;