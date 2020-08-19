// GridTracker ©2020 N0TTL

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
var g_ulsDownloadPending = false;
var g_oqrsCallsigns = Object();
var g_oqrsFile = "";
var g_oqrsWhenDate = 0;
var g_oqrsLoadTimer = null;

 
function dumpFile(file)
{
	try
	{
		if ( fs.existsSync(file) )
			fs.unlinkSync(file);
	}
	catch (e)
	{
	}
}

function callsignServicesInit()
{
	// Dump old data files we no longer reference
	dumpFile(g_jsonDir + "uls-callsigns.json");
	dumpFile(g_jsonDir + "us-callsigns.json");
	dumpFile(g_jsonDir + "lotw-callsigns.json");
	
	g_lotwFile = g_jsonDir + "lotw-ts-callsigns.json";
	g_eqslFile = g_jsonDir + "eqsl-callsigns.json";
	g_oqrsFile = g_jsonDir + "cloqrs-callsigns.json";

	if ( g_callsignLookups.lotwUseEnable )
	{
		lotwLoadCallsigns();
	}
	if ( g_callsignLookups.eqslUseEnable )
	{
		eqslLoadCallsigns();
	}
	if ( g_callsignLookups.ulsUseEnable  )
	{
		ulsLoadCallsigns();
	}
	if ( g_callsignLookups.oqrsUseEnable  )
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
	if ( g_callsignLookups.lotwWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( now - g_callsignLookups.lotwLastUpdate  > (86400 * 7) )
			g_callsignLookups.lotwLastUpdate = 0;
		else 
		{
			var lotwWhenTimer = (86400 * 7) - (now - g_callsignLookups.lotwLastUpdate);
			g_lotwWhenDate = now + lotwWhenTimer;
			g_lotwLoadTimer = setTimeout(lotwDownload,(lotwWhenTimer)*1000);
		}
	}
	else
	{
		if ( g_lotwLoadTimer != null )
		{
			clearTimeout(g_lotwLoadTimer);
			g_lotwLoadTimer = null;
			g_lotwWhenTimer = 0;
		}
	}
			
	if (!fs.existsSync(g_lotwFile))
	{
		g_callsignLookups.lotwLastUpdate = 0;
	}
	else
	{
		var data = fs.readFileSync(g_lotwFile);
		g_lotwCallsigns = JSON.parse(data);	
		if ( Object.keys(g_lotwCallsigns).length < 100 )
		{
			lotwDownload();
		}			
	}
	if ( g_callsignLookups.lotwLastUpdate == 0 )
	{
		lotwDownload();
	}
}

function lotwSettingsDisplay()
{
	lotwUseEnable.checked = g_callsignLookups.lotwUseEnable;
	lotwWeeklyEnable.checked = g_callsignLookups.lotwWeeklyEnable;
	
	if ( g_callsignLookups.lotwLastUpdate == 0 )
	{
		lotwUpdatedTd.innerHTML = "<b>Never</b>";
		lotwWhenTd.innerHTML = "<b>Never</b>";
	}
	else
	{
		lotwUpdatedTd.innerHTML = "<b>"+userTimeString(g_callsignLookups.lotwLastUpdate * 1000)+"</b>";
		lotwWhenTd.innerHTML = "<b>"+userTimeString(g_lotwWhenDate * 1000) + "</b>";
	}
	
	
	if ( g_callsignLookups.lotwUseEnable )
	{
		lotwWeeklyTd.style.display = "table-cell";
		lotwNowTd.style.display = "table-cell";
		lotwCountTd.style.display = "table-cell";
		if ( lotwWeeklyEnable.checked == true )
			lotwWhenTr.style.display = "table-row";
		else
			lotwWhenTr.style.display = "none";
		lotwLastTr.style.display = "table-row";
	}
	else
	{
		lotwWeeklyTd.style.display = "none";
		lotwNowTd.style.display = "none";
		lotwCountTd.style.display = "none";
		lotwWhenTr.style.display = "none";
		lotwLastTr.style.display = "none";
		if ( g_lotwLoadTimer != null )
			clearTimeout(g_lotwLoadTimer);
		g_lotwLoadTimer = null;
		g_lotwCallsigns = Object();
	}
	lotwCountTd.innerHTML = Object.keys(g_lotwCallsigns).length + " callsigns found";
}					
				
function lotwValuesChanged()
{
	g_callsignLookups.lotwUseEnable = lotwUseEnable.checked;
	g_callsignLookups.lotwWeeklyEnable =  lotwWeeklyEnable.checked;
	saveCallsignSettings();
	if ( g_callsignLookups.lotwUseEnable == true )
	{
		lotwLoadCallsigns();
	}
	lotwSettingsDisplay();


	setAlertVisual();
	goProcessRoster();
	if ( g_callRosterWindowHandle )
		g_callRosterWindowHandle.window.resize();
}			
	
function lotwDownload(fromSettings)
{
	lotwUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
	getBuffer("https://lotw.arrl.org/lotw-user-activity.csv", processLotwCallsigns, null, "https", 443);	
}						
					

function processLotwCallsigns(result, flag)
{
	//var result = String(buffer); 
	var lines = Array();
    lines = result.split("\n");          
	var lotwCallsigns = Object();
	for ( x in lines )
	{
		var breakout = lines[x].split(",");
		if ( breakout.length == 3 ) 
		{
			var dateTime = new Date(Date.UTC(breakout[1].substr(0,4), parseInt(breakout[1].substr(5,2))-1,breakout[1].substr(8,2), 0, 0, 0));
			lotwCallsigns[breakout[0]] = parseInt(dateTime.getTime() / 1000)/86400;
		}
	}
	g_callsignLookups.lotwLastUpdate = timeNowSec();
	if ( g_callsignLookups.lotwWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( g_lotwLoadTimer != null )
			clearTimeout(g_lotwLoadTimer);
		
		var lotwWhenTimer = (86400 * 7) - (now - g_callsignLookups.lotwLastUpdate);
		g_lotwWhenDate = now + lotwWhenTimer;
		g_lotwLoadTimer = setTimeout(lotwDownload,(lotwWhenTimer)*1000);
	}
	
	if ( Object.keys(lotwCallsigns).length > 100 )
	{
		g_lotwCallsigns = lotwCallsigns;
		fs.writeFileSync(g_lotwFile, JSON.stringify(g_lotwCallsigns));	
	}		
	
	lotwSettingsDisplay();
}


function oqrsLoadCallsigns()
{
	if ( g_callsignLookups.oqrsWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( now - g_callsignLookups.oqrsLastUpdate  > (86400 * 7) )
			g_callsignLookups.oqrsLastUpdate = 0;
		else 
		{
			var oqrsWhenTimer = (86400 * 7) - (now - g_callsignLookups.oqrsLastUpdate);
			g_oqrsWhenDate = now + oqrsWhenTimer;
			g_oqrsLoadTimer = setTimeout(oqrsDownload,(oqrsWhenTimer)*1000);
		}
	}
	else
	{
		if ( g_oqrsLoadTimer != null )
		{
			clearTimeout(g_oqrsLoadTimer);
			g_oqrsLoadTimer = null;
			g_oqrsWhenTimer = 0;
		}
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
	if ( g_callsignLookups.oqrsLastUpdate == 0 )
	{
		oqrsDownload();
	}
}

function oqrsSettingsDisplay()
{
	oqrsUseEnable.checked = g_callsignLookups.oqrsUseEnable;
	oqrsWeeklyEnable.checked = g_callsignLookups.oqrsWeeklyEnable;
	
	if ( g_callsignLookups.oqrsLastUpdate == 0 )
	{
		oqrsUpdatedTd.innerHTML = "<b>Never</b>";
		oqrsWhenTd.innerHTML = "<b>Never</b>";
	}
	else
	{
		oqrsUpdatedTd.innerHTML = "<b>"+userTimeString(g_callsignLookups.oqrsLastUpdate * 1000)+"</b>";
		oqrsWhenTd.innerHTML = "<b>"+userTimeString(g_oqrsWhenDate * 1000) + "</b>";
	}
	
	
	if ( g_callsignLookups.oqrsUseEnable )
	{
		oqrsWeeklyTd.style.display = "table-cell";
		oqrsNowTd.style.display = "table-cell";
		oqrsCountTd.style.display = "table-cell";
		if ( oqrsWeeklyEnable.checked == true )
			oqrsWhenTr.style.display = "table-row";
		else
			oqrsWhenTr.style.display = "none";
		oqrsLastTr.style.display = "table-row";
	}
	else
	{
		oqrsWeeklyTd.style.display = "none";
		oqrsNowTd.style.display = "none";
		oqrsCountTd.style.display = "none";
		oqrsWhenTr.style.display = "none";
		oqrsLastTr.style.display = "none";
		if ( g_oqrsLoadTimer != null )
			clearTimeout(g_oqrsLoadTimer);
		g_oqrsLoadTimer = null;
		g_oqrsCallsigns = Object();
	}
	oqrsCountTd.innerHTML = Object.keys(g_oqrsCallsigns).length + " callsigns found";
}					
				
function oqrsValuesChanged()
{
	g_callsignLookups.oqrsUseEnable = oqrsUseEnable.checked;
	g_callsignLookups.oqrsWeeklyEnable =  oqrsWeeklyEnable.checked;
	saveCallsignSettings();
	if ( g_callsignLookups.oqrsUseEnable == true )
	{
		oqrsLoadCallsigns();
	}
	oqrsSettingsDisplay();

	setAlertVisual();
	goProcessRoster();
	if ( g_callRosterWindowHandle )
		g_callRosterWindowHandle.window.resize();
}			
	
function oqrsDownload(fromSettings)
{
	oqrsUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
	getBuffer("https://dl.dropboxusercontent.com/s/9nycdpbxx5b3bpp/clublog.json?cb="+timeNowSec(), processoqrsCallsigns, null, "https", 443);	
}						
					
function processoqrsCallsigns(buffer, flag)
{
	g_oqrsCallsigns = JSON.parse(buffer); 

	g_callsignLookups.oqrsLastUpdate = timeNowSec();
	if ( g_callsignLookups.oqrsWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( g_oqrsLoadTimer != null )
			clearTimeout(g_oqrsLoadTimer);
		
		var oqrsWhenTimer = (86400 * 7) - (now - g_callsignLookups.oqrsLastUpdate);
		g_oqrsWhenDate = now + oqrsWhenTimer;
		g_oqrsLoadTimer = setTimeout(oqrsDownload,(oqrsWhenTimer)*1000);
	}
	
	fs.writeFileSync(g_oqrsFile, JSON.stringify(g_oqrsCallsigns));
	oqrsSettingsDisplay();	
}

function eqslLoadCallsigns()
{
	if ( g_callsignLookups.eqslWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( now - g_callsignLookups.eqslLastUpdate  > (86400 * 7) )
			g_callsignLookups.eqslLastUpdate = 0;
		else 
		{
			var eqslWhenTimer = (86400 * 7) - (now - g_callsignLookups.eqslLastUpdate);
			g_eqslWhenDate = now + eqslWhenTimer;
			g_eqslLoadTimer = setTimeout(eqslDownload,(eqslWhenTimer)*1000);
		}
	}
	else
	{
		if ( g_eqslLoadTimer != null )
		{
			clearTimeout(g_eqslLoadTimer);
			g_eqslLoadTimer = null;
			g_eqslWhenTimer = 0;
		}
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
	if ( g_callsignLookups.eqslLastUpdate == 0 )
	{
		eqslDownload();
	}
}

function eqslSettingsDisplay()
{
	eqslUseEnable.checked = g_callsignLookups.eqslUseEnable;
	eqslWeeklyEnable.checked = g_callsignLookups.eqslWeeklyEnable;
	
	if ( g_callsignLookups.eqslLastUpdate == 0 )
	{
		eqslUpdatedTd.innerHTML = "<b>Never</b>";
		eqslWhenTd.innerHTML = "<b>Never</b>";
	}
	else
	{
		eqslUpdatedTd.innerHTML = "<b>"+userTimeString(g_callsignLookups.eqslLastUpdate * 1000)+"</b>";
		eqslWhenTd.innerHTML = "<b>"+userTimeString(g_eqslWhenDate * 1000) + "</b>";
	}
	
	
	if ( g_callsignLookups.eqslUseEnable )
	{
		eqslWeeklyTd.style.display = "table-cell";
		eqslNowTd.style.display = "table-cell";
		eqslCountTd.style.display = "table-cell";
		if ( eqslWeeklyEnable.checked == true )
			eqslWhenTr.style.display = "table-row";
		else
			eqslWhenTr.style.display = "none";
		eqslLastTr.style.display = "table-row";
	}
	else
	{
		eqslWeeklyTd.style.display = "none";
		eqslNowTd.style.display = "none";
		eqslCountTd.style.display = "none";
		eqslWhenTr.style.display = "none";
		eqslLastTr.style.display = "none";
		if ( g_eqslLoadTimer != null )
			clearTimeout(g_eqslLoadTimer);
		g_eqslLoadTimer = null;
		g_eqslCallsigns = Object();
	}
	eqslCountTd.innerHTML = Object.keys(g_eqslCallsigns).length + " callsigns found";
}					
				
function eqslValuesChanged()
{
	g_callsignLookups.eqslUseEnable = eqslUseEnable.checked;
	g_callsignLookups.eqslWeeklyEnable =  eqslWeeklyEnable.checked;
	saveCallsignSettings();
	if ( g_callsignLookups.eqslUseEnable == true )
	{
		eqslLoadCallsigns();
	}
	eqslSettingsDisplay();

	setAlertVisual();
	goProcessRoster();
	if ( g_callRosterWindowHandle )
		g_callRosterWindowHandle.window.resize();
}			
	
function eqslDownload(fromSettings)
{
	eqslUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
	getBuffer("https://www.eqsl.cc/qslcard/DownloadedFiles/AGMemberList.txt", processeqslCallsigns, null, "https", 443);	
}						
					
function processeqslCallsigns(buffer, flag)
{
	var result = String(buffer); 
	var lines = Array();
    lines = result.split("\n");          
	g_eqslCallsigns = Object();
	for ( x in lines )
	{
		g_eqslCallsigns[lines[x].trim()] = 1;
	}
	g_callsignLookups.eqslLastUpdate = timeNowSec();
	if ( g_callsignLookups.eqslWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( g_eqslLoadTimer != null )
			clearTimeout(g_eqslLoadTimer);
		
		var eqslWhenTimer = (86400 * 7) - (now - g_callsignLookups.eqslLastUpdate);
		g_eqslWhenDate = now + eqslWhenTimer;
		g_eqslLoadTimer = setTimeout(eqslDownload,(eqslWhenTimer)*1000);
	}
	
	fs.writeFileSync(g_eqslFile, JSON.stringify(g_eqslCallsigns));
	eqslSettingsDisplay();	
}


function ulsLoadCallsigns()
{
	if ( g_ulsLoadTimer != null )
	{
		clearTimeout(g_ulsLoadTimer);
		g_ulsLoadTimer = null;

	}
		
	if ( g_callsignLookups.ulsWeeklyEnable == true )
	{
		var now = timeNowSec();
		if ( now - g_callsignLookups.ulsLastUpdate  > (86400 * 7) )
			g_callsignLookups.ulsLastUpdate = 0;
		else 
		{
			var ulsWhenTimer = (86400 * 7) - (now - g_callsignLookups.ulsLastUpdate);
			g_ulsWhenDate = now + ulsWhenTimer;
			g_ulsLoadTimer = setTimeout(ulsDownload,(ulsWhenTimer)*1000);
		}
	}


	if ( g_callsignLookups.ulsLastUpdate == 0 )
	{
		ulsDownload();
	}
	else
	{
		updateCallsignCount(true);
	}

}

function updateCallsignCount( shouldDownload = false )
{
	g_ulsDatabase.transaction(function (tx) { 
	tx.executeSql('SELECT count(*) as cnt FROM calls', [], function (tx, results) 
	{ 
		var len = results.rows.length, i; 
		if ( len == 1 )
		{ 
			g_ulsCallsignsCount = results.rows[0]["cnt"];
			ulsCountTd.innerHTML = g_ulsCallsignsCount + " callsigns found";
			if ( g_ulsCallsignsCount > 0 )
			{
				for ( hash in g_QSOhash )
				{
					var details = g_QSOhash[hash];
					var lookupCall = false;
					
					if ( (details.cnty == null || details.state == null) && (details.dxcc == 291 || details.dxcc == 110 || details.dxcc == 6 || details.dxcc == 202)) 
					{
						// Do County Lookup
						lookupCall = true;
					} 
					else if (details.cnty != null && (details.dxcc == 291 || details.dxcc == 110 || details.dxcc == 6 || details.dxcc == 202)) 
					{
						if (!(details.cnty in g_cntyToCounty)) 
						{
							if (details.cnty.indexOf(",") == -1) 
							{
								if (!(details.state + "," + details.cnty in g_cntyToCounty))
									lookupCall = true;
							} 
							else
								lookupCall = true;

						}
					}
					if (lookupCall) 
					{
						if (g_callsignLookups.ulsUseEnable) 
						{
							lookupUsCallsign(details);
						}
					}
				}
			}
			else
			{
				ulsDownload();
			}
		}
		else
		{
			ulsDownload();
		}
		  
	}, null); 
});
}


function ulsSettingsDisplay()
{
	ulsUseEnable.checked = g_callsignLookups.ulsUseEnable;
	ulsWeeklyEnable.checked = g_callsignLookups.ulsWeeklyEnable;
	
	if ( g_callsignLookups.ulsLastUpdate == 0 )
	{
		ulsUpdatedTd.innerHTML = "<b>Never</b>";
		ulsWhenTd.innerHTML = "<b>Never</b>";
	}
	else
	{
		ulsUpdatedTd.innerHTML = "<b>"+userTimeString(g_callsignLookups.ulsLastUpdate * 1000)+"</b>";
		ulsWhenTd.innerHTML = "<b>"+userTimeString(g_ulsWhenDate * 1000) + "</b>";
	}
	
	
	if ( g_callsignLookups.ulsUseEnable )
	{
		ulsWeeklyTd.style.display = "table-cell";
		ulsNowTd.style.display = "table-cell";
		ulsCountTd.style.display = "table-cell";
		if ( ulsWeeklyEnable.checked == true )
			ulsWhenTr.style.display = "table-row";
		else
			ulsWhenTr.style.display = "none";
		ulsLastTr.style.display = "table-row";
	}
	else
	{
		ulsWeeklyTd.style.display = "none";
		ulsNowTd.style.display = "none";
		ulsCountTd.style.display = "none";
		ulsWhenTr.style.display = "none";
		ulsLastTr.style.display = "none";
		if ( g_ulsLoadTimer != null )
			clearTimeout(g_ulsLoadTimer);
		g_ulsLoadTimer = null;
		g_ulsCallsignsCount = 0;
	}
}					
				
function ulsValuesChanged()
{
	g_callsignLookups.ulsUseEnable = ulsUseEnable.checked;
	g_callsignLookups.ulsWeeklyEnable =  ulsWeeklyEnable.checked;
	saveCallsignSettings();
	if ( g_callsignLookups.ulsUseEnable == true )
	{
		ulsLoadCallsigns();
	}
	else
		g_callsignToState = Object();
	ulsSettingsDisplay();


	goProcessRoster();
	if ( g_callRosterWindowHandle )
		g_callRosterWindowHandle.window.resize();
}			
	
function ulsDownload(fromSettings)
{
	if ( g_ulsDownloadPending == true )
	{
		ulsUpdatedTd.innerHTML = "<b><i>Download pending</i></b>";
		return;
	}
	g_ulsDownloadPending = true;
	ulsUpdatedTd.innerHTML = "<b><i>Downloading...</i></b>";
	g_callsignLookups.ulsLastUpdate = 0;
	ulsCountTd.innerHTML = "";
	getChunkedBuffer("https://dl.dropboxusercontent.com/s/91iynrvdse7zcf5/callsigns.txt?cb="+timeNowSec(), processulsCallsigns, null, "https", 443);	
}							
			
function getChunkedBuffer(file_url, callback, flag, mode, port, cookie, errorHandler) {
	var url = require('url');
	var http = require(mode);
	var fileBuffer = null;
	var options = null;
	if (cookie != null) {
		options = {
			host: url.parse(file_url).host,
			port: port,
			followAllRedirects: true,
			path: url.parse(file_url).path,
			headers: {
				'Cookie': cookie
			}
		};
	} else {
		options = {
			host: url.parse(file_url).host,
			port: port,
			followAllRedirects: true,
			path: url.parse(file_url).path
		};
	}
	http.get(options, function (res) {
		var fsize = res.headers['content-length'];
		var cookies = null;
		if (typeof res.headers['set-cookie'] != 'undefined')
			cookies = res.headers['set-cookie'];
		res.on('data', function (data) {
			if (fileBuffer == null)
			{
				fileBuffer = callback(data, flag, cookies, true, false);
			}
			else
			{
				fileBuffer = callback(fileBuffer + data, flag, cookies, false, false);
			}
		}).on('end', function () {
			if (typeof callback === "function") {
				// Call it, since we have confirmed it is callable
				callback(null, flag, cookies, false , true);
			}
		}).on('error', function (e) {
			console.error('Got error: ' + e.message);
		});
	});
}

var g_callsignToState = Object();

var g_ulsDatabase = openDatabase('ulsDB', '1.0', 'US Callsigns', 40 * 1024 * 1024);

g_ulsDatabase.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS calls (callsign PRIMARY KEY, zip, state)');
});

var g_currentULSBuffer = 0;

function processulsCallsigns(data, flag, cookies, starting, finished)
{
	var buffer = String(data);
	var returnBuffer = "";

	if ( buffer && buffer.length > 0 )
	{
		var lines = null;
	
		if ( buffer[buffer.length-1] == "\n" )
		{
			lines = buffer.split("\n"); 
		}
		else
		{
			var lastIndex = buffer.lastIndexOf("\n");
			returnBuffer = buffer.substring(lastIndex);
			lines =  buffer.substring(0,lastIndex).split("\n");
		}
		
		if ( lines.length > 0 )
		{
			g_ulsDatabase.transaction(function (tx) {
				if ( starting == true )
				{
					tx.executeSql('drop table calls');
					tx.executeSql('CREATE TABLE IF NOT EXISTS calls (callsign PRIMARY KEY, zip, state)');
					g_ulsCallsignsCount = 0;
					g_currentLine = 0;
				}
				for (var x in lines )
				{
					if ( lines[x].length )
					{
						tx.executeSql( 'INSERT INTO calls (callsign, zip, state) VALUES ("'+lines[x].substr(7)+'","'+lines[x].substr(0,5)+'","'+lines[x].substr(5,2)+'")');
					}
				}
				delete lines;
				lines = null;
		
			});
		}
	}

	if ( finished == true )
	{
		g_ulsDownloadPending = false;

		g_callsignLookups.ulsLastUpdate = timeNowSec();
		if ( g_callsignLookups.ulsWeeklyEnable == true )
		{
			var now = timeNowSec();
			if ( g_ulsLoadTimer != null )
				clearTimeout(g_ulsLoadTimer);
			
			var ulsWhenTimer = (86400 * 7) - (now - g_callsignLookups.ulsLastUpdate);
			g_ulsWhenDate = now + ulsWhenTimer;
			g_ulsLoadTimer = setTimeout(ulsDownload,(ulsWhenTimer)*1000);
		}
		updateCallsignCount();
		ulsValuesChanged();	
	}

	g_currentULSBuffer++;
	if ( g_currentULSBuffer % 40 == 0 )
	{
		updateCallsignCount();
	}
					
	return Buffer(returnBuffer);
}

function lookupUsCallsign( object , writeState = false)
{
	g_ulsDatabase.transaction(function (tx) 
	{ 
		var qry = 'SELECT * FROM calls where callsign = "'+object.DEcall+'"';
		tx.executeSql(qry, [], function (tx, results) 
		{ 
	  
		var len = results.rows.length, i; 
		if ( len == 1 )
		{ 
			if ( object.state == null )
				object.state  = "US-"+results.rows[0]["state"];
			object.zipcode = results.rows[0]["zip"];
			if ( object.cnty == null )
			{
				if ( object.zipcode in g_zipToCounty )
				{
					object.cnty = g_countyData[g_zipToCounty[object.zipcode][0]].geo["properties"]["st"]+","+ g_countyData[g_zipToCounty[object.zipcode][0]].geo["properties"]["n"].toUpperCase();
				}
			}
			if ( writeState )
				setState(object);
		 }

		}, null); 
});	
}
