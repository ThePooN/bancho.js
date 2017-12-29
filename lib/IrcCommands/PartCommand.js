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
		client.emit("PART", channel.channelMembers[user.ircUsername]);
		if(user.isClient()) {
			channel.joined = false;
			channel.channelMembers = {};
			if(channel.partCallback != null)
				channel.partCallback();
		}
		if(channel.channelMembers[user.ircUsername] != null)
			delete channel.channelMembers[user.ircUsername];
	}
}

module.exports = PartCommand;