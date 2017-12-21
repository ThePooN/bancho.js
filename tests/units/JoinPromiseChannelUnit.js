const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class JoinPromiseChannelUnit extends TestUnit {
	constructor() {
		super();
		this.name = "JoinPromiseChannelUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			const channel = this.client.getChannel("#french");
			let returned = false;
			channel.join().then(() => {
				this.fulFillGoal(TestGoals.JoinPromise);
				channel.leave().then(() => {
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