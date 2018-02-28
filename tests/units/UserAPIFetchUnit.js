const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");
const config = require("../run.js").config;

class UserAPIFetchUnit extends TestUnit {
	constructor() {
		super();
		this.name = "UserAPIFetchUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			let returned = false;
			const user = this.client.getUser(this.client.username);
			user.fetchFromAPI().then((apiUser) => {
				const props = ["id", "username", "count300", "count100", "count50",
					"playcount", "rankedScore", "totalScore", "ppRank", "accuracy",
					"countRankSS", "countRankS", "countRankA", "country", "ppCountryRank",
					"events"
				];
				for(const prop of props) {
					if(user[prop] != apiUser[prop]) {
						returned = true;
						reject(new Error("Property "+prop+" isn't matching between user and apiUser!"));
						return;
					}
				}

				if(user.id != config["userId"]) {
					returned = true;
					reject(new Error("User id doesn't match!"));
					return;
				}
				if(user.username != this.client.username) {
					returned = true;
					reject(new Error("Username doesn't match!"));
					return;
				}

				this.fulFillGoal(TestGoals.UserAPIFetch);
				resolve();
			});
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't receive message after timeout!"));
			}, 10000);
		});
	}
}

module.exports = new UserAPIFetchUnit();