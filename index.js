const net = require("net");
const EventEmitter = require("events").EventEmitter;
const util = require("util");

const connectStates = exports.connectStates = {
	Disconnected: 0,
	Connecting: 1,
	Reconnecting: 2,
	Connected: 3
};

exports.Client = function(irc_host, irc_port, irc_username, irc_password) {
	var me = this;
	EventEmitter.call(me);
	var client = null;
	var connectState = connectStates.Disconnected;
	var reconnect = true;
	if(!irc_port)
		irc_port = 6667;

	let ignoreClose = false;
	function initSocket() {
		client = (new net.Socket()).setTimeout(60000);

		client.on("error", (err) => {
			me.emit("error", err);
			onClose(err);
		});
	
		client.on("close", () => {
			if(!ignoreClose)
				onClose(new Error("Connection closed"));
		});
		client.on("timeout", () => {
			const err = new Error("Timeout reached");
			ignoreClose = true;
			client.destroy();
			me.emit("error", err);
			onClose(err);
			setTimeout(() => ignoreClose = false, 1); // close event is apparently not fired immediately after calling destroy...
		});

		var unparsedData = "";
		client.on("data", function(data) {
			data = data.toString().replace(/\r/g, ""); // Sometimes, Bancho sends \r, and sometimes it doesn't.
			unparsedData += data;
			var index;
			while((index = unparsedData.indexOf("\n")) != -1) {
				var command = unparsedData.substring(0, index);
				unparsedData = unparsedData.substring(index + 1); // 1 is the length of \n, it being 1 special character and not 2.
				handleIrcCommand(command);
			}
		});
	}

	function send(data) {
		if(connectState == connectStates.Connected || connectState == connectStates.Connecting)
			client.write(data + "\r\n");
	}
	
	me.getState = () => connectState;
	me.isConnected = () => (connectState == connectStates.Connected);
	me.isDisconnected = () => (connectState == connectStates.Disconnected);

	function updateState(newConnectState, err) {
		if(newConnectState == connectState)
			return;
		if(newConnectState != connectStates.Disconnected && newConnectState != connectStates.Reconnecting && newConnectState != connectStates.Connecting && newConnectState != connectStates.Connected)
			throw new Error("Invalid connect state!");
		connectState = newConnectState;
		if(me.isConnected())
			me.emit("connected");
		if(me.isDisconnected())
			me.emit("disconnected", err);
		me.emit("state", connectState, err);
	}

	let reconnectTimeout = null;
	function onClose(err) {
		if(connectState == connectStates.Disconnected)
			return;
		if(!reconnect)
			return updateState(connectStates.Disconnected, err);

		updateState(connectStates.Reconnecting, err);
		if(reconnectTimeout)
			clearTimeout(reconnectTimeout);
		reconnectTimeout = setTimeout(() => {
			if(reconnect)
				me.connect();
			reconnectTimeout = null;
		}, 5000);
	}

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

	const joinCallbacks = {};
	const leaveCallbacks = {};
	function handleIrcCommand(command) {
		const split = command.split(" ");

		for(const ignoredSplit of ignoredSplits)
			if(split[1] == ignoredSplit)
				return;

		if(split[0] == "PING")
			send("PONG "+split[1]);
		else if(split[1] == "001") { // Welcome IRC message
			updateState(connectStates.Connected);
			if(connectCallback != null) {
				connectCallback(false);
				connectCallback = null;
			}
		}
		else if(split[1] == "464") { // Bad auth token
			reconnect = false;
			updateState(connectStates.Disconnected, new Error("Bancho Auth failed"));
			if(connectCallback != null) {
				connectCallback(new Error("Bancho Auth failed"));
				connectCallback = null;
			}
		}
		else if(split[1] == "JOIN" || split[1] == "PART") {
			const username = (split[0].split("!"))[0].substr(1);
			const channel = split[2].substr(1);
			me.emit(split[1], {
				username: username, channel: channel
			});
			const callbacks = (split[1] == "JOIN") ? joinCallbacks : leaveCallbacks;
			if(username == irc_username && callbacks[channel])
				callbacks[channel]();
		}
		else if(split[1] == "PRIVMSG") {
			const user = split[0].substr(1, split[0].indexOf("!") - 1);
			const channel = split[2];
			const message = split.slice(3).join(" ").substr(1);
			if(channel == irc_username)
				me.emit("PM", {
					user: user,
					message: message
				});
			else
				me.emit("CM", {
					user: user,
					channel: channel,
					message: message
				});
		}
		else if(split[1] == "403") { // Channel not found
			me.emit("nochannel", split[3]);
			if(joinCallbacks[split[3]])
				joinCallbacks[split[3]](new Error("No such channel: "+split[3]));
		}
		/*else
			console.log("Unknown command", command);*/
	}

	me.sendMessage = function(username, message, callback) {
		username = username.replace(/ /g, "_").split("\n")[0].substring(0, 28);
		message = message.split("\n")[0];
		if(connectState != connectStates.Connected)
			if(callback)
				return callback(true);
			else
				return;
		send("PRIVMSG "+username+" :"+message);
		if(callback)
			callback(false);
	};

	var connectCallback = null;
	me.connect = () => new Promise((resolve, reject) => {
		if(connectState == connectStates.Connected || connectState == connectStates.Connecting)
			return reject("Already connected/connecting");

		connectCallback = function(err) {
			if(!err)
				resolve();
			if(err)
				reject(err);
		};

		updateState(connectStates.Connecting);
		reconnect = true;
		initSocket();
		client.connect(irc_port, irc_host, function() {
			send("PASS "+irc_password);
			send("USER "+irc_username+" 0 * :"+irc_username);
			send("NICK "+irc_username);
		});
	});

	me.disconnect = function() {
		reconnect = false;
		ignoreClose = true;
		if(client != null)
			client.destroy();
		if(reconnectTimeout) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
		updateState(connectStates.Disconnected);
		setTimeout(() => ignoreClose = false, 1);  // close event is apparently not fired immediately after calling destroy...
	};

	me.joinChannel = (channel) => {
		return new Promise((resolve, reject) => {
			send("JOIN " + channel);
			joinCallbacks[channel] = (err) => {
				if(err)
					return reject(err);
				resolve();
			};
		});
	};
	me.leaveChannel = (channel) => {
		return new Promise((resolve, reject) => {
			send("PART " + channel);
			leaveCallbacks[channel] = (err) => {
				if(err)
					return reject();
				resolve();
			}
		});
	};
};

util.inherits(exports.Client, EventEmitter);