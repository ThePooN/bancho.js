const BanchoBotStatsReturn = require("./BanchoBotStatsReturn");

/** 
 * Class representing a BanchoBot !stats command being ran.
 * Collects data sent back by BanchoBot and set the appropriate variables.
 * 
 * @private
*/
class BanchoBotStatsCommand {
	constructor(user) {
		this.user = user;
		this.promise = null;
		this.resolve = null;
		this.reject = null;
		this.return = new BanchoBotStatsReturn(user);

		const userNotFoundListener = (msg) => {
			if(msg.message == "User not found") {
				this.reject(new Error("User not found"));
				this._removeListeners();
			}
		};
		const statusListener = (msg) => {
			const m = /Stats for \((.+)\)\[https:\/\/osu\.ppy\.sh\/u\/(\d+)\]( is (.+))?:/.exec(msg.message);
			if(m && this._usernameMatchesIrcUsername(m[1])) {
				this.user.username = m[1];
				this.user.id = Number(m[2]);
				this.return.status = m[4];
				this.return.online = m[4] != null;
			}
		};
		const scoreListener = (msg) => {
			const m = /Score: {4}(.+) \(#(\d+)\)/.exec(msg.message);
			if(m) {
				this.user.rankedScore = Number(m[1].replace(/,/g, ""));
				this.user.ppRank = Number(m[2]);
			}
		};
		const playsListener = (msg) => {
			const m = /Plays: {4}(\d+) \(lv(\d+)\)/.exec(msg.message);
			if(m) {
				this.user.playcount = Number(m[1]);
				// Levels returned by !stats are inaccurate so we're simply setting it in the return object instead.
				this.return.level = Number(m[2]);
			}
		};
		const accuracyListener = (msg) => {
			const m = /Accuracy: (\d+(\.\d+)?)%/.exec(msg.message);
			if(m) {
				// Accuracy returned by !stats are inaccurate so we're simply setting it in the return object instead.
				this.return.accuracy = Number(m[1]);
				this.resolve(this.return);
				this._removeListeners();
			}
		};
		this.listeners = [userNotFoundListener, statusListener, scoreListener, playsListener, accuracyListener];
	}

	/** 
	 * Sends the !stats command.
	 * Promise is rejected if the user can't be found, otherwise update values from BanchoUser and returns a BanchoBotStatsReturn object.
	 * 
	 * @async
	 * @return Promise<BanchoBotStatsReturn>
	 */
	run() {
		if(this.promise == null)
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
				this._registerListeners();
				this.user.banchojs.getUser("BanchoBot").sendMessage("!stats "+this.user.ircUsername);
			});
		return this.promise;
	}

	_usernameMatchesIrcUsername(username) {
		return username.replace(/ /g, "_").toLowerCase() == this.user.ircUsername.toLowerCase();
	}

	_registerListeners() {
		for(const listener of this.listeners)
			this.user.banchojs.getUser("BanchoBot").on("message", listener);
	}

	_removeListeners() {
		for(const listener of this.listeners)
			this.user.banchojs.getUser("BanchoBot").removeListener("message", listener);
	}
}

module.exports = BanchoBotStatsCommand;