const BanchoMod = require("../BanchoMod");

const Enum = Object.freeze({
	None: new BanchoMod(0, "none", "None"),
	NoFail: new BanchoMod(1, "nf", "NoFail"),
	Easy: new BanchoMod(2, "ez", "Easy"),
	Hidden: new BanchoMod(8, "hd", "Hidden"),
	HardRock: new BanchoMod(16, "hr", "HardRock"),
	SuddenDeath: new BanchoMod(32, "sd", "SuddenDeath"),
	DoubleTime: new BanchoMod(64, "dt", "DoubleTime"),
	Relax: new BanchoMod(128, "rx", "Relax"),
	HalfTime: new BanchoMod(256, "ht", "HalfTime"),
	Nightcore: new BanchoMod(512, "nc", "Nightcore"),
	Flashlight: new BanchoMod(1024, "fl", "Flashlight"),
	Autoplay: new BanchoMod(2048, "at", "Auto"),
	SpunOut: new BanchoMod(4096, "so", "SpunOut"),
	Relax2: new BanchoMod(8192, "ap", "Relax2"),
	Perfect: new BanchoMod(16384, "pf", "Perfect"),
	Key4: new BanchoMod(32768, "k4", "Key4"),
	Key5: new BanchoMod(65536, "k5", "Key5"),
	Key6: new BanchoMod(131072, "k6", "Key6"),
	Key7: new BanchoMod(262144, "k7", "Key7"),
	Key8: new BanchoMod(524288, "k8", "Key8"),
	FadeIn: new BanchoMod(1048576, "fi", "FadeIn"),
	Random: new BanchoMod(2097152, "rn", "Random"),
	LastMod: new BanchoMod(4194304, "lm", "LastMod"),
	Key9: new BanchoMod(16777216, "k9", "Key9"),
	Key10: new BanchoMod(33554432, "k10", "Key10"),
	Key1: new BanchoMod(67108864, "k1", "Key1"),
	Key3: new BanchoMod(134217728, "k3", "Key3"),
	Key2: new BanchoMod(268435456, "k2", "Key2")
});

/**
 * Static class with a property for each mods and methods to manipulate them.
 * 
 * @class BanchoMods
 * @prop {BanchoMod} None
 * @prop {BanchoMod} NoFail
 * @prop {BanchoMod} Easy
 * @prop {BanchoMod} Hidden
 * @prop {BanchoMod} HardRock
 * @prop {BanchoMod} SuddenDeath
 * @prop {BanchoMod} DoubleTime
 * @prop {BanchoMod} Relax
 * @prop {BanchoMod} HalfTime
 * @prop {BanchoMod} Nightcore
 * @prop {BanchoMod} Flashlight
 * @prop {BanchoMod} Autoplay
 * @prop {BanchoMod} SpunOut
 * @prop {BanchoMod} Relax2
 * @prop {BanchoMod} Perfect
 * @prop {BanchoMod} Key4
 * @prop {BanchoMod} Key5
 * @prop {BanchoMod} Key6
 * @prop {BanchoMod} Key7
 * @prop {BanchoMod} Key8
 * @prop {BanchoMod} FadeIn
 * @prop {BanchoMod} Random
 * @prop {BanchoMod} LastMod
 * @prop {BanchoMod} Key9
 * @prop {BanchoMod} Key10
 * @prop {BanchoMod} Key1
 * @prop {BanchoMod} Key3
 * @prop {BanchoMod} Key2
 */
class BanchoMods {
	constructor() {
		Object.assign(this, Enum);
		this.enum = Enum;
	}

	/**
	 * Parse mods in their bit flags form and returns them in an array of BanchoMods.
	 * 
	 * @param {number} bits Mods combination in bit flags form
	 * @param {boolean} [returnNone=true] Returns [BanchoMods.None] if bits is equal to 0
	 * @returns {BanchoMods[]}
	 */
	parseBitFlags(bits, returnNone = true) {
		if(bits == 0)
			if(returnNone)
				return [Enum.None];
			else
				return [];

		const mods = [];
		for(const mod of Object.values(Enum))
			if(mod != Enum.None && (bits & mod.enumValue) == mod.enumValue)
				mods.push(mod);

		return mods;
	}

	/**
	 * Returns a bits flag integer representing the passed mods.
	 * 
	 * @param {BanchoMods[]} mods
	 * @returns {number}
	 */
	returnBitFlags(mods) {
		let ret = 0;
		for(const mod of mods)
			ret += mod.enumValue;
		return ret;
	}

	/**
	 * Parse a mod in its short form (eg. HD). Case insensitive.
	 * 
	 * @param {String} string
	 * @returns {BanchoMod}
	 */
	parseShortMod(string) {
		for(const modName in Enum)
			if(Enum[modName].shortMod.toLowerCase() == string.toLowerCase())
				return Enum[modName];
		return null;
	}

	/**
	 * Parse a short mods combination as a string or array of strings.
	 * Accepted string formats: "HDDT", "HD, DT", "HD DT". The amount of spaces doesn't matter. Allowed seperators are comma and spaces.
	 * @param {string|string[]} input 
	 */
	parseShortMods(input) {
		let splits = [];
		if(Array.isArray(input))
			splits = input;
		else if(typeof input == "string") {
			if(input.indexOf(",") != -1)
				splits = input.split(",");
			else if(input.indexOf(" ") != -1)
				splits = input.split(" ");
			else if(input.length % 2 == 0) {
				splits[0] = "";
				for(const char of input)
					if(splits[splits.length - 1].length < 2)
						splits[splits.length - 1] += char;
					else
						splits[splits.length] = char;
			}
			else
				return [input];
		}
		else
			return null;

		const mods = [];
		for(let i = 0; i < splits.length; i++) {
			const shortMod = this.parseShortMod(splits[i].trim());
			if(shortMod)
				mods.push(shortMod);
		}
		return mods;
	}

	/**
	 * Parse a mod in its long form (eg. Hidden). Case insensitive.
	 * 
	 * @param {String} string
	 * @returns {BanchoMod}
	 */
	parseLongMod(string) {
		for(const modName in Enum)
			if(Enum[modName].longMod.toLowerCase() == string.toLowerCase())
				return Enum[modName];
		return null;
	}

	/**
	 * Parse a long mods combination as a string or array of strings.
	 * Accepted string formats: "Hidden, DoubleTime", "Hidden DoubleTime". The amount of spaces doesn't matter. Allowed seperators are comma and spaces.
	 * @param {string|string[]} input 
	 */
	parseLongMods(input) {
		let splits = [];
		if(Array.isArray(input))
			splits = input;
		else if(typeof input == "string") {
			if(input.indexOf(",") != -1)
				splits = input.split(",");
			else if(input.indexOf(" ") != -1)
				splits = input.split(" ");
			else
				splits = [input];
		}
		else
			return null;

		const mods = [];
		for(let i = 0; i < splits.length; i++) {
			const longMod = this.parseLongMod(splits[i].trim());
			if(longMod)
				mods.push(longMod);
		}
		return mods;
	}
}

module.exports = new BanchoMods();