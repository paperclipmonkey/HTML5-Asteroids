define(["js/Automiton"], function(Automiton) {
	var LaserGrid = Automiton.extend({
		init: function(obj) {//object from JSON
			this._super(obj);

			this.width = 20;
			this.height = 22;
			this.canFire = false;

			this.object = new this.Object(this.position, this.width, this.height);
			
			this.laser = {};

			this.drawBase();
			this.drawLaser();
			this.healthBar();
			//this.laserTo(LaserGrid)
		},

		healthBar: function(){
			//Draw element above LaserGrid
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
			this.health -= 1;
			if(this.health <= 0){
				this.die();
				return;
			}
			this.healthElementBar.style.width = this.health + '%';
		},

		drawBase: function() {
			var img = new Image();
			(function(canvas, img){
				img.onload = function(){
					canvas.clearRect (0, 0, 100, 100);//Clear everything - Hacky putting it in the event call - Race condition :-s
					canvas.drawImage(img, 0, 0);
				};
			})(this.object.canvas, img);
			img.src = 'img/satellite-1.png';
		},

		drawLaser: function() {
			if(!this.laserTo){
				return;
			}
			//var mm = document.createElement('canvas');
			var width = Math.abs(this.position[0] - this.laserTo.position[0]);
			var height = Math.abs(this.position[1] - this.laserTo.position[1]);


			start = {x:0,y:0};

			if(this.position[0] >= this.laserTo.position[0]){
				start.x = width;
			} else {
				start.x = 0;
			}

			if(this.position[1] >= this.laserTo.position[1]){
				start.y = height;
			} else {
				start.y = 0;
			}

			end = {
				x: start.x ? 0 : width,
				y: start.y ? 0 : height
			};

			this.laser = new this.Object(this.position, width, height);

			this.laser.offset = {
				x: this.position[0] - this.laserTo.position[0],
				y: this.position[1] - this.laserTo.position[1]
			};

			this.laser.offset.x = this.laser.offset.x < 0 ? 0 : this.laser.offset.x;
			this.laser.offset.y = this.laser.offset.y < 0 ? 0 : this.laser.offset.y;

			console.log(this.laser.offset);

			cx = this.laser.canvas;

			cx.beginPath();
			cx.moveTo(start.x,start.y);
			cx.lineTo(end.x, end.y);
			cx.strokeStyle = 'green';
			cx.stroke();
		},

		backLink: function(el){
			this.backLink = el;
		},

		link: function(el){
			this.laserTo = el;
		},

		move: function () {//Moving LaserGrid forward
			this.draw();

			this.object.element.style.left = this.position[0] - game.viewport.x;//Horizontal
			this.object.element.style.top = this.position[1] - game.viewport.y;//Vertical

			this.healthElement.style.left = this.position[0] - 5 - game.viewport.x;//Horizontal
			this.healthElement.style.top = this.position[1] - 8 - game.viewport.y;//Vertical

			if(this.laser.element){
				this.laser.element.style.left = this.position[0] - this.laser.offset.x - 5 - game.viewport.x;//Horizontal
				this.laser.element.style.top = this.position[1] - this.laser.offset.y - 8 - game.viewport.y;//Vertical
			}
		},

		die: function () {//LaserGrid has been killed
			game.lasergrid.splice(game.lasergrid.indexOf(this),1);
			return this.remove();
		}
	});

	return LaserGrid;

});