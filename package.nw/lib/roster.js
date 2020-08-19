// GridTracker ©2020 N0TTL

var fs = require('fs');
var g_isShowing = false;
var callRoster = {};
var g_blockedCalls =  {};
var g_blockedCQ =  {};
var g_blockedDxcc =  {};
var g_scriptReport = {};
var g_worked =  {};
var g_confirmed =  {};
var g_modes = {};
var g_modes_phone = {};
var g_currentUSCallsigns = null;
var r_currentUSState = "";
var r_currentDXCCs = -1;
var r_callsignManifest = null;
var g_rosterSettings = {};
var g_day = 0;
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
var g_timerInterval = null;
var g_styleFont = null;
var g_hotKeys = { "NumpadSubtract":reduceFont , "Minus":reduceFont , "NumpadAdd":increaseFont, "Equal":increaseFont, "Numpad0":resetFont , "Digit0":resetFont };
var g_regFocus = false;
var g_awards = {};
var g_awardTypes = {};
var g_awardTracker = {};


var g_modeColors = {};
g_modeColors["FT4"] = '1111FF';
g_modeColors["FT8"] = '11FF11';
g_modeColors["JT4"] = 'EE1111';
g_modeColors["JT9"] = '7CFC00';
g_modeColors["JT65"] = 'E550E5';
g_modeColors["QRA64"] = 'FF00FF';
g_modeColors["MSK144"] = '4949FF';

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
	"noMsg":false,
	"noMsgValue": "CQ RU",
	"onlyMsg":false,
	"onlyMsgValue": "CQ FD",
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
		"huntCQz":false,
		"huntITUz":false,
		"huntState":false,
		"huntCounty": false,
		"huntCont": false,
		"huntPX":false,
		"huntQRZ":true,
		"huntOAMS":false
	},
	"columns":{
		"Calling":true,
		"Msg":false,
		"DXCC":true,
		"Flag":true,
		"State":true,
		"County":true,
		"Cont":true,
		"dB":true,
		"Freq":false,
		"DT":false,
		"Dist":false,
		"Azim":true,
		"CQz" : false,
		"ITUz" : false,
		"PX" : true,
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
	"compact": false,
	"fontSize":12,
	"settingProfiles":false,
	"lastSortIndex":6,
	"lastSortReverse":1
}

document.addEventListener("dragover", function (event)
{
	event.preventDefault();
});

document.addEventListener("drop", function (event)
{
	event.preventDefault();
});

window.addEventListener("message", receiveMessage, false);

if (typeof localStorage.blockedCQ == 'undefined')
{
	localStorage.blockedCQ = "{}";
}

if (typeof localStorage.awardTracker == 'undefined')
{
	localStorage.awardTracker = "{}";
	g_rosterSettings = {};
	writeRosterSettings();

}

g_awardTracker  = JSON.parse(localStorage.awardTracker);

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

function storeAwardTracker()
{
	localStorage.awardTracker = JSON.stringify(g_awardTracker);
}

function loadSettings()
{
	var readSettings = {};
	if ( typeof localStorage.rosterSettings != "undefined" )
	{
		readSettings = JSON.parse(localStorage.rosterSettings);
	}
	g_rosterSettings = deepmerge(g_defaultSettings, readSettings);
	
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

function myCallCompare(a, b) 
{
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
    if (a.spot.when > b.spot.when)
        return 1;
    if (a.spot.when < b.spot.when)
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
	if (a.px == null ) return 1;
	if (b.px == null ) return -1;
    if (a.px > b.px)
        return 1;
    if (a.px < b.px)
        return -1;
    return 0;
}

function myCntyCompare(a, b)
{
	if (a.cnty == null ) return 1;
	if (b.cnty == null ) return -1;
    if (a.cnty.substr(3) > b.cnty.substr(3))
        return 1;
    if (a.cnty.substr(3) < b.cnty.substr(3))
        return -1;
    return 0;
}

function myContCompare(a, b)
{
	if (a.cont == null ) return 1;
	if (b.cont == null ) return -1;
    if (a.cont > b.cont)
        return 1;
    if (a.cont < b.cont)
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

var r_sortFunction = [myCallCompare, myGridCompare, myDbCompare, myDTCompare, myFreqCompare, myDxccCompare, myTimeCompare,myDistanceCompare, myHeadingCompare, myStateCompare,myCQCompare, myWPXCompare, myLifeCompare, mySpotCompare, myGTCompare, myCntyCompare, myContCompare];

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

function hashMaker(band, mode)
{
	//"Current Band & Mode"
	if ( g_rosterSettings.reference == 0 || g_rosterSettings.reference == 6)
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

function processRoster(roster)
{
	callRoster = roster;
	viewRoster();
}

function viewRoster()
{
	var bands = Object();
	var modes = Object();
	
	var callMode = g_rosterSettings.callsign;
	var onlyHits = false;
	var isAwardTracker = false;
	if ( callMode == "hits" )
	{
		callMode = "all";
		onlyHits = true;
	}
	if ( referenceNeed.value == 6 )
	{
		callMode = "all";
		onlyHits = true;
		isAwardTracker = true;
		g_rosterSettings.huntNeed = "confirmed";
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
		
		if ( g_rosterSettings.noMsg == true  ) 
		{
			try 
			{
				if ( callRoster[callHash].callObj.msg.match(g_rosterSettings.noMsgValue) )
				{
					callRoster[callHash].tx = false;
					continue;
				}
			}
			catch (e)
			{
			}
		}
		if ( g_rosterSettings.onlyMsg == true  )
		{
			try 
			{
				if ( !(callRoster[callHash].callObj.msg.match(g_rosterSettings.onlyMsgValue)) )
				{
					callRoster[callHash].tx = false;
					continue;
				}
			}
			catch (e)
			{
			}
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
				if ( String(callRoster[callHash].callObj.px) == null )
				{
					callRoster[callHash].tx = false;
					continue;
				}
				var hash  = String(callRoster[callHash].callObj.px) + hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
				
				if (  g_rosterSettings.huntNeed == "worked" &  hash in g_worked.px  )
				{
						callRoster[callHash].tx = false;
						continue;
				}
				
				if ( g_rosterSettings.huntNeed == "confirmed" && hash in g_confirmed.px )
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
		if ( isAwardTracker )
		{
			var tx = false;
			var baseHash = hashMaker(callRoster[callHash].callObj.band , callRoster[callHash].callObj.mode);
			for ( var award in g_awardTracker )
			{
				if ( g_awardTracker[award].enable )
				{
					tx = testAward(award, callRoster[callHash].callObj, baseHash );
					if ( tx ) 
						break;
				}

			}
			callRoster[callHash].tx = tx;

		}
	}
	

	
	
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
			var testHash = call + workHash;
			var colorObject = Object();

			var callPointer = ( callRoster[callHash].callObj.CQ == true ? "cursor:pointer" : "" );
			var didWork = false;
			
			var callsign = "#FFFF00";
			var grid 	 = "#00FFFF";
			var calling  = "#90EE90";
			var dxcc	 = "#FFA500";
			var state 	 = "#90EE90";
			var cnty 	 = "#CCDD00";
			var cont 	 = "#00DDDD";
			var cqz 	 = "#DDDDDD";
			var ituz 	 = "#DDDDDD";
			var wpx      = "#FFFF00";
			
			hasGtPin = false;
			shouldAlert = false;
			var callsignBg , gridBg , callingBg , dxccBg , stateBg , cntyBg, contBg, cqzBg , ituzBg , wpxBg, gtBg;
			var callConf, gridConf , callingConf , dxccConf , stateConf , cntyConf, contConf, cqzConf , ituzConf , wpxConf;
			
			callsignBg = gridBg = callingBg = dxccBg = stateBg = cntyBg = contBg = cqzBg = ituzBg = wpxBg = gtBg = row;
			
			callConf = gridConf = callingConf = dxccConf = stateConf = cntyConf = contConf = cqzConf = ituzConf = wpxConf = "";

			if (  testHash in g_worked.call )
			{
				didWork = true;
						
				callConf = unconf + callsign + inversionAlpha + ";";
					
			}
		
			if ( call in window.opener.g_gtCallsigns && window.opener.g_gtCallsigns[call] in window.opener.g_gtFlagPins &&  window.opener.g_gtFlagPins[window.opener.g_gtCallsigns[call]].canmsg == true )
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
					
					if ( g_rosterSettings.huntNeed == "worked" &&  didWork )
					{
						callRoster[testHash].callObj.reason.push("call");
						callConf = unconf + callsign + inversionAlpha + ";"; 
					}
					if ( didWork && (g_rosterSettings.huntNeed == "confirmed" &&  !(testHash in g_confirmed.call) ) )
					{
						shouldAlert = true; 
						callRoster[testHash].callObj.reason.push("call");
						callConf = unconf + callsign + inversionAlpha + ";"; 
					}
					else if ( didWork && (g_rosterSettings.huntNeed == "confirmed" &&  (testHash in g_confirmed.call) ) )
					{
						callConf = "";
					}
					else if ( !didWork )
					{
						shouldAlert = true; 
						callConf = "";
						callsignBg = callsign + inversionAlpha; 
						callsign = bold; 
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
				if ( huntState.checked == true && window.opener.g_callsignLookups.ulsUseEnable == true )
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
				if ( huntCounty.checked == true && window.opener.g_callsignLookups.ulsUseEnable == true )
				{
					var finalDxcc = callRoster[callHash].callObj.dxcc;
					if ( callRoster[callHash].callObj.cnty && ( finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6) && callRoster[callHash].callObj.cnty.length > 0 )
					{

						var hash = callRoster[callHash].callObj.cnty + workHash;
						if ( (g_rosterSettings.huntNeed == "worked" && !(hash in g_worked.cnty)) || ( g_rosterSettings.huntNeed == "confirmed" && !(hash in g_confirmed.cnty)))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("uscnty");

							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.cnty) )
							{
								cntyConf = unconf + cnty + inversionAlpha + ";";
							}
							else
							{
								cntyBg = cnty + inversionAlpha ; 
								cnty = bold; 
							}
						}
					}
					
				}
				if ( huntCQz.checked == true )
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
				if ( huntITUz.checked == true )
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
				if ( huntPX.checked == true && callRoster[callHash].callObj.px)
				{
					var hash = String(callRoster[callHash].callObj.px) + workHash;
					if ( (g_rosterSettings.huntNeed == "worked" &&  !(hash in g_worked.px) ) ||
						 (g_rosterSettings.huntNeed == "confirmed" &&  !(hash in g_confirmed.px) ))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("wpx");
							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.px) )
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
				if ( huntCont.checked == true && callRoster[callHash].callObj.cont)
				{
					var hash = String(callRoster[callHash].callObj.cont) + workHash;
					if ( (g_rosterSettings.huntNeed == "worked" &&  !(hash in g_worked.cont) ) ||
						 (g_rosterSettings.huntNeed == "confirmed" &&  !(hash in g_confirmed.cont) ))
						{ 
							shouldAlert = true; 
							callRoster[callHash].callObj.reason.push("cont");
							if ( g_rosterSettings.huntNeed == "confirmed" &&  (hash in g_worked.cont) )
							{
								contConf = unconf + cont + inversionAlpha + ";";
							}
							else
							{
								contBg = cont + inversionAlpha ; 
								cont = bold; 
							}
						}
				}
			}

			
			if ( callRoster[callHash].callObj.DXcall == window.opener.myDEcall )
				{ callingBg = "#0000FF" + inversionAlpha; calling = "#FFFF00;text-shadow: 0px 0px 2px #FFFF00" }
			else if (  callRoster[callHash].callObj.CQ == true && g_rosterSettings.cqOnly == false )
				{ callingBg = calling + inversionAlpha; calling = bold;}
				
	
			colorObject.callsign = "style='"+callConf+"background-color:"+callsignBg+";color:"+callsign+";"+callPointer+"'" ;
			colorObject.grid 	 = "style='"+gridConf+"background-color:"+gridBg+";color:"+grid+";cursor:pointer'";
			colorObject.calling  = "style='"+callingConf+"background-color:"+callingBg+";color:"+calling+"'";
			colorObject.dxcc	 = "style='"+dxccConf+"background-color:"+dxccBg+";color:"+dxcc+"'";
			colorObject.state 	 = "style='"+stateConf+"background-color:"+stateBg+";color:"+state+"'";
			colorObject.cnty 	 = "style='"+cntyConf+"background-color:"+cntyBg+";color:"+cnty+"'";
			colorObject.cont 	 = "style='"+contConf+"background-color:"+contBg+";color:"+cont+"'";
			colorObject.cqz 	 = "style='"+cqzConf+"background-color:"+cqzBg+";color:"+cqz+"'";
			colorObject.ituz 	 = "style='"+ituzConf+"background-color:"+ituzBg+";color:"+ituz+"'";
			colorObject.px 	 = "style='"+wpxConf+"background-color:"+wpxBg+";color:"+wpx+"'";
			if ( didWork && shouldAlert )
				shouldAlert = false;
				
			callRoster[callHash].callObj.shouldAlert = shouldAlert;
			
			callRoster[callHash].callObj.style = colorObject;
			
			if ( g_rosterSettings.columns.Spot )
			{
				callRoster[callHash].callObj.spot = window.opener.getSpotTime( callRoster[callHash].callObj.DEcall +  callRoster[callHash].callObj.mode  +  callRoster[callHash].callObj.band +  callRoster[callHash].callObj.grid );
				if ( callRoster[callHash].callObj.spot == null )
				{
					callRoster[callHash].callObj.spot = { "when":0, "snr":0 };
				}
			}
			else
				callRoster[callHash].callObj.spot = { "when":0, "snr":0 };
			
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
	

		
	var worker = ""
	
	if ( g_rosterSettings.compact == false )
	{
		worker = "<table id='callTable' class='darkTable' align=left>";
		

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
		if ( g_rosterSettings.columns.State  )
			worker += "<th  style='cursor:pointer;' onclick='showRosterBox(9);'  >State</th>";
		if ( g_rosterSettings.columns.County  )
			worker += "<th  style='cursor:pointer;' onclick='showRosterBox(15);' >County</th>";
		if ( g_rosterSettings.columns.Cont )
			worker += "<th  style='cursor:pointer;' onclick='showRosterBox(16);' >Cont</th>";
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
		if ( g_rosterSettings.columns.CQz )
			worker += "<th>CQz</th>";
		if ( g_rosterSettings.columns.ITUz )
			worker += "<th>ITUz</th>";
		if ( g_rosterSettings.columns.PX )
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
	}
	else
	{
		worker = '<div id="buttonsDiv" style="margin-left:0px;white-space:normal;">';
	}
	
	var shouldAlert = 0;
	
	for (var x in newCallList)
	{
		if ( newCallList[x].shouldAlert == false && onlyHits == true && newCallList[x].qrz == false)
			continue;
		
		var spotString = "";
		var spotSnr = null;
		if (  g_rosterSettings.columns.Spot &&  newCallList[x].qrz == false )
		{
			spotString = getSpotString(newCallList[x]);
			if ( spotString != "" )
				spotSnr = newCallList[x].spot.snr;
			if ( g_rosterSettings.onlySpot && spotString == "")
				continue;
		}
		var grid = (newCallList[x].grid.length > 1 ? newCallList[x].grid.substr(0,4) : "-");

		var geo = window.opener.g_worldGeoData[window.opener.g_dxccToGeoData[newCallList[x].dxcc]];
		var cqzone = (grid in window.opener.g_gridToCQZone ? window.opener.g_gridToCQZone[grid].join(", ") : "-");
		var ituzone = (grid in window.opener.g_gridToITUZone ? window.opener.g_gridToITUZone[grid].join(", ") : "-");
		var thisCall = newCallList[x].DEcall;

		var thisClass = "";
		if ( thisCall.match("^[A-Z][0-9][A-Z](\/\w+)?$") )
			newCallList[x].style.callsign = "class='oneByOne'";
		if ( thisCall == window.opener.g_instances[newCallList[x].instance].status.DXcall )
		{
			if ( window.opener.g_instances[newCallList[x].instance].status.TxEnabled == 1 )
			{
				newCallList[x].style.callsign = "class='dxCalling'";
			}
			else
			{
				newCallList[x].style.callsign = "class='dxCaller'";
			}
		}
		
		if ( g_rosterSettings.compact == false )
		{
		


		
		worker += "<tr id='" + thisCall + newCallList[x].band+newCallList[x].mode + "'>";
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
		if ( g_rosterSettings.columns.State )
			worker += "<td align='center' "+newCallList[x].style.state+" >"+ (newCallList[x].state ? newCallList[x].state.substr(3) : "")+"</td>";
		if ( g_rosterSettings.columns.County )
			worker += "<td align='center' "+newCallList[x].style.cnty+" >"+ (newCallList[x].cnty ? toTitleCase(newCallList[x].cnty.substr(3)) : "")+"</td>";
		if ( g_rosterSettings.columns.Cont )
			worker += "<td align='center' "+newCallList[x].style.cont+" >"+ (newCallList[x].cont ?  newCallList[x].cont:"")+"</td>";
	
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
		
		if ( g_rosterSettings.columns.CQz )
			worker += "<td "+newCallList[x].style.cqz+">"+ newCallList[x].cqza.join(",")+"</td>";
		if  (  g_rosterSettings.columns.ITUz )
			worker += "<td "+newCallList[x].style.ituz+">"+ newCallList[x].ituza.join(",")+"</td>";
		
		if  (  g_rosterSettings.columns.PX )
			worker += "<td "+newCallList[x].style.px+">"+ (newCallList[x].px ? newCallList[x].px:'')+"</td>";
		
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
			worker += "<td style='color:#EEE;' class='spotCol' id='sp"+thisCall+newCallList[x].band+newCallList[x].mode+"' "+ (spotSnr?"title='"+spotSnr+"'" :"")+">"+  spotString +"</td>";	
		if ( g_rosterSettings.columns.Life )
			worker += "<td style='color:#EEE;' class='lifeCol' id='lm"+thisCall+newCallList[x].band+newCallList[x].mode+"'>"+  (timeNowSec() - newCallList[x].life).toDHMS() +"</td>";


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
			worker += "<td style='color:#EEE' class='timeCol' id='tm"+thisCall+newCallList[x].band+newCallList[x].mode+"'>"+  (timeNowSec() - newCallList[x].age).toDHMS() +"</td>";
		
		worker += "</tr>";
		}
		else
		{
			worker += "<div class='compact'  id='" + thisCall + newCallList[x].band+newCallList[x].mode + "'>";
		worker += "<div "+thisClass+" title='Callsign' " +newCallList[x].style.callsign + " onClick='initiateQso(\"" +
			 thisCall + newCallList[x].band+newCallList[x].mode + "\")'>" + thisCall.formatCallsign() + "</div></div>";
		}

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
	
	if ( g_rosterSettings.compact == false )
	{
		worker += "</table>";
		rosterTable.innerHTML = worker;	
		callTable.style.width =  (parseInt(window.innerWidth)-6)+"px";
	}
	else
	{
    	rosterTable.innerHTML = worker + "</div>";	
		buttonsDiv.style.width =  (parseInt(window.innerWidth)-6)+"px";
	}
    
	
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

	}
			
	if ( shouldAlert > 0  )
	{
		if ( window.opener.g_classicAlerts.huntRoster == true  )
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

function getSpotString(callObj)
{
	if ( callObj.spot &&  callObj.spot.when> 0 )
	{
		when = timeNowSec() - callObj.spot.when;
		if ( when <= window.opener.g_receptionSettings.viewHistoryTimeSec )
			return parseInt(when).toDHMS();
	}

	return "";
}

function openChatToCid(cid)
{
	window.opener.showMessaging(cid);
	
}

function initiateQso(thisHash)
{
	window.opener.initiateQso(thisHash);
}

function callLookup(thisHash, grid)
{
	var thisCall = callRoster[thisHash].DEcall;
	window.opener.startLookup(thisCall,grid);
}

function callingLookup(thisHash, grid)
{
	var thisCall = callRoster[thisHash].DXcall;
	window.opener.startLookup(thisCall,grid);
}

function callGenMessage(thisHash, grid)
{
	var thisCall = callRoster[thisHash].DEcall;
	var instance = callRoster[thisHash].callObj.instance;
		
	window.opener.startGenMessages(thisCall,grid, instance);
}

function callingGenMessage(thisHash, grid)
{
	var thisCall = callRoster[thisHash].DXcall;
	var instance = callRoster[thisHash].callObj.instance;
		
	window.opener.startGenMessages(thisCall,grid, instance);
}

function centerOn(grid)
{
	window.opener.centerOn(grid);
}

function instanceChange(what)
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
	
			
			if ( instances[inst].open == false )
			{
				color = "purple";
		
			}
			worker += "<div class='button'  style='margin:1px;padding:2px;display:inline-block;background-color:"+color+";;border-width:1px' ><input type='checkbox' id='"+inst+"' onchange='instanceChange(this);' "+(instances[inst].crEnable?"checked":"")+" >"+shortInst+"</div>";
		}
		instancesDiv.innerHTML = worker;
		instancesDiv.style.display = "block";
	}
	else
		instancesDiv.style.display = "none";
	
}

function processStatus(newMessage)
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
        }
    }
    else
    {
        txrxdec.style.backgroundColor = 'Red';
        txrxdec.style.borderColor = 'Orange';
        txrxdec.innerHTML = "TRANSMIT";
    }

}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
		

function newOption(value, text) {
	if (typeof text == 'undefined')
		text = value;
	var option = document.createElement("option");
	option.value = value;
	option.text = text;
	return option;
}

function createSelectOptions( selectElementString, selectNameDefault, forObject, altName = null, defaultValue = null, checkSponsor = null )
{
	var selector = document.getElementById(selectElementString);
	selector.innerHTML = '';

	var option = document.createElement("option");
	option.value = defaultValue;
	option.text = selectNameDefault;
	option.selected = true;
	option.disabled = true;
	option.style.display = "none";
	selector.appendChild(option);
	
	var obj = null;
	if ( forObject )
	{
		obj = Object.keys(forObject).sort();
	}
	for ( var k in obj )
	{
		var opt = obj[k];
		var option = document.createElement("option");
		option.value = opt;
		option.text = (altName? forObject[opt][altName]:opt);
		if ( checkSponsor && (opt + "-" + checkSponsor in g_awardTracker ) )
			option.disabled = true;
				
		selector.appendChild(option);
	}
}

function awardSponsorChanged()
{
	awardName.style.display = "";
	createSelectOptions("awardName","Select Award", g_awards[awardSponsor.value].awards, "name", null, awardSponsor.value);
}

function awardNameChanged()
{
	var awardToAdd = newAwardTrackerObject(awardSponsor.value,awardName.value, true);

	var hash = awardToAdd.name + "-"	+ awardToAdd.sponsor;
	if ( !(hash in g_awardTracker) )
	{
		g_awardTracker[hash] = awardToAdd;
		storeAwardTracker();
		processAward( hash );
		updateAwardList(hash);
		window.opener.goProcessRoster();
	}
	createSelectOptions("awardName","Select Award", g_awards[awardToAdd.sponsor].awards, "name", null, awardToAdd.sponsor);

}



function updateAwardList( target = null )
{
	var worker = '<table id="awardTable" class="awardTableCSS" style="padding:0;margin:0;margin-top:-5px;" >';
		worker += "<tr style='font-size:smaller'>";
		worker += "<td align='left'>";
		worker += "Name";
		worker += "</td>";
		worker += "<td>";
		worker += "Award";
		worker += "</td>";
		worker += "<td>";
		worker += "Track";
		worker += "</td>";
		worker += "<td>";
		worker += "";
		worker += "</td>";
		worker += "</tr>";
	
		worker += "</table>";
		
	awardWantedDiv.innerHTML = worker;
	
	var keys = Object.keys(g_awardTracker).sort();		
			
	for ( var key in keys )
	{
		var award = g_awardTracker[keys[key]];
		var rule = g_awards[award.sponsor].awards[award.name].rule;
		var row = awardTable.insertRow();
		row.id = keys[key];
		var baseAward = false;
		var baseCount = 0;
		
		var endorseCount = 0;
		var endorseTotal = 0;
		var allEndorse = false;
		
		var tooltip = g_awards[award.sponsor].awards[award.name].tooltip+ " (" + g_awards[award.sponsor].sponsor + ")\n";
		tooltip += toTitleCase(award.test.look) + " QSO\n";
		for ( var mode in award.comp.counts )
		{
			tooltip +=  mode + "\n";
			for ( var count  in award.comp.counts[mode] )
			{
				endorseTotal++;
				if ( award.comp.counts[mode][count].per == 100 )
				{
					baseAward = true;
					endorseCount++;
				}
				if ( award.comp.counts[mode][count].num > baseCount )
					baseCount = award.comp.counts[mode][count].num;
				
				tooltip += "\t" + award.comp.counts[mode][count].num + "/" +count + " (" +award.comp.counts[mode][count].per+"%)\n";
				var wrk = "";
				if ( Object.keys(award.comp.endorse).length > 0 )
				{
					for ( var band in award.comp.endorse[mode] )
					{
						endorseTotal++;
						if ( award.comp.endorse[mode][band][count] == true )
						{
							endorseCount++;
							wrk += band + " ";
						}
					}

				}
				if ( wrk.length > 0 )
				{
					tooltip += "\t\t" + wrk + "\n";
				}
			}
			
		}
		if ( baseCount > 0 && endorseCount == endorseTotal )
			allEndorse = true;
		
		var cell = createCellHtml(row, "<p style='font-size:smaller;'>" +  g_awards[award.sponsor].awards[award.name].tooltip +" - "+award.sponsor );
		cell.style.textAlign = "left";
		cell.style.color = "lightblue";
				
		createCellHtml(row, "<p style='margin:0;' >" + (allEndorse? "<img src='./img/award-trophy.svg' height='18px'>":baseAward?"<img src='./img/award-medal.svg' height='16px'>":baseCount>0?"<img src='./img/award-tally.svg' height='16px'>":"<img src='./img/award-empty.svg' height='14px'>"),  tooltip);
		createCell(row, "enable" , award.enable, award.enable, "Toggle Tracking",  true);
		createCellHtml(row, "<p title='Remove Tracker' onclick='deleteAwardTracker(this)' style='margin:0;cursor:pointer;'><img src='./img/award-delete.svg' height='16px'>");
	}

}

function deleteAwardTracker( sender )
{
	var id = sender.parentNode.parentNode.id;
	delete g_awardTracker[id];
	storeAwardTracker();
	resetAwardAdd();
	updateAwardList();
	window.opener.goProcessRoster();
}

function awardCheckboxChanged( sender )
{
	var awardId = sender.target.parentNode.parentNode.id;
	g_awardTracker[sender.target.parentNode.parentNode.id][sender.target.name] = sender.target.checked;
	storeAwardTracker();
	window.opener.goProcessRoster();
}

function awardValueChanged( sender )
{
	var awardId = sender.target.parentNode.parentNode.id;
	g_awardTracker[sender.target.parentNode.parentNode.id][sender.target.name] = sender.target.value;
	storeAwardTracker();
	window.opener.goProcessRoster();
}

function createCell( row, target, value, data = null, title = null,  checkbox = false)
{
	var cell = row.insertCell();
	if ( data == null )
		cell.innerHTML = value;
	if ( title )
		cell.title = title;
	if ( checkbox )
	{
		var x = document.createElement("INPUT");
		x.setAttribute("type", "checkbox");
		x.checked = value;
		x.name = target;
		x.addEventListener("change", awardCheckboxChanged);
		cell.appendChild(x);
	}
	else if ( data )
	{
		cell.appendChild( createAwardSelector( cell, target, value, data));
	}
	return cell;
}

function createCellHtml( row, html, title = null)
{
	var cell = row.insertCell();
	cell.innerHTML = html;
	if ( title )
		cell.title = title;
	
	return cell;
}

function createAwardSelector( cell , target, value, forObject )
{
	var selector = document.createElement("select");
	selector.name = target;
	selector.value = value;
	selector.disabled = (forObject.length == 1 ? true : false);
	selector.style.margin = "0px";
	selector.style.padding = "1px";
	if ( selector.disabled )
		selector.style.cursor = "auto";
	selector.addEventListener("change", awardValueChanged);
	for ( var opt in forObject )
	{
		var option = document.createElement("option");
		option.value = forObject[opt];
		if ( option.value  == "Phone" || option.value == "CW" )
			option.disabled = true;
		option.text = forObject[opt];
		selector.appendChild(option);
	}
	return selector;
}

function resetAwardAdd()
{
	awardName.style.display = "none";
	createSelectOptions("awardName","Select Award", null);
	createSelectOptions("awardSponsor","Select Sponsor", g_awards,"sponsor");
}

function openAwardPopup()
{
	awardHunterDiv.style.zIndex = 100;
	resetAwardAdd();

}

function closeAwardPopup()
{
	awardHunterDiv.style.zIndex = -1;
	resetAwardAdd();
}



function setVisual()
{
	huntNeedTd.style.display = "none";
	huntStateTd.style.display = "none";
	huntDXCCsTd.style.display = "none";

	// Award Hunter
	if ( referenceNeed.value == 6 )
	{
		/*for ( key in g_rosterSettings.wanted )
		{
			document.getElementById(key).checked = true;
			var t = key.replace("hunt","");
			if ( t in g_rosterSettings.columns )
				g_rosterSettings.columns[t] = true;
		}*/
	
		huntingTr.style.display = "none";
		callsignsTr.style.display = "none";
		huntingMatrixDiv.style.display = "none";
		awardHunterTr.style.display = "";
		awardWantedDiv.style.display = "";
		updateAwardList();
	}
	else
	{
		for ( key in g_rosterSettings.wanted )
		{
			if ( document.getElementById(key) )
				document.getElementById(key).checked = g_rosterSettings.wanted[key];
		}
		
		awardHunterTr.style.display = "none";
		awardWantedDiv.style.display = "none";
		huntingTr.style.display = "";
		callsignsTr.style.display = "";
		closeAwardPopup();
		if ( callsignNeed.value == "all" || callsignNeed.value == "hits")
		{

			huntingMatrixDiv.style.display = "";
			huntNeedTd.style.display = "block";
			huntModeTd.style.display = "none";
		}
		else
		{
			huntingMatrixDiv.style.display = "";
			huntModeTd.style.display = "block";
			
			if (   huntMode.value != "callsign" &&  huntMode.value != "usstate" &&  huntMode.value != "dxccs" )	
			{
				huntNeedTd.style.display = "block";
			}
			if ( huntMode.value == "usstate" )	
			{
				huntStateTd.style.display = "block";
			}
			if ( huntMode.value == "usstates")
			{
				huntNeedTd.style.display = "block";
			}
			if ( huntMode.value == "dxccs" )
			{
				huntDXCCsTd.style.display = "block";
			}

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

function wantedChanged(element)
{	
	g_rosterSettings.wanted[element.id] = element.checked;
	
	if ( element.checked == true )
	{
		var t = element.id.replace("hunt","");

		if ( t in g_rosterSettings.columns )
		{
			g_rosterSettings.columns[t] = true;
		}
	}
			
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
	if ( noMsg.checked && onlyMsg.checked && noMsgValue.value == onlyMsgValue.value)
	{
		if ( g_rosterSettings.noMsg )
			noMsg.checked = false;
		else 
			onlyMsg.checked = false;
	}
	g_rosterSettings.noMsg 	 = noMsg.checked;
	g_rosterSettings.onlyMsg = onlyMsg.checked;
	g_rosterSettings.noMsgValue 	 = noMsgValue.value;
	g_rosterSettings.onlyMsgValue = onlyMsgValue.value;
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

function callsignResult(buffer, flag)
{
    var rawData = JSON.parse(buffer);
	r_currentUSState = flag;
	
	g_currentUSCallsigns = Object();
	for ( key in rawData.c )
		g_currentUSCallsigns[rawData.c[key]] = true;
		
	window.opener.goProcessRoster();
}

function stateChangedValue(what)
{
	if ( r_currentUSState != stateSelect.value && stateSelect.value != "" )
	{
		r_currentUSState = stateSelect.value;
		
		if ( window.opener.g_mapSettings.offlineMode == false )
		{
		    var callState = r_currentUSState.replace("CN-", "");;
			getBuffer("https://tagloomis.com/gt/callsigns/"+callState+".callsigns.json", callsignResult, r_currentUSState, "https", 443);
		}
		else
		{
			window.opener.goProcessRoster();
			r_currentUSState = "";
			g_currentUSCallsigns = null;
			stateSelect.value = "";
	
			return;
		}
	}
	
	if ( stateSelect.value == "" )
	{
		r_currentUSState = "";
		g_currentUSCallsigns = null;

		window.opener.goProcessRoster();
	}
}

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

function receiveMessage(event) 
{
	
}

var g_tracker = {};

function updateWorked()
{
	g_worked = window.opener.g_tracker.worked;
	g_confirmed = window.opener.g_tracker.confirmed;
	g_modes = window.opener.g_modes;
	g_modes_phone = window.opener.g_modes_phone;
	g_tracker = window.opener.g_tracker;
	
	processAllAwardTrackers();
}

function deleteCallsignIgnore(key)
{
	delete g_blockedCalls[key];
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();
	
}

function deleteDxccIgnore(key)
{
	delete g_blockedDxcc[key];
	storeBlocks();
	openIgnoreEdit();
	window.opener.goProcessRoster();
}

function deleteCQIgnore(key)
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

function setFontSize()
{
	if ( g_styleFont )
	{
		g_styleFont.parentNode.removeChild(g_styleFont);
		g_styleFont = null;
	}
	g_styleFont = document.createElement('style');
	g_styleFont.innerHTML = "table, th, td, select, .compact {font-size: "+g_rosterSettings.fontSize+"px;}";
	document.body.appendChild(g_styleFont);
	resize();
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

function resetFont()
{

	g_rosterSettings.fontSize = g_defaultSettings.fontSize;
	writeRosterSettings();
	setFontSize();
}

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

function checkForEnter(ele)
{
	if(event.key === 'Enter') {
        ele.blur();       
    }
}

function resize()
{
	rosterTable.style.height =  window.innerHeight - (rosterHead.clientHeight+8) ;
	awardWantedDiv.style.height = exceptionDiv.clientHeight;

	if ( typeof callTable != 'undefined' )
	    callTable.style.width =  (parseInt(window.innerWidth)-6)+"px";
		
	if ( editView.style.display == "inline-block" )
		openIgnoreEdit();

	window.opener.goProcessRoster();
}

function init()
{
	loadAwardJson();
	
	updateWorked();
	
	//addAllAwards();
	
	window.addEventListener("message", receiveMessage, false);

	lockNewWindows();
	
	r_jsonDir = window.opener.g_jsonDir;

	if ( window.opener.g_mapSettings.offlineMode == false )
		getBuffer("https://tagloomis.com/gt/callsigns/manifest.json", manifestResult, null, "https", 443);

	loadSettings();

	window.opener.setRosterSpot(g_rosterSettings.columns.Spot);
	
	for ( key in g_rosterSettings.wanted )
	{
		if ( document.getElementById(key) )
			document.getElementById(key).checked = g_rosterSettings.wanted[key];
	}
	

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
	
	item = new nw.MenuItem({
	 type: "normal", 
	  label: g_rosterSettings.compact? "Roster Mode":"Compact Mode",
	  click: function() {
		if ( this.label == "Compact Mode" )
		{
			this.label = "Roster Mode";
			g_rosterSettings.compact = true;
		}
		else
		{
			this.label = "Compact Mode";
			g_rosterSettings.compact = false;
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

	
	noMsg.checked		= g_rosterSettings.noMsg;
	onlyMsg.checked		= g_rosterSettings.onlyMsg;
	noMsgValue.value	= g_rosterSettings.noMsgValue;
	onlyMsgValue.value	= g_rosterSettings.onlyMsgValue;
	
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

}

function getTypeFromMode(mode)
{
	if (mode in g_modes)
	{
		if ( g_modes[mode] == true )
			return "Digital";
		else if ( g_modes_phone[mode] == true )
			return "Phone";

	}
	return "";
}

function testAward( awardName, obj, baseHash )
{
	var rule = g_awardTracker[awardName].rule;
	var test = g_awardTracker[awardName].test;
	
	if ( obj.dxcc < 1 )
		return false;
	
	if ( test.dxcc && rule.dxcc.indexOf(obj.dxcc) == -1 )
		return false;

	if ( test.mode && rule.mode.indexOf(obj.mode) == -1 )
		return false;
	
	if ( test.band && rule.band.indexOf(obj.band) == -1 )
		return false;
	
	if ( test.DEcall && rule.call.indexOf(obj.DEcall) == -1 )
		return false;

	if ( test.cont && rule.cont.indexOf(obj.cont) == -1 )
		return false;
	
	if ( test.prop && rule.propMode != obj.propMode )
		return false;
	
	if ( test.sat && rule.satName.indexOf(obj.satName) == -1)
		return false;

	return g_awardTypes[rule.type].test(g_awardTracker[awardName], obj, baseHash);
	
}
function processAward( awardName )
{
	var award = g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name];
	g_awardTracker[awardName].rule = award.rule;
	var test = g_awardTracker[awardName].test = {};
	var mode = award.rule.mode.slice();
	
	var Index = mode.indexOf("Mixed");
	if ( Index > -1 )
		mode.splice(Index,1);

	Index = mode.indexOf("Digital");
	if ( Index > -1 )
		mode.splice(Index,1);

	Index = mode.indexOf("Phone");
	if ( Index > -1 )
		mode.splice(Index,1);
	
	test.mode  = (mode.length > 0 );
	
	test.confirmed = ( ("qsl_req" in g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule)? 
				g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule.qsl_req == "confirmed" : 
				g_awards[g_awardTracker[awardName].sponsor].qsl_req == "confirmed");
				
	test.look = ( ("qsl_req" in g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule)? 
				g_awards[g_awardTracker[awardName].sponsor].awards[g_awardTracker[awardName].name].rule.qsl_req  : 
				g_awards[g_awardTracker[awardName].sponsor].qsl_req );
				
	test.DEcall = ( "call" in award.rule);
	test.band = ( "band" in award.rule && award.rule.band.indexOf("Mixed") == -1 );
	test.dxcc = ( "dxcc" in award.rule );
	test.cont = ( "cont" in award.rule );
	test.prop = ( "propMode" in award.rule );
	test.sat  = ( "satName" in award.rule );
	
	g_awardTracker[awardName].stat = {};
	
	for (var i in window.opener.g_QSOhash) 
	{
		var obj = window.opener.g_QSOhash[i];

		if ( test.confirmed &&  !obj.confirmed )
				continue;
		
		if ( obj.dxcc < 1 )
			continue;
		
		if ( test.dxcc && award.rule.dxcc.indexOf(obj.dxcc) == -1 )
			continue;

		if ( test.mode && award.rule.mode.indexOf(obj.mode) == -1 )
			continue;
		
		if ( test.band && award.rule.band.indexOf(obj.band) == -1 )
			continue;
		
		if ( test.DEcall && award.rule.call.indexOf(obj.DEcall) == -1 )
			continue;

		if ( test.cont && award.rule.cont.indexOf(obj.cont) == -1 )
			continue;
		
		if ( test.prop && award.rule.propMode != obj.propMode )
			continue;
		
		if ( test.sat && award.rule.satName.indexOf(obj.satName) == -1)
			continue;
	
		g_awardTypes[award.rule.type].score(g_awardTracker[awardName], obj);
	}
	
	g_awardTracker[awardName].comp = g_awardTypes[award.rule.type].compile( g_awardTracker[awardName], g_awardTracker[awardName].stat);
	g_awardTracker[awardName].stat = {};
}

function newAwardCountObject() 
{
	var statCountObject = {};
	
	statCountObject.bands = {};
	statCountObject.bands["Mixed"] = {};
	statCountObject.bands["Digital"] = {};
	statCountObject.bands["Phone"] = {};
	statCountObject.modes = {};
	statCountObject.modes["Mixed"] = {};
	statCountObject.modes["Digital"] = {};
	statCountObject.modes["Phone"] = {};
	statCountObject.unique = null;
	return statCountObject;
}



function workAwardObject( obj, band, mode, isDigital , isPhone, unique = null )
{
	obj.bands["Mixed"][band] = ~~obj.bands["Mixed"][band] + 1;
	if ( !(mode in obj.bands) )
		obj.bands[mode] = {};
	obj.bands[mode][band] = ~~obj.bands[mode][band] + 1;
	obj.modes["Mixed"][mode] = ~~obj.modes["Mixed"][mode] + 1;
	
	if ( isDigital  )
	{
		obj.bands["Digital"][band] = ~~obj.bands["Digital"][band] + 1;
		obj.modes["Digital"][mode] = ~~obj.modes["Digital"][mode] + 1;
	}
	if ( isPhone )
	{

		obj.bands["Phone"][band] = ~~obj.bands["Phone"][band] + 1;
		obj.modes["Phone"][mode] = ~~obj.modes["Phone"][mode] + 1;
	}
	if ( unique )
	{

		if ( obj.unique == null )
			obj.unique = {};
		if ( !(unique in obj.unique) )
			obj.unique[unique] =  newAwardCountObject();
		workAwardObject( obj.unique[unique], band, mode, isDigital , isPhone );
	}
	return true;
}

function buildAwardTypeHandlers()
{
	g_awardTypes = 
			 {
				"IOTA": { "name": "Islands On The Air"},
				"call": { "name": "Callsign"},
				"callarea": { "name": "Call Area"},
				"calls2dxcc": { "name": "Stations per DXCC"},
				"cnty": { "name": "County"},
				"cont": { "name": "Continents"},
				"cont5": { "name": "5 Continents"},
				"cont52band": { "name": "5 Continents per Band"},
				"cqz": { "name": "CQ Zone"},
				"dxcc": { "name": "DXCC"},
				"grids": { "name": "Grids"},
				"numsfx": { "name": "Call Area + Suffix"},
				"px": { "name": "Prefix"},
				"pxa": { "name": "Prefixes"},
				"pxplus": { "name": "Special Calls"},
				"sfx": { "name": "Suffix"},
				"states": { "name": "States"},
				"cont2band": { "name" : "Continents per Band"},
				"calls2band": { "name" : "Stations per Band"},
				"dxcc2band": { "name" : "DXCC per Band"},
				"states2band": { "name" : "States per Band"}
			 };
	
	g_awardTypes["IOTA"].score 		= scoreAIOTA;
	g_awardTypes["call"].score 		= scoreAcall; 	
	g_awardTypes["callarea"].score 	= scoreAcallarea;
	g_awardTypes["calls2dxcc"].score= scoreAcalls2dxcc; 	
	g_awardTypes["cnty"].score 		= scoreAcnty;  	
	g_awardTypes["cont"].score		= scoreAcont; 	
	g_awardTypes["cont5"].score 	= scoreAcont5;  
	g_awardTypes["cont52band"].score= scoreAcont52band;  
	g_awardTypes["cqz"].score 		= scoreAcqz;  	
	g_awardTypes["dxcc"].score 		= scoreAdxcc; 	
	g_awardTypes["grids"].score 	= scoreAgrids;  	
	g_awardTypes["numsfx"].score 	= scoreAnumsfx; 	
	g_awardTypes["px"].score 		= scoreApx;  
	g_awardTypes["pxa"].score 		= scoreApxa;  	
	g_awardTypes["pxplus"].score 	= scoreApxplus; 
	g_awardTypes["sfx"].score 		= scoreAsfx;  	
	g_awardTypes["states"].score 	= scoreAstates; 	
	g_awardTypes["cont2band"].score = scoreAcont2band; 	
	g_awardTypes["calls2band"].score = scoreAcalls2band; 
	g_awardTypes["dxcc2band"].score = scoreAdxcc2band; 
	g_awardTypes["states2band"].score = scoreAstates2band; 
	
	g_awardTypes["IOTA"].test 		= testAIOTA;
	g_awardTypes["call"].test 		= testAcall; 	
	g_awardTypes["callarea"].test 	= testAcallarea;
	g_awardTypes["calls2dxcc"].test	= testAcalls2dxcc; 	
	g_awardTypes["cnty"].test 		= testAcnty;  	
	g_awardTypes["cont"].test		= testAcont; 
    g_awardTypes["cont5"].test 		= testAcont5;	
	g_awardTypes["cont52band"].test = testAcont52band;  
	g_awardTypes["cqz"].test 		= testAcqz;  	
	g_awardTypes["dxcc"].test 		= testAdxcc; 	
	g_awardTypes["grids"].test 		= testAgrids;  	
	g_awardTypes["numsfx"].test 	= testAnumsfx; 	
	g_awardTypes["px"].test 		= testApx;  
	g_awardTypes["pxa"].test 		= testApxa;  	
	g_awardTypes["pxplus"].test 	= testApxplus; 
	g_awardTypes["sfx"].test 		= testAsfx;  	
	g_awardTypes["states"].test 	= testAstates;
	g_awardTypes["cont2band"].test 	= testAcont2band; 
	g_awardTypes["calls2band"].test = testAcalls2band; 
	g_awardTypes["dxcc2band"].test = testAdxcc2band; 
	g_awardTypes["states2band"].test = testAstates2band; 
	
	g_awardTypes["IOTA"].compile 		= singleCompile;
	g_awardTypes["call"].compile 		= singleCompile; 	
	g_awardTypes["callarea"].compile 	= singleCompile;
	g_awardTypes["calls2dxcc"].compile	= doubleCompile; 	
	g_awardTypes["cnty"].compile 		= singleCompile;  	
	g_awardTypes["cont"].compile		= singleCompile; 
	g_awardTypes["cont5"].compile 		= singleCompile;	
	g_awardTypes["cont52band"].compile 	= doubleCompile;  
	g_awardTypes["cqz"].compile 		= singleCompile;  	
	g_awardTypes["dxcc"].compile 		= singleCompile; 	
	g_awardTypes["grids"].compile 		= singleCompile;  	
	g_awardTypes["numsfx"].compile 		= singleCompile; 	
	g_awardTypes["px"].compile 			= singleCompile;  
	g_awardTypes["pxa"].compile 		= singleCompile;  	
	g_awardTypes["pxplus"].compile 		= singleCompile; 
	g_awardTypes["sfx"].compile 		= singleCompile;  	
	g_awardTypes["states"].compile 		= singleCompile;
	g_awardTypes["cont2band"].compile	= doubleCompile; 	
	g_awardTypes["calls2band"].compile	= doubleCompile; 	
	g_awardTypes["dxcc2band"].compile	= doubleCompile; 
	g_awardTypes["states2band"].compile	= doubleCompile; 
	
 	
}

function scoreAstates(award, obj) 
{ 
	if ( obj.state )
	{
		if ( !(obj.state in award.stat ) )
			award.stat[obj.state] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.state], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testAstates(award, obj, baseHash ) 
{ 
	if ( obj.state && obj.state + baseHash in g_tracker[award.test.look].state )
	{
		return false;																
	}
	return true;
}

function scoreAstates2band(award, obj) 
{ 
	if ( obj.state )
	{
		if ( !(obj.band in award.stat ) )
			award.stat[obj.band] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.band], obj.band, obj.mode, obj.digital, obj.phone, obj.state);
	}
	return false;
}

function testAstates2band(award, obj, baseHash) 
{
	if ( obj.state && obj.state + baseHash in g_tracker[award.test.look].state )
	{
		return false;																
	}
	return true;
}

function scoreAdxcc(award, obj) 
{
	if ( !(obj.dxcc in award.stat ) )
			award.stat[obj.dxcc] = newAwardCountObject() ;
	return workAwardObject( award.stat[obj.dxcc], obj.band, obj.mode, obj.digital, obj.phone);
}
	
function testAdxcc(award, obj, baseHash ) 
{
	if ( String(obj.dxcc)+baseHash in g_tracker[award.test.look].dxcc )
	{
		return false;																
	}
	return true;																	
}


function scoreAcont(award, obj) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "AN" )
			cont = "OC";
		if ( !(cont in award.stat ) )
			award.stat[cont] = newAwardCountObject() ;
		return workAwardObject( award.stat[cont], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testAcont(award, obj, baseHash) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "AN" )
			cont = "OC";
		
		if (  cont + baseHash in g_tracker[award.test.look].cont )
		{
			return false;																
		}		
	}
	return true;
}


function scoreAcont5(award, obj, baseHash) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "NA" || cont == "SA" )
			cont = "AM";
		if ( cont == "AN" )
			cont = "OC";
		
		if ( !(cont in award.stat ) )
			award.stat[cont] = newAwardCountObject() ;
		return workAwardObject( award.stat[cont], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testAcont5(award, obj, baseHash) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "NA" || cont == "SA" )
			cont = "AM";
		if ( cont == "AN" )
			cont = "OC";
		
		if (  cont + baseHash in g_tracker[award.test.look].cont )
		{
			return false;																
		}
	}
	return true;
}

function scoreAcont2band(award, obj) 
{ 
	if ( !(obj.band in award.stat ) )
			award.stat[obj.band] = newAwardCountObject() ;
	
	return workAwardObject( award.stat[obj.band], obj.band, obj.mode, obj.digital, obj.phone, obj.cont);
}

function testAcont2band(award, obj, baseHash) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "AN" )
			cont = "OC";
		
		if (  cont + baseHash in g_tracker[award.test.look].cont )
		{
			return false;																
		}		
	}
	return true;
}

function scoreAcont52band(award, obj) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "NA" || cont == "SA" )
			cont = "AM";
		if ( cont == "AN" )
			cont = "OC";
		
		if ( !(obj.band in award.stat ) )
			award.stat[obj.band] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.band], obj.band, obj.mode, obj.digital, obj.phone, cont);
	}
	return false;
}

	
function testAcont52band(award, obj, baseHash) 
{ 
	if ( obj.cont )
	{
		var cont = obj.cont;
		if ( cont == "NA" || cont == "SA" )
			cont = "AM";
		if ( cont == "AN" )
			cont = "OC";
		
		if (  cont + baseHash in g_tracker[award.test.look].cont )
		{
			return false;																
		}
	}
	return true;
}


function scoreAgrids(award, obj) 
{ 
	if ( obj.grid )
	{
		var grid = obj.grid.substr(0,4);
		
		if ( !(grid in award.stat ) )
			award.stat[grid] = newAwardCountObject() ;
		return workAwardObject( award.stat[grid], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

	
function testAgrids(award, obj, baseHash) 
{ 
	if ( obj.grid && obj.grid + baseHash in g_tracker[award.test.look].grid )
	{
		return false;																
	}
	return true;
}

function scoreAcnty(award, obj) 
{ 
	if ( obj.cnty )
	{
		if ( !(obj.cnty in award.stat ) )
			award.stat[obj.cnty] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.cnty], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testAcnty(award, obj, baseHash) 
{
	if ( obj.cnty && obj.cnty + baseHash in g_tracker[award.test.look].cnty )
	{
		return false;																
	}
	return true;
}


function scoreAcall(award, obj)
{ 
	var call = obj.DEcall;

	if ( call.indexOf("/") > -1 )
	{
		if ( call.endsWith("/MM") )
			return false;
		call = call.replace("/P","").replace("/R","").replace("/QRP");
	}

	if ( !(call in award.stat ) )
		award.stat[call] = newAwardCountObject() ;
	return workAwardObject( award.stat[call], obj.band, obj.mode, obj.digital, obj.phone);
}

function testAcall(award, obj, baseHash)
{ 
	if ( obj.DEcall.indexOf("/") > -1 && obj.DEcall.endsWith("/MM") )
		return false;
	
	if ( obj.DEcall + baseHash in g_tracker[award.test.look].call )
	{
		return false;																
	}
	return true;																	
}

function scoreAIOTA(award, obj)
{ 
	if ( obj.IOTA )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		
		if ( "IOTA" in test.rule && test.rule.IOTA.indexOf(obj.IOTA) == -1 )
			return false;
		
		if ( !(obj.IOTA in award.stat ) )
			award.stat[obj.IOTA] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.IOTA], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

// NO IOTA YET
function testAIOTA(award, obj, baseHash) 
{ 
	/*if ( obj.IOTA )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		
		if ( "IOTA" in test.rule && test.rule.IOTA.indexOf(obj.IOTA) == -1 )
			return false;
																
	}*/  
	
	return false;
}

function scoreAcallarea(award, obj)
{
	if ( obj.zone != null )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		
		if ( "zone" in test.rule && test.rule.zone.indexOf(obj.zone) == -1 )
			return false;
		
		if ( !(obj.zone in award.stat ) )
			award.stat[obj.zone] = newAwardCountObject() ;
		return workAwardObject( award.stat[obj.zone], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testAcallarea(award, obj, baseHash) 
{
	if ( obj.zone != null )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		
		if ( "zone" in test.rule && test.rule.zone.indexOf(obj.zone) == -1 )
			return false;
																
	}
	return true;
}

function scoreApx(award, obj)
{
	if ( obj.px )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		var px = obj.px;
		if ( "px" in test.rule )
		{
			px = px.substr(0, test.rule.px[0].length);
			if ( test.rule.px.indexOf(px) == -1 )
				return false;
		}
			
		if ( !(px in award.stat ) )
			award.stat[px] = newAwardCountObject() ;
		return workAwardObject( award.stat[px], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false;
}

function testApx(award, obj, baseHash)
{
	if ( obj.px )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		var px = obj.px;
		if ( "px" in test.rule )
		{
			px = px.substr(0, test.rule.px[0].length);
			if ( test.rule.px.indexOf(px) == -1 )
				return false;
		}
		
		if ( String(obj.px)+baseHash in g_tracker[award.test.look].px )
		{
			return false;																
		}
	}
	return true;																	

}

function scoreApxa(award, obj)
{
	if ( obj.px )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		for ( var i in test.rule.pxa )
		{
			if ( test.rule.pxa[i].indexOf(obj.px) > -1 )
			{
				if ( !(i in award.stat ) )
					award.stat[i] = newAwardCountObject() ;
				return workAwardObject( award.stat[i], obj.band, obj.mode, obj.digital, obj.phone);
			}
		}
	}
	return false;
}

function testApxa(award, obj, baseHash) 
{
	if ( obj.px )
	{
		var test = g_awards[award.sponsor].awards[award.name];
		for ( var i in test.rule.pxa )
		{
			if ( test.rule.pxa[i].indexOf(obj.px) > -1 )
			{
				return false;														
			}
		}
		
		if ( String(obj.px)+baseHash in g_tracker[award.test.look].px )
		{
			return false;																
		}
	}
	return true;
}

function scoreAsfx(award, obj) 
{ 
	var test = g_awards[award.sponsor].awards[award.name];
	var suf = obj.DEcall.replace(obj.px,"");
	for ( var i in test.rule.sfx )
	{
		for ( var s in test.rule.sfx[i] )
		{
			if ( suf.indexOf(test.rule.sfx[i][s]) == 0 )
			{
				if ( !(i in award.stat ) )
					award.stat[i] = newAwardCountObject() ;
				return workAwardObject( award.stat[i], obj.band, obj.mode, obj.digital, obj.phone);
			}
		}
	}

	return false;
}

function testAsfx(award, obj, baseHash) 
{ 
	var test = g_awards[award.sponsor].awards[award.name];
	var suf = obj.DEcall.replace(obj.px,"");
	for ( var i in test.rule.sfx )
	{
		for ( var s in test.rule.sfx[i] )
		{
			if ( suf.indexOf(test.rule.sfx[i][s]) == 0 )
			{
				return false;														
			}
		}
	}

	return true;
}

function scoreAcalls2dxcc(award, obj) 
{ 
	if ( !(obj.dxcc in award.stat ) )
			award.stat[obj.dxcc] = newAwardCountObject() ;
	
	return workAwardObject( award.stat[obj.dxcc], obj.band, obj.mode, obj.digital, obj.phone, obj.DEcall);
}


function testAcalls2dxcc(award, obj, baseHash) 
{ 
	if ( obj.DEcall+baseHash in g_tracker[award.test.look].call )
	{
		return false;																
	}
	return true;																	
}

function scoreAcalls2band(award, obj) 
{ 
	if ( !(obj.band in award.stat ) )
			award.stat[obj.band] = newAwardCountObject() ;
	
	return workAwardObject( award.stat[obj.band], obj.band, obj.mode, obj.digital, obj.phone, obj.DEcall);

}

function testAcalls2band(award, obj, baseHash) 
{ 
	if ( obj.DEcall+baseHash in g_tracker[award.test.look].call )
	{
		return false;																
	}
	return true;
}

function scoreAdxcc2band(award, obj) 
{ 
	if ( !(obj.band in award.stat ) )
			award.stat[obj.band] = newAwardCountObject() ;
	
	return workAwardObject( award.stat[obj.band], obj.band, obj.mode, obj.digital, obj.phone, obj.dxcc);

}

function testAdxcc2band(award, obj, baseHash) 
{ 
	if ( String(obj.dxcc)+baseHash in g_tracker[award.test.look].dxcc )
	{
		return false;																
	}
	return true;
}

function scoreAcqz(award, obj)
{ 
	if ( obj.cqz )
	{
		if ( !(obj.cqz in award.stat ) )
				award.stat[obj.cqz] = newAwardCountObject() ;
		
		return workAwardObject( award.stat[obj.cqz], obj.band, obj.mode, obj.digital, obj.phone);
	}
	return false; 
}

function testAcqz(award, obj, baseHash )
{ 
	if ( obj.cqz && obj.cqz + baseHash in g_tracker[award.test.look].cqz )
	{
			return false;																															
	}
	return true; 
}

function scoreAnumsfx(award, obj) 
{
	var test = g_awards[award.sponsor].awards[award.name];
	var px = obj.px.substr(0,obj.px.length-1);
	var suf = obj.DEcall.replace(px,"");
	suf = suf.substr(0, test.rule.numsfx[0][0].length);
	for ( var i in test.rule.numsfx )
	{
		for ( var s in test.rule.numsfx[i] )
		{
			if ( suf.indexOf(test.rule.numsfx[i][s]) == 0 )
			{
				if ( !(i in award.stat ) )
					award.stat[i] = newAwardCountObject() ;
				return workAwardObject( award.stat[i], obj.band, obj.mode, obj.digital, obj.phone);
			}
		}
	}

	return false;
}

function testAnumsfx(award, obj) 
{
	var test = g_awards[award.sponsor].awards[award.name];
	var px = obj.px.substr(0,obj.px.length-1);
	var suf = obj.DEcall.replace(px,"");
	suf = suf.substr(0, test.rule.numsfx[0][0].length);
	for ( var i in test.rule.numsfx )
	{
		for ( var s in test.rule.numsfx[i] )
		{
			if ( suf.indexOf(test.rule.numsfx[i][s]) == 0 )
			{
				return false;														
			}
		}
	}

	return true;
}


function scoreApxplus(award, obj) 
{ 
	var test = g_awards[award.sponsor].awards[award.name];

	if ( test.rule.pxplus )
	{
		for ( var i in test.rule.pxplus )
		{
			if ( obj.DEcall.indexOf(test.rule.pxplus[i]) == 0 )
			{
				if ( !(i in award.stat ) )
					award.stat[i] = newAwardCountObject() ;
				return workAwardObject( award.stat[i], obj.band, obj.mode, obj.digital, obj.phone);
			}
		}
	}
	return false;
}

function testApxplus(award, obj) 
{ 
	var test = g_awards[award.sponsor].awards[award.name];

	if ( test.rule.pxplus )
	{
		for ( var i in test.rule.pxplus )
		{
			if ( obj.DEcall.indexOf(test.rule.pxplus[i]) == 0 )
			{
				return false;														
			}
		}
	}
	return true;
}


function loadAwardJson()
{		
	g_awards = {};
	var fs = require('fs');
	if (fs.existsSync("./data/awards.json")) 
	{
		fileBuf = fs.readFileSync("./data/awards.json");
		try {
			g_awards = JSON.parse(fileBuf);
			//fs.writeFileSync("./data/awards.json", JSON.stringify(g_awards,null,2));

			for ( var sp in g_awards )
			{
				for ( var aw in g_awards[sp].awards )
				{
					if ( !("unique" in  g_awards[sp].awards[aw].rule ) )
						 g_awards[sp].awards[aw].rule.unique = 1;
					 
					if (  g_awards[sp].awards[aw].rule.band[0] == "Mixed" )
					{
						g_awards[sp].awards[aw].rule.band.shift();
					}
					
					if ( g_awards[sp].awards[aw].rule.band.length == 0 )
					{
						g_awards[sp].awards[aw].rule.band = [];
						for ( var key in g_awards[sp].mixed )
						{
							g_awards[sp].awards[aw].rule.band.push( g_awards[sp].mixed[key] );
						}
					}
					if ( g_awards[sp].awards[aw].rule.endorse.length == 1 &&  g_awards[sp].awards[aw].rule.endorse[0] == "Mixed" )
					{
						g_awards[sp].awards[aw].rule.endorse = [];
						for ( var key in g_awards[sp].mixed )
						{
							g_awards[sp].awards[aw].rule.endorse.push( g_awards[sp].mixed[key] );
						}

					}
			
				}
			}
			
			buildAwardTypeHandlers();
		}
		
		catch (e) {
			alert("Core awards.json : " + (e) );
			g_awards = {};
		}
		delete filebuf;
	}
	else
		alert("Missing core awards.json");
	
	
}

function processAllAwardTrackers()
{
	for ( var tracker in g_awardTracker )
	{
		if ( !(g_awardTracker[tracker].sponsor in g_awards) )
		{
			delete g_awardTracker[tracker];
			continue;
		}
		if ( !(g_awardTracker[tracker].name in g_awards[g_awardTracker[tracker].sponsor].awards) )
		{
			delete g_awardTracker[tracker];
			continue;
		}
		processAward(tracker);
	}
	updateAwardList();
}

function newAwardTrackerObject(sponsor, award, enable)
{
	var newAward = {};
	newAward.sponsor = sponsor;
	newAward.name = award;
	newAward.enable = enable;
	newAward.mode = g_awards[sponsor].awards[award].rule.mode[0];
	newAward.band = g_awards[sponsor].awards[award].rule.band[0];
	newAward.count = g_awards[sponsor].awards[award].rule.count[0],
	newAward.stat = {};
	newAward.comp = {};
	newAward.test = {};
	return newAward;
}

function addAllAwards()
{
	for ( var sponsor in g_awards )
	{
		for ( var award in g_awards[sponsor].awards )
		{
			var awardToAdd = newAwardTrackerObject(sponsor, award, true);

			var hash = awardToAdd.name + "-" + awardToAdd.sponsor;
			if ( !(hash in g_awardTracker) )
			{
				g_awardTracker[hash] = awardToAdd;
				processAward( hash );
				storeAwardTracker();
			}	
		}
	}
	updateAwardList();
	window.opener.goProcessRoster();
}

function delAllAwards()
{
	g_awardTracker = {};
	storeAwardTracker();
	updateAwardList();
	window.opener.goProcessRoster();
}


function newCompileCountObject() 
{
	var compileCountObject = {};
	compileCountObject.bands = {};
	compileCountObject.modes = {};
	compileCountObject.endorse = {};
	compileCountObject.counts = {};
	return compileCountObject;
}

function singleCompile(award, obj) 
{ 
	var test = g_awards[award.sponsor].awards[award.name];
	var rule = test.rule;
	var comp = newCompileCountObject();
	for ( var mode in rule.mode )
	{
		comp.modes[rule.mode[mode]] = 0;
		comp.bands[rule.mode[mode]] = {};
		
		for ( var band in rule.band )
		{
			comp.bands[rule.mode[mode]][rule.band[band]] = 0;
		}
		for ( var key in obj )
		{
			if ( rule.mode[mode] in obj[key].bands && Object.keys(obj[key].bands[rule.mode[mode]]).length )
			{
				comp.modes[rule.mode[mode]] += 1;
				
				for ( var band in rule.band )
				{
					if ( rule.band[band] in obj[key].bands[rule.mode[mode]] )
						comp.bands[rule.mode[mode]][rule.band[band]] += 1;
				}
			}
		}	
	}
	


	for ( var mode in comp.modes )
	{
		comp.endorse[mode] = {};
		comp.counts[mode] = {};
		for ( var cnts in rule.count )
		{
			comp.counts[mode][rule.count[cnts]] = { "num": comp.modes[mode] , "per" : parseInt(Math.min(100, (comp.modes[mode]  /  rule.count[cnts]  )*100.0))};
		}
	
		for ( var endorse in rule.endorse )
		{	
			comp.endorse[mode][rule.endorse[endorse]] = {}
			for ( var cnts in rule.count )
			{
				comp.endorse[mode][rule.endorse[endorse]][rule.count[cnts]] = (comp.bands[mode][rule.endorse[endorse]] >= rule.count[cnts]);
			}
		}
	}	

	return comp;
}


function doubleCompile(award, firstLevel) 
{ 	
	var test = g_awards[award.sponsor].awards[award.name];
	var rule = test.rule;
	
	for ( var k in firstLevel )
	{
		firstLevel[k].bands = {};
		//firstLevel[k].modes = {};
		var obj = singleCompile(award, firstLevel[k].unique);

		for ( var mode in obj.bands )
		{
			for ( var cnt in test.rule.count )
			{	
				if ( obj.counts[mode][test.rule.count[cnt]].num >= test.rule.unique )
					for ( var band in obj.bands[mode] )
					{
						if ( !(mode in firstLevel[k].bands) )
							firstLevel[k].bands[mode] = {};

						if ( obj.bands[mode][band] > 0 )
							firstLevel[k].bands[mode][band] =  ~~firstLevel[k].bands[mode][band] + 1;
					}
			}
		}
		/*for ( var mode in obj.modes )
		{
			if ( !(mode in firstLevel[k].modes) )
				firstLevel[k].modes[mode] = 0;
			if ( obj.modes[mode] > 0 )
				firstLevel[k].modes[mode] +=  1;
		}*/
	
		delete firstLevel[k].unique;
		firstLevel[k].unique = null;
	}	
	
	return singleCompile(award,firstLevel);
}