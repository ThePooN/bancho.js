/* eslint-disable no-console */

const fs = require("fs");
const log = module.exports.log = require("./log");
const Banchojs = require("../");
const TestGoals = require("./TestGoals");
const config = module.exports.config = require("../config.json");

log.info("Connecting to Bancho...");
const client = module.exports.client = new Banchojs.Client(config);
const fulFilledGoals = [];

const connectStartTime = Date.now();

client.connect().then(async () => {
	log.info("Connected to Bancho in "+(Date.now()-connectStartTime)+"ms!");
	console.log();
	log.info("Listing units...");
	const files = fs.readdirSync("./tests/units");
	const units = [];
	for(const fileName of files) {
		if(fileName.indexOf(".js") == fileName.length - 3)
			units.push(require("./units/"+fileName));
	}
	log.info("About to execute "+units.length+" units...");
	console.log();

	for(const unit of units) {
		log.info("Starting unit "+unit.name);
		try {
			const startTime = Date.now();
			await unit.run();
			log.info("Successfully ran unit "+unit.name+" in "+(Date.now()-startTime)+"ms");
			console.log();
		}
		catch(err) {
			log.fatal("An error was encountered when running unit "+unit.name+"!");
			log.fatal(err.stack);
		}
	}

	log.info("All units have been ran!");

	const missingGoals = getMissingGoals();
	if(missingGoals.length > 0) {
		let msg = "Not all goals have been met! Missing goals: ";
		for(const missingGoal of missingGoals)
			msg += missingGoal.toString();
		log.error(msg);
		process.exit(1);
	}

	log.info("All goals have been met! Exiting...");
	process.exit(0);
}, (err) => {
	log.error("Error while connecting to Bancho!");
	log.error(err);
	log.error("Now aborting");
	process.exit(1);
});

module.exports.fulFillGoal = function(goal) {
	if(fulFilledGoals.indexOf(goal) == -1 && doesGoalExist(goal))
		fulFilledGoals.push(goal);
};

const doesGoalExist = (testedGoal) => {
	for(const goalName in TestGoals) {
		const goal = TestGoals[goalName];
		if(goal == testedGoal)
			return true;
	}
	return false;
};

const getMissingGoals = () => {
	const missingGoals = [];
	for(const goalName in TestGoals) {
		const goal = TestGoals[goalName];
		if(fulFilledGoals.indexOf(goal) == -1)
			missingGoals.push(goal);
	}
	return missingGoals;
};