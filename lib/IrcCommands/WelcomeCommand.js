const IrcCommand = require("../IrcCommand");
const ConnectStates = require("../ConnectStates");

class WelcomeCommand extends IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		client.updateState(ConnectStates.Connected);
		client.callConnectCallback();
	}
}

module.exports = WelcomeCommand;