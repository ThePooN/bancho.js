const net = require("net");
const EventEmitter = require("events").EventEmitter;

const BanchoUser = require("./BanchoUser");
const ConnectStates = require("./ConnectStates");
const IrcCommands = require("./IrcCommands");
const Nodesu = require("nodesu");

const ignoredSplits = [
	"375",  // MOTD Begin
	"372",  // MOTD
	"376",  // MOTD End
	"QUIT", // User disconnects
	"332",  // Channel topic
	"333",  // Time when topic was set
	"353",  // Reply to NAMES
	"355",  // Reply to NAMES -d
	"366",  // End of NAMES reply
	"MODE", // Channel Permissions
];

/**
 * Client to connect to Bancho over its IRC gateway
 * @property {nodesu.Client} osuApi Populated with a Nodesu client, if api key is passed to the constructor
 * @extends {EventEmitter}
 */
class BanchoClient extends EventEmitter {
	/**
	 * @constructor
	 * @param {string} username Username of the user to connect to Bancho
	 * @param {string} password IRC Password of the user to connect to Bancho (see https://osu.ppy.sh/p/irc)
	 * @param {string} [host="irc.ppy.sh"] Custom IRC host (for proxy-ing from a firewall for example)
	 * @param {number} [port=6667] Custom IRC port
	 * @param {string} [apiKey] osu! API key for API requests (see https://osu.ppy.sh/p/api)
	 */
	constructor(username, password, host = "irc.ppy.sh", port = 6667, apiKey) {
		super();
		if(!username || !password)
			throw new Error("You gotta gimme an username and a password to connect to Bancho dumbass");
		this.username = username;
		this.password = password;
		this.host = host;
		this.port = port;
		
		this.client = null;
		this.connectState = ConnectStates.Disconnected;
		this.reconnect = true;
		this.reconnectTimeout = null;
		this.connectCallback = null;
		this.joinCallbacks = [];
		this.partCallbacks = [];
		if(apiKey)
			this.osuApi = new Nodesu.Client(apiKey, {
				parseData: true
			});
		this.users = {};

		this.ignoreClose = false; // TODO: find something better than this solution. it works and is 100% reliable though! also eventually try with process.nextTick instead of setTimeout()
	}

	/**
	 * Before connecting, (re)defines the socket and all callbacks, because the client might get destroyed.
	 * @fires BanchoClient#error
	 * @private
	 */
	initSocket() {
		this.client = (new net.Socket()).setTimeout(60000);

		this.client.on("error", (err) => {
			/**
			 * An error has occured on the socket.
			 * @event BanchoClient#error
			 * @type {Error}
			 */
			this.emit("error", err);
			this.onClose(err);
		});
	
		this.client.on("close", () => {
			if(!this.ignoreClose)
				this.onClose(new Error("Connection closed"));
		});
		this.client.on("timeout", () => {
			const err = new Error("Timeout reached");
			this.ignoreClose = true;
			this.client.destroy();
			this.emit("error", err);
			this.onClose(err);
			setTimeout(() => this.ignoreClose = false, 1); // close event is apparently not fired immediately after calling destroy...
		});

		let unparsedData = "";
		this.client.on("data", (data) => {
			data = data.toString().replace(/\r/g, ""); // Sometimes, Bancho sends \r, and sometimes it doesn't.
			unparsedData += data;
			var index;
			while((index = unparsedData.indexOf("\n")) != -1) {
				var command = unparsedData.substring(0, index);
				unparsedData = unparsedData.substring(index + 1); // 1 is the length of \n, it being 1 special character and not 2.
				this.handleIrcCommand(command);
			}
		});
	}

	/**
	 * Send raw data over IRC.
	 * @param {string} data 
	 * @param {boolean} throwIfDisconnected Throws an Error if we're disconnected
	 * @private
	 */
	send(data, throwIfDisconnected = true) {
		if(this.connectState == ConnectStates.Connected || this.connectState == ConnectStates.Connecting)
			this.client.write(data + "\r\n");
		else if(throwIfDisconnected)
			throw new Error("Currently disconnected!");
	}

	/**
	 * Update connection state
	 * @param {ConnectState} newConnectState 
	 * @param {Error} err Error to emit with the new state
	 * @fires BanchoClient#connected
	 * @fires BanchoClient#disconnected
	 * @fires BanchoClient#state
	 * @private
	 */
	updateState(newConnectState, err) {
		if(newConnectState == this.connectState)
			return;
		if(newConnectState != ConnectStates.Disconnected &&
			newConnectState != ConnectStates.Reconnecting &&
			newConnectState != ConnectStates.Connecting &&
			newConnectState != ConnectStates.Connected)
			throw new Error("Invalid connect state!");
		this.connectState = newConnectState;
		if(this.isConnected())
			/**
			 * Connected to Bancho!
			 * @event BanchoClient#connected
			 */
			this.emit("connected");
		if(this.isDisconnected())
			/**
			 * Disconnected from Bancho!
			 * @event BanchoClient#disconnected
			 * @type {Error}
			 */
			this.emit("disconnected", err);
		/**
		 * ConnectState has updated! Emits with an error if any.
		 * @event BanchoClient#state
		 * @type {Error}
		 */
		this.emit("state", this.connectState, err);
	}

	/**
	 * Executed when connection is expectedly or not closed
	 * @param {Error} err 
	 * @private
	 */
	onClose(err) {
		if(this.connectState == ConnectStates.Disconnected)
			return;
		
		if(!this.reconnect)
			return this.updateState(ConnectStates.Disconnected, err);
		
		this.updateState(ConnectStates.Reconnecting, err);
		if(this.reconnectTimeout)
			clearTimeout(this.reconnectTimeout);
		
		this.reconnectTimeout = setTimeout(() => {
			if(this.reconnect)
				this.connect();
			this.reconnectTimeout = null;
		}, 5000);
	}

	/**
	 * Handle incoming IRC commands from Bancho
	 * @param {string} command 
	 * @private
	 */
	handleIrcCommand(command) {
		const splits = command.split(" ");

		if(ignoredSplits.indexOf(splits[1]) != -1)
			return;

		if(IrcCommands[splits[1]])
			(IrcCommands[splits[1]]).handleCommand(this, splits[1], splits);
		/*else
			console.log("Unknown command", command);*/
	}

	/**
	 * Get a BanchoUser instance for the specified user
	 * 
	 * @param {string} username 
	 * @returns {BanchoUser}
	 */
	getUser(username) {
		username = username.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		if(this.users[username])
			return this.users[username];
		else
			return (this.users[username] = new BanchoUser(this, username));
	}

	/**
	 * Sends a message to an user or a channel over IRC
	 * 
	 * @method
	 * @param {string} recipient Recipient of the message (either a channel or an username)
	 * @param {string} message Message
	 * @throws {Error} If we're disconnected or the user was not found (TODO: not implemented yet)
	 */
	sendMessage(recipient, message) {
		recipient = recipient.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		message.split("\n")[0];
		if(!this.isConnected()) {
			return;
		}
		this.send("PRIVMSG "+recipient+" :"+message, true);
	}

	/**
	 * Connects to Bancho, rejects an Error if connection fails
	 * 
	 * @method
	 * @async
	 * @return {Promise<null, Error>}
	 */
	connect() {
		return new Promise((resolve, reject) => {
			if(this.connectState == ConnectStates.Connected ||
				this.connectState == ConnectStates.Connecting)
				return reject(new Error("Already connected/connecting"));
			
			this.connectCallback = (err) => {
				if(err)
					return reject(err);
				resolve();
			};

			this.updateState(ConnectStates.Connecting);
			this.reconnect = true;
			this.initSocket();
			this.client.connect(this.port, this.host, () => {
				this.send("PASS "+this.password);
				this.send("USER "+this.username+" 0 * :"+this.username);
				this.send("NICK "+this.username);
			});
		});
	}

	/**
	 * Disconnects from Bancho
	 * 
	 * @method
	 */
	disconnect() {
		if(this.connectState == ConnectStates.Disconnected)
			return;
		
		if(this.isConnected())
			this.send("QUIT");
		else if(this.connectState == ConnectStates.Connecting)
			this.client.destroy();
		
		if(this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		this.updateState(ConnectStates.Disconnected);
		setTimeout(() => this.ignoreClose = false, 1);  // close event is apparently not fired immediately after calling destroy...	}
	}

	/**
	 * Join a channel, rejects an Error if joining fails or we're disconnected
	 * 
	 * @param {string} channelName Channel we want to join
	 * @returns {Promise<null, Error>}
	 */
	joinChannel(channelName) {
		return this._joinOrPartChannel("JOIN", channelName, this.joinCallbacks);
	}

	/**
	 * Leave a channel, rejects an Error if leaving fails or we're disconnected
	 * 
	 * @param {string} channelName Channel we want to leave
	 * @returns {Promise.<null, Error>}
	 */
	leaveChannel(channelName) {
		return this._joinOrPartChannel("PART", channelName, this.partCallbacks);
	}

	/**
	 * Sub-function used by {@link BanchoClient#joinChannel} and {@link BanchoClient#leaveChannel}
	 * 
	 * @param {string} action 
	 * @param {string} channelName 
	 * @param {Array.<function>} callbacks
	 * @private 
	 */
	_joinOrPartChannel(action, channelName, callbacks) {
		if(action != "JOIN" && action != "PART")
			throw new Error("learn to code dumbass.");
		
		return new Promise((resolve, reject) => {
			this.send(action+" "+channelName, true);
			callbacks[channelName] = (err) => {
				if(err)
					return reject(err);
				resolve();
			};
		});
	}

	/**
	 * When we've just connected, execute the connect callback
	 * 
	 * @param {any} arg Arg to pass to the callback
	 * @param {boolean} [erase=true] Erase the existing callback
	 * @param {boolean} [throwIfNonexistant=false] Throw an error if the callback doesn't exist
	 * @private
	 */
	callConnectCallback(arg, erase = true, throwIfNonexistant = false) {
		if(this.connectCallback != null) {
			this.connectCallback(arg);
			if(erase)
				this.connectCallback = null;
		}
		else if(throwIfNonexistant)
			throw new Error("Inexistant connect callback!");
	}

	/**
	 * Call a channel's callback after joining
	 * 
	 * @param {any} arg Arg to pass to the callback
	 * @param {any} channelName Channel we've joined
	 * @param {boolean} [erase=true] Erase the callback after execution?
	 * @param {boolean} [throwIfNonexistant=false] Throw if callback doesn't exist?
	 * @private
	 */
	callJoinCallback(arg, channelName, erase = true, throwIfNonexistant = false) {
		this._callChannelCallback(arg, this.joinCallbacks, channelName, erase, throwIfNonexistant);
	}

	/**
	 * Call a channel's callback after leaving
	 * 
	 * @param {any} arg Arg to pass to the callback
	 * @param {any} channelName Channel we've left
	 * @param {boolean} [erase=true] Erase the callback after execution?
	 * @param {boolean} [throwIfNonexistant=false] Throw if callback doesn't exist?
	 * @private
	 */
	callPartCallback(arg, channelName, erase = true, throwIfNonexistant = false) {
		this._callChannelCallback(arg, this.partCallbacks, channelName, erase, throwIfNonexistant);
	}

	/**
	 * When we've joined or left a channel, call its callback. Subfunction used by {@link BanchoClient#callJoinCallback} and {@link BanchoClient#callPartCallback}
	 * 
	 * @param {any} arg Arg to pass to the callback
	 * @param {any} callbacks Callbacks array
	 * @param {any} channelName Channel we've joined or left
	 * @param {boolean} [erase=true] Erase the callback after execution?
	 * @param {boolean} [throwIfNonexistant=false] Throw if callback doesn't exist?
	 * @private
	 */
	_callChannelCallback(arg, callbacks, channelName, erase = true, throwIfNonexistant = false) {
		const callback = callbacks[channelName];
		if(callback != null) {
			callback(arg);
			if(erase)
				callbacks[channelName] = null;
		}
		else if(throwIfNonexistant)
			throw new Error("Inexistant connect callback!");
	}

	/**
	 * Returns the current connection state.
	 * 
	 * @returns {Symbol} Current connection state. See ConnectStates
	 */
	getConnectState() {
		return this.connectState;
	}
	
	/**
	 * Returns true if the connectState is Connected, otherwise false.
	 * 
	 * @returns {boolean}
	 */
	isConnected() {
		return (this.connectState == ConnectStates.Connected);
	}

	/**
	 * Returns true if the connectState is Disconnected, otherwise false.
	 * 
	 * @returns {boolean}
	 */
	isDisconnected() {
		return (this.connectState == ConnectStates.Disconnected);
	}
}

module.exports = BanchoClient;