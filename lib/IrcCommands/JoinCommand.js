const IrcCommand = require("../IrcCommand");
const BanchoChannelMember = require("../BanchoChannelMember");

/**
 * Join IRC command
 * @description Received when we or someone joins a channel. Executes join callbacks if that's us.
 * @extends {IrcCommand}
 * @private
 */
class JoinCommand extends IrcCommand {
	constructor() {
		super();
	}

	/**
	 * Emits the JOIN event
	 *
	 * @fires BanchoClient#JOIN
	 * @param {BanchoClient} client
	 * @param {BanchoUser} user
	 * @param {BanchoChannel} channel
	 */
	emit(client, user, channel) {
		const member = new BanchoChannelMember(client, channel, user.ircUsername);
		channel.channelMembers.set(user.ircUsername, member);
		if(user.isClient()) {
			channel.joined = true;
			if(channel.joinCallback != null)
				channel.joinCallback();
		}

		/**
		 * Fired when a user has joined a channel
		 * @event BanchoClient#JOIN
		 * @type {BanchoChannelMember}
		 */
		client.emit("JOIN", member);
	}

	handleCommand(client, command, splits) {
		const user = client.getUser((splits[0].split("!"))[0].substr(1));
		const channel = client.getChannel(splits[2].substr(1));
		this.emit(client, user, channel);
	}
}

module.exports = JoinCommand;
