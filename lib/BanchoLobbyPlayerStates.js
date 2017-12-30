/**
 * Contains the different player states for players in lobbies: Ready, Not Ready, No Map.
 * Alias for NotReady: "Not Ready"
 * Alias for NoMap: "No Map"
 * @readonly
 * @enum {Symbol}
 */
const BanchoLobbyPlayerStates = {
	Ready: Symbol("Ready"),
	NotReady: Symbol("Not Ready"),
	NoMap: Symbol("No Map"),
};
BanchoLobbyPlayerStates["Not Ready"] = BanchoLobbyPlayerStates.NotReady;
BanchoLobbyPlayerStates["No Map"] = BanchoLobbyPlayerStates.NoMap;

module.exports = Object.freeze(BanchoLobbyPlayerStates);