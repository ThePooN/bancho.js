const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");
const BanchoMods = require("../../lib/BanchoMods");
const TeamModes = require("../../lib/BanchoLobbyTeamModes");
const WinConditions = require("../../lib/BanchoLobbyWinConditions");

class MultiplayerLobbiesUnit extends TestUnit {
	constructor() {
		super();
		this.name = "MultiplayerLobbiesUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			const roomName = Math.random().toString(36).substring(8);
			let channel = null;
			let matchCreatedRegex = /Created the tournament match https:\/\/osu\.ppy\.sh\/mp\/(\d+) (.+)/;
			const BanchoBot = this.client.getUser("BanchoBot");
			let timeout = setTimeout(() => {
				reject(new Error("Multiplayer tests haven't completed after 25 seconds!"));
			}, 25000);

			BanchoBot.sendMessage("!mp make "+roomName).then(() => {
				BanchoBot.on("message", async (msg) => {
					const m = matchCreatedRegex.exec(msg.message);
					if(!m || m[2] != roomName)
						return;
					BanchoBot.removeAllListeners("message");
					channel = this.client.getChannel("#mp_"+Number(m[1]));

					if(!channel.lobby)
						reject(new Error("lobby doesn't exist! this is a regular channel, not a multiplayer one!"));
					this.fulFillGoal(TestGoals.MultiplayerLobbyExists);
					try {
						await channel.lobby.setMap(75);
						this.fulFillGoal(TestGoals.MultiplayerLobbySetMap);
						await channel.lobby.setMods([BanchoMods.enum.DoubleTime], true);
						this.fulFillGoal(TestGoals.MultiplayerLobbySetModsDTFree);
						await channel.lobby.setMods([BanchoMods.enum.Hidden, BanchoMods.enum.HardRock], false);
						this.fulFillGoal(TestGoals.MultiplayerLobbySetModsHDHR);
						await channel.lobby.setPassword(Math.random().toString(36).substring(8));
						this.fulFillGoal(TestGoals.MultiplayerLobbySetPassword);
						await channel.lobby.setSize(4);
						this.fulFillGoal(TestGoals.MultiplayerLobbySetSize);
						await channel.lobby.setSettings(TeamModes.TagTeamVs, WinConditions.Accuracy, 7);
						this.fulFillGoal(TestGoals.MultiplayerLobbySetSettings);
						await channel.lobby.lockSlots();
						this.fulFillGoal(TestGoals.MultiplayerLobbyLockSlots);
						await channel.lobby.unlockSlots();
						this.fulFillGoal(TestGoals.MultiplayerLobbyUnlockSlots);
						await channel.lobby.clearHost();
						this.fulFillGoal(TestGoals.MultiplayerLobbyClearHost);
						await channel.lobby.startMatch();
						this.fulFillGoal(TestGoals.MultiplayerLobbyStartMatch);
						await channel.lobby.abortMatch();
						this.fulFillGoal(TestGoals.MultiplayerLobbyAbortMatch);
						await channel.lobby.closeLobby();
						this.fulFillGoal(TestGoals.MultiplayerLobbyCloseLobby);
						clearTimeout(timeout);
						resolve();
					}
					catch(e) {
						reject(e);
					}
				});
			});
		});
	}
}

module.exports = new MultiplayerLobbiesUnit();