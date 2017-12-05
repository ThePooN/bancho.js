const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class JoinPromiseChannelUnit extends TestUnit {
	constructor() {
		super();
		this.name = "JoinPromiseChannelTest";
	}

	run() {
		return new Promise((resolve, reject) => {
			const channel = "#french";
			let returned = false;
			this.client.joinChannel(channel).then(() => {
				this.fulFillGoal(TestGoals.JoinPromise);
				this.client.leaveChannel(channel).then(() => {
					this.fulFillGoal(TestGoals.PartPromise);
					returned = true;
					resolve();
				});
			}, (err) => {
				returned = true;
				reject(err);
			});
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't join after timeout!"));
			}, 10000);
		});
	}
}

module.exports = new JoinPromiseChannelUnit();