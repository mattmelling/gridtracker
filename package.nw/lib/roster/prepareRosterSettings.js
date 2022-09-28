function prepareRosterSettings()
{
  let rosterSettings = {
    bands: {},
    modes: {},
    callMode: g_rosterSettings.callsign,
    onlyHits: false,
    isAwardTracker: false,
    now: timeNowSec()
  }

  if (rosterSettings.callMode == "hits")
  {
    rosterSettings.callMode = "all"
    rosterSettings.onlyHits = true;
  }
  if (referenceNeed.value == LOGBOOK_AWARD_TRACKER)
  {
    rosterSettings.callMode = "all";
    rosterSettings.onlyHits = false;
    rosterSettings.isAwardTracker = true;
    g_rosterSettings.huntNeed = "confirmed";
  }
  // this appears to be determine if we should show the OAMS column
  // if the user is not in offline mode and has OAMS enabled, this could
  // be it's own function maybe?
  rosterSettings.canMsg =
    window.opener.g_mapSettings.offlineMode == false &&
    window.opener.g_appSettings.gtShareEnable == "true" &&
    window.opener.g_appSettings.gtMsgEnable == "true";

  // The following 3 sections deal with QSLing, do we break them out
  // individually or lump them into a qslUser function that sets
  // all three at the same time?
  // this section is for LoTW users, can be a function
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

  if (g_rosterSettings.huntNeed == "mixed")
  {
    rosterSettings.huntIndex = g_confirmed;
    rosterSettings.workedIndex = g_worked;
    rosterSettings.layeredMode = LAYERED_MODE_FOR[String(g_rosterSettings.reference)];
  }
  else if (g_rosterSettings.huntNeed == "worked")
  {
    rosterSettings.huntIndex = g_worked;
    rosterSettings.workedIndex = false;
    rosterSettings.layeredMode = false;
  }
  else if (g_rosterSettings.huntNeed == "confirmed")
  {
    rosterSettings.huntIndex = g_confirmed;
    rosterSettings.workedIndex = g_worked;
    rosterSettings.layeredMode = false;
  }
  else
  {
    console.log("Invalid/Unknown huntNeed");
    rosterSettings.huntIndex = false;
    rosterSettings.workedIndex = false;
    rosterSettings.layeredMode = false;
  }

  return rosterSettings
}
