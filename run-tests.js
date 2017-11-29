const fs = require("fs");
const log = module.exports.log = require("log-fancy")("tests");
const Banchojs = require("./");
const config = module.exports.config = require("./config.json");

log.info("Connecting to Bancho...");
const client = module.exports.client = new Banchojs.Client(config["irc_user"], config["irc_pass"], config["irc_host"], config["irc_port"]);
const connectStartTime = Date.now();
client.connect().then(async () => {
	log.info("Connected to Bancho in "+(Date.now()-connectStartTime)+"ms!");
	log.info("Listing tests...");
	const files = fs.readdirSync("./tests");
	const tests = [];
	for(const fileName of files) {
		if(fileName.indexOf(".js") == fileName.length - 3)
			tests.push(require("./tests/"+fileName));
	}
	log.info("About to execute "+tests.length+" tests...");

	for(const test of tests) {
		log.info("Starting test "+test.name);
		try {
			const startTime = Date.now();
			await test.run();
			log.info("Successfully ran test "+test.name+" in "+(Date.now()-startTime)+"ms");
		}
		catch(err) {
			log.fatal("An error was encountered when running test "+test.name+"!", err);
		}
	}

	log.info("All tests have been ran successfully!");
	process.exit(0);
}, (err) => {
	log.error("Error while connecting to Bancho!");
	log.error(err);
	log.error("Now aborting");
});