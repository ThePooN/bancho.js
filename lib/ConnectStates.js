/**
 * Contains the different connect states: Disconnected, Connecting, Reconnecting, Connected.
 * @readonly
 * @enum {Symbol}
 */
const ConnectStates = {
	/** When we're purposely disconnected from Bancho or after an auth fail */
	Disconnected: Symbol("Disconnected"),
	/** When we've opened the socket before any reconnection attempts and waiting for the Welcome packet */
	Connecting: Symbol("Connecting"),
	/** When we've gotten disconnected, and are currently waiting before trying to reconnect */
	Reconnecting: Symbol("Reconnecting"),
	/** When we're online! \o/ */
	Connected: Symbol("Connected"),
};

module.exports = Object.freeze(ConnectStates);