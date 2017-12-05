const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class ChannelMessageUnit extends TestUnit {
	constructor() {
		super();
		this.name = "ChannelMessageUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			const roomName = Math.random().toString(36).substring(8);
			let channel = null;
			let returned = false;
			let matchCreatedRegex = /Created the tournament match https:\/\/osu\.ppy\.sh\/mp\/(\d+) (.+)/;
			
			this.client.on("PM", (msg) => {
				if(msg.user == "BanchoBot") {
					const match = matchCreatedRegex.exec(msg.message);
					if(!match || match[2] != roomName)
						return;
					channel = "#mp_"+match[1];
					this.client.sendMessage(channel, "!mp map 75");
				}
			});

			this.client.on("CM", (msg) => {
				if(msg.user == "BanchoBot" && msg.message == "Changed beatmap to https://osu.ppy.sh/b/75 Kenji Ninuma - DISCO PRINCE" && msg.channel == channel) {
					returned = true;
					this.fulFillGoal(TestGoals.ChannelMessage);
					resolve();
					this.client.sendMessage(channel, "!mp close");
				}
			});
			
			this.client.sendMessage("BanchoBot", "!mp make "+roomName);
			
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't receive message after timeout!"));
			}, 20000);
		});
	}
}

module.exports = new ChannelMessageUnit();