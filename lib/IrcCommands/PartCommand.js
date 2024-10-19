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
		const member = channel.channelMembers.get(user.ircUsername);

		if(user.isClient()) {
			channel.joined = false;
			channel.channelMembers.clear();
			if(channel.partCallback != null)
				channel.partCallback();
		} else {
			channel.channelMembers.delete(user.ircUsername);
		}

		/**
		 * Fired when a user has left a channel
		 * @event BanchoClient#PART
		 * @type {BanchoChannelMember}
		 */
		if(member)
			client.emit("PART", member);
	}
}

module.exports = PartCommand;
