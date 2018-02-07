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
	 * @param {boolean} self Set to true if this message was sent by this instance of bancho.js
	 */
	constructor(user, message, self) {
		super(user, message, self);
	}
}

module.exports = PrivateMessage;