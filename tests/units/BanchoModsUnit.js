const TestUnit = require("../TestUnit").TestUnit;
const TestGoals = require("../TestGoals");
const BanchoMods = require("../../lib/Multiplayer/Enums/BanchoMods");

class BanchoModsUnit extends TestUnit {
	constructor() {
		super();
		this.name = "BanchoModsUnit";
	}

	run() {
		return new Promise((resolve, reject) => {
			try {
				this.assertEquals(24, BanchoMods.returnBitFlags([BanchoMods.Hidden, BanchoMods.HardRock]));
				this.assertArrayEquals([BanchoMods.Hidden, BanchoMods.HardRock], BanchoMods.parseBitFlags(24));
				
				this.assertEquals(null, BanchoMods.parseShortMod(""));
				this.assertEquals(null, BanchoMods.parseShortMod("bs"));
				this.assertEquals(null, BanchoMods.parseShortMod("bullshit"));
				this.assertEquals(null, BanchoMods.parseShortMod("bullshit1"));
				this.assertEquals(BanchoMods.DoubleTime, BanchoMods.parseShortMod("DT"));
				this.assertEquals(BanchoMods.Hidden, BanchoMods.parseShortMod("HD"));
				this.assertEquals(BanchoMods.HardRock, BanchoMods.parseShortMod("HR"));

				this.assertArrayEquals([], BanchoMods.parseShortMods([""]));
				this.assertArrayEquals([], BanchoMods.parseShortMods(["bs"]));
				this.assertArrayEquals([], BanchoMods.parseShortMods(["bullshit"]));
				this.assertArrayEquals([], BanchoMods.parseShortMods(["bullshit1"]));
				this.assertArrayEquals([BanchoMods.Hidden, BanchoMods.DoubleTime], BanchoMods.parseShortMods("HD,DT"));
				this.assertArrayEquals([BanchoMods.Hidden], BanchoMods.parseShortMods("HD"));
				this.assertArrayEquals([BanchoMods.Hidden, BanchoMods.DoubleTime], BanchoMods.parseShortMods("HD, DT"));
				this.assertArrayEquals([BanchoMods.Hidden, BanchoMods.DoubleTime], BanchoMods.parseShortMods("HD DT"));
				this.assertArrayEquals([BanchoMods.Hidden, BanchoMods.DoubleTime], BanchoMods.parseShortMods(["HD", "DT"]));
				this.assertArrayEquals([BanchoMods.HardRock, BanchoMods.DoubleTime], BanchoMods.parseShortMods("HRDT"));

				this.assertEquals(null, BanchoMods.parseLongMod(""));
				this.assertEquals(null, BanchoMods.parseLongMod("bs"));
				this.assertEquals(null, BanchoMods.parseLongMod("bullshit"));
				this.assertEquals(null, BanchoMods.parseLongMod("bullshit1"));
				this.assertEquals(BanchoMods.Easy, BanchoMods.parseLongMod("Easy"));
				this.assertEquals(BanchoMods.FadeIn, BanchoMods.parseLongMod("FadeIn"));
				this.assertEquals(BanchoMods.Random, BanchoMods.parseLongMod("Random"));


				this.assertArrayEquals([], BanchoMods.parseLongMods([""]));
				this.assertArrayEquals([], BanchoMods.parseLongMods(["bs"]));
				this.assertArrayEquals([], BanchoMods.parseLongMods(["bullshit"]));
				this.assertArrayEquals([], BanchoMods.parseLongMods(["bullshit1"]));
				this.assertArrayEquals([BanchoMods.Relax], BanchoMods.parseLongMods("Relax"));
				this.assertArrayEquals([BanchoMods.Relax, BanchoMods.Flashlight], BanchoMods.parseLongMods("Relax Flashlight"));
				this.assertArrayEquals([BanchoMods.Relax, BanchoMods.Flashlight], BanchoMods.parseLongMods("Relax,Flashlight"));
				this.assertArrayEquals([BanchoMods.Relax, BanchoMods.Flashlight], BanchoMods.parseLongMods("Relax, Flashlight"));
				this.assertArrayEquals([BanchoMods.Relax, BanchoMods.Flashlight], BanchoMods.parseLongMods(["Relax", "Flashlight"]));
				
				this.fulFillGoal(TestGoals.BanchoMods);
				resolve();
			}
			catch(e) {
				reject(e);
			}
		});
	}
}

module.exports = new BanchoModsUnit();