# bancho.js

[![NPM](https://nodei.co/npm/bancho.js.png?compact=true)](https://nodei.co/npm/bancho.js/)  
[![pipeline status](https://git.cartooncraft.fr/ThePooN/bancho.js/badges/master/pipeline.svg)](https://git.cartooncraft.fr/ThePooN/bancho.js/commits/master)

## Current release: 0.11.0

# Introduction

bancho.js is designed to be the best library when it comes to interacting with Bancho in real-time. It connects over its IRC interface and enables you to do anything Bancho enables you to do, **from chatting to managing multiplayer lobbies**!

It is designed to be reliable and easy to use, as demonstrated by the [many projects relying on it](https://github.com/ThePooN/bancho.js/network/dependents)!

# Useful Links

- **Documentation**: [https://bancho.js.org](https://bancho.js.org) (Use dropdowns at the top)
- NPM package: [https://npmjs.com/package/bancho.js](https://npmjs.com/package/bancho.js)
- Git repository: [https://git.cartooncraft.fr/ThePooN/bancho.js](https://git.cartooncraft.fr/ThePooN/bancho.js)
- GitHub mirror: [https://github.com/ThePooN/bancho.js](https://github.com/ThePooN/bancho.js)
- Discord server (support/discussion): [https://discord.gg/ThePooN](https://discord.gg/ThePooN)

# Disclaimer

Before running a bot on your osu! account, please read the [Bot account wiki page](https://osu.ppy.sh/wiki/en/Bot_account).
It details conditions under which you can run a bot on your account and eventually getting a dedicated account for it.

**Please do NOT create an account dedicated to your bot without allowance. This will be considered multi-accounting, which is against the osu! Terms of Use and may lead to sanctions on your account.**

The library uses sane rate limits for normal user accounts by default.

# Getting Started

First, install the library: `npm i bancho.js`.

Let's get straight into it with a working example. This will print all your incoming PMs to the console:
```javascript
const Banchojs = require("bancho.js");
const client = new Banchojs.BanchoClient({ username: "ThePooN", password: "your_irc_password" });
client.connect().then(() => {
	console.log("We're online! Now listening for incoming messages.");
	client.on("PM", (message) => console.log(`${message.user.ircUsername}: ${message.message}`));
}).catch(console.error);
```
Output:
```
Ghouru: notice me senpai
```
All you need to do to run this example is install bancho.js into your project (`npm i bancho.js`), paste this code into a file and replace my credentials with yours, from https://osu.ppy.sh/p/irc.  
This library doesn't limit itself to sending messages though! It also has **complete multiplayer support** and the ability of firing API requests from BanchoUser objects, and much more! **Learn more with the [provided examples](https://github.com/ThePooN/bancho.js/tree/master/examples) and [documentation](https://bancho.js.org)!**

# Caching

A BanchoClient uses unique BanchoUser instances across its lifespan. The cache never gets cleared and objects never destroyed.

Starting with bancho.js v0.10, we support garbage collection of these instances out-of-the-box using WeakRef, introduced in Node.js >= v14.6.0.

bancho.js also supports [weak-value-map](https://www.npmjs.com/package/weak-value-map) if present, providing garbage collection of BanchoUser objects in Node.js >= v10.0.0.
From my own testing, this solution offers better memory usage than Node.js's WeakRef. However, I don't think this can be considered as stable as Node.js's WeakRefs, so I wouldn't recommend using this solution unless necessary.

# Contributing

This library is very near completion. Thanks to everyone who supported and are now (directly or not) using the project!  
There must still be some improvements to be done though. Feel free to hop on my [Discord server](https://discord.gg/ThePooN) so we can figure out issues and improve the code!  
You can financially support this project by [subscribing](https://twitch.tv/ThePooN/subscribe) to my Twitch channel or [donating](https://streamlabs.com/ThePooN).

# Compatibility

bancho.js supports all currently supported Node.js releases. See [Node's LTS schedule](https://nodejs.org/en/about/releases/).

# License

It is licensed as GPL 3.0. The entire license text is available in the [LICENSE](/LICENSE) file, however I recommend you to take a look at this [short summary](https://choosealicense.com/licenses/gpl-3.0/) to get a better idea!

