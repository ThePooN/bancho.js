const IrcCommand = require("../IrcCommand");

class JoinCommand extends IrcCommand {
	constructor() {
		super();
		this.callback = "callJoinCallback";
	}

	handleCommand(client, command, splits) {
		const username = (splits[0].split("!"))[0].substr(1);
		const channel = splits[2].substr(1);
		client.emit(splits[1], {
			username: username, channel: channel
		});
		
		if(client.username == username)
			client[this.callback](null, channel, true);
	}
}

module.exports = JoinCommand;