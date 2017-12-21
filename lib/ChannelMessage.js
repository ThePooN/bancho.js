const BanchoMessage = require("./BanchoMessage");

/**
 * Message received from a Channel
 * 
 * @prop {string} channel Channel the message was received from
 * @extends {BanchoMessage}
 */
class ChannelMessage extends BanchoMessage {
	/**
	 * Creates an instance of ChannelMessage.
	 * @param {BanchoUser} user User the message was sent by
	 * @param {string} message Message body
	 * @param {string} channel Channel the message was received from
	 */
	constructor(user, message, channel) {
		super(user, message);
		this.channel = channel;
	}
}

module.exports = ChannelMessage;