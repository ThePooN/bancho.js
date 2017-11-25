class Test {
	constructor() {
		this.name = "Rename Me!";
		this.client = require("./run-tests.js").client;
		this.config = require("./run-tests.js").config;
		this.log = require("./run-tests.js").log;
	}
	run() {
		throw new Error("Unimplemented test!");
	}
}

module.exports.Test = Test;