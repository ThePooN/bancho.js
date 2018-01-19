# bancho.js

[![NPM](https://nodei.co/npm/bancho.js.png?compact=true)](https://nodei.co/npm/bancho.js/)  
[![pipeline status](https://git.cartooncraft.fr/ThePooN/bancho.js/badges/master/pipeline.svg)](https://git.cartooncraft.fr/ThePooN/bancho.js/commits/master)

## Current release: v0.6.4

# Introduction

bancho.js is designed to be the best library when it comes to interacting with bancho in real-time. It connects over its IRC interface and enables you to do anything you can do over IRC - and much more to come!

It is designed to be reliable and easy to use. It has already been successfully used in several projects, most notably [OHC.gg](https://ohc.gg), followed by osu! French Championship and osu!SQL in the near future, and maybe your own project!

# Disclaimer

The osu! staff *tolerates* running bots on your own osu! account, however you aren't allowed to create a dedicated osu! account to your bot without acknowledging the staff. **Any attempt to do so will be considered multi-accounting, which is against the osu! Terms of Use.**  
I highly recommended you to get in touch with peppy when hosting a public bot. If your bot is recognized by the staff, you'll get higher rate limits dedicated to chat bots, which are the rate limits this library uses.

# Getting Started
This will print all your incoming PMs to the console:
```javascript
const client = new Banchojs.BanchoClient(config["irc_user"], config["irc_pass"], config["irc_host"], config["irc_port"]);
client.connect().then(() => {
	console.log("We're online! Now listening for incoming messages.");
	client.on("PM", (message) => {
		console.log(message.user.ircUsername+": "+message.message);
	});
}).catch(console.error);
```
Output:
```
Ghouru: notice me senpai
```
There are much more possibilities, including firing API requests from any `BanchoUser` object. Learn more about all the features in the Documentation!

# Documentation

End-user documentation is now hosted on https://bancho.js.org!  
Developers documentation can be generated using `npm run doc:dev`. See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

# License

It is licensed as GPL 3.0. The entire license text is available in the [LICENSE](/LICENSE) file, however I recommend you to take a look at this [short summary](https://choosealicense.com/licenses/gpl-3.0/) to get a better idea!

# Support The Development

I'm just a 17 years old teenager, and you may know me better as an [osu! player](https://osu.ppy.sh/u/ThePooN) and [Twitch streamer](https://twitch.tv/ThePooN02). I'm also studying computer sciences at university in Reims.  
If this library helped you or anybody you know or just appreciate the free time I spend on this project, feel free to support me by [subscribing](https://twitch.tv/ThePooN02/subscribe) to my Twitch channel or [donating](https://streamlabs.com/ThePooN02)!  
Most of the time spent on this library will also be livestreamed on the same aforementioned Twitch channel.