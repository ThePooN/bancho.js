/**
 * Represents an osu! mod with properties to parse/send them to Bancho
 * See [BanchoMods]{@link BanchoMods}
 * 
 * @prop {number} enumValue The value as it is stored by osu! servers and returned by the osu! API
 * @prop {string} shortMod Mod in a 2 letters format, used by !mp mods
 * @prop {string} longMod Mod in its full name, without spaces. Used by Bancho when printing mods.
 */
class BanchoMod {
	constructor(enumValue, shortMod, longMod) {
		this.enumValue = enumValue;
		this.shortMod = shortMod;
		this.longMod = longMod;
	}
}

module.exports = BanchoMod;