const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class WhoisUnit extends TestUnit {
	constructor() {
		super();
		this.name = "WhoisUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			this.client.getSelf().whois().then((whoisResult) => {
				if(whoisResult.userId == this.config["userId"]) {
					this.fulFillGoal(TestGoals.Whois);
					resolve();
				}
				else
					reject(new Error("Returned user id by whois doesn't match!"));
			}, reject);
		});
	}
}

module.exports = new WhoisUnit();