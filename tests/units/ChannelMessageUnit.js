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
				if(msg.user.ircUsername == "BanchoBot") {
					const match = matchCreatedRegex.exec(msg.message);
					if(!match || match[2] != roomName)
						return;
					this.client.removeAllListeners("PM");
					channel = this.client.getChannel("#mp_"+match[1]);
					channel.sendMessage("!mp map 75");
				}
			});

			this.client.on("CM", (msg) => {
				if(msg.user.ircUsername == "BanchoBot" && msg.message == "Changed beatmap to https://osu.ppy.sh/b/75 Kenji Ninuma - DISCO PRINCE" && msg.channel == channel) {
					this.client.removeAllListeners("CM");
					returned = true;
					this.fulFillGoal(TestGoals.ChannelMessage);
					resolve();
					channel.sendMessage("!mp close");
				}
			});
			
			this.client.getUser("BanchoBot").sendMessage("!mp make "+roomName);
			
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't receive message after timeout!"));
			}, 20000);
		});
	}
}

module.exports = new ChannelMessageUnit();