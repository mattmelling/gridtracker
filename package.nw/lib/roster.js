// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

const fs = require("fs");

var callRoster = {};
var g_blockedCalls = {};
var g_blockedCQ = {};
var g_blockedDxcc = {};
var g_blockedCQz = {};
var g_blockedITUz = {};
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
var g_dayAsString = "0";
var g_menu = null;
var g_callMenu = null;
var g_ageMenu = null;
var g_callingMenu = null;
var g_compactMenu = null;
var g_menuItemForCurrentColumn = null;
var g_currentColumnName = null;
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
var g_clearCQzIgnore = null;
var g_clearCQzIgnoreMainMenu = null;
var g_clearITUzIgnore = null;
var g_clearITUzIgnoreMainMenu = null;
var g_timerInterval = null;
var g_typingInRoster = false;
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
  requireGrid: false,
  wantMaxDT: false,
  wantMinDB: false,
  wantMinFreq: false,
  wantMaxFreq: false,
  wantRRCQ: false,
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
  noUnknownDXCC: true,
  callsignRegex: "",
  huntRegexValue: "",
  realtime: true,
  wanted: {
    huntCallsign: false,
    huntGrid: true,
    huntDXCC: true,
    huntCQz: false,
    huntITUz: false,
    huntMarathon: false,
    huntState: false,
    huntCounty: false,
    huntCont: false,
    huntPX: false,
    huntPOTA: false,
    huntQRZ: true,
    huntOAMS: false,
    huntRegex: false
  },
  columns: {
    Callsign: true,
    Band: false,
    Mode: false,
    Calling: true,
    Grid: true,
    Msg: false,
    DXCC: true,
    Flag: true,
    State: true,
    County: false,
    POTA: false,
    Cont: false,
    dB: true,
    Freq: false,
    DT: false,
    Dist: false,
    Azim: true,
    CQz: false,
    ITUz: false,
    PX: false,
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
  controlsExtended: true,
  compact: false,
  settingProfiles: false,

  sortColumn: "Age",
  sortReverse: true
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

if (typeof localStorage.blockedCQz == "undefined")
{
  localStorage.blockedCQz = "{}";
}

if (typeof localStorage.blockedITUz == "undefined")
{
  localStorage.blockedITUz = "{}";
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
  g_blockedCQz = JSON.parse(localStorage.blockedCQz);
  g_blockedITUz = JSON.parse(localStorage.blockedITUz);
}

function storeBlocks()
{
  localStorage.blockedCalls = JSON.stringify(g_blockedCalls);
  localStorage.blockedCQ = JSON.stringify(g_blockedCQ);
  localStorage.blockedDxcc = JSON.stringify(g_blockedDxcc);
  localStorage.blockedCQz = JSON.stringify(g_blockedCQz);
  localStorage.blockedITUz = JSON.stringify(g_blockedITUz);
}

function storeAwardTracker()
{
  localStorage.awardTracker = JSON.stringify(g_awardTracker);
}

function loadSettings()
{
  let readSettings = {};
  if (typeof localStorage.rosterSettings != "undefined")
  {
    readSettings = JSON.parse(localStorage.rosterSettings);
  }
  g_rosterSettings = deepmerge(g_defaultSettings, readSettings);

  fixLegacySettings();

  writeRosterSettings();
}

function fixLegacySettings()
{
  // Not sure why, but Paul Traina added this settings cleanup in August 2020.
  if ("GT" in g_rosterSettings.columns) delete g_rosterSettings.columns.GT;

  // In January 2022, we refactored roster column sorting
  if (g_rosterSettings.lastSortIndex)
  {
    g_rosterSettings.sortColumn = LEGACY_COLUMN_SORT_ID[g_rosterSettings.lastSortIndex] || "Age";
    delete g_rosterSettings.lastSortIndex;
  }

  // In January 2022, we refactored roster column sorting
  if (g_rosterSettings.lastSortReverse)
  {
    g_rosterSettings.sortReverse = g_rosterSettings.lastSortReverse;
    delete g_rosterSettings.lastSortReverse;
  }

  // In January 2022, we added a `columnOrder` setting, which we need to ensure always includes all columns
  g_rosterSettings.columnOrder = validateRosterColumnOrder(g_rosterSettings.columnOrder);
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
    let gui = require("nw.gui");
    let win = gui.Window.get();
    win.on("new-win-policy", function (frame, url, policy)
    {
      gui.Shell.openExternal(url);
      policy.ignore();
    });
  }
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

var rosterTimeout = null;
var rosterFocus = false;

function rosterInFocus()
{
  if (window.opener.g_appSettings.rosterDelayOnFocus)
  {
    rosterFocus = true;
  }
}

function rosterNoFocus()
{
  rosterFocus = false;
  if (rosterTimeout != null)
  {
    nodeTimers.clearTimeout(rosterTimeout);
    rosterTimeout = null;
    viewRoster();
  }
}

function processRoster(roster)
{
  callRoster = roster;
  if (rosterTimeout != null)
  {
    nodeTimers.clearTimeout(rosterTimeout);
    rosterTimeout = null;
  }

  if (rosterFocus)
  {
    rosterTimeout = nodeTimers.setTimeout(viewRoster, window.opener.g_appSettings.rosterDelayTime);
    rosterDelayDiv.style.display = "inline-block";
  }
  else
  {
    viewRoster();
  }
}

function viewRoster()
{
  rosterTimeout = null;
  rosterDelayDiv.style.display = "none";
  let rosterSettings = prepareRosterSettings();
  processRosterFiltering(callRoster, rosterSettings);
  processRosterHunting(callRoster, rosterSettings, g_awardTracker);
  renderRoster(callRoster, rosterSettings);
  sendAlerts(callRoster, rosterSettings);
}

function realtimeRoster()
{
  let now = timeNowSec();
  g_day = parseInt(now / 86400);
  g_dayAsString = String(g_day);

  if (g_rosterSettings.realtime == false) return;

  let timeCols = document.getElementsByClassName("timeCol");
  for (const x in timeCols)
  {
    if ((typeof timeCols[x].id != "undefined") && (typeof callRoster[timeCols[x].id.substr(2)] != "undefined"))
    {
      let when = now - callRoster[timeCols[x].id.substr(2)].callObj.age;
      timeCols[x].innerHTML = when.toDHMS();
    }
  }
  let lifeCols = document.getElementsByClassName("lifeCol");
  for (const x in lifeCols)
  {
    if ((typeof lifeCols[x].id != "undefined") && (typeof callRoster[lifeCols[x].id.substr(2)] != "undefined"))
    {
      let when = now - callRoster[lifeCols[x].id.substr(2)].callObj.life;
      lifeCols[x].innerHTML = when.toDHMS();
    }
  }
  if (g_rosterSettings.columns.Spot)
  {
    let spotCols = document.getElementsByClassName("spotCol");
    for (const x in spotCols)
    {
      if ((typeof spotCols[x].id != "undefined") && (typeof callRoster[spotCols[x].id.substr(2)] != "undefined"))
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
  let result = "";
  if (callObj.spot && callObj.spot.when > 0)
  {
    when = timeNowSec() - callObj.spot.when;
    if (when <= window.opener.g_receptionSettings.viewHistoryTimeSec)
    { result = parseInt(when).toDHM(); }
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
  let thisCall = callRoster[thisHash].DXcall;
  window.opener.startLookup(thisCall, grid);
}

function callGenMessage(thisHash, grid)
{
  let thisCall = callRoster[thisHash].DEcall;
  let instance = callRoster[thisHash].callObj.instance;

  window.opener.startGenMessages(thisCall, grid, instance);
}

function callingGenMessage(thisHash, grid)
{
  let thisCall = callRoster[thisHash].DXcall;
  let instance = callRoster[thisHash].callObj.instance;

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
    let instances = window.opener.g_instances;

    let worker = "";

    let keys = Object.keys(instances).sort();
    for (const key in keys)
    {
      let inst = keys[key];
      let sp = inst.split(" - ");
      let shortInst = sp[sp.length - 1].substring(0, 18);
      let color = "blue";

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
  let option = document.createElement("option");
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
  let selector = document.getElementById(selectElementString);
  selector.innerHTML = "";

  let option = document.createElement("option");
  option.value = defaultValue;
  option.text = selectNameDefault;
  option.selected = true;
  option.disabled = true;
  option.style.display = "none";
  selector.appendChild(option);

  let obj = null;
  if (forObject)
  {
    obj = Object.keys(forObject).sort();
  }
  for (const k in obj)
  {
    let opt = obj[k];
    let option = document.createElement("option");
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
  let awardToAdd = newAwardTrackerObject(
    awardSponsor.value,
    awardName.value,
    true
  );

  let hash = awardToAdd.name + "-" + awardToAdd.sponsor;
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
  let worker =
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

  let keys = Object.keys(g_awardTracker).sort();

  for (const key in keys)
  {
    let award = g_awardTracker[keys[key]];
    let rule = g_awards[award.sponsor].awards[award.name].rule;
    let row = awardTable.insertRow();
    row.id = keys[key];
    let baseAward = false;
    let baseCount = 0;

    let endorseCount = 0;
    let endorseTotal = 0;
    let allEndorse = false;

    let tooltip =
      g_awards[award.sponsor].awards[award.name].tooltip +
      " (" +
      g_awards[award.sponsor].sponsor +
      ")\n";
    tooltip += toTitleCase(award.test.qsl_req) + " QSO\n";
    for (const mode in award.comp.counts)
    {
      tooltip += mode + "\n";
      for (const count in award.comp.counts[mode])
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
        let wrk = "";
        if (Object.keys(award.comp.endorse).length > 0)
        {
          for (const band in award.comp.endorse[mode])
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

    let cell = createCellHtml(
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
  let id = sender.parentNode.parentNode.id;
  delete g_awardTracker[id];
  storeAwardTracker();
  resetAwardAdd();
  updateAwardList();
  window.opener.goProcessRoster();
}

function awardCheckboxChanged(sender)
{
  let awardId = sender.target.parentNode.parentNode.id;
  g_awardTracker[sender.target.parentNode.parentNode.id][sender.target.name] =
    sender.target.checked;
  storeAwardTracker();
  window.opener.goProcessRoster();
}

function awardValueChanged(sender)
{
  let awardId = sender.target.parentNode.parentNode.id;
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
  let cell = row.insertCell();
  if (data == null) cell.innerHTML = value;
  if (title) cell.title = title;
  if (checkbox)
  {
    let x = document.createElement("INPUT");
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
  let cell = row.insertCell();
  cell.innerHTML = html;
  if (title) cell.title = title;

  return cell;
}

function createAwardSelector(cell, target, value, forObject)
{
  let selector = document.createElement("select");
  selector.name = target;
  selector.value = value;
  selector.disabled = forObject.length == 1;
  selector.style.margin = "0px";
  selector.style.padding = "1px";
  if (selector.disabled) selector.style.cursor = "auto";
  selector.addEventListener("change", awardValueChanged);
  for (const opt in forObject)
  {
    let option = document.createElement("option");
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
      instancesWrapper.style.display = "";
    }
    else
    {
      RosterControls.className = "normal";
      instancesWrapper.style.display = "none";
    }
  }
  else
  {
    RosterControls.className = "hidden";
    instancesWrapper.style.display = "none";
  }

  // Award Hunter
  if (referenceNeed.value == LOGBOOK_AWARD_TRACKER)
  {
    HuntModeControls.style.display = "none";
    CallsignsControls.style.display = "none";
    AwardTrackerControls.style.display = "";
    huntingMatrixDiv.style.display = "none";
    updateAwardList();
  }
  else
  {
    for (const key in g_rosterSettings.wanted)
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

  if (huntRegex.checked == true)
  {
    huntRegexValue.style.display = "";
  }
  else
  {
    huntRegexValue.style.display = "none";
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
    let t = element.id.replace("hunt", "");

    if (t in g_rosterSettings.columns)
    {
      g_rosterSettings.columns[t] = true;

      for (const i in g_menu.items)
      {
        if (
          typeof g_menu.items[i].checked != "undefined" &&
          g_menu.items[i].label == t
        )
        { g_menu.items[i].checked = true; }
      }
    }
  }

  setVisual();

  writeRosterSettings();

  g_scriptReport = Object();
  for (const callHash in window.opener.g_callRoster)
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
  g_rosterSettings.wantRRCQ = wantRRCQ.checked;

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
  g_rosterSettings.huntRegexValue = huntRegexValue.value;
  g_rosterSettings.noUnknownDXCC = noUnknownDXCC.checked;

  writeRosterSettings();

  g_scriptReport = Object();
  for (const callHash in window.opener.g_callRoster)
  { window.opener.g_callRoster[callHash].callObj.alerted = false; }
  window.opener.goProcessRoster();
}

function getBuffer(file_url, callback, flag, mode, port, cookie)
{
  let url = require("url");
  let http = require(mode);
  let fileBuffer = null;
  let options = null;
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
    let fsize = res.headers["content-length"];
    let cookies = null;
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
  let rawData = JSON.parse(buffer);
  r_currentUSState = flag;

  g_currentUSCallsigns = Object();
  for (const key in rawData.c) g_currentUSCallsigns[rawData.c[key]] = true;

  window.opener.goProcessRoster();
}

function stateChangedValue(what)
{
  if (r_currentUSState != stateSelect.value && stateSelect.value != "")
  {
    r_currentUSState = stateSelect.value;

    if (window.opener.g_mapSettings.offlineMode == false)
    {
      let callState = r_currentUSState.replace("CN-", "");
      getBuffer(
        "https://storage.googleapis.com/gt_app/callsigns/" + callState + ".callsigns.json",
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
  let items = Object.keys(window.opener.g_dxccToAltName).sort(function (a, b)
  {
    return window.opener.g_dxccToAltName[a].localeCompare(
      window.opener.g_dxccToAltName[b]
    );
  });
  let newSelect = document.getElementById("DXCCsSelect");

  for (const i in items)
  {
    let key = items[i];

    if (
      window.opener.g_dxccInfo[key].geo !=
      "deleted"
    )
    {
      let option = document.createElement("option");
      option.value = key;
      option.text =
        window.opener.g_dxccToAltName[key] +
        " (" +
        window.opener.g_dxccInfo[key].pp +
        ")";

      newSelect.appendChild(option);
    }
  }
  newSelect.oninput = DXCCsChangedValue;
}

function manifestResult(buffer, flag)
{
  r_callsignManifest = JSON.parse(buffer);
  let newSelect = document.getElementById("stateSelect");

  for (const key in r_callsignManifest.cnt)
  {
    let option = document.createElement("option");
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

function deleteCQzIgnore(key)
{
  delete g_blockedCQz[key];
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function deleteITUzIgnore(key)
{
  delete g_blockedITUz[key];
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

function clearAllCQzIgnores()
{
  g_blockedCQz = Object();
  storeBlocks();
  openIgnoreEdit();
  window.opener.goProcessRoster();
}

function clearAllITUzIgnores()
{
  g_blockedITUz = Object();
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
  let worker = "";
  let clearString = "<th>none</th>";

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
        window.opener.g_dxccInfo[key].pp +
        ")</td><td style='cursor:pointer;' onclick='deleteDxccIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  if (Object.keys(g_blockedCQz).length > 0)
  {
    clearString =
      "<th style='cursor:pointer;' onclick='clearAllCQzIgnores()'>Clear All</th>";
  }
  worker +=
    "<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
    (window.innerHeight - 135) +
    "px;'><table class='darkTable' align=center><tr><th align=left>CQ Zones</th>" +
    clearString +
    "</tr>";
  Object.keys(g_blockedCQz)
    .sort()
    .forEach(function (key, i)
    {
      worker +=
        "<tr><td align=left style='color:cyan;' >" +
        key +
        "</td><td style='cursor:pointer;' onclick='deleteCQzIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  if (Object.keys(g_blockedITUz).length > 0)
  {
    clearString =
      "<th style='cursor:pointer;' onclick='clearAllITUzIgnores()'>Clear All</th>";
  }
  worker +=
    "<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" +
    (window.innerHeight - 135) +
    "px;'><table class='darkTable' align=center><tr><th align=left>ITU Zones</th>" +
    clearString +
    "</tr>";
  Object.keys(g_blockedITUz)
    .sort()
    .forEach(function (key, i)
    {
      worker +=
        "<tr><td align=left style='color:cyan;' >" +
        key +
        "</td><td style='cursor:pointer;' onclick='deleteITUzIgnore(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";
    });
  worker += "</table></div>";

  editTables.innerHTML = worker;
  editView.style.height = (window.innerHeight - 50) + "px";
}

function onMyKeyDown(event)
{
  if (!g_typingInRoster)
  {
    window.opener.onMyKeyDown(event);
  }
}

function blurOnEnter(ele)
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
  window.opener.g_rosterInitialized = true;

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
      "https://storage.googleapis.com/gt_app/callsigns/manifest.json",
      manifestResult,
      null,
      "http",
      80
    );
  }
  loadSettings();
  loadRosteri18n();
  g_timerInterval = setInterval(realtimeRoster, 1000);
  updateInstances();
}

function addControls()
{
  window.opener.setRosterSpot(g_rosterSettings.columns.Spot);

  for (const key in g_rosterSettings.wanted)
  {
    if (document.getElementById(key))
    { document.getElementById(key).checked = g_rosterSettings.wanted[key]; }
  }

  g_menu = new nw.Menu();
  g_compactMenu = new nw.Menu();
  let showControlsText = $.i18n("roster.menu.ShowControls");
  let hideControlsText = $.i18n("roster.menu.HideControls");
  let item = new nw.MenuItem({
    type: "normal",
    label: g_rosterSettings.controls ? hideControlsText : showControlsText,
    click: function ()
    {
      if (this.label == "Hide Controls")
      {
        this.label = showControlsText;
        g_rosterSettings.controls = false;
      }
      else
      {
        this.label = hideControlsText;
        g_rosterSettings.controls = true;
      }
      g_compactMenu.items[0].label = g_rosterSettings.controls
        ? hideControlsText
        : showControlsText;
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      setVisual();
    }
  });
  g_menu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: g_rosterSettings.controls ? hideControlsText : showControlsText,
    click: function ()
    {
      if (this.label == hideControlsText)
      {
        this.label = showControlsText;
        g_rosterSettings.controls = false;
      }
      else
      {
        this.label = hideControlsText;
        g_rosterSettings.controls = true;
      }
      g_menu.items[0].label = g_rosterSettings.controls
        ? hideControlsText
        : showControlsText;
      localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
      setVisual();
    }
  });
  g_compactMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: $.i18n("roster.menu.CompactMode"),
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
    label: $.i18n("roster.menu.RosterMode"),
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
    label: $.i18n("roster.menu.Lookup"),
    click: function ()
    {
      callLookup(g_targetHash, "");
    }
  });

  g_callMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: $.i18n("roster.menu.GenMesg"),
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
    label: $.i18n("roster.menu.IgnoreCall"),
    click: function ()
    {
      let thisCall = callRoster[g_targetHash].DEcall;
      g_blockedCalls[thisCall] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_callMenu.append(item);

  g_callingMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: $.i18n("roster.menu.Lookup"),
    click: function ()
    {
      callingLookup(g_targetHash, "");
    }
  });

  g_callingMenu.append(item);

  item = new nw.MenuItem({
    type: "normal",
    label: $.i18n("roster.menu.GenMesg"),
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
    label: $.i18n("roster.menu.Realtime"),
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

  g_menuItemForCurrentColumn = new nw.MenuItem({
    type: "normal",
    label: $.i18n("roster.menu.MoveLeft"),
    click: function ()
    {
      moveColumnLeft(g_currentColumnName);
    }
  })
  g_menu.append(g_menuItemForCurrentColumn)

  item = new nw.MenuItem({ type: "separator" });
  g_menu.append(item);

  for (const columnIndex in g_rosterSettings.columnOrder)
  {
    let key = g_rosterSettings.columnOrder[columnIndex];
    if (key != "Callsign")
    {
      let itemx = new nw.MenuItem({
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

  g_CQzMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore CQ Zone",
    click: function ()
    {
      g_blockedCQz[callRoster[g_targetCQz].callObj.cqz] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_CQzMenu.append(item);

  g_clearCQzIgnoreMainMenu = new nw.MenuItem({
    type: "normal",
    label: "Clear CQ Zone Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCQz = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_clearCQzIgnore = new nw.MenuItem({
    type: "normal",
    label: "Clear Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedCQz = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });
  g_CQzMenu.append(g_clearCQzIgnore);

  g_CQzMenu.append(g_clearCQzIgnoreMainMenu);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });

  g_CQzMenu.append(item);

  g_ITUzMenu = new nw.Menu();

  item = new nw.MenuItem({
    type: "normal",
    label: "Ignore ITU Zone",
    click: function ()
    {
      g_blockedITUz[callRoster[g_targetITUz].callObj.ituz] = true;
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_ITUzMenu.append(item);

  g_clearITUzIgnoreMainMenu = new nw.MenuItem({
    type: "normal",
    label: "Clear ITU Zone Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedITUz = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_ITUzMenu.append(g_clearITUzIgnoreMainMenu);

  g_clearITUzIgnore = new nw.MenuItem({
    type: "normal",
    label: "Clear Ignore",
    enabled: false,
    click: function ()
    {
      g_blockedITUz = Object();
      storeBlocks();
      window.opener.goProcessRoster();
    }
  });

  g_ITUzMenu.append(g_clearITUzIgnore);

  item = new nw.MenuItem({
    type: "normal",
    label: "Edit Ignores",
    enabled: true,
    click: function ()
    {
      openIgnoreEdit();
    }
  });

  g_ITUzMenu.append(item);

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
  wantRRCQ.checked = g_rosterSettings.wantRRCQ;

  maxDTView.innerHTML = maxDT.value = g_rosterSettings.maxDT;
  minDbView.innerHTML = minDb.value = g_rosterSettings.minDb;
  minFreqView.innerHTML = minFreq.value = g_rosterSettings.minFreq;
  maxFreqView.innerHTML = maxFreq.value = g_rosterSettings.maxFreq;

  maxLoTW.value = g_rosterSettings.maxLoTW;
  maxLoTWView.innerHTML = maxLoTW.value < 27 ? Number(maxLoTW.value).toYM() : "<b>&infin;</b>";

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
  huntRegexValue.value = g_rosterSettings.huntRegexValue;

  noUnknownDXCC.checked = g_rosterSettings.noUnknownDXCC;

  setVisual();
  document.addEventListener("keydown", onMyKeyDown, false);

  initDXCCSelector();
  g_timerInterval = nodeTimers.setInterval(realtimeRoster, 1000);

  updateInstances();
}

function handleContextMenu(ev)
{
  if (editView.style.display == "inline-block") return false;

  let mouseX = Math.round(ev.x);
  let mouseY = Math.round(ev.y);

  let len = Object.keys(g_blockedCalls).length;
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

  len = Object.keys(g_blockedCQz).length;
  if (len > 0)
  {
    g_clearCQzIgnoreMainMenu.enabled = true;
    g_clearCQzIgnoreMainMenu.label =
      "Clear CQ Zone Ignore" + (len > 1 ? "s (" + len + ")" : "");
    g_clearCQzIgnore.enabled = true;
    g_clearCQzIgnore.label = "Clear Ignore" + (len > 1 ? "s (" + len + ")" : "");
  }
  else
  {
    g_clearCQzIgnoreMainMenu.label = "Clear CQ Zone Ignore";
    g_clearCQzIgnoreMainMenu.enabled = false;
    g_clearCQzIgnore.label = "Clear Ignore";
    g_clearCQzIgnore.enabled = false;
  }

  len = Object.keys(g_blockedITUz).length;
  if (len > 0)
  {
    g_clearITUzIgnoreMainMenu.enabled = true;
    g_clearITUzIgnoreMainMenu.label =
      "Clear ITU Zone Ignore" + (len > 1 ? "s (" + len + ")" : "");
    g_clearITUzIgnore.enabled = true;
    g_clearITUzIgnore.label = "Clear Ignore" + (len > 1 ? "s (" + len + ")" : "");
  }
  else
  {
    g_clearITUzIgnoreMainMenu.label = "Clear ITU Zone Ignore";
    g_clearITUzIgnoreMainMenu.enabled = false;
    g_clearITUzIgnore.label = "Clear Ignore";
    g_clearITUzIgnore.enabled = false;
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

    let name = "";
    if (ev.target.tagName == "TD")
    {
      name = ev.target.getAttribute("name");
    }

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
    else if (name == "CQz")
    {
      g_targetCQz = ev.target.parentNode.id;
      g_CQzMenu.popup(mouseX, mouseY);
    }
    else if (name == "ITUz")
    {
      g_targetITUz = ev.target.parentNode.id;
      g_ITUzMenu.popup(mouseX, mouseY);
    }
    else if (name && name.startsWith("DXCC"))
    {
      let dxcca = name.split("(");
      let dxcc = parseInt(dxcca[1]);
      g_targetDxcc = dxcc;
      g_dxccMenu.popup(mouseX, mouseY);
    }
    else
    {
      if (g_rosterSettings.compact)
      {
        g_compactMenu.popup(mouseX, mouseY);
      }
      else
      {
        if (ev.target.tagName == "TH" && ev.target.getAttribute("name"))
        {
          g_menuItemForCurrentColumn.enabled = true;
          g_currentColumnName = ev.target.getAttribute("name");
        }
        else
        {
          g_menuItemForCurrentColumn.enabled = false;
          g_currentColumnName = null;
        }

        g_menu.popup(mouseX, mouseY);
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
  let award =
    g_awards[g_awardTracker[awardName].sponsor].awards[
      g_awardTracker[awardName].name
    ];
  g_awardTracker[awardName].rule = award.rule;
  let test = (g_awardTracker[awardName].test = {});
  let mode = award.rule.mode.slice();

  let Index = mode.indexOf("Mixed");
  if (Index > -1) mode.splice(Index, 1);

  Index = mode.indexOf("Digital");
  if (Index > -1) mode.splice(Index, 1);

  Index = mode.indexOf("Phone");
  if (Index > -1) mode.splice(Index, 1);

  test.mode = mode.length > 0;
  test.confirmed = "qsl_req" in g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule ? g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule.qsl_req == "confirmed" : g_awards[g_awardTracker[awardName].sponsor].qsl_req == "confirmed";
  test.look = "confirmed";
  test.qsl_req = "qsl_req" in g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule ? g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule.qsl_req : g_awards[g_awardTracker[awardName].sponsor].qsl_req;
  test.DEcall = "call" in award.rule;
  test.band = "band" in award.rule && award.rule.band.indexOf("Mixed") == -1;
  test.dxcc = "dxcc" in award.rule;
  test.cont = "cont" in award.rule;
  test.prop = "propMode" in award.rule;
  test.sat = "satName" in award.rule;

  g_awardTracker[awardName].stat = {};

  for (const i in window.opener.g_QSOhash)
  {
    let obj = window.opener.g_QSOhash[i];

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
  let statCountObject = {};

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
  if (String(obj.dxcc) + "|" + baseHash in g_tracker[award.test.look].dxcc)
  {
    return false;
  }
  return true;
}

function scoreAcont(award, obj)
{
  if (obj.cont)
  {
    let cont = obj.cont;
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
    let cont = obj.cont;
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
    let cont = obj.cont;
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
    let cont = obj.cont;
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
    let cont = obj.cont;
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
    let cont = obj.cont;
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
    let cont = obj.cont;
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
  if (obj.grid && obj.grid.length > 0)
  {
    let grid = obj.grid.substr(0, 4);

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
  if (!obj.grid || obj.grid.length == 0)
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
  let call = obj.DEcall;

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
    let test = g_awards[award.sponsor].awards[award.name];

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
    let test = g_awards[award.sponsor].awards[award.name];

    if ( "IOTA" in test.rule && test.rule.IOTA.indexOf(obj.IOTA) == -1 )
      return false;

  } */

  return false;
}

function scoreAcallarea(award, obj)
{
  if (obj.zone != null)
  {
    let test = g_awards[award.sponsor].awards[award.name];

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
    let test = g_awards[award.sponsor].awards[award.name];

    if ("zone" in test.rule && test.rule.zone.indexOf(obj.zone) == -1)
    { return false; }
  }
  return true;
}

function scoreApx(award, obj)
{
  if (obj.px)
  {
    let test = g_awards[award.sponsor].awards[award.name];
    let px = obj.px;
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
    let test = g_awards[award.sponsor].awards[award.name];
    let px = obj.px;
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
    let test = g_awards[award.sponsor].awards[award.name];
    for (const i in test.rule.pxa)
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
    let test = g_awards[award.sponsor].awards[award.name];
    for (const i in test.rule.pxa)
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
  let test = g_awards[award.sponsor].awards[award.name];
  let suf = obj.DEcall.replace(obj.px, "");
  for (const i in test.rule.sfx)
  {
    for (const s in test.rule.sfx[i])
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
  let test = g_awards[award.sponsor].awards[award.name];
  let suf = obj.DEcall.replace(obj.px, "");
  for (const i in test.rule.sfx)
  {
    for (const s in test.rule.sfx[i])
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
  if (String(obj.dxcc) + "|" + baseHash in g_tracker[award.test.look].dxcc)
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
  if (obj.cqz)
  {
    if (obj.cqz + "|" + baseHash in g_tracker[award.test.look].cqz) return false;
  }
  return true;
}

function scoreAnumsfx(award, obj)
{
  if (obj.px)
  {
    let test = g_awards[award.sponsor].awards[award.name];
    let px = obj.px.substr(0, obj.px.length - 1);
    let suf = obj.DEcall.replace(px, "");
    suf = suf.substr(0, test.rule.numsfx[0][0].length);
    for (const i in test.rule.numsfx)
    {
      for (const s in test.rule.numsfx[i])
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
  }
  return false;
}

function testAnumsfx(award, obj)
{
  if (obj.px)
  {
    let test = g_awards[award.sponsor].awards[award.name];
    let px = obj.px.substr(0, obj.px.length - 1);
    let suf = obj.DEcall.replace(px, "");
    suf = suf.substr(0, test.rule.numsfx[0][0].length);
    for (const i in test.rule.numsfx)
    {
      for (const s in test.rule.numsfx[i])
      {
        if (suf.indexOf(test.rule.numsfx[i][s]) == 0)
        {
          return false;
        }
      }
    }
  }

  return true;
}

function scoreApxplus(award, obj)
{
  let test = g_awards[award.sponsor].awards[award.name];

  if (test.rule.pxplus)
  {
    for (const i in test.rule.pxplus)
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
  let test = g_awards[award.sponsor].awards[award.name];

  if (test.rule.pxplus)
  {
    for (const i in test.rule.pxplus)
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
  let fs = require("fs");
  if (fs.existsSync("./data/awards.json"))
  {
    fileBuf = fs.readFileSync("./data/awards.json");
    try
    {
      g_awards = JSON.parse(fileBuf);
      // fs.writeFileSync("./data/awards.json", JSON.stringify(g_awards,null,2));

      for (const sp in g_awards)
      {
        for (const aw in g_awards[sp].awards)
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
            for (let key in g_awards[sp].mixed)
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
            for (let key in g_awards[sp].mixed)
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
  for (let tracker in g_awardTracker)
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
  let newAward = {};
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
  for (let sponsor in g_awards)
  {
    for (let award in g_awards[sponsor].awards)
    {
      let awardToAdd = newAwardTrackerObject(sponsor, award, true);

      let hash = awardToAdd.name + "-" + awardToAdd.sponsor;
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
  let compileCountObject = {};
  compileCountObject.bands = {};
  compileCountObject.modes = {};
  compileCountObject.endorse = {};
  compileCountObject.counts = {};
  return compileCountObject;
}

function singleCompile(award, obj)
{
  let test = g_awards[award.sponsor].awards[award.name];
  let rule = test.rule;
  let comp = newCompileCountObject();
  for (let mode in rule.mode)
  {
    comp.modes[rule.mode[mode]] = 0;
    comp.bands[rule.mode[mode]] = {};

    for (let band in rule.band)
    {
      comp.bands[rule.mode[mode]][rule.band[band]] = 0;
    }
    for (let key in obj)
    {
      if (
        rule.mode[mode] in obj[key].bands &&
        Object.keys(obj[key].bands[rule.mode[mode]]).length
      )
      {
        comp.modes[rule.mode[mode]] += 1;

        for (let band in rule.band)
        {
          if (rule.band[band] in obj[key].bands[rule.mode[mode]])
          { comp.bands[rule.mode[mode]][rule.band[band]] += 1; }
        }
      }
    }
  }

  for (let mode in comp.modes)
  {
    comp.endorse[mode] = {};
    comp.counts[mode] = {};
    for (let cnts in rule.count)
    {
      comp.counts[mode][rule.count[cnts]] = {
        num: comp.modes[mode],
        per: parseInt(
          Math.min(100, (comp.modes[mode] / rule.count[cnts]) * 100.0)
        )
      };
    }

    for (let endorse in rule.endorse)
    {
      comp.endorse[mode][rule.endorse[endorse]] = {};
      for (let cnts in rule.count)
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
  let test = g_awards[award.sponsor].awards[award.name];
  let rule = test.rule;

  for (let k in firstLevel)
  {
    firstLevel[k].bands = {};
    // firstLevel[k].modes = {};
    let obj = singleCompile(award, firstLevel[k].unique);

    for (let mode in obj.bands)
    {
      for (let cnt in test.rule.count)
      {
        if (obj.counts[mode][test.rule.count[cnt]].num >= test.rule.unique)
        {
          for (let band in obj.bands[mode])
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
    /* for ( let mode in obj.modes )
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

function listShortInstances()
{
  let shortInstances = [];
  if (typeof window.opener.g_instancesIndex != "undefined" && typeof window.opener.g_instances != "undefined")
  {
    if (window.opener.g_instancesIndex.length > 1)
    {
      let instances = window.opener.g_instances;
      let keys = Object.keys(instances).sort();
      for (let key in keys)
      {
        let inst = keys[key];
        let sp = inst.split(" - ");
        let shortInst = sp[sp.length - 1].substring(0, 18);
        shortInstances.push(shortInst);
      }
    }
  }
  return shortInstances;
}
