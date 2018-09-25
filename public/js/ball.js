function Ball() {
    var x = width/2;
    var y = height/2;

    var ballImage = loadImage('assets/ball.png');

    var ball = createSprite(x, y, 32, 32);

    //ball.debug = true;
    ball.maxSpeed = 20;
    ball.friction = .98;
    ball.mass = 8;
    
    ball.setCollider("circle", 0, 0, 16, 16);

    ball.addImage("normal", ballImage); 

    return ball;
}