const IrcCommand = require("../IrcCommand");
const ConnectStates = require("../Enums/ConnectStates");

/**
 * Welcome IRC command
 * @description Received when successfully authenticated and ready
 * @extends {IrcCommand}
 * @private
 */
class WelcomeCommand extends IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		client.updateState(ConnectStates.Connected);
		client.callConnectCallback();
	}
}

module.exports = WelcomeCommand;