const Test = require("../Test.js").Test;

class JoinPromiseChannelTest extends Test {
	constructor() {
		super();
		this.name = "JoinPromiseChannelTest";
	}

	run() {
		return new Promise((resolve, reject) => {
			const channel = "#french";
			let returned = false;
			this.client.joinChannel(channel).then(() => {
				returned = true;
				this.client.leaveChannel(channel);
				resolve();
			}, (err) => {
				returned = true;
				reject(err);
			});
			setTimeout(() => {
				if(!returned)
					reject(new Error("Didn't join after timeout!"));
			}, 5000);
		});
	}
}

module.exports = new JoinPromiseChannelTest();