const IrcCommand = require("../IrcCommand");

/**
 * Channel not found IRC command
 * @description Received when we tried to execute something on a channel that doesn't exist
 * @fires BanchoClient#nochannel
 * @extends {IrcCommand}
 * @private
 */
class ChannelNotFoundCommand extends IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		/** 
		 * Fired when a no channel error is received from Bancho.
		 * 
		 * @event BanchoClient#nochannel 
		 * @type {string}
		 */
		client.emit("nochannel", splits[3]);
		client.callJoinCallback(new Error("No such channel: "+splits[3]), splits[3], true, false);
	}
}

module.exports = ChannelNotFoundCommand;