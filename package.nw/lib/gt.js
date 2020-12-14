// GridTracker ©2020 GridTracker.org
// All rights reserved.
// See LICENSE for more information.
const pjson = require("./package.json");
var gtVersion = parseInt(pjson.version.replace(/\./g, ""));
var gtBeta = pjson.betaVersion;

var g_startVersion = 0;
if (typeof localStorage.currentVersion != "undefined")
{ g_startVersion = localStorage.currentVersion; }

if (
  typeof localStorage.currentVersion == "undefined" ||
  localStorage.currentVersion != String(gtVersion)
)
{
  localStorage.currentVersion = String(gtVersion);
  var gui = require("nw.gui");
  gui.App.clearCache();
}

var vers = String(gtVersion);
var gtShortVersion =
  "v" +
  vers.substr(0, 1) +
  "." +
  vers.substr(1, 2) +
  "." +
  vers.substr(3, 4) +
  " " +
  gtBeta;
var gtVersionString = "GridTracker " + gtShortVersion;

var g_windowName = "GT-main";
const os = require("os");
const fs = require("fs");
const process = require("process");
const path = require("path");
const g_dirSeperator = path.sep;

var g_platform = os.platform();
if (g_platform.indexOf("win") == 0 || g_platform.indexOf("Win") == 0)
{
  g_platform = "windows";
}
if (g_platform.indexOf("inux") > -1) g_platform = "linux";
if (g_platform.indexOf("darwin") > -1) g_platform = "mac";

var gui = require("nw.gui");
var win = gui.Window.get();

var g_developerMode = process.versions["nw-flavor"] == "sdk";

var g_popupWindowHandle = null;
var g_callRosterWindowHandle = null;
var g_conditionsWindowHandle = null;
var g_chatWindowHandle = null;
var g_statsWindowHandle = null;
var g_lookupWindowHandle = null;
var g_baWindowHandle = null;

var g_appSettings = {};
var g_mapSettings = {};
var g_adifLogSettings = {};
var g_msgSettings = {};
var g_receptionSettings = {};
var g_receptionReports = {};
var g_N1MMSettings = {};
var g_log4OMSettings = {};
var g_dxkLogSettings = {};
var g_HRDLogbookLogSettings = {};
var g_acLogSettings = {};
var g_trustedQslSettings = {};
var g_callsignLookups = {};
var g_startupLogs = [];
var g_mapMemory = [];

var g_callsignDatabaseDXCC = {
  291: true,
  1: true,
  6: true,
  110: true,
  202: true
};

var g_callsignDatabaseUS = {
  291: true,
  6: true,
  110: true
};

var g_callsignDatabaseUSplus = {
  291: true,
  6: true,
  110: true,
  202: true
};

function loadAllSettings()
{
  for (var x in localStorage)
  {
    if (!validSettings.includes(x) && typeof localStorage[x] == "string")
    {
      delete localStorage[x];
    }
  }

  g_appSettings = loadDefaultsAndMerge("appSettings", def_appSettings);
  g_mapSettings = loadDefaultsAndMerge("mapSettings", def_mapSettings);
  g_adifLogSettings = loadDefaultsAndMerge(
    "adifLogSettings",
    def_adifLogSettings
  );
  g_msgSettings = loadDefaultsAndMerge("msgSettings", def_msgSettings);
  g_receptionSettings = loadDefaultsAndMerge(
    "receptionSettings",
    def_receptionSettings
  );
  g_N1MMSettings = loadDefaultsAndMerge("N1MMSettings", def_N1MMSettings);
  g_log4OMSettings = loadDefaultsAndMerge("log4OMSettings", def_log4OMSettings);
  g_dxkLogSettings = loadDefaultsAndMerge("dxkLogSettings", def_dxkLogSettings);
  g_HRDLogbookLogSettings = loadDefaultsAndMerge(
    "HRDLogbookLogSettings",
    def_HRDLogbookLogSettings
  );
  g_acLogSettings = loadDefaultsAndMerge("acLogSettings", def_acLogSettings);
  g_trustedQslSettings = loadDefaultsAndMerge(
    "trustedQslSettings",
    def_trustedQslSettings
  );

  g_callsignLookups = loadDefaultsAndMerge(
    "callsignLookups",
    def_callsignLookups
  );
  g_bandActivity = loadDefaultsAndMerge("bandActivity", def_bandActivity);

  g_startupLogs = loadArrayIfExists("startupLogs");
  g_mapMemory = loadArrayIfExists("mapMemory");

  if (g_mapMemory.length != 7)
  {
    g_mapMemory = [];
    for (var x = 0; x < 7; x++)
    {
      g_mapMemory[x] = {};
      g_mapMemory[x].zoom = -1;
      g_mapMemory[x].LoLa = [0, 0];
    }
    g_appSettings.mapMemory = JSON.stringify(g_mapMemory);
  }
}

loadAllSettings();

var myDEcall = g_appSettings.myDEcall;
var myDEGrid = g_appSettings.myDEGrid;
var myMode = g_appSettings.myMode;
var myBand = g_appSettings.myBand;
var myRawFreq = g_appSettings.myRawFreq;
var myRawCall = g_appSettings.myRawCall;
var myRawGrid = g_appSettings.myRawGrid;

var g_flightDuration = 30;

var g_crScript = g_appSettings.crScript;
var g_spotsEnabled = g_appSettings.spotsEnabled;
var g_heatEnabled = g_appSettings.heatEnabled;

var g_myLat = g_mapSettings.latitude;
var g_myLon = g_mapSettings.longitude;

function loadDefaultsAndMerge(key, def)
{
  var settings = {};
  if (typeof localStorage[key] != "undefined")
  {
    settings = JSON.parse(localStorage[key]);
  }
  var merged = deepmerge(def, settings);
  for (var x in merged)
  {
    if (!(x in def))
    {
      delete merged[x];
    }
  }
  localStorage[key] = JSON.stringify(merged);
  return merged;
}

function loadArrayIfExists(key)
{
  var data = [];
  if (typeof localStorage[key] != "undefined")
  {
    data = JSON.parse(localStorage[key]);
  }
  return data;
}

function loadObjectIfExists(key)
{
  var data = {};
  if (typeof localStorage[key] != "undefined")
  {
    data = JSON.parse(localStorage[key]);
  }
  return data;
}

function saveAppSettings()
{
  localStorage.appSettings = JSON.stringify(g_appSettings);
}

function saveMapSettings()
{
  localStorage.mapSettings = JSON.stringify(g_mapSettings);
}

function saveStartupLogs()
{
  localStorage.startupLogs = JSON.stringify(g_startupLogs);
}

function saveLogSettings()
{
  localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
  localStorage.N1MMSettings = JSON.stringify(g_N1MMSettings);
  localStorage.log4OMSettings = JSON.stringify(g_log4OMSettings);
  localStorage.dxkLogSettings = JSON.stringify(g_dxkLogSettings);
  localStorage.HRDLogbookLogSettings = JSON.stringify(g_HRDLogbookLogSettings);
  localStorage.acLogSettings = JSON.stringify(g_acLogSettings);
  localStorage.trustedQslSettings = JSON.stringify(g_trustedQslSettings);
}

function saveAndCloseApp()
{
  g_closing = true;

  saveReceptionReports();

  try
  {
    var data = {};

    data.tracker = g_tracker;

    for (var key in g_QSOhash) g_QSOhash[key].rect = null;

    data.g_QSOhash = g_QSOhash;
    data.version = gtVersion;

    fs.writeFileSync(g_NWappData + "internal_qso.json", JSON.stringify(data));
  }
  catch (e)
  {
    console.log(e);
  }

  if (g_map)
  {
    mapMemory(6, true, true);
    g_mapSettings.zoom = g_map.getView().getZoom();
    saveMapSettings();
  }

  if (g_wsjtUdpServer != null)
  {
    try
    {
      if (multicastEnable.checked == true && g_appSettings.wsjtIP != "")
      {
        g_wsjtUdpServer.dropMembership(g_appSettings.wsjtIP);
      }
      g_wsjtUdpServer.close();
    }
    catch (e)
    {
      console.log(e);
    }
  }

  if (g_forwardUdpServer != null)
  {
    g_forwardUdpServer.close();
  }

  saveAppSettings();
  saveMapSettings();

  try
  {
    if (g_callRosterWindowHandle)
    {
      g_callRosterWindowHandle.window.writeRosterSettings();
    }
    if (g_popupWindowHandle != null) g_popupWindowHandle.window.close(true);

    g_conditionsWindowHandle.window.close(true);
    g_chatWindowHandle.window.close(true);
    g_statsWindowHandle.window.close(true);
    g_lookupWindowHandle.window.close(true);
    g_baWindowHandle.window.close(true);
    g_callRosterWindowHandle.window.close(true);
  }
  catch (e) {}
  nw.App.quit();
}

function clearAndReload()
{
  g_closing = true;
  if (g_wsjtUdpServer != null)
  {
    g_wsjtUdpServer.close();
    g_wsjtUdpServer = null;
  }

  localStorage.clear();
  chrome.runtime.reload();
}

win.hide();

win.on("close", function ()
{
  saveAndCloseApp();
});
win.show();
win.setMinimumSize(200, 600);

var g_wsjtxProcessRunning = false;
var g_jtdxProcessRunning = false;
var g_wsjtxIni = Array();
var g_jtdxIni = Array();
var g_setNewUdpPortTimeoutHandle = null;
var g_map = null;
var g_menuShowing = true;
var g_closing = false;
var g_liveGrids = {};
var g_qsoGrids = {};
var g_liveCallsigns = {};

var g_lastCallsignCount = 0;

var g_flightPaths = Array();
var g_flightPathOffset = 0;
var g_flightPathLineDash = [9, 3, 3];
var g_flightPathTotal = (9 + 3 + 3) * 2;

var g_lastMessages = Array();
var g_lastTraffic = Array();
var g_showAllGrids = false;
var g_maps = Array();
var g_modes = {};
var g_modes_phone = {};
var g_colorBands = [
  "OOB",
  "4000m",
  "2200m",
  "630m",
  "160m",
  "80m",
  "60m",
  "40m",
  "30m",
  "20m",
  "17m",
  "15m",
  "12m",
  "11m",
  "10m",
  "6m",
  "4m",
  "2m",
  "1.25m",
  "70cm",
  "23cm"
];

var g_pathIgnore = {};
g_pathIgnore.RU = true;
g_pathIgnore.FTRU = true;
g_pathIgnore.FD = true;
g_pathIgnore.TEST = true;
g_pathIgnore.DX = true;
g_pathIgnore.CQ = true;

var g_replaceCQ = {};
g_replaceCQ.ASIA = "AS";

var g_searchBand = "dummy";

var g_myDXCC = -1;

var g_QSOhash = {};
var g_QSLcount = 0;
var g_QSOcount = 0;
var g_ignoreMessages = 0;
var g_lastTimeSinceMessageInSeconds = timeNowSec();
var g_loadQSOs = false;
var g_fromDirectCallNoFileDialog = false;
var g_qsoWorkedBorderColor = "#222222FF";
var g_pushPinMode = false;
var g_pskBandActivityTimerHandle = null;
var g_workingIniPath = "";
var g_worldGeoData = {};
var g_prefixToMap = {};
var g_directCallToDXCC = {};
var g_dxccToAltName = {};
var g_dxccToADIFName = {};
var g_dxccToGeoData = {};
var g_gridToDXCC = {};
var g_gridToCQZone = {};
var g_gridToITUZone = {};
var g_gridToState = {};
var g_StateData = {};
var g_cqZones = {};
var g_wacZones = {};
var g_wasZones = {};
var g_ituZones = {};
var g_dxccCount = {};

var g_tracker = {};

initQSOdata();

function initQSOdata()
{
  g_tracker.worked = {};
  g_tracker.confirmed = {};

  g_tracker.worked.band = {};
  g_tracker.worked.call = {};
  g_tracker.worked.grid = {};
  g_tracker.worked.dxcc = {};
  g_tracker.worked.cqz = {};
  g_tracker.worked.ituz = {};
  g_tracker.worked.state = {};
  g_tracker.worked.px = {};
  g_tracker.worked.cnty = {};
  g_tracker.worked.cont = {};

  g_tracker.confirmed.band = {};
  g_tracker.confirmed.call = {};
  g_tracker.confirmed.grid = {};
  g_tracker.confirmed.dxcc = {};
  g_tracker.confirmed.cqz = {};
  g_tracker.confirmed.ituz = {};
  g_tracker.confirmed.state = {};
  g_tracker.confirmed.px = {};
  g_tracker.confirmed.cnty = {};
  g_tracker.confirmed.cont = {};
}

var g_offlineLayer = null;
var g_mapsLayer = Array();
var g_tileLayer = null;
var g_mapControl = null;
var g_mapView = null;
var g_layerSources = {};
var g_layerVectors = {};

var g_scaleLine = null;
var g_scaleUnits = {};

g_scaleUnits.MI = "us";
g_scaleUnits.KM = "metric";
g_scaleUnits.NM = "nautical";
g_scaleUnits.DG = "degrees";

var g_passingToolTipTableString = "";
var g_mouseX = 0;
var g_mouseY = 0;

var g_appData = "";
var g_jsonDir = "";
var g_NWappData = "";
var g_screenshotDir = "";
var g_scriptDir = "";
var g_qsoLogFile = "";
var g_userMediaDir = "";
var g_gtMediaDir = path.resolve("./media");
var g_localeString = navigator.language;

var g_shapeFile = "./data/shapes.json";
var g_mapsFile = "./data/maps.json";
var g_voices = null;

var g_shapeData = {};
var g_countyData = {};
var g_zipToCounty = {};
var g_stateToCounty = {};
var g_cntyToCounty = {};
var g_us48Data = {};

var g_startupFunctions = Array();

var g_pskColors = {};
g_pskColors.OOB = "888888";
g_pskColors["4000m"] = "45E0FF";
g_pskColors["2200m"] = "FF4500";
g_pskColors["630m"] = "1E90FF";
g_pskColors["160m"] = "7CFC00";
g_pskColors["80m"] = "E550E5";
g_pskColors["60m"] = "0000FF";
g_pskColors["40m"] = "4949FF";
g_pskColors["30m"] = "62FF62";
g_pskColors["20m"] = "FFC40C";
g_pskColors["17m"] = "F2F261";
g_pskColors["15m"] = "CCA166";
g_pskColors["12m"] = "B22222";
g_pskColors["11m"] = "00FF00";
g_pskColors["10m"] = "FF69B4";
g_pskColors["6m"] = "FF0000";
g_pskColors["4m"] = "CC0044";
g_pskColors["2m"] = "FF1493";
g_pskColors["1.25m"] = "CCFF00";
g_pskColors["70cm"] = "999900";
g_pskColors["33cm"] = "009999";
g_pskColors["23cm"] = "5AB8C7";

var g_bandToColor = {};
var g_colorLeafletPins = {};
var g_colorLeafletQPins = {};

var g_UTCoptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short"
};

var g_LocalOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short"
};

var g_earthShadowImageArray = Array();
g_earthShadowImageArray[0] = "./img/shadow_on_32.png";
g_earthShadowImageArray[1] = "./img/shadow_off_32.png";
var g_gtFlagImageArray = Array();
g_gtFlagImageArray[2] = "./img/flag_on_freq.png";
g_gtFlagImageArray[1] = "./img/flag_on.png";
g_gtFlagImageArray[0] = "./img/flag_off.png";
var g_gtShareFlagImageArray = Array();
g_gtShareFlagImageArray[1] = "./img/share-on.png";
g_gtShareFlagImageArray[0] = "./img/share-off.png";
var g_mapImageArray = Array();
g_mapImageArray[1] = "./img/online_map.svg";
g_mapImageArray[0] = "./img/offline_map.svg";
var g_pinImageArray = Array();
g_pinImageArray[1] = "./img/red_pin_32.png";
g_pinImageArray[0] = "./img/gt_grid.png";
var g_qsoLockImageArray = Array();
g_qsoLockImageArray[0] = "./img/qso_unlocked_32.png";
g_qsoLockImageArray[1] = "./img/qso_locked_32.png";
var g_qslLockImageArray = Array();
g_qslLockImageArray[0] = "./img/qsl_unlocked_32.png";
g_qslLockImageArray[1] = "./img/qsl_locked_32.png";
var g_alertImageArray = Array();
g_alertImageArray[0] = "./img/unmuted-button.svg";
g_alertImageArray[1] = "./img/muted-button.svg";
var g_maidenheadModeImageArray = Array();
g_maidenheadModeImageArray[0] = "./img/mh4_32.png";
g_maidenheadModeImageArray[1] = "./img/mh6_32.png";

var g_gridViewArray = Array();
g_gridViewArray[1] = "Live";
g_gridViewArray[2] = "Logbook";
g_gridViewArray[3] = "Logbook &amp; Live";

var g_trophyImageArray = Array();
g_trophyImageArray[0] = "./img/blank_trophy.png";
g_trophyImageArray[1] = "./img/cq_trophy.png";
g_trophyImageArray[2] = "./img/itu_trophy.png";
g_trophyImageArray[3] = "./img/wac_trophy.png";
g_trophyImageArray[4] = "./img/was_trophy.png";
g_trophyImageArray[5] = "./img/dxcc_trophy.png";
g_trophyImageArray[6] = "./img/usc_trophy.png";
g_trophyImageArray[7] = "./img/us48_trophy.png";

var g_viewInfo = {};
g_viewInfo[0] = ["g_qsoGrids", "Grids", 0, 0, 0];
g_viewInfo[1] = ["g_cqZones", "CQ Zones", 0, 0, 40];
g_viewInfo[2] = ["g_ituZones", "ITU Zones", 0, 0, 90];
g_viewInfo[3] = ["g_wacZones", "Continents", 0, 0, 7];
g_viewInfo[4] = ["g_wasZones", "US States", 0, 0, 50];
g_viewInfo[5] = ["g_worldGeoData", "DXCCs", 0, 0, 340];
g_viewInfo[6] = ["g_countyData", "US Counties", 0, 0, 3220];
g_viewInfo[7] = ["g_us48Data", "US Continental Grids", 0, 0, 488];

var g_soundCard = g_appSettings.soundCard;

var g_gridAlpha = "88";

if (typeof g_mapMemory[6] == "undefined") g_mapMemory[6] = g_mapMemory[0];

function qsoBackupFileInit()
{
  var adifHeader = "GridTracker v" + gtVersion + " <EOH>\r\n";
  if (!fs.existsSync(g_qsoLogFile))
  {
    fs.writeFileSync(g_qsoLogFile, adifHeader);
  }
}

function gtBandFilterChanged(selector)
{
  g_appSettings.gtBandFilter = selector.value;

  removePaths();
  redrawGrids();
  redrawSpots();
}

function gtModeFilterChanged(selector)
{
  g_appSettings.gtModeFilter = selector.value;

  redrawGrids();
  redrawSpots();
}

function gtPropFilterChanged(selector)
{
  g_appSettings.gtPropFilter = selector.value;

  redrawGrids();
  redrawSpots();
}

function setBandAndModeToAuto()
{
  g_appSettings.gtModeFilter = g_appSettings.gtBandFilter = gtBandFilter.value = gtModeFilter.value =
    "auto";
  redrawGrids();
  redrawSpots();
}

function hideLiveGrid(i)
{
  if (g_layerSources.live.hasFeature(g_liveGrids[i].rectangle))
  {
    g_layerSources.live.removeFeature(g_liveGrids[i].rectangle);
  }
}

function liveTriangleGrid(i)
{
  if (g_liveGrids[i].isTriangle == false)
  {
    if (g_layerSources.live.hasFeature(g_liveGrids[i].rectangle))
    {
      g_layerSources.live.removeFeature(g_liveGrids[i].rectangle);
    }

    gridToTriangle(i, g_liveGrids[i].rectangle, false);
    g_liveGrids[i].isTriangle = true;
    g_layerSources.live.addFeature(g_liveGrids[i].rectangle);
  }
}

function qsoTriangleGrid(i)
{
  if (g_qsoGrids[i].isTriangle == false)
  {
    if (g_layerSources.qso.hasFeature(g_qsoGrids[i].rectangle))
    {
      g_layerSources.qso.removeFeature(g_qsoGrids[i].rectangle);
    }

    gridToTriangle(i, g_qsoGrids[i].rectangle, true);
    g_qsoGrids[i].isTriangle = true;
    g_layerSources.qso.addFeature(g_qsoGrids[i].rectangle);
  }
}

function setGridViewMode(mode)
{
  g_appSettings.gridViewMode = mode;
  gridViewButton.innerHTML = g_gridViewArray[g_appSettings.gridViewMode];
  redrawGrids();
  goProcessRoster();
}

function cycleGridView()
{
  var mode = g_appSettings.gridViewMode;
  mode++;
  if (mode > 3) mode = 1;
  if (mode < 1) mode = 1;
  g_appSettings.gridViewMode = mode;
  gridViewButton.innerHTML = g_gridViewArray[g_appSettings.gridViewMode];

  redrawGrids();
}

function toggleEarth()
{
  g_appSettings.earthImgSrc ^= 1;
  earthImg.src = g_earthShadowImageArray[g_appSettings.earthImgSrc];
  if (g_appSettings.earthImgSrc == 1)
  {
    dayNight.hide();
    g_nightTime = dayNight.refresh();
  }
  else
  {
    g_nightTime = dayNight.refresh();
    dayNight.show();
  }
  changeMapLayer();
}

function toggleOffline()
{
  if (g_map == null) return;

  if (g_mapSettings.offlineMode == true)
  {
    g_mapSettings.offlineMode = false;
    offlineImg.src = g_mapImageArray[1];
    conditionsButton.style.display = "inline-block";
    gtFlagButton.style.display = "inline-block";
    gtShareButton.style.display = "inline-block";
    buttonStrikesDiv.style.display = "inline-block";
    buttonPSKSpotsBoxDiv.style.display = "inline-block";
    donateButton.style.display = "inline-block";

    if (g_appSettings.gtShareEnable == true)
    {
      gtFlagButton.style.display = "inline-block";
      if (g_appSettings.gtMsgEnable == true)
      { msgButton.style.display = "inline-block"; }
      else msgButton.style.display = "none";
    }
    else
    {
      msgButton.style.display = "none";
      gtFlagButton.style.display = "none";
    }

    for (var key in g_adifLogSettings.menu)
    {
      var value = g_adifLogSettings.menu[key];
      var where = key + "Div";
      document.getElementById(key).checked = value;
      if (value == true)
      {
        document.getElementById(where).style.display = "inline-block";
      }
      else
      {
        document.getElementById(where).style.display = "none";
      }
    }
    pskReporterBandActivityDiv.style.display = "block";
  }
  else
  {
    g_mapSettings.offlineMode = true;
    offlineImg.src = g_mapImageArray[0];
    conditionsButton.style.display = "none";

    buttonPsk24CheckBoxDiv.style.display = "none";
    buttonQRZCheckBoxDiv.style.display = "none";
    buttonLOTWCheckBoxDiv.style.display = "none";
    buttonClubCheckBoxDiv.style.display = "none";
    gtFlagButton.style.display = "none";
    pskReporterBandActivityDiv.style.display = "none";
    gtShareButton.style.display = "none";
    msgButton.style.display = "none";
    donateButton.style.display = "none";
    buttonStrikesDiv.style.display = "none";
    buttonPSKSpotsBoxDiv.style.display = "none";
    setGtShareButtons();
  }
  loadMapSettings();
  changeMapValues();
}

function ignoreMessagesToggle()
{
  g_ignoreMessages ^= 1;
  if (g_ignoreMessages == 0)
  {
    txrxdec.style.backgroundColor = "Green";
    txrxdec.style.borderColor = "GreenYellow";
    txrxdec.innerHTML = "RECEIVE";
    txrxdec.title = "Click to ignore incoming messages";
  }
  else
  {
    txrxdec.style.backgroundColor = "DimGray";
    txrxdec.style.borderColor = "DarkGray";
    txrxdec.innerHTML = "IGNORE";
    txrxdec.title = "Click to resume reading messages";
  }
}

function toggleTime()
{
  g_appSettings.useLocalTime ^= 1;
  displayTime();
}

function dateToString(dateTime)
{
  if (g_appSettings.useLocalTime == 1)
  { return dateTime.toLocaleString().replace(/,/g, ""); }
  else return dateTime.toUTCString().replace(/GMT/g, "UTC").replace(/,/g, "");
}

function userDayString(Msec)
{
  var dateTime;
  if (Msec != null) dateTime = new Date(Msec);
  else dateTime = new Date();

  var ds = dateTime.toUTCString().replace(/GMT/g, "UTC").replace(/,/g, "");
  var dra = ds.split(" ");
  dra.shift();
  dra.pop();
  dra.pop();
  return dra.join(" ");
}

function userTimeString(Msec)
{
  var dateTime;
  if (Msec != null) dateTime = new Date(Msec);
  else dateTime = new Date();
  return dateToString(dateTime);
}

function getWpx(callsign)
{
  var prefix = null;

  if (callsign.includes("/"))
  // Handle in the future?
  { return null; }
  if (!/\d/.test(callsign))
  // Insert 0, never seen this
  { return null; }

  var end = callsign.length;
  var foundPrefix = false;
  var prefixEnd = 1;
  while (prefixEnd != end)
  {
    if (/\d/.test(callsign.charAt(prefixEnd)))
    {
      while (prefixEnd + 1 != end && /\d/.test(callsign.charAt(prefixEnd + 1)))
      { prefixEnd++; }
      foundPrefix = true;
      break;
    }
    prefixEnd++;
  }

  if (foundPrefix) prefix = callsign.substr(0, prefixEnd + 1);

  return prefix;
}

function setState(details)
{
  if (details.state != null && details.state.length > 0)
  {
    var isDigi = details.digital;

    if (details.state.substr(0, 2) != "US")
    { details.state = "US-" + details.state; }

    g_tracker.worked.state[details.state + details.band + details.mode] = true;
    g_tracker.worked.state[details.state] = true;
    g_tracker.worked.state[details.state + details.mode] = true;
    g_tracker.worked.state[details.state + details.band] = true;
    if (isDigi)
    {
      g_tracker.worked.state[details.state + "dg"] = true;
      g_tracker.worked.state[details.state + details.band + "dg"] = true;
    }

    if (details.confirmed)
    {
      g_tracker.confirmed.state[
        details.state + details.band + details.mode
      ] = true;
      g_tracker.confirmed.state[details.state] = true;
      g_tracker.confirmed.state[details.state + details.mode] = true;
      g_tracker.confirmed.state[details.state + details.band] = true;
      if (isDigi)
      {
        g_tracker.confirmed.state[details.state + "dg"] = true;
        g_tracker.confirmed.state[details.state + details.band + "dg"] = true;
      }
    }
  }

  if (details.cnty != null && details.cnty.length > 0)
  {
    var isDigi = details.digital;

    g_tracker.worked.cnty[details.cnty + details.band + details.mode] = true;
    g_tracker.worked.cnty[details.cnty] = true;
    g_tracker.worked.cnty[details.cnty + details.mode] = true;
    g_tracker.worked.cnty[details.cnty + details.band] = true;
    if (isDigi)
    {
      g_tracker.worked.cnty[details.cnty + "dg"] = true;
      g_tracker.worked.cnty[details.cnty + details.band + "dg"] = true;
    }

    if (details.confirmed)
    {
      g_tracker.confirmed.cnty[
        details.cnty + details.band + details.mode
      ] = true;
      g_tracker.confirmed.cnty[details.cnty] = true;
      g_tracker.confirmed.cnty[details.cnty + details.mode] = true;
      g_tracker.confirmed.cnty[details.cnty + details.band] = true;
      if (isDigi)
      {
        g_tracker.confirmed.cnty[details.cnty + "dg"] = true;
        g_tracker.confirmed.cnty[details.cnty + details.band + "dg"] = true;
      }
    }
  }
}

function isKnownCallsignDXCC(dxcc)
{
  if (dxcc in g_callsignDatabaseDXCC) return true;
  return false;
}

function isKnownCallsignUS(dxcc)
{
  if (dxcc in g_callsignDatabaseUS) return true;
  return false;
}

function isKnownCallsignUSplus(dxcc)
{
  if (dxcc in g_callsignDatabaseUSplus) return true;
  return false;
}

function addDeDx(
  finalGrid,
  finalDXcall,
  cq,
  cqdx,
  locked,
  finalDEcall,
  finalRSTsent,
  finalTime,
  ifinalMsg,
  mode,
  band,
  confirmed,
  notQso,
  finalRSTrecv,
  finalDxcc,
  finalState,
  finalCont,
  finalCnty,
  finalCqZone,
  finalItuZone,
  finalVucc = [],
  finalPropMode = "",
  finalDigital = false,
  finalPhone = false,
  finalIOTA = "",
  finalSatName = ""
)
{
  var callsign = null;
  var rect = null;
  var worked = false;
  var didConfirm = false;
  var wspr = mode == "WSPR" ? parseInt(band) * 2 : null;
  var hash = "";

  var finalMsg = ifinalMsg.trim();
  if (finalMsg.length > 40) finalMsg = finalMsg.substring(0, 40) + "...";
  var details = null;
  if (!notQso)
  {
    var timeMod = finalTime - (finalTime % 360) + 180;
    hash = unique(mode + band + finalDXcall + timeMod);

    var lookupCall = false;

    if (hash in g_QSOhash)
    {
      details = g_QSOhash[hash];
      if (finalGrid.length > 0 && finalGrid != details.grid)
      {
        // only touch the grid if it's larger than the last grid && the 4wide is the same
        if (
          details.grid.length < 6 &&
          (details.grid.substr(0, 4) == finalGrid.substr(0, 4) ||
            details.grid.length == 0)
        )
        { details.grid = finalGrid; }
      }
      if (finalRSTsent.length > 0) details.RSTsent = finalRSTsent;
      if (finalRSTrecv.length > 0) details.RSTrecv = finalRSTrecv;
      if (finalCqZone.length > 0) details.cqz = finalCqZone;
      if (finalItuZone.length > 0) details.ituz = finalItuZone;
      if (finalState != null) details.state = finalState;
      if (finalState == null && details.state) finalState = details.state;
      if (finalDxcc < 1 && details.dxcc > 0) finalDxcc = details.dxcc;
      if (finalCont == null && details.cont) finalCont = details.cont;
      if (finalCnty == null && details.cnty) finalCnty = details.cnty;
      if (finalPropMode.length > 0) details.propMode = finalPropMode;
      if (finalVucc.length > 0) details.vucc_grids = finalVucc;
      if (finalIOTA.length > 0) details.IOTA = finalIOTA;
      if (finalSatName.length > 0) details.satName = finalSatName;
    }
    else
    {
      details = {};
      details.grid = finalGrid;
      details.RSTsent = finalRSTsent;
      details.RSTrecv = finalRSTrecv;
      details.msg = "-";
      details.band = band;
      details.mode = mode;
      details.DEcall = finalDXcall;
      details.DXcall = finalDEcall;
      details.cqz = finalCqZone;
      details.ituz = finalItuZone;
      details.delta = -1;
      details.time = finalTime;
      details.state = finalState;
      details.zipcode = null;
      details.qso = true;
      details.px = null;
      details.zone = null;
      details.cont = null;

      details.vucc_grids = finalVucc;
      details.propMode = finalPropMode;
      details.digital = finalDigital;
      details.phone = finalPhone;
      details.IOTA = finalIOTA;
      details.satName = finalSatName;
    }

    if (finalDxcc < 1) finalDxcc = callsignToDxcc(finalDXcall);
    details.dxcc = finalDxcc;

    if (details.dxcc > 0 && details.px == null)
    {
      details.px = getWpx(finalDXcall);
      if (details.px)
      { details.zone = Number(details.px.charAt(details.px.length - 1)); }
    }

    if (
      details.state == null &&
      isKnownCallsignUSplus(finalDxcc) &&
      finalGrid.length > 0
    )
    {
      var fourGrid = finalGrid.substr(0, 4);
      if (fourGrid in g_gridToState && g_gridToState[fourGrid].length == 1)
      {
        details.state = g_gridToState[fourGrid][0];
      }
      lookupCall = true;
    }

    details.cont = finalCont;
    if (details.cont == null && finalDxcc > 0)
    {
      details.cont = g_worldGeoData[g_dxccToGeoData[finalDxcc]].continent;
      if (details.dxcc == 390 && details.zone == 1) details.cont = "EU";
    }

    details.cnty = finalCnty;
    if (details.cnty)
    {
      details.qual = true;
    }

    if (isKnownCallsignUSplus(finalDxcc))
    {
      if (details.cnty == null)
      {
        lookupCall = true;
      }
      else
      {
        if (!(details.cnty in g_cntyToCounty))
        {
          lookupCall = true;
        }
      }
    }

    var isDigi = details.digital;
    var isPhone = details.phone;

    details.wspr = wspr;
    if (finalMsg.length > 0) details.msg = finalMsg;

    g_tracker.worked.call[finalDXcall + band + mode] = true;
    g_tracker.worked.call[finalDXcall] = true;
    g_tracker.worked.call[finalDXcall + mode] = true;
    g_tracker.worked.call[finalDXcall + band] = true;

    if (isDigi == true)
    {
      g_tracker.worked.call[finalDXcall + "dg"] = true;
      g_tracker.worked.call[finalDXcall + band + "dg"] = true;
    }

    var fourGrid = details.grid.substr(0, 4);
    if (fourGrid != "")
    {
      g_tracker.worked.grid[fourGrid + band + mode] = true;
      g_tracker.worked.grid[fourGrid] = true;
      g_tracker.worked.grid[fourGrid + mode] = true;
      g_tracker.worked.grid[fourGrid + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.grid[fourGrid + "dg"] = true;
        g_tracker.worked.grid[fourGrid + band + "dg"] = true;
      }
    }
    if (
      details.ituz.length == 0 &&
      fourGrid in g_gridToITUZone &&
      g_gridToITUZone[fourGrid].length == 1
    )
    {
      details.ituz = g_gridToITUZone[fourGrid][0];
    }
    if (details.ituz.length > 0)
    {
      g_tracker.worked.ituz[details.ituz + band + mode] = true;
      g_tracker.worked.ituz[details.ituz] = true;
      g_tracker.worked.ituz[details.ituz + mode] = true;
      g_tracker.worked.ituz[details.ituz + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.ituz[details.ituz + "dg"] = true;
        g_tracker.worked.ituz[details.ituz + band + "dg"] = true;
      }
    }
    if (
      details.cqz.length == 0 &&
      fourGrid in g_gridToCQZone &&
      g_gridToCQZone[fourGrid].length == 1
    )
    {
      details.cqz = g_gridToCQZone[fourGrid][0];
    }
    if (details.cqz.length > 0)
    {
      g_tracker.worked.cqz[details.cqz + band + mode] = true;
      g_tracker.worked.cqz[details.cqz] = true;
      g_tracker.worked.cqz[details.cqz + mode] = true;
      g_tracker.worked.cqz[details.cqz + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.cqz[details.cqz + "dg"] = true;
        g_tracker.worked.cqz[details.cqz + band + "dg"] = true;
      }
    }

    if (details.dxcc > 0)
    {
      var sDXCC = String(details.dxcc);
      g_tracker.worked.dxcc[sDXCC + band + mode] = true;
      g_tracker.worked.dxcc[sDXCC] = true;
      g_tracker.worked.dxcc[sDXCC + mode] = true;
      g_tracker.worked.dxcc[sDXCC + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.dxcc[sDXCC + "dg"] = true;
        g_tracker.worked.dxcc[sDXCC + band + "dg"] = true;
      }
    }

    if (details.px)
    {
      g_tracker.worked.px[details.px + band + mode] = true;
      g_tracker.worked.px[details.px] = hash;
      g_tracker.worked.px[details.px + mode] = true;
      g_tracker.worked.px[details.px + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.px[details.px + "dg"] = true;
        g_tracker.worked.px[details.px + band + "dg"] = true;
      }
      if (isPhone == true)
      {
        g_tracker.worked.px[details.px + "ph"] = true;
        g_tracker.worked.px[details.px + band + "ph"] = true;
      }
    }

    if (details.cont)
    {
      g_tracker.worked.cont[details.cont + band + mode] = true;
      g_tracker.worked.cont[details.cont] = hash;
      g_tracker.worked.cont[details.cont + mode] = true;
      g_tracker.worked.cont[details.cont + band] = true;
      if (isDigi == true)
      {
        g_tracker.worked.cont[details.cont + "dg"] = true;
        g_tracker.worked.cont[details.cont + band + "dg"] = true;
      }
      if (isPhone == true)
      {
        g_tracker.worked.cont[details.cont + "ph"] = true;
        g_tracker.worked.cont[details.cont + band + "ph"] = true;
      }
    }

    worked = true;
    locked = true;
    details.worked = worked;
    if (typeof details.confirmed == "undefined" || details.confirmed == false)
    {
      details.confirmed = confirmed;
    }

    g_QSOhash[hash] = details;

    setState(details);

    if (lookupCall)
    {
      if (g_callsignLookups.ulsUseEnable)
      {
        lookupUsCallsign(details, true);
      }
    }

    if (confirmed == true)
    {
      if (fourGrid != "")
      {
        g_tracker.confirmed.grid[fourGrid + band + mode] = true;
        g_tracker.confirmed.grid[fourGrid] = true;
        g_tracker.confirmed.grid[fourGrid + mode] = true;
        g_tracker.confirmed.grid[fourGrid + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.grid[fourGrid + "dg"] = true;
          g_tracker.confirmed.grid[fourGrid + band + "dg"] = true;
        }
      }
      if (details.ituz.length > 0)
      {
        g_tracker.confirmed.ituz[details.ituz + band + mode] = true;
        g_tracker.confirmed.ituz[details.ituz] = true;
        g_tracker.confirmed.ituz[details.ituz + mode] = true;
        g_tracker.confirmed.ituz[details.ituz + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.ituz[details.ituz + "dg"] = true;
          g_tracker.confirmed.ituz[details.ituz + band + "dg"] = true;
        }
      }
      if (details.cqz.length > 0)
      {
        g_tracker.confirmed.cqz[details.cqz + band + mode] = true;
        g_tracker.confirmed.cqz[details.cqz] = true;
        g_tracker.confirmed.cqz[details.cqz + mode] = true;
        g_tracker.confirmed.cqz[details.cqz + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.cqz[details.cqz + "dg"] = true;
          g_tracker.confirmed.cqz[details.cqz + band + "dg"] = true;
        }
      }

      if (details.dxcc > 0)
      {
        var sDXCC = String(details.dxcc);
        g_tracker.confirmed.dxcc[sDXCC + band + mode] = true;
        g_tracker.confirmed.dxcc[sDXCC] = true;
        g_tracker.confirmed.dxcc[sDXCC + mode] = true;
        g_tracker.confirmed.dxcc[sDXCC + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.dxcc[sDXCC + "dg"] = true;
          g_tracker.confirmed.dxcc[sDXCC + band + "dg"] = true;
        }
      }

      if (details.px)
      {
        g_tracker.confirmed.px[details.px + band + mode] = true;
        g_tracker.confirmed.px[details.px] = hash;
        g_tracker.confirmed.px[details.px + mode] = true;
        g_tracker.confirmed.px[details.px + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.px[details.px + "dg"] = true;
          g_tracker.confirmed.px[details.px + band + "dg"] = true;
        }
      }

      if (details.cont)
      {
        g_tracker.confirmed.cont[details.cont + band + mode] = true;
        g_tracker.confirmed.cont[details.cont] = hash;
        g_tracker.confirmed.cont[details.cont + mode] = true;
        g_tracker.confirmed.cont[details.cont + band] = true;
        if (isDigi == true)
        {
          g_tracker.confirmed.cont[details.cont + "dg"] = true;
          g_tracker.confirmed.cont[details.cont + band + "dg"] = true;
        }
      }

      g_tracker.confirmed.call[finalDXcall + band + mode] = true;
      g_tracker.confirmed.call[finalDXcall] = true;
      g_tracker.confirmed.call[finalDXcall + mode] = true;
      g_tracker.confirmed.call[finalDXcall + band] = true;
      if (isDigi == true)
      {
        g_tracker.confirmed.call[finalDXcall + "dg"] = true;
        g_tracker.confirmed.call[finalDXcall + band + "dg"] = true;
      }
      didConfirm = true;
    }
  }

  if (finalDxcc < 1) finalDxcc = callsignToDxcc(finalDXcall);

  hash = finalDXcall + band + mode;
  if (notQso)
  {
    if (hash in g_liveCallsigns) callsign = g_liveCallsigns[hash];
  }

  if (!notQso)
  {
    if (
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto"
          ? myBand == band
          : g_appSettings.gtBandFilter == band)) &&
      validateMapMode(mode) &&
      validatePropMode(finalPropMode)
    )
    {
      details.rect = qthToQsoBox(
        finalGrid,
        hash,
        cq,
        cqdx,
        locked,
        finalDEcall,
        worked,
        didConfirm,
        band,
        wspr
      );
    }
    return;
  }
  else
  {
    if (finalDxcc in g_dxccCount) g_dxccCount[finalDxcc]++;
    else g_dxccCount[finalDxcc] = 1;

    if (
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto"
          ? myBand == band
          : g_appSettings.gtBandFilter == band)) &&
      validateMapMode(mode)
    )
    {
      rect = qthToBox(
        finalGrid,
        finalDXcall,
        cq,
        cqdx,
        locked,
        finalDEcall,
        band,
        wspr,
        hash
      );
    }
  }

  if (callsign == null)
  {
    var newCallsign = {};
    newCallsign.DEcall = finalDXcall;
    newCallsign.grid = finalGrid;
    newCallsign.mode = mode;
    newCallsign.band = band;
    newCallsign.msg = finalMsg;
    newCallsign.dxcc = finalDxcc;
    newCallsign.worked = false;
    newCallsign.confirmed = false;
    newCallsign.RSTsent = "-";
    newCallsign.RSTrecv = "-";
    newCallsign.dt = 0.0;
    newCallsign.qso = false;
    newCallsign.distance = 0;
    newCallsign.px = null;
    newCallsign.zone = null;
    newCallsign.cnty = finalCnty;
    newCallsign.cont = finalCont;
    if (finalDxcc > -1)
    {
      newCallsign.px = getWpx(finalDXcall);
      if (newCallsign.px)
      {
        newCallsign.zone = Number(
          newCallsign.px.charAt(newCallsign.px.length - 1)
        );
      }

      if (newCallsign.cont == null)
      {
        newCallsign.cont = g_worldGeoData[g_dxccToGeoData[finalDxcc]].continent;
        if (newCallsign.dxcc == 390 && newCallsign.zone == 1)
        { newCallsign.cont = "EU"; }
      }
    }
    if (finalRSTsent != null)
    {
      newCallsign.RSTsent = finalRSTsent;
    }
    if (finalRSTrecv != null)
    {
      newCallsign.RSTrecv = finalRSTrecv;
    }
    newCallsign.time = finalTime;
    newCallsign.delta = -1;
    newCallsign.DXcall = finalDEcall;
    newCallsign.rect = rect;
    newCallsign.wspr = wspr;
    newCallsign.state = finalState;
    newCallsign.alerted = false;
    newCallsign.instance = null;
    newCallsign.shouldAlert = false;
    newCallsign.zipcode = null;
    newCallsign.qrz = false;
    newCallsign.vucc_grids = [];
    newCallsign.propMode = "";
    newCallsign.digital = finalDigital;
    newCallsign.phone = finalPhone;
    newCallsign.IOTA = finalIOTA;
    newCallsign.satName = finalSatName;

    if (
      newCallsign.state == null &&
      isKnownCallsignDXCC(finalDxcc) &&
      finalGrid.length > 0
    )
    {
      if (g_callsignLookups.ulsUseEnable)
      {
        lookupUsCallsign(newCallsign);
      }

      if (newCallsign.state == null && isKnownCallsignUSplus(finalDxcc))
      {
        var fourGrid = finalGrid.substr(0, 4);
        if (
          fourGrid in g_gridToState &&
          g_gridToState[finalGrid.substr(0, 4)].length == 1
        )
        {
          newCallsign.state = g_gridToState[finalGrid.substr(0, 4)][0];
        }
      }
    }
    g_liveCallsigns[hash] = newCallsign;
  }
  else
  {
    if (callsign.DXcall != "Self" && finalTime > callsign.time)
    {
      callsign.time = finalTime;
      callsign.mode = mode;
      callsign.band = band;
      callsign.delta = -1;
      callsign.DXcall = finalDEcall;
      callsign.msg = finalMsg;
      callsign.rect = rect;
      callsign.dxcc = finalDxcc;
      callsign.wspr = wspr;
      if (finalGrid.length > callsign.grid.length) callsign.grid = finalGrid;
      if (
        finalGrid.length == callsign.grid.length &&
        finalGrid != callsign.grid
      )
      { callsign.grid = finalGrid; }
      if (finalRSTsent != null) callsign.RSTsent = finalRSTsent;
      if (finalRSTrecv != null) callsign.RSTrecv = finalRSTrecv;
      callsign.vucc_grids = [];
      callsign.propMode = "";
      callsign.digital = finalDigital;
      callsign.phone = finalPhone;
      callsign.IOTA = finalIOTA;
      callsign.satName = finalSatName;
    }
  }
}

function timeoutSetUdpPort()
{
  g_appSettings.wsjtUdpPort = udpPortInput.value;
  lastMsgTimeDiv.innerHTML = "Waiting for msg...";
  g_setNewUdpPortTimeoutHandle = null;
}

function setUdpPort()
{
  if (g_setNewUdpPortTimeoutHandle != null)
  { window.clearTimeout(g_setNewUdpPortTimeoutHandle); }
  lastMsgTimeDiv.innerHTML = "..setting..";
  g_setNewUdpPortTimeoutHandle = window.setTimeout(timeoutSetUdpPort, 1000);
}

function changeGridDecay()
{
  g_appSettings.gridsquareDecayTime = parseInt(gridDecay.value);
  decayRateTd.innerHTML =
    Number(g_appSettings.gridsquareDecayTime) == 0
      ? "<I>No Decay</I>"
      : Number(g_appSettings.gridsquareDecayTime).toDHMS();
}

function changeMouseOverValue()
{
  g_mapSettings.mouseOver = mouseOverValue.checked;
  saveMapSettings();
}

function changeMergeOverlayValue()
{
  g_mapSettings.mergeOverlay = mergeOverlayValue.checked;
  saveMapSettings();
  setTrophyOverlay(g_currentOverlay);
}

function getPathColor()
{
  if (g_mapSettings.nightMapEnable && g_nightTime)
  {
    if (g_mapSettings.nightPathColor == 0) return "#000";
    if (g_mapSettings.nightPathColor == 361) return "#FFF";
    return "hsl(" + g_mapSettings.nightPathColor + ", 100%, 50%)";
  }
  else
  {
    if (g_mapSettings.pathColor == 0) return "#000";
    if (g_mapSettings.pathColor == 361) return "#FFF";
    return "hsl(" + g_mapSettings.pathColor + ", 100%, 50%)";
  }
}

function getQrzPathColor()
{
  if (g_mapSettings.nightMapEnable && g_nightTime)
  {
    if (g_mapSettings.nightQrzPathColor == 0) return "#000";
    if (g_mapSettings.nightQrzPathColor == 361) return "#FFF";
    return "hsl(" + g_mapSettings.nightQrzPathColor + ", 100%, 50%)";
  }
  else
  {
    if (g_mapSettings.qrzPathColor == 0) return "#000";
    if (g_mapSettings.qrzPathColor == 361) return "#FFF";
    return "hsl(" + g_mapSettings.qrzPathColor + ", 100%, 50%)";
  }
}

function changeShadow()
{
  g_mapSettings.shadow = shadowValue.value;
  showDarknessTd.innerHTML = parseInt(shadowValue.value * 100) + "%";
  saveMapSettings();
  g_nightTime = dayNight.refresh();
}

function changePathWidth()
{
  g_appSettings.pathWidthWeight = pathWidthValue.value;
  g_appSettings.qrzPathWidthWeight = qrzPathWidthValue.value;

  pathWidthTd.innerHTML = pathWidthValue.value;
  qrzPathWidthTd.innerHTML = qrzPathWidthValue.value;

  for (var i = g_flightPaths.length - 1; i >= 0; i--)
  {
    var featureStyle = g_flightPaths[i].getStyle();
    var featureStroke = featureStyle.getStroke();

    var color = g_flightPaths[i].isQRZ ? getQrzPathColor() : getPathColor();
    var width = g_flightPaths[i].isQRZ
      ? qrzPathWidthValue.value
      : pathWidthValue.value;

    if (width == 0)
    {
      if (typeof g_flightPaths[i].Arrow != "undefined")
      { g_layerSources.flight.removeFeature(g_flightPaths[i].Arrow); }
      g_layerSources.flight.removeFeature(g_flightPaths[i]);
      delete g_flightPaths[i];
      g_flightPaths[i] = null;

      g_flightPaths.splice(i, 1);
      continue;
    }

    featureStroke.setWidth(width);

    if (g_flightPaths[i].isShapeFlight == 0) featureStroke.setColor(color);

    featureStyle.setStroke(featureStroke);
    g_flightPaths[i].setStyle(featureStyle);

    if (typeof g_flightPaths[i].Arrow != "undefined")
    {
      var stroke = new ol.style.Stroke({
        color: color,
        width: width
      });
      var thisStle = new ol.style.Style({
        image: new ol.style.Circle({
          stroke: stroke,
          radius: 3
        })
      });
      g_flightPaths[i].Arrow.setStyle(thisStle);
    }
  }
  if (g_transmitFlightPath != null)
  {
    var featureStyle = g_transmitFlightPath.getStyle();
    var featureStroke = featureStyle.getStroke();

    if (qrzPathWidthValue.value == 0)
    {
      g_layerSources.transmit.clear();
      g_transmitFlightPath = null;
    }
    else
    {
      featureStroke.setWidth(qrzPathWidthValue.value);
      featureStroke.setColor(getQrzPathColor());
      featureStyle.setStroke(featureStroke);
      g_transmitFlightPath.setStyle(featureStyle);

      if (typeof g_transmitFlightPath.Arrow != "undefined")
      {
        var stroke = new ol.style.Stroke({
          color: getQrzPathColor(),
          width: qrzPathWidthValue.value
        });
        var thisStle = new ol.style.Style({
          image: new ol.style.Circle({
            stroke: stroke,
            radius: 3
          })
        });
        g_transmitFlightPath.Arrow.setStyle(thisStle);
      }
    }
  }
}

function compareCallsignTime(a, b)
{
  if (a.time < b.time) return -1;
  if (a.time > b.time) return 1;
  return 0;
}

function createFlagTipTable(toolElement)
{
  var myFlagtip = document.getElementById("myFlagtip");
  var worker = "";
  if (toolElement.size == 1)
  {
    var key = toolElement.key;
    var dxcc = callsignToDxcc(g_gtFlagPins[key].call);
    var dxccName = g_dxccToAltName[dxcc];
    var workColor = "cyan";

    if (g_gtFlagPins[key].call + myBand + myMode in g_tracker.worked.call)
    {
      workColor = "yellow";
    }
    if (g_gtFlagPins[key].call + myBand + myMode in g_tracker.confirmed.call)
    {
      workColor = "#00FF00";
    }

    worker +=
      "<div style='background-color:" +
      workColor +
      ";color:#000;font-weight:bold;font-size:18px;border:2px solid gray;margin:0px' class='roundBorder'>" +
      g_gtFlagPins[key].call.formatCallsign() +
      "</div>";

    worker += "<table id='tooltipTable' class='darkTable' >";

    worker +=
      "<tr><td>DXCC</td><td style='color:orange;'>" +
      dxccName +
      " <font color='lightgreen'>(" +
      g_worldGeoData[g_dxccToGeoData[dxcc]].pp +
      ")</font></td>";

    worker +=
      "<tr><td>Grid</td><td style='color:cyan;' >" +
      g_gtFlagPins[key].grid +
      "</td></tr>";

    worker +=
      "<tr><td>Freq</td><td style='color:lightgreen' >" +
      Number(g_gtFlagPins[key].freq / 1000).formatMhz(3, 3) +
      " <font color='yellow'>(" +
      Number(g_gtFlagPins[key].freq / 1000000).formatBand() +
      ")</font></td></tr>";

    worker +=
      "<tr><td>Mode</td><td style='color:orange' >" +
      g_gtFlagPins[key].mode +
      "</td></tr>";

    var LL = squareToLatLongAll(g_gtFlagPins[key].grid);

    var bearing = parseInt(
      MyCircle.bearing(
        g_myLat,
        g_myLon,
        LL.la2 - (LL.la2 - LL.la1) / 2,
        LL.lo2 - (LL.lo2 - LL.lo1) / 2
      )
    );
    worker +=
      "<tr><td>Dist</td><td style='color:cyan'>" +
      parseInt(
        MyCircle.distance(
          g_myLat,
          g_myLon,
          LL.la2 - (LL.la2 - LL.la1) / 2,
          LL.lo2 - (LL.lo2 - LL.lo1) / 2,
          distanceUnit.value
        ) * MyCircle.validateRadius(distanceUnit.value)
      ) +
      distanceUnit.value.toLowerCase() +
      "</td></tr>";
    worker +=
      "<tr><td>Azim</td><td style='color:yellow'>" +
      bearing +
      "&deg;</td></tr>";

    worker += "</table>";
  }
  else if (toolElement.size == 73)
  {
    var props = toolElement.getProperties();

    moment.locale(navigator.languages[0]);
    var m = moment().tz(props.tzid);

    worker +=
      "<div style='background-color:cyan;color:#000;font-weight:bold;font-size:16px;border:2px solid gray;margin:0px;padding:1px' class='roundBorder'>" +
      props.tzid +
      "</div>";
    worker += "<table id='tooltipTable' class='darkTable' align=center>";

    var abbr = m.format("zz");
    var zone = m.format("Z");
    if (zone.indexOf(abbr) > -1) abbr = "";
    else abbr = " <font color='orange'>(" + abbr + ")</font>";
    worker +=
      "<tr><td style='color:yellow;font-weight:bold'>" +
      m.format("LLLL") +
      "</td></tr>";
    worker +=
      "<tr><td style='color:#00FF00;font-weight:bold'>" +
      zone +
      abbr +
      "</td></tr>";

    worker += "</table>";
  }

  myFlagtip.innerHTML = worker;
  return 1;
}

function remove_duplicates(arr)
{
  var obj = {};
  var ret_arr = [];
  for (var i = 0; i < arr.length; i++)
  {
    obj[arr[i]] = true;
  }
  for (var key in obj)
  {
    ret_arr.push(key);
  }
  return ret_arr;
}

function splitNoParen(s)
{
  var results = [];
  var next;
  var str = "";
  var left = 0,
    right = 0;

  function keepResult()
  {
    results.push(str.trim());
    str = "";
  }

  for (var i = 0; i < s.length; i++)
  {
    switch (s[i])
    {
      case ",":
        if (left === right)
        {
          keepResult();
          left = right = 0;
        }
        else
        {
          str += s[i];
        }
        break;
      case "(":
        left++;
        str += s[i];
        break;
      case ")":
        right++;
        str += s[i];
        break;
      default:
        str += s[i];
    }
  }
  keepResult();
  return results;
}

function createSpotTipTable(toolElement)
{
  var now = timeNowSec();
  var myTooltip = document.getElementById("myTooltip");
  var worker = "";
  if (toolElement.spot in g_receptionReports.spots)
  {
    g_layerSources["psk-hop"].clear();
    var report = g_receptionReports.spots[toolElement.spot];

    var LL = squareToLatLongAll(myRawGrid);
    var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
    var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
    var fromPoint = ol.proj.fromLonLat([Lon, Lat]);

    worker =
      "<table id='tooltipTable' class='darkTable' ><tr><th colspan=2 style='color:cyan'>Rx Spot</th></tr>";
    worker +=
      "<tr><td>Age</td><td>" +
      Number(now - report.when).toDHMS() +
      "</td></tr>";
    worker +=
      "<tr><td>dB</td><td style='color:#DD44DD' >" +
      Number(report.snr).formatSignalReport() +
      "</td></tr>";
    worker +=
      "<tr><td>Call</td><td style='color:#ff0' >" +
      report.call.formatCallsign() +
      "</td></tr>";

    if (report.dxcc > 0)
    {
      worker +=
        "<tr><td>DXCC</td><td style='color:orange;'>" +
        g_dxccToAltName[report.dxcc] +
        " <font color='lightgreen'>(" +
        g_worldGeoData[g_dxccToGeoData[report.dxcc]].pp +
        ")</font></td>";
    }

    worker +=
      "<tr><td>Grid</td><td style='color:cyan;cursor:pointer' >" +
      report.grid +
      "</td></tr>";
    worker +=
      "<tr><td>Freq</td><td style='color:lightgreen' >" +
      report.freq.formatMhz() +
      " <font color='yellow'>(" +
      report.band +
      ")</font></td></tr>";
    worker +=
      "<tr><td>Mode</td><td style='color:orange' >" +
      report.mode +
      "</td></tr>";

    LL = squareToLatLongAll(report.grid);

    report.bearing = parseInt(
      MyCircle.bearing(
        g_myLat,
        g_myLon,
        LL.la2 - (LL.la2 - LL.la1) / 2,
        LL.lo2 - (LL.lo2 - LL.lo1) / 2
      )
    );
    worker +=
      "<tr><td>Dist</td><td style='color:cyan'>" +
      parseInt(
        MyCircle.distance(
          g_myLat,
          g_myLon,
          LL.la2 - (LL.la2 - LL.la1) / 2,
          LL.lo2 - (LL.lo2 - LL.lo1) / 2,
          distanceUnit.value
        ) * MyCircle.validateRadius(distanceUnit.value)
      ) +
      distanceUnit.value.toLowerCase() +
      "</td></tr>";
    worker +=
      "<tr><td>Azim</td><td style='color:yellow'>" +
      report.bearing +
      "&deg;</td></tr>";

    worker +=
      "<tr><td>Time</td><td>" +
      userTimeString(report.when * 1000) +
      "</td></tr>";

    worker += "</table>";

    var strokeWeight = pathWidthValue.value;

    Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
    Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;

    var toPoint = ol.proj.fromLonLat([Lon, Lat]);

    var feature = flightFeature(
      [fromPoint, toPoint],
      {
        weight: strokeWeight,
        color: getQrzPathColor(),
        steps: 75
      },
      "psk-hop",
      false
    );
  }
  myTooltip.innerHTML = worker;
  g_passingToolTipTableString = worker;
  return 10;
}

function createTooltTipTable(toolElement)
{
  if (typeof toolElement.spot != "undefined")
  {
    return createSpotTipTable(toolElement);
  }
  var myTooltip = document.getElementById("myTooltip");
  var colspan = 10;
  if (g_callsignLookups.lotwUseEnable == true) colspan++;
  if (g_callsignLookups.eqslUseEnable == true) colspan++;
  if (g_callsignLookups.oqrsUseEnable == true) colspan++;
  if (toolElement.qso == true) colspan += 2;

  var worker =
    "<table id='tooltipTable' class='darkTable' ><tr><th colspan=" +
    colspan +
    " style='color:cyan'>" +
    toolElement.qth +
    "</th></tr>";
  if (toolElement.qth in g_gridToDXCC)
  {
    worker += "<tr><th colspan=" + colspan + " style='color:yellow'><small>";
    for (var x = 0; x < g_gridToDXCC[toolElement.qth].length; x++)
    {
      worker += g_dxccToAltName[g_gridToDXCC[toolElement.qth][x]];
      if (toolElement.qth in g_gridToState)
      {
        worker += " (<font color='orange'>";
        var added = false;
        for (var y = 0; y < g_gridToState[toolElement.qth].length; y++)
        {
          if (
            g_gridToDXCC[toolElement.qth][x] ==
            g_StateData[g_gridToState[toolElement.qth][y]].dxcc
          )
          {
            worker +=
              g_StateData[g_gridToState[toolElement.qth][y]].name + " / ";
            added = true;
          }
        }
        if (added == true)
        { worker = worker.substr(0, worker.length - " / ".length); }
        worker += "</font>)";
      }
      if (x + 1 < g_gridToDXCC[toolElement.qth].length) worker += ", ";
    }
    worker += "</small></th></tr>";
  }
  var newCallList = Array();
  if (toolElement.qso == true)
  {
    if (Object.keys(toolElement.hashes).length > 0)
    {
      worker +=
        "<tr align='center'><td>Call</td><td>Freq</td><td>Sent</td><td>Rcvd</td><td>Station</td><td>Mode</td><td>Band</td><td>QSL</td><td>Last Msg</td><td>DXCC</td><td>Time</td>";

      if (g_callsignLookups.lotwUseEnable == true) worker += "<td>LoTW</td>";
      if (g_callsignLookups.eqslUseEnable == true) worker += "<td>eQSL</td>";
      if (g_callsignLookups.oqrsUseEnable == true) worker += "<td>OQRS</td>";
      worker += "</tr>";
    }
    for (var KeyIsHash in toolElement.hashes)
    {
      if (KeyIsHash in g_QSOhash)
      {
        newCallList.push(g_QSOhash[KeyIsHash]);
      }
    }
    if (
      toolElement.qth in g_liveGrids &&
      g_liveGrids[toolElement.qth].rectangle != null &&
      g_liveGrids[toolElement.qth].isTriangle == false
    )
    {
      for (var KeyIsCall in g_liveGrids[toolElement.qth].rectangle.liveHash)
      {
        if (KeyIsCall in g_liveCallsigns && g_appSettings.gridViewMode == 3)
        { newCallList.push(g_liveCallsigns[KeyIsCall]); }
      }
    }
  }
  else
  {
    if (Object.keys(toolElement.liveHash).length > 0)
    {
      worker +=
        "<tr align='center'><td>Call</td><td>Freq</td><td>Sent</td><td>Rcvd</td><td>Station</td><td>Mode</td><td>Band</td><td>Last Msg</td><td>DXCC</td><td>Time</td>";

      if (g_callsignLookups.lotwUseEnable == true) worker += "<td>LoTW</td>";
      if (g_callsignLookups.eqslUseEnable == true) worker += "<td>eQSL</td>";
      if (g_callsignLookups.oqrsUseEnable == true) worker += "<td>OQRS</td>";
      worker += "</tr>";
    }
    for (var KeyIsCall in toolElement.liveHash)
    {
      if (KeyIsCall in g_liveCallsigns)
      { newCallList.push(g_liveCallsigns[KeyIsCall]); }
    }
  }
  newCallList.sort(compareCallsignTime).reverse();
  for (var x = 0; x < newCallList.length; x++)
  {
    var callsign = newCallList[x];
    var bgDX = " style='font-weight:bold;color:cyan;' ";
    var bgDE = " style='font-weight:bold;color:yellow;' ";
    if (callsign.DXcall == myDEcall)
    { bgDX = " style='background-color:cyan;color:#000;font-weight:bold' "; }
    if (callsign.DEcall == myDEcall)
    { bgDE = " style='background-color:#FFFF00;color:#000;font-weight:bold' "; }
    if (typeof callsign.msg == "undefined" || callsign.msg == "")
    { callsign.msg = "-"; }
    var ageString = "";
    if (timeNowSec() - callsign.time < 3601)
    { ageString = (timeNowSec() - callsign.time).toDHMS(); }
    else
    {
      ageString = userTimeString(callsign.time * 1000);
    }
    worker += "<tr><td" + bgDE + ">";
    worker +=
      "<div style='display:inline-table;cursor:pointer' onclick='startLookup(\"" +
      callsign.DEcall +
      "\",\"" +
      toolElement.qth +
      "\");' >" +
      callsign.DEcall.formatCallsign() +
      "</div>";
    worker += "</td>";
    worker += "<td>" + (callsign.delta > -1 ? callsign.delta : "-") + "</td>";
    worker += "<td>" + callsign.RSTsent + "</td>";
    worker += "<td>" + callsign.RSTrecv + "</td>" + "<td" + bgDX + ">";
    if (callsign.DXcall.indexOf("CQ") == 0 || callsign.DXcall == "-")
    { worker += callsign.DXcall.formatCallsign(); }
    else
    {
      worker +=
        "<div  style='display:inline-table;cursor:pointer' onclick='startLookup(\"" +
        callsign.DXcall +
        "\",null);' >" +
        callsign.DXcall.formatCallsign() +
        "</div>";
    }
    worker +=
      "</td>" +
      "<td style='color:lightblue'>" +
      callsign.mode +
      "</td>" +
      "<td style='color:lightgreen'>" +
      callsign.band +
      "</td>";
    if (toolElement.qso == true)
    {
      worker +=
        "<td align='center'>" +
        (callsign.confirmed ? "&#10004;" : "") +
        "</td>";
    }
    worker +=
      "<td>" +
      callsign.msg +
      "</td><td style='color:yellow'>" +
      g_dxccToAltName[callsign.dxcc] +
      " <font color='lightgreen'>(" +
      g_worldGeoData[g_dxccToGeoData[callsign.dxcc]].pp +
      ")</font></td>" +
      "<td align='center' style='color:lightblue' >" +
      ageString +
      "</td>";
    if (g_callsignLookups.lotwUseEnable == true)
    {
      worker +=
        "<td align='center'>" +
        (callsign.DEcall in g_lotwCallsigns ? "&#10004;" : "") +
        "</td>";
    }
    if (g_callsignLookups.eqslUseEnable == true)
    {
      worker +=
        "<td align='center'>" +
        (callsign.DEcall in g_eqslCallsigns ? "&#10004;" : "") +
        "</td>";
    }
    if (g_callsignLookups.oqrsUseEnable == true)
    {
      worker +=
        "<td align='center'>" +
        (callsign.DEcall in g_oqrsCallsigns ? "&#10004;" : "") +
        "</td>";
    }
    worker += "</tr>";
  }
  worker += "</table>";
  myTooltip.innerHTML = worker;
  g_passingToolTipTableString = worker;
  return newCallList.length;
}

function renderTooltipWindow(feature)
{
  if (g_popupWindowHandle != null)
  {
    try
    {
      createTooltTipTable(feature);
      var adif = g_popupWindowHandle.window.document.getElementById(
        "adifTable"
      );
      adif.innerHTML = g_passingToolTipTableString;
      var myTooltip = document.getElementById("myTooltip");
      var positionInfo = myTooltip.getBoundingClientRect();
      g_popupWindowHandle.show();
      g_popupWindowHandle.focus();

      g_popupWindowHandle.width = parseInt(positionInfo.width) + 20;
      g_popupWindowHandle.height = parseInt(positionInfo.height) + 50;
    }
    catch (e) {}
  }
}

function leftClickGtFlag(feature)
{
  var e = window.event;
  if ((e.which && e.which == 1) || (e.button && e.button == 1))
  {
    startLookup(g_gtFlagPins[feature.key].call, g_gtFlagPins[feature.key].grid);
  }
  return false;
}

function openConditionsWindow()
{
  if (g_conditionsWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_conditions.html",
      {
        show: false,
        id: "GT-Conditions"
      },
      function (new_win)
      {
        g_conditionsWindowHandle = new_win;
        new_win.on("loaded", function ()
        {
          g_conditionsWindowHandle.setMinimumSize(490, 290);
        });
        new_win.on("close", function ()
        {
          g_conditionsWindowHandle.window.g_isShowing = false;
          g_conditionsWindowHandle.window.saveScreenSettings();
          g_conditionsWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      g_conditionsWindowHandle.window.g_isShowing = true;
      g_conditionsWindowHandle.window.saveScreenSettings();
      g_conditionsWindowHandle.show();
      g_conditionsWindowHandle.focus();
    }
    catch (e) {}
  }
}

var g_callRoster = {};

function insertMessageInRoster(
  newMessage,
  msgDEcallsign,
  msgDXcallsign,
  callObj,
  hash
)
{
  var now = timeNowSec();
  if (!(hash in g_callRoster))
  {
    g_callRoster[hash] = {};
    callObj.life = now;
    callObj.reset = false;
  }
  if (callObj.reset)
  {
    callObj.life = now;
    callObj.reset = false;
  }

  if (typeof callObj.life == "undefined")
  {
    callObj.life = now;
    callObj.reset = false;
  }

  g_callRoster[hash].message = newMessage;
  g_callRoster[hash].callObj = callObj;
  g_callRoster[hash].DXcall = msgDXcallsign;
  g_callRoster[hash].DEcall = msgDEcallsign;
  goProcessRoster(true);
}

function openCallRosterWindow(show = true)
{
  if (g_callRosterWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_roster.html",
      {
        show: false,
        id: "GT-roster",
        icon: "img/roster-icon.png"
      },
      function (new_win)
      {
        g_callRosterWindowHandle = new_win;
        new_win.on("loaded", function ()
        {
          g_callRosterWindowHandle.setMinimumSize(390, 250);
          g_callRosterWindowHandle.setResizable(true);
          setRosterTop();
        });
        new_win.on("close", function ()
        {
          g_callRosterWindowHandle.window.g_isShowing = false;
          g_callRosterWindowHandle.window.saveScreenSettings();
          g_callRosterWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      g_callRosterWindowHandle.show();
      g_callRosterWindowHandle.window.g_isShowing = true;
      g_callRosterWindowHandle.window.saveScreenSettings();
      g_callRosterWindowHandle.focus();
      goProcessRoster();
    }
    catch (e) {}
  }
}

function updateRosterWorked()
{
  if (g_callRosterWindowHandle)
  {
    try
    {
      g_callRosterWindowHandle.window.updateWorked();
    }
    catch (e) {}
  }
}

function updateRosterInstances()
{
  if (g_callRosterWindowHandle)
  {
    try
    {
      g_callRosterWindowHandle.window.updateInstances();
    }
    catch (e) {}
  }
}

function updateLogbook()
{
  showWorkedBox(0, 0, true);
}

function openStatsWindow(show = true)
{
  if (g_statsWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_stats.html",
      {
        show: false,
        id: "GT-stats"
      },
      function (new_win)
      {
        g_statsWindowHandle = new_win;
        new_win.on("loaded", function ()
        {
          g_statsWindowHandle.setMinimumSize(620, 200);
          g_statsWindowHandle.setResizable(true);
        });
        new_win.on("close", function ()
        {
          g_statsWindowHandle.window.g_isShowing = false;
          g_statsWindowHandle.window.saveScreenSettings();
          g_statsWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      g_statsWindowHandle.show();
      g_statsWindowHandle.window.g_isShowing = true;
      g_statsWindowHandle.window.saveScreenSettings();
      g_statsWindowHandle.focus();
    }
    catch (e) {}
  }
}

function showMessaging(show = true, cid)
{
  if (g_chatWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_chat.html",
      {
        show: false,
        id: "GT-chat"
      },
      function (new_win)
      {
        g_chatWindowHandle = new_win;
        g_chatWindowHandle.on("loaded", function ()
        {
          g_chatWindowHandle.setMinimumSize(450, 140);
          g_chatWindowHandle.setResizable(true);
        });
        g_chatWindowHandle.on("close", function ()
        {
          g_chatWindowHandle.window.closeMessageArea();
          g_chatWindowHandle.window.g_isShowing = false;
          g_chatWindowHandle.window.saveScreenSettings();
          g_chatWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      g_chatWindowHandle.window.g_isShowing = true;
      g_chatWindowHandle.window.saveScreenSettings();
      g_chatWindowHandle.show();
      g_chatWindowHandle.focus();
      if (typeof cid != "undefined") g_chatWindowHandle.window.openId(cid);
    }
    catch (e) {}
  }
}

function onRightClickGridSquare(feature)
{
  var e = window.event;
  if (
    (e.which && e.button == 2 && event.shiftKey) ||
    (e.button && e.button == 2 && event.shiftKey)
  )
  {
    var myTooltip = document.getElementById("myTooltip");
    createTooltTipTable(feature);
    selectElementContents(myTooltip);
  }
  else if (e.button == 0 && g_mapSettings.mouseOver == false)
  {
    mouseOverDataItem(feature, false);
  }
  else if ((e.which && e.which == 3) || (e.button && e.button == 2))
  {
    if (g_popupWindowHandle == null)
    {
      popupNewWindows();
      var gui = require("nw.gui");
      gui.Window.open(
        "gt_popup.html",
        {
          show: false,
          id: "GT-popup"
        },
        function (new_win)
        {
          g_popupWindowHandle = new_win;
          new_win.on("loaded", function ()
          {
            g_popupWindowHandle.show();
            renderTooltipWindow(feature);
          });
          new_win.on("close", function ()
          {
            g_popupWindowHandle.hide();
          });
        }
      );
      lockNewWindows();
    }
    else
    {
      try
      {
        renderTooltipWindow(feature);
      }
      catch (e) {}
    }
    mouseOutOfDataItem();
  }
  else if ((e.which && e.which == 1) || (e.button && e.button == 0))
  {
    if (typeof feature.spot != "undefined")
    {
      spotLookupAndSetCall(feature.spot);
    }
  }
  return false;
}

function onMouseUpdate(e)
{
  g_mouseX = e.pageX;
  g_mouseY = e.pageY;
  mouseMoveGrid();
}

function getMouseX()
{
  return g_mouseX;
}

function getMouseY()
{
  return g_mouseY;
}
var g_tempGridBox = null;

function tempGridToBox(iQTH, oldGrid, borderColor, boxColor, layer)
{
  var borderWeight = 2;
  var newGridBox = null;
  var LL = squareToLatLong(iQTH.substr(0, 4));
  if (oldGrid)
  {
    if (g_layerSources.temp.hasFeature(oldGrid))
    { g_layerSources.temp.removeFeature(oldGrid); }
  }
  var bounds = [
    [LL.lo1, LL.la1],
    [LL.lo2, LL.la2]
  ];
  newGridBox = rectangle(bounds);
  newGridBox.setId(iQTH);
  const featureStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: boxColor
    }),
    stroke: new ol.style.Stroke({
      color: borderColor,
      width: borderWeight,
      lineJoin: "round"
    }),
    zIndex: 60
  });
  newGridBox.setStyle(featureStyle);
  newGridBox.grid = iQTH;
  newGridBox.size = 0;
  g_layerSources.temp.addFeature(newGridBox);
  return newGridBox;
}
var g_tempGrids = Array();

function onMyKeyDown(event)
{
  if (g_MyGridIsUp == true && g_MyCurrentGrid.length == 4)
  {
    var processedAlert = false;
    var mediaClip = "";
    var failedToAdd = g_dirSeperator + "Balloon-deflating-1.mp3";
    if (event.code == "KeyM")
    {
      mediaClip = g_dirSeperator + "Clicky-1.mp3";
      var valid = addAlert(g_MyCurrentGrid, 2, 3, 2, "", "");
      if (!valid)
      {
        mediaClip = failedToAdd;
      }
      processedAlert = true;
    }
    else if (event.code == "KeyT")
    {
      mediaClip = g_dirSeperator + "Ping-coin.mp3";
      var valid = addAlert(g_MyCurrentGrid, 2, 1, 2, "", "");
      if (!valid)
      {
        mediaClip = failedToAdd;
      }
      processedAlert = true;
    }
    else if (event.code == "KeyV")
    {
      mediaClip = g_dirSeperator + "Slide-ping.mp3";
      var valid = addAlert(g_MyCurrentGrid, 2, 2, 2, "", "");
      if (!valid)
      {
        mediaClip = failedToAdd;
      }
      processedAlert = true;
    }
    if (processedAlert == true)
    {
      playAlertMediaFile(mediaClip);
    }
    return;
  }

  if (event.keyCode == 27)
  {
    alertsPopDiv.style.display = "none";
    rootSettingsDiv.style.display = "none";

    helpDiv.style.display = "none";
    g_helpShow = false;
  }

  if (
    alertsPopDiv.style.display == "none" &&
    rootSettingsDiv.style.display == "none"
  )
  {
    if (event.code in g_hotKeys)
    {
      if (typeof g_hotKeys[event.code].param1 != "undefined")
      {
        var param2 = null;
        if (typeof g_hotKeys[event.code].param2 != "undefined")
        {
          if (typeof event[g_hotKeys[event.code].param2] != "undefined")
          { param2 = event[g_hotKeys[event.code].param2]; }
        }
        g_hotKeys[event.code].func(g_hotKeys[event.code].param1, param2);
      }
      else
      {
        if (event.ctrlKey == false) g_hotKeys[event.code].func();
      }
    }
    else if (event.key in g_hotKeys)
    {
      if (typeof g_hotKeys[event.key].param1 != "undefined")
      {
        var param2 = null;
        if (typeof g_hotKeys[event.key].param2 != "undefined")
        {
          if (typeof event[g_hotKeys[event.key].param2] != "undefined")
          { param2 = event[g_hotKeys[event.key].param2]; }
        }
        g_hotKeys[event.key].func(g_hotKeys[event.key].param1, param2);
      }
      else
      {
        if (event.ctrlKey == false) g_hotKeys[event.key].func();
      }
    }
  }
}

function clearTempGrids()
{
  g_layerSources.temp.clear();
  g_tempGrids = Array();
}

var g_currentShapes = {};

function clearCurrentShapes()
{
  g_layerSources.award.clear();
  g_currentShapes = {};
}

function mapMemory(x, save, exit = false)
{
  if (save == true)
  {
    g_mapMemory[x].LoLa = g_mapView.getCenter();
    g_mapMemory[x].zoom = g_mapView.getZoom();
    localStorage.mapMemory = JSON.stringify(g_mapMemory);
    if (exit == false)
    {
      playAlertMediaFile("Clicky-3.mp3");
    }
  }
  else
  {
    if (g_mapMemory[x].zoom != -1)
    {
      g_mapView.setCenter(g_mapMemory[x].LoLa);
      g_mapView.setZoom(g_mapMemory[x].zoom);
    }
  }
}

var g_hotKeys = {};

function registerHotKey(key, func, param1, param2)
{
  g_hotKeys[key] = {};
  g_hotKeys[key].func = func;
  g_hotKeys[key].param1 = param1;
  g_hotKeys[key].param2 = param2;
}

function registerHotKeys()
{
  registerHotKey("1", setTrophyOverlay, 0);
  registerHotKey("2", setTrophyOverlay, 1);
  registerHotKey("3", setTrophyOverlay, 2);
  registerHotKey("4", setTrophyOverlay, 3);
  registerHotKey("5", setTrophyOverlay, 4);
  registerHotKey("6", setTrophyOverlay, 5);
  registerHotKey("7", setTrophyOverlay, 6);
  registerHotKey("8", setTrophyOverlay, 7);
  registerHotKey("9", toggleTimezones);
  registerHotKey("0", toggleNexrad);

  registerHotKey("KeyA", toggleAnimate);
  registerHotKey("KeyB", toggleAllGrids);
  registerHotKey("KeyC", showConditionsBox);
  registerHotKey("KeyD", toggleMoon);
  registerHotKey("KeyE", toggleMoonTrack);
  registerHotKey("KeyF", toggleSpotPaths);
  registerHotKey("KeyG", toggleGtMap);
  registerHotKey("KeyH", toggleHeatSpots);
  registerHotKey("KeyI", showRootInfoBox);
  // registerHotKey("KeyJ", setTrophyOverlay, 8);
  registerHotKey("KeyK", makeScreenshots);
  registerHotKey("KeyL", adifLoadDialog);
  registerHotKey("KeyM", toggleAlertMute);
  registerHotKey("KeyN", toggleEarth);
  registerHotKey("KeyO", togglePskSpots);
  registerHotKey("KeyP", togglePushPinMode);
  registerHotKey("KeyQ", cycleGridView);
  registerHotKey("KeyR", openCallRosterWindow);
  registerHotKey("KeyS", showSettingsBox);
  registerHotKey("KeyT", toggleSpotOverGrids);
  registerHotKey("KeyU", toggleMergeOverlay);
  registerHotKey("KeyW", toggleGridMode);
  registerHotKey("KeyX", toggleMouseTrack);
  registerHotKey("KeyY", toggleStrikeGlobal);
  registerHotKey("KeyZ", setCenterQTH);
  registerHotKey("Minus", toggleCRScript);

  registerHotKey("F5", mapMemory, 0, "shiftKey");
  registerHotKey("F6", mapMemory, 1, "shiftKey");
  registerHotKey("F7", mapMemory, 2, "shiftKey");
  registerHotKey("F8", mapMemory, 3, "shiftKey");
  registerHotKey("F9", mapMemory, 4, "shiftKey");
  registerHotKey("F10", mapMemory, 5, "shiftKey");
  registerHotKey("F11", toggleFullscreen);
  registerHotKey("F12", toggleMenu);
  registerHotKey("F1", toggleHelp);
  registerHotKey("?", toggleHelp);
  registerHotKey("Equal", cycleTrophyOverlay);
}

function toggleMoon()
{
  g_appSettings.moonTrack ^= 1;

  if (g_appSettings.moonTrack == 1)
  {
    moonLayer.show();
  }
  else
  {
    moonLayer.hide();
  }
}

function toggleMoonTrack()
{
  g_appSettings.moonPath ^= 1;

  moonLayer.refresh();
}

function toggleFullscreen()
{
  if (document.fullscreenElement == null)
  {
    mainBody.requestFullscreen();
  }
  else
  {
    document.exitFullscreen();
  }
}

function toggleMenu()
{
  if (g_menuShowing == false) collapseMenu(false);
  else collapseMenu(true);
}

g_helpShow = false;
function toggleHelp()
{
  g_helpShow = !g_helpShow;
  if (g_helpShow == true)
  {
    helpDiv.style.display = "block";
  }
  else helpDiv.style.display = "none";
}

function onMyKeyUp(event) {}

var g_currentOverlay = 0;

function cycleTrophyOverlay()
{
  g_currentOverlay++;
  g_currentOverlay %= 8;

  setTrophyOverlay(g_currentOverlay);
}

function didWork(testObj)
{
  return testObj.worked;
}

function didConfirm(testObj)
{
  return testObj.confirmed;
}

function makeTitleInfo(mapWindow)
{
  var band =
    g_appSettings.gtBandFilter.length == 0
      ? "Mixed"
      : g_appSettings.gtBandFilter == "auto"
        ? myBand
        : g_appSettings.gtBandFilter;
  var mode =
    g_appSettings.gtModeFilter.length == 0
      ? "Mixed"
      : g_appSettings.gtModeFilter == "auto"
        ? myMode
        : g_appSettings.gtModeFilter;
  var space = " ";
  var news = "GridTracker [Band: " + band + " Mode: " + mode;
  var end = "]";

  if (mapWindow)
  {
    news += " Layer: " + g_viewInfo[g_currentOverlay][1];
  }

  if (g_currentOverlay == 0 && g_appSettings.gridViewMode == 1)
  { return news + end; }

  var workline =
    " - Worked " +
    g_viewInfo[g_currentOverlay][2] +
    " Confirmed " +
    g_viewInfo[g_currentOverlay][3];
  if (
    g_viewInfo[g_currentOverlay][2] <= g_viewInfo[g_currentOverlay][4] &&
    g_viewInfo[g_currentOverlay][4] > 0
  )
  {
    end =
      " Needed " +
      (g_viewInfo[g_currentOverlay][4] - g_viewInfo[g_currentOverlay][2]) +
      "]";
  }
  return news + workline + end;
}

function setTrophyOverlay(which)
{
  g_currentOverlay = which;
  window.document.title = makeTitleInfo(true);
  trophyImg.src = g_trophyImageArray[which];
  myTrophyTooltip.style.zIndex = -1;
  clearCurrentShapes();
  // set the scope of key
  var key = 0;

  if (which == 0)
  {
    for (key in g_layerVectors)
    {
      g_layerVectors[key].setVisible(true);
    }
    if (
      g_appSettings.gtFlagImgSrc > 0 &&
      g_appSettings.gtShareEnable == true &&
      g_mapSettings.offlineMode == false
    )
    {
      g_layerVectors.gtflags.setVisible(true);
    }
    else
    {
      g_layerVectors.gtflags.setVisible(false);
    }
    g_layerVectors.award.setVisible(false);
    if (g_showAllGrids == false)
    {
      g_layerVectors["line-grids"].setVisible(false);
      g_layerVectors["big-grids"].setVisible(false);
      g_layerVectors["short-grids"].setVisible(false);
      g_layerVectors["long-grids"].setVisible(false);
    }
    if (g_timezoneLayer)
    {
      if (g_timezonesEnable == 1)
      {
        g_timezoneLayer.setVisible(true);
      }
      else
      {
        g_timezoneLayer.setVisible(false);
      }
    }
  }
  else
  {
    if (g_mapSettings.mergeOverlay == false)
    {
      for (key in g_layerVectors)
      {
        g_layerVectors[key].setVisible(false);
      }
    }
    else
    {
      for (key in g_layerVectors)
      {
        g_layerVectors[key].setVisible(true);
      }
      if (
        g_appSettings.gtFlagImgSrc > 0 &&
        g_appSettings.gtShareEnable == true &&
        g_mapSettings.offlineMode == false
      )
      {
        g_layerVectors.gtflags.setVisible(true);
      }
      else
      {
        g_layerVectors.gtflags.setVisible(false);
      }
      if (g_showAllGrids == false)
      {
        g_layerVectors["line-grids"].setVisible(false);
        g_layerVectors["big-grids"].setVisible(false);
        g_layerVectors["short-grids"].setVisible(false);
        g_layerVectors["long-grids"].setVisible(false);
      }
    }
    g_layerVectors.award.setVisible(true);
    if (g_timezoneLayer)
    {
      g_timezoneLayer.setVisible(false);
    }
    mapLoseFocus();
  }

  g_layerVectors.strikes.setVisible(true);

  if (which == 1)
  {
    for (key in g_cqZones)
    {
      var boxColor = "#FF000015";
      var borderColor = "#005500FF";
      var borderWeight = 1;
      if (didConfirm(g_cqZones[key]))
      {
        boxColor = "#00FF0066";
      }
      else if (didWork(g_cqZones[key]))
      {
        boxColor = "#FFFF0066";
      }

      g_currentShapes[key] = shapeFeature(
        key,
        g_cqZones[key].geo,
        "cqzone",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[key]);
    }
  }
  if (which == 2)
  {
    for (key in g_ituZones)
    {
      var boxColor = "#FF000015";
      var borderColor = "#800080FF";
      var borderWeight = 1;
      if (didConfirm(g_ituZones[key]))
      {
        boxColor = "#00FF0066";
        borderWeight = 1;
      }
      else if (didWork(g_ituZones[key]))
      {
        boxColor = "#FFFF0066";
        borderWeight = 1;
      }

      g_currentShapes[key] = shapeFeature(
        key,
        g_ituZones[key].geo,
        "ituzone",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[key]);
    }
  }
  if (which == 3)
  {
    for (key in g_wacZones)
    {
      var boxColor = "#FF000015";
      var borderColor = "#006666FF";
      var borderWeight = 1;
      var originalKey = key;
      if (didConfirm(g_wacZones[key]))
      {
        boxColor = "#00FF0066";
      }
      else if (didWork(g_wacZones[key]))
      {
        boxColor = "#FFFF0066";
      }

      g_currentShapes[originalKey] = shapeFeature(
        originalKey,
        g_wacZones[originalKey].geo,
        "wac",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[originalKey]);
    }
  }
  if (which == 4)
  {
    for (key in g_wasZones)
    {
      var boxColor = "#FF000020";
      var borderColor = "#0000FFFF";
      var borderWeight = 1;
      if (didConfirm(g_wasZones[key]))
      {
        boxColor = "#00FF0066";
      }
      else if (didWork(g_wasZones[key]))
      {
        boxColor = "#FFFF0066";
      }

      g_currentShapes[key] = shapeFeature(
        key,
        g_wasZones[key].geo,
        "was",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[key]);
    }
  }
  if (which == 5)
  {
    for (key in g_worldGeoData)
    {
      var boxColor = "#FF000015";
      var borderColor = "#0000FFFF";
      var borderWeight = 1;
      if (didConfirm(g_worldGeoData[key]))
      {
        boxColor = "#00FF0066";
      }
      else if (didWork(g_worldGeoData[key]))
      {
        boxColor = "#FFFF0066";
      }

      if (g_worldGeoData[key].geo != "deleted")
      {
        g_currentShapes[key] = shapeFeature(
          key,
          g_worldGeoData[key].geo,
          "dxcc",
          boxColor,
          borderColor,
          borderWeight
        );
        g_layerSources.award.addFeature(g_currentShapes[key]);
      }
    }
  }
  if (which == 6)
  {
    for (key in g_countyData)
    {
      var boxColor = "#00000000";
      var borderColor = "#0000FFFF";
      var borderWeight = 0.1;
      if (didConfirm(g_countyData[key]))
      {
        boxColor = "#00FF0066";
        borderWeight = 1;
      }
      else if (didWork(g_countyData[key]))
      {
        boxColor = "#FFFF0066";
        borderWeight = 1;
      }

      g_currentShapes[key] = shapeFeature(
        key,
        g_countyData[key].geo,
        "usc",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[key]);
    }
  }
  if (which == 7)
  {
    for (key in g_us48Data)
    {
      var LL = squareToLatLong(key);
      var bounds = [
        [LL.lo1, LL.la1],
        [LL.lo2, LL.la2]
      ];

      var boxColor = "#FF000015";
      var borderColor = "#0000FFFF";
      var borderWeight = 0.1;
      if (g_us48Data[key].confirmed)
      {
        boxColor = "#00FF0066";
        borderWeight = 0.2;
      }
      else if (g_us48Data[key].worked)
      {
        boxColor = "#FFFF0066";
        borderWeight = 0.2;
      }

      g_currentShapes[key] = gridFeature(
        key,
        rectangle(bounds),
        "us48",
        boxColor,
        borderColor,
        borderWeight
      );
      g_layerSources.award.addFeature(g_currentShapes[key]);
    }
  }

  updateSpotView(true);
}

function gridFeature(
  key,
  objectData,
  propname,
  fillColor,
  borderColor,
  borderWidth
)
{
  var style = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: borderColor,
      width: borderWidth
    }),
    fill: new ol.style.Fill({
      color: fillColor
    })
  });

  objectData.setStyle(style);
  objectData.set("prop", propname);
  objectData.set("grid", key);
  objectData.size = 2;
  return objectData;
}

var g_lastMoon = null;

function moonOver(feature)
{
  var data = subLunar(timeNowSec());

  var object = doRAconvert(g_myLon, g_myLat, data.RA, data.Dec);
  var elevation = object.elevation.toFixed(1);
  var elColor = "yellow";
  if (elevation <= 0) elColor = "red";
  if (elevation > 10.0) elColor = "lightgreen";
  var worker = "<table class='darkTable'>";
  worker +=
    "<tr><th colspan=2 style='font-size:15px;color:cyan;'>Moon</th></tr>";
  worker +=
    "<tr><th >Azimuth</th><td  style='color:lightgreen'>" +
    object.azimuth.toFixed(1) +
    "&deg;</td></tr>";
  worker +=
    "<tr><th >Elevation</th><td  style='color:" +
    elColor +
    "'>" +
    elevation +
    "</td></tr>";
  worker += "</table>";

  myMoonTooltip.innerHTML = worker;

  if (g_lastMoon)
  {
    moonMove();
    return;
  }
  g_lastMoon = feature;

  var positionInfo = myMoonTooltip.getBoundingClientRect();
  myMoonTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
  myMoonTooltip.style.top = getMouseY() + 22 + "px";
  myMoonTooltip.style.zIndex = 499;
  myMoonTooltip.style.display = "block";
}

function moonOut()
{
  g_lastMoon = null;
  myMoonTooltip.style.zIndex = -1;
}

function moonMove()
{
  var positionInfo = myMoonTooltip.getBoundingClientRect();
  myMoonTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
  myMoonTooltip.style.top = getMouseY() + 22 + "px";
}

var g_lastTrophy = null;

function trophyOver(feature)
{
  if (g_lastTrophy && g_lastTrophy == feature)
  {
    trophyMove();
    return;
  }
  g_lastTrophy = feature;

  var name = feature.getGeometryName();

  var infoObject = {};
  var trophy = "";
  var zone = null;

  var key = feature.get("prop");
  if (key == "cqzone")
  {
    trophy = "CQ Zone";
    infoObject = g_cqZones[name];
    zone = name;
    name = g_cqZones[name].name;
  }

  if (key == "ituzone")
  {
    trophy = "ITU Zone";
    infoObject = g_ituZones[name];
  }
  if (key == "wac" && name in g_wacZones)
  {
    trophy = "Continent";
    infoObject = g_wacZones[name];
  }
  if (key == "was" && name in g_wasZones)
  {
    trophy = "US State";
    infoObject = g_wasZones[name];
  }
  if (key == "dxcc" && name in g_worldGeoData)
  {
    trophy = "DXCC";
    var ref = name;
    infoObject = g_worldGeoData[ref];
    name =
      g_worldGeoData[ref].name +
      " <font color='orange'>(" +
      g_worldGeoData[ref].pp +
      ")</font>";
  }
  if (key == "usc")
  {
    trophy = "US County";
    infoObject = g_countyData[name];
    name = infoObject.geo.properties.n + ", " + infoObject.geo.properties.st;
  }
  if (key == "us48")
  {
    trophy = "US Continental Grids";
    infoObject = g_us48Data[feature.get("grid")];
    name = feature.get("grid");

    if (name in g_gridToState)
    {
      zone = "";
      for (var x = 0; x < g_gridToDXCC[name].length; x++)
      {
        if (name in g_gridToState)
        {
          for (var y = 0; y < g_gridToState[name].length; y++)
          {
            if (
              g_gridToDXCC[name][x] ==
                g_StateData[g_gridToState[name][y]].dxcc &&
              g_gridToDXCC[name][x] == 291
            )
            {
              zone += g_StateData[g_gridToState[name][y]].name + ", ";
            }
          }
        }
      }
      zone = zone.substr(0, zone.length - 2);
    }
  }

  var worker = "<table>";
  worker += "<tr><th colspan=2 >" + trophy + "</th></tr>";

  worker +=
    "<tr><td colspan=2><font color='white'><b>" +
    name +
    "</b></font></td></tr>";

  if (zone)
  {
    worker +=
      " <tr><td colspan=2><font color='lightgreen'>" +
      zone +
      "</font></td></tr>";
  }

  var wc1Table = "<td></td>";
  if (infoObject.worked)
  {
    wc1Table = "<td align=center><table class='darkTable'>";
    wc1Table +=
      "<tr><td colspan=2 ><font  color='yellow'>Worked</font></td></tr>";
    wc1Table += "<tr><td align=right><font color='green'>Band</font></td>";
    wc1Table += "<td align=left><table class='subtable'>";
    var keys = Object.keys(infoObject.worked_bands).sort();
    for (key in keys)
    {
      wc1Table +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.worked_bands[keys[key]] +
        ") " +
        "</font></td></tr>";
    }
    wc1Table += "</table></td>";
    wc1Table += "</tr>";
    wc1Table += "<tr>";
    wc1Table += "<td align=right><font color='orange'>Mode</font></td>";
    wc1Table += "<td align=left><table class='subtable'>";
    keys = Object.keys(infoObject.worked_modes).sort();
    for (key in keys)
    {
      wc1Table +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.worked_modes[keys[key]] +
        ") " +
        "</font></td></tr>";
    }

    wc1Table += "</table></td>";
    wc1Table += "</tr>";
    wc1Table += "</table></td>";
  }
  var wcTable = "<td></td>";
  if (infoObject.confirmed)
  {
    wcTable = "<td align=center><table class='darkTable'>";
    wcTable +=
      "<tr><td colspan=2 ><font  color='lightgreen'>Confirmed</font></td></tr>";
    wcTable += "<tr><td align=right><font color='green'>Band</font></td>";
    wcTable += "<td align=left><table class='subtable'>";
    var keys = Object.keys(infoObject.confirmed_bands).sort();
    for (key in keys)
    {
      wcTable +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.confirmed_bands[keys[key]] +
        ") " +
        "</font></td></tr>";
    }
    wcTable += "</table></td>";
    wcTable += "</tr>";
    wcTable += "<tr>";
    wcTable += "<td align=right><font color='orange'>Mode</font></td>";
    wcTable += "<td align=left><table class='subtable'>";
    keys = Object.keys(infoObject.confirmed_modes).sort();
    for (key in keys)
    {
      wcTable +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.confirmed_modes[keys[key]] +
        ") " +
        "</font></td></tr>";
    }
    wcTable += "</table></td>";
    wcTable += "</tr>";
    wcTable += "</table></td>";
  }
  if (!infoObject.worked && !infoObject.confirmed)
  {
    worker +=
      "<tr><td colspan=2 ><font  color='orange'>Needed</font></td></tr>";
  }
  else
  {
    worker += "<tr>" + wc1Table + wcTable + "</tr>";
  }

  worker += "</table>";

  myTrophyTooltip.innerHTML =
    "<div style='font-size:15px;color:cyan;' class='roundBorder'>" +
    worker +
    "</div>";
  var positionInfo = myTrophyTooltip.getBoundingClientRect();
  myTrophyTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
  myTrophyTooltip.style.top = getMouseY() - positionInfo.height - 22 + "px";
  myTrophyTooltip.style.zIndex = 499;
  myTrophyTooltip.style.display = "block";
}

function trophyOut()
{
  g_lastTrophy = null;
  myTrophyTooltip.style.zIndex = -1;
}

function trophyMove()
{
  var positionInfo = myTrophyTooltip.getBoundingClientRect();
  myTrophyTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
  myTrophyTooltip.style.top = getMouseY() - positionInfo.height - 22 + "px";
}

var g_MyCurrentGrid = "";
var g_MyGridIsUp = false;

function mouseDownGrid(longlat, event)
{
  var grid = "";
  grid = latLonToGridSquare(longlat[1], longlat[0]);
  g_MyCurrentGrid = grid.substr(0, 4);
  var worker = "";
  worker += "<table align='center' class='darkTable'><tr style='color:white;'>";
  var bearing = parseInt(
    MyCircle.bearing(g_myLat, g_myLon, longlat[1], longlat[0])
  );
  worker +=
    "<tr><td>Dist</td><td style='color:lightgreen'>" +
    parseInt(
      MyCircle.distance(
        g_myLat,
        g_myLon,
        longlat[1],
        longlat[0],
        distanceUnit.value
      ) * MyCircle.validateRadius(distanceUnit.value)
    ) +
    distanceUnit.value.toLowerCase() +
    "</td></tr>";
  worker +=
    "<tr><td>Azim</td><td style='color:yellow'>" + bearing + "&deg;</td></tr>";
  worker +=
    "<tr><td>Lat</td><td style='color:orange'>" +
    longlat[1].toFixed(3) +
    "</td></tr>";
  worker +=
    "<tr><td>Long</td><td style='color:lightblue'>" +
    longlat[0].toFixed(3) +
    "</td></tr></table>";
  if (grid in g_gridToDXCC)
  {
    worker +=
      "<table align='center' class='darkTable' style='border-top:none'><tr style='color:white;'>";
    worker += "<tr style='color:orange;'>";
    for (var x = 0; x < g_gridToDXCC[grid].length; x++)
    {
      worker +=
        "<td>" +
        g_dxccToAltName[g_gridToDXCC[grid][x]] +
        " <font color='lightgreen'>(" +
        g_worldGeoData[g_dxccToGeoData[g_gridToDXCC[grid][x]]].pp +
        ")</font></td>";
    }
    if (grid in g_gridToState)
    {
      worker += "</tr><tr style='color:yellow;'>";
      for (var x = 0; x < g_gridToDXCC[grid].length; x++)
      {
        worker += "<td>";
        if (grid in g_gridToState)
        {
          for (var y = 0; y < g_gridToState[grid].length; y++)
          {
            if (
              g_gridToDXCC[grid][x] == g_StateData[g_gridToState[grid][y]].dxcc
            )
            {
              worker += g_StateData[g_gridToState[grid][y]].name + "<br/>";
            }
          }
        }
        worker += "</td>";
      }
    }
    worker += "</tr></table>";
  }

  g_tempGridBox = tempGridToBox(grid, g_tempGridBox, "#000000FF", "#00000000");
  myGridTooltip.innerHTML =
    "<div style='font-size:14px;font-weight:bold;color:cyan;margin:0 auto' class='roundBorder'>" +
    grid +
    "</div>" +
    worker;
  var positionInfo = myGridTooltip.getBoundingClientRect();
  myGridTooltip.style.left = event.pixel[0] - positionInfo.width / 2 + "px";
  myGridTooltip.style.top = event.pixel[1] - positionInfo.height - 22 + "px";
  myGridTooltip.style.zIndex = 499;
  myGridTooltip.style.display = "block";
  g_MyGridIsUp = true;
}

function mouseMoveGrid()
{
  if (g_MyGridIsUp == true)
  {
    var positionInfo = myGridTooltip.getBoundingClientRect();
    myGridTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
    myGridTooltip.style.top = getMouseY() - positionInfo.height - 22 + "px";
  }
}

function mouseUpGrid()
{
  g_MyGridIsUp = false;
  myGridTooltip.style.zIndex = -1;

  if (g_tempGridBox)
  {
    if (g_layerSources.temp.hasFeature(g_tempGridBox))
    { g_layerSources.temp.removeFeature(g_tempGridBox); }
  }

  g_tempGridBox = null;
}

var g_lastGtFlag = null;
function mouseOverGtFlag(feature)
{
  if (g_lastGtFlag && g_lastGtFlag == feature)
  {
    gtFlagMove();
    return;
  }
  g_lastGtFlag = feature;

  createFlagTipTable(feature);

  var positionInfo = myFlagtip.getBoundingClientRect();
  myFlagtip.style.left = getMouseX() + 15 + "px";
  myFlagtip.style.top = getMouseY() - positionInfo.height - 5 + "px";

  myFlagtip.style.zIndex = 499;
  myFlagtip.style.display = "block";

  if (feature.size == 73 && feature != g_lasttimezone)
  {
    if (g_lasttimezone != null)
    {
      g_lasttimezone.setStyle(null);
    }

    var style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: "#FFFF0088"
      })
    });

    feature.setStyle(style);
    g_lasttimezone = feature;
  }
}

function mouseOutGtFlag(mouseEvent)
{
  g_lastGtFlag = null;
  myFlagtip.style.zIndex = -1;

  if (g_lasttimezone != null)
  {
    g_lasttimezone.setStyle(null);
    g_lasttimezone = null;
  }
}

function gtFlagMove()
{
  var positionInfo = myFlagtip.getBoundingClientRect();
  myFlagtip.style.left = getMouseX() + 15 + "px";
  myFlagtip.style.top = getMouseY() - positionInfo.height - 5 + "px";
}

var g_lastDataGridUp = null;

function mouseOverDataItem(mouseEvent, fromHover)
{
  if (g_MyGridIsUp) return;
  if (g_lastDataGridUp && g_lastDataGridUp == mouseEvent)
  {
    mouseMoveDataItem(mouseEvent);
    return;
  }
  if (g_mapSettings.mouseOver == true && fromHover == false) return;

  if (g_mapSettings.mouseOver == false && fromHover == true) return;

  g_lastDataGridUp = mouseEvent;
  var myTooltip = null;
  var callListLength = 0;
  var isFlag = false;

  myTooltip = document.getElementById("myTooltip");
  callListLength = createTooltTipTable(mouseEvent);
  var positionInfo = myTooltip.getBoundingClientRect();
  var windowWidth = window.innerWidth;
  var top = 0;
  var noRoomLeft = false;
  var noRoomRight = false;
  if (
    typeof mouseEvent.spot != "undefined" &&
    g_receptionReports.spots[mouseEvent.spot].bearing > 180
  )
  { noRoomRight = true; }
  myTooltip.style.left = getMouseX() + 15 + "px";
  top = parseInt(getMouseY() - 20 - (callListLength / 2) * 25);
  if (windowWidth - getMouseX() < positionInfo.width || noRoomRight == true)
  {
    myTooltip.style.left = getMouseX() - (10 + positionInfo.width) + "px";
    top = parseInt(getMouseY() - 20 - (callListLength / 2) * 25);
    noRoomRight = true;
  }
  if (getMouseX() - positionInfo.width < 0)
  {
    noRoomLeft = true;
  }
  if (noRoomLeft == true && noRoomRight == true)
  {
    myTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
    top = getMouseY() + 30;
  }
  if (top < 0) top = 0;
  myTooltip.style.top = top + "px";
  myTooltip.style.zIndex = 500;
  myTooltip.style.display = "block";
}

function mouseMoveDataItem(mouseEvent)
{
  var myTooltip = document.getElementById("myTooltip");
  var positionInfo = myTooltip.getBoundingClientRect();
  var windowWidth = window.innerWidth;
  var top = 0;
  var noRoomLeft = false;
  var noRoomRight = false;
  if (
    typeof mouseEvent.spot != "undefined" &&
    g_receptionReports.spots[mouseEvent.spot].bearing > 180
  )
  { noRoomRight = true; }
  myTooltip.style.left = getMouseX() + 15 + "px";
  top = Number(myTooltip.style.top);
  if (top > 20) top = getMouseY() - 20 + "px";
  if (windowWidth - getMouseX() < positionInfo.width || noRoomRight == true)
  {
    myTooltip.style.left = getMouseX() - (10 + positionInfo.width) + "px";
    if (top > 20) top = getMouseY() - 20 + "px";
    noRoomRight = true;
  }
  if (getMouseX() - positionInfo.width < 0)
  {
    noRoomLeft = true;
  }
  if (noRoomLeft == true && noRoomRight == true)
  {
    myTooltip.style.left = getMouseX() - positionInfo.width / 2 + "px";
    top = getMouseY() + 30;
  }
  if (top < 0) top = 0;
  myTooltip.style.top = top + "px";
}

function mouseOutOfDataItem(mouseEvent)
{
  var myTooltip = document.getElementById("myTooltip");
  myTooltip.style.zIndex = -1;
  g_lastDataGridUp = null;

  if (g_spotsEnabled == 1) g_layerSources["psk-hop"].clear();
}

function reloadInfo(bandOrMode)
{
  if (g_statsWindowHandle != null)
  {
    try
    {
      g_statsWindowHandle.window.reloadInfo();
    }
    catch (e) {}
  }
}

function twoWideToLatLong(qth)
{
  qth = qth.toUpperCase();
  var a = qth.charCodeAt(0) - 65;
  var b = qth.charCodeAt(1) - 65;

  var la1 = b * 10;
  var lo1 = a * 20;
  var la2 = la1 + 10;
  var lo2 = lo1 + 20;
  var LatLong = [];

  la1 -= 90;
  lo1 -= 180;
  la2 -= 90;
  lo2 -= 180;
  LatLong.la1 = la1;
  LatLong.lo1 = lo1;
  LatLong.la2 = la2;
  LatLong.lo2 = lo2;
  return LatLong;
}

function squareToLatLongAll(qth)
{
  qth = qth.toUpperCase();
  var a = qth.charCodeAt(0) - 65;
  var b = qth.charCodeAt(1) - 65;
  var c = qth.charCodeAt(2) - 48;
  var d = qth.charCodeAt(3) - 48;
  var la1 = b * 10 + d;
  var lo1 = a * 20 + c * 2;
  var la2;
  var lo2;
  var LatLong = [];
  if (qth.length == 4)
  {
    la2 = la1 + 1;
    lo2 = lo1 + 2;
    LatLong.size = 4;
  }
  else
  {
    var lo3;
    var la3;
    var e = qth.charCodeAt(4) - 65;
    var f = qth.charCodeAt(5) - 65;
    var R = 5 / 60;
    var T = 2.5 / 60;
    lo3 = (e * 5) / 60;
    la3 = (f * 2.5) / 60;
    la1 += la3;
    lo1 += lo3;
    la2 = la1 + T;
    lo2 = lo1 + R;
    LatLong.size = 6;
  }

  la1 -= 90;
  lo1 -= 180;
  la2 -= 90;
  lo2 -= 180;
  LatLong.la1 = la1;
  LatLong.lo1 = lo1;
  LatLong.la2 = la2;
  LatLong.lo2 = lo2;
  return LatLong;
}

function squareToLatLong(qth)
{
  qth = qth.toUpperCase();
  var a = qth.charCodeAt(0) - 65;
  var b = qth.charCodeAt(1) - 65;
  var c = qth.charCodeAt(2) - 48;
  var d = qth.charCodeAt(3) - 48;
  var la1 = b * 10 + d;
  var lo1 = a * 20 + c * 2;
  var la2;
  var lo2;
  var LatLong = [];
  if (qth.length == 4 || g_appSettings.sixWideMode == 0)
  {
    la2 = la1 + 1;
    lo2 = lo1 + 2;
    LatLong.size = 4;
  }
  else
  {
    var lo3;
    var la3;
    var e = qth.charCodeAt(4) - 65;
    var f = qth.charCodeAt(5) - 65;
    var R = 5 / 60;
    var T = 2.5 / 60;
    lo3 = (e * 5) / 60;
    la3 = (f * 2.5) / 60;
    la1 += la3;
    lo1 += lo3;
    la2 = la1 + T;
    lo2 = lo1 + R;
    LatLong.size = 6;
  }
  la1 -= 90;
  lo1 -= 180;
  la2 -= 90;
  lo2 -= 180;
  LatLong.la1 = la1;
  LatLong.lo1 = lo1;
  LatLong.la2 = la2;
  LatLong.lo2 = lo2;
  return LatLong;
}

function iconFeature(center, iconObj, zIndex)
{
  var feature = new ol.Feature({
    geometry: new ol.geom.Point(center),
    name: "pin"
  });

  var iconStyle = new ol.style.Style({
    zIndex: zIndex,
    image: iconObj
  });

  feature.setStyle(iconStyle);
  return feature;
}

function qthToQsoBox(
  iQTH,
  iHash,
  iCQ,
  iNew,
  locked,
  DE,
  worked,
  confirmed,
  band,
  wspr
)
{
  if (g_appSettings.gridViewMode == 1) return null;

  var borderColor = "#222288FF";
  var boxColor = "#0000FF" + g_gridAlpha;
  var borderWeight = 0.5;

  var myDEzOffset = 10;
  var myDEbox = false;
  if (worked)
  {
    boxColor = "#FFFF00" + g_gridAlpha;
    borderColor = g_qsoWorkedBorderColor;
  }
  if (confirmed)
  {
    boxColor = "#FF0000" + g_gridAlpha;
    borderColor = g_qsoWorkedBorderColor;
  }
  if (wspr != null)
  {
    boxColor = "hsl(" + wspr + ",100%,50%)";
    borderColor = "gray";
  }

  var zIndex = 2;
  var entityVisibility = Number(g_appSettings.gridViewMode) > 1;
  var returnRectangle = null;
  if (g_appSettings.sixWideMode == 0) iQTH = iQTH.substr(0, 4);
  else iQTH = iQTH.substr(0, 6);
  var rect = null;
  if (iQTH == "")
  {
    for (var key in g_qsoGrids)
    {
      if (iHash in g_qsoGrids[key].rectangle.hashes)
      {
        rect = g_qsoGrids[key];
        break;
      }
    }
  }
  else
  {
    if (iQTH in g_qsoGrids)
    {
      rect = g_qsoGrids[iQTH];
    }
  }
  if (rect == null)
  {
    if (iQTH != "")
    {
      // Valid QTH
      var triangleView = false;
      if (
        Number(g_appSettings.gridViewMode) == 3 &&
        iQTH in g_liveGrids &&
        entityVisibility == true &&
        g_pushPinMode == false
      )
      {
        if (confirmed)
        {
          hideLiveGrid(iQTH);
        }
        else
        {
          liveTriangleGrid(iQTH);
          triangleView = true;
        }
      }
      LL = squareToLatLong(iQTH);
      if (LL.size == 6)
      {
        borderColor = "#000000FF";
        zIndex = 50;
      }
      newRect = {};
      newRect.shouldDim = false;
      newRect.qth = iQTH;

      var bounds = [
        [LL.lo1, LL.la1],
        [LL.lo2, LL.la2]
      ];
      if (triangleView == true) newRect.rectangle = triangle(bounds, true);
      else newRect.rectangle = rectangle(bounds);

      newRect.isTriangle = triangleView;

      const featureHoverStyle = new ol.style.Style({
        fill: new ol.style.Fill({
          color: boxColor
        }),
        stroke: new ol.style.Stroke({
          color: borderColor,
          width: borderWeight,
          lineJoin: "round"
        }),
        zIndex: zIndex
      });
      newRect.rectangle.setStyle(featureHoverStyle);

      newRect.rectangle.qth = iQTH;

      if (g_pushPinMode == false && entityVisibility == true)
      { g_layerSources.qso.addFeature(newRect.rectangle); }

      var newPin = g_colorLeafletQPins.worked[band];
      if (confirmed) newPin = g_colorLeafletQPins.confirmed[band];

      newRect.rectangle.pin = iconFeature(
        ol.extent.getCenter(newRect.rectangle.getGeometry().getExtent()),
        g_appSettings.sixWideMode == 1 ? newPin : g_pushPinIconOff,
        zIndex
      );
      newRect.rectangle.pin.qth = iQTH;
      newRect.rectangle.pin.hashes = {};
      newRect.rectangle.pin.hashes[iHash] = 1;
      newRect.rectangle.pin.size = LL.size;

      if (g_pushPinMode && entityVisibility == true)
      { g_layerSources["qso-pins"].addFeature(newRect.rectangle.pin); }

      newRect.rectangle.locked = locked;
      newRect.rectangle.worked = worked;
      newRect.rectangle.confirmed = confirmed;
      newRect.rectangle.size = LL.size;
      newRect.rectangle.hashes = {};
      newRect.rectangle.hashes[iHash] = 1;
      newRect.rectangle.qso = true;

      newRect.rectangle.pin.qso = true;
      g_qsoGrids[iQTH] = newRect;
      returnRectangle = newRect.rectangle;
    }
  }
  else
  {
    if (!(iHash in rect.rectangle.hashes))
    {
      rect.rectangle.hashes[iHash] = 1;

      rect.rectangle.pin.hashes[iHash] = 1;
    }
    if (!confirmed && rect.rectangle.confirmed)
    {
      return rect.rectangle;
    }
    if (worked && !rect.rectangle.worked) rect.rectangle.worked = worked;
    if (confirmed && !rect.rectangle.confirmed)
    { rect.rectangle.confirmed = confirmed; }
    borderColor = g_qsoWorkedBorderColor;
    if (myDEbox) borderWeight = 1;
    zIndex = 2;
    if (rect.rectangle.size == 6)
    {
      borderColor = "#000000FF";
      zIndex = 50;
    }
    rect.shouldDim = false;

    const featureHoverStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: boxColor
      }),
      stroke: new ol.style.Stroke({
        color: borderColor,
        width: borderWeight,
        lineJoin: "round"
      }),
      zIndex: zIndex
    });
    rect.rectangle.setStyle(featureHoverStyle);
    returnRectangle = rect.rectangle;
  }
  return returnRectangle;
}

function qthToBox(iQTH, iDEcallsign, iCQ, iNew, locked, DE, band, wspr, hash)
{
  if (g_appSettings.gridViewMode == 2) return null;

  var borderColor = "#222288FF";
  var boxColor = "#1111FF" + g_gridAlpha;
  var borderWeight = 0.5;

  var myDEzOffset = 0;
  var myDEbox = false;
  if (iCQ && iNew)
  {
    borderColor = "#008888FF";
    boxColor = "#00FF00" + g_gridAlpha;
  }
  else if (iCQ && !iNew)
  {
    borderColor = "#FFFF00FF";
    boxColor = "#FFFF00" + g_gridAlpha;
  }
  if (DE == myDEcall)
  {
    borderColor = "#FF0000FF";
    boxColor = "#FFFF00" + g_gridAlpha;
    borderWeight = 1.0;
    myDEzOffset = 20;
    myDEbox = true;
  }
  if (DE.indexOf("CQ DX") > -1)
  {
    borderColor = "#008888FF";
    boxColor = "#00FFFF" + g_gridAlpha;
  }
  if (locked)
  {
    boxColor = "#FFA500" + g_gridAlpha;
    borderColor = "#000000FF";

    borderOpacity = 1;
  }
  if (wspr != null)
  {
    boxColor = "hsl(" + wspr + ",100%,50%)";
    borderColor = "gray";
    // borderWeight = 1;
  }
  var zIndex = 2;
  var returnRectangle = null;
  if (g_appSettings.sixWideMode == 0) iQTH = iQTH.substr(0, 4);
  else iQTH = iQTH.substr(0, 6);
  var rect = null;
  if (iQTH == "")
  {
    for (var key in g_liveGrids)
    {
      if (hash in g_liveGrids[key].rectangle.liveHash)
      {
        rect = g_liveGrids[key];
        break;
      }
    }
  }
  else
  {
    if (iQTH in g_liveGrids)
    {
      rect = g_liveGrids[iQTH];
    }
  }
  if (rect == null)
  {
    if (iQTH != "")
    {
      // Valid QTH
      var entityVisibility = true;
      var triangleView = false;
      if (
        Number(g_appSettings.gridViewMode) == 3 &&
        iQTH in g_qsoGrids &&
        g_pushPinMode == false
      )
      {
        if (
          g_mapSettings.splitQSL ||
          g_qsoGrids[iQTH].rectangle.confirmed == false
        )
        {
          qsoTriangleGrid(iQTH);
          triangleView = true;
          entityVisibility = true;
        }
        else entityVisibility = false;
      }
      LL = squareToLatLong(iQTH);
      if (LL.size == 6)
      {
        borderColor = "#000000FF";
        // borderWeight = 1.0;
        zIndex = 50;
      }
      newRect = {};
      newRect.age = g_timeNow;
      newRect.shouldDim = false;
      newRect.qth = iQTH;

      var bounds = [
        [LL.lo1, LL.la1],
        [LL.lo2, LL.la2]
      ];
      if (triangleView == true) newRect.rectangle = triangle(bounds, false);
      else newRect.rectangle = rectangle(bounds);

      newRect.isTriangle = triangleView;
      newRect.rectangle.setId(iQTH);

      const featureHoverStyle = new ol.style.Style({
        fill: new ol.style.Fill({
          color: boxColor
        }),
        stroke: new ol.style.Stroke({
          color: borderColor,
          width: borderWeight,
          lineJoin: "round"
        }),
        zIndex: zIndex
      });
      newRect.rectangle.setStyle(featureHoverStyle);

      newRect.rectangle.qth = iQTH;

      if (g_pushPinMode == false && entityVisibility)
      {
        g_layerSources.live.addFeature(newRect.rectangle);
      }

      newRect.rectangle.pin = iconFeature(
        ol.extent.getCenter(newRect.rectangle.getGeometry().getExtent()),
        g_colorLeafletPins[band],
        zIndex
      );
      newRect.rectangle.pin.qth = iQTH;
      newRect.rectangle.pin.liveHash = {};
      newRect.rectangle.pin.liveHash[hash] = 1;
      newRect.rectangle.pin.size = LL.size;

      if (g_pushPinMode && entityVisibility == true)
      { g_layerSources["live-pins"].addFeature(newRect.rectangle.pin); }

      newRect.rectangle.locked = locked;
      newRect.rectangle.size = LL.size;
      newRect.rectangle.liveHash = {};
      newRect.rectangle.liveHash[hash] = 1;
      newRect.rectangle.qso = false;

      newRect.rectangle.pin.qso = false;
      g_liveGrids[iQTH] = newRect;
      returnRectangle = newRect.rectangle;
    }
  }
  else
  {
    if (!(hash in rect.rectangle.liveHash))
    {
      rect.rectangle.liveHash[hash] = 1;

      rect.rectangle.pin.liveHash[hash] = 1;
    }
    if (locked && !rect.rectangle.locked) rect.rectangle.locked = locked;
    if (rect.rectangle.locked)
    {
      borderColor = "#000000FF";
    }
    if (myDEbox) borderWeight = 1;
    if (rect.rectangle.size == 6)
    {
      borderColor = "#000000FF";
      // borderWeight = 1.0;
      zIndex = 50;
    }
    newRect.age = g_timeNow;
    newRect.shouldDim = false;

    const featureHoverStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: boxColor
      }),
      stroke: new ol.style.Stroke({
        color: borderColor,
        width: borderWeight,
        lineJoin: "round"
      }),
      zIndex: zIndex
    });
    rect.rectangle.setStyle(featureHoverStyle);

    returnRectangle = rect.rectangle;
  }
  return returnRectangle;
}

function alphaFrom(rgba)
{
  var alphaInt = hexToA(rgba);
  var alphaFloat = alphaInt / 255.0;
  return alphaFloat;
}

function alphaTo(rgba, alphaFloat)
{
  var alphaInt = parseInt(alphaFloat * 255);
  var alphaHex = alphaInt.toString(16);
  if (alphaHex.length == 1)
  {
    alphaHex = "0" + alphaHex;
  }
  return rgba.slice(0, -2) + alphaHex;
}

function intAlphaToRGB(rgb, alphaInt)
{
  var alphaHex = alphaInt.toString(16);
  if (alphaHex.length == 1)
  {
    alphaHex = "0" + alphaHex;
  }
  return rgb + alphaHex;
}

function dimFunction(qthObj)
{
  if (qthObj.rectangle.locked == false)
  {
    var featureStyle = qthObj.rectangle.getStyle();
    var featureFill = featureStyle.getFill();
    var fillColor = featureFill.getColor();
    var featureStroke = featureStyle.getStroke();
    var strokeColor = featureStroke.getColor();
    var percent = 1.0 - (g_timeNow - qthObj.age) / gridDecay.value;
    var alpha = Math.max(0.06, (g_mapSettings.gridAlpha / 255) * percent);

    fillColor = alphaTo(fillColor, alpha);
    featureFill.setColor(fillColor);
    featureStyle.setFill(featureFill);

    strokeColor = alphaTo(strokeColor, alpha);
    featureStroke.setColor(strokeColor);
    featureStyle.setStroke(featureStroke);

    qthObj.rectangle.setStyle(featureStyle);
  }
}

function toggleTrafficDecode()
{
  trafficDecode.checked = trafficDecode.checked != true;
  changeTrafficDecode();
}

function changeTrafficDecode()
{
  g_mapSettings.trafficDecode = trafficDecode.checked;
  trafficDecodeView();
  saveMapSettings();
}

function trafficDecodeView()
{
  if (g_mapSettings.trafficDecode == false)
  {
    trafficDiv.innerHTML = "";
    g_lastTraffic = Array();
  }
}

function changeFitQRZvalue()
{
  g_mapSettings.fitQRZ = fitQRZvalue.checked;
  saveMapSettings();
}

function changeQrzDxccFallbackValue()
{
  g_mapSettings.qrzDxccFallback = qrzDxccFallbackValue.checked;
  saveMapSettings();
}

function changeCqHiliteValue(check)
{
  g_mapSettings.CQhilite = check.checked;
  saveMapSettings();
  if (check.checked == false) removePaths();
}

function changeFocusRigValue(check)
{
  g_mapSettings.focusRig = check.checked;
  saveMapSettings();
}

function changeHaltOntTxValue(check)
{
  g_mapSettings.haltAllOnTx = check.checked;
  saveMapSettings();
}

function changeStrikesAlert()
{
  g_mapSettings.strikesAlert = strikesAlert.value;
  saveMapSettings();
  playStrikeAlert();
}

function playStrikeAlert()
{
  switch (g_mapSettings.strikesAlert)
  {
    case 1:
      playAlertMediaFile("short-strike.wav", true);
      break;
    case 2:
      playAlertMediaFile("long-strike.mp3", true);
      break;
    case 3:
      playAlertMediaFile("strike-detected.mp3", true);
      break;
    default:
      // do nothing
      break;
  }
}

function setStrikesButton()
{
  if (g_mapSettings.strikes)
  {
    strikesImg.style.webkitFilter = "";
  }
  else
  {
    strikesImg.style.webkitFilter = "grayscale(1)";
  }
}

function toggleStrikesValue()
{
  if (g_mapSettings.strikesNotify == false && g_mapSettings.strikes == false)
  {
    var confirmed = window.confirm(
      "Lighting Strike Detection is provided by Blitzortung.org\nWe are not responsible for missed strikes that could result in damage.\nBe sure to check your local weather providers for accurate data."
    );
    if (confirmed == false)
    {
      return;
    }
    else
    {
      g_mapSettings.strikesNotify = true;
    }
  }
  g_mapSettings.strikes = g_mapSettings.strikes != true;
  setStrikesButton();

  saveMapSettings();
}

function changeSplitQSL()
{
  g_mapSettings.splitQSL = splitQSLValue.checked;
  saveMapSettings();
  redrawGrids();
}

function setAnimateView()
{
  if (animateValue.checked)
  {
    animationSpeedTd.style.display = "inline-table";
  }
  else
  {
    animationSpeedTd.style.display = "none";
  }
}

function toggleAnimate()
{
  animateValue.checked = animateValue.checked != true;
  changeAnimate();
}

function toggleAllGrids()
{
  g_showAllGrids = !g_showAllGrids;
  setTrophyOverlay(g_currentOverlay);
}

function changeAnimate()
{
  g_mapSettings.animate = animateValue.checked;
  saveMapSettings();

  var dash = [];
  var dashOff = 0;
  if (g_mapSettings.animate == true)
  {
    dash = g_flightPathLineDash;
    dashOff = g_flightPathTotal - g_flightPathOffset;
  }

  for (var i = g_flightPaths.length - 1; i >= 0; i--)
  {
    if (g_flightPaths[i].isShapeFlight == 0)
    {
      var featureStyle = g_flightPaths[i].getStyle();
      var featureStroke = featureStyle.getStroke();

      featureStroke.setLineDash(dash);
      featureStroke.setLineDashOffset(dashOff);

      featureStyle.setStroke(featureStroke);
      g_flightPaths[i].setStyle(featureStyle);
    }
  }
  if (g_transmitFlightPath != null)
  {
    var featureStyle = g_transmitFlightPath.getStyle();
    var featureStroke = featureStyle.getStroke();

    featureStroke.setLineDash(dash);
    featureStroke.setLineDashOffset(dashOff);

    featureStyle.setStroke(featureStroke);
    g_transmitFlightPath.setStyle(featureStyle);
  }
  setAnimateView();
}

function changeAnimateSpeedValue()
{
  g_mapSettings.animateSpeed = 21 - animateSpeedValue.value;
  saveMapSettings();
}

var g_animateFrame = 0;

var g_nextDimTime = 0;
var g_last = 0;
function animatePaths()
{
  requestAnimationFrame(animatePaths);

  g_last ^= g_last;
  if (g_last == 1) return;

  g_animateFrame++;
  g_animateFrame %= g_mapSettings.animateSpeed;

  if (g_animateFrame > 0) return;

  for (var i = g_flightPaths.length - 1; i >= 0; i--)
  {
    if (g_flightPaths[i].age < g_timeNow)
    {
      if (typeof g_flightPaths[i].Arrow != "undefined")
      { g_layerSources.flight.removeFeature(g_flightPaths[i].Arrow); }
      g_layerSources.flight.removeFeature(g_flightPaths[i]);
      delete g_flightPaths[i];
      g_flightPaths[i] = null;

      g_flightPaths.splice(i, 1);
    }
  }

  if (g_timeNow > g_nextDimTime)
  {
    dimGridsquare();
  }

  if (g_mapSettings.animate == false) return;

  g_flightPathOffset += 1;
  g_flightPathOffset %= g_flightPathTotal;

  var targetOffset = g_flightPathTotal - g_flightPathOffset;
  var featureStyle = null;
  var featureStroke = null;
  for (var i = 0; i < g_flightPaths.length; i++)
  {
    if (g_flightPaths[i].isShapeFlight == 0)
    {
      featureStyle = g_flightPaths[i].getStyle();
      featureStroke = featureStyle.getStroke();
      featureStroke.setLineDashOffset(targetOffset);
      g_flightPaths[i].setStyle(featureStyle);
    }
  }

  if (g_transmitFlightPath != null)
  {
    var featureStyle = g_transmitFlightPath.getStyle();
    var featureStroke = featureStyle.getStroke();

    featureStroke.setLineDashOffset(targetOffset);

    featureStyle.setStroke(featureStroke);
    g_transmitFlightPath.setStyle(featureStyle);
  }
}

function removePaths()
{
  g_layerSources.flight.clear();
  g_flightPaths = Array();
}

function fadePaths()
{
  if (pathWidthValue.value == 0)
  {
    removePaths();
  }
}

function dimGridsquare()
{
  if (gridDecay.value == 0) return;
  for (var i in g_liveGrids)
  {
    dimFunction(g_liveGrids[i]);

    if (
      g_timeNow - g_liveGrids[i].age >= gridDecay.value &&
      g_liveGrids[i].rectangle.locked == false
    )
    {
      // Walk the rectangles DEcall's and remove them from g_liveCallsigns
      for (var CallIsKey in g_liveGrids[i].rectangle.liveHash)
      {
        if (CallIsKey in g_liveCallsigns)
        {
          g_liveCallsigns[CallIsKey].rect = null;

          delete g_liveCallsigns[CallIsKey];
        }
      }
      if (g_liveGrids[i].rectangle.pin != null)
      {
        if (
          g_layerSources["live-pins"].hasFeature(g_liveGrids[i].rectangle.pin)
        )
        {
          g_layerSources["live-pins"].removeFeature(
            g_liveGrids[i].rectangle.pin
          );
        }
      }
      if (g_layerSources.live.hasFeature(g_liveGrids[i].rectangle))
      {
        g_layerSources.live.removeFeature(g_liveGrids[i].rectangle);

        if (Number(g_appSettings.gridViewMode) == 3 && i in g_qsoGrids)
        {
          if (g_qsoGrids[i].isTriangle)
          {
            triangleToGrid(i, g_qsoGrids[i].rectangle);
            g_qsoGrids[i].isTriangle = false;
          }
        }
      }

      g_liveGrids[i] = null;
      delete g_liveGrids[i];
    }
  }
  g_nextDimTime = g_timeNow + 7;
}

function updateCountStats()
{
  var count = Object.keys(g_liveCallsigns).length;

  if (myDEcall in g_liveCallsigns) count--;

  callsignCount.innerHTML = count;

  qsoCount.innerHTML = g_QSOcount;
  qslCount.innerHTML = g_QSLcount;

  countryCount.innerHTML = Object.keys(g_dxccCount).length;

  if (Object.keys(g_QSOhash).length > 0)
  {
    clearOrLoadButton.innerHTML = "Clear Log";
    g_loadQSOs = false;
  }
  else
  {
    clearOrLoadButton.innerHTML = "Load Logs";
    g_loadQSOs = true;
  }
}

function clearGrids()
{
  g_layerSources.live.clear();
  g_layerSources["live-pins"].clear();

  for (var i in g_liveGrids)
  {
    // Walk the rectangles DEcall's and remove the rect from the g_liveCallsigns
    for (var CallIsKey in g_liveGrids[i].rectangle.liveHash)
    {
      if (CallIsKey in g_liveCallsigns) g_liveCallsigns[CallIsKey].rect = null;
    }
  }

  g_liveGrids = {};
}

function clearQsoGrids()
{
  g_layerSources.qso.clear();
  g_layerSources["qso-pins"].clear();

  g_qsoGrids = {};

  for (var key in g_worldGeoData)
  {
    g_worldGeoData[key].worked = false;
    g_worldGeoData[key].confirmed = false;
    g_worldGeoData[key].worked_bands = {};
    g_worldGeoData[key].confirmed_bands = {};
    g_worldGeoData[key].worked_modes = {};
    g_worldGeoData[key].confirmed_modes = {};
  }
  for (var key in g_cqZones)
  {
    g_cqZones[key].worked = false;
    g_cqZones[key].confirmed = false;

    g_cqZones[key].worked_bands = {};
    g_cqZones[key].confirmed_bands = {};
    g_cqZones[key].worked_modes = {};
    g_cqZones[key].confirmed_modes = {};
  }
  for (var key in g_ituZones)
  {
    g_ituZones[key].worked = false;
    g_ituZones[key].confirmed = false;

    g_ituZones[key].worked_bands = {};
    g_ituZones[key].confirmed_bands = {};
    g_ituZones[key].worked_modes = {};
    g_ituZones[key].confirmed_modes = {};
  }
  for (var key in g_wasZones)
  {
    g_wasZones[key].worked = false;
    g_wasZones[key].confirmed = false;

    g_wasZones[key].worked_bands = {};
    g_wasZones[key].confirmed_bands = {};
    g_wasZones[key].worked_modes = {};
    g_wasZones[key].confirmed_modes = {};
  }
  for (var key in g_wacZones)
  {
    g_wacZones[key].worked = false;
    g_wacZones[key].confirmed = false;
    g_wacZones[key].worked_bands = {};
    g_wacZones[key].confirmed_bands = {};
    g_wacZones[key].worked_modes = {};
    g_wacZones[key].confirmed_modes = {};
  }
  for (var key in g_countyData)
  {
    g_countyData[key].worked = false;
    g_countyData[key].confirmed = false;
    g_countyData[key].worked_bands = {};
    g_countyData[key].confirmed_bands = {};
    g_countyData[key].worked_modes = {};
    g_countyData[key].confirmed_modes = {};
  }
  for (var key in g_us48Data)
  {
    g_us48Data[key].worked = false;
    g_us48Data[key].confirmed = false;
    g_us48Data[key].worked_bands = {};
    g_us48Data[key].confirmed_bands = {};
    g_us48Data[key].worked_modes = {};
    g_us48Data[key].confirmed_modes = {};
  }
}

function clearCalls()
{
  removePaths();
  for (var i in g_liveCallsigns)
  {
    if (
      typeof g_liveCallsigns[i].rect != "undefined" &&
      g_liveCallsigns[i].rect != null
    )
    {
      if (i in g_liveCallsigns[i].rect.liveHash)
      { delete g_liveCallsigns[i].rect.liveHash[i]; }
    }
  }

  g_liveCallsigns = {};
  g_dxccCount = {};
  redrawGrids();
}

function clearLive()
{
  g_Decodes = 0;

  g_lastMessages = Array();
  g_lastTraffic = Array();
  g_callRoster = {};
  g_dxccCount = {};

  removePaths();
  removePaths();
  clearGrids();
  clearCalls();
  clearTempGrids();
  setHomeGridsquare();
  redrawGrids();

  updateRosterWorked();
  goProcessRoster();
}

function clearAll()
{
  clearTempGrids();
  clearCalls();
  clearQSOs();

  g_lastMessages = Array();
  g_lastTraffic = Array();

  g_dxccCount = {};

  redrawGrids();

  g_callRoster = {};
  updateRosterWorked();
  goProcessRoster();
}

function clearOrLoadQSOs()
{
  if (g_loadQSOs == true)
  {
    startupAdifLoadCheck();
  }
  else
  {
    clearQSOs();
  }
}

function clearAndLoadQSOs()
{
  initQSOdata();
  g_QSOhash = {};
  g_QSLcount = 0;
  g_QSOcount = 0;
  setTrophyOverlay(g_currentOverlay);
  redrawGrids();

  updateLogbook();
  updateRosterWorked();
  goProcessRoster();

  startupAdifLoadCheck();
}

function clearQSOs()
{
  initQSOdata();
  g_QSOhash = {};
  g_QSLcount = 0;
  g_QSOcount = 0;
  setTrophyOverlay(g_currentOverlay);
  redrawGrids();

  updateLogbook();
  updateRosterWorked();
  goProcessRoster();
  clearLogFilesAndCounts();
}

function clearLogFilesAndCounts()
{
  tryToDeleteLog("lotw_QSL.adif");
  tryToDeleteLog("lotw_QSO.adif");
  tryToDeleteLog("lotw.adif");
  tryToDeleteLog("qrz.adif");
  tryToDeleteLog("clublog.adif");
  g_adifLogSettings.downloads = {};
  localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
}

function getCurrentBandModeHTML()
{
  var band =
    g_appSettings.gtBandFilter == "auto"
      ? myBand + " (Auto)"
      : g_appSettings.gtBandFilter.length == 0
        ? "Mixed Bands"
        : g_appSettings.gtBandFilter;
  var mode =
    g_appSettings.gtModeFilter == "auto"
      ? myMode + " (Auto)"
      : g_appSettings.gtModeFilter.length == 0
        ? "Mixed Modes"
        : g_appSettings.gtModeFilter;
  return (
    "<div style='vertical-align:top;display:inline-block;margin-bottom:3px;color:lightgreen;font-weight:bold;font-size:larger'>Viewing: <text style='color:yellow'>" +
    band +
    "</text> / <text style='color:orange'>" +
    mode +
    "</text></b></div><br/>"
  );
}

var displayTimeInterval = null;

var g_currentDay = 0;
var g_nightTime = false;

var g_currentNightState = false;

var g_timeNow = timeNowSec();

function displayTime()
{
  g_timeNow = timeNowSec();
  if (menuDiv.className == "menuDivStart" && g_menuShowing == true)
  {
    menuDiv.className = "menuDivEnd";
    mapDiv.className = "mapDivEnd";
    LegendDiv.className = "legendDivEnd";
    g_map.updateSize();
  }

  currentTime.innerHTML =
    "<font color='lightblue'>" + userTimeString(null) + "</font>";
  if (g_lastTimeSinceMessageInSeconds > 0)
  {
    var since = g_timeNow - g_lastTimeSinceMessageInSeconds;
    secondsAgoMsg.innerHTML = since.toDHMS();
    if (since > 17 && since < 122)
    {
      secondsAgoMsg.style.backgroundColor = "yellow";
      secondsAgoMsg.style.color = "#000";
    }
    else if (since > 121)
    {
      secondsAgoMsg.style.backgroundColor = "red";
      secondsAgoMsg.style.color = "#000";
    }
    else
    {
      secondsAgoMsg.style.backgroundColor = "blue";
      secondsAgoMsg.style.color = "#FF0";
    }
  }
  else secondsAgoMsg.innerHTML = "<b>Never</b>";

  checkWsjtxListener();

  if (g_timeNow % 22 == 0)
  {
    g_nightTime = dayNight.refresh();
    moonLayer.refresh();
  }

  pskSpotCheck(g_timeNow);

  if (g_mapSettings.strikes && g_mapSettings.offlineMode == false)
  {
    if (g_strikeWebSocket == null) loadStrikes();

    var now = Date.now();
    for (var time in g_bolts)
    {
      if (now - time > 120000)
      {
        if (g_layerSources.strikes.hasFeature(g_bolts[time]))
        { g_layerSources.strikes.removeFeature(g_bolts[time]); }
        delete g_bolts[time];
      }
    }
  }
  else
  {
    g_layerSources.strikes.clear();
    if (g_strikeWebSocket != null)
    {
      try
      {
        g_strikeWebSocket.close();
      }
      catch (e)
      {
        g_strikeWebSocket = null;
      }
    }
  }

  if (g_currentNightState != g_nightTime)
  {
    changeMapLayer();
    g_currentNightState = g_nightTime;
  }
}

function timeNowSec()
{
  return parseInt(Date.now() / 1000);
}

var g_geo = null;
var g_feats = null;

var g_liveHoverInteraction = null;
var g_gtFlagHoverInteraction = null;
var g_trophyHoverInteraction = null;

function createGlobalHeatmapLayer(name, radius, blur)
{
  g_layerSources[name] = new ol.source.Vector({});
  g_layerVectors[name] = new ol.layer.Heatmap({
    source: g_layerSources[name],
    zIndex: Object.keys(g_layerVectors).length + 1
  });
  g_layerVectors[name].set("name", name);
}

function createGlobalMapLayer(name, maxResolution, minResolution)
{
  g_layerSources[name] = new ol.source.Vector({});
  if (
    typeof maxResolution == "undefined" &&
    typeof minResolution == "undefined"
  )
  {
    var zIndex = Object.keys(g_layerVectors).length + 1;
    if (name == "strikes") zIndex = 2000;
    g_layerVectors[name] = new ol.layer.Vector({
      source: g_layerSources[name],
      zIndex: zIndex
    });
  }
  else if (typeof minResolution == "undefined")
  {
    g_layerVectors[name] = new ol.layer.Vector({
      source: g_layerSources[name],
      maxResolution: maxResolution,
      zIndex: Object.keys(g_layerVectors).length + 1
    });
  }
  else
  {
    g_layerVectors[name] = new ol.layer.Vector({
      source: g_layerSources[name],
      maxResolution: maxResolution,
      minResolution: minResolution,
      zIndex: Object.keys(g_layerVectors).length + 1
    });
  }
  g_layerVectors[name].set("name", name);
}

function createGeoJsonLayer(name, url, color, stroke)
{
  var style = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color,
      width: stroke
    }),
    fill: new ol.style.Fill({
      color: "#00000000"
    })
  });

  var layerSource = new ol.source.Vector({
    url: url,
    format: new ol.format.GeoJSON({ geometryName: name }),
    overlaps: false
  });

  var layerVector = new ol.layer.Vector({
    source: layerSource,
    style: style,
    visible: true,
    zIndex: 1
  });
  layerVector.set("name", name);
  return layerVector;
}

var g_gtFlagIcon = new ol.style.Icon({
  src: "./img/flag_gt_user.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  anchor: [12, 17]
});

var g_pushPinIconOff = new ol.style.Icon({
  src: "./img/red-circle.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  anchor: [5, 18]
});

function panTo(location)
{
  var duration = 1000;

  g_mapView.animate({
    center: location,
    duration: duration
  });
}

var g_lightningBolt = new ol.style.Icon({
  src: "./img/lw.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  size: [64, 64],
  anchor: [9, 58],
  scale: 0.75
});

var g_lightningGlobal = Array();

g_lightningGlobal[0] = new ol.style.Icon({
  src: "./img/l0.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  opacity: 0.2,
  anchor: [2, 31]
});

g_lightningGlobal[1] = new ol.style.Icon({
  src: "./img/l6.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  opacity: 0.2,
  anchor: [1, 34]
});

var g_bolts = {};
var g_strikeWebSocket = null;
var g_strikeInterval = null;
var g_strikeRange = 0.4;

function toggleStrikeGlobal()
{
  g_mapSettings.strikesGlobal =
    g_mapSettings.strikesGlobal == false;
  saveMapSettings();

  var msg = "Local Strikes";
  if (g_mapSettings.strikesGlobal == true) msg = "Global Strikes";

  var worker =
    "<font color='yellow'>Strike Distance Changed<br/>" + msg + "</font>";
  if (g_mapSettings.strikes == false)
  { worker += "<br/><font color='red'>Detection is not enabled!</font>"; }
  addLastTraffic(worker);

  g_layerSources.strikes.clear();
}

function setStrikeDistance()
{
  if (
    g_mapSettings.offlineMode == true &&
    g_strikeWebSocket != null &&
    g_strikeWebSocket.readyState != 3
  )
  {
    g_strikeWebSocket.close();
    return;
  }

  if (g_strikeWebSocket != null)
  {
    var distance = g_strikeRange;
    if (g_mapSettings.strikesGlobal == true) distance = 1000;

    var send = "{\"west\":-180,\"east\":180,\"north\":-90,\"south\":-90}";

    if (g_strikeInterval == null)
    { g_strikeInterval = setInterval(setStrikeDistance, 300000); }

    try
    {
      g_strikeWebSocket.send(send);
    }
    catch (e)
    {
      g_strikeWebSocket = null;
    }
  }
  else
  {
    if (g_strikeInterval != null)
    {
      clearInterval(g_strikeInterval);
      g_strikeInterval = null;
    }
  }
}

var g_strikeCount = 0;
function loadStrikes()
{
  if (g_strikeWebSocket) return;

  var rnd = parseInt(Math.random() * 4);
  var ws_server = "";
  if (rnd < 1)
  {
    ws_server = "ws7.blitzortung.org";
  }
  else if (rnd < 2)
  {
    ws_server = "ws6.blitzortung.org";
  }
  else if (rnd < 3)
  {
    ws_server = "ws5.blitzortung.org";
  }
  else
  {
    ws_server = "ws1.blitzortung.org";
  }

  try
  {
    g_strikeWebSocket = new WebSocket("wss:///" + ws_server + ":3000");
  }
  catch (e)
  {
    g_strikeWebSocket = null;
    return;
  }

  g_strikeWebSocket.onopen = function ()
  {
    setStrikeDistance();
  };

  g_strikeWebSocket.onmessage = function (evt)
  {
    var Strikes = JSON.parse(evt.data);
    Strikes.sig = null;

    if (
      "delay" in Strikes &&
      "time" in Strikes &&
      "lat" in Strikes &&
      "lon" in Strikes
    )
    {
      var index = Date.now();
      while (index in g_bolts) index++;

      var inRange = true;

      if (Math.abs(Strikes.lon - g_myLon) > g_strikeRange) inRange = false;

      if (Math.abs(Strikes.lat - g_myLat) > g_strikeRange) inRange = false;

      if (
        g_mapSettings.strikesGlobal ||
        (g_mapSettings.strikesGlobal == false && inRange)
      )
      {
        g_bolts[index] = iconFeature(
          ol.proj.fromLonLat([Strikes.lon, Strikes.lat]),
          inRange ? g_lightningBolt : g_lightningGlobal[0],
          1
        );

        g_layerSources.strikes.addFeature(g_bolts[index]);
      }

      if (inRange == true)
      {
        playStrikeAlert();

        var dist =
          parseInt(
            MyCircle.distance(
              g_myLat,
              g_myLon,
              Strikes.lat,
              Strikes.lon,
              distanceUnit.value
            ) * MyCircle.validateRadius(distanceUnit.value)
          ).toLocaleString() +
          " " +
          distanceUnit.value.toLowerCase();
        var azim =
          parseInt(
            MyCircle.bearing(g_myLat, g_myLon, Strikes.lat, Strikes.lon)
          ).toLocaleString() + "&deg;";

        var worker =
          "<font style='color:yellow;font-weight:bold'>Lighting Strike Detected!</font><br/>";
        worker +=
          "<font style='color:white'>" + userTimeString(null) + "</font><br/>";
        worker +=
          "<font style='color:orange'>Distance: </font><font style='color:lightblue;font-weight:bold'>" +
          dist +
          "</font><br/>";
        worker +=
          "<font style='color:cyan'>Bearing: </font><font style='color:lightgreen;font-weight:bold'>" +
          azim +
          "</font>";

        addLastTraffic(worker);
      }
    }
    delete evt.data;
  };

  g_strikeWebSocket.onerror = function ()
  {
    g_strikeWebSocket = null;
  };

  g_strikeWebSocket.onclose = function ()
  {
    g_strikeWebSocket = null;
  };
}

function toggleMouseTrack()
{
  g_appSettings.mouseTrack ^= 1;
  if (g_appSettings.mouseTrack == 0) mouseTrackDiv.style.display = "none";
}

function myGmapNameCompare(a, b)
{
  return g_maps[a].name.localeCompare(g_maps[b].name);
}

var g_Nexrad = null;

function initMap()
{
  document.getElementById("mapDiv").innerHTML = "";

  g_maps = JSON.parse(fs.readFileSync(g_mapsFile));

  if (g_maps)
  {
    var entries = Object.keys(g_maps).sort(myGmapNameCompare);

    for (var lmap in entries)
    {
      var key = entries[lmap];
      g_mapsLayer[key] = new ol.source.XYZ(g_maps[key]);
      var option = document.createElement("option");
      option.value = key;
      option.text = g_maps[key].name;
      mapSelect.appendChild(option);

      option = document.createElement("option");
      option.value = key;
      option.text = g_maps[key].name;
      mapNightSelect.appendChild(option);
    }
    mapSelect.value = g_mapSettings.mapIndex;
    mapNightSelect.value = g_mapSettings.nightMapIndex;
  }
  else g_mapsLayer[0] = new ol.source.OSM();

  g_offlineLayer = new ol.source.XYZ({
    url: "/map/sat/{z}/{x}/{y}.png"
  });

  if (g_mapSettings.offlineMode)
  {
    g_tileLayer = new ol.layer.Tile({
      source: g_offlineLayer,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true
    });
  }
  else
  {
    g_tileLayer = new ol.layer.Tile({
      source: g_mapsLayer[mapSelect.value],
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true
    });
  }

  g_scaleLine = new ol.control.ScaleLine({
    units: g_scaleUnits[g_appSettings.distanceUnit]
  });

  var g_mapControl = [
    g_scaleLine,
    new ol.control.Zoom(),
    new ol.control.FullScreen({ source: "mainBody" })
  ];

  createGlobalMapLayer("award");
  createGlobalHeatmapLayer("psk-heat", 10, 5);
  createGlobalMapLayer("qso");
  createGlobalMapLayer("qso-pins");
  createGlobalMapLayer("live");
  createGlobalMapLayer("live-pins");
  createGlobalMapLayer("line-grids");
  createGlobalMapLayer("long-grids", 3000);
  createGlobalMapLayer("short-grids", 8000, 3001);
  createGlobalMapLayer("big-grids", 50000, 3001);
  createGlobalMapLayer("psk-flights");
  createGlobalMapLayer("psk-spots");
  createGlobalMapLayer("psk-hop");
  createGlobalMapLayer("flight");
  createGlobalMapLayer("transmit");
  createGlobalMapLayer("gtflags");
  createGlobalMapLayer("temp");
  createGlobalMapLayer("tz");
  createGlobalMapLayer("radar");
  createGlobalMapLayer("strikes");

  g_mapView = new ol.View({
    center: [g_myLon, g_myLat],
    zoomFactor: 1.25,
    zoom: g_mapSettings.zoom,
    showFullExtent: true
  });

  g_map = new ol.Map({
    target: "mapDiv",
    layers: [
      g_tileLayer,

      g_layerVectors.award,
      g_layerVectors["psk-heat"],
      g_layerVectors.qso,
      g_layerVectors["qso-pins"],
      g_layerVectors.live,
      g_layerVectors["live-pins"],
      g_layerVectors["line-grids"],
      g_layerVectors["long-grids"],
      g_layerVectors["short-grids"],
      g_layerVectors["big-grids"],
      g_layerVectors["psk-flights"],
      g_layerVectors["psk-spots"],
      g_layerVectors["psk-hop"],
      g_layerVectors.flight,
      g_layerVectors.transmit,
      g_layerVectors.gtflags,
      g_layerVectors.temp,
      g_layerVectors.tz,
      g_layerVectors.radar,
      g_layerVectors.strikes
    ],
    controls: g_mapControl,
    loadTilesWhileInteracting: false,
    loadTilesWhileAnimating: false,
    view: g_mapView
  });

  mapDiv.addEventListener("mousemove", function (event)
  {
    onMouseUpdate(event);

    var mousePosition = g_map.getEventPixel(event);
    if (g_appSettings.mouseTrack == 1)
    {
      var mouseLngLat = g_map.getEventCoordinate(event);
      if (mouseLngLat)
      {
        var LL = ol.proj.toLonLat(mouseLngLat);
        var dist =
          parseInt(
            MyCircle.distance(
              g_myLat,
              g_myLon,
              LL[1],
              LL[0],
              distanceUnit.value
            ) * MyCircle.validateRadius(distanceUnit.value)
          ) + distanceUnit.value.toLowerCase();
        var azim =
          parseInt(MyCircle.bearing(g_myLat, g_myLon, LL[1], LL[0])) + "&deg;";
        var gg = latLonToGridSquare(LL[1], LL[0]);
        mouseTrackDiv.innerHTML =
          LL[1].toFixed(3) +
          ", " +
          LL[0].toFixed(3) +
          " " +
          dist +
          " " +
          azim +
          " " +
          gg;
        mouseTrackDiv.style.display = "block";
      }
    }
    var noFeature = true;
    var noFlag = true;
    var noAward = true;
    var noMoon = true;
    var noTimeZone = true;

    if (g_map.hasFeatureAtPixel(mousePosition))
    {
      var features = g_map.getFeaturesAtPixel(mousePosition);

      if (features != null)
      {
        features = features.reverse();
        var finalGridFeature = null;
        for (var index in features)
        {
          if (features[index].geometryName_ == "tz")
          {
            features[index].size = 73;
          }
          if (typeof features[index].size == "undefined") continue;
          if (features[index].size == 99 && finalGridFeature == null)
          {
            moonOver(features[index]);
            noMoon = false;
            break;
          }
          if (features[index].size == 2 && g_currentOverlay != 0)
          {
            trophyOver(features[index]);
            noAward = false;
            break;
          }

          if (features[index].size == 1)
          {
            mouseOverGtFlag(features[index]);
            noFlag = false;
            noFeature = true;
            break;
          }

          if (features[index].size == 6)
          {
            noFeature = false;
            finalGridFeature = features[index];
          }
          if (features[index].size == 4 && finalGridFeature == null)
          {
            noFeature = false;
            finalGridFeature = features[index];
            noFlag = true;
          }
          if (features[index].size == 73 && finalGridFeature == null)
          {
            mouseOverGtFlag(features[index]);
            noFlag = false;
          }
        }
        if (finalGridFeature)
        {
          mouseOverDataItem(finalGridFeature, true);
        }
      }
    }
    if (noFeature) mouseOutOfDataItem();
    if (noFlag) mouseOutGtFlag();
    if (noAward) trophyOut();
    if (noMoon) moonOut();
  });

  // mapDiv.addEventListener('mouseout', mapLoseFocus, false);
  mapDiv.addEventListener("mouseleave", mapLoseFocus, false);
  mapDiv.addEventListener("contextmenu", function (event)
  {
    event.preventDefault();
  });

  g_map.on("pointerdown", function (event)
  {
    var shouldReturn = false;

    var features = g_map.getFeaturesAtPixel(event.pixel);
    if (features != null)
    {
      features = features.reverse();
      var finalGridFeature = null;
      for (var index in features)
      {
        if (typeof features[index].size == "undefined") continue;
        if (features[index].size == 6)
        {
          noFeature = false;
          finalGridFeature = features[index];
        }
        if (features[index].size == 4 && finalGridFeature == null)
        {
          noFeature = false;
          finalGridFeature = features[index];
        }
        if (features[index].size == 1)
        {
          leftClickGtFlag(features[index]);
          shouldReturn = true;
        }
      }
      if (finalGridFeature)
      {
        onRightClickGridSquare(finalGridFeature);
        shouldReturn = true;
      }
    }

    if (shouldReturn) return true;
    if (event.pointerEvent.buttons == 2 && g_currentOverlay == 0)
    {
      mouseDownGrid(ol.proj.toLonLat(event.coordinate), event);
      return true;
    }
  });

  g_map.on("pointerup", function (event)
  {
    mouseUpGrid();
    if (g_mapSettings.mouseOver == false) mouseOutOfDataItem();
  });

  document.getElementById("menuDiv").style.display = "block";

  dayNight.init(g_map);
  if (g_appSettings.earthImgSrc == 1)
  {
    dayNight.hide();
  }
  else
  {
    g_nightTime = dayNight.show();
  }

  moonLayer.init(g_map);
  if (g_appSettings.moonTrack == 1)
  {
    moonLayer.show();
  }
  else
  {
    moonLayer.hide();
  }

  g_tileLayer.setOpacity(Number(g_mapSettings.loudness));

  requestAnimationFrame(animatePaths);

  nightMapEnable.checked = g_mapSettings.nightMapEnable;
  changeNightMapEnable(nightMapEnable);
}

function changeNightMapEnable(check)
{
  if (check.checked)
  {
    nightMapTd.style.display = "inline-table";
    spotNightPathColorDiv.style.display = "inline-block";
    g_mapSettings.nightMapEnable = true;
    g_nightTime = dayNight.refresh();
  }
  else
  {
    nightMapTd.style.display = "none";
    spotNightPathColorDiv.style.display = "none";
    g_mapSettings.nightMapEnable = false;
  }
  changeMapLayer();
  redrawSpots();
  saveMapSettings();
}

var g_lasttimezone = null;

var g_nexradInterval = null;

var g_nexradEnable = 0;

function createNexRad()
{
  var layerSource = new ol.source.TileWMS({
    url: "http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi",
    params: { LAYERS: "nexrad-n0q" }
  });

  var layerVector = new ol.layer.Tile({
    source: layerSource,
    visible: true,
    zIndex: 900
  });

  layerVector.set("name", "radar");

  return layerVector;
}

function toggleNexrad()
{
  g_nexradEnable ^= 1;
  if (g_nexradEnable == 1)
  {
    if (g_Nexrad != null)
    {
      g_map.removeLayer(g_Nexrad);
    }

    g_Nexrad = createNexRad();
    g_map.addLayer(g_Nexrad);

    if (g_nexradInterval == null)
    { g_nexradInterval = setInterval(nexradRefresh, 600000); }
  }
  else
  {
    if (g_nexradInterval != null)
    {
      clearInterval(g_nexradInterval);
      g_nexradInterval = null;
    }
    if (g_Nexrad)
    {
      g_map.removeLayer(g_Nexrad);
      g_Nexrad = null;
    }
  }

  g_mapSettings.usNexrad = g_nexradEnable == 1;
}

function nexradRefresh()
{
  if (g_Nexrad != null)
  {
    g_Nexrad.getSource().refresh();
  }
}

function collapseMenu(shouldCollapse)
{
  if (shouldCollapse == true)
  {
    g_menuShowing = false;
    mapDiv.className = "mapDivStart";
    menuDiv.className = "menuDivStart";
    LegendDiv.className = "legendDivStart";
    chevronDiv.className = "chevronDivEnd";
  }
  else
  {
    g_menuShowing = true;
    chevronDiv.className = "chevronDivStart";
    displayTime();
  }
  g_map.updateSize();
}

function mapLoseFocus()
{
  mouseOutOfDataItem();
  trophyOut();
  mouseUpGrid();
  moonOut();
  mouseOutGtFlag();
}

function lineString(points)
{
  var thing = new ol.geom.LineString(points);
  var rect = new ol.Feature({
    geometry: thing
  });
  return rect;
}

function rectangle(bounds, options)
{
  var thing = new ol.geom.Polygon([
    [
      ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
      ol.proj.fromLonLat([bounds[0][0], bounds[1][1]]),
      ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
      ol.proj.fromLonLat([bounds[1][0], bounds[0][1]])
    ]
  ]);
  var rect = new ol.Feature({
    name: "rect",
    geometry: thing
  });
  return rect;
}

function triangle(bounds, topLeft)
{
  var thing = null;

  if (topLeft)
  {
    thing = new ol.geom.Polygon([
      [
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]])
      ]
    ]);
  }
  else
  {
    thing = new ol.geom.Polygon([
      [
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]])
      ]
    ]);
  }

  var rect = new ol.Feature({
    name: "rect",
    geometry: thing
  });
  return rect;
}

function triangleToGrid(iQTH, feature)
{
  var LL = squareToLatLong(iQTH);
  var bounds = [
    [LL.lo1, LL.la1],
    [LL.lo2, LL.la2]
  ];

  var thing = new ol.geom.Polygon([
    [
      ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
      ol.proj.fromLonLat([bounds[0][0], bounds[1][1]]),
      ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
      ol.proj.fromLonLat([bounds[1][0], bounds[0][1]]),
      ol.proj.fromLonLat([bounds[0][0], bounds[0][1]])
    ]
  ]);

  feature.setGeometry(thing);
}

function gridToTriangle(iQTH, feature, topLeft)
{
  var LL = squareToLatLong(iQTH);
  var bounds = [
    [LL.lo1, LL.la1],
    [LL.lo2, LL.la2]
  ];
  var thing = null;

  if (topLeft)
  {
    thing = new ol.geom.Polygon([
      [
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]])
      ]
    ]);
  }
  else
  {
    thing = new ol.geom.Polygon([
      [
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[1][1]]),
        ol.proj.fromLonLat([bounds[1][0], bounds[0][1]]),
        ol.proj.fromLonLat([bounds[0][0], bounds[0][1]])
      ]
    ]);
  }

  feature.setGeometry(thing);
}

function liveHash(call, band, mode)
{
  return call + band + mode;
}

function setHomeGridsquare()
{
  g_appSettings.centerGridsquare = myDEGrid;
  if (g_appSettings.centerGridsquare.length > 0)
  {
    homeQTHInput.value = g_appSettings.centerGridsquare;
  }
  var hash = myDEcall;

  var rect = qthToBox(
    myDEGrid,
    myDEcall,
    false,
    false,
    true,
    "",
    myBand,
    null,
    hash
  );
  if (typeof rect != "undefined" && rect != null)
  {
    var push = false;

    if (!(hash in g_liveCallsigns))
    {
      newCallsign = {};
      push = true;
    }
    else newCallsign = g_liveCallsigns[hash];
    newCallsign.DEcall = myDEcall;
    newCallsign.grid = myDEGrid;
    newCallsign.wspr = null;
    newCallsign.msg = myDEGrid;
    newCallsign.RSTsent = "-";
    newCallsign.RSTrecv = "-";
    newCallsign.time = timeNowSec();
    newCallsign.delta = -1;
    newCallsign.DXcall = "Self";
    newCallsign.rect = rect;
    newCallsign.mode = myMode;
    newCallsign.band = myBand;
    newCallsign.worked = false;
    newCallsign.confirmed = false;
    newCallsign.state = null;
    newCallsign.zipcode = null;
    newCallsign.cnty = null;
    newCallsign.qual = false;
    newCallsign.instance = null;
    newCallsign.alerted = false;
    newCallsign.shouldAlert = false;
    g_myDXCC = newCallsign.dxcc = callsignToDxcc(myDEcall);
    newCallsign.locked = true;

    if (push) g_liveCallsigns[hash] = newCallsign;
  }
}

var g_transmitFlightPath = null;

function haltAllTx(allTx = false)
{
  for (var instance in g_instances)
  {
    if (instance != g_activeInstance || allTx == true)
    {
      var responseArray = Buffer.alloc(1024);
      var length = 0;

      var port = g_instances[instance].remote.port;
      var address = g_instances[instance].remote.address;

      length = encodeQUINT32(responseArray, length, 0xadbccbda);
      length = encodeQUINT32(responseArray, length, 2);
      length = encodeQUINT32(responseArray, length, 8);
      length = encodeQUTF8(responseArray, length, instance);
      length = encodeQBOOL(responseArray, length, 0);

      responseArray = responseArray.slice(0, length);
      wsjtUdpMessage(responseArray, responseArray.length, port, address);
    }
  }
}

function initiateQso(thisCall)
{
  if (
    thisCall in g_callRoster &&
    g_callRoster[thisCall].message.instance in g_instances
  )
  {
    if (
      g_mapSettings.focusRig &&
      g_activeInstance != g_callRoster[thisCall].message.instance
    )
    {
      activeRig(g_callRoster[thisCall].message.instance);
    }
    if (g_mapSettings.haltAllOnTx)
    {
      haltAllTx();
    }

    var newMessage = g_callRoster[thisCall].message;
    var responseArray = Buffer.alloc(1024);
    var length = 0;
    var instance = g_callRoster[thisCall].message.instance;
    var port = g_instances[instance].remote.port;
    var address = g_instances[instance].remote.address;
    length = encodeQUINT32(responseArray, length, newMessage.magic_key);
    length = encodeQUINT32(responseArray, length, newMessage.schema_number);
    length = encodeQUINT32(responseArray, length, 4);
    length = encodeQUTF8(responseArray, length, newMessage.Id);
    length = encodeQUINT32(responseArray, length, newMessage.TM);
    length = encodeQINT32(responseArray, length, newMessage.SR);
    length = encodeQDOUBLE(responseArray, length, newMessage.DT);
    length = encodeQUINT32(responseArray, length, newMessage.DF);
    length = encodeQUTF8(responseArray, length, newMessage.MO);
    length = encodeQUTF8(responseArray, length, newMessage.Msg);
    length = encodeQBOOL(responseArray, length, newMessage.LC);
    length = encodeQBOOL(responseArray, length, 0);

    responseArray = responseArray.slice(0, length);
    wsjtUdpMessage(responseArray, responseArray.length, port, address);
  }
}

function spotLookupAndSetCall(spot)
{
  var call = g_receptionReports.spots[spot].call;
  var grid = g_receptionReports.spots[spot].grid;
  var band = g_receptionReports.spots[spot].band;
  var mode = g_receptionReports.spots[spot].mode;
  for (var instance in g_instances)
  {
    if (
      g_instances[instance].valid &&
      g_instances[instance].status.Band == band &&
      g_instances[instance].status.MO == mode
    )
    {
      setCallAndGrid(call, grid, instance);
      return;
    }
  }
  setCallAndGrid(call, grid, null);
}

function setCallAndGrid(callsign, grid, instance = null)
{
  var thisInstance = null;
  var port;
  var address;
  if (instance != null)
  {
    if (instance in g_instances)
    {
      thisInstance = g_instances[instance].status;
      port = g_instances[instance].remote.port;
      address = g_instances[instance].remote.address;
    }
    else alert("major instance error");
  }
  else
  {
    if (g_instances[g_activeInstance].valid)
    {
      thisInstance = g_instances[g_activeInstance].status;
      port = g_instances[g_activeInstance].remote.port;
      address = g_instances[g_activeInstance].remote.address;
    }
  }
  if (thisInstance && thisInstance.TxEnabled == 0)
  {
    var responseArray = Buffer.alloc(1024);
    var length = 0;
    length = encodeQUINT32(responseArray, length, thisInstance.magic_key);
    length = encodeQUINT32(responseArray, length, thisInstance.schema_number);
    length = encodeQUINT32(responseArray, length, 15);
    length = encodeQUTF8(responseArray, length, thisInstance.Id);
    length = encodeQUTF8(responseArray, length, thisInstance.MO);
    length = encodeQUINT32(responseArray, length, thisInstance.FreqTol);
    length = encodeQUTF8(responseArray, length, thisInstance.Submode);
    length = encodeQBOOL(responseArray, length, thisInstance.Fastmode);
    length = encodeQUINT32(responseArray, length, thisInstance.TRP);
    length = encodeQUINT32(responseArray, length, thisInstance.RxDF);
    length = encodeQUTF8(responseArray, length, callsign);

    var hash = liveHash(callsign, thisInstance.Band, thisInstance.MO);
    if (hash in g_liveCallsigns && g_liveCallsigns[hash].grid.length > 1)
    { grid = g_liveCallsigns[hash].grid; }

    if (grid.length == 0) grid = " ";

    length = encodeQUTF8(responseArray, length, grid);
    length = encodeQBOOL(responseArray, length, 1);

    responseArray = responseArray.slice(0, length);
    wsjtUdpMessage(responseArray, responseArray.length, port, address);
    addLastTraffic("<font color='lightgreen'>Generated Msgs</font>");
  }
  if (thisInstance && thisInstance.TxEnabled == 1)
  {
    addLastTraffic(
      "<font color='yellow'>Transmit Enabled!</font><br/><font color='yellow'>Generate Msgs Aborted</font>"
    );
  }
}

var g_wsjtHandlers = {
  0: handleWsjtxNotSupported,
  1: handleWsjtxStatus,
  2: handleWsjtxDecode,
  3: handleWsjtxClear,
  4: handleWsjtxNotSupported,
  5: handleWsjtxQSO,
  6: handleWsjtxClose,
  7: handleWsjtxNotSupported,
  8: handleWsjtxNotSupported,
  9: handleWsjtxNotSupported,
  10: handleWsjtxWSPR,
  11: handleWsjtxNotSupported,
  12: handleWsjtxADIF
};

var g_oldQSOTimer = null;

function handleWsjtxADIF(newMessage)
{
  if (g_oldQSOTimer)
  {
    clearTimeout(g_oldQSOTimer);
    g_oldQSOTimer = null;
  }

  if (g_ignoreMessages == 0)
  {
    onAdiLoadComplete(newMessage.ADIF);
  }

  sendToLogger(newMessage.ADIF);
}

function handleWsjtxQSO(newMessage)
{
  if (g_oldQSOTimer)
  {
    clearTimeout(g_oldQSOTimer);
    g_oldQSOTimer = null;
  }

  g_oldStyleLogMessage = Object.assign({}, newMessage);

  g_oldQSOTimer = setTimeout(oldSendToLogger, 3000);
}

function handleWsjtxNotSupported(newMessage) {}

var g_gtShareCount = 0;
var g_lastBand = "";
var g_lastMode = "";

var g_lastRawGrid = "AA00AA";

var g_weAreDecoding = false;
var g_localDXcall = "";

var g_countIndex = 0;
var g_lastCountIndex = 0;

function rigChange(up)
{
  if (g_activeInstance == "") return;

  var targetInstance = 0;
  if (up)
  {
    targetInstance = g_instances[g_activeInstance].intId + 1;
  }
  else
  {
    targetInstance = g_instances[g_activeInstance].intId - 1;
    if (targetInstance < 0) targetInstance = g_instancesIndex.length - 1;
  }

  targetInstance %= g_instancesIndex.length;

  setRig(targetInstance);
}

function setRig(instanceId)
{
  if (g_instances[g_instancesIndex[instanceId]].valid)
  {
    if (g_lastMapView != null)
    {
      g_mapView.animate({ zoom: g_lastMapView.zoom, duration: 100 });
      g_mapView.animate({ center: g_lastMapView.LoLa, duration: 100 });
      g_lastMapView = null;
    }

    g_activeInstance = g_instancesIndex[instanceId];

    handleWsjtxStatus(g_instances[g_activeInstance].status);
    handleClosed(g_instances[g_activeInstance].status);
  }
}

function activeRig(instance)
{
  if (g_instances[instance].valid)
  {
    if (g_lastMapView != null)
    {
      g_mapView.animate({ zoom: g_lastMapView.zoom, duration: 100 });
      g_mapView.animate({ center: g_lastMapView.LoLa, duration: 100 });
      g_lastMapView = null;
    }

    g_activeInstance = instance;

    handleWsjtxStatus(g_instances[g_activeInstance].status);
    handleClosed(g_instances[g_activeInstance].status);
  }
}

var g_lastDecodeCallsign = "";
var g_lastTransmitCallsign = {};
var g_lastStatusCallsign = {};

function handleWsjtxStatus(newMessage)
{
  if (g_ignoreMessages == 1) return;

  if (g_callRosterWindowHandle)
  {
    try
    {
      g_callRosterWindowHandle.window.processStatus(newMessage);
    }
    catch (e) {}
  }

  if (g_activeInstance == "")
  {
    g_activeInstance = newMessage.instance;
  }

  if (Object.keys(g_instances).length > 1)
  {
    rigWrap.style.display = "block";
  }
  else
  {
    rigWrap.style.display = "none";
  }

  var DXcall = newMessage.DXcall.trim();

  if (DXcall.length > 1)
  {
    if (!(newMessage.instance in g_lastTransmitCallsign))
    { g_lastTransmitCallsign[newMessage.instance] = ""; }

    if (!(newMessage.instance in g_lastStatusCallsign))
    { g_lastStatusCallsign[newMessage.instance] = ""; }

    if (
      lookupOnTx.checked == true &&
      newMessage.Transmitting == 1 &&
      g_lastTransmitCallsign[newMessage.instance] != DXcall
    )
    {
      openLookupWindow(true);
      g_lastTransmitCallsign[newMessage.instance] = DXcall;
    }

    if (g_lastStatusCallsign[newMessage.instance] != DXcall)
    {
      g_lastStatusCallsign[newMessage.instance] = DXcall;
      lookupCallsign(DXcall, newMessage.DXgrid.trim());
    }
  }

  if (g_activeInstance == newMessage.instance)
  {
    var sp = newMessage.Id.split(" - ");
    rigDiv.innerHTML = sp[sp.length - 1].substring(0, 18);

    var bandChange = false;
    var modeChange = false;
    var origMode = g_lastMode;
    var origBand = g_lastBand;
    wsjtxMode.innerHTML = "<font color='orange'>" + newMessage.MO + "</font>";
    myMode = newMessage.MO;
    myBand = Number(newMessage.Frequency / 1000000).formatBand();
    if (g_lastBand != myBand)
    {
      g_lastBand = myBand;
      bandChange = true;
      if (g_pskBandActivityTimerHandle != null)
      {
        clearInterval(g_pskBandActivityTimerHandle);
        g_pskBandActivityTimerHandle = null;
      }
      removePaths();
    }
    if (g_lastMode != myMode)
    {
      g_lastMode = myMode;
      modeChange = true;
      if (g_pskBandActivityTimerHandle != null)
      {
        clearInterval(g_pskBandActivityTimerHandle);
        g_pskBandActivityTimerHandle = null;
      }
    }
    if (g_pskBandActivityTimerHandle == null) pskGetBandActivity();
    if (bandChange || modeChange)
    {
      goProcessRoster();
      redrawGrids();
      redrawSpots();
      redrawPins();

      var msg = "";

      msg += "<font color='yellow'>" + myBand + "</font> / ";
      msg += "<font color='orange'>" + myMode + "</font>";
      addLastTraffic(msg);
      ackAlerts();
      updateChatWindow();
    }
    myRawFreq = newMessage.Frequency;
    frequency.innerHTML =
      "<font color='lightgreen'>" +
      Number(newMessage.Frequency / 1000).formatMhz(3, 3) +
      " Hz </font><font color='yellow'>(" +
      myBand +
      ")</font>";
    myRawCall = newMessage.DEcall.trim();

    myRawGrid = newMessage.DEgrid.trim().substr(0, 6);

    var LL = squareToLatLongAll(myRawGrid);
    g_mapSettings.latitude = g_myLat = LL.la2 - (LL.la2 - LL.la1) / 2;
    g_mapSettings.longitude = g_myLon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
    if (myRawGrid != g_lastRawGrid)
    {
      g_lastRawGrid = myRawGrid;
    }

    dxCallBoxDiv.className = "DXCallBox";

    var hash = DXcall + myBand + myMode;

    if (hash in g_tracker.worked.call)
    {
      dxCallBoxDiv.className = "DXCallBoxWorked";
    }
    if (hash in g_tracker.confirmed.call)
    {
      dxCallBoxDiv.className = "DXCallBoxConfirmed";
    }

    g_localDXcall = DXcall;
    localDXcall.innerHTML = DXcall.formatCallsign();
    if (localDXcall.innerHTML.length == 0)
    {
      localDXcall.innerHTML = "-";
      g_localDXcall = "";
    }
    localDXGrid.innerHTML = myDXGrid = newMessage.DXgrid.trim();

    if (myDXGrid.length == 0 && hash in g_liveCallsigns)
    {
      localDXGrid.innerHTML = myDXGrid = g_liveCallsigns[hash].grid.substr(
        0,
        4
      );
    }

    if (localDXGrid.innerHTML.length == 0)
    {
      localDXGrid.innerHTML = "-";
      localDXDistance.innerHTML = "&nbsp;";
      localDXAzimuth.innerHTML = "&nbsp;";
    }
    else
    {
      var LL = squareToLatLongAll(myDXGrid);
      localDXDistance.innerHTML =
        parseInt(
          MyCircle.distance(
            g_myLat,
            g_myLon,
            LL.la2 - (LL.la2 - LL.la1) / 2,
            LL.lo2 - (LL.lo2 - LL.lo1) / 2,
            distanceUnit.value
          ) * MyCircle.validateRadius(distanceUnit.value)
        ) + distanceUnit.value.toLowerCase();
      localDXAzimuth.innerHTML =
        parseInt(
          MyCircle.bearing(
            g_myLat,
            g_myLon,
            LL.la2 - (LL.la2 - LL.la1) / 2,
            LL.lo2 - (LL.lo2 - LL.lo1) / 2
          )
        ) + "&deg;";
    }
    if (localDXcall.innerHTML != "-")
    {
      localDXReport.innerHTML = Number(
        newMessage.Report.trim()
      ).formatSignalReport();
      if (DXcall.length > 0)
      { localDXCountry.innerHTML = g_dxccToAltName[callsignToDxcc(DXcall)]; }
      else localDXCountry.innerHTML = "&nbsp;";
    }
    else
    {
      localDXReport.innerHTML = localDXCountry.innerHTML = "";
    }
    myDEcall = newMessage.DEcall;
    myDEGrid = newMessage.DEgrid.trim().substr(0, 6);
    if (myDEGrid.length > 0) setHomeGridsquare();
    if (myDEGrid.length > 0) g_appSettings.centerGridsquare = myDEGrid;

    if (newMessage.Decoding == 1)
    {
      // Decoding
      dimGridsquare();
      fadePaths();
      txrxdec.style.backgroundColor = "Blue";
      txrxdec.style.borderColor = "Cyan";
      txrxdec.innerHTML = "DECODE";
      g_countIndex++;
      g_weAreDecoding = true;
    }
    else
    {
      g_weAreDecoding = false;

      if (g_countIndex != g_lastCountIndex)
      {
        g_lastCountIndex = g_countIndex;

        updateCountStats();

        if (g_appSettings.gtShareEnable == "true")
        {
          g_gtLiveStatusUpdate = true;
          g_gtShareCount++;
        }
        else g_gtShareCount = 0;

        if (bandChange || modeChange) reloadInfo(bandChange || modeChange);
        var worker = "";

        worker +=
          "<div  style='vertical-align:top;display:inline-block;margin-right:8px;'>";
        worker += "<table class='darkTable' align=center>";
        worker +=
          "<tr><th colspan=7>Last " +
          g_lastMessages.length +
          " Decoded Messages</th></tr>";
        worker +=
          "<tr><th>Time</th><th>dB</th><th>DT</th><th>Freq</th><th>Mode</th><th>Message</th><th>DXCC</th></tr>";

        worker += g_lastMessages.join("");

        worker += "</table></div>";

        setStatsDiv("decodeLastListDiv", worker);
        setStatsDivHeight(
          "decodeLastListDiv",
          getStatsWindowHeight() + 26 + "px"
        );

        if (
          g_appSettings.gtShareEnable === true &&
          Object.keys(g_spotCollector).length > 0
        )
        {
          gtChatSendSpots(g_spotCollector);
          g_spotCollector = {};
        }
      }

      txrxdec.style.backgroundColor = "Green";
      txrxdec.style.borderColor = "GreenYellow";
      txrxdec.innerHTML = "RECEIVE";
    }

    if (newMessage.TxEnabled)
    {
      if (
        g_mapSettings.fitQRZ &&
        (!g_spotsEnabled || g_receptionSettings.mergeSpots)
      )
      {
        if (g_lastMapView == null)
        {
          g_lastMapView = {};
          g_lastMapView.LoLa = g_mapView.getCenter();
          g_lastMapView.zoom = g_mapView.getZoom();
        }
        if (myDXGrid.length > 0)
        {
          fitViewBetweenPoints([getPoint(myRawGrid), getPoint(myDXGrid)]);
        }
        else if (
          g_mapSettings.qrzDxccFallback &&
          DXcall.length > 0 &&
          callsignToDxcc(DXcall) > 0
        )
        {
          var dxcc = callsignToDxcc(DXcall);
          var Lat = g_worldGeoData[g_dxccToGeoData[dxcc]].lat;
          var Lon = g_worldGeoData[g_dxccToGeoData[dxcc]].lon;
          fitViewBetweenPoints(
            [getPoint(myRawGrid), ol.proj.fromLonLat([Lon, Lat])],
            15
          );
        }
      }
    }
    else
    {
      if (g_lastMapView != null)
      {
        g_mapView.animate({ zoom: g_lastMapView.zoom, duration: 1200 });
        g_mapView.animate({ center: g_lastMapView.LoLa, duration: 1200 });
        g_lastMapView = null;
      }
    }

    if (newMessage.Transmitting == 0)
    {
      // Not Transmitting
      g_layerSources.transmit.clear();
      g_transmitFlightPath = null;
    }
    else
    {
      txrxdec.style.backgroundColor = "Red";
      txrxdec.style.borderColor = "Orange";
      txrxdec.innerHTML = "TRANSMIT";
      g_layerSources.transmit.clear();
      g_transmitFlightPath = null;
      if (
        qrzPathWidthValue.value != 0 &&
        g_appSettings.gridViewMode != 2 &&
        validateGridFromString(myRawGrid)
      )
      {
        var strokeColor = getQrzPathColor();
        var strokeWeight = qrzPathWidthValue.value;
        var LL = squareToLatLongAll(myRawGrid);
        var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
        var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
        var fromPoint = ol.proj.fromLonLat([Lon, Lat]);
        var toPoint = null;

        if (validateGridFromString(myDXGrid))
        {
          LL = squareToLatLongAll(myDXGrid);
          Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
          Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;

          toPoint = ol.proj.fromLonLat([Lon, Lat]);
        }
        else if (
          g_mapSettings.qrzDxccFallback &&
          DXcall.length > 0 &&
          callsignToDxcc(DXcall) > 0
        )
        {
          var dxcc = callsignToDxcc(DXcall);
          Lat = g_worldGeoData[g_dxccToGeoData[dxcc]].lat;
          Lon = g_worldGeoData[g_dxccToGeoData[dxcc]].lon;

          toPoint = ol.proj.fromLonLat([Lon, Lat]);

          var locality = g_worldGeoData[g_dxccToGeoData[dxcc]].geo;
          if (locality == "deleted") locality = null;

          if (locality != null)
          {
            var feature = shapeFeature(
              "qrz",
              locality,
              "qrz",
              "#FFFF0010",
              "#FF0000FF",
              1.0
            );
            g_layerSources.transmit.addFeature(feature);
          }
        }

        if (toPoint)
        {
          g_transmitFlightPath = flightFeature(
            [fromPoint, toPoint],
            {
              weight: strokeWeight,
              color: strokeColor,
              steps: 75,
              zIndex: 90
            },
            "transmit",
            true
          );
        }
      }
      g_weAreDecoding = false;
    }

    g_appSettings.myDEcall = myDEcall;
    g_appSettings.myDEGrid = myDEGrid;
    g_appSettings.myMode = myMode;
    g_appSettings.myBand = myBand;
    g_appSettings.myRawFreq = myRawFreq;
    g_appSettings.myRawCall = myRawCall;
    g_appSettings.myRawGrid = myRawGrid;
  }

  if (newMessage.Decoding == 0)
  {
    goProcessRoster();
    processClassicAlerts();
  }
}

var g_lastMapView = null;

function drawTraffic()
{
  while (g_lastTraffic.length > 60) g_lastTraffic.pop();

  var worker = g_lastTraffic.join("<br/>");
  worker = worker.split("80%'><br/>").join("80%'>");
  if (g_localDXcall.length > 1)
  {
    worker = worker
      .split(g_localDXcall)
      .join("<font style='color:cyan'>" + g_localDXcall + "</font>");
  }
  if (myRawCall.length > 1)
  {
    worker = worker
      .split(myRawCall)
      .join("<font style='color:yellow'>" + myRawCall + "</font>");
  }
  trafficDiv.innerHTML = worker;
}
function getPoint(grid)
{
  var LL = squareToLatLongAll(grid);
  var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
  var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
  return ol.proj.fromLonLat([Lon, Lat]);
}
var g_showCQRU = true;

function fitViewBetweenPoints(points, maxZoom = 20)
{
  var start = ol.proj.toLonLat(points[0]);
  var end = ol.proj.toLonLat(points[1]);

  if (Math.abs(start[0] - end[0]) > 180)
  {
    // Wrapped
    if (end[0] < start[0])
    {
      start[0] -= 360;
    }
    else
    {
      end[0] -= 360;
    }
  }

  start = ol.proj.fromLonLat(start);
  end = ol.proj.fromLonLat(end);
  var line = new ol.geom.LineString([start, end]);
  var feature = new ol.Feature({ geometry: line });
  var extent = feature.getGeometry().getExtent();

  g_mapView.fit(extent, {
    duration: 500,
    maxZoom: maxZoom,
    padding: [75, 75, 75, 75]
  });
}

var g_spotCollector = {};

function handleWsjtxDecode(newMessage)
{
  if (g_ignoreMessages == 1 || g_map == null) return;
  var didAlert = false;
  var didCustomAlert = false;
  var validQTH = false;
  var CQ = false;
  var DEDX = false;
  var msgDEcallsign = "";
  var msgDXcallsign = "";
  var theirQTH = "";
  var countryName = "";
  var newF;
  if (newMessage.OF > 0)
  {
    newF = Number((newMessage.OF + newMessage.DF) / 1000).formatMhz(3, 3);
  }
  else
  {
    newF = newMessage.DF;
  }
  theTimeStamp =
    timeNowSec() - (timeNowSec() % 86400) + parseInt(newMessage.TM / 1000);
  var messageColor = "white";
  if (CQ == true) messageColor = "cyan";

  // Break up the decoded message
  var decodeWords = newMessage.Msg.split(" ").slice(0, 5);
  while (decodeWords[decodeWords.length - 1] == "") decodeWords.pop();

  if (decodeWords.length > 1 && newMessage.Msg.indexOf("<...>") == -1)
  {
    if (newMessage.Msg.indexOf("<") != -1)
    {
      for (var i in decodeWords)
      {
        decodeWords[i] = decodeWords[i].replace("<", "").replace(">", "");
      }
    }

    var rect = null;
    // Grab the last word in the decoded message
    var qth = decodeWords[decodeWords.length - 1].trim();
    if (qth.length == 4)
    {
      var LETTERS = qth.substr(0, 2);
      var NUMBERS = qth.substr(2, 2);
      if (/^[A-R]+$/.test(LETTERS) && /^[0-9]+$/.test(NUMBERS))
      {
        theirQTH = LETTERS + NUMBERS;
        if (theirQTH != "RR73")
        {
          validQTH = true;
        }
        else
        {
          theirQTH = "";
          validQTH = false;
        }
      }
    }

    if (validQTH) msgDEcallsign = decodeWords[decodeWords.length - 2].trim();
    if (validQTH == false && decodeWords.length == 3)
    { msgDEcallsign = decodeWords[decodeWords.length - 2].trim(); }
    if (validQTH == false && decodeWords.length == 2)
    { msgDEcallsign = decodeWords[decodeWords.length - 1].trim(); }
    if (decodeWords[0] == "CQ")
    {
      CQ = true;
      msgDXcallsign = "CQ";
    }
    if (decodeWords.length == 4 && CQ == true)
    {
      msgDXcallsign += " " + decodeWords[1];
    }
    if (decodeWords.length == 3 && CQ == false)
    {
      msgDXcallsign = decodeWords[0];
    }
    if (decodeWords.length >= 3 && CQ == true && validQTH == false)
    {
      if (validateNumAndLetter(decodeWords[decodeWords.length - 1].trim()))
      { msgDEcallsign = decodeWords[decodeWords.length - 1].trim(); }
      else msgDEcallsign = decodeWords[decodeWords.length - 2].trim();
    }

    if (decodeWords.length >= 4 && CQ == false)
    {
      msgDXcallsign = decodeWords[0];
      msgDEcallsign = decodeWords[1];
    }

    var callsign = null;

    var hash = msgDEcallsign + newMessage.OB + newMessage.OM;
    if (hash in g_liveCallsigns) callsign = g_liveCallsigns[hash];

    if (validQTH == "" && msgDEcallsign in g_gtCallsigns)
    {
      if (g_gtFlagPins[g_gtCallsigns[msgDEcallsign]].grid.length > 0)
      { validQTH = g_gtFlagPins[g_gtCallsigns[msgDEcallsign]].grid; }
    }

    var canPath = false;
    if (
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto" && newMessage.OB == myBand) ||
        newMessage.OB == g_appSettings.gtBandFilter) &&
      (g_appSettings.gtModeFilter.length == 0 ||
        (g_appSettings.gtModeFilter == "auto" && newMessage.OM == myMode) ||
        newMessage.OM == g_appSettings.gtModeFilter ||
        g_appSettings.gtModeFilter == "Digital")
    )
    {
      rect = qthToBox(
        theirQTH,
        msgDEcallsign,
        CQ,
        newMessage.NW,
        false,
        msgDXcallsign,
        newMessage.OB,
        null,
        hash
      );

      canPath = true;
    }

    if (rect != null && theirQTH == "")
    {
      theirQTH = rect.qth;
    }

    if (rect)
    {
      g_liveGrids[theirQTH].age = g_timeNow;
    }

    if (callsign == null)
    {
      newCallsign = {};
      newCallsign.DEcall = msgDEcallsign;
      newCallsign.grid = theirQTH;
      newCallsign.wspr = null;
      newCallsign.msg = newMessage.Msg;
      newCallsign.RSTsent = newMessage.SR;
      newCallsign.RSTrecv = "-";
      newCallsign.time = theTimeStamp;
      newCallsign.life = newCallsign.age = g_timeNow;
      newCallsign.delta = newMessage.DF;
      newCallsign.dt = newMessage.DT.toFixed(2);
      newCallsign.DXcall = msgDXcallsign.trim();
      newCallsign.rect = rect;
      newCallsign.state = null;
      newCallsign.zipcode = null;
      newCallsign.worked = false;
      newCallsign.confirmed = false;
      newCallsign.qso = false;
      newCallsign.dxcc = callsignToDxcc(newCallsign.DEcall);
      newCallsign.px = null;
      newCallsign.zone = null;
      newCallsign.vucc_grids = [];
      newCallsign.propMode = "";
      newCallsign.digital = true;
      newCallsign.phone = false;
      newCallsign.IOTA = "";
      newCallsign.satName = "";
      if (newCallsign.dxcc != -1)
      {
        newCallsign.px = getWpx(newCallsign.DEcall);
        if (newCallsign.px)
        {
          newCallsign.zone = Number(
            newCallsign.px.charAt(newCallsign.px.length - 1)
          );
        }

        newCallsign.cont =
          g_worldGeoData[g_dxccToGeoData[newCallsign.dxcc]].continent;
        if (newCallsign.dxcc == 390 && newCallsign.zone == 1)
        { details.cont = "EU"; }
      }

      newCallsign.ituza = Array();
      newCallsign.cqza = Array();
      newCallsign.distance = 0;
      newCallsign.heading = 0;

      newCallsign.cnty = null;
      newCallsign.qual = false;

      getLookupCachedObject(msgDEcallsign, null, null, null, newCallsign);

      if (
        g_callsignLookups.ulsUseEnable == true &&
        isKnownCallsignDXCC(newCallsign.dxcc)
      )
      {
        lookupUsCallsign(newCallsign, false);
      }

      if (newCallsign.dxcc in g_dxccCount) g_dxccCount[newCallsign.dxcc]++;
      else g_dxccCount[newCallsign.dxcc] = 1;

      newCallsign.alerted = false;
      newCallsign.shouldAlert = false;
      g_liveCallsigns[hash] = newCallsign;
      callsign = newCallsign;
    }
    else
    {
      if (validQTH)
      {
        callsign.grid = theirQTH;

        if (rect != null && callsign.grid != rect.qth)
        {
          if (
            (g_appSettings.gtBandFilter.length == 0 ||
              (g_appSettings.gtBandFilter == "auto" &&
                newMessage.OB == myBand) ||
              newMessage.OB == g_appSettings.gtBandFilter) &&
            (g_appSettings.gtModeFilter.length == 0 ||
              (g_appSettings.gtModeFilter == "auto" &&
                newMessage.OM == myMode) ||
              newMessage.OM == g_appSettings.gtModeFilter ||
              g_appSettings.gtModeFilter == "Digital")
          )
          {
            rect = qthToBox(
              theirQTH,
              msgDEcallsign,
              CQ,
              newMessage.NW,
              false,
              msgDXcallsign,
              newMessage.OB,
              null,
              hash
            );
            canPath = true;
          }
        }
      }

      callsign.time = theTimeStamp;
      callsign.age = g_timeNow;

      callsign.RSTsent = newMessage.SR;
      callsign.delta = newMessage.DF;
      callsign.DXcall = msgDXcallsign.trim();
      callsign.msg = newMessage.Msg;
      callsign.rect = rect;
      callsign.dt = newMessage.DT.toFixed(2);
    }
    callsign.mode = newMessage.OM;
    callsign.band = newMessage.OB;
    callsign.instance = newMessage.instance;
    callsign.grid = callsign.grid.substr(0, 4);
    callsign.CQ = CQ;

    if (msgDXcallsign == myDEcall) callsign.qrz = true;
    else callsign.qrz = false;

    if (callsign.grid.length > 0 && callsign.distance == 0)
    {
      var LL = squareToLatLongAll(callsign.grid);
      callsign.distance = MyCircle.distance(
        g_myLat,
        g_myLon,
        LL.la2 - (LL.la2 - LL.la1) / 2,
        LL.lo2 - (LL.lo2 - LL.lo1) / 2,
        distanceUnit.value
      );
      callsign.heading = MyCircle.bearing(
        g_myLat,
        g_myLon,
        LL.la2 - (LL.la2 - LL.la1) / 2,
        LL.lo2 - (LL.lo2 - LL.lo1) / 2
      );

      if (callsign.grid in g_gridToITUZone)
      {
        callsign.ituza = g_gridToITUZone[callsign.grid];
      }
      if (callsign.grid in g_gridToCQZone)
      {
        callsign.cqza = g_gridToCQZone[callsign.grid];
      }
    }

    if (newMessage.NW)
    {
      didCustomAlert = processAlertMessage(
        decodeWords,
        newMessage.Msg.substr(0, 30).trim(),
        callsign.band,
        callsign.mode
      );

      didAlert = checkClassicAlerts(CQ, callsign, newMessage, msgDXcallsign);

      insertMessageInRoster(
        newMessage,
        msgDEcallsign,
        msgDXcallsign,
        callsign,
        hash
      );

      if (
        g_mapSettings.trafficDecode &&
        (didAlert == true || didCustomAlert == true)
      )
      {
        var traffic = htmlEntities(newMessage.Msg);
        if (didAlert == true)
        {
          traffic = "⚠️ " + traffic;
        }
        if (didCustomAlert == true)
        {
          traffic = traffic + " 🚩";
        }

        g_lastTraffic.unshift(traffic);
        g_lastTraffic.unshift(userTimeString(null));
        g_lastTraffic.unshift(
          "<hr style='border-color:#333;margin-top:0px;margin-bottom:2px;width:80%'>"
        );
        drawTraffic();
        lastMessageWasInfo = true;
      }

      if (
        g_appSettings.gtSpotEnable === true &&
        g_appSettings.gtSpotEnable === true &&
        callsign.DEcall in g_gtCallsigns
      )
      {
        if (
          g_gtCallsigns[callsign.DEcall] in g_gtFlagPins &&
          g_gtFlagPins[g_gtCallsigns[callsign.DEcall]].o == 1
        )
        { g_spotCollector[g_gtCallsigns[callsign.DEcall]] = callsign.RSTsent; }
      }
    }

    if (callsign.dxcc != -1) countryName = g_dxccToAltName[callsign.dxcc];
    if (canPath == true)
    {
      if (
        callsign.DXcall.indexOf("CQ") < 0 &&
        g_appSettings.gridViewMode != 2
      )
      {
        // Nothing special, we know the callers grid
        if (callsign.grid != "")
        {
          // Our msgDEcallsign is not sending a CQ.
          // Let's see if we can locate who he's talking to in our known list
          var DEcallsign = null;
          if (
            callsign.DXcall + newMessage.OB + newMessage.OM in
            g_liveCallsigns
          )
          {
            DEcallsign =
              g_liveCallsigns[callsign.DXcall + newMessage.OB + newMessage.OM];
          }
          else if (callsign.DXcall in g_liveCallsigns)
          {
            DEcallsign = g_liveCallsigns[callsign.DXcall];
          }

          if (DEcallsign != null && DEcallsign.grid != "")
          {
            var strokeColor = getPathColor();
            var strokeWeight = pathWidthValue.value;
            var flightPath = null;
            var isQRZ = false;
            if (msgDXcallsign == myDEcall)
            {
              strokeColor = getQrzPathColor();
              strokeWeight = qrzPathWidthValue.value;
              isQRZ = true;
            }

            if (strokeWeight != 0)
            {
              var fromPoint = getPoint(callsign.grid);
              var toPoint = getPoint(DEcallsign.grid);

              flightPath = flightFeature(
                [fromPoint, toPoint],
                {
                  weight: strokeWeight,
                  color: strokeColor,
                  steps: 75,
                  zIndex: 90
                },
                "flight",
                true
              );

              flightPath.age = g_timeNow + g_flightDuration;
              flightPath.isShapeFlight = 0;
              flightPath.isQRZ = isQRZ;

              g_flightPaths.push(flightPath);
            }
          }
        }
        else if (
          g_mapSettings.qrzDxccFallback &&
          msgDXcallsign == myDEcall &&
          callsign.dxcc > 0
        )
        {
          // the caller is calling us, but they don't have a grid, so lookup the DXCC and show it
          var strokeColor = getQrzPathColor();
          var strokeWeight = qrzPathWidthValue.value;
          var flightPath = null;
          var isQRZ = true;
          var DEcallsign = g_liveCallsigns[myDEcall];

          if (strokeWeight != 0)
          {
            var toPoint = getPoint(DEcallsign.grid);

            var Lat = g_worldGeoData[g_dxccToGeoData[callsign.dxcc]].lat;
            var Lon = g_worldGeoData[g_dxccToGeoData[callsign.dxcc]].lon;
            var fromPoint = ol.proj.fromLonLat([Lon, Lat]);

            flightPath = flightFeature(
              [fromPoint, toPoint],
              {
                weight: strokeWeight,
                color: strokeColor,
                steps: 75,
                zIndex: 90
              },
              "flight",
              true
            );

            flightPath.age = g_timeNow + g_flightDuration;
            flightPath.isShapeFlight = 0;
            flightPath.isQRZ = isQRZ;

            g_flightPaths.push(flightPath);

            var feature = shapeFeature(
              "qrz",
              g_worldGeoData[g_dxccToGeoData[callsign.dxcc]].geo,
              "qrz",
              "#FFFF0010",
              "#FF0000FF",
              1.0
            );
            feature.age = g_timeNow + g_flightDuration;
            feature.isShapeFlight = 1;
            feature.isQRZ = isQRZ;
            g_layerSources.flight.addFeature(feature);
            g_flightPaths.push(feature);
          }
        }
      }
      else if (
        g_mapSettings.CQhilite &&
        msgDXcallsign.indexOf("CQ ") == 0 &&
        callsign.grid != "" &&
        g_appSettings.gridViewMode != 2 &&
        pathWidthValue.value != 0
      )
      {
        var CCd = msgDXcallsign.replace("CQ ", "").split(" ")[0];
        if (CCd.length < 5 && !(CCd in g_pathIgnore))
        {
          var locality = null;
          // Direct lookup US states, Continents, possibly
          if (CCd in g_replaceCQ) CCd = g_replaceCQ[CCd];

          if (CCd.length == 2 && CCd in g_shapeData)
          {
            locality = g_shapeData[CCd];
          }
          else if (CCd.length == 3)
          {
            // maybe it's DEL, or WYO. check the first two letters
            if (CCd.substr(0, 2) in g_shapeData)
            { locality = g_shapeData[CCd.substr(0, 2)]; }
          }

          if (locality == null)
          {
            // Check the prefix for dxcc direct
            var dxcc = callsignToDxcc(CCd);
            if (dxcc != -1)
            {
              locality = g_worldGeoData[g_dxccToGeoData[dxcc]].geo;
              if (locality == "deleted") locality = null;
            }
          }

          if (locality != null)
          {
            var strokeColor = getPathColor();
            var strokeWeight = pathWidthValue.value;
            var flightPath = null;

            var feature = shapeFeature(
              CCd,
              locality,
              CCd,
              "#00000000",
              "#FF0000C0",
              strokeWeight
            );

            feature.age = g_timeNow + g_flightDuration;
            feature.isShapeFlight = 1;
            feature.isQRZ = false;
            g_layerSources.flight.addFeature(feature);
            g_flightPaths.push(feature);

            var fromPoint = getPoint(callsign.grid);
            var toPoint = ol.proj.fromLonLat(locality.properties.center);

            flightPath = flightFeature(
              [fromPoint, toPoint],
              {
                weight: strokeWeight,
                color: strokeColor,
                steps: 75,
                zIndex: 90
              },
              "flight",
              true
            );

            flightPath.age = g_timeNow + g_flightDuration;
            flightPath.isShapeFlight = 0;
            flightPath.isQRZ = false;
            g_flightPaths.push(flightPath);
          }
        }
      }
    }
  }

  var bgColor = "black";
  if (newMessage.LC > 0) bgColor = "#880000";

  g_lastMessages.unshift(
    "<tr style='background-color:" +
      bgColor +
      "'><td style='color:lightblue'>" +
      userTimeString(theTimeStamp * 1000) +
      "</td><td style='color:orange'>" +
      newMessage.SR +
      "</td><td style='color:gray'>" +
      newMessage.DT.toFixed(1) +
      "</td><td style='color:lightgreen'>" +
      newF +
      "</td><td>" +
      newMessage.MO +
      "</td><td style='color:" +
      messageColor +
      "'>" +
      htmlEntities(newMessage.Msg) +
      "</td><td style='color:yellow'>" +
      countryName +
      "</td></tr>"
  );

  while (g_lastMessages.length > 100) g_lastMessages.pop();
}

function addLastTraffic(traffic)
{
  g_lastTraffic.unshift(traffic);
  g_lastTraffic.unshift(
    "<hr style='border-color:#333;margin-top:0px;margin-bottom:2px;width:80%'>"
  );
  drawTraffic();
}

function htmlEntities(str)
{
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shapeFeature(
  key,
  geoJsonData,
  propname,
  fillColor,
  borderColor,
  borderWidth
)
{
  var feature = new ol.format.GeoJSON({
    geometryName: key
  }).readFeature(geoJsonData, {
    featureProjection: "EPSG:3857"
  });

  var style = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: borderColor,
      width: borderWidth
    }),
    fill: new ol.style.Fill({
      color: fillColor
    })
  });

  feature.setStyle(style);
  feature.set("prop", propname);
  feature.size = 2;
  return feature;
}
function handleWsjtxClear(newMessage)
{
  for (var hash in g_liveCallsigns)
  {
    if (
      g_liveCallsigns[hash].instance == newMessage.instance ||
      g_liveCallsigns[hash].mode == g_instances[newMessage.instance].status.MO
    )
    { delete g_liveCallsigns[hash]; }
  }
  for (var call in g_callRoster)
  {
    if (g_callRoster[call].callObj.instance == newMessage.instance)
    { delete g_callRoster[call]; }
  }

  redrawGrids();
  redrawPins();

  updateCountStats();
  goProcessRoster();
}

function goProcessRoster(isRealtime = false)
{
  var now = timeNowSec();
  for (var call in g_callRoster)
  {
    if (now - g_callRoster[call].callObj.age > 300)
    {
      g_callRoster[call].callObj.alerted = false;
      g_callRoster[call].callObj.shouldAlert = false;
      delete g_callRoster[call];
      continue;
    }
  }
  if (g_callRosterWindowHandle)
  {
    try
    {
      if (isRealtime == true)
      {
        if (g_callRosterWindowHandle.window.g_rosterSettings.realtime == false)
        { return; }
      }
      g_callRosterWindowHandle.window.processRoster(g_callRoster);
    }
    catch (e) {}
  }
}

function handleClosed(newMessage)
{
  if (
    g_activeInstance == newMessage.Id &&
    g_instances[newMessage.Id].open == false
  )
  {
    txrxdec.style.backgroundColor = "Purple";
    txrxdec.style.borderColor = "Purple";
    var name = newMessage.Id.toUpperCase().split(" - ");
    var txt = name[name.length - 1];
    txrxdec.innerHTML = txt + " Closed";
  }
}

function handleWsjtxClose(newMessage)
{
  updateCountStats();
  g_instances[newMessage.Id].open = false;
  handleClosed(newMessage);
  updateRosterInstances();
}

function handleWsjtxWSPR(newMessage)
{
  if (g_ignoreMessages == 1) return;

  addDeDx(
    newMessage.Grid,
    newMessage.Callsign,
    false,
    false,
    false,
    "-",
    Number(newMessage.SR),
    timeNowSec(),
    "Pwr:" +
      newMessage.Power +
      " Freq:" +
      Number(newMessage.Frequency / 1000).formatMhz(3, 3) +
      " Delta:" +
      Number(newMessage.DT).toFixed(2) +
      " Drift:" +
      newMessage.Drift,
    "WSPR",
    Number(newMessage.Frequency / 1000000).formatBand(),
    false,
    true,
    null,
    callsignToDxcc(newMessage.Callsign),
    null,
    null,
    null,
    "",
    ""
  );

  processAlertMessage(newMessage.Callsign.trim() + " " + newMessage.Grid);

  updateCountStats();
}

function centerOn(grid)
{
  if (grid.length >= 4)
  {
    var LL = squareToLatLong(grid);
    g_map
      .getView()
      .setCenter(
        ol.proj.fromLonLat([
          LL.lo2 - (LL.lo2 - LL.lo1) / 2,
          LL.la2 - (LL.la2 - LL.la1) / 2
        ])
      );
  }
}

function setCenterQTH()
{
  if (homeQTHInput.value.length >= 4)
  {
    g_appSettings.centerGridsquare = homeQTHInput.value;
    // Grab home QTH Gridsquare from Center QTH
    var LL = squareToLatLong(homeQTHInput.value);

    // panTo(ol.proj.fromLonLat([LL.lo2 - (LL.lo2 - LL.lo1) / 2, LL.la2 - ((LL.la2 - LL.la1) / 2)]));

    g_map
      .getView()
      .setCenter(
        ol.proj.fromLonLat([
          LL.lo2 - (LL.lo2 - LL.lo1) / 2,
          LL.la2 - (LL.la2 - LL.la1) / 2
        ])
      );
  }
  else
  {
    homeQTHInput.value = "";
  }
}
function setCenterGridsquare()
{
  if (g_mapMemory[6].zoom != -1)
  {
    mapMemory(6, false);
    return;
  }

  setCenterQTH();
}

function changeLookupMerge()
{
  g_appSettings.lookupMerge = lookupMerge.checked;
  g_appSettings.lookupMissingGrid = lookupMissingGrid.checked;
  if (g_appSettings.lookupMerge == true)
  {
    lookupMissingGridDiv.style.display = "inline-block";
  }
  else
  {
    lookupMissingGridDiv.style.display = "none";
  }
}

function changelookupOnTx()
{
  g_appSettings.lookupOnTx = lookupOnTx.checked;
  g_appSettings.lookupCloseLog = lookupCloseLog.checked;
}

function exportSettings()
{
  var filename = g_appData + g_dirSeperator + "gt_settings.json";

  var toWrite = JSON.stringify(localStorage);
  fs.writeFileSync(filename, toWrite);

  checkForSettings();
}

function checkForSettings()
{
  var filename = g_appData + g_dirSeperator + "gt_settings.json";
  if (fs.existsSync(filename))
  {
    importSettingsButton.style.display = "inline-block";
    importSettingsFile.style.display = "inline-block";
    importSettingsFile.innerHTML = filename;
  }
  else
  {
    importSettingsButton.style.display = "none";
    importSettingsFile.style.display = "none";
  }
}

function importSettings()
{
  checkForSettings();

  var filename = g_appData + g_dirSeperator + "gt_settings.json";
  if (fs.existsSync(filename))
  {
    var data = fs.readFileSync(filename);
    data = JSON.parse(data);
    if (
      typeof data.appSettings != "undefined" &&
      data.currentVersion == localStorage.currentVersion
    )
    {
      localStorage.clear();
      for (var key in data)
      {
        localStorage[key] = data[key];
      }
      fs.unlinkSync(filename);
      chrome.runtime.reload();
    }
    else
    {
      if (typeof data.appSettings == "undefined")
      {
        importSettingsFile.innerHTML =
          "<font style='color:red'>Settings File Corrupt!</font>";
      }
      else if (data.currentVersion != localStorage.currentVersion)
      {
        importSettingsFile.innerHTML =
          "<font style='color:red'>Settings Version Mismatch!</font>";
      }
    }
  }
}

function showCallsignBox(redraw)
{
  var worker =
    "<div style='vertical-align:top;display:inline-block;margin:2px;color:cyan;font-weight:bold'>Callsigns and DXCC Heard</div><br/>";

  g_newCallsignCount = Object.keys(g_liveCallsigns).length;
  if (g_newCallsignCount > 0)
  {
    var newCallList = Array();

    worker +=
      "<div  style='display:inline-block;padding-right:8px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(g_newCallsignCount * 24 + 26, getStatsWindowHeight()) +
      "px;'><table class='darkTable' align=center><th align=left>Callsign</th><th align=left>Grid</th><th>DXCC</th><th>CQ</th><th>ITU</th><th>Flag</th><th align=left>QSO</th><th>QSL</th><th>When</th>"; // <th>ITUz</th><th>CQz</th><th>ISO</th>";
    if (g_callsignLookups.lotwUseEnable == true) worker += "<th>LoTW</th>";
    if (g_callsignLookups.eqslUseEnable == true) worker += "<th>eQSL</th>";
    if (g_callsignLookups.oqrsUseEnable == true) worker += "<th>OQRS</th>";
    g_lastCallsignCount = g_newCallsignCount;
    for (var x in g_liveCallsigns)
    {
      if (g_liveCallsigns[x].dxcc != -1)
      {
        newCallList.push(g_liveCallsigns[x]);
      }
    }
    newCallList.sort(compareCallsignTime).reverse();
    for (var x in newCallList)
    {
      if (newCallList[x].DEcall == myRawCall) continue;
      var grid = newCallList[x].rect ? newCallList[x].rect.qth : "-";
      var cqzone =
        grid in g_gridToCQZone ? g_gridToCQZone[grid].join(", ") : "-";
      var ituzone =
        grid in g_gridToITUZone ? g_gridToITUZone[grid].join(", ") : "-";
      var geo = g_worldGeoData[g_dxccToGeoData[newCallList[x].dxcc]];
      var thisCall = newCallList[x].DEcall.formatCallsign();
      worker +=
        "<tr><td align=left style='color:#ff0;cursor:pointer'  onClick='window.opener.startLookup(\"" +
        newCallList[x].DEcall +
        "\",\"" +
        grid +
        "\");'>" +
        thisCall +
        "</td><td align=left style='color:cyan;' >" +
        grid +
        "</td><td  style='color:orange;'>" +
        geo.name +
        "<font style='color:lightgreen;'> (" +
        geo.pp +
        ")<font></td>";
      worker += "<td>" + cqzone + "</td><td>" + ituzone + "</td>";
      worker +=
        "<td align='center' style='margin:0;padding:0'><img style='padding-top:4px' src='./img/flags/16/" +
        geo.flag +
        "'></td>";
      worker +=
        "<td>" +
        (thisCall in g_tracker.worked.call ? "&#10004;" : "") +
        "</td><td>" +
        (thisCall in g_tracker.confirmed.call ? "&#10004;" : "") +
        "</td>";
      var ageString = "";
      if (timeNowSec() - newCallList[x].time < 3601)
      { ageString = (timeNowSec() - newCallList[x].time).toDHMS(); }
      else
      {
        ageString = userTimeString(newCallList[x].time * 1000);
      }
      worker += "<td>" + ageString + "</td>";
      if (g_callsignLookups.lotwUseEnable == true)
      {
        worker +=
          "<td align='center'>" +
          (thisCall in g_lotwCallsigns ? "&#10004;" : "") +
          "</td>";
      }
      if (g_callsignLookups.eqslUseEnable == true)
      {
        worker +=
          "<td align='center'>" +
          (thisCall in g_eqslCallsigns ? "&#10004;" : "") +
          "</td>";
      }
      if (g_callsignLookups.oqrsUseEnable == true)
      {
        worker +=
          "<td align='center'>" +
          (thisCall in g_oqrsCallsigns ? "&#10004;" : "") +
          "</td>";
      }
      worker += "</tr>";
    }
    worker += "</table></div>";
  }

  var heard = 0;
  var List = {};
  if (Object.keys(g_dxccCount).length > 0)
  {
    for (var key in g_dxccCount)
    {
      if (key != -1)
      {
        var item = {};
        item.total = g_dxccCount[key];
        item.confirmed = g_worldGeoData[g_dxccToGeoData[key]].confirmed;
        item.worked = g_worldGeoData[g_dxccToGeoData[key]].worked;
        item.dxcc = key;
        item.flag = g_worldGeoData[g_dxccToGeoData[key]].flag;
        List[g_dxccToAltName[key]] = item;
        heard++;
      }
    }
    worker +=
      "<div  style='vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(
        Object.keys(g_dxccCount).length * 23 + 45,
        getStatsWindowHeight()
      ) +
      "px;'><table class='darkTable' align=center><tr><th colspan=4 style='font-weight:bold'>DXCC (" +
      heard +
      ")</th><tr><th align=left>Name</th><th>Flag</th><th align=left>Calls</th></tr>";
    Object.keys(List)
      .sort()
      .forEach(function (key, i)
      {
        worker += "<tr><td align=left style='color:#ff0;' >" + key + "</td>";
        worker +=
          "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" +
          List[key].flag +
          "'></td>";
        worker +=
          "<td align=left style='color:lightblue;' >" +
          List[key].total +
          "</td>";
        worker += "</tr>";
      });
    worker += "</table></div>";
  }
  worker += "</div>";
  setStatsDiv("callsignListDiv", worker);
}

function setStatsDiv(div, worker)
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window[div] !== "undefined"
  )
  {
    g_statsWindowHandle.window[div].innerHTML = worker;
  }
}

function setStatsDivHeight(div, heightWithPx)
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window[div] !== "undefined"
  )
  {
    g_statsWindowHandle.window[div].style.height = heightWithPx;
  }
}
function getStatsWindowHeight()
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window.window !== "undefined"
  )
  {
    return g_statsWindowHandle.window.window.innerHeight - 63;
  }
  return 300;
}

function setLookupDiv(div, worker)
{
  if (
    g_lookupWindowHandle &&
    typeof g_lookupWindowHandle.window[div].innerHTML !== "undefined"
  )
  {
    g_lookupWindowHandle.window[div].innerHTML = worker;
  }
}

function setLookupDivHeight(div, heightWithPx)
{
  if (
    g_lookupWindowHandle &&
    typeof g_lookupWindowHandle.window[div].style !== "undefined"
  )
  {
    g_lookupWindowHandle.window[div].style.height = heightWithPx;
  }
}
function getLookupWindowHeight()
{
  if (
    g_lookupWindowHandle &&
    typeof g_lookupWindowHandle.window.window !== "undefined"
  )
  {
    return g_lookupWindowHandle.window.window.innerHeight;
  }
  return 300;
}

function showConditionsBox()
{
  if (g_mapSettings.offlineMode == false)
  {
    openConditionsWindow();
  }
}

function myCallCompare(a, b)
{
  return a.DEcall.localeCompare(b.DEcall);
}

function myGridCompare(a, b)
{
  return a.grid.localeCompare(b.grid);
}

function myModeCompare(a, b)
{
  return a.mode.localeCompare(b.mode);
}

function myDxccCompare(a, b)
{
  return g_dxccToAltName[a.dxcc].localeCompare(g_dxccToAltName[b.dxcc]);
}

function myDxccIntCompare(a, b)
{
  if (!(a in g_dxccToAltName)) return 0;
  if (!(b in g_dxccToAltName))
  { return g_dxccToAltName[a].localeCompare(g_dxccToAltName[b]); }
}

function myTimeCompare(a, b)
{
  if (a.time > b.time) return 1;
  if (a.time < b.time) return -1;
  return 0;
}

function myBandCompare(a, b)
{
  return a.band.localeCompare(b.band);
}

function myConfirmedCompare(a, b)
{
  if (a.confirmed && !b.confirmed) return 1;
  if (!a.confirmed && b.confirmed) return -1;
  return 0;
}

var g_sortFunction = [
  myCallCompare,
  myGridCompare,
  myModeCompare,
  myDxccCompare,
  myTimeCompare,
  myBandCompare,
  myConfirmedCompare
];

var g_lastSortIndex = 4;

var g_qsoPages = 1;
var g_qsoPage = 0;
var g_qsoItemsPerPage = 100;
var g_lastSortType = 0;
var g_searchWB = "";
var g_gridSearch = "";
var g_filterBand = "Mixed";
var g_filterMode = "Mixed";
var g_filterDxcc = 0;
var g_filterQSL = "All";

var g_lastSearchSelection = null;

function resetSearch()
{
  g_lastSortIndex = 4;
  g_qsoPages = 1;
  g_qsoPage = 0;
  g_qsoItemsPerPage = 100;
  g_lastSortType = 2;
  g_searchWB = "";
  g_gridSearch = "";

  g_filterBand = "Mixed";
  g_filterMode = "Mixed";
  g_filterDxcc = 0;
  g_filterQSL = "All";

  g_lastSearchSelection = null;
}

function showWorkedByCall(callsign, evt)
{
  evt.preventDefault();

  resetSearch();
  g_searchWB = callsign;
  if (event.shiftKey == true) g_filterQSL = "true";
  openInfoTab("qsobox", "workedBoxDiv", showWorkedBox);
}

function showWorkedSearchChanged(object, index)
{
  ValidateCallsign(object, null);
  g_searchWB = object.value.toUpperCase();
  g_lastSearchSelection = object.id;
  showWorkedBox(index, 0);
}

function showWorkedSearchGrid(object, index)
{
  ValidateCallsign(object, null);
  g_gridSearch = object.value.toUpperCase();
  g_lastSearchSelection = object.id;
  showWorkedBox(index, 0);
}

function filterBandFunction(event, index)
{
  g_filterBand = this.value;
  g_lastSearchSelection = this.id;
  showWorkedBox(index, 0);
}

function filterModeFunction(event, index)
{
  g_filterMode = this.value;
  g_lastSearchSelection = this.id;
  showWorkedBox(index, 0);
}

function filterDxccFunction(event, index)
{
  g_filterDxcc = this.value;
  g_lastSearchSelection = this.id;
  showWorkedBox(index, 0);
}

function filterQSLFunction(event, index)
{
  g_filterQSL = this.value;
  g_lastSearchSelection = this.id;
  showWorkedBox(index, 0);
}

function showWorkedBox(sortIndex, nextPage, redraw)
{
  try
  {
    var myObjects = null;
    var mySort = sortIndex;
    var bandOptions;
    var modeOptions;
    var dxccOptions;
    var bands = {};
    var modes = {};
    var dxccs = {};

    var ObjectCount = 0;

    myObjects = g_QSOhash;

    if (sortIndex == null || typeof sortIndex == "undefined")
    {
      mySort = 4;
      g_lastSortIndex = 4;
      g_lastSortType = 2;
    }

    var list = Object.values(myObjects);

    if (g_searchWB.length > 0)
    {
      list = list.filter(function (value)
      {
        return value.DEcall.indexOf(g_searchWB) > -1;
      });
    }

    if (g_gridSearch.length > 0)
    {
      list = list.filter(function (value)
      {
        var x = value.grid.indexOf(g_gridSearch);
        var y = value.vucc_grids.indexOf(g_gridSearch);
        return x == 0 || y == 0;
      });
    }

    for (var key in list)
    {
      bands[list[key].band] = list[key].band;
      modes[list[key].mode] = list[key].mode;
      var pp =
        g_dxccToGeoData[list[key].dxcc] in g_worldGeoData
          ? g_worldGeoData[g_dxccToGeoData[list[key].dxcc]].pp
          : "?";
      dxccs[g_dxccToAltName[list[key].dxcc] + " (" + pp + ")"] = list[key].dxcc;
    }

    if (g_filterBand != "Mixed")
    {
      list = list.filter(function (value)
      {
        return value.band == g_filterBand;
      });
    }

    if (g_filterMode != "Mixed")
    {
      list = list.filter(function (value)
      {
        if (
          g_filterMode == "Phone" &&
          value.mode in g_modes_phone &&
          g_modes_phone[value.mode]
        )
        { return true; }
        if (
          g_filterMode == "Digital" &&
          value.mode in g_modes &&
          g_modes[value.mode]
        )
        { return true; }
        return value.mode == g_filterMode;
      });
    }

    if (g_filterDxcc != 0)
    {
      list = list.filter(function (value)
      {
        return value.dxcc == g_filterDxcc;
      });
    }

    if (g_filterQSL != "All")
    {
      list = list.filter(function (value)
      {
        return value.confirmed == (g_filterQSL == "true");
      });
    }

    if (typeof redraw == "undefined")
    {
      if (typeof nextPage == "undefined")
      {
        nextPage = 0;
        if (g_lastSortIndex != mySort)
        {
          list = list.sort(g_sortFunction[mySort]);
          g_lastSortIndex = mySort;
          g_lastSortType = 1;
          g_qsoPage = 0;
        }
        else
        {
          list = list.sort(g_sortFunction[mySort]).reverse();
          g_lastSortIndex = -1;
          g_lastSortType = 2;
          g_qsoPage = 0;
        }
      }
      else
      {
        if (g_lastSortType == 1)
        {
          list = list.sort(g_sortFunction[mySort]);
        }
        else
        {
          list = list.sort(g_sortFunction[mySort]).reverse();
        }
      }
    }
    else
    {
      mySort = g_lastSortIndex;
      if (mySort == -1) mySort = 4;

      if (g_lastSortType == 1)
      {
        list = list.sort(g_sortFunction[mySort]);
      }
      else
      {
        list = list.sort(g_sortFunction[mySort]).reverse();
      }
    }

    ObjectCount = list.length;

    var g_qsoPages = parseInt(ObjectCount / g_qsoItemsPerPage) + 1;

    g_qsoPage += nextPage;
    g_qsoPage %= g_qsoPages;
    if (g_qsoPage < 0) g_qsoPage = g_qsoPages - 1;

    var startIndex = g_qsoPage * g_qsoItemsPerPage;
    var endIndex = startIndex + g_qsoItemsPerPage;
    if (endIndex > ObjectCount) endIndex = ObjectCount;

    var workHead = "<b> Entries (" + ObjectCount + ")</b>";

    if (g_qsoPages > 1)
    {
      workHead +=
        "<br/><font  style='font-size:15px;' color='cyan' onClick='window.opener.showWorkedBox(" +
        mySort +
        ", -1);'>&#8678;&nbsp;</font>";
      workHead +=
        " Page " +
        (g_qsoPage + 1) +
        " of " +
        g_qsoPages +
        " (" +
        (endIndex - startIndex) +
        ") ";
      workHead +=
        "<font  style='font-size:16px;' color='cyan' onClick='window.opener.showWorkedBox(" +
        mySort +
        ", 1);'>&nbsp;&#8680;</font>";
    }
    setStatsDiv("workedHeadDiv", workHead);

    if (myObjects != null)
    {
      var worker = "";
      worker +=
        "<table  id='logTable' style='white-space:nowrap;overflow:auto;overflow-x;hidden;' class='darkTable' align=center>";
      worker += "<tr>";
      worker +=
        "<th><input type='text' id='searchWB' style='margin:0px' class='inputTextValue' value='" +
        g_searchWB +
        "' size='8' oninput='window.opener.showWorkedSearchChanged(this);' / ></th>";
      worker +=
        "<th><input type='text' id='searchGrid' style='margin:0px' class='inputTextValue' value='" +
        g_gridSearch +
        "' size='6' oninput='window.opener.showWorkedSearchGrid(this);' / ></th>";
      worker += "<th><div id='bandFilterDiv'></div></th>";
      worker += "<th><div id='modeFilterDiv'></div></th>";
      worker += "<th><div id='qslFilterDiv'></div></th>";
      worker += "<th></th>";
      worker += "<th></th>";
      worker += "<th colspan=2><div id='dxccFilterDiv'></div></th>";
      worker += "</tr> ";
      worker +=
        "<tr><th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(0);'>Station</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(1);'>Grid</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(5);'>Band</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(2);'>Mode</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(6);'>QSL</th>";
      worker += "<th align=center>Sent</th>";
      worker += "<th align=center>Rcvd</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(3);'>DXCC</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(3);'>Flag</th>";
      worker +=
        "<th style='cursor:pointer;' align=center onclick='window.opener.showWorkedBox(4);'>When</th>";
      if (g_callsignLookups.lotwUseEnable == true) worker += "<th>LoTW</th>";
      if (g_callsignLookups.eqslUseEnable == true) worker += "<th>eQSL</th>";
      if (g_callsignLookups.oqrsUseEnable == true) worker += "<th>OQRS</th>";
      worker += "</tr>";

      var key = null;
      for (var i = startIndex; i < endIndex; i++)
      {
        key = list[i];
        worker +=
          "<tr  align=left><td  style='color:#ff0;cursor:pointer' onclick='window.opener.startLookup(\"" +
          key.DEcall +
          "\",\"" +
          key.grid +
          "\");' >" +
          key.DEcall.formatCallsign() +
          "</td>";
        worker +=
          "<td style='color:cyan;' >" +
          key.grid +
          (key.vucc_grids.length ? ", " + key.vucc_grids.join(", ") : "") +
          "</td>";
        worker += "<td style='color:lightgreen'>" + key.band + "</td>";
        worker += "<td style='color:lightblue'>" + key.mode + "</td>";
        worker +=
          "<td align=center>" + (key.confirmed ? "&#10004;" : "") + "</td>";
        worker += "<td>" + key.RSTsent + "</td>";
        worker += "<td>" + key.RSTrecv + "</td>";
        worker +=
          "<td style='color:orange'>" +
          g_dxccToAltName[key.dxcc] +
          " <font color='lightgreen'>(" +
          (g_dxccToGeoData[key.dxcc] in g_worldGeoData
            ? g_worldGeoData[g_dxccToGeoData[key.dxcc]].pp
            : "?") +
          ")</font></td>";
        worker +=
          "<td align=center style='margin:0;padding:0' ><img style='padding-top:4px' src='./img/flags/16/" +
          (g_dxccToGeoData[key.dxcc] in g_worldGeoData
            ? g_worldGeoData[g_dxccToGeoData[key.dxcc]].flag
            : "_United Nations.png") +
          "'></td>";
        worker +=
          "<td style='color:lightblue'>" +
          userTimeString(key.time * 1000) +
          "</td>";
        if (g_callsignLookups.lotwUseEnable == true)
        {
          worker +=
            "<td align=center>" +
            (key.DEcall in g_lotwCallsigns ? "&#10004;" : "") +
            "</td>";
        }
        if (g_callsignLookups.eqslUseEnable == true)
        {
          worker +=
            "<td align=center>" +
            (key.DEcall in g_eqslCallsigns ? "&#10004;" : "") +
            "</td>";
        }
        if (g_callsignLookups.oqrsUseEnable == true)
        {
          worker +=
            "<td align=center>" +
            (key.DEcall in g_oqrsCallsigns ? "&#10004;" : "") +
            "</td>";
        }
        worker += "</tr>";
      }

      worker += "</table>";

      setStatsDiv("workedListDiv", worker);

      statsValidateCallByElement("searchWB");
      statsValidateCallByElement("searchGrid");

      var newSelect = document.createElement("select");
      newSelect.id = "bandFilter";
      newSelect.title = "Band Filter";
      var option = document.createElement("option");
      option.value = "Mixed";
      option.text = "Mixed";
      newSelect.appendChild(option);
      Object.keys(bands)
        .sort(function (a, b)
        {
          return parseInt(a) - parseInt(b);
        })
        .forEach(function (key)
        {
          var option = document.createElement("option");
          option.value = key;
          option.text = key;
          newSelect.appendChild(option);
        });
      statsAppendChild(
        "bandFilterDiv",
        newSelect,
        "filterBandFunction",
        g_filterBand,
        true
      );

      newSelect = document.createElement("select");
      newSelect.id = "modeFilter";
      newSelect.title = "Mode Filter";
      option = document.createElement("option");
      option.value = "Mixed";
      option.text = "Mixed";
      newSelect.appendChild(option);

      option = document.createElement("option");
      option.value = "Phone";
      option.text = "Phone";
      newSelect.appendChild(option);

      option = document.createElement("option");
      option.value = "Digital";
      option.text = "Digital";
      newSelect.appendChild(option);

      Object.keys(modes)
        .sort()
        .forEach(function (key)
        {
          var option = document.createElement("option");
          option.value = key;
          option.text = key;
          newSelect.appendChild(option);
        });

      statsAppendChild(
        "modeFilterDiv",
        newSelect,
        "filterModeFunction",
        g_filterMode,
        true
      );

      newSelect = document.createElement("select");
      newSelect.id = "dxccFilter";
      newSelect.title = "DXCC Filter";
      option = document.createElement("option");
      option.value = 0;
      option.text = "All";
      newSelect.appendChild(option);

      Object.keys(dxccs)
        .sort()
        .forEach(function (key)
        {
          var option = document.createElement("option");
          option.value = dxccs[key];
          option.text = key;
          newSelect.appendChild(option);
        });

      statsAppendChild(
        "dxccFilterDiv",
        newSelect,
        "filterDxccFunction",
        g_filterDxcc,
        true
      );

      newSelect = document.createElement("select");
      newSelect.id = "qslFilter";
      newSelect.title = "QSL Filter";
      option = document.createElement("option");
      option.value = "All";
      option.text = "All";
      newSelect.appendChild(option);

      option = document.createElement("option");
      option.value = true;
      option.text = "Yes";
      newSelect.appendChild(option);

      option = document.createElement("option");
      option.value = false;
      option.text = "No";
      newSelect.appendChild(option);

      statsAppendChild(
        "qslFilterDiv",
        newSelect,
        "filterQSLFunction",
        g_filterQSL,
        true
      );

      statsFocus(g_lastSearchSelection);

      setStatsDivHeight("workedListDiv", getStatsWindowHeight() - 6 + "px");
    }
    else setStatsDiv("workedListDiv", "None");

    myObjects = null;
  }
  catch (e)
  {
    console.log(e);
  }
}

function statsValidateCallByElement(elementString)
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window.validateCallByElement !== "undefined"
  )
  {
    g_statsWindowHandle.window.validateCallByElement(elementString);
  }
}
function statsFocus(selection)
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window.statsFocus !== "undefined"
  )
  {
    g_statsWindowHandle.window.statsFocus(selection);
  }
}

function lookupValidateCallByElement(elementString)
{
  if (
    g_lookupWindowHandle != null &&
    typeof g_statsWindowHandle.window.validateCallByElement !== "undefined"
  )
  {
    g_lookupWindowHandle.window.validateCallByElement(elementString);
  }
}
function lookupFocus(selection)
{
  if (
    g_lookupWindowHandle != null &&
    typeof g_statsWindowHandle.window.statsFocus !== "undefined"
  )
  {
    g_lookupWindowHandle.window.statsFocus(selection);
  }
}

function statsAppendChild(elementString, object, onInputString, defaultValue)
{
  if (
    g_statsWindowHandle != null &&
    typeof g_statsWindowHandle.window.appendToChild !== "undefined"
  )
  {
    g_statsWindowHandle.window.appendToChild(
      elementString,
      object,
      onInputString,
      defaultValue
    );
  }
}
function showDXCCsBox()
{
  var worker = getCurrentBandModeHTML();
  var confirmed = 0;
  var worked = 0;
  var needed = 0;
  var List = {};
  var ListConfirmed = {};
  var ListNotWorked = {};
  for (var key in g_worldGeoData)
  {
    if (key != -1)
    {
      if (g_worldGeoData[key].worked == true)
      {
        var item = {};
        item.dxcc = g_worldGeoData[key].dxcc;

        item.flag = g_worldGeoData[key].flag;
        item.confirmed = g_worldGeoData[key].confirmed;
        List[g_worldGeoData[key].name] = item;
        worked++;
      }
      if (g_worldGeoData[key].confirmed == true)
      {
        var item = {};
        item.dxcc = g_worldGeoData[key].dxcc;

        item.flag = g_worldGeoData[key].flag;
        item.confirmed = g_worldGeoData[key].confirmed;
        ListConfirmed[g_worldGeoData[key].name] = item;
        confirmed++;
      }
      if (
        g_worldGeoData[key].worked == false &&
        g_worldGeoData[key].confirmed == false &&
        g_worldGeoData[key].pp != "" &&
        g_worldGeoData[key].geo != "deleted"
      )
      {
        var item = {};
        item.dxcc = g_worldGeoData[key].dxcc;
        item.flag = g_worldGeoData[key].flag;
        item.confirmed = g_worldGeoData[key].confirmed;
        ListNotWorked[g_worldGeoData[key].name] = item;
        needed++;
      }
    }
  }

  if (worked > 0)
  {
    worker +=
      "<div  style='vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(Object.keys(List).length * 23 + 45, getStatsWindowHeight()) +
      "px;'><table class='darkTable' align=center><tr><th colspan=5 style='font-weight:bold'>Worked (" +
      worked +
      ")</th><tr><th align=left>Name</th><th>Flag</th><th align=left>DXCC</th></tr>";
    Object.keys(List)
      .sort()
      .forEach(function (key, i)
      {
        var confirmed = List[key].confirmed
          ? ""
          : "background-clip:content-box;box-shadow: 0 0 8px 3px inset ";
        worker +=
          "<tr><td align=left style='color:#ff0;" +
          confirmed +
          "' >" +
          key +
          "</td>";

        worker +=
          "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" +
          List[key].flag +
          "'></td>";
        worker +=
          "<td align=left style='color:cyan;' >" + List[key].dxcc + "</td>";
      });
    worker += "</table></div>";
  }
  if (confirmed > 0)
  {
    worker +=
      "<div  style='padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(
        Object.keys(ListConfirmed).length * 23 + 45,
        getStatsWindowHeight()
      ) +
      "px;'><table class='darkTable' align=center><tr><th colspan=5 style='font-weight:bold'>Confirmed (" +
      confirmed +
      ")</th><tr><th align=left>Name</th><th>Flag</th><th align=left>DXCC</th></tr>";
    Object.keys(ListConfirmed)
      .sort()
      .forEach(function (key, i)
      {
        worker += "<tr><td align=left style='color:#ff0;' >" + key + "</td>";
        worker +=
          "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" +
          ListConfirmed[key].flag +
          "'></td>";
        worker +=
          "<td align=left style='color:cyan;' >" +
          ListConfirmed[key].dxcc +
          "</td>";
      });
    worker += "</table></div>";
  }
  if (needed > 0)
  {
    worker +=
      "<div  style='vertical-align:top;display:inline-block;overflow:auto;overflow-x:hidden;height:" +
      Math.min(
        Object.keys(ListNotWorked).length * 23 + 45,
        getStatsWindowHeight()
      ) +
      "px;'><table class='darkTable' align=center><tr><th colspan=3 style='font-weight:bold'>Needed (" +
      needed +
      ")</th><tr><th align=left>Name</th><th>Flag</th><th align=left>DXCC</th></tr>";
    Object.keys(ListNotWorked)
      .sort()
      .forEach(function (key, i)
      {
        worker += "<tr><td align=left style='color:#ff0;' >" + key + "</td>";
        worker +=
          "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" +
          ListNotWorked[key].flag +
          "'></td>";
        worker +=
          "<td align=left style='color:cyan;' >" +
          ListNotWorked[key].dxcc +
          "</td>";
      });
    worker += "</table></div>";
  }
  setStatsDiv("dxccListDiv", worker);
}

function showCQzoneBox()
{
  var worker = getCurrentBandModeHTML();

  worker +=
    "<div style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Worked CQ Zones</b><br/>";
  worker += displayItemList(g_cqZones, "#FFFFFF");
  worker += "</div>";

  setStatsDiv("cqzoneListDiv", worker);
}

function showITUzoneBox()
{
  var worker = getCurrentBandModeHTML();

  worker +=
    "<div style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Worked ITU Zones</b><br/>";
  worker += displayItemList(g_ituZones, "#FFFFFF");
  worker += "</div>";

  setStatsDiv("ituzoneListDiv", worker);
}

function showWASWACzoneBox()
{
  var worker = getCurrentBandModeHTML();

  worker +=
    "<div style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Worked All Continents</b><br/>";
  worker += displayItemList(g_wacZones, "#90EE90");
  worker += "</div>";

  worker +=
    "<div style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Worked All States</b><br/>";
  worker += displayItemList(g_wasZones, "#00DDDD");
  worker += "</div>";

  setStatsDiv("waswacListDiv", worker);
}

function displayItemList(table, color)
{
  var worked = 0;
  var needed = 0;
  var confirmed = 0;
  for (var key in table)
  {
    if (table[key].worked == true)
    {
      worked++;
    }
    if (table[key].confirmed == true)
    {
      confirmed++;
    }
    if (table[key].confirmed == false && table[key].worked == false)
    {
      needed++;
    }
  }
  var worker =
    "<div style='color:white;vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;height:" +
    Math.min(
      Object.keys(table).length * 23 + (23 + 45),
      getStatsWindowHeight() - 12
    ) +
    "px;'>";
  worker += "<table class='darkTable' align=center>";
  worker +=
    "<tr><th style='font-weight:bold'>Worked (" + worked + ")</th></tr>";
  worker +=
    "<tr><th style='font-weight:bold'>Confirmed (" + confirmed + ")</th></tr>";
  worker +=
    "<tr><th style='font-weight:bold'>Needed (" + needed + ")</th></tr>";
  worker += "<tr><th align=left>Name</th></tr>";

  var inversionAlpha = "DD";
  var confirmed = "";
  var bold = "text-shadow: 0px 0px 1px black;";
  var unconf = "background-clip:content-box;box-shadow: 0 0 8px 3px inset ";

  Object.keys(table)
    .sort()
    .forEach(function (key, i)
    {
      var style;
      if (table[key].confirmed == true)
      {
        style = "color:" + color + ";" + confirmed;
      }
      else if (table[key].worked == true)
      {
        style = "color:" + color + ";" + unconf;
      }
      else
      {
        // needed
        style = "color:#000000;background-color:" + color + ";" + bold;
      }
      worker +=
        "<tr><td align=left style='" + style + "'>" + key + "</td></tr>";
    });
  worker += "</table></div>";
  return worker;
}

function showWPXBox()
{
  var worker = getCurrentBandModeHTML();
  var band =
    g_appSettings.gtBandFilter == "auto"
      ? myBand
      : g_appSettings.gtBandFilter.length == 0
        ? ""
        : g_appSettings.gtBandFilter;
  var mode =
    g_appSettings.gtModeFilter == "auto"
      ? myMode
      : g_appSettings.gtModeFilter.length == 0
        ? ""
        : g_appSettings.gtModeFilter;

  if (mode == "Digital") mode = "dg";
  if (mode == "Phone") mode = "ph";

  var modifier = String(band) + String(mode);
  var worked = 0;
  var confirmed = 0;
  var List = {};
  var ListConfirmed = {};

  for (var key in g_tracker.worked.px)
  {
    if (
      typeof g_tracker.worked.px[key] == "string" &&
      key + modifier in g_tracker.worked.px
    )
    {
      List[key] = key;
    }
  }

  for (var key in g_tracker.confirmed.px)
  {
    if (
      typeof g_tracker.confirmed.px[key] == "string" &&
      key + modifier in g_tracker.confirmed.px
    )
    {
      ListConfirmed[key] = key;
    }
  }

  worked = Object.keys(List).length;
  confirmed = Object.keys(ListConfirmed).length;

  if (worked > 0)
  {
    worker +=
      "<div  style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Worked Prefixes (<font color='#fff'>" +
      worked +
      "</font>)</b><br/>";
    worker +=
      "<div  style='color:white;vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(worked * 23 + 45, getStatsWindowHeight() - 6) +
      "px;'><table class='darkTable' align=center>";
    Object.keys(List)
      .sort()
      .forEach(function (key, i)
      {
        worker +=
          "<tr><td align=left style='color:#ff0;' >" +
          key.formatCallsign() +
          "</td><td style='color:#0ff;'>" +
          g_QSOhash[g_tracker.worked.px[key]].DEcall.formatCallsign() +
          "</td></tr>";
      });

    worker += "</table></div>";
    worker += "</div>";
  }

  if (confirmed > 0)
  {
    worker +=
      "<div  style='vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;color:cyan;'><b>Confirmed Prefixes (<font color='#fff'>" +
      confirmed +
      "</font>)</b><br/>";
    worker +=
      "<div  style='color:white;vertical-align:top;display:inline-block;margin-right:8px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(confirmed * 23 + 45, getStatsWindowHeight() - 6) +
      "px;'><table class='darkTable' align=center>";
    Object.keys(ListConfirmed)
      .sort()
      .forEach(function (key, i)
      {
        worker +=
          "<tr><td align=left style='color:#ff0;' >" +
          key.formatCallsign() +
          "</td><td style='color:#0ff;'>" +
          g_QSOhash[g_tracker.confirmed.px[key]].DEcall.formatCallsign() +
          "</td></tr>";
      });

    worker += "</table></div>";
    worker += "</div>";
  }

  setStatsDiv("wpxListDiv", worker);
}

function showRootInfoBox()
{
  openStatsWindow();
}

function showSettingsBox()
{
  updateRunningProcesses();
  helpDiv.style.display = "none";
  g_helpShow = false;
  rootSettingsDiv.style.display = "inline-block";
}

function toggleBaWindow(event)
{
  event.preventDefault();

  if (g_baWindowHandle == null)
  {
    openBaWindow(true);
  }
  else
  {
    if (g_baWindowHandle.window.g_isShowing == true)
    {
      openBaWindow(false);
    }
    else
    {
      openBaWindow(true);
    }
  }
}

function openBaWindow(show = true)
{
  if (g_baWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_bandactivity.html",
      {
        show: false,
        id: "GT-baac",
        frame: false,
        resizable: true,
        always_on_top: true
      },
      function (new_win)
      {
        g_baWindowHandle = new_win;
        new_win.on("loaded", function ()
        {
          g_baWindowHandle.setMinimumSize(198, 52);
        });
        new_win.on("close", function ()
        {
          g_baWindowHandle.window.g_isShowing = false;
          g_baWindowHandle.window.saveScreenSettings();
          g_baWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      if (show == true)
      {
        g_baWindowHandle.show();
        g_baWindowHandle.window.g_isShowing = true;
        g_baWindowHandle.window.saveScreenSettings();
      }
      else
      {
        g_baWindowHandle.window.g_isShowing = false;
        g_baWindowHandle.window.saveScreenSettings();
        g_baWindowHandle.hide();
      }
    }
    catch (e) {}
  }
}

function openLookupWindow(show = false)
{
  if (g_lookupWindowHandle == null)
  {
    popupNewWindows();
    var gui = require("nw.gui");
    gui.Window.open(
      "gt_lookup.html",
      {
        show: false,
        id: "GT-lookups",
        icon: "img/lookup-icon.png"
      },
      function (new_win)
      {
        g_lookupWindowHandle = new_win;
        new_win.on("loaded", function ()
        {
          g_lookupWindowHandle.setMinimumSize(680, 200);
          g_lookupWindowHandle.setResizable(true);
        });
        new_win.on("close", function ()
        {
          g_lookupWindowHandle.window.g_isShowing = false;
          g_lookupWindowHandle.window.saveScreenSettings();
          g_lookupWindowHandle.hide();
        });
      }
    );
    lockNewWindows();
  }
  else
  {
    try
    {
      if (show)
      {
        g_lookupWindowHandle.show();
        g_lookupWindowHandle.window.g_isShowing = true;
        g_lookupWindowHandle.window.saveScreenSettings();
      }
      else
      {
        g_lookupWindowHandle.hide();
        g_lookupWindowHandle.window.g_isShowing = false;
        g_lookupWindowHandle.window.saveScreenSettings();
      }
    }
    catch (e) {}
  }
}

function openInfoTab(evt, tabName, callFunc, callObj)
{
  openStatsWindow();

  if (g_statsWindowHandle != null)
  {
    // Declare all variables
    var i, infoTabcontent, infoTablinks;
    // Get all elements with class="infoTabcontent" and hide them
    infoTabcontent = g_statsWindowHandle.window.document.getElementsByClassName(
      "infoTabcontent"
    );
    for (i = 0; i < infoTabcontent.length; i++)
    {
      infoTabcontent[i].style.display = "none";
    }
    // Get all elements with class="infoTablinks" and remove the class "active"
    infoTablinks = g_statsWindowHandle.window.document.getElementsByClassName(
      "infoTablinks"
    );
    for (i = 0; i < infoTablinks.length; i++)
    {
      infoTablinks[i].className = infoTablinks[i].className.replace(
        " active",
        ""
      );
    }
    // Show the current tab, and add an "active" class to the button that opened the tab

    g_statsWindowHandle.window.document.getElementById(tabName).style.display =
      "block";

    if (evt)
    {
      evt = g_statsWindowHandle.window.document.getElementById(evt);
    }
    if (evt)
    {
      if (typeof evt.currentTarget != "undefined")
      { evt.currentTarget.className += " active"; }
      else evt.className += " active";
    }

    if (callFunc)
    {
      if (callObj) callFunc(callObj);
      else callFunc();
    }
  }
}

function openSettingsTab(evt, tabName)
{
  // Declare all variables
  var i, settingsTabcontent, settingsTablinks;
  // Get all elements with class="settingsTabcontent" and hide them
  settingsTabcontent = document.getElementsByClassName("settingsTabcontent");
  for (i = 0; i < settingsTabcontent.length; i++)
  {
    settingsTabcontent[i].style.display = "none";
  }
  // Get all elements with class="settingsTablinks" and remove the class "active"
  settingsTablinks = document.getElementsByClassName("settingsTablinks");
  for (i = 0; i < settingsTablinks.length; i++)
  {
    settingsTablinks[i].className = settingsTablinks[i].className.replace(
      " active",
      ""
    );
  }
  displayAlerts();
  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  if (typeof evt.currentTarget != "undefined")
  { evt.currentTarget.className += " active"; }
  else evt.className += " active";
}

function setGridMode(mode)
{
  g_appSettings.sixWideMode = mode;
  modeImg.src = g_maidenheadModeImageArray[g_appSettings.sixWideMode];
  clearTempGrids();
  redrawGrids();
}

function toggleGridMode()
{
  g_appSettings.sixWideMode ^= 1;
  modeImg.src = g_maidenheadModeImageArray[g_appSettings.sixWideMode];
  clearTempGrids();
  redrawGrids();
}

function newStatObject()
{
  var statObject = {};
  statObject.worked = 0;
  statObject.confirmed = 0;
  statObject.worked_bands = {};
  statObject.confirmed_bands = {};
  statObject.worked_modes = {};
  statObject.confirmed_modes = {};
  statObject.worked_types = {};
  statObject.confirmed_types = {};
  return statObject;
}

function newStatCountObject()
{
  var statCountObject = {};

  statCountObject.worked = 0;
  statCountObject.confirmed = 0;
  statCountObject.worked_bands = {};
  statCountObject.confirmed_bands = {};
  statCountObject.worked_modes = {};
  statCountObject.confirmed_modes = {};
  statCountObject.worked_types = {};
  statCountObject.confirmed_types = {};

  statCountObject.worked_high = 0;
  statCountObject.confirmed_high = 0;
  statCountObject.worked_high_key = null;
  statCountObject.confirmed_high_key = null;

  return statCountObject;
}

function newDistanceObject(start = 0)
{
  var distance = {};
  distance.worked_unit = start;
  distance.worked_hash = "";
  distance.confirmed_unit = start;
  distance.confirmed_hash = null;
  return distance;
}

function newModeType()
{
  var modeType = {};
  modeType.worked = 0;
  modeType.confirmed = 0;

  return modeType;
}

var g_statBoxTimer = null;

function showStatBox(resize)
{
  var count = Object.keys(g_QSOhash).length;

  if (typeof resize != "undefined" && resize)
  {
    setStatsDivHeight("statViewDiv", getStatsWindowHeight() + 29 + "px");
    return;
  }

  if (g_statBoxTimer) clearTimeout(g_statBoxTimer);

  if (count > 0)
  {
    setStatsDiv(
      "statViewDiv",
      "&nbsp;<br/>...Parsing Log Entries...<br/>&nbsp;"
    );
    setStatsDivHeight("statViewDiv", "auto");
    g_statBoxTimer = setTimeout(renderStatsBox, 250);
  }
  else
  {
    setStatsDiv(
      "statViewDiv",
      "&nbsp;<br/>No log entries available, load one or more ADIF logs<br/>&nbsp;"
    );
    setStatsDivHeight("statViewDiv", "auto");
  }
}

function getTypeFromMode(mode)
{
  if (mode in g_modes)
  {
    if (g_modes[mode] == true) return "Digital";
    else if (g_modes_phone[mode] == true) return "Phone";
    else if (mode == "CW") return "CW";
  }
  return "Other";
}

function workObject(obj, count, band, mode, type, didConfirm)
{
  obj.worked++;
  obj.worked_bands[band] = ~~obj.worked_bands[band] + 1;
  obj.worked_modes[mode] = ~~obj.worked_modes[mode] + 1;

  if (!count)
  {
    obj.worked_types.Mixed = ~~obj.worked_modes.Mixed + 1;

    if (type) obj.worked_types[type] = ~~obj.worked_modes[type] + 1;
  }

  if (didConfirm)
  {
    obj.confirmed++;
    obj.confirmed_bands[band] = ~~obj.confirmed_bands[band] + 1;
    obj.confirmed_modes[mode] = ~~obj.confirmed_modes[mode] + 1;

    if (!count)
    {
      obj.confirmed_types.Mixed = ~~obj.confirmed_types.Mixed + 1;
      if (type) obj.confirmed_types[type] = ~~obj.confirmed_types[type] + 1;
    }
  }
  return obj;
}

function renderStatsBox()
{
  var worker = "";
  var scoreSection = "Initial";
  try
  {
    var worldGeoData = {};
    var cqZones = {};
    var ituZones = {};
    var wasZones = {};
    var wacZones = {};
    var countyData = {};
    var gridData = {};
    var wpxData = {};
    var callData = {};
    var gtData = {};

    var long_distance = newDistanceObject();
    var short_distance = newDistanceObject(100000);
    long_distance.band = {};
    long_distance.mode = {};
    long_distance.type = {};
    short_distance.band = {};
    short_distance.mode = {};
    short_distance.type = {};

    var modet = {};
    modet.Mixed = newStatCountObject();
    modet.Digital = newStatCountObject();
    modet.Phone = newStatCountObject();
    modet.CW = newStatCountObject();
    modet.Other = newStatCountObject();

    var details = {};
    details.callsigns = {};

    details.oldest = timeNowSec() + 86400;
    details.newest = 0;

    scoreSection = "QSO";

    for (var i in g_QSOhash)
    {
      var finalGrid = g_QSOhash[i].grid;
      var didConfirm = g_QSOhash[i].confirmed;
      var band = g_QSOhash[i].band;
      var mode = g_QSOhash[i].mode;
      var state = g_QSOhash[i].state;
      var cont = g_QSOhash[i].cont;
      var finalDxcc = g_QSOhash[i].dxcc;
      var cnty = g_QSOhash[i].cnty;
      var ituz = g_QSOhash[i].ituz;
      var cqz = g_QSOhash[i].cqz;
      var wpx = g_QSOhash[i].px;
      var call = g_QSOhash[i].DXcall;
      var who = g_QSOhash[i].DEcall;
      var type = getTypeFromMode(mode);

      if (!(who in callData)) callData[who] = newStatObject();

      workObject(callData[who], false, band, mode, type, didConfirm);

      details.callsigns[call] = ~~details.callsigns[call] + 1;

      if (g_QSOhash[i].time < details.oldest)
      { details.oldest = g_QSOhash[i].time; }
      if (g_QSOhash[i].time > details.newest)
      { details.newest = g_QSOhash[i].time; }

      workObject(modet.Mixed, true, band, mode, type, didConfirm);

      if (mode in g_modes)
      {
        if (g_modes[mode] == true)
        {
          workObject(modet.Digital, true, band, mode, type, didConfirm);
        }
        else if (g_modes_phone[mode] == true)
        {
          workObject(modet.Phone, true, band, mode, type, didConfirm);
        }
        else if (mode == "CW")
        {
          workObject(modet.CW, true, band, mode, type, didConfirm);
        }
        else workObject(modet.Other, true, band, mode, type, didConfirm);
      }
      else workObject(modet.Other, true, band, mode, type, didConfirm);

      if (state != null && isKnownCallsignUS(finalDxcc))
      {
        if (state.substr(0, 2) != "US") state = "US-" + state;

        if (state in g_StateData)
        {
          var name = g_StateData[state].name;

          if (name in g_wasZones)
          {
            if (!(name in wasZones)) wasZones[name] = newStatObject();

            workObject(wasZones[name], false, band, mode, type, didConfirm);
          }
        }
      }

      if (wpx != null)
      {
        if (!(wpx in wpxData)) wpxData[wpx] = newStatObject();

        workObject(wpxData[wpx], false, band, mode, type, didConfirm);
      }

      if (who in g_gtCallsigns)
      {
        if (!(i in gtData)) gtData[i] = newStatObject();

        gtData[i] = true;
      }

      if (cnty != null)
      {
        if (cnty in g_cntyToCounty)
        {
          if (!(cnty in countyData)) countyData[cnty] = newStatObject();

          workObject(countyData[cnty], false, band, mode, type, didConfirm);
        }
      }
      if (cont != null)
      {
        if (cont in g_shapeData)
        {
          var name = g_shapeData[cont].properties.name;
          if (name in g_wacZones)
          {
            if (!(name in wacZones)) wacZones[name] = newStatObject();

            workObject(wacZones[name], false, band, mode, type, didConfirm);
          }
        }
      }

      if (finalGrid.length > 0)
      {
        LL = squareToLatLongAll(finalGrid);
        unit = parseInt(
          MyCircle.distance(
            g_myLat,
            g_myLon,
            LL.la2 - (LL.la2 - LL.la1) / 2,
            LL.lo2 - (LL.lo2 - LL.lo1) / 2,
            distanceUnit.value
          ) * MyCircle.validateRadius(distanceUnit.value)
        );

        if (unit > long_distance.worked_unit)
        {
          long_distance.worked_unit = unit;
          long_distance.worked_hash = i;
        }

        if (!(band in long_distance.band))
        { long_distance.band[band] = newDistanceObject(); }
        if (!(mode in long_distance.mode))
        { long_distance.mode[mode] = newDistanceObject(); }
        if (!(type in long_distance.type))
        { long_distance.type[type] = newDistanceObject(); }

        if (unit > long_distance.mode[mode].worked_unit)
        {
          long_distance.mode[mode].worked_unit = unit;
          long_distance.mode[mode].worked_hash = i;
        }

        if (unit > long_distance.band[band].worked_unit)
        {
          long_distance.band[band].worked_unit = unit;
          long_distance.band[band].worked_hash = i;
        }

        if (unit > long_distance.type[type].worked_unit)
        {
          long_distance.type[type].worked_unit = unit;
          long_distance.type[type].worked_hash = i;
        }

        if (didConfirm)
        {
          if (unit > long_distance.confirmed_unit)
          {
            long_distance.confirmed_unit = unit;
            long_distance.confirmed_hash = i;
          }
          if (unit > long_distance.mode[mode].confirmed_unit)
          {
            long_distance.mode[mode].confirmed_unit = unit;
            long_distance.mode[mode].confirmed_hash = i;
          }
          if (unit > long_distance.band[band].confirmed_unit)
          {
            long_distance.band[band].confirmed_unit = unit;
            long_distance.band[band].confirmed_hash = i;
          }
          if (unit > long_distance.type[type].confirmed_unit)
          {
            long_distance.type[type].confirmed_unit = unit;
            long_distance.type[type].confirmed_hash = i;
          }
        }

        if (unit > 0)
        {
          if (unit < short_distance.worked_unit)
          {
            short_distance.worked_unit = unit;
            short_distance.worked_hash = i;
          }

          if (!(band in short_distance.band))
          { short_distance.band[band] = newDistanceObject(100000); }
          if (!(mode in short_distance.mode))
          { short_distance.mode[mode] = newDistanceObject(100000); }
          if (!(type in short_distance.type))
          { short_distance.type[type] = newDistanceObject(100000); }

          if (unit < short_distance.mode[mode].worked_unit)
          {
            short_distance.mode[mode].worked_unit = unit;
            short_distance.mode[mode].worked_hash = i;
          }
          if (unit < short_distance.band[band].worked_unit)
          {
            short_distance.band[band].worked_unit = unit;
            short_distance.band[band].worked_hash = i;
          }
          if (unit < short_distance.type[type].worked_unit)
          {
            short_distance.type[type].worked_unit = unit;
            short_distance.type[type].worked_hash = i;
          }
          if (didConfirm)
          {
            if (unit < short_distance.confirmed_unit)
            {
              short_distance.confirmed_unit = unit;
              short_distance.confirmed_hash = i;
            }
            if (unit < short_distance.mode[mode].confirmed_unit)
            {
              short_distance.mode[mode].confirmed_unit = unit;
              short_distance.mode[mode].confirmed_hash = i;
            }
            if (unit < short_distance.band[band].confirmed_unit)
            {
              short_distance.band[band].confirmed_unit = unit;
              short_distance.band[band].confirmed_hash = i;
            }
            if (unit < short_distance.type[type].confirmed_unit)
            {
              short_distance.type[type].confirmed_unit = unit;
              short_distance.type[type].confirmed_hash = i;
            }
          }
        }
      }

      if (!(g_dxccToAltName[finalDxcc] in worldGeoData))
      { worldGeoData[g_dxccToAltName[finalDxcc]] = newStatObject(); }

      workObject(
        worldGeoData[g_dxccToAltName[finalDxcc]],
        false,
        band,
        mode,
        type,
        didConfirm
      );

      if (finalGrid.length > 0)
      {
        var gridCheck = finalGrid.substr(0, 4);

        if (cqz.length > 0)
        {
          var name = g_cqZones[cqz].name;
          if (!(name in cqZones)) cqZones[name] = newStatObject();

          workObject(cqZones[name], false, band, mode, type, didConfirm);
        }
        else if (gridCheck in g_gridToCQZone)
        {
          if (g_gridToCQZone[gridCheck].length == 1)
          {
            var name = g_cqZones[g_gridToCQZone[gridCheck][0]].name;
            if (!(name in cqZones)) cqZones[name] = newStatObject();

            workObject(cqZones[name], false, band, mode, type, didConfirm);
          }
        }

        if (ituz.length > 0)
        {
          if (!(ituz in ituZones)) ituZones[ituz] = newStatObject();

          workObject(ituZones[ituz], false, band, mode, type, didConfirm);
        }
        else if (gridCheck in g_gridToITUZone)
        {
          if (g_gridToITUZone[gridCheck].length == 1)
          {
            if (!(g_gridToITUZone[gridCheck][0] in ituZones))
            { ituZones[g_gridToITUZone[gridCheck][0]] = newStatObject(); }

            workObject(
              ituZones[g_gridToITUZone[gridCheck][0]],
              false,
              band,
              mode,
              type,
              didConfirm
            );
          }
        }

        if (!(gridCheck in gridData)) gridData[gridCheck] = newStatObject();

        workObject(gridData[gridCheck], false, band, mode, type, didConfirm);
      }
    }

    scoreSection = "Stats";

    var stats = {};
    var output = {};

    worldGeoData.order = 1;
    stats.DXCC = worldGeoData;
    stats.GRID = gridData;
    stats.CQ = cqZones;
    stats.ITU = ituZones;
    stats.WAC = wacZones;
    stats.WAS = wasZones;
    stats.USC = countyData;
    stats.WPX = wpxData;
    stats.WRFA = callData;

    for (i in stats)
    {
      output[i] = newStatCountObject();

      for (var key in stats[i])
      {
        if (stats[i][key].worked)
        {
          output[i].worked++;
          if (stats[i][key].worked > output[i].worked_high)
          {
            output[i].worked_high = stats[i][key].worked;
            output[i].worked_high_key = key;
          }
        }
        if (stats[i][key].confirmed)
        {
          output[i].confirmed++;
          if (stats[i][key].confirmed > output[i].confirmed_high)
          {
            output[i].confirmed_high = stats[i][key].confirmed;
            output[i].confirmed_high_key = key;
          }
        }

        for (var band in stats[i][key].worked_bands)
        {
          output[i].worked_bands[band] = ~~output[i].worked_bands[band] + 1;
        }

        for (var band in stats[i][key].confirmed_bands)
        {
          output[i].confirmed_bands[band] =
            ~~output[i].confirmed_bands[band] + 1;
        }

        for (var mode in stats[i][key].worked_modes)
        {
          output[i].worked_modes[mode] = ~~output[i].worked_modes[mode] + 1;
        }

        for (var mode in stats[i][key].confirmed_modes)
        {
          output[i].confirmed_modes[mode] =
            ~~output[i].confirmed_modes[mode] + 1;
        }

        for (var type in stats[i][key].worked_types)
        {
          output[i].worked_types[type] = ~~output[i].worked_types[type] + 1;
        }

        for (var type in stats[i][key].confirmed_types)
        {
          output[i].confirmed_types[type] =
            ~~output[i].confirmed_types[type] + 1;
        }
      }

      stats[i] = null;
    }

    scoreSection = "Modes";

    output.MIXED = modet.Mixed;
    output.DIGITAL = modet.Digital;
    output.PHONE = modet.Phone;
    output.CW = modet.CW;
    output.Other = modet.Other;

    for (var i in output)
    {
      output[i].worked_band_count = Object.keys(output[i].worked_bands).length;
      output[i].confirmed_band_count = Object.keys(
        output[i].confirmed_bands
      ).length;
      output[i].worked_mode_count = Object.keys(output[i].worked_modes).length;
      output[i].confirmed_mode_count = Object.keys(
        output[i].confirmed_modes
      ).length;
      output[i].worked_type_count = Object.keys(output[i].worked_types).length;
      output[i].confirmed_type_count = Object.keys(
        output[i].confirmed_types
      ).length;
    }

    var TypeNames = {
      0: ["MIXED", "Mixed", ""],
      1: ["DIGITAL", "Digital", ""],
      2: ["PHONE", "Phone", ""],
      3: ["CW", "CW", ""],
      4: ["Other", "Other", ""]
    };

    var AwardNames = {
      0: ["WRFA", "Callsigns", "WRFA", "yellow"],
      1: ["GRID", "Grids", "GSA", "cyan"],
      2: ["DXCC", "DXCCs", "DXWA", "orange"],
      3: ["CQ", "CQ Zones", "WAZ", "lightgreen"],
      4: ["ITU", "ITU Zones", "ITUz", "#DD44DD"],
      5: ["WAC", "Continents", "WAC", "cyan"],
      6: ["WAS", "US States", "WAS", "lightblue"],
      7: ["USC", "US Counties", "USA-CA", "orange"],
      8: ["WPX", "Prefixes", "WPX", "yellow"]
    };

    worker = "<font color='cyan'>";

    worker += "<h1>Logbook</h1>";

    worker +=
      "<table style='display:inline-table;margin:5px;' class='darkTable'>";

    var ws = "";
    if (Object.keys(details.callsigns).length > 1) ws = "s";
    worker +=
      "<tr><td>Callsign" +
      ws +
      "</td><td style='color:yellow' ><b>" +
      Object.keys(details.callsigns).sort().join(", ") +
      "</b></td></tr>";
    worker +=
      "<tr><td>First Contact</td><td style='color:white' >" +
      userTimeString(details.oldest * 1000) +
      "</td></tr>";
    worker +=
      "<tr><td>Last Contact</td><td style='color:white' >" +
      userTimeString(details.newest * 1000) +
      "</td></tr>";
    worker += "</table>";
    worker += "</br>";
    worker += "<h1>Score Card</h1>";
    worker +=
      "<table style='display:inline-table;margin:5px;' class='darkTable'>";
    worker +=
      "<tr><th>Top Score</th><th style='color:yellow'>Worked</th><th style='color:lightgreen'>Confirmed</th></tr>";

    for (var key in AwardNames)
    {
      scoreSection = "Award " + AwardNames[key][1];
      var infoObject = output[AwardNames[key][0]];
      worker += "<tr><td style='color:white'>" + AwardNames[key][1] + "</td>";
      worker +=
        "<td style='color:" +
        AwardNames[key][3] +
        "'>" +
        infoObject.worked_high_key +
        "<font color='white'> (" +
        infoObject.worked_high +
        ")</font></td>";

      if (infoObject.confirmed_high_key)
      {
        worker +=
          "<td style='color:" +
          AwardNames[key][3] +
          "'>" +
          infoObject.confirmed_high_key +
          "<font color='white'> (" +
          infoObject.confirmed_high +
          ")</font></td>";
      }
      else worker += "<td></td>";

      worker += "</tr>";
    }

    scoreSection = "Long Distance";

    worker += "<tr><td style='color:white'>Long Distance</td>";
    worker +=
      "<td style='color:lightgreen'>" +
      long_distance.worked_unit +
      " " +
      distanceUnit.value.toLowerCase();
    worker +=
      "<font style='color:yellow' > " +
      g_QSOhash[long_distance.worked_hash].DEcall +
      "</font>";
    worker +=
      "<font style='color:orange' > " +
      g_QSOhash[long_distance.worked_hash].grid +
      "</font></td>";

    if (long_distance.confirmed_hash && long_distance.confirmed_unit > 0)
    {
      worker +=
        "<td style='color:lightgreen'>" +
        long_distance.confirmed_unit +
        " " +
        distanceUnit.value.toLowerCase();
      worker +=
        "<font style='color:yellow' > " +
        g_QSOhash[long_distance.confirmed_hash].DEcall +
        "</font>";
      worker +=
        "<font style='color:orange' > " +
        g_QSOhash[long_distance.confirmed_hash].grid +
        "</font></td>";
    }
    else worker += "<td></td>";

    scoreSection = "Short Distance";

    worker += "<tr><td style='color:white' >Short Distance</td>";
    worker +=
      "<td style='color:lightblue'>" +
      short_distance.worked_unit +
      " " +
      distanceUnit.value.toLowerCase();
    worker +=
      "<font style='color:yellow' > " +
      g_QSOhash[short_distance.worked_hash].DEcall +
      "</font>";
    worker +=
      "<font style='color:orange' > " +
      g_QSOhash[short_distance.worked_hash].grid +
      "</font></td>";

    if (short_distance.confirmed_hash && short_distance.confirmed_unit > 0)
    {
      worker +=
        "<td style='color:lightblue'>" +
        short_distance.confirmed_unit +
        " " +
        distanceUnit.value.toLowerCase();
      worker +=
        "<font style='color:yellow' > " +
        g_QSOhash[short_distance.confirmed_hash].DEcall +
        "</font>";
      worker +=
        "<font style='color:orange' > " +
        g_QSOhash[short_distance.confirmed_hash].grid +
        "</font></td>";
    }
    else worker += "<td></td>";

    worker += "</tr>";
    worker += "</table>";
    worker += "</br>";
    worker += "<h1>Award Types</h1>";

    scoreSection = "Award Types";
    for (var key in AwardNames)
    {
      worker += createStatTable(
        AwardNames[key][1],
        output[AwardNames[key][0]],
        AwardNames[key][2]
      );
    }

    worker += "<br/>";

    scoreSection = "Mode Types";

    worker += "<h1>Mode Types</h1>";
    for (var key in TypeNames)
    {
      worker += createStatTable(
        TypeNames[key][1],
        output[TypeNames[key][0]],
        TypeNames[key][2]
      );
    }

    worker += "<br/>";

    worker += "<h1>Distances</h1>";
    scoreSection = "Distances";
    worker += createDistanceTable(long_distance, "Longest Distance");
    worker += createDistanceTable(short_distance, "Shortest Distance");
    worker += "<br/>";

    if (g_appSettings.gtShareEnable == true)
    {
      scoreSection = "GT Users";
      worker += "<h1>Worked GridTracker Stations<br/>Online Now</h1>";
      worker += "</font>";
      worker += "<font color='white'>";
      worker += createGtStationsTable(gtData);
      worker += "<br/>";
      worker += "</font>";
    }
    worker += "</font>";
  }
  catch (e)
  {
    worker +=
      "<br/> In Section: " +
      scoreSection +
      "<br/>Error Generating Stats<br/>Please take a screenshot and send to gridtracker@gmail.com";
  }

  setStatsDiv("statViewDiv", worker);
  setStatsDivHeight("statViewDiv", getStatsWindowHeight() + 29 + "px");
}

function hashNameSort(a, b)
{
  if (g_QSOhash[a].DEcall > g_QSOhash[b].DEcall) return 1;
  if (g_QSOhash[b].DEcall > g_QSOhash[a].DEcall) return -1;
  return 0;
}

function createGtStationsTable(obj)
{
  var worker =
    "<table style='display:inline-table;margin:5px;white-space:nowrap;' class='darkTable'>";
  worker +=
    "<tr align='center'><th>Call</th><th>Grid</th><th>Sent</th><th>Rcvd</th><th>Mode</th><th>Band</th><th>QSL</th><th>Comment</th><th>DXCC</th><th>Time</th></th></tr>";

  var keys = Object.keys(obj).sort(hashNameSort);
  for (var key in keys)
  {
    var callsign = g_QSOhash[keys[key]];
    var bgDX = " style='font-weight:bold;color:cyan;' ";
    var bgDE = " style='font-weight:bold;color:yellow;' ";

    if (typeof callsign.msg == "undefined" || callsign.msg == "")
    { callsign.msg = "-"; }
    var ageString = "";
    if (timeNowSec() - callsign.time < 3601)
    { ageString = (timeNowSec() - callsign.time).toDHMS(); }
    else
    {
      ageString = userTimeString(callsign.time * 1000);
    }
    worker += "<tr><td" + bgDE + ">";
    worker +=
      "<div style='display:inline-table;cursor:pointer' onclick='window.opener.startLookup(\"" +
      callsign.DEcall +
      "\",\"" +
      callsign.grid +
      "\");' >" +
      callsign.DEcall.formatCallsign() +
      "</div>";
    worker += "</td>";
    worker += "<td style='color:orange'>" + callsign.grid + "</td>";
    worker += "<td>" + callsign.RSTsent + "</td>";
    worker += "<td>" + callsign.RSTrecv + "</td>";

    worker +=
      "</td>" +
      "<td style='color:lightblue'>" +
      callsign.mode +
      "</td>" +
      "<td style='color:lightgreen'>" +
      callsign.band +
      "</td>";

    worker +=
      "<td align='center'>" + (callsign.confirmed ? "&#10004;" : "") + "</td>";

    worker +=
      "<td>" +
      callsign.msg +
      "</td><td style='color:yellow'>" +
      g_dxccToAltName[callsign.dxcc] +
      " <font color='lightgreen'>(" +
      g_worldGeoData[g_dxccToGeoData[callsign.dxcc]].pp +
      ")</font></td>" +
      "<td align='center' style='color:lightblue' >" +
      ageString +
      "</td>";
    worker += "</tr>";
  }
  worker += "</table>";
  return worker;
}

function createDistanceTable(obj, name)
{
  var worker =
    "<table style='display:inline-table;margin:5px;' class='darkTable'>";
  worker +=
    "<tr><th colspan = 3 align=left style='font-size:15px;color:cyan;'>" +
    name +
    "</th></tr>";
  worker +=
    "<tr><td></td><td><font  color='yellow'>Worked</font></td><td colspan=2 ><font color='lightgreen'>Confirmed</font></td></tr>";
  worker += "<tr><td align=center><font color='lightgreen'>Bands</font></td>";
  worker += "<td align=left><table class='subtable'>";
  var keys = Object.keys(obj.band).sort(numberSort);
  for (var key in keys)
  {
    var grid = g_QSOhash[obj.band[keys[key]].worked_hash].grid;
    var call = g_QSOhash[obj.band[keys[key]].worked_hash].DEcall;
    worker +=
      "<tr><td align=right>" +
      keys[key] +
      "</td><td style='color:lightgreen' align=left>(" +
      obj.band[keys[key]].worked_unit +
      " " +
      distanceUnit.value.toLowerCase() +
      ")</td>";
    worker +=
      "<td style='color:yellow;cursor:pointer' align=left onclick='window.opener.startLookup(\"" +
      call +
      "\",\"" +
      grid +
      "\");' >" +
      call +
      "</td>";
    worker += "<td style='color:orange' align=left>" + grid + "</td>";
    worker += "</tr>";
  }
  worker += "</table></td>";
  worker += "<td align=left><table class='subtable'>";
  for (var key in keys)
  {
    if (keys[key] in obj.band && obj.band[keys[key]].confirmed_hash)
    {
      var grid = g_QSOhash[obj.band[keys[key]].confirmed_hash].grid;
      var call = g_QSOhash[obj.band[keys[key]].confirmed_hash].DEcall;
      worker +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td style='color:lightgreen' align=left>(" +
        obj.band[keys[key]].confirmed_unit +
        " " +
        distanceUnit.value.toLowerCase() +
        ")</td>";
      worker +=
        "<td style='color:yellow;cursor:pointer' align=left onclick='window.opener.startLookup(\"" +
        call +
        "\",\"" +
        grid +
        "\");'>" +
        call +
        "</td>";
      worker += "<td style='color:orange' align=left>" + grid + "</td>";
      worker += "</tr>";
    }
    else worker += "<tr><td>&nbsp;</td></tr>";
  }

  worker += "</table></td>";
  worker += "</tr>";
  worker += "<tr><td align=center><font color='orange'>Modes</font></td>";
  worker += "<td align=left><table class='subtable'>";
  keys = Object.keys(obj.mode).sort();
  for (var key in keys)
  {
    var grid = g_QSOhash[obj.mode[keys[key]].worked_hash].grid;
    var call = g_QSOhash[obj.mode[keys[key]].worked_hash].DEcall;
    worker +=
      "<tr><td align=right>" +
      keys[key] +
      "</td><td style='color:lightgreen' align=left>(" +
      obj.mode[keys[key]].worked_unit +
      " " +
      distanceUnit.value.toLowerCase() +
      ")</td>";
    worker +=
      "<td style='color:yellow;cursor:pointer' align=left  onclick='window.opener.startLookup(\"" +
      call +
      "\",\"" +
      grid +
      "\");' >" +
      call +
      "</td>";
    worker += "<td style='color:orange' align=left>" + grid + "</td>";
    worker += "</tr>";
  }
  worker += "</table></td>";
  worker += "<td align=left><table class='subtable'>";
  for (var key in keys)
  {
    if (keys[key] in obj.mode && obj.mode[keys[key]].confirmed_hash)
    {
      var grid = g_QSOhash[obj.mode[keys[key]].confirmed_hash].grid;
      var call = g_QSOhash[obj.mode[keys[key]].confirmed_hash].DEcall;
      worker +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td style='color:lightgreen' align=left>(" +
        obj.mode[keys[key]].confirmed_unit +
        " " +
        distanceUnit.value.toLowerCase() +
        ")</td>";
      worker +=
        "<td style='color:yellow;cursor:pointer' align=left onclick='window.opener.startLookup(\"" +
        call +
        "\",\"" +
        grid +
        "\");' >" +
        call +
        "</td>";
      worker += "<td style='color:orange' align=left>" + grid + "</td>";
      worker += "</tr>";
    }
    else worker += "<tr><td>&nbsp;</td></tr>";
  }
  worker += "</table></td>";
  worker += "</tr>";
  worker += "<tr><td align=center><font color='#DD44DD'>Types</font></td>";
  worker += "<td align=left><table class='subtable'>";
  keys = Object.keys(obj.type).sort();
  for (var key in keys)
  {
    var grid = g_QSOhash[obj.type[keys[key]].worked_hash].grid;
    var call = g_QSOhash[obj.type[keys[key]].worked_hash].DEcall;
    worker +=
      "<tr><td align=right>" +
      keys[key] +
      "</td><td style='color:lightgreen' align=left>(" +
      obj.type[keys[key]].worked_unit +
      " " +
      distanceUnit.value.toLowerCase() +
      ")</td>";
    worker +=
      "<td style='color:yellow;cursor:pointer' align=left onclick='window.opener.startLookup(\"" +
      call +
      "\",\"" +
      grid +
      "\");' >" +
      call +
      "</td>";
    worker += "<td style='color:orange' align=left>" + grid + "</td>";
    worker += "</tr>";
  }
  worker += "</table></td>";
  worker += "<td align=left><table class='subtable'>";
  for (var key in keys)
  {
    if (keys[key] in obj.type && obj.type[keys[key]].confirmed_hash)
    {
      var grid = g_QSOhash[obj.type[keys[key]].confirmed_hash].grid;
      var call = g_QSOhash[obj.type[keys[key]].confirmed_hash].DEcall;
      worker +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td style='color:lightgreen' align=left>(" +
        obj.type[keys[key]].confirmed_unit +
        " " +
        distanceUnit.value.toLowerCase() +
        ")</td>";
      worker +=
        "<td style='color:yellow;cursor:pointer' align=left onclick='window.opener.startLookup(\"" +
        call +
        "\",\"" +
        grid +
        "\");' >" +
        call +
        "</td>";
      worker += "<td style='color:orange' align=left>" + grid + "</td>";
      worker += "</tr>";
    }
    else worker += "<tr><td>&nbsp;</td></tr>";
  }
  worker += "</table></td>";
  worker += "</tr>";
  worker += "</table>";
  return worker;
}

function numberSort(a, b)
{
  if (parseInt(a) > parseInt(b)) return 1;
  if (parseInt(b) > parseInt(a)) return -1;
  return 0;
}

function createStatTable(title, infoObject, awardName)
{
  var wc1Table = "";

  if (infoObject.worked)
  {
    wc1Table =
      "<table style='display:inline-table;margin:5px;' class='darkTable'>";
    wc1Table +=
      "<tr><th colspan = 3 align=left style='font-size:15px;color:cyan;'>" +
      title +
      "</th></tr>";
    var award = "<th></th>";

    wc1Table +=
      "<tr>" +
      award +
      "<td><font  color='yellow'>Worked</font> <font color='white'>(" +
      infoObject.worked +
      ")</font></td><td colspan=2 ><font  color='lightgreen'>Confirmed</font> <font color='white'>(" +
      infoObject.confirmed +
      ")</font></td></tr>";

    wc1Table +=
      "<tr><td align=center><font color='lightgreen'>Bands</font></td>";

    wc1Table += "<td align=left><table class='subtable'>";
    var keys = Object.keys(infoObject.worked_bands).sort(numberSort);
    for (var key in keys)
    {
      wc1Table +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.worked_bands[keys[key]] +
        ")</font></td></tr>";
    }

    wc1Table += "</table></td>";
    wc1Table += "<td align=left><table class='subtable'>";

    for (var key in keys)
    {
      if (keys[key] in infoObject.confirmed_bands)
      {
        wc1Table +=
          "<tr><td align=right>" +
          keys[key] +
          "</td><td align=left> <font color='white'>(" +
          infoObject.confirmed_bands[keys[key]] +
          ")</font></td></tr>";
      }
      else wc1Table += "<tr><td>&nbsp;</td></tr>";
    }
    wc1Table += "</table></td>";
    wc1Table += "</tr>";

    wc1Table += "<tr>";
    wc1Table += "<td align=center><font color='orange'>Modes</font></td>";
    wc1Table += "<td align=left><table class='subtable'>";
    keys = Object.keys(infoObject.worked_modes).sort();
    for (var key in keys)
    {
      wc1Table +=
        "<tr><td align=right>" +
        keys[key] +
        "</td><td align=left> <font color='white'>(" +
        infoObject.worked_modes[keys[key]] +
        ")</font></td></tr>";
    }

    wc1Table += "</table></td>";

    wc1Table += "<td align=left><table class='subtable'>";

    for (var key in keys)
    {
      if (keys[key] in infoObject.confirmed_modes)
      {
        wc1Table +=
          "<tr><td align=right>" +
          keys[key] +
          "</td><td align=left> <font color='white'>(" +
          infoObject.confirmed_modes[keys[key]] +
          ")</font></td></tr>";
      }
      else wc1Table += "<tr><td>&nbsp;</td></tr>";
    }

    wc1Table += "</table></td>";
    wc1Table += "</tr>";

    if (infoObject.worked_type_count > 0)
    {
      wc1Table += "<tr>";
      wc1Table += "<td align=center><font color='#DD44DD'>Types</font></td>";
      wc1Table += "<td align=left><table class='subtable'>";
      var keys = Object.keys(infoObject.worked_types).sort();
      for (var key in keys)
      {
        wc1Table +=
          "<tr><td align=right>" +
          keys[key] +
          "</td><td align=left> <font color='white'>(" +
          infoObject.worked_types[keys[key]] +
          ") " +
          "</font></td></tr>";
      }

      wc1Table += "</table></td>";

      wc1Table += "<td align=left><table class='subtable'>";

      for (var key in keys)
      {
        if (keys[key] in infoObject.confirmed_types)
        {
          wc1Table +=
            "<tr><td align=right>" +
            keys[key] +
            "</td><td align=left> <font color='white'>(" +
            infoObject.confirmed_types[keys[key]] +
            ") " +
            "</font></td></tr>";
        }
        else wc1Table += "<tr><td>&nbsp;</td></tr>";
      }

      wc1Table += "</table></td>";
      wc1Table += "</tr>";
    }

    wc1Table += "</table>";
  }

  return wc1Table;
}

function validatePropMode(propMode)
{
  if (g_appSettings.gtPropFilter == "mixed") return true;

  return g_appSettings.gtPropFilter == propMode;
}

function validateMapMode(mode)
{
  if (g_appSettings.gtModeFilter.length == 0) return true;

  if (g_appSettings.gtModeFilter == "auto") return myMode == mode;

  if (g_appSettings.gtModeFilter == "Digital")
  {
    if (mode in g_modes && g_modes[mode]) return true;
    return false;
  }
  if (g_appSettings.gtModeFilter == "Phone")
  {
    if (mode in g_modes_phone && g_modes_phone[mode]) return true;
    return false;
  }

  if (g_appSettings.gtModeFilter == "CW" && mode == "CW") return true;

  return g_appSettings.gtModeFilter == mode;
}

function redrawGrids()
{
  if (g_appSettings.gridViewMode == 2) removePaths();
  clearGrids();
  clearQsoGrids();

  g_QSLcount = 0;
  g_QSOcount = 0;

  for (var i in g_QSOhash)
  {
    var finalGrid = g_QSOhash[i].grid;
    var worked = g_QSOhash[i].worked;
    var didConfirm = g_QSOhash[i].confirmed;
    var band = g_QSOhash[i].band;
    var mode = g_QSOhash[i].mode;
    g_QSOcount++;
    if (didConfirm) g_QSLcount++;

    if (
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto"
          ? myBand == g_QSOhash[i].band
          : g_appSettings.gtBandFilter == g_QSOhash[i].band)) &&
      validateMapMode(g_QSOhash[i].mode) &&
      validatePropMode(g_QSOhash[i].propMode)
    )
    {
      if (g_appSettings.gridViewMode > 1)
      {
        g_QSOhash[i].rect = qthToQsoBox(
          g_QSOhash[i].grid,
          i,
          false,
          false,
          false,
          g_QSOhash[i].DXcall,
          g_QSOhash[i].worked,
          g_QSOhash[i].confirmed,
          g_QSOhash[i].band,
          g_QSOhash[i].wspr
        );
        for (var vucc in g_QSOhash[i].vucc_grids)
        {
          qthToQsoBox(
            g_QSOhash[i].vucc_grids[vucc],
            i,
            false,
            false,
            false,
            g_QSOhash[i].DXcall,
            g_QSOhash[i].worked,
            g_QSOhash[i].confirmed,
            g_QSOhash[i].band,
            g_QSOhash[i].wspr
          );
        }
      }

      var state = g_QSOhash[i].state;
      var cont = g_QSOhash[i].cont;
      var finalDxcc = g_QSOhash[i].dxcc;
      var cnty = g_QSOhash[i].cnty;
      var ituz = g_QSOhash[i].ituz;
      var cqz = g_QSOhash[i].cqz;

      if (state != null && isKnownCallsignUS(finalDxcc))
      {
        if (state.substr(0, 2) != "US") state = "US-" + state;

        if (state in g_StateData)
        {
          var name = g_StateData[state].name;

          if (name in g_wasZones)
          {
            if (g_wasZones[name].worked == false)
            {
              g_wasZones[name].worked = worked;
            }
            if (worked)
            {
              g_wasZones[name].worked_bands[band] =
                ~~g_wasZones[name].worked_bands[band] + 1;
              g_wasZones[name].worked_modes[mode] =
                ~~g_wasZones[name].worked_modes[mode] + 1;
            }
            if (g_wasZones[name].confirmed == false)
            {
              g_wasZones[name].confirmed = didConfirm;
            }
            if (didConfirm)
            {
              g_wasZones[name].confirmed_bands[band] =
                ~~g_wasZones[name].confirmed_bands[band] + 1;
              g_wasZones[name].confirmed_modes[mode] =
                ~~g_wasZones[name].confirmed_modes[mode] + 1;
            }
          }
        }
      }

      if (cnty != null)
      {
        if (cnty in g_cntyToCounty)
        {
          if (g_countyData[cnty].worked == false)
          {
            g_countyData[cnty].worked = worked;
          }
          if (worked)
          {
            g_countyData[cnty].worked_bands[band] =
              ~~g_countyData[cnty].worked_bands[band] + 1;
            g_countyData[cnty].worked_modes[mode] =
              ~~g_countyData[cnty].worked_modes[mode] + 1;
          }
          if (g_countyData[cnty].confirmed == false)
          {
            g_countyData[cnty].confirmed = didConfirm;
          }
          if (didConfirm)
          {
            g_countyData[cnty].confirmed_bands[band] =
              ~~g_countyData[cnty].confirmed_bands[band] + 1;
            g_countyData[cnty].confirmed_modes[mode] =
              ~~g_countyData[cnty].confirmed_modes[mode] + 1;
          }
        }
      }
      if (cont != null)
      {
        if (cont in g_shapeData)
        {
          var name = g_shapeData[cont].properties.name;

          if (name in g_wacZones)
          {
            if (g_wacZones[name].worked == false)
            {
              g_wacZones[name].worked = worked;
            }
            if (worked)
            {
              g_wacZones[name].worked_bands[band] =
                ~~g_wacZones[name].worked_bands[band] + 1;
              g_wacZones[name].worked_modes[mode] =
                ~~g_wacZones[name].worked_modes[mode] + 1;
            }
            if (g_wacZones[name].confirmed == false)
            {
              g_wacZones[name].confirmed = didConfirm;
            }
            if (didConfirm)
            {
              g_wacZones[name].confirmed_bands[band] =
                ~~g_wacZones[name].confirmed_bands[band] + 1;
              g_wacZones[name].confirmed_modes[mode] =
                ~~g_wacZones[name].confirmed_modes[mode] + 1;
            }
          }
        }
      }

      if (g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked == false)
      {
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked = worked;
      }
      if (worked)
      {
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked_bands[band] =
          ~~g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked_bands[band] + 1;
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked_modes[mode] =
          ~~g_worldGeoData[g_dxccToGeoData[finalDxcc]].worked_modes[mode] + 1;
      }
      if (g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed == false)
      {
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed = didConfirm;
      }
      if (didConfirm)
      {
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed_bands[band] =
          ~~g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed_bands[band] +
          1;
        g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed_modes[mode] =
          ~~g_worldGeoData[g_dxccToGeoData[finalDxcc]].confirmed_modes[mode] +
          1;
      }
      if (finalGrid.length > 0)
      {
        var gridCheck = finalGrid.substr(0, 4);

        if (gridCheck in g_us48Data)
        {
          if (g_us48Data[gridCheck].worked == false)
          {
            g_us48Data[gridCheck].worked = worked;
          }
          if (worked)
          {
            g_us48Data[gridCheck].worked_bands[band] =
              ~~g_us48Data[gridCheck].worked_bands[band] + 1;
            g_us48Data[gridCheck].worked_modes[mode] =
              ~~g_us48Data[gridCheck].worked_modes[mode] + 1;
          }
          if (g_us48Data[gridCheck].confirmed == false)
          {
            g_us48Data[gridCheck].confirmed = didConfirm;
          }
          if (didConfirm)
          {
            g_us48Data[gridCheck].confirmed_bands[band] =
              ~~g_us48Data[gridCheck].confirmed_bands[band] + 1;
            g_us48Data[gridCheck].confirmed_modes[mode] =
              ~~g_us48Data[gridCheck].confirmed_modes[mode] + 1;
          }
        }

        if (cqz.length > 0)
        {
          if (g_cqZones[cqz].worked == false)
          {
            g_cqZones[cqz].worked = worked;
          }
          if (worked)
          {
            g_cqZones[cqz].worked_bands[band] =
              ~~g_cqZones[cqz].worked_bands[band] + 1;
            g_cqZones[cqz].worked_modes[mode] =
              ~~g_cqZones[cqz].worked_modes[mode] + 1;
          }
          if (g_cqZones[cqz].confirmed == false)
          {
            g_cqZones[cqz].confirmed = didConfirm;
          }
          if (didConfirm)
          {
            g_cqZones[cqz].confirmed_bands[band] =
              ~~g_cqZones[cqz].confirmed_bands[band] + 1;
            g_cqZones[cqz].confirmed_modes[mode] =
              ~~g_cqZones[cqz].confirmed_modes[mode] + 1;
          }
        }
        else if (gridCheck in g_gridToCQZone)
        {
          if (g_gridToCQZone[gridCheck].length == 1)
          {
            if (g_cqZones[g_gridToCQZone[gridCheck][0]].worked == false)
            {
              g_cqZones[g_gridToCQZone[gridCheck][0]].worked = worked;
            }
            if (worked)
            {
              g_cqZones[g_gridToCQZone[gridCheck][0]].worked_bands[band] =
                ~~g_cqZones[g_gridToCQZone[gridCheck][0]].worked_bands[band] +
                1;
              g_cqZones[g_gridToCQZone[gridCheck][0]].worked_modes[mode] =
                ~~g_cqZones[g_gridToCQZone[gridCheck][0]].worked_modes[mode] +
                1;
            }
            if (g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed == false)
            {
              g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed = didConfirm;
            }
            if (didConfirm)
            {
              g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed_bands[band] =
                ~~g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed_bands[
                  band
                ] + 1;
              g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed_modes[mode] =
                ~~g_cqZones[g_gridToCQZone[gridCheck][0]].confirmed_modes[
                  mode
                ] + 1;
            }
          }
        }

        if (ituz.length > 0)
        {
          if (g_ituZones[ituz].worked == false)
          {
            g_ituZones[ituz].worked = worked;
          }
          if (worked)
          {
            g_ituZones[ituz].worked_bands[band] =
              ~~g_ituZones[ituz].worked_bands[band] + 1;
            g_ituZones[ituz].worked_modes[mode] =
              ~~g_ituZones[ituz].worked_modes[mode] + 1;
          }
          if (g_ituZones[ituz].confirmed == false)
          {
            g_ituZones[ituz].confirmed = didConfirm;
          }
          if (didConfirm)
          {
            g_ituZones[ituz].confirmed_bands[band] =
              ~~g_ituZones[ituz].confirmed_bands[band] + 1;
            g_ituZones[ituz].confirmed_modes[mode] =
              ~~g_ituZones[ituz].confirmed_modes[mode] + 1;
          }
        }
        else if (gridCheck in g_gridToITUZone)
        {
          if (g_gridToITUZone[gridCheck].length == 1)
          {
            if (g_ituZones[g_gridToITUZone[gridCheck][0]].worked == false)
            {
              g_ituZones[g_gridToITUZone[gridCheck][0]].worked = worked;
            }
            if (worked)
            {
              g_ituZones[g_gridToITUZone[gridCheck][0]].worked_bands[band] =
                ~~g_ituZones[g_gridToITUZone[gridCheck][0]].worked_bands[band] +
                1;
              g_ituZones[g_gridToITUZone[gridCheck][0]].worked_modes[mode] =
                ~~g_ituZones[g_gridToITUZone[gridCheck][0]].worked_modes[mode] +
                1;
            }
            if (g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed == false)
            {
              g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed = didConfirm;
            }
            if (didConfirm)
            {
              g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed_bands[band] =
                ~~g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed_bands[
                  band
                ] + 1;
              g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed_modes[mode] =
                ~~g_ituZones[g_gridToITUZone[gridCheck][0]].confirmed_modes[
                  mode
                ] + 1;
            }
          }
        }
      }

      for (var key in g_QSOhash[i].vucc_grids)
      {
        var grid = g_QSOhash[i].vucc_grids[key].substr(0, 4);
        if (grid in g_us48Data)
        {
          if (g_us48Data[grid].worked == false)
          {
            g_us48Data[grid].worked = worked;
          }
          if (worked)
          {
            g_us48Data[grid].worked_bands[band] =
              ~~g_us48Data[grid].worked_bands[band] + 1;
            g_us48Data[grid].worked_modes[mode] =
              ~~g_us48Data[grid].worked_modes[mode] + 1;
          }
          if (g_us48Data[grid].confirmed == false)
          {
            g_us48Data[grid].confirmed = didConfirm;
          }
          if (didConfirm)
          {
            g_us48Data[grid].confirmed_bands[band] =
              ~~g_us48Data[grid].confirmed_bands[band] + 1;
            g_us48Data[grid].confirmed_modes[mode] =
              ~~g_us48Data[grid].confirmed_modes[mode] + 1;
          }
        }
      }
    }
  }

  for (var layer in g_viewInfo)
  {
    var search = window[g_viewInfo[layer][0]];
    var worked = (confirmed = 0);

    if (layer == 0)
    {
      for (var key in search)
      {
        if (search[key].rectangle.worked) worked++;
        if (search[key].rectangle.confirmed) confirmed++;
      }
      g_viewInfo[layer][2] = worked;
      g_viewInfo[layer][3] = confirmed;
    }
    else if (layer == 5)
    {
      for (var key in search)
      {
        if (search[key].geo != "deleted")
        {
          if (search[key].worked) worked++;
          if (search[key].confirmed) confirmed++;
        }
      }
      g_viewInfo[layer][2] = worked;
      g_viewInfo[layer][3] = confirmed;
    }
    else
    {
      for (var key in search)
      {
        if (search[key].worked) worked++;
        if (search[key].confirmed) confirmed++;
      }
      g_viewInfo[layer][2] = worked;
      g_viewInfo[layer][3] = confirmed;
    }
  }

  for (var i in g_liveCallsigns)
  {
    if (
      g_appSettings.gridViewMode != 2 &&
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto"
          ? myBand == g_liveCallsigns[i].band
          : g_appSettings.gtBandFilter == g_liveCallsigns[i].band)) &&
      validateMapMode(g_liveCallsigns[i].mode)
    )
    {
      if (g_appSettings.gridViewMode == 1 || g_appSettings.gridViewMode == 3)
      {
        g_liveCallsigns[i].rect = qthToBox(
          g_liveCallsigns[i].grid,
          g_liveCallsigns[i].DEcall,
          false,
          false,
          false,
          g_liveCallsigns[i].DXcall,
          g_liveCallsigns[i].band,
          g_liveCallsigns[i].wspr,
          i
        );
      }
    }
  }

  reloadInfo(false);
  setHomeGridsquare();
  setTrophyOverlay(g_currentOverlay);
  updateCountStats();
}

function toggleAlertMute()
{
  g_appSettings.alertMute ^= 1;
  alertMuteImg.src = g_alertImageArray[g_appSettings.alertMute];
  if (g_appSettings.alertMute == 1)
  {
    chrome.tts.stop();
  }
}

function togglePushPinMode()
{
  if (g_pushPinMode == false) g_pushPinMode = true;
  else g_pushPinMode = false;
  g_appSettings.pushPinMode = g_pushPinMode;
  pinImg.src = g_pinImageArray[g_pushPinMode == false ? 0 : 1];
  clearTempGrids();
  redrawGrids();
}

function stopAsking(checkbox)
{
  g_appSettings.stopAskingVersion = checkbox.checked;
}

function toggleGtShareEnable()
{
  if (g_appSettings.gtShareEnable == true)
  {
    g_appSettings.gtShareEnable = false;
  }
  else g_appSettings.gtShareEnable = true;

  setGtShareButtons();
}

function setGtShareButtons()
{
  if (
    g_appSettings.gtShareEnable == true &&
    g_mapSettings.offlineMode == false
  )
  {
    if (g_appSettings.gtMsgEnable == true)
    { msgButton.style.display = "inline-block"; }
    else msgButton.style.display = "none";

    gtFlagButton.style.display = "inline-block";
    if (g_appSettings.gtFlagImgSrc > 0)
    {
      g_layerVectors.gtflags.setVisible(true);
    }
    else
    {
      g_layerVectors.gtflags.setVisible(false);
    }
  }
  else
  {
    msgButton.style.display = "none";
    gtFlagButton.style.display = "none";
    g_layerVectors.gtflags.setVisible(false);
    clearGtFlags();
    // Clear list
    g_gtFlagPins = {};
    if (g_chatWindowHandle != null)
    {
      try
      {
        g_chatWindowHandle.hide();
      }
      catch (e) {}
    }
  }

  gtShareFlagImg.src =
    g_gtShareFlagImageArray[g_appSettings.gtShareEnable == false ? 0 : 1];
}

function setMulticastIp()
{
  g_appSettings.wsjtIP = multicastIpInput.value;
}

function setMulticastEnable(checkbox)
{
  if (checkbox.checked == true)
  {
    multicastTD.style.display = "block";
    if (ValidateMulticast(multicastIpInput))
    {
      g_appSettings.wsjtIP = multicastIpInput.value;
    }
    else
    {
      g_appSettings.wsjtIP = "";
    }
  }
  else
  {
    multicastTD.style.display = "none";
    g_appSettings.wsjtIP = "";
  }
  g_appSettings.multicast = checkbox.checked;
}

function setUdpForwardEnable(checkbox)
{
  if (checkbox.checked)
  {
    if (
      ValidatePort(
        udpForwardPortInput,
        null,
        CheckForwardPortIsNotReceivePort
      ) &&
      ValidateIPaddress(udpForwardIpInput, null)
    )
    {
      g_appSettings.wsjtForwardUdpEnable = checkbox.checked;
      return;
    }
  }
  checkbox.checked = false;
  g_appSettings.wsjtForwardUdpEnable = checkbox.checked;
}

function setGTspotEnable(checkbox)
{
  g_appSettings.gtSpotEnable = checkbox.checked;

  g_gtLiveStatusUpdate = true;
}

function setMsgEnable(checkbox)
{
  g_appSettings.gtMsgEnable = checkbox.checked;
  if (g_appSettings.gtShareEnable == true)
  {
    if (g_appSettings.gtMsgEnable == true)
    { msgButton.style.display = "inline-block"; }
    else
    {
      msgButton.style.display = "none";
      if (g_chatWindowHandle != null)
      {
        g_chatWindowHandle.hide();
      }
    }
  }
  g_gtLiveStatusUpdate = true;
  setMsgSettingsView();
}

function newMessageSetting(whichSetting)
{
  if (whichSetting.id in g_msgSettings)
  {
    g_msgSettings[whichSetting.id] = whichSetting.value;
    localStorage.msgSettings = JSON.stringify(g_msgSettings);
    setMsgSettingsView();
  }
}

function checkForNewVersion(showUptoDate)
{
  if (typeof nw != "undefined")
  {
    getBuffer(
      "http://app.gridtracker.org/version.txt?lang=" + g_localeString,
      versionCheck,
      showUptoDate,
      "http",
      80
    );
  }
}

function renderBandActivity()
{
  var buffer = "";
  if (typeof g_bandActivity.lines[myMode] != "undefined")
  {
    var lines = g_bandActivity.lines[myMode];

    var bands = [
      "630m",
      "160m",
      "80m",
      "60m",
      "40m",
      "30m",
      "20m",
      "17m",
      "15m",
      "12m",
      "10m",
      "6m",
      "4m",
      "2m"
    ];
    if (g_myDXCC in g_callsignDatabaseUSplus)
    {
      bands = [
        "630m",
        "160m",
        "80m",
        "60m",
        "40m",
        "30m",
        "20m",
        "17m",
        "15m",
        "12m",
        "10m",
        "6m",
        "2m"
      ];
    }
    var bandData = {};
    var maxValue = 0;
    for (var i = 0; i < bands.length; i++)
    {
      bandData[bands[i]] = {};

      bandData[bands[i]].score = 0;
      bandData[bands[i]].spots = 0;
      bandData[bands[i]].tx = 0;
      bandData[bands[i]].rx = 0;
    }
    for (var x = 0; x < lines.length; x++)
    {
      var firstChar = lines[x].charCodeAt(0);
      if (firstChar != 35 && lines[x].length > 1)
      {
        // doesn't begins with # and has something
        var values = lines[x].trim().split(" ");
        var band = Number(Number(values[0]) / 1000000).formatBand();

        if (band in bandData)
        {
          var place = bandData[band];

          place.score += Number(values[1]);
          place.spots += Number(values[2]);
          place.tx += Number(values[3]);
          place.rx += Number(values[4]);
          if (maxValue < place.score) maxValue = place.score;
          if (maxValue < place.spots) maxValue = place.spots;
        }
      }
    }

    var scaleFactor = 1.0;
    if (maxValue > 26)
    {
      scaleFactor = 26 / maxValue;
    }
    for (var band in bandData)
    {
      var blockMyBand = "";
      if (band == myBand) blockMyBand = " class='myBand' ";

      var title =
        "Score: " +
        bandData[band].score +
        " Spots: " +
        bandData[band].spots +
        "\nTx: " +
        bandData[band].tx +
        "\tRx: " +
        bandData[band].rx;
      buffer +=
        "<div title='" +
        title +
        "' style='display:inline-block;margin:1px;' class='aBand'>";
      buffer +=
        "<div style='height: " +
        (bandData[band].score * scaleFactor + 1) +
        "px;' class='barTx'></div>";
      buffer +=
        "<div style='height: " +
        (bandData[band].spots * scaleFactor + 1) +
        "px;' class='barRx'></div>";
      buffer +=
        "<div style='font-size:10px' " +
        blockMyBand +
        ">" +
        parseInt(band) +
        "</div>";
      buffer += "</div>";
    }
  }
  else
  {
    buffer = "..no data yet..";
  }
  graphDiv.innerHTML = buffer;
  if (g_baWindowHandle)
  {
    g_baWindowHandle.window.graphDiv.innerHTML = buffer;
  }
}

function pskBandActivityCallback(buffer, flag)
{
  var result = String(buffer);
  if (result.indexOf("frequency score") > -1)
  {
    // looks good so far
    g_bandActivity.lines[myMode] = result.split("\n");
    g_bandActivity.lastUpdate[myMode] = g_timeNow + 600;
    localStorage.bandActivity = JSON.stringify(g_bandActivity);
  }

  renderBandActivity();
}

function pskGetBandActivity()
{
  if (g_mapSettings.offlineMode == true) return;
  if (typeof g_bandActivity.lastUpdate[myMode] == "undefined")
  {
    g_bandActivity.lastUpdate[myMode] = 0;
  }

  if (
    myMode.length > 0 &&
    myDEGrid.length > 0 &&
    g_timeNow > g_bandActivity.lastUpdate[myMode]
  )
  {
    getBuffer(
      "https://pskreporter.info/cgi-bin/psk-freq.pl?mode=" +
        myMode +
        "&grid=" +
        myDEGrid.substr(0, 4),
      pskBandActivityCallback,
      null,
      "https",
      443
    );
  }

  renderBandActivity();

  if (g_pskBandActivityTimerHandle != null)
  {
    clearInterval(g_pskBandActivityTimerHandle);
  }

  g_pskBandActivityTimerHandle = setInterval(function ()
  {
    pskGetBandActivity();
  }, 601000); // every 20 minutes, 1 second
}

function getIniFromApp(appName)
{
  var result = Array();
  result.port = -1;
  result.ip = "";
  result.MyCall = "NOCALL";
  result.MyGrid = "";
  result.MyBand = "";
  result.MyMode = "";
  result.IniPath = "";
  result.N1MMServer = "";
  result.N1MMServerPort = 0;
  result.BroadcastToN1MM = false;
  result.appName = appName;
  var wsjtxCfgPath = "";
  var data = String(nw.App.dataPath);
  var end = 0;
  if (g_platform == "windows")
  {
    end = data.indexOf("GridTracker\\User Data\\Default");
    if (end > -1)
    {
      wsjtxCfgPath = data.substr(0, end) + appName + "\\" + appName + ".ini";
    }
  }
  else if (g_platform == "mac")
  {
    wsjtxCfgPath = process.env.HOME + "/Library/Preferences/WSJT-X.ini";
  }
  else
  {
    wsjtxCfgPath = process.env.HOME + "/.config/" + appName + ".ini";
  }
  if (fs.existsSync(wsjtxCfgPath))
  {
    var fileBuf = fs.readFileSync(wsjtxCfgPath, "ascii");
    var fileArray = fileBuf.split("\n");
    for (var key in fileArray) fileArray[key] = fileArray[key].trim();
    result.IniPath = data.substr(0, end) + appName + "\\";
    for (var x = 0; x < fileArray.length; x++)
    {
      var indexOfPort = fileArray[x].indexOf("UDPServerPort=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.port = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("UDPServer=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.ip = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("MyCall=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.MyCall = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("MyGrid=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.MyGrid = portSplit[1].substr(0, 6);
      }
      indexOfPort = fileArray[x].indexOf("Mode=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.MyMode = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("DialFreq=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.MyBand = Number(portSplit[1] / 1000000).formatBand();
      }
      indexOfPort = fileArray[x].indexOf("N1MMServerPort=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.N1MMServerPort = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("N1MMServer=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.N1MMServer = portSplit[1];
      }
      indexOfPort = fileArray[x].indexOf("BroadcastToN1MM=");
      if (indexOfPort == 0)
      {
        var portSplit = fileArray[x].split("=");
        result.BroadcastToN1MM = portSplit[1] == "true";
      }
    }
  }
  return result;
}

function checkRunningProcesses()
{
  var child_process = require("child_process");
  var list =
    g_platform == "windows"
      ? child_process.execFileSync("tasklist.exe")
      : child_process.execFileSync("ps", ["-aef"]);

  g_wsjtxProcessRunning = list.indexOf("wsjtx") > -1;
  g_jtdxProcessRunning = list.indexOf("jtdx") > -1;
}

function updateRunningProcesses()
{
  try
  {
    checkRunningProcesses();
  }
  catch (e)
  {
    g_wsjtxProcessRunning = false;
    g_jtdxProcessRunning = false;
  }
  runningAppsDiv.innerHTML = "WSJT-X ";
  if (g_wsjtxProcessRunning == true) runningAppsDiv.innerHTML += " - up - ";
  else runningAppsDiv.innerHTML += " - ? - ";
  g_wsjtxIni = getIniFromApp("WSJT-X");
  if (g_wsjtxIni.port > -1)
  {
    runningAppsDiv.innerHTML +=
      "<b>(" + g_wsjtxIni.ip + " / " + g_wsjtxIni.port + ")</b> ";
  }
  else runningAppsDiv.innerHTML += "<b>(?)</b> ";
  if (g_platform != "mac")
  {
    runningAppsDiv.innerHTML += " / JTDX ";
    if (g_jtdxProcessRunning == true) runningAppsDiv.innerHTML += " - up - ";
    else runningAppsDiv.innerHTML += " - ? - ";
    g_jtdxIni = getIniFromApp("JTDX");
    if (g_jtdxIni.port > -1)
    {
      runningAppsDiv.innerHTML +=
        "<b>(" + g_jtdxIni.ip + " / " + g_jtdxIni.port + ")</b> ";
    }
    else runningAppsDiv.innerHTML += "<b>(?)</b> ";
  }
}

function updateBasedOnIni()
{
  var which = null;
  var count = 0;
  if (g_wsjtxProcessRunning) count++;
  if (g_jtdxProcessRunning) count++;
  // UdpPortNotSet
  if (g_appSettings.wsjtUdpPort == 0 && count == 1)
  {
    if (g_wsjtxProcessRunning) which = g_wsjtxIni;
    else if (g_jtdxProcessRunning) which = g_jtdxIni;
    if (which != null && which.port > -1)
    {
      g_appSettings.wsjtUdpPort = which.port;
      g_appSettings.wsjtIP = which.ip;
    }
    if (which == null)
    {
      g_appSettings.wsjtUdpPort = 2237;
      g_appSettings.wsjtIP = "";
    }
    if (
      ipToInt(g_appSettings.wsjtIP) >= ipToInt("224.0.0.0") &&
      ipToInt(g_appSettings.wsjtIP) < ipToInt("240.0.0.0")
    )
    {
      g_appSettings.multicast = true;
    }
    else g_appSettings.multicast = false;
  }
  // Which INI do we load?
  if (g_appSettings.wsjtUdpPort)
  {
    which = null;
    if (g_wsjtxIni.port == g_appSettings.wsjtUdpPort) which = g_wsjtxIni;
    else if (g_jtdxIni.port == g_appSettings.wsjtUdpPort) which = g_jtdxIni;
    if (which != null)
    {
      myDEcall = which.MyCall;
      myDEGrid = which.MyGrid;
      g_lastBand = myBand;
      g_lastMode = myMode;
      g_workingIniPath = which.IniPath;
    }
    if (
      which != null &&
      which.BroadcastToN1MM == true &&
      g_N1MMSettings.enable == true
    )
    {
      if (
        which.N1MMServer == g_N1MMSettings.ip &&
        which.N1MMServerPort == g_N1MMSettings.port
      )
      {
        buttonN1MMCheckBox.checked = g_N1MMSettings.enable = false;
        localStorage.N1MMSettings = JSON.stringify(g_N1MMSettings);
        alert(
          which.appName +
            " N1MM Logger+ is enabled with same settings, disabled GridTracker N1MM logger"
        );
      }
    }
    if (which != null)
    {
      if (g_appSettings.wsjtIP == "")
      {
        g_appSettings.wsjtIP = which.ip;
      }
    }
  }
  if (myDEGrid.length > 0) setHomeGridsquare();
  else
  {
    if (typeof nw != "undefined")
    {
      // lets see if we can find our location the hard way
      getBuffer(
        "https://api.ipstack.com/check?access_key=8c9233ec1c09861a707951ab3718a7f6&format=1",
        ipLocation,
        null,
        "https",
        443
      );
    }
  }
}

function CheckReceivePortIsNotForwardPort(value)
{
  if (
    udpForwardIpInput.value == "127.0.0.1" &&
    udpForwardPortInput.value == value &&
    g_appSettings.wsjtIP == "" &&
    udpForwardEnable.checked
  )
  {
    return false;
  }
  return true;
}

function CheckForwardPortIsNotReceivePort(value)
{
  if (
    udpForwardIpInput.value == "127.0.0.1" &&
    udpPortInput.value == value &&
    g_appSettings.wsjtIP == ""
  )
  { return false; }
  return true;
}

function setForwardIp()
{
  g_appSettings.wsjtForwardUdpIp = udpForwardIpInput.value;
  if (ValidatePort(udpPortInput, null, CheckReceivePortIsNotForwardPort))
  {
    setUdpPort();
  }
  ValidatePort(udpForwardPortInput, null, CheckForwardPortIsNotReceivePort);
}

function setForwardPort()
{
  g_appSettings.wsjtForwardUdpPort = udpForwardPortInput.value;
  ValidateIPaddress(udpForwardIpInput, null);
  if (ValidatePort(udpPortInput, null, CheckReceivePortIsNotForwardPort))
  {
    setUdpPort();
  }
}

function validIpKeys(value)
{
  if (value == 46) return true;
  return value >= 48 && value <= 57;
}

function validNumberKeys(value)
{
  return value >= 48 && value <= 57;
}

function validateNumAndLetter(input)
{
  if (/\d/.test(input) && /[A-Z]/.test(input)) return true;
  else return false;
}

function validCallsignsKeys(value)
{
  if (value == 44) return true;
  if (value >= 47 && value <= 57) return true;
  if (value >= 65 && value <= 90) return true;
  return value >= 97 && value <= 122;
}

function ValidateCallsigns(inputText, validDiv)
{
  inputText.value = inputText.value.toUpperCase();
  var callsigns = inputText.value.split(",");
  var passed = false;
  for (var call in callsigns)
  {
    if (callsigns[call].length > 0)
    {
      if (/\d/.test(callsigns[call]) && /[A-Z]/.test(callsigns[call]))
      {
        passed = true;
      }
      else
      {
        passed = false;
        break;
      }
    }
    else
    {
      passed = false;
      break;
    }
  }

  if (passed)
  {
    inputText.style.color = "#FF0";
    inputText.style.backgroundColor = "green";
  }
  else
  {
    inputText.style.color = "#000";
    inputText.style.backgroundColor = "yellow";
  }
  return passed;
}

function ValidateCallsign(inputText, validDiv)
{
  addError.innerHTML = "";
  if (inputText.value.length > 0)
  {
    var passed = false;
    inputText.value = inputText.value.toUpperCase();
    if (/\d/.test(inputText.value) || /[A-Z]/.test(inputText.value))
    {
      passed = true;
    }
    if (passed)
    {
      inputText.style.color = "#FF0";
      inputText.style.backgroundColor = "green";
      if (validDiv) validDiv.innerHTML = "Valid!";
      return true;
    }
    else
    {
      inputText.style.color = "#000";
      inputText.style.backgroundColor = "yellow";
      if (validDiv) validDiv.innerHTML = "Invalid!";
      return false;
    }
  }
  else
  {
    inputText.style.color = "#000";
    inputText.style.backgroundColor = "yellow";
    if (validDiv) validDiv.innerHTML = "Invalid!";
    return false;
  }
}

function ValidateGridsquareOnly4(inputText, validDiv)
{
  addError.innerHTML = "";
  if (inputText.value.length == 4)
  {
    var gridSquare = "";
    var LETTERS = inputText.value.substr(0, 2).toUpperCase();
    var NUMBERS = inputText.value.substr(2, 2).toUpperCase();
    if (/^[A-R]+$/.test(LETTERS) && /^[0-9]+$/.test(NUMBERS))
    {
      gridSquare = LETTERS + NUMBERS;
    }
    if (gridSquare != "")
    {
      inputText.style.color = "#FF0";
      inputText.style.backgroundColor = "green";
      inputText.value = gridSquare;
      if (validDiv) validDiv.innerHTML = "Valid!";
      return true;
    }
    else
    {
      inputText.style.color = "#FFF";
      inputText.style.backgroundColor = "red";
      if (validDiv) validDiv.innerHTML = "Invalid!";
      return false;
    }
  }
  else
  {
    inputText.style.color = "#000";
    inputText.style.backgroundColor = "yellow";
    if (validDiv) validDiv.innerHTML = "Valid!";
    return true;
  }
}

function validateGridFromString(inputText)
{
  if (inputText.length == 4 || inputText.length == 6)
  {
    var gridSquare = "";
    var LETTERS = inputText.substr(0, 2).toUpperCase();
    var NUMBERS = inputText.substr(2, 2).toUpperCase();
    if (/^[A-R]+$/.test(LETTERS) && /^[0-9]+$/.test(NUMBERS))
    {
      gridSquare = LETTERS + NUMBERS;
    }
    if (inputText.length > 4)
    {
      var LETTERS_SUB = inputText.substr(4, 2).toUpperCase();
      gridSquare = "";
      if (
        /^[A-R]+$/.test(LETTERS) &&
        /^[0-9]+$/.test(NUMBERS) &&
        /^[A-Xa-x]+$/.test(LETTERS_SUB)
      )
      {
        gridSquare = LETTERS + NUMBERS + LETTERS_SUB;
      }
    }
    if (gridSquare != "")
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  else
  {
    return false;
  }
}

function ValidateGridsquare(inputText, validDiv)
{
  if (inputText.value.length == 4 || inputText.value.length == 6)
  {
    var gridSquare = "";
    var LETTERS = inputText.value.substr(0, 2).toUpperCase();
    var NUMBERS = inputText.value.substr(2, 2).toUpperCase();
    if (/^[A-R]+$/.test(LETTERS) && /^[0-9]+$/.test(NUMBERS))
    {
      gridSquare = LETTERS + NUMBERS;
    }
    if (inputText.value.length > 4)
    {
      var LETTERS_SUB = inputText.value.substr(4, 2);
      gridSquare = "";
      if (
        /^[A-R]+$/.test(LETTERS) &&
        /^[0-9]+$/.test(NUMBERS) &&
        /^[A-Xa-x]+$/.test(LETTERS_SUB)
      )
      {
        gridSquare = LETTERS + NUMBERS + LETTERS_SUB;
      }
    }
    if (gridSquare != "")
    {
      inputText.style.color = "#FF0";
      inputText.style.backgroundColor = "green";
      inputText.value = gridSquare;
      if (validDiv) validDiv.innerHTML = "Valid!";
      return true;
    }
    else
    {
      inputText.style.color = "#FFF";
      inputText.style.backgroundColor = "red";
      if (validDiv) validDiv.innerHTML = "Invalid!";
      return false;
    }
  }
  else
  {
    inputText.style.color = "#FFF";
    inputText.style.backgroundColor = "red";
    if (validDiv) validDiv.innerHTML = "Invalid!";
    return false;
  }
}

function ipToInt(ip)
{
  return ip
    .split(".")
    .map((octet, index, array) =>
    {
      return parseInt(octet) * Math.pow(256, array.length - index - 1);
    })
    .reduce((prev, curr) =>
    {
      return prev + curr;
    });
}

function ValidateMulticast(inputText)
{
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (inputText.value.match(ipformat))
  {
    if (inputText.value != "0.0.0.0" && inputText.value != "255.255.255.255")
    {
      var ipInt = ipToInt(inputText.value);
      if (ipInt >= ipToInt("224.0.0.0") && ipInt < ipToInt("240.0.0.0"))
      {
        if (ipInt > ipToInt("224.0.0.255"))
        {
          inputText.style.color = "black";
          inputText.style.backgroundColor = "yellow";
        }
        else
        {
          inputText.style.color = "#FF0";
          inputText.style.backgroundColor = "green";
        }
        return true;
      }
      else
      {
        inputText.style.color = "#FFF";
        inputText.style.backgroundColor = "red";
        return false;
      }
    }
    else
    {
      inputText.style.color = "#FFF";
      inputText.style.backgroundColor = "red";
      return false;
    }
  }
  else
  {
    inputText.style.color = "#FFF";
    inputText.style.backgroundColor = "red";
    return false;
  }
}

function ValidateIPaddress(inputText, checkBox)
{
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (inputText.value.match(ipformat))
  {
    if (inputText.value != "0.0.0.0" && inputText.value != "255.255.255.255")
    {
      inputText.style.color = "#FF0";
      inputText.style.backgroundColor = "green";
      return true;
    }
    else
    {
      inputText.style.color = "#FFF";
      inputText.style.backgroundColor = "red";
      if (checkBox) checkBox.checked = false;
      return false;
    }
  }
  else
  {
    inputText.style.color = "#FFF";
    inputText.style.backgroundColor = "red";
    if (checkBox) checkBox.checked = false;
    return false;
  }
}

function ValidatePort(inputText, checkBox, callBackCheck)
{
  var value = Number(inputText.value);
  if (value > 1023 && value < 65536)
  {
    if (callBackCheck && !callBackCheck(value))
    {
      inputText.style.color = "#FFF";
      inputText.style.backgroundColor = "red";
      if (checkBox) checkBox.checked = false;
      return false;
    }
    else
    {
      inputText.style.color = "#FF0";
      inputText.style.backgroundColor = "green";
      return true;
    }
  }
  else
  {
    inputText.style.color = "#FFF";
    inputText.style.backgroundColor = "red";
    if (checkBox) checkBox.checked = false;
    return false;
  }
}

function workingCallsignEnableChanged(ele)
{
  g_appSettings.workingCallsignEnable = ele.checked;
  applyCallsignsAndDateDiv.style.display = "";
}

function workingDateEnableChanged(ele)
{
  g_appSettings.workingDateEnable = ele.checked;
  applyCallsignsAndDateDiv.style.display = "";
}

function workingDateChanged()
{
  var fields = workingDateValue.value.split("-");
  var date = new Date(
    Date.UTC(
      parseInt(fields[0]),
      parseInt(fields[1]) - 1,
      parseInt(fields[2]),
      0,
      0,
      0
    )
  );
  g_appSettings.workingDate =
    Date.UTC(
      parseInt(fields[0]),
      parseInt(fields[1]) - 1,
      parseInt(fields[2]),
      0,
      0,
      0
    ) / 1000;
  displayWorkingDate();
  applyCallsignsAndDateDiv.style.display = "";
}

function displayWorkingDate()
{
  var date = new Date(g_appSettings.workingDate * 1000);
  workingDateString.innerHTML = dateToString(date);
}

var g_tempWorkingCallsigns = {};
function workingCallsignsChanged(ele)
{
  g_tempWorkingCallsigns = {};
  var callsigns = ele.value.split(",");
  for (var call in callsigns)
  {
    g_tempWorkingCallsigns[callsigns[call]] = true;
  }
  if (callsigns.length > 0)
  {
    g_appSettings.workingCallsigns = Object.assign({}, g_tempWorkingCallsigns);
    if (g_appSettings.workingCallsignEnable)
    { applyCallsignsAndDateDiv.style.display = ""; }
  }
  else applyCallsignsAndDateDiv.style.display = "none";
}

function applyCallsignsAndDates()
{
  clearAndLoadQSOs();
  applyCallsignsAndDateDiv.style.display = "none";
}

function selectElementContents(el)
{
  var body = document.body,
    range,
    sel;
  if (document.createRange && window.getSelection)
  {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    range.selectNodeContents(el);
    sel.addRange(range);
    var text = sel.toString();
    text = text.replace(/\t/g, ",");
    sel.removeAllRanges();
    selectNodeDiv.innerText = text;
    range.selectNodeContents(selectNodeDiv);
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    selectNodeDiv.innerText = "";
  }
}

function ipLocation(buffer, flag)
{
  var obj = JSON.parse(buffer);
  if (
    typeof obj != "undefined" &&
    obj != null &&
    typeof obj.latitude != "undefined"
  )
  {
    g_appSettings.centerGridsquare = latLonToGridSquare(
      obj.latitude,
      obj.longitude
    ).substr(0, 6);
    if (g_appSettings.centerGridsquare.length > 0)
    {
      homeQTHInput.value = g_appSettings.centerGridsquare;
      if (ValidateGridsquare(homeQTHInput, null)) setCenterGridsquare();
    }
  }
}

function popupNewWindows()
{
  if (typeof nw != "undefined")
  {
    win.on("new-win-policy", function (frame, url, policy)
    {
      policy.forceNewPopup();
      g_lastUrl = "";
    });
  }
}

var g_lastUrl = "";
function lockNewWindows()
{
  if (typeof nw != "undefined")
  {
    win.on("new-win-policy", function (frame, url, policy)
    {
      if (url != g_lastUrl)
      {
        nw.Shell.openExternal(url);
        g_lastUrl = url;
      }
      policy.ignore();
    });
  }
}

function byName(a, b)
{
  if (g_enums[a] < g_enums[b]) return -1;
  if (g_enums[a] > g_enums[b]) return 1;
  return 0;
}

var ancPrefixes = ["P", "M", "MM", "AM", "A", "NWS"];

function callsignToDxcc(insign)
{
  var callsign = insign;

  if (!/\d/.test(callsign) || !/[a-zA-Z]/.test(callsign))
  {
    return -1;
  }

  if (callsign in g_directCallToDXCC)
  { return Number(g_directCallToDXCC[callsign]); }

  if (callsign.includes("/"))
  {
    var parts = callsign.split("/");
    var end = parts.length - 1;
    if (ancPrefixes.includes(parts[end]))
    {
      parts.pop();
      end = parts.length - 1;
    }
    if (end)
    {
      if (isNaN(parts[end]))
      {
        if (parts[1].length > parts[0].length)
        {
          callsign = parts[0];
        }
        else
        {
          if (callsignToDxcc(parts[1]) != -1) callsign = parts[1];
          else callsign = parts[0];
        }
      }
      else callsign = parts[0];
    }
    else callsign = parts[0];

    if (callsign in g_directCallToDXCC)
    { return Number(g_directCallToDXCC[callsign]); }
  }

  for (var x = callsign.length; x > 0; x--)
  {
    if (callsign.substr(0, x) in g_prefixToMap)
    {
      return Number(g_worldGeoData[g_prefixToMap[callsign.substr(0, x)]].dxcc);
    }
  }
  return -1;
}

function loadMaidenHeadData()
{
  var file = "./data/mh-root-prefixed.json";
  if (fs.existsSync(file))
  {
    var fileBuf = fs.readFileSync(file, "UTF-8");
    g_worldGeoData = JSON.parse(fileBuf);

    for (var key in g_worldGeoData)
    {
      g_worldGeoData[key].geo = "deleted";
      g_worldGeoData[key].worked_bands = {};
      g_worldGeoData[key].confirmed_bands = {};
      g_worldGeoData[key].worked_modes = {};
      g_worldGeoData[key].confirmed_modes = {};
      g_dxccToAltName[g_worldGeoData[key].dxcc] = g_worldGeoData[key].name;
      g_dxccToADIFName[g_worldGeoData[key].dxcc] = g_worldGeoData[key].aname;
      g_dxccToGeoData[g_worldGeoData[key].dxcc] = key;

      for (var x = 0; x < g_worldGeoData[key].prefix.length; x++)
      {
        if (g_worldGeoData[key].prefix[x].charAt(0) == "=")
        {
          g_directCallToDXCC[g_worldGeoData[key].prefix[x].substr(1)] =
            g_worldGeoData[key].dxcc;
        }
        else g_prefixToMap[g_worldGeoData[key].prefix[x]] = key;
      }
      delete g_worldGeoData[key].prefix;
      for (var x = 0; x < g_worldGeoData[key].mh.length; x++)
      {
        if (!(g_worldGeoData[key].mh[x] in g_gridToDXCC))
        { g_gridToDXCC[g_worldGeoData[key].mh[x]] = Array(); }
        g_gridToDXCC[g_worldGeoData[key].mh[x]].push(g_worldGeoData[key].dxcc);
      }

      if (
        g_worldGeoData[key].dxcc != 291 &&
        g_worldGeoData[key].dxcc != 110 &&
        g_worldGeoData[key].dxcc != 6
      )
      { delete g_worldGeoData[key].mh; }
    }

    file = "./data/dxcc.json";

    var files = fs.readFileSync(file);
    var dxccGeo = JSON.parse(files);
    for (var key in dxccGeo.features)
    {
      var dxcc = dxccGeo.features[key].properties.dxcc_entity_code;
      g_worldGeoData[g_dxccToGeoData[dxcc]].geo = dxccGeo.features[key];
    }
    file = "./data/counties.json";
    files = fs.readFileSync(file);
    var countyData = JSON.parse(files);

    for (var id in countyData)
    {
      if (!(countyData[id].properties.st in g_stateToCounty))
      { g_stateToCounty[countyData[id].properties.st] = Array(); }
      g_stateToCounty[countyData[id].properties.st].push(id);

      var cnty =
        countyData[id].properties.st +
        "," +
        countyData[id].properties.n.toUpperCase().replaceAll(" ", "");
      if (!(cnty in g_cntyToCounty))
      { g_cntyToCounty[cnty] = countyData[id].properties.n.toProperCase(); }

      g_countyData[cnty] = {};
      g_countyData[cnty].geo = countyData[id];
      g_countyData[cnty].worked = false;
      g_countyData[cnty].confirmed = false;

      g_countyData[cnty].worked_bands = {};
      g_countyData[cnty].confirmed_bands = {};
      g_countyData[cnty].worked_modes = {};
      g_countyData[cnty].confirmed_modes = {};

      for (var x in countyData[id].properties.z)
      {
        var zipS = String(countyData[id].properties.z[x]);
        if (!(zipS in g_zipToCounty))
        {
          g_zipToCounty[zipS] = Array();
        }
        g_zipToCounty[zipS].push(cnty);
      }
    }
    files = null;
    countyData = null;

    g_shapeData = JSON.parse(fs.readFileSync(g_shapeFile));
    for (var key in g_shapeData)
    {
      if (g_shapeData[key].properties.alias == key)
      { g_shapeData[key].properties.alias = null; }
      else if (
        g_shapeData[key].properties.alias &&
        g_shapeData[key].properties.alias.length > 2 &&
        (g_shapeData[key].properties.alias.indexOf("US") == 0 ||
          g_shapeData[key].properties.alias.indexOf("CA") == 0)
      )
      { g_shapeData[key].properties.alias = null; }
      if (
        g_shapeData[key].properties.alias &&
        g_shapeData[key].properties.alias.length < 2
      )
      { g_shapeData[key].properties.alias = null; }
      if (g_shapeData[key].properties.alias != null)
      {
        if (key.indexOf("CN-") == 0)
        {
          if (g_shapeData[key].properties.alias == key.replace("CN-", ""))
          { g_shapeData[key].properties.alias = null; }
        }
      }
      if (
        g_shapeData[key].properties.alias != null &&
        g_shapeData[key].properties.alias.length != 2
      )
      { g_shapeData[key].properties.alias = null; }
    }

    // finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6
    // Create "US" shape from US Dxcc geos
    var x = g_worldGeoData[g_dxccToGeoData[291]].geo.geometry;
    var y = g_shapeData.AK.geometry;
    var z = g_shapeData.HI.geometry;

    var feature = {
      type: "Feature",
      geometry: {
        type: "GeometryCollection",
        geometries: [x, y, z]
      },
      properties: {
        name: "United States",
        center: g_worldGeoData[g_dxccToGeoData[291]].geo.properties.center,
        postal: "US",
        type: "Country"
      }
    };
    g_shapeData.US = feature;

    y = g_shapeData.OC.geometry;
    z = g_shapeData.AU.geometry;
    q = g_shapeData.AN.geometry;

    feature = {
      type: "Feature",
      geometry: {
        type: "GeometryCollection",
        geometries: [y, z, q]
      },
      properties: {
        name: "Oceania",
        center: [167.97602, -29.037824],
        postal: "OC",
        type: "Continent"
      }
    };
    g_shapeData.OC = feature;
    g_shapeData.AU.properties.type = "Country";

    g_StateData = JSON.parse(fs.readFileSync("./data/state.json"));

    g_StateData["US-AK"] = {};
    g_StateData["US-AK"].postal = "US-AK";
    g_StateData["US-AK"].name = "Alaska";
    g_StateData["US-AK"].mh = g_worldGeoData[5].mh;
    g_StateData["US-AK"].dxcc = 6;

    g_StateData["US-HI"] = {};
    g_StateData["US-HI"].postal = "US-HI";
    g_StateData["US-HI"].name = "Hawaii";
    g_StateData["US-HI"].mh = g_worldGeoData[100].mh;
    g_StateData["US-HI"].dxcc = 110;

    for (var key in g_StateData)
    {
      for (var x = 0; x < g_StateData[key].mh.length; x++)
      {
        if (!(g_StateData[key].mh[x] in g_gridToState))
        { g_gridToState[g_StateData[key].mh[x]] = Array(); }
        g_gridToState[g_StateData[key].mh[x]].push(g_StateData[key].postal);
      }
      g_StateData[key].worked_bands = {};
      g_StateData[key].confirmed_bands = {};
      g_StateData[key].worked_modes = {};
      g_StateData[key].confirmed_modes = {};
    }
    file = "./data/phone.json";
    fileBuf = fs.readFileSync(file, "UTF-8");
    g_phonetics = JSON.parse(fileBuf);
    file = "./data/enums.json";
    fileBuf = fs.readFileSync(file, "UTF-8");
    g_enums = JSON.parse(fileBuf);

    for (var key in g_worldGeoData)
    {
      if (
        g_worldGeoData[key].pp != "" &&
        g_worldGeoData[key].geo != "deleted"
      )
      {
        g_enums[g_worldGeoData[key].dxcc] = g_worldGeoData[key].name;
      }
      if (key == 270)
      {
        // US Mainland
        for (var mh in g_worldGeoData[key].mh)
        {
          var sqr = g_worldGeoData[key].mh[mh];

          g_us48Data[sqr] = {};
          g_us48Data[sqr].name = sqr;
          g_us48Data[sqr].worked = false;
          g_us48Data[sqr].confirmed = false;
          g_us48Data[sqr].worked_bands = {};
          g_us48Data[sqr].confirmed_bands = {};
          g_us48Data[sqr].worked_modes = {};
          g_us48Data[sqr].confirmed_modes = {};
        }
      }
    }

    fileBuf = fs.readFileSync("./data/cqzone.json");
    g_cqZones = JSON.parse(fileBuf);

    for (var key in g_cqZones)
    {
      for (var x = 0; x < g_cqZones[key].mh.length; x++)
      {
        if (!(g_cqZones[key].mh[x] in g_gridToCQZone))
        { g_gridToCQZone[g_cqZones[key].mh[x]] = Array(); }
        g_gridToCQZone[g_cqZones[key].mh[x]].push(String(key));
      }
      delete g_cqZones[key].mh;
    }

    fileBuf = fs.readFileSync("./data/ituzone.json");
    g_ituZones = JSON.parse(fileBuf);

    for (var key in g_ituZones)
    {
      for (var x = 0; x < g_ituZones[key].mh.length; x++)
      {
        if (!(g_ituZones[key].mh[x] in g_gridToITUZone))
        { g_gridToITUZone[g_ituZones[key].mh[x]] = Array(); }
        g_gridToITUZone[g_ituZones[key].mh[x]].push(String(key));
      }
      delete g_ituZones[key].mh;
    }

    for (var key in g_StateData)
    {
      if (key.substr(0, 3) == "US-")
      {
        var shapeKey = key.substr(3, 2);
        var name = g_StateData[key].name;

        if (shapeKey in g_shapeData)
        {
          g_wasZones[name] = {};
          g_wasZones[name].geo = g_shapeData[shapeKey];
          g_wasZones[name].worked = false;
          g_wasZones[name].confirmed = false;

          g_wasZones[name].worked_bands = {};
          g_wasZones[name].confirmed_bands = {};
          g_wasZones[name].worked_modes = {};
          g_wasZones[name].confirmed_modes = {};
        }
      }
    }
    var name = "Alaska";
    var shapeKey = "AK";
    g_wasZones[name] = {};
    g_wasZones[name].geo = g_shapeData[shapeKey];

    g_wasZones[name].worked = false;
    g_wasZones[name].confirmed = false;

    g_wasZones[name].worked_bands = {};
    g_wasZones[name].confirmed_bands = {};
    g_wasZones[name].worked_modes = {};
    g_wasZones[name].confirmed_modes = {};

    name = "Hawaii";
    shapeKey = "HI";
    g_wasZones[name] = {};
    g_wasZones[name].geo = g_shapeData[shapeKey];

    g_wasZones[name].worked = false;
    g_wasZones[name].confirmed = false;

    g_wasZones[name].worked_bands = {};
    g_wasZones[name].confirmed_bands = {};
    g_wasZones[name].worked_modes = {};
    g_wasZones[name].confirmed_modes = {};

    for (var key in g_shapeData)
    {
      if (g_shapeData[key].properties.type == "Continent")
      {
        var name = g_shapeData[key].properties.name;
        g_wacZones[name] = {};
        g_wacZones[name].geo = g_shapeData[key];

        g_wacZones[name].worked = false;
        g_wacZones[name].confirmed = false;

        g_wacZones[name].worked_bands = {};
        g_wacZones[name].confirmed_bands = {};
        g_wacZones[name].worked_modes = {};
        g_wacZones[name].confirmed_modes = {};
      }
    }
  }
}

var g_timezonesEnable = 0;
var g_timezoneLayer = null;

function createZoneLayer()
{
  g_timezoneLayer = createGeoJsonLayer(
    "tz",
    "./data/combined-with-oceans.json",
    "#000088FF",
    0.5
  );
  g_map.addLayer(g_timezoneLayer);
  g_timezoneLayer.setVisible(false);
}

function toggleTimezones()
{
  if (g_currentOverlay != 0) return;

  g_timezonesEnable ^= 1;

  mouseOutGtFlag();

  if (g_timezonesEnable == 1)
  {
    if (g_timezoneLayer == null)
    {
      createZoneLayer();
    }
    g_timezoneLayer.setVisible(true);
  }
  else
  {
    if (g_timezoneLayer != null)
    {
      g_map.removeLayer(g_timezoneLayer);
      g_timezoneLayer = null;
    }
  }
}

function drawAllGrids()
{
  var borderColor = "#000";
  var borderWeight = 0.5;

  for (var x = -178; x < 181; x += 2)
  {
    var fromPoint = ol.proj.fromLonLat([x, -90]);
    var toPoint = ol.proj.fromLonLat([x, 90]);

    var points = [fromPoint, toPoint];

    if (x % 20 == 0) borderWeight = 0.75;
    else borderWeight = 0.25;

    var newGridBox = lineString(points);

    var featureStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: borderColor,
        width: borderWeight
      })
    });
    newGridBox.setStyle(featureStyle);

    g_layerSources["line-grids"].addFeature(newGridBox);
  }

  for (var x = -90; x < 91; x++)
  {
    var fromPoint = ol.proj.fromLonLat([-180, x]);
    var toPoint = ol.proj.fromLonLat([180, x]);

    var points = [fromPoint, toPoint];

    if (x % 10 == 0) borderWeight = 0.75;
    else borderWeight = 0.25;

    var newGridBox = lineString(points);

    var featureStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: borderColor,
        width: borderWeight
      })
    });
    newGridBox.setStyle(featureStyle);

    g_layerSources["line-grids"].addFeature(newGridBox);
  }

  for (var x = 65; x < 83; x++)
  {
    for (var y = 65; y < 83; y++)
    {
      for (var a = 0; a < 10; a++)
      {
        for (var b = 0; b < 10; b++)
        {
          var LL = squareToLatLong(
            String.fromCharCode(x) +
              String.fromCharCode(y) +
              String(a) +
              String(b)
          );
          var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
          var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
          var point = ol.proj.fromLonLat([Lon, Lat]);
          var feature = new ol.Feature({
            geometry: new ol.geom.Point(point),
            name: String(a) + String(b)
          });

          var featureStyle = new ol.style.Style({
            text: new ol.style.Text({
              fill: new ol.style.Fill({ color: "#000" }),
              font: "normal 16px sans-serif",
              stroke: new ol.style.Stroke({
                color: "#88888888",
                width: 1
              }),
              text: String(a) + String(b),
              offsetY: 1
            })
          });
          feature.setStyle(featureStyle);
          g_layerSources["short-grids"].addFeature(feature);

          feature = new ol.Feature({
            geometry: new ol.geom.Point(point),
            name: String(a) + String(b)
          });

          featureStyle = new ol.style.Style({
            text: new ol.style.Text({
              fill: new ol.style.Fill({ color: "#000" }),
              font: "normal 16px sans-serif",
              stroke: new ol.style.Stroke({
                color: "#88888888",
                width: 1
              }),
              text:
                String.fromCharCode(x) +
                String.fromCharCode(y) +
                String(a) +
                String(b),
              offsetY: 1
            })
          });
          feature.setStyle(featureStyle);
          g_layerSources["long-grids"].addFeature(feature);
        }
      }

      var LL = twoWideToLatLong(
        String.fromCharCode(x) + String.fromCharCode(y)
      );
      var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
      var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;
      var point = ol.proj.fromLonLat([Lon, Lat]);
      feature = new ol.Feature(new ol.geom.Point(point));

      featureStyle = new ol.style.Style({
        text: new ol.style.Text({
          fill: new ol.style.Fill({ color: "#000" }),
          font: "normal 24px sans-serif",
          stroke: new ol.style.Stroke({
            color: "#88888888",
            width: 1
          }),
          text: String.fromCharCode(x) + String.fromCharCode(y)
        })
      });
      feature.setStyle(featureStyle);
      g_layerSources["big-grids"].addFeature(feature);
    }
  }
}

function versionCheck(buffer, flag)
{
  var version = String(buffer);
  if (version.indexOf("gridtracker") == 0)
  {
    // good, we're looking at our version string
    var versionArray = version.split(":");
    if (versionArray.length == 3)
    {
      // Good, there are 3 parts
      var stableVersion = Number(versionArray[1]);
      var betaVersion = Number(versionArray[2]);

      if (gtVersion < stableVersion)
      {
        var verString = String(stableVersion);
        main.style.display = "none";
        newVersionMustDownloadDiv.innerHTML =
          "New Version v" +
          verString.substr(0, 1) +
          "." +
          verString.substr(1, 2) +
          "." +
          verString.substr(3) +
          " available for download.<br />Go there now?<br /><br />";
        versionDiv.style.display = "block";
      }
      else
      {
        if (flag)
        {
          if (gtVersion < betaVersion)
          {
            var verString = String(betaVersion);
            main.style.display = "none";
            newVersionMustDownloadDiv.innerHTML =
              "New <b><i>Beta</i></b> Version v" +
              verString.substr(0, 1) +
              "." +
              verString.substr(1, 2) +
              "." +
              verString.substr(3) +
              " available for download.<br />Go there now?<br /><br />";
            versionDiv.style.display = "block";
          }
          else
          {
            main.style.display = "none";
            upToDateDiv.style.display = "block";
          }
        }
      }
    }
  }
}

function onExitAppToGoWebsite()
{
  require("nw.gui").Shell.openExternal("https://gridtracker.org/");
  saveAndCloseApp();
}

function mailThem(address)
{
  require("nw.gui").Shell.openExternal("mailto:" + address);
}

function openSite(address)
{
  require("nw.gui").Shell.openExternal(address);
}

function closeUpdateToDateDiv()
{
  upToDateDiv.style.display = "none";
  main.style.display = "block";
}

function cancelVersion()
{
  main.style.display = "block";
  versionDiv.style.display = "none";
}

function getBuffer(file_url, callback, flag, mode, port, cache = null)
{
  var url = require("url");
  var http = require(mode);
  var fileBuffer = null;
  var options = null;

  options = {
    host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
    port: port,
    followAllRedirects: true,
    path: url.parse(file_url).path // eslint-disable-line node/no-deprecated-api
  };

  http.get(options, function (res)
  {
    var fsize = res.headers["content-length"];
    var cookies = null;
    if (typeof res.headers["set-cookie"] != "undefined")
    { cookies = res.headers["set-cookie"]; }
    res
      .on("data", function (data)
      {
        if (fileBuffer == null) fileBuffer = data;
        else fileBuffer += data;
      })
      .on("end", function ()
      {
        if (typeof callback === "function")
        {
          // Call it, since we have confirmed it is callable
          callback(fileBuffer, flag, cache);
        }
      })
      .on("error", function (e)
      {
        console.error("getBuffer " + file_url + " error: " + e.message);
      });
  });
}

function getPostBuffer(
  file_url,
  callback,
  flag,
  mode,
  port,
  theData,
  timeoutMs,
  timeoutCallback,
  who
)
{
  var querystring = require("querystring");
  var postData = querystring.stringify(theData);
  var url = require("url");
  var http = require(mode);
  var fileBuffer = null;
  var options = {
    host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
    port: port,
    path: url.parse(file_url).path, // eslint-disable-line node/no-deprecated-api
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length
    }
  };
  var req = http.request(options, function (res)
  {
    var fsize = res.headers["content-length"];
    var cookies = null;
    if (typeof res.headers["set-cookie"] != "undefined")
    { cookies = res.headers["set-cookie"]; }
    res
      .on("data", function (data)
      {
        if (fileBuffer == null) fileBuffer = data;
        else fileBuffer += data;
      })
      .on("end", function ()
      {
        if (typeof callback === "function")
        {
          // Call it, since we have confirmed it is callable
          callback(fileBuffer, flag, cookies);
        }
      })
      .on("error", function ()
      {
        if (typeof errorCallback === "function")
        {
          errorCallback();
        }
      });
  });
  if (typeof timeoutMs == "number" && timeoutMs > 0)
  {
    req.on("socket", function (socket)
    {
      socket.setTimeout(timeoutMs);
      socket.on("timeout", function ()
      {
        req.abort();
      });
    });
    req.on("error", function (err) // eslint-disable-line node/handle-callback-err
    {
      if (typeof timeoutCallback != "undefined")
      {
        timeoutCallback(
          file_url,
          callback,
          flag,
          mode,
          port,
          theData,
          timeoutMs,
          timeoutCallback,
          who
        );
      }
    });
  }
  req.write(postData);
  req.end();
}

function colorToHex(color)
{
  if (color.substr(0, 1) === "#")
  {
    return color;
  }
  var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
  var red = parseInt(digits[2]);
  var green = parseInt(digits[3]);
  var blue = parseInt(digits[4]);
  var rgb = ("00" + (+red).toString(16)).substr(-2);
  rgb += ("00" + (+green).toString(16)).substr(-2);
  rgb += ("00" + (+blue).toString(16)).substr(-2);
  return "#" + rgb;
}

function setHueColor()
{
  g_mapHue = colorToHex(hueDiv.style.backgroundColor);
  if (g_mapHue == "#000000") g_mapHue = 0;
}

function loadMapSettings()
{
  shadowValue.value = g_mapSettings.shadow;
  showDarknessTd.innerHTML = parseInt(shadowValue.value * 100) + "%";
  pathWidthTd.innerHTML = pathWidthValue.value = g_appSettings.pathWidthWeight;
  qrzPathWidthTd.innerHTML = qrzPathWidthValue.value =
    g_appSettings.qrzPathWidthWeight;

  gridDecay.value = g_appSettings.gridsquareDecayTime;
  changeGridDecay();

  pathColorValue.value = g_mapSettings.pathColor;
  qrzPathColorValue.value = g_mapSettings.qrzPathColor;
  brightnessValue.value = g_mapSettings.loudness;
  nightBrightnessValue.value = g_mapSettings.nightLoudness;

  nightPathColorValue.value = g_mapSettings.nightPathColor;
  nightQrzPathColorValue.value = g_mapSettings.nightQrzPathColor;

  mouseOverValue.checked = g_mapSettings.mouseOver;
  mergeOverlayValue.checked = g_mapSettings.mergeOverlay;

  offlineImg.src = g_mapImageArray[g_mapSettings.offlineMode ? 0 : 1];

  mapSelect.value = g_mapSettings.mapIndex;
  mapNightSelect.value = g_mapSettings.nightMapIndex;

  animateValue.checked = g_mapSettings.animate;
  animateSpeedValue.value = 21 - g_mapSettings.animateSpeed;
  setAnimateView();
  splitQSLValue.checked = g_mapSettings.splitQSL;
  fitQRZvalue.checked = g_mapSettings.fitQRZ;
  qrzDxccFallbackValue.checked = g_mapSettings.qrzDxccFallback;
  CqHiliteValue.checked = g_mapSettings.CQhilite;

  focusRigValue.checked = g_mapSettings.focusRig;
  haltAllOnTxValue.checked = g_mapSettings.haltAllOnTx;
  strikesAlert.value = g_mapSettings.strikesAlert;

  setStrikesButton();

  trafficDecode.checked = g_mapSettings.trafficDecode;

  pskSpotsImg.style.filter = g_spotsEnabled == 1 ? "" : "grayscale(1);";

  g_bandToColor = JSON.parse(JSON.stringify(g_pskColors));

  setGridOpacity();

  var pathColor =
    pathColorValue.value == 0
      ? "#000"
      : pathColorValue.value == 361
        ? "#FFF"
        : "hsl(" + pathColorValue.value + ", 100%, 50%)";
  if (pathColorValue.value != 0)
  {
    pathColorDiv.style.color = "#000";
    pathColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    pathColorDiv.style.color = "#FFF";
    pathColorDiv.style.backgroundColor = pathColor;
  }

  pathColor =
    qrzPathColorValue.value == 0
      ? "#000"
      : qrzPathColorValue.value == 361
        ? "#FFF"
        : "hsl(" + qrzPathColorValue.value + ", 100%, 50%)";
  if (qrzPathColorValue.value != 0)
  {
    qrzPathColorDiv.style.color = "#000";
    qrzPathColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    qrzPathColorDiv.style.color = "#FFF";
    qrzPathColorDiv.style.backgroundColor = pathColor;
  }

  setNightHtml();

  displayLegend();
}

function changeDistanceUnit()
{
  g_appSettings.distanceUnit = distanceUnit.value;
  g_scaleLine.setUnits(g_scaleUnits[g_appSettings.distanceUnit]);
  goProcessRoster();
}

function changeMapNightValues()
{
  g_mapSettings.nightPathColor = nightPathColorValue.value;
  g_mapSettings.nightQrzPathColor = nightQrzPathColorValue.value;
  g_mapSettings.nightMapIndex = mapNightSelect.value;
  g_mapSettings.nightLoudness = nightBrightnessValue.value;
  saveMapSettings();

  setNightHtml();
  changeMapLayer();
}

function setNightHtml()
{
  var pathColor =
    g_mapSettings.nightPathColor == 0
      ? "#000"
      : g_mapSettings.nightPathColor == 361
        ? "#FFF"
        : "hsl(" + g_mapSettings.nightPathColor + ", 100%, 50%)";

  if (g_mapSettings.nightPathColor != 0)
  {
    pathNightColorDiv.style.color = "#000";
    pathNightColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    pathNightColorDiv.style.color = "#FFF";
    pathNightColorDiv.style.backgroundColor = pathColor;
  }

  pathColor =
    g_mapSettings.nightQrzPathColor == 0
      ? "#000"
      : g_mapSettings.nightQrzPathColor == 361
        ? "#FFF"
        : "hsl(" + g_mapSettings.nightQrzPathColor + ", 100%, 50%)";
  if (g_mapSettings.nightQrzPathColor != 0)
  {
    pathNightQrzColorDiv.style.color = "#000";
    pathNightQrzColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    pathNightQrzColorDiv.style.color = "#FFF";
    pathNightQrzColorDiv.style.backgroundColor = pathColor;
  }
}

function changeMapValues()
{
  g_mapSettings.pathColor = pathColorValue.value;
  g_mapSettings.qrzPathColor = qrzPathColorValue.value;
  g_mapSettings.loudness = brightnessValue.value;

  g_mapSettings.mapIndex = mapSelect.value;
  if (
    g_appSettings.gtFlagImgSrc > 0 &&
    g_mapSettings.offlineMode == false &&
    g_appSettings.gtShareEnable == true
  )
  { g_layerVectors.gtflags.setVisible(true); }
  else g_layerVectors.gtflags.setVisible(false);

  saveMapSettings();

  saveAlertSettings();

  var pathColor =
    g_mapSettings.pathColor == 0
      ? "#000"
      : g_mapSettings.pathColor == 361
        ? "#FFF"
        : "hsl(" + g_mapSettings.pathColor + ", 100%, 50%)";

  if (g_mapSettings.pathColor != 0)
  {
    pathColorDiv.style.color = "#000";
    pathColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    pathColorDiv.style.color = "#FFF";
    pathColorDiv.style.backgroundColor = pathColor;
  }

  pathColor =
    g_mapSettings.qrzPathColor == 0
      ? "#000"
      : g_mapSettings.qrzPathColor == 361
        ? "#FFF"
        : "hsl(" + g_mapSettings.qrzPathColor + ", 100%, 50%)";
  if (g_mapSettings.qrzPathColor != 0)
  {
    qrzPathColorDiv.style.color = "#000";
    qrzPathColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    qrzPathColorDiv.style.color = "#FFF";
    qrzPathColorDiv.style.backgroundColor = pathColor;
  }

  changeMapLayer();
  displayLegend();
}

function toggleLegend()
{
  if (g_mapSettings.legend == true) g_mapSettings.legend = false;
  else g_mapSettings.legend = true;

  saveMapSettings();

  displayLegend();
}

function hideLegend()
{
  LegendDiv.style.display = "none";
}

function displayLegend()
{
  if (g_mapSettings.legend == true)
  {
    LegendDiv.style.display = "block";
    legendImg.style.webkitFilter = "";
  }
  else
  {
    LegendDiv.style.display = "none";
    legendImg.style.webkitFilter = "grayscale(1) brightness(50%)";
  }
}

function rgbToHex(R, G, B)
{
  return toHex(R) + toHex(G) + toHex(B);
}

function toHex(n)
{
  n = parseInt(n, 10);
  if (isNaN(n)) return "00";
  n = Math.max(0, Math.min(n, 255));
  return (
    "0123456789ABCDEF".charAt((n - (n % 16)) / 16) +
    "0123456789ABCDEF".charAt(n % 16)
  );
}

function hexToR(h)
{
  return parseInt(cutHex(h).substring(0, 2), 16);
}

function hexToG(h)
{
  return parseInt(cutHex(h).substring(2, 4), 16);
}

function hexToB(h)
{
  return parseInt(cutHex(h).substring(4, 6), 16);
}

function hexToA(h)
{
  return parseInt(cutHex(h).substring(6, 8), 16);
}

function cutHex(h)
{
  return h.charAt(0) == "#" ? h.substring(1, 9) : h;
}

function changeMapLayer()
{
  if (g_mapSettings.offlineMode)
  {
    g_tileLayer.setSource(g_offlineLayer);
    g_tileLayer.setOpacity(Number(g_mapSettings.loudness));
  }
  else
  {
    if (g_mapSettings.nightMapEnable && g_nightTime)
    {
      g_tileLayer.setSource(g_mapsLayer[g_mapSettings.nightMapIndex]);
      g_tileLayer.setOpacity(Number(g_mapSettings.nightLoudness));
    }
    else
    {
      g_tileLayer.setSource(g_mapsLayer[g_mapSettings.mapIndex]);
      g_tileLayer.setOpacity(Number(g_mapSettings.loudness));
    }
  }

  changePathWidth();
  redrawSpots();
}

function voiceChangedValue()
{
  g_speechSettings.voice = Number(alertVoiceInput.value) + 1;
  changeSpeechValues();
}

function timedGetVoices()
{
  g_voices = window.speechSynthesis.getVoices();
  if (g_voices.length > 0)
  {
    var newSelect = document.createElement("select");
    newSelect.id = "alertVoiceInput";
    newSelect.title = "Select Voice";
    for (var i = 0; i < g_voices.length; i++)
    {
      var option = document.createElement("option");
      option.value = i;
      newstring = g_voices[i].name.replace(/ /g, "");
      option.text = newstring;
      if (g_voices[i].default)
      {
        option.selected = true;
      }
      newSelect.appendChild(option);
    }
    newSelect.oninput = voiceChangedValue;
    voicesDiv.appendChild(newSelect);
  }
  g_speechAvailable = true;
  loadAlerts();
}

function initSpeech()
{
  window.speechSynthesis.onvoiceschanged = function ()
  {
    setTimeout(timedGetVoices, 500);
  };
  var msg = new SpeechSynthesisUtterance(".");
  msg.lang = g_localeString;
  window.speechSynthesis.speak(msg);
}

function initSoundCards()
{
  navigator.mediaDevices
    .enumerateDevices()
    .then(gotAudioDevices)
    .catch(errorCallback);
}

function errorCallback(e) {}
function gotAudioDevices(deviceInfos)
{
  soundCardDiv.innerHTML = "";
  var newSelect = document.createElement("select");
  newSelect.id = "soundCardInput";
  newSelect.title = "Select Sound Card";

  for (var i = 0; i !== deviceInfos.length; ++i)
  {
    var deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === "audiooutput")
    {
      var option = document.createElement("option");
      option.value = deviceInfo.deviceId;
      option.text = deviceInfo.label || "Speaker " + (newSelect.length + 1);
      newSelect.appendChild(option);
    }
  }
  newSelect.oninput = soundCardChangedValue;
  soundCardDiv.appendChild(newSelect);

  soundCardInput.value = g_soundCard;
}

function soundCardChangedValue()
{
  g_appSettings.soundCard = g_soundCard = soundCardInput.value;
  playTestFile();
}

function setPins()
{
  g_colorLeafletPins = {};
  g_colorLeafleteQPins = {};
  g_colorLeafletQPins.worked = {};
  g_colorLeafletQPins.confirmed = {};
  for (var i = 0; i < g_colorBands.length; i++)
  {
    var pin = new ol.style.Icon({
      src: "./img/pin/" + g_colorBands[i] + ".png",
      anchorYUnits: "pixels",
      anchorXUnits: "pixels",
      anchor: [5, 18]
    });
    g_colorLeafletPins[g_colorBands[i]] = pin;
    pin = new ol.style.Icon({
      src: "./img/pin/" + g_colorBands[i] + "w.png",
      anchorYUnits: "pixels",
      anchorXUnits: "pixels",
      anchor: [5, 18]
    });
    g_colorLeafletQPins.worked[g_colorBands[i]] = pin;
    pin = new ol.style.Icon({
      src: "./img/pin/" + g_colorBands[i] + "q.png",
      anchorYUnits: "pixels",
      anchorXUnits: "pixels",
      anchor: [5, 18]
    });
    g_colorLeafletQPins.confirmed[g_colorBands[i]] = pin;
  }
}

function loadViewSettings()
{
  gtBandFilter.value = g_appSettings.gtBandFilter;
  gtModeFilter.value = g_appSettings.gtModeFilter;
  gtPropFilter.value = g_appSettings.gtPropFilter;
  distanceUnit.value = g_appSettings.distanceUnit;
  N1MMIpInput.value = g_N1MMSettings.ip;
  N1MMPortInput.value = g_N1MMSettings.port;
  buttonN1MMCheckBox.checked = g_N1MMSettings.enable;
  ValidatePort(N1MMPortInput, buttonN1MMCheckBox, null);
  ValidateIPaddress(N1MMIpInput, buttonN1MMCheckBox, null);

  log4OMIpInput.value = g_log4OMSettings.ip;
  log4OMPortInput.value = g_log4OMSettings.port;
  buttonLog4OMCheckBox.checked = g_log4OMSettings.enable;
  ValidatePort(log4OMPortInput, buttonLog4OMCheckBox, null);
  ValidateIPaddress(log4OMIpInput, buttonLog4OMCheckBox, null);

  acLogIpInput.value = g_acLogSettings.ip;
  acLogPortInput.value = g_acLogSettings.port;
  buttonacLogCheckBox.checked = g_acLogSettings.enable;
  ValidatePort(acLogPortInput, buttonacLogCheckBox, null);
  ValidateIPaddress(acLogIpInput, buttonacLogCheckBox, null);

  dxkLogIpInput.value = g_dxkLogSettings.ip;
  dxkLogPortInput.value = g_dxkLogSettings.port;
  buttondxkLogCheckBox.checked = g_dxkLogSettings.enable;
  ValidatePort(dxkLogPortInput, buttondxkLogCheckBox, null);
  ValidateIPaddress(dxkLogIpInput, buttondxkLogCheckBox, null);

  hrdLogbookIpInput.value = g_HRDLogbookLogSettings.ip;
  hrdLogbookPortInput.value = g_HRDLogbookLogSettings.port;
  buttonHrdLogbookCheckBox.checked = g_HRDLogbookLogSettings.enable;
  ValidatePort(hrdLogbookPortInput, buttonHrdLogbookCheckBox, null);
  ValidateIPaddress(hrdLogbookIpInput, buttonHrdLogbookCheckBox, null);

  spotHistoryTimeValue.value = parseInt(
    g_receptionSettings.viewHistoryTimeSec / 60
  );
  spotHistoryTimeTd.innerHTML =
    "Max Age: " + Number(g_receptionSettings.viewHistoryTimeSec).toDHM();

  spotPathsValue.checked = g_receptionSettings.viewPaths;
  spotPathColorValue.value = g_receptionSettings.pathColor;
  spotNightPathColorValue.value = g_receptionSettings.pathNightColor;
  spotWidthTd.innerHTML = spotWidthValue.value = g_receptionSettings.spotWidth;

  spotMergeValue.checked = g_receptionSettings.mergeSpots;

  lookupOnTx.checked = g_appSettings.lookupOnTx;
  lookupCloseLog.checked = g_appSettings.lookupCloseLog;
  lookupMerge.checked = g_appSettings.lookupMerge;
  lookupMissingGrid.checked = g_appSettings.lookupMissingGrid;

  if (g_appSettings.lookupMerge == true)
  {
    lookupMissingGridDiv.style.display = "inline-block";
  }
  else
  {
    lookupMissingGridDiv.style.display = "none";
  }

  if (g_receptionSettings.viewPaths)
  {
    spotPathWidthDiv.style.display = "inline-block";
  }
  else
  {
    spotPathWidthDiv.style.display = "none";
  }

  spotPathChange();
  setRosterTimeView();
}

function loadMsgSettings()
{
  msgEnable.checked = g_appSettings.gtMsgEnable;
  GTspotEnable.checked = g_appSettings.gtSpotEnable;

  pskSpotsImg.style.filter = g_spotsEnabled == 1 ? "" : "grayscale(1)";

  for (var key in g_msgSettings)
  {
    document.getElementById(key).value = g_msgSettings[key];
  }
  ValidateText(msgAwayText);
  setMsgSettingsView();
}

function setMsgSettingsView()
{
  if (msgEnable.checked) msgSettingsDiv.style.display = "inline-block";
  else msgSettingsDiv.style.display = "none";

  if (g_msgSettings.msgAlertSelect > 0)
  {
    msgFrequencySelectDiv.style.display = "inline-block";
    if (g_msgSettings.msgAlertSelect == 1)
    {
      msgAlertWord.style.display = "inline-block";
      msgAlertMedia.style.display = "none";
      ValidateText(msgAlertWord);
    }
    if (g_msgSettings.msgAlertSelect == 2)
    {
      msgAlertWord.style.display = "none";
      msgAlertMedia.style.display = "inline-block";
    }
  }
  else
  {
    msgFrequencySelectDiv.style.display = "none";
    msgAlertWord.style.display = "none";
    msgAlertMedia.style.display = "none";
  }

  if (g_msgSettings.msgAwaySelect > 0)
  { msgAwayTextDiv.style.display = "inline-block"; }
  else msgAwayTextDiv.style.display = "none";
}

function loadAdifSettings()
{
  workingCallsignEnable.checked = g_appSettings.workingCallsignEnable;
  workingCallsignsValue.value = Object.keys(
    g_appSettings.workingCallsigns
  ).join(",");

  ValidateCallsigns(workingCallsignsValue);

  workingDateEnable.checked = g_appSettings.workingDateEnable;
  displayWorkingDate();

  if (g_platform == "mac")
  {
    selectTQSLButton.style.display = "none";
  }

  for (var key in g_adifLogSettings.menu)
  {
    var value = g_adifLogSettings.menu[key];
    var where = key + "Div";
    if (document.getElementById(key) != null)
    {
      document.getElementById(key).checked = value;
      if (value == true)
      {
        document.getElementById(where).style.display = "inline-block";
      }
      else
      {
        document.getElementById(where).style.display = "none";
      }
    }
  }
  for (var key in g_adifLogSettings.startup)
  {
    if (document.getElementById(key) != null)
    { document.getElementById(key).checked = g_adifLogSettings.startup[key]; }
  }
  for (var key in g_adifLogSettings.nickname)
  {
    if (document.getElementById(key) != null)
    {
      document.getElementById(key).checked = g_adifLogSettings.nickname[key];
      if (key == "nicknameeQSLCheckBox")
      {
        if (document.getElementById(key).checked == true)
        {
          eQSLNickname.style.display = "inline-block";
        }
        else
        {
          eQSLNickname.style.display = "none";
        }
      }
    }
  }
  for (var key in g_adifLogSettings.text)
  {
    if (document.getElementById(key) != null)
    {
      document.getElementById(key).value = g_adifLogSettings.text[key];
      ValidateText(document.getElementById(key));
    }
  }
  for (var key in g_adifLogSettings.qsolog)
  {
    if (document.getElementById(key) != null)
    {
      document.getElementById(key).checked = g_adifLogSettings.qsolog[key];
      if (key == "logLOTWqsoCheckBox")
      {
        if (document.getElementById(key).checked == true)
        {
          lotwUpload.style.display = "inline-block";
          trustedTestButton.style.display = "inline-block";
        }
        else
        {
          lotwUpload.style.display = "none";
          trustedTestButton.style.display = "none";
        }
      }
    }
  }
  if (clubCall.value == "" && myRawCall != "NOCALL")
  {
    clubCall.value = myRawCall;
    ValidateText(clubCall);
    localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
  }

  try
  {
    findTrustedQSLPaths();
  }
  catch (e)
  {
    if (logLOTWqsoCheckBox.checked == true)
    {
      alert(
        "Unable to access LoTW TrustedQSL (TQSL) due to OS permissions\nLogging to LoTW disabled for this session\nRun as administrator or allow file access to GridTracker if problem persists"
      );
      logLOTWqsoCheckBox.checked = false;
    }
  }
  setAdifStartup(loadAdifCheckBox);
  ValidateQrzApi(qrzApiKey);
}

function startupVersionInit()
{
  if (!g_developerMode)
  {
    document.body.addEventListener("contextmenu", function (ev)
    {
      ev.preventDefault();
    });
  }

  imSureCheck.checked = false;
  stopAskingCheckbox.checked = g_appSettings.stopAskingVersion;
  if (stopAskingCheckbox.checked == false)
  {
    checkForNewVersion(false);
    setInterval(function ()
    {
      checkForNewVersion(false);
    }, 86400000);
  }
}

function startupButtonsAndInputs()
{
  try
  {
    g_pushPinMode = !(g_appSettings.pushPinMode == true);
    togglePushPinMode();
    udpForwardEnable.checked = g_appSettings.wsjtForwardUdpEnable;
    multicastEnable.checked = g_appSettings.multicast;

    gridViewButton.innerHTML = g_gridViewArray[g_appSettings.gridViewMode];
    earthImg.src = g_earthShadowImageArray[g_appSettings.earthImgSrc];
    gtFlagImg.src = g_gtFlagImageArray[g_appSettings.gtFlagImgSrc];
    gtShareFlagImg.src =
      g_gtShareFlagImageArray[g_appSettings.gtShareEnable == false ? 0 : 1];

    alertMuteImg.src = g_alertImageArray[g_appSettings.alertMute];
    modeImg.src = g_maidenheadModeImageArray[g_appSettings.sixWideMode];

    rosterAlwaysOnTop.checked = g_appSettings.rosterAlwaysOnTop;

    if (g_appSettings.centerGridsquare.length > 0)
    {
      homeQTHInput.value = g_appSettings.centerGridsquare.substr(0, 6);
      if (ValidateGridsquare(homeQTHInput, null)) setCenterGridsquare();
    }
    ValidateCallsign(alertValueInput, null);

    if (g_mapSettings.offlineMode == true)
    {
      conditionsButton.style.display = "none";
      buttonPsk24CheckBoxDiv.style.display = "none";
      buttonQRZCheckBoxDiv.style.display = "none";
      buttonLOTWCheckBoxDiv.style.display = "none";
      buttonClubCheckBoxDiv.style.display = "none";
      gtFlagButton.style.display = "none";
      gtShareButton.style.display = "none";
      msgButton.style.display = "none";
      donateButton.style.display = "none";
      pskReporterBandActivityDiv.style.display = "none";
      buttonStrikesDiv.style.display = "none";
      buttonPSKSpotsBoxDiv.style.display = "none";
    }

    setGtShareButtons();
  }
  catch (e) {}
}

function startupEventsAndTimers()
{
  document.addEventListener("keydown", onMyKeyDown, true);
  document.addEventListener("keyup", onMyKeyUp, false);
  displayTimeInterval = setInterval(displayTime, 1000);
}

var g_finishedLoading = false;
function postInit()
{
  redrawSpots();
  checkForSettings();
  updateForwardListener();
  addLastTraffic("GridTracker</br>" + gtShortVersion);

  g_nexradEnable = g_mapSettings.usNexrad ? 0 : 1;
  toggleNexrad();

  if (String(gtVersion) != String(g_startVersion))
  {
    // generalbut.className = "settingsTablinks";
    showSettingsBox();

    openSettingsTab(updatebut, "updateSettingsDiv");
  }
  g_finishedLoading = true;
  // tagme
  var x = document.querySelectorAll("input[type='range']");
  for (var i = 0; i < x.length; i++)
  {
    if (x[i].title.length > 0) x[i].title += "\n";
    x[i].title += "(Use Arrow Keys For Smaller Increments)";
  }

  openLookupWindow(false);
  openBaWindow(false);
  openCallRosterWindow(false);
  openConditionsWindow(false);
  showMessaging(false);
}

document.addEventListener("dragover", function (event)
{
  event.preventDefault();
});

document.addEventListener("drop", function (event)
{
  event.preventDefault();
  if (g_finishedLoading == true) dropHandler(event);
});

var g_startupTable = [
  [startupVersionInit, "Completed Version Check"],
  [qsoBackupFileInit, "QSO Backup Initialized"],
  [callsignServicesInit, "Callsign Services Initialized"],
  [loadMapSettings, "Map Settings Initialized"],
  [initMap, "Loaded Map"],
  [setPins, "Created Pins"],
  [loadViewSettings, "Loaded View Settings"],
  [loadMsgSettings, "Loaded Messaging Settings"],
  [setFileSelectors, "Set File Selectors"],
  [lockNewWindows, "Locked New Windows"],
  [loadMaidenHeadData, "Loaded Maidenhead Dataset"],
  [drawAllGrids, "Rendered All Maidenhead Grids"],
  [updateRunningProcesses, "Updated Running Processes"],
  [updateBasedOnIni, "Updated from WSJT-X/JTDX"],
  [loadAdifSettings, "Loaded ADIF Settings"],
  [startupButtonsAndInputs, "Buttons and Inputs Initialized"],
  [initSpeech, "Speech Initialized"],
  [initSoundCards, "Sounds Initialized"],
  [loadPortSettings, "Loaded Network Settings"],
  [loadLookupDetails, "Callsign Lookup Details Loaded"],
  [startupEventsAndTimers, "Set Events and Timers"],
  [registerHotKeys, "Registered Hotkeys"],
  [gtChatSystemInit, "User System Initialized"],
  [postInit, "Finalizing System"]
];

function init()
{
  startupVersionDiv.innerHTML = gtVersionString;
  aboutVersionDiv.innerHTML = gtVersionString;
  g_currentDay = parseInt(timeNowSec() / 86400);
  if (mediaCheck() == false)
  {
    startupDiv.style.display = "none";
    documentsDiv.style.display = "block";
    searchedDocFolder.innerHTML = g_appData;
  }
  else
  {
    documentsDiv.style.display = "none";
    startupDiv.style.display = "block";
    startupStatusDiv.innerHTML = "Starting...";
    setTimeout(startupEngine, 10);
  }
}

function startupEngine()
{
  if (g_startupTable.length > 0)
  {
    var funcInfo = g_startupTable.shift();
    funcInfo[0]();
    startupStatusDiv.innerHTML = funcInfo[1];
    setTimeout(startupEngine, 10);
  }
  else
  {
    startupStatusDiv.innerHTML = "Completed";
    setTimeout(endStartup, 2000);
    startupAdifLoadCheck();
    openStatsWindow(false);
  }
}

function directoryInput(what)
{
  g_appSettings.savedAppData = what.files[0].path;
  init();
}

function endStartup()
{
  startupDiv.style.display = "none";
  main.style.display = "block";
  g_map.updateSize();
}

function loadPortSettings()
{
  multicastEnable.checked = g_appSettings.multicast;
  multicastIpInput.value = g_appSettings.wsjtIP;
  setMulticastEnable(multicastEnable);
  udpPortInput.value = g_appSettings.wsjtUdpPort;
  ValidatePort(udpPortInput, null, CheckReceivePortIsNotForwardPort);
  udpForwardPortInput.value = g_appSettings.wsjtForwardUdpPort;
  ValidatePort(udpForwardPortInput, null, CheckForwardPortIsNotReceivePort);
  udpForwardIpInput.value = g_appSettings.wsjtForwardUdpIp;
  ValidateIPaddress(udpForwardIpInput, null);
  udpForwardEnable.checked = g_appSettings.wsjtForwardUdpEnable;
  setUdpForwardEnable(udpForwardEnable);
}

var g_wsjtCurrentPort = -1;
var g_wsjtUdpServer = null;
var g_wsjtUdpSocketReady = false;
var g_wsjtUdpSocketError = false;
var g_qtToSplice = 0;

function decodeQUINT8(byteArray)
{
  g_qtToSplice = 1;
  return byteArray[0];
}

function encodeQBOOL(byteArray, offset, value)
{
  return byteArray.writeUInt8(value, offset);
}

function decodeQUINT32(byteArray)
{
  g_qtToSplice = 4;
  return byteArray.readUInt32BE(0);
}

function encodeQUINT32(byteArray, offset, value)
{
  if (value == -1) value = 4294967295;
  return byteArray.writeUInt32BE(value, offset);
}

function decodeQINT32(byteArray)
{
  g_qtToSplice = 4;
  return byteArray.readInt32BE(0);
}

function encodeQINT32(byteArray, offset, value)
{
  return byteArray.writeInt32BE(value, offset);
}

function decodeQUINT64(byteArray)
{
  var value = 0;
  for (var i = 0; i < 8; i++)
  {
    value = value * 256 + byteArray[i];
  }
  g_qtToSplice = 8;
  return value;
}

function encodeQUINT64(byteArray, offset, value)
{
  var breakOut = Array();
  for (var i = 0; i < 8; i++)
  {
    breakOut[i] = value & 0xff;
    value >>= 8;
  }
  for (var i = 0; i < 8; i++)
  {
    offset = encodeQBOOL(byteArray, offset, breakOut[7 - i]);
  }
  return offset;
}

function decodeQUTF8(byteArray)
{
  var utf8_len = decodeQUINT32(byteArray);
  var result = "";
  byteArray = byteArray.slice(g_qtToSplice);
  if (utf8_len == 0xffffffff) utf8_len = 0;
  else result = byteArray.slice(0, utf8_len);
  g_qtToSplice = utf8_len + 4;
  return result.toString();
}

function encodeQUTF8(byteArray, offset, value)
{
  offset = encodeQUINT32(byteArray, offset, value.length);
  var wrote = byteArray.write(value, offset, value.length);
  return wrote + offset;
}

function decodeQDOUBLE(byteArray)
{
  g_qtToSplice = 8;
  return byteArray.readDoubleBE(0);
}

function encodeQDOUBLE(byteArray, offset, value)
{
  return byteArray.writeDoubleBE(value, offset);
}

var g_forwardUdpServer = null;

function updateForwardListener()
{
  if (g_forwardUdpServer != null)
  {
    g_forwardUdpServer.close();
  }
  if (g_closing == true) return;

  var dgram = require("dgram");
  g_forwardUdpServer = dgram.createSocket({
    type: "udp4",
    reuseAddr: true
  });

  g_forwardUdpServer.on("listening", function () {});
  g_forwardUdpServer.on("error", function ()
  {
    g_forwardUdpServer.close();
    g_forwardUdpServer = null;
  });
  g_forwardUdpServer.on("message", function (originalMessage, remote)
  {
    // Decode enough to get the rig-name, so we know who to send to
    var message = Object.assign({}, originalMessage);
    var newMessage = {};
    newMessage.magic_key = decodeQUINT32(message);
    message = message.slice(g_qtToSplice);
    if (newMessage.magic_key == 0xadbccbda)
    {
      newMessage.schema_number = decodeQUINT32(message);
      message = message.slice(g_qtToSplice);
      newMessage.type = decodeQUINT32(message);
      message = message.slice(g_qtToSplice);
      newMessage.Id = decodeQUTF8(message);
      message = message.slice(g_qtToSplice);

      var instanceId = newMessage.Id;
      if (instanceId in g_instances)
      {
        wsjtUdpMessage(
          originalMessage,
          originalMessage.length,
          g_instances[instanceId].remote.port,
          g_instances[instanceId].remote.address
        );
      }
    }
  });
  g_forwardUdpServer.bind(0);
}

function sendForwardUdpMessage(msg, length, port, address)
{
  if (g_forwardUdpServer)
  {
    g_forwardUdpServer.send(msg, 0, length, port, address);
  }
}

function wsjtUdpMessage(msg, length, port, address)
{
  if (g_wsjtUdpServer)
  {
    g_wsjtUdpServer.send(msg, 0, length, port, address);
  }
}

function checkWsjtxListener()
{
  if (
    g_wsjtUdpServer == null ||
    (g_wsjtUdpSocketReady == false && g_wsjtUdpSocketError == true)
  )
  {
    g_wsjtCurrentPort = -1;
    g_wsjtCurrentIP = "none";
  }
  updateWsjtxListener(g_appSettings.wsjtUdpPort);
}

var g_instances = {};
var g_instancesIndex = Array();

var g_activeInstance = "";
var g_activeIndex = 0;

var g_currentID = null;

function updateWsjtxListener(port)
{
  if (port == g_wsjtCurrentPort && g_appSettings.wsjtIP == g_wsjtCurrentIP)
  { return; }
  if (g_wsjtUdpServer != null)
  {
    if (multicastEnable.checked == true && g_appSettings.wsjtIP != "")
    {
      try
      {
        g_wsjtUdpServer.dropMembership(g_appSettings.wsjtIP);
      }
      catch (e) {}
    }
    g_wsjtUdpServer.close();
    g_wsjtUdpServer = null;
    g_wsjtUdpSocketReady = false;
  }
  if (g_closing == true) return;
  g_wsjtUdpSocketError = false;
  var dgram = require("dgram");
  g_wsjtUdpServer = dgram.createSocket({
    type: "udp4",
    reuseAddr: true
  });
  if (multicastEnable.checked == true && g_appSettings.wsjtIP != "")
  {
    g_wsjtUdpServer.on("listening", function ()
    {
      var address = g_wsjtUdpServer.address();
      g_wsjtUdpServer.setBroadcast(true);
      g_wsjtUdpServer.setMulticastTTL(128);
      g_wsjtUdpServer.addMembership(g_appSettings.wsjtIP);
      g_wsjtUdpSocketReady = true;
    });
  }
  else
  {
    g_appSettings.multicast = false;
    g_wsjtCurrentIP = g_appSettings.wsjtIP = "";
    g_wsjtUdpServer.on("listening", function ()
    {
      g_wsjtUdpServer.setBroadcast(true);
      g_wsjtUdpSocketReady = true;
    });
  }
  g_wsjtUdpServer.on("error", function ()
  {
    g_wsjtUdpServer.close();
    g_wsjtUdpServer = null;
    g_wsjtUdpSocketReady = false;
    g_wsjtUdpSocketError = true;
  });
  g_wsjtUdpServer.on("message", function (message, remote)
  {
    // if (g_closing == true) true;

    if (
      typeof udpForwardEnable != "undefined" &&
      udpForwardEnable.checked == true
    )
    {
      sendForwardUdpMessage(
        message,
        message.length,
        udpForwardPortInput.value,
        udpForwardIpInput.value
      );
    }

    var newMessage = {};
    newMessage.magic_key = decodeQUINT32(message);
    message = message.slice(g_qtToSplice);
    if (newMessage.magic_key == 0xadbccbda)
    {
      newMessage.schema_number = decodeQUINT32(message);
      message = message.slice(g_qtToSplice);
      newMessage.type = decodeQUINT32(message);
      message = message.slice(g_qtToSplice);
      newMessage.Id = decodeQUTF8(message);
      message = message.slice(g_qtToSplice);

      var instanceId = newMessage.Id;
      if (!(instanceId in g_instances))
      {
        g_instances[instanceId] = {};
        g_instances[instanceId].valid = false;
        g_instancesIndex.push(instanceId);
        g_instances[instanceId].intId = g_instancesIndex.length - 1;
        g_instances[instanceId].crEnable = true;
        if (g_instancesIndex.length > 1)
        {
          multiRigCRDiv.style.display = "inline-block";
          haltTXDiv.style.display = "inline-block";
        }
        updateRosterInstances();
      }
      var notify = false;
      if (g_instances[instanceId].open == false) notify = true;
      g_instances[instanceId].open = true;
      g_instances[instanceId].remote = remote;

      if (notify) updateRosterInstances();

      if (newMessage.type == 1)
      {
        newMessage.event = "Status";
        newMessage.Frequency = decodeQUINT64(message);
        newMessage.Band = Number(newMessage.Frequency / 1000000).formatBand();
        message = message.slice(g_qtToSplice);
        newMessage.MO = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.DXcall = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.Report = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.TxMode = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.TxEnabled = decodeQUINT8(message);
        message = message.slice(g_qtToSplice);
        newMessage.Transmitting = decodeQUINT8(message);
        message = message.slice(g_qtToSplice);
        newMessage.Decoding = decodeQUINT8(message);
        message = message.slice(g_qtToSplice);
        newMessage.RxDF = decodeQINT32(message);
        message = message.slice(g_qtToSplice);
        newMessage.TxDF = decodeQINT32(message);
        message = message.slice(g_qtToSplice);
        newMessage.DEcall = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.DEgrid = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.DXgrid = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.TxWatchdog = decodeQUINT8(message);
        message = message.slice(g_qtToSplice);
        newMessage.Submode = decodeQUTF8(message);
        message = message.slice(g_qtToSplice);
        newMessage.Fastmode = decodeQUINT8(message);
        message = message.slice(g_qtToSplice);

        if (message.length > 0)
        {
          newMessage.SopMode = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
        }
        else
        {
          newMessage.SopMode = -1;
        }
        if (message.length > 0)
        {
          newMessage.FreqTol = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
        }
        else
        {
          newMessage.FreqTol = -1;
        }
        if (message.length > 0)
        {
          newMessage.TRP = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
        }
        else
        {
          newMessage.TRP = -1;
        }
        if (message.length > 0)
        {
          newMessage.ConfName = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
        }
        else
        {
          newMessage.ConfName = null;
        }

        g_instances[instanceId].status = newMessage;
        g_instances[instanceId].valid = true;
      }
      if (g_instances[instanceId].valid == true)
      {
        if (newMessage.type == 2)
        {
          newMessage.event = "Decode";
          newMessage.NW = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          newMessage.TM = decodeQUINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.SR = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.DT = decodeQDOUBLE(message);
          message = message.slice(g_qtToSplice);
          newMessage.DF = decodeQUINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.MO = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Msg = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.LC = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          newMessage.OA = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          newMessage.OF = g_instances[instanceId].status.Frequency;
          newMessage.OC = g_instances[instanceId].status.DEcall;
          newMessage.OG = g_instances[instanceId].status.DEgrid;
          newMessage.OM = g_instances[instanceId].status.MO;
          newMessage.OB = g_instances[instanceId].status.Band;
        }
        if (newMessage.type == 3)
        {
          newMessage.event = "Clear";
        }
        if (newMessage.type == 5)
        {
          newMessage.event = "QSO Logged";
          newMessage.DateOff = decodeQUINT64(message);
          message = message.slice(g_qtToSplice);
          newMessage.TimeOff = decodeQUINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.timespecOff = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          if (newMessage.timespecOff == 2)
          {
            newMessage.offsetOff = decodeQINT32(message);
            message = message.slice(g_qtToSplice);
          }
          newMessage.DXCall = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.DXGrid = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Frequency = decodeQUINT64(message);
          message = message.slice(g_qtToSplice);
          newMessage.MO = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.ReportSend = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.ReportRecieved = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.TXPower = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Comments = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Name = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.DateOn = decodeQUINT64(message);
          message = message.slice(g_qtToSplice);
          newMessage.TimeOn = decodeQUINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.timespecOn = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          if (newMessage.timespecOn == 2)
          {
            newMessage.offsetOn = decodeQINT32(message);
            message = message.slice(g_qtToSplice);
          }
          if (message.length > 0)
          {
            newMessage.Operatorcall = decodeQUTF8(message);
            message = message.slice(g_qtToSplice);
          }
          else newMessage.Operatorcall = "";

          if (message.length > 0)
          {
            newMessage.Mycall = decodeQUTF8(message);
            message = message.slice(g_qtToSplice);
          }
          else newMessage.Mycall = "";

          if (message.length > 0)
          {
            newMessage.Mygrid = decodeQUTF8(message);
            message = message.slice(g_qtToSplice);
          }
          else newMessage.Mygrid = "";

          if (message.length > 0)
          {
            newMessage.ExchangeSent = decodeQUTF8(message);
            message = message.slice(g_qtToSplice);
          }
          else newMessage.ExchangeSent = "";

          if (message.length > 0)
          {
            newMessage.ExchangeReceived = decodeQUTF8(message);
            message = message.slice(g_qtToSplice);
          }
          else newMessage.ExchangeReceived = "";
        }
        if (newMessage.type == 6)
        {
          newMessage.event = "Close";
        }
        if (newMessage.type == 10)
        {
          newMessage.event = "WSPRDecode";
          newMessage.NW = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          newMessage.TM = decodeQUINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.SR = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.DT = decodeQDOUBLE(message);
          message = message.slice(g_qtToSplice);
          newMessage.Frequency = decodeQUINT64(message);
          message = message.slice(g_qtToSplice);
          newMessage.Drift = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.Callsign = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Grid = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
          newMessage.Power = decodeQINT32(message);
          message = message.slice(g_qtToSplice);
          newMessage.OA = decodeQUINT8(message);
          message = message.slice(g_qtToSplice);
          newMessage.OF = g_instances[instanceId].status.Frequency;
          newMessage.OC = g_instances[instanceId].status.DEcall;
          newMessage.OG = g_instances[instanceId].status.DEgrid;
          newMessage.OM = g_instances[instanceId].status.MO;
          newMessage.OB = g_instances[instanceId].status.Band;
        }
        if (newMessage.type == 12)
        {
          newMessage.event = "ADIF";
          newMessage.ADIF = decodeQUTF8(message);
          message = message.slice(g_qtToSplice);
        }

        if (newMessage.type in g_wsjtHandlers)
        {
          newMessage.remote = remote;
          newMessage.instance = instanceId;

          lastMsgTimeDiv.innerHTML = "Received from " + newMessage.Id;

          g_wsjtHandlers[newMessage.type](newMessage);
          g_lastTimeSinceMessageInSeconds = parseInt(Date.now() / 1000);
        }
      }
    }
  });
  g_wsjtUdpServer.bind(port);
  g_wsjtCurrentPort = port;
  g_wsjtCurrentIP = g_appSettings.wsjtIP;
}

function loadLookupDetails()
{
  lookupService.value = g_appSettings.lookupService;
  if (lookupService.value == "QRZ")
  {
    lookupLogin.value = g_appSettings.lookupLoginQrz;
    lookupPassword.value = g_appSettings.lookupPasswordQrz;
  }
  if (lookupService.value == "QRZCQ")
  {
    lookupLogin.value = g_appSettings.lookupLoginCq;
    lookupPassword.value = g_appSettings.lookupPasswordCq;
  }
  if (lookupService.value == "HAMQTH")
  {
    lookupLogin.value = g_appSettings.lookupLoginQth;
    lookupPassword.value = g_appSettings.lookupPasswordQth;
  }
  ValidateText(lookupLogin);
  ValidateText(lookupPassword);
  if (lookupService.value == "CALLOOK")
  { lookupCredentials.style.display = "none"; }
  else lookupCredentials.style.display = "block";
}

function lookupValueChanged(what)
{
  if (g_appSettings.lookupService != lookupService.value)
  {
    g_lastLookupCallsign = "";
    if (lookupService.value == "QRZ")
    {
      lookupLogin.value = g_appSettings.lookupLoginQrz;
      lookupPassword.value = g_appSettings.lookupPasswordQrz;
    }
    if (lookupService.value == "QRZCQ")
    {
      lookupLogin.value = g_appSettings.lookupLoginCq;
      lookupPassword.value = g_appSettings.lookupPasswordCq;
    }
    if (lookupService.value == "HAMQTH")
    {
      lookupLogin.value = g_appSettings.lookupLoginQth;
      lookupPassword.value = g_appSettings.lookupPasswordQth;
    }
  }
  g_appSettings.lookupService = lookupService.value;
  lookupQrzTestResult.innerHTML = "";
  g_qrzLookupSessionId = null;
  if (lookupService.value == "CALLOOK")
  { lookupCredentials.style.display = "none"; }
  else lookupCredentials.style.display = "block";
  if (ValidateText(lookupLogin) && ValidateText(lookupPassword))
  {
    if (lookupService.value == "QRZ")
    {
      g_appSettings.lookupLoginQrz = lookupLogin.value;
      g_appSettings.lookupPasswordQrz = lookupPassword.value;
    }
    if (lookupService.value == "QRZCQ")
    {
      g_appSettings.lookupLoginCq = lookupLogin.value;
      g_appSettings.lookupPasswordCq = lookupPassword.value;
    }
    if (lookupService.value == "HAMQTH")
    {
      g_appSettings.lookupLoginQth = lookupLogin.value;
      g_appSettings.lookupPasswordQth = lookupPassword.value;
    }
  }
}
var g_lastLookupCallsign = "";
var g_lookupTimeout = null;

function lookupCallsign(callsign, gridPass, useCache = true)
{
  if (g_mapSettings.offlineMode == true && useCache == false) return;
  g_lastLookupCallsign = callsign;

  if (g_lookupWindowHandle)
  {
    g_lookupWindowHandle.window.lookupCallsignInput.value = callsign;
    lookupValidateCallByElement("lookupCallsignInput");
  }
  if (g_lookupTimeout != null)
  {
    window.clearTimeout(g_lookupTimeout);
    g_lookupTimeout = null;
  }
  g_lookupTimeout = setTimeout(searchLogForCallsign, 500, callsign);

  if (useCache)
  {
    getLookupCachedObject(
      callsign,
      gridPass,
      cacheLookupObject,
      continueWithLookup
    );
  }
  else continueWithLookup(callsign, gridPass);
}

function continueWithLookup(callsign, gridPass)
{
  setLookupDiv(
    "lookupInfoDiv",
    "Looking up <font color='cyan'>" + callsign + "</font>, please wait..."
  );
  if (g_appSettings.lookupService != "CALLOOK")
  {
    g_qrzLookupCallsign = callsign;
    g_qrzLookupGrid = gridPass;
    if (
      g_qrzLookupSessionId == null ||
      timeNowSec() - g_sinceLastLookup > 3600
    )
    {
      g_qrzLookupSessionId = null;
      g_sinceLastLookup = timeNowSec();
      GetSessionID(null, true);
    }
    else
    {
      g_sinceLastLookup = timeNowSec();
      GetLookup(true);
    }
  }
  else
  {
    var dxcc = callsignToDxcc(callsign);
    var where;
    var ccode = 0;
    if (dxcc in g_dxccToAltName)
    {
      where = g_dxccToAltName[dxcc];
      ccode = g_worldGeoData[g_dxccToGeoData[dxcc]].ccode;
    }
    else where = "Unknown";
    if (ccode == 840)
    {
      getBuffer(
        "https://callook.info/" + callsign + "/json",
        callookResults,
        gridPass,
        "https",
        443,
        true
      );
    }
    else
    {
      var worker =
        "<center>C A L L O O K<br/>NO-NONSENSE AMATEUR RADIO U.S.A. CALLSIGN LOOKUPS<br/>are limited to United States and United States Territories Only<br/>";
      worker +=
        "<br/>The callsign <font color='orange'>" +
        callsign +
        "</font> requested is from <font color='yellow'>" +
        where +
        "</font><br/>";
      worker +=
        "<br/><br/>You might want to consider using QRZ.com, they have a free membership that provides limited data for most callsigns<br/>";
      worker +=
        "and they have full details available for paid members<br/></center>";

      setLookupDiv("lookupInfoDiv", worker);
    }
  }
}
function callookResults(buffer, gridPass)
{
  var results = JSON.parse(buffer);
  if (typeof results.status != "undefined")
  {
    if (results.status == "VALID")
    {
      var callObject = {};
      var dxcc = callsignToDxcc(results.current.callsign);
      if (dxcc in g_dxccToAltName) callObject.land = g_dxccToAltName[dxcc];
      callObject.type = results.type;
      callObject.call = results.current.callsign;
      callObject.dxcc = dxcc;
      callObject.email = "";
      callObject.class = results.current.operClass;
      callObject.aliases = results.previous.callsign;
      callObject.trustee =
        results.trustee.callsign +
        (results.trustee.name.length > 0 ? "; " + results.trustee.name : "");
      callObject.name = results.name;
      callObject.fname = "";
      callObject.addr1 = results.address.line1;
      callObject.addr2 = results.address.line2;
      callObject.addrAttn = results.address.attn;
      callObject.lat = results.location.latitude;
      callObject.lon = results.location.longitude;
      callObject.grid = results.location.gridsquare;
      callObject.efdate = results.otherInfo.grantDate;
      callObject.expdate = results.otherInfo.expiryDate;
      callObject.frn = results.otherInfo.frn;
      callObject.bio = 0;
      callObject.image = "";
      callObject.country = "United States";
      if (gridPass) callObject.gtGrid = gridPass;
      callObject.source =
        "<tr><td>Source</td><td><font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"https://callook.info/" +
        results.current.callsign +
        "\");'>C A L L O O K</div></b></font></td></tr>";
      cacheLookupObject(callObject, gridPass, true);
    }
    else if (results.status == "INVALID")
    {
      setLookupDiv("lookupInfoDiv", "Invalid Lookup");
    }
    else
    {
      setLookupDiv("lookupInfoDiv", "Server is down for maintenance");
    }
  }
  else setLookupDiv("lookupInfoDiv", "Unknown Lookup Error");
}
var g_qrzLookupSessionId = null;
var g_qrzLookupCallsign = "";
var g_qrzLookupGrid = "";
var g_sinceLastLookup = 0;

function GetSessionID(resultTd, useCache)
{
  if (g_mapSettings.offlineMode == true) return;
  if (resultTd != null) resultTd.innerHTML = "Testing";
  if (g_appSettings.lookupService == "QRZCQ")
  {
    getBuffer(
      "https://ssl.qrzcq.com/xml?username=" +
        g_appSettings.lookupLoginCq +
        "&password=" +
        encodeURIComponent(g_appSettings.lookupPasswordCq) +
        "&agent=GridTracker1.18",
      qrzGetSessionCallback,
      resultTd,
      "https",
      443,
      useCache
    );
  }
  else if (g_appSettings.lookupService == "QRZ")
  {
    getBuffer(
      "https://xmldata.qrz.com/xml/current/?username=" +
        g_appSettings.lookupLoginQrz +
        ";password=" +
        encodeURIComponent(g_appSettings.lookupPasswordQrz),
      qrzGetSessionCallback,
      resultTd,
      "https",
      443,
      useCache
    );
  }
  else
  {
    getBuffer(
      "https://www.hamqth.com/xml.php?u=" +
        g_appSettings.lookupLoginQth +
        "&p=" +
        encodeURIComponent(g_appSettings.lookupPasswordQth),
      hamQthGetSessionCallback,
      resultTd,
      "https",
      443,
      useCache
    );
  }
}

function hamQthGetSessionCallback(buffer, resultTd)
{
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(buffer, "text/xml");
  var result = "";
  if (oDOM != null)
  {
    var json = XML2jsobj(oDOM.documentElement);
    if (json.hasOwnProperty("session"))
    {
      if (json.session.hasOwnProperty("session_id"))
      {
        result = "<font color='green'>Valid</font>";
        g_qrzLookupSessionId = json.session.session_id;
      }
      else
      {
        result = "<font color='red'>" + json.session.error + "</font>";
        g_qrzLookupSessionId = null;
      }
    }
    else
    {
      result = "<font color='red'>Invalid Response</font>";
      g_qrzLookupSessionId = null;
    }
  }
  else
  {
    result = "<font color='red'>Unknown Error</font>";
    g_qrzLookupSessionId = null;
  }
  if (resultTd == null)
  {
    // It's a true session Request
    SessionResponse(g_qrzLookupSessionId, result);
  }
  else
  {
    g_qrzLookupSessionId = null;
    resultTd.innerHTML = result;
  }
}

function qrzGetSessionCallback(buffer, resultTd, useCache)
{
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(buffer, "text/xml");
  var result = "";
  if (oDOM != null)
  {
    var json = XML2jsobj(oDOM.documentElement);
    if (json.hasOwnProperty("Session"))
    {
      if (json.Session.hasOwnProperty("Key"))
      {
        result = "<font color='green'>Valid</font>";
        g_qrzLookupSessionId = json.Session.Key;
      }
      else
      {
        result = "<font color='red'>" + json.Session.Error + "</font>";
        g_qrzLookupSessionId = null;
      }
    }
    else
    {
      result = "<font color='red'>Invalid Response</font>";
      g_qrzLookupSessionId = null;
    }
  }
  else
  {
    result = "<font color='red'>Unknown Error</font>";
    g_qrzLookupSessionId = null;
  }
  if (resultTd == null)
  {
    // It's a true session Request
    SessionResponse(g_qrzLookupSessionId, result, useCache);
  }
  else resultTd.innerHTML = result;
}

function SessionResponse(newKey, result, useCache)
{
  // for QRZCQ.com as well
  if (newKey == null)
  {
    setLookupDiv("lookupInfoDiv", result, useCache);
  }
  else
  {
    GetLookup(useCache);
  }
}

function GetLookup(useCache)
{
  if (g_appSettings.lookupService == "QRZCQ")
  {
    getBuffer(
      "https://ssl.qrzcq.com/xml?s=" +
        g_qrzLookupSessionId +
        "&callsign=" +
        g_qrzLookupCallsign +
        "&agent=GridTracker",
      qrzLookupResults,
      g_qrzLookupGrid,
      "https",
      443,
      useCache
    );
  }
  else if (g_appSettings.lookupService == "QRZ")
  {
    getBuffer(
      "http://xmldata.qrz.com/xml/current/?s=" +
        g_qrzLookupSessionId +
        ";callsign=" +
        g_qrzLookupCallsign,
      qrzLookupResults,
      g_qrzLookupGrid,
      "http",
      80,
      useCache
    );
  }
  else
  {
    getBuffer(
      "https://www.hamqth.com/xml.php?id=" +
        g_qrzLookupSessionId +
        "&callsign=" +
        g_qrzLookupCallsign +
        "&prg=GridTracker",
      qthHamLookupResults,
      g_qrzLookupGrid,
      "https",
      443,
      useCache
    );
  }
}

function qthHamLookupResults(buffer, gridPass, useCache)
{
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(buffer, "text/xml");
  var result = "";
  if (oDOM != null)
  {
    var json = XML2jsobj(oDOM.documentElement);
    if (json.hasOwnProperty("search"))
    {
      if (gridPass) json.search.gtGrid = gridPass;
      json.search.source =
        "<tr><td>Source</td><td><font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"https://www.hamqth.com/" +
        json.search.callsign.toUpperCase() +
        "\");'>HamQTH</div></b></font></td></tr>";

      cacheLookupObject(json.search, gridPass, true);
    }
    else
    {
      g_qrzLookupSessionId = null;
      setLookupDiv(
        "lookupInfoDiv",
        "<br/><b>No result for callsign</b><br/><br/>"
      );
    }
  }
  else
  {
    setLookupDiv("lookupInfoDiv", buffer);
    g_qrzLookupSessionId = null;
  }
}

function qrzLookupResults(buffer, gridPass, useCache)
{
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(buffer, "text/xml");
  var result = "";
  if (oDOM != null)
  {
    var json = XML2jsobj(oDOM.documentElement);
    if (json.hasOwnProperty("Callsign"))
    {
      var call = "";
      if (json.Callsign.hasOwnProperty("callsign"))
      {
        json.Callsign.call = lookup.callsign;
        delete json.Callsign.callsign;
      }
      if (json.Callsign.hasOwnProperty("call")) call = json.Callsign.call;
      if (g_appSettings.lookupService == "QRZ")
      {
        json.Callsign.source =
          "<tr><td>Source</td><td><font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"https://www.qrz.com/lookup?callsign=" +
          call +
          "\");'>QRZ.com</div></b></font></td></tr>";
      }
      else
      {
        json.Callsign.source =
          "<tr><td>Source</td><td><font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"https://www.qrzcq.com/call/" +
          call +
          "\");'>QRZCQ.com</div></b></font></td></tr>";
      }
      if (gridPass) json.Callsign.gtGrid = gridPass;
      cacheLookupObject(json.Callsign, gridPass, true);
    }
    else
    {
      setLookupDiv(
        "lookupInfoDiv",
        "<br/><b>No result for callsign</b><br/><br/>"
      );
      g_qrzLookupSessionId = null;
    }
  }
  else
  {
    setLookupDiv("lookupInfoDiv", buffer);
    g_qrzLookupSessionId = null;
  }
}

var g_lastLookupAddress = null;

var g_Idb = null;
var g_Irequest = null;

function initialDatabases()
{
  g_Irequest = window.indexedDB.open("GridTracker", 1);

  g_Irequest.onerror = function (event)
  {
    alert(
      "Database error: " +
        event.target.errorCode +
        " : GridTracker will have issues"
    );
  };

  g_Irequest.onsuccess = function (event)
  {
    g_Idb = g_Irequest.result;
    if (!g_Idb.objectStoreNames.contains("lookups"))
    {
      g_Idb.createObjectStore("lookups", { keyPath: "call" });
    }
    init();
  };

  g_Irequest.onupgradeneeded = function (event)
  {
    g_Idb = g_Irequest.result;
    if (!g_Idb.objectStoreNames.contains("lookups"))
    {
      g_Idb.createObjectStore("lookups", { keyPath: "call" });
    }
    init();
  };
}

function addLookupObjectToIndexedDB(lookupObject)
{
  var request = g_Idb
    .transaction(["lookups"], "readwrite")
    .objectStore("lookups")
    .put(lookupObject);

  request.onerror = function (event)
  {
    addLastTraffic("<font style='color:orange'>Lookup Write Issue</font>");
  };
}

function getLookupCachedObject(
  call,
  gridPass,
  resultFunction = null,
  noResultFunction = null,
  callObject = null
)
{
  var request = g_Idb
    .transaction(["lookups"], "readwrite")
    .objectStore("lookups")
    .get(call);

  request.onsuccess = function (event)
  {
    if (
      request.result &&
      parseInt(request.result.cached) + 604800 > timeNowSec()
    )
    {
      // 7 days, should an option Tag! I know right?!
      delete request.result;
      request.result = null;
      g_Idb
        .transaction(["lookups"], "readwrite")
        .objectStore("lookups")
        .delete(call);
    }
    if (callObject != null)
    {
      if (request.result != null)
      {
        callObject.cnty = request.result.cnty;

        if (callObject.cnty in g_countyData) callObject.qual = true;
        else
        {
          callObject.cnty = null;
          callObject.qual = false;
        }
      }
      return;
    }
    if (request.result != null && resultFunction)
    { resultFunction(request.result, gridPass, false); }
    else if (noResultFunction) noResultFunction(call, gridPass);
  };

  request.onerror = function (event)
  {
    if (noResultFunction) noResultFunction(call, gridPass);
  };
}

function cacheLookupObject(lookup, gridPass, cacheable = false)
{
  if (!("cnty" in lookup)) lookup.cnty = null;

  if (lookup.hasOwnProperty("callsign"))
  {
    lookup.call = lookup.callsign;
    delete lookup.callsign;
  }

  lookup.call = lookup.call.toUpperCase();

  if (lookup.hasOwnProperty("latitude"))
  {
    lookup.lat = lookup.latitude;
    delete lookup.latitude;
  }
  if (lookup.hasOwnProperty("longitude"))
  {
    lookup.lon = lookup.longitude;
    delete lookup.longitude;
  }
  if (lookup.hasOwnProperty("locator"))
  {
    lookup.grid = lookup.locator;
    delete lookup.locator;
  }
  if (lookup.hasOwnProperty("website"))
  {
    lookup.url = lookup.website;
    delete lookup.website;
  }
  if (lookup.hasOwnProperty("web"))
  {
    lookup.url = lookup.web;
    delete lookup.web;
  }
  if (lookup.hasOwnProperty("qslpic"))
  {
    lookup.image = lookup.qslpic;
    delete lookup.qslpic;
  }
  if (lookup.hasOwnProperty("picture"))
  {
    lookup.image = lookup.picture;
    delete lookup.picture;
  }
  if (lookup.hasOwnProperty("address"))
  {
    lookup.addr1 = lookup.address;
    delete lookup.address;
  }
  if (lookup.hasOwnProperty("adr_city"))
  {
    lookup.addr2 = lookup.adr_city;
    delete lookup.adr_city;
  }
  if (lookup.hasOwnProperty("city"))
  {
    lookup.addr2 = lookup.city;
    delete lookup.city;
  }
  if (lookup.hasOwnProperty("itu"))
  {
    lookup.ituzone = lookup.itu;
    delete lookup.itu;
  }
  if (lookup.hasOwnProperty("cq"))
  {
    lookup.cqzone = lookup.cq;
    delete lookup.cq;
  }
  if (lookup.hasOwnProperty("adif"))
  {
    lookup.dxcc = lookup.adif;
    delete lookup.adif;
  }
  if (!lookup.hasOwnProperty("dxcc"))
  {
    lookup.dxcc = callsignToDxcc(lookup.call.toUpperCase());
  }
  if (lookup.hasOwnProperty("adr_name"))
  {
    lookup.name = lookup.adr_name;
    delete lookup.adr_name;
  }
  if (lookup.hasOwnProperty("adr_street1"))
  {
    lookup.addr1 = lookup.adr_street1;
    delete lookup.adr_street1;
  }
  if (lookup.hasOwnProperty("us_state"))
  {
    lookup.state = lookup.us_state;
    delete lookup.us_state;
  }
  if (lookup.hasOwnProperty("oblast"))
  {
    lookup.state = lookup.oblast;
    delete lookup.oblast;
  }
  if (lookup.hasOwnProperty("district"))
  {
    lookup.state = lookup.district;
    delete lookup.district;
  }
  if (lookup.hasOwnProperty("adr_zip"))
  {
    lookup.zip = lookup.adr_zip;
    delete lookup.adr_zip;
  }
  if (lookup.hasOwnProperty("adr_country"))
  {
    lookup.country = lookup.adr_country;
    delete lookup.adr_country;
  }
  if (lookup.hasOwnProperty("us_county"))
  {
    lookup.county = lookup.us_county;
    delete lookup.us_county;
  }
  if (lookup.hasOwnProperty("qsldirect"))
  {
    lookup.mqsl = lookup.qsldirect;
    delete lookup.qsldirect;
  }
  if (lookup.hasOwnProperty("qsl"))
  {
    lookup.bqsl = lookup.qsl;
    delete lookup.qsl;
  }
  if (lookup.hasOwnProperty("utc_offset"))
  {
    lookup.GMTOffset = lookup.utc_offset;
    delete lookup.utc_offset;
  }

  if (lookup.hasOwnProperty("land"))
  {
    lookup.country = lookup.land;
    delete lookup.land;
  }

  if ("grid" in lookup) lookup.grid = lookup.grid.toUpperCase();

  if (lookup.hasOwnProperty("state") && lookup.hasOwnProperty("county"))
  {
    var foundCounty = false;

    if (lookup.cnty == null)
    {
      lookup.county = lookup.state + ", " + lookup.county;
      lookup.cnty = lookup.county.toUpperCase().replaceAll(" ", "");
    }

    if (lookup.cnty in g_countyData)
    {
      for (var hash in g_liveCallsigns)
      {
        if (
          g_liveCallsigns[hash].DEcall == lookup.call &&
          g_liveCallsigns[hash].state == "US-" + lookup.state
        )
        {
          g_liveCallsigns[hash].cnty = lookup.cnty;
          g_liveCallsigns[hash].qual = true;
          foundCounty = true;
        }
      }
      if (foundCounty)
      {
        goProcessRoster();
      }
    }
    else
    {
      // console.log( "bad county: " + lookup.cnty);
      lookup.cnty = null;
    }
  }

  lookup.name = joinSpaceIf(
    getLookProp(lookup, "fname"),
    getLookProp(lookup, "name")
  );
  lookup.fname = "";

  if (cacheable)
  {
    lookup.cached = timeNowSec();
    addLookupObjectToIndexedDB(lookup);
  }

  displayLookupObject(lookup, gridPass, cacheable);
}

function displayLookupObject(lookup, gridPass, fromCache = false)
{
  var worker = "";

  var thisCall = getLookProp(lookup, "call").toUpperCase();

  worker +=
    "<table title='Click to copy address to clipboard' onclick='setClipboardFromLookup();' style='cursor:pointer' >";
  worker += "<tr>";
  worker += "<td style='font-size:36pt;color:cyan;font-weight:bold'>";
  worker += getLookProp(lookup, "call").toUpperCase().formatCallsign();
  worker += "</td>";
  worker += "<td align='center' style='margin:0;padding:0'>";
  if (lookup.dxcc > 0 && lookup.dxcc in g_dxccToGeoData)
  {
    worker +=
      "<img style='padding-top:4px' src='./img/flags/24/" +
      g_worldGeoData[g_dxccToGeoData[lookup.dxcc]].flag +
      "'>";
  }
  worker += "</td>";
  worker += "<td rowspan=6>";
  var image = getLookProp(lookup, "image");
  if (image.length > 0)
  {
    worker +=
      "<img style='border:1px solid gray' class='roundBorder' width='220px' src='" +
      image +
      "'>";
  }
  worker += "</td>";
  worker += "</tr>";

  g_lastLookupAddress = "";
  if (getLookProp(lookup, "addrAttn").length > 0)
  {
    worker += "<tr>";
    worker += "<td>";
    worker += getLookProp(lookup, "addrAttn");
    g_lastLookupAddress += getLookProp(lookup, "addrAttn") + "\n";
    worker += "</td>";
    worker += "</tr>";
  }
  worker += "<tr>";
  worker += "<td>";
  worker += "<b>" + getLookProp(lookup, "name") + "</b>";
  g_lastLookupAddress += getLookProp(lookup, "name") + "\n";
  worker += "</td>";
  worker += "</tr>";
  worker += "<tr>";
  worker += "<td>";
  worker += getLookProp(lookup, "addr1");
  g_lastLookupAddress += getLookProp(lookup, "addr1") + "\n";
  worker += "</td>";
  worker += "</tr>";
  worker += "<tr>";
  worker += "<td>";
  worker += joinCommaIf(
    getLookProp(lookup, "addr2"),
    joinSpaceIf(getLookProp(lookup, "state"), getLookProp(lookup, "zip"))
  );
  g_lastLookupAddress +=
    joinCommaIf(
      getLookProp(lookup, "addr2"),
      joinSpaceIf(getLookProp(lookup, "state"), getLookProp(lookup, "zip"))
    ) + "\n";
  worker += "</td>";
  worker += "</tr>";
  worker += "<tr>";
  worker += "<td>";
  var country = getLookProp(lookup, "country");
  worker += country;
  g_lastLookupAddress += country + "\n";

  worker += "</td>";
  worker += "</tr>";
  worker += "<tr>";
  worker += "<td>";
  var email = getLookProp(lookup, "email");
  if (email.length > 0)
  {
    worker +=
      "<div style='cursor:pointer;font-weight:bold;vertical-align:top' onclick='window.opener.mailThem(\"" +
      email +
      "\");'>" +
      email +
      "</div>";
    g_lastLookupAddress += email + "\n";
  }

  worker += "</td>";
  worker += "</tr>";
  worker += "</table>";
  var card =
    "<div class='mapItem' id='callCard' style='top:0;padding:4px;'>" +
    worker +
    "</div>";
  worker = "";
  worker += "<table align='center' class='bioTable' >";
  worker += "<tr><th colspan=2>Details</th></tr>";
  if (getLookProp(lookup, "url").length > 0)
  {
    worker += "<tr>";
    worker += "<td>Website</td>";
    worker += "<td  >";
    worker +=
      "<font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"" +
      getLookProp(lookup, "url") +
      "\");' >Link</div></b></font>";
    worker += "</td>";
    worker += "</tr>";
  }
  if (Number(getLookProp(lookup, "bio")) > 0)
  {
    worker += "<tr>";
    worker += "<td>Biography</td>";
    worker += "<td>";
    worker +=
      "<font color='orange'><b><div style='cursor:pointer' onClick='window.opener.openSite(\"https://www.qrz.com/db/" +
      getLookProp(lookup, "call") +
      "\");'>Link</div></b></font>";
    worker += "</td>";
    worker += "</tr>";
  }
  worker += makeRow("Type", lookup, "type");
  worker += makeRow("Class", lookup, "class");
  worker += makeRow("Codes", lookup, "codes");
  worker += makeRow("QTH", lookup, "qth");
  var dates = joinIfBothWithDash(
    getLookProp(lookup, "efdate"),
    getLookProp(lookup, "expdate")
  );
  if (dates.length > 0)
  {
    worker += "<tr><td>Effective Dates</td><td>" + dates + "</td></tr>";
  }
  var Aliases = joinCommaIf(
    getLookProp(lookup, "aliases"),
    getLookProp(lookup, "p_call")
  );
  if (Aliases.length > 0)
  {
    worker +=
      "<tr title='" +
      Aliases +
      "' ><td>Aliases</td><td>" +
      Aliases +
      "</td></tr>";
  }
  worker += makeRow("Polish OT", lookup, "plot");
  worker += makeRow("German DOK", lookup, "dok");
  worker += makeYesNoRow("DOK is Sonder-DOK", lookup, "sondok");
  worker += makeRow("DXCC", lookup, "dxcc");
  worker += makeRow("CQ zone", lookup, "cqzone");
  worker += makeRow("ITU zone", lookup, "ituzone");
  worker += makeRow("IOTA", lookup, "iota");
  worker += makeRow("FIPS", lookup, "fips");
  worker += makeRow("FRN", lookup, "frn");
  worker += makeRow("Timezone", lookup, "TimeZone");
  worker += makeRow("GMT Offset", lookup, "GMTOffset");
  worker += makeRow("County", lookup, "county");
  worker += makeRow("Latitude", lookup, "lat");
  worker += makeRow("Longitude", lookup, "lon");
  worker += makeRow("Grid", lookup, "grid", true);
  if (
    getLookProp(lookup, "gtGrid").length > 0 &&
    getLookProp(lookup, "gtGrid").toUpperCase() !=
      getLookProp(lookup, "grid").toUpperCase()
  )
  {
    worker += makeRow("GT Grid", lookup, "gtGrid");
  }

  worker += makeRow("Born", lookup, "born");
  worker += makeYesNoRow("LoTW", lookup, "lotw");
  worker += makeYesNoRow("eQSL", lookup, "eqsl");
  worker += makeYesNoRow("Bureau QSL", lookup, "bqsl");
  worker += makeYesNoRow("Mail Direct QSL", lookup, "mqsl");
  worker += makeRow("QSL Via", lookup, "qsl_via");
  worker += makeRow("QRZ Admin", lookup, "user");
  worker += makeRow("Prefix", lookup, "prefix");
  worker += lookup.source;

  if (g_callsignLookups.lotwUseEnable == true && thisCall in g_lotwCallsigns)
  {
    lookup.ulotw =
      "&#10004; (" +
      userDayString(g_lotwCallsigns[thisCall] * 86400 * 1000) +
      ")";
    worker += makeRow("LoTW Member", lookup, "ulotw");
  }
  if (g_callsignLookups.eqslUseEnable == true && thisCall in g_eqslCallsigns)
  {
    lookup.ueqsl = "&#10004;";
    worker += makeRow("eQSL Member", lookup, "ueqsl");
  }
  if (g_callsignLookups.oqrsUseEnable == true && thisCall in g_oqrsCallsigns)
  {
    lookup.uoqrs = "&#10004;";
    worker += makeRow("ClubLog OQRS", lookup, "uoqrs");
  }

  if (fromCache)
  {
    worker +=
      "<tr><td>Cached Record</td><td>" +
      userTimeString(lookup.cached * 1000) +
      "</td></tr>";
  }

  worker += "</table>";
  var details =
    "<div class='mapItem' id='callDetails' style='padding:4px;'>" +
    worker +
    "</div>";

  var genMessage =
    "<tr><td colspan=2><div title=\"Clear\" class=\"button\" onclick=\"window.opener.clearLookup();\" >Clear</div> <div title=\"Generate Messages\" class=\"button\" onclick=\"window.opener.setCallAndGrid('" +
    getLookProp(lookup, "call") +
    "','" +
    getLookProp(lookup, "grid") +
    "');\">Generate Messages</div></td></tr>";

  setLookupDiv(
    "lookupInfoDiv",
    "<table align='center'><tr><td>" +
      card +
      "</td><td>" +
      details +
      "</td></tr>" +
      genMessage +
      "</table>"
  );
  setLookupDivHeight("lookupBoxDiv", getLookupWindowHeight() + "px");
}

function clearLookup()
{
  if (g_lookupWindowHandle)
  {
    g_lookupWindowHandle.window.lookupCallsignInput.value = "";
    lookupValidateCallByElement("lookupCallsignInput");
    setLookupDiv("lookupLocalDiv", "");
    setLookupDiv("lookupInfoDiv", "");
    setLookupDivHeight("lookupBoxDiv", getLookupWindowHeight() + "px");
  }
}

function addTextToClipboard(data)
{
  navigator.clipboard.writeText(data);
}

function saveToCsv(lookup)
{
  var name = joinSpaceIf(
    getLookProp(lookup, "fname"),
    getLookProp(lookup, "name")
  );
  var addr1 = getLookProp(lookup, "addr1");
  var addr2 =
    "\"" +
    joinCommaIf(
      getLookProp(lookup, "addr2"),
      joinSpaceIf(getLookProp(lookup, "state"), getLookProp(lookup, "zip"))
    ) +
    "\"";

  var country = getLookProp(lookup, "country");
  if (
    getLookProp(lookup, "land").length > 0 &&
    country != getLookProp(lookup, "land")
  )
  { country = getLookProp(lookup, "land"); }
  if (country == "United States") country = "";

  tryToWriteAdifToDocFolder(
    "thanks.csv",
    name + "," + addr1 + "," + addr2 + "," + country + "\r\n",
    true
  );
}

function makeYesNoRow(first, object, key)
{
  var value = getLookProp(object, key);
  if (value.length > 0)
  {
    var test = value.toUpperCase();
    if (test == "Y") return "<tr><td>" + first + "</td><td>Yes</td></tr>";
    if (test == "N") return "<tr><td>" + first + "</td><td>No</td></tr>";
    if (test == "?") return "";
    return (
      "<tr><td>" +
      first +
      "</td><td>" +
      (object[key] == 1 ? "Yes" : "No") +
      "</td></tr>"
    );
  }
  return "";
}

function makeRow(first, object, key, clip = false)
{
  var value = getLookProp(object, key);
  if (value.length > 0)
  {
    if (clip)
    {
      return (
        "<tr><td>" +
        first +
        "</td><td title='Copy to clipboard' style='cursor:pointer;color:cyan;font-weight: bold;' onClick='addTextToClipboard(\"" +
        object[key].substr(0, 45) +
        "\")'>" +
        object[key].substr(0, 45) +
        "</td></tr>"
      );
    }
    else
    {
      return (
        "<tr><td>" +
        first +
        "</td><td>" +
        object[key].substr(0, 45) +
        "</td></tr>"
      );
    }
  }
  return "";
}

function getLookProp(object, key)
{
  return object.hasOwnProperty(key) ? object[key] : "";
}

function joinSpaceIf(camera1, camera2)
{
  if (camera1.length > 0 && camera2.length > 0) return camera1 + " " + camera2;
  if (camera1.length > 0) return camera1;
  if (camera2.length > 0) return camera2;
  return "";
}

function joinCommaIf(camera1, camera2)
{
  if (camera1.length > 0 && camera2.length > 0)
  {
    if (camera1.indexOf(",") > -1) return camera1 + " " + camera2;
    else return camera1 + ", " + camera2;
  }
  if (camera1.length > 0) return camera1;
  if (camera2.length > 0) return camera2;
  return "";
}

function joinIfBothWithDash(camera1, camera2)
{
  if (camera1.length > 0 && camera2.length > 0)
  { return camera1 + " / " + camera2; }
  return "";
}

function startLookup(call, grid)
{
  if (call == "-") return;
  if (grid == "-") grid = "";

  openLookupWindow(true);

  lookupCallsign(call, grid);
}

function searchLogForCallsign(call)
{
  setLookupDiv("lookupLocalDiv", "");
  var list = Object.values(g_QSOhash)
    .filter(function (value)
    {
      return value.DEcall == call;
    })
    .sort(myBandCompare);

  if (list.length > 0)
  {
    var work = {};
    var conf = {};
    var lastTime = 0;
    var lastRow = null;
    var dxcc = list[0].dxcc;

    for (row in list)
    {
      var what = list[row].band + "," + list[row].mode;
      if (list[row].time > lastTime)
      {
        lastRow = row;
        lastTime = list[row].time;
      }
      if (list[row].confirmed)
      {
        conf[what] = g_pskColors[list[row].band];
        if (what in work) delete work[what];
      }
      else if (!(what in conf)) work[what] = g_pskColors[list[row].band];
    }
    var worker =
      "<div class='mapItemNoSize'><table align='center' class='darkTable'>";
    if (Object.keys(work).length > 0)
    {
      worker += "<tr><th style='color:yellow'>Worked</th><td>";
      var k = Object.keys(work).sort();
      for (var key in k)
      {
        worker += "<font color='#" + work[k[key]] + "'>" + k[key] + " </font>";
      }
      worker += "</td></tr>";
    }
    if (Object.keys(conf).length > 0)
    {
      worker += "<tr><th style='color:lightgreen'>Confirmed</th><td>";
      var k = Object.keys(conf).sort();
      for (var key in k)
      {
        worker += "<font color='#" + conf[k[key]] + "'>" + k[key] + " </font>";
      }
      worker += "</td></tr>";
    }
    if (lastRow)
    {
      worker += "<tr><th style='color:cyan'>Last QSO</th><td>";
      worker +=
        "<font color='#" +
        g_pskColors[list[lastRow].band] +
        "'>" +
        list[lastRow].band +
        "," +
        list[lastRow].mode +
        " </font> " +
        userTimeString(list[lastRow].time * 1000);
      worker += "</td></tr>";
    }

    worker +=
      "<tr><th style='color:orange'>" +
      g_dxccToAltName[dxcc] +
      " (" +
      g_worldGeoData[g_dxccToGeoData[dxcc]].pp +
      ")</th><td>";
    for (var band in g_colorBands)
    {
      if (String(dxcc) + g_colorBands[band] in g_tracker.worked.dxcc)
      {
        var strike = "";
        if (String(dxcc) + g_colorBands[band] in g_tracker.confirmed.dxcc)
        { strike = "text-decoration: underline overline;"; }
        worker +=
          "<div style='" +
          strike +
          "display:inline-block;color:#" +
          g_pskColors[g_colorBands[band]] +
          "'>" +
          g_colorBands[band] +
          "</div>&nbsp;";
      }
    }

    worker += "</td></tr></table></div>";
    setLookupDiv("lookupLocalDiv", worker);
  }

  list = null;
}

function startGenMessages(call, grid, instance = null)
{
  if (call == "-") return;
  if (grid == "-") grid = "";

  setCallAndGrid(call, grid, instance);
}

function is_dir(path)
{
  try
  {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  }
  catch (e)
  {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

// Old versions of GridTracker copied its own media files into the
// user's media directory. Clean out old duplicate files from the
// user directory if they have the same name and size in the
// system directory.
//
function purgeUserFiles(userDir, systemDir)
{
  var userFiles = fs.readdirSync(userDir);
  var systemFiles = fs.readdirSync(systemDir);
  userFiles.forEach((filename) =>
  {
    if (systemFiles.includes(filename))
    {
      var userPath = path.join(userDir, filename);
      var systemPath = path.join(systemDir, filename);
      console.log(userPath + " -- " + systemPath);
      if (fs.statSync(userPath).size == fs.statSync(systemPath).size)
      {
        console.log("removing duplicate user media " + filename);
        try
        {
          fs.unlinkSync(userPath);
        }
        catch (e)
        {
          console.log(e);
        }
      }
    }
  });
}

function mediaCheck()
{
  var homeDir =
    g_platform == "windows" ? process.env.USERPROFILE : process.env.HOME;

  g_appData = path.join(homeDir, "Dokumente");
  if (!is_dir(g_appData))
  {
    g_appData = path.join(homeDir, "Documents");
    if (!is_dir(g_appData))
    {
      if (g_appSettings.savedAppData != null)
      {
        g_appData = g_appSettings.savedAppData;
        if (!is_dir(g_appData)) return false;
      }
      else return false;
    }
  }

  g_appData = path.join(g_appData, "GridTracker");
  g_userMediaDir = path.join(g_appData, "media");
  g_jsonDir = path.join(g_appData, "data");
  g_screenshotDir = path.join(g_appData, "screenshots");
  g_scriptDir = path.join(g_appData, "scripts");

  g_NWappData = path.join(nw.App.dataPath, "Ginternal");

  try
  {
    var userdirs = [
      g_appData,
      g_NWappData,
      g_screenshotDir,
      g_scriptDir,
      g_userMediaDir
    ];
    for (var dir of userdirs)
    {
      if (!fs.existsSync(dir))
      {
        fs.mkdirSync(dir);
      }
    }
  }
  catch (e)
  {
    alert(
      "Unable to create or access " +
        g_appData +
        " folder.\r\nPermission violation, GT cannot continue"
    );
    nw.App.quit();
  }

  g_jsonDir += g_dirSeperator;
  g_NWappData += g_dirSeperator;
  g_screenshotDir += g_dirSeperator;
  g_scriptDir += g_dirSeperator;

  g_qsoLogFile = path.join(g_appData, "GridTracker_QSO.adif");

  logEventMedia.appendChild(newOption("none", "None"));
  msgAlertMedia.appendChild(newOption("none", "Select File"));
  alertMediaSelect.appendChild(newOption("none", "Select File"));
  huntCallsignNotifyMedia.appendChild(newOption("none", "Select File"));
  huntGridNotifyMedia.appendChild(newOption("none", "Select File"));
  huntDXCCNotifyMedia.appendChild(newOption("none", "Select File"));
  huntCQzNotifyMedia.appendChild(newOption("none", "Select File"));
  huntITUzNotifyMedia.appendChild(newOption("none", "Select File"));
  huntStatesNotifyMedia.appendChild(newOption("none", "Select File"));
  huntRosterNotifyMedia.appendChild(newOption("none", "Select File"));

  purgeUserFiles(g_userMediaDir, g_gtMediaDir);

  // add all the files in both directories to the list, user filenames
  // override system filenames later

  var mediaFiles = [].concat(
    fs.readdirSync(g_userMediaDir),
    fs.readdirSync(g_gtMediaDir)
  );
  mediaFiles.forEach((filename) =>
  {
    var noExt = path.parse(filename).name;
    logEventMedia.appendChild(newOption(filename, noExt));
    alertMediaSelect.appendChild(newOption(filename, noExt));
    huntCallsignNotifyMedia.appendChild(newOption(filename, noExt));
    huntGridNotifyMedia.appendChild(newOption(filename, noExt));
    huntDXCCNotifyMedia.appendChild(newOption(filename, noExt));
    huntCQzNotifyMedia.appendChild(newOption(filename, noExt));
    huntITUzNotifyMedia.appendChild(newOption(filename, noExt));
    huntStatesNotifyMedia.appendChild(newOption(filename, noExt));
    huntRosterNotifyMedia.appendChild(newOption(filename, noExt));
    msgAlertMedia.appendChild(newOption(filename, noExt));
  });

  var modeData = fs.readFileSync("./data/modes.json");
  g_modes = JSON.parse(modeData);
  for (var key in g_modes)
  {
    gtModeFilter.appendChild(newOption(key));
  }

  modeData = fs.readFileSync("./data/modes-phone.json");
  g_modes_phone = JSON.parse(modeData);

  initQSOdata();
  g_QSOhash = {};
  g_QSLcount = 0;
  g_QSOcount = 0;

  // Old log filename, no longer referenced
  tryToDeleteLog("lotw.adif");

  try
  {
    if (fs.existsSync(g_NWappData + "internal_qso.json"))
    {
      var data = JSON.parse(fs.readFileSync(g_NWappData + "internal_qso.json"));

      if (typeof data.version != "undefined" && data.version == gtVersion)
      {
        g_tracker = data.tracker;

        if (typeof g_tracker.worked.px == "undefined")
        {
          g_tracker.worked.px = {};
          g_tracker.confirmed.px = {};
        }

        g_QSOhash = data.g_QSOhash;

        for (var i in g_QSOhash)
        {
          if (
            typeof g_QSOhash[i].px == "undefined" ||
            g_QSOhash[i].px == null
          )
          {
            if (g_QSOhash[i].dxcc != -1)
            { g_QSOhash[i].px = getWpx(g_QSOhash[i].DEcall); }
            else g_QSOhash[i].px = null;
          }
          g_QSOcount++;
          if (g_QSOhash[i].confirmed) g_QSLcount++;
        }
      }
      else
      {
        clearLogFilesAndCounts();
      }

      fs.unlinkSync(g_NWappData + "internal_qso.json");
    }
    loadReceptionReports();
  }
  catch (e) {}

  return true;
}

function newOption(value, text)
{
  if (typeof text == "undefined") text = value;
  var option = document.createElement("option");
  option.value = value;
  option.text = text;
  return option;
}

var g_rosterSpot = false;
function setRosterSpot(enabled)
{
  g_rosterSpot = enabled;
}

function saveReceptionReports()
{
  try
  {
    fs.writeFileSync(
      g_NWappData + "spots.json",
      JSON.stringify(g_receptionReports)
    );
  }
  catch (e) {}
}

function loadReceptionReports()
{
  try
  {
    var clear = true;
    if (fs.existsSync(g_NWappData + "spots.json"))
    {
      g_receptionReports = JSON.parse(
        fs.readFileSync(g_NWappData + "spots.json")
      );
      if (timeNowSec() - g_receptionReports.lastDownloadTimeSec <= 86400)
      { clear = false; }
    }

    if (clear == true)
    {
      g_receptionReports = {
        lastDownloadTimeSec: 0,
        lastSequenceNumber: "0",
        spots: {}
      };
    }
  }
  catch (e)
  {
    g_receptionReports = {
      lastDownloadTimeSec: 0,
      lastSequenceNumber: "0",
      spots: {}
    };
  }
}

function pskSpotCheck(timeSec)
{
  if (g_mapSettings.offlineMode == true) return;

  if (myDEcall == null || myDEcall == "NOCALL" || myDEcall == "") return;

  if (
    timeSec - g_receptionReports.lastDownloadTimeSec > 120 &&
    (g_spotsEnabled == 1 || g_rosterSpot)
  )
  {
    g_receptionReports.lastDownloadTimeSec = timeSec;
    localStorage.receptionSettings = JSON.stringify(g_receptionSettings);
    spotRefreshDiv.innerHTML = "..refreshing..";
    getBuffer(
      "https://retrieve.pskreporter.info/query?rronly=1&lastseqno=" +
        g_receptionReports.lastSequenceNumber +
        "&senderCallsign=" +
        encodeURIComponent(myRawCall) +
        "&appcontact=" +
        encodeURIComponent("contact@gridtracker.org"),
      pskSpotResults,
      null,
      "https",
      443
    );
  }
  else if (g_spotsEnabled == 1)
  {
    spotRefreshDiv.innerHTML =
      "Refresh: " +
      Number(120 - (timeSec - g_receptionReports.lastDownloadTimeSec)).toDHMS();
  }
}

function pskSpotResults(buffer, flag)
{
  var oParser = new DOMParser();
  var oDOM = oParser.parseFromString(buffer, "text/xml");
  var result = "";
  if (oDOM != null)
  {
    var json = XML2jsobj(oDOM.documentElement);
    if (typeof json.lastSequenceNumber != "undefined")
    {
      g_receptionReports.lastSequenceNumber = json.lastSequenceNumber.value;

      if (typeof json.receptionReport != "undefined")
      {
        for (var key in json.receptionReport)
        {
          if (
            typeof json.receptionReport[key].frequency != "undefined" &&
            typeof json.receptionReport[key].sNR != "undefined"
          )
          {
            var report;
            var call = json.receptionReport[key].receiverCallsign;
            var mode = json.receptionReport[key].mode;
            var grid = json.receptionReport[key].receiverLocator.substr(0, 6);
            var band = Number(
              parseInt(json.receptionReport[key].frequency) / 1000000
            ).formatBand();
            var hash = call + mode + band + grid.substr(0, 4);

            if (hash in g_receptionReports.spots)
            {
              report = g_receptionReports.spots[hash];
              if (
                parseInt(json.receptionReport[key].flowStartSeconds) <
                report.when
              )
              { continue; }
            }
            else
            {
              report = g_receptionReports.spots[hash] = {};
              report.call = call;
              report.band = band;
              report.grid = grid.toUpperCase();
              report.mode = mode;
            }
            if (
              typeof json.receptionReport[key].receiverCallsign != "undefined"
            )
            {
              report.dxcc = callsignToDxcc(
                json.receptionReport[key].receiverCallsign
              );
            }
            else report.dxcc = -1;
            report.when = parseInt(json.receptionReport[key].flowStartSeconds);
            report.snr = json.receptionReport[key].sNR;
            report.freq = parseInt(json.receptionReport[key].frequency);

            var SNR = parseInt((parseInt(report.snr) + 25) * 9);
            if (SNR > 255) SNR = 255;
            if (SNR < 0) SNR = 0;
            report.color = SNR;
          }
        }
      }
    }
  }

  g_receptionReports.lastDownloadTimeSec = timeNowSec();

  localStorage.receptionSettings = JSON.stringify(g_receptionSettings);

  redrawSpots();
  if (g_rosterSpot) goProcessRoster();
}

var g_oamsSpotTimeout = null;

function addNewOAMSSpot(cid, db)
{
  if (cid in g_gtFlagPins)
  {
    if (g_oamsSpotTimeout !== null)
    {
      clearTimeout(g_oamsSpotTimeout);
      g_oamsSpotTimeout = null;
    }
    var report;
    var call = g_gtFlagPins[cid].call;
    var mode = g_gtFlagPins[cid].mode;
    var grid = g_gtFlagPins[cid].grid.substr(0, 6);
    var band = g_gtFlagPins[cid].band;
    var hash = call + mode + band + grid.substr(0, 4);

    if (hash in g_receptionReports.spots)
    {
      report = g_receptionReports.spots[hash];
    }
    else
    {
      report = g_receptionReports.spots[hash] = {};
      report.call = call;
      report.band = band;
      report.grid = grid;
      report.mode = mode;
    }

    report.dxcc = g_gtFlagPins[cid].dxcc;
    report.when = timeNowSec();
    report.snr = Number(db);
    report.freq = g_gtFlagPins[cid].freq;

    var SNR = parseInt((parseInt(report.snr) + 25) * 9);
    if (SNR > 255) SNR = 255;
    if (SNR < 0) SNR = 0;
    report.color = SNR;

    g_oamsSpotTimeout = setTimeout(redrawSpots, 500);
  }
}

function spotFeature(center)
{
  return new ol.Feature(
    ol.geom.Polygon.circular(center, 30000, 63).transform(
      "EPSG:4326",
      "EPSG:3857"
    )
  );
}

var g_spotTotalCount = 0;

function createSpot(report, key, fromPoint, addToLayer = true)
{
  var LL = squareToLatLongAll(report.grid);

  var Lat = LL.la2 - (LL.la2 - LL.la1) / 2;
  var Lon = LL.lo2 - (LL.lo2 - LL.lo1) / 2;

  var spot = spotFeature([Lon, Lat]);

  var colorNoAlpha = "#" + g_bandToColor[report.band];
  var colorAlpha = intAlphaToRGB(colorNoAlpha, report.color);
  var spotColor = colorAlpha;

  var workingColor =
    g_mapSettings.nightMapEnable && g_nightTime
      ? g_receptionSettings.pathNightColor
      : g_receptionSettings.pathColor;

  if (workingColor != -1)
  {
    var testColor =
      workingColor < 1
        ? "#0000000"
        : workingColor == 361
          ? "#FFFFFF"
          : "hsla(" + workingColor + ", 100%, 50%," + report.color / 255 + ")";
    if (workingColor < 1 || workingColor == 361)
    { spotColor = intAlphaToRGB(testColor.substr(0, 7), report.color); }
    else spotColor = testColor;
  }

  featureStyle = new ol.style.Style({
    fill: new ol.style.Fill({
      color: spotColor
    }),
    stroke: new ol.style.Stroke({
      color: "#000000FF",
      width: 0.25
    })
  });
  spot.setStyle(featureStyle);
  spot.spot = key;
  spot.size = 6; // Mouseover detection
  g_layerSources["psk-spots"].addFeature(spot);

  var toPoint = ol.proj.fromLonLat([Lon, Lat]);

  var lonLat = new ol.geom.Point(toPoint);

  var pointFeature = new ol.Feature({
    geometry: lonLat,
    weight: report.color / 255 // e.g. temperature
  });

  g_layerSources["psk-heat"].addFeature(pointFeature);

  if (g_receptionSettings.viewPaths && g_receptionSettings.spotWidth > 0)
  {
    var strokeWeight = g_receptionSettings.spotWidth;

    var flightColor =
      workingColor == -1
        ? colorNoAlpha + "BB"
        : g_mapSettings.nightMapEnable && g_nightTime
          ? g_spotNightFlightColor
          : g_spotFlightColor;

    var feature = flightFeature(
      [fromPoint, toPoint],
      {
        weight: strokeWeight,
        color: flightColor,
        steps: 75
      },
      "psk-flights",
      false
    );
  }
}
function redrawSpots()
{
  var shouldSave = false;
  var now = timeNowSec();
  g_spotTotalCount = 0;
  g_layerSources["psk-spots"].clear();
  g_layerSources["psk-flights"].clear();
  g_layerSources["psk-hop"].clear();
  g_layerSources["psk-heat"].clear();

  var fromPoint = getPoint(myRawGrid);

  if (g_receptionSettings.mergeSpots == false)
  {
    var spot = iconFeature(fromPoint, g_gtFlagIcon, 100);

    g_layerSources["psk-spots"].addFeature(spot);
    g_layerSources["psk-heat"].addFeature(spot);
  }

  for (var key in g_receptionReports.spots)
  {
    report = g_receptionReports.spots[key];

    if (now - report.when > 86400)
    {
      delete g_receptionReports.spots[key];
      shouldSave = true;
      continue;
    }

    if (
      (g_appSettings.gtBandFilter.length == 0 ||
        (g_appSettings.gtBandFilter == "auto"
          ? myBand == report.band
          : g_appSettings.gtBandFilter == report.band)) &&
      validateMapMode(report.mode)
    )
    {
      if (now - report.when <= g_receptionSettings.viewHistoryTimeSec)
      {
        createSpot(report, key, fromPoint);
        g_spotTotalCount++;
      }
    }
  }
  if (shouldSave)
  {
    saveReceptionReports();
  }

  updateSpotCountDiv();
}

function updateSpotCountDiv()
{
  spotCountDiv.innerHTML = "Spots: " + g_spotTotalCount;
}

var g_spotFlightColor = "#FFFFFFBB";
var g_spotNightFlightColor = "#FFFFFFBB";

function changeSpotValues()
{
  g_receptionSettings.viewHistoryTimeSec =
    parseInt(spotHistoryTimeValue.value) * 60;
  spotHistoryTimeTd.innerHTML =
    "Max Age: " + Number(g_receptionSettings.viewHistoryTimeSec).toDHM();
  g_receptionSettings.viewPaths = spotPathsValue.checked;

  if (g_receptionSettings.viewPaths)
  {
    spotPathWidthDiv.style.display = "inline-block";
  }
  else
  {
    spotPathWidthDiv.style.display = "none";
  }

  g_receptionSettings.mergeSpots = spotMergeValue.checked;
  localStorage.receptionSettings = JSON.stringify(g_receptionSettings);

  setTrophyOverlay(g_currentOverlay);
  updateSpotView();
  if (g_rosterSpot) goProcessRoster();
}

function mapTransChange()
{
  g_mapSettings.mapTrans = mapTransValue.value;

  mapTransTd.innerHTML =
    String(100 - parseInt(((g_mapSettings.mapTrans * 255) / 255) * 100)) + "%";
  mapSettingsDiv.style.backgroundColor =
    "rgba(0,0,0, " + g_mapSettings.mapTrans + ")";
}

function spotPathChange()
{
  g_receptionSettings.pathColor = spotPathColorValue.value;
  var pathColor =
    g_receptionSettings.pathColor < 1
      ? "#000"
      : g_receptionSettings.pathColor == 361
        ? "#FFF"
        : "hsl(" + g_receptionSettings.pathColor + ", 100%, 50%)";
  if (g_receptionSettings.pathColor > 0)
  {
    spotPathColorDiv.style.color = "#000";
    spotPathColorDiv.style.backgroundColor = pathColor;
  }
  else
  {
    spotPathColorDiv.style.color = "#FFF";
    spotPathColorDiv.style.backgroundColor = pathColor;
  }
  if (g_receptionSettings.pathColor == -1)
  { spotPathInfoTd.innerHTML = "PSK-Reporter Palette"; }
  else spotPathInfoTd.innerHTML = "";

  g_spotFlightColor =
    g_receptionSettings.pathColor < 1
      ? "#0000000BB"
      : g_receptionSettings.pathColor == 361
        ? "#FFFFFFBB"
        : "hsla(" + g_receptionSettings.pathColor + ", 100%, 50%,0.73)";

  g_receptionSettings.pathNightColor = spotNightPathColorValue.value;
  var pathNightColor =
    g_receptionSettings.pathNightColor < 1
      ? "#000"
      : g_receptionSettings.pathNightColor == 361
        ? "#FFF"
        : "hsl(" + g_receptionSettings.pathNightColor + ", 100%, 50%)";
  if (g_receptionSettings.pathNightColor > 0)
  {
    spotNightPathColorDiv.style.color = "#000";
    spotNightPathColorDiv.style.backgroundColor = pathNightColor;
  }
  else
  {
    spotNightPathColorDiv.style.color = "#FFF";
    spotNightPathColorDiv.style.backgroundColor = pathNightColor;
  }
  if (g_receptionSettings.pathNightColor == -1)
  { spotNightPathInfoTd.innerHTML = "PSK-Reporter Palette"; }
  else spotNightPathInfoTd.innerHTML = "";

  g_spotNightFlightColor =
    g_receptionSettings.pathNightColor < 1
      ? "#0000000BB"
      : g_receptionSettings.pathNightColor == 361
        ? "#FFFFFFBB"
        : "hsla(" + g_receptionSettings.pathNightColor + ", 100%, 50%,0.73)";

  spotWidthTd.innerHTML = g_receptionSettings.spotWidth = spotWidthValue.value;

  localStorage.receptionSettings = JSON.stringify(g_receptionSettings);
}

function toggleSpotOverGrids()
{
  spotMergeValue.checked = spotMergeValue.checked != true;
  changeSpotValues();
  redrawSpots();
}

function toggleMergeOverlay()
{
  mergeOverlayValue.checked = mergeOverlayValue.checked != true;
  changeMergeOverlayValue();
}

function toggleSpotPaths()
{
  var spotPaths = spotPathsValue.checked == true ? 1 : 0;
  spotPaths ^= 1;
  spotPathsValue.checked = spotPaths == 1;
  g_receptionSettings.viewPaths = spotPathsValue.checked;
  localStorage.receptionSettings = JSON.stringify(g_receptionSettings);

  if (g_receptionSettings.viewPaths)
  {
    spotPathWidthDiv.style.display = "inline-block";
  }
  else
  {
    spotPathWidthDiv.style.display = "none";
  }
  redrawSpots();
}

function toggleHeatSpots()
{
  g_heatEnabled ^= 1;
  g_appSettings.heatEnabled = g_heatEnabled;
  updateSpotView();
}

function togglePskSpots()
{
  g_spotsEnabled ^= 1;
  g_appSettings.spotsEnabled = g_spotsEnabled;
  pskSpotsImg.style.filter = g_spotsEnabled == 1 ? "" : "grayscale(1)";
  setTrophyOverlay(g_currentOverlay);
  updateSpotView();
}

function toggleCRScript()
{
  g_crScript ^= 1;
  g_appSettings.crScript = g_crScript;
  if (g_crScript == 1)
  {
    addLastTraffic(
      "<font style='color:lightgreen'>Call Roster Script Enabled</font>"
    );
  }
  else
  {
    addLastTraffic(
      "<font style='color:yellow'>Call Roster Script Disabled</font>"
    );
  }
  goProcessRoster();
}

function updateSpotView(leaveCount = true)
{
  if (g_spotsEnabled == 1)
  {
    if (g_receptionSettings.mergeSpots == false)
    {
      for (var key in g_layerVectors)
      {
        g_layerVectors[key].setVisible(false);
      }
    }
    if (g_heatEnabled == 0)
    {
      g_layerVectors["psk-spots"].setVisible(true);
      g_layerVectors["psk-flights"].setVisible(true);
      g_layerVectors["psk-hop"].setVisible(true);
      g_layerVectors["psk-heat"].setVisible(false);
    }
    else
    {
      g_layerVectors["psk-spots"].setVisible(false);
      g_layerVectors["psk-flights"].setVisible(false);
      g_layerVectors["psk-hop"].setVisible(false);
      g_layerVectors["psk-heat"].setVisible(true);
    }

    SpotsDiv.style.display = "block";
    if (leaveCount == false) spotRefreshDiv.innerHTML = "&nbsp;";
  }
  else
  {
    g_layerVectors["psk-spots"].setVisible(false);
    g_layerVectors["psk-flights"].setVisible(false);
    g_layerVectors["psk-hop"].setVisible(false);
    g_layerVectors["psk-heat"].setVisible(false);
    SpotsDiv.style.display = "none";
    spotRefreshDiv.innerHTML = "&nbsp;";
  }
  g_layerVectors.strikes.setVisible(true);
}

function gotoDonate()
{
  var gui = require("nw.gui");
  gui.Shell.openExternal("https://gridtracker.org/donations/");
}

function changeRosterTime()
{
  g_mapSettings.rosterTime = rosterTime.value;
  setRosterTimeView();
  saveMapSettings();
  goProcessRoster();
}

function changeRosterTop(butt)
{
  g_appSettings.rosterAlwaysOnTop = butt.checked;
  setRosterTop();
}

function setRosterTop()
{
  if (g_callRosterWindowHandle)
  {
    try
    {
      g_callRosterWindowHandle.setAlwaysOnTop(g_appSettings.rosterAlwaysOnTop);
    }
    catch (e) {}
  }
}

function setRosterTimeView()
{
  rosterTime.value = g_mapSettings.rosterTime;
  rosterTimeTd.innerHTML = Number(rosterTime.value).toDHMS();
}

function getSpotTime(hash)
{
  if (hash in g_receptionReports.spots)
  {
    return g_receptionReports.spots[hash];
  }
  else return null;
}

function setGridOpacity()
{
  opacityValue.value = g_mapSettings.gridAlpha;
  showOpacityTd.innerHTML =
    parseInt((g_mapSettings.gridAlpha / 255) * 100) + "%";
  g_gridAlpha = parseInt(g_mapSettings.gridAlpha).toString(16);
}

function changeGridOpacity()
{
  g_mapSettings.gridAlpha = opacityValue.value;
  showOpacityTd.innerHTML =
    parseInt((g_mapSettings.gridAlpha / 255) * 100) + "%";
  g_gridAlpha = parseInt(g_mapSettings.gridAlpha).toString(16);
  saveMapSettings();
}

function currentTimeStampString()
{
  var now = new Date();
  return (
    now.getFullYear() +
    "-" +
    (now.getMonth() + 1) +
    "-" +
    now.getDate() +
    " " +
    now.getHours().pad() +
    "." +
    now.getMinutes().pad() +
    "." +
    now.getSeconds().pad()
  );
}

function showNativeFolder(fn)
{
  nw.Shell.showItemInFolder(decodeURI(fn));
}

function makeScreenshots()
{
  var win = gui.Window.get();

  win.capturePage(
    function (buffer)
    {
      var clipboard = nw.Clipboard.get();
      clipboard.set(buffer, "png", true);
    },
    { format: "png", datatype: "raw" }
  );

  win.capturePage(
    function (buffer)
    {
      try
      {
        var fn =
          g_screenshotDir + "Screenshot " + currentTimeStampString() + ".png";
        fs.writeFileSync(fn, buffer);
        addLastTraffic(
          "<font style='color:lightgreen;cursor:pointer;' onclick='showNativeFolder(\"" +
            encodeURI(fn).trim() +
            "\");''>Saved Screenshot</font>"
        );
      }
      catch (e)
      {
        addLastTraffic(
          "<font style='color:red'>Screenshot write failed</font>"
        );
      }
    },
    { format: "png", datatype: "buffer" }
  );
}

window.addEventListener("load", function ()
{
  picker.attach({
    target: "workingDateValue",
    container: "pick-inline",
    fire: "workingDateChanged"
  });
});
