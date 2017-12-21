const OutgoingBanchoMessage = require("./OutgoingBanchoMessage.js");

/**
 * Represents a discussion channel (not including PMs)
 * 
 * @prop {string} name Channel name as it is referred to on IRC (including #)
 */
class BanchoChannel {
	/**
	 * Creates an instance of BanchoChannel.
	 * @param {BanchoClient} banchojs bancho.js client
	 * @param {string} name Channel name as it is referred to on IRC (including #)
	 */
	constructor(banchojs, name) {
		this.banchojs = banchojs;
		this.name = name;
		this.joinCallback = null;
		this.partCallback = null;
	}

	/**
	 * Sends a message to this channel
	 * 
	 * @param {string} message 
	 */
	sendMessage(message) {
		(new OutgoingBanchoMessage(this.banchojs, this, message)).send();
	}

	/**
	 * Join the channel
	 * 
	 * @returns {Promise<null>}
	 */
	join() {
		return this._joinOrPart("JOIN", "joinCallback");
	}

	/**
	 * Leave the channel
	 * 
	 * @returns {Promise<null>}
	 */
	leave() {
		return this._joinOrPart("PART", "partCallback");
	}

	/**
	 * Sub-function for join/leave calls
	 * 
	 * @private
	 * @param {string} action 
	 * @param {*} callbackProp 
	 */
	_joinOrPart(action, callbackProp) {
		if(action != "JOIN" && action != "PART")
			throw new Error("wrong action dumbass");
		return new Promise((resolve, reject) => {
			this.banchojs.send(action+" "+this.name);
			this[callbackProp] = (err) => {
				if(!err)
					resolve();
				else
					reject(err);
				this[callbackProp] = null;
			};
		});
	}
}

module.exports = BanchoChannel;