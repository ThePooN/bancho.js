const Message = require("./Message");

/**
 * Message received in our private inbox
 * 
 * @extends {Message}
 */
class PrivateMessage extends Message {
	/**
	 * @constructor
	 * @param {string} user User the message was sent by
	 * @param {string} message Message body
	 */
	constructor(user, message) {
		super(user, message);
	}
}

module.exports = PrivateMessage;