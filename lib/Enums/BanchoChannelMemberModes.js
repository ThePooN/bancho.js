const BanchoChannelMemberMode = require("../BanchoChannelMemberMode");

/**
 * Contains all the different Bancho channel member modes
 * @readonly
 * @enum {BanchoChannelMemberMode}
 * @private
 */
const BanchoChannelMemberModes = {
	"v": new BanchoChannelMemberMode("v", "IRC user"),
	"o": new BanchoChannelMemberMode("o", "Moderator")
};
module.exports = Object.freeze(BanchoChannelMemberModes);