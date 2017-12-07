/**
 * Main Banchojs class
 * @prop {BanchoClient} BanchoClient The BanchoClient class (Client alias is kept for history purposes)
 * @prop {ConnectStates} ConnectStates The BanchoClient class (Client alias is kept for history purposes)
 */
class Banchojs {
	constructor() {
		this.Client = this.BanchoClient = require("./lib/BanchoClient");
		this.ConnectStates = require("./lib/ConnectStates");
	}
}

module.exports = new Banchojs();