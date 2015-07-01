/*
	Faction Wars - Loanshark
	
	an NPC that players can borrow from
*/

// util imports
var fs = require('fs');

// bot creation
var irc = require("irc");
var config = {
	channels: ["#test"],
	server: "irc.veuwer.com",
	port: 6667,
	botName: "Loanshark",
	
	showErrors: false,
	floodProtection: false,
	autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
	stripColors: false
};
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

// basic answering
var triggers = [
	".about",
	".version"
];
var responses = [
	"<fill information>",
	"0.1"
];
bot.addListener("message", function(from, to, text, message) {
	for(i = 0; i < triggers.length; i++)
		if(message.args[1] == triggers[i])
			bot.say(config.channels[0], responses[i]);
});

// NPC specific vars
var location = 'A';
var currentMoney = 10000;
var request = 0;

// listen for commands
bot.addListener("pm", function(from, message) {
	length = message.length;
	
	if(message.substring(0,1) === '.') {
		// .borrow [ammount]
		if(length >= 9) {
			request = parseInt(message.substring(8));
			borrow(from, request);
		}
	}
});

// commands
function borrow(from, request) {
	// check if existing player
	var exists = false;
	var boop = false;
	fs.readFileSync('./players.txt').toString().split('\n').forEach(function(line) {
		if(!exists) {
			if(line === from) {
				exists = true;
			} else if(!boop) {
				bot.say(from, '[ERROR] You have not yet registered to play. Message FactionWars \'.register\' to begin playing.');
				boop = true;
			}
		}
	});
}











