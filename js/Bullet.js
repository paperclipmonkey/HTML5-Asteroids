define(["js/Sprite"], function(Sprite) {
	var Bullet = Sprite.extend({
		init: function(obj) {
			this._super(obj);
			this.velocity = 10;
			this.timer = 0;
			this.object = new this.object(this.position, this.orientation);

			var radians = this.orientation * (Math.PI/180);
			this.direction = [];
			this.direction[0] = Math.sin(radians);
			this.direction[1] = Math.cos(radians);

			if(game.lineDistance(
				{x: game.player.position[0], y: game.player.position[1]},
				{x: this.position[0], y:this.position[1]}
			)< 1500){
				if(game.settings.audio){
					try{
						var sound = game.webaudio.createSound();
						sound.load('audio/Blip001.wav', function(sound){
							sound.volume(0.03).play();
						});
					} catch(e){
						console.error(e);
					}
				}
			}
		},

		hit: function(){
			game.bullets.splice(game.bullets.indexOf(this),1);
			return this.remove();
		},

		object: function (position, orientation) {
			this.element = document.createElement('canvas');//Create new Canvas
			this.element.id = "Bullet" + (new Date()).getTime();
			this.element.style.position = "fixed";

			this.element.style.left = position[0] - game.viewport.x;
			this.element.style.top = position[1] - game.viewport.y;

			document.getElementById('playspace').appendChild(this.element);
			this.canvas = this.element.getContext('2d');
			var img = new Image();

			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 0, 0, 8, 12);
				};
			})(this.canvas, img);
			img.src = 'img/bullet.png';
			this.element.setAttribute('width', '8');
			this.element.setAttribute('height', '12');
			this.element.style.webkitTransform = "rotate(" + orientation + "deg)";
		},

		move: function () {//Moving Bullet forward
			this.timer+=1;
			if (this.timer >= 50) {//Remove when bullet travelled certain distance
				this.remove();
				return true;
			}

			//Wrap around the world
			// if(this.position[0] > game.width + game.viewport.width){
			// 	this.position[0] = 0;
			// }
			// if(this.position[0] < 0){
			// 	this.position[0] = game.width + game.viewport.width;
			// }
			// if(this.position[1] > game.height + game.viewport.height){
			// 	this.position[1] = 0;
			// }
			// if(this.position[1] < 0){
			// 	this.position[1] = game.height + game.viewport.height;
			// }

			this._super(game);
			return false;
		}

	});

	return Bullet;

});