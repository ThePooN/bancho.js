const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");

class JoinEventChannelUnit extends TestUnit {
	constructor() {
		super();
		this.name = "JoinEventChannelUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			const channel = this.client.getChannel("#french");
			this.client.on("JOIN", (obj) => {
				if(obj.user.isClient() && obj.channel == channel) {
					this.fulFillGoal(TestGoals.JoinEvent);

					this.client.on("PART", (obj) => {
						if(obj.user.isClient() && obj.channel == channel) {
							this.client.removeAllListeners("JOIN");
							this.client.removeAllListeners("nochannel");
							this.client.removeAllListeners("PART");
							this.fulFillGoal(TestGoals.PartEvent);
							resolve();
						}
					});
					channel.leave(channel);
				}
			});
			this.client.on("nochannel", (errorChannel) => {
				if(errorChannel == channel) {
					this.client.removeAllListeners("JOIN");
					this.client.removeAllListeners("nochannel");
					this.client.removeAllListeners("PART");
					reject(new Error("No such channel: "+errorChannel.name));
				}
			});
			channel.join();
			setTimeout(() => reject(new Error("Didn't join and leave after timeout!")), 10000);
		});
	}
}

module.exports = new JoinEventChannelUnit();
