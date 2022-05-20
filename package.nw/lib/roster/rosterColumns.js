const DEFAULT_COLUMN_ORDER = [
  "Callsign", "Band", "Mode", "Grid", "Calling", "Msg",
  "DXCC", "POTA", "Flag", "State", "County", "Cont",
  "dB", "Freq", "DT", "Dist", "Azim",
  "CQz", "ITUz", "PX",
  "LoTW", "eQSL", "OQRS",
  "Life", "Spot", "OAMS", "Age"
]

const LEGACY_COLUMN_SORT_ID = {
  0: "Callsign",
  1: "Grid",
  2: "dB",
  3: "DT",
  4: "Freq",
  5: "DXCC",
  7: "Dist",
  8: "Azim",
  9: "State",
  10: "Calling",
  11: "PX",
  12: "Life",
  13: "Spot",
  14: "OAMS",
  15: "County",
  16: "Cont"
}

const getterSimpleComparer = (getter) => (a, b) =>
{
  const aVal = getter(a);
  const bVal = getter(b);
  if (aVal == null) return 1;
  if (bVal == null) return -1;
  if (aVal > bVal) return 1;
  if (aVal < bVal) return -1;
  return 0;
}

const callObjSimpleComparer = (attr) => getterSimpleComparer((elem) => elem.callObj[attr])

const callObjLocaleComparer = (attr) => (a, b) =>
{
  if (a.callObj[attr] == null) return 1;
  if (b.callObj[attr] == null) return -1;
  return a.callObj[attr].localeCompare(b.callObj[attr]);
}

const ROSTER_COLUMNS = {

  Callsign: {
    compare: callObjLocaleComparer("DEcall"),
    tableHeader: () => ({ align: "left" }),
    tableData: (callObj) =>
    {
      let attrs = {
        title: callObj.awardReason,
        name: "Callsign",
        align: "left",
        onClick: `initiateQso("${callObj.hash}")`,
        rawAttrs: callObj.style.call,
        html: html = callObj.DEcall.formatCallsign()
      }

      let acks = window.opener.g_acknowledgedCalls;
      if (acks[callObj.DEcall])
      {
        attrs.html = `${attrs.html} <span class='acknowledged'><img class='ackBadge' src='${acks[callObj.DEcall].badge}'></span>`
        attrs.title = `${attrs.title} - ${acks[callObj.DEcall].message}`
      }

      return attrs
    }
  },

  Band: {
    compare: false,
    tableData: (callObj) => ({
      style: `color: #${window.opener.g_pskColors[callObj.band]};`,
      html: callObj.band
    })
  },

  Mode: {
    compare: false,
    tableData: (callObj) => ({
      style: `color: #${g_modeColors[callObj.mode] || "888888"};`,
      html: callObj.mode
    })
  },

  Grid: {
    compare: callObjSimpleComparer("grid"),
    tableData: (callObj) => ({
      rawAttrs: callObj.style.grid,
      onClick: `centerOn("${callObj.grid4}")`,
      html: callObj.grid4
    })
  },

  Calling: {
    compare: callObjLocaleComparer("DXcall"),
    tableData: (callObj) => ({
      rawAttrs: callObj.style.calling,
      name: callObj.CQ ? "CQ" : "Calling",
      html: callObj.DXcall.formatCallsign()
    })
  },

  Msg: {
    compare: callObjLocaleComparer("DXcall"),
    tableData: (callObj) => ({ html: callObj.msg })
  },

  DXCC: {
    compare: (a, b) => window.opener.myDxccCompare(a.callObj, b.callObj),
    tableData: (callObj) => ({
      title: window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[callObj.dxcc]].pp,
      name: `DXCC (${callObj.dxcc})`,
      rawAttrs: callObj.style.dxcc,
      html: window.opener.g_dxccToAltName[callObj.dxcc]
    })
  },

  Flag: {
    compare: (a, b) => window.opener.myDxccCompare(a.callObj, b.callObj),
    tableData: (callObj) => ({
      align: "center",
      style: "margin:0; padding:0;",
      html: `<img style='padding-top:3px' src='./img/flags/16/${window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[callObj.dxcc]].flag}'>`
    })
  },

  State: {
    compare: callObjSimpleComparer("state"),
    tableData: (callObj) => ({
      align: "center",
      rawAttrs: callObj.style.state,
      html: callObj.state ? callObj.state.substr(3) : ""
    })
  },

  County: {
    // Not sure why this comparison uses substring, but this is what the original code did
    compare: getterSimpleComparer((elem) => elem.callObj.cnty && elem.callObj.cnty.substr(3)),
    tableData: (callObj) =>
    {
      let attrs = {
        align: "center",
        rawAttrs: callObj.style.cnty,
        html: callObj.cnty ? window.opener.g_cntyToCounty[callObj.cnty] : ""
      }
      if (callObj.cnty && callObj.qual)
      {
        attrs.title = "ZIP Code matches multiple counties, click to do a full lookup"
        attrs.onClick = `lookupZip("${callObj.DEcall}", "${callObj.grid4}")`
        attrs.html = `¿ ${attrs.html} ?`
      }
      return attrs
    }
  },

  Cont: {
    compare: callObjSimpleComparer("cont"),
    tableData: (callObj) => ({
      align: "center",
      rawAttrs: callObj.style.cont,
      html: callObj.cont ? callObj.cont : ""
    })
  },

  dB: {
    compare: callObjSimpleComparer("RSTsent"),
    tableData: (callObj) => ({
      style: "color:#DD44DD;",
      html: `<b>${callObj.RSTsent}</b>`
    })
  },

  Freq: {
    compare: callObjSimpleComparer("delta"),
    tableData: (callObj) => ({
      style: "color: #00FF00;",
      html: callObj.delta
    })
  },

  DT: {
    compare: callObjSimpleComparer("dt"),
    tableData: (callObj) => ({
      style: "color: #1E90FF;",
      html: callObj.dt
    })
  },

  Dist: {
    compare: callObjSimpleComparer("distance"),
    tableHeader: () => ({ html: `Dist (${window.opener.distanceUnit.value.toLowerCase()})` }),
    tableData: (callObj) => ({
      style: "color: cyan;",
      html: Math.round(callObj.distance * MyCircle.validateRadius(window.opener.distanceUnit.value))
    })
  },

  Azim: {
    compare: callObjSimpleComparer("heading"),
    tableData: (callObj) => ({
      style: "color: yellow;",
      html: Math.round(callObj.heading)
    })
  },

  CQz: {
    compare: false,
    tableData: (callObj) => ({
      name: "CQz",
      rawAttrs: callObj.style.cqz,
      html: callObj.cqza.join(",")
    })
  },

  ITUz: {
    compare: false,
    tableData: (callObj) => ({
      name: "ITUz",
      rawAttrs: callObj.style.ituz,
      html: callObj.ituza.join(",")
    })
  },

  PX: {
    compare: callObjSimpleComparer("px"),
    tableData: (callObj) => ({
      rawAttrs: callObj.style.px,
      html: callObj.px ? callObj.px : ""
    })
  },

  LoTW: {
    compare: false,
    tableData: (callObj) =>
    {
      if (callObj.DEcall in window.opener.g_lotwCallsigns)
      {
        if (g_rosterSettings.maxLoTW < 27)
        {
          let months = (g_day - window.opener.g_lotwCallsigns[callObj.DEcall]) / 30;
          if (months > g_rosterSettings.maxLoTW)
          {
            return {
              style: "color: yellow;",
              align: "center",
              title: `Has not updated a QSO in ${Number(months).toYM()}`,
              html: "?"
            }
          }
          else
          {
            return {
              style: "color: #0F0;",
              align: "center",
              title: `Last Upload&#10;${
                window.opener.userDayString(window.opener.g_lotwCallsigns[callObj.DEcall] * 86400000)
              }`,
              html: "&#10004;"
            }
          }
        }
        else
        {
          return {
            style: "color: #0F0;",
            align: "center",
            title: `Last Upload&#10;${
              window.opener.userDayString(window.opener.g_lotwCallsigns[callObj.DEcall] * 86400000)
            }`,
            html: "&#10004;"
          }
        }
      }
    }
  },

  eQSL: {
    compare: false,
    tableData: (callObj) => ({
      style: "color: #0F0;",
      align: "center",
      html: (callObj.DEcall in window.opener.g_eqslCallsigns ? "&#10004;" : "")
    })
  },

  OQRS: {
    compare: false,
    tableData: (callObj) => ({
      style: "color: #0F0;",
      align: "center",
      html: (callObj.DEcall in window.opener.g_oqrsCallsigns ? "&#10004;" : "")
    })
  },

  Life: {
    compare: callObjSimpleComparer("life"),
    tableData: (callObj) => ({
      style: "color: #EEE;",
      class: "lifeCol",
      id: `lm${callObj.hash}`,
      html: (timeNowSec() - callObj.life).toDHMS15()
    })
  },

  OAMS: {
    tableHeader: () => ({ description: "Off-Air Message User" }),
    compare: getterSimpleComparer((elem) => elem.callObj.gt != 0 ? 1 : 0),
    tableData: (callObj) =>
    {
      if (callObj.gt != 0)
      {
        if (callObj.reason.includes("oams"))
        {
          return {
            align: "center",
            style: "margin: 0; padding: 0; cursor: pointer; background-clip: content-box; box-shadow: 0 0 4px 4px inset #2222FFFF;",
            onClick: `openChatToCid("${callObj.gt}")`,
            html: "<img height='16px' style='' src='./img/gt_chat.png' />"
          }
        }
        else
        {
          return {
            align: "center",
            style: "margin: 0; padding: 0; cursor: pointer;",
            onClick: `openChatToCid("${callObj.gt}")`,
            html: "<img height='16px' style='' src='./img/gt_chat.png' />"
          }
        }
      }
    }
  },

  Age: {
    compare: callObjSimpleComparer("time"),
    tableData: (callObj) => ({
      style: "color: #EEE;",
      class: "timeCol",
      id: `tm${callObj.hash}`,
      title: (timeNowSec() - callObj.age).toDHMS(),
      html: (timeNowSec() - callObj.age).toDHMS15()
    })
  },

  Spot: {
    compare: (a, b) =>
    {
      let cutoff = timeNowSec() - window.opener.g_receptionSettings.viewHistoryTimeSec;

      if (a.callObj.spot.when <= cutoff) return -1;
      if (b.callObj.spot.when <= cutoff) return 1;

      let aSNR = Number(a.callObj.spot.snr);
      let bSNR = Number(b.callObj.spot.snr);

      if (aSNR > bSNR) return 1;
      if (aSNR < bSNR) return -1;

      if (a.callObj.spot.when > b.callObj.spot.when) return 1;
      if (a.callObj.spot.when < b.callObj.spot.when) return -1;

      return 0;
    },
    tableData: (callObj) => ({
      style: "color: #EEE;",
      class: "spotCol",
      id: `sp${callObj.hash}`,
      html: getSpotString(callObj)
    })
  },

  POTA: {
    compare: false,
    tableData: (callObj) => ({
      name: "POTA",
      rawAttrs: callObj.style.pota,
      html: callObj.pota.join(",")
    })
  }
}
