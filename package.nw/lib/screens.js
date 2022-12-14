const nodeTimers = require("timers");

var s_title = null;
var s_screenSettings = {};
var s_zoomLevel = 0;

nw.Screen.Init();

var g_screenLost = false;
var g_windowInfo = {};
var g_initialScreenCount = nw.Screen.screens.length;

function setWindowInfo()
{
  // if we've lost a screen, stop saving our info
  if (g_screenLost) return;
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
  if (g_windowMoveTimer != null)
  {
    nodeTimers.clearTimeout(g_windowMoveTimer);
    g_windowMoveTimer = null;
  }
  if (g_windowResizeTimer != null)
  {
    nodeTimers.clearTimeout(g_windowResizeTimer);
    g_windowResizeTimer = null;
  }
}

var screenCB = {
  onDisplayAdded: function (screen)
  {
    clearAllScreenTimers();
    if (
      g_screenLost == true &&
      g_initialScreenCount == nw.Screen.screens.length
    )
    {
      // Lets restore the position now
      var win = nw.Window.get();
      win.x = g_windowInfo.x;
      win.y = g_windowInfo.y;
      win.width = g_windowInfo.width;
      win.height = g_windowInfo.height;
      g_screenLost = false;
    }
  },

  onDisplayRemoved: function (screen)
  {
    clearAllScreenTimers();
    if (g_initialScreenCount != nw.Screen.screens.length)
    {
      g_screenLost = true;
    }
  }
};

function saveScreenSettings()
{
  setWindowInfo();

  var setting = { showing: g_isShowing, zoomLevel: s_zoomLevel, window: g_windowInfo };

  s_screenSettings = JSON.parse(localStorage.screenSettings);

  s_screenSettings[s_title] = setting;

  localStorage.screenSettings = JSON.stringify(s_screenSettings);
}
// listen to screen events
nw.Screen.on("displayAdded", screenCB.onDisplayAdded);
nw.Screen.on("displayRemoved", screenCB.onDisplayRemoved);

var g_isShowing = false;

nw.Window.get().on("loaded", function ()
{
  // Use the first 12 bytes of the title(trimmed) as storage names
  // This cannot be changed as current installs (12,000+) use this naming convention
  s_title = document.title.substr(0, 12).trim();
  g_isShowing = false;
  if (typeof localStorage.screenSettings == "undefined")
  {
    localStorage.screenSettings = "{}";
  }
  s_screenSettings = JSON.parse(localStorage.screenSettings);

  if (!(s_title in s_screenSettings))
  {
    saveScreenSettings();
  }
  if (!("zoomLevel" in s_screenSettings[s_title]))
  {
    saveScreenSettings();
  }
  if (!("window" in s_screenSettings[s_title]))
  {
    saveScreenSettings();
  }
  g_isShowing = s_screenSettings[s_title].showing;
  nw.Window.get().zoomLevel = s_zoomLevel = s_screenSettings[s_title].zoomLevel;

  g_windowInfo = s_screenSettings[s_title].window;

  var win = nw.Window.get();
  win.x = g_windowInfo.x;
  win.y = g_windowInfo.y;
  win.width = g_windowInfo.width;
  win.height = g_windowInfo.height;

  // Check the first part of the string, only one window has "GridTracker" in the name.
  // It is reserved to the main app window.
  if (g_isShowing || s_title.indexOf("GridTracker") == 0)
  {
    this.show();
  }
  else
  {
    this.hide();
  }

  g_initialScreenCount = nw.Screen.screens.length;
 
  setWindowInfo();
  document.addEventListener("keydown", onZoomControlDown, true);
});

var g_windowMoveTimer = null;
nw.Window.get().on("move", function (x, y)
{
  if (g_windowMoveTimer != null)
  {
    nodeTimers.clearTimeout(g_windowMoveTimer);
  }
  g_windowMoveTimer = nodeTimers.setTimeout(setWindowInfo, 1000);
});

var g_windowResizeTimer = null;
nw.Window.get().on("resize", function (w, h)
{
  if (g_windowResizeTimer != null)
  {
    nodeTimers.clearTimeout(g_windowResizeTimer);
  }
  g_windowResizeTimer = nodeTimers.setTimeout(setWindowInfo, 1000);
});

var g_zoomKeys = {
  NumpadSubtract: reduceZoom,
  Minus: reduceZoom,
  NumpadAdd: increaseZoom,
  Equal: increaseZoom,
  Numpad0: resetZoom,
  Digit0: resetZoom
};

function onZoomControlDown(event)
{
  if (event.ctrlKey)
  {
    if (event.code in g_zoomKeys)
    {
      g_zoomKeys[event.code]();
    }
  }
}

function reduceZoom()
{
  s_zoomLevel -= 0.2;
  nw.Window.get().zoomLevel = s_zoomLevel;
  saveScreenSettings();
}

function increaseZoom()
{
  s_zoomLevel += 0.2;
  nw.Window.get().zoomLevel = s_zoomLevel;

  saveScreenSettings();
}

function resetZoom()
{
  s_zoomLevel = 0;
  nw.Window.get().zoomLevel = s_zoomLevel;
  saveScreenSettings();
}

var g_process = require("process");

g_process.on("uncaughtException", function (e) {});
