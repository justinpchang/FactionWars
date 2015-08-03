console.log('FactionWars.js is now running!');
/*
	Faction Wars
	
	an IRC game made by ALL_ABORED
*/

// util imports
var fs = require('fs');

// bot creation
var irc = require("irc");
var config = {
	channels: ["#bots"],
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
			// .register
			if(message.substring(1) === 'register') {
				register(from);
			}
			// .borrow [ammount]
			if(message.substring(1, 7) === 'borrow') {
				request = parseInt(message.substring(8));
				borrow(from, request);
			}
		}
		else if(length === 5) {
			// .bank
			if(message.substring(1) === 'bank') {
				bank(from);
			}
		}
	}
});

// commands
function register(name) {
	if(!isRegistered(name)) {
		fs.appendFile('./players.txt', '\n' +
		name + ',' // name
		+ 0 + ','  // wallet
		+ 0 + ','  // owed
		+ 'A'	   // location
		, function (err) {
			if (err) return console.log('[ERROR] ' + err);
			console.log('[INFO] Added ' + name + ' to players.txt');
			bot.say(name, '[INFO] You have been added to the game! Have fun!');
		});
	} else {
		bot.say(name, '[ERROR] You have already registered.');
	}
}

function borrow(from, request) {
	// data
	var data = getData(from);
	// check if existing player
	if(!isRegistered(from)) {
		bot.say(from, '[ERROR] You have not yet registered to play. Message me \'.register\' to begin playing.');
	}
	// request the loan if player does exist
	else {
		// check if requesting player is in correct location
		console.log('Current player location: \'' + data.location + '\' of type ' + typeof data.location);
		if(data.location === 'A') {
			console.log('Current player is in ccorrect location.');
			// check if the loanshark has enough money
			if(request <= currentMoney) {
				// take out loan
				console.log('Taking out a loan...');
				currentMoney -= request;
				changeAttribute(from, 'wallet', data.wallet + request);
				//changeAttribute(from, 'owed', data.owed + request);
				bot.say(from, '[INFO] You have borrowed ' + request + ' dollars from the loanshark. You currently have ' + data.wallet + ' dollars and owe ' + data.owed + ' dollars.');
				console.log(from + ' borrowed ' + request + ' dollars.');
			} else {
				bot.say(from, '[ERROR] The loanshark does not have that much money. Come back after a delivery.');
			}
		} else {
			bot.say(from, '[ERROR] You must be at location A to interact with the loanshark.');
		}
	}
}

function bank(from) {
	// data
	var data = getData(from);
	// check if existing player
	if(!isRegistered(from)) {
		bot.say(from, '[ERROR] You have not yet registered to play. Message me \'.register\' to begin playing.');
	}
	// display how much the player has and owes
	bot.say(from, '[INFO] You have ' + data.wallet + ' dollars and owe ' + data.owed + '.');
}

// util functions
function isRegistered(name) {
	var exists = false;
	var cur = '';
	fs.readFileSync('./players.txt').toString().split('\n').forEach(function(line) {
		cur = '';
		for(i = 0; line.substring(i,i+1) != ','; i++) {
			cur += line.substring(i,i+1);
		}
		if(!exists) {
			if(cur === name) {
				exists = true;
			}
		}
	});
	return exists;
}

function getData(player) {
	var cur = '';
	
	var _name = player;
	var _wallet = 0; var walletstr = '';
	var _owed = 0; var owedstr = '';
	var _location = '';
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
			index = _name.length + walletstr.length + owedstr.length + 3
			_location = line.substring(index, index + 1);
		}
	});
	var data = {
		name: _name,
		wallet: _wallet,
		owed: _owed,
		location: _location
	};
	return data;
}

function changeAttribute(player, attrib, newVal) {
	var cur = '';
	
	// store old data
	var old = getData(player);
	var newData = '';
	
	// write new data
	if(attrib === 'name') {
		newData = newVal + ',' + old.wallet + ',' + old.owed + ',' + old.location;
	}
	else if(attrib === 'wallet') {
		newData = old.name + ',' + newVal + ',' + old.owed + ',' + old.location;
	}
	else if(attrib === 'owed') {
		newData = old.name + ',' + old.wallet + ',' + newVal + ',' + old.location;
	}
	else if(attrib === 'location') {
		newData = old.name + ',' + old.wallet + ',' + old.owed + ',' + newVal;
	}
	
	console.log(newData);
	
	var first = true;
	
	// write old players.txt to playerbuffer.txt
	fs.readFileSync('./players.txt').toString().split('\n').forEach(function(line) {
		console.log('first is ' + first);
		if(first) {
			first = !first;
		} else {
			fs.appendFile('./playerbuffer.txt', '\n', function (err) {
				if (err) return console.log('[ERROR] ' + err);
			});
		}
		console.log(' ' + line);
		// get name from each line of data
		for(i = 0; line.substring(i,i+1) != ','; i++) {
			cur += line.substring(i,i+1);
		}
		console.log(cur);
		if(cur != player) {
			fs.appendFile('./playerbuffer.txt', line, function (err) {
				if (err) return console.log('[ERROR] ' + err);
			});
		} else {
			fs.appendFile('./playerbuffer.txt', newData, function (err) {
				if (err) return console.log('[ERROR] ' + err);
			});
		}
	});
	console.log('Finished writing old players.txt to playerbuffer.txt');
	console.log('players.txt: ' + fs.readFileSync('./players.txt'));
	console.log('playerbuffer.txt: ' + fs.readFileSync('./playerbuffer.txt'));
	
	// erase players.txt
	fs.truncateSync('./players.txt', 0);
	
	/*
	first = true;
	// write updated playerbuffer.txt to players.txt
	fs.readFile('./playerbuffer.txt', String, function(err, data) {
		data.toString().split('\n').forEach(function(line) {
			if(first) {
				first = !first;
			} else {
				fs.appendFile('./players.txt', '\n', function (err) {
					if (err) return console.log('[ERROR] ' + err);
				});
			}
			fs.appendFile('./players.txt', line, function (err) {
				if (err) return console.log('[ERROR] ' + err);
			});
		});
		bot.say(player, '[INFO] You have borrowed ' + request + ' dollars from the loanshark. You currently have ' + getData(player).wallet + ' dollars and owe ' + getData(player).owed + ' dollars.');
		// erase playerbuffer.txt
		fs.truncate('./playerbuffer.txt', 0, function(){});
		console.log('done');
	});
	*/
	/*
	fs.readFileSync('./playerbuffer.txt').toString().split('\n').forEach(function(line) {
		console.log('current line is: \'' + line + '\'');
		console.log('first is ' + first);
		if(first) {
			first = !first;
		} else {
			fs.appendFile('./players.txt', '\n', function (err) {
				if (err) return console.log('[ERROR] ' + err);
			});
		}
		fs.appendFile('./players.txt', line, function (err) {
			if (err) return console.log('[ERROR] ' + err);
		});
	});	
	console.log('done');
	*/
	
	
	
	/*
	fs.writeFileSync('./players.txt', fs.readFileSync('./playerbuffer.txt'));
	console.log('Finished copying playerbuffer into players');
	console.log('players.txt: ' + fs.readFileSync('./players.txt'));
	console.log('playerbuffer.txt: ' + fs.readFileSync('./playerbuffer.txt'));
	
	// erase playerbuffer.txt
	fs.truncateSync('./playerbuffer.txt', 0);
	*/
}









