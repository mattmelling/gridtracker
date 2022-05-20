// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_potaPlaces = null;
var g_potaSpots = null;

const g_NotaAPota = {
  refrence: null,
  name: null
}

function ingestPotaPlaces(buffer)
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

function getPotaPlaces()
{
  if (g_mapSettings.offlineMode == false)
  {
    getBuffer(
      "https://storage.googleapis.com/gt_app/pota.json",
      ingestPotaPlaces,
      null,
      "https",
      443
    );

    setTimeout(getPotaPlaces, 86400000)
  }
}

function ingestPotaSpots(buffer)
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

function getPotaSpots()
{
  if (g_mapSettings.offlineMode == false && g_spotsEnabled == 1)
  {
    getBuffer(
      "https://api.pota.app/spot/activator",
      ingestPotaSpots,
      null,
      "https",
      443
    );

    setTimeout(getPotaSpots, 300000);
  }
}

function g_sendPotaSpot()
{
  // if Pota spotting enabled, and we have enough info, send a spot to Pota
}
