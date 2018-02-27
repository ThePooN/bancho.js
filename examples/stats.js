const config = require("../config.json");
const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(config["irc_user"], config["irc_pass"], config["irc_host"], config["irc_port"]);

client.connect().then(() => {
	console.log("We're online!");
	console.log("Please type an username to run the !stats command on:");
	const stdin = process.openStdin();
	stdin.on("data", async (d) => {
		stdin.pause();
		const user = client.getUser(d.toString().trim());
		await user.stats().then((obj) => {
			console.log("Username: "+user.username);
			console.log("id: "+user.id);
			console.log(obj.online ? "Status: "+obj.status : "Offline");
			console.log("Ranked score: "+user.rankedScore.toLocaleString());
			console.log("Rank: #"+user.ppRank.toLocaleString());
			console.log("Playcount: "+user.playcount.toLocaleString());
			console.log("Level: "+obj.level);
			console.log("Accuracy: "+obj.accuracy.toLocaleString());
		}).catch((e) => console.error(e.message));
		client.disconnect();
	});
}).catch(console.error);