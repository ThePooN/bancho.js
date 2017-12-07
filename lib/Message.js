/**
 * Bancho incoming message
 * @abstract 
 * @prop {string} user User the message was sent by
 * @prop {string} message Message body
 */
class Message {
	/**
	 * Creates an instance of Message.
	 * @param {string} user User the message was sent by
	 * @param {string} message Message body
	 */
	constructor(user, message) {
		if(new.target === Message)
			throw new Error("Don't instanciate an abstract class you dumbass");
		
		this.user = user;
		this.message = message;
	}
}

module.exports = Message;