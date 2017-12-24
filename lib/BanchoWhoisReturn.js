/**
 * Class describing what is returned after a WHOIS query on an online user
 * 
 * @prop {string} name Name of the queried user
 * @prop {number} userId User id of the queried user
 * @prop {Array<BanchoChannel>} channels Array with every channels the user is in
 */
class BanchoWhoisReturn {
	constructor(name) {
		this.name = name;
		this.userId = null;
		this.channels = [];
	}
}

module.exports = BanchoWhoisReturn;