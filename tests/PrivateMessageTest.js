const Test = require("../Test.js").Test;

class PrivateMessageTest extends Test {
	constructor() {
		super();
		this.name = "PrivateMessageTest";
	}

	run() {
		return new Promise((resolve, reject) => {
			const message = Math.random().toString(36).substring(8);
			let returned = false;
			this.client.on("PM", (msg) => {
				if(msg.user == this.config["irc_user"] && msg.message == message) {
					returned = true;
					resolve();
				}
			});
			this.client.sendMessage(this.config["irc_user"], message);
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't receive message after timeout!"));
			}, 5000);
		});
	}
}

module.exports = new PrivateMessageTest();