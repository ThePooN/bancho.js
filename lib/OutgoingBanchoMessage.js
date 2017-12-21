/**
 * Message to be sent later to a BanchoChannel or BanchoUser
 * 
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
	 * @throws {Error} If recipient isn't a valid type
	 */
	send() {
		let name = null;
		// Requiring BanchoUser/BanchoClass here to avoid "circular dependencies"
		if(this.recipient instanceof require("./BanchoUser"))
			name = this.recipient.ircUsername;
		else if(this.recipient instanceof require("./BanchoChannel"))
			name = this.recipient.name;
		else
			throw new Error("Recipient isn't a BanchoUser or BanchoChannel!");
		name = name.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		this.message.split("\n")[0];
		this.banchojs.send("PRIVMSG "+name+" :"+this.message, true);
	}
}

module.exports = OutgoingBanchoMessage;