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
			} catch (err) {
				console.log('failed to remove Sprite: ', err);
			}
			return true;
		},

		move: function (game) {
			this.position[0] = this.position[0] + (this.velocity * this.direction[0]);//Horizontal
			this.position[1] = this.position[1] - (this.velocity * this.direction[1]);//Vertical

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
		}
	});

	return Sprite;

});