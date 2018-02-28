const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(require("../config.json"));

client.connect().then(() => {
	console.log("We're online!");
	console.log("Please type an username to run the !where command on:");
	const stdin = process.openStdin();
	stdin.on("data", async (d) => {
		stdin.pause();
		const username = d.toString().trim();
		await client.getUser(username).where().then((country) => console.log(username+" is online from "+country+"!")).catch((e) => console.error(e.message));
		client.disconnect();
	});
}).catch(console.error);