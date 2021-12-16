function renderCompactRosterHeaders()
{
  return "<div id=\"buttonsDiv\" style=\"margin-left:0px;white-space:normal;\">";
}

function renderCompactRosterRow(callObj)
{
  var thisCall = callObj.DEcall;
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
  var worker =
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

  return worker;
}

function renderCompactRosterFooter()
{
  return "</div>";
}
