const PrivateMessage = require("./PrivateMessage");
const ChannelMessage = require("./ChannelMessage");

/**
 * Message to be sent later to a BanchoChannel or BanchoUser
 * 
 * @prop {BanchoClient} banchojs
 * @prop {BanchoUser|BanchoChannel} recipient
 * @prop {string} message
 * @prop {boolean} isPublic If target is considered public by Bancho. true if recipient is a channel and not a multiplayer channel
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
		this.isPublic = this.recipient instanceof require("./BanchoChannel") && !this.recipient.name.startsWith("#mp_");
	}

	/**
	 * Sends the prepared message to the recipient
	 * 
	 * @throws {Error} If recipient isn't a valid type or if we're offline
	 * @returns {Promise<null>} Resolves when message is sent (rate-limiting)
	 */
	send() {
		return new Promise((resolve, reject) => {
			let name = null;
			// Requiring BanchoUser/BanchoChannel here to avoid "circular dependencies"
			if(this.recipient instanceof require("./BanchoUser"))
				name = this.recipient.ircUsername;
			else if(this.recipient instanceof require("./BanchoChannel"))
				name = this.recipient.name;
			else
				return reject(new Error("Recipient isn't a BanchoUser or BanchoChannel!"));

			// Protect against commands injection
			name = name.replace(/ /g, "_").split("\n")[0].substring(0, 28);
			const message = this.message.split("\n")[0];

			const cb = () => {
				if(this.banchojs.isConnected()) {
					this.banchojs.send("PRIVMSG "+name+" :"+message, false);
					if(this.recipient instanceof require("./BanchoUser"))
						this.banchojs.emit("PM", new PrivateMessage(this.recipient, message, true));
					else if(this.recipient instanceof require("./BanchoChannel"))
						this.banchojs.emit("CM", new ChannelMessage(this.banchojs.getSelf(), message, true, this.recipient));
					resolve();
				}
				else
					reject(new Error("Currently disconnected!"));
			};
			if(this.isPublic)
				this.banchojs.rateLimiter.waitForSendingPublicMessage(cb);
			else
				this.banchojs.rateLimiter.waitForSendingPrivateMessage(cb);
		});
	}
}

module.exports = OutgoingBanchoMessage;