const BanchoMessage = require("./BanchoMessage");

/**
 * Message received from a Channel
 * 
 * @prop {BanchoChannel} channel Channel the message was received from
 * @extends {BanchoMessage}
 */
class ChannelMessage extends BanchoMessage {
	/**
	 * Creates an instance of ChannelMessage.
	 * @param {BanchoUser} user User the message was sent by
	 * @param {string} message Message body
	 * @param {boolean} self Set to true if this message was sent by this instance of bancho.js
	 * @param {BanchoChannel} channel Channel the message was received from
	 */
	constructor(user, message, self, channel) {
		super(user, message, self);
		this.channel = channel;
	}
}

module.exports = ChannelMessage;