const IrcCommand = require("../IrcCommand");

/**
 * Channel not found IRC command
 * @description Received when we tried to execute something on a channel that doesn't exist
 * @fires BanchoClient#nochannel
 * @extends {IrcCommand}
 * @private
 */
class ChannelNotFoundCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		/** 
		 * Fired when a no channel error is received from Bancho.
		 * 
		 * @event BanchoClient#nochannel 
		 * @type {BanchoChannel}
		 */
		const channel = client.getChannel(splits[3]);
		client.emit("nochannel", channel);
		if(channel.joinCallback != null)
			channel.joinCallback(new Error("No such channel"));
		if(channel.partCallback != null)
			channel.partCallback(new Error("No such channel"));
	}
}

module.exports = ChannelNotFoundCommand;