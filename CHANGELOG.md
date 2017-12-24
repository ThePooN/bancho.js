# Pre-release

## Version 0.5

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