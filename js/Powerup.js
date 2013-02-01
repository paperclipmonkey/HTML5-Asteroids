define(["js/Sprite"], function(Sprite) {
	var Powerup = Sprite.extend({
		init: function(obj) {//main Powerup object
			this._super(obj);
			this.orientation = Math.random() * 360;
			this.direction = [];
			this.direction[0] = (Math.random() * 7) * (Math.random() * 3 - 1);
			this.direction[1] = (Math.random() * 7) * (Math.random() * 3 - 1);
			this.id = "Powerup" + Math.random();
			this.object = new this.object(this);
		},

		rotate: function () {
			this.orientation = this.orientation  +  this.rotationspeed;
			if(this.orientation >= 360){
				this.orientation -= 360;
			}
			this.object.element.style.webkitTransform = "rotate(" + (this.orientation + this.rotationspeed) + "deg)";
		},

		checkOut: function(game, distance){
			var rtn = false;
			if ((this.position[0] - game.viewport.x) < - distance) {//Horizontal
				rtn = true;
			} else if ((this.position[0] - game.viewport.x) > game.viewport.width + distance) {
				rtn = true;
			}

			if ((this.position[1] - game.viewport.y) < - distance) {//Vertical
				rtn = true;
			} else if ((this.position[1] - game.viewport.y) > game.viewport.height + distance) {
				rtn = true;
			}
			return rtn;
		},

		del: function () {
			this.remove();
			//Attach powerup to the player.
			this.object = null;//Remove unnecessary objects
			game.player.addPowerup(this);
			game.powerups.splice(game.powerups.indexOf(this),1);
		},

		hit: function () {
			/*
				TODO - Need to put the right noise in.
			*/
			// try{
			// 	var sound = game.webaudio.createSound();
			// 	sound.load('audio/Noise002.wav', function(sound){
			// 		sound.volume(0.10).play();
			// 	});
			// } catch(e){
			// 	console.error(e);
			// }

			this.del();//Remove Original Powerup
		},

		object: function (that) {
			this.element = document.createElement('canvas');//Create new Canvas
			this.element.style.position = "fixed";
			this.element.style.top = that.position[1];
			this.element.style.left = that.position[0];
			this.canvas = this.element.getContext('2d');
			this.element.setAttribute('width', 14 + "px");
			this.element.setAttribute('height', 14 + "px");
			var img = new Image();

			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 0, 0);
				};
			})(this.canvas, img);
			img.src = 'img/powerup-' + that.type + '.png';
			document.getElementById('playspace').appendChild(this.element);//Only add once drawn and positioned
		}
	});

	return Powerup;
});