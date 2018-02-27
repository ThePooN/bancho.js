const IrcCommand = require("../IrcCommand");
const ConnectStates = require("../Enums/ConnectStates");

/**
 * Bad auth IRC Command
 * @description Received when our password is wrong!
 * @extends {IrcCommand}
 * @private
 */
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