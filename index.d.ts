declare module "bancho.js" {
	import { EventEmitter } from "events";
	import { RateLimiter } from "limiter";
	import * as nodesu from "nodesu";

	export class BanchoClient extends EventEmitter {
		constructor(options: BanchoClientOptions)
	
		/**
		 * Populated with a Nodesu client, if api key is passed to the constructor
		 */
		osuApi: nodesu.Client
	
		/**
		 * Get a BanchoUser instance for the specified user
		 */
		getUser(username: string): BanchoUser
	
		/**
		 * Get a BanchoUser representing ourself
		 */
		getSelf(): BanchoUser

		/**
		 * Get a BanchoUser instance for the specified user id
		 */
		getUserById(userid: number): Promise<BanchoUser>
	
		/**
		 * Get a BanchoChannel instance for the specified name
		 */
		getChannel(channelName: string): BanchoChannel|BanchoMultiplayerChannel

		/**
		 * Creates a multiplayer lobby and return its channel.
		 * @param name Lobby name
		 * @param privateLobby Mark as private
		 */
		createLobby(name: string, private?: boolean): Promise<BanchoMultiplayerChannel>
	
		/**
		 * Connects to Bancho, rejects an Error if connection fails
		 */
		connect(): Promise<null>
		
		/**
		 * Disconnects from Bancho
		 */
		disconnect(): void
		
		/**
		 * Returns the current connection state.
		 */
		getConnectState(): Symbol
		
		/**
		 * Returns true if the connectState is Connected, false otherwise.
		 */
		isConnected(): boolean
		
		/**
		 * Returns true if the connectState is Disconnected, otherwise false.
		 */
		isDisconnected(): boolean
		
		/**
		 * Registers a listener for channel messages.
		 * @param listener the callback
		 */
		on(event: "CM", listener: (message: ChannelMessage) => void): this
		
		/**
		 * Registers a listener for the successful connection events.
		 * @param listener the callback
		 */
		on(event: "connected", listener: () => void): this
		
		/**
		 * Registers a listener for the disconnection events.
		 * @param listener the callback
		 */
		on(event: "disconnected", listener: (error: Error) => void): this
		
		/**
		 * Registers a listener for errors.
		 * @param listener the callback
		 */
		on(event: "error", listener: (error: Error) => void): this
		
		/**
		 * Registers a listener for when a user joins a channel.
		 * @param listener the callback
		 */
		on(event: "JOIN", listener: (member: BanchoChannelMember) => void): this
		
		/**
		 * Registers a listener for when a user leaves a channel.
		 * @param listener the callback
		 */
		on(event: "PART", listener: (member: BanchoChannelMember) => void): this
		
		/**
		 * Registers a listener for when the client fails to enter a non-existant channel.
		 * @param listener the callback with the concerned BanchoChannel
		 */
		on(event: "nochannel", listener: (channel: BanchoChannel) => void): this
		
		/**
		 * Registers a listener for when the client tries to execute something for an offline user.
		 * @param listener the callback with the concerned BanchoUser
		 */
		on(event: "nouser", listener: (user: BanchoUser) => void): this
		
		/**
		 * Registers a listener for private messages.
		 * @param listener the callback
		 */
		on(event: "PM", listener: (message: PrivateMessage) => void): this
		
		/**
		 * Registers a listener for when Bancho sends us back a PM that couldn't be sent.
		 * As far as we know, only happens when a PM is rejected because the recipient blocks messages from non-friends.
		 * @param listener the callback with the concerned PrivateMessage
		 */
		on(event: "rejectedMessage", listener: (message: PrivateMessage) => void): this
		
		/**
		 * Registers a listener for client state changes.
		 * @param listener the callback with a Symbol from ConnectStates and a possible error.
		 */
		on(event: "state", listener: (state: Symbol, error?: Error) => void): this
		
	}

	class BanchoUser extends EventEmitter {
		/**
		 * Creates an instance of BanchoUser.
		 * @param banchojs Bancho.js client this user was instancied by
		 */
		constructor(banchojs: BanchoClient, ircUsername: string)
	
		banchojs: BanchoClient
		ircUsername: string
	
		id: number
		username: string
		joinDate: Date
		count300: number
		count100: number
		count50: number
		playcount: number
		rankedScore: number
		totalScore: number
		ppRank: number
		level: number
		ppRaw: number
		accuracy: number
		countRankSS: number
		countRankS: number
		countRankA: number
		country: number
		totalSecondsPlayed: number
		ppCountryRank: number
		events: Array<nodesu.UserEvent>
	
		/**
		 * Fetch the user from the osu! API if possible. Populates all the "optional" properties of BanchoUser.
		 * 
		 * @throws {Error} osu! API/no API key error
		 */
		fetchFromAPI(): Promise<nodesu.User>
		
		/**
		 * Returns true if the user is the client
		 */
		isClient(): boolean
	
		/**
		 * Sends a PM to this user.
		 */
		sendMessage(message: string): Promise<null>

		/**
		 * Sends an ACTION message to this user.
		 */
		sendAction(message: string): Promise<null>

		/**
		 * Fires an IRC WHOIS request to the server about this user. Only works on online users.
	 	 * Throws if the user can't be found or is offline.
		 */
		whois(): Promise<BanchoWhoisReturn>

		/**
		 * Fires a !where command to BanchoBot about this user. Only works on online users.
	 	 * Throws if the user can't be found or is offline.
		 */
		where(): Promise<string>

		/**
		 * Fires a !stats command to BanchoBot about this user. Works on online and offline users.
		 * Will update the username, id, rankedScore, ppRank and playcount properties of this user.
		 * Status, levels and accuracy are stored in the returned object, as they are inaccurate data (missing decimals).
		 * It is recommended to get levels and accuracy by polling the osu! API instead.
		 * Throws if the user can't be found.
		 */
		stats(): Promise<BanchoBotStatsReturn>

		/**
		 * Registers a listener for messages from this user
		 * @param listener the callback with the message
		 */
		on(event: "message", listener: (message: BanchoMessage) => void): this
	}

	/**
	 * Class describing what is returned after a WHOIS query on an online user
	 */
	class BanchoWhoisReturn {
		/**
		 * Username of the queried user
		 */
		name: string
		/**
		 * User id of the queried user
		 */
		userid: number
		/**
		 * Channels list the user is in
		 */
		channels: Array<BanchoChannel>
	}

	/**
	 * Contains properties returned by the BanchoBot !stats command that can't be set in BanchoUser.
	 */
	class BanchoBotStatsReturn {
		user: BanchoUser
		/**
		 * Truncated value of levels (eg. 102)
		 */
		level: number
		/**
		 * Rounded value of accuracy (eg. 98.83)
		 */
		accuracy: number
		/**
		 * In-game status (eg. Afk, Idle, Playing...)
		 */
		status: string
		/**
		 * Set to true if user is online *in-game*.
		 */
		online: boolean
	}

	/**
	 * Message to be sent later to a BanchoChannel or BanchoUser
	 */
	export class OutgoingBanchoMessage {
		constructor(banchojs: BanchoClient, recipient: BanchoUser|BanchoChannel, message: string)
		/**
		 * Sends the prepared message to the recipient
		 * 
		 * @throws {Error} If recipient isn't a valid type
		 */
		send(): Promise<null>
		recipient: BanchoUser|BanchoChannel
		message: string
		/**
		 * If target is considered public by Bancho. true if recipient is a channel and not a multiplayer channel
		 */
		isPublic: boolean
	}

	/**
	 * Represents a discussion channel (not including PMs)
	 */
	class BanchoChannel extends EventEmitter {
		/**
		 * @param name Channel name as it is referred by on IRC (including #)
		 */
		constructor(banchojs: BanchoClient, name: string)
		/** Channel name as it is referred to on IRC (including #) */
		name: string
		topic: string
		/** Members of the channel, referenced by their name */
		channelMembers: Map<string, BanchoChannelMember>
		/**
		 * Sends a message to this channel
		 * 
		 * Elevated Bancho users are advised to heavily sanitize their inputs.
		 */
		sendMessage(message: string): Promise<null>
		/**
		 * Sends an ACTION message to this channel
		 */
		sendAction(message: string): Promise<null>
		join(): Promise<null>
		leave(): Promise<null>

		/**
		 * Registers a listener for messages in this channel
		 * @param listener the callback with the message
		 */
		on(event: "message", listener: (message: BanchoMessage) => void): this
		
		/**
		 * Registers a listener for when a user joins this channel.
		 * @param listener the callback
		 */
		on(event: "JOIN", listener: (member: BanchoChannelMember) => void): this
		
		/**
		 * Registers a listener for when a user leaves this channel.
		 * @param listener the callback
		 */
		on(event: "PART", listener: (member: BanchoChannelMember) => void): this
	}

	class BanchoMultiplayerChannel extends BanchoChannel {
		/**
		 * @param name Channel name as it is referred by on IRC (including #)
		 */
		constructor(banchojs: BanchoClient, name: string)
		lobby: BanchoLobby
	}

	/**
	 * Represents a Bancho multiplayer lobby.
	 * 
 	 * Highly recommended to await updateSettings before manipulating (else some properties will be null).
	 */
	class BanchoLobby extends EventEmitter {
		channel: BanchoMultiplayerChannel
		/**
		 * Multiplayer lobby ID (used in multiplayer history links)
		 */
		id: number
		/**
		 * Multiplayer lobby ID (used in multiplayer history links)
		 */
		scores: Array<BanchoLobbyPlayerScore>
		/**
		 * Name of the lobby, as seein in-game
		 */
		name: string
		/**
		 * Array of BanchoLobbyPlayer determining each users' slot, from 0 to 15
		 */
		slots: Array<BanchoLobbyPlayer>
		/**
		 * Current size of the lobby
		 */
		size: number
		gamemode: nodesu.Mode[keyof nodesu.Mode]
		/**
		 * Beatmap fetched from the API (late/not as reliable, use beatmapId when possible)
		 * 
		 */
		beatmap: nodesu.Beatmap
		beatmapId: number
		/**
		 * See BanchoLobbyWinConditions
		 */
		winCondition: number
		/**
		 * See BanchoLobbyTeamModes
		 */
		teamMode: number
		mods: Array<BanchoMod>
		freemod: boolean
		/**
		 * Whether we're currently playing or not
		 */
		playing: boolean

		/**
		 * Fetch lobby from the osu! API.
		 */
		fetchFromAPI(): Promise<nodesu.Multi>

		/**
		 * Set a given map in the lobby
		 * @param map Either a beatmap ID or a Beatmap object from nodesu
		 * @param gamemode See nodesu.Mode. Defaults to current mode (osu! if undetected).
		 */
		setMap(map: number|nodesu.Beatmap, gamemode?: typeof nodesu.Mode[keyof typeof nodesu.Mode]): Promise<null>

		/**
		 * Set given mods in the lobby
		 * @param mods Either an array of BanchoMods or a mods string joined by spaces
		 */
		setMods(mods: Array<BanchoMod>|string, freemod?: boolean): Promise<null>

		/**
		 * Sets the lobby's name
		 */
		setName(name: string): Promise<null>

		/**
		 * Sets the lobby's password
		 */
		setPassword(password: string): Promise<null>

		/**
		 * Adds referees to the lobby
		 * @param ref A string or array of strings of referee(s) to add, referenced by their usernames or #<userid>
		 */
		addRef(ref: Array<string>|string): Promise<null>

		/**
		 * Removes referees from the lobby
		 * @param ref A string or array of strings of referee(s) to remove, referenced by their usernames or #<userid>
		 */
		removeRef(ref: Array<string>|string): Promise<null>

		/**
		 * Locks the lobby's slots and teams
		 */
		lockSlots(): Promise<null>

		/**
		 * Unlocks the lobby's slots and teams
		 */
		unlockSlots(): Promise<null>

		/**
		 * Set the amount of open slots in the lobby
		 */
		setSize(size: number): Promise<null>

		/**
		 * Sets the settings of the lobby
		 * @param teamMode See BanchoLobbyTeamModes
		 * @param winCondition See BanchoLobbyWinConditions
		 */
		setSettings(teamMode?: number, winCondition?: number, size?: number): Promise<null>
		
		/**
		 * Moves a player from one slot to another
		 * @param slot starting from 0
		 */
		movePlayer(player: BanchoLobbyPlayer, slot: number): Promise<null>

		/**
		 * Invites a player to the lobby
		 * @param player Referenced by their username or #<userid>
		 */
		invitePlayer(player: string): Promise<null>

		/**
		 * Sets a player as the host of the lobby
		 * @param player Referenced by their username or #<userid>
		 */
		setHost(player: string): Promise<null>

		/**
		 * Kicks a player from the lobby
		 * @param player Referenced by their username or #<userid>
		 */
		kickPlayer(player: string): Promise<null>

		/**
		 * Bans a player from the lobby
		 * @param player Referenced by their username or #<userid>
		 */
		banPlayer(player: string): Promise<null>

		/**
		 * Get back the host from one's hand
		 */
		clearHost(): Promise<null>

		/**
		 * Close the lobby
		 */
		closeLobby(): Promise<null>

		/**
		 * Start the match
		 */
		startMatch(timeout?: number): Promise<null>

		/**
		 * Start a timer
		 */
		startTimer(timeout: number): Promise<null>

		/**
		 * Abort an ongoing timer
		 */
		abortTimer(): Promise<null>

		/**
		 * Abort the match
		 */
		abortMatch(): Promise<null>

		/**
		 * Change one's team
		 * @param team See BanchoLobbyTeams
		 */
		changeTeam(player: BanchoLobbyPlayer, team: string): Promise<null>

		/**
		 * Fires !mp settings, updates properties and player slots
		 */
		updateSettings(): Promise<null>

		/**
		 * Gets the player who is currently host
		 */
		getHost(): BanchoLobbyPlayer

		/**
		 * Gets the slot of a player
		 */
		getPlayerSlot(player: BanchoLobbyPlayer): number

		/**
		 * Gets or instanciate a player by its username
		 */
		getPlayerByName(name: string): Promise<BanchoLobbyPlayer>

		/**
		 * Gets or instanciate a player by its userid
		 */
		getPlayerById(id: number): Promise<BanchoLobbyPlayer>

		/**
		 * Gets the mp link or however you name it.
		 */
		getHistoryUrl(): string

		/**
		 * Sort scores by pass and score.
		 */
		sortScores(): void


		on(event: "allPlayersReady", listener: () => void): this
		/**
		 * Fired when the beatmap property is updated from the API
		 */
		on(event: "beatmap", listener: (beatmap: nodesu.Beatmap) => void): this
		/**
		 * Fired when the beatmapId is updated
		 */
		on(event: "beatmapId", listener: (beatmapId: number) => void): this
		/**
		 * Fired when the lobby's freemod property is updated
		 */
		on(event: "freemod", listener: (freemod: boolean) => void): this
		on(event: "gamemode", listener: (gamemode: typeof nodesu.Mode[keyof typeof nodesu.Mode]) => void): this
		on(event: "host", listener: (player: BanchoLobbyPlayer) => void): this
		on(event: "hostCleared", listener: () => void): this
		on(event: "invalidBeatmapId", listener: () => void): this
		on(event: "matchAborted", listener: () => void): this
		on(event: "matchFinished", listener: () => void): this
		on(event: "slotsLocked", listener: () => void): this
		on(event: "slotsUnlocked", listener: () => void): this
		on(event: "matchSettings", listener: (settings: {
			size: number
			teamMode: number
			winCondition: number
		}) => void): this
		on(event: "size", listener: (size: number) => void): this
		on(event: "matchStarted", listener: () => void): this
		on(event: "mods", listener: (mods: Array<BanchoMod>) => void): this
		on(event: "name", listener: (name: string) => void): this
		on(event: "passwordChanged", listener: () => void): this
		on(event: "passwordRemoved", listener: () => void): this
		on(event: "playerChangedTeam", listener: (obj: {
			player: BanchoLobbyPlayer
			team: string
		}) => void): this
		on(event: "playerJoined", listener: (obj: {
			player: BanchoLobbyPlayer
			slot: number
			team: string
		}) => void): this
		on(event: "playerMoved", listener: (obj: {
			player: BanchoLobbyPlayer
			slot: number
		}) => void): this
		on(event: "playerLeft", listener: (player: BanchoLobbyPlayer) => void): this
		/**
		 * Fired when the lobby starts or stop playing
		 */
		on(event: "playing", listener: (playing: boolean) => void): this
		on(event: "refereeAdded", listener: (username: string) => void): this
		on(event: "refereeRemoved", listener: (username: string) => void): this
		/**
		 * Fired when the slots of the lobby are updated
		 */
		on(event: "slots", listener: (player: BanchoLobbyPlayer) => void): this
		on(event: "teamMode", listener: (teamMode: number) => void): this
		on(event: "winCondition", listener: (winCondition: number) => void): this
		on(event: "userNotFound", listener: () => void): this
		on(event: "userNotFoundUsername", listener: (username: string) => void): this
	}

	class BanchoLobbyPlayer {
		lobby: BanchoLobby
		user: BanchoUser
		/**
		 * ready/not ready/no map, see BanchoLobbyPlayerState
		 */
		state: Symbol
		isHost: boolean
		/**
		 * Blue or Red, see BanchoLobbyTeams
		 */
		team: string
		mods: Array<BanchoMod>
		score: BanchoLobbyPlayerScore
	}

	class BanchoLobbyPlayerScore {
		score: number
		pass: boolean
		player: BanchoLobbyPlayer
	}

	class BanchoMod {
		enumValue: number
		shortMod: string
		longMod: string
	}

	/**
	 * A Bancho channel user mode, or "IRC modes".
	 * Used by Bancho to mark someone in a channel as an IRC user or a moderator.
	 */
	class BanchoChannelMemberMode {
		/**
		 * @param ircLetter Letter used in the MODE command to represent this mode
		 * @param name Name to describe the mode
		 */
		constructor(ircLetter: string, name: string)
	}

	/** A Bancho channel member */
	class BanchoChannelMember {
		/**
		 * @param client 
		 * @param channel 
		 * @param userString Username with optional @ or + prefix (that will automatically determine the role)
		 */
		constructor(client: BanchoClient, channel: BanchoChannel, userString: string)
		channel: BanchoChannel
		user: BanchoUser
		mode: BanchoChannelMemberMode
	}

	/**
	 * Bancho incoming message
	 */
	export class BanchoMessage {
		user: BanchoUser
		message: string
		self: boolean
		readonly content: string
		/**
		 * Tries to parse this message as an ACTION (/me message).
		 */
		getAction(): string | undefined;
	}

	/**
	 * The type for channel messages.
	 */
	export class ChannelMessage extends BanchoMessage {
		channel: BanchoChannel
	}

	/**
	 * The type for private messages.
	 */
	export class PrivateMessage extends BanchoMessage {
		recipient: BanchoUser
	}

	/**
	 * Static class with a property for each mods and methods to manipulate them
	 */
	class BanchoModsTypes {
		None: BanchoMod
		NoFail: BanchoMod
		Easy: BanchoMod
		Hidden: BanchoMod
		HardRock: BanchoMod
		SuddenDeath: BanchoMod
		DoubleTime: BanchoMod
		Relax: BanchoMod
		HalfTime: BanchoMod
		Nightcore: BanchoMod
		Flashlight: BanchoMod
		Autoplay: BanchoMod
		SpunOut: BanchoMod
		Relax2: BanchoMod
		Perfect: BanchoMod
		Key4: BanchoMod
		Key5: BanchoMod
		Key6: BanchoMod
		Key7: BanchoMod
		Key8: BanchoMod
		FadeIn: BanchoMod
		Random: BanchoMod
		LastMod: BanchoMod
		Key9: BanchoMod
		Key10: BanchoMod
		Key1: BanchoMod
		Key3: BanchoMod
		Key2: BanchoMod
		enum: {
			None: BanchoMod
			NoFail: BanchoMod
			Easy: BanchoMod
			Hidden: BanchoMod
			HardRock: BanchoMod
			SuddenDeath: BanchoMod
			DoubleTime: BanchoMod
			Relax: BanchoMod
			HalfTime: BanchoMod
			Nightcore: BanchoMod
			Flashlight: BanchoMod
			Autoplay: BanchoMod
			SpunOut: BanchoMod
			Relax2: BanchoMod
			Perfect: BanchoMod
			Key4: BanchoMod
			Key5: BanchoMod
			Key6: BanchoMod
			Key7: BanchoMod
			Key8: BanchoMod
			FadeIn: BanchoMod
			Random: BanchoMod
			LastMod: BanchoMod
			Key9: BanchoMod
			Key10: BanchoMod
			Key1: BanchoMod
			Key3: BanchoMod
			Key2: BanchoMod
		}
		/**
		 * Parse mods in their bit flags form and returns them in an array of BanchoMods.
		 * @param bits Mods combination in bit flags form
		 * @param returnNone Returns [BanchoMods.None] if bits is equal to 0 
		 */
		parseBitFlags(bits: number, returnNone?: boolean): BanchoMod[]
		/**
		 * Returns a bits flag integer representing the passed mods.
		 */
		returnBitFlags(mods: BanchoMod[]): number
		/**
		 * Parse a mod in its short form (eg. HD). Case insensitive.
		 */
		parseShortMod(shortMod: string): BanchoMod
		/**
		 * Parse a short mods combination as a string or array of strings.
	 	 * @param shortMods Accepted string formats: "HDDT", "HD, DT", "HD DT". The amount of spaces doesn't matter. Allowed seperators are comma and spaces.
		 */
		parseShortMods(shortMods: string|string[]): BanchoMod[]
		/**
		 * Parse a mod in its long form (eg. Hidden). Case insensitive.
		 */
		parseLongMod(longMod: string): BanchoMod
		/**
		 * Parse a long mods combination as a string or array of strings.
		 * @param longMods Accepted string formats: "Hidden, DoubleTime", "Hidden DoubleTime". The amount of spaces doesn't matter. Allowed seperators are comma and spaces.
		 */
		parseLongMods(longMods: string|string[]): BanchoMod[]
	}

	interface BanchoClientBaseOptions {
		/**
		 * Username of the user to connect to Bancho
		 */
		username: string,
		/**
		 * IRC Password of the user to connect to Bancho (see https://osu.ppy.sh/p/irc)
		 */
		password: string,
		/**
		 * Custom IRC host (for proxy-ing from a firewall for example)
		 */
		host?: string,
		/**
		 * Custom IRC port
		 */
		port?: number,
		/**
		 * osu! API key for API requests (see https://osu.ppy.sh/p/api). WARNING: Multiplayer lobbies won't work without an API key!
		 */
		apiKey?: string,
		/**
		 * Gamemode id to fetch users with. Defaults to null
		 */
		gamemode?: number
	}

	interface BanchoClientOptionsWithoutRateLimiter extends BanchoClientBaseOptions {
		rateLimiter?: never
		botAccount?: never
		limiterTimespan?: never
		limiterPrivate?: never
	}

	interface BanchoClientOptionsWithRateLimiter extends BanchoClientBaseOptions {
		/**
		 * Instance of RateLimiter from the `limiter` npm module for outgoing Bancho messages. Default is safe for normal users in private messages (PM and #multiplayer channels), bots are not supposed to send public messages. Can be disabled by setting to `null`.
		 */
		rateLimiter: RateLimiter

		botAccount?: never
		limiterTimespan?: never
		limiterPrivate?: never
	}

	interface BanchoClientOptionsBotAccount extends BanchoClientBaseOptions {
		/**
		 * Apply bot account rate-limits to the default RateLimiter instance if true (see https://osu.ppy.sh/wiki/en/Bot_account).
		 */
		botAccount: boolean

		rateLimiter?: never
		limiterTimespan?: never
		limiterPrivate?: never
	}

	interface BanchoClientOptionsDeprecated extends BanchoClientBaseOptions {
		/**
		 * Span of milliseconds in you may not exceed the following limits. Default *should* be safe for normal users, recommended value for chat bot accounts is 60000.
		 * @deprecated
		 */
		limiterTimespan: number,
		/**
		 * Amount of private messages (PMs & messages in multiplayer channels) you allow the bot to send in the last timespan. Default *should* be safe for normal users, recommended value for chat bot accounts is 270 (300 * 0.9, 10% margin to protect from accuracy issues, because of bancho/network).
		 * @deprecated
		 */
		limiterPrivate: number

		rateLimiter?: never
		botAccount?: never
	}

	/**
	 * Options for a BanchoClient.
	 */
	type BanchoClientOptions = BanchoClientOptionsWithoutRateLimiter | BanchoClientOptionsWithRateLimiter | BanchoClientOptionsBotAccount | BanchoClientOptionsDeprecated;

	type BanchoLobbyPlayerStatesTypes = {
		Ready: Symbol,
		NotReady: Symbol,
		"Not Ready": Symbol
		NoMap: Symbol,
		"No Map": Symbol
	}

	type BanchoLobbyTeamModesTypes = {
		HeadToHead: number,
		TagCoop: number,
		TeamVs: number,
		TagTeamVs: number
	}

	type BanchoLobbyTeamsTypes = {
		Blue: string
		Red: string
	}

	type BanchoLobbyWinConditionsTypes = {
		Score: number,
		Accuracy: number,
		Combo: number,
		ScoreV2: number
	}

	/**
	 * Contains the different connect states: Disconnected, Connecting, Reconnecting, Connected.
	 */
	type ConnectStateTypes = {
		/** 
		 * When we're purposely disconnected from Bancho or after an auth fail 
		 */
		Disconnected: Symbol,
	
		/** 
		 * When we've opened the socket before any reconnection attempts and waiting for the Welcome packet 
		 */
		Connecting: Symbol,
	
		/** 
		 * When we've gotten disconnected, and are currently waiting before trying to reconnect 
		 */
		Reconnecting: Symbol,
	
		/** 
		 * When we're online! \o/ 
		 */
		Connected: Symbol
	}

	/** Compares the provided object and return true if the object is an instance of BanchoMod. */
	export function isBanchoMod(mod): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoUser. */
	export function isBanchoUser(user): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoChannel. */
	export function isBanchoChannel(channel): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoMultiplayerChannel. */
	export function isBanchoMultiplayerChannel(channel): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoLobby. */
	export function isBanchoLobby(lobby): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoChannelMember. */
	export function isBanchoChannelMember(member): boolean
	/** Compares the provided object and return true if the object is an instance of BanchoMessage. */
	export function isBanchoMessage(message): boolean
	/** Compares the provided object and return true if the object is an instance of ChannelMessage. */
	export function isChannelMessage(message): boolean
	/** Compares the provided object and return true if the object is an instance of PrivateMessage. */
	export function isPrivateMessage(message): boolean

	/**
	 * Contains the different connect states: Disconnected, Connecting, Reconnecting, Connected.
	 */
	export const BanchoLobbyPlayerStates: BanchoLobbyPlayerStatesTypes
	export const BanchoLobbyTeamModes: BanchoLobbyTeamModesTypes
	export const BanchoLobbyTeams: BanchoLobbyTeamsTypes
	export const BanchoLobbyWinConditions: BanchoLobbyWinConditionsTypes
	export const BanchoMods: BanchoModsTypes
	export const ConnectStates: ConnectStateTypes
}
