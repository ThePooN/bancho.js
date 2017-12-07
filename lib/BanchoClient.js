const net = require("net");
const EventEmitter = require("events").EventEmitter;

const ConnectStates = require("./ConnectStates");
const IrcCommands = require("./IrcCommands");

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

class BanchoClient extends EventEmitter {
	constructor(username, password, host = "irc.ppy.sh", port = 6667) {
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

		this.ignoreClose = false; // TODO: find something better than this solution. it works and is 100% reliable though! also eventually try with process.nextTick instead of setTimeout()
	}

	initSocket() {
		this.client = (new net.Socket()).setTimeout(60000);

		this.client.on("error", (err) => {
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

	send(data, throwIfDisconnected = true) {
		if(this.connectState == ConnectStates.Connected || this.connectState == ConnectStates.Connecting)
			this.client.write(data + "\r\n");
		else if(throwIfDisconnected)
			throw new Error("Currently disconnected!");
	}

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
			this.emit("connected");
		if(this.isDisconnected())
			this.emit("disconnected", err);
		this.emit("state", this.connectState, err);
	}

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

	handleIrcCommand(command) {
		const splits = command.split(" ");

		if(ignoredSplits.indexOf(splits[1]) != -1)
			return;

		if(IrcCommands[splits[1]])
			(IrcCommands[splits[1]]).handleCommand(this, splits[1], splits);
		/*else
			console.log("Unknown command", command);*/
	}

	sendMessage(username, message, callback) {
		username = username.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		message.split("\n")[0];
		if(!this.isConnected()) {
			if(callback)
				callback(true);
			return;
		}
		this.send("PRIVMSG "+username+" :"+message);
		if(callback)
			callback(false);
	}

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

	joinChannel(channelName) {
		return this._joinOrPartChannel("JOIN", channelName, this.joinCallbacks);
	}

	leaveChannel(channelName) {
		return this._joinOrPartChannel("PART", channelName, this.partCallbacks);
	}

	_joinOrPartChannel(action, channelName, callbacks) {
		if(action != "JOIN" && action != "PART")
			throw new Error("learn to code dumbass.");
		
		return new Promise((resolve, reject) => {
			this.send(action+" "+channelName);
			callbacks[channelName] = (err) => {
				if(err)
					return reject(err);
				resolve();
			};
		});
	}

	callConnectCallback(arg, erase = true, throwIfNonexistant = false) {
		if(this.connectCallback != null) {
			this.connectCallback(arg);
			if(erase)
				this.connectCallback = null;
		}
		else if(throwIfNonexistant)
			throw new Error("Inexistant connect callback!");
	}

	callJoinCallback(arg, channelName, erase = true, throwIfNonexistant = false) {
		this._callChannelCallback(arg, this.joinCallbacks, channelName, erase, throwIfNonexistant);
	}

	callPartCallback(arg, channelName, erase = true, throwIfNonexistant = false) {
		this._callChannelCallback(arg, this.partCallbacks, channelName, erase, throwIfNonexistant);
	}

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
	
	isConnected() {
		return (this.connectState == ConnectStates.Connected);
	}
	
	isDisconnected() {
		return (this.connectState == ConnectStates.Disconnected);
	}
}

module.exports = BanchoClient;