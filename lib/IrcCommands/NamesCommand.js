const IrcCommand = require("../IrcCommand");
const BanchoChannelMember = require("../BanchoChannelMember");

/**
 * Channel users list received after joining a channel
 * @extends IrcCommand
 * @private
 */
class NamesCommand extends IrcCommand {
	constructor() {
		super();
	}

	handleCommand(client, command, splits) {
		const channel = client.getChannel(splits[4]);
		
		splits.splice(0, 5);
		splits[0] = splits[0].substr(1, splits[0].length - 1);
		splits.pop();
		// splits now contain the players list received in this command

		for(const username of splits) {
			const channelMember = new BanchoChannelMember(client, channel, username);
			const currentMember = channel.channelMembers.get(username);
			if(currentMember) {
				if(currentMember.mode !== channelMember.mode)
					currentMember.mode = channelMember.mode;
			} else {
				channel.channelMembers.set(channelMember.user.ircUsername, channelMember);
			}
		}
	}
}

module.exports = NamesCommand;