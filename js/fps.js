/** 
** Draw the little mouse speed animated graph
** This just attaches a handler to the mousemove event to see
** (roughly) how far the mouse has moved
** and then updates the display a couple of times a second via
** setTimeout()
**/
var fps = (function() {
    var mrefreshinterval = 250; // update display every 500ms
    var lastfps=-1; 
    var lastmousetime;
    var mousetravel = 0;
    var mpoints = [];
    var mpoints_max = 30;
    var timeout;
    function registerFPS(fps) {
        mousetravel = (mousetravel + fps)/2;//Averaged out
    }
    var start = function() {
        var md = new Date();
        var timenow = md.getTime();
        if (lastmousetime && lastmousetime!=timenow) {
            var fps = Math.round(mousetravel / (timenow - lastmousetime) * 1000);
            mpoints.push(fps);
            if (mpoints.length > mpoints_max)
                mpoints.splice(0,1);
            mousetravel = 0;
            $('#fps').sparkline(mpoints, { width: 120, height: 50, chartRangeMin: 0, tooltipSuffix: ' frames per second' });
            $('#fpsnum').text(mpoints[mpoints.length-1]);
        }
        lastmousetime = timenow;
        timeout = setTimeout(start, mrefreshinterval);
    };

    function stop(){
        clearTimeout(timeout);
    }
    // We could use setInterval instead, but I prefer to do it this way
    //timeout = setTimeout(mdraw, mrefreshinterval); 

    return {
        registerFPS: registerFPS,
        start: start,
        stop: stop
    };
})();