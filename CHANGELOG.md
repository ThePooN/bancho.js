# Pre-release

## Version 0.6

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