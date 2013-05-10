/**
 * @author Michael Waterworth
 * @version 2012-12-5
*/

define(["./Asteroid", "./Powerup", "./Bullet", "./Player", "./Satellite", "./LaserGrid", "./starField"], function(Asteroid, Powerup, Bullet, Player, Satellite, LaserGrid, starField){

"use strict";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

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
 * @return {boolean} Whether the objects collided.
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

/* Code to go inside the App - Check within AONB */
function pnpoly( nvert, vertx, verty, testx, testy ) {
    var i, j, c = false;
    for(i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                c = !c;
        }
    }
    return c;
}

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}

function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
	var s1_x, s1_y, s2_x, s2_y;
	s1_x = p1_x - p0_x; s1_y = p1_y - p0_y; s2_x = p3_x - p2_x;
	s2_y = p3_y - p2_y;
	var s, t;
	s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {// Collision detected
		var intX = p0_x + (t * s1_x);
		var intY = p0_y + (t * s1_y);
		return [intX, intY];
	}
	return null;// No collision
}

function checkLineCollision(a, b) {
	if(!a){
		return false;
	}
	//a is the object that holds the line
	if(!a.laserTo){
		return false;
	}
	var line1 = {
		point: [
			{
				x: a.position[0],
				y: a.position[1]
			},
			{
				x: a.laserTo.position[0],
				y: a.laserTo.position[1]
			}
		]
	};
	//line1.angle = calcAngle(line1.point[0].x, line1.point[1].x, line1.point[0].y, line1.point[1].y);
	//line1.distance = lineDistance(line1.point[0], line1.point[1]);

	//Create line that extends from current Asteroid out to the line

	var line2 = {
		point: [
			{
				x: b.position[0],
				y: b.position[1]
			},
			{
				x: b.position[0] + (b.direction[0] * 10),
				y: b.position[1] + (b.direction[1] * 10)
			}
		]
	};

	var hit = getLineIntersection(
		line1.point[0].x,
		line1.point[0].y,
		line1.point[1].x,
		line1.point[1].y,

		line2.point[0].x,
		line2.point[0].y,
		line2.point[1].x,
		line2.point[1].y
	);
	if(hit){
		a.hit();
		b.hit();
	}
	return hit;
	// if(!(
 //        ((a.position[1] + a.object.element.height) < (b.position[1])) ||
 //        (a.position[1] > (b.position[1] + b.object.element.height)) ||
 //        ((a.position[0] + a.object.element.width) < b.position[0]) ||
 //        (a.position[0] > (b.position[0] + b.object.element.width))
	// )){
	// 	a.hit();
	// 	b.hit();
	// 		//console.log('Hit between', a, b);//replace with player health decrement
	// 	return true;
 //    }
    //return false;
}

/**
 * Create a set number of asteroids in the level at random locations
 *
 * @param {number} num Number of Asteroid objects to create
 */
function createLevelAsteroids(num) {
	function position(){
		var arr = [
					game.width * Math.random(),
					game.height * Math.random()
		];
		/*
		game.viewport = {
			x: 5000,
			y: 5000,
			height: window.innerHeight,
			width: window.innerWidth
		};
		*/
		if(arr[0] > game.viewport.x && arr[0] < game.viewport.x + game.viewport.width){
			if(arr[1] > game.viewport.y && arr[1] < game.viewport.y + game.viewport.height){
				return position();

			}
		}
		return arr;
	}

	var ii = 0;
	var types = ['rock','fuel','metal'];
	while (ii < num) {
		var type = types[(Math.random() > 0.9 ? 1: 0) + (Math.random() > 0.5 ? 1: 0)];
		game.asteroids.push(
			new Asteroid({
				velocity: (Math.random() + 0.1),
				weight: 5+20*Math.random(),
				direction: [],
				rotationspeed: (Math.random() + 0.3 * 40),
				position: position(),
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
		lasergrid = [],//lasergrid array
		settings = {
			audio: false,
			asteroids: 300,
			starField: false
		},
		zoom =  1,
		viewport = {//Holds information about the current world viewport
			x: 0,
			y: 0,
			height: window.innerHeight,
			width: window.innerWidth
		},
		player,
		webaudio = new WebAudio();//Used to play audio when firing etc

	function resize() {
		game.viewport.height = window.innerHeight / game.zoom;
		game.viewport.width = window.innerWidth / game.zoom;
		if(game.settings.starField){
			starField.resize();
		}
	}

	function miniMap(){
		var mm = document.getElementById('minimap');
		var cx = mm.getContext('2d');
		mm.height = 100;
		mm.width = 100;
		//Fill rect
		cx.fillStyle = '#0f0';
		cx.fillRect(0,0,100,100);

		//Draw user object
		cx.beginPath();
		cx.arc((game.player.position[0] / game.width)*100, (game.player.position[1] / game.height)*100, 2/*Radius*/, 0, 2 * Math.PI, false);
		cx.fillStyle = 'green';
		cx.fill();


		for (var i=0; i < satellites.length; i++) {
			cx.beginPath();
			cx.arc((satellites[i].position[0] / game.width)*100, (satellites[i].position[1] / game.height)*100, 2/*Radius*/, 0, 2 * Math.PI, false);
			cx.fillStyle = 'black';
			cx.fill();
		}

		// context.lineWidth = 5;
		// context.strokeStyle = '#003300';
		// context.stroke();
	}

	window.onresize = resize;

	/**
		Main game loop. All actions stem from this loop.
	*/
	function loop() {
		if(game.oldTime){
			game.oldTime = game.newTime;
		} else {
			game.oldTime = new Date().getTime();
		}
		game.newTime = new Date().getTime();
		game.delta = (game.newTime - game.oldTime)/1000;//Measured in seconds
		fps.registerFPS((1000 / game.delta)/1000);
		gameLoop = requestAnimationFrame(loop);
		game.player.move(game);

		var i, ii;

		//Animate Asteroids
		for (i=0; i < asteroids.length; i++) {
			asteroids[i].rotate(game);
			asteroids[i].move(game);
		}

		for (i=0; i < asteroids.length; i++) {
			if(asteroids[i].checkOutWorld(game, 200)){
				asteroids[i].del();
			}
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

		//Animate LaserGrid
		for (i=0; i < lasergrid.length; i++) {
			lasergrid[i].move(game);//Move lasergrid
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
			ii = 0;
			i++;
		}

		//Check for collisions between user and asteroids
		i=0;
		while (i < game.asteroids.length) {
			if(!checkCollision(game.asteroids[i], game.player)){
				i++;
			}
		}//Check for hits

		game.miniMap();

		if (game.asteroids.length < game.settings.asteroids) {
			createLevelAsteroids(game.settings.asteroids - game.asteroids.length);
		}

		$('#asteroidsleft').text('Asteroids: ' + game.asteroids.length);//Debugging
		$('#userposition').text('Player: ' + game.player.position);//Debugging
		$('#bulletsleft').text('Bullets: ' + game.bullets.length);//Debugging
	}

	function scale(scl){
		$('#playspace').animate({zoom:scl}, {step: function(scl){
			game.zoom = scl;
			game.resize();
		}});

		//document.getElementById('playspace').style.zoom = scl;
		//game.zoom = scl;

		//game.resize();
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
			case 76:
				game.player.deployLaserGrid();
				break;
		}
	});

	//Move Asteroids & bullets
	function moveViewport(mvprt){

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
		if(game.settings.starField){
			starField.move(mvprt.x, mvprt.y);
		}
		$('#viewport').text(parseInt(game.viewport.x, 10) + ', ' + parseInt(game.viewport.y, 10));//Debugging
	}

	function start(){
		$('#playspace').html('');//Clear previous characters
		window.clearInterval(gameLoop);

		game.viewport = {
			x: 5000,
			y: 5000,
			height: window.innerHeight,
			width: window.innerWidth
		};

		createLevelAsteroids(game.settings.asteroids);


		if(game.settings.starField){
			starField.start();
		}

		game.player = new Player({
			position: [
				game.viewport.width / 2 + game.viewport.x,
				game.viewport.height / 2 + game.viewport.y
			]
		});
		game.player.shieldsOnOff(true, 4000);

		// window.setTimeout(function(){
		// 	starField.move(0,0);
		// },50);

		gameLoop = requestAnimationFrame(loop);

		if(game.settings.starField){
			gameLoop = window.setInterval(
				loop, 33
			);
		}
	}

	function stop(){
		window.cancelAnimationFrame(gameLoop);
		if(game.settings.starField){
		 	starField.stop();
		}
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

	$('#minimap').click(function(e){
		game.player.to({x:e.offsetX * 100, y: e.offsetY * 100})
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
		lasergrid: lasergrid,
		asteroids: asteroids,
		powerups: powerups,
		player: player,
		moveViewport: moveViewport,
		viewport: viewport,
		lineDistance: lineDistance,
		angleDistance: angleDistance,
		calcAngle: calcAngle,
		load: load,
		scale: scale,
		webaudio: webaudio,
		settings: settings,
		zoom: zoom,
		resize: resize,
		miniMap: miniMap
	};

})();

game.load();

});