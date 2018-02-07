/**
 * Bancho incoming message
 * @abstract 
 * @prop {BanchoUser} user User the message was sent by
 * @prop {string} message Message body
 * @prop {boolean} self Set to true if this message was sent by this instance of bancho.js
 */
class BanchoMessage {
	/**
	 * Creates an instance of Message.
	 * @param {BanchoUser} user User the message was sent by
	 * @param {string} message Message body
	 * @param {boolean} self Set to true if this message was sent by this instance of bancho.js
	 */
	constructor(user, message, self) {
		if(new.target === BanchoMessage)
			throw new Error("Don't instanciate an abstract class you dumbass");
		
		this.user = user;
		this.message = message;
		this.self = self;
	}
}

module.exports = BanchoMessage;