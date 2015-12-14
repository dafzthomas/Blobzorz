/*globals pick, Drawable, CompoundDrawable */

var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    scene = {},
	keys = {},
	enemies = {},
	enemiesKilled,
	enemyBullets = [],
	playerBullets = [],
	canFire = true,
	canEnemyFire = true,
	canBossFire = true,
	hasWon = false,
	hasLost = false,
	objects = [],
	theLevel = 0,
	bossHit = 0,
	playerScore = 0,
	game = false,
	health = 100,
	request = false,
	mainMenu = false;

// RequestAnimationFrame shim by Paul Irish http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
		window.setTimeout(callback, 1000 / 60);
	};
}());
window.cancelAnimFrame = (function() {
	return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
})();

// Text
function Text(params) {
	Drawable.apply(this, arguments);

	this.strokeStyle = params.strokeStyle || null;
	this.lineWidth = params.lineWidth || null;
	this.fillStyle = params.fillStyle || null;
	this.textAlign = params.textAlign || null;

	// Draw
	this.draw = function() {
		this.setupContext();

		this.context.font = params.font;
		context.strokeStyle = this.strokeStyle;
    	context.lineWidth = this.lineWidth;
    	this.context.strokeText(params.text, this.x, this.y);
    	context.fillStyle = this.fillStyle;
		this.context.fillText(params.text, this.x, this.y);
		context.textAlign = this.textAlign;
	}
}

// A Rectangle
function Rectangle(params) {
	Drawable.apply(this, arguments);

	this.type = params.type || null;
	this.width = params.width || 100;
	this.height = params.height || 100;

	// Draw
	this.draw = function () {
		this.setupContext();

		this.context.fillRect(this.x, this.y, this.width, this.height);
		this.context.strokeRect(this.x, this.y, this.width, this.height);
	};
}

// A Circle
function Circle(params) {
	Drawable.apply(this, arguments);

	this.type = params.type || null;
	this.radius = params.radius || 100;

	// Draw
	this.draw = function () {
		this.setupContext();

		this.context.beginPath();
		this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

		this.context.fill();
		this.context.stroke();
	};
}

function Player(params) {
	// Apply Drawable as a superclass
	CompoundDrawable.apply(this, arguments);

	this.radius = params.radius || 20;

	// "Constructor"
	this.parts.push(
		new Circle({
			context: context,
			radius: params.radius || 20,
			fillColour: 'pink'
		}),
		new Rectangle({
			context: context,
			fillColour: 'green',
			x: -5,
			y: -30,
			height: 20,
			width: 10
		})
	);
}

function Entity(params) {
	// Apply Drawable as a superclass
	CompoundDrawable.apply(this, arguments);

	this.radius = params.radius || 20;

	this.type = params.type || null;

	// "Constructor"
	this.parts.push(
		new Circle({
			context: context,
			radius: params.radius || 20,
			fillColour: 'purple'
		}),
		new Rectangle({
			context: context,
			fillColour: 'red',
			x: -5,
			y: 10,
			height: 20,
			width: 10
		})
	);
}

function Boss(params){
	// Apply Drawable as a superclass
	CompoundDrawable.apply(this, arguments);

	this.radius = params.radius || 20;

	this.type = params.type || null;

	// "Constructor"
	this.parts.push(
		new Circle({
			context: context,
			radius: params.radius || 20,
			fillColour: 'red'
		}),
		new Rectangle({
			context: context,
			fillColour: 'red',
			x: -5,
			y: 10,
			height: 20,
			width: 10
		})
	);
}

function MainMenu(){
	hasWon = false;
	mainMenu = true;
    var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	var gameTitle = new Text({
		context: context,
		x: (canvas.width / 2),
		y: 100,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Welcome to Blobzorz',
		textAlign: 'center'
	});

	var instructions = new Text({
		context: context,
		x: (canvas.width / 2),
		y: 480,
		font: '30px Avenir',
		fillStyle: '#FFF',
		text: 'Move using the W A S and D keys.',
		textAlign: 'center'
	});

	var instructions2 = new Text({
		context: context,
		x: (canvas.width / 2),
		y: 550,
		font: '30px Avenir',
		fillStyle: '#FFF',
		text: 'Hold Space bar = Shoot',
		textAlign: 'center'
	});

	var begin = new Text({
		context: context,
		x: (canvas.width / 2),
		y: 400,
		font: '70px Avenir',
		fillStyle: '#FFF',
		text: 'Start',
		textAlign: 'center'
	});

	var enemy1main = new Entity({
		context: context,
		type: 'enemy',
		x: 100,
		y: 200,
		fillColour: 'purple',
		radius: 25
	});

	var enemy2main = new Entity({
		context: context,
		type: 'enemy',
		x: 800,
		y: 280,
		fillColour: 'red',
		radius: 25
	});

	scene = {
		stage: [],
		clear: function (canvas, context) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		},
		draw: function (canvas, context) {
			scene.clear(canvas, context);

			for (var i = 0; i < scene.stage.length; i++) {
				scene.stage[i].draw();
			}
		}
	};

	scene.stage.push(background, enemy1main, enemy2main, begin, instructions, instructions2, gameTitle);

	game = false;

	if(!request) {
		gameLoop();
	}
}
MainMenu();

function Start(){
	canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    keys = {};
    playerBullets = [];
    enemyBullets = [];
    game = true;
    health = 100;
    enemiesKilled = 0;
    theLevel = 0;
    playerScore = 0;
    hasWon = false;
    mainMenu = false;

	var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	healthBar = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 150,
		height: 20,
		fillColour: 'green'
	});

	healthBarBack = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 200,
		height: 20,
		fillColour: 'red'
	});

	enemy1 = new Entity({
		context: context,
		type: 'enemy',
		x: 100,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy2 = new Entity({
		context: context,
		type: 'enemy',
		x: 200,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy3 = new Entity({
		context: context,
		type: 'enemy',
		x: 300,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy4 = new Entity({
		context: context,
		type: 'enemy',
		x: 400,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy5 = new Entity({
		context: context,
		type: 'enemy',
		x: 500,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy6 = new Entity({
		context: context,
		type: 'enemy',
		x: 600,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy7 = new Entity({
		context: context,
		type: 'enemy',
		x: 700,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	player = new Player({
		context: context,
		x: canvas.width/2,
		y: 550,
		radius: 25
	});

	scene = {
		stage: [],
		clear: function (canvas, context) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		},
		draw: function (canvas, context) {
			scene.clear(canvas, context);

			for (var i = 0; i < scene.stage.length; i++) {
				scene.stage[i].draw();
			}
		}
	};

	scene.stage.push(
		background,
		player,
		enemy1,
		enemy2,
		enemy3,
		enemy4,
		enemy5,
		enemy6,
		enemy7,
		healthBarBack,
		healthBar

	);

	enemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7];

	game = true;

	if(!request) {
		gameLoop();
	}
}

function enemyMove(){
	if(enemiesKilled < 7){
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].x >= 0){
				enemies[i].x += 1;
			}
			if(enemies[i].x >= canvas.width){
				enemies[i].x = 0;
			}
		}
	}
	if(enemiesKilled >= 7 && enemiesKilled < 14){
		for(var i = 0; i < enemies.length; i++){
			if(i % 2){
				if(enemies[i].x >= 0){
					enemies[i].x += 2;
				}
				if(enemies[i].x >= canvas.width){
					enemies[i].x = 0;
				}
			} else {
				if(enemies[i].x >= 0){
					enemies[i].x -= 2;
				}
				if(enemies[i].x <= 0){
					enemies[i].x = canvas.width;
				}
			}
		}
	}
	if(enemiesKilled >= 14){
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].type == 'boss'){
				if(enemies[i].x >= 0){
					enemies[i].x += .5;
				}
				if(enemies[i].x >= canvas.width){
					enemies[i].x = 0;
				}
			} else {
				if(enemies[i].x >= 0){
					enemies[i].x += 1;
				}
				if(enemies[i].x >= canvas.width){
					enemies[i].x = 0;
				}
			}
		}
	}

}

function Health(){
	if(health >= 0) {
		healthBar.width = (health / 100) * 200;
	}
	if(health <= 0){
		game = false;
		gameOver();
	}
}

function level2(){
    game = true;

	var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	healthBar = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 150,
		height: 20,
		fillColour: 'green'
	});

	healthBarBack = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 200,
		height: 20,
		fillColour: 'red'
	});

	enemy1 = new Entity({
		context: context,
		type: 'enemy',
		x: 100,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy2 = new Entity({
		context: context,
		type: 'enemy',
		x: 200,
		y: 200,
		fillColour: 'red',
		radius: 25
	});

	enemy3 = new Entity({
		context: context,
		type: 'enemy',
		x: 300,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy4 = new Entity({
		context: context,
		type: 'enemy',
		x: 400,
		y: 200,
		fillColour: 'red',
		radius: 25
	});

	enemy5 = new Entity({
		context: context,
		type: 'enemy',
		x: 500,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	enemy6 = new Entity({
		context: context,
		type: 'enemy',
		x: 600,
		y: 200,
		fillColour: 'red',
		radius: 25
	});

	enemy7 = new Entity({
		context: context,
		type: 'enemy',
		x: 700,
		y: 100,
		fillColour: 'red',
		radius: 25
	});

	scene.stage.push(
		enemy1,
		enemy2,
		enemy3,
		enemy4,
		enemy5,
		enemy6,
		enemy7,
		healthBarBack,
		healthBar
	);

	enemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7];
}

function level3(){
    game = true;
    bossHit = 0;

	var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	healthBar = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 150,
		height: 20,
		fillColour: 'green'
	});

	healthBarBack = new Rectangle({
		context: context,
		x: 10,
		y: 10,
		width: 200,
		height: 20,
		fillColour: 'red'
	});

	enemy1 = new Entity({
		context: context,
		type: 'enemy',
		x: 100,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy2 = new Entity({
		context: context,
		type: 'enemy',
		x: 200,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy3 = new Entity({
		context: context,
		type: 'enemy',
		x: 300,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy4 = new Entity({
		context: context,
		type: 'enemy',
		x: 400,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy5 = new Entity({
		context: context,
		type: 'enemy',
		x: 500,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy6 = new Entity({
		context: context,
		type: 'enemy',
		x: 600,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	enemy7 = new Entity({
		context: context,
		type: 'enemy',
		x: 700,
		y: 250,
		fillColour: 'red',
		radius: 25
	});

	boss = new Circle({
		context: context,
		type: 'boss',
		x: canvas.width/2,
		y: 100,
		fillColour: 'yellow',
		radius: 80
	});

	scene.stage.push(
		enemy1,
		enemy2,
		enemy3,
		enemy4,
		enemy5,
		enemy6,
		enemy7,
		boss,
		healthBarBack,
		healthBar
	);

	enemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, boss];
}

function Win(){
	canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    keys = {};
    playerBullets = [];
    enemyBullets = [];
    health = 100;
    enemiesKilled = 0;
    theLevel = 0;
    hasWon = true;

	var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	var gameTitle = new Text({
		context: context,
		x: canvas.width / 2,
		y: 100,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Welcome to Blobzorz',
		textAlign: 'center'
	});

	var winning = new Text({
		context: context,
		x: canvas.width / 2,
		y: 200,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'You Win!!',
		textAlign: 'center'
	});

	var score = new Text({
		context: context,
		x: canvas.width / 2,
		y: 300,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Score: ' + playerScore,
		textAlign: 'center'
	});

	var begin = new Text({
		context: context,
		x: canvas.width / 2,
		y: 400,
		font: '70px Avenir',
		fillStyle: '#FFF',
		text: 'Main Menu',
		textAlign: 'center'
	});

	var gameTitle = new Text({
		context: context,
		x: canvas.width / 2,
		y: 100,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Welcome to Blobzorz',
		textAlign: 'center'
	});

	var enemy1main = new Entity({
		context: context,
		type: 'enemy',
		x: 300,
		y: 200,
		fillColour: 'purple',
		radius: 25
	});

	var enemy2main = new Entity({
		context: context,
		type: 'enemy',
		x: 380,
		y: 280,
		fillColour: 'red',
		radius: 25
	});

	scene = {
		stage: [],
		clear: function (canvas, context) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		},
		draw: function (canvas, context) {
			scene.clear(canvas, context);

			for (var i = 0; i < scene.stage.length; i++) {
				scene.stage[i].draw();
			}
		}
	};

	scene.stage.push(background, enemy1main, enemy2main, gameTitle, score, winning, begin);

	game = false;

	if(!request) {
		gameLoop();
	}
}

function gameOver(){
	canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    keys = {};
    playerBullets = [];
    enemyBullets = [];
    health = 100;
    enemiesKilled = 0;
    theLevel = 0;
    hasLost = true;

	var background = new Rectangle({
		context: context,
		width: canvas.width,
		height: canvas.height,
		fillColour: "#000"
	});

	var gameTitle = new Text({
		context: context,
		x: canvas.width / 2,
		y: 100,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Welcome to Blobzorz',
		textAlign: 'center'
	});

	var winning = new Text({
		context: context,
		x: canvas.width / 2,
		y: 200,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Game Over',
		textAlign: 'center'
	});

	var score = new Text({
		context: context,
		x: canvas.width / 2,
		y: 300,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Score: ' + playerScore,
		textAlign: 'center'
	});

	var begin = new Text({
		context: context,
		x: canvas.width / 2,
		y: 400,
		font: '70px Avenir',
		fillStyle: '#FFF',
		text: 'Main Menu',
		textAlign: 'center'
	});

	var gameTitle = new Text({
		context: context,
		x: canvas.width / 2,
		y: 100,
		font: '48px Avenir',
		fillStyle: '#FFF',
		text: 'Welcome to Blobzorz',
		textAlign: 'center'
	});

	var enemy1main = new Entity({
		context: context,
		type: 'enemy',
		x: 300,
		y: 200,
		fillColour: 'purple',
		radius: 25
	});

	var enemy2main = new Entity({
		context: context,
		type: 'enemy',
		x: 380,
		y: 280,
		fillColour: 'red',
		radius: 25
	});

	scene = {
		stage: [],
		clear: function (canvas, context) {
			context.clearRect(0, 0, canvas.width, canvas.height);
		},
		draw: function (canvas, context) {
			scene.clear(canvas, context);

			for (var i = 0; i < scene.stage.length; i++) {
				scene.stage[i].draw();
			}
		}
	};

	scene.stage.push(background, enemy1main, enemy2main, gameTitle, score, winning, begin);

	game = false;

	if(!request) {
		gameLoop();
	}
}

function gameLoop(){
	if(game){
		keyboard();
		Health();
		enemyMove();
		enemyShoot();
		bulletMove();
		playerHit();
		enemyHit();
		if(enemiesKilled >= 7 && theLevel == 0){
			setTimeout(level2, 2000);
			theLevel++;
		} else if(enemiesKilled >= 14 && theLevel == 1){
			setTimeout(level3, 2000);
			theLevel++;
		} else if(enemiesKilled >= 22 && theLevel == 2){
			Win();
			theLevel++;
		}
	}
	if(!game && health >=1){
		if(scene.stage[1].y >= 0){
			scene.stage[1].y += 1;
		}
		if(scene.stage[1].y == canvas.height){
			scene.stage[1].y = 0;
		}

		if(scene.stage[2].x >= 0){
			scene.stage[2].y -= 2;
		}
		if(scene.stage[2].y <= 0){
			scene.stage[2].y = canvas.height;
		}
	}

	if(!game && health <= 0){
		scene.stage.clear;
	}

	// Redraw Canvas
	scene.draw(canvas, context);
	// Wait, then repeat
	request = requestAnimFrame(gameLoop);

	// Restart
	if(keys[82] && health <=0) {
		window.cancelAnimFrame(request);
		request = false;

		Start();
	}
}
gameLoop();

function keyboard(){
	// Left
	if(keys[65]){
		if(player.x <= 35) {
			player.x = 36;
		}
		player.x -= 2;
	}

	// Right
	if(keys[68]){
		if(player.x >= canvas.width - 35) {
			player.x = canvas.width - 36;
		}
		player.x += 2;
	}

	// Up
	if(keys[87]){
		if(player.y <= canvas.height -150) {
			player.y = canvas.height -150;
		}
		player.y -= 2;
	}

	// Down
	if(keys[83]){
		if(player.y >= canvas.height -40) {
			player.y = canvas.height -40;
		}
		player.y += 2;
	}

	//Shoot Bullet
	if(keys[32]){
		playerShoot();
	}
}

function bulletMove(){
	for(var i = 0; i < playerBullets.length; i++){
		playerBullets[i].y-= 2;
	}
	for(var i = 0; i < enemyBullets.length; i++){
		if(enemyBullets[i].type != 'bossBullet'){
			enemyBullets[i].y+= 2;
		} else if(enemyBullets[i].type == 'bossBullet'){
			enemyBullets[i].y+= 1.2;
			if(enemyBullets[i].x < player.x){
				enemyBullets[i].x++;
			} else if(enemyBullets[i].x > player.x){
				enemyBullets[i].x--;
			} else if(enemyBullets[i].x == player.x){

			}
		}

	}

	for(var i = 0; i < playerBullets.length; i++){
		if(playerBullets[i].y < 0 || playerBullets[i].y + playerBullets[i].radius > canvas.height + 10) {
			scene.stage.splice(scene.stage.indexOf(playerBullets[i]), 1);
			playerBullets.splice(i, 1);
		}
	}

	for(var i = 0; i < enemyBullets.length; i++){
		if(enemyBullets[i].y < 0 || enemyBullets[i].y + enemyBullets[i].radius > canvas.height + 10) {
			scene.stage.splice(scene.stage.indexOf(enemyBullets[i]), 1);
			enemyBullets.splice(i, 1);
		}
	}
}

function playerHit(){
	for(var i = 0; i < enemyBullets.length; i++){
		if(enemyBullets[i].type != 'bossBullet'){
			if(collision(player, enemyBullets[i])){
				scene.stage.splice(scene.stage.indexOf(enemyBullets[i]), 1);
				enemyBullets.splice(i, 1);
				health = health - 10;
				playerScore = playerScore - 5;
			}
		} else if(enemyBullets[i].type == 'bossBullet'){
			if(collision(player, enemyBullets[i])){
				scene.stage.splice(scene.stage.indexOf(enemyBullets[i]), 1);
				enemyBullets.splice(i, 1);
				health = health - 20;
				playerScore = playerScore - 10;
			}
		}

	}
}

function enemyHit(){
	for(var a = playerBullets.length -1; a >= 0; a--){
		for(var i = enemies.length -1; i >= 0; i--){
			if(playerBullets.length != 0){
				if(enemies[i].type == 'enemy' && collision(enemies[i], playerBullets[a])){
					scene.stage.splice(scene.stage.indexOf(enemies[i]), 1);
					enemies.splice(i, 1);
					scene.stage.splice(scene.stage.indexOf(playerBullets[a]), 1);
					playerBullets.splice(a, 1);
					enemiesKilled++;
					if(health < 80){
						health = health + 8;
					}
					playerScore += 10;
				} else if(enemies[i].type == 'boss' && collision(enemies[i], playerBullets[a])){
					if(bossHit < 30){
						scene.stage.splice(scene.stage.indexOf(playerBullets[a]), 1);
						playerBullets.splice(a, 1);
						bossHit++;
						enemies[i].radius-= 2;
						enemies[i].x += 2;
						playerScore += 5
					} else {
						scene.stage.splice(scene.stage.indexOf(enemies[i]), 1);
						enemies.splice(i, 1);
						scene.stage.splice(scene.stage.indexOf(playerBullets[a]), 1);
						playerBullets.splice(a, 1);
						enemiesKilled++;
						playerScore += 50;
					}
				}
			}
		}
	}
}

function enemyShoot(){
	if(canEnemyFire){
		canEnemyFire = false;

		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].type != 'boss'){
				var enemyBullet = new Circle({
					context: context,
					radius: 5,
					fillColour: 'red',
					type: 'enemyBullet'
				});
				enemyBullet.x = enemies[i].x;
				enemyBullet.y = enemies[i].y + 30;
				enemyBullets.push(enemyBullet);
				scene.stage.push(enemyBullet);
			} else if(enemies[i].type == 'boss'){
				var enemyBullet = new Circle({
					context: context,
					radius: 10,
					fillColour: 'yellow',
					type: 'bossBullet'
				});
				enemyBullet.x = enemies[i].x;
				enemyBullet.y = enemies[i].y + 30;
				enemyBullets.push(enemyBullet);
				scene.stage.push(enemyBullet);
			}
		}

		window.setTimeout(function(){
			canEnemyFire = true;
		}, 1500);
	}
}

function playerShoot(){
	if(canFire){
		canFire = false;

		var bullet = new Circle({
			context: context,
			radius: 5,
			x: player.x,
			y: player.y - 30,
			type: 'playerBullet',
			fillColour: 'green'
		});

		playerBullets.push(bullet);
		scene.stage.push(bullet);

		window.setTimeout(function(){
			canFire = true;
		}, 200);
	}
}

function collision(c1, c2) {
	if (c1.x && c1.y && c2.x && c2.y) {
        var a = c1.x - c2.x;
        var b = c1.y - c2.y;
        var c = c1.radius + c2.radius;

        return (a*a + b*b <= c*c)
    }

    return -1;
}
// http://strd6.com/2010/06/circular-collision-detection-in-javascript/ Edited variables

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

window.onkeydown = function(e) {
	keys[e.which] = true;
	e.preventDefault();
};

window.onkeyup = function(e) {
	keys[e.which] = false;
};

window.setInterval(function(){
	if(game){
		playerScore -= 10;
	}
}, 5000);

canvas.addEventListener('click', function(evt) {
	var mousePos = getMousePos(canvas, evt);
	if(mousePos.x > 422 && mousePos.x < 570 && mousePos.y > 352 && mousePos.y < 406){
		if(!game){
			if(mainMenu){
				window.cancelAnimFrame(request);
				request = false;

				Start();
			} else if(hasWon){
				window.cancelAnimFrame(request);
				request = false;

				MainMenu();
			} else if(hasLost){
				window.cancelAnimFrame(request);
				request = false;

				MainMenu();
			}
		}
	}
});
