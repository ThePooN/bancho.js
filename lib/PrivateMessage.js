const BanchoMessage = require("./BanchoMessage");

/**
 * Message received in our private inbox
 * 
 * @extends {BanchoMessage}
 */
class PrivateMessage extends BanchoMessage {
	/**
	 * @constructor
	 * @param {BanchoUser} user User the message was sent by
	 * @param {string} message Message body
	 */
	constructor(user, message) {
		super(user, message);
	}
}

module.exports = PrivateMessage;