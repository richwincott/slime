var socket = io();
var latency = 0;

socket.on('pong', function(ms) {
    latency = ms;
});

var gravity = .3;
var player1;
var player2;
var ball;
var ground;
var p1score;
var p2score;

socket.on('ball position', function (data) {
	var newX = data.x * -1;
	ball.setVelocity(newX, data.y);
}); 

socket.on("other player position", function (data) {
	var newX = data.x * -1;
	player2.setVelocity(newX, data.y);
});

socket.on("details", function (data) {
	player1.id = data.playerId
});

function setup() {
	createCanvas(1000,400);

	var groundImage = loadImage('assets/grass.png');

	ground = createSprite(width/2, height-110, width, 1);
	//ground.debug = true;
	ground.setCollider("rectangle", 0, 110, width, 1);
	ground.immovable = true;
	ground.addImage("normal", groundImage);	

	left = createSprite(0, height/2, 1, height);
	//left.debug = true;
	left.setCollider("rectangle", 0, 0, 1, height);
	left.immovable = true;

	right = createSprite(width, height/2, 1, height);
	//right.debug = true;
	right.setCollider("rectangle", 0, 0, 1, height);
	right.immovable = true;

	p1score = 0;
	p2score = 0;
	
	player1 = new Player(1, 150);
	player2 = new Player(2, 1000 - 150);

	resetGame(false);
}

socket.on("reset game", function (data) {
	resetGame(false);
});

function resetGame(emit) {
	if (emit == true)
		socket.emit("reset game");
	
	if (ball)
		ball.remove();

	if (player1) {
		player1.position.x = 150;
	}

	if (player2) {
		player2.position.x = 1000 - 150;
	}

	ball = new Ball();
}

function draw() {
	background(52, 101, 164);	

	ball.bounce(ground);
	ball.bounce(left);
	ball.bounce(right);

	ball.velocity.y += gravity;
	player1.velocity.y += gravity*2;
	player2.velocity.y += gravity*2;
	
	if (keyDown("A") || keyDown("D") || keyDown("W")) {
		if (keyDown("A")) {
			player1.addSpeed(3, 180);
		}

		if (keyDown("D")) {
			player1.addSpeed(3, 0);
		}

		if (keyDown("W")) {
			if (player1.position.y > height-28) {
				player1.addSpeed(100, 270);
			}
		}

		var data = {
			id: player1.id,
			x: player1.velocity.x,
			y: player1.velocity.y
		};
		socket.emit('move', data);
	}

	player1.collide(ball, function () {
		var f = player1.velocity.copy();
		if (player1.velocity.x > 0)
		{		
			f.mult(1.8);
		}
		else {
			f.mult(0.6);
		}
		ball.setVelocity(f.x, f.y);
		var data = {
			x: ball.velocity.x,
			y: ball.velocity.y
		};
		socket.emit('ball hit', data);
	});

	player1.position.y = constrain(player1.position.y, 0 + 28, height - 28);
	player1.position.x = constrain(player1.position.x, 0 + 85, width - 85);

	player2.position.y = constrain(player2.position.y, 0 + 28, height - 28);
	player2.position.x = constrain(player2.position.x, 0 + 85, width - 85); 

	ball.position.y = constrain(ball.position.y, -height + 16, height);
	ball.position.x = constrain(ball.position.x, 0 + 16, width - 16);

	if (ball.position.x > width - 26 && ball.position.y > height - 90) {
		p1score++;
		resetGame(true);
	}
	if (ball.position.x < 26 && ball.position.y > height - 90) {
		p2score++;
		resetGame(true);
	}


	drawSprites();


	// scores
	noStroke();
	textSize(28);
	textAlign(LEFT);
	fill(40, 0, 0, 90);
	text(p1score, player1.position.x - 8, player1.position.y + 18);
	textAlign(RIGHT);
	fill(244, 244, 244, 90);
	text(p2score, player2.position.x + 8, player2.position.y + 18);


	textAlign(RIGHT);
	text(latency + " ms", 95, 40);

	if (player1.id) {
		textAlign(CENTER);
		text(player1.id, width/2, 40);
	}

	//textAlign(CENTER);
	//text(ball.position, width/2, 90);

	// goal posts
	stroke(210);
	strokeWeight(6);
	line(2, height, 10, height-90);
	line(10, height-90, 30, height-90);	
	line(width-2, height, width-10, height-90);
	line(width-10, height-90, width-30, height-90);

	stroke(240);
	strokeWeight(8);
	line(30, height, 30, height-90);
	line(width-30, height, width-30, height-90);

	
}