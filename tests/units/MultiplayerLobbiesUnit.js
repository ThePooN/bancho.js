const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");
const BanchoMods = require("../../").BanchoMods;
const TeamModes = require("../../").BanchoLobbyTeamModes;
const WinConditions = require("../../").BanchoLobbyWinConditions;

class MultiplayerLobbiesUnit extends TestUnit {
	constructor() {
		super();
		this.name = "MultiplayerLobbiesUnit";
	}

	async run() {
		const roomName = Math.random().toString(36).substring(8);
		const timeout = setTimeout(() => {
			throw new Error("Multiplayer tests haven't completed after 30 seconds!");
		}, 30000);

		const channel = await this.client.createLobby(roomName);
		if(!channel.lobby)
			throw new Error("lobby doesn't exist! this is a regular channel, not a multiplayer one!");
		this.fulFillGoal(TestGoals.MultiplayerLobbyExists);
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
		if(channel.lobby.playing !== true)
			throw new Error("playing is not set to true after starting match!");
		this.fulFillGoal(TestGoals.MultiplayerLobbyPlayingTrue);
		await channel.lobby.abortMatch();
		this.fulFillGoal(TestGoals.MultiplayerLobbyAbortMatch);
		if(channel.lobby.playing !== false)
			throw new Error("playing is not set to false after starting match!");
		this.fulFillGoal(TestGoals.MultiplayerLobbyPlayingFalse);
		await channel.lobby.closeLobby();
		this.fulFillGoal(TestGoals.MultiplayerLobbyCloseLobby);
		clearTimeout(timeout);
	}
}

module.exports = new MultiplayerLobbiesUnit();