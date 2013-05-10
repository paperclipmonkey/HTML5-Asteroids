/*
Base class that any play object inherits from
*/
define(["js/inheritance"], function() {

	var Sprite = Class.extend({
		init: function(obj) {//object from JSON
			for(var x in obj){
				this[x] = obj[x];
			}
		},

		remove: function () {//Remove from the DOM
			try {
				document.getElementById('playspace').removeChild(this.object.element);
				if(this.healthElement){
					document.getElementById('playspace').removeChild(this.healthElement);
				}
				if(this.laser){
					document.getElementById('playspace').removeChild(this.laser.element);
				}
			} catch (err) {
				console.log('failed to remove Sprite: ', err);
			}
			return true;
		},

		move: function (game) {

			this.position[0] = this.position[0] + parseInt(((this.velocity * (this.direction[0])))*game.delta*500, 10)/10;//Horizontal
			this.position[1] = this.position[1] - parseInt(((this.velocity * (this.direction[1])))*game.delta*500, 10)/10;//Vertical

			//Only move element on screen if close enough to the user
			if(game.lineDistance(
				{x: game.player.position[0], y: game.player.position[1]},
				{x: this.position[0], y:this.position[1]}
			) < 2500){
				this.object.element.style.display = 'block';
				this.object.element.style.left = this.position[0] - game.viewport.x;//Horizontal
				this.object.element.style.top = this.position[1] - game.viewport.y;//Vertical
			} else {
				this.object.element.style.display = 'none';
			}
		},

		checkOutViewport: function(game, distance){
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

		checkOutWorld: function(game, distance){
			var rtn = false;
			if ((this.position[0] ) < - distance) {//Horizontal
				rtn = true;
			} else if (this.position[0] > game.width + distance) {
				rtn = true;
			}

			if ((this.position[1]) < - distance) {//Vertical
				rtn = true;
			} else if ((this.position[1]) > game.height + distance) {
				rtn = true;
			}
			return rtn;
		}
	});

	return Sprite;

});