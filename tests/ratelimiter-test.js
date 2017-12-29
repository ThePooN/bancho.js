const logger = require("./log");

const banchojs = require("..");
const config = require("../config.json");
const client = new banchojs.BanchoClient(config["irc_user"], config["irc_pass"], config["irc_host"], config["irc_port"], config["api_key"]);

client.connect().then(() => {
	logger.info("We're online!");

	let messagesSentInLastSecond = 0;
	setInterval(() => {
		logger.info("Messages sent in the last second: "+messagesSentInLastSecond);
		messagesSentInLastSecond = 0;
	}, 1000);

	for(let i = 0; i < 450; i++)
		client.getUser(config["irc_user"]).sendMessage("bancho.js rate-limiting test "+i+" "+Math.random().toString(36).substring(8))
			.then(() => messagesSentInLastSecond++)
			.catch((err) => {
				logger.error("An error occured:");
				logger.error(err);
				logger.error("Aborting...");
				process.exit(1);
			});
});