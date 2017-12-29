const EventEmitter = require("events").EventEmitter;
const Nodesu = require("nodesu");
const OutgoingBanchoMessage = require("./OutgoingBanchoMessage");
const BanchoWhoisReturn = require("./BanchoWhoisReturn");

/**
 * Bancho User
 * @description Optional properties are filled after fetching the API with fetchFromAPI().
 * 
 * @property {BanchoClient} banchojs Bancho.js client this user was instancied by
 * @property {string} ircUsername
 * @property {number} [id]
 * @property {string} [username]
 * @property {number} [count300]
 * @property {number} [count100]
 * @property {number} [count50]
 * @property {number} [playcount]
 * @property {number} [rankedScore]
 * @property {number} [totalScore]
 * @property {number} [ppRank]
 * @property {number} [ppRaw]
 * @property {number} [accuracy]
 * @property {number} [countRankSS]
 * @property {number} [countRankS]
 * @property {number} [countRankA]
 * @property {number} [country]
 * @property {number} [ppCountryRank]
 * @property {Array.<nodesu.UserEvent>} [events]
 * @extends EventEmitter
 */
class BanchoUser extends EventEmitter {
	/**
	 * Creates an instance of BanchoUser.
	 * @param {BanchoClient} banchojs Bancho.js client this user was instancied by
	 * @param {string} ircUsername 
	 */
	constructor(banchojs, ircUsername) {
		super();
		this.banchojs = banchojs;
		this.ircUsername = ircUsername;
		this.whoisUserCallback = null;
		this.whoisChannelsCallback = null;
		this.whoisEndCallback = null;
		this.whoisUserNotFoundCallback = null;
		this.whoisPromise = null;

		this.banchojs.on("PM", (msg) => {
			if(msg.user == this)
				/** 
				 * Emitted when a message is received from a BanchoUser
				 * @event BanchoUser#message
				 * @type {PrivateMessage}
				 */
				this.emit("message", msg);
		});
	}

	/**
	 * Fetch the user from the osu! API if possible. Populates all the "optional" properties of BanchoUser.
	 * 
	 * @throws {Error} osu! API/no API key error
	 * @returns Promise<nodesu.User>
	 */
	fetchFromAPI() {
		if(this.banchojs.osuApi) {
			return new Promise((resolve, reject) => {
				this.banchojs.osuApi.user.get(this.ircUsername, null, null, Nodesu.LookupType.string).then((user) => {
					this.id = user.id;
					this.username = user.username;
					this.count300 = user.count300;
					this.count100 = user.count100;
					this.count50 = user.count50;
					this.playcount = user.playcount;
					this.rankedScore = user.rankedScore;
					this.totalScore = user.totalScore;
					this.ppRank = user.ppRank;
					this.ppRaw = user.ppRaw;
					this.accuracy = user.accuracy;
					this.countRankSS = user.countRankSS;
					this.countRankS = user.countRankS;
					this.countRankA = user.countRankA;
					this.country = user.country;
					this.ppCountryRank = user.ppCountryRank;
					this.events = user.events;
					resolve(user);
				}, reject);
			});
		}
		else
			throw new Error("osu! API key is missing!");
	}

	/**
	 * Returns true if the user is the client
	 * 
	 * @returns {boolean}
	 */
	isClient() {
		return (this.banchojs.username == this.ircUsername);
	}

	/**
	 * Sends a PM to this user.
	 * 
	 * @param {string} message
	 */
	sendMessage(message) {
		(new OutgoingBanchoMessage(this.banchojs, this, message)).send();
	}

	/**
	 * Fires a WHOIS request to the server about this user.
	 * 
	 * @return {Promise<BanchoWhoisReturn>}
	 */
	whois() {
		if(!this.whoisPromise)
			this.whoisPromise = new Promise((resolve, reject) => {
				const whoisReturn = new BanchoWhoisReturn(this.ircUsername);
				this.whoisUserCallback = (userId) => whoisReturn.userId = userId;
				this.whoisChannelsCallback = (channels) => whoisReturn.channels = channels;
				const afterWhois = () => {
					this.whoisUserCallback = null;
					this.whoisChannelsCallback = null;
					this.whoisEndCallback = null;
					this.whoisUserNotFoundCallback = null;
					this.whoisPromise = null;
				};
				this.whoisEndCallback = () => {
					this.id = whoisReturn.userId;
					this.username = whoisReturn.name;
					resolve(whoisReturn);
					afterWhois();
				};
				this.whoisUserNotFoundCallback = () => {
					reject(new Error("User is offline"));
					afterWhois();
				};

				this.banchojs.send("WHOIS "+this.ircUsername);
			});
		return this.whoisPromise;
	}
}

module.exports = BanchoUser;