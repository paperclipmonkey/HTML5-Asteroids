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

		object: function (position, width, height) {
			this.element = document.createElement('canvas');//Create new Canvas
			this.element.style.position = "fixed";
			this.element.style.top = position[1];
			this.element.style.left = position[0];
			document.getElementById('playspace').appendChild(this.element);
			this.canvas = this.element.getContext('2d');
			this.element.setAttribute('width', width);
			this.element.setAttribute('height', height);
		},

		goTurn: function (direction) {
			if (direction === "clockwise") {
				if (this.orientation >= 360) {
					this.orientation = 0;
				}
				this.orientation = this.orientation + 5;
			} else if (direction === "anticlockwise") {
				if (this.orientation <= 0) {
					this.orientation = 360;
				}
				this.orientation = this.orientation - 5;
			}

			this.object.element.style.webkitTransform = "rotate(" + this.orientation + "deg)";
		},

		forwards: function(onoff){
			this.dirty = true;
			this.thrusters = onoff;
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