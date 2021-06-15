/**
 * Message to be sent later to a BanchoChannel or BanchoUser
 * 
 * @prop {BanchoClient} banchojs
 * @prop {BanchoUser|BanchoChannel} recipient
 * @prop {string} message
 */
class OutgoingBanchoMessage {
	/**
	 * Creates an instance of OutgoingBanchoMessage.
	 * @param {BanchoClient} banchojs 
	 * @param {BanchoUser|BanchoChannel} recipient 
	 * @param {string} message 
	 */
	constructor(banchojs, recipient, message) {
		this.banchojs = banchojs;
		this.recipient = recipient;
		this.message = message;
	}

	/**
	 * Sends the prepared message to the recipient
	 * 
	 * @throws {Error} If recipient isn't a valid type or if we're offline
	 * @returns {Promise<null>} Resolves when message is sent (rate-limiting)
	 */
	send() {
		return new Promise((resolve, reject) => {
			this.banchojs.messagesQueue.push({
				message: this,
				resolve,
				reject,
			});
			if(this.banchojs.messagesQueue.length === 1)
				this.banchojs.processMessagesQueue();
		});
	}
}

module.exports = OutgoingBanchoMessage;