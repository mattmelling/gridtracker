function sendAlerts(callRoster, rosterSettings)
{
  var dirPath = window.opener.g_scriptDir;
  var scriptExists = false;
  var script = "cr-alert.sh";

  var shouldAlert = 0;

  for (entry in callRoster)
  {
    var callObj = callRoster[entry].callObj;

    // chrbayer: what does the tx field mean? no alerts are generated (at all) if this is in place...
    // if (!callObj.tx) continue;

    // TODO: Get rid of realtime
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

      if (rosterSettings.callMode != "all")
      {
        g_scriptReport[call].shouldAlert = true;
        g_scriptReport[call].reason.push(g_rosterSettings.hunting);
      }
    }

    if (
      callObj.alerted == false &&
        rosterSettings.callMode == "all" &&
        callObj.shouldAlert == true
    )
    {
      callObj.alerted = true;
      shouldAlert++;
    }
    else if (callObj.alerted == false && rosterSettings.callMode != "all")
    {
      callObj.alerted = true;
      shouldAlert++;
    }

    callObj.shouldAlert = false;
  }

  // NOTE: Ring alerts if needed
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
            ? `<font color='lightgreen'>${$.i18n("sendAlerts.scriptEnabled")}</font>`
            : `<font color='yellow'>${$.i18n("sendAlerts.scriptDisabled")}</font>`) +
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