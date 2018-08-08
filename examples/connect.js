const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(require("../config.json"));

client.connect().then(() => {
	console.log("We're online! Now listening for incoming messages.");
	client.on("PM", (message) => {
		console.log(`${message.user.ircUsername}: ${message.message}`);
	});
}).catch(console.error);

