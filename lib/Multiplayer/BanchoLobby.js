const EventEmitter = require("events").EventEmitter;
const nodesu = require("nodesu");
const BanchoMods = require("./Enums/BanchoMods");
const BanchoLobbyPlayer = require("./BanchoLobbyPlayer");
const BanchoLobbyPlayerScore = require("./BanchoLobbyPlayerScore");
const BanchoLobbyPlayerStates = require("./Enums/BanchoLobbyPlayerStates");
const BanchoLobbyTeams = require("./Enums/BanchoLobbyTeams");
const Regexes = require("./BanchoLobbyRegexes");
const Teams = require("./Enums/BanchoLobbyTeams");
const BanchoLobbyTeamModes = require("./Enums/BanchoLobbyTeamModes");

/**
 * Represents a Bancho multiplayer lobby
 * 
 * Highly recommended to await updateSettings before manipulating (else some properties will be null).
 * 
 * @prop {BanchoMultiplayerChannel} channel
 * @prop {number} id Multiplayer lobby ID (used in multiplayer history links)
 * @prop {string} name Name of the lobby, as seen in-game
 * @prop {Array<BanchoLobbyPlayer>} slots Array of BanchoLobbyPlayer determining each users' slot, from 0 to 15
 * @prop {number} size Current size of the lobby
 * @prop {nodesu.ModeType} gamemode Current gamemode of the lobby, as specified by the latest !mp map call (Bancho limitation)
 * @prop {number} beatmapId
 * @prop {nodesu.Beatmap} beatmap Beatmap fetched from the API (late/not as reliable, use beatmapId when possible)
 * @prop {number} winCondition See BanchoLobbyWinConditions
 * @prop {number} teamMode See BanchoLobbyTeamModes
 * @prop {Array<BanchoMod>} mods 
 * @prop {boolean} freemod
 * @prop {boolean} playing Whether we're currently playing or not
 * @prop {Array<BanchoLobbyPlayerScore>} scores Scores set during the currently ongoing match, or the previous match. Emptied when a new match starts. Sorted by pass and score once match is finished.
 */
class BanchoLobby extends EventEmitter {
	constructor(channel) {
		super();
		this.channel = channel;
		this.banchojs = this.channel.banchojs;
		this.id = Number(channel.name.substring("#mp_".length));
		this.scores = [];
		this._name = "";
		this._beatmapId = null;
		this._beatmap = null;
		this._teamMode = null;
		this._winCondition = null;
		this._mods = null;
		this._freemod = false;
		this._playing = false;
		this._slots = this._createSlotsArray();
		this._size = 16;
		this._gamemode = nodesu.Mode.osu;
		this._allPlayersReadyOnUpdateSettings = true;

		// Players cache. Even when players leave, we wanna leave them cached here
		// for performance/API requests reasons.
		this.players = {}; // stored by names
		this.playersById = {};

		this.slotsUpdatesQueue = [];
		this.playerCreationQueue = [];
		
		this.channel.on("JOIN", (member) => {
			if(member.user.isClient()) // We have just joined the channel
				this.updateSettings(); // Let's retrieve all the properties of the lobby to begin with.
		});
		this.channel.on("message", (msg) => {
			if(msg.user.ircUsername.toLowerCase() == "banchobot")
				this.handleBanchoBotMessage(msg.message);
		});

		this.updateSettingsPromise = null;
	}

	/**
	 * Synchronous handling of operations on the room slots to avoid race conditions.
	 * Slots management involves resolving usernames from BanchoBot's messages and can lead to race conditions.
	 * @private
	 * @param {function} func 
	 */
	pushSlotsUpdateQueue(func) {
		this.slotsUpdatesQueue.push(func);
		if(this.slotsUpdatesQueue.length == 1)
			this.slotsUpdatesQueue[0](this.slotsUpdateCallback); // If there's no currently running function, execute the newest now
	}

	/**
	 * Called by a function in the slots update queue when the next one can be called.
	 * @private
	 */
	slotsUpdateCallback() {
		this.slotsUpdatesQueue.shift();
		if(this.slotsUpdatesQueue[0])
			this.slotsUpdatesQueue[0](this.slotsUpdateCallback);
	}

	/**
	 * Synchronous handling of BanchoLobbyPlayer object creations.
	 * As every first fetch of a BanchoLobbyPlayer object involves an API call and
	 * we only want one BanchoLobbyPlayer at a time, we need to make creations of them async.
	 * @private
	 * @param {function} func 
	 */
	pushPlayerCreationQueue(func) {
		this.playerCreationQueue.push(func);
		if(this.playerCreationQueue.length == 1)
			this.playerCreationQueue[0](this.playersCreationCallback); // If there's no currently running function, execute the newest now
	}

	/**
	 * Called by a function in the players creation queue when the next one can be called.
	 * @private
	 */
	playersCreationCallback() {
		this.playerCreationQueue.shift();
		if(this.playerCreationQueue[0])
			this.playerCreationQueue[0](this.playersCreationCallback);
	}

	/**
	 * Find the regex corresponding to a BanchoBot's message and process them
	 * @private
	 * @param {string} str message from BanchoBot to parse
	 */
	handleBanchoBotMessage(str) {
		const regex = Regexes.findRegex(str);
		if(regex) {
			const ret = regex.ret;
			switch(regex.name) {
				case "roomName":
				case "refereeChangedName":
					this.name = ret.name;
					break;
				case "teamModeWinConditions":
					this.teamMode = ret.teamMode;
					this.winCondition = ret.winCondition;
					break;
				case "activeMods":
					this.mods = ret.mods;
					this.freemod = ret.freemod;
					break;
				case "playerChangedBeatmap":
				case "refereeChangedBeatmap":
				case "beatmapFromSettings":
					if(ret.id != this.beatmapId) {
						this.beatmapId = ret.id;
						this.beatmap = null;
						for(const player of this.slots)
							if(player != null)
								player.state = BanchoLobbyPlayerStates.NotReady;

						this.banchojs.osuApi.beatmaps.getByBeatmapId(this.beatmapId)
							.then((beatmap) => {
								if(beatmap[0]) {
									if(beatmap[0].id == this.beatmapId)
										this.beatmap = beatmap[0];
								}
								else
									/**
									 * Emitted when a selected map is not found on the osu! API.
									 * @event BanchoLobby#beatmapNotFound
									 * @type {number}
									 */
									this.emit("beatmapNotFound", this.beatmapId);
							})
							.catch((err) => this.banchojs.emit("error", err));
					}
					break;
				case "refereeChangedMode":
					this.gamemode = ret.mode;
					break;
				case "playerChangedTeam":
					this.getPlayerByName(ret.name).then((player) => {
						/**
						 * @event BanchoLobby#playerChangedTeam
						 * @type {object}
						 * @prop {BanchoLobbyPlayer} player
						 * @prop {string} team See BanchoLobbyTeams
						 */
						if(player.team == BanchoLobbyTeams[ret.team])
							return;
						player.team = BanchoLobbyTeams[ret.team];
						for(const player of this.slots)
							if(player != null && player.state == BanchoLobbyPlayerStates.Ready)
								player.state = BanchoLobbyPlayerStates.NotReady;
						this.emit("playerChangedTeam", {
							player: player,
							team: player.team
						});
					});
					break;
				case "playerChangingBeatmap":
					this.beatmapId = null;
					this.beatmap = null;
					break;
				case "refereeChangedMods":
					this.mods = ret.mods;
					this.freemod = ret.freemod;
					for(const player of this.slots)
						if(player != null && player.state == BanchoLobbyPlayerStates.Ready)
							player.state = BanchoLobbyPlayerStates.NotReady;
					break;
				case "playerJoined":
					this.pushSlotsUpdateQueue(() => {
						this.getPlayerByName(ret.username).then((player) => {
							/**
							 * @event BanchoLobby#playerJoined
							 * @type {object}
							 * @prop {BanchoLobbyPlayer} player
							 * @prop {number} slot Starting from 0
							 * @prop {string} team Blue or Red
							 */
							player.reset();
							player.team = ret.team;
							this.slots[ret.slot - 1] = player;
							this.emit("playerJoined", {
								player: player,
								slot: (ret.slot - 1),
								team: ret.team
							});
							this.emit("slots", this.slots);
							this.slotsUpdateCallback();
						}, (err) => { this.banchojs.emit("error", err); this.slotsUpdateCallback(); });
					});
					break;
				case "playerMoved":
					this.pushSlotsUpdateQueue(() => {
						this.getPlayerByName(ret.username).then((player) => {
							/**
							 * @event BanchoLobby#playerMoved
							 * @type {object}
							 * @prop {BanchoLobbyPlayer} player
							 * @prop {number} slot Starting from 0
							 */
							const oldSlot = this.getPlayerSlot(player);
							this.slots[ret.slot - 1] = player;
							if(oldSlot) {
								this.slots[oldSlot] = null;
							}
							this.emit("playerMoved", {
								player: player,
								slot: (ret.slot - 1)
							});
							this.emit("slots", this.slots);
							this.slotsUpdateCallback();
						}, (err) => { this.banchojs.emit("error", err); this.slotsUpdateCallback(); });
					});
					break;
				case "playerLeft":
					this.pushSlotsUpdateQueue(() => {
						this.getPlayerByName(ret.username).then((player) => {
							/**
							 * @event BanchoLobby#playerLeft
							 * @type {BanchoLobbyPlayer}
							 */
							const slot = this.getPlayerSlot(player);
							if(slot) {
								this.slots[slot] = null;
							}
							this._allPlayersReadyOnUpdateSettings = true;
							this.emit("playerLeft", player);
							if(player.isHost) {
								this.emit("hostCleared");
								this.emit("host", null);
							}
							this.emit("slots", this.slots);
							this.slotsUpdateCallback();
						}, (err) => { this.banchojs.emit("error", err); this.slotsUpdateCallback(); });
					});
					break;
				case "playerBecameTheHost":
					this.getPlayerByName(ret.username).then((player) => {
						/**
						 * @event BanchoLobby#host
						 * @type {BanchoLobbyPlayer}
						 */
						if(this.getHost() != null)
							this.getHost().isHost = false;
						player.isHost = true;
						this.emit("host", player);
					}, (err) => this.banchojs.emit("error", err));
					break;
				case "hostCleared":
					const host = this.getHost();
					if(host != null)
						host.isHost = false;
					/**
					 * @event BanchoLobby#hostCleared
					 */
					this.emit("hostCleared");
					this.emit("host", null);
					break;
				case "allPlayersReady":
					/**
					 * @event BanchoLobby#allPlayersReady
					 */
					for(const player of this.slots)
						if(player != null)
							player.state = BanchoLobbyPlayerStates.Ready;
					this._allPlayersReadyOnUpdateSettings = false;
					this.emit("allPlayersReady");
					break;
				case "matchStarted":
					/**
					 * @event BanchoLobby#matchStarted
					 */
					for(const player of this.slots) {
						if(player != null && player.state == BanchoLobbyPlayerStates.Ready) {
							player.state = BanchoLobbyPlayerStates.NotReady;
							player.score = null;
						}
					}
					this.scores.length = 0;
					this.playing = true;
					this.emit("matchStarted");
					break;
				case "playerFinished":
					/**
					 * @event BanchoLobby#playerFinished
					 * @type {BanchoLobbyPlayerScore}
					 */
					this.getPlayerByName(ret.username).then((player) => {
						player.score = new BanchoLobbyPlayerScore(ret.score, ret.pass, player);
						this.scores.push(player.score);
						this.emit("playerFinished", player.score);
					}, (err) => this.banchojs.emit("error", err));
					break;
				case "matchAborted":
					/**
					 * @event BanchoLobby#matchAborted
					 */
					this.playing = false;
					this.emit("matchAborted");
					break;
				case "matchFinished":
					/**
					 * @event BanchoLobby#matchFinished
					 * @type {Array.<BanchoLobbyPlayerScore>} Sorted scores array
					 */
					// Due to players resolving, matchFinished may be emitted and scores sorted before every playerFinished are done being processed.
					// For some reason, even though a Promise may not have anything async, the "then" functions may still be executed asynchronously...
					// However, they seem to be executed in order for some reason. So a workaround for this is to wait for the callback of a resolved Promise to be called.
					Promise.resolve().then(() => {
						// This ensures sorting/emitting is executed after all names are resolved.
						this.pushPlayerCreationQueue(() => {
							this.sortScores();
							this.playing = false;
							this.emit(regex.name, this.scores);
							this.playersCreationCallback();
						});
					});
					break;
				case "invalidBeatmapId":
				case "passwordRemoved":
				case "passwordChanged":
				case "userNotFound":
				case "slotsLocked":
				case "slotsUnlocked":
					/**
					 * @event BanchoLobby#invalidBeatmapId
					 */
					/**
					 * @event BanchoLobby#passwordRemoved
					 */
					/**
					 * @event BanchoLobby#passwordChanged
					 */
					/**
					 * @event BanchoLobby#userNotFound
					 */
					/**
					 * @event BanchoLobby#slotsLocked
					 */
					/**
					 * @event BanchoLobby#slotsUnlocked
					 */
					this.emit(regex.name);
					break;
				case "refereeAdded":
				case "refereeRemoved":
				case "userNotFoundUsername":
					/**
					 * @event BanchoLobby#refereeAdded
					 * @type {string}
					 */
					/**
					 * @event BanchoLobby#refereeRemoved
					 * @type {string}
					 */
					/**
					 * @event BanchoLobby#userNotFoundUsername
					 * @type {string}
					 */
					this.emit(regex.name, ret.username);
					break;
				case "matchSize":
					this.size = ret.size;
					break;
				case "matchSettings":
					/**
					 * @event BanchoLobby#matchSettings
					 * @type {object}
					 * @prop {number} size
					 * @prop {number} teamMode See BanchoLobbyTeamModes
					 * @prop {number} winCondition See BanchoLobbyWinConditions
					 */
					this.teamMode = ret.teamMode;
					if(!isNaN(ret.winCondition))
						this.winCondition = ret.winCondition;
					if(!isNaN(ret.size))
						this.size = ret.size;

					for(const player of this.slots)
						if(player != null && player.state == BanchoLobbyPlayerStates.Ready)
							player.state = BanchoLobbyPlayerStates.NotReady;

					this.emit("matchSettings", ret);
					break;
			}
		}
	}

	/**
	 * Fetch the lobby from the osu! API.
	 * 
	 * @async
	 * @returns Promise<nodesu.Multi>
	 */
	fetchFromAPI() {
		return this.banchojs.osuApi.multi.getMatch(this.id);
	}

	/**
	 * Set a given map in the lobby
	 * @param {number|nodesu.Beatmap} map Either a beatmap ID or a Beatmap object from nodesu
	 * @param {number} [gamemode] See nodesu.Mode. Defaults to current mode (osu! if undetected).
	 * @async
	 */
	setMap(map, gamemode = this.gamemode) {
		return new Promise((resolve, reject) => {
			if(map instanceof nodesu.Beatmap)
				map = map.id;
			else if(isNaN(map))
				return reject(new Error("Not a valid number/beatmap"));

			this.channel.sendMessage("!mp map "+map+" "+gamemode+" "+this.randomString()).catch(reject);
			const validMapListener = () => {
				resolve();
				this.removeListener("_beatmapId", validMapListener);
				this.removeListener("invalidBeatmapId", invalidMapListener);
			};
			const invalidMapListener = () => {
				reject(new Error("Invalid map ID provided"));
				this.removeListener("_beatmapId", validMapListener);
				this.removeListener("invalidBeatmapId", invalidMapListener);
			};
			this.on("_beatmapId", validMapListener);
			this.on("invalidBeatmapId", invalidMapListener);
		});
	}

	/**
	 * Set given mods in the lobby
	 * @param {Array<BanchoMod>|string} mods Either an array of BanchoMods or a mods string joined by spaces
	 * @param {boolean} freemod 
	 * @async
	 */
	setMods(mods, freemod = false) {
		return new Promise((resolve, reject) => {
			let modsString = "!mp mods ";
			if(typeof mods == "string")
				modsString += mods+" ";
			else if(Array.isArray(mods)) {				
				let value = 0;
				for(const mod of mods)
					value += mod.enumValue;
				modsString += value + " ";
			}
			else
				return reject(new Error("mods need to be string or array of BanchoMods"));

			if(freemod)
				modsString += "freemod ";
			modsString += this.randomString();
			this.channel.sendMessage(modsString).catch(reject);
			const validModListener = () => {
				resolve();
				this.removeListener("_mods", validModListener);
			};
			this.on("_mods", validModListener);
		});
	}

	/**
	 * Sets the lobby's name
	 * @param {string} name 
	 * @async
	 */
	setName(name) {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp name "+name).catch(reject);
			const listener = (newName) => {
				if(name == newName) {
					resolve();
					this.removeListener("_name", listener);
				}
			};
			this.on("_name", listener);
		});
	}

	/**
	 * Sets the lobby's password
	 * @param {string} password 
	 * @async
	 */
	setPassword(password) {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp password "+password).catch(reject);
			const changedListener = () => {
				resolve();
				this.removeListener("passwordChanged", changedListener);
				this.removeListener("passwordRemoved", removedListener);
			};
			this.on("passwordChanged", changedListener);
			const removedListener = () => {
				resolve();
				this.removeListener("passwordChanged", changedListener);
				this.removeListener("passwordRemoved", removedListener);
			};
			this.on("passwordRemoved", removedListener);
		});
	}

	/**
	 * Adds referees to the lobby
	 * @param {Array<string>|string} ref A string or array of strings of referee(s) to add, referenced by their usernames or #<userid>
	 * @async
	 */
	addRef(ref) {
		return new Promise((resolve, reject) => {
			let refString;
			if(typeof ref == "string")
				refString = ref;
			else if(Array.isArray(ref))
				refString = ref.join(", ");
			else
				return reject(new Error("a string or an array of string must be passed"));
	
			this.channel.sendMessage("!mp addref "+refString).then(resolve, reject);
		});
	}

	/**
	 * Removes referees from the lobby
	 * @param {Array<string>|string} ref A string or array of strings of referee(s) to remove, referenced by their usernames or #<userid>
	 */
	removeRef(ref) {
		return new Promise((resolve, reject) => {
			let refString;
			if(typeof ref == "string")
				refString = ref;
			else if(Array.isArray(ref))
				refString = ref.join(", ");
			else
				return reject(new Error("a string or an array of string must be passed"));

			this.channel.sendMessage("!mp removeref "+refString).then(resolve, reject);
		});
	}

	/**
	 * Locks the lobby's slots and teams
	 * @async
	 */
	lockSlots() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp lock "+this.randomString()).catch(reject);
			const listener = () => {
				resolve();
				this.removeListener("slotsLocked", listener);
			};
			this.on("slotsLocked", listener);
		});
	}

	/**
	 * Unlocks the lobby's slots and teams
	 * @async
	 */
	unlockSlots() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp unlock "+this.randomString()).catch(reject);
			const listener = () => {
				resolve();
				this.removeListener("slotsUnlocked", listener);
			};
			this.on("slotsUnlocked", listener);
		});
	}

	/**
	 * Set the amount of open slots in the lobby
	 * @param {number} size 
	 * @async
	 */
	setSize(size) {
		return new Promise((resolve, reject) => {
			if(isNaN(size) || size < 1 || size > 16)
				return reject(new Error("how can the size not be a number between 1 and 16? try again."));
			this.channel.sendMessage("!mp size "+size+" "+this.randomString()).catch(reject);
			const listener = (newSize) => {
				if(size == newSize) {
					resolve();
					this.removeListener("_size", listener);
				}
			};
			this.on("_size", listener);
		});
	}

	/**
	 * Sets the settings of the lobby
	 * @param {number} [teamMode] See BanchoLobbyTeamModes
	 * @param {number} [winCondition] See BanchoLobbyWinConditions
	 * @param {number} [size] 
	 * @async
	 */
	setSettings(teamMode = this.teamMode, winCondition = this.winCondition, size) {
		return new Promise((resolve, reject) => {
			if(isNaN(teamMode) || isNaN(winCondition) || size != null && (isNaN(size) || size < 1 || size > 16))
				return reject(new Error("one of the arguments isn't a valid number. try again"));

			const listener = (ret) => {
				if(teamMode == ret.teamMode && winCondition == ret.winCondition && size == ret.size) {
					resolve();
					this.removeListener("matchSettings", listener);
				}
			};
			this.on("matchSettings", listener);
			
			this.channel.sendMessage("!mp set "+teamMode+" "+winCondition+" "+(size != null ? size : "")+" "+this.randomString()).catch(reject);
		});
	}

	/**
	 * Moves a player from one slot to another
	 * @param {BanchoLobbyPlayer} player
	 * @param {number} slot starting from 0
	 * @async
	 */
	movePlayer(player, slot) {
		return new Promise((resolve, reject) => {
			if(!(player instanceof BanchoLobbyPlayer))
				return reject(new Error("invalid player"));
			if(isNaN(slot) || slot < 0 || slot > 15)
				return reject(new Error("how can a slot not be a number between 0 and 15? try again."));
			this.channel.sendMessage("!mp move #"+player.user.id+" "+(slot+1)).then(resolve, reject);
		});
	}

	/**
	 * Invites a player to the lobby
	 * @param {string} player Referenced by their username or #<userid>
	 * @async
	 */
	invitePlayer(player) {
		return new Promise((resolve, reject) => 
			this.channel.sendMessage("!mp invite "+player).then(resolve, reject)
		);
	}

	/**
	 * Sets a player as the host of the lobby
	 * @param {string} player Referenced by their username or #<userid>
	 * @async
	 */
	setHost(player) {
		return new Promise((resolve, reject) => 
			this.channel.sendMessage("!mp host "+player).then(resolve, reject)
		);
	}

	/**
	 * Kicks a player from the lobby
	 * @param {string} player Referenced by their username or #<userid>
	 * @async
	 */
	kickPlayer(player) {
		return new Promise((resolve, reject) => 
			this.channel.sendMessage("!mp kick "+player).then(resolve, reject)
		);
	}

	/**
	 * Bans a player from the lobby
	 * @param {string} player Referenced by their username or #<userid>
	 * @async
	 */
	banPlayer(player) {
		return new Promise((resolve, reject) => 
			this.channel.sendMessage("!mp ban "+player).then(resolve, reject)
		);
	}

	/**
	 * Get back the host from one's hand
	 * @async
	 */
	clearHost() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp clearhost "+this.randomString()).catch(reject);
			const listener = () => {
				resolve();
				this.removeListener("hostCleared", listener);
			};
			this.on("hostCleared", listener);
		});
	}

	/**
	 * Close the lobby
	 * @async
	 */
	closeLobby() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp close "+this.randomString()).catch(reject);
			const listener = (member) => {
				if(member.user.isClient()) {
					resolve();
					this.channel.removeListener("PART", listener);
				}
			};
			this.channel.on("PART", listener);
		});
	}

	/**
	 * Start the match
	 * @param {number} [timeout] Timeout before the game starts. Defaults to 0
	 * @async
	 */
	startMatch(timeout = null) {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp start"+((timeout != null && Number(timeout) != 0) ? " " + Number(timeout) : "")+" "+this.randomString())
				.then(() => {
					if(timeout > 0)
						resolve();
				})
				.catch(reject);
			
			if(timeout == null) {
				const listener = () => {
					resolve();
					this.removeListener("matchStarted", listener);
				};
				this.on("matchStarted", listener);
			}
		});
	}

	/**
	 * Start a timer
	 * @param {number} timeout Timeout
	 * @async
	 */
	startTimer(timeout) {
		return new Promise((resolve, reject) => {
			if(isNaN(timeout))
				return reject(new Error("Not a number!"));
			this.channel.sendMessage("!mp timer "+timeout+" "+this.randomString()).then(resolve).catch(reject);
		});
	}

	/**
	 * Aborts an ongoing timer
	 * @async
	 */
	abortTimer() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp aborttimer "+this.randomString()).then(resolve).catch(reject);
		});
	}

	/**
	 * Abort the match
	 * @async
	 */
	abortMatch() {
		return new Promise((resolve, reject) => {
			this.channel.sendMessage("!mp abort "+this.randomString()).catch(reject);
			const listener = () => {
				resolve();
				this.removeListener("matchAborted", listener);
			};
			this.on("matchAborted", listener);
		});
	}

	/**
	 * Change's one team
	 * @param {BanchoLobbyPlayer} player 
	 * @param {string} team See BanchoLobbyTeams
	 * @async
	 */
	changeTeam(player, team) {
		return new Promise((resolve, reject) => {
			if(team != Teams.Blue && team != Teams.Red)
				return reject(new Error("invalid team"));
			this.channel.sendMessage("!mp team #"+player.user.id+" "+team).then(resolve, reject);
		});
	}

	/**
	 * Fires !mp settings, updates properties and player slots
	 * @async
	 */
	updateSettings() {
		if(this.updateSettingsPromise != null)
			return this.updateSettingsPromise;
		
		return this.updateSettingsPromise = new Promise((callerResolve, callerReject) => {
			this.channel.sendMessage("!mp settings "+this.randomString());
			// Beginning of the !mp settings message will be handled by handleBanchoBotMessage; ending (player infos) will be handled in the following listener.
			let amountOfPlayers = null;
			const slots = this._createSlotsArray();

			let initializeMods = true;
			const modsListener = () => initializeMods = false;
			this.on("mods", modsListener);

			const listener = (msg) => {
				if(msg.user.ircUsername.toLowerCase() == "banchobot") {
					if(amountOfPlayers == null) {
						const playersRegex = Regexes.regexes.playersAmount(msg.message);
						if(playersRegex) {
							amountOfPlayers = playersRegex.playersAmount;
							if(amountOfPlayers == 0) {
								this.pushSlotsUpdateQueue(() => {
									this.slots = this._createSlotsArray();
									this.slotsUpdateCallback();
									if(initializeMods)
										this.mods = [];
									callerResolve();
									this.updateSettingsPromise = null;
								});
								this.channel.removeListener("message", listener);
							}
						}
					}
					else {
						const playerRegex = /^Slot (\d+) +(Not Ready|Ready|No Map) +https:\/\/osu\.ppy\.sh\/u\/(\d+) (.+)$/;
						if(playerRegex.test(msg.message)) {
							const match = playerRegex.exec(msg.message);
							this.getPlayerById(Number(match[3])).then((player) => {
								slots[Number(match[1])-1] = player;
								player.state = BanchoLobbyPlayerStates[match[2]];
								player.isHost = false;
								player.team = null;
								player.mods = (this.freemod) ? [] : this.mods;
								let metadatasString = match[4].substring(player.user.username.length).trim();
								if(metadatasString.length > 0) {
									metadatasString = metadatasString.substr(1, metadatasString.length - 2);
									for(let metadatasSplit of metadatasString.split("/")) {
										metadatasSplit = metadatasSplit.trim();
										switch(metadatasSplit) {
											case "Host":
												player.isHost = true;
												break;
											case "Team Blue":
												player.team = BanchoLobbyTeams.Blue;
												break;
											case "Team Red":
												player.team = BanchoLobbyTeams.Red;
												break;
											default:
												player.mods = BanchoMods.parseLongMods(metadatasSplit);
										}
									}
								}

								let completedPlayers = 0;
								for(const slot of slots) {
									if(slot != null)
										completedPlayers++;
								}
								if(completedPlayers == amountOfPlayers) {
									this.pushSlotsUpdateQueue(() => {
										if (this._allPlayersReadyOnUpdateSettings && !slots.some((slot) => (slot && slot.state === BanchoLobbyPlayerStates.NotReady))) {
											this.emit("allPlayersReady");
											this._allPlayersReadyOnUpdateSettings = false;
										}
										this.slots = slots;
										this.slotsUpdateCallback();
										if(initializeMods)
											this.mods = [];
										callerResolve();
										this.updateSettingsPromise = null;
									});
									this.channel.removeListener("message", listener);
								}
							}, (err) => {
								callerReject(err);
							});
						}
					}
				}
			};

			this.channel.on("message", listener);
		});
	}

	/**
	 * Gets the player who is currently host
	 * @returns {BanchoLobbyPlayer}
	 */
	getHost() {
		for(const player of this.slots)
			if(player != null && player.isHost)
				return player;
	}

	/**
	 * Gets the slot of a player
	 * @param {BanchoLobbyPlayer} player 
	 * @return {number}
	 */
	getPlayerSlot(player) {
		for(const slotNum in this.slots)
			if(this.slots[slotNum] == player)
				return slotNum;
	}

	/**
	 * Gets or instanciate a player by its username
	 * @param {string} name 
	 * @async
	 */
	getPlayerByName(name) {
		return new Promise((callerResolve, callerReject) => {
			if(this.players[name])
				return callerResolve(this.players[name]);

			this.pushPlayerCreationQueue(() => {
				if(this.players[name]) {
					callerResolve(this.players[name]);
					this.playersCreationCallback();
				}
				else {
					const user = this.banchojs.getUser(name);
					const player = new BanchoLobbyPlayer(this, user);
					const cb = () => {
						this.playersById[user.id] = player;
						this.players[user.username] = player;
						callerResolve(player);
						this.playersCreationCallback();
					};
					if(!user.username || !user.id)
						user.fetchFromAPI().then(cb).catch((err) => {
							callerReject(err);
							this.playersCreationCallback();
						});
					else
						cb();
				}
			});
		});
	}

	/**
	 * Gets or instanciate a player by its userid
	 * @async
	 */
	getPlayerById(id) {
		return new Promise((callerResolve, callerReject) => {
			if(isNaN(id))
				return callerReject(new Error("id needs to be a number!"));
			if(this.playersById[id])
				return callerResolve(this.playersById[id]);

			this.pushPlayerCreationQueue(() => {
				if(this.playersById[id]) {
					callerResolve(this.playersById[id]);
					this.playersCreationCallback();
				}
				else
					this.banchojs.getUserById(id)
						.then((user) => {
							const player = new BanchoLobbyPlayer(this, this.banchojs.getUser(user.username));
							this.playersById[id] = player;
							this.players[user.username] = player;
							callerResolve(player);
							this.playersCreationCallback();
						});
			});
		});
	}

	/**
	 * Gets the mp link or however you name it.
	 * @returns {string}
	 */
	getHistoryUrl() {
		return "https://osu.ppy.sh/community/matches/"+this.id;
	}

	/**
	 * Creates a slots array of 16 players
	 * @private
	 * @returns {Array<null>}
	 */
	_createSlotsArray() {
		const slots = [];
		for(let i = 0; i < 16; i++)
			slots[i] = null;
		return Object.seal(slots);
	}

	/**
	 * Sort scores by pass and score.
	 */
	sortScores() {
		this.scores.sort((a, b) => {
			if(a.pass && !b.pass)
				return -1;
			else if(!a.pass && b.pass)
				return 1;
			else if(a.score > b.score)
				return -1;
			else if(b.score > a.score)
				return 1;
			else
				return 0;
		});
	}

	get beatmap() {
		return this._beatmap;
	}

	/**
	 * Fired when the beatmap property is updated from the API
	 * @event BanchoLobby#beatmap
	 * @type {nodesu.Beatmap}
	 */
	set beatmap(val) {
		this._setter("beatmap", val);
	}

	get name() {
		return this._name;
	}

	/**
	 * Fired when the name of the lobby is updated
	 * @event BanchoLobby#name
	 * @type {string}
	 */
	set name(val) {
		this._setter("name", val);
	}

	get beatmapId() {
		return this._beatmapId;
	}

	/**
	 * Fired when the beatmapId is updated
	 * @event BanchoLobby#beatmapId
	 * @type {number}
	 */
	set beatmapId(val) {
		this._setter("beatmapId", val);
	}

	get teamMode() {
		return this._teamMode;
	}

	/**
	 * Fired when the team mode is updated
	 * @event BanchoLobby#teamMode
	 * @type {number}
	 * @see BanchoLobbyTeamModes
	 */
	set teamMode(val) {
		const teamModes = [BanchoLobbyTeamModes.TeamVs, BanchoLobbyTeamModes.TagTeamVs];
		if(!teamModes.includes(this.teamMode) && teamModes.includes(val)) {
			for(let i = 0; i < this.slots.length; i++) {
				const slot = this.slots[i];
				if (slot !== null) {
					slot.team = i % 2 === 0 ? BanchoLobbyTeams.Blue : BanchoLobbyTeams.Red;
				}
			}
		}
		this._setter("teamMode", val);
	}

	get winCondition() {
		return this._winCondition;
	}

	/**
	 * Fired when the win condition is updated
	 * @event BanchoLobby#winCondition
	 * @type {number}
	 * @see BanchoLobbyWinConditions
	 */
	set winCondition(val) {
		this._setter("winCondition", val);
	}

	get mods() {
		return this._mods;
	}

	/**
	 * Fired when the lobby's mods are updated
	 * @event BanchoLobby#mods
	 * @type {Array<BanchoMod>}
	 */
	set mods(val) {
		this._setter("mods", val);
	}

	get freemod() {
		return this._freemod;
	}

	/**
	 * Fired when the lobby's freemod property is updated
	 * @event BanchoLobby#freemod
	 * @type {boolean}
	 */
	set freemod(val) {
		this._setter("freemod", val);
	}

	get playing() {
		return this._playing;
	}

	/**
	 * Fired when the lobby starts or stops playing
	 * @event BanchoLobby#playing
	 * @type {Symbol}
	 * @see {BanchoLobbyState}
	 */
	set playing(val) {
		this._setter("playing", val);
	}

	get slots() {
		return this._slots;
	}

	/**
	 * Fired when the slots of the lobby are updated
	 * @event BanchoLobby#slots
	 * @type {Array<BanchoLobbyPlayer>}
	 */
	set slots(val) {
		this._setter("slots", val);
	}

	get size() {
		return this._size;
	}

	/**
	 * Fired when the size of the lobby is updated
	 * @event BanchoLobby#size
	 * @type {number}
	 */
	set size(val) {
		this._setter("size", val);
	}

	get gamemode() {
		return this._gamemode;
	}

	/**
	 * Fired when the gamemode of the lobby is updated
	 * @event BanchoLobby#gamemode
	 * @type {nodesu.Mode}
	 */
	set gamemode(val) {
		this._setter("gamemode", val);
	}

	/**
	 * Setter for all properties that can fire events
	 * @param {string} prop Property's name
	 * @param {any} val New property
	 * @private
	 */
	_setter(prop, val) {
		if(this[prop] != val) {
			this["_"+prop] = val;
			this.emit(prop, val);
		}

		// Private event, emitted even when no update. Necessary for some Promises to resolve.
		this.emit("_"+prop, val);
	}

	/**
	 * Generates a random string. Used with generic commands with no args to work around Bancho's anti-spam.
	 * @private
	 */
	randomString() {
		let str = "0";
		while(!isNaN(str))
			str = Math.random().toString(36).slice(2);
		return str;
	}
}

module.exports = BanchoLobby;