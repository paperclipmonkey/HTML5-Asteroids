/* Based on http://www.chiptune.com/starfield/starfield.html
Modifyed by Michael Waterworth 14/11/12 (250 lines > 123 lines)
	*Cleaned up declarations
	*Module pattern
	*Rely on jQuery
	*Code layout
	*Remove unused vars
	*Move(x,y) function used to control camera
*/
define([], function() {

	function get_screen_size() {
		var w = document.documentElement.clientWidth;
		var h = document.documentElement.clientHeight;
		return [w,h];
	}

	var test = true;
	var n = 512;
	var w = 0;
	var h = 0;
	var x = 0;
	var y = 0;
	var z = 0;
	var star_color_ratio = 0;
	var star_x_save,star_y_save;
	var star_ratio = 256;
	var star_speed = 0.4;
	var star = [n];
	var color;

	var mouse_x = 0;
	var mouse_y = 0;

	var canvas_w = 0;
	var canvas_h = 0;
	var context;

	var timeout;
	var fps = 10;//MS to wait between frames

	function init(){
		var a = 0;
		for(var i = 0;i<n;i++){
			star[i] = [];
			star[i][0] = Math.random() * w * 2;
			star[i][1] = Math.random() * h * 2;
			star[i][2] = Math.round(Math.random()*z);
			star[i][3] = 0;
			star[i][4] = 0;
		}
		var starfield = $('#starfield');
		starfield.css('position','absolute');
		starfield[0].width = w;
		starfield[0].height = h;
		context = starfield[0].getContext('2d');
		//context.lineCap='round';
		context.fillStyle = 'rgb(0,0,0)';
		context.strokeStyle = 'rgb(255,255,255)';
	}

	function anim(){
		context.fillRect(0,0,w,h);//Clear canvas
		for(var i = 0;i<n;i++){
			test = true;
			star_x_save = star[i][3];
			star_y_save = star[i][4];
			star[i][0] += mouse_x >> 1;
			if(star[i][0]>x<<1) { star[i][0]-=w<<1; test=false; }
			if(star[i][0]<-x<<1) { star[i][0]+=w<<1; test=false; }
			star[i][1] += mouse_y >> 1; 
			if(star[i][1]>y<<1) { star[i][1]-=h<<1; test=false; } 
			if(star[i][1]<-y<<1) { star[i][1]+=h<<1; test=false; }
			star[i][2] -= star_speed; 
			if(star[i][2]>z) { star[i][2]-=z; test=false; } 
			if(star[i][2]<0) { star[i][2]+=z; test=false; }
			star[i][3] = x + (star[i][0]/star[i][2])*star_ratio;
			star[i][4] = y + (star[i][1]/star[i][2])*star_ratio;
			if(star_x_save>0&&star_x_save<w&&star_y_save>0&&star_y_save<h&&test){
				context.lineWidth=(1-star_color_ratio*star[i][2])*2;
				context.beginPath();
				context.moveTo(star_x_save,star_y_save);
				context.lineTo(star[i][3],star[i][4]);
				context.stroke();
				context.closePath();
			}
		}
		timeout=setTimeout(anim,fps);
	}

	function move(x, y){
		mouse_x = x;
		mouse_y = y;
	}

	function start(){
		resize();
		anim();
	}

	function resume(){
		anim();
	}

	function stop(){
		window.clearTimeout(timeout);
	}

	function resize(){
		w = get_screen_size()[0];
		h = get_screen_size()[1];
		x = Math.round(w/2);
		y = Math.round(h/2);
		z = (w+h)/2;
		star_color_ratio = 1/z;
		init();
	}

	return {
		start: start,
		resume: resume,
		stop: stop,
		move: move,
		star: star,
		resize: resize
	};
		//onmousedown="context.fillStyle=&#39;rgba(0,0,0,&#39;+opacity+&#39;)&#39;" onmouseup="context.fillStyle=&#39;rgb(0,0,0)&#39;"
});