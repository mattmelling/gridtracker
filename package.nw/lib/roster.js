// GridTracker ©2020 N0TTL

var fs = require('fs');

var g_blockedCalls = Object();
var g_blockedCQ = Object();
var g_blockedDxcc = Object();

//var g_slots = Array(4000);

document.addEventListener("dragover", function (event) {
	event.preventDefault();
});

document.addEventListener("drop", function (event) {
	event.preventDefault();
});

if (typeof localStorage.blockedCQ == 'undefined')
{
	localStorage.blockedCQ = "{}";
}

if (typeof localStorage.blockedCalls != 'undefined' )
{
	g_blockedCalls = JSON.parse(localStorage.blockedCalls);
	g_blockedCQ =  JSON.parse(localStorage.blockedCQ);
	g_blockedDxcc = JSON.parse(localStorage.blockedDxcc);
}

function storeBlocks()
{
	localStorage.blockedCalls = JSON.stringify(g_blockedCalls);
	localStorage.blockedCQ = JSON.stringify(g_blockedCQ);
	localStorage.blockedDxcc  = JSON.stringify(g_blockedDxcc);
}

var g_rosterSettings = null;

var g_defaultSettings =
{
	"callsign":"all",
	"hunting":"dxcc",
	"huntNeed":"confirmed",
	"requireGrid":true,
	"wantMaxDT":false,
	"wantMinDB":false,
	"wantMinFreq":false,
	"wantMaxFreq":false,
	"maxDT":0.5,
	"minDb":-25,
	"minFreq":0,
	"maxFreq":3500,
	"noMyDxcc":false,
	"onlyMyDxcc":false,
	"noRoundUp":false,
	"onlyRoundUp":false,
	"cqOnly":true,
	"usesLoTW":false,
	"maxLoTW":27,
	"useseQSL":false,
	"usesOQRS":false,
	"onlySpot":false,
	"allOnlyNew":false,
	"useRegex":false,
	"callsignRegex":"",
	"realtime":false,
	"wanted":{
		"huntCallsign":false,
		"huntGrid":true,
		"huntDXCC":true,
		"huntCqZone":false,
		"huntItuZone":false,
		"huntUsState":false,
		"huntWPX":false,
		"huntQRZ":true,
		"huntOAMS":false
	},
	"columns":{
		"Calling":true,
		"Msg":false,
		"DXCC":true,
		"Flag":true,
		"dB":true,
		"Freq":true,
		"DT":true,
		"Dist":true,
		"Azim":true,
		"State":true,
		"LoTW":false,
		"eQSL":false,
		"OQRS":false,
		"Spot":false,
		"Life":false,
		"OAMS":true,
		"Age":true
	},
	"reference":0,
	"controls":true,
	"fontSize":12,
	"settingProfiles":false,
	"lastSortIndex":6,
	"lastSortReverse":1
}

var g_modeColors = {};
g_modeColors["FT4"] = '1111FF';
g_modeColors["FT8"] = '11FF11';
g_modeColors["JT4"] = 'EE1111';
g_modeColors["JT9"] = '7CFC00';
g_modeColors["JT65"] = 'E550E5';
g_modeColors["QRA64"] = 'FF00FF';
g_modeColors["MSK144"] = '4949FF';

function loadSettings()
{
	var readSettings = {};
	if ( typeof localStorage.rosterSettings != "undefined" )
	{
		readSettings = JSON.parse(localStorage.rosterSettings);
	}
	g_rosterSettings = deepmerge(g_defaultSettings, readSettings);
	if ( "huntGT" in g_rosterSettings.wanted )
		delete  g_rosterSettings.wanted.huntGT;
	if ( "GT" in g_rosterSettings.columns )
		delete g_rosterSettings.columns.GT;
	
	writeRosterSettings();

}

function writeRosterSettings()
{
	localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
}
	
function timeNowSec()
{
    return parseInt(Date.now() / 1000);
}

function lockNewWindows()
{
  if ( typeof nw != 'undefined' )
    {
      var gui = require('nw.gui');
      var win = gui.Window.get();
      win.on('new-win-policy', function (frame, url, policy) {
        gui.Shell.openExternal(url);
        policy.ignore();
      });
    }
}


function myCallCompare(a, b) {
	return a.DEcall.localeCompare(b.DEcall);
}


function myGridCompare(a, b)
{
	var gridA = (a.grid ? a.grid : "0");
	var gridB = (b.grid ? b.grid : "0");
	
    if (gridA > gridB)
        return 1;
    if (gridA < gridB)
        return -1;
    return 0;
}



function myDxccCompare(a, b)
{
	return window.opener.myDxccCompare(a,b);
}

function myTimeCompare(a, b)
{
    if (a.age > b.age)
        return 1;
    if (a.age < b.age)
        return -1;
    return 0;
}

function myLifeCompare(a, b)
{
    if (a.life > b.life)
        return 1;
    if (a.life < b.life)
        return -1;
    return 0;
}

function mySpotCompare(a, b)
{
    if (a.spot > b.spot)
        return 1;
    if (a.spot < b.spot)
        return -1;
    return 0;
}

function myDbCompare(a, b)
{
    if (a.RSTsent > b.RSTsent)
        return 1;
    if (a.RSTsent < b.RSTsent)
        return -1;
    return 0;
}

function myFreqCompare(a, b)
{
    if (a.delta > b.delta)
        return 1;
    if (a.delta < b.delta)
        return -1;
    return 0;
}

function myDTCompare(a, b)
{
    if (a.dt > b.dt)
        return 1;
    if (a.dt < b.dt)
        return -1;
    return 0;
}

function myDistanceCompare(a, b)
{
    if (a.distance > b.distance)
        return 1;
    if (a.distance < b.distance)
        return -1;
    return 0;
}

function myHeadingCompare(a, b)
{
    if (a.heading > b.heading)
        return 1;
    if (a.heading < b.heading)
        return -1;
    return 0;
}

function myStateCompare(a, b)
{
	if (a.state == null ) return 1;
	if (b.state == null ) return -1;
    if (a.state > b.state)
        return 1;
    if (a.state < b.state)
        return -1;
    return 0;
}

function myCQCompare(a, b)
{
	return a.DXcall.localeCompare(b.DXcall);
}

function myWPXCompare(a, b)
{
	if (a.wpx == null ) return 1;
	if (b.wpx == null ) return -1;
    if (a.wpx > b.wpx)
        return 1;
    if (a.wpx < b.wpx)
        return -1;
    return 0;
}

function myGTCompare(a, b)
{
	if ( a.style.gt != 0 && b.style.gt == 0 )
		return 1;
	if ( a.style.gt == 0 && b.style.gt != 0 )
		return -1;
	return 0;
}

var r_sortFunction = [myCallCompare, myGridCompare, myDbCompare, myDTCompare, myFreqCompare, myDxccCompare, myTimeCompare,myDistanceCompare, myHeadingCompare, myStateCompare,myCQCompare, myWPXCompare, myLifeCompare, mySpotCompare, myGTCompare];


function showRosterBox(sortIndex)
{
    if (g_rosterSettings.lastSortIndex != sortIndex)
    {          
		g_rosterSettings.lastSortIndex = sortIndex;
		g_rosterSettings.lastSortReverse = 0;
    }
    else
    {
		g_rosterSettings.lastSortReverse ^= 1;
    }
	
	writeRosterSettings();
	
	window.opener.goProcessRoster();
}


function hashMaker( band, mode )
{
	//"Current Band & Mode"
	if ( g_rosterSettings.reference == 0 )
		return band + mode;
		
	//"Current Band, Any Mode"
	if ( g_rosterSettings.reference == 1 )
		return band;
	
	//"Current Band, Any Digi Mode"
	if ( g_rosterSettings.reference == 2 )
		return band + "dg";
	
	//"Current Mode, Any Band"
	if ( g_rosterSettings.reference == 3 )
		return mode;

	//"Any Band, Any Mode"
	if ( g_rosterSettings.reference == 4 )
		return "";
		
	//"Any Band, Any Digi Mode"
	if ( g_rosterSettings.reference == 5 )
		return "dg";
		
}

var callRoster = Object();
var g_worked = Object();
var g_confirmed = Object();


function processRoster(roster, worked, confirmed)
{
	callRoster = roster;
	g_worked = worked;
	g_confirmed = confirmed;

	viewRoster();
}


function viewRoster()
{
	
	var bands = Object();
	var modes = Object();
	
	var callMode = g_rosterSettings.callsign;
	var onlyHits = false;
	if ( callMode == "hits" )
	{
		callMode = "all";
		onlyHits = true;
	}

	
	var canMsg = (window.opener.g_mapSettings.offlineMode == false && window.opener.g_appSettings.gtShareEnable == "true" && window.opener.g_appSettings.gtMsgEnable == "true" );
			
	if ( window.opener.g_callsignLookups.lotwUseEnable == true )
	{
		usesLoTWDiv.style.display = "inline-block";
		if ( g_rosterSettings.usesLoTW == true )
		{
			maxLoTW.style.display = "inline-block";
			maxLoTWView.style.display = "inline-block";
		}
		else
		{
			maxLoTW.style.display = "none";
			maxLoTWView.style.display = "none";
		}
	}
	else
	{
		usesLoTWDiv.style.display = "none";
		maxLoTW.style.display = "none";
		maxLoTWView.style.display = "none";
	}

	if ( window.opener.g_callsignLookups.eqslUseEnable == true )
		useseQSLDiv.style.display = "block";
	else
		useseQSLDiv.style.display = "none";
	
	if ( window.opener.g_callsignLookups.oqrsUseEnable == true )
		usesOQRSDiv.style.display = "block";
	else
		usesOQRSDiv.style.display = "none";
		
	if ( g_rosterSettings.columns.Spot == true )
		onlySpotDiv.style.display = "block";
	else
		onlySpotDiv.style.display = "none";
		
	if ( callMode == "all" )
		allOnlyNewDiv.style.display = "block";
	else
		allOnlyNewDiv.style.display = "none";
	
			
	var now = timeNowSec();
	for ( callHash in callRoster )
	{
		var call = callRoster[callHash].DEcall;
		callRoster[callHash].tx = true;
		callRoster[callHash].callObj.shouldAlert = false;
		callRoster[callHash].callObj.reason = Array();

		if ( now - callRoster[callHash].callObj.age > window.opener.g_mapSettings.rosterTime )
		{
			callRoster[callHash].tx = false;
			callRoster[callHash].alerted = false;
			callRoster[callHash].callObj.qrz = false;
			callRoster[callHash].callObj.reset = true;
			continue;
		}
		if ( window.opener.g_instances[callRoster[callHash].callObj.instance].crEnable == false )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		/*if ( g_slots[callRoster[call].message.DF] == 0 || ( g_slots[callRoster[call].message.DF] < callRoster[call].message.SR+30 ) )
		{

			if ( g_bw )
				g_slots.fill(callRoster[call].message.SR+30, callRoster[call].message.DF, callRoster[call].message.DF+g_bw );
		}*/
		
		if ( call in g_blockedCalls )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( callRoster[callHash].DXcall + " from All" in g_blockedCQ || callRoster[callHash].DXcall + " from " + window.opener.g_dxccToAltName[callRoster[callHash].callObj.dxcc] in g_blockedCQ )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( callRoster[callHash].callObj.dxcc in g_blockedDxcc )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.cqOnly == true && callRoster[callHash].callObj.CQ == false )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.useRegex  && g_rosterSettings.callsignRegex.length > 0 )
		{
			try 
			{
				if ( !(call.match(g_rosterSettings.callsignRegex)) )
				{
					callRoster[callHash].tx = false;
					continue;
				}
			}
			catch (e)
			{
			}
		}
		if ( g_rosterSettings.requireGrid == true && callRoster[callHash].callObj.grid.length != 4 )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.wantMinDB == true && callRoster[callHash].message.SR < g_rosterSettings.minDb )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.wantMaxDT == true && Math.abs(callRoster[callHash].message.DT) > g_rosterSettings.maxDT )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.wantMinFreq == true && callRoster[callHash].message.DF < g_rosterSettings.minFreq )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		if ( g_rosterSettings.wantMaxFreq == true && callRoster[callHash].message.DF > g_rosterSettings.maxFreq )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		
		if ( g_rosterSettings.noRoundUp == true && (callRoster[callHash].DXcall == "CQ RU" ||  callRoster[callHash].DXcall == "CQ FTRU" ) ) 
		{
			callRoster[callHash].tx = false;
			continue;

		}
		if ( g_rosterSettings.onlyRoundUp == true && callRoster[callHash].DXcall != "CQ RU" &&  callRoster[callHash].DXcall != "CQ FTRU" )
		{
			callRoster[callHash].tx = false;
			continue;
		}
		
		if ( callRoster[callHash].callObj.dxcc == window.opener.g_myDXCC )
		{
			if ( g_rosterSettings.noMyDxcc == true )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		}
		else
		{
			if ( g_rosterSettings.onlyMyDxcc == true )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		}
		
		if ( window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.usesLoTW == true )
		{
			if ( !(call in window.opener.g_lotwCallsigns) )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		}
		
		if ( window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.useseQSL == true )
		{
			if ( !(call in window.opener.g_eqslCallsigns) )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		}
		
		if ( window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.usesOQRS == true )
		{
			if ( !(call in window.opener.g_oqrsCallsigns) )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		}
		
		if ( callMode != "all" )
		{
			if ( callRoster[callHash].DXcall == "CQ DX" && callRoster[callHash].callObj.dxcc == window.opener.g_myDXCC )
			{
				callRoster[callHash].tx = false;
				continue;
			}
		
			{
				var hash =  call + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode) ;
				if ( callMode == "worked"  && hash in g_worked.call )
					{
						callRoster[callHash].tx = false;
						continue;
					}
				if ( callMode == "confirmed"  &&  hash in g_confirmed.call )
					{
						callRoster[callHash].tx = false;
						continue;
					}
			}
			if ( g_rosterSettings.hunting == "grid" )
			{
				var hash  = callRoster[callHash].callObj.grid.substr(0,4) + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
				if (  g_rosterSettings.huntNeed == "worked" && hash in g_worked.grid )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				if ( g_rosterSettings.huntNeed == "confirmed" && hash in g_confirmed.grid )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				if ( callRoster[callHash].callObj.grid.length == 0 )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				continue;
			}
			if ( g_rosterSettings.hunting == "dxcc" )
			{
				var hash  = String(callRoster[callHash].callObj.dxcc) + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
				
				if (  g_rosterSettings.huntNeed == "worked" &  hash in g_worked.dxcc  )
				{
						callRoster[callHash].tx = false;
						continue;
				}
				
				if ( g_rosterSettings.huntNeed == "confirmed" && hash in g_confirmed.dxcc )
				{
						callRoster[callHash].tx = false;
						continue;
				}
				
				continue;
			}
			
			if ( g_rosterSettings.hunting == "dxccs" && r_currentDXCCs != -1 )
			{
				if ( callRoster[callHash].callObj.dxcc !=  r_currentDXCCs )
				{
					callRoster[callHash].tx = false;
					continue;
				}
			}

			if ( g_rosterSettings.hunting == "wpx" )
			{
				if ( String(callRoster[callHash].callObj.wpx) == null )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				var hash  = String(callRoster[callHash].callObj.wpx) + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
				
				if (  g_rosterSettings.huntNeed == "worked" &  hash in g_worked.wpx  )
				{
						callRoster[callHash].tx = false;
						continue;
				}
				
				if ( g_rosterSettings.huntNeed == "confirmed" && hash in g_confirmed.wpx )
				{
						callRoster[callHash].tx = false;
						continue;
				}
				
				continue;
			}
			
			if ( g_rosterSettings.hunting == "cq" )
			{
				var workedTotal = confirmedTotal = callRoster[callHash].callObj.cqza.length;
				if ( workedTotal == 0 )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				var workedFound = confirmedFound = 0;
				for ( index in callRoster[callHash].callObj.cqza )
				{
					var hash = callRoster[callHash].callObj.cqza[index] + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
					if (  hash in g_worked.cqz  )
						workedFound++;
						
					if ( hash in g_confirmed.cqz )
						confirmedFound++;
				}
				if (  g_rosterSettings.huntNeed == "worked" && workedFound == workedTotal )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				if (  g_rosterSettings.huntNeed == "confirmed" && confirmedFound == confirmedTotal )
				{
					callRoster[callHash].tx = false;
					continue;
				}

				continue;
			}
			
			if ( g_rosterSettings.hunting == "itu" )
			{
				var workedTotal = confirmedTotal = callRoster[callHash].callObj.ituza.length;
				if ( workedTotal == 0 )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				var workedFound = confirmedFound = 0;
				for ( index in callRoster[callHash].callObj.ituza )
				{
					var hash = callRoster[callHash].callObj.ituza[index] + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
					if (  hash in g_worked.ituz  )
						workedFound++;
						
					if ( hash in g_confirmed.ituz )
						confirmedFound++;
				}
				if (  g_rosterSettings.huntNeed == "worked" && workedFound == workedTotal )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				if (  g_rosterSettings.huntNeed == "confirmed" && confirmedFound == confirmedTotal )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				if ( callRoster[callHash].callObj.grid.length == 0 )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				continue;
			}
			
			if ( g_rosterSettings.hunting == "usstates" && window.opener.g_callsignLookups.ulsUseEnable == true )
			{
				var state = callRoster[callHash].callObj.state;
				var finalDxcc = callRoster[callHash].callObj.dxcc;
				if ( finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6 )
				{
					if ( state in window.opener.g_StateData )
					{
						var hash = state + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
						
						if (  g_rosterSettings.huntNeed == "worked" && hash in g_worked.state )
						{
								callRoster[callHash].tx = false;
								continue;
						}
						
						if ( g_rosterSettings.huntNeed == "confirmed" && hash in g_confirmed.state )
						{
								callRoster[callHash].tx = false;
								continue;
						}
					}
					else
						callRoster[callHash].tx = false;
				}
				else
					callRoster[callHash].tx = false;
				
				continue;
			}
			
			if ( g_rosterSettings.hunting == "usstate" && g_currentUSCallsigns )
			{	
				if ( call in g_currentUSCallsigns )
				{
				}
				else
				{
					callRoster[callHash].tx = false;
					continue;
				}
				continue;
			}
		}
		else
		{
		}
	}
	
	if ( (callMode != "all" &&  g_rosterSettings.hunting == "usstates") ||  (callMode == "all" &&  huntUsState.checked == true))
	{
		usCallsignInfoDiv.style.display="block";
		if ( window.opener.g_callsignLookups.ulsUseEnable == false )
			usCallsignInfoDiv.innerHTML = "<b>US Callsign database must be enabled in settings for this feature to function</b>";
		else
		{
			usCallsignInfoDiv.innerHTML = "";
		}
	}
	else if ( (callMode != "all" &&  huntMode.value != "usstates" &&  huntMode.value != "usstate") ||  (callMode == "all" &&  huntUsState.checked == false ) )
		usCallsignInfoDiv.style.display="none";
	
	
	var hasGtPin = false;
	
	var newCallList = Array();
	var inversionAlpha = "DD";
	var row = "#000000";
	var bold = "#000000;text-shadow: 0px 0px 1px black;";
	var unconf = "background-clip:content-box;box-shadow: 0 0 8px 3px inset ";
	for (var callHash in callRoster)
	{
		// Special case check for called station
		if ( callRoster[callHash].callObj.qrz == true  &&  callRoster[callHash].tx == false )
		{
			// The instance has to be enabled
			if (  window.opener.g_instances[callRoster[callHash].callObj.instance].crEnable == true )
			{
				// Calling us, but we wouldn't normally display
				// If they are not ignored or we're in a QSO with them, let it through
			
				if ( ( !( callRoster[callHash].DEcall in g_blockedCalls) && !( callRoster[callHash].callObj.dxcc in g_blockedDxcc) ) || 
					window.opener.g_instances[callRoster[callHash].callObj.instance].status.DXcall == callRoster[callHash].DEcall )
				{
					callRoster[callHash].tx = true;
				}
				
			}
		}
		
		if (callRoster[callHash].callObj.dxcc != -1 && callRoster[callHash].tx == true)
		{
			var workHash = hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
			
			var call = callRoster[callHash].DEcall;
			var colorObject = Object();

			var callPointer = ( callRoster[callHash].callObj.CQ == true ? "cursor:pointer" : "" );
			var didWork = false;
			
			var callsign = "#FFFF00";
			var grid 	 = "#00FFFF";
			var calling  = "#90EE90";
			var dxcc	 = "#FFA500";
			var state 	 = "#FFFFFF";
			var cqz 	 = "#FFFFFF";
			var ituz 	 = "#FFFFFF";
			var wpx      = "#FFFF00";
			
			hasGtPin = false;
			shouldAlert = false;
			var callsignBg , gridBg , callingBg , dxccBg , stateBg , cqzBg , ituzBg , wpxBg, gtBg;
			var gridConf , callingConf , dxccConf , stateConf , cqzConf , ituzConf , wpxConf;
			
			callsignBg = gridBg = callingBg = dxccBg = stateBg = cqzBg = ituzBg = wpxBg = gtBg = row;
			
			gridConf = callingConf = dxccConf = stateConf = cqzConf = ituzConf = wpxConf = "";

			if (   (call + workHash in g_worked.call) )
			{
				callPointer =  "text-decoration: line-through; ";
				didWork = true;
			}
		
			if ( call in window.opener.g_gtCallsigns && window.opener.g_gtFlagPins[window.opener.g_gtCallsigns[call]].canmsg == true )
			{
				// grab the CID
				colorObject.gt = window.opener.g_gtCallsigns[call];
				hasGtPin = true;
			}
			else
				colorObject.gt = 0;
				
			if ( callMode == "all" )
			{	
				if ( allOnlyNew.checked == true && didWork && callRoster[callHash].callObj.qrz == false)
				{
					callRoster[callHash].tx = false;
					continue;
				}
				
				if ( huntCallsign.checked == true )
				{
					if (  !(call + workHash in g_worked.call) )
						{ 
							callsignBg = callsign + inversionAlpha ; 
							callsign = bold; 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("callsign"); 
						}		
				}
				
				if ( huntQRZ.checked == true && callRoster[callHash].callObj.qrz == true )
				{
					shouldAlert = true; 
					callRoster[callHash].callObj.reason.push("qrz"); 
				}

				if ( huntOAMS.checked == true && hasGtPin == true )
				{
					shouldAlert = true; 
					callRoster[callHash].callObj.reason.push("oams"); 
				}
				
				if ( huntGrid.checked == true && callRoster[callHash].callObj.grid.length > 1 )
				{
					var hash = callRoster[callHash].callObj.grid.substr(0,4)  + workHash;
					if ( (g_rosterSettings.huntNeed == "worked" &&  !(hash in g_worked.grid) ) ||
						 (g_rosterSettings.huntNeed == "confirmed" &&  !(hash in g_confirmed.grid) ))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("grid");
							
							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.grid) )
							{
								gridConf = unconf + grid + inversionAlpha + ";";
							}
							else
							{
								gridBg = grid + inversionAlpha; 
								grid = bold; 
							}
						}
				}
				if ( huntDXCC.checked == true )
				{
					var hash = String(callRoster[callHash].callObj.dxcc) +workHash;
					if ( (g_rosterSettings.huntNeed == "worked" &&  !(hash in g_worked.dxcc) ) ||
						 (g_rosterSettings.huntNeed == "confirmed" &&  !(hash in g_confirmed.dxcc) ))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("dxcc");
							
							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.dxcc) )
							{
								dxccConf = unconf + dxcc + inversionAlpha + ";";
							}
							else
							{
								dxccBg = dxcc + inversionAlpha; 
								dxcc = bold; 
							}
						}
				}
				if ( huntUsState.checked == true && window.opener.g_callsignLookups.ulsUseEnable == true )
				{
					var stateSearch = callRoster[callHash].callObj.state;
					var finalDxcc = callRoster[callHash].callObj.dxcc;
					if ( finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6 )
					{
						if ( stateSearch in window.opener.g_StateData )
						{
							var hash = stateSearch + workHash;
							if ( (g_rosterSettings.huntNeed == "worked" && !(hash in g_worked.state)) || ( g_rosterSettings.huntNeed == "confirmed" && !(hash in g_confirmed.state)))
							{ 
								shouldAlert = true; 
								callRoster[callHash].callObj.reason.push("usstates");
	
								if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.state) )
								{
									stateConf = unconf + state + inversionAlpha + ";";
								}
								else
								{
									stateBg = state + inversionAlpha ; 
									state = bold; 
								}
							}
						}
					}
				}
				if ( huntCqZone.checked == true )
				{
					var workedTotal = confirmedTotal = callRoster[callHash].callObj.cqza.length;	
					var workedFound = confirmedFound = 0;
					for ( index in callRoster[callHash].callObj.cqza )
					{
						var hash = callRoster[callHash].callObj.cqza[index] + workHash;
						if (  hash in g_worked.cqz  )
							workedFound++;
							
						if ( hash in g_confirmed.cqz )
							confirmedFound++;
					}
					if ( ( g_rosterSettings.huntNeed == "worked" && workedFound != workedTotal ) || (  g_rosterSettings.huntNeed == "confirmed" && confirmedFound != confirmedTotal ) )
					{ 
						shouldAlert = true; 
						callRoster[callHash].callObj.reason.push("cq");
						
						if ( g_rosterSettings.huntNeed == "confirmed" &&  workedFound == workedTotal )
						{
							cqzConf = unconf + cqz + inversionAlpha + ";";
						}
						else
						{
							cqzBg = cqz + inversionAlpha; 
							cqz = bold; 
						}	
					}
						
				}
				if ( huntItuZone.checked == true )
				{
					var workedTotal = confirmedTotal = callRoster[callHash].callObj.ituza.length;	
					var workedFound = confirmedFound = 0;
					for ( index in callRoster[callHash].callObj.ituza )
					{
						var hash = callRoster[callHash].callObj.ituza[index] + workHash;
						if (  hash in g_worked.ituz  )
							workedFound++;
							
						if ( hash in g_confirmed.ituz )
							confirmedFound++;
					}
					if ( ( g_rosterSettings.huntNeed == "worked" && workedFound != workedTotal ) || (  g_rosterSettings.huntNeed == "confirmed" && confirmedFound != confirmedTotal ) )
					{
						shouldAlert = true; 
						callRoster[callHash].callObj.reason.push("itu");
						if ( g_rosterSettings.huntNeed == "confirmed" &&  workedFound == workedTotal )
						{
							ituzConf = unconf + ituz + inversionAlpha + ";";
						}
						else
						{
							ituzBg = ituz + inversionAlpha; 
							ituz = bold;
						}	
					}
						
				}
				if ( huntWPX.checked == true && callRoster[callHash].callObj.wpx)
				{
					var hash = String(callRoster[callHash].callObj.wpx) + workHash;
					if ( (g_rosterSettings.huntNeed == "worked" &&  !(hash in g_worked.wpx) ) ||
						 (g_rosterSettings.huntNeed == "confirmed" &&  !(hash in g_confirmed.wpx) ))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("wpx");
							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.wpx) )
							{
								wpxConf = unconf + wpx + inversionAlpha + ";";
							}
							else
							{
								wpxBg = wpx + inversionAlpha ; 
								wpx = bold; 
							}
						}
				}
			}

			
			if ( callRoster[callHash].callObj.DXcall == window.opener.myDEcall )
				{ callingBg = "#0000FF" + inversionAlpha; calling = "#FFFF00;text-shadow: 0px 0px 2px #FFFF00" }
			else if (  callRoster[callHash].callObj.CQ == true && g_rosterSettings.cqOnly == false )
				{ callingBg = calling + inversionAlpha; calling = bold;}
				
	
			colorObject.callsign = "style='background-color:"+callsignBg+";color:"+callsign+";"+callPointer+"'" ;
			colorObject.grid 	 = "style='"+gridConf+"background-color:"+gridBg+";color:"+grid+";cursor:pointer'";
			colorObject.calling  = "style='"+callingConf+"background-color:"+callingBg+";color:"+calling+"'";
			colorObject.dxcc	 = "style='"+dxccConf+"background-color:"+dxccBg+";color:"+dxcc+"'";
			colorObject.state 	 = "style='"+stateConf+"background-color:"+stateBg+";color:"+state+"'";
			colorObject.cqz 	 = "style='"+cqzConf+"background-color:"+cqzBg+";color:"+cqz+"'";
			colorObject.ituz 	 = "style='"+ituzConf+"background-color:"+ituzBg+";color:"+ituz+"'";
			colorObject.wpx 	 = "style='"+wpxConf+"background-color:"+wpxBg+";color:"+wpx+"'";
			if ( didWork && shouldAlert )
				shouldAlert = false;
				
			callRoster[callHash].callObj.shouldAlert = shouldAlert;
			
			callRoster[callHash].callObj.style = colorObject;
			
			if ( g_rosterSettings.columns.Spot )
				callRoster[callHash].spot = window.opener.getSpotTime( callRoster[callHash].callObj.DEcall +  callRoster[callHash].callObj.mode  +  callRoster[callHash].callObj.band +  callRoster[callHash].callObj.grid );
			else
				callRoster[callHash].spot = 0;
			
			modes[callRoster[callHash].callObj.mode] = true;
			bands[callRoster[callHash].callObj.band] = true;
			
			newCallList.push(callRoster[callHash].callObj);
		}
	}

	newCallList.sort(r_sortFunction[g_rosterSettings.lastSortIndex]);
	if ( g_rosterSettings.lastSortReverse == 1 )
	{
		newCallList.reverse();
	}
			
		
	var showBands = (window.opener.g_instancesIndex.length > 1?true:false);
	var showModes = (Object.keys(modes).length > 1?true:false);
	
    var showCqZone = false;
	var showItuZone = false;
	var showWPX = false;
	if ( (g_rosterSettings.hunting == "cq" &&  callMode != "all" ) || ( g_rosterSettings.wanted.huntCqZone == true &&  callMode == "all") )
		showCqZone = true;
	if ( (g_rosterSettings.hunting == "itu" && callMode != "all" ) || ( g_rosterSettings.wanted.huntItuZone == true && callMode == "all") )
		showItuZone = true;
	if ( (g_rosterSettings.hunting == "wpx" &&  callMode != "all" ) || ( g_rosterSettings.wanted.huntWPX == true &&  callMode == "all") )
		showWPX = true;
		
	var worker = "<table id='callTable' class='darkTable' align=left>";
	

	worker += "<th style='cursor:pointer;' onclick='showRosterBox(0);' align=left>Callsign</th>";

	if ( showBands )
	{
		worker += "<th style='' onclick='' >Band</th>";
	}
	if ( showModes )
	{
		worker += "<th style='' onclick='' >Mode</th>";
	}
	
	worker += "<th style='cursor:pointer;' onclick='showRosterBox(1);'  >Grid</th>";
	if ( g_rosterSettings.columns.Calling )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(10);' >Calling</th>";
	if ( g_rosterSettings.columns.Msg )
		worker += "<th >Msg</th>";
	if ( g_rosterSettings.columns.DXCC )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(5);' >DXCC</th>";
	if ( g_rosterSettings.columns.Flag  )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(5);' >Flag</th>";
	
	if ( g_rosterSettings.columns.dB )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(2);' >dB</th>";
	if ( g_rosterSettings.columns.Freq )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(4);' >Freq</th>";
	if ( g_rosterSettings.columns.DT )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(3);' >DT</th>";
	if ( g_rosterSettings.columns.Dist )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(7);' >Dist("+window.opener.distanceUnit.value.toLowerCase()+")</th>";
	if ( g_rosterSettings.columns.Azim )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(8);' >Azim</th>";

	if ( showCqZone )
		worker += "<th>CQz</th>";
	if ( showItuZone )
		worker += "<th>ITUz</th>";
	if ( ( g_rosterSettings.columns.State ||   ( g_rosterSettings.wanted.huntUsState == true &&  callMode == "all") || ( callMode != "all" &&  g_rosterSettings.hunting == "usstates") ) && window.opener.g_callsignLookups.ulsUseEnable == true )
		worker += "<th  style='cursor:pointer;' onclick='showRosterBox(9);'  >State</th>";

	if ( showWPX )
		worker += "<th  style='cursor:pointer;' onclick='showRosterBox(11);'>PX</th>";	
	
	if ( window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.columns.LoTW )
		worker += "<th  >LoTW</th>";
	if ( window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.columns.eQSL )
		worker += "<th >eQSL</th>";
	if ( window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.columns.OQRS )
		worker += "<th >OQRS</th>";

	


	if ( g_rosterSettings.columns.Spot )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(13);' >Spot</th>";
	
	if ( g_rosterSettings.columns.Life )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(12);' >Life</th>";

	if ( g_rosterSettings.columns.OAMS )
		worker += "<th title='Off-Air Message User' style='cursor:pointer;' onclick='showRosterBox(14);'>OAM</th>";

	if ( g_rosterSettings.columns.Age )
		worker += "<th style='cursor:pointer;' onclick='showRosterBox(6);' >Age</th>";
	
	var shouldAlert = 0;
	
	
	
	for (var x in newCallList)
	{
		if ( newCallList[x].shouldAlert == false && onlyHits == true && newCallList[x].qrz == false)
			continue;
		
		var spotString = "";
		if (  g_rosterSettings.columns.Spot &&  newCallList[x].qrz == false )
		{
			spotString = getSpotString(newCallList[x]);
			if ( g_rosterSettings.onlySpot && spotString == "")
				continue;
		}
		var grid = (newCallList[x].grid.length > 1 ? newCallList[x].grid.substr(0,4) : "-");

		var geo = window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[newCallList[x].dxcc]];
		var cqzone = (grid in window.opener.g_gridToCQZone ? window.opener.g_gridToCQZone[grid].join(", ") : "-");
		var ituzone = (grid in window.opener.g_gridToITUZone ? window.opener.g_gridToITUZone[grid].join(", ") : "-");
		var thisCall = newCallList[x].DEcall;

		worker += "<tr id='" + thisCall + newCallList[x].band+newCallList[x].mode + "'>";

		var thisClass = "";
		if ( thisCall.match("^[A-Z][0-9][A-Z](\/\w+)?$") )
			thisClass = "class='oneByOne'";
		if ( thisCall == window.opener.g_instances[newCallList[x].instance].status.DXcall )
		{
			if ( window.opener.g_instances[newCallList[x].instance].status.TxEnabled == 1 )
			{
				thisClass = "class='dxCalling'";
			}
			else
			{
				thisClass = "class='dxCaller'";
			}
		}
		
		worker += "<td "+thisClass+" title='Callsign' align=left " +newCallList[x].style.callsign + " onClick='initiateQso(\"" +
			 thisCall + newCallList[x].band+newCallList[x].mode + "\")'>" + thisCall.formatCallsign() + "</td>";

		if ( showBands )
		{
			worker += "<td style='color:#"+window.opener.g_pskColors[newCallList[x].band]+"' >"+newCallList[x].band+"</td>";
		}
		if ( showModes )
		{
			var color = "888888";
			if ( newCallList[x].mode in g_modeColors )
				color =  g_modeColors[newCallList[x].mode];
			worker += "<td  style='color:#"+color+"' >"+newCallList[x].mode+"</td>";
		}
		
		worker += "<td  "+newCallList[x].style.grid+" onClick='centerOn(\"" + grid + "\")' >" + grid + "</td>";
		if ( g_rosterSettings.columns.Calling )
		{
			var lookString = (newCallList[x].CQ?"title='CQ'":"title='Calling'");
			worker += 	"<td "+newCallList[x].style.calling+" "+lookString+">"+newCallList[x].DXcall.formatCallsign() + "</td>";
		}
		if ( g_rosterSettings.columns.Msg )
			worker += 	"<td>"+newCallList[x].msg+ "</td>";

		if ( g_rosterSettings.columns.DXCC )
			worker += "<td title='DXCC ("+newCallList[x].dxcc+")' "+newCallList[x].style.dxcc+">" + window.opener.g_dxccToAltName[newCallList[x].dxcc] +
				" (" + window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[newCallList[x].dxcc]].pp  + ")</td>";
		if ( g_rosterSettings.columns.Flag )
			worker += "<td align='center' style='margin:0;padding:0'><img style='padding-top:3px' src='./img/flags/16/" + geo.flag + "'></td>";
		
		if ( g_rosterSettings.columns.dB )
			worker += "<td style='color:#DD44DD'><b>" + newCallList[x].RSTsent + "</b></td>";
		if ( g_rosterSettings.columns.Freq )			
			worker += "<td style='color:#00FF00'>"+newCallList[x].delta+"</td>";
		if ( g_rosterSettings.columns.DT )
			worker += "<td style='color:#1E90FF'>"+newCallList[x].dt+"</td>";
		if ( g_rosterSettings.columns.Dist )
			worker += "<td style='color:cyan'>"+parseInt(newCallList[x].distance*MyCircle.validateRadius(window.opener.distanceUnit.value))+"</td>";
		if ( g_rosterSettings.columns.Azim )
			worker += "<td style='color:yellow'>"+parseInt(newCallList[x].heading)+"</td>";
		
		if ( showCqZone )
			worker += "<td "+newCallList[x].style.cqz+">"+ newCallList[x].cqza.join(",")+"</td>";
		if  ( showItuZone )
			worker += "<td "+newCallList[x].style.ituz+">"+ newCallList[x].ituza.join(",")+"</td>";
		
		if ( ( g_rosterSettings.columns.State || ( g_rosterSettings.wanted.huntUsState == true &&  callMode == "all") || ( callMode != "all" &&  g_rosterSettings.hunting == "usstates") ) && window.opener.g_callsignLookups.ulsUseEnable == true )
			worker += "<td align='center' "+newCallList[x].style.state+" >"+ (newCallList[x].state ? newCallList[x].state.substr(3) : "")+"</td>";

		if  ( showWPX )
			worker += "<td "+newCallList[x].style.wpx+">"+ (newCallList[x].wpx ? newCallList[x].wpx:'')+"</td>";
		
		if ( window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.columns.LoTW )
		{
			if ( thisCall in window.opener.g_lotwCallsigns )
			{
				if ( g_rosterSettings.maxLoTW < 27 )
				{
					var months = (g_day -  window.opener.g_lotwCallsigns[thisCall]) / 30;
					if ( months > g_rosterSettings.maxLoTW )
						worker += "<td  style='color:yellow' align='center' title='Has not uploaded a QSO in "+Number(months).toYM()+"'>?</td>";
					else
						worker += "<td  style='color:#0F0' align='center'>&#10004;</td>";
				}
				else
					worker += "<td  style='color:#0F0' align='center'>&#10004;</td>";
			}
			else 
				worker += "<td></td>";
			
		}
		if ( window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.columns.eQSL )
			worker += "<td  style='color:#0F0;' align='center'>"+ (thisCall in window.opener.g_eqslCallsigns ? "&#10004;" : "")+"</td>";
		if ( window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.columns.OQRS )
			worker += "<td  style='color:#0F0;' align='center'>"+ (thisCall in window.opener.g_oqrsCallsigns ? "&#10004;" : "")+"</td>";

		if ( g_rosterSettings.columns.Spot )
			worker += "<td style='color:#FFF;' class='spotCol' id='sp"+thisCall+newCallList[x].band+newCallList[x].mode+"'>"+  spotString +"</td>";	
		if ( g_rosterSettings.columns.Life )
			worker += "<td style='color:#FFF;' class='lifeCol' id='lm"+thisCall+newCallList[x].band+newCallList[x].mode+"'>"+  (timeNowSec() - newCallList[x].life).toDHMS() +"</td>";


		
		if ( g_rosterSettings.columns.OAMS  )
		{
			if ( newCallList[x].style.gt != 0 )
			{
				if ( newCallList[x].reason.includes("oams") )
				{
					worker += "<td align='center' style='margin:0;padding:0;cursor:pointer;background-clip:content-box;box-shadow: 0 0 4px 4px inset #2222FFFF;' onClick='openChatToCid(\""+newCallList[x].style.gt+"\")'><img height='16px' style='' src='./img/gt_chat.png'></td>";
				}
				else
				{
					worker += "<td align='center' style='margin:0;padding:0;cursor:pointer;' onClick='openChatToCid(\""+newCallList[x].style.gt+"\")'><img height='16px' style='' src='./img/gt_chat.png'></td>";
				}
			}
			else
				worker += "<td></td>";
		}

		if ( g_rosterSettings.columns.Age )
			worker += "<td style='color:#FFF' class='timeCol' id='tm"+thisCall+newCallList[x].band+newCallList[x].mode+"'>"+  (timeNowSec() - newCallList[x].age).toDHMS() +"</td>";
		
		worker += "</tr>";

		if (  g_rosterSettings.realtime == false )
		{
			var call = newCallList[x].DEcall;
			g_scriptReport[call] = Object.assign({}, newCallList[x] );
			g_scriptReport[call].dxccName = window.opener.g_dxccToAltName[newCallList[x].dxcc];
			g_scriptReport[call].distance = parseInt(newCallList[x].distance*MyCircle.validateRadius(window.opener.distanceUnit.value));
			
			delete g_scriptReport[call].DEcall;
			g_scriptReport[call].rect = null;
			delete g_scriptReport[call].rect;
			delete g_scriptReport[call].style;
			delete g_scriptReport[call].worked;
			delete g_scriptReport[call].confirmed;
			delete g_scriptReport[call].wspr;
			delete g_scriptReport[call].qso;
			delete g_scriptReport[call].instance;
			
			if (  callMode != "all" )
			{
				g_scriptReport[call].shouldAlert = true;
				g_scriptReport[call].reason.push(g_rosterSettings.hunting);
			}
		}
		
		if ( newCallList[x].alerted == false && callMode == "all" && newCallList[x].shouldAlert == true )
		{
			newCallList[x].alerted = true;
			shouldAlert++;
			
		}
		else if  ( newCallList[x].alerted == false && callMode != "all" )
		{
			newCallList[x].alerted = true;
			shouldAlert++;
			
		}

		
		newCallList[x].shouldAlert = false;
	}
	worker += "</table>";
	rosterTable.innerHTML = worker;
    	
    callTable.style.width =  (parseInt(window.innerWidth)-6)+"px";
	
	var dirPath = window.opener.g_scriptDir;
	var scriptExists = false;
	var script = "cr-alert.sh";
	
	try 
	{
				
		if ( fs.existsSync(dirPath) )
		{
			if ( window.opener.g_platform == "windows" )
			{
				script = "cr-alert.bat";
			}
			if ( fs.existsSync(dirPath + script) && g_rosterSettings.realtime == false )
			{
				scriptExists = true;
				scriptIcon.innerHTML = "<div class='buttonScript' onclick='window.opener.toggleCRScript();'>" +  ( window.opener.g_crScript == 1 ? "<font color='lightgreen'>Script Enabled</font>":"<font color='yellow'>Script Disabled</font>") + "</div>";
				scriptIcon.style.display = "block";
			}
			else
			{
				scriptIcon.style.display = "none";
			}
		}
	}
	catch (e)
	{
		console.log(e);
	}
			
	if ( shouldAlert > 0  )
	{
		if ( window.opener.g_classicAlerts.huntRoster == true && g_isShowing == true )
		{
			var notify = window.opener.huntRosterNotify.value;
			if ( notify == "0" )
			{
				var media =  window.opener.huntRosterNotifyMedia.value;
				if ( media != "none" )
					window.opener.playAlertMediaFile( media );
			}
			else if ( notify == "1" )
			{
				window.opener.speakAlertString( window.opener.huntRosterNotifyWord.value );
			}
		}
		
		if (  g_rosterSettings.realtime == false && scriptExists && window.opener.g_crScript == 1)
		{
			try 
			{
				fs.writeFileSync(dirPath + "cr-alert.json", JSON.stringify(g_scriptReport,null,2) );
										
				var thisProc = dirPath + script;
				var cp = require('child_process');
				var child = cp.spawn(thisProc, [], {
						detached: true,
						cwd: dirPath.slice(0, -1),
						stdio: ['ignore', 'ignore', 'ignore']
				});
				child.unref();
	
			}
			catch (e)
			{
				conosle.log(e);
			}
			g_scriptReport = Object();
			
		}
		else
			g_scriptReport = Object();
	}
}

var g_day = 0;
function realtimeRoster()
{
	var now = timeNowSec();
	g_day = now / 86400;
	
	if ( g_rosterSettings.realtime == false )
		return;
	
	var timeCols = document.getElementsByClassName("timeCol");
	for ( var x in timeCols )
	{
		if ( typeof timeCols[x].id != 'undefined' )
		{
			var when = now - callRoster[timeCols[x].id.substr(2)].callObj.age;
			timeCols[x].innerHTML =  when.toDHMS();
		}

	}	
	var lifeCols = document.getElementsByClassName("lifeCol");
	for ( var x in lifeCols )
	{
		if ( typeof lifeCols[x].id != 'undefined' )
		{
			var when = now - callRoster[lifeCols[x].id.substr(2)].callObj.life;
			lifeCols[x].innerHTML =  when.toDHMS();
		}

	}	
	if ( g_rosterSettings.columns.Spot )
	{
		var spotCols = document.getElementsByClassName("spotCol");
		for ( var x in spotCols )
		{
			if ( typeof spotCols[x].id != 'undefined' )
			{
				spotCols[x].innerHTML =  getSpotString(callRoster[spotCols[x].id.substr(2)].callObj);
				if ( g_rosterSettings.onlySpot && spotCols[x].innerHTML == "" )
				{
					viewRoster();
					return;
				}
			}
		}
	}
}

function getSpotString( callObj )
{
	callObj.spot = window.opener.getSpotTime( callObj.DEcall +  callObj.mode  +  callObj.band +  callObj.grid );
	if ( callObj.spot > 0 )
	{
		when = timeNowSec() - callObj.spot;
		if ( when <= window.opener.g_receptionSettings.viewHistoryTimeSec )
			return parseInt(when).toDHMS();
	}

	return "";
}

var g_isShowing = true;

function openChatToCid( cid )
{
	window.opener.showMessaging(cid);
	
}

function initiateQso( thisHash )
{
	window.opener.initiateQso(thisHash);
}

function callLookup( thisHash, grid )
{
	var thisCall = callRoster[thisHash].DEcall;
	window.opener.startLookup(thisCall,grid);
}

function callingLookup( thisHash, grid )
{
	var thisCall = callRoster[thisHash].DXcall;
	window.opener.startLookup(thisCall,grid);
}

function callGenMessage( thisHash, grid )
{
	var thisCall = callRoster[thisHash].DEcall;
	var instance = callRoster[thisHash].callObj.instance;
		
	window.opener.startGenMessages(thisCall,grid, instance);
}

function callingGenMessage( thisHash, grid )
{
	var thisCall = callRoster[thisHash].DXcall;
	var instance = callRoster[thisHash].callObj.instance;
		
	window.opener.startGenMessages(thisCall,grid, instance);
}

function centerOn( grid )
{
	window.opener.centerOn(grid);
}


function instanceChange( what )
{
	window.opener.g_instances[what.id].crEnable = what.checked;
	window.opener.goProcessRoster();
}
function updateInstances()
{
	if ( window.opener.g_instancesIndex.length > 1 )
	{
		var instances = window.opener.g_instances;
		
		var worker = "";
		
		var keys = Object.keys(instances).sort();
		for ( var key in keys )
		{
			var inst = keys[key];
			var sp = inst.split(" - ");
			var shortInst = sp[sp.length-1].substring(0,18);
			var color = "blue";
			var bcolor ="yellow";
			
			if ( instances[inst].open == false )
			{
				color = "purple";
				bcolor = "grey";
			}
			worker += "<div style='margin:1px;padding-top:0px;padding-right:3px;padding-bottom:2px;display:inline-block;background-color:"+color+";border-style:outset;border-color:"+bcolor+";border-width:2px' class='roundBorder'><input type='checkbox' id='"+inst+"' onchange='instanceChange(this);' "+(instances[inst].crEnable?"checked":"")+" >"+shortInst+"</div>";
		}
		instancesDiv.innerHTML = worker;
		instancesDiv.style.display = "block";
	}
	else
		instancesDiv.style.display = "none";
	
}

var g_scriptReport = Object();

var g_RxDF = 0;
var g_TxDF = 0;
var g_bw = 0;

/*	g_RxDF = newMessage.RxDF;
	g_TxDF = newMessage.TxDF;
	g_bw = 0;
	if ( newMessage.TxMode == "FT8" )
		g_bw = 49;
	if ( newMessage.TxMode == "FT4" )
		g_bw = 89;*/
	
function processStatus( newMessage )
{
	if (newMessage.Transmitting == 0) // Not Transmitting
    {
        if (newMessage.Decoding == 1) // Decoding
        {
            txrxdec.style.backgroundColor = 'Blue';
            txrxdec.style.borderColor = 'Cyan';
            txrxdec.innerHTML = "DECODE";
        }
        else
        {
            txrxdec.style.backgroundColor = 'Green';
            txrxdec.style.borderColor = 'GreenYellow';
            txrxdec.innerHTML = "RECEIVE";
			
			//getOptimalTx();
			//g_slots.fill(0, 0, 4000);

        }
    }
    else
    {
        txrxdec.style.backgroundColor = 'Red';
        txrxdec.style.borderColor = 'Orange';
        txrxdec.innerHTML = "TRANSMIT";
    }

}


function setVisual()
{
	huntNeedTd.style.display = "none";
	huntStateTd.style.display = "none";
	huntDXCCsTd.style.display = "none";
	usCallsignInfoDiv.style.display = "none";


		
	if ( callsignNeed.value == "all" || callsignNeed.value == "hits")
	{

		huntingMatrixDiv.style.display = "block";
		huntNeedTd.style.display = "block";
		huntModeTd.style.display = "none";
	}
	else
	{
		huntingMatrixDiv.style.display = "none";
		huntModeTd.style.display = "block";
		
		if (   huntMode.value != "callsign" &&  huntMode.value != "usstate" &&  huntMode.value != "dxccs" )	
		{
			huntNeedTd.style.display = "block";
		}
		if ( huntMode.value == "usstate" )	
		{
			huntStateTd.style.display = "block";
			usCallsignInfoDiv.style.display = "block";
			usCallsignInfoDiv.innerHTML = "";
		}
		if ( huntMode.value == "usstates")
		{
			huntNeedTd.style.display = "block";
			usCallsignInfoDiv.style.display = "block";
			if ( window.opener.g_callsignLookups.ulsUseEnable == false )
				usCallsignInfoDiv.innerHTML = "US Callsign database must be enabled in settings";
			else
				usCallsignInfoDiv.innerHTML = "";
		}
		if ( huntMode.value == "dxccs" )
		{
			huntDXCCsTd.style.display = "block";
		}

	}
	if ( wantMaxDT.checked == true )
	{
		maxDT.style.display = "block";
		maxDTView.style.display = "block";
	}
	else
	{
		maxDT.style.display = "none";
		maxDTView.style.display = "none";
	}
	if ( wantMinDB.checked == true )
	{
		minDb.style.display = "block";
		minDbView.style.display = "block";
	}
	else
	{
		minDb.style.display = "none";
		minDbView.style.display = "none";
	}
	if ( wantMinFreq.checked == true )
	{
		minFreq.style.display = "block";
		minFreqView.style.display = "block";
	}
	else
	{
		minFreq.style.display = "none";
		minFreqView.style.display = "none";
	}
	if ( wantMaxFreq.checked == true )
	{
		maxFreq.style.display = "block";
		maxFreqView.style.display = "block";
	}
	else
	{
		maxFreq.style.display = "none";
		maxFreqView.style.display = "none";
	}
	
	if ( useRegex.checked == true )
	{
		callsignRegex.style.display = "inline-block";
	}
	else
	{
		callsignRegex.style.display = "none";
	}
	
	if ( window.opener.g_callsignLookups.lotwUseEnable == true )
	{
		usesLoTWDiv.style.display = "inline-block";
		if ( g_rosterSettings.usesLoTW == true )
		{
			maxLoTW.style.display = "inline-block";
			maxLoTWView.style.display = "inline-block";
		}
		else
		{
			maxLoTW.style.display = "none";
			maxLoTWView.style.display = "none";
		}
	}
	else
	{
		usesLoTWDiv.style.display = "none";
		maxLoTW.style.display = "none";
		maxLoTWView.style.display = "none";
	}		
	

	if ( window.opener.g_callsignLookups.eqslUseEnable == true )
		useseQSLDiv.style.display = "block";
	else
		useseQSLDiv.style.display = "none";
	
	if ( window.opener.g_callsignLookups.oqrsUseEnable == true )
		usesOQRSDiv.style.display = "block";
	else
		usesOQRSDiv.style.display = "none";
	
	if ( g_rosterSettings.columns.Spot == true )
		onlySpotDiv.style.display = "block";
	else
		onlySpotDiv.style.display = "none";
	
	if ( g_rosterSettings.callsign == "all" || g_rosterSettings.callsign == "hits")
		allOnlyNewDiv.style.display = "block";
	else
		allOnlyNewDiv.style.display = "none";
		
	resize();
}

function wantedChanged( element )
{
	g_rosterSettings.wanted[element.id] = element.checked;
	writeRosterSettings();
	
	g_scriptReport = Object();
	for ( var callHash in window.opener.g_callRoster )
	{
		window.opener.g_callRoster[callHash].callObj.alerted = false;
	}
	window.opener.goProcessRoster();	
}

function valuesChanged()
{

	setVisual();
	
	g_rosterSettings.callsign = callsignNeed.value;
	g_rosterSettings.hunting = huntMode.value;
	g_rosterSettings.huntNeed = huntNeed.value;
	g_rosterSettings.requireGrid = wantGrid.checked;
	
	g_rosterSettings.wantMaxDT   = wantMaxDT.checked  ;
	g_rosterSettings.wantMinDB   = wantMinDB.checked  ;
	g_rosterSettings.wantMinFreq = wantMinFreq.checked;
	g_rosterSettings.wantMaxFreq = wantMaxFreq.checked;
	
	maxDTView.innerHTML = g_rosterSettings.maxDT = maxDT.value;
	minDbView.innerHTML = g_rosterSettings.minDb = minDb.value;
	minFreqView.innerHTML = g_rosterSettings.minFreq = minFreq.value;
	maxFreqView.innerHTML = g_rosterSettings.maxFreq = maxFreq.value;
	g_rosterSettings.maxLoTW = maxLoTW.value;
	maxLoTWView.innerHTML = (g_rosterSettings.maxLoTW < 27)? Number(g_rosterSettings.maxLoTW).toYM() : "<b>&infin;</b>";
	g_rosterSettings.maxLoTW 	 = maxLoTW.value;
	g_rosterSettings.cqOnly 	 = cqOnly.checked;
	g_rosterSettings.noMyDxcc    = noMyDxcc.checked;
	g_rosterSettings.onlyMyDxcc  = onlyMyDxcc.checked;
	g_rosterSettings.noRoundUp 	 = noRoundUp.checked;
	g_rosterSettings.onlyRoundUp = onlyRoundUp.checked;
	g_rosterSettings.usesLoTW = usesLoTW.checked ;
	g_rosterSettings.useseQSL = useseQSL.checked ;
	g_rosterSettings.usesOQRS = usesOQRS.checked ;
	g_rosterSettings.onlySpot = onlySpot.checked ;
	g_rosterSettings.reference = referenceNeed.value;
	g_rosterSettings.allOnlyNew = allOnlyNew.checked;
	g_rosterSettings.useRegex = useRegex.checked;
	g_rosterSettings.callsignRegex = callsignRegex.value;
	
	writeRosterSettings();
	
	
	g_scriptReport = Object();
	for ( var callHash in window.opener.g_callRoster )
		window.opener.g_callRoster[callHash].callObj.alerted = false;
	window.opener.goProcessRoster();
}

function getBuffer(file_url, callback, flag, mode, port, cookie)
{
    var url = require('url');
    var http = require(mode);
    var fileBuffer = null;
    var options = null;
    if (cookie != null)
    {
        options = {
            host: url.parse(file_url).host,
            port: port,
            path: url.parse(file_url).path,
            headers:
            {
                'Cookie': cookie
            }
        };
    }
    else
    {
        options = {
            host: url.parse(file_url).host,
            port: port,
            path: url.parse(file_url).path
        };
    }
    http.get(options, function(res)
    {
        var fsize = res.headers['content-length'];
        var cookies = null;
        if (typeof res.headers['set-cookie'] != 'undefined')
            cookies = res.headers['set-cookie'];
        res.on('data', function(data)
        {
            if (fileBuffer == null)
                fileBuffer = data;
            else
                fileBuffer += data;
        }).on('end', function()
        {
            if (typeof callback === "function")
            {
                // Call it, since we have confirmed it is callable
                callback(fileBuffer, flag, cookies);
            }
        }).on('error', function() {});
    });
}

var g_currentUSCallsigns = null;
function callsignResult(buffer, flag)
{
    var rawData = JSON.parse(buffer);
	r_currentUSState = flag;
	
	g_currentUSCallsigns = Object();
	for ( key in rawData.c )
		g_currentUSCallsigns[rawData.c[key]] = true;
		
	usCallsignInfoDiv.innerHTML = window.opener.g_enums[r_currentUSState] + " loaded with "+ rawData.c.length +" entries, updated: " + window.opener.userTimeString(rawData.ts*1000);
	window.opener.goProcessRoster();
}

var r_currentUSState = "";
function stateChangedValue(what)
{
	if ( r_currentUSState != stateSelect.value && stateSelect.value != "" )
	{
		r_currentUSState = stateSelect.value;
		
		if ( window.opener.g_mapSettings.offlineMode == false )
		{
		    var callState = r_currentUSState.replace("CN-", "");;
		    usCallsignInfoDiv.innerHTML = "Loading "+window.opener.g_enums[r_currentUSState]+"  callsigns...";
	
			getBuffer("https://tagloomis.com/gt/callsigns/"+callState+".callsigns.json", callsignResult, r_currentUSState, "https", 443);
		}
		else
		{
			window.opener.goProcessRoster();
			r_currentUSState = "";
			g_currentUSCallsigns = null;
			stateSelect.value = "";
			usCallsignInfoDiv.innerHTML = "US State data only available online.";
			return;
		}
	}
	
	if ( stateSelect.value == "" )
	{
		r_currentUSState = "";
		g_currentUSCallsigns = null;
		usCallsignInfoDiv.innerHTML = "";
		window.opener.goProcessRoster();
	}
}

var r_currentDXCCs = -1;
function DXCCsChangedValue(what)
{
	r_currentDXCCs = DXCCsSelect.value;
	window.opener.goProcessRoster();
}



function initDXCCSelector()
{
	var items = Object.keys(window.opener.g_dxccToAltName).sort(function(a,b){return window.opener.g_dxccToAltName[a].localeCompare(window.opener.g_dxccToAltName[b])});
	var newSelect = document.getElementById("DXCCsSelect");
		
	for ( var i in items )
	{
		var key = items[i];
		
		if ( window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].geo != "deleted" )
		{
			var option = document.createElement("option");
			option.value = key;
			option.text = window.opener.g_dxccToAltName[key] + " (" + window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].pp  + ")";

			newSelect.appendChild(option);
		}
	}
	newSelect.oninput = DXCCsChangedValue;
}

var r_callsignManifest = null;
function manifestResult(buffer, flag)
{
    r_callsignManifest = JSON.parse(buffer);
	var newSelect = document.getElementById("stateSelect");
		
	for ( key in r_callsignManifest.cnt )
	{
		var option = document.createElement("option");
		if (  window.opener.g_enums[key] )
		{
			option.value = key;
			option.text = window.opener.g_enums[key];
		}
		else
		{
			option.value = "CN-"+key;
			option.text = window.opener.g_enums["CN-"+key];
		}
		newSelect.appendChild(option);
	}
	newSelect.oninput = stateChangedValue;
			
}

var r_jsonDir = "";
var g_menu = null;
var g_callMenu = null;
var g_ageMenu = null;
var g_callingMenu = null;

var g_targetHash = "";
var g_clearIgnores = null;
var g_clearIgnoresCall = null;

var g_dxccMenu = null;
var g_targetDxcc = -1;
var g_clearDxccIgnore = null;
var g_clearDxccIgnoreMainMenu = null;

var g_CQMenu = null;
var g_targetCQ = "";
var g_clearCQIgnore = null;
var g_clearCQIgnoreMainMenu = null;

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) 
{
	
}


function init()
{
	window.addEventListener("message", receiveMessage, false);

	lockNewWindows();
	
	r_jsonDir = window.opener.g_jsonDir;

	if ( window.opener.g_mapSettings.offlineMode == false )
		getBuffer("https://tagloomis.com/gt/callsigns/manifest.json", manifestResult, null, "https", 443);

	loadSettings();

	window.opener.setRosterSpot(g_rosterSettings.columns.Spot);
	
	for ( key in g_rosterSettings.wanted )
		document.getElementById(key).checked = g_rosterSettings.wanted[key];
	

	g_menu = new nw.Menu();
	// Bind a callback to item
	var item = new nw.MenuItem({
	 type: "normal", 
	  label: g_rosterSettings.controls? "Hide Controls":"Show Controls",
	  click: function() {
		if ( this.label == "Hide Controls" )
		{
			this.label = "Show Controls";
			rosterHead.style.display = "none";
			g_rosterSettings.controls = false;
		}
		else
		{
			this.label = "Hide Controls";
			rosterHead.style.display = "block";
			g_rosterSettings.controls = true;
		}
		localStorage.rosterSettings = JSON.stringify(g_rosterSettings);
		resize();
	  }
	});
	g_menu.append(item);
	
	rosterHead.style.display =  g_rosterSettings.controls?"block":"none";

	g_callMenu = new nw.Menu();

	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Lookup",
	  click: function() {
			callLookup(g_targetHash,"");
	  }
	});

	g_callMenu.append(item);
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Gen Msgs",
	  click: function() {
			callGenMessage(g_targetHash,"");
	  }
	});

	g_callMenu.append(item);
	
	item = new nw.MenuItem({ type: 'separator' });

	g_callMenu.append(item);
	
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Ignore Call",
	  click: function() {
			var thisCall = callRoster[g_targetHash].DEcall;
			g_blockedCalls[thisCall] = true;
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});

	g_callMenu.append(item);
	
	
	g_callingMenu = new nw.Menu();

	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Lookup",
	  click: function() {
			callingLookup(g_targetHash,"");
	  }
	});

	g_callingMenu.append(item);
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Gen Msgs",
	  click: function() {
			callingGenMessage(g_targetHash,"");
	  }
	});

	g_callingMenu.append(item);

	
	
	item = new nw.MenuItem({ type: 'separator' });
	g_menu.append(item);
	
	item = new nw.MenuItem({
	 type: "checkbox", 
	  label: "Realtime",
	  checked: g_rosterSettings.realtime,
	  click: function() {
		g_rosterSettings.realtime = this.checked;
		writeRosterSettings();
		window.opener.goProcessRoster();
	  }
	});
	g_menu.append(item);
	
	
	item = new nw.MenuItem({ type: 'separator' });
	g_menu.append(item);
	
	
	for ( var key in g_rosterSettings.columns )
	{
		var itemx = new nw.MenuItem({
		 type: "checkbox", 
		  label: key,
		  checked: g_rosterSettings.columns[key],
		  click: function() {
			g_rosterSettings.columns[this.label] = this.checked;
			if ( this.label == "Spot" )
				window.opener.setRosterSpot(g_rosterSettings.columns.Spot);
			writeRosterSettings();
			window.opener.goProcessRoster();
			resize();
		  }
		});
		
		g_menu.append(itemx);
	}

	item = new nw.MenuItem({ type: 'separator' });
	g_menu.append(item);

	
	g_clearIgnores = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear Call Ignore",
	  enabled: false,
	  click: function() {
			g_blockedCalls = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_menu.append(g_clearIgnores);
	
	g_clearIgnoresCall = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear Ignore",
	  enabled: false,
	  click: function() {
			g_blockedCalls = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_callMenu.append(g_clearIgnoresCall);


	g_CQMenu =  new nw.Menu();
	// TO CQ

	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Ignore CQ from DXCC",
	  click: function() {
			g_blockedCQ[callRoster[g_targetCQ].DXcall + " from " + window.opener.g_dxccToAltName[callRoster[g_targetCQ].callObj.dxcc] ] = true;
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	
	g_CQMenu.append(item);
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Ignore CQ from All",
	  click: function() {
			g_blockedCQ[callRoster[g_targetCQ].DXcall + " from All"]= true;
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	
	g_CQMenu.append(item);
	

	
	g_clearCQIgnoreMainMenu = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear CQ Ignore",
	  enabled: false,
	  click: function() {
			g_blockedCQ = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_menu.append(g_clearCQIgnoreMainMenu);
	
	g_clearCQIgnore = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear Ignore",
	  enabled: false,
	  click: function() {
			g_blockedCQ = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_CQMenu.append(g_clearCQIgnore);
	

	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Edit Ignores",
	  enabled: true,
	  click: function() {
			openIgnoreEdit();
	  }
	});
	g_CQMenu.append(item);
	
	//END TO CQ
	g_dxccMenu = new nw.Menu();
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Ignore DXCC",
	  click: function() {
			g_blockedDxcc[g_targetDxcc] = true;
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	
	g_dxccMenu.append(item);
	
	
	
	g_clearDxccIgnoreMainMenu = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear DXCC Ignore",
	  enabled: false,
	  click: function() {
			g_blockedDxcc = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_menu.append(g_clearDxccIgnoreMainMenu);
	
	g_clearDxccIgnore = new nw.MenuItem({
	 type: "normal", 
	  label: "Clear Ignore",
	  enabled: false,
	  click: function() {
			g_blockedDxcc = Object();
			storeBlocks();
			window.opener.goProcessRoster();
	  }
	});
	g_dxccMenu.append(g_clearDxccIgnore);
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Edit Ignores",
	  enabled: true,
	  click: function() {
			openIgnoreEdit();
	  }
	});
	g_menu.append(item);
	
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Edit Ignores",
	  enabled: true,
	  click: function() {
			openIgnoreEdit();
	  }
	});
	g_callMenu.append(item);
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: "Edit Ignores",
	  enabled: true,
	  click: function() {
			openIgnoreEdit();
	  }
	});
	g_dxccMenu.append(item);
	
	document.body.addEventListener('contextmenu', function(ev) { 
		ev.preventDefault();	
		if ( editView.style.display == "inline-block" )
			return false;
		var len = Object.keys(g_blockedCalls).length;
		if ( len > 0 )
		{
			g_clearIgnores.enabled = true;
			g_clearIgnores.label = "Clear Call Ignore" + ((len > 1 )?"s ("+len+")":"");
			g_clearIgnoresCall.enabled = true;
			g_clearIgnoresCall.label = "Clear Ignore" + ((len > 1 )?"s ("+len+")":"");
		}
		else
		{
			g_clearIgnores.label = "Clear Call Ignore";
			g_clearIgnores.enabled = false;
			g_clearIgnoresCall.label = "Clear Ignore";
			g_clearIgnoresCall.enabled = false;
		}
		len = Object.keys(g_blockedDxcc).length;
		if ( len > 0 )
		{
			g_clearDxccIgnoreMainMenu.enabled = true;
			g_clearDxccIgnoreMainMenu.label = "Clear DXCC Ignore" + ((len > 1 )?"s ("+len+")":"");
			g_clearDxccIgnore.enabled = true;
			g_clearDxccIgnore.label = "Clear Ignore" + ((len > 1 )?"s ("+len+")":"");
		}
		else
		{
			g_clearDxccIgnoreMainMenu.label = "Clear DXCC Ignore";
			g_clearDxccIgnoreMainMenu.enabled = false;
			g_clearDxccIgnore.label = "Clear Ignore";
			g_clearDxccIgnore.enabled = false;
		}
		len = Object.keys(g_blockedCQ).length;
		if ( len > 0 )
		{
			g_clearCQIgnoreMainMenu.enabled = true;
			g_clearCQIgnoreMainMenu.label = "Clear CQ Ignore" + ((len > 1 )?"s ("+len+")":"");
			g_clearCQIgnore.enabled = true;
			g_clearCQIgnore.label = "Clear Ignore" + ((len > 1 )?"s ("+len+")":"");
		}
		else
		{
			g_clearCQIgnoreMainMenu.label = "Clear CQ Ignore";
			g_clearCQIgnoreMainMenu.enabled = false;
			g_clearCQIgnore.label = "Clear Ignore";
			g_clearCQIgnore.enabled = false;
		}
		if ( typeof ev.target != 'undefined' && typeof ev.target.title != 'undefined' && ev.target.title == "Callsign" )
		{	
			g_targetHash =  ev.target.parentNode.id;
			g_callMenu.popup(ev.x, ev.y);
		}
		else if ( typeof ev.target != 'undefined' && typeof ev.target.title != 'undefined' && ev.target.title == "Calling" )
		{	
			g_targetHash =  ev.target.parentNode.id;
			g_callingMenu.popup(ev.x, ev.y);
		}
		else if ( typeof ev.target != 'undefined' && typeof ev.target.title != 'undefined' && ev.target.title == "CQ" )
		{	
			if (  callRoster[ev.target.parentNode.id].DXcall != "CQ" )
			{
				g_targetCQ =  ev.target.parentNode.id;
				g_CQMenu.popup(ev.x, ev.y);
			}
		}
		else if ( typeof ev.target != 'undefined' && typeof ev.target.title != 'undefined' && ev.target.title.startsWith("DXCC") )
		{	
			var dxcca = ev.target.title.split("(");
			var dxcc = parseInt(dxcca[1]);
			g_targetDxcc = dxcc;
			g_dxccMenu.popup(ev.x, ev.y);
		}
		else
		{
			g_menu.popup(ev.x, ev.y);
		}
		return false;
	});

	
	callsignNeed.value = g_rosterSettings.callsign;
	huntMode.value = g_rosterSettings.hunting;
	huntNeed.value = g_rosterSettings.huntNeed;
	wantGrid.checked = g_rosterSettings.requireGrid;
	
	wantMaxDT.checked =    g_rosterSettings.wantMaxDT;
	wantMinDB.checked =    g_rosterSettings.wantMinDB;
	wantMinFreq.checked =  g_rosterSettings.wantMinFreq;
	wantMaxFreq.checked =  g_rosterSettings.wantMaxFreq;
	
	maxDTView.innerHTML = maxDT.value = g_rosterSettings.maxDT;
	minDbView.innerHTML = minDb.value = g_rosterSettings.minDb;
	minFreqView.innerHTML = minFreq.value = g_rosterSettings.minFreq;
	maxFreqView.innerHTML = maxFreq.value = g_rosterSettings.maxFreq;

	maxLoTW.value = g_rosterSettings.maxLoTW;
	maxLoTWView.innerHTML = (maxLoTW.value < 27)? Number(maxLoTW.value).toYM() : "<b>&infin;</b>"; 
	
	cqOnly.checked = 		g_rosterSettings.cqOnly   ;
	noMyDxcc.checked =   	g_rosterSettings.noMyDxcc   ;
	onlyMyDxcc.checked = 	g_rosterSettings.onlyMyDxcc ;
	noRoundUp.checked =  	g_rosterSettings.noRoundUp  ;
	onlyRoundUp.checked =	g_rosterSettings.onlyRoundUp;
	usesLoTW.checked = g_rosterSettings.usesLoTW;
	useseQSL.checked = g_rosterSettings.useseQSL;
	onlySpot.checked = g_rosterSettings.onlySpot;
	usesOQRS.checked = g_rosterSettings.usesOQRS;
		
	referenceNeed.value = g_rosterSettings.reference;
	allOnlyNew.checked = g_rosterSettings.allOnlyNew;
	useRegex.checked = g_rosterSettings.useRegex;
	callsignRegex.value = g_rosterSettings.callsignRegex;
	
	setVisual();
    document.addEventListener('keydown', onMyKeyDown, false);
  
	initDXCCSelector();
  
    g_timerInterval = setInterval(realtimeRoster,1000);
	
	updateInstances();
	setFontSize();
	
	//g_slots.fill(0, 0, 4000);
}

function deleteCallsignIgnore( key )
{
	delete g_blockedCalls[key];
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();
	
}

function deleteDxccIgnore( key )
{
	delete g_blockedDxcc[key];
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();
}

function deleteCQIgnore( key )
{
	delete g_blockedCQ[key];
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();
}

function clearAllCallsignIgnores()
{
	g_blockedCalls = Object();
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();	
}


/*function getOptimalTx()
{

	var txSlot = Object();
	var count = 0;
	var startX = 0;
	var start = false;
	for ( var x=200; x <= 2950 ; x++ )
	{
		if ( start && g_slots[x] > 0  )
		{
			if ( count == g_bw+1 )
			{
				txSlot[startX] = count;
			}
			start = false;
			count = 0;
		}
		if ( g_slots[x] == 0 )
		{
			if ( !start )
			{
				startX = x;
				start = true;
			}
			count++;
			if ( count == g_bw+1 )
			{
				txSlot[startX] = count;
				start = false;
				count = 0;
			}
		}
	}
	if ( start && count >= g_bw+1 )
	{
		txSlot[startX] = count;
	}
	
	var closest = 10000;
	var found = 0;
	for ( freq in txSlot )
	{
		var dif = Math.abs(1500 - freq );
		if ( dif < closest )
		{
			found = freq;
			closest = dif;
		}
	}
	
	if ( closest != 10000 )
	{	
		slotDiv.innerHTML = "<div style='cursor:pointer' onclick='window.opener.setRxdf("+found+");'> Optimal Tx Offset: <font color='#F22' >" + found + " Hz</font></div>";
	}
	else
		slotDiv.innerHTML = "<div > Optimal Tx Offset: <font color='#FF0' >No Open</font></div>";
	

}*/

function clearAllDxccIgnores()
{
	g_blockedDxcc = Object();
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();	
}

function clearAllCQIgnores()
{
	g_blockedCQ = Object();
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();	
}

function closeEditIgnores()
{
	mainCallRoster.style.display = "block";
	editView.style.display = "none";
}

function openIgnoreEdit()
{
	mainCallRoster.style.display = "none";
	editView.style.display = "inline-block";
	var worker = "";
	var clearString = "<th>none</th>";
		 {
			if ( Object.keys(g_blockedCalls).length > 0 ) 
				clearString = "<th style='cursor:pointer;' onclick='clearAllCallsignIgnores()'>Clear All</th>";
			worker +=
			"<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" + ( window.innerHeight - 135)  +
			"px;'><table class='darkTable' align=center><tr><th align=left>Callsigns</th>"+clearString+"</tr>";
			Object.keys(g_blockedCalls).sort().forEach(function (key, i) {
				worker += "<tr><td align=left style='color:#FFFF00;' >" + key + "</td><td style='cursor:pointer;' onclick='deleteCallsignIgnore(\"" + key + "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";

			});
			worker += "</table></div>";
		}
	

		 {
			 clearString = "<th>none</th>";
			if ( Object.keys(g_blockedCQ).length > 0 ) 
				clearString = "<th style='cursor:pointer;' onclick='clearAllCQIgnores()'>Clear All</th>";
			worker +=
			"<div  style='margin:10px;padding:0px;vertical-align:top;display:inline-block;margin-right:2px;overflow:auto;overflow-x:hidden;height:" + ( window.innerHeight - 135)  +
			"px;'><table class='darkTable' align=center><tr><th align=left>CQ</th>"+clearString+"</tr>";
			Object.keys(g_blockedCQ).sort().forEach(function (key, i) {
				worker += "<tr><td align=left style='color:cyan;' >" + key + "</td><td style='cursor:pointer;' onclick='deleteCQIgnore(\"" + key + "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";

			});
			worker += "</table></div>";
		}
		
		
		{
			clearString = "<th>none</th>";
			if ( Object.keys(g_blockedDxcc).length > 0 ) 
				clearString = "<th style='cursor:pointer;' onclick='clearAllDxccIgnores()'>Clear All</th>";
			worker +=
			"<div  style='margin:10px;vertical-align:top;display:inline-block;overflow:auto;overflow-x:hidden;height:" +
			( window.innerHeight - 135) +
			"px;'><table class='darkTable' align=center><tr><th align=left>DXCCs</th>"+clearString+"</tr>";
			Object.keys(g_blockedDxcc).sort().forEach(function (key, i) {
				worker += "<tr><td align=left style='color:#FFA500' >" + window.opener.g_dxccToAltName[key] +
				" (" + window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[key]].pp  + ")</td><td style='cursor:pointer;' onclick='deleteDxccIgnore(\"" + key + "\")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px'></td></tr>";

			});
			worker += "</table></div>";
		}
		editTables.innerHTML = worker;

	
}

var g_timerInterval = null;

var g_styleFont = null;
function setFontSize()
{
	if ( g_styleFont )
	{
		g_styleFont.parentNode.removeChild(g_styleFont);
		g_styleFont = null;
	}
	g_styleFont = document.createElement('style');
	g_styleFont.innerHTML = "table, th, td, select {font-size: "+g_rosterSettings.fontSize+"px;}";
	document.body.appendChild(g_styleFont);
}

function reduceFont()
{
	if ( g_rosterSettings.fontSize > 10 )
	{
		g_rosterSettings.fontSize--;
		writeRosterSettings();
		setFontSize();
	}
}
function increaseFont()
{

	if ( g_rosterSettings.fontSize < 50 )
	{
		g_rosterSettings.fontSize++;
		writeRosterSettings();
		setFontSize();
	}
}

var g_hotKeys = { "NumpadSubtract" : reduceFont , "Minus" : reduceFont , "NumpadAdd":increaseFont, "Equal":increaseFont };

var g_regFocus = false;

function onMyKeyDown(event)
{
	if ( event.ctrlKey )
	{
		if ( event.code in g_hotKeys )
		{
			g_hotKeys[event.code]();
		}
	}
	else if ( !g_regFocus )
	{
		window.opener.onMyKeyDown(event);
	}
}

function checkForEnter( ele )
{
	if(event.key === 'Enter') {
        ele.blur();       
    }
}
function resize()
{
	rosterTable.style.height =  window.innerHeight - (masterTable.clientHeight+8) ;

	if ( typeof callTable != 'undefined' )
	    callTable.style.width =  (parseInt(window.innerWidth)-6)+"px";
		
	if ( editView.style.display == "inline-block" )
		openIgnoreEdit();

}
