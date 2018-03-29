# bancho.js

[![NPM](https://nodei.co/npm/bancho.js.png?compact=true)](https://nodei.co/npm/bancho.js/)  
[![pipeline status](https://git.cartooncraft.fr/ThePooN/bancho.js/badges/master/pipeline.svg)](https://git.cartooncraft.fr/ThePooN/bancho.js/commits/master)

## Current release: v0.8.1

# Introduction

bancho.js is designed to be the best library when it comes to interacting with Bancho in real-time. It connects over its IRC interface and enables you to do anything, **from chatting to managing multiplayer lobbies**!

It is designed to be reliable and easy to use. It has already been successfully used in several projects, most notably [OHC.gg](https://ohc.gg) and [osu! French Championship Hiver 2018](https://ofc.thepoon.fr), followed by osu!SQL in the near future, and maybe your own project!  
Please let me know of your use of bancho.js! I'll gladly avertise your projects here :)

# Useful Links

- **Documentation**: [https://bancho.js.org](https://bancho.js.org)
- NPM package: [https://npmjs.com/package/bancho.js](https://npmjs.com/package/bancho.js)
- Git repository: [https://git.cartooncraft.fr/ThePooN/bancho.js](https://git.cartooncraft.fr/ThePooN/bancho.js)
- GitHub mirror: [https://github.com/ThePooN/bancho.js](https://github.com/ThePooN/bancho.js)
- Discord server (support/discussion): [https://discord.gg/ThePooN](https://discord.gg/ThePooN)

# Disclaimer

The osu! staff *tolerates* running bots on your own osu! account, however you aren't allowed to create a dedicated osu! account to your bot without acknowledging the staff. **Any attempt to do so will be considered multi-accounting, which is against the osu! Terms of Use.**  
I highly recommended you to get in touch with peppy when hosting a public bot. If your bot is recognized by the staff, you'll get higher (and known!) rate limits dedicated to chat bots.  
Normal accounts have undisclosed rate limits. This library, by default, uses limits that are somewhat tested on user accounts but there's no guarantee provided. The test suite should always run fine though.

# Getting Started

This will print all your incoming PMs to the console:
```javascript
const client = new Banchojs.BanchoClient({username: "ThePooN", password:"verysecret"});
client.connect().then(() => {
	console.log("We're online! Now listening for incoming messages.");
	client.on("PM", (message) => console.log(message.user.ircUsername+": "+message.message));
}).catch(console.error);
```
Output:
```
Ghouru: notice me senpai
```
This library doesn't limit itself to sending messages though! It also has **complete multiplayer support** and the ability of firing API requests from BanchoUser objects, and much more! **Learn more with the [provided examples](https://github.com/ThePooN/bancho.js/tree/master/examples) and [documentation](https://bancho.js.org)!**

# Contributing

This library is very near completion. Thanks to everyone who supported and are now (directly or not) using the project!  
There must still be some improvements to be done though. Feel free to hop on my [Discord server](https://discord.gg/ThePooN) so we can figure out issues and improve the code!  
You can financially support this project by [subscribing](https://twitch.tv/ThePooN02/subscribe) to my Twitch channel or [donating](https://streamlabs.com/ThePooN02).

# License

It is licensed as GPL 3.0. The entire license text is available in the [LICENSE](/LICENSE) file, however I recommend you to take a look at this [short summary](https://choosealicense.com/licenses/gpl-3.0/) to get a better idea!