// GridTracker Copyright © 2021 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var fs = require("fs");

var callRoster = {};
var g_blockedCalls = {};
var g_blockedCQ = {};
var g_blockedDxcc = {};
var g_scriptReport = {};
var g_worked = {};
var g_confirmed = {};
var g_modes = {};
var g_modes_phone = {};
var g_currentUSCallsigns = null;
var r_currentUSState = "";
var r_currentDXCCs = -1;
var r_callsignManifest = null;
var g_rosterSettings = {};
var g_day = 0;
var g_menu = null;
var g_callMenu = null;
var g_ageMenu = null;
var g_callingMenu = null;
var g_compactMenu = null;
var g_targetHash = "";
var g_clearIgnores = null;
var g_clearIgnoresCall = null;
var g_dxccMenu = null;
var g_targetDxcc = -1;
var g_clearDxccIgnore = null;
var g_clearDxccIgnoreMainMenu = null;
var g_CQMenu = null;
var g_targetCQ = "";
var g_clearCQIgnore = null;
var g_clearCQIgnoreMainMenu = null;
var g_timerInterval = null;
var g_regFocus = false;
var g_awards = {};
var g_awardTypes = {};
var g_awardTracker = {};
var g_callsignDatabaseDXCC = {};
var g_callsignDatabaseUS = {};
var g_callsignDatabaseUSplus = {};

var g_developerMode = process.versions["nw-flavor"] == "sdk";

var g_modeColors = {};
g_modeColors.FT4 = "1111FF";
g_modeColors.FT8 = "11FF11";
g_modeColors.JT4 = "EE1111";
g_modeColors.JT9 = "7CFC00";
g_modeColors.JT65 = "E550E5";
g_modeColors.QRA64 = "FF00FF";
g_modeColors.MSK144 = "4949FF";

var g_defaultSettings = {
  callsign: "all",
  hunting: "dxcc",
  huntNeed: "confirmed",
  requireGrid: true,
  wantMaxDT: false,
  wantMinDB: false,
  wantMinFreq: false,
  wantMaxFreq: false,
  maxDT: 0.5,
  minDb: -25,
  minFreq: 0,
  maxFreq: 3500,
  noMyDxcc: false,
  onlyMyDxcc: false,
  noMsg: false,
  noMsgValue: "CQ RU",
  onlyMsg: false,
  onlyMsgValue: "CQ FD",
  cqOnly: true,
  usesLoTW: false,
  maxLoTW: 27,
  useseQSL: false,
  usesOQRS: false,
  onlySpot: false,
  allOnlyNew: false,
  useRegex: false,
  callsignRegex: "",
  realtime: false,
  wanted: {
    huntCallsign: false,
    huntGrid: true,
    huntDXCC: true,
    huntCQz: false,
    huntITUz: false,
    huntState: false,
    huntCounty: false,
    huntCont: false,
    huntPX: false,
    huntQRZ: true,
    huntOAMS: false
  },
  columns: {
    Band: false,
    Mode: false,
    Calling: true,
    Msg: false,
    DXCC: true,
    Flag: true,
    State: true,
    County: true,
    Cont: true,
    dB: true,
    Freq: false,
    DT: false,
    Dist: false,
    Azim: true,
    CQz: false,
    ITUz: false,
    PX: true,
    LoTW: false,
    eQSL: false,
    OQRS: false,
    Spot: false,
    Life: false,
    OAMS: true,
    Age: true
  },
  reference: 0,
  controls: true,
  controlsExpanded: false,
  compact: false,
  settingProfiles: false,
  lastSortIndex: 6,
  lastSortReverse: 1
};

const LOGBOOK_LIVE_BAND_LIVE_MODE = "0";
const LOGBOOK_LIVE_BAND_MIX_MODE = "1";
const LOGBOOK_LIVE_BAND_DIGI_MODE = "2";
const LOGBOOK_MIX_BAND_LIVE_MODE = "3";
const LOGBOOK_MIX_BAND_MIX_MODE = "4";
const LOGBOOK_MIX_BAND_DIGI_MODE = "5";
const LOGBOOK_AWARD_TRACKER = "6";

const LAYERED_MODE_FOR = {}
LAYERED_MODE_FOR[LOGBOOK_MIX_BAND_LIVE_MODE] = LOGBOOK_LIVE_BAND_LIVE_MODE;
LAYERED_MODE_FOR[LOGBOOK_MIX_BAND_MIX_MODE] = LOGBOOK_LIVE_BAND_MIX_MODE;
LAYERED_MODE_FOR[LOGBOOK_MIX_BAND_DIGI_MODE] = LOGBOOK_LIVE_BAND_DIGI_MODE;

document.addEventListener("dragover", function (event)
{
  event.preventDefault();
});

document.addEventListener("drop", function (event)
{
  event.preventDefault();
});

window.addEventListener("message", receiveMessage, false);

if (typeof localStorage.blockedCQ == "undefined")
{
  localStorage.blockedCQ = "{}";
}

if (typeof localStorage.awardTracker == "undefined")
{
  localStorage.awardTracker = "{}";
  g_rosterSettings = {};
  writeRosterSettings();
}

g_awardTracker = JSON.parse(localStorage.awardTracker);

if (typeof localStorage.blockedCalls != "undefined")
{
  g_blockedCalls = JSON.parse(localStorage.blockedCalls);
  g_blockedCQ = JSON.parse(localStorage.blockedCQ);
  g_blockedDxcc = JSON.parse(localStorage.blockedDxcc);
}

function storeBlocks()
{
  localStorage.blockedCalls = JSON.stringify(g_blockedCalls);
  localStorage.blockedCQ = JSON.stringify(g_blockedCQ);
  localStorage.blockedDxcc = JSON.stringify(g_blockedDxcc);
}

function storeAwardTracker()
{
  localStorage.awardTracker = JSON.stringify(g_awardTracker);
}

function loadSettings()
{
  var readSettings = {};
  if (typeof localStorage.rosterSettings != "undefined")
  {
    readSettings = JSON.parse(localStorage.rosterSettings);
  }
  g_rosterSettings = deepmerge(g_defaultSettings, readSettings);

  if ("GT" in g_rosterSettings.columns) delete g_rosterSettings.columns.GT;

  writeRosterSettings();
}

function writeRosterSettings()
{
  localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
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

function timeNowSec()
{
  return parseInt(Date.now() / 1000);
}

function lockNewWindows()
{
  if (typeof nw != "undefined")
  {
    var gui = require("nw.gui");
    var win = gui.Window.get();
    win.on("new-win-policy", function (frame, url, policy)
    {
      gui.Shell.openExternal(url);
      policy.ignore();
    });
  }
}

function myCallCompare(a, b)
{
  return a.DEcall.localeCompare(b.DEcall);
}

function myGridCompare(a, b)
{
  var gridA = a.grid ? a.grid : "0";
  var gridB = b.grid ? b.grid : "0";

  if (gridA > gridB) return 1;
  if (gridA < gridB) return -1;
  return 0;
}

function myDxccCompare(a, b)
{
  return window.opener.myDxccCompare(a, b);
}

function myTimeCompare(a, b)
{
  if (a.age > b.age) return 1;
  if (a.age < b.age) return -1;
  return 0;
}

function myLifeCompare(a, b)
{
  if (a.life > b.life) return 1;
  if (a.life < b.life) return -1;
  return 0;
}

function mySpotCompare(a, b)
{
  if (a.spot.when > b.spot.when) return 1;
  if (a.spot.when < b.spot.when) return -1;
  return 0;
}

function myDbCompare(a, b)
{
  if (a.RSTsent > b.RSTsent) return 1;
  if (a.RSTsent < b.RSTsent) return -1;
  return 0;
}

function myFreqCompare(a, b)
{
  if (a.delta > b.delta) return 1;
  if (a.delta < b.delta) return -1;
  return 0;
}

function myDTCompare(a, b)
{
  if (a.dt > b.dt) return 1;
  if (a.dt < b.dt) return -1;
  return 0;
}

function myDistanceCompare(a, b)
{
  if (a.distance > b.distance) return 1;
  if (a.distance < b.distance) return -1;
  return 0;
}

function myHeadingCompare(a, b)
{
  if (a.heading > b.heading) return 1;
  if (a.heading < b.heading) return -1;
  return 0;
}

function myStateCompare(a, b)
{
  if (a.state == null) return 1;
  if (b.state == null) return -1;
  if (a.state > b.state) return 1;
  if (a.state < b.state) return -1;
  return 0;
}

function myCQCompare(a, b)
{
  return a.DXcall.localeCompare(b.DXcall);
}

function myWPXCompare(a, b)
{
  if (a.px == null) return 1;
  if (b.px == null) return -1;
  if (a.px > b.px) return 1;
  if (a.px < b.px) return -1;
  return 0;
}

function myCntyCompare(a, b)
{
  if (a.cnty == null) return 1;
  if (b.cnty == null) return -1;
  if (a.cnty.substr(3) > b.cnty.substr(3)) return 1;
  if (a.cnty.substr(3) < b.cnty.substr(3)) return -1;
  return 0;
}

function myContCompare(a, b)
{
  if (a.cont == null) return 1;
  if (b.cont == null) return -1;
  if (a.cont > b.cont) return 1;
  if (a.cont < b.cont) return -1;
  return 0;
}
function myGTCompare(a, b)
{
  if (a.style.gt != 0 && b.style.gt == 0) return 1;
  if (a.style.gt == 0 && b.style.gt != 0) return -1;
  return 0;
}

var r_sortFunction = [
  myCallCompare,
  myGridCompare,
  myDbCompare,
  myDTCompare,
  myFreqCompare,
  myDxccCompare,
  myTimeCompare,
  myDistanceCompare,
  myHeadingCompare,
  myStateCompare,
  myCQCompare,
  myWPXCompare,
  myLifeCompare,
  mySpotCompare,
  myGTCompare,
  myCntyCompare,
  myContCompare
];

function showRosterBox(sortIndex)
{
  if (g_rosterSettings.lastSortIndex != sortIndex)
  {
    g_rosterSettings.lastSortIndex = sortIndex;
    g_rosterSettings.lastSortReverse = 0;
  }
  else
  {
    g_rosterSettings.lastSortReverse ^= 1;
  }

  writeRosterSettings();

  window.opener.goProcessRoster();
}

function hashMaker(start, callObj, reference)
{
  if (reference == LOGBOOK_LIVE_BAND_LIVE_MODE) return `${start}${callObj.band}${callObj.mode}`;

  if (reference == LOGBOOK_AWARD_TRACKER) return `${start}${callObj.band}${callObj.mode}`;

  if (reference == LOGBOOK_LIVE_BAND_MIX_MODE) return `${start}${callObj.band}`;

  if (reference == LOGBOOK_LIVE_BAND_DIGI_MODE) return `${start}${callObj.band}dg`;

  if (reference == LOGBOOK_MIX_BAND_LIVE_MODE) return `${start}${callObj.mode}`;

  if (reference == LOGBOOK_MIX_BAND_MIX_MODE) return `${start}`;

  if (reference == LOGBOOK_MIX_BAND_DIGI_MODE) return `${start}dg`;

  return "";
}

function processRoster(roster)
{
  callRoster = roster;
  viewRoster();
}

function viewRoster()
{
  var bands = Object();
  var modes = Object();

  var callMode = g_rosterSettings.callsign;
  var onlyHits = false;
  var isAwardTracker = false;

  if (callMode == "hits")
  {
    callMode = "all";
    onlyHits = true;
  }
  if (referenceNeed.value == LOGBOOK_AWARD_TRACKER)
  {
    callMode = "all";
    onlyHits = false;
    isAwardTracker = true;
    g_rosterSettings.huntNeed = "confirmed";
  }

  var canMsg =
    window.opener.g_mapSettings.offlineMode == false &&
    window.opener.g_appSettings.gtShareEnable == "true" &&
    window.opener.g_appSettings.gtMsgEnable == "true";

  if (window.opener.g_callsignLookups.lotwUseEnable == true)
  {
    usesLoTWDiv.style.display = "";
    if (g_rosterSettings.usesLoTW == true)
    {
      maxLoTW.style.display = "";
      maxLoTWView.style.display = "";
    }
    else
    {
      maxLoTW.style.display = "none";
      maxLoTWView.style.display = "none";
    }
  }
  else
  {
    usesLoTWDiv.style.display = "none";
    maxLoTW.style.display = "none";
    maxLoTWView.style.display = "none";
  }

  if (window.opener.g_callsignLookups.eqslUseEnable == true) useseQSLDiv.style.display = "";
  else useseQSLDiv.style.display = "none";

  if (window.opener.g_callsignLookups.oqrsUseEnable == true) usesOQRSDiv.style.display = "";
  else usesOQRSDiv.style.display = "none";

  if (g_rosterSettings.columns.Spot == true) onlySpotDiv.style.display = "";
  else onlySpotDiv.style.display = "none";

  if (callMode == "all") allOnlyNewDiv.style.display = "";
  else allOnlyNewDiv.style.display = "none";

  var huntIndex, workedIndex, layeredMode;
  if (g_rosterSettings.huntNeed == "mixed")
  {
    huntIndex = g_confirmed;
    workedIndex = g_worked;
    layeredMode = LAYERED_MODE_FOR[String(g_rosterSettings.reference)];
  }
  else if (g_rosterSettings.huntNeed == "worked")
  {
    huntIndex = g_worked;
    workedIndex = false;
    layeredMode = false;
  }
  else if (g_rosterSettings.huntNeed == "confirmed")
  {
    huntIndex = g_confirmed;
    workedIndex = g_worked;
    layeredMode = false;
  }
  else
  {
    huntIndex = false;
    workedIndex = false;
    layeredMode = false;
  }

  var now = timeNowSec();

  // First loop, exclude calls, mostly based on "Exceptions" settings
  for (var callHash in callRoster)
  {
    var entry = callRoster[callHash];
    var callObj = entry.callObj;

    var call = entry.DEcall;

    entry.tx = true;
    callObj.shouldAlert = false;
    callObj.reason = Array();
    callObj.awardReason = "Callsign";

    if (now - callObj.age > window.opener.g_mapSettings.rosterTime)
    {
      entry.tx = false;
      entry.alerted = false;
      callObj.qrz = false;
      callObj.reset = true;
      continue;
    }
    if (window.opener.g_instances[callObj.instance].crEnable == false)
    {
      entry.tx = false;
      continue;
    }
    if (call in g_blockedCalls)
    {
      entry.tx = false;
      continue;
    }
    if (
      entry.DXcall + " from All" in g_blockedCQ ||
      entry.DXcall + " from " + window.opener.g_dxccToAltName[callObj.dxcc] in g_blockedCQ
    )
    {
      entry.tx = false;
      continue;
    }
    if (callObj.dxcc in g_blockedDxcc)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.cqOnly == true && callObj.CQ == false)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.useRegex && g_rosterSettings.callsignRegex.length > 0)
    {
      try
      {
        if (!call.match(g_rosterSettings.callsignRegex))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }
    if (g_rosterSettings.requireGrid == true && callObj.grid.length != 4)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMinDB == true && entry.message.SR < g_rosterSettings.minDb)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMaxDT == true && Math.abs(entry.message.DT) > g_rosterSettings.maxDT)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMinFreq == true && entry.message.DF < g_rosterSettings.minFreq)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMaxFreq == true && entry.message.DF > g_rosterSettings.maxFreq)
    {
      entry.tx = false;
      continue;
    }

    if (g_rosterSettings.noMsg == true)
    {
      try
      {
        if (callObj.msg.match(g_rosterSettings.noMsgValue))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }
    if (g_rosterSettings.onlyMsg == true)
    {
      try
      {
        if (!callObj.msg.match(g_rosterSettings.onlyMsgValue))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }

    if (callObj.dxcc == window.opener.g_myDXCC)
    {
      if (g_rosterSettings.noMyDxcc == true)
      {
        entry.tx = false;
        continue;
      }
    }
    else
    {
      if (g_rosterSettings.onlyMyDxcc == true)
      {
        entry.tx = false;
        continue;
      }
    }

    if (window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.usesLoTW == true)
    {
      if (!(call in window.opener.g_lotwCallsigns))
      {
        entry.tx = false;
        continue;
      }
      if (g_rosterSettings.maxLoTW < 27)
      {
        var months = (g_day - window.opener.g_lotwCallsigns[call]) / 30;
        if (months > g_rosterSettings.maxLoTW)
        {
          entry.tx = false;
          continue;
        }
      }
    }

    if (window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.useseQSL == true)
    {
      if (!(call in window.opener.g_eqslCallsigns))
      {
        entry.tx = false;
        continue;
      }
    }

    if (window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.usesOQRS == true)
    {
      if (!(call in window.opener.g_oqrsCallsigns))
      {
        entry.tx = false;
        continue;
      }
    }

    if (callMode != "all")
    {
      if (entry.DXcall == "CQ DX" && callObj.dxcc == window.opener.g_myDXCC)
      {
        entry.tx = false;
        continue;
      }

      var hash = hashMaker(call, callObj, g_rosterSettings.reference);
      if (callMode == "worked" && hash in g_worked.call)
      {
        entry.tx = false;
        continue;
      }
      if (callMode == "confirmed" && hash in g_confirmed.call)
      {
        entry.tx = false;
        continue;
      }

      if (g_rosterSettings.hunting == "grid")
      {
        var hash = hashMaker(callObj.grid.substr(0, 4),
          callObj, g_rosterSettings.reference);
        if (huntIndex && hash in huntIndex.grid)
        {
          entry.tx = false;
          continue;
        }
        if (callObj.grid.length == 0)
        {
          entry.tx = false;
          continue;
        }
        continue;
      }
      if (g_rosterSettings.hunting == "dxcc")
      {
        var hash = hashMaker(String(callObj.dxcc),
          callObj, g_rosterSettings.reference);

        if (huntIndex && (hash in huntIndex.dxcc))
        {
          entry.tx = false;
          continue;
        }

        continue;
      }

      if (g_rosterSettings.hunting == "dxccs" && r_currentDXCCs != -1)
      {
        if (callObj.dxcc != r_currentDXCCs)
        {
          entry.tx = false;
          continue;
        }
      }

      if (g_rosterSettings.hunting == "wpx")
      {
        if (String(callObj.px) == null)
        {
          entry.tx = false;
          continue;
        }
        var hash = hashMaker(String(callObj.px),
          callObj, g_rosterSettings.reference);

        if (huntIndex && (hash in huntIndex.px))
        {
          entry.tx = false;
          continue;
        }

        continue;
      }

      if (g_rosterSettings.hunting == "cq")
      {
        var huntTotal = callObj.cqza.length;
        if (huntTotal == 0 || !huntIndex)
        {
          entry.tx = false;
          continue;
        }
        var huntFound = 0;
        for (index in callObj.cqza)
        {
          var hash = hashMaker(callObj.cqza[index], callObj, g_rosterSettings.reference);

          if (hash in huntIndex.cqz) huntFound++;
        }
        if (huntFound == huntTotal)
        {
          entry.tx = false;
          continue;
        }

        continue;
      }

      if (g_rosterSettings.hunting == "itu")
      {
        var huntTotal = callObj.ituza.length;
        if (huntTotal == 0 || !huntIndex)
        {
          entry.tx = false;
          continue;
        }
        var huntFound = 0;
        for (index in callObj.ituza)
        {
          var hash = hashMaker(callObj.ituza[index], callObj, g_rosterSettings.reference);

          if (hash in huntIndex.ituz) huntFound++;
        }
        if (huntFound == huntTotal)
        {
          entry.tx = false;
          continue;
        }

        if (callObj.grid.length == 0)
        {
          entry.tx = false;
          continue;
        }
        continue;
      }

      if (g_rosterSettings.hunting == "usstates" && window.opener.g_callsignLookups.ulsUseEnable == true)
      {
        var state = callObj.state;
        var finalDxcc = callObj.dxcc;
        if (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6)
        {
          if (state in window.opener.g_StateData)
          {
            var hash = hashMaker(state, callObj, g_rosterSettings.reference);

            if (huntIndex && hash in huntIndex.state)
            {
              entry.tx = false;
              continue;
            }
          }
          else entry.tx = false;
        }
        else entry.tx = false;

        continue;
      }

      if (g_rosterSettings.hunting == "usstate" && g_currentUSCallsigns)
      {
        if (call in g_currentUSCallsigns)
        {
          // Do Nothing
        }
        else
        {
          entry.tx = false;
          continue;
        }
        continue;
      }
    }
    if (isAwardTracker)
    {
      var tx = false;
      var baseHash = hashMaker("", callObj, g_rosterSettings.reference);

      for (var award in g_awardTracker)
      {
        if (g_awardTracker[award].enable)
        {
          tx = testAward(award, callObj, baseHash);
          if (tx)
          {
            var x = g_awardTracker[award];
            callObj.awardReason =
              g_awards[x.sponsor].awards[x.name].tooltip +
              " (" +
              g_awards[x.sponsor].sponsor +
              ")";

            break;
          }
        }
      }
      entry.tx = tx;
    }
  }

  var hasGtPin = false;

  var newCallList = Array();
  var inversionAlpha = "DD";
  var row = "#000000";
  var bold = "#000000;font-weight: bold;";
  var unconf = "background-clip:padding-box;box-shadow: 0 0 7px 3px inset ";
  var layeredAlpha = "77";
  var layeredInversionAlpha = "66";
  var layeredUnconf = "background-clip:padding-box;box-shadow: 0 0 4px 2px inset ";
  var layeredUnconfAlpha = "AA";

  // Second loop, hunting and highlighting
  for (var callHash in callRoster)
  {
    var entry = callRoster[callHash];
    var callObj = entry.callObj;

    // Special case check for called station
    if (callObj.qrz == true && entry.tx == false)
    {
      // The instance has to be enabled
      if (window.opener.g_instances[callObj.instance].crEnable == true)
      {
        // Calling us, but we wouldn't normally display
        // If they are not ignored or we're in a QSO with them, var it through

        if ((!(entry.DEcall in g_blockedCalls) && !(callObj.dxcc in g_blockedDxcc)) ||
          window.opener.g_instances[callObj.instance].status.DXcall == entry.DEcall)
        {
          entry.tx = true;
        }
      }
    }

    // Only render entries with `tx == true`, ignore the rest
    if (callObj.dxcc != -1 && entry.tx == true)
    {
      // In layered mode ("Hunting: mixed") the workHashSuffix becomes a more stricter 'live band',
      // while the layered suffix is a broader 'mixed band'
      var workHashSuffix, layeredHashSuffix;
      if (layeredMode)
      {
        workHashSuffix = hashMaker("", callObj, layeredMode);
        layeredHashSuffix = hashMaker("", callObj, g_rosterSettings.reference);
      }
      else
      {
        workHashSuffix = hashMaker("", callObj, g_rosterSettings.reference);
        layeredHashSuffix = false
      }
      var workHash = workHashSuffix; // TODO: Remove after replacing all occurrences with Suffix

      var callsign = entry.DEcall;

      callObj.hunting = {}
      callObj.callFlags = {}

      var colorObject = Object();

      var callPointer = callObj.CQ == true ? "cursor:pointer" : "";

      var didWork = false;

      var call = "#FFFF00";
      var grid = "#00FFFF";
      var calling = "#90EE90";
      var dxcc = "#FFA500";
      var state = "#90EE90";
      var cnty = "#CCDD00";
      var cont = "#00DDDD";
      var cqz = "#DDDDDD";
      var ituz = "#DDDDDD";
      var wpx = "#FFFF00";

      hasGtPin = false;
      var shouldAlert = false;
      var callBg, gridBg, callingBg, dxccBg, stateBg, cntyBg, contBg, cqzBg, ituzBg, wpxBg, gtBg;
      var callConf, gridConf, callingConf, dxccConf, stateConf, cntyConf, contConf, cqzConf, ituzConf, wpxConf;

      callBg = gridBg = callingBg = dxccBg = stateBg = cntyBg = contBg = cqzBg = ituzBg = wpxBg = gtBg = row;

      callConf = gridConf = callingConf = dxccConf = stateConf = cntyConf = contConf = cqzConf = ituzConf = wpxConf =
        "";

      var hash = callsign + workHashSuffix;
      var layeredHash = layeredHashSuffix && (callsign + layeredHashSuffix)

      // Call worked in current logbook settings, regardless of hunting mode
      if (hash in g_worked.call)
      {
        callObj.callFlags.worked = true;
        didWork = true;
        callConf = `${unconf}${call}${inversionAlpha};`;

        if (hash in g_confirmed.call)
        {
          callObj.callFlags.confirmed = true;
          callPointer = "text-decoration: line-through; ";
          callConf = "";
        }
      }

      // Calls that have OAMS chat support
      if (
        callsign in window.opener.g_gtCallsigns &&
        window.opener.g_gtCallsigns[callsign] in window.opener.g_gtFlagPins &&
        window.opener.g_gtFlagPins[window.opener.g_gtCallsigns[callsign]].canmsg == true
      )
      {
        callObj.callFlags.oams = true;
        // grab the CID
        colorObject.gt = window.opener.g_gtCallsigns[callsign];
        hasGtPin = true;
      }
      else
      {
        colorObject.gt = 0;
      }

      // We only do hunt highlighting when showing all entries
      // This means "Callsigns: All Traffic", "Callsigns: All Traffic/Only Wanted" and "Logbook: Award Tracker"
      // There is no highlighting in other modes
      if (callMode == "all")
      {
        // Skip when "only new calls"
        // Questions: Move to the first loop? Why only skip new calls in "all traffic" and not other modes?
        if (allOnlyNew.checked == true && didWork && callObj.qrz == false)
        {
          entry.tx = false;
          continue;
        }

        // Hunting for callsigns
        if (huntCallsign.checked == true)
        {
          var hash = callsign + workHashSuffix;
          var layeredHash = layeredMode && (callsign + layeredHashSuffix)

          if (huntIndex && !(hash in huntIndex.call))
          {
            shouldAlert = true;

            callObj.reason.push("call");

            if (workedIndex && hash in workedIndex.call)
            {
              if (layeredMode && layeredHash in huntIndex.call)
              {
                callObj.hunting.call = "worked-and-mixed";
                callConf = `${layeredUnconf}${call}${layeredUnconfAlpha};`;
                callBg = `${call}${layeredInversionAlpha}`;
                call = bold;
              }
              // /* Currently we don't have a way to figure out
              //  * if the call is worked only in this band or also others,
              //  * so we cannot cover this particular combination
              //  * and have to default to just showing it as plain "worked"
              //  */
              // else if (layeredMode && layeredHash in workedIndex.call)
              // {
              //   callObj.hunting.call = "worked-and-mixed-worked";
              //   callConf = `${layeredUnconf}${call}${layeredAlpha};`;
              // }
              else
              {
                callObj.hunting.call = "worked";
                callConf = `${unconf}${call}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredHash in huntIndex.call)
              {
                callObj.hunting.call = "mixed";
                callBg = `${call}${layeredAlpha};`;
                call = bold;
              }
              else if (layeredMode && layeredHash in workedIndex.call)
              {
                callObj.hunting.call = "mixed-worked";
                callConf = `${unconf}${call}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.call = "hunted";
                callBg = `${call}${inversionAlpha};`;
                call = bold;
              }
            }
          }
        }

        // Hunting for "stations calling you"
        if (huntQRZ.checked == true && callObj.qrz == true)
        {
          callObj.callFlags.calling = true
          shouldAlert = true;
          callObj.reason.push("qrz");
        }

        // Hunting for stations with OAMS
        if (huntOAMS.checked == true && hasGtPin == true)
        {
          callObj.hunting.oams = "hunted";
          shouldAlert = true;
          callObj.reason.push("oams");
        }

        // Hunting for grids
        if (huntGrid.checked == true && callObj.grid.length > 1)
        {
          var hash = callObj.grid.substr(0, 4) + workHashSuffix;
          var layeredHash = layeredMode && (callObj.grid.substr(0, 4) + layeredHashSuffix)

          if (huntIndex && !(hash in huntIndex.grid))
          {
            shouldAlert = true;

            callObj.reason.push("grid");

            if (workedIndex && hash in workedIndex.grid)
            {
              if (layeredMode && layeredHash in huntIndex.grid)
              {
                callObj.hunting.grid = "worked-and-mixed";
                gridConf = `${layeredUnconf}${grid}${layeredUnconfAlpha};`;
                gridBg = `${grid}${layeredInversionAlpha}`;
                grid = bold;
              }
              else
              {
                callObj.hunting.grid = "worked";
                gridConf = `${unconf}${grid}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredHash in huntIndex.grid)
              {
                callObj.hunting.grid = "mixed";
                gridBg = `${grid}${layeredAlpha};`;
                grid = bold;
              }
              else if (layeredMode && layeredHash in workedIndex.grid)
              {
                callObj.hunting.grid = "mixed-worked";
                gridConf = `${unconf}${grid}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.grid = "hunted";
                gridBg = `${grid}${inversionAlpha};`;
                grid = bold;
              }
            }
          }
        }

        // Hunting for DXCC
        if (huntDXCC.checked == true)
        {
          var hash = String(callObj.dxcc) + workHashSuffix;
          var layeredHash = layeredMode && (String(callObj.dxcc) + layeredHashSuffix)

          if (huntIndex && !(hash in huntIndex.dxcc))
          {
            shouldAlert = true;

            callObj.reason.push("dxcc");

            if (workedIndex && hash in workedIndex.dxcc)
            {
              if (layeredMode && layeredHash in huntIndex.dxcc)
              {
                callObj.hunting.dxcc = "worked-and-mixed";
                dxccConf = `${layeredUnconf}${dxcc}${layeredUnconfAlpha};`;
                dxccBg = `${dxcc}${layeredInversionAlpha}`;
                dxcc = bold;
              }
              else
              {
                callObj.hunting.dxcc = "worked";
                dxccConf = `${unconf}${dxcc}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredHash in huntIndex.dxcc)
              {
                callObj.hunting.dxcc = "mixed";
                dxccBg = `${dxcc}${layeredAlpha};`;
                dxcc = bold;
              }
              else if (layeredMode && layeredHash in workedIndex.dxcc)
              {
                callObj.hunting.dxcc = "mixed-worked";
                dxccConf = `${unconf}${dxcc}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.dxcc = "hunted";
                dxccBg = `${dxcc}${inversionAlpha};`;
                dxcc = bold;
              }
            }
          }
        }

        // Hunting for US States
        if (huntState.checked == true && window.opener.g_callsignLookups.ulsUseEnable == true)
        {
          var stateSearch = callObj.state;
          var finalDxcc = callObj.dxcc;
          if (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6)
          {
            if (stateSearch in window.opener.g_StateData)
            {
              var hash = stateSearch + workHashSuffix;
              var layeredHash = layeredMode && (stateSearch + layeredHashSuffix)

              if (huntIndex && !(hash in huntIndex.state))
              {
                shouldAlert = true;

                callObj.reason.push("state");

                if (workedIndex && hash in workedIndex.state)
                {
                  if (layeredMode && layeredHash in huntIndex.state)
                  {
                    callObj.hunting.state = "worked-and-mixed";
                    stateConf = `${layeredUnconf}${state}${layeredUnconfAlpha};`;
                    stateBg = `${state}${layeredInversionAlpha}`;
                    state = bold;
                  }
                  else
                  {
                    callObj.hunting.state = "worked";
                    stateConf = `${unconf}${state}${inversionAlpha};`;
                  }
                }
                else
                {
                  if (layeredMode && layeredHash in huntIndex.state)
                  {
                    callObj.hunting.state = "mixed";
                    stateBg = `${state}${layeredAlpha};`;
                    state = bold;
                  }
                  else if (layeredMode && layeredHash in workedIndex.state)
                  {
                    callObj.hunting.state = "mixed-worked";
                    stateConf = `${unconf}${state}${layeredAlpha};`;
                  }
                  else
                  {
                    callObj.hunting.state = "hunted";
                    stateBg = `${state}${inversionAlpha};`;
                    state = bold;
                  }
                }
              }
            }
          }
        }

        // Hunting for US Counties
        if (huntCounty.checked == true && window.opener.g_callsignLookups.ulsUseEnable == true)
        {
          var finalDxcc = callObj.dxcc;
          if (
            callObj.cnty &&
            (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6 || finalDxcc == 202) &&
            callObj.cnty.length > 0
          )
          {
            var hash = callObj.cnty + (layeredMode ? layeredHashSuffix : workHashSuffix);

            if ((huntIndex && !(hash in huntIndex.cnty)) || callObj.qual == false)
            {
              if (callObj.qual == false)
              {
                var counties = window.opener.g_zipToCounty[callObj.zipcode];
                var foundHit = false;
                for (var cnt in counties)
                {
                  var hh = counties[cnt] + workHash;
                  callObj.cnty = counties[cnt];
                  if (huntIndex && !(hh in huntIndex.cnty))
                  {
                    foundHit = true;
                    break;
                  }
                }
                if (foundHit) shouldAlert = true;
              }
              else
              {
                shouldAlert = true;
              }

              if (shouldAlert)
              {
                callObj.reason.push("cnty");

                if (workedIndex && hash in workedIndex.cnty)
                {
                  callObj.hunting.cnty = "worked";
                  cntyConf = `${unconf}${cnty}${inversionAlpha};`;
                }
                else
                {
                  callObj.hunting.cnty = "hunted";
                  cntyBg = `${cnty}${inversionAlpha}`;
                  cnty = bold;
                }
              }
            }
          }
        }

        // Hunting for CQ Zones
        if (huntCQz.checked == true)
        {
          var huntTotal = callObj.cqza.length;
          var huntFound = 0, layeredFound = 0, workedFound = 0, layeredWorkedFound = 0;

          for (index in callObj.cqza)
          {
            var hash = callObj.cqza[index] + workHashSuffix;
            var layeredHash = layeredMode && (callObj.cqza[index] + layeredHashSuffix)

            if (huntIndex && hash in huntIndex.cqz) huntFound++;
            if (layeredMode && layeredHash in huntIndex.cqz) layeredFound++;
            if (workedIndex && hash in workedIndex.cqz) workedFound++;
            if (layeredMode && layeredHash in workedIndex.cqz) layeredWorkedFound++;
          }
          if (huntFound != huntTotal)
          {
            shouldAlert = true;
            callObj.reason.push("cqz");

            if (workedIndex && workedFound == huntTotal)
            {
              if (layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.cqz = "worked-and-mixed";
                cqzConf = `${layeredUnconf}${cqz}${layeredUnconfAlpha};`;
                cqzBg = `${cqz}${layeredInversionAlpha}`;
                cqz = bold;
              }
              else
              {
                callObj.hunting.cqz = "worked";
                cqzConf = `${unconf}${qrz}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.cqz = "mixed";
                cqzBg = `${cqz}${layeredAlpha};`;
                cqz = bold;
              }
              else if (layeredMode && layeredWorkedFound == huntTotal)
              {
                callObj.hunting.cqz = "mixed-worked";
                cqzConf = `${unconf}${cqz}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.cqz = "hunted";
                cqzBg = `${cqz}${inversionAlpha};`;
                cqz = bold;
              }
            }
          }
        }

        // Hunting for ITU Zones
        if (huntITUz.checked == true)
        {
          var huntTotal = callObj.ituza.length;
          var huntFound = 0, layeredFound = 0, workedFound = 0, layeredWorkedFound = 0;

          for (index in callObj.ituza)
          {
            var hash = callObj.ituza[index] + workHashSuffix;
            var layeredHash = layeredMode && (callObj.ituza[index] + layeredHashSuffix)

            if (huntIndex && hash in huntIndex.ituz) huntFound++;
            if (layeredMode && layeredHash in huntIndex.ituz) layeredFound++;
            if (workedIndex && hash in workedIndex.ituz) workedFound++;
            if (layeredMode && layeredHash in workedIndex.ituz) layeredWorkedFound++;
          }
          if (huntFound != huntTotal)
          {
            shouldAlert = true;
            callObj.reason.push("ituz");

            if (workedIndex && workedFound == huntTotal)
            {
              if (layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.ituz = "worked-and-mixed";
                ituzConf = `${layeredUnconf}${ituz}${layeredUnconfAlpha};`;
                ituzBg = `${ituz}${layeredInversionAlpha}`;
                ituz = bold;
              }
              else
              {
                callObj.hunting.ituz = "worked";
                ituzConf = `${unconf}${ituz}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.ituz = "mixed";
                ituzBg = `${ituz}${layeredAlpha};`;
                ituz = bold;
              }
              else if (layeredMode && layeredWorkedFound == huntTotal)
              {
                callObj.hunting.ituz = "mixed-worked";
                ituzConf = `${unconf}${ituz}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.ituz = "hunted";
                ituzBg = `${ituz}${inversionAlpha};`;
                ituz = bold;
              }
            }
          }
        }

        // Hunting for WPX (Prefixes)
        if (huntPX.checked == true && callObj.px)
        {
          var hash = String(callObj.px) + workHashSuffix;
          var layeredHash = layeredMode && (String(callObj.px) + layeredHashSuffix)

          if (huntIndex && !(hash in huntIndex.px))
          {
            shouldAlert = true;

            callObj.reason.push("wpx");

            if (workedIndex && hash in workedIndex.px)
            {
              if (layeredMode && layeredHash in huntIndex.px)
              {
                callObj.hunting.wpx = "worked-and-mixed";
                wpxConf = `${layeredUnconf}${wpx}${layeredUnconfAlpha};`;
                wpxBg = `${wpx}${layeredInversionAlpha}`;
                wpx = bold;
              }
              else
              {
                callObj.hunting.wpx = "worked";
                wpxConf = `${unconf}${wpx}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredHash in huntIndex.px)
              {
                callObj.hunting.wpx = "mixed";
                wpxBg = `${wpx}${layeredAlpha};`;
                wpx = bold;
              }
              else if (layeredMode && layeredHash in workedIndex.px)
              {
                callObj.hunting.wpx = "mixed-worked";
                wpxConf = `${unconf}${wpx}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.wpx = "hunted";
                wpxBg = `${wpx}${inversionAlpha};`;
                wpx = bold;
              }
            }
          }
        }

        // Hunting for Continents
        if (huntCont.checked == true && callObj.cont)
        {
          var hash = String(callObj.cont) + workHashSuffix;
          var layeredHash = layeredMode && (String(callObj.cont) + layeredHashSuffix)

          if (huntIndex && !(hash in huntIndex.cont))
          {
            shouldAlert = true;

            callObj.reason.push("cont");

            if (workedIndex && hash in workedIndex.cont)
            {
              if (layeredMode && layeredHash in huntIndex.cont)
              {
                callObj.hunting.cont = "worked-and-mixed";
                contConf = `${layeredUnconf}${cont}${layeredUnconfAlpha};`;
                contBg = `${cont}${layeredInversionAlpha}`;
                cont = bold;
              }
              else
              {
                callObj.hunting.cont = "worked";
                contConf = `${unconf}${cont}${inversionAlpha};`;
              }
            }
            else
            {
              if (layeredMode && layeredHash in huntIndex.cont)
              {
                callObj.hunting.cont = "mixed";
                contBg = `${cont}${layeredAlpha};`;
                cont = bold;
              }
              else if (layeredMode && layeredHash in workedIndex.cont)
              {
                callObj.hunting.cont = "mixed-worked";
                contConf = `${unconf}${cont}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.cont = "hunted";
                contBg = `${cont}${inversionAlpha};`;
                cont = bold;
              }
            }
          }
        }
      }

      // Station is calling us
      if (callObj.DXcall == window.opener.myDEcall)
      {
        callingBg = "#0000FF" + inversionAlpha;
        calling = "#FFFF00;text-shadow: 0px 0px 2px #FFFF00";
      }
      else if (callObj.CQ == true && g_rosterSettings.cqOnly == false)
      {
        callingBg = calling + inversionAlpha;
        calling = bold;
      }

      // Assemble all styles
      colorObject.call = "style='" + callConf + "background-color:" + callBg + ";color:" +
        call + ";" + callPointer + "'";
      colorObject.grid = "style='" + gridConf + "background-color:" + gridBg + ";color:" + grid + ";cursor:pointer'";
      colorObject.calling = "style='" + callingConf + "background-color:" + callingBg + ";color:" + calling + "'";
      colorObject.dxcc = "style='" + dxccConf + "background-color:" + dxccBg + ";color:" + dxcc + "'";
      colorObject.state = "style='" + stateConf + "background-color:" + stateBg + ";color:" + state + "'";
      colorObject.cnty = "style='" + cntyConf + "background-color:" + cntyBg + ";color:" + cnty + "'";
      colorObject.cont = "style='" + contConf + "background-color:" + contBg + ";color:" + cont + "'";
      colorObject.cqz = "style='" + cqzConf + "background-color:" + cqzBg + ";color:" + cqz + "'";
      colorObject.ituz = "style='" + ituzConf + "background-color:" + ituzBg + ";color:" + ituz + "'";
      colorObject.px = "style='" + wpxConf + "background-color:" + wpxBg + ";color:" + wpx + "'";

      // Just in case, don't alert if we worked this callsign alread
      if (didWork && shouldAlert) shouldAlert = false;

      callObj.shouldAlert = shouldAlert;

      callObj.style = colorObject;

      if (g_rosterSettings.columns.Spot)
      {
        callObj.spot = window.opener.getSpotTime(
          callObj.DEcall + callObj.mode + callObj.band + callObj.grid
        );
        if (callObj.spot == null)
        {
          callObj.spot = { when: 0, snr: 0 };
        }
      }
      else
      {
        callObj.spot = { when: 0, snr: 0 };
      }

      modes[callObj.mode] = true;
      bands[callObj.band] = true;

      newCallList.push(callObj);
    }
  }

  if (g_rosterSettings.compact == false)
  {
    newCallList.sort(r_sortFunction[g_rosterSettings.lastSortIndex]);
    if (g_rosterSettings.lastSortReverse == 1)
    {
      newCallList.reverse();
    }
  }
  else
  {
    // Age sort for now... make this happen Tag
    newCallList.sort(r_sortFunction[6]).reverse();
  }

  var showBands = (Object.keys(bands).length > 1) || g_rosterSettings.columns.Band;
  var showModes = (Object.keys(modes).length > 1) || g_rosterSettings.columns.Mode;

  var worker = "";

  // Render the table headers for the regular roster table
  if (g_rosterSettings.compact == false)
  {
    worker = "<table id='callTable' class='rosterTable' align=left>";

    worker += "<thead><th style='cursor:pointer;' onclick='showRosterBox(0);' align=left>Callsign</th>";

    if (showBands)
    { worker += "<th onclick='' >Band</th>"; }

    if (showModes)
    { worker += "<th onclick='' >Mode</th>"; }

    worker += "<th style='cursor:pointer;' onclick='showRosterBox(1);'  >Grid</th>";

    if (g_rosterSettings.columns.Calling)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(10);' >Calling</th>"; }

    if (g_rosterSettings.columns.Msg)
    { worker += "<th >Msg</th>"; }

    if (g_rosterSettings.columns.DXCC)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(5);' >DXCC</th>"; }

    if (g_rosterSettings.columns.Flag)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(5);' >Flag</th>"; }

    if (g_rosterSettings.columns.State)
    { worker += "<th  style='cursor:pointer;' onclick='showRosterBox(9);'  >State</th>"; }

    if (g_rosterSettings.columns.County)
    { worker += "<th  style='cursor:pointer;' onclick='showRosterBox(15);' >County</th>"; }

    if (g_rosterSettings.columns.Cont)
    { worker += "<th  style='cursor:pointer;' onclick='showRosterBox(16);' >Cont</th>"; }

    if (g_rosterSettings.columns.dB)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(2);' >dB</th>"; }

    if (g_rosterSettings.columns.Freq)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(4);' >Freq</th>"; }

    if (g_rosterSettings.columns.DT)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(3);' >DT</th>"; }

    if (g_rosterSettings.columns.Dist)
    {
      worker += "<th style='cursor:pointer;' onclick='showRosterBox(7);' >Dist(" +
        window.opener.distanceUnit.value.toLowerCase() + ")</th>";
    }

    if (g_rosterSettings.columns.Azim)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(8);' >Azim</th>"; }

    if (g_rosterSettings.columns.CQz)
    { worker += "<th>CQz</th>"; }

    if (g_rosterSettings.columns.ITUz)
    { worker += "<th>ITUz</th>"; }

    if (g_rosterSettings.columns.PX)
    { worker += "<th  style='cursor:pointer;' onclick='showRosterBox(11);'>PX</th>"; }

    if (window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.columns.LoTW)
    { worker += "<th  >LoTW</th>"; }

    if (window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.columns.eQSL)
    { worker += "<th >eQSL</th>"; }

    if (window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.columns.OQRS)
    { worker += "<th >OQRS</th>"; }

    if (g_rosterSettings.columns.Spot)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(13);' >Spot</th>"; }

    if (g_rosterSettings.columns.Life)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(12);' >Life</th>"; }

    if (g_rosterSettings.columns.OAMS)
    { worker += "<th title='Off-Air Message User' style='cursor:pointer;' onclick='showRosterBox(14);'>OAM</th>"; }

    if (g_rosterSettings.columns.Age)
    { worker += "<th style='cursor:pointer;' onclick='showRosterBox(6);' >Age</th></thead>"; }
  }
  // No headers for compact roster table
  else
  {
    worker = "<div id=\"buttonsDiv\" style=\"margin-left:0px;white-space:normal;\">";
  }

  var shouldAlert = 0;

  // Render all rows
  for (var x in newCallList)
  {
    var callObj = newCallList[x];

    if (callObj.shouldAlert == false && onlyHits == true && callObj.qrz == false)
    { continue; }

    var spotString = "";
    if (g_rosterSettings.columns.Spot && callObj.qrz == false)
    {
      spotString = getSpotString(callObj);
      if (g_rosterSettings.onlySpot && spotString == "") continue;
    }
    var grid = callObj.grid.length > 1 ? callObj.grid.substr(0, 4) : "-";

    var geo = window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[callObj.dxcc]];
    var cqzone = grid in window.opener.g_gridToCQZone ? window.opener.g_gridToCQZone[grid].join(", ") : "-";
    var ituzone = grid in window.opener.g_gridToITUZone ? window.opener.g_gridToITUZone[grid].join(", ") : "-";
    var thisCall = callObj.DEcall;

    if (thisCall.match("^[A-Z][0-9][A-Z](/w+)?$"))
    { callObj.style.call = "class='oneByOne'"; }
    if (thisCall == window.opener.g_instances[callObj.instance].status.DXcall)
    {
      if (window.opener.g_instances[callObj.instance].status.TxEnabled == 1)
      {
        callObj.style.call = "class='dxCalling'";
      }
      else
      {
        callObj.style.call = "class='dxCaller'";
      }
    }

    if (g_rosterSettings.compact == false)
    {
      var thisHash = thisCall + callObj.band + callObj.mode;

      worker += "<tbody><tr id='" + thisHash + "'>";
      worker +=
        "<td title='" +
        callObj.awardReason +
        "' name='Callsign' align=left " +
        callObj.style.call +
        " onClick='initiateQso(\"" +
        thisCall +
        callObj.band +
        callObj.mode +
        "\")'>" +
        thisCall.formatCallsign() +
        "</td>";

      if (showBands)
      {
        worker +=
          "<td style='color:#" +
          window.opener.g_pskColors[callObj.band] +
          "' >" +
          callObj.band +
          "</td>";
      }
      if (showModes)
      {
        var color = "888888";
        if (callObj.mode in g_modeColors)
        { color = g_modeColors[callObj.mode]; }
        worker +=
          "<td  style='color:#" + color + "' >" + callObj.mode + "</td>";
      }

      worker +=
        "<td  " +
        callObj.style.grid +
        " onClick='centerOn(\"" +
        grid +
        "\")' >" +
        grid +
        "</td>";
      if (g_rosterSettings.columns.Calling)
      {
        var lookString = callObj.CQ ? "name='CQ'" : "name='Calling'";
        worker +=
          "<td " +
          callObj.style.calling +
          " " +
          lookString +
          ">" +
          callObj.DXcall.formatCallsign() +
          "</td>";
      }
      if (g_rosterSettings.columns.Msg)
      { worker += "<td>" + callObj.msg + "</td>"; }

      if (g_rosterSettings.columns.DXCC)
      {
        worker +=
          "<td title='" + window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[callObj.dxcc]].pp +
          "' name='DXCC (" +
          callObj.dxcc +
          ")' " +
          callObj.style.dxcc +
          ">" +
          window.opener.g_dxccToAltName[callObj.dxcc] + "</td>";
      }
      if (g_rosterSettings.columns.Flag)
      {
        worker +=
          "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" +
          geo.flag +
          "'></td>";
      }
      if (g_rosterSettings.columns.State)
      {
        worker +=
          "<td align='center' " +
          callObj.style.state +
          " >" +
          (callObj.state ? callObj.state.substr(3) : "") +
          "</td>";
      }
      if (g_rosterSettings.columns.County)
      {
        worker +=
          "<td align='center' " +
          callObj.style.cnty +
          " " +
          (callObj.cnty
            ? (callObj.qual
                ? ""
                : "onClick='window.opener.lookupCallsign(\"" +
                  thisCall +
                  "\",\"" +
                  grid +
                  "\")'"
              )
            : "") +
          ">" +
          (callObj.cnty
            ? (callObj.qual ? "" : "~ ") +
              window.opener.g_cntyToCounty[callObj.cnty] +
              (callObj.qual ? "" : " ~")
            : "") +
          "</td>";
      }
      if (g_rosterSettings.columns.Cont)
      {
        worker +=
          "<td align='center' " +
          callObj.style.cont +
          " >" +
          (callObj.cont ? callObj.cont : "") +
          "</td>";
      }

      if (g_rosterSettings.columns.dB)
      {
        worker +=
          "<td style='color:#DD44DD'><b>" +
          callObj.RSTsent +
          "</b></td>";
      }
      if (g_rosterSettings.columns.Freq)
      { worker += "<td style='color:#00FF00'>" + callObj.delta + "</td>"; }
      if (g_rosterSettings.columns.DT)
      { worker += "<td style='color:#1E90FF'>" + callObj.dt + "</td>"; }
      if (g_rosterSettings.columns.Dist)
      {
        worker +=
          "<td style='color:cyan'>" +
          parseInt(
            callObj.distance *
              MyCircle.validateRadius(window.opener.distanceUnit.value)
          ) +
          "</td>";
      }
      if (g_rosterSettings.columns.Azim)
      {
        worker +=
          "<td style='color:yellow'>" +
          parseInt(callObj.heading) +
          "</td>";
      }

      if (g_rosterSettings.columns.CQz)
      {
        worker +=
          "<td " +
          callObj.style.cqz +
          ">" +
          callObj.cqza.join(",") +
          "</td>";
      }
      if (g_rosterSettings.columns.ITUz)
      {
        worker +=
          "<td " +
          callObj.style.ituz +
          ">" +
          callObj.ituza.join(",") +
          "</td>";
      }

      if (g_rosterSettings.columns.PX)
      {
        worker +=
          "<td " +
          callObj.style.px +
          ">" +
          (callObj.px ? callObj.px : "") +
          "</td>";
      }

      if (
        window.opener.g_callsignLookups.lotwUseEnable == true &&
        g_rosterSettings.columns.LoTW
      )
      {
        if (thisCall in window.opener.g_lotwCallsigns)
        {
          if (g_rosterSettings.maxLoTW < 27)
          {
            var months = (g_day - window.opener.g_lotwCallsigns[thisCall]) / 30;
            if (months > g_rosterSettings.maxLoTW)
            {
              worker +=
                "<td  style='color:yellow' align='center' title='Has not uploaded a QSO in " +
                Number(months).toYM() +
                "'>?</td>";
            }
            else
            {
              worker +=
                "<td  style='color:#0F0' align='center' title='  Last Upload&#10;" +
                window.opener.userDayString(
                  window.opener.g_lotwCallsigns[thisCall] * 86400000
                ) +
                "'>&#10004;</td>";
            }
          }
          else
          {
            worker +=
              "<td  style='color:#0F0' align='center' title='  Last Upload&#10;" +
              window.opener.userDayString(
                window.opener.g_lotwCallsigns[thisCall] * 86400000
              ) +
              "'>&#10004;</td>";
          }
        }
        else worker += "<td></td>";
      }
      if (
        window.opener.g_callsignLookups.eqslUseEnable == true &&
        g_rosterSettings.columns.eQSL
      )
      {
        worker +=
          "<td  style='color:#0F0;' align='center'>" +
          (thisCall in window.opener.g_eqslCallsigns ? "&#10004;" : "") +
          "</td>";
      }
      if (
        window.opener.g_callsignLookups.oqrsUseEnable == true &&
        g_rosterSettings.columns.OQRS
      )
      {
        worker +=
          "<td  style='color:#0F0;' align='center'>" +
          (thisCall in window.opener.g_oqrsCallsigns ? "&#10004;" : "") +
          "</td>";
      }

      if (g_rosterSettings.columns.Spot)
      {
        worker +=
          "<td style='color:#EEE;' class='spotCol' id='sp" +
          thisCall +
          callObj.band +
          callObj.mode +
          "'>" +
          spotString +
          "</td>";
      }
      if (g_rosterSettings.columns.Life)
      {
        worker +=
          "<td style='color:#EEE;' class='lifeCol' id='lm" +
          thisCall +
          callObj.band +
          callObj.mode +
          "'>" +
          (timeNowSec() - callObj.life).toDHMS() +
          "</td>";
      }

      if (g_rosterSettings.columns.OAMS)
      {
        if (callObj.style.gt != 0)
        {
          if (callObj.reason.includes("oams"))
          {
            worker +=
              "<td align='center' style='margin:0;padding:0;cursor:pointer;background-clip:content-box;box-shadow: 0 0 4px 4px inset #2222FFFF;' onClick='openChatToCid(\"" +
              callObj.style.gt +
              "\")'><img height='16px' style='' src='./img/gt_chat.png'></td>";
          }
          else
          {
            worker +=
              "<td align='center' style='margin:0;padding:0;cursor:pointer;' onClick='openChatToCid(\"" +
              callObj.style.gt +
              "\")'><img height='16px' style='' src='./img/gt_chat.png'></td>";
          }
        }
        else worker += "<td></td>";
      }

      if (g_rosterSettings.columns.Age)
      {
        worker +=
          "<td style='color:#EEE' class='timeCol' id='tm" +
          thisCall +
          callObj.band +
          callObj.mode +
          "'>" +
          (timeNowSec() - callObj.age).toDHMS() +
          "</td>";
      }

      worker += "</tr></tbody>";
    }
    else
    {
      var tt =
        callObj.RSTsent +
        "&#13256;, " +
        parseInt(callObj.dt * 100) +
        "ms, " +
        callObj.delta +
        "hz" +
        (callObj.grid.length ? ", " + callObj.grid : "") +
        ", " +
        (timeNowSec() - callObj.age).toDHMS();
      worker +=
        "<div class='compact' onClick='initiateQso(\"" +
        thisCall +
        callObj.band +
        callObj.mode +
        "\")' ";
      worker +=
        "id='" +
        thisCall +
        callObj.band +
        callObj.mode +
        "' title='" +
        tt +
        "'>";
      worker +=
        "<div class='compactCallsign' name='Callsign' " +
        callObj.style.call +
        " >" +
        thisCall.formatCallsign() +
        "</div>";
      worker +=
        "<div class='compactDXCC' name='DXCC (" +
        callObj.dxcc +
        ")' " +
        callObj.style.dxcc +
        ">" +
        window.opener.g_dxccToAltName[callObj.dxcc] +
        "</div>";
      worker += "</div>";
    }

    if (g_rosterSettings.realtime == false)
    {
      var call = callObj.DEcall;
      g_scriptReport[call] = Object.assign({}, callObj);
      g_scriptReport[call].dxccName =
        window.opener.g_dxccToAltName[callObj.dxcc];
      g_scriptReport[call].distance = parseInt(
        callObj.distance *
          MyCircle.validateRadius(window.opener.distanceUnit.value)
      );

      delete g_scriptReport[call].DEcall;
      g_scriptReport[call].rect = null;
      delete g_scriptReport[call].rect;
      delete g_scriptReport[call].style;
      delete g_scriptReport[call].wspr;
      delete g_scriptReport[call].qso;
      delete g_scriptReport[call].instance;

      if (callMode != "all")
      {
        g_scriptReport[call].shouldAlert = true;
        g_scriptReport[call].reason.push(g_rosterSettings.hunting);
      }
    }

    if (
      callObj.alerted == false &&
      callMode == "all" &&
      callObj.shouldAlert == true
    )
    {
      callObj.alerted = true;
      shouldAlert++;
    }
    else if (callObj.alerted == false && callMode != "all")
    {
      callObj.alerted = true;
      shouldAlert++;
    }

    callObj.shouldAlert = false;
  }

  if (g_rosterSettings.compact == false)
  {
    worker += "</table>";
    RosterTable.innerHTML = worker;
  }
  else
  {
    RosterTable.innerHTML = worker + "</div>";
  }

  var dirPath = window.opener.g_scriptDir;
  var scriptExists = false;
  var script = "cr-alert.sh";

  try
  {
    if (fs.existsSync(dirPath))
    {
      if (window.opener.g_platform == "windows")
      {
        script = "cr-alert.bat";
      }
      if (
        fs.existsSync(dirPath + script) &&
        g_rosterSettings.realtime == false
      )
      {
        scriptExists = true;
        scriptIcon.innerHTML =
          "<div class='buttonScript' onclick='window.opener.toggleCRScript();'>" +
          (window.opener.g_crScript == 1
            ? "<font color='lightgreen'>Script Enabled</font>"
            : "<font color='yellow'>Script Disabled</font>") +
          "</div>";
        scriptIcon.style.display = "block";
      }
      else
      {
        scriptIcon.style.display = "none";
      }
    }
  }
  catch (e) {}

  if (shouldAlert > 0)
  {
    if (window.opener.g_classicAlerts.huntRoster == true)
    {
      var notify = window.opener.huntRosterNotify.value;
      if (notify == "0")
      {
        var media = window.opener.huntRosterNotifyMedia.value;
        if (media != "none") window.opener.playAlertMediaFile(media);
      }
      else if (notify == "1")
      {
        window.opener.speakAlertString(
          window.opener.huntRosterNotifyWord.value
        );
      }
    }

    if (
      g_rosterSettings.realtime == false &&
      scriptExists &&
      window.opener.g_crScript == 1
    )
    {
      try
      {
        fs.writeFileSync(
          dirPath + "cr-alert.json",
          JSON.stringify(g_scriptReport, null, 2)
        );

        var thisProc = dirPath + script;
        var cp = require("child_process");
        var child = cp.spawn(thisProc, [], {
          detached: true,
          cwd: dirPath.slice(0, -1),
          stdio: ["ignore", "ignore", "ignore"]
        });
        child.unref();
      }
      catch (e)
      {
        conosle.log(e);
      }
      g_scriptReport = Object();
    }
    else g_scriptReport = Object();
  }
}

function realtimeRoster()
{
  var now = timeNowSec();
  g_day = now / 86400;

  if (g_rosterSettings.realtime == false) return;

  var timeCols = document.getElementsByClassName("timeCol");
  for (var x in timeCols)
  {
    if (typeof timeCols[x].id != "undefined")
    {
      var when = now - callRoster[timeCols[x].id.substr(2)].callObj.age;
      timeCols[x].innerHTML = when.toDHMS();
    }
  }
  var lifeCols = document.getElementsByClassName("lifeCol");
  for (var x in lifeCols)
  {
    if (typeof lifeCols[x].id != "undefined")
    {
      var when = now - callRoster[lifeCols[x].id.substr(2)].callObj.life;
      lifeCols[x].innerHTML = when.toDHMS();
    }
  }
  if (g_rosterSettings.columns.Spot)
  {
    var spotCols = document.getElementsByClassName("spotCol");
    for (var x in spotCols)
    {
      if (typeof spotCols[x].id != "undefined")
      {
        spotCols[x].innerHTML = getSpotString(
          callRoster[spotCols[x].id.substr(2)].callObj
        );
        if (g_rosterSettings.onlySpot && spotCols[x].innerHTML == "")
        {
          viewRoster();
          return;
        }
      }
    }
  }
}

function getSpotString(callObj)
{
  var result = "";
  if (callObj.spot && callObj.spot.when > 0)
  {
    when = timeNowSec() - callObj.spot.when;
    if (when <= window.opener.g_receptionSettings.viewHistoryTimeSec)
    { result = parseInt(when).toDHMS(); }
  }
  if (result) result += " / " + callObj.spot.snr;
  return result;
}

function openChatToCid(cid)
{
  window.opener.showMessaging(true, cid);
}

function initiateQso(thisHash)
{
  window.opener.initiateQso(thisHash);
}

function callLookup(thisHash, grid)
{
  window.opener.startLookup(
    callRoster[thisHash].DEcall,
    callRoster[thisHash].grid
  );
}

function callingLookup(thisHash, grid)
{
  var thisCall = callRoster[thisHash].DXcall;
  window.opener.startLookup(thisCall, grid);
}

function callGenMessage(thisHash, grid)
{
  var thisCall = callRoster[thisHash].DEcall;
  var instance = callRoster[thisHash].callObj.instance;

  window.opener.startGenMessages(thisCall, grid, instance);
}

function callingGenMessage(thisHash, grid)
{
  var thisCall = callRoster[thisHash].DXcall;
  var instance = callRoster[thisHash].callObj.instance;

  window.opener.startGenMessages(thisCall, grid, instance);
}

function centerOn(grid)
{
  window.opener.centerOn(grid);
}

function instanceChange(what)
{
  window.opener.g_instances[what.id].crEnable = what.checked;
  window.opener.goProcessRoster();
}

function updateInstances()
{
  if (window.opener.g_instancesIndex.length > 1)
  {
    var instances = window.opener.g_instances;

    var worker = "";

    var keys = Object.keys(instances).sort();
    for (var key in keys)
    {
      var inst = keys[key];
      var sp = inst.split(" - ");
      var shortInst = sp[sp.length - 1].substring(0, 18);
      var color = "blue";

      if (instances[inst].open == false)
      {
        color = "purple";
      }
      worker +=
        `<div class='button' style='background-color:${color};'>` +
        `<input type='checkbox' id='${inst}' onchange='instanceChange(this);' ` +
        (instances[inst].crEnable ? "checked" : "") +
        `>&nbsp;${shortInst}</div>`
    }
    instancesDiv.innerHTML = worker;
    instancesWrapper.style.display = "";
  }
  else
  {
    instancesDiv.innerHTML = "";
    instancesWrapper.style.display = "none";
  }
}

function processStatus(newMessage)
{
  if (newMessage.Transmitting == 0)
  {
    // Not Transmitting
    if (newMessage.Decoding == 1)
    {
      // Decoding
      txrxdec.style.backgroundColor = "Blue";
      txrxdec.style.borderColor = "Cyan";
      txrxdec.innerHTML = "DECODE";
    }
    else
    {
      txrxdec.style.backgroundColor = "Green";
      txrxdec.style.borderColor = "GreenYellow";
      txrxdec.innerHTML = "RECEIVE";
    }
  }
  else
  {
    txrxdec.style.backgroundColor = "Red";
    txrxdec.style.borderColor = "Orange";
    txrxdec.innerHTML = "TRANSMIT";
  }
}

function toTitleCase(str)
{
  return str.replace(/\w\S*/g, function (txt)
  {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function newOption(value, text)
{
  if (typeof text == "undefined") text = value;
  var option = document.createElement("option");
  option.value = value;
  option.text = text;
  return option;
}

function createSelectOptions(
  selectElementString,
  selectNameDefault,
  forObject,
  altName = null,
  defaultValue = null,
  checkSponsor = null
)
{
  var selector = document.getElementById(selectElementString);
  selector.innerHTML = "";

  var option = document.createElement("option");
  option.value = defaultValue;
  option.text = selectNameDefault;
  option.selected = true;
  option.disabled = true;
  option.style.display = "none";
  selector.appendChild(option);

  var obj = null;
  if (forObject)
  {
    obj = Object.keys(forObject).sort();
  }
  for (var k in obj)
  {
    var opt = obj[k];
    var option = document.createElement("option");
    option.value = opt;
    option.text = altName ? forObject[opt][altName] : opt;
    if (checkSponsor && opt + "-" + checkSponsor in g_awardTracker)
    { option.disabled = true; }

    selector.appendChild(option);
  }
}

function awardSponsorChanged()
{
  awardName.style.display = "";
  createSelectOptions(
    "awardName",
    "Select Award",
    g_awards[awardSponsor.value].awards,
    "name",
    null,
    awardSponsor.value
  );
}

function awardNameChanged()
{
  var awardToAdd = newAwardTrackerObject(
    awardSponsor.value,
    awardName.value,
    true
  );

  var hash = awardToAdd.name + "-" + awardToAdd.sponsor;
  if (!(hash in g_awardTracker))
  {
    g_awardTracker[hash] = awardToAdd;
    storeAwardTracker();
    processAward(hash);
    updateAwardList(hash);
    window.opener.goProcessRoster();
  }
  createSelectOptions(
    "awardName",
    "Select Award",
    g_awards[awardToAdd.sponsor].awards,
    "name",
    null,
    awardToAdd.sponsor
  );
}

function updateAwardList(target = null)
{
  var worker =
    "<table id=\"awardTable\" class=\"awardTableCSS\" style=\"padding:0;margin:0;margin-top:-5px;\" >";
  worker += "<tr style='font-size:smaller'>";
  worker += "<td align='left'>";
  worker += "Name";
  worker += "</td>";
  worker += "<td>";
  worker += "Award";
  worker += "</td>";
  worker += "<td>";
  worker += "Track";
  worker += "</td>";
  worker += "<td>";
  worker += "";
  worker += "</td>";
  worker += "</tr>";

  worker += "</table>";

  AwardWantedList.innerHTML = worker;

  var keys = Object.keys(g_awardTracker).sort();

  for (var key in keys)
  {
    var award = g_awardTracker[keys[key]];
    var rule = g_awards[award.sponsor].awards[award.name].rule;
    var row = awardTable.insertRow();
    row.id = keys[key];
    var baseAward = false;
    var baseCount = 0;

    var endorseCount = 0;
    var endorseTotal = 0;
    var allEndorse = false;

    var tooltip =
      g_awards[award.sponsor].awards[award.name].tooltip +
      " (" +
      g_awards[award.sponsor].sponsor +
      ")\n";
    tooltip += toTitleCase(award.test.qsl_req) + " QSO\n";
    for (var mode in award.comp.counts)
    {
      tooltip += mode + "\n";
      for (var count in award.comp.counts[mode])
      {
        endorseTotal++;
        if (award.comp.counts[mode][count].per == 100)
        {
          baseAward = true;
          endorseCount++;
        }
        if (award.comp.counts[mode][count].num > baseCount)
        { baseCount = award.comp.counts[mode][count].num; }

        tooltip +=
          "\t" +
          award.comp.counts[mode][count].num +
          "/" +
          count +
          " (" +
          award.comp.counts[mode][count].per +
          "%)\n";
        var wrk = "";
        if (Object.keys(award.comp.endorse).length > 0)
        {
          for (var band in award.comp.endorse[mode])
          {
            endorseTotal++;
            if (award.comp.endorse[mode][band][count] == true)
            {
              endorseCount++;
              wrk += band + " ";
            }
          }
        }
        if (wrk.length > 0)
        {
          tooltip += "\t\t" + wrk + "\n";
        }
      }
    }
    if (baseCount > 0 && endorseCount == endorseTotal) allEndorse = true;

    var cell = createCellHtml(
      row,
      "<p style='font-size:smaller;'>" + award.name + " - " + award.sponsor
    );
    cell.style.textAlign = "left";
    cell.style.color = "lightblue";

    createCellHtml(
      row,
      "<p style='margin:0;' >" +
        (allEndorse
          ? "<img src='./img/award-trophy.png' height='18px'>"
          : baseAward
            ? "<img src='./img/award-medal.png' height='16px'>"
            : baseCount > 0
              ? "<img src='./img/award-tally.png' height='16px'>"
              : "<img src='./img/award-empty.png' height='14px'>"),
      tooltip
    );
    createCell(
      row,
      "enable",
      award.enable,
      award.enable,
      "Toggle Tracking",
      true
    );
    createCellHtml(
      row,
      "<p title='Remove Tracker' onclick='deleteAwardTracker(this)' style='margin:0;cursor:pointer;'><img src='./img/award-delete.png' height='16px'>"
    );
  }
}

function deleteAwardTracker(sender)
{
  var id = sender.parentNode.parentNode.id;
  delete g_awardTracker[id];
  storeAwardTracker();
  resetAwardAdd();
  updateAwardList();
  window.opener.goProcessRoster();
}

function awardCheckboxChanged(sender)
{
  var awardId = sender.target.parentNode.parentNode.id;
  g_awardTracker[sender.target.parentNode.parentNode.id][sender.target.name] =
    sender.target.checked;
  storeAwardTracker();
  window.opener.goProcessRoster();
}

function awardValueChanged(sender)
{
  var awardId = sender.target.parentNode.parentNode.id;
  g_awardTracker[sender.target.parentNode.parentNode.id][sender.target.name] =
    sender.target.value;
  storeAwardTracker();
  window.opener.goProcessRoster();
}

function createCell(
  row,
  target,
  value,
  data = null,
  title = null,
  checkbox = false
)
{
  var cell = row.insertCell();
  if (data == null) cell.innerHTML = value;
  if (title) cell.title = title;
  if (checkbox)
  {
    var x = document.createElement("INPUT");
    x.setAttribute("type", "checkbox");
    x.checked = value;
    x.name = target;
    x.addEventListener("change", awardCheckboxChanged);
    cell.appendChild(x);
  }
  else if (data)
  {
    cell.appendChild(createAwardSelector(cell, target, value, data));
  }
  return cell;
}

function createCellHtml(row, html, title = null)
{
  var cell = row.insertCell();
  cell.innerHTML = html;
  if (title) cell.title = title;

  return cell;
}

function createAwardSelector(cell, target, value, forObject)
{
  var selector = document.createElement("select");
  selector.name = target;
  selector.value = value;
  selector.disabled = forObject.length == 1;
  selector.style.margin = "0px";
  selector.style.padding = "1px";
  if (selector.disabled) selector.style.cursor = "auto";
  selector.addEventListener("change", awardValueChanged);
  for (var opt in forObject)
  {
    var option = document.createElement("option");
    option.value = forObject[opt];
    if (option.value == "Phone" || option.value == "CW") option.disabled = true;
    option.text = forObject[opt];
    selector.appendChild(option);
  }
  return selector;
}

function resetAwardAdd()
{
  awardName.style.display = "none";
  createSelectOptions("awardName", "Select Award", null);
  createSelectOptions("awardSponsor", "Select Sponsor", g_awards, "sponsor");
}

function openAwardPopup()
{
  awardHunterDiv.style.display = "";
  resetAwardAdd();
}

function closeAwardPopup()
{
  awardHunterDiv.style.display = "none";
  resetAwardAdd();
}

function toggleMoreControls()
{
  g_rosterSettings.controlsExtended = !g_rosterSettings.controlsExtended;
  localStorage.rosterSettings = JSON.stringify(g_rosterSettings);

  setVisual();
}

function setVisual()
{
  huntNeed.style.display = "none";
  stateSelect.style.display = "none";
  DXCCsSelect.style.display = "none";

  if (g_rosterSettings.controls)
  {
    if (g_rosterSettings.controlsExtended)
    {
      RosterControls.className = "extended";
    }
    else
    {
      RosterControls.className = "normal";
    }
  }
  else
  {
    RosterControls.className = "hidden";
  }

  // Award Hunter
  if (referenceNeed.value == LOGBOOK_AWARD_TRACKER)
  {
    /* for ( key in g_rosterSettings.wanted )
    {
      document.getElementById(key).checked = true;
      var t = key.replace("hunt","");
      if ( t in g_rosterSettings.columns )
        g_rosterSettings.columns[t] = true;
    } */

    HuntModeControls.style.display = "none";
    CallsignsControls.style.display = "none";
    AwardTrackerControls.style.display = "";
    huntingMatrixDiv.style.display = "";
    updateAwardList();
  }
  else
  {
    for (var key in g_rosterSettings.wanted)
    {
      if (document.getElementById(key))
      { document.getElementById(key).checked = g_rosterSettings.wanted[key]; }
    }

    AwardTrackerControls.style.display = "none";
    HuntModeControls.style.display = "";
    huntMode.style.display = "";
    CallsignsControls.style.display = "";
    closeAwardPopup();
    if (callsignNeed.value == "all" || callsignNeed.value == "hits")
    {
      huntingMatrixDiv.style.display = "";
      huntNeed.style.display = "";
      huntMode.style.display = "none";
    }
    else
    {
      huntingMatrixDiv.style.display = "none";
      huntMode.style.display = "";

      if (
        huntMode.value != "callsign" &&
        huntMode.value != "usstate" &&
        huntMode.value != "dxccs"
      )
      {
        huntNeed.style.display = "";
      }
      if (huntMode.value == "usstate")
      {
        stateSelect.style.display = "";
      }
      if (huntMode.value == "usstates")
      {
        huntNeed.style.display = "";
      }
      if (huntMode.value == "dxccs")
      {
        DXCCsSelect.style.display = "";
      }
    }
  }
  if (wantMaxDT.checked == true)
  {
    maxDT.style.display = "";
    maxDTView.style.display = "";
  }
  else
  {
    maxDT.style.display = "none";
    maxDTView.style.display = "none";
  }
  if (wantMinDB.checked == true)
  {
    minDb.style.display = "";
    minDbView.style.display = "";
  }
  else
  {
    minDb.style.display = "none";
    minDbView.style.display = "none";
  }
  if (wantMinFreq.checked == true)
  {
    minFreq.style.display = "";
    minFreqView.style.display = "";
  }
  else
  {
    minFreq.style.display = "none";
    minFreqView.style.display = "none";
  }
  if (wantMaxFreq.checked == true)
  {
    maxFreq.style.display = "";
    maxFreqView.style.display = "";
  }
  else
  {
    maxFreq.style.display = "none";
    maxFreqView.style.display = "none";
  }

  if (useRegex.checked == true)
  {
    callsignRegex.style.display = "";
  }
  else
  {
    callsignRegex.style.display = "none";
  }

  if (window.opener.g_callsignLookups.lotwUseEnable == true)
  {
    usesLoTWDiv.style.display = "";
    if (g_rosterSettings.usesLoTW == true)
    {
      maxLoTW.style.display = "";
      maxLoTWView.style.display = "";
    }
    else
    {
      maxLoTW.style.display = "none";
      maxLoTWView.style.display = "none";
    }
  }
  else
  {
    usesLoTWDiv.style.display = "none";
    maxLoTW.style.display = "none";
    maxLoTWView.style.display = "none";
  }

  if (window.opener.g_callsignLookups.eqslUseEnable == true)
  { useseQSLDiv.style.display = ""; }
  else useseQSLDiv.style.display = "none";

  if (window.opener.g_callsignLookups.oqrsUseEnable == true)
  { usesOQRSDiv.style.display = ""; }
  else usesOQRSDiv.style.display = "none";

  if (g_rosterSettings.columns.Spot == true)
  { onlySpotDiv.style.display = ""; }
  else onlySpotDiv.style.display = "none";

  if (g_rosterSettings.callsign == "all" || g_rosterSettings.callsign == "hits")
  { allOnlyNewDiv.style.display = ""; }
  else allOnlyNewDiv.style.display = "none";

  resize();
}

function wantedChanged(element)
{
  g_rosterSettings.wanted[element.id] = element.checked;

  if (element.checked == true)
  {
    var t = element.id.replace("hunt", "");

    if (t in g_rosterSettings.columns)
    {
      g_rosterSettings.columns[t] = true;

      for (var i = 0; i < g_menu.items.length; ++i)
      {
        if (
          typeof g_menu.items[i].checked != "undefined" &&
          g_menu.items[i].label == t
        )
        { g_menu.items[i].checked = true; }
      }
    }
  }

  writeRosterSettings();

  g_scriptReport = Object();
  for (var callHash in window.opener.g_callRoster)
  {
    window.opener.g_callRoster[callHash].callObj.alerted = false;
  }
  window.opener.goProcessRoster();
}

function valuesChanged()
{
  setVisual();

  g_rosterSettings.callsign = callsignNeed.value;
  g_rosterSettings.hunting = huntMode.value;
  g_rosterSettings.huntNeed = huntNeed.value;
  g_rosterSettings.requireGrid = wantGrid.checked;

  g_rosterSettings.wantMaxDT = wantMaxDT.checked;
  g_rosterSettings.wantMinDB = wantMinDB.checked;
  g_rosterSettings.wantMinFreq = wantMinFreq.checked;
  g_rosterSettings.wantMaxFreq = wantMaxFreq.checked;

  maxDTView.innerHTML = g_rosterSettings.maxDT = maxDT.value;
  minDbView.innerHTML = g_rosterSettings.minDb = minDb.value;
  minFreqView.innerHTML = g_rosterSettings.minFreq = minFreq.value;
  maxFreqView.innerHTML = g_rosterSettings.maxFreq = maxFreq.value;
  g_rosterSettings.maxLoTW = maxLoTW.value;
  maxLoTWView.innerHTML =
    g_rosterSettings.maxLoTW < 27
      ? Number(g_rosterSettings.maxLoTW).toYM()
      : "<b>&infin;</b>";
  g_rosterSettings.maxLoTW = maxLoTW.value;
  g_rosterSettings.cqOnly = cqOnly.checked;
  g_rosterSettings.noMyDxcc = noMyDxcc.checked;
  g_rosterSettings.onlyMyDxcc = onlyMyDxcc.checked;
  if (
    noMsg.checked &&
    onlyMsg.checked &&
    noMsgValue.value == onlyMsgValue.value
  )
  {
    if (g_rosterSettings.noMsg) noMsg.checked = false;
    else onlyMsg.checked = false;
  }
  g_rosterSettings.noMsg = noMsg.checked;
  g_rosterSettings.onlyMsg = onlyMsg.checked;
  g_rosterSettings.noMsgValue = noMsgValue.value;
  g_rosterSettings.onlyMsgValue = onlyMsgValue.value;
  g_rosterSettings.usesLoTW = usesLoTW.checked;
  g_rosterSettings.useseQSL = useseQSL.checked;
  g_rosterSettings.usesOQRS = usesOQRS.checked;
  g_rosterSettings.onlySpot = onlySpot.checked;
  g_rosterSettings.reference = referenceNeed.value;
  g_rosterSettings.allOnlyNew = allOnlyNew.checked;
  g_rosterSettings.useRegex = useRegex.checked;
  g_rosterSettings.callsignRegex = callsignRegex.value;

  writeRosterSettings();

  g_scriptReport = Object();
  for (var callHash in window.opener.g_callRoster)
  { window.opener.g_callRoster[callHash].callObj.alerted = false; }
  window.opener.goProcessRoster();
}

function getBuffer(file_url, callback, flag, mode, port, cookie)
{
  var url = require("url");
  var http = require(mode);
  var fileBuffer = null;
  var options = null;
  if (cookie != null)
  {
    options = {
      host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
      port: port,
      path: url.parse(file_url).path, // eslint-disable-line node/no-deprecated-api
      headers: {
        Cookie: cookie
      }
    };
  }
  else
  {
    options = {
      host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
      port: port,
      path: url.parse(file_url).path // eslint-disable-line node/no-deprecated-api
    };
  }
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
          callback(fileBuffer, flag, cookies);
        }
      })
      .on("error", function () {});
  });
}

function callsignResult(buffer, flag)
{
  var rawData = JSON.parse(buffer);
  r_currentUSState = flag;

  g_currentUSCallsigns = Object();
  for (var key in rawData.c) g_currentUSCallsigns[rawData.c[key]] = true;

  window.opener.goProcessRoster();
}

function stateChangedValue(what)
{
  if (r_currentUSState != stateSelect.value && stateSelect.value != "")
  {
    r_currentUSState = stateSelect.value;

    if (window.opener.g_mapSettings.offlineMode == false)
    {
      var callState = r_currentUSState.replace("CN-", "");
      getBuffer(
        "http://app.gridtracker.org/callsigns/" + callState + ".callsigns.json",
        callsignResult,
        r_currentUSState,
        "http",
        80
      );
    }
    else
    {
      window.opener.goProcessRoster();
      r_currentUSState = "";
      g_currentUSCallsigns = null;
      stateSelect.value = "";

      return;
    }
  }

  if (stateSelect.value == "")
  {
    r_currentUSState = "";
    g_currentUSCallsigns = null;

    window.opener.goProcessRoster();
  }
}

function DXCCsChangedValue(what)
{
  r_currentDXCCs = DXCCsSelect.value;
  window.opener.goProcessRoster();
}

function initDXCCSelector()
{
  var items = Object.keys(window.opener.g_dxccToAltName).sort(function (a, b)
  {
    return window.opener.g_dxccToAltName[a].localeCompare(
      window.opener.g_dxccToAltName[b]
    );
  });
  var newSelect = document.getElementById("DXCCsSelect");

  for (var i in items)
  {
    var key = items[i];

    if (
      window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].geo !=
      "deleted"
    )
    {
      var option = document.createElement("option");
      option.value = key;
      option.text =
        window.opener.g_dxccToAltName[key] +
        " (" +
        window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].pp +
        ")";

      newSelect.appendChild(option);
    }
  }
  newSelect.oninput = DXCCsChangedValue;
}

function manifestResult(buffer, flag)
{
  r_callsignManifest = JSON.parse(buffer);
  var newSelect = document.getElementById("stateSelect");

  for (var key in r_callsignManifest.cnt)
  {
    var option = document.createElement("option");
    if (window.opener.g_enums[key])
    {
      option.value = key;
      option.text = window.opener.g_enums[key];
    }
    else
    {
      option.value = "CN-" + key;
      option.text = window.opener.g_enums["CN-" + key];
    }
    newSelect.appendChild(option);
  }
  newSelect.oninput = stateChangedValue;
}

function receiveMessage(event) {}

var g_tracker = {};

function updateWorked()
{
  g_worked = window.opener.g_tracker.worked;
  g_confirmed = window.opener.g_tracker.confirmed;
  g_modes = window.opener.g_modes;
  g_modes_phone = window.opener.g_modes_phone;
  g_tracker = window.opener.g_tracker;

  processAllAwardTrackers();
}

function deleteCallsignIgnore(key)
{
  delete g_blockedCalls[key];
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function deleteDxccIgnore(key)
{
  delete g_blockedDxcc[key];
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function deleteCQIgnore(key)
{
  delete g_blockedCQ[key];
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function clearAllCallsignIgnores()
{
  g_blockedCalls = Object();
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function clearAllDxccIgnores()
{
  g_blockedDxcc = Object();
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function clearAllCQIgnores()
{
  g_blockedCQ = Object();
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function closeEditIgnores()
{
  MainCallRoster.style.display = "block";
  editView.style.display = "none";
}

function openIgnoreEdit()
{
  MainCallRoster.style.display = "none";
  editView.style.display = "inline-block";
  var worker = "";
  var clearString = "<th>none</th>";

  if (Object.keys(g_blockedCalls).length > 0)
  {
    clearString =
      "<th style='cursor:pointer;' onclick='clearAllCallsignIgnores()'>Clear All</th>";
  }
  worker +=
    "<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
    (window.innerHeight - 135) +
    "px;'><table class='darkTable' align=center><tr><th align=left>Callsigns</th>" +
    clearString +
    "</tr>";
  Object.keys(g_blockedCalls)
    .sort()
    .forEach(function (key, i)
    {
      worker +=
        "<tr><td align=left style='color:#FFFF00;' >" +
        key +
        "</td><td style='cursor:pointer;' onclick='deleteCallsignIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  clearString = "<th>none</th>";
  if (Object.keys(g_blockedCQ).length > 0)
  {
    clearString =
      "<th style='cursor:pointer;' onclick='clearAllCQIgnores()'>Clear All</th>";
  }
  worker +=
    "<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
    (window.innerHeight - 135) +
    "px;'><table class='darkTable' align=center><tr><th align=left>CQ</th>" +
    clearString +
    "</tr>";
  Object.keys(g_blockedCQ)
    .sort()
    .forEach(function (key, i)
    {
      worker +=
        "<tr><td align=left style='color:cyan;' >" +
        key +
        "</td><td style='cursor:pointer;' onclick='deleteCQIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  clearString = "<th>none</th>";
  if (Object.keys(g_blockedDxcc).length > 0)
  {
    clearString =
      "<th style='cursor:pointer;' onclick='clearAllDxccIgnores()'>Clear All</th>";
  }
  worker +=
    "<div  style='margin:10px;vertical-align:top;display:inline-block;overflow:auto;overflow-x:hidden;height:" +
    (window.innerHeight - 135) +
    "px;'><table class='darkTable' align=center><tr><th align=left>DXCCs</th>" +
    clearString +
    "</tr>";
  Object.keys(g_blockedDxcc)
    .sort()
    .forEach(function (key, i)
    {
      worker +=
        "<tr><td align=left style='color:#FFA500' >" +
        window.opener.g_dxccToAltName[key] +
        " (" +
        window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].pp +
        ")</td><td style='cursor:pointer;' onclick='deleteDxccIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  editTables.innerHTML = worker;
}

function onMyKeyDown(event)
{
  if (!g_regFocus)
  {
    window.opener.onMyKeyDown(event);
  }
}

function checkForEnter(ele)
{
  if (event.key === "Enter")
  {
    ele.blur();
  }
}

function resize()
{
  if (editView.style.display == "inline-block") openIgnoreEdit();

  window.opener.goProcessRoster();
}

function init()
{
  g_callsignDatabaseDXCC = window.opener.g_callsignDatabaseDXCC;
  g_callsignDatabaseUS = window.opener.g_callsignDatabaseUS;
  g_callsignDatabaseUSplus = window.opener.g_callsignDatabaseUSplus;

  loadAwardJson();

  updateWorked();

  // addAllAwards();

  window.addEventListener("message", receiveMessage, false);

  lockNewWindows();

  if (window.opener.g_mapSettings.offlineMode == false)
  {
    getBuffer(
      "http://app.gridtracker.org/callsigns/manifest.json",
      manifestResult,
      null,
      "http",
      80
    );
  }

  loadSettings();

  window.opener.setRosterSpot(g_rosterSettings.columns.Spot);

  for (var key in g_rosterSettings.wanted)
  {
    if (document.getElementById(key))
    { document.getElementById(key).checked = g_rosterSettings.wanted[key]; }
  }

  g_menu = new nw.Menu();
  g_compactMenu = new nw.Menu();

  var item = new nw.MenuItem({
    type: "normal",
    label: g_rosterSettings.controls ? "Hide Controls" : "Show Controls",
    click: function ()
    {
      if (this.label == "Hide Controls")
      {
        this.label = "Show Controls";
        g_rosterSettings.controls = false;
      }
      else
      {
        this.label = "Hide Controls";
        g_rosterSettings.controls = true;
      }
      g_compactMenu.items[0].label = g_rosterSettings.controls
        ? "Hide Controls"
        : "Show Controls";
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      setVisual();
    }
  });
  g_menu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: g_rosterSettings.controls ? "Hide Controls" : "Show Controls",
    click: function ()
    {
      if (this.label == "Hide Controls")
      {
        this.label = "Show Controls";
        g_rosterSettings.controls = false;
      }
      else
      {
        this.label = "Hide Controls";
        g_rosterSettings.controls = true;
      }
      g_menu.items[0].label = g_rosterSettings.controls
        ? "Hide Controls"
        : "Show Controls";
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      setVisual();
    }
  });
  g_compactMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Compact Mode",
    click: function ()
    {
      g_rosterSettings.compact = true;
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      resize();
    }
  });
  g_menu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Roster Mode",
    click: function ()
    {
      g_rosterSettings.compact = false;
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      resize();
    }
  });
  g_compactMenu.append(item);

  g_callMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Lookup",
    click: function ()
    {
      callLookup(g_targetHash, "");
    }
  });

  g_callMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Gen Msgs",
    click: function ()
    {
      callGenMessage(g_targetHash, "");
    }
  });

  g_callMenu.append(item);

  item = new nw.MenuItem({ type: "separator" });

  g_callMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore Call",
    click: function ()
    {
      var thisCall = callRoster[g_targetHash].DEcall;
      g_blockedCalls[thisCall] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_callMenu.append(item);

  g_callingMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Lookup",
    click: function ()
    {
      callingLookup(g_targetHash, "");
    }
  });

  g_callingMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Gen Msgs",
    click: function ()
    {
      callingGenMessage(g_targetHash, "");
    }
  });

  g_callingMenu.append(item);

  item = new nw.MenuItem({ type: "separator" });
  g_menu.append(item);

  item = new nw.MenuItem({
    type: "checkbox",
    label: "Realtime",
    checked: g_rosterSettings.realtime,
    click: function ()
    {
      g_rosterSettings.realtime = this.checked;
      writeRosterSettings();
      window.opener.goProcessRoster();
    }
  });
  g_menu.append(item);

  item = new nw.MenuItem({ type: "separator" });
  g_menu.append(item);

  for (var key in g_rosterSettings.columns)
  {
    var itemx = new nw.MenuItem({
      type: "checkbox",
      label: key,
      checked: g_rosterSettings.columns[key],
      click: function ()
      {
        g_rosterSettings.columns[this.label] = this.checked;
        if (this.label == "Spot")
        { window.opener.setRosterSpot(g_rosterSettings.columns.Spot); }
        writeRosterSettings();
        window.opener.goProcessRoster();
        resize();
      }
    });

    g_menu.append(itemx);
  }

  item = new nw.MenuItem({ type: "separator" });
  g_menu.append(item);

  g_clearIgnores = new nw.MenuItem({
    type: "normal",
    label: "Clear Call Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCalls = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_menu.append(g_clearIgnores);

  g_clearIgnoresCall = new nw.MenuItem({
    type: "normal",
    label: "Clear Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCalls = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_callMenu.append(g_clearIgnoresCall);

  g_CQMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore CQ from DXCC",
    click: function ()
    {
      g_blockedCQ[
        callRoster[g_targetCQ].DXcall +
          " from " +
          window.opener.g_dxccToAltName[callRoster[g_targetCQ].callObj.dxcc]
      ] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_CQMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore CQ from All",
    click: function ()
    {
      g_blockedCQ[callRoster[g_targetCQ].DXcall + " from All"] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_CQMenu.append(item);

  g_clearCQIgnoreMainMenu = new nw.MenuItem({
    type: "normal",
    label: "Clear CQ Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCQ = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_menu.append(g_clearCQIgnoreMainMenu);

  g_clearCQIgnore = new nw.MenuItem({
    type: "normal",
    label: "Clear Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCQ = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_CQMenu.append(g_clearCQIgnore);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });
  g_CQMenu.append(item);

  g_dxccMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore DXCC",
    click: function ()
    {
      g_blockedDxcc[g_targetDxcc] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_dxccMenu.append(item);

  g_clearDxccIgnoreMainMenu = new nw.MenuItem({
    type: "normal",
    label: "Clear DXCC Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedDxcc = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_menu.append(g_clearDxccIgnoreMainMenu);

  g_clearDxccIgnore = new nw.MenuItem({
    type: "normal",
    label: "Clear Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedDxcc = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_dxccMenu.append(g_clearDxccIgnore);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });
  g_menu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });
  g_callMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });
  g_dxccMenu.append(item);

  callsignNeed.value = g_rosterSettings.callsign;
  huntMode.value = g_rosterSettings.hunting;
  huntNeed.value = g_rosterSettings.huntNeed;
  wantGrid.checked = g_rosterSettings.requireGrid;

  wantMaxDT.checked = g_rosterSettings.wantMaxDT;
  wantMinDB.checked = g_rosterSettings.wantMinDB;
  wantMinFreq.checked = g_rosterSettings.wantMinFreq;
  wantMaxFreq.checked = g_rosterSettings.wantMaxFreq;

  maxDTView.innerHTML = maxDT.value = g_rosterSettings.maxDT;
  minDbView.innerHTML = minDb.value = g_rosterSettings.minDb;
  minFreqView.innerHTML = minFreq.value = g_rosterSettings.minFreq;
  maxFreqView.innerHTML = maxFreq.value = g_rosterSettings.maxFreq;

  maxLoTW.value = g_rosterSettings.maxLoTW;
  maxLoTWView.innerHTML =
    maxLoTW.value < 27 ? Number(maxLoTW.value).toYM() : "<b>&infin;</b>";

  cqOnly.checked = g_rosterSettings.cqOnly;
  noMyDxcc.checked = g_rosterSettings.noMyDxcc;
  onlyMyDxcc.checked = g_rosterSettings.onlyMyDxcc;

  noMsg.checked = g_rosterSettings.noMsg;
  onlyMsg.checked = g_rosterSettings.onlyMsg;
  noMsgValue.value = g_rosterSettings.noMsgValue;
  onlyMsgValue.value = g_rosterSettings.onlyMsgValue;

  usesLoTW.checked = g_rosterSettings.usesLoTW;
  useseQSL.checked = g_rosterSettings.useseQSL;
  onlySpot.checked = g_rosterSettings.onlySpot;
  usesOQRS.checked = g_rosterSettings.usesOQRS;

  referenceNeed.value = g_rosterSettings.reference;
  allOnlyNew.checked = g_rosterSettings.allOnlyNew;
  useRegex.checked = g_rosterSettings.useRegex;
  callsignRegex.value = g_rosterSettings.callsignRegex;

  setVisual();
  document.addEventListener("keydown", onMyKeyDown, false);

  initDXCCSelector();

  g_timerInterval = setInterval(realtimeRoster, 1000);

  updateInstances();
}

function handleContextMenu(ev)
{
  if (editView.style.display == "inline-block") return false;

  var mouseX = Math.round(ev.x);
  var mouseY = Math.round(ev.y);

  var len = Object.keys(g_blockedCalls).length;
  if (len > 0)
  {
    g_clearIgnores.enabled = true;
    g_clearIgnores.label =
      "Clear Call Ignore" + (len > 1 ? "s (" + len + ")" : "");
    g_clearIgnoresCall.enabled = true;
    g_clearIgnoresCall.label =
      "Clear Ignore" + (len > 1 ? "s (" + len + ")" : "");
  }
  else
  {
    g_clearIgnores.label = "Clear Call Ignore";
    g_clearIgnores.enabled = false;
    g_clearIgnoresCall.label = "Clear Ignore";
    g_clearIgnoresCall.enabled = false;
  }

  len = Object.keys(g_blockedDxcc).length;
  if (len > 0)
  {
    g_clearDxccIgnoreMainMenu.enabled = true;
    g_clearDxccIgnoreMainMenu.label =
      "Clear DXCC Ignore" + (len > 1 ? "s (" + len + ")" : "");
    g_clearDxccIgnore.enabled = true;
    g_clearDxccIgnore.label =
      "Clear Ignore" + (len > 1 ? "s (" + len + ")" : "");
  }
  else
  {
    g_clearDxccIgnoreMainMenu.label = "Clear DXCC Ignore";
    g_clearDxccIgnoreMainMenu.enabled = false;
    g_clearDxccIgnore.label = "Clear Ignore";
    g_clearDxccIgnore.enabled = false;
  }

  len = Object.keys(g_blockedCQ).length;
  if (len > 0)
  {
    g_clearCQIgnoreMainMenu.enabled = true;
    g_clearCQIgnoreMainMenu.label =
      "Clear CQ Ignore" + (len > 1 ? "s (" + len + ")" : "");
    g_clearCQIgnore.enabled = true;
    g_clearCQIgnore.label = "Clear Ignore" + (len > 1 ? "s (" + len + ")" : "");
  }
  else
  {
    g_clearCQIgnoreMainMenu.label = "Clear CQ Ignore";
    g_clearCQIgnoreMainMenu.enabled = false;
    g_clearCQIgnore.label = "Clear Ignore";
    g_clearCQIgnore.enabled = false;
  }

  if (typeof ev.target != "undefined")
  {
    if (g_developerMode)
    {
      if ((ev.target.id === "ShowMoreControlsLink") ||
        (ev.target.id === "ShowFewerControlsLink") ||
        (ev.target.id === "txrxdec"))
      {
        // Allow event to bubble up so that NWJS will show the developer menu
        return true;
      }
    }

    var name = ev.target.getAttribute("name");
    if (name == "Callsign")
    {
      g_targetHash = ev.target.parentNode.id;
      g_callMenu.popup(mouseX, mouseY);
    }
    else if (name == "Calling")
    {
      g_targetHash = ev.target.parentNode.id;
      g_callingMenu.popup(mouseX, mouseY);
    }
    else if (name == "CQ")
    {
      if (callRoster[ev.target.parentNode.id].DXcall != "CQ")
      {
        g_targetCQ = ev.target.parentNode.id;
        g_CQMenu.popup(mouseX, mouseY);
      }
    }
    else if (name && name.startsWith("DXCC"))
    {
      var dxcca = name.split("(");
      var dxcc = parseInt(dxcca[1]);
      g_targetDxcc = dxcc;
      g_dxccMenu.popup(mouseX, mouseY);
    }
    else
    {
      if (g_rosterSettings.compact == false)
      {
        g_menu.popup(mouseX, mouseY);
      }
      else
      {
        g_compactMenu.popup(mouseX, mouseY);
      }
    }
  }
  else
  {
    if (g_rosterSettings.compact == false)
    {
      g_menu.popup(mouseX, mouseY);
    }
    else
    {
      g_compactMenu.popup(mouseX, mouseY);
    }
  }

  ev.preventDefault();

  return false;
}

function getTypeFromMode(mode)
{
  if (mode in g_modes)
  {
    if (g_modes[mode] == true) return "Digital";
    else if (g_modes_phone[mode] == true) return "Phone";
  }
  return "";
}

function testAward(awardName, obj, baseHash)
{
  if (
    g_awardTracker[awardName].test.dxcc &&
    g_awardTracker[awardName].rule.dxcc.indexOf(obj.dxcc) == -1
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.mode &&
    g_awardTracker[awardName].rule.mode.indexOf(obj.mode) == -1
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.band &&
    g_awardTracker[awardName].rule.band.indexOf(obj.band) == -1
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.DEcall &&
    g_awardTracker[awardName].rule.call.indexOf(obj.DEcall) == -1
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.cont &&
    g_awardTracker[awardName].rule.cont.indexOf(obj.cont) == -1
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.prop &&
    g_awardTracker[awardName].rule.propMode != obj.propMode
  )
  { return false; }

  if (
    g_awardTracker[awardName].test.sat &&
    g_awardTracker[awardName].rule.satName.indexOf(obj.satName) == -1
  )
  { return false; }

  return g_awardTypes[g_awardTracker[awardName].rule.type].test(
    g_awardTracker[awardName],
    obj,
    baseHash
  );
}

function processAward(awardName)
{
  var award =
    g_awards[g_awardTracker[awardName].sponsor].awards[
      g_awardTracker[awardName].name
    ];
  g_awardTracker[awardName].rule = award.rule;
  var test = (g_awardTracker[awardName].test = {});
  var mode = award.rule.mode.slice();

  var Index = mode.indexOf("Mixed");
  if (Index > -1) mode.splice(Index, 1);

  Index = mode.indexOf("Digital");
  if (Index > -1) mode.splice(Index, 1);

  Index = mode.indexOf("Phone");
  if (Index > -1) mode.splice(Index, 1);

  test.mode = mode.length > 0;

  test.confirmed =
    "qsl_req" in
    g_awards[g_awardTracker[awardName].sponsor].awards[
      g_awardTracker[awardName].name
    ].rule
      ? g_awards[g_awardTracker[awardName].sponsor].awards[
        g_awardTracker[awardName].name
      ].rule.qsl_req == "confirmed"
      : g_awards[g_awardTracker[awardName].sponsor].qsl_req == "confirmed";

  test.look = "confirmed";

  test.qsl_req =
    "qsl_req" in
    g_awards[g_awardTracker[awardName].sponsor].awards[
      g_awardTracker[awardName].name
    ].rule
      ? g_awards[g_awardTracker[awardName].sponsor].awards[
        g_awardTracker[awardName].name
      ].rule.qsl_req
      : g_awards[g_awardTracker[awardName].sponsor].qsl_req;

  test.DEcall = "call" in award.rule;
  test.band = "band" in award.rule && award.rule.band.indexOf("Mixed") == -1;
  test.dxcc = "dxcc" in award.rule;
  test.cont = "cont" in award.rule;
  test.prop = "propMode" in award.rule;
  test.sat = "satName" in award.rule;

  g_awardTracker[awardName].stat = {};

  for (var i in window.opener.g_QSOhash)
  {
    var obj = window.opener.g_QSOhash[i];

    if (test.confirmed && !obj.confirmed) continue;

    if (obj.dxcc < 1) continue;

    if (test.dxcc && award.rule.dxcc.indexOf(obj.dxcc) == -1) continue;

    if (test.mode && award.rule.mode.indexOf(obj.mode) == -1) continue;

    if (test.band && award.rule.band.indexOf(obj.band) == -1) continue;

    if (test.DEcall && award.rule.call.indexOf(obj.DEcall) == -1) continue;

    if (test.cont && award.rule.cont.indexOf(obj.cont) == -1) continue;

    if (test.prop && award.rule.propMode != obj.propMode) continue;

    if (test.sat && award.rule.satName.indexOf(obj.satName) == -1) continue;

    g_awardTypes[award.rule.type].score(g_awardTracker[awardName], obj);
  }

  g_awardTracker[awardName].comp = g_awardTypes[award.rule.type].compile(
    g_awardTracker[awardName],
    g_awardTracker[awardName].stat
  );
  g_awardTracker[awardName].stat = {};
}

function newAwardCountObject()
{
  var statCountObject = {};

  statCountObject.bands = {};
  statCountObject.bands.Mixed = {};
  statCountObject.bands.Digital = {};
  statCountObject.bands.Phone = {};
  statCountObject.modes = {};
  statCountObject.modes.Mixed = {};
  statCountObject.modes.Digital = {};
  statCountObject.modes.Phone = {};
  statCountObject.unique = null;
  return statCountObject;
}

function workAwardObject(obj, band, mode, isDigital, isPhone, unique = null)
{
  obj.bands.Mixed[band] = ~~obj.bands.Mixed[band] + 1;
  if (!(mode in obj.bands)) obj.bands[mode] = {};
  obj.bands[mode][band] = ~~obj.bands[mode][band] + 1;
  obj.modes.Mixed[mode] = ~~obj.modes.Mixed[mode] + 1;

  if (isDigital)
  {
    obj.bands.Digital[band] = ~~obj.bands.Digital[band] + 1;
    obj.modes.Digital[mode] = ~~obj.modes.Digital[mode] + 1;
  }
  if (isPhone)
  {
    obj.bands.Phone[band] = ~~obj.bands.Phone[band] + 1;
    obj.modes.Phone[mode] = ~~obj.modes.Phone[mode] + 1;
  }
  if (unique)
  {
    if (obj.unique == null) obj.unique = {};
    if (!(unique in obj.unique)) obj.unique[unique] = newAwardCountObject();
    workAwardObject(obj.unique[unique], band, mode, isDigital, isPhone);
  }
  return true;
}

function buildAwardTypeHandlers()
{
  g_awardTypes = {
    IOTA: { name: "Islands On The Air" },
    call: { name: "Callsign" },
    callarea: { name: "Call Area" },
    calls2dxcc: { name: "Stations per DXCC" },
    cnty: { name: "County" },
    cont: { name: "Continents" },
    cont5: { name: "5 Continents" },
    cont52band: { name: "5 Continents per Band" },
    cqz: { name: "CQ Zone" },
    dxcc: { name: "DXCC" },
    grids: { name: "Grids" },
    numsfx: { name: "Call Area + Suffix" },
    px: { name: "Prefix" },
    pxa: { name: "Prefixes" },
    pxplus: { name: "Special Calls" },
    sfx: { name: "Suffix" },
    states: { name: "States" },
    cont2band: { name: "Continents per Band" },
    calls2band: { name: "Stations per Band" },
    dxcc2band: { name: "DXCC per Band" },
    states2band: { name: "States per Band" }
  };

  g_awardTypes.IOTA.score = scoreAIOTA;
  g_awardTypes.call.score = scoreAcall;
  g_awardTypes.callarea.score = scoreAcallarea;
  g_awardTypes.calls2dxcc.score = scoreAcalls2dxcc;
  g_awardTypes.cnty.score = scoreAcnty;
  g_awardTypes.cont.score = scoreAcont;
  g_awardTypes.cont5.score = scoreAcont5;
  g_awardTypes.cont52band.score = scoreAcont52band;
  g_awardTypes.cqz.score = scoreAcqz;
  g_awardTypes.dxcc.score = scoreAdxcc;
  g_awardTypes.grids.score = scoreAgrids;
  g_awardTypes.numsfx.score = scoreAnumsfx;
  g_awardTypes.px.score = scoreApx;
  g_awardTypes.pxa.score = scoreApxa;
  g_awardTypes.pxplus.score = scoreApxplus;
  g_awardTypes.sfx.score = scoreAsfx;
  g_awardTypes.states.score = scoreAstates;
  g_awardTypes.cont2band.score = scoreAcont2band;
  g_awardTypes.calls2band.score = scoreAcalls2band;
  g_awardTypes.dxcc2band.score = scoreAdxcc2band;
  g_awardTypes.states2band.score = scoreAstates2band;

  g_awardTypes.IOTA.test = testAIOTA;
  g_awardTypes.call.test = testAcall;
  g_awardTypes.callarea.test = testAcallarea;
  g_awardTypes.calls2dxcc.test = testAcalls2dxcc;
  g_awardTypes.cnty.test = testAcnty;
  g_awardTypes.cont.test = testAcont;
  g_awardTypes.cont5.test = testAcont5;
  g_awardTypes.cont52band.test = testAcont52band;
  g_awardTypes.cqz.test = testAcqz;
  g_awardTypes.dxcc.test = testAdxcc;
  g_awardTypes.grids.test = testAgrids;
  g_awardTypes.numsfx.test = testAnumsfx;
  g_awardTypes.px.test = testApx;
  g_awardTypes.pxa.test = testApxa;
  g_awardTypes.pxplus.test = testApxplus;
  g_awardTypes.sfx.test = testAsfx;
  g_awardTypes.states.test = testAstates;
  g_awardTypes.cont2band.test = testAcont2band;
  g_awardTypes.calls2band.test = testAcalls2band;
  g_awardTypes.dxcc2band.test = testAdxcc2band;
  g_awardTypes.states2band.test = testAstates2band;

  g_awardTypes.IOTA.compile = singleCompile;
  g_awardTypes.call.compile = singleCompile;
  g_awardTypes.callarea.compile = singleCompile;
  g_awardTypes.calls2dxcc.compile = doubleCompile;
  g_awardTypes.cnty.compile = singleCompile;
  g_awardTypes.cont.compile = singleCompile;
  g_awardTypes.cont5.compile = singleCompile;
  g_awardTypes.cont52band.compile = doubleCompile;
  g_awardTypes.cqz.compile = singleCompile;
  g_awardTypes.dxcc.compile = singleCompile;
  g_awardTypes.grids.compile = singleCompile;
  g_awardTypes.numsfx.compile = singleCompile;
  g_awardTypes.px.compile = singleCompile;
  g_awardTypes.pxa.compile = singleCompile;
  g_awardTypes.pxplus.compile = singleCompile;
  g_awardTypes.sfx.compile = singleCompile;
  g_awardTypes.states.compile = singleCompile;
  g_awardTypes.cont2band.compile = doubleCompile;
  g_awardTypes.calls2band.compile = doubleCompile;
  g_awardTypes.dxcc2band.compile = doubleCompile;
  g_awardTypes.states2band.compile = doubleCompile;
}

function scoreAstates(award, obj)
{
  if (obj.state)
  {
    if (!(obj.state in award.stat))
    { award.stat[obj.state] = newAwardCountObject(); }
    return workAwardObject(
      award.stat[obj.state],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAstates(award, obj, baseHash)
{
  if (obj.state && obj.state + baseHash in g_tracker[award.test.look].state)
  {
    return false;
  }
  return true;
}

function scoreAstates2band(award, obj)
{
  if (obj.state)
  {
    if (!(obj.band in award.stat)) award.stat[obj.band] = newAwardCountObject();
    return workAwardObject(
      award.stat[obj.band],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone,
      obj.state
    );
  }
  return false;
}

function testAstates2band(award, obj, baseHash)
{
  if (obj.state && obj.state + baseHash in g_tracker[award.test.look].state)
  {
    return false;
  }
  return true;
}

function scoreAdxcc(award, obj)
{
  if (!(obj.dxcc in award.stat)) award.stat[obj.dxcc] = newAwardCountObject();
  return workAwardObject(
    award.stat[obj.dxcc],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone
  );
}

function testAdxcc(award, obj, baseHash)
{
  if (String(obj.dxcc) + baseHash in g_tracker[award.test.look].dxcc)
  {
    return false;
  }
  return true;
}

function scoreAcont(award, obj)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "AN") cont = "OC";
    if (!(cont in award.stat)) award.stat[cont] = newAwardCountObject();
    return workAwardObject(
      award.stat[cont],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAcont(award, obj, baseHash)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "AN") cont = "OC";

    if (cont + baseHash in g_tracker[award.test.look].cont)
    {
      return false;
    }
  }
  return true;
}

function scoreAcont5(award, obj, baseHash)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "NA" || cont == "SA") cont = "AM";
    if (cont == "AN") cont = "OC";

    if (!(cont in award.stat)) award.stat[cont] = newAwardCountObject();
    return workAwardObject(
      award.stat[cont],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAcont5(award, obj, baseHash)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "NA" || cont == "SA") cont = "AM";
    if (cont == "AN") cont = "OC";

    if (cont + baseHash in g_tracker[award.test.look].cont)
    {
      return false;
    }
  }
  return true;
}

function scoreAcont2band(award, obj)
{
  if (!(obj.band in award.stat)) award.stat[obj.band] = newAwardCountObject();

  return workAwardObject(
    award.stat[obj.band],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone,
    obj.cont
  );
}

function testAcont2band(award, obj, baseHash)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "AN") cont = "OC";

    if (cont + baseHash in g_tracker[award.test.look].cont)
    {
      return false;
    }
  }
  return true;
}

function scoreAcont52band(award, obj)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "NA" || cont == "SA") cont = "AM";
    if (cont == "AN") cont = "OC";

    if (!(obj.band in award.stat)) award.stat[obj.band] = newAwardCountObject();
    return workAwardObject(
      award.stat[obj.band],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone,
      cont
    );
  }
  return false;
}

function testAcont52band(award, obj, baseHash)
{
  if (obj.cont)
  {
    var cont = obj.cont;
    if (cont == "NA" || cont == "SA") cont = "AM";
    if (cont == "AN") cont = "OC";

    if (cont + baseHash in g_tracker[award.test.look].cont)
    {
      return false;
    }
  }
  return true;
}

function scoreAgrids(award, obj)
{
  if (obj.grid)
  {
    var grid = obj.grid.substr(0, 4);

    if (!(grid in award.stat)) award.stat[grid] = newAwardCountObject();
    return workAwardObject(
      award.stat[grid],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAgrids(award, obj, baseHash)
{
  if (obj.grid && obj.grid + baseHash in g_tracker[award.test.look].grid)
  {
    return false;
  }
  return true;
}

function scoreAcnty(award, obj)
{
  if (obj.cnty)
  {
    if (!(obj.cnty in award.stat)) award.stat[obj.cnty] = newAwardCountObject();
    return workAwardObject(
      award.stat[obj.cnty],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAcnty(award, obj, baseHash)
{
  if (obj.cnty && obj.cnty + baseHash in g_tracker[award.test.look].cnty)
  {
    return false;
  }
  return true;
}

function scoreAcall(award, obj)
{
  var call = obj.DEcall;

  if (call.indexOf("/") > -1)
  {
    if (call.endsWith("/MM")) return false;
    call = call.replace("/P", "").replace("/R", "").replace("/QRP");
  }

  if (!(call in award.stat)) award.stat[call] = newAwardCountObject();
  return workAwardObject(
    award.stat[call],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone
  );
}

function testAcall(award, obj, baseHash)
{
  if (obj.DEcall.indexOf("/") > -1 && obj.DEcall.endsWith("/MM")) return false;

  if (obj.DEcall + baseHash in g_tracker[award.test.look].call)
  {
    return false;
  }
  return true;
}

function scoreAIOTA(award, obj)
{
  if (obj.IOTA)
  {
    var test = g_awards[award.sponsor].awards[award.name];

    if ("IOTA" in test.rule && test.rule.IOTA.indexOf(obj.IOTA) == -1)
    { return false; }

    if (!(obj.IOTA in award.stat)) award.stat[obj.IOTA] = newAwardCountObject();
    return workAwardObject(
      award.stat[obj.IOTA],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

// NO IOTA YET
function testAIOTA(award, obj, baseHash)
{
  /* if ( obj.IOTA )
  {
    var test = g_awards[award.sponsor].awards[award.name];

    if ( "IOTA" in test.rule && test.rule.IOTA.indexOf(obj.IOTA) == -1 )
      return false;

  } */

  return false;
}

function scoreAcallarea(award, obj)
{
  if (obj.zone != null)
  {
    var test = g_awards[award.sponsor].awards[award.name];

    if ("zone" in test.rule && test.rule.zone.indexOf(obj.zone) == -1)
    { return false; }

    if (!(obj.zone in award.stat)) award.stat[obj.zone] = newAwardCountObject();
    return workAwardObject(
      award.stat[obj.zone],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAcallarea(award, obj, baseHash)
{
  if (obj.zone != null)
  {
    var test = g_awards[award.sponsor].awards[award.name];

    if ("zone" in test.rule && test.rule.zone.indexOf(obj.zone) == -1)
    { return false; }
  }
  return true;
}

function scoreApx(award, obj)
{
  if (obj.px)
  {
    var test = g_awards[award.sponsor].awards[award.name];
    var px = obj.px;
    if ("px" in test.rule)
    {
      px = px.substr(0, test.rule.px[0].length);
      if (test.rule.px.indexOf(px) == -1) return false;
    }

    if (!(px in award.stat)) award.stat[px] = newAwardCountObject();
    return workAwardObject(
      award.stat[px],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testApx(award, obj, baseHash)
{
  if (obj.px)
  {
    var test = g_awards[award.sponsor].awards[award.name];
    var px = obj.px;
    if ("px" in test.rule)
    {
      px = px.substr(0, test.rule.px[0].length);
      if (test.rule.px.indexOf(px) == -1) return false;
    }

    if (String(obj.px) + baseHash in g_tracker[award.test.look].px)
    {
      return false;
    }
  }
  return true;
}

function scoreApxa(award, obj)
{
  if (obj.px)
  {
    var test = g_awards[award.sponsor].awards[award.name];
    for (var i in test.rule.pxa)
    {
      if (test.rule.pxa[i].indexOf(obj.px) > -1)
      {
        if (!(i in award.stat)) award.stat[i] = newAwardCountObject();
        return workAwardObject(
          award.stat[i],
          obj.band,
          obj.mode,
          obj.digital,
          obj.phone
        );
      }
    }
  }
  return false;
}

function testApxa(award, obj, baseHash)
{
  if (obj.px)
  {
    var test = g_awards[award.sponsor].awards[award.name];
    for (var i in test.rule.pxa)
    {
      if (test.rule.pxa[i].indexOf(obj.px) > -1)
      {
        if (String(obj.px) + baseHash in g_tracker[award.test.look].px)
        {
          return false;
        }
        else
        {
          return true;
        }
      }
    }
  }
  return false;
}

function scoreAsfx(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var suf = obj.DEcall.replace(obj.px, "");
  for (var i in test.rule.sfx)
  {
    for (var s in test.rule.sfx[i])
    {
      if (suf.indexOf(test.rule.sfx[i][s]) == 0)
      {
        if (!(i in award.stat)) award.stat[i] = newAwardCountObject();
        return workAwardObject(
          award.stat[i],
          obj.band,
          obj.mode,
          obj.digital,
          obj.phone
        );
      }
    }
  }

  return false;
}

function testAsfx(award, obj, baseHash)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var suf = obj.DEcall.replace(obj.px, "");
  for (var i in test.rule.sfx)
  {
    for (var s in test.rule.sfx[i])
    {
      if (suf.indexOf(test.rule.sfx[i][s]) == 0)
      {
        return false;
      }
    }
  }

  return true;
}

function scoreAcalls2dxcc(award, obj)
{
  if (!(obj.dxcc in award.stat)) award.stat[obj.dxcc] = newAwardCountObject();

  return workAwardObject(
    award.stat[obj.dxcc],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone,
    obj.DEcall
  );
}

function testAcalls2dxcc(award, obj, baseHash)
{
  if (obj.DEcall + baseHash in g_tracker[award.test.look].call)
  {
    return false;
  }
  return true;
}

function scoreAcalls2band(award, obj)
{
  if (!(obj.band in award.stat)) award.stat[obj.band] = newAwardCountObject();

  return workAwardObject(
    award.stat[obj.band],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone,
    obj.DEcall
  );
}

function testAcalls2band(award, obj, baseHash)
{
  if (obj.DEcall + baseHash in g_tracker[award.test.look].call)
  {
    return false;
  }
  return true;
}

function scoreAdxcc2band(award, obj)
{
  if (!(obj.band in award.stat)) award.stat[obj.band] = newAwardCountObject();

  return workAwardObject(
    award.stat[obj.band],
    obj.band,
    obj.mode,
    obj.digital,
    obj.phone,
    obj.dxcc
  );
}

function testAdxcc2band(award, obj, baseHash)
{
  if (String(obj.dxcc) + baseHash in g_tracker[award.test.look].dxcc)
  {
    return false;
  }
  return true;
}

function scoreAcqz(award, obj)
{
  if (obj.cqz)
  {
    if (!(obj.cqz in award.stat)) award.stat[obj.cqz] = newAwardCountObject();

    return workAwardObject(
      award.stat[obj.cqz],
      obj.band,
      obj.mode,
      obj.digital,
      obj.phone
    );
  }
  return false;
}

function testAcqz(award, obj, baseHash)
{
  if (obj.cqza)
  {
    var x = 0;
    for (var z in obj.cqza)
    {
      if (obj.cqza[z] + baseHash in g_tracker[award.test.look].cqz) x++;
    }
    if (obj.cqza.length == x) return false;
  }
  return true;
}

function scoreAnumsfx(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var px = obj.px.substr(0, obj.px.length - 1);
  var suf = obj.DEcall.replace(px, "");
  suf = suf.substr(0, test.rule.numsfx[0][0].length);
  for (var i in test.rule.numsfx)
  {
    for (var s in test.rule.numsfx[i])
    {
      if (suf.indexOf(test.rule.numsfx[i][s]) == 0)
      {
        if (!(i in award.stat)) award.stat[i] = newAwardCountObject();
        return workAwardObject(
          award.stat[i],
          obj.band,
          obj.mode,
          obj.digital,
          obj.phone
        );
      }
    }
  }

  return false;
}

function testAnumsfx(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var px = obj.px.substr(0, obj.px.length - 1);
  var suf = obj.DEcall.replace(px, "");
  suf = suf.substr(0, test.rule.numsfx[0][0].length);
  for (var i in test.rule.numsfx)
  {
    for (var s in test.rule.numsfx[i])
    {
      if (suf.indexOf(test.rule.numsfx[i][s]) == 0)
      {
        return false;
      }
    }
  }

  return true;
}

function scoreApxplus(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];

  if (test.rule.pxplus)
  {
    for (var i in test.rule.pxplus)
    {
      if (obj.DEcall.indexOf(test.rule.pxplus[i]) == 0)
      {
        if (!(i in award.stat)) award.stat[i] = newAwardCountObject();
        return workAwardObject(
          award.stat[i],
          obj.band,
          obj.mode,
          obj.digital,
          obj.phone
        );
      }
    }
  }
  return false;
}

function testApxplus(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];

  if (test.rule.pxplus)
  {
    for (var i in test.rule.pxplus)
    {
      if (obj.DEcall.indexOf(test.rule.pxplus[i]) == 0)
      {
        return false;
      }
    }
  }
  return true;
}

function loadAwardJson()
{
  g_awards = {};
  var fs = require("fs");
  if (fs.existsSync("./data/awards.json"))
  {
    fileBuf = fs.readFileSync("./data/awards.json");
    try
    {
      g_awards = JSON.parse(fileBuf);
      // fs.writeFileSync("./data/awards.json", JSON.stringify(g_awards,null,2));

      for (var sp in g_awards)
      {
        for (var aw in g_awards[sp].awards)
        {
          if (!("unique" in g_awards[sp].awards[aw].rule))
          { g_awards[sp].awards[aw].rule.unique = 1; }

          if (g_awards[sp].awards[aw].rule.band[0] == "Mixed")
          {
            g_awards[sp].awards[aw].rule.band.shift();
          }

          if (g_awards[sp].awards[aw].rule.band.length == 0)
          {
            g_awards[sp].awards[aw].rule.band = [];
            for (var key in g_awards[sp].mixed)
            {
              g_awards[sp].awards[aw].rule.band.push(g_awards[sp].mixed[key]);
            }
          }
          if (
            g_awards[sp].awards[aw].rule.endorse.length == 1 &&
            g_awards[sp].awards[aw].rule.endorse[0] == "Mixed"
          )
          {
            g_awards[sp].awards[aw].rule.endorse = [];
            for (var key in g_awards[sp].mixed)
            {
              g_awards[sp].awards[aw].rule.endorse.push(
                g_awards[sp].mixed[key]
              );
            }
          }
        }
      }

      buildAwardTypeHandlers();
    }
    catch (e)
    {
      alert("Core awards.json : " + e);
      g_awards = {};
    }
  }
  else alert("Missing core awards.json");
}

function processAllAwardTrackers()
{
  for (var tracker in g_awardTracker)
  {
    if (!(g_awardTracker[tracker].sponsor in g_awards))
    {
      delete g_awardTracker[tracker];
      continue;
    }
    if (
      !(
        g_awardTracker[tracker].name in
        g_awards[g_awardTracker[tracker].sponsor].awards
      )
    )
    {
      delete g_awardTracker[tracker];
      continue;
    }
    processAward(tracker);
  }
  updateAwardList();
}

function newAwardTrackerObject(sponsor, award, enable)
{
  var newAward = {};
  newAward.sponsor = sponsor;
  newAward.name = award;
  newAward.enable = enable;
  newAward.mode = g_awards[sponsor].awards[award].rule.mode[0];
  newAward.band = g_awards[sponsor].awards[award].rule.band[0];
  newAward.count = g_awards[sponsor].awards[award].rule.count[0];
  newAward.stat = {};
  newAward.comp = {};
  newAward.test = {};
  return newAward;
}

function addAllAwards()
{
  for (var sponsor in g_awards)
  {
    for (var award in g_awards[sponsor].awards)
    {
      var awardToAdd = newAwardTrackerObject(sponsor, award, true);

      var hash = awardToAdd.name + "-" + awardToAdd.sponsor;
      if (!(hash in g_awardTracker))
      {
        g_awardTracker[hash] = awardToAdd;
        processAward(hash);
        storeAwardTracker();
      }
    }
  }
  updateAwardList();
  window.opener.goProcessRoster();
}

function delAllAwards()
{
  g_awardTracker = {};
  storeAwardTracker();
  updateAwardList();
  window.opener.goProcessRoster();
}

function newCompileCountObject()
{
  var compileCountObject = {};
  compileCountObject.bands = {};
  compileCountObject.modes = {};
  compileCountObject.endorse = {};
  compileCountObject.counts = {};
  return compileCountObject;
}

function singleCompile(award, obj)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var rule = test.rule;
  var comp = newCompileCountObject();
  for (var mode in rule.mode)
  {
    comp.modes[rule.mode[mode]] = 0;
    comp.bands[rule.mode[mode]] = {};

    for (var band in rule.band)
    {
      comp.bands[rule.mode[mode]][rule.band[band]] = 0;
    }
    for (var key in obj)
    {
      if (
        rule.mode[mode] in obj[key].bands &&
        Object.keys(obj[key].bands[rule.mode[mode]]).length
      )
      {
        comp.modes[rule.mode[mode]] += 1;

        for (var band in rule.band)
        {
          if (rule.band[band] in obj[key].bands[rule.mode[mode]])
          { comp.bands[rule.mode[mode]][rule.band[band]] += 1; }
        }
      }
    }
  }

  for (var mode in comp.modes)
  {
    comp.endorse[mode] = {};
    comp.counts[mode] = {};
    for (var cnts in rule.count)
    {
      comp.counts[mode][rule.count[cnts]] = {
        num: comp.modes[mode],
        per: parseInt(
          Math.min(100, (comp.modes[mode] / rule.count[cnts]) * 100.0)
        )
      };
    }

    for (var endorse in rule.endorse)
    {
      comp.endorse[mode][rule.endorse[endorse]] = {};
      for (var cnts in rule.count)
      {
        comp.endorse[mode][rule.endorse[endorse]][rule.count[cnts]] =
          comp.bands[mode][rule.endorse[endorse]] >= rule.count[cnts];
      }
    }
  }

  return comp;
}

function doubleCompile(award, firstLevel)
{
  var test = g_awards[award.sponsor].awards[award.name];
  var rule = test.rule;

  for (var k in firstLevel)
  {
    firstLevel[k].bands = {};
    // firstLevel[k].modes = {};
    var obj = singleCompile(award, firstLevel[k].unique);

    for (var mode in obj.bands)
    {
      for (var cnt in test.rule.count)
      {
        if (obj.counts[mode][test.rule.count[cnt]].num >= test.rule.unique)
        {
          for (var band in obj.bands[mode])
          {
            if (!(mode in firstLevel[k].bands)) firstLevel[k].bands[mode] = {};

            if (obj.bands[mode][band] > 0)
            {
              firstLevel[k].bands[mode][band] =
                ~~firstLevel[k].bands[mode][band] + 1;
            }
          }
        }
      }
    }
    /* for ( var mode in obj.modes )
    {
      if ( !(mode in firstLevel[k].modes) )
        firstLevel[k].modes[mode] = 0;
      if ( obj.modes[mode] > 0 )
        firstLevel[k].modes[mode] +=  1;
    } */

    delete firstLevel[k].unique;
    firstLevel[k].unique = null;
  }

  return singleCompile(award, firstLevel);
}
