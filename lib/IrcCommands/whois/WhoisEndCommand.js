const IrcCommand = require("../../IrcCommand");

/**
 * Received when a WHOIS answer is complete
 * @extends IrcCommand
 * @private
 */
class WhoisEndCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const user = client.getUser(splits[3]);
		console.log(user);
		if(user.whoisEndCallback)
			user.whoisEndCallback();
	}
}

module.exports = WhoisEndCommand;