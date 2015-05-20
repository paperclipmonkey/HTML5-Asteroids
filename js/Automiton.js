/*
Automitons inherit from sprite but add additional functionality like movement, health and firing
*/
define(["js/Sprite","js/Bullet"], function(Sprite, Bullet) {
	var Automiton = Sprite.extend({
		init: function(obj){
			this._super(obj);

			this.healthElement = {};
			this.healthElementBar = {};
			this.health = 100;

			this.direction = [];
			this.orientation = 0;

			this.thrusters = false;
			this.dirty = true;
		},

		increaseHealth: function (percentage) {
			this.health += percentage;
			if(this.health >= 100){
				this.health = 100;
			}
			this.healthElementBar.style.width = this.health + '%';
		},

		fire: function (onoff) {//create new Bullet
			this.fires = onoff;
		},

		goFire: function () {//create new Bullet
			if(this.canFire === false){
				return;
			}

			this.canFire = false;
			(function(player){
				window.setTimeout(function(){
					player.canFire = true;
				}, 250);
			})(this);

			var radians = this.direction * (Math.PI/180);
		/*
		//Side weapons
			Bullets.push(
				new Bullet(
					[
						this.position[0] + 15 - 3 + (this.directions[1]),//Width of Bullet 6px
						this.position[1] + 15 - 3 + (this.directions[0])//width of ship 30px
					],
					this.orientation,
					this
				)
			);
			Bullets.push(
				new Bullet(
					[
						this.position[0] + 15 - 3 - (this.directions[1]),//Width of Bullet 6px
						this.position[1] + 15 - 3 - (this.directions[0])//width of ship 30px
					],
					this.orientation,
					this
				)
			);
		*/
			var directions = [];
			directions[0] = Math.sin(radians);
			directions[1] = Math.cos(radians);

			game.bullets.push(
				new Bullet({
					position: [
						this.position[0] + 15 + 15 * directions[0],
						this.position[1] + 15 - 15 * directions[1]//Width of bullet 6px
					],
					orientation: this.orientation,
					firer: this
				})
			);
		},

		Object: function (position, width, height) {
			element = document.createElement('canvas');//Create new Canvas
			element.style.position = "fixed";
			element.style.top = position[1];
			element.style.left = position[0];
			document.getElementById('playspace').appendChild(element);
			element.canvas = element.getContext('2d');
			element.setAttribute('width', width);
			element.setAttribute('height', height);

			return {
				element: element,
				canvas: element.canvas
			};
		},

		goTurn: function (direction, game) {
			if (direction === "clockwise") {
				if (this.orientation >= 360) {
					this.orientation = 0;
				}
				this.orientation = this.orientation + (200 * game.delta);
			} else if (direction === "anticlockwise") {
				if (this.orientation <= 0) {
					this.orientation = 360;
				}
				this.orientation = this.orientation - (200 * game.delta);
			}

			this.object.element.style.webkitTransform = "rotate(" + this.orientation + "deg)";
		},

		forwards: function(onoff){
			this.dirty = true;
			this.thrusters = onoff;
		},

		toLocation: function(to){
			//Turn to the right direction
			var distance =  game.lineDistance({
					x:this.position[0],
					y:this.position[1]
				},
				{
					'x':to.x,
					'y':to.y
			});
			var direction = game.calcAngle(
				this.position[0],
				to.x,
				this.position[1],
				to.y
			);

			console.log(distance, this.velocity);
			if(distance < 20 && this.velocity < 200){
				console.log('Found position');
				this._to = null;
				this.forwards(0);
				return true;
			}

			//See if there are any asteroids in the way
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
					),
					obj: game.asteroids[i]
				});
			}
			distances.sort(function(a, b){
				return (a.distance - b.distance); //causes an array to be sorted numerically and ascending
			});

			closest = distances[0];

			if(closest.distance < 500){
				var obAng = game.calcAngle(
						0,
						closest.obj.direction[0],
						0,
						closest.obj.direction[1]
				);

				if(closest.direction + 20 > direction && closest.direction - 20 < direction){
					var lr = closest.direction - direction;
					//change angle to avoid hit
					if(lr < 0){
						direction = direction + 40;
					} else {
						direction = direction - 40;
					}
				}
			}

			var leftright = direction - this.orientation;
			if(leftright > 180){
				this.goTurn('anticlockwise', game);
			} else if(leftright > 5){
				this.goTurn('clockwise', game);
			} else if(leftright < -5){
				this.goTurn('anticlockwise', game);
			} 

			if(distance > 700){
				this.forwards(100);
				//this.goForwards();
			} else if(distance <= 700 && distance > 300){
				this.forwards(70);
				//this.goForwards();
			} else if(distance <= 300 && distance > 100){
				this.forwards(40);
				//this.goForwards('small');
			} else {
				this.forwards(15);//
			}

			return false;
		},

		draw: function(){
			if(this.dirty){
				this.dirty = false;
				this.drawBase();
				if(this.thrusters){
					this.drawThrusters();
				}
				if(this.shieldsviewon){
					this.drawShields();
				}
			}
		}
	});

	return Automiton;

});