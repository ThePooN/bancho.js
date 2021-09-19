const JoinCommand = require("./JoinCommand");

/**
 * Part IRC command
 * @description Received when we or someone leaves a channel. Executes leaves callbacks if that's us.
 * @extends {IrcCommand}
 * @private
 */
class PartCommand extends JoinCommand {
	constructor() {
		super();
	}

	/**
	 * Emits the PART event
	 * 
	 * @fires BanchoClient#PART
	 * @param {BanchoClient} client 
	 * @param {BanchoUser} user 
	 * @param {BanchoChannel} channel 
	 */
	emit(client, user, channel) {
		/**
		 * Fired when a user has left a channel
		 * @event BanchoClient#PART
		 * @type {BanchoChannelMember}
		 */
		if(channel.channelMembers.has(user.ircUsername))
			client.emit("PART", channel.channelMembers.get(user.ircUsername));
		if(user.isClient()) {
			channel.joined = false;
			channel.channelMembers.clear();
			if(channel.partCallback != null)
				channel.partCallback();
		}
		channel.channelMembers.delete(user.ircUsername);
	}
}

module.exports = PartCommand;
