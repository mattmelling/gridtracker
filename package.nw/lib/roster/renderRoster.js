function renderRoster(callRoster, rosterSettings)
{
  let columnOverrides = {
    Callsign: true
  }

  if (window.opener.g_callsignLookups.eqslUseEnable == true)
  {
    useseQSLDiv.style.display = "";
  }
  else
  {
    columnOverrides.eQSL = false;
    useseQSLDiv.style.display = "none";
  }

  if (window.opener.g_callsignLookups.oqrsUseEnable == true)
  {
    usesOQRSDiv.style.display = "";
  }
  else
  {
    columnOverrides.OQRS = false;
    usesOQRSDiv.style.display = "none";
  }

  if (window.opener.g_callsignLookups.lotwUseEnable == true)
  {
    // Do nothing
  }
  else
  {
    columnOverrides.LoTW = false;
  }

  if (window.opener.g_appSettings.potaEnabled === 1)
  {
    huntingMatrixPotaDiv.style.display = "";
  }
  else
  {
    huntingMatrixPotaDiv.style.display = "none";
    columnOverrides.POTA = false;
  }
  
  if (rosterSettings.isAwardTracker)
  {
    columnOverrides.Wanted = true;
  }
  // dealing with spots
  if (g_rosterSettings.columns.Spot == true) onlySpotDiv.style.display = "";
  else onlySpotDiv.style.display = "none";

  // callmode (all or only new)
  if (rosterSettings.callMode == "all") allOnlyNewDiv.style.display = "";
  else allOnlyNewDiv.style.display = "none";

  // Show the roster count in the window title

  // let visibleCallList = callRoster.filter(entry => entry.tx);

  let visibleCallList = [];
  for (entry in callRoster)
  {
    // entry should populate in general
    if (callRoster[entry].tx)
    {
      visibleCallList.push(callRoster[entry]);
    }
  }

  let totalCount = Object.keys(callRoster).length;
  let visibleCount = visibleCallList.length;
  let huntedCount = visibleCallList.filter(obj => Object.keys(obj.callObj.hunting).length > 0).length
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
  if (listShortInstances().length > 0)
  {
    window.document.title += " | " + listShortInstances().join(" • ");
  }

  let showBands = (Object.keys(rosterSettings.bands).length > 1) || g_rosterSettings.columns.Band;
  let showModes = (Object.keys(rosterSettings.modes).length > 1) || g_rosterSettings.columns.Mode;

  columnOverrides.Band = showBands
  columnOverrides.Mode = showModes
  const rosterColumns = rosterColumnList(g_rosterSettings.columns, columnOverrides)

  if (g_rosterSettings.compact)
  {
    sortCallList(visibleCallList, "Age", false, rosterColumns);
  }
  else
  {
    sortCallList(visibleCallList, g_rosterSettings.sortColumn, g_rosterSettings.sortReverse);
  }

  let worker = g_rosterSettings.compact ? renderCompactRosterHeaders() : renderNormalRosterHeaders(rosterColumns)

  // Third loop: render all rows
  for (let x in visibleCallList)
  {
    let callObj = visibleCallList[x].callObj;

    // TODO: This is filtering
    if (callObj.shouldAlert == false && rosterSettings.onlyHits == true && callObj.qrz == false)
    { continue; }

    if (callObj.DEcall.match("^[KNW][0-9][A-W|Y|Z](/w+)?$"))
    { callObj.style.call = "class='oneByOne'"; }
    if (callObj.DEcall == window.opener.g_instances[callObj.instance].status.DXcall)
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

    worker += g_rosterSettings.compact ? renderCompactRosterRow(callObj) : renderNormalRosterRow(rosterColumns, callObj)
  }

  worker += g_rosterSettings.compact ? renderCompactRosterFooter() : renderNormalRosterFooter()

  RosterTable.innerHTML = worker;
}
