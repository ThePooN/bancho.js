# Pre-release

## Version 0.11

### Version 0.11.0

- **Add ability to set default gamemode for fetching users from API**  
  In order to optimize API calls in your application, you can rely on bancho.js' existing API data.  
  The new `gamemode` parameter in the bancho.js config object allows you to specify which gamemode data to receive when fetching an user to save more API calls in certain scenarios.

- **BanchoLobby: When updating from an FFA to a team-based mode, reset teams**  
  Whenn enabling teams, all players in the lobby are assigned a default team. They're assigned predictably based on their slots.  
  bancho.js now applies the same algorithm when changing team mode.

## Version 0.10

### Version 0.10.1

- **BanchoLobby: Fix beatmap never being refreshed from API**

### Version 0.10.0

#### Highlights

- **BREAKING CHANGES**
  - BanchoChannel#channelMembers is now a Map instead of a plain object.
  - Following rate-limiting refactoring (see highlights below), the `limiterPublic` BanchoClient option is no longer supported.  
    Realistically this should never have been implemented, as bots are not supposed to ever send messages publicly (understand public channels like #osu, or every channel that are not PMs and multiplayer lobbies).
  - The mods array is now initialized to `null` in `BanchoLobby`'s constructor instead of an empty array.

- **BanchoUser instances are now garbage-collected**  
  If you joined public channels like #osu, you will eventually get hundreds of thousands users registered, which inevitably caused some out-of-memory issues.  
  We fixed them by garbage-collecting these instances when they are no longer referenced anywhere, by using [`WeakRef`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef).  
  Support was also added using [`weak-value-map`](https://github.com/amapili/weak-value-map) as a peer dependency, which looks to be more memory-efficient but it is considered experimental. Probably only useful if you're running Node.js >= 10 < 14.6.0.

- **Implement the IRC QUIT command**  
  Bancho doesn't emit `PART` when users are disconnecting without leaving channels first. This fixes users that were never marked as having left channels they were part of when disconnecting.

- **Rate-limiting has been refactored**  
  We're now using a much simpler implementation based on a FIFO queue with rate-limiting.  
  Default rate limits for both user and bot accounts have been fine-tuned.

- **New `BanchoLobby` features:**
  - New `banPlayer` method (using `!mp ban`)
  - New `setName` method (using `!mp name`)
  - New `gamemode` property (updated when referees use `!mp map` with gamemode id, or using `setMap` of course)
  - When a player leaves the lobby (`playerLeft` event), the subsequent `updateSettings` call will emit `allPlayersReady` if all remaining players are ready.
    This works around a lack of reporting from Bancho when every player is ready, except the one who has just left, though it is not automatic and you do have to call `updateSettings` yourself.

- **Add support for ACTION events (/me messages)**
  See https://git.cartooncraft.fr/ThePooN/bancho.js/-/commit/e3636e427d4d00ce79b89b31b751d3e733622b75

- **Misc. bug fixes and minor improvements (eg. typings)**  
  See the changelog for dev versions below.

### Version 0.10.0-rc.11

- Fix stats with players who have non-decimal global accuracy

### Version 0.10.0-rc.10

- Switch to an actually FIFO rate-limiting library  
  The new implementation is actually correct now...
- Fine-tune rate limits again for user and bot accounts

### Version 0.10.0-rc.9

- Updated all dependencies, fixing security issues (in dev dependencies)

### Version 0.10.0-rc.8

- BanchoLobby: If playerLeft is emitted, emit allPlayersReady on callback of updateSettings if all players still present are ready

### Version 0.10.0-rc.7

- Typings update (fix `BanchoUser`, `BanchoChannel` and `BanchoLobby` not extending `EventEmitter` and new rate-limiting options)

### Version 0.10.0-rc.6

- **BREAKING CHANGE: Mods are no longer initialized in BanchoLobby ctor.** They are now initialized in `updateSettings`.
- **Fix crash when leaving multiplayer lobbies** (thanks @KhooHaoYit!)
- **Fix crash when receiving player slots events before updating settings** (thanks @kiwec!)
- BanchoClient: Allow creation of private lobbies
- BanchoLobby: Add setName
- BanchoLobby: Add `gamemode` property. Fairly unreliable, as the only way to know it is when a referee sets it via !mp map, but it's better than nothing.
- BanchoLobby: Remove identical update checks for beatmaps and mods
- BanchoLobby: Fix broken conditionals in `setSize` and `setSettings`
- Miscellaneous doc/typings updates and fixes

### Version 0.10.0-rc.5

- **BREAKING CHANGE: The `limiterPublic` BanchoClient option is no longer supported.**
- **DEPRECATED: Rate-limiting BanchoClient options `limiterPrivate` and `limiterTimespan` are now deprecated in favor of newer options.**
- New BanchoClient option: `rateLimit` can be used to pass a `RateLimiter` object from the `limiter` NPM package (or similar implementation). Default is instancied with the right options for regular user accounts.
- New BanchoClient option: setting `botAccount` to `true` applies the right options to the default `RateLimiter` instance for bot accounts.
- Add a message queue and proper rate-limiting
- Actualize README to better reflect current context

### Version 0.10.0-rc.4

- Update typings following addition of action messages

### Version 0.10.0-rc.3

- Add ACTION (/me messages) support

### Version 0.10.0-rc.2

- WeakValueMap: Remove debug logging

### Version 0.10.0-rc.1

- Add pure JavaScript WeakValueMap implementation
  - Used as a substitude when weak-value-map npm module isn't available.
  - Requires Node.js >= 14.6.0, or >= 13.0.0 with --harmony-weak-refs runtime flag.
- Improve message events description
- Development dependencies upgrade

### Version 0.10.0-beta.3

- BanchoLobby#setMap: Fix typing

### Version 0.10.0-beta.2

- Fix crash on connection close, introduced in recent betas.
- BanchoUser: Add joinDate and totalSecondsPlayed (API data)
- BanchoLobby: Add banPlayer method (!mp ban)

### Version 0.10.0-beta.1

- **BREAKING CHANGE: BanchoChannel#channelMembers is now a Map.**
- Implement the IRC QUIT command.
  - This fixes a huge memory leak, especially on high-traffic public channels (more importantly on #osu), as PARTs aren't emitted on user disconnection.
  - Combined with `weak-value-map`, this should make bancho.js very low in RAM usage again!
  - I have measured a debugging bancho.js idle instance on #osu with 26.7k members staying stable at 15~20MB memory heap usage over 5 hours.

### Version 0.10.0-beta.0

- Add `weak-value-map` support
  - `weak-value-map` is a library that allows user and channel caches in bancho.js to be cleaned once they are no longer referenced.
  - It is an optional peer dependency, with fallback to regular `Map` when unpresent. It is highly recommended however, especially on large instances, as without that, cache is never cleared in any way.
- Upgrade dependencies

## Version 0.9

### Version 0.9.7

- Fix hard crash when encountering users using reserved JS keywords
- Upgrade dependencies

### Version 0.9.6

- BanchoLobby: Fix !mp start timeout not working when set to 0
- BanchoLobby: Fix race condition in updateSettings. See issue #35 for more details.
- Docs: Fix various missing async tags
- Update dev dependencies to fix security flaws

### Version 0.9.5

- Dependency updates (security audit)

### Version 0.9.4

- BanchoLobby: Fix matchFinished not setting playing to false
- README enhancements
- Typings enhancements

### Version 0.9.3

- Typings: include rejectedMessage event

### Version 0.9.2

- Message: add content getter
- Client: add rejectedMessage event to catch messages blocked by users with non-friends PMs disabled
- README enhancements
- Typings enhancements

### Version 0.9.1

- PrivateMessage: add recipient property
- Export BanchoMessage, PrivateMessage, ChannelMessage
- Many fixes on TypeScript typings

### Version 0.9.0

- BanchoLobby: Scores sorting
- BanchoLobby: Pass the sorted scores array when a match is finished
- BanchoLobby: Add more examples
- BanchoLobby: Rewrite synchronous queues
- BanchoLobby: Fix playerJoined event not working in TeamVS
- BanchoLobby: Fix changeTeam method not working
- BanchoLobby: Fix race condition with beatmap changing
- Emit PART for every channel on disconnection

## Version 0.8

### Version 0.8.1

- **SECURITY: Fix OutgoingBanchoMessage not only keeping 1st line of message. This patches an IRC command insertion security breach.**
- Rewrite BanchoMods (there should be no breaking changes, only improvements)
- Add level property to BanchoUser
- Update npm dependencies
- Fix documentation errors

### Version 0.8.0

- Library folders restructure (add Enums, Multiplayer and Multiplayer/Enums folder)
- Main class: export BanchoMods, add "is" methods in main class (isBanchoMod, isBanchoUser...)
- Update npm dependencies
- BanchoUser: add where() and stats() methods
- README/Contributing guide overhaul
- BanchoClient: constructor overhaul, now only takes a single object parameter with custom rate limits.  
  See documentation or config.json.example

## Version 0.7

### Version 0.7.1

- BanchoLobby: do not attempt to set maps or mods if they are comparable and identical
- BanchoClient: add createLobby(name) method

### Version 0.7.0

- BanchoClient: add getSelf() method, returning a BanchoUser instance representing the current user
- BanchoMessage: Add self property, set to true if message was sent by the current bancho.js instance

## Version 0.6

### Version 0.6.9

- Multiplayer: Set players' state to NotReady when the beatmap, the mods or the match settings are changed
- BanchoLobby: new event "playerChangedTeam"
- BanchoLobby.startTimer: make the parameter non-optional and add the method to typings
- Multiplayer: Unready everyone when one changes their team, also doesn't unready people when they don't have the map anymore in most cases

### Version 0.6.8

- BanchoLobby: add startTimer(timeout)

### Version 0.6.7

- Multiplayer: Fix setting player.isReady to false instead of manipulating player.state
- Multiplayer: Append every possibles !mp command with a random string to work around Bancho's anti-spam

### Version 0.6.6

- Multiplayer: fix setHost(player)
- Multiplayer: Fix movePlayer(player, slot) not finding player.
- Multiplayer: Fix winConditions/size potentially updating to null when they aren't specified in Bancho's !mp set answer
- BanchoMods: fix shortMods parsing
- Multiplayer regexes: Fix matchSettings regex not recognizing ScoreV2
- Multiplayer: Reset players when they join the lobby
- BanchoLobby: add abortTimer and add timeout parameter to startMatch

### Version 0.6.5

- Multiplayer: Fix incorrectly parsed mods
- Multiplayer: Don't fetch beatmap again if it's the same
- BanchoChannel: Fix join/leave functions not returning a promise but an internal callback when a request is already ongoing.
- Multiplayer: fix kickPlayer(player) and invitePlayer(player) kicking/inviting undefined (:
- Update npm packages

### Version 0.6.4

- Multiplayer: Fix lobby.setSize() never resolving
- Multiplayer: Fix beatmapFromSettings regex
- Multiplayer: Emit a new event beatmapNotFound if the map isn't on the osu! API

### Version 0.6.3

- Add player property to BanchoLobbyPlayerScore
- Multiplayer: Emit all events after setting vars
- Multiplayer: Rename matchSize event to size (and document size property)

### Version 0.6.2

- Multiplayer: Fix setting host not working if there was no host when room was joined
- Multiplayer: update vars before emitting event

### Version 0.6.1

- Add missing entries to typescript definitions and documentation
- BanchoChannel: return the same Promise if a join/part request is already ongoing

### Version 0.6.0

- **Complete Multiplayer channels support, including:**
    - Events
    - Commands
    - Slots
    - Settings
- Add rate limiter for officicially approved chat bots (part of the chat bots usergoup
- sendMessage methods are now promises that will resolve whenever the message is sent (as they can be delayed because of the rate-limiter), and will reject if we're disconnected
- New theme for the docs!
- Can also now retrieve BanchoUser instances by user ids with `BanchoClient.getUserById(userid: number)`.

## Version 0.5

### Version 0.5.2

- Fix connect() callback not being called if initial connection fails but succeeds later
- Fix uncaught exceptions errors if the end user doesn't listen for `errors`, making reconnection fails.

### Version 0.5.1

- Fix mesage not considered a PM if case doesn't match

### Version 0.5.0

- Channel members support
- Answers to IRC PINGs (was getting disconnected after a few minutes of connection without)
- WHOIS support on Bancho users
- JOIN and PART events now fire with a BanchoChannelMember
- Channels topics support

## Version 0.4

- Added type definitions (thanks @ekgame!)
- Add config file and CI variables in contributing guide
- Add connect.js and ping.js examples
- Add BanchoUser class
- Add nodesu as a dependency for osu! API requests
- Rename Message to BanchoMessage
- New class: OutgoingBanchoMessage
- New class: BanchoChannel
- BanchoClient.join/leaveChannel functions have been moved to BanchoChannel
- Fancier test logs
- Enhance README with a Getting Started section

## Version 0.3

- Documentation
- Changelog
- Contribution guide
- Test goals are now independent from test units
- Added leaving channels test goals
- Rename Client to BanchoClient

## Version 0.2

- Rewrote the original Bancho.js library in classes and split across multiple files
- Tests in GitLab CI

## Version 0.1 

- Initial single-file library with very basic IRC support