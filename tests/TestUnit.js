/**
 * A test unit
 * 
 * @private
 * @prop {string} name
 * @prop {BanchoClient} client
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
	
	assertTrue(obj) {
		this.assertEquals(true, obj);
	}
	assertFalse(obj) {
		this.assertEquals(false, obj);
	}
	assertEquals(expected, obj) {
		if(obj !== expected)
			throw new Error("Invalid value: expected "+expected+", got "+obj+"!");
	}
	assertArrayEquals(expected, obj) {
		if(expected.length != obj.length)
			throw new Error("Invalid value: expected an array of "+expected.length+" objects, got "+obj.length+"!");
		for(const entry in Object.entries(expected))
			if(expected[entry[0]] != obj[entry[0]])
				throw new Error("Invalid value at index "+entry[0]+": expected "+entry[1]+", got "+obj[entry[0]]+"!");
	}
}

module.exports.TestUnit = TestUnit;