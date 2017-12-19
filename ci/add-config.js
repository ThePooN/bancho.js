if(!process.env["IRC_USER"] || !process.env["IRC_PASS"])
	throw new Error("Environment variables not correctly set!");

const config = {
	"irc_user": process.env["IRC_USER"],
	"irc_pass": process.env["IRC_PASS"],
	"api_key": process.env["API_KEY"],
	"user_id": Number(process.env["USER_ID"])
};
if(process.env["IRC_HOST"])
	config["irc_host"] = process.env["IRC_HOST"];
if(process.env["IRC_PORT"])
	config["irc_port"] = parseInt(process.env["IRC_PORT"]);

require("fs").writeFileSync("./config.json", JSON.stringify(config));