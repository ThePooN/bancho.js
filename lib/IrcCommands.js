const WelcomeCommand = require("./IrcCommands/WelcomeCommand");
const BadAuthCommand = require("./IrcCommands/BadAuthCommand");
const JoinCommand = require("./IrcCommands/JoinCommand");
const PartCommand = require("./IrcCommands/PartCommand");
const MessageCommand = require("./IrcCommands/MessageCommand");
const ChannelNotFoundCommand = require("./IrcCommands/ChannelNotFoundCommand");
const NamesCommand = require("./IrcCommands/NamesCommand");
const ModeCommand = require("./IrcCommands/ModeCommand");

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
	/** @type {NamesCommand} */
	"353": new NamesCommand(),
	/** @type {JoinCommand} */
	"JOIN": new JoinCommand(),
	/** @type {PartCommand} */
	"PART": new PartCommand(),
	/** @type {ModeCommand} */
	"MODE": new ModeCommand(),
	/** @type {MessageCommand} */
	"PRIVMSG": new MessageCommand()
};
module.exports = Object.freeze(IrcCommands);