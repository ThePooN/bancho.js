/**
 * Bancho incoming message
 * @abstract 
 * @prop {BanchoUser} user User the message was sent by
 * @prop {string} message Message body
 */
class BanchoMessage {
	/**
	 * Creates an instance of Message.
	 * @param {BanchoUser} user User the message was sent by
	 * @param {string} message Message body
	 */
	constructor(user, message) {
		if(new.target === BanchoMessage)
			throw new Error("Don't instanciate an abstract class you dumbass");
		
		this.user = user;
		this.message = message;
	}
}

module.exports = BanchoMessage;