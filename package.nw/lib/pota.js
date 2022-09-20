// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_pota = {
  parks: {},
  parksTimeout: null,
  callSchedule: {},
  parkSchedule: {},
  scheduleTimeout: null,
  callSpots: {},
  spotsTimeout: null,
  mapParks: {}
};

var g_defaultPark = {
  scheduled: false,
  spotted: false,
  activators: {},
  feature: null
}

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
}

function rebuildParks()
{
  g_layerSources.pota.clear();
  g_pota.mapParks = {};

}

function makeParkFeature(park, active)
{
  try
  {
    if (park in g_pota.parks)
    {
      let parkObj = null;
      if (park in g_pota.mapParks)
      {
        parkObj = g_pota.mapParks[park];
      }
      else
      {
        parkObj = Object.assign({}, g_defaultPark);
        g_pota.mapParks[park] = parkObj;
      }
      if (parkObj.feature == null)
      {
        parkObj.feature = iconFeature(ol.proj.fromLonLat([0, 0]), g_gtParkIconActive, 1);
      }
      feature.key = park;
      feature.size = 1;
    }
  }
  catch (e)
  {
    console.log("exception: makeParkFeature " + park);
    console.log(e.message);
  }
}

function processPotaParks(buffer)
{
  try
  {
    let newParks = JSON.parse(buffer);
    g_pota.parks = newParks;

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
  try
  {
    let spots = JSON.parse(buffer);
    g_pota.callSpots = {};
    g_pota.parkSpots = {};
    for (const spot in spots)
    {
      if (spots[spot].reference in g_pota.parks)
      {
        (g_pota.callSpots[spots[spot].activator] = g_pota.callSpots[spots[spot].activator] || []).push(spots[spot].reference);
        (g_pota.parkSpots[spots[spot].reference] = g_pota.parkSpots[spots[spot].reference] || []).push(spots[spot].activator);
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
    for (const spot in g_pota.parkSpots)
    {
      g_pota.parkSpots[spot] = uniqueArrayFromArray(g_pota.parkSpots[spot]);
    }

    rebuildParks();
  }
  catch (e)
  {
    // can't write, somethings broke
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
  try
  {
    let schedules = JSON.parse(buffer);
    g_pota.callSchedule = {};
    g_pota.parkSchedule = {};
    for (const i in schedules)
    {
      let newObj = {};
      newObj.id = schedules[i].reference;
      newObj.start = Date.parse(schedules[i].startDate + "T" + schedules[i].startTime);
      newObj.end = Date.parse(schedules[i].endDate + "T" + schedules[i].endTime);
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

    rebuildParks();
  }
  catch (e)
  {
    // can't write, somethings broke
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

function sendPotaSpot()
{
  // if Pota spotting enabled, and we have enough info, send a spot to Pota
}
