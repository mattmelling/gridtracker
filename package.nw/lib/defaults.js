var validSettings = 
[
	"HRDLogbookLogSettings",
	"N1MMSettings",
	"acLogSettings",
	"adifLogSettings",
	"alertSettings",
	"appSettings",
	"audioSettings",
	"awardTracker",
	"bandActivity",
	"blockedCQ",
	"blockedCalls",
	"blockedDxcc",
	"callsignLookups",
	"classicAlerts",
	"classicAlertsVersion",
	"currentVersion",
	"dxkLogSettings",
	"log4OMSettings",
	"mapMemory",
	"mapSettings",
	"msgSettings",
	"receptionSettings",
	"rosterSettings",
	"savedAlerts",
	"speechSettings",
	"startupLogs",
	"trustedQslSettings",
	"screenSettings"
];

var def_appSettings = 
{
	"alertMute" : 0,
	"rosterAlwaysOnTop": false,
	"centerGridsquare" : "",
	"chatUUID" : "",
	"crScript" : 0,
	"distanceUnit" : "MI",
	"earthImgSrc" : 0,
	"gridViewMode" : 3,
	"gridsquareDecayTime" : 300,
	"gtAgree" : "",
	"gtBandFilter" : "",
	"gtFlagImgSrc" : 0,
	"gtModeFilter" : "",
	"gtPropFilter" : "mixed",
	"gtMsgEnable" : true,
	"gtShareEnable" : true,
	"heatEnabled" : 0,
	"loadAdifAtStartup" : false,
	"lookupLoginCq" : "",
	"lookupLoginQrz" : "",
	"lookupLoginQth" : "",
	"lookupOnTx" : false,
	"lookupCloseLog": true,
	"lookupMerge" : true,
	"lookupMissingGrid" : false,
	"lookupPasswordCq" : "",
	"lookupPasswordQrz" : "",
	"lookupPasswordQth" : "",
	"lookupService" : "CALLOOK",
	"moonPath" : 0,
	"moonTrack" : 0,
	"mouseTrack" : 0,
	"multicast" : false,
	"myBand": "OOB",
	"myDEGrid": "",
	"myDEcall": "NOCALL",
	"myMode": "",
	"myRawCall": "NOCALL",
	"myRawFreq": "",
	"myRawGrid": "",
	"pathWidthWeight" : 1.0,
	"pushPinMode" : false,
	"qrzPathWidthWeight" : 1.2,
	"sixWideMode" : 0,
	"savedAppData": null,
	"soundCard" : "default",
	"spotsEnabled" : 0,
	"stopAskingVersion" : false,
	"useLocalTime" : 0,
	"wsjtForwardUdpEnable" : false,
	"wsjtForwardUdpIp" : "127.0.0.1",
	"wsjtForwardUdpPort" : 2238,
	"wsjtIP" : "",
	"wsjtUdpPort" : 0,
	"workingCallsignEnable" : false,
	"workingCallsigns" : {},
	"workingDateEnable": false,
	"workingDate" : 0
};

var def_mapSettings = 
{
	"animate" :  true,
	"animateSpeed" :  4,
	"CQhilite" :  true,
	"fitQRZ" :  false,
	"focusRig" :  true,
	"gridAlpha" :  136,
	"haltAllOnTx" :  true,
	"legend" :  true,
	"longitude" :  0.0,
	"latitude" :  0.0,
	"loudness" :  1,
	"mapIndex" :  19,
	"mergeOverlay" :  false,
	"mouseOver" :  true,
	"nightLoudness" :  0.8,
	"nightMapEnable" :  false,
	"nightMapIndex" :  20,
	"nightPathColor" :  361,
	"nightQrzPathColor" :  1,
	"offlineMode" :  false,
	"pathColor" :  0,
	"qrzDxccFallback" :  false,
	"qrzPathColor" :  1,
	"rosterTime" :  120,
	"shadow" :  0.1,
	"splitQSL" :  true,
	"strikes" :  false,
	"strikesAlert" :  2,
	"strikesGlobal" :  false,
	"strikesNotify" :  false,
	"trafficDecode" :  true,
	"usNexrad" :  false,
	"zoom" :  4,
	"mapTrans" : 0.5
};

var def_adifLogSettings = 
{
		"menu": {
			"buttonAdifCheckBox": false,
			"buttonClubCheckBox": false,
			"buttonLOTWCheckBox": false,
			"buttonQRZCheckBox": false,
			"buttonPsk24CheckBox": true
		},
		"startup": {
			"loadAdifCheckBox": false,
			"loadPsk24CheckBox": false,
			"loadQRZCheckBox": false,
			"loadLOTWCheckBox": false,
			"loadClubCheckBox": false,
			"loadGTCheckBox": true
		},
		"qsolog": {
			"logQRZqsoCheckBox": false,
			"logGTqsoCheckBox": true,
			"logLOTWqsoCheckBox": false,
			"logHRDLOGqsoCheckBox": false,
			"logClubqsoCheckBox": false,
			"logCloudlogQSOCheckBox": false,
			"logeQSLQSOCheckBox": false
		},
		"nickname": {
			"nicknameeQSLCheckBox": false,
		},
		"text": {
			"lotwLogin": "",
			"clubCall": "",
			"clubEmail": "",
			"clubPassword": "",
			"lotwPassword": "",
			"lotwTrusted": "",
			"lotwStation": "",
			"qrzApiKey": "",
			"HRDLOGCallsign": "",
			"HRDLOGUploadCode": "",
			"CloudlogURL":"http://127.0.0.1/index.php/api/qso",
			"CloudlogAPI":"",
			"eQSLUser":"",
			"eQSLPassword":"",
			"eQSLNickname":""
		},
		"downloads": {}
};

var def_msgSettings = 
{
	"msgAlertSelect" :  1,
	"msgAlertWord" :  "New chat message",
	"msgAlertMedia" :  "none",
	"msgFrequencySelect" :  0,
	"msgActionSelect" :  0,
	"msgAwaySelect" :  0,
	"msgAwayText" :  "I am away from the shack at the moment"

};

var def_receptionSettings = 
{
	"lastSequenceNumber" :  "0", // Treat as a string, it's friggin big
	"lastDownloadTimeSec" :  0,
	"viewHistoryTimeSec" :  900,
	"viewPaths" :  false,
	"pathColor" :  -1,
	"pathNightColor" :  361,
	"spotWidth" :  0.8,
	"mergeSpots" :  false
};


var def_N1MMSettings = 
{
	"enable" :  false,
	"port" :  2333,
	"ip" :  "127.0.0.1"

};
var def_log4OMSettings = 
{
	"enable" :  false,
	"port" :  2236,
	"ip" :  "127.0.0.1"
};
var def_dxkLogSettings = 
{
	"enable" :  false,
	"port" :  52000,
	"ip" :  "127.0.0.1"
};
var def_HRDLogbookLogSettings = 
{

	"enable" :  false,
	"port" :  7826,
	"ip" :  "127.0.0.1"
};
var def_acLogSettings = 
{

	"enable" :  false,
	"port" :  1100,
	"ip" :  "127.0.0.1"
};
var def_trustedQslSettings =  
{
	"stationFile" :  "",
	"stationFileValid" :  false,
	"binaryFile" :  "",
	"binaryFileValid" :  false
};
var def_callsignLookups = 
{
	"lotwUseEnable" :  true,
	"lotwWeeklyEnable" :  true,
	"lotwLastUpdate" :  0,
	"eqslUseEnable" :  true,
	"eqslWeeklyEnable" :  true,
	"eqslLastUpdate" :  0,
	"ulsUseEnable" :  true,
	"ulsWeeklyEnable" :  true,
	"ulsLastUpdate" :  0,
	"oqrsUseEnable" :  false,
	"oqrsWeeklyEnable" :  false,
	"oqrsLastUpdate" :  0

};

var def_bandActivity = 
{
	"lastUpdate" : {},
	"lines" : {}
};
