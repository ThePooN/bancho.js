const IrcCommand = require("../../IrcCommand");

/**
 * Handles the channels part of a WHOIS answer
 * @extends IrcCommand
 * @private
 */
class WhoisChannelsCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const user = client.getUser(splits[3]);

		splits.splice(0, 4);
		splits[0] = splits[0].substr(1, splits[0].length - 1);
		splits.pop();
		// splits now contains the channels list as strings

		// channels will contain the channels as BanchoChannels
		const channels = [];
		for(const split of splits)
			channels.push(client.getChannel(split));
		
		if(user.whoisChannelsCallback)
			user.whoisChannelsCallback(channels);
	}
}

module.exports = WhoisChannelsCommand;