function Player(playerId, x, socketid) {
	var y = height - 28;

	var playerImage = loadImage('assets/player' + playerId + '.png');

	var player = createSprite(x, y, 170, 78);

	//player.debug = true;
	player.maxSpeed = 7;
	player.friction = .96;
	player.mass = 100;
	if (socketid)
		player.id = socketid;

	player.setCollider("rectangle", 0, 50, 85, 69);

	player.addImage("normal", playerImage);	

	return player;
}