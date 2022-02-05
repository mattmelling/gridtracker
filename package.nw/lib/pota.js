// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_potaPlaces = null;
var g_potaSpots = null;

function g_ingestPotaPlaces(buffer)
{
  try
  {
    g_potaPlaces = JSON.parse(buffer);
  }
  catch (e)
  {
    // can't write, somethings broke
  }
}

function g_getPotaPlaces()
{
  if (g_mapSettings.offlineMode == false)
  {
    getBuffer(
      "http://app.gridtracker.org/pota_parks.php",
      g_ingestPotaPlaces,
      null,
      "http",
      80
    );

    setTimeout(g_getPotaPlaces, 86400000)
  }
}

function g_ingestPotaSpots(buffer)
{
  try
  {
    g_potaSpots = JSON.parse(buffer);
  }
  catch (e)
  {
    // can't write, somethings broke
  }
}

function g_getPotaSpots()
{
  if (g_mapSettings.offlineMode == false)
  {
    getBuffer(
      "https://api.pota.app/spot/activator",
      g_ingestPotaSpots,
      null,
      "https",
      443
    );

    setTimeout(g_getPotaSpots, 300000);
  }
}

function g_sendPotaSpot()
{
  // if Pota spotting enabled, and we have enough info, send a spot to Pota
}
