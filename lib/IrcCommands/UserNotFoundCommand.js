const IrcCommand = require("../IrcCommand");

/**
 * User not found IRC command
 * @description Received when we tried to execute something on an user that is offline
 * @fires BanchoClient#nouser
 * @extends {IrcCommand}
 * @private
 */
class UserNotFoundCommand extends IrcCommand {
	handleCommand(client, command, splits) {
		/** 
		 * Fired when a no user error is received from Bancho.
		 * 
		 * @event BanchoClient#nouser 
		 * @type {BanchoUser}
		 */
		const user = client.getUser(splits[3]);
		client.emit("nouser", user);
		if(user.whoisUserNotFoundCallback != null)
			user.whoisUserNotFoundCallback();
	}
}

module.exports = UserNotFoundCommand;