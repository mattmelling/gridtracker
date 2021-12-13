function renderRoster(callRoster, rosterSettings)
{
  // eQSL - function
  if (window.opener.g_callsignLookups.eqslUseEnable == true) useseQSLDiv.style.display = "";
  else useseQSLDiv.style.display = "none";

  // OQRS - function
  if (window.opener.g_callsignLookups.oqrsUseEnable == true) usesOQRSDiv.style.display = "";
  else usesOQRSDiv.style.display = "none";

  // dealing with spots
  if (g_rosterSettings.columns.Spot == true) onlySpotDiv.style.display = "";
  else onlySpotDiv.style.display = "none";

  // callmode (all or only new)
  if (rosterSettings.callMode == "all") allOnlyNewDiv.style.display = "";
  else allOnlyNewDiv.style.display = "none";

  // Show the roster count in the window title

  // let visibleCallList = callRoster.filter(entry => entry.tx);

  let visibleCallList = [];
  let band =
  window.opener.g_appSettings.gtBandFilter == "auto"
    ? window.opener.g_appSettings.myBand
    : window.opener.g_appSettings.gtBandFilter.length == 0
      ? ""
      : window.opener.g_appSettings.gtBandFilter;
  for (entry in callRoster)
  {
    // entry should populate in general
    if (callRoster[entry].tx)
    {
      // check setting for call roster clear on band change.
      // if true and band is current band, populate
      if (window.opener.g_appSettings.clearRosterOnBandChange)
      {
        if (callRoster[entry].callObj.band == band)
        {
          visibleCallList.push(callRoster[entry]);
        }
      }
      else if (!window.opener.g_appSettings.clearRosterOnBandChange)
      {
        visibleCallList.push(callRoster[entry]);
      }
    }
  }

  let totalCount = Object.keys(callRoster).length;
  let visibleCount = visibleCallList.length;
  let huntedCount = visibleCallList.filter(obj => Object.keys().length > 0).length
  let countParts = [];

  if (totalCount != visibleCount)
  {
    countParts.push(`${totalCount} heard`);
  }

  countParts.push(`${visibleCount} in roster`);

  if (huntedCount != visibleCount)
  {
    countParts.push(`${huntedCount} wanted`);
  }

  window.document.title = `Call Roster: ${countParts.join(" • ")}`;

  if (g_rosterSettings.compact == false)
  {
    visibleCallList.sort(r_sortFunction[g_rosterSettings.lastSortIndex]);
    if (g_rosterSettings.lastSortReverse == 1)
    {
      visibleCallList.reverse();
    }
  }
  else
  {
    // Age sort for now... make this happen Tag
    visibleCallList.sort(r_sortFunction[6]).reverse();
  }

  let showBands = (Object.keys(rosterSettings.bands).length > 1) || g_rosterSettings.columns.Band;
  let showModes = (Object.keys(rosterSettings.modes).length > 1) || g_rosterSettings.columns.Mode;

  let worker = g_rosterSettings.compact ? renderCompactRosterHeaders() : renderNormalRosterHeaders(showBands, showModes)

  // Third loop: render all rows
  for (let x in visibleCallList)
  {
    let callObj = visibleCallList[x].callObj;

    // TODO: This is filtering
    if (callObj.shouldAlert == false && rosterSettings.onlyHits == true && callObj.qrz == false)
    { continue; }

    let thisCall = callObj.DEcall;

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

    worker += g_rosterSettings.compact ? renderCompactRosterRow(callObj) : renderNormalRosterRow(callObj, showBands, showModes)
  }

  worker += g_rosterSettings.compact ? renderCompactRosterFooter() : renderNormalRosterFooter()
  RosterTable.innerHTML = worker;
}
