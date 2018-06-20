const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(require("../config.json"));

client.connect().then(async () => {
	console.log("We're online!");
	const channel = client.getChannel("#mp_43508978");
	await channel.join();
	const lobby = channel.lobby;
	if(lobby == null)
		throw new Error("missing api key");

	console.log("Multiplayer link: https://osu.ppy.sh/mp/"+lobby.id);

	lobby.on("matchStart", () => {
		console.log("Match on "+lobby.beatmap.id+" started...");
	});

	lobby.on("matchFinished", (scores) => {
		console.log("Results are in!");
		for(let scoreId in scores)
			console.log("#"+(Number(scoreId)+1)+": "+scores[scoreId].player.user.username+" "+scores[scoreId].score+" "+scores[scoreId].pass);
	});
}).catch(console.error);

process.on("SIGINT", async () => {
	console.log("Disconnecting...");
	await client.disconnect();
});