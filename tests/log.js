/* eslint-disable no-console */

const chalk = require("chalk");
const symbols = require("log-symbols");

module.exports.info = (message) => {
	console.info(chalk.bold.blueBright(symbols.info+" "+message));
};

module.exports.fatal = module.exports.error = (message) => {
	console.info(chalk.bold.redBright(symbols.error+" "+message));
};