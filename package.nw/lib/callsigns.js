// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

var g_lotwCallsigns = Object();
var g_lotwFile = "";
var g_lotwWhenDate = 0;
var g_lotwLoadTimer = null;
var g_eqslCallsigns = Object();
var g_eqslFile = "";
var g_eqslWhenDate = 0;
var g_eqslLoadTimer = null;
var g_ulsCallsignsCount = 0;

var g_ulsWhenDate = 0;
var g_ulsLoadTimer = null;

var g_oqrsCallsigns = Object();
var g_oqrsFile = "";
var g_oqrsWhenDate = 0;
var g_oqrsLoadTimer = null;

function dumpFile(file)
{
  try
  {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  catch (e) {}
}

function dumpDir(dir)
{
  try
  {
    if (fs.existsSync(dir)) fs.rmdirSync(dir);
  }
  catch (e) {}
}

function callsignServicesInit()
{
  // Dump old data files we no longer reference
  dumpFile(g_jsonDir + "uls-callsigns.json");
  dumpFile(g_jsonDir + "us-callsigns.json");
  dumpFile(g_jsonDir + "lotw-callsigns.json");
  dumpFile(g_jsonDir + "lotw-ts-callsigns.json");
  dumpFile(g_jsonDir + "eqsl-callsigns.json");
  dumpFile(g_jsonDir + "cloqrs-callsigns.json");
  dumpFile(g_jsonDir + "internal_qso.json");
  dumpFile(g_jsonDir + "spots.json");
  dumpDir(g_jsonDir);

  g_lotwFile = g_NWappData + "lotw-ts-callsigns.json";
  g_eqslFile = g_NWappData + "eqsl-callsigns.json";
  g_oqrsFile = g_NWappData + "cloqrs-callsigns.json";

  if (g_callsignLookups.lotwUseEnable)
  {
    lotwLoadCallsigns();
  }
  if (g_callsignLookups.eqslUseEnable)
  {
    eqslLoadCallsigns();
  }
  if (g_callsignLookups.ulsUseEnable)
  {
    ulsLoadCallsigns();
  }
  if (g_callsignLookups.oqrsUseEnable)
  {
    oqrsLoadCallsigns();
  }

  lotwSettingsDisplay();
  eqslSettingsDisplay();
  ulsSettingsDisplay();
  oqrsSettingsDisplay();
}

function saveCallsignSettings()
{
  localStorage.callsignLookups = JSON.stringify(g_callsignLookups);
}

function lotwLoadCallsigns()
{
  var now = timeNowSec();
  if (now - g_callsignLookups.lotwLastUpdate > 86400 * 7)
  { g_callsignLookups.lotwLastUpdate = 0; }
  else
  {
    var lotwWhenTimer = 86400 * 7 - (now - g_callsignLookups.lotwLastUpdate);
    g_lotwWhenDate = now + lotwWhenTimer;
    g_lotwLoadTimer = nodeTimers.setTimeout(lotwDownload, lotwWhenTimer * 1000);
  }

  if (!fs.existsSync(g_lotwFile))
  {
    g_callsignLookups.lotwLastUpdate = 0;
  }
  else
  {
    var data = fs.readFileSync(g_lotwFile);
    g_lotwCallsigns = JSON.parse(data);
    if (Object.keys(g_lotwCallsigns).length < 100)
    {
      lotwDownload();
    }
  }
  if (g_callsignLookups.lotwLastUpdate == 0)
  {
    lotwDownload();
  }
}

function lotwSettingsDisplay()
{
  lotwUseEnable.checked = g_callsignLookups.lotwUseEnable;

  if (g_callsignLookups.lotwLastUpdate == 0)
  {
    lotwUpdatedTd.innerHTML = "Never";
  }
  else
  {
    lotwUpdatedTd.innerHTML = userTimeString(
      g_callsignLookups.lotwLastUpdate * 1000
    );
  }

  if (!g_callsignLookups.lotwUseEnable)
  {
    if (g_lotwLoadTimer != null) nodeTimers.clearTimeout(g_lotwLoadTimer);
    g_lotwLoadTimer = null;
    g_lotwCallsigns = Object();
  }
  lotwCountTd.innerHTML = Object.keys(g_lotwCallsigns).length;
}

function lotwValuesChanged()
{
  g_callsignLookups.lotwUseEnable = lotwUseEnable.checked;
  saveCallsignSettings();
  if (g_callsignLookups.lotwUseEnable == true)
  {
    lotwLoadCallsigns();
  }
  lotwSettingsDisplay();

  setAlertVisual();
  goProcessRoster();
  if (g_callRosterWindowHandle) g_callRosterWindowHandle.window.resize();
}

function lotwDownload(fromSettings)
{
  lotwUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
  getBuffer(
    "https://lotw.arrl.org/lotw-user-activity.csv",
    processLotwCallsigns,
    null,
    "https",
    443
  );
}

function processLotwCallsigns(result, flag)
{
  // var result = String(buffer);
  var lines = Array();
  lines = result.split("\n");

  var lotwCallsigns = Object();
  for (x in lines)
  {
    var breakout = lines[x].split(",");
    if (breakout.length == 3)
    {
      var dateTime = new Date(
        Date.UTC(
          breakout[1].substr(0, 4),
          parseInt(breakout[1].substr(5, 2)) - 1,
          breakout[1].substr(8, 2),
          0,
          0,
          0
        )
      );
      lotwCallsigns[breakout[0]] = parseInt(dateTime.getTime() / 1000) / 86400;
    }
  }

  g_callsignLookups.lotwLastUpdate = timeNowSec();

  var now = timeNowSec();
  if (g_lotwLoadTimer != null) nodeTimers.clearTimeout(g_lotwLoadTimer);

  var lotwWhenTimer = 86400 * 7 - (now - g_callsignLookups.lotwLastUpdate);
  g_lotwWhenDate = now + lotwWhenTimer;
  g_lotwLoadTimer = nodeTimers.setTimeout(lotwDownload, lotwWhenTimer * 1000);

  if (Object.keys(lotwCallsigns).length > 100)
  {
    g_lotwCallsigns = lotwCallsigns;
    fs.writeFileSync(g_lotwFile, JSON.stringify(g_lotwCallsigns));
  }

  lotwSettingsDisplay();
}

function oqrsLoadCallsigns()
{
  var now = timeNowSec();
  if (now - g_callsignLookups.oqrsLastUpdate > 86400 * 7)
  { g_callsignLookups.oqrsLastUpdate = 0; }
  else
  {
    var oqrsWhenTimer = 86400 * 7 - (now - g_callsignLookups.oqrsLastUpdate);
    g_oqrsWhenDate = now + oqrsWhenTimer;
    g_oqrsLoadTimer = nodeTimers.setTimeout(oqrsDownload, oqrsWhenTimer * 1000);
  }

  if (!fs.existsSync(g_oqrsFile))
  {
    g_callsignLookups.oqrsLastUpdate = 0;
  }
  else
  {
    var data = fs.readFileSync(g_oqrsFile);
    g_oqrsCallsigns = JSON.parse(data);
  }
  if (g_callsignLookups.oqrsLastUpdate == 0)
  {
    oqrsDownload();
  }
}

function oqrsSettingsDisplay()
{
  oqrsUseEnable.checked = g_callsignLookups.oqrsUseEnable;

  if (g_callsignLookups.oqrsLastUpdate == 0)
  {
    oqrsUpdatedTd.innerHTML = "Never";
  }
  else
  {
    oqrsUpdatedTd.innerHTML = userTimeString(
      g_callsignLookups.oqrsLastUpdate * 1000
    );
  }

  if (!g_callsignLookups.oqrsUseEnable)
  {
    if (g_oqrsLoadTimer != null) nodeTimers.clearTimeout(g_oqrsLoadTimer);
    g_oqrsLoadTimer = null;
    g_oqrsCallsigns = Object();
  }
  oqrsCountTd.innerHTML = Object.keys(g_oqrsCallsigns).length;
}

function oqrsValuesChanged()
{
  g_callsignLookups.oqrsUseEnable = oqrsUseEnable.checked;
  saveCallsignSettings();
  if (g_callsignLookups.oqrsUseEnable == true)
  {
    oqrsLoadCallsigns();
  }
  oqrsSettingsDisplay();

  setAlertVisual();
  goProcessRoster();
  if (g_callRosterWindowHandle) g_callRosterWindowHandle.window.resize();
}

function oqrsDownload(fromSettings)
{
  oqrsUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
  getBuffer(
    "https://storage.googleapis.com/gt_app/callsigns/clublog.json",
    processoqrsCallsigns,
    null,
    "http",
    80
  );
}

function processoqrsCallsigns(buffer, flag)
{
  g_oqrsCallsigns = JSON.parse(buffer);

  g_callsignLookups.oqrsLastUpdate = timeNowSec();

  var now = timeNowSec();
  if (g_oqrsLoadTimer != null) nodeTimers.clearTimeout(g_oqrsLoadTimer);

  var oqrsWhenTimer = 86400 * 7 - (now - g_callsignLookups.oqrsLastUpdate);
  g_oqrsWhenDate = now + oqrsWhenTimer;
  g_oqrsLoadTimer = nodeTimers.setTimeout(oqrsDownload, oqrsWhenTimer * 1000);

  fs.writeFileSync(g_oqrsFile, JSON.stringify(g_oqrsCallsigns));
  oqrsSettingsDisplay();
}

function eqslLoadCallsigns()
{
  var now = timeNowSec();
  if (now - g_callsignLookups.eqslLastUpdate > 86400 * 7)
  { g_callsignLookups.eqslLastUpdate = 0; }
  else
  {
    var eqslWhenTimer = 86400 * 7 - (now - g_callsignLookups.eqslLastUpdate);
    g_eqslWhenDate = now + eqslWhenTimer;
    g_eqslLoadTimer = nodeTimers.setTimeout(eqslDownload, eqslWhenTimer * 1000);
  }

  if (!fs.existsSync(g_eqslFile))
  {
    g_callsignLookups.eqslLastUpdate = 0;
  }
  else
  {
    var data = fs.readFileSync(g_eqslFile);
    g_eqslCallsigns = JSON.parse(data);
  }
  if (g_callsignLookups.eqslLastUpdate == 0)
  {
    eqslDownload();
  }
}

function eqslSettingsDisplay()
{
  eqslUseEnable.checked = g_callsignLookups.eqslUseEnable;

  if (g_callsignLookups.eqslLastUpdate == 0)
  {
    eqslUpdatedTd.innerHTML = "Never";
  }
  else
  {
    eqslUpdatedTd.innerHTML = userTimeString(
      g_callsignLookups.eqslLastUpdate * 1000
    );
  }

  if (!g_callsignLookups.eqslUseEnable)
  {
    if (g_eqslLoadTimer != null) nodeTimers.clearTimeout(g_eqslLoadTimer);
    g_eqslLoadTimer = null;
    g_eqslCallsigns = Object();
  }
  eqslCountTd.innerHTML = Object.keys(g_eqslCallsigns).length;
}

function eqslValuesChanged()
{
  g_callsignLookups.eqslUseEnable = eqslUseEnable.checked;
  saveCallsignSettings();
  if (g_callsignLookups.eqslUseEnable == true)
  {
    eqslLoadCallsigns();
  }
  eqslSettingsDisplay();

  setAlertVisual();
  goProcessRoster();
  if (g_callRosterWindowHandle) g_callRosterWindowHandle.window.resize();
}

function eqslDownload(fromSettings)
{
  eqslUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
  getBuffer(
    "https://www.eqsl.cc/qslcard/DownloadedFiles/AGMemberList.txt",
    processeqslCallsigns,
    null,
    "https",
    443
  );
}

function processeqslCallsigns(buffer, flag)
{
  var result = String(buffer);
  var lines = Array();
  lines = result.split("\n");
  g_eqslCallsigns = Object();
  for (x in lines)
  {
    g_eqslCallsigns[lines[x].trim()] = true;
  }
  g_callsignLookups.eqslLastUpdate = timeNowSec();

  var now = timeNowSec();
  if (g_eqslLoadTimer != null) nodeTimers.clearTimeout(g_eqslLoadTimer);

  var eqslWhenTimer = 86400 * 7 - (now - g_callsignLookups.eqslLastUpdate);
  g_eqslWhenDate = now + eqslWhenTimer;
  g_eqslLoadTimer = nodeTimers.setTimeout(eqslDownload, eqslWhenTimer * 1000);

  if (Object.keys(g_eqslCallsigns).length > 10000)
  { fs.writeFileSync(g_eqslFile, JSON.stringify(g_eqslCallsigns)); }

  eqslSettingsDisplay();
}

function ulsLoadCallsigns()
{
  if (g_ulsLoadTimer != null)
  {
    nodeTimers.clearTimeout(g_ulsLoadTimer);
    g_ulsLoadTimer = null;
  }

  var now = timeNowSec();
  if (now - g_callsignLookups.ulsLastUpdate > 86400 * 7) ulsDownload();
  else
  {
    var ulsWhenTimer = 86400 * 7 - (now - g_callsignLookups.ulsLastUpdate);
    g_ulsWhenDate = now + ulsWhenTimer;
    g_ulsLoadTimer = nodeTimers.setTimeout(ulsDownload, ulsWhenTimer * 1000);
    updateCallsignCount();
  }
}

function updateQSO()
{
  if (g_ulsCallsignsCount > 0)
  {
    for (hash in g_QSOhash)
    {
      var details = g_QSOhash[hash];
      var lookupCall = false;

      if (
        (details.cnty == null || details.state == null) &&
        isKnownCallsignDXCC(details.dxcc)
      )
      {
        // Do County Lookup
        lookupCall = true;
      }
      else if (details.cnty != null && isKnownCallsignUSplus(details.dxcc))
      {
        if (!(details.cnty in g_cntyToCounty))
        {
          if (details.cnty.indexOf(",") == -1)
          {
            if (!(details.state + "," + details.cnty in g_cntyToCounty))
            { lookupCall = true; }
          }
          else lookupCall = true;
        }
      }
      if (lookupCall)
      {
        if (g_callsignLookups.ulsUseEnable)
        {
          lookupUsCallsign(details, true);
        }
      }
    }
  }
}

function updateCallsignCount()
{
  g_ulsDatabase.transaction(function (tx)
  {
    tx.executeSql(
      "SELECT count(*) as cnt FROM calls",
      [],
      function (tx, results)
      {
        var len = results.rows.length,
          i;
        if (len == 1)
        {
          g_ulsCallsignsCount = results.rows[0].cnt;
          ulsCountTd.innerHTML = g_ulsCallsignsCount;

          updateQSO();
        }
      },
      null
    );
  });
}

function ulsSettingsDisplay()
{
  ulsUseEnable.checked = g_callsignLookups.ulsUseEnable;

  if (g_callsignLookups.ulsLastUpdate == 0)
  {
    ulsUpdatedTd.innerHTML = "Never";
  }
  else
  {
    ulsUpdatedTd.innerHTML = userTimeString(
      g_callsignLookups.ulsLastUpdate * 1000
    );
  }

  if (!g_callsignLookups.ulsUseEnable)
  {
    if (g_ulsLoadTimer != null) nodeTimers.clearTimeout(g_ulsLoadTimer);
    g_ulsLoadTimer = null;
    g_ulsCallsignsCount = 0;
    ulsCountTd.innerHTML = g_ulsCallsignsCount;
  }
}

function ulsValuesChanged()
{
  g_callsignLookups.ulsUseEnable = ulsUseEnable.checked;

  if (g_callsignLookups.ulsUseEnable == true)
  {
    ulsLoadCallsigns();
  }
  else
  {
    resetULSDatabase();
    ulsCountTd.innerHTML = 0;
  }
  saveCallsignSettings();

  ulsSettingsDisplay();
  goProcessRoster();
  if (g_callRosterWindowHandle) g_callRosterWindowHandle.window.resize();
}

function ulsDownload()
{
  ulsUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
  ulsCountTd.innerHTML = 0;
  getChunkedBuffer(
    "https://storage.googleapis.com/gt_app/callsigns/callsigns.txt",
    processulsCallsigns,
    null,
    "http",
    80
  );
}

function getChunkedBuffer(
  file_url,
  callback,
  flag,
  mode,
  port,
  cookie,
  errorHandler
)
{
  var url = require("url");
  var http = require(mode);
  var fileBuffer = null;
  var options = null;
  if (cookie != null)
  {
    options = {
      host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
      port: port,
      followAllRedirects: true,
      path: url.parse(file_url).path, // eslint-disable-line node/no-deprecated-api
      headers: {
        Cookie: cookie
      }
    };
  }
  else
  {
    options = {
      host: url.parse(file_url).host, // eslint-disable-line node/no-deprecated-api
      port: port,
      followAllRedirects: true,
      path: url.parse(file_url).path // eslint-disable-line node/no-deprecated-api
    };
  }
  http.get(options, function (res)
  {
    var fsize = res.headers["content-length"];
    var fread = 0;
    var cookies = null;
    if (typeof res.headers["set-cookie"] != "undefined")
    { cookies = res.headers["set-cookie"]; }
    res
      .on("data", function (data)
      {
        var isEnd = false;
        fread += data.length;
        if (fread == fsize) isEnd = true;
        if (fileBuffer == null)
        {
          fileBuffer = callback(data, flag, cookies, true, isEnd);
        }
        else
        {
          fileBuffer = callback(fileBuffer + data, flag, cookies, false, isEnd); // eslint-disable-line node/no-callback-literal
        }
      })
      .on("end", function () {})
      .on("error", function (e)
      {
        console.error("Got error: " + e.message);
      });
  });
}

var g_ulsDatabase = openDatabase(
  "ulsDB",
  "1.0",
  "US Callsigns",
  50 * 1024 * 1024
);

g_ulsDatabase.transaction(function (tx)
{
  tx.executeSql(
    "CREATE TABLE IF NOT EXISTS calls ( callsign TEXT PRIMARY KEY, zip, state)"
  );
});

function resetULSDatabase()
{
  g_callsignLookups.ulsLastUpdate = 0;
  g_ulsCallsignsCount = 0;
}

function processulsCallsigns(data, flag, cookies, starting, finished)
{
  var buffer = String(data);
  var returnBuffer = "";

  if (buffer && buffer.length > 0)
  {
    var lines = null;

    if (buffer[buffer.length - 1] == "\n")
    {
      lines = buffer.split("\n");
    }
    else
    {
      var lastIndex = buffer.lastIndexOf("\n");
      returnBuffer = buffer.substring(lastIndex);
      lines = buffer.substring(0, lastIndex).split("\n");
    }

    if (lines.length > 0)
    {
      g_ulsDatabase.transaction(function (tx)
      {
        if (starting == true)
        {
          if (g_ulsLoadTimer != null) nodeTimers.clearTimeout(g_ulsLoadTimer);
          g_ulsLoadTimer = null;
          g_ulsWhenDate = 0;
          g_ulsCallsignsCount = 0;
          ulsUpdatedTd.innerHTML = "<b><i>Processing...</i></b>";
          tx.executeSql("delete from calls");
        }
        for (var x in lines)
        {
          if (lines[x].length)
          {
            ++g_ulsCallsignsCount;
            tx.executeSql(
              "INSERT INTO calls (rowid, callsign, zip, state) VALUES (" +
                g_ulsCallsignsCount +
                ",\"" +
                lines[x].substr(7) +
                "\",\"" +
                lines[x].substr(0, 5) +
                "\",\"" +
                lines[x].substr(5, 2) +
                "\")"
            );
            if (g_ulsCallsignsCount % 10000 == 0)
            {
              tx.executeSql(
                "SELECT count(*) as cnt FROM calls",
                [],
                function (rx, results)
                {
                  var len = results.rows.length,
                    i;
                  if (len == 1)
                  {
                    ulsCountTd.innerHTML = results.rows[0].cnt;
                  }
                }
              );
            }
          }
        }
        lines = null;
      });
    }
  }

  if (finished == true)
  {
    var now = timeNowSec();

    if (g_ulsLoadTimer != null) nodeTimers.clearTimeout(g_ulsLoadTimer);

    var ulsWhenTimer = 86400 * 7;
    g_ulsWhenDate = ulsWhenTimer + now;
    g_ulsLoadTimer = nodeTimers.setTimeout(ulsDownload, ulsWhenTimer * 1000);

    g_ulsDatabase.transaction(function (tx)
    {
      tx.executeSql(
        "SELECT count(*) as cnt FROM calls",
        [],
        function (rx, results)
        {
          var len = results.rows.length,
            i;
          if (len == 1)
          {
            g_ulsCallsignsCount = results.rows[0].cnt;
            ulsCountTd.innerHTML = g_ulsCallsignsCount;
            g_callsignLookups.ulsLastUpdate = timeNowSec();
            saveCallsignSettings();
            ulsSettingsDisplay();
            updateQSO();
          }
        }
      );
    });
  }

  return Buffer(returnBuffer); // eslint-disable-line node/no-deprecated-api
}

function lookupUsCallsign(object, writeState = false)
{
  g_ulsDatabase.transaction(function (tx)
  {
    let qry = "SELECT * FROM calls where callsign = \"" + object.DEcall + "\"";
    tx.executeSql(
      qry,
      [],
      function (tx, results)
      {
        if (results.rows.length == 1)
        {
          if (object.state == null)
          {
            if (object.dxcc == 1)
            {
              object.state = "CA-" + results.rows[0].state;
            }
            else
            {
              object.state = "US-" + results.rows[0].state;
            }

            if (writeState)
            {
              setState(object);
            }
          }
          object.zipcode = String(results.rows[0].zip);
          if (object.cnty == null)
          {
            let request = g_Idb.transaction(["lookups"], "readwrite").objectStore("lookups").get(object.DEcall);

            request.onsuccess = function (event)
            {
              if (request.result)
              {
                object.cnty = request.result.cnty;
                object.qual = true;
              }

              if (object.cnty == null && object.zipcode in g_zipToCounty)
              {
                var counties = g_zipToCounty[object.zipcode];
                if (counties.length > 1)
                {
                  object.qual = false;
                }
                else
                {
                  object.qual = true;
                }
                object.cnty = counties[0];
              }
              else
              {
                object.qual = false;
              }

              if (writeState)
              {
                setState(object);
              }
            };

            request.onerror = function (event)
            {
              object.qual = false;
              if (writeState)
              {
                setState(object);
              }
            };
          }
          if (writeState)
          {
            setState(object);
          }
        }
      },
      null
    );
  });
}

function downloadCtyDat()
{
  ctyDatStatus.innerHTML = "<b><i>Downloading...</i></b>";
  getBuffer(
    "https://storage.googleapis.com/gt_app/ctydat.json",
    processCtyDat,
    null,
    "https",
    443
  );
}

function processCtyDat(buffer)
{
  var data = String(buffer);
  ctyDatStatus.innerHTML = "Update: " + data.length + " bytes read";
  try
  {
    var ctydata = JSON.parse(data);
    var file = "./data/mh-root-prefixed.json";
    if (fs.existsSync(file))
    {
      var fileBuf = fs.readFileSync(file, "UTF-8");
      var worldGeoData = JSON.parse(fileBuf);
      for (const key in worldGeoData)
      {
        if (worldGeoData[key].dxcc in ctydata)
        {
          // Skip Guantanamo Bay, hand crafted with love
          if (worldGeoData[key].dxcc != "105")
          {
            worldGeoData[key].prefix = [];
            
            var arr = ctydata[worldGeoData[key].dxcc].prefix.substr(0, ctydata[worldGeoData[key].dxcc].prefix.length - 1).split(" ");
            for (const x in arr)
            {
              var test = arr[x];
              var i = arr[x].indexOf("(");
              if (i > -1)
              {
                test = test.substr(0, i);
              }
              i = arr[x].indexOf("[");
              if (i > -1)
              {
                test = test.substr(0, i);
              }
              i = arr[x].indexOf("<");
              if (i > -1)
              {
                test = test.substr(0, i);
              }
              i = arr[x].indexOf("{");
              if (i > -1)
              {
                test = test.substr(0, i);
              }

              worldGeoData[key].prefix.push(test);
            }
            worldGeoData[key].prefix = uniqueArrayFromArray(worldGeoData[key].prefix);
            worldGeoData[key].prefix.sort();
          }
        }
      }
      fs.writeFileSync(file, JSON.stringify(worldGeoData, null, 2));
      ctyDatFinal.innerHTML = file + " updated!";
    }
  }
  catch (e)
  {
    console.log(e);
  }
}
