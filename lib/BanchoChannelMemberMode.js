/**
 * A Bancho channel user mode, or "IRC modes".
 * Used by Bancho to mark someone in a channel as an IRC user or a moderator.
 * 
 * @prop {string} ircLetter Letter used in the MODE command to represent this mode
 * @prop {string} name Name to describe the mode
 */
class BanchoChannelMemberMode {
	constructor(ircLetter, name) {
		this.ircLetter = ircLetter;
		this.name = name;
	}
}

module.exports = BanchoChannelMemberMode;