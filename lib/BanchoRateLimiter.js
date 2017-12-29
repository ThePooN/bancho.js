class BanchoRateLimiter {
	constructor(timespan, privateLimit, publicLimit) {
		this.timespan = timespan; // 60000
		this.privateLimit = privateLimit; // 300
		this.publicLimit = publicLimit; // 60

		this.messagesTimestamps = [];
		for(let i = 0; i < Math.max(privateLimit, publicLimit); i++)
			this.messagesTimestamps[i] = 0;
		Object.seal(this.messagesTimestamps);
	}

	waitForSendingPrivateMessage(cb) {
		// Elapsed time since <privateLimit>th last message was sent
		const elapsedTime = Date.now() - this.messagesTimestamps[this.messagesTimestamps.length - this.privateLimit];
		if(elapsedTime < this.timespan) {
			const timeBeforeSending = this.timespan - elapsedTime;
			this.addTime(Date.now() + timeBeforeSending);
			setTimeout(() => {
				cb();
			}, timeBeforeSending);
		}
		else {
			this.addTime(Date.now());
			cb();
		}
	}

	waitForSendingPublicMessage(cb) {
		// Elapsed time since <publicLimit>th last message was sent
		const elapsedTime = Date.now() - this.messagesTimestamps[this.messagesTimestamps.length - this.publicLimit];
		if(elapsedTime < this.timespan) {
			const timeBeforeSending = this.timespan - elapsedTime;
			this.addTime(Date.now() + timeBeforeSending);
			setTimeout(() => {
				cb();
			}, timeBeforeSending);
		}
		else {
			this.addTime(Date.now());
			cb();
		}
	}

	addTime() {
		for(let i = 0; i < this.messagesTimestamps.length; i++)
			this.messagesTimestamps[i] = this.messagesTimestamps[i + 1];
		this.messagesTimestamps[this.messagesTimestamps.length - 1] = Date.now();
	}
}

module.exports = BanchoRateLimiter;