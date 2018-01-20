const BanchoMod = require("./BanchoMod");

/**
 * Enum with osu! mods
 * @enum
 * @type {BanchoMod}
 * @readonly
 */
const BanchoMods = {
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
};

module.exports = {
	enum: Object.freeze(BanchoMods),
	parseShortMod: function(string) {
		for(const modName in BanchoMods)
			if(BanchoMods[modName].longMod == string)
				return BanchoMods[modName];
		return null;
	},
	parseShortMods: function(string) {
		if(typeof string != "string")
			return null;
		const splits = string.split(" ");
		const mods = [];
		for(let i = 0; i < splits.length; i++) {
			const longMod = this.parseShortMod(splits[i]);
			if(longMod)
				mods.push();
		}
		return mods;
	},
	parseLongMod: function(string) {
		for(const modName in BanchoMods)
			if(BanchoMods[modName].longMod == string)
				return BanchoMods[modName];
		return null;
	},
	parseLongMods: function(string) {
		if(typeof string != "string")
			return null;
		const splits = string.split(", ");
		const mods = [];
		for(let i = 0; i < splits.length; i++) {
			const longMod = this.parseLongMod(splits[i]);
			if(longMod)
				mods.push(longMod);
		}
		return mods;
	}
};