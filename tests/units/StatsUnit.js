const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class StatsUnit extends TestUnit {
	constructor() {
		super();
		this.name = "StatsUnit";
	}

	run() {
		return new Promise((resolve, reject) => 
			this.client.getSelf().stats().then(() => resolve(this.fulFillGoal(TestGoals.Stats)), reject)
		);
	}
}

module.exports = new StatsUnit();