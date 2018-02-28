const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class PrivateMessageUnit extends TestUnit {
	constructor() {
		super();
		this.name = "PrivateMessageUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			const message = Math.random().toString(36).substring(8);
			let gotSelf = false;
			let gotFromBancho = false;
			function resolveIfDone() {
				if(gotSelf && gotFromBancho)
					resolve();
			}
			this.client.on("PM", (msg) => {
				if(msg.self && msg.user.isClient()) {
					gotSelf = true;
					this.fulFillGoal(TestGoals.PrivateSelfMessage);
					resolveIfDone();
				}
				else if(msg.user.isClient() && msg.message == message) {
					gotFromBancho = true;
					this.fulFillGoal(TestGoals.PrivateMessage);
					resolveIfDone();
				}
			});
			this.client.getSelf().sendMessage(message);
			setTimeout(() => reject(new Error("Didn't receive message after timeout!")), 10000);
		});
	}
}

module.exports = new PrivateMessageUnit();