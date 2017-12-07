/**
 * Incoming IRC Command
 * 
 * @abstract
 * @private
 */
class IrcCommand {
	constructor() {
		if(new.target === IrcCommand)
			throw new Error("Don't instanciate an abstract class you dumbass");
	}

	/**
	 * Handles the IRC command
	 * 
	 * @param {BanchoClient} client 
	 * @param {string} command 
	 * @param {array.<string>} splits 
	 */
	// eslint-disable-next-line no-unused-vars
	handleCommand(client, command, splits) {
		throw new Error("Unimplemented command!");
	}
}

module.exports = IrcCommand;