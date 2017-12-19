/**
 * A test unit
 * 
 * @private
 * @property {string} name
 * @property {BanchoClient} client
 */
class TestUnit {
	constructor() {
		this.name = "Rename Me!";
		this.client = require("./run.js").client;
		this.config = require("./run.js").config;
		this.log = require("./run.js").log;
		this.fulFillGoal = require("./run.js").fulFillGoal;
	}
	run() {
		throw new Error("Unimplemented unit!");
	}
}

module.exports.TestUnit = TestUnit;