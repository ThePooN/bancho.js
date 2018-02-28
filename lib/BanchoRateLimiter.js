/**
 * Rate-limiter for Bancho
 * 
 * @private
 * @prop {number} timespan Span of milliseconds in you may not exceed the following limits
 * @prop {number} privateLimit Amount of private messages (PMs & messages in multiplayer channels) you allow the bot to send in the last timespan
 * @prop {number} publicLimit Amount of public messages (messages that aren't private) you allow the bot to send in the last timespan
 */
class BanchoRateLimiter {
	/**
	 * Creates an instance of BanchoRateLimiter.
	 * @param {number} timespan Span of milliseconds in you may not exceed the following limits
	 * @param {number} privateLimit Amount of private messages (PMs & messages in multiplayer channels) you allow the bot to send in the last timespan
	 * @param {number} publicLimit Amount of public messages (messages that aren't private) you allow the bot to send in the last timespan
	 */
	constructor(timespan, privateLimit, publicLimit) {
		this.timespan = timespan; // 60000
		this.privateLimit = privateLimit; // 300
		this.publicLimit = publicLimit; // 60

		this.messagesTimestamps = [];
		for(let i = 0; i < Math.max(privateLimit, publicLimit); i++)
			this.messagesTimestamps[i] = 0;
		Object.seal(this.messagesTimestamps);
	}

	/**
	 * Calls the callback once a private message can be safely sent. Called by OutgoingBanchoMessage.
	 * 
	 * @param {function} cb 
	 */
	waitForSendingPrivateMessage(cb) {
		// Elapsed time since <privateLimit>th last message was sent
		const elapsedTime = Date.now() - this.messagesTimestamps[this.messagesTimestamps.length - this.privateLimit];
		if(elapsedTime < this.timespan) {
			const timeBeforeSending = this.timespan - elapsedTime;
			this.addTime(Date.now() + timeBeforeSending);
			setTimeout(() => cb(), timeBeforeSending);
		}
		else {
			this.addTime(Date.now());
			cb();
		}
	}

	/**
	 * Calls the callback once a public message can be safely sent. Called by OutgoingBanchoMessage.
	 * 
	 * @param {function} cb 
	 */
	waitForSendingPublicMessage(cb) {
		// Elapsed time since <publicLimit>th last message was sent
		const elapsedTime = Date.now() - this.messagesTimestamps[this.messagesTimestamps.length - this.publicLimit];
		if(elapsedTime < this.timespan) {
			const timeBeforeSending = this.timespan - elapsedTime;
			this.addTime(Date.now() + timeBeforeSending);
			setTimeout(() => cb(), timeBeforeSending);
		}
		else {
			this.addTime(Date.now());
			cb();
		}
	}

	/**
	 * Adds current time to the array of timestamps
	 */
	addTime() {
		for(let i = 0; i < this.messagesTimestamps.length; i++)
			this.messagesTimestamps[i] = this.messagesTimestamps[i + 1];
		this.messagesTimestamps[this.messagesTimestamps.length - 1] = Date.now();
	}
}

module.exports = BanchoRateLimiter;