const Message = require("./Message");

class ChannelMessage extends Message {
	constructor(user, message, channel) {
		super(user, message);
		this.channel = channel;
	}
}

module.exports = ChannelMessage;