const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(require("../config.json"));
const threshold = new Date("2014-01-01");
const channelName = "#mp_43508978";

client.connect().then(async () => {
	console.log("We're online!");
	const channel = client.getChannel(channelName);
	await channel.join();
	const lobby = channel.lobby;
	if(lobby == null)
		throw new Error("missing api key");

	console.log("Multiplayer link: https://osu.ppy.sh/mp/"+lobby.id);

	lobby.on("beatmap", async (beatmap) => {
		if(beatmap != null && Math.max(beatmap.lastUpdate.getTime(), beatmap.approvedDate.getTime()) > threshold.getTime())
			await channel.sendMessage("This beatmap is too recent! Only beatmaps ranked in 2013 and before are accepted.");
	});
}).catch(console.error);

process.on("SIGINT", async () => {
	console.log("Disconnecting...");
	await client.disconnect();
});