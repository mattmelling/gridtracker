// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_pota = {
  places: {},
  placesTimeout: null,
  schedule: {},
  scheduleTimeout: null,
  spots: {},
  spotsTimeout: null
};

var g_parks = {};

var g_defaultPark = {
  scheduled: false,
  spotted: false,
  feature: false
}

function initPota()
{
  potaImg.style.filter = g_potaEnabled == 1 ? "" : "grayscale(1)";

  getPotaPlaces();
  getPotaSchedule();
  getPotaSpots();
}

function togglePota()
{
  g_potaEnabled ^= 1;
  g_appSettings.potaEnabled = g_potaEnabled;
  potaImg.style.filter = g_potaEnabled == 1 ? "" : "grayscale(1)";

  saveAppSettings();

  if (g_potaEnabled == 1)
  {
    // Only get if empty, let the timer do its job
    if (Object.keys(g_pota.places).length == 0)
    {
      getPotaPlaces();
    }
    getPotaSchedule();
    getPotaSpots();
  }
  else
  {
     g_layerSources.pota.clear();
  }
}

function processPotaPlaces(buffer)
{
  try
  {
    g_pota.places = JSON.parse(buffer);
  }
  catch (e)
  {
    // can't write, somethings broke
  }
}

function getPotaPlaces()
{
  if (g_pota.placesTimeout)
  {
    clearTimeout(g_pota.placesTimeout);
    g_pota.spotsTimeout = null;
  }
  
  if (g_mapSettings.offlineMode == false && g_potaEnabled == 1)
  {
    getBuffer(
      "https://storage.googleapis.com/gt_app/pota.json",
      processPotaPlaces,
      null,
      "https",
      443
    );
  }

  g_pota.placesTimeout = setTimeout(getPotaPlaces, 86400000)
}

function processPotaSpots(buffer)
{
  try
  {
    let spots = JSON.parse(buffer);
    g_pota.spots = {};
    for (let spot in spots)
    {
      (g_pota.spots[spots[spot].activator] = g_pota.spots[spots[spot].activator] || []).push(spots[spot].reference);
    }
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
    g_pota.schedule = {};
    for (let i in schedules)
    {
      let newObj = {};
      newObj.id = schedules[i].reference;
      newObj.start = Date.parse(schedules[i].startDate + "T" + schedules[i].startTime);
      newObj.end = Date.parse(schedules[i].endDate + "T" + schedules[i].endTime);

      if (Date.now() < newObj.end)
      {
        (g_pota.schedule[schedules[i].activator] = g_pota.schedule[schedules[i].activator] || []).push(newObj);
      }
      // else it is expired and no longer relevant
    }
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
