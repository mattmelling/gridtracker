// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_gtEngineInterval = null;
var g_chatRecvFunctions = {
  uuid: gtChatSetUUID,
  list: gtChatNewList,
  info: gtChatUpdateCall,
  drop: gtChatRemoveCall,
  mesg: gtChatMessage,
  o: gtSpotMessage,
  l: gtLightningStrike
};

var ChatState = Object();
ChatState.none = -1;
ChatState.idle = 0;
ChatState.connect = 1;
ChatState.connecting = 2;
ChatState.connected = 3;
ChatState.status = 4;
ChatState.closed = 5;
ChatState.error = 6;

var g_gtStateToFunction = {
  "-1": gtSetIdle,
  0: gtCanConnect,
  1: gtConnectChat,
  2: gtConnecting,
  3: gtChatSendUUID,
  4: gtStatusCheck,
  5: gtInError,
  6: gtClosedSocket
};

var g_gtChatSocket = null;
var g_gtFlagPins = Object();
var g_gtMessages = Object();
var g_gtUnread = Object();
var g_gtIdToCid = Object();
var g_gtCallsigns = Object();
var g_gtSentAwayToCid = Object();

var g_gtState = ChatState.none;
var g_gtStatusCount = 0;
var g_gtStatusTime = 500;
var g_gtMaxChatMessages = 100;
var g_gtNeedUsersList = true;
var g_gtUuidValid = false;

var g_gtLiveStatusUpdate = false;

var myChatId = 0;

var myRoom = 0;
var g_gtChatlistChangeCount = 0;
var g_gtCurrentMessageCount = 0;

function gtConnectChat()
{
  if (g_gtChatSocket != null)
  {
    // we should start over
    g_gtState = ChatState.error;
    return;
  }

  var rnd = parseInt(Math.random() * 10) + 18360;
  try
  {
    g_gtState = ChatState.connecting;
    g_gtChatSocket = new WebSocket("ws://oams.space:" + rnd);
  }
  catch (e)
  {
    g_gtState = ChatState.error;
    return;
  }

  g_gtChatSocket.onopen = function ()
  {
    g_gtState = ChatState.connected;
  };

  g_gtChatSocket.onmessage = function (evt)
  {
    if (g_appSettings.gtShareEnable == true)
    {
      var jsmesg = false;
      try
      {
        jsmesg = JSON.parse(evt.data);
      }
      catch (err)
      {
        // bad message, dumping client
        g_gtState = ChatState.error;
        return;
      }
      if (typeof jsmesg.type == "undefined")
      {
        g_gtState = ChatState.error;
        return;
      }

      if (jsmesg.type in g_chatRecvFunctions)
      {
        g_chatRecvFunctions[jsmesg.type](jsmesg);
      }
      else
      {
        // Not fatal!
        console.log("Unknown oams message '" + jsmesg.type + "' ignoring");
      }
    }
  };

  g_gtChatSocket.onerror = function ()
  {
    g_gtState = ChatState.error;
  };

  g_gtChatSocket.onclose = function ()
  {
    g_gtState = ChatState.closed;
  };
}

function gtConnecting() {}

function gtInError()
{
  closeGtSocket();
}

function gtChatSendClose()
{
  msg = Object();
  msg.type = "close";
  msg.uuid = g_appSettings.chatUUID;

  sendGtJson(JSON.stringify(msg));
}

function closeGtSocket()
{
  if (g_gtChatSocket != null)
  {
    gtChatSendClose();

    if (g_gtChatSocket.readyState != WebSocket.CLOSED) g_gtChatSocket.close();

    if (g_gtChatSocket.readyState === WebSocket.CLOSED)
    {
      g_gtChatSocket = null;
      g_gtState = ChatState.none;
    }
  }
  else g_gtState = ChatState.none;
}

function gtClosedSocket()
{
  g_gtChatSocket = null;
  g_gtState = ChatState.none;
}

// Connect 15 seconds after startup
var g_lastConnectAttempt = parseInt(Date.now() / 1000) - 15;

function gtCanConnect()
{
  g_lastConnectAttempt = timeNowSec();
  g_gtState = ChatState.connect;
}

function gtSetIdle()
{
  if (timeNowSec() - g_lastConnectAttempt >= 30)
  {
    g_gtStatusCount = 0;
    g_gtNeedUsersList = true;
    g_gtState = ChatState.idle;
    g_lastGtStatus = "";
  }
  g_gtUuidValid = false;
}

function gtStatusCheck()
{
  if (g_gtStatusCount > 0)
  {
    g_gtStatusCount--;
  }
  if (g_gtStatusCount == 0 || g_gtLiveStatusUpdate == true)
  {
    if (g_gtLiveStatusUpdate == true)
    {
      g_gtLiveStatusUpdate = false;
    }
    else
    {
      g_lastGtStatus = "";
      g_gtStatusCount = g_gtStatusTime;
    }
    gtChatSendStatus();
  }
  if (g_gtNeedUsersList == true)
  {
    g_gtNeedUsersList = false;
    gtChatGetList();
  }
}

function sendGtJson(json, isUUIDrequest = false)
{
  if (g_gtChatSocket != null)
  {
    if (g_gtChatSocket.readyState === WebSocket.OPEN && (isUUIDrequest || g_gtUuidValid))
    {
      g_gtChatSocket.send(json);
    }
    else
    {
      if (g_gtChatSocket.readyState === WebSocket.CLOSED)
      {
        g_gtState = ChatState.closed;
      }
    }
  }
  // if we don't have a socketHandle, don't go changing the state willy nilly!
  // else g_gtState = ChatState.closed;
}

var g_lastGtStatus = "";

function gtChatSendStatus()
{
  var msg = Object();
  msg.type = "status";
  msg.uuid = g_appSettings.chatUUID;

  msg.call = myDEcall;
  msg.grid = myRawGrid;
  msg.freq = myRawFreq;
  msg.mode = myMode;
  msg.band = myBand;
  msg.src = "GT";
  msg.canmsg = g_appSettings.gtMsgEnable;
  msg.o = g_appSettings.gtSpotEnable == true ? 1 : 0;
  msg.l = g_mapSettings.strikes == true ? 1 : 0;
  msg = JSON.stringify(msg);

  if (msg != g_lastGtStatus)
  {
    sendGtJson(msg);
    g_lastGtStatus = msg;
  }
}

function gtChatSendSpots(spotsObject, detailsObject)
{
  var msg = Object();
  msg.type = "o";
  msg.uuid = g_appSettings.chatUUID;
  msg.o = spotsObject;
  msg.d = detailsObject;
  msg = JSON.stringify(msg);
  sendGtJson(msg);
}

function gtChatRemoveCall(jsmesg)
{
  var id = jsmesg.id;
  if (id in g_gtIdToCid)
  {
    var cid = g_gtIdToCid[id];
    if (cid in g_gtFlagPins)
    {
      delete g_gtFlagPins[cid].ids[id];
      if (Object.keys(g_gtFlagPins[cid].ids).length == 0)
      {
        if (g_gtFlagPins[cid].pin != null)
        {
          // remove pin from map here
          if (g_layerSources.gtflags.hasFeature(g_gtFlagPins[cid].pin))
          { g_layerSources.gtflags.removeFeature(g_gtFlagPins[cid].pin); }
          delete g_gtFlagPins[cid].pin;
          g_gtFlagPins[cid].pin = null;
        }
        g_gtFlagPins[cid].live = false;
        notifyNoChat(cid);
        if (!(cid in g_gtMessages))
        {
          delete g_gtCallsigns[g_gtFlagPins[cid].call];
          delete g_gtFlagPins[cid];
        }

        updateChatWindow();
      }
    }
    delete g_gtIdToCid[id];
  }
}

function gtChatUpdateCall(jsmesg)
{
  var id = jsmesg.id;
  var cid = jsmesg.cid;

  if (cid in g_gtFlagPins)
  {
    g_gtFlagPins[cid].ids[id] = true;
    // Did they move grid location?
    if (g_gtFlagPins[cid].pin != null)
    {
      // remove pin from map here
      if (g_layerSources.gtflags.hasFeature(g_gtFlagPins[cid].pin))
      { g_layerSources.gtflags.removeFeature(g_gtFlagPins[cid].pin); }
      delete g_gtFlagPins[cid].pin;
      g_gtFlagPins[cid].pin = null;
    }
  }
  else
  {
    g_gtFlagPins[cid] = Object();
    g_gtFlagPins[cid].pin = null;
    g_gtFlagPins[cid].ids = Object();
    g_gtFlagPins[cid].ids[id] = true;
  }
  g_gtIdToCid[jsmesg.id] = jsmesg.cid;

  g_gtFlagPins[cid].cid = jsmesg.cid;
  g_gtFlagPins[cid].call = jsmesg.call;
  g_gtFlagPins[cid].fCall = jsmesg.call.formatCallsign();
  g_gtFlagPins[cid].grid = jsmesg.grid;
  g_gtFlagPins[cid].freq = jsmesg.freq;
  g_gtFlagPins[cid].band = jsmesg.band;
  g_gtFlagPins[cid].mode = jsmesg.mode;
  g_gtFlagPins[cid].src = jsmesg.src;
  g_gtFlagPins[cid].canmsg = jsmesg.canmsg;
  g_gtFlagPins[cid].o = jsmesg.o;
  g_gtFlagPins[cid].dxcc = callsignToDxcc(jsmesg.call);
  g_gtFlagPins[cid].live = true;
  // Make a pin here
  if (g_gtFlagPins[cid].pin == null)
  {
    makeGtPin(g_gtFlagPins[cid]);
    if (g_gtFlagPins[cid].pin != null)
    {
      g_layerSources.gtflags.addFeature(g_gtFlagPins[cid].pin);
    }
  }
  g_gtChatlistChangeCount++;
  g_gtCallsigns[g_gtFlagPins[cid].call] = cid;
  updateChatWindow();
}

function gtChatGetList()
{
  msg = Object();
  msg.type = "list";
  msg.uuid = g_appSettings.chatUUID;

  sendGtJson(JSON.stringify(msg));
}

function redrawPins()
{
  clearGtFlags();
  for (cid in g_gtFlagPins)
  {
    if (g_gtFlagPins[cid].pin != null)
    {
      delete g_gtFlagPins[cid].pin;
      g_gtFlagPins[cid].pin = null;
    }

    makeGtPin(g_gtFlagPins[cid]);

    if (g_gtFlagPins[cid].pin != null)
    {
      g_layerSources.gtflags.addFeature(g_gtFlagPins[cid].pin);
    }
  }
}

function makeGtPin(obj)
{
  try
  {
    if (obj.pin)
    {
      if (g_layerSources.gtflags.hasFeature(obj.pin))
      {
        g_layerSources.gtflags.removeFeature(obj.pin);
      }
      delete obj.pin;
      obj.pin = null;
    }
    
    if (obj.src != "GT") return;
    
    if (typeof obj.grid == "undefined" || obj.grid == null) return;

    if (obj.grid.length != 4 && obj.grid.length != 6) return;

    if (validateGridFromString(obj.grid) == false) return;

    if (g_appSettings.gtFlagImgSrc == 2 && (obj.mode != myMode || obj.band != myBand))
    {
      return;
    }

    var LL = squareToCenter(obj.grid);
    obj.pin = iconFeature(ol.proj.fromLonLat([LL.o, LL.a]), g_gtFlagIcon, 100);
    obj.pin.key = obj.cid;
    obj.pin.isGtFlag = true;
    obj.pin.size = 1;
  }
  catch (e) {}
}

function gtChatNewList(jsmesg)
{
  clearGtFlags();

  for (var cid in g_gtFlagPins)
  {
    g_gtFlagPins[cid].live = false;
    if (!(cid in g_gtMessages))
    {
      delete g_gtFlagPins[cid];
    }
  }

  for (var key in jsmesg.data.calls)
  {
    var cid = jsmesg.data.cid[key];
    var id = jsmesg.data.id[key];
    if (id != myChatId)
    {
      if (cid in g_gtFlagPins)
      {
        g_gtFlagPins[cid].ids[id] = true;
      }
      else
      {
        g_gtFlagPins[cid] = Object();
        g_gtFlagPins[cid].ids = Object();
        g_gtFlagPins[cid].ids[id] = true;
        g_gtFlagPins[cid].pin = null;
      }

      g_gtIdToCid[id] = cid;
      g_gtFlagPins[cid].call = jsmesg.data.calls[key];
      g_gtFlagPins[cid].fCall = g_gtFlagPins[cid].call.formatCallsign();
      g_gtFlagPins[cid].grid = jsmesg.data.grid[key];
      g_gtFlagPins[cid].freq = jsmesg.data.freq[key];
      g_gtFlagPins[cid].band = jsmesg.data.band[key];
      g_gtFlagPins[cid].mode = jsmesg.data.mode[key];
      g_gtFlagPins[cid].src = jsmesg.data.src[key];
      g_gtFlagPins[cid].cid = cid;
      g_gtFlagPins[cid].canmsg = jsmesg.data.canmsg[key];
      g_gtFlagPins[cid].o = jsmesg.data.o[key];
      g_gtFlagPins[cid].dxcc = callsignToDxcc(g_gtFlagPins[cid].call);
      g_gtFlagPins[cid].live = true;
      g_gtCallsigns[g_gtFlagPins[cid].call] = cid;

      makeGtPin(g_gtFlagPins[cid]);

      if (g_gtFlagPins[cid].pin != null)
      {
        g_layerSources.gtflags.addFeature(g_gtFlagPins[cid].pin);
      }
    }
  }
  g_gtChatlistChangeCount++;

  updateChatWindow();
}

function appendToHistory(cid, jsmesg)
{
  if (!(cid in g_gtMessages))
  {
    g_gtMessages[cid] = Object();
    g_gtMessages[cid].history = Array();
  }

  g_gtMessages[cid].history.push(jsmesg);
  while (g_gtMessages[cid].history.length > g_gtMaxChatMessages)
  {
    g_gtMessages[cid].history.shift();
  }
}

function htmlEntities(str)
{
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gtChatMessage(jsmesg)
{
  if (g_appSettings.gtMsgEnable == true)
  {
    var cid = jsmesg.cid;
    jsmesg.when = Date.now();
    try
    {
      jsmesg.msg = new Buffer.from(jsmesg.msg, "base64").toString("utf8"); // eslint-disable-line new-cap
      jsmesg.msg = htmlEntities(jsmesg.msg);
    }
    catch (e)
    {
      jsmesg.msg = "Corrupt message recieved";
    }

    if (jsmesg.call != null && jsmesg.call != "" && jsmesg.call != "NOCALL")
    {
      appendToHistory(cid, jsmesg);
      g_gtUnread[cid] = true;
      g_gtCurrentMessageCount++;

      if (newChatMessage(cid, jsmesg) == false) alertChatMessage();

      if (g_msgSettings.msgAwaySelect == 1 && !(cid in g_gtSentAwayToCid))
      {
        g_gtSentAwayToCid[cid] = true;
        gtSendMessage(
          "Away message [ " + g_msgSettings.msgAwayText + " ]",
          cid
        );
      }
    }
  }
}

function gtSendMessage(message, who)
{
  msg = Object();
  msg.type = "mesg";
  msg.uuid = g_appSettings.chatUUID;
  msg.cid = who;
  msg.msg = new Buffer.from(message).toString("base64"); // eslint-disable-line new-cap
  sendGtJson(JSON.stringify(msg));
  msg.msg = htmlEntities(message);
  msg.id = 0;
  msg.when = Date.now();
  appendToHistory(who, msg);
}

function gtChatSendUUID()
{
  var msg = Object();
  msg.type = "uuid";
  if (g_appSettings.chatUUID != "") msg.uuid = g_appSettings.chatUUID;
  msg.call = myDEcall;
  msg.ver = gtShortVersion;

  sendGtJson(JSON.stringify(msg), true);
}

function gtChatSetUUID(jsmesg)
{
  g_appSettings.chatUUID = jsmesg.uuid;
  myChatId = jsmesg.id;

  g_gtUuidValid = true;
  gtChatSendStatus();

  g_gtState = ChatState.status;
}

function gtChatStateMachine()
{
  if (g_appSettings.gtShareEnable == true && g_mapSettings.offlineMode == false)
  {
    var now = timeNowSec();
    g_gtStateToFunction[g_gtState]();

    if (Object.keys(g_gtUnread).length > 0 && now % 2 == 0)
    {
      msgImg.style.webkitFilter = "invert(1)";
    }
    else msgImg.style.webkitFilter = "";

    if (g_msgSettings.msgFrequencySelect > 0 && Object.keys(g_gtUnread).length > 0)
    {
      if (now - g_lastChatMsgAlert > g_msgSettings.msgFrequencySelect * 60)
      {
        alertChatMessage();
      }
    }
  }
  else
  {
    closeGtSocket();
    g_gtChatlistChangeCount = 0;
    g_lastGtStatus = "";
  }
}

function gtSpotMessage(jsmesg)
{
  if (jsmesg.cid in g_gtFlagPins)
  {
    let frequency, band, mode;
    if (jsmesg.ex != null)
    {
      frequency = Number(jsmesg.ex[0]);
      band = Number(frequency / 1000000).formatBand();
      mode = String(jsmesg.ex[1]);
    }
    else
    {
      frequency = g_gtFlagPins[jsmesg.cid].freq;
      band = g_gtFlagPins[jsmesg.cid].band;
      mode = g_gtFlagPins[jsmesg.cid].mode;
    }

    addNewOAMSSpot(jsmesg.cid, jsmesg.db, frequency, band, mode);
  }
}

function gtLightningStrike(jsmesg)
{
  // Saftey check
  if (g_mapSettings.strikes)
  {
    handleStrike(jsmesg);
  }
}

function gtChatSystemInit()
{
  g_gtEngineInterval = nodeTimers.setInterval(gtChatStateMachine, 1000);
}

function showGtFlags()
{
  if (g_appSettings.gtFlagImgSrc > 0)
  {
    if (g_mapSettings.offlineMode == false)
    {
      redrawPins();
      g_layerVectors.gtflags.setVisible(true);
    }
    else
    {
      g_layerVectors.gtflags.setVisible(false);
    }
  }
  else g_layerVectors.gtflags.setVisible(false);
}

function clearGtFlags()
{
  g_layerSources.gtflags.clear();
}

function toggleGtMap()
{
  g_appSettings.gtFlagImgSrc += 1;
  g_appSettings.gtFlagImgSrc %= 3;
  gtFlagImg.src = g_gtFlagImageArray[g_appSettings.gtFlagImgSrc];
  if (g_spotsEnabled == 1 && g_receptionSettings.mergeSpots == false) return;
  if (g_appSettings.gtFlagImgSrc > 0)
  {
    redrawPins();
    g_layerVectors.gtflags.setVisible(true);
  }
  else
  {
    g_layerVectors.gtflags.setVisible(false);
  }
}

function notifyNoChat(id)
{
  if (g_chatWindowHandle != null)
  {
    try
    {
      g_chatWindowHandle.window.notifyNoChat(id);
    }
    catch (e) {}
  }
}

function updateChatWindow()
{
  if (g_chatWindowHandle != null)
  {
    try
    {
      g_chatWindowHandle.window.updateEverything();
    }
    catch (e) {}
  }
}

function newChatMessage(id, jsmesg)
{
  var hasFocus = false;
  if (g_msgSettings.msgActionSelect == 1) showMessaging();

  if (g_chatWindowHandle != null)
  {
    try
    {
      hasFocus = g_chatWindowHandle.window.newChatMessage(id, jsmesg);
    }
    catch (e) {}
    updateChatWindow();
  }
  return hasFocus;
}

var g_lastChatMsgAlert = 0;

function alertChatMessage()
{
  if (g_msgSettings.msgAlertSelect == 1)
  {
    // Text to speech
    speakAlertString(g_msgSettings.msgAlertWord);
  }
  if (g_msgSettings.msgAlertSelect == 2)
  {
    // Audible
    playAlertMediaFile(g_msgSettings.msgAlertMedia);
  }
  g_lastChatMsgAlert = timeNowSec();
}
