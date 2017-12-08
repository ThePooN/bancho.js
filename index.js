/**
 * Main Banchojs class
 * @prop {BanchoClient} BanchoClient The BanchoClient class (Client alias is kept for history purposes)
 * @prop {ConnectStates} ConnectStates An enum containing all the possible ConnectStates of bancho.js */
class Banchojs {
	constructor() {
		this.Client = this.BanchoClient = require("./lib/BanchoClient");
		this.ConnectStates = require("./lib/ConnectStates");
	}
}

module.exports = new Banchojs();