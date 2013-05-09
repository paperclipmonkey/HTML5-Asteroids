define(["js/Sprite", "js/Powerup"], function(Sprite, Powerup) {
	var Asteroid = Sprite.extend({
		init: function(obj) {//main asteroid object
			this._super(obj);
			this.orientation = Math.random() * 360;
			this.direction = [];
			this.direction[0] = (Math.random() * 7) * (Math.random() * 3 - 1);
			this.direction[1] = (Math.random() * 7) * (Math.random() * 3 - 1);
			this.id = "asteroid" + Math.random();
			if(!this.type){
				this.type = "rock";
			}
			this.points = this.generatePoints(this);
			this.object = new this.object(this);
		},

		rotate: function (game) {
			this.orientation = this.orientation  +  (this.rotationspeed * game.delta * 15);
			if(this.orientation >= 360){
				this.orientation -= 360;
			}
			this.object.element.style.webkitTransform = "rotate(" + (this.orientation + this.rotationspeed) + "deg)";
		},

		del: function () {
			this.remove();
			game.asteroids.splice(game.asteroids.indexOf(this),1);
		},

		hit: function () {
			/*
			Use the objects properties to create new objects
			Add the objects to the asteroids array
			need to be smaller / moving in same direction
			Use the weight property to modify the asteroids smaller
			Divide by 4?
			When at 1 - destroy
			*/
			var asteroids = [];

			var newamount = (this.weight / 5);
			var i = 0;

			if(newamount > 1){
				while (i < newamount) {
					game.asteroids.push(
						new Asteroid({
							velocity: (Math.random() + 0.1),
							weight: newamount * 3,
							direction: [],
							rotationspeed: (Math.random() + 0.3 * 40),
							position: [
								this.position[0],
								this.position[1]
							],
							type: this.type
						})//Speed / Weight / RotationSpeed / Position / type / real
					);

					//console.log('Create Asteroid ' + (i+1) + " of " + newamount);
					i++;
				}
				if(Math.random() > 0.9){
					var type;
					if(this.type === 'rock'){
						return;
					} else if(this.type === 'fuel'){
						type = 'p';
					} else if(this.type === 'metal'){
						type = 'm';
					}
					game.powerups.push( new Powerup({
						velocity: (Math.random() + 0.3 / 3),
						direction: [],
						rotationspeed: (Math.random() + 0.3 * 40),
						position: [
								this.position[0],
								this.position[1]
							],
						'type': type
					}));
				}
			}

			for (i = asteroids.length - 1; i >= 0; i--) {
				game.asteroids.push(asteroids[i]);
			}

			if(game.lineDistance(
				{x: game.player.position[0], y: game.player.position[1]},
				{x: this.position[0], y:this.position[1]}
			)< 1500){
				if(game.settings.audio){
					try{
						//if close enough to player.
						var sound = game.webaudio.createSound();
						sound.load('audio/Noise002.wav', function(sound){
							sound.volume(0.10).play();
						});
					} catch(e){
						console.error(e);
					}
				}
			}

			this.del();//Remove Original Asteroid
		},

		generatePoints: function(that){
			var points = [[25, 5], [38, 10], [45, 25], [41, 37], [25,45], [10,39], [5,25], [11, 10]];
			var i = 0;
			while (i < points.length) {
				points[i][0] = points[i][0] * (that.weight / 10);
				points[i][1] = points[i][1] * (that.weight / 10);
				i++;
			}
			
			i = 0;
			while (i < points.length) {
				if (Math.random() >= 0.5) {
					points[i][0] = parseInt(points[i][0]  +  Math.random() * (Math.random() * 8), 10);
				} else {
					points[i][0] = parseInt(points[i][0] - Math.random() * (Math.random() * 8), 10);
				}
				if (Math.random() >= 0.5) {
					points[i][1] = parseInt(points[i][1]  +  Math.random() * (Math.random() * 8), 10);
				} else {
					points[i][1] = parseInt(points[i][1] - Math.random() * (Math.random() * 8), 10);
				}
				i++;
			}
			//Move asteroid to top left of canvas - crop to size
			i = 0;
			this.smallX = 50;
			this.largeX = 0;
			this.smallY = 50;
			this.largeY = 0;
			while (i < points.length) {
				if (points[i][0] < this.smallX) {
					this.smallX = points[i][0];
				}
				if (points[i][0] > this.largeX) {
					this.largeX = points[i][0];
				}
				if (points[i][1] < this.smallY) {
					this.smallY = points[i][1];
				}
				if (points[i][1] > this.largeY) {
					this.largeY = points[i][1];
				}
				i++;
			}
			i = 0;
			while (i < points.length) {	//offset asteroid
				points[i][0] -= this.smallX;
				points[i][1] -= this.smallY;
				i++;
			}
			return points;
		},

		object: function (that) {
			this.element = document.createElement('canvas');//Create new Canvas
			this.element.style.position = "fixed";
			this.element.style.top = that.position[1];
			this.element.style.left = that.position[0];
			this.canvas = this.element.getContext('2d');
			this.element.setAttribute('width', that.largeX + 1 - that.smallX + "px");
			this.element.setAttribute('height', that.largeY + 1 - that.smallY + "px");
			this.canvas.beginPath();
			this.canvas.strokeStyle = "#7b7b7b";
			this.canvas.moveTo(that.points[0][0], that.points[0][1]);
			i = 0;
			while (i < that.points.length) {
				this.canvas.lineTo(that.points[i][0], that.points[i][1]);
				i++;
			}
			this.canvas.closePath();
			this.canvas.clip();
			var img = new Image();

			(function(canvas, img){
				img.onload = function(){
					canvas.drawImage(img, 0, 0);
					canvas.stroke();//Draw to canvas
				};
			})(this.canvas, img);
			img.src = 'img/asteroid-' + that.type + '.png';
			document.getElementById('playspace').appendChild(this.element);//Only add once drawn and positioned
		}

	});

	return Asteroid;
});