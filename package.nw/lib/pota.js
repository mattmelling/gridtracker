// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_pota = {
  parks: {},
  locations: {},
  parksTimeout: null,
  callSchedule: {},
  parkSchedule: {},
  scheduleTimeout: null,
  callSpots: {},
  parkSpots: {},
  spotsTimeout: null,
  mapParks: {},
  rbnReportTimes: {},
  rbnFrequency: 600000
};

var g_potaSpotTemplate = {
  activator: "",
  frequency: 0,
  mode: "",
  band: "",
  reference: "",
  spotTime: 0,
  spotter: "",
  comments: "",
  source: "GT",
  count: 1,
  activatorGrid: "",
  spotterGrid: ""
};

var g_parkTemplate = {
  feature: null
}

var g_potaUnknownPark = {
  name: "Unknown park",
  active: "0",
  entityId: "-1",
  locationDesc: "??-??",
  latitude: "0.0",
  longitude: "0.0",
  grid: ""
};

var g_gtParkIconActive = new ol.style.Icon({
  src: "./img/pota_icon_active.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  anchor: [10, 19]
});

var g_gtParkIconInactive = new ol.style.Icon({
  src: "./img/pota_icon_inactive.png",
  anchorYUnits: "pixels",
  anchorXUnits: "pixels",
  anchor: [10, 19]
});

function initPota()
{
  potaImg.style.filter = g_potaEnabled == 1 ? "" : "grayscale(1)";

  getPotaParks();
}

function togglePota()
{
  g_potaEnabled ^= 1;
  g_appSettings.potaEnabled = g_potaEnabled;
  potaImg.style.filter = g_potaEnabled == 1 ? "" : "grayscale(1)";

  saveAppSettings();

  if (g_potaEnabled == 1)
  {
    getPotaParks();
  }
  else
  {
    g_layerSources.pota.clear();
    g_pota.mapParks = {};
  }
  goProcessRoster();
}

function redrawParks()
{
  g_layerSources.pota.clear();

  if (g_potaEnabled == 1)
  {
    g_pota.mapParks = {};
    makeParkFeatures();
  }
}

function makeParkFeatures()
{
  try
  {
    for (const park in g_pota.parkSpots)
    {
      if (park in g_pota.parks)
      {
        let parkObj = Object.assign({}, g_parkTemplate);
        for (const call in g_pota.parkSpots[park])
        {
          let report = g_pota.parkSpots[park][call];
          if (parkObj.feature == null && validateMapBandAndMode(report.band, report.mode))
          {
            parkObj.feature = iconFeature(ol.proj.fromLonLat([Number(g_pota.parks[park].longitude), Number(g_pota.parks[park].latitude)]), g_gtParkIconActive, 1);
            parkObj.feature.key = park;
            parkObj.feature.size = 22;

            g_pota.mapParks[park] = parkObj;
            g_layerSources.pota.addFeature(parkObj.feature);
          }
        }
      }
    }
  }
  catch (e)
  {
    console.log("exception: makeParkFeature " + park);
    console.log(e.message);
  }
}

function potaSpotFromDecode(callObj)
{
  for (const i in callObj.pota)
  {
    let park = callObj.pota[i];
    let spotObj = null;

    if (!(callObj.DEcall in g_pota.callSpots))
    {
      // new call and park
      g_pota.callSpots[callObj.DEcall] = [park];
    }
    else if (!g_pota.callSpots[callObj.DEcall].includes(park))
    {
      // new park
      g_pota.callSpots[callObj.DEcall].push(park);
    }

    if (!(park in g_pota.parkSpots))
    {
      g_pota.parkSpots[park] = {};
      g_pota.parkSpots[park][callObj.DEcall] = spotFromCallObj(callObj, park, 0, 0);
    }
    else if (!(callObj.DEcall in g_pota.parkSpots[park]))
    {
      g_pota.parkSpots[park][callObj.DEcall] = spotFromCallObj(callObj, park, 0, 0);
    }
    else
    {
      // update spot
      g_pota.parkSpots[park][callObj.DEcall] = spotFromCallObj(callObj, park, g_pota.parkSpots[park][callObj.DEcall].count);
    }
    
    // may or may not be on screen, so try
    addParkSpotFeature(park, g_pota.parkSpots[park][callObj.DEcall]);
    
    let hash = park + callObj.DEcall;
    if (!(hash in g_pota.rbnReportTimes) || Date.now() > g_pota.rbnReportTimes[hash])
    {
      g_pota.rbnReportTimes[hash] = Date.now() + g_pota.rbnFrequency;
      reportPotaRBN(g_pota.parkSpots[park][callObj.DEcall]);
    }
  }
}

function reportPotaRBN(callSpot)
{
  let report = {
    activator: callSpot.activator,
    spotter: myDEcall + "-#",
    frequency: String(parseInt(callSpot.frequency * 1000)),
    reference: callSpot.reference,
    mode: callSpot.mode,
    source: "RBN",
    comments: callSpot.comments,
    activatorGrid: callSpot.activatorGrid,
    spotterGrid: callSpot.spotterGrid
  }
  
  getPostJSONBuffer(
    "https://api.pota.app/spot",
    rbnReportResult,
    null,
    "https",
    443,
    report,
    10000,
    null,
    null
  );
}

function reportPotaQSO(record)
{
  let report = {
    activator: record.CALL,
    spotter: record.STATION_CALLSIGN,
    frequency: record.FREQ,
    reference: record.POTA,
    mode: record.MODE,
    source: "GT",
    comments: record.COMMENT ? record.COMMENT : "",
    activatorGrid: record.GRIDSQUARE ? record.GRIDSQUARE : "",
    spotterGrid: record.MY_GRIDSQUARE ? record.MY_GRIDSQUARE : ""
  }
  
  if ("SUBMODE" in record)
  {
    report.mode = record.SUBMODE;
  }
 
  getPostJSONBuffer(
    "https://api.pota.app/spot",
    rbnReportResult,
    null,
    "https",
    443,
    report,
    10000,
    null,
    null
  );
}

function rbnReportResult(buffer, flag, cookies)
{
  // It worked! process latest spots!
  if (g_pota.spotsTimeout)
  {
    clearTimeout(g_pota.spotsTimeout);
    g_pota.spotsTimeout = null;
  }
  
  processPotaSpots(String(buffer));
  
  g_pota.spotsTimeout = setTimeout(getPotaSpots, 300000);
}

function spotFromCallObj(callObj, park, inCount, rbnTime)
{
  let callSpot = {
    activator: callObj.DEcall,
    activatorGrid: callObj.grid,
    spotter: myDEcall + "-#",
    spotterGrid: myDEGrid,
    frequency: Number((g_instances[callObj.instance].status.Frequency / 1000000).toFixed(3)),
    reference: park,
    mode: callObj.mode,
    band: callObj.band,
    spotTime: Date.now(),
    source: "GT",
    count: inCount + 1,
    comments: "GT " + callObj.RSTsent + " dB " + myDEGrid + " via " + myDEcall + "-#"
  };
  return callSpot;
}

function addParkSpotFeature(park, report)
{
  let parkObj = Object.assign({}, g_parkTemplate);
  if (park in g_pota.mapParks)
  {
    parkObj = g_pota.mapParks[park];
  }
  else
  {
    g_pota.mapParks[park] = parkObj;
  }

  if (parkObj.feature == null && validateMapBandAndMode(report.band, report.mode))
  {
    parkObj.feature = iconFeature(ol.proj.fromLonLat([Number(g_pota.parks[park].longitude), Number(g_pota.parks[park].latitude)]), g_gtParkIconActive, 1);
    parkObj.feature.key = park;
    parkObj.feature.size = 22;
    g_layerSources.pota.addFeature(parkObj.feature);
  }
}

function processPotaParks(buffer)
{
  if (g_potaEnabled == 1)
  {
    try
    {
      let data = JSON.parse(buffer);
      let newParks = data.parks;
      for (const park in newParks)
      {
        let locations = newParks[park].locationDesc.split(",");
        for (const i in locations)
        {
          if (locations[i] in data.locations)
          {
            locations[i] = data.locations[locations[i]];
          }
        }
        newParks[park].locationDesc = locations.join(", ");
      }
      newParks["?-????"] = g_potaUnknownPark;
      
      g_pota.parks = newParks;
      g_pota.locations = data.locations;
      getPotaSchedule();
      getPotaSpots();
    }
    catch (e)
    {
      // can't write, somethings broke
      console.log("Failed to load parks!");
      console.log(e.message);
    }
  }
}

function getPotaParks()
{
  if (g_pota.parksTimeout)
  {
    clearTimeout(g_pota.parksTimeout);
    g_pota.spotsTimeout = null;
  }

  if (g_mapSettings.offlineMode == false && g_potaEnabled == 1)
  {
    getBuffer(
      "https://storage.googleapis.com/gt_app/pota.json?cb=" + Date.now(),
      processPotaParks,
      null,
      "https",
      443
    );
  }

  g_pota.parksTimeout = setTimeout(getPotaParks, 86400000)
}

// This is a shallow copy, don't use with objects that contain other objects or arrays
function fillObjectFromTemplate(template, input)
{
  let object = {};
  for (const key in template)
  {
    if (key in input)
    {
      object[key] = input[key];
    }
    else
    {
      // missing, use the template value
      object[key] = template[key];
    }
  }
  return object;
}

function uniqueArrayFromArray(input)
{
  let unique = [];
  input.forEach((c) =>
  {
    if (!unique.includes(c))
    {
      unique.push(c);
    }
  });
  return unique;
}

function processPotaSpots(buffer)
{
  if (g_potaEnabled == 1)
  {
    try
    {
      let spots = JSON.parse(buffer);
      g_pota.callSpots = {};
      g_pota.parkSpots = {};
      for (const spot in spots)
      {
        if (spots[spot].reference in g_pota.parks)
        {
          let newSpot = fillObjectFromTemplate(g_potaSpotTemplate, spots[spot]);
          newSpot.spotTime = Date.parse(newSpot.spotTime + "Z");
          newSpot.frequency = parseInt(newSpot.frequency) / 1000;
          newSpot.band = newSpot.frequency.formatBand();
          (g_pota.callSpots[newSpot.activator] = g_pota.callSpots[newSpot.activator] || []).push(newSpot.reference);
          
          if (!(newSpot.reference in g_pota.parkSpots))
          {
            g_pota.parkSpots[newSpot.reference] = {};
          }
          if (newSpot.activator in g_pota.parkSpots[newSpot.reference])
          {
            g_pota.parkSpots[newSpot.reference][newSpot.activator] = fillObjectFromTemplate(g_pota.parkSpots[newSpot.reference][newSpot.activator], newSpot);
          }
          else
          {
            g_pota.parkSpots[newSpot.reference][newSpot.activator] = newSpot;
          }
        }
        else
        {
          console.log("PotaSpots: unknown park id: " + spots[spot].reference);
        }
      }

      // Sanity dedupe checks
      for (const spot in g_pota.callSpots)
      {
        g_pota.callSpots[spot] = uniqueArrayFromArray(g_pota.callSpots[spot]);
      }
      
      redrawParks();
    }
    catch (e)
    {
      // can't write, somethings broke
    }
  }
}

function getPotaSpots()
{
  if (g_pota.spotsTimeout)
  {
    clearTimeout(g_pota.spotsTimeout);
    g_pota.spotsTimeout = null;
  }

  if (g_mapSettings.offlineMode == false && g_potaEnabled == 1)
  {
    getBuffer(
      "https://api.pota.app/spot/activator",
      processPotaSpots,
      null,
      "https",
      443
    );
  }

  g_pota.spotsTimeout = setTimeout(getPotaSpots, 300000);
}

function processPotaSchedule(buffer)
{
  if (g_potaEnabled == 1)
  {
    try
    {
      let schedules = JSON.parse(buffer);
      g_pota.callSchedule = {};
      g_pota.parkSchedule = {};
      for (const i in schedules)
      {
        let newObj = {};
        newObj.id = schedules[i].reference;
        newObj.start = Date.parse(schedules[i].startDate + "T" + schedules[i].startTime + "Z");
        newObj.end = Date.parse(schedules[i].endDate + "T" + schedules[i].endTime + "Z");
        newObj.frequencies = schedules[i].frequencies;
        newObj.comments = schedules[i].comments;
        if (Date.now() < newObj.end)
        {
          if (newObj.id in g_pota.parks)
          {
            (g_pota.callSchedule[schedules[i].activator] = g_pota.callSchedule[schedules[i].activator] || []).push(newObj);

            newObj = Object.assign({}, newObj);
            newObj.id = schedules[i].activator;
            (g_pota.parkSchedule[schedules[i].reference] = g_pota.parkSchedule[schedules[i].reference] || []).push(newObj);
          }
          else
          {
            console.log("PotaSchedule: unknown park id: " + newObj.id);
          }
        }
        // else it is expired and no longer relevant
      }

      // Sanity dedupe checks
      for (const key in g_pota.callSchedule)
      {
        g_pota.callSchedule[key] = uniqueArrayFromArray(g_pota.callSchedule[key]);
      }
      for (const key in g_pota.parkSchedule)
      {
        g_pota.parkSchedule[key] = uniqueArrayFromArray(g_pota.parkSchedule[key]);
      }
    }
    catch (e)
    {
      // can't write, somethings broke
    }
  }
}

function getPotaSchedule()
{
  if (g_pota.scheduleTimeout)
  {
    clearTimeout(g_pota.scheduleTimeout);
    g_pota.scheduleTimeout = null;
  }

  if (g_mapSettings.offlineMode == false && g_potaEnabled == 1)
  {
    getBuffer(
      "https://api.pota.app/activation",
      processPotaSchedule,
      null,
      "https",
      443
    );
  }
  g_pota.scheduleTimeout = setTimeout(getPotaSchedule, 900000);
}

var g_lastPark = null;
function mouseOverPark(feature)
{
  if (g_lastPark && g_lastPark == feature)
  {
    mouseParkMove();
    return;
  }
  g_lastPark = feature;

  createParkTipTable(feature);

  mouseParkMove();

  myParktip.style.zIndex = 499;
  myParktip.style.display = "block";
}

function mouseOutPark(mouseEvent)
{
  g_lastPark = null;
  myParktip.style.zIndex = -1;
}

function mouseParkMove()
{
  var positionInfo = myParktip.getBoundingClientRect();
  var windowWidth = window.innerWidth;

  myParktip.style.left = getMouseX() - (positionInfo.width / 2) + "px";
  if (windowWidth - getMouseX() < (positionInfo.width / 2))
  {
    myParktip.style.left = getMouseX() - (10 + positionInfo.width) + "px";
  }
  if (getMouseX() - (positionInfo.width / 2) < 0)
  {
    myParktip.style.left = getMouseX() + 10 + "px";
  }
  myParktip.style.top = getMouseY() - positionInfo.height - 12 + "px";
}

function createParkTipTable(toolElement)
{
  let worker = "";

  let key = toolElement.key;
  let now = Date.now();

  worker += "<div style='background-color:#000;color:lightgreen;font-weight:bold;font-size:12px;border:1px solid gray;margin:0px' class='roundBorder'>" +
    key +
    " : <font color='cyan'>" + g_pota.parks[key].name + "" +
    " (<font color='yellow'>" + g_dxccToAltName[Number(g_pota.parks[key].entityId)] + "</font>)" +
    "</font></br><font color='lightblue'>" + g_pota.parks[key].locationDesc + "</font></div>";

  worker += "<table id='potaSpotsTable' class='darkTable' style='margin: 0 auto;'>";
  worker += "<tr><th>Activator</th><th>Spotter</th><th>Freq</th><th>Mode</th><th>Count</th><th>When</th><th>Source</th><th>Comment</th></tr>";
  for (const i in g_pota.parkSpots[key])
  {
    if (validateMapBandAndMode(g_pota.parkSpots[key][i].band, g_pota.parkSpots[key][i].mode))
    {
      worker += "<tr>";
      worker += "<td style='color:yellow'>" + g_pota.parkSpots[key][i].activator + "</td>";
      worker += "<td style='color:cyan'>" + ((g_pota.parkSpots[key][i].spotter == g_pota.parkSpots[key][i].activator) ? "Self" : g_pota.parkSpots[key][i].spotter) + "</td>";
      worker += "<td style='color:lightgreen' >" + g_pota.parkSpots[key][i].frequency.formatMhz(3, 3) + " <font color='yellow'>(" + g_pota.parkSpots[key][i].band + ")</font></td>";
      worker += "<td style='color:orange'>" + g_pota.parkSpots[key][i].mode + "</td>";
      worker += "<td>" + g_pota.parkSpots[key][i].count + "</td>";
      worker += "<td style='color:lightblue' >" + parseInt((now - g_pota.parkSpots[key][i].spotTime) / 1000).toDHMS() + "</td>";
      worker += "<td>" + g_pota.parkSpots[key][i].source + "</td>";
      worker += "<td>" + g_pota.parkSpots[key][i].comments + "</td>";
      worker += "</tr>";
    }
  }
  worker += "</table>";

  /*
    buffer += "<div style='background-color:#000;color:#fff;font-size:12px;border:1px solid gray;margin:1px' class='roundBorder'>Activations (scheduled)"
    buffer += "<table id='potaScheduleTable' class='darkTable' style='margin: 0 auto;'>";
    buffer += "<tr><th>Activator</th><th>Start</th><th>End</th><th>Frequencies</th><th>Comment</th></tr>";
    for (const i in g_pota.parkSchedule[key])
    {
      let start = g_pota.parkSchedule[key][i].start;
      let end = g_pota.parkSchedule[key][i].end;
      if (now < end)
      {
        buffer += "<tr>";
        buffer += "<td style='color:yellow'>" + g_pota.parkSchedule[key][i].id + "</td>";
        buffer += "<td style='color:lightblue'>" + ((now >= start) ? "<font color='white'>Now</font>" : (userTimeString(start) + "</br><font color='lightgreen'>T- " + Number(start - now).msToDHMS() + "</font>")) + "</td>";
        buffer += "<td style='color:lightblue'>" + (userTimeString(end) + "</br><font color='orange'>T- " + Number(end - now).msToDHMS() + "</font>") + "</td>";
        buffer += "<td style='color:lightgreen'>" + g_pota.parkSchedule[key][i].frequencies + "</td>";
        buffer += "<td>" + g_pota.parkSchedule[key][i].comments.substr(0, 40) + "</td>";
        buffer += "</tr>";
        active++;
      }
    }
  */
  myParktip.innerHTML = worker;
  return 1;
}
