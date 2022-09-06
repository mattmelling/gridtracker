// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_alerts = Object();
var g_classicAlerts = Object();
var g_phonetics = Object();
var g_enums = Object();
var g_speechSettings = Object();
var g_audioSettings = Object();
var g_speechAvailable = false;
var g_alertSettings = Object();

function loadAlerts()
{
  if (typeof localStorage.classicAlertsVersion == "undefined")
  {
    g_classicAlerts = {
      huntCallsign: false,
      huntGrid: false,
      huntDXCC: false,
      huntCQz: false,
      huntITUz: false,
      huntStates: false,
      huntCallsignNeed: "worked",
      huntGridNeed: "confirmed",
      huntDXCCNeed: "confirmed",
      huntCQzNeed: "confirmed",
      huntITUzNeed: "confirmed",
      huntStatesNeed: "confirmed",
      huntCallsignNotify: "1",
      huntGridNotify: "1",
      huntDXCCNotify: "1",
      huntCQzNotify: "1",
      huntITUzNotify: "1",
      huntStatesNotify: "1",
      huntCallsignNotifyWord: "Wanted Call",
      huntGridNotifyWord: "Wanted Grid",
      huntDXCCNotifyWord: "Wanted DXCC",
      huntCQzNotifyWord: "Wanted CQ Zone",
      huntITUzNotifyWord: "Wanted I-T-U Zone",
      huntStatesNotifyWord: "Wanted State",
      huntCallsignNotifyMedia: "none",
      huntGridNotifyMedia: "none",
      huntDXCCNotifyMedia: "none",
      huntCQzNotifyMedia: "none",
      huntITUzNotifyMedia: "none",
      huntStatesNotifyMedia: "none"
    };
    localStorage.classicAlerts = JSON.stringify(g_classicAlerts);

    g_alertSettings = Object();
    g_alertSettings.requireGrid = true;
    g_alertSettings.wantMaxDT = false;
    g_alertSettings.wantMinDB = false;
    g_alertSettings.wantMinFreq = false;
    g_alertSettings.wantMaxFreq = false;
    g_alertSettings.maxDT = 0.5;
    g_alertSettings.minDb = -24;
    g_alertSettings.minFreq = 400;
    g_alertSettings.maxFreq = 3500;
    g_alertSettings.noMyDxcc = false;
    g_alertSettings.onlyMyDxcc = false;
    g_alertSettings.noRoundUp = false;
    g_alertSettings.onlyRoundUp = false;
    g_alertSettings.cqOnly = true;
    g_alertSettings.usesLoTW = false;
    g_alertSettings.useseQSL = false;
    g_alertSettings.reference = 0;
    g_alertSettings.logEventMedia = "Ping-coin.mp3";

    localStorage.alertSettings = JSON.stringify(g_alertSettings);
    localStorage.classicAlertsVersion = gtVersion;
  }
  else
  {
    g_classicAlerts = JSON.parse(localStorage.classicAlerts);
    g_alertSettings = JSON.parse(localStorage.alertSettings);
  }

  if (typeof g_alertSettings.reference == "undefined")
  {
    g_alertSettings.reference = 0;

    localStorage.alertSettings = JSON.stringify(g_alertSettings);
  }

  if (typeof g_alertSettings.logEventMedia == "undefined")
  {
    g_alertSettings.logEventMedia = "Ping-coin.mp3";
    localStorage.alertSettings = JSON.stringify(g_alertSettings);
  }

  if (typeof g_classicAlerts.huntRoster == "undefined")
  {
    g_classicAlerts.huntRoster = false;
    g_classicAlerts.huntRosterNotify = 1;
    g_classicAlerts.huntRosterNotifyWord = "New hit";
    g_classicAlerts.huntRosterNotifyMedia = "none";

    localStorage.classicAlerts = JSON.stringify(g_classicAlerts);
  }

  loadClassicAlertView();

  if (typeof localStorage.savedAlerts == "undefined")
  {
    g_alerts = {
      popup: {
        value: "QRZ",
        type: "4",
        notify: "2",
        repeat: "2",
        filename: "",
        shortname: "",
        lastMessage: "",
        lastTime: 0,
        fired: 0,
        needAck: 0
      }
    };

    g_speechSettings = Object();
    g_audioSettings = Object();
    g_speechSettings.rate = 1;
    g_speechSettings.pitch = 1;
    g_speechSettings.volume = 1;
    g_speechSettings.voice = 0;
    g_speechSettings.phonetics = true;
    g_audioSettings.volume = 1;
    saveAlerts();
  }
  else
  {
    g_alerts = JSON.parse(localStorage.savedAlerts);
    for (var key in g_alerts)
    {
      if (
        g_alerts[key].type != 0 &&
        g_alerts[key].type != 2 &&
        g_alerts[key].type != 4 &&
        g_alerts[key].type != 5 &&
        g_alerts[key].type != 6
      )
      { delete g_alerts[key]; }
      if (g_alerts[key].repeat == 3) delete g_alerts[key];
    }
    g_speechSettings = JSON.parse(localStorage.speechSettings);
    g_audioSettings = JSON.parse(localStorage.audioSettings);
  }

  if (g_speechSettings.voice > 0)
  {
    alertVoiceInput.value = g_speechSettings.voice - 1;
  }

  speechVolume.value = g_speechSettings.volume;
  speechPitch.value = g_speechSettings.pitch;
  speechRate.value = g_speechSettings.rate;
  speechPhonetics.checked = g_speechSettings.phonetics;

  speechVolumeTd.innerText = speechVolume.value;
  speechPitchTd.innerText = speechPitch.value;
  speechRateTd.innerText = speechRate.value;

  audioVolume.value = g_audioSettings.volume;
  audioVolumeTd.innerText = parseInt(audioVolume.value * 100) + "%";

  wantGrid.checked = g_alertSettings.requireGrid;

  wantMaxDT.checked = g_alertSettings.wantMaxDT;
  wantMinDB.checked = g_alertSettings.wantMinDB;
  wantMinFreq.checked = g_alertSettings.wantMinFreq;
  wantMaxFreq.checked = g_alertSettings.wantMaxFreq;

  maxDTView.innerHTML = maxDT.value = g_alertSettings.maxDT;
  minDbView.innerHTML = minDb.value = g_alertSettings.minDb;
  minFreqView.innerHTML = minFreq.value = g_alertSettings.minFreq;
  maxFreqView.innerHTML = maxFreq.value = g_alertSettings.maxFreq;

  cqOnly.checked = g_alertSettings.cqOnly;
  noMyDxcc.checked = g_alertSettings.noMyDxcc;
  onlyMyDxcc.checked = g_alertSettings.onlyMyDxcc;
  noRoundUp.checked = g_alertSettings.noRoundUp;
  onlyRoundUp.checked = g_alertSettings.onlyRoundUp;
  usesLoTW.checked = g_alertSettings.usesLoTW;
  useseQSL.checked = g_alertSettings.useseQSL;

  referenceNeed.value = g_alertSettings.reference;
  logEventMedia.value = g_alertSettings.logEventMedia;
  setAlertVisual();
}

function newLogEventSetting(obj)
{
  g_alertSettings.logEventMedia = obj.value;
  localStorage.alertSettings = JSON.stringify(g_alertSettings);
}

function exceptionValuesChanged()
{
  setAlertVisual();

  g_alertSettings.requireGrid = wantGrid.checked;

  g_alertSettings.wantMaxDT = wantMaxDT.checked;
  g_alertSettings.wantMinDB = wantMinDB.checked;
  g_alertSettings.wantMinFreq = wantMinFreq.checked;
  g_alertSettings.wantMaxFreq = wantMaxFreq.checked;

  maxDTView.innerHTML = g_alertSettings.maxDT = maxDT.value;
  minDbView.innerHTML = g_alertSettings.minDb = minDb.value;
  minFreqView.innerHTML = g_alertSettings.minFreq = minFreq.value;
  maxFreqView.innerHTML = g_alertSettings.maxFreq = maxFreq.value;

  g_alertSettings.cqOnly = cqOnly.checked;
  g_alertSettings.noMyDxcc = noMyDxcc.checked;
  g_alertSettings.onlyMyDxcc = onlyMyDxcc.checked;
  g_alertSettings.noRoundUp = noRoundUp.checked;
  g_alertSettings.onlyRoundUp = onlyRoundUp.checked;
  g_alertSettings.usesLoTW = usesLoTW.checked;
  g_alertSettings.useseQSL = useseQSL.checked;

  g_alertSettings.reference = referenceNeed.value;

  localStorage.alertSettings = JSON.stringify(g_alertSettings);
}

function hashMaker(band, mode)
{
  // "Current Band & Mode"
  if (g_alertSettings.reference == 0) return band + mode;

  // "Current Band, Any Mode"
  if (g_alertSettings.reference == 1) return band;

  // "Current Band, Any Digi Mode"
  if (g_alertSettings.reference == 2) return band + "dg";

  // "Current Mode, Any Band"
  if (g_alertSettings.reference == 3) return mode;

  // "Any Band, Any Mode"
  if (g_alertSettings.reference == 4) return "";

  // "Any Band, Any Digit Mode"
  if (g_alertSettings.reference == 5) return "dg";
}

function setAlertVisual()
{
  if (wantMaxDT.checked == true)
  {
    maxDT.style.display = "block";
    maxDTView.style.display = "block";
  }
  else
  {
    maxDT.style.display = "none";
    maxDTView.style.display = "none";
  }
  if (wantMinDB.checked == true)
  {
    minDb.style.display = "block";
    minDbView.style.display = "block";
  }
  else
  {
    minDb.style.display = "none";
    minDbView.style.display = "none";
  }
  if (wantMinFreq.checked == true)
  {
    minFreq.style.display = "block";
    minFreqView.style.display = "block";
  }
  else
  {
    minFreq.style.display = "none";
    minFreqView.style.display = "none";
  }
  if (wantMaxFreq.checked == true)
  {
    maxFreq.style.display = "block";
    maxFreqView.style.display = "block";
  }
  else
  {
    maxFreq.style.display = "none";
    maxFreqView.style.display = "none";
  }

  if (g_callsignLookups.lotwUseEnable == true)
  { usesLoTWDiv.style.display = "block"; }
  else usesLoTWDiv.style.display = "none";

  if (g_callsignLookups.eqslUseEnable == true)
  { useseQSLDiv.style.display = "block"; }
  else useseQSLDiv.style.display = "none";
}

function saveAlertSettings()
{
  localStorage.speechSettings = JSON.stringify(g_speechSettings);
  localStorage.audioSettings = JSON.stringify(g_audioSettings);
}

function saveAlerts()
{
  localStorage.savedAlerts = JSON.stringify(g_alerts);

  saveAlertSettings();
}

var g_testAudioTimer = null;

function changeAudioValues()
{
  if (g_testAudioTimer) nodeTimers.clearTimeout(g_testAudioTimer);

  g_audioSettings.volume = audioVolume.value;
  audioVolumeTd.innerText = parseInt(audioVolume.value * 100) + "%";

  g_testAudioTimer = nodeTimers.setTimeout(playTestFile, 200);
  saveAlertSettings();
}

function playTestFile()
{
  playAlertMediaFile("Sysenter-7.mp3");
}

function changeSpeechValues()
{
  chrome.tts.stop();

  g_speechSettings.volume = speechVolume.value;
  g_speechSettings.pitch = speechPitch.value;
  g_speechSettings.rate = speechRate.value;
  g_speechSettings.phonetics = speechPhonetics.checked;

  speechVolumeTd.innerText = speechVolume.value;
  speechPitchTd.innerText = speechPitch.value;
  speechRateTd.innerText = speechRate.value;

  saveAlertSettings();
}

function addNewAlert()
{
  var error = "<font color='green'>Added</font>";
  var valid = true;
  var filename = "";
  var shortname = "";
  if (alertNotifySelect.value == 0)
  {
    if (alertMediaSelect.value == "none")
    {
      valid = false;
      error = $.i18n("alerts.addNew.SelectFile");
    }
    else
    {
      filename = alertMediaSelect.value;
      shortname = alertMediaSelect.selectedOptions[0].innerText;
    }
  }
  if (valid)
  {
    if (alertTypeSelect.value == 0 || alertTypeSelect.value == 5)
    {
      valid = ValidateCallsign(alertValueInput, null);
      if (!valid)
      {
        error = "Invalid Callsign";
      }
    }
  }
  if (valid)
  {
    valid = addAlert(
      alertValueInput.value,
      alertTypeSelect.value,
      alertNotifySelect.value,
      alertRepeatSelect.value,
      filename,
      shortname
    );
    if (!valid)
    {
      error = "Duplicate!";
    }
  }
  addError.innerHTML = error;
  displayAlerts();
}

function addAlert(value, type, notify, repeat, filename, shortname)
{
  var newKey = unique(value + type + notify + repeat + filename);

  if (!g_alerts.hasOwnProperty(newKey))
  {
    var alertItem = Object();
    alertItem.value = value;
    alertItem.type = type;
    alertItem.notify = notify;
    alertItem.repeat = repeat;
    alertItem.filename = filename;
    alertItem.shortname = shortname;
    alertItem.lastMessage = "";
    alertItem.lastTime = 0;
    alertItem.fired = 0;
    alertItem.needAck = 0;
    g_alerts[newKey] = alertItem;

    saveAlerts();
    return true;
  }
  return false; // we have this alert already
}

function deleteAlert(key)
{
  delete g_alerts[key];
  saveAlerts();
  displayAlerts();
}

function resetAlert(key)
{
  g_alerts[key].lastMessage = "";
  g_alerts[key].lastTime = 0;
  g_alerts[key].fired = 0;
  g_alerts[key].needAck = 0;
  displayAlerts();
}

function processAlertMessage(decodeWords, message, band, mode)
{
  if (Object.keys(g_alerts).length == 0)
  {
    // no alerts, don't bother
    return false;
  }
  else
  {
    var CQ = false;
    var validQTH = false;
    var theirGrid = null;
    var msgDEcallsign = "";
    var found_callsign = null;

    // Grab the last word in the decoded message
    var grid = decodeWords[decodeWords.length - 1].trim();
    if (grid.length == 4)
    {
      // maybe it's a grid
      var LETTERS = grid.substr(0, 2);
      var NUMBERS = grid.substr(2, 2);

      if (/^[A-R]+$/.test(LETTERS) && /^[0-9]+$/.test(NUMBERS))
      {
        theirGrid = LETTERS + NUMBERS;

        if (theirGrid != "RR73")
        {
          validQTH = true;
        }
        else
        {
          theirGrid = null;
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
    }
    if (decodeWords.length >= 3 && CQ == true && validQTH == false)
    {
      if (validateNumAndLetter(decodeWords[decodeWords.length - 1].trim()))
      { msgDEcallsign = decodeWords[decodeWords.length - 1].trim(); }
      else msgDEcallsign = decodeWords[decodeWords.length - 2].trim();
    }

    if (decodeWords.length >= 4 && CQ == false)
    {
      msgDEcallsign = decodeWords[1];
    }

    var okayToAlert = true;

    if (msgDEcallsign + band + mode in g_liveCallsigns)
    { found_callsign = g_liveCallsigns[msgDEcallsign + band + mode]; }

    if (okayToAlert == true)
    { return checkAlerts(msgDEcallsign, theirGrid, message, found_callsign); }
  }
  return false;
}

function checkAlerts(
  DEcallsign,
  grid,
  originalMessage,
  callsignRecord,
  band,
  mode
)
{
  var hadAlert = false;
  for (var key in g_alerts)
  {
    var nalert = g_alerts[key];
    if (nalert.type == 0)
    {
      // callsign exatch match
      if (DEcallsign == nalert.value)
      {
        handleAlert(nalert, DEcallsign, originalMessage, callsignRecord);
        hadAlert = true;
      }
    }
    else if (grid && nalert.type == 2)
    {
      // gridsquare
      if (
        !(DEcallsign + band + mode in g_tracker.worked.call) &&
        grid.indexOf(nalert.value) == 0
      )
      {
        handleAlert(nalert, DEcallsign, originalMessage, callsignRecord, grid);
        hadAlert = true;
      }
    }
    else if (nalert.type == 4)
    {
      // QRZ
      if (myDEcall.length > 0 && originalMessage.indexOf(myDEcall + " ") == 0)
      {
        handleAlert(nalert, DEcallsign, originalMessage, callsignRecord);
        hadAlert = true;
      }
    }
    else if (nalert.type == 5)
    {
      // callsign partial
      if (
        !(DEcallsign + band + mode in g_tracker.worked.call) &&
        DEcallsign.indexOf(nalert.value) == 0
      )
      {
        handleAlert(nalert, DEcallsign, originalMessage, callsignRecord);
        hadAlert = true;
      }
    }
    else if (nalert.type == 6)
    {
      // callsign regex
      try
      {
        if (
          !(DEcallsign + band + mode in g_tracker.worked.call) &&
          DEcallsign.match(nalert.value)
        )
        {
          handleAlert(nalert, DEcallsign, originalMessage, callsignRecord);
          hadAlert = true;
        }
      }
      catch (e) {}
    }
  }
  if (hadAlert)
  {
    displayAlerts();
    return true;
  }
  return false;
}

function handleAlert(nAlert, target, lastMessage, callsignRecord, grid)
{
  if (nAlert.fired > 0 && nAlert.repeat == 0) return;

  if (nAlert.fired == 1 && nAlert.repeat == 1) return;

  nAlert.lastMessage = lastMessage;
  nAlert.lastTime = timeNowSec();

  if (callsignRecord != null)
  {
    if (
      typeof callsignRecord.rect != "undefined" &&
      callsignRecord.rect != null &&
      nAlert.notify == 3
    )
    {
      // Fix me
      g_map
        .getView()
        .setCenter(
          ol.extent.getCenter(callsignRecord.rect.getGeometry().getExtent())
        );
    }
  }

  if (nAlert.notify == 2) nAlert.needAck = 1;

  if (nAlert.type == 0 || nAlert.type == 5 || nAlert.type == 6)
  {
    if (nAlert.notify == 0) playAlertMediaFile(nAlert.filename);
    if (nAlert.notify == 1) speakAlertString("Callsign", target, null);
    if (nAlert.notify == 2) displayAlertPopUp("Seeking", target, null);
  }

  if (nAlert.type == 2)
  {
    if (nAlert.notify == 0) playAlertMediaFile(nAlert.filename);
    if (nAlert.notify == 1) speakAlertString("Grid square", grid, null);
    if (nAlert.notify == 2) displayAlertPopUp("Gridsquare", grid, target);
  }

  if (nAlert.type == 4)
  {
    if (nAlert.notify == 0) playAlertMediaFile(nAlert.filename);
    if (nAlert.notify == 1) speakQRZString(target, "Calling", myDEcall);
    if (nAlert.notify == 2) displayAlertPopUp("QRZ", null, null);
  }
  nAlert.fired++;
}

function playAlertMediaFile(filename, overrideMute)
{
  if (g_appSettings.alertMute && !overrideMute) return;

  // check if this is an alert stored with an older version of GT
  // which has a full file path given.
  if (path.isAbsolute(filename) && !fs.existsSync(filename))
  {
    // full alert file name stored with old GT version referencing
    // the user media dir. determine basename of the file and try
    // constructing the path
    filename = path.basename(filename);
  }
  // construct the path from the user media dir or
  // fall back on the global media dir
  var fpath = path.join(g_userMediaDir, filename);
  if (!fs.existsSync(fpath)) fpath = path.join(g_gtMediaDir, filename);

  var audio = document.createElement("audio");
  audio.src = "file://" + fpath;
  audio.setSinkId(g_soundCard);
  audio.volume = g_audioSettings.volume;
  audio.play();
}

function stringToPhonetics(string)
{
  var newMsg = "";
  for (var x = 0; x < string.length; x++)
  {
    if (g_speechSettings.phonetics == true)
    { newMsg += g_phonetics[string.substr(x, 1)]; }
    else
    {
      if (string.substr(x, 1) == " ") newMsg += ", ";
      else newMsg += string.substr(x, 1);
    }

    if (x != string.length - 1) newMsg += " ";
  }
  return newMsg;
}

function speakQRZString(caller, words, you)
{
  if (g_appSettings.alertMute == 0)
  {
    var sCaller = "";
    var sYou = "";
    if (caller) sCaller = stringToPhonetics(caller);
    if (you) sYou = stringToPhonetics(you);

    if (g_speechAvailable)
    {
      var speak = sCaller.trim() + ", " + words.trim() + ", " + sYou.trim();
      var msg = new SpeechSynthesisUtterance(speak);
      msg.lang = g_localeString;
      if (g_speechSettings.voice > 0)
      { msg.voice = g_voices[g_speechSettings.voice - 1]; }
      msg.rate = g_speechSettings.rate;
      msg.pitch = g_speechSettings.pitch;
      msg.volume = g_speechSettings.volume;
      window.speechSynthesis.speak(msg);
    }
  }
}

function speakAlertString(what, message, target)
{
  if (g_appSettings.alertMute == 0)
  {
    var sMsg = "";
    var sTarget = "";
    if (message) sMsg = stringToPhonetics(message);
    if (target) sTarget = stringToPhonetics(target);

    if (g_speechAvailable)
    {
      var speak = what.trim() + ", " + sMsg.trim() + ", " + sTarget.trim();
      var msg = new SpeechSynthesisUtterance(speak);
      msg.lang = g_localeString;
      if (g_speechSettings.voice > 0)
      { msg.voice = g_voices[g_speechSettings.voice - 1]; }
      msg.rate = g_speechSettings.rate;
      msg.pitch = g_speechSettings.pitch;
      msg.volume = g_speechSettings.volume;
      window.speechSynthesis.speak(msg);
    }
  }
}

var g_alertFlasher = null;

function unflashAlertPopUp()
{
  var worker = "";
  var acount = 0;
  alertsPopDiv.style.backgroundColor = "#000";

  if (Object.keys(g_alerts).length > 0)
  {
    for (var key in g_alerts)
    {
      if (g_alerts[key].needAck) acount++;
    }

    worker +=
      "<div style='padding-right:8px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(acount * 24 + 23, 500) +
      "px;'>";

    worker += "<table align='center' class='darkTable' >";

    worker += "<tr>";
    worker += "<th>Type</th>";
    worker += "<th>Value</th>";
    worker += "<th>Notify</th>";
    worker += "<th>Repeat</th>";
    worker += "<th>Filename</th>";
    worker += "<th>Alerted</th>";
    worker += "<th>Last Message</th>";
    worker += "<th>When</th>";
    worker += "</tr>";

    for (var key in g_alerts)
    {
      if (g_alerts[key].needAck)
      {
        worker += "<tr>";
        worker += "<td>" + g_alertTypeOptions[g_alerts[key].type] + "</td>";
        if (g_alerts[key].type == 0)
        { worker += "<td style='color:yellow'>" + g_alerts[key].value + "</td>"; }
        if (g_alerts[key].type == 2)
        { worker += "<td style='color:red'>" + g_alerts[key].value + "</td>"; }
        if (g_alerts[key].type == 4)
        { worker += "<td style='color:cyan'>" + myDEcall + "</td>"; }
        if (g_alerts[key].type == 5)
        {
          worker +=
            "<td style='color:lightgreen'>" + g_alerts[key].value + "*</td>";
        }
        if (g_alerts[key].type == 6)
        { worker += "<td style='color:pink'>" + g_alerts[key].value + "</td>"; }

        worker += "<td>" + g_alertValueOptions[g_alerts[key].notify] + "</td>";
        worker += "<td>" + g_alertRepeatOptions[g_alerts[key].repeat] + "</td>";
        worker +=
          "<td>" +
          (g_alerts[key].shortname.length > 0 ? g_alerts[key].shortname : "-") +
          "</td>";
        worker += "<td>" + (g_alerts[key].fired > 0 ? "Yes" : "No") + "</td>";
        worker +=
          "<td style='color:cyan'>" +
          (g_alerts[key].lastMessage.length > 0
            ? g_alerts[key].lastMessage
            : "-") +
          "</td>";
        ageString = userTimeString(g_alerts[key].lastTime * 1000);
        worker +=
          "<td>" + (g_alerts[key].lastTime > 0 ? ageString : "-") + "</td>";
        worker += "</tr>";
      }
    }
    worker += "</table>";
    worker += "</div>";
  }
  alertPopListDiv.style.height = "auto";
  alertPopListDiv.innerHTML = worker;
  g_alertFlasher = null;
}

function displayAlertPopUp(what, message, target)
{
  if (g_alertFlasher) nodeTimers.clearTimeout(g_alertFlasher);

  alertPopListDiv.innerHTML =
    "<font color='red'><h2>Gathering Alerts<h2></font>";
  alertsPopDiv.style.backgroundColor = "#FFF";
  alertsPopDiv.style.display = "inline-block";
  g_alertFlasher = nodeTimers.setTimeout(unflashAlertPopUp, 100);
}

function ackAlerts()
{
  alertsPopDiv.style.display = "none";
  for (var key in g_alerts)
  {
    g_alerts[key].needAck = 0;
  }
}

function alertTypeChanged()
{
  addError.innerHTML = "";
  if (alertTypeSelect.value == 0 || alertTypeSelect.value == 5)
  {
    alertValueSelect.innerHTML = "";
    alertValueSelect.innerHTML =
      "<input id=\"alertValueInput\" type=\"text\" class=\"inputTextValue\" maxlength=\"12\"  size=\"5\" oninput=\"ValidateCallsign(this,null);\" / >";
    ValidateCallsign(alertValueInput, null);
  }
  else if (alertTypeSelect.value == 2)
  {
    alertValueSelect.innerHTML = "";
    alertValueSelect.innerHTML =
      "<input id=\"alertValueInput\" type=\"text\" class=\"inputTextValue\"  maxlength=\"6\" size=\"3\" oninput=\"ValidateGridsquareOnly4(this,null);\" / >";
    ValidateGridsquareOnly4(alertValueInput, null);
  }
  else if (alertTypeSelect.value == 4)
  {
    alertValueSelect.innerHTML =
      "<input id=\"alertValueInput\" disabled=\"true\" type=\"text\" class=\"inputTextValue\" value=\"" +
      myDEcall +
      "\" maxlength=\"12\"  size=\"5\" oninput=\"ValidateCallsign(this,null);\" / >";
    ValidateCallsign(alertValueInput, null);
  }
  else if (alertTypeSelect.value == 6)
  {
    alertValueSelect.innerHTML = "";
    alertValueSelect.innerHTML =
      "<input id=\"alertValueInput\" type=\"text\" class=\"inputTextValue\" size=\"12\" value=\"^\" oninput=\"ValidateText(this);\" / >";
    ValidateText(alertValueInput);
  }
}

function alertNotifyChanged(who = "")
{
  addError.innerHTML = "";

  if (alertNotifySelect.value == 0)
  {
    alertMediaSelect.style.display = "block";
    if (who == "media")
    {
      playAlertMediaFile(alertMediaSelect.value);
    }
  }
  else
  {
    alertMediaSelect.style.display = "none";
  }
}

g_alertTypeOptions = Array();

g_alertTypeOptions["0"] = "Call (exact)";
g_alertTypeOptions["1"] = "Deprecated";
g_alertTypeOptions["2"] = "Grid";
g_alertTypeOptions["3"] = "Deprecated";
g_alertTypeOptions["4"] = "QRZ";
g_alertTypeOptions["5"] = "Call (partial)";
g_alertTypeOptions["6"] = "Call (regex)";

g_alertValueOptions = Array();
g_alertValueOptions["0"] =
  "<img title='Audio File' style='margin:-1px;margin-bottom:-4px;padding:0px' src='/img/icon_audio_16.png'>";
g_alertValueOptions["1"] = "TTS";
g_alertValueOptions["2"] = "PopUp";
g_alertValueOptions["3"] = "MapCenter";

g_alertRepeatOptions = Array();

g_alertRepeatOptions["0"] = "No";
g_alertRepeatOptions["1"] = "Once";
g_alertRepeatOptions["2"] = "Inf";
g_alertRepeatOptions["3"] = "Inf(Session)";

function displayAlerts()
{
  var worker = "";

  if (Object.keys(g_alerts).length > 0)
  {
    worker +=
      "<div style='padding-right:8px;overflow:auto;overflow-x:hidden;height:" +
      Math.min(Object.keys(g_alerts).length * 24 + 23, 312) +
      "px;'>";

    worker += "<table align='center' class='darkTable' >";

    worker += "<tr>";
    worker += "<th>Type</th>";
    worker += "<th>Value</th>";
    worker += "<th>Notify</th>";
    worker += "<th>Repeat</th>";
    worker += "<th>Filename</th>";
    worker += "<th>Alerted</th>";
    worker += "<th>Last Message</th>";
    worker += "<th>When</th>";
    worker += "<th>Reset</th>";
    worker += "<th>Delete</th>";
    worker += "</tr>";

    for (var key in g_alerts)
    {
      worker += "<tr>";
      worker += "<td>" + g_alertTypeOptions[g_alerts[key].type] + "</td>";
      if (g_alerts[key].type == 0)
      { worker += "<td style='color:yellow'>" + g_alerts[key].value + "</td>"; }
      if (g_alerts[key].type == 2)
      { worker += "<td style='color:red'>" + g_alerts[key].value + "</td>"; }
      if (g_alerts[key].type == 4)
      { worker += "<td style='color:cyan'>" + myDEcall + "</td>"; }
      if (g_alerts[key].type == 5)
      {
        worker +=
          "<td style='color:lightgreen'>" + g_alerts[key].value + "*</td>";
      }
      if (g_alerts[key].type == 6)
      { worker += "<td style='color:pink'>" + g_alerts[key].value + "</td>"; }

      worker += "<td>" + g_alertValueOptions[g_alerts[key].notify] + "</td>";
      worker += "<td>" + g_alertRepeatOptions[g_alerts[key].repeat] + "</td>";
      worker +=
        "<td>" +
        (g_alerts[key].shortname.length > 0 ? g_alerts[key].shortname : "-") +
        "</td>";
      worker += "<td>" + (g_alerts[key].fired > 0 ? "Yes" : "No") + "</td>";
      worker +=
        "<td style='color:cyan'>" +
        (g_alerts[key].lastMessage.length > 0
          ? g_alerts[key].lastMessage
          : "-") +
        "</td>";
      ageString = userTimeString(g_alerts[key].lastTime * 1000);
      worker +=
        "<td>" + (g_alerts[key].lastTime > 0 ? ageString : "-") + "</td>";
      worker +=
        "<td style='cursor:pointer' onclick='resetAlert(\"" +
        key +
        "\")'><img src='/img/reset_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px' ></td>";
      worker +=
        "<td style='cursor:pointer' onclick='deleteAlert(\"" +
        key +
        "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td>";
      worker += "</tr>";
    }
    worker += "</table>";
    worker += "</div>";
  }
  alertListDiv.innerHTML = worker;
}

function loadClassicAlertView()
{
  for (node in g_classicAlerts)
  {
    what = document.getElementById(node);
    if (what != null)
    {
      if (what.type == "select-one" || what.type == "text")
      {
        what.value = g_classicAlerts[node];
        if (what.id.endsWith("Notify"))
        {
          var mediaNode = document.getElementById(what.id + "Media");
          var wordNode = document.getElementById(what.id + "Word");
          if (what.value == "0")
          {
            mediaNode.style.display = "block";
            wordNode.style.display = "none";
          }
          else
          {
            mediaNode.style.display = "none";
            wordNode.style.display = "block";
          }
        }
        if (what.type == "text")
        {
          ValidateText(what);
        }
      }
      else if (what.type == "checkbox")
      {
        what.checked = g_classicAlerts[node];
      }
    }
  }
}

function wantedChanged(what)
{
  if (what.type == "select-one" || what.type == "text")
  {
    g_classicAlerts[what.id] = what.value;
    if (what.id.endsWith("Notify"))
    {
      var mediaNode = document.getElementById(what.id + "Media");
      var wordNode = document.getElementById(what.id + "Word");
      if (what.value == "0")
      {
        mediaNode.style.display = "block";
        wordNode.style.display = "none";
      }
      else
      {
        mediaNode.style.display = "none";
        wordNode.style.display = "block";
      }
    }
    if (what.id.endsWith("Media"))
    {
      if (what.value != "none") playAlertMediaFile(what.value);
    }
  }
  else if (what.type == "checkbox")
  {
    g_classicAlerts[what.id] = what.checked;
  }
  localStorage.classicAlerts = JSON.stringify(g_classicAlerts);
}

var g_classic_alert_count_template = {
  huntCallsign: 0,
  huntGrid: 0,
  huntDXCC: 0,
  huntCQz: 0,
  huntITUz: 0,
  huntStates: 0
};

var g_classic_alert_counts = Object.assign({}, g_classic_alert_count_template);

var g_classic_alert_functions = {
  huntCallsign: alertCheckCallsign,
  huntGrid: alertCheckGrid,
  huntDXCC: alertCheckDXCC,
  huntCQz: alertCheckCQz,
  huntITUz: alertCheckITUz,
  huntStates: alertCheckStates
};

var g_classic_alert_words = {
  huntCallsign: "Call",
  huntGrid: "Grid",
  huntDXCC: "DXCC",
  huntCQz: "CQ Zone",
  huntITUz: "I-T-U Zone",
  huntStates: "State"
};

function processClassicAlerts()
{
  for (key in g_classic_alert_counts)
  {
    if (
      document.getElementById(key).checked == true &&
      g_classic_alert_counts[key] > 0
    )
    {
      var notify = document.getElementById(key + "Notify").value;
      if (notify == "0")
      {
        var media = document.getElementById(key + "Notify" + "Media").value;
        if (media != "none") playAlertMediaFile(media);
      }
      else if (notify == "1")
      {
        speakAlertString(
          document.getElementById(key + "Notify" + "Word").value
        );
      }
    }
  }
  g_classic_alert_counts = Object.assign({}, g_classic_alert_count_template);
}

function checkClassicAlerts(CQ, callObj, message, DXcall)
{
  var didAlert = false;
  if (g_alertSettings.cqOnly == true && CQ == false) return didAlert;

  if (g_alertSettings.requireGrid == true && callObj.grid.length != 4)
  { return didAlert; }

  if (g_alertSettings.wantMinDB == true && message.SR < g_alertSettings.minDb)
  { return didAlert; }

  if (
    g_alertSettings.wantMaxDT == true &&
    Math.abs(message.DT) > g_alertSettings.maxDT
  )
  { return didAlert; }

  if (
    g_alertSettings.wantMinFreq == true &&
    message.DF < g_alertSettings.minFreq
  )
  { return didAlert; }

  if (
    g_alertSettings.wantMaxFreq == true &&
    message.DF > g_alertSettings.maxFreq
  )
  { return didAlert; }

  if (DXcall == "CQ RU")
  {
    if (g_alertSettings.noRoundUp == true) return didAlert;
  }
  else
  {
    if (g_alertSettings.onlyRoundUp == true) return didAlert;
  }

  if (callObj.dxcc == g_myDXCC)
  {
    if (g_alertSettings.noMyDxcc == true) return didAlert;
  }
  else
  {
    if (g_alertSettings.onlyMyDxcc == true) return didAlert;
  }

  if (
    g_callsignLookups.lotwUseEnable == true &&
    g_alertSettings.usesLoTW == true
  )
  {
    if (!(callObj.DEcall in g_lotwCallsigns)) return didAlert;
  }

  if (
    g_callsignLookups.eqslUseEnable == true &&
    g_alertSettings.useseQSL == true
  )
  {
    if (!(callObj.DEcall in g_eqslCallsigns)) return didAlert;
  }

  if (DXcall == "CQ DX" && callObj.dxcc == g_myDXCC) return didAlert;

  if (
    callObj.DEcall + hashMaker(callObj.band, callObj.mode) in
    g_tracker.worked.call
  )
  { return didAlert; }

  for (key in g_classic_alert_functions)
  {
    if (document.getElementById(key).checked == true)
    {
      var alerted = g_classic_alert_functions[key](key, callObj);
      if (alerted == true) didAlert = true;
      g_classic_alert_counts[key] += alerted;
    }
  }

  return didAlert;
}

function alertCheckCallsign(key, callObj)
{
  var status = document.getElementById(key + "Need").value;

  if (
    status == "worked" &&
    callObj.DEcall + hashMaker(callObj.band, callObj.mode) in
      g_tracker.worked.call
  )
  { return 0; }
  if (
    status == "confirmed" &&
    callObj.DEcall + hashMaker(callObj.band, callObj.mode) in
      g_tracker.confirmed.call
  )
  { return 0; }

  return 1;
}

function alertCheckGrid(key, callObj)
{
  var status = document.getElementById(key + "Need").value;
  if (callObj.grid.length == 0) return 0;

  if (
    status == "worked" &&
    callObj.grid + hashMaker(callObj.band, callObj.mode) in
      g_tracker.worked.grid
  )
  { return 0; }
  if (
    status == "confirmed" &&
    callObj.grid + hashMaker(callObj.band, callObj.mode) in
      g_tracker.confirmed.grid
  )
  { return 0; }

  return 1;
}

function alertCheckDXCC(key, callObj)
{
  var status = document.getElementById(key + "Need").value;

  if (
    status == "worked" &&
    String(callObj.dxcc) + "|" + hashMaker(callObj.band, callObj.mode) in
      g_tracker.worked.dxcc
  )
  { return 0; }
  if (
    status == "confirmed" &&
    String(callObj.dxcc) + "|" + hashMaker(callObj.band, callObj.mode) in
      g_tracker.confirmed.dxcc
  )
  { return 0; }

  return 1;
}

function alertCheckCQz(key, callObj)
{
  var status = document.getElementById(key + "Need").value;
  
  if (status == "worked" && callObj.cqz + "|" + hashMaker(callObj.band, callObj.mode) in g_tracker.worked.cqz) return 0;

  if (status == "confirmed" && callObj.cqz + "|" + hashMaker(callObj.band, callObj.mode) in g_tracker.confirmed.cqz) return 0;

  return 1;
}

function alertCheckITUz(key, callObj)
{
  var status = document.getElementById(key + "Need").value;

  if (status == "worked" && callObj.ituz + "|" + hashMaker(callObj.band, callObj.mode) in g_tracker.worked.ituz) return 0;

  if (status == "confirmed" && callObj.ituz + "|" + hashMaker(callObj.band, callObj.mode) in g_tracker.confirmed.ituz) return 0;

  return 1;
}

function alertCheckStates(key, callObj)
{
  if (callObj.dxcc == 291 || callObj.dxcc == 110 || callObj.dxcc == 6)
  {
    if (callObj.state in g_StateData)
    {
      var hash = callObj.state + hashMaker(callObj.band, callObj.mode);
      var status = document.getElementById(key + "Need").value;

      if (status == "worked" && hash in g_tracker.worked.state) return 0;

      if (status == "confirmed" && hash in g_tracker.confirmed.state) return 0;

      return 1;
    }
    return 0;
  }
  return 0;
}
