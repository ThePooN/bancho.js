/**
 * Contains the test goals that have to be met in order for the tests to succeed
 * @readonly
 * @enum {Symbol}
 */
const TestGoals = {
	ChannelMessage: Symbol("ChannelMessage"),
	PrivateSelfMessage: Symbol("PrivateSelfMessage"),
	PrivateMessage: Symbol("PrivateMessage"),
	JoinEvent: Symbol("JoinEvent"),
	JoinPromise: Symbol("JoinPromise"),
	PartEvent: Symbol("PartEvent"),
	PartPromise: Symbol("PartPromise"),
	UserAPIFetch: Symbol("UserAPIFetch"),
	Whois: Symbol("Whois"),
	Where: Symbol("Where"),
	Stats: Symbol("Stats"),
	BanchoMods: Symbol("BanchoMods"),
	MultiplayerScoresSorting: Symbol("MultiplayerScoresSorting"),

	MultiplayerLobbyExists: Symbol("MultiplayerLobbyExists"),
	MultiplayerLobbySetMap: Symbol("MultiplayerLobbySetMap"),
	MultiplayerLobbySetModsDTFree: Symbol("MultiplayerLobbySetModsDTFree"),
	MultiplayerLobbySetModsHDHR: Symbol("MultiplayerLobbySetModsHDHR"),
	MultiplayerLobbySetPassword: Symbol("MultiplayerLobbySetPassword"),
	MultiplayerLobbySetSize: Symbol("MultiplayerLobbySetSize"),
	MultiplayerLobbySetSettings: Symbol("MultiplayerLobbySetSettings"),
	MultiplayerLobbyLockSlots: Symbol("MultiplayerLobbyLockSlots"),
	MultiplayerLobbyUnlockSlots: Symbol("MultiplayerLobbyUnlockSlots"),
	MultiplayerLobbyClearHost: Symbol("MultiplayerLobbyClearHost"),
	MultiplayerLobbyStartMatch: Symbol("MultiplayerLobbyStartMatch"),
	MultiplayerLobbyPlayingTrue: Symbol("MultiplayerLobbyPlayingTrue"),
	MultiplayerLobbyAbortMatch: Symbol("MultiplayerLobbyAbortMatch"),
	MultiplayerLobbyPlayingFalse: Symbol("MultiplayerLobbyPlayingFalse"),
	MultiplayerLobbyCloseLobby: Symbol("MultiplayerLobbyCloseLobby")
};

module.exports = Object.freeze(TestGoals);