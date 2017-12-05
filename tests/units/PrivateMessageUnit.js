const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class PrivateMessageUnit extends TestUnit {
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
					this.fulFillGoal(TestGoals.PrivateMessage);
					returned = true;
					resolve();
				}
			});
			this.client.sendMessage(this.config["irc_user"], message);
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't receive message after timeout!"));
			}, 10000);
		});
	}
}

module.exports = new PrivateMessageUnit();