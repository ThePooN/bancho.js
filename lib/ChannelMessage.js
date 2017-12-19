const Message = require("./Message");

/**
 * Message received from a Channel
 * 
 * @prop {string} channel Channel the message was received from
 * @extends {Message}
 */
class ChannelMessage extends Message {
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