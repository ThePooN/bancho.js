/**
 * Contains the test goals that have to be met in order for the tests to succeed
 * @readonly
 * @enum {Symbol}
 */
const TestGoals = {
	ChannelMessage: Symbol("ChannelMessage"),
	PrivateMessage: Symbol("PrivateMessage"),
	JoinEvent: Symbol("JoinEvent"),
	JoinPromise: Symbol("JoinPromise"),
	PartEvent: Symbol("PartEvent"),
	PartPromise: Symbol("PartPromise"),
	UserAPIFetch: Symbol("UserAPIFetch")
};

module.exports = Object.freeze(TestGoals);