class IrcCommand {
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		throw new Error("Unimplemented command!");
	}
}

module.exports = IrcCommand;