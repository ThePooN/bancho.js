/**
 * Contains properties returned by the BanchoBot !stats command that can't be set in BanchoUser.
 * 
 * @prop {BanchoUser} user
 * @prop {number} level Truncated value of levels (eg. 102)
 * @prop {number} accuracy
 * @prop {string} status In-game status (eg. Afk, Idle, Playing...)
 * @prop {boolean} online Set to true if user is online *in-game*.
 */
class BanchoBotStatsReturn {
	constructor(user) {
		this.user = user;
		this.level = null;
		this.accuracy = null;
		this.status = null;
		this.online = false;
	}
}

module.exports = BanchoBotStatsReturn;