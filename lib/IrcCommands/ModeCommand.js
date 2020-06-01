const IrcCommand = require("../IrcCommand");
const modes = require("../Enums/BanchoChannelMemberModes");

/**
 * Received when someone's mode in a channel is updated
 * @extends IrcCommand
 * @private
 */
class ModeCommand extends IrcCommand {
	constructor() {
		super();
	}

	handleCommand(client, command, splits) {
		const channel = client.getChannel(splits[2]);
		const user = client.getUser(splits[4]);

		channel.channelMembers.get(user.ircUsername).mode = modes[splits[3].substr(1, 1)];
	}
}

module.exports = ModeCommand;