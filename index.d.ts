declare module "bancho.js" {
	import { EventEmitter } from "events";
	import * as nodesu from "nodesu";

	export class BanchoClient extends EventEmitter {
		
		/**
		 * @param username Username of the user to connect to Bancho
		 * @param password IRC Password of the user to connect to Bancho (see https://osu.ppy.sh/p/irc)
		 * @param host Custom IRC host (for proxy-ing from a firewall for example)
		 * @param port Custom IRC port
		 */
		constructor(username: string, password: string, host?: string, port?: number)
	
		/**
		 * Populated with a Nodesu client, if api key is passed to the constructor
		 */
		osuApi: nodesu.Client
	
		/**
		 * Get a BanchoUser instance for the specified user
		 */
		getUser(username: string): BanchoUser
	
		/**
		 * Get a BanchoChannel instance for the specified name
		 */
		getChannel(channelName: string): BanchoChannel
	
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
		sendMessage(message: string)
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
		send()
		recipient: BanchoUser|BanchoChannel
		message: string
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
		sendMessage(message: string)
		join(): Promise<null>
		leave(): Promise<null>
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
	export const ConnectStates: ConnectStateTypes
}