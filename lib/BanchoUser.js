const EventEmitter = require("events").EventEmitter;
const Nodesu = require("nodesu");
const OutgoingBanchoMessage = require("./OutgoingBanchoMessage");
const BanchoWhoisReturn = require("./IrcCommands/whois/BanchoWhoisReturn");
const BanchoBotStatsCommand = require("./StatsCommand/BanchoBotStatsCommand");

/**
 * Bancho User
 * @description Optional properties are filled after fetching the API with fetchFromAPI().
 * 
 * @property {BanchoClient} banchojs Bancho.js client this user was instancied by
 * @property {string} ircUsername
 * @property {number} [id]
 * @property {string} [username]
 * @property {Date}   [joinDate]
 * @property {number} [count300]
 * @property {number} [count100]
 * @property {number} [count50]
 * @property {number} [playcount]
 * @property {number} [rankedScore]
 * @property {number} [totalScore]
 * @property {number} [ppRank]
 * @property {number} [level]
 * @property {number} [ppRaw]
 * @property {number} [accuracy]
 * @property {number} [countRankSS]
 * @property {number} [countRankS]
 * @property {number} [countRankA]
 * @property {number} [country]
 * @property {number} [totalSecondsPlayed]
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
		this.wherePromise = null;
		this.statsPromise = null;
		this.listenersInitialized = false;
	}

	on() {
		if(!this.listenersInitialized) {
			this.banchojs.on("PM", (msg) => {
				if(msg.user == this)
					/** 
					 * Emitted when a message is received from a BanchoUser
					 * @event BanchoUser#message
					 * @type {PrivateMessage}
					 */
					this.emit("message", msg);
			});
			this.listenersInitialized = true;
		}
		super.on.apply(this, arguments);
	}

	/**
	 * Fetch the user from the osu! API if possible. Populates all the "optional" properties of BanchoUser.
	 * 
	 * @async
	 * @throws {Error} osu! API/no API key error
	 * @returns Promise<nodesu.User>
	 */
	fetchFromAPI() {
		if(this.banchojs.osuApi) {
			return new Promise((resolve, reject) => {
				this.banchojs.osuApi.user.get(this.ircUsername, this.banchojs.gamemode, null, Nodesu.LookupType.string).then((user) => {
					this.updateFromAPI(user);
					resolve(user);
				}, reject);
			});
		}
		else
			throw new Error("osu! API key is missing!");
	}

	updateFromAPI(user) {
		this.id = user.id;
		this.username = user.username;
		this.joinDate = user.joinDate;
		this.count300 = user.count300;
		this.count100 = user.count100;
		this.count50 = user.count50;
		this.playcount = user.playcount;
		this.rankedScore = user.rankedScore;
		this.totalScore = user.totalScore;
		this.ppRank = user.ppRank;
		this.level = user.level;
		this.ppRaw = user.ppRaw;
		this.accuracy = user.accuracy;
		this.countRankSS = user.countRankSS;
		this.countRankS = user.countRankS;
		this.countRankA = user.countRankA;
		this.country = user.country;
		this.totalSecondsPlayed = user.totalSecondsPlayed;
		this.ppCountryRank = user.ppCountryRank;
		this.events = user.events;
	}

	/**
	 * Returns true if the user is the client
	 * 
	 * @returns {boolean}
	 */
	isClient() {
		return (this.banchojs.username.toLowerCase() == this.ircUsername.toLowerCase());
	}

	/**
	 * Sends a PM to this user.
	 * 
	 * @async
	 * @throws {Error} If we're offline
	 * @param {string} message
	 * @returns {Promise<null>} Resolves when message is sent (rate-limiting)
	 */
	sendMessage(message) {
		return (new OutgoingBanchoMessage(this.banchojs, this, message)).send();
	}

	/**
	 * Sends an ACTION message to this user.
	 * 
	 * @async
	 * @throws {Error} If we're offline
	 * @param {string} message
	 * @returns {Promise<null>} Resolves when message is sent (rate-limiting)
	 */
	sendAction(message) {
		return (new OutgoingBanchoMessage(this.banchojs, this, `\x01ACTION ${message}\x01`)).send();
	}

	/**
	 * Fires an IRC WHOIS request to the server about this user. Only works on online users.
	 * Throws if the user can't be found or is offline.
	 * 
	 * @async
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

	/**
	 * Fires a !where command to BanchoBot about this user. Only works on online users.
	 * Throws if the user can't be found or is offline.
	 * 
	 * @async
	 * @return {Promise<string>}
	 */
	where() {
		if(!this.wherePromise)
			this.wherePromise = new Promise((resolve, reject) => {
				const answerRegex = /(.+) is in (.+)/;
				const BanchoBot = this.banchojs.getUser("BanchoBot");
				const afterAnswer = () => {
					BanchoBot.removeListener("message", listener);
					this.wherePromise = null;
				};
				const listener = (message) => {
					if(message.message == "The user is currently not online.") {
						reject(new Error("User is offline"));
						return afterAnswer();
					}
					const m = answerRegex.exec(message.message);
					if(m && m[1] == this.ircUsername) {
						resolve(m[2]);
						afterAnswer();
					}
				};
				BanchoBot.on("message", listener);
				BanchoBot.sendMessage("!where "+this.ircUsername);
			});
		return this.wherePromise;
	}

	/**
	 * Fires a !stats command to BanchoBot about this user. Works on online and offline users.
	 * Will update the username, id, rankedScore, ppRank and playcount properties of this user.
	 * Status, levels and accuracy are stored in the returned object, as they are inaccurate data (missing decimals).
	 * It is recommended to get levels and accuracy by polling the osu! API instead.
	 * Throws if the user can't be found.
	 * 
	 * @async
	 * @return {Promise<BanchoBotStatsReturn>}
	 */
	stats() {
		if(!this.statsPromise)
			this.statsPromise = new Promise((resolve, reject) => {
				const statsCommand = new BanchoBotStatsCommand(this);
				statsCommand.run()
					.then(resolve, reject)
					.then(() => this.statsPromise = null);
			});
		return this.statsPromise;
	}

	get id() {
		return this._id;
	}

	set id(newId) {
		if(isNaN(newId))
			throw new Error("id needs to be a number!");
		if(this._id != null)
			this.banchojs.usersById.delete(this._id);
		this._id = newId;
		this.banchojs.usersById.set(this._id, this);
	}
}

module.exports = BanchoUser;