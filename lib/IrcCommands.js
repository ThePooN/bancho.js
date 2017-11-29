const WelcomeCommand = require("./IrcCommands/WelcomeCommand");
const BadAuthCommand = require("./IrcCommands/BadAuthCommand");
const JoinCommand = require("./IrcCommands/JoinCommand");
const PartCommand = require("./IrcCommands/PartCommand");
const MessageCommand = require("./IrcCommands/MessageCommand");
const ChannelNotFoundCommand = require("./IrcCommands/ChannelNotFoundCommand");

module.exports = Object.freeze({
	"001": new WelcomeCommand(),
	"464": new BadAuthCommand(),
	"403": new ChannelNotFoundCommand(),
	"JOIN": new JoinCommand(),
	"PART": new PartCommand(),
	"PRIVMSG": new MessageCommand()
});