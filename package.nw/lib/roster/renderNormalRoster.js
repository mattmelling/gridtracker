function renderNormalRosterHeaders(showBands, showModes)
{
  let worker = ""
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

  if (g_rosterSettings.columns.POTA)
  { worker += "<th>POTA</th>"; }

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
  { worker += "<th title='Off-Air Message User' style='cursor:pointer;' onclick='showRosterBox(14);'>OAMS</th>"; }

  if (g_rosterSettings.columns.Age)
  { worker += "<th style='cursor:pointer;' onclick='showRosterBox(6);' >Age</th></thead>"; }

  return worker
}

function renderNormalRosterRow(callObj, showBands, showModes)
{
  let thisCall = callObj.DEcall;
  let acks = window.opener.g_acknowledgedCalls;
  let grid = callObj.grid.length > 1 ? callObj.grid.substr(0, 4) : "-";

  let geo = window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[callObj.dxcc]];
  let cqzone = grid in window.opener.g_gridToCQZone ? window.opener.g_gridToCQZone[grid].join(", ") : "-";
  let ituzone = grid in window.opener.g_gridToITUZone ? window.opener.g_gridToITUZone[grid].join(", ") : "-";

  let spotString = "";
  if (g_rosterSettings.columns.Spot && callObj.qrz == false)
  {
    spotString = getSpotString(callObj);
  }

  let thisHash = thisCall + callObj.band + callObj.mode;
  let callStr = thisCall.formatCallsign()
  if (acks[thisCall])
  {
    callStr = `${callStr} <span class='acknowledged'><img class='ackBadge' src='${acks[thisCall].badge}'></span>`
    callObj.awardReason += ` - ${acks[thisCall].message}`
  }

  let worker = "<tbody><tr id='" + thisHash + "'>";

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
    callStr +
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
    let color = "888888";
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
    let lookString = callObj.CQ ? "name='CQ'" : "name='Calling'";
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
            : "title='ZIP Code matches multiple counties, click to do a full lookup' " +
              "onClick='window.opener.lookupCallsign(\"" +
              thisCall +
              "\",\"" +
              grid +
              "\")'"
          )
        : "") +
      ">" +
      (callObj.cnty
        ? (callObj.qual ? "" : "¿ ") +
          window.opener.g_cntyToCounty[callObj.cnty] +
          (callObj.qual ? "" : " ?")
        : "") +
      "</td>";
  }

  if (g_rosterSettings.columns.POTA)
  {
    if (callObj.pota != null)
    {
      worker +=
      "<td title='" +
      callObj.pota.name + "' " +
      "align='center' " +
      callObj.style.pota +
      " >" +
      callObj.pota.reference + " " +
      callObj.pota.locationDesc + "&#10;" +
      callObj.pota.activatorLastComments + "&#10;" +
      callObj.pota.comments +
      "</td>";
    }
    else
    {
      worker += "<td>&nbsp;</td>";
    }
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
      "<td name='CQz' " +
      callObj.style.cqz +
      ">" +
      callObj.cqza.join(",") +
      "</td>";
  }
  if (g_rosterSettings.columns.ITUz)
  {
    worker +=
      "<td name='ITUz'" +
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
        let months = (g_day - window.opener.g_lotwCallsigns[thisCall]) / 30;
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

  return worker;
}

function renderNormalRosterFooter()
{
  return "</table>";
}
