const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class WhereUnit extends TestUnit {
	constructor() {
		super();
		this.name = "WhereUnit";
	}

	run() {
		return new Promise((resolve, reject) => 
			this.client.getSelf().where()
				.then(() => resolve(this.fulFillGoal(TestGoals.Where)))
				.catch((err) => {
					if(err && err.message === "User's location could not be determined")
						return resolve(this.fulFillGoal(TestGoals.Where));
					reject(err);
				})
		);
	}
}

module.exports = new WhereUnit();