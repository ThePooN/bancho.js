/**
 * A Bancho channel user mode, or "IRC modes".
 * Used by Bancho to mark someone in a channel as an IRC user or a moderator.
 */
class BanchoChannelMemberMode {
	constructor(ircLetter, name) {
		this.ircLetter = ircLetter;
		this.name = name;
	}
}

module.exports = BanchoChannelMemberMode;