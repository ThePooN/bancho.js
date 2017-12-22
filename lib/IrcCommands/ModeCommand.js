const IrcCommand = require("../IrcCommand");
const modes = require("../BanchoChannelMemberModes");

class ModeCommand extends IrcCommand {
	constructor() {
		super();
	}

	handleCommand(client, command, splits) {
		const channel = client.getChannel(splits[2]);
		const user = client.getUser(splits[4]);

		channel.channelMembers[user.ircUsername].mode = modes[splits[3].substr(1, 1)];
	}
}

module.exports = ModeCommand;