const net = require("net");
const EventEmitter = require("events").EventEmitter;
const CacheMap = require("./CacheMap");
const BanchoUser = require("./BanchoUser");
const BanchoChannel = require("./BanchoChannel");
const BanchoMultiplayerChannel = require("./BanchoMultiplayerChannel");
const ConnectStates = require("./Enums/ConnectStates");
const IrcCommands = require("./Enums/IrcCommands");
const Nodesu = require("nodesu");
const RateLimiterMemory = require("rate-limiter-flexible").RateLimiterMemory;
const RateLimiterQueue = require("rate-limiter-flexible").RateLimiterQueue;
const PrivateMessage = require("./PrivateMessage");
const ChannelMessage = require("./ChannelMessage");

const ignoredSplits = [
	"312",  // Whois server info (useless on Bancho)
	"333",  // Time when topic was set
	"366",  // End of NAMES reply
	"372",  // MOTD
	"375",  // MOTD Begin
	"376",  // MOTD End
];

/**
 * Client to connect to Bancho over its IRC gateway
 * @property {nodesu.Client} osuApi Populated with a Nodesu client, if api key is passed to the constructor
 * @extends {EventEmitter}
 */
class BanchoClient extends EventEmitter {
	/**
	 * @constructor
	 * @param {BanchoClientOptions} options
	 */
	constructor(optionsOrUsername = {}, password, host = "irc.ppy.sh", port = 6667, apiKey, limiterTimespan, limiterPrivate, limiterPublic) {
		super();
		if(optionsOrUsername != null && typeof optionsOrUsername == "string" && password != null && typeof password == "string") {
			process.emitWarning("You're using the deprecated way of constructing a BanchoClient object! Please refer to the documentation for the up-to-date constructor. This constructor will be removed in Release 1.0.0.");
			if(limiterTimespan || limiterPrivate || limiterPublic)
				process.emitWarning("Rate-limiter support has been removed from the deprecated constructor in v0.10. This warning will disappear in v1.0.0.");
			this.username = optionsOrUsername;
			this.password = password;
			this.host = host;
			this.port = port;
			if(apiKey)
				this.osuApi = new Nodesu.Client(apiKey, {
					parseData: true
				});
			this.rateLimiter = new RateLimiterQueue(new RateLimiterMemory({ points: limiterPrivate, duration: limiterTimespan / 1000 }));
		}
		else if(typeof optionsOrUsername == "object") {
			/**
			 * Options for a BanchoClient.
			 * @typedef {object} BanchoClientOptions
			 * @prop {string}      username Username of the user to connect to Bancho
			 * @prop {string}      password IRC Password of the user to connect to Bancho (see https://osu.ppy.sh/p/irc)
			 * @prop {string}      [host="irc.ppy.sh"] Custom IRC host (for proxy-ing through a firewall for example)
			 * @prop {number}      [port=6667] Custom IRC port
			 * @prop {string}      [apiKey] osu! API key for API requests (see https://osu.ppy.sh/p/api). WARNING: Multiplayer lobbies won't work without an API key!
			 * @prop {RateLimiter} [rateLimiter] Instance of RateLimiter from the `limiter` npm module for outgoing Bancho messages. Default is safe for normal users in private messages (PM and #multiplayer channels), bots are not supposed to send public messages. Can be disabled by setting to `null`.
			 * @prop {boolean}     [botAccount=false] Apply bot account rate-limits to the default RateLimiter instance if true (see https://osu.ppy.sh/wiki/en/Bot_account).
			 * @prop {number}      [gamemode=null] Gamemode id to fetch users with. Defaults to null
			 */
			const options = {
				host: "irc.ppy.sh",
				port: 6667,
				limiterTimespan: 12500,
				limiterPrivate: 9,
				limiterPublic: undefined,
				botAccount: false,
				gamemode: null,
			};
			Object.assign(options, optionsOrUsername);
			if(options.rateLimiter && options.botAccount)
				process.emitWarning("You have set both a custom `rateLimiter` and `botAccount`. Your custom `rateLimiter` will take precedence. Remove `botAccount` to suppress this warning (no side-effect).");
			if(options.rateLimiter && (optionsOrUsername.limiterTimespan || optionsOrUsername.limiterPrivate))
				process.emitWarning("The `limiterTimespan` and `limiterPrivate` options have been deprecated in v0.10 and the custom `rateLimiter` you specified will take precedence. This warning will be removed in v1.0.0.");
			if(options.rateLimiter === undefined) {
				if(optionsOrUsername.limiterPublic)
					process.emitWarning("Public rate-limiter has been removed in v0.10. Bots are not supposed to send messages in public channels, only in PMs and #multiplayer. This warning will disappear in v1.0.0.");
				if(optionsOrUsername.limiterTimespan || optionsOrUsername.limiterPrivate) {
					process.emitWarning("The `limiterTimespan` and `limiterPrivate` options have been deprecated in v0.10. Support for these and this warning will be removed in v1.0.0.");
					if(options.botAccount)
						process.emitWarning("You have set both deprecated custom rate limits and `botAccount`. The default bot accounts limits will take precedence. This warning will be removed in v1.0.0.");
				}

				const limiterPrivate = options.botAccount ? 298 : options.limiterPrivate;
				const limiterTimespan = options.botAccount ? 62500 : options.limiterTimespan;
				options.rateLimiter = new RateLimiterQueue(new RateLimiterMemory({ points: limiterPrivate, duration: limiterTimespan / 1000 }));
			}

			this.username = options.username;
			this.password = options.password;
			this.host = options.host;
			this.port = options.port;
			if(options.apiKey) {
				this.osuApi = new Nodesu.Client(options.apiKey, {
					parseData: true
				});
				this.gamemode = options.gamemode;
			}
			this.rateLimiter = options.rateLimiter;
		}
		this.setMaxListeners(50);
		if(!this.username || !this.password)
			throw new Error("You gotta gimme an username and a password to connect to Bancho dumbass");
		
		this.client = null;
		this.connectState = ConnectStates.Disconnected;
		this.reconnect = true;
		this.reconnectTimeout = null;
		this.connectCallback = null;
		this.joinCallbacks = [];
		this.partCallbacks = [];
		this.users = new CacheMap();
		this.usersById = new CacheMap();
		this.channels = {};
		this.messagesQueue = [];

		// Register our own error listener so there are no uncaught exceptions
		// for exceptions WE throw for the end-user that don't need to be caught (such as timeouts)
		this.on("error", function() { });

		this.ignoreClose = false; // TODO: find something better than this solution. it works and is 100% reliable though! also eventually try with process.nextTick instead of setTimeout()
	}

	async processMessagesQueue() {
		while(this.messagesQueue[0]) {
			const { message, resolve, reject } = this.messagesQueue[0];
			try {
				if(!this.isConnected())
					throw new Error("Currently disconnected!");

				if(this.rateLimiter)
					await this.rateLimiter.removeTokens(1);
				if(!this.isConnected())
					throw new Error("Currently disconnected!");

				let name = null;
				if(message.recipient instanceof BanchoUser)
					name = message.recipient.ircUsername;
				else if(message.recipient instanceof BanchoChannel)
					name = message.recipient.name;
				else
					throw new Error("Recipient isn't a BanchoUser or BanchoChannel!");
				name = name.replace(/ /g, "_").split("\n")[0].substring(0, 28);
				const content = message.message.split("\n")[0];

				this.send(`PRIVMSG ${name} :${content}`, false);
				if(message.recipient instanceof BanchoUser)
					this.emit("PM", new PrivateMessage(this.getSelf(), content, true, message.recipient));
				else if(message.recipient instanceof BanchoChannel)
					this.emit("CM", new ChannelMessage(this.getSelf(), content, true, message.recipient));

				this.messagesQueue.shift();
				resolve();
			} catch(e) {
				reject(e);
			}
		}
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
		// Every currently joined channel should be considered left.
		for(const channel of Object.values(this.channels))
			if(channel.joined)
				IrcCommands.PART.emit(this, this.getSelf(), channel);

		if(this.connectState == ConnectStates.Disconnected)
			return;
		
		if(!this.reconnect)
			return this.updateState(ConnectStates.Disconnected, err);
		
		this.updateState(ConnectStates.Reconnecting, err);
		if(this.reconnectTimeout)
			clearTimeout(this.reconnectTimeout);
		
		this.reconnectTimeout = setTimeout(() => {
			if(this.reconnect) {
				const oldCallback = this.connectCallback;
				this.connect();
				this.connectCallback = oldCallback;
			}
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

		if(splits[0] == "PING") {
			splits.shift();
			this.send("PONG "+splits.join(" "));
		}
		else if(IrcCommands[splits[1]])
			(IrcCommands[splits[1]]).handleCommand(this, splits[1], splits);
		/*else
			console.log("Unknown command", command);*/
	}

	/**
	 * Get a BanchoUser instance for the specified username
	 * 
	 * @param {string} username 
	 * @returns {BanchoUser}
	 */
	getUser(username) {
		username = username.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		let user = this.users.get(username.toLowerCase());
		if(!user) {
			user = new BanchoUser(this, username);
			this.users.set(username.toLowerCase(), user);
		}
		return user;
	}

	/**
	 * Get a BanchoUser representing ourself
	 */
	getSelf() {
		return this.getUser(this.username);
	}

	/**
	 * Get a BanchoUser instance for the specified user id
	 * 
	 * @async
	 * @param {number} userid
	 * @returns {Promise<BanchoUser>}
	 */
	getUserById(userid) {
		return new Promise((resolve, reject) => {
			if(isNaN(userid))
				reject(new Error("id needs to be a number!"));
			let user = this.usersById.get(userid);
			if(user)
				resolve(user);
			else
				this.osuApi.user.get(userid, this.gamemode, null, Nodesu.LookupType.id).then((apiUser) => {
					user = this.getUser(apiUser.username);
					user.updateFromAPI(apiUser);
					resolve(user);
				}, reject);
		});
	}

	/**
	 * Get a BanchoChannel instance for the specified name
	 * 
	 * @param {string} channelName 
	 * @returns {BanchoChannel|BanchoMultiplayerChannel}
	 */
	getChannel(channelName) {
		if(channelName.indexOf("#") != 0 || channelName.indexOf(",") != -1 || channelName.indexOf("") != -1)
			throw new Error("Invalid channel name!");
		let channel = this.channels[channelName];
		if(!channel) {
			channel = (channelName.indexOf("#mp_") == 0 && this.osuApi != null) ? new BanchoMultiplayerChannel(this, channelName) : new BanchoChannel(this, channelName);
			this.channels[channelName] = channel;
		}
		return channel;
	}

	/**
	 * Creates a multiplayer lobby and return its channel.
	 * 
	 * @async
	 * @param {string} name Lobby name
	 * @param {boolean} [privateLobby] Mark as private
	 * @returns {BanchoMultiplayerChannel}
	 */
	createLobby(name, privateLobby = false) {
		return new Promise((resolve, reject) => {
			if(this.osuApi == null)
				throw new Error("bancho.js needs an API key for full multiplayer lobbies support!");
			if(!name || !name.trim())
				throw new Error("Empty name!");
			name = name.trim();

			const BanchoBot = this.getUser("BanchoBot");
			const command = !privateLobby ? "make" : "makeprivate";
			BanchoBot.sendMessage("!mp "+command+" "+name).then(() => {
				setTimeout(() => {
					reject(new Error("Multiplayer lobby creation timeout has been reached!"));
				}, 10000);
				const matchCreatedRegex = /Created the tournament match https:\/\/osu\.ppy\.sh\/mp\/(\d+) (.+)/;
				const listener = (msg) => {
					const m = matchCreatedRegex.exec(msg.message);
					if(!m || m[2] != name)
						return;
	
					BanchoBot.removeListener("message", listener);
					const channel = this.getChannel("#mp_"+Number(m[1]));
					if(!channel.lobby)
						return reject(new Error("Not a multiplayer channel?! This shouldn't happen..."));
					resolve(channel);
				};
				BanchoBot.on("message", listener);
			});
		});
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