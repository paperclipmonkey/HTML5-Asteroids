/*
Player inherit from Automiton but adds additional functionality like collecting powerups, shields and deploying satellites
*/
define(["js/Automiton", "js/Satellite", "js/LaserGrid"], function(Automiton, Satellite, LaserGrid) {
	var Player = Automiton.extend({
		init: function(obj){
			this._super(obj);
			this.velocity = 0;

			this.powerups = [];
			this.turns = '';
			this.width = 38;
			this.height = 44;
			this.canFire = true;

			this.shields = false;
			this.shieldsviewon = false;
			this._to = null;
			this.gold = 0;

			this.object = new this.Object(this.position, this.width, this.height);
			this.drawBase();
			this.healthBar();
		},

		healthBar: function(){
			//Draw element for Player
			this.healthElement = document.createElement('div');//Create new Canvas
			this.healthElement.style.position = "absolute";
			this.healthElement.id = "health";

			var healthIcon = document.createElement('img');//<img src="img/healthicon.png" alt="Health" id="healthicon"/>
			healthIcon.src = 'img/healthicon.png';
			healthIcon.alt = 'Health';
			healthIcon.id = 'healthicon';
			this.healthElement.appendChild(healthIcon);

			this.healthElementBar = document.createElement('div');
			this.healthElementBar.id = 'health-bar';
			this.healthElement.appendChild(this.healthElementBar);

			document.getElementById('playspace').appendChild(this.healthElement);
		},

		goldBar: function(){
			var goldEl = document.getElementById('goldcount');
			goldEl.innerText = "Gold: " + this.goldFormat();
		},

		goldFormat: function(){
			return ('' + this.gold).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");//Give it some commas
		},

		hit: function () {
			if(this.shields){//Can't get hit if shields are up.
				return;
			}
			this.health -= 10;
			this.healthElementBar.style.width = this.health + '%';
			if(this.health <= 0){
				this.die();
				return;
			} else {
				this.shieldsOnOff(true, 250);
			}
		},

		deploySatellite: function(){
			var radians = this.direction * (Math.PI/180);
			var directions = [];
			directions[0] = Math.sin(radians);
			directions[1] = Math.cos(radians);
			game.satellites.push(
				new Satellite({
				position: [
					this.position[0] + 8 - 30 * directions[0],
					this.position[1] + 8 + 30 * directions[1]//Width of bullet 6px
				]
				})
			);
		},

		deployLaserGrid: function(){
			var radians = this.direction * (Math.PI/180);
			var directions = [];
			directions[0] = Math.sin(radians);
			directions[1] = Math.cos(radians);
			game.lasergrid.push(
				new LaserGrid({
				position: [
					this.position[0] + 8 - 30 * directions[0],
					this.position[1] + 8 + 30 * directions[1]//Width of bullet 6px
				],
				laserTo: game.lasergrid[game.lasergrid.length-1]
				})
			);
		},

		addPowerup: function(powerup){
			this.powerups.push(powerup);
			if(powerup.type === 'p'){
				this.increaseHealth(30);
			} else if(powerup.type === 'm'){
				//Add to the users money.
				this.gold += 1000;
				this.goldBar();
			}
		},

		turn: function(direction){
			if(this.turns){//Turning Left and right
				this.turns = 'forward';
			} else {
				this.turns = direction;
			}
		},

		cancelTurn: function(direction){
			if(this.turns === 'forward'){
				if(direction === 'clockwise'){
					this.turns = 'clockwise';
				} else {
					this.turns = 'anticlockwise';
				}
			} else {
				this.turns = '';
			}
		},

		shieldsOnOff: function (onoff, time) {
			//this.shields = onoff;
			if(!onoff && this.shields === true){//Turning off. Flash.
				(function(player, onoff){
					window.setTimeout(function(){
						player.shieldsviewon = false;
						player.dirty = true;
					}, 250);
					window.setTimeout(function(){
						player.shieldsviewon = true;
						player.dirty = true;
					}, 500);
					window.setTimeout(function(){
						player.shieldsviewon = false;
						player.dirty = true;
					}, 750);
					window.setTimeout(function(){
						player.shieldsviewon = true;
						player.dirty = true;
					}, 900);
					window.setTimeout(function(){
						player.shieldsviewon = false;
						player.shields = false;
						player.dirty = true;
					}, 1000);
				})(this, onoff);
			} else {
				this.shieldsviewon = onoff;
				this.shields = onoff;
				this.dirty = true;

				if(time){
					(function(player, onoff){
						window.setTimeout(function(){
							player.shieldsOnOff(false);
						}, time);
					})(this);
				}
			}
		},

		drawBase: function(){
			var img = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.clearRect (0, 0, 100, 100);//Clear everything - Hacky putting it in the event call - Race condition :-s
					canvas.drawImage(img, 2, 2);
				};
			})(this.object.canvas, img);
			img.src = 'img/ship-1-base.png';
		},

		drawThrusters: function() {
			var img1 = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 6, 38);
					canvas.drawImage(img, 28, 38);

				};
			})(this.object.canvas, img1);
			img1.src = 'img/thruster-small.png';
		},

		drawShields: function() {
			var img1 = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 0, 0);
				};
			})(this.object.canvas, img1);
			img1.src = 'img/ship-base-shield.png';
		},

		goForwards: function (small) {
			if (this.velocity < 3600) {
				if(small === 'small'){
					this.velocity += 100;
				} else {
					this.velocity += 200;
				}
			}
		},

		goBackwards: function () {
			if (this.velocity > -1600) {//Lower limit
				this.velocity -= 200;
			}
		},

		to: function (obj){
			this._to = obj;
		},

		move: function (game) {//Moving player forward
			if(this.thrusters){
				this.goForwards();
			}

			if(this._to){
				this.toLocation(this._to);
			}

			this.draw();

			if(this.turns){
				this.goTurn(this.turns, game);
			}

			if(this.fires){
				this.goFire();
			}

			if (this.orientation === 360) {
				this.orientation = 0;
			}
			var directions = [];
			this.direction = this.orientation;
			directions[0] = Math.sin(this.direction / 57.3);
			directions[1] = Math.cos(this.direction / 57.3);

			this.position[0]  += parseInt(((this.velocity * (directions[0])))*game.delta, 10)/10;
			this.position[1] -= parseInt(((this.velocity * (directions[1])))*game.delta, 10)/10;

			// - - - - - - - - - - - - - Move Viewport - - - - - - - - - - - - -
			var mvprt = {
				x: 0,
				y: 0
			};

			if(this.position[1] < (game.viewport.y + game.viewport.height/2 - 100)){//Move world
				mvprt.y = (game.viewport.y + game.viewport.height/2 - 100) - this.position[1];
			} else if(game.viewport.y + this.position[1] > (game.viewport.height/2 + 100)){//Move world
				mvprt.y = (game.viewport.y + game.viewport.height/2 + 100) - this.position[1];
			}

			if(this.position[0] < (game.viewport.x + game.viewport.width/2 - 100)){//Move world
				mvprt.x = (game.viewport.x + game.viewport.width/2 - 100) - this.position[0];
			} else if(this.position[0] > (game.viewport.x + game.viewport.width/2 + 100)){//Move world
				mvprt.x = (game.viewport.x + game.viewport.width/2 + 100) - this.position[0];
			}

			if(mvprt.x || mvprt.y){
				game.moveViewport(mvprt);
			}

			this.object.element.style.left = this.position[0] - game.viewport.x;//Horizontal
			this.object.element.style.top = this.position[1] - game.viewport.y;//Vertical

			this.inertia();
		},

		inertia: function () {
			if (this.velocity > -100 && this.velocity < 100) {
				this.velocity = 0;
			} else if (this.velocity < 1001) {
				this.velocity -= 50;
			} else if (this.velocity > 1000) {
				this.velocity -= 100;
			} else if (this.velocity < 0) {//Decrement velocity - Slow down
				this.velocity += 20;
			}//if going backwards also slow down
		},

		die: function () {//player has been killed
			game.stop();
			game.end();
		}
	});

	return Player;

});