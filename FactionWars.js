/*
	Faction Wars
	
	an IRC game made by ALL_ABORED
*/

// util imports
var fs = require('fs');

// bot creation
var irc = require("irc");
var config = {
	channels: ["#test"],
	server: "irc.veuwer.com",
	port: 6667,
	botName: "FactionWars",
	
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

var currentMoney = 10000;
var request = 0;

// listen for commands
bot.addListener("pm", function(from, message) {
	length = message.length;
	
	if(message.substring(0,1) === '.') {
		if(length >= 9) {
			// .borrow [ammount]
			if(message.substring(1, 7) === 'borrow') {
				request = parseInt(message.substring(8));
				borrow(from, request);
			}
			// .register
			if(message.substring(1) === 'register') {
				if(!isRegistered(from)) {
					fs.writeFile('./players.txt', from + ',' // name
					+ 0 + ','                                // wallet
					+ 0 + ','								 // owed
					+ 'A'									 // location
					+ '\n', function (err) {
						if (err) return console.log('[ERROR] ' + err);
						console.log('[INFO] Added ' + from + ' to players.txt');
						bot.say(from, '[INFO] You have been added to the game! Have fun!');
					});
				} else {
					bot.say(from, '[ERROR] You have already registered.');
				}
			}
		}
	}
});

// commands
function borrow(from, request) {
	// check if existing player
	if(!isRegistered(from)) {
		bot.say(from, '[ERROR] You have not yet registered to play. Message me \'.register\' to begin playing.');
	}
	// request the loan if player does exist
	else {
		// check if requesting player is in correct location
		if(data(from).location === 'A') {
			// check if the loanshark has enough money
			if(request <= currentMoney) {
				// take out loan
				currentMoney -= request;
				/*
				
				ADD UTIL METHOD FOR CHANGING PLAYER DATA
				
				*/
			} else {
				bot.say(from, '[ERROR] The loanshark does not have that much money. Come back after a delivery.');
			}
		} else {
			bot.say(from, '[ERROR] You must be at location A to interact with the loanshark');
		}
	}
}

// util functions
function isRegistered(name) {
	var exists = false;
	var curPlayer = '';
	fs.readFileSync('./players.txt').toString().split('\n').forEach(function(line) {
		for(i = 0; i < line.length; i++) {
			if(line.substring(i,i+1) === ',') break;
			curPlayer += line.substring(i,i+1);
		}
		if(!exists) {
			if(curPlayer === name) {
				exists = true;
			}
		}
	});
	return exists;
}

function data(player) {
	var cur = '';
	
	var _name = player;
	var _wallet = 0; var walletstr = '';
	var _owed = 0; var owedstr = '';
	var _location = '';
	console.log('2');
	fs.readFileSync('./players.txt').toString().split('\n').forEach(function(line) {
		for(i = 0; line.substring(i,i+1) != ','; i++) {
			cur += line.substring(i,i+1);
		}
		if(cur === player) {
			for(i = _name.length + 1; line.substring(i,i+1) != ','; i++)
				walletstr += line.substring(i,i+1);
			_wallet = parseInt(walletstr);
			for(i = _name.length+1+walletstr.length+1; line.substring(i,i+1) != ','; i++)
				owedstr += line.substring(i,i+1);
			_owed = parseInt(owedstr);
			console.log(line.substring(_name.length + walletstr.length + owedstr.length + 3));
			_location = line.substring(_name.length + walletstr.length + owedstr.length + 3);
		}
	});
	console.log('3f');
	var data = {
		name: _name,
		wallet: _wallet,
		owed: _owed,
		location: _location
	};
	return data;
}











