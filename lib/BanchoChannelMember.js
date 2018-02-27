const modes = require("./Enums/BanchoChannelMemberModes");

/**
 * A Bancho channel member
 * @prop {BanchoChannel} channel
 * @prop {BanchoUser} user
 * @prop {BanchoChannelMemberMode} mode
 */
class BanchoChannelMember {
	constructor(client, channel, userString) {
		this.channel = channel;
		let username = userString;
		if(userString.indexOf("@") == 0) {
			this.mode = modes.o;
			username = username.substr(1, username.length - 1);
		}
		else if(userString.indexOf("+") == 0) {
			this.mode = modes.v;
			username = username.substr(1, username.length - 1);
		}
		else
			this.mode = null;
		this.user = client.getUser(username);
	}
}

module.exports = BanchoChannelMember;