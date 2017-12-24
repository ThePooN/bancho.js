const IrcCommand = require("../IrcCommand");

/**
 * Handles channels topics
 * 
 * @extends IrcCommand
 * @private
 */
class ChannelTopicCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const channel = client.getChannel(splits[3]);
		splits.splice(0, 4);
		splits[0] = splits[0].substr(1, splits[0].length - 1);
		channel.topic = splits.join(" ");
	}
}

module.exports = ChannelTopicCommand;