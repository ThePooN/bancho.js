const IrcCommand = require("../IrcCommand");
const ConnectStates = require("../ConnectStates");

class BadAuthCommand extends IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		client.reconnect = false;
		const error = new Error("Bancho Auth failed");
		client.updateState(ConnectStates.Disconnected, error);
		client.callConnectCallback(error);
	}
}

module.exports = BadAuthCommand;