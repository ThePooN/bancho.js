const nodesu = require("nodesu");
const TeamModes = require("./Enums/BanchoLobbyTeamModes");
const WinConditions = require("./Enums/BanchoLobbyWinConditions");
const Mods = require("./Enums/BanchoMods");

/**
 * @name BanchoLobbyRegexes
 * @description Regexes to parse BanchoBot's messages in multiplayer lobbies.
 * @global
 * @private
 * @namespace BanchoLobbyRegexes
 */
module.exports = {
	/**
	 * Finds and execute the right regex on the given string
	 * @name findRegex
	 * @arg {string} str parsed string
	 * @returns {object}
	 * @memberof BanchoLobbyRegexes
	 * @inner
	 */
	findRegex: function(str) {
		for(const regexName in this.regexes) {
			const regex = this.regexes[regexName];
			const ret = regex(str);
			if(ret)
				return {
					name: regexName,
					ret: ret
				};
		}
	},
	/**
	 * All the tested regexes
	 * @type {object}
	 * @memberof BanchoLobbyRegexes
	 * @inner
	 */
	regexes: {
		roomName: function(str) {
			const r = /^Room name: (.+), History: https:\/\/osu\.ppy\.sh\/mp\/(\d+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					name: m[1],
					id: Number(m[2])
				};
			}
		},
		refereeChangedName: function(str) {
			const r = /^Room name updated to "(.+)"$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					name: m[1]
				};
			}
		},
		teamModeWinConditions: function(str) {
			const r = /^Team mode: (\w+), Win condition: (\w+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					teamMode: TeamModes[m[1]],
					winCondition: WinConditions[m[2]]
				};
			}
		},
		activeMods: function(str) {
			const r = /^Active mods: (.+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					mods: Mods.parseLongMods(m[1]),
					freemod: m[1].indexOf("Freemod") != -1
				};
			}
		},
		playersAmount: function(str) {
			const r = /^Players: (\d+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					playersAmount: Number(m[1])
				};
			}
		},
		playerChangedBeatmap: function(str) {
			const r = /^Beatmap changed to: (.+) \(https:\/\/osu\.ppy\.sh\/b\/(\d+)\)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					name: m[1],
					id: Number(m[2])
				};
			}
		},
		playerChangedTeam: function(str) {
			const r = /^(.+) changed to (Blue|Red)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					name: m[1],
					team: m[2]
				};
			}
		},
		refereeChangedBeatmap: function(str) {
			const r = /^Changed beatmap to https:\/\/osu\.ppy\.sh\/b\/(\d+) (.+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					id: Number(m[1]),
					name: m[2]
				};
			}
		},
		refereeChangedMode: function(str) {
			const r = /^Changed match mode to (Osu|Taiko|CatchTheBeat|OsuMania)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				let mode;
				switch (m[1]) {
					case "Osu":
						mode = nodesu.Mode.osu;
						break;
					case "Taiko":
						mode = nodesu.Mode.taiko;
						break;
					case "CatchTheBeat":
						mode = nodesu.Mode.ctb;
						break;
					case "OsuMania":
						mode = nodesu.Mode.mania;
						break;
				}
				return {
					mode: mode
				};
			}
		},
		beatmapFromSettings: function(str) {
			const r = /^Beatmap: https:\/\/osu\.ppy\.sh\/b\/(\d+) (.+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					id: Number(m[1]),
					name: m[2]
				};
			}
		},
		invalidBeatmapId: function(str) {
			return str == "Invalid map ID provided";
		},
		playerChangingBeatmap: function(str) {
			return (str == "Host is changing map...");
		},
		refereeChangedMods: function(str) {
			const r = /^(Enabled (.+)|Disabled all mods), (disabled|enabled) FreeMod$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					mods: Mods.parseLongMods(m[2]),
					freemod: m[3] == "enabled"
				};
			}
		},
		playerJoined: function(str) {
			const r = /^(.+) joined in slot (\d+)( for team (red|blue))?\.$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1],
					slot: Number(m[2]),
					team: (m[4] ? m[4] == "blue" ? "Blue" : "Red" : null)
				};
			}
		},
		playerMoved: function(str) {
			const r = /^(.+) moved to slot (\d+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1],
					slot: Number(m[2])
				};
			}
		},
		playerLeft: function(str) {
			const r = /^(.+) left the game\.$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1]
				};
			}
		},
		playerBecameTheHost: function(str) {
			const r = /^(.+) became the host\.$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1]
				};
			}
		},
		allPlayersReady: function(str) {
			return str == "All players are ready";
		},
		matchStarted: function(str) {
			return str == "The match has started!";
		},
		matchAborted: function(str) {
			return str == "Aborted the match";
		},
		playerFinished: function(str) {
			const r = /^(.+) finished playing \(Score: (\d+), (FAIL|PASS)ED\)\.$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1],
					score: Number(m[2]),
					pass: m[3] == "PASS"
				};
			}
		},
		matchFinished: function(str) {
			return str == "The match has finished!";
		},
		passwordRemoved: function(str) {
			return str == "Removed the match password";
		},
		passwordChanged: function(str) {
			return str == "Changed the match password";
		},
		refereeAdded: function(str) {
			const r = /^Added (.+) to the match referees$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1]
				};
			}
		},
		refereeRemoved: function(str) {
			const r = /^Removed (.+) from the match referees$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1]
				};
			}
		},
		userNotFound: function(str) {
			return str == "User not found";
		},
		userNotFoundUsername: function(str) {
			const r = /^User not found: (.+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					username: m[1]
				};
			}
		},
		slotsLocked: function(str) {
			return str == "Locked the match";
		},
		slotsUnlocked: function(str) {
			return str == "Unlocked the match";
		},
		matchSize: function(str) {
			const r = /^Changed match to size (\d+)$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					size: Number(m[1])
				};
			}
		},
		matchSettings: function(str) {
			const r = /^Changed match settings to ((\d+) slots, )?(HeadToHead|TagCoop|TeamVs|TagTeamVs)(, (Score|Accuracy|Combo|ScoreV2))?$/;
			if(r.test(str)) {
				const m = r.exec(str);
				return {
					size: Number(m[2]),
					teamMode: TeamModes[m[3]],
					winCondition: WinConditions[m[5]]
				};
			}
		},
		hostCleared: function(str) {
			return str == "Cleared match host";
		}
	}
};