/**
 * @author Michael Waterworth
 * @version 2012-12-5
*/

define(["./Asteroid", "./Powerup", "./Bullet", "./Player", "./Satellite", "./starField"], function(Asteroid, Powerup, Bullet, Player, Satellite, starField){

"use strict";

(function() {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

/**
 * Measure distance between two points
 *
 * @param {Object} point1 object with x and y values for coordinates
 * @param {Object} point2 object with x and y values for coordinates
 * @return {number} The distance between the two points.
 */
function lineDistance(point1, point2){
	var xs = 0;
	var ys = 0;

	xs = point2.x - point1.x;
	xs = xs * xs;

	ys = point2.y - point1.y;
	ys = ys * ys;

	return Math.sqrt( xs + ys );
}


/**
 * Calculate angle between two points
 *
 * @param {number} x1 x coordinate of first point
 * @param {number} x2 x coordinate of second point
 * @param {number} y1 y coordinate of first point
 * @param {number} y2 y coordinate of second point
 * @return {number} The angle between the two points. 0 - 360 degrees
 */
function calcAngle(x1, x2, y1, y2){
	var angle = Math.atan2(x1-x2,y1-y2)*(180/Math.PI);
	if (angle < 0) {
		angle = Math.abs(angle);
	} else {
		angle = 360 - angle;
	}
	return angle;
}

/**
 * Calculate position from distance and angle
 *
 * @param {number} distance distance from point
 * @param {number} angle angle from point
 * @return {array} The x,y coordinates of new point.
 */
function angleDistance(distance, angle){
	// var vectorX = distance * Math.cos(angle * (Math.PI/180));
	// var vectorY = distance * Math.sin(angle * (Math.PI/180));
	var x = distance * Math.cos(angle * (Math.PI/180));
	x = parseInt(x, 10);
    var y = distance * Math.sin(angle * (Math.PI/180));
    y = parseInt(y, 10);
	return [x, y];
}

/**
 * Check collision between two objects with position and width / height variables
 *
 * based on code from http://stackoverflow.com/questions/2440377/javascript-collision-detection
 * @param {object} a Object A to compare. Must match pattern {position:[],width:0,height:0}
 * @param {object} b Object B to compare. Must match pattern {position:[],width:0,height:0}
 * @fires Fires hit function on both objects if a collision has occurred.
 * @return {boolean} Wether the objects collided.
 */
function checkCollision(a, b) {
	if(!(
        ((a.position[1] + a.object.element.height) < (b.position[1])) ||
        (a.position[1] > (b.position[1] + b.object.element.height)) ||
        ((a.position[0] + a.object.element.width) < b.position[0]) ||
        (a.position[0] > (b.position[0] + b.object.element.width))
	)){
		a.hit();
		b.hit();
			//console.log('Hit between', a, b);//replace with player health decrement
		return true;
    }
    return false;
}

/**
 * Create a set number of asteroids in the level at random locations
 *
 * @param {number} value Number of Asteroid objects to create
 */
function createLevelAsteroids(value) {
	var ii = 0;
	var types = ['rock','fuel','metal'];
	while (ii < value) {
		var type = types[(Math.random() > 0.9 ? 1: 0) + (Math.random() > 0.5 ? 1: 0)];
		game.asteroids.push(
			new Asteroid({
				velocity: (Math.random() + 0.1),
				weight: 5+20*Math.random(),
				direction: [],
				rotationspeed: (Math.random() + 0.3 * 40),
				position: [
					game.width * Math.random(),
					game.height * Math.random()
				],
				type: type
			})//Speed / Weight / RotationSpeed / Position / type / real
		);
		ii++;
	}
}

/**
 * Main game object. Controls all sprites and objects
 */
window.game = (function(){
	var keysPressed = {},//Key presses are only logged in this variable until the event loop fires.
		width = 10000,//Width of game world
		height = 10000,//Heigt of game world
		gameLoop,//Variable to store the intervalID
		bullets = [],//Bullets array
		asteroids = [],//Asteroids array
		powerups = [],//Powerups array
		satellites = [],//Satellites array
		viewport = {//Holds information about the current world viewport
			x: 0,
			y: 0,
			height: window.innerHeight,
			width: window.innerWidth
		},
		player,
		webaudio = new WebAudio();//Used to play audio when firing etc

	window.onresize = function() {
		game.viewport.height = window.innerHeight;
		game.viewport.width = window.innerWidth;
		starField.resize();
	};

	/**
		Main game loop. All actions stem from this loop.
	*/
	function loop() {
		game.player.move(game);

		var i, ii;

		//Animate Asteroids
		for (i=0; i < asteroids.length; i++) {
			asteroids[i].rotate();
			asteroids[i].move(game);
		}

		//Animate Powerups
		for (i=0; i < powerups.length; i++) {
			powerups[i].move(game);
			if(checkCollision(game.player, powerups[i])){
				//Player's life will be decremented...
			}
		}

		//Animate Satellites
		for (i=0; i < satellites.length; i++) {
			satellites[i].turnAuto(game);//Move satellites
			satellites[i].move(game);//Move satellites
		}

		//Animate bullets
		for (i=0; i < bullets.length; i++) {
			if (bullets[i].move(game)) {//Remove bullet if it's hit the game bounds
				bullets.splice(i, 1);
			} 
		}
		
		//Check for collisions between bullets and asteroids
		ii=0;
		for (i=0; i < bullets.length; i++) {
			ii = 0;
			while (ii < asteroids.length) {
				if(checkCollision(asteroids[ii], bullets[i])){
					break;
				} else {
					ii++;
				}
			}
		}

		//Check for collisions between satellites and asteroids
		i=0;
		ii=0;
		while (i < satellites.length) {
			while (ii < asteroids.length) {
				if(checkCollision(asteroids[ii], satellites[i])){
					i--;
					break;
				} else {
					ii++;
				}
			}
			i++;
		}
		
		//Check for collisions between user and asteroids
		i=0;
		while (i < game.asteroids.length) {
			if(!checkCollision(game.asteroids[i], game.player)){
				i++;
			}
		}//Check for hits

		$('#asteroidsleft').text('Asteroids: ' + game.asteroids.length);//Debugging
		$('#bulletsleft').text('Bullets: ' + game.bullets.length);//Debugging
	}


	/**
	Register keyboard down event handlers
	*/
	document.addEventListener('keydown', function (ev) {//Used to register key presses - no onkeyup - multipress?
		switch(ev.keyCode) {
			case 37://left
				if(!keysPressed[ev.keyCode])
					game.player.turn('anticlockwise');
				break;
			case 38://Up
				if(!keysPressed[ev.keyCode])
					game.player.forwards(true);
				break;
			case 39://right
				if(!keysPressed[ev.keyCode])
					game.player.turn('clockwise');
				break;
			case 40://Down
				// 	player.back();
				break;
			case 32://Spacebar
				if(!keysPressed[ev.keyCode])
					game.player.fire(true);//First firing
				break;
		}
		keysPressed[ev.keyCode] = true;
	});

	/**
	Register keyboard up event handlers
	*/
	document.addEventListener('keyup', function (ev) {//Used to register key presses - no onkeyup - multipress?
		keysPressed[ev.keyCode] = false;
		switch(ev.keyCode) {//console.log('press' + ev.keyCode);
			case 37://left
				game.player.cancelTurn('clockwise');
				break;
			case 38://Up
				game.player.forwards(false);
				break;
			case 39://right
				game.player.cancelTurn('anticlockwise');
				break;
			case 40://Down
				//player.back(false);
				break;
			case 32://Spacebar
				game.player.fire(false);
				break;
			case 83:
				game.player.deploySatellite();
				break;
		}
	});

	//Move Asteroids & bullets
	function moveViewport(mvprt){

		var hitBounds = false;

		if(game.viewport.x - mvprt.x < 0){
			game.viewport.x = 0;
			mvprt.x = 0;
		} else if(game.viewport.x - mvprt.x > 10000){
			game.viewport.x = 10000;
			mvprt.x = 0;
		}

		if(game.viewport.y - mvprt.y < 0){
			game.viewport.y = 0;
			mvprt.y = 0;
		} else if(game.viewport.y - mvprt.y > 10000){
			game.viewport.y = 10000;
			mvprt.y = 0;
		}

		game.viewport.x -= mvprt.x;
		game.viewport.y -= mvprt.y;

		starField.move(mvprt.x, mvprt.y);

		$('#viewport').text(parseInt(game.viewport.x, 10) + ', ' + parseInt(game.viewport.y, 10));//Debugging
	}

	function start(){
		$('#playspace').html('');//Clear previous characters
		window.clearInterval(gameLoop);

		createLevelAsteroids(250);

		game.viewport = {
			x: 5000,
			y: 5000
		};

		if(typeof starField != 'undefined'){
			starField.start();
		}

		game.viewport.height = window.innerHeight;
		game.viewport.width = window.innerWidth;
		game.player = new Player({
			position: [
				game.viewport.width / 2 + game.viewport.x,
				game.viewport.height / 2 + game.viewport.y
			]
		});
		game.player.shieldsOnOff(true, 4000);

		window.setTimeout(function(){
			starField.move(0,0);
		},50);

		gameLoop = window.setInterval(
			loop, 33
		);
	}

	function stop(){
		window.clearInterval(gameLoop);
		// if(typeof starField != 'undefined'){
		// 	starField.stop();
		// }
	}

	function end(){
		loadHighscores();//Load scores from the server.
		$('#endgold').text('Gold: ' + game.player.goldFormat());
		//Show users score
		$('#endgame').show();//Show end screen
	}

	function loadHighscores(){
		$.ajax('/scores', {
			type:'get',
			success: function(data){
				$("#scoreslist").html('');//Clear out element
				for (var i = 0; i < data.length; i++) {
					$("#scoreslist").append('<li>' + data[i].name + '-' + data[i].score + '</li>');
				}
			}
		});
	}

	function saveHighscores(){
		$.ajax('/scores', {
			type:'post',
			data: {
				'name': $('#username').val(),
				'score':game.player.gold
			},
			success: function(){
				loadHighscores();//Reload high scores
				$('#scoreform').html('<p>Thanks for submitting your score.</p>');
			}
		});
	}

	//Not overly keen on leaving this in here.
	//Should be moved out to a different location and hooked in
	$('#scoreform').submit(function(e){
		e.preventDefault();
		saveHighscores();
	});

	//Loading animation
	function load(){
		//Show splash screen
		$('#splashscreen').show();
		window.setTimeout(function(){
			$('#splashscreen').fadeOut(1000);
		}, 2000);
		start();
	}

	// - - - - - - - Expose the API to the world - - - - - -
	return {
		start: start,
		stop: stop,
		end: end,
		width: width,
		height: height,
		bullets: bullets,
		satellites: satellites,
		asteroids: asteroids,
		powerups: powerups,
		player: player,
		moveViewport: moveViewport,
		viewport: viewport,
		lineDistance: lineDistance,
		angleDistance: angleDistance,
		calcAngle: calcAngle,
		load: load,
		webaudio: webaudio
	};

})();

game.load();

});