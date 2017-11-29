class Message {
	constructor(user, message) {
		if(new.target === Message)
			throw new Error("Don't instanciate an abstract class you dumbass");
		
		this.user = user;
		this.message = message;
	}
}

module.exports = Message;