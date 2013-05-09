define(["js/Automiton"], function(Automiton) {
	var Satellite = Automiton.extend({
		init: function(obj) {//object from JSON
			this._super(obj);

			this.width = 20;
			this.height = 22;
			this.canFire = true;
			this.fires = true;

			this.object = new this.Object(this.position, this.width, this.height);
			this.drawBase();
			this.healthBar();
		},

		healthBar: function(){
			//Draw element above Satellite
			this.healthElement = document.createElement('div');//Create new Canvas
			this.healthElement.style.position = "absolute";
			this.healthElement.style.left = this.position[0] - 5 - game.viewport.x;
			this.healthElement.style.top = this.position[1] - 8 - game.viewport.y;
			this.healthElement.className += ' health-small';

			this.healthElementBar = document.createElement('div');
			this.healthElementBar.className += ' health-bar-small';
			this.healthElement.appendChild(this.healthElementBar);

			document.getElementById('playspace').appendChild(this.healthElement);
		},

		hit: function () {
			this.health -= 50;
			if(this.health <= 0){
				this.die();
				return;
			}
			this.healthElementBar.style.width = this.health + '%';
		},

		turnAuto: function (game) {
			//Work out the closest Asteroid
			var distances = [];
			for (var i = game.asteroids.length - 1; i >= 0; i--) {
				distances.push({
					distance: game.lineDistance({
						x:this.position[0],
						y:this.position[1]
					},
					{
						x:game.asteroids[i].position[0],
						y:game.asteroids[i].position[1]
					}),
					direction: game.calcAngle(
						this.position[0],
						game.asteroids[i].position[0],
						this.position[1],
						game.asteroids[i].position[1]
					)
				});
			}
			distances.sort(function(a, b){
				return (a.distance - b.distance); //causes an array to be sorted numerically and ascending
			});

			closest = distances[0];
			this.fire(false);

			//turn towards closest asteroid
			var leftright = closest.direction - this.orientation;
			if(leftright > 180){
				this.goTurn('anticlockwise', game);
			} else if(leftright > 5){
				this.goTurn('clockwise', game);
			} else if(leftright < -5){
				this.goTurn('anticlockwise', game);
			} else {
				if(closest.distance <= 500){//Don't fire too far
					this.fire(true);//pointing in the right direction
				}
			}
			return closest;
		},

		drawBase: function(){
			var img = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.clearRect (0, 0, 100, 100);//Clear everything - Hacky putting it in the event call - Race condition :-s
					canvas.drawImage(img, 0, 0);
				};
			})(this.object.canvas, img);
			img.src = 'img/satellite-1.png';
		},

		drawThrusters: function() {
			var img1 = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 0, 17);
				};
			})(this.object.canvas, img1);
			img1.src = 'img/thruster-small.png';

			var img2 = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 16, 17);
				};
			})(this.object.canvas, img2);
			img2.src = 'img/thruster-small.png';
		},

		move: function () {//Moving Satellite forward
			this.draw();

			if(this.fires){
				this.goFire();
			}

			if (this.orientation === 360) {
				this.orientation = 0;
			}

			this.object.element.style.left = this.position[0] - game.viewport.x;//Horizontal
			this.object.element.style.top = this.position[1] - game.viewport.y;//Vertical

			this.healthElement.style.left = this.position[0] - 5 - game.viewport.x;//Horizontal
			this.healthElement.style.top = this.position[1] - 8 - game.viewport.y;//Vertical
		},

		die: function () {//Satellite has been killed
			game.satellites.splice(game.satellites.indexOf(this),1);
			return this.remove();
		}
	});

	return Satellite;

});