function renderRoster(callRoster, rosterSettings)
{
  let columnOverrides = {
    Callsign: true,
    Grid: true
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

  if (g_rosterSettings.compact)
  {
    sortCallList(visibleCallList, "Age", false);
  }
  else
  {
    sortCallList(visibleCallList, g_rosterSettings.sortColumn, g_rosterSettings.sortReverse);
  }

  let showBands = (Object.keys(rosterSettings.bands).length > 1) || g_rosterSettings.columns.Band;
  let showModes = (Object.keys(rosterSettings.modes).length > 1) || g_rosterSettings.columns.Mode;

  columnOverrides.Band = showBands
  columnOverrides.Mode = showModes
  const rosterColumns = rosterColumnList(g_rosterSettings.columns, columnOverrides)

  let worker = g_rosterSettings.compact ? renderCompactRosterHeaders() : renderNormalRosterHeaders(rosterColumns)

  // Third loop: render all rows
  for (let x in visibleCallList)
  {
    let callObj = visibleCallList[x].callObj;

    worker += g_rosterSettings.compact ? renderCompactRosterRow(callObj) : renderNormalRosterRow(rosterColumns, callObj)
  }

  worker += g_rosterSettings.compact ? renderCompactRosterFooter() : renderNormalRosterFooter()
  RosterTable.innerHTML = worker;
}
