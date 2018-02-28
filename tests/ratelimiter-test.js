const logger = require("./log");

const banchojs = require("..");
const client = new banchojs.BanchoClient(require("../config.json"));

client.connect().then(() => {
	logger.info("We're online!");

	let messagesSentInLastSecond = 0;
	setInterval(() => {
		logger.info("Messages sent in the last second: "+messagesSentInLastSecond);
		messagesSentInLastSecond = 0;
	}, 1000);

	for(let i = 0; i < 450; i++)
		client.getSelf().sendMessage("bancho.js rate-limiting test "+i+" "+Math.random().toString(36).substring(8))
			.then(() => messagesSentInLastSecond++)
			.catch((err) => {
				logger.error("An error occured:");
				logger.error(err);
				logger.error("Aborting...");
				process.exit(1);
			});
});