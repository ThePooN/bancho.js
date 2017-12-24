const IrcCommand = require("../../IrcCommand");

/**
 * Handles the username and userid of a WHOIS answer
 * @extends IrcCommand
 * @private
 */
class WhoisUserCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		const user = client.getUser(splits[3]);
		const userId = Number((/^https?:\/\/osu\.ppy\.sh\/u\/(\d+)$/.exec(splits[4]))[1]);
		if(user.whoisUserCallback)
			user.whoisUserCallback(userId);
	}
}

module.exports = WhoisUserCommand;