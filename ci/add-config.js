if(!process.env["IRC_USER"] || !process.env["IRC_PASS"])
	throw new Error("Environment variables not correctly set!");

const config = {
	"username": process.env["IRC_USER"],
	"password": process.env["IRC_PASS"],
	"apiKey": process.env["API_KEY"],
	"userId": Number(process.env["USER_ID"])
};
if(process.env["IRC_HOST"])
	config["host"] = process.env["IRC_HOST"];
if(process.env["IRC_PORT"])
	config["port"] = parseInt(process.env["IRC_PORT"]);
if(process.env["LIMITER_TIMESPAN"])
	config["limiterTimespan"] = parseInt(process.env["LIMITER_TIMESPAN"]);
if(process.env["LIMITER_PRIVATE"])
	config["limiterPrivate"] = parseInt(process.env["LIMITER_PRIVATE"]);
if(process.env["LIMITER_PUBLIC"])
	config["limiterPublic"] = parseInt(process.env["LIMITER_PUBLIC"]);

require("fs").writeFileSync("./config.json", JSON.stringify(config, null, "\t"));