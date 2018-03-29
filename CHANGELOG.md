# Pre-release

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