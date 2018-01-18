declare module "bancho.js" {
	import { EventEmitter } from "events";
	import * as nodesu from "nodesu";

	export class BanchoClient extends EventEmitter {
		
		/**
		 * @param username Username of the user to connect to Bancho
		 * @param password IRC Password of the user to connect to Bancho (see https://osu.ppy.sh/p/irc)
		 * @param host Custom IRC host (for proxy-ing from a firewall for example)
		 * @param port Custom IRC port
		 * @param apiKey osu! API key for API requests (see https://osu.ppy.sh/p/api)
		 */
		constructor(username: string, password: string, host?: string, port?: number, apiKey?: string)
	
		/**
		 * Populated with a Nodesu client, if api key is passed to the constructor
		 */
		osuApi: nodesu.Client
	
		/**
		 * Get a BanchoUser instance for the specified user
		 */
		getUser(username: string): BanchoUser

		/**
		 * Get a BanchoUser instance for the specified user id
		 */
		getUserById(userid: number): Promise<BanchoUser>
	
		/**
		 * Get a BanchoChannel instance for the specified name
		 */
		getChannel(channelName: string): BanchoChannel|MultiplayerBanchoChannel
	
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
		on(event: "disconnected", listener: () => void): this
		
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
		 * Registers a listener for client state changes.
		 * @param listener the callback with a Symbol from ConnectStates and a possible error.
		 */
		on(event: "state", listener: (state: Symbol, error?: Error) => void): this
		
	}

	class BanchoUser {
		/**
		 * Creates an instance of BanchoUser.
		 * @param banchojs Bancho.js client this user was instancied by
		 */
		constructor(banchojs: BanchoClient, ircUsername: string)
	
		banchojs: BanchoClient
		ircUsername: string
	
		id: number
		username: string
		count300: number
		count100: number
		count50: number
		playcount: number
		rankedScore: number
		totalScore: number
		ppRank: number
		ppRaw: number
		accuracy: number
		countRankSS: number
		countRankS: number
		countRankA: number
		country: number
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
		 * Fires a WHOIS request to the server about this user.
		 */
		whois(): Promise<BanchoWhoisReturn>

		/**
		 * Registers a listener for messages from this user
		 * @param listener the callback with the message
		 */
		on(event: "message", listener: (message: BanchoMessage) => void): this
	}

	/**
	 * Class describing what is returned after a WHOIS query on an online user
	 */
	class BanchoWoisReturn {
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
	class BanchoChannel {
		/**
		 * @param name Channel name as it is referred by on IRC (including #)
		 */
		constructor(banchojs: BanchoClient, name: string)
		/** Channel name as it is referred to on IRC (including #) */
		name: string
		topic: string
		/** Members of the channel, referenced by their name */
		channelMembers: BanchoChannelMember[]
		/**
		 * Sends a message to this channel
		 */
		sendMessage(message: string): Promise<null>
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

	class BanchoLobby {
		channel: BanchoMultiplayerChannel
		/**
		 * Multiplayer lobby ID (used in multiplayer history links)
		 */
		id: number
		/**
		 * Name of the lobby, as seein in-game
		 */
		name: string
		/**
		 * Array of BanchoLobbyPlayer determining each users' slot, from 0 to 15
		 */
		slots: Array<BanchoLobbyPlayer>
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
		 * @param gamemode See nodesu.Mode
		 */
		setMap(map: number|nodesu.Beatmap, [gamemode=nodesu.Mode.osu]: number): Promise<null>

		/**
		 * Set given mods in the lobby
		 * @param mods Either an array of BanchoMods or a mods string joined by spaces
		 */
		setMods(mods: Array<BanchoMod|String>, freemod: boolean): Promise<null>

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
		setSettings(teamMode: number, winCondition: number, [size]: number): Promise<null>
		
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
		startMatch(): Promise<null>

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
		on(event: "matchSize", listener: (size: number) => void): this
		on(event: "matchStarted", listener: () => void): this
		on(event: "mods", listener: (mods: Array<BanchoMod>) => void): this
		on(event: "name", listener: (name: string) => void): this
		on(event: "passwordChanged", listener: () => void): this
		on(event: "passwordRemoved", listener: () => void): this
		on(event: "playerJoined", listener: (obj: {
			player: BanchoLobbyPlayer
			slot: number
		}) => void): this
		on(event: "playerMoved", listener: (obj: {
			player; BanchoLobbyPlayer
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
	class BanchoMessage {
		user: BanchoUser
		message: string
	}

	/**
	 * The type for channel messages.
	 */
	class ChannelMessage extends BanchoMessage {
		channel: string
	}

	/**
	 * The type for private messages.
	 */
	class PrivateMessage extends BanchoMessage {

	}

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

	type BanchoModsTypes = {
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
		parseShortMod(shortMod: string): BanchoMod
		/**
		 * @param shortMods Either a string with short mods joined by spaces or an array
		 */
		parseShortMods(shortMods: string|string[]): BanchoMod[]
		parseLongMod(longMod: string): BanchoMod
		/**
		 * @param longMods Either a string with long mods joined by spaces or an array
		 */
		parseLongMods(longMods: string|string[]): BanchoMod[]
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