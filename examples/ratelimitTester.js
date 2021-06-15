const Banchojs = require(".."); // Replace .. by bancho.js when coding outside of the library
const client = new Banchojs.BanchoClient(require("../config.json"));

function log() {
	console.log.apply(this, [new Date(), ...arguments]);
}

client.connect().then(() => {
	console.log("We're online! Now starting to send messages.");

	const user = client.getSelf();
	for(let i = 0; i < 40; i++) {
		const copy = i;
		user.sendMessage(`${i}`).then(() => log(`Sent ${copy}`));
		log(`Sending ${i}`);
	}
}).catch(console.error);