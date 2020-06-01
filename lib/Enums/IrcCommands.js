const WelcomeCommand = require("../IrcCommands/WelcomeCommand");
const BadAuthCommand = require("../IrcCommands/BadAuthCommand");
const JoinCommand = require("../IrcCommands/JoinCommand");
const PartCommand = require("../IrcCommands/PartCommand");
const MessageCommand = require("../IrcCommands/MessageCommand");
const UserNotFoundCommand = require("../IrcCommands/UserNotFoundCommand");
const ChannelNotFoundCommand = require("../IrcCommands/ChannelNotFoundCommand");
const ChannelTopicCommand = require("../IrcCommands/ChannelTopicCommand");
const NamesCommand = require("../IrcCommands/NamesCommand");
const ModeCommand = require("../IrcCommands/ModeCommand");
const WhoisChannelsCommand = require("../IrcCommands/whois/WhoisChannelsCommand.js");
const WhoisEndCommand = require("../IrcCommands/whois/WhoisEndCommand.js");
const WhoisUserCommand = require("../IrcCommands/whois/WhoisUserCommand.js");
const QuitCommand = require("../IrcCommands/QuitCommand.js");

/**
 * Contains all the active IRC incoming commands
 * @readonly
 * @enum {IrcCommand}
 * @private
 */
const IrcCommands = {
	/** @type {WelcomeCommand} */
	"001": new WelcomeCommand(),
	/** @type {WhoisUserCommand} */
	"311": new WhoisUserCommand(),
	/** @type {WhoisChannelsCommand} */
	"319": new WhoisChannelsCommand(),
	/** @type {WhoisEndCommand} */
	"318": new WhoisEndCommand(),
	/** @type {ChannelTopicCommand} */
	"332": new ChannelTopicCommand(),
	/** @type {NamesCommand} */
	"353": new NamesCommand(),
	/** @type {UserNotFoundCommand} */
	"401": new UserNotFoundCommand(),
	/** @type {ChannelNotFoundCommand} */
	"403": new ChannelNotFoundCommand(),
	/** @type {BadAuthCommand} */
	"464": new BadAuthCommand(),
	/** @type {JoinCommand} */
	"JOIN": new JoinCommand(),
	/** @type {PartCommand} */
	"PART": new PartCommand(),
	/** @type {ModeCommand} */
	"MODE": new ModeCommand(),
	/** @type {MessageCommand} */
	"PRIVMSG": new MessageCommand(),
	/** @type {QuitCommand} */
	"QUIT": new QuitCommand()
};
module.exports = Object.freeze(IrcCommands);