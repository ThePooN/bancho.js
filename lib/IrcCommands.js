const WelcomeCommand = require("./IrcCommands/WelcomeCommand");
const BadAuthCommand = require("./IrcCommands/BadAuthCommand");
const JoinCommand = require("./IrcCommands/JoinCommand");
const PartCommand = require("./IrcCommands/PartCommand");
const MessageCommand = require("./IrcCommands/MessageCommand");
const ChannelNotFoundCommand = require("./IrcCommands/ChannelNotFoundCommand");

/**
 * Contains all the active IRC incoming commands
 * @readonly
 * @enum {IrcCommand}
 * @private
 */
const IrcCommands = {
	/** @type {WelcomeCommand} */
	"001": new WelcomeCommand(),
	/** @type {BadAuthCommand} */
	"464": new BadAuthCommand(),
	/** @type {ChannelNotFoundCommand} */
	"403": new ChannelNotFoundCommand(),
	/** @type {JoinCommand} */
	"JOIN": new JoinCommand(),
	/** @type {PartCommand} */
	"PART": new PartCommand(),
	/** @type {MessageCommand} */
	"PRIVMSG": new MessageCommand()
};
module.exports = Object.freeze(IrcCommands);