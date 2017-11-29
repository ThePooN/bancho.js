const Test = require("../Test.js").Test;

class JoinEventChannelTest extends Test {
	constructor() {
		super();
		this.name = "JoinEventChannelTest";
	}

	run() {
		return new Promise((resolve, reject) => {
			const channel = "#french";
			let returned = false;
			this.client.on("JOIN", (obj) => {
				if(obj.username == this.client.username && obj.channel == channel) {
					returned = true;
					this.client.leaveChannel(channel);
					resolve();
				}
			});
			this.client.on("nochannel", (errorChannel) => {
				if(errorChannel == channel) {
					returned = true;
					reject(new Error("No such channel: "+errorChannel));
				}
			});
			this.client.joinChannel(channel);
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't join after timeout!"));
			}, 10000);
		});
	}
}

module.exports = new JoinEventChannelTest();