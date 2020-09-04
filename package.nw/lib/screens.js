
nw.Screen.Init();

var g_screenLost = false;
var g_windowInfo = {};
var g_initialScreenCount = nw.Screen.screens.length;

function setWindowInfo()
{
	// if we've lost a screen, stop saving our info
	if ( g_screenLost )
		return;
	var win = nw.Window.get();
	var windowInfo = {};
	windowInfo.x = win.x;
	windowInfo.y = win.y;
	windowInfo.width = win.width;
	windowInfo.height = win.height;
	g_windowInfo = windowInfo;
	
}

function clearAllScreenTimers()
{
	if ( g_windowMoveTimer != null )
	{
		clearTimeout(g_windowMoveTimer);
		g_windowMoveTimer = null;
	}
	if ( g_windowResizeTimer != null )
	{
		clearTimeout(g_windowResizeTimer);
		g_windowResizeTimer = null;
	}
}


var screenCB = {

  onDisplayAdded: function(screen) {
    	clearAllScreenTimers();
		if ( g_screenLost == true && g_initialScreenCount == nw.Screen.screens.length)
		{
			// Lets restore the position now
			var win 	= nw.Window.get();
			win.x 		= g_windowInfo.x;
			win.y 		= g_windowInfo.y;
			win.width 	= g_windowInfo.width;
			win.height 	= g_windowInfo.height;
			g_screenLost = false;
		}
  },

  onDisplayRemoved: function(screen) {
    	clearAllScreenTimers();
		if ( g_initialScreenCount != nw.Screen.screens.length )
		{
			g_screenLost = true;
		}
  }
};

// listen to screen events
nw.Screen.on('displayAdded', screenCB.onDisplayAdded);
nw.Screen.on('displayRemoved', screenCB.onDisplayRemoved);

nw.Window.get().on('loaded', function () {
		g_initialScreenCount = nw.Screen.screens.length;
		setWindowInfo();
  });
  
var g_windowMoveTimer = null;
nw.Window.get().on('move', function (x,y) {
		if ( g_windowMoveTimer != null )
		{
			clearTimeout(g_windowMoveTimer);
		}
		g_windowMoveTimer = setTimeout(setWindowInfo,1000);
  });
 
var g_windowResizeTimer = null;
nw.Window.get().on('resize', function (w,h) {
		if ( g_windowResizeTimer != null )
		{
			clearTimeout(g_windowResizeTimer);
		}
		g_windowResizeTimer = setTimeout(setWindowInfo,1000);
  });
  