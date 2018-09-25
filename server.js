var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, { pingInterval: 2000 });

app.use(express.static('public'))

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var lobbies = [];

function Player(id, x, y) {
	this.id = id,
	this.x = x,
	this.y = y
};

function Lobby() {
	this.players = {};
	this.playerCount = 0;
}

var lobby = new Lobby();
lobbies.push(lobby);

setInterval(function () {
	console.log("");
	for (var i = 0; i < lobbies.length; i++)
	{
		console.log("----------------------------");
		console.log("Lobby: " + i + "     count: " + lobbies[i].playerCount);
		for (key in lobbies[i].players)
		{
			console.log("Player: " + lobbies[i].players[key].id);
		}
		console.log("----------------------------");
	}
	console.log("");
}, 2000); 

/* setInterval(function () {
	io.emit("heartbeat", players);
}, 3); */

/* setInterval(function () {
	io.emit("ball", ball);
}, 20);  */

io.on('connection', function(socket) {	
	console.log(socket.id + ' connected');

	var player = new Player(socket.id, 150, 372);
	var joined = false;
	for (var i = 0; i < lobbies.length; i++) {
		if (lobbies[i].playerCount < 2) {
			console.log(socket.id + " joining lobby " + i);
			socket.lobbyId = i;
			lobbies[i].players[socket.id] = player;
			lobbies[i].playerCount++;
			joined = true
			break;
		}
	}
	if (!joined) {
		var lobby = new Lobby();
		socket.lobbyId = i;
		lobby.players[socket.id] = player;
		lobby.playerCount++;
		lobbies.push(lobby);
	}

	var data = {
		playerId: player.id,
	}
	socket.emit("details", data);

	socket.on('move', function (data) {	
		lobbies[socket.lobbyId].players[data.id].x = data.x;
		lobbies[socket.lobbyId].players[data.id].y = data.y;
		// broadcast the other player
		var players = lobbies[socket.lobbyId].players;
		var otherSocketId;
		for (key in players)
		{			
			if (key != socket.id)
				otherSocketId = key
		}
		if (otherSocketId) {
			for (key in players)
			{
				if (key == socket.id) {
					socket.broadcast.to(otherSocketId).emit('other player position', players[key]);
				}
			}
		}
	});

	socket.on("ball hit", function (data) {
		var players = lobbies[socket.lobbyId].players;
		var otherSocketId;
		for (key in players)
		{			
			if (key != socket.id)
				otherSocketId = key
		}
		if (otherSocketId) {
			for (key in players)
			{
				if (key == socket.id) {
					socket.broadcast.to(otherSocketId).emit('ball position', data);
				}
			}
		}
	});

	socket.on("reset game", function (data) {
		var players = lobbies[socket.lobbyId].players;
		var otherSocketId;
		for (key in players)
		{			
			if (key != socket.id)
				otherSocketId = key
		}
		if (otherSocketId) {
			for (key in players)
			{
				if (key == socket.id) {
					socket.broadcast.to(otherSocketId).emit('reset game');
				}
			}
		}
	});

	socket.on('disconnect', function(socket) {
		for (var i = 0; i < lobbies.length; i++) {
			for (var j = 0; j < lobbies[i].players.length; j++)
			{
				if (lobbies[i].players[j].id == socket.id)
					delete lobbies[i].players[j];			
			}
		}
		console.log('user id:' + socket.id + ' disconnected');
	});
});

http.listen(8383, function() {
  console.log('listening on *:8383');
});