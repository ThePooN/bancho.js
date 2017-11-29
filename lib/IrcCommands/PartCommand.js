const JoinCommand = require("./JoinCommand");

class PartCommand extends JoinCommand {
	constructor() {
		super();
		this.callback = "callPartCallback";
	}
}

module.exports = PartCommand;