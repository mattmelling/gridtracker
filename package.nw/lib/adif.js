// GridTracker ©2020 N0TTL

var selectStartupLink = null;

function dragOverHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}


function dropHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  if (ev.dataTransfer.items) 
  {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) 
	{
      // If dropped items aren't files, reject them
	  Entry = ev.dataTransfer.items[i].webkitGetAsEntry();
      if ( Entry && typeof Entry.isFile != "undefined" && Entry.isFile == true ) 
	  {
		var filename = ev.dataTransfer.items[i].getAsFile().path;
		var test = filename.toLowerCase();
		var valid = test.endsWith('.adi')?true:test.endsWith('.adif')?true:test.endsWith('.log')?true:test.endsWith('.txt')?true:false;
		if ( valid && fs.existsSync(filename))
		{
			onAdiLoadComplete( fs.readFileSync(filename, "UTF-8" ) , false);
		}
      }
    }
  }
}


function findAdiField( row, field)
{
    var value = "";
	var regex = new RegExp("<"+field+":",'i');
    var firstSplitArray = row.split(regex);
    if ( firstSplitArray && firstSplitArray.length == 2 )
    {
        var secondSplitArray = firstSplitArray[1].split(">");
        if ( secondSplitArray.length > 1 )
        {
            var newLenSearch = secondSplitArray[0].split(":");
            var newLen = newLenSearch[0];
            value = secondSplitArray[1].slice(0,newLen);
        }
		delete secondSplitArray;
    }
    return value;
}



function onAdiLoadComplete( adiBuffer, saveAdifFile, adifFileName, newFile)
{
    var rawAdiBuffer = "";
	if ( typeof adiBuffer == "object" )
		rawAdiBuffer = String(adiBuffer);
	else
		rawAdiBuffer = adiBuffer;
	
	var regex = new RegExp( '<EOH>', 'i');
	
    var adiArray = rawAdiBuffer.split(regex);
	var activeAdifArray = Array();
	var activeAdifLogMode = true;
	
	if ( adiArray[0].indexOf("PSKReporter") > -1 )
		activeAdifLogMode = false; 

    if ( adiArray.length > 1 )
    {
		regex = new RegExp('<EOR>','i');
        activeAdifArray = adiArray[1].split(regex);          
    }

    var dateTime = new Date();
    var dupes = 0;
	
    for (var x = 0; x < activeAdifArray.length ; x++ )
    {
		var finalMode = "";
		
		
		if ( activeAdifArray[x].length > 3) 
		{
			if ( activeAdifLogMode )
			{
				var confirmed = false;
				var finalGrid = findAdiField(activeAdifArray[x], "GRIDSQUARE");   
				var vuccGrids =  findAdiField(activeAdifArray[x], "VUCC_GRIDS");
				var finalVucc = [];
				var finalDXcall = findAdiField(activeAdifArray[x], "CALL").replace("_","/");
				var finalDEcall = findAdiField(activeAdifArray[x], "STATION_CALLSIGN").replace("_","/");
				
				if ( finalDEcall == "" )
					finalDEcall = myDEcall;
				if ( g_appSettings.workingCallsignEnable && !(finalDEcall in g_appSettings.workingCallsigns) )
					continue;
				var finalRSTsent = findAdiField(activeAdifArray[x], "RST_SENT");
				var finalRSTrecv = findAdiField(activeAdifArray[x], "RST_RCVD");
				var finalBand = findAdiField(activeAdifArray[x], "BAND").toLowerCase();
				var dateVal = findAdiField(activeAdifArray[x], "QSO_DATE");
				var timeVal = findAdiField(activeAdifArray[x], "TIME_ON");
				var finalState = findAdiField(activeAdifArray[x], "STATE").toUpperCase();
				if ( finalState.length == 0 ) 
					finalState = null;
				var finalPropMode = findAdiField(activeAdifArray[x], "PROP_MODE").toUpperCase();
				var finalSatName = findAdiField(activeAdifArray[x], "SAT_NAME").toUpperCase();
				var finalCont = findAdiField(activeAdifArray[x], "CONT").toUpperCase();
				if ( finalCont.length == 0 ) 
					finalCont = null;
				var finalCnty = findAdiField(activeAdifArray[x], "CNTY").toUpperCase();
				if ( finalCnty.length == 0 ) 
					finalCnty = null;
				else
				{
					finalCnty = finalCnty.replace(", ",",");
					finalCnty = finalCnty.replace("DEKALB","DE KALB");
					finalCnty = finalCnty.replace("DESOTO","DE SOTO");
					finalCnty = finalCnty.replace("LAPORTE","LA PORTE");
					finalCnty = finalCnty.replace("DU PAGE","DUPAGE");
				}
				var finalMode = findAdiField(activeAdifArray[x], "MODE").toUpperCase();
				var subMode = findAdiField(activeAdifArray[x], "SUBMODE");
				if ( subMode == "FT4" && (finalMode == "MFSK" || finalMode == "DATA") )
					finalMode = "FT4";
				if ( subMode == "JS8" && finalMode == "MFSK"  )
					finalMode = "JS8";
			
				if ( finalBand == "oob" || finalBand == "" )
				{
					finalBand = Number(findAdiField(activeAdifArray[x], "FREQ")).formatBand();
				}
				
				var finalMsg = findAdiField(activeAdifArray[x], "COMMENT");
				var finalQslMsg = findAdiField(activeAdifArray[x],"QSLMSG");
				var finalQslMsgIntl = findAdiField(activeAdifArray[x],"QSLMSG_INTL");
				if ( finalQslMsg.length > 1 )
					finalMsg = finalQslMsg;
				if ( finalQslMsgIntl.length > 1 && finalMsg == "" )
					finalMsg = finalQslMsgIntl;
					
				var finalDxcc = Number(findAdiField(activeAdifArray[x], "DXCC"));
				if ( finalDxcc == 0  )
					finalDxcc = Number(callsignToDxcc( finalDXcall ));
				
				if ( !(finalDxcc in g_dxccToGeoData) )
					finalDxcc = Number(callsignToDxcc( finalDXcall ));
				
				// If my callsign isn't present, it must be for me anyway

				var finalCqZone = findAdiField(activeAdifArray[x], "CQZ");
				if ( finalCqZone.length == 1 )
					finalCqZone = "0" + finalCqZone;
				
				if ( parseInt(finalCqZone) < 1 ||  parseInt(finalCqZone) > 40 )
					finalCqZone = "";
				
				var finalItuZone = findAdiField(activeAdifArray[x], "ITUZ");
				if ( finalItuZone.length == 1 )
					finalItuZone = "0" + finalItuZone;
				
				if ( parseInt(finalItuZone) < 1 ||  parseInt(finalItuZone) > 90 )
					finalItuZone = "";
				
				var finalIOTA = findAdiField(activeAdifArray[x], "IOTA").toUpperCase();
				
				var qrzConfirmed =  findAdiField(activeAdifArray[x], "APP_QRZLOG_STATUS").toUpperCase();
				var lotwConfirmed1 = findAdiField(activeAdifArray[x], "QSL_RCVD").toUpperCase(); 
				var lotw_qsl_rcvd = findAdiField(activeAdifArray[x],"LOTW_QSL_RCVD").toUpperCase(); 
				
					
				if (  qrzConfirmed == "C" ||  lotw_qsl_rcvd == "Y" ||   lotw_qsl_rcvd == "V" || lotwConfirmed1 == "Y"  )
					confirmed = true;
					
				var dateTime = new Date(Date.UTC(dateVal.substr(0,4), parseInt(dateVal.substr(4,2))-1,dateVal.substr(6,2), timeVal.substr(0,2), timeVal.substr(2,2),timeVal.substr(4,2)));
				
				var finalTime = parseInt(dateTime.getTime()/1000);
				
				if ( g_appSettings.workingDateEnable && finalTime < g_appSettings.workingDate )
					continue;
				
				finalGrid = finalGrid.substr(0,6);
				if (  !validateGridFromString(finalGrid) )
					finalGrid = "";
				if ( finalGrid == "" && vuccGrids != "" )
				{
					finalVucc = vuccGrids.split(",");
					finalGrid = finalVucc[0];
					finalVucc.shift();
				}
				var isDigital = false;
				var isPhone = false;
				if (finalMode in g_modes )
				{
					isDigital = g_modes[finalMode];
				} 
				if ( finalMode in g_modes_phone  )
				{
					isPhone = g_modes_phone[finalMode];			
				}
				if (  finalDXcall != "" )
					addDeDx( finalGrid, finalDXcall, false, false, false, finalDEcall, finalRSTsent, finalTime, finalMsg, finalMode, finalBand, confirmed, false, finalRSTrecv, finalDxcc, finalState,finalCont, finalCnty, finalCqZone, finalItuZone, finalVucc, finalPropMode, isDigital, isPhone, finalIOTA, finalSatName); 

			}
			else
			{
				var finalMyGrid = findAdiField(activeAdifArray[x], "MY_GRIDSQUARE");
				var finalGrid = findAdiField(activeAdifArray[x], "GRIDSQUARE");
				var finalDXcall = findAdiField(activeAdifArray[x], "CALL");
				var finalDEcall = findAdiField(activeAdifArray[x], "OPERATOR");
				var finalRSTsent = findAdiField(activeAdifArray[x], "APP_PSKREP_SNR");
				var dateVal = findAdiField(activeAdifArray[x], "QSO_DATE");
				var timeVal = findAdiField(activeAdifArray[x], "TIME_ON");
				var finalMode = findAdiField(activeAdifArray[x], "MODE");
				var finalBand = Number(findAdiField(activeAdifArray[x], "FREQ")).formatBand();
				var finalMsg = "-";
				var finalDxcc = Number(findAdiField(activeAdifArray[x], "DXCC"));
				if ( finalDxcc == 0  )
				{
					if ( finalDXcall == myDEcall )
						finalDxcc = callsignToDxcc( finalDEcall );
					else
						finalDxcc = callsignToDxcc( finalDXcall );
				}
					
				var finalGrid = finalGrid.substr(0,6);
				
				var dateTime = new Date(Date.UTC(dateVal.substr(0,4), parseInt(dateVal.substr(4,2))-1,dateVal.substr(6,2), timeVal.substr(0,2), timeVal.substr(2,2),timeVal.substr(4,2)));
				var finalTime = parseInt(dateTime.getTime()/1000);
				if ( finalGrid != "" && finalDXcall != "" &&  validateGridFromString(finalGrid) )
				{

						if ( finalDXcall == myDEcall )
							addDeDx( finalMyGrid, finalDEcall, false, false, false, finalDXcall, null,       finalTime, finalMsg,finalMode,finalBand,false,true,finalRSTsent, finalDxcc,null,null,null,null,null);
					   else if ( finalDEcall == myDEcall )
							addDeDx( finalGrid, finalDXcall, false, false, false, "-", finalRSTsent, finalTime, finalMsg,finalMode,finalBand,false,true,null, finalDxcc,null,null,null,null,null);
					   else
							addDeDx( finalGrid, finalDXcall, false, false, false, finalDEcall, finalRSTsent, finalTime, finalMsg,finalMode,finalBand,false,true,null, finalDxcc,null,null,null,null,null);

				}
			}
		
		}
            
    }
    
	delete rawAdiBuffer;
    delete adiArray;
	delete activeAdifArray;

	redrawGrids();
    updateCountStats(); 
	updateLogbook();

	if ( g_fromDirectCallNoFileDialog == false )
	{
		fileSelector.setAttribute('type', '');
		fileSelector.setAttribute('type', 'file');
		fileSelector.setAttribute('accept', '.adi,');
		fileSelector.value = null;

	}
	g_fromDirectCallNoFileDialog = false;

	updateRosterWorked();
	goProcessRoster();
}


function clubLogCallback( buffer, flag, cookie)
{
	var rawAdiBuffer = String(buffer);
	if ( rawAdiBuffer.indexOf("Invalid login") > -1 )
	{
		if ( flag )
			clubTestResult.innerHTML = "Invalid";

	}
	else if ( buffer == null )
	{
		if ( flag )
			clubTestResult.innerHTML = "Unknown Error";

	}
	else
	{
		if ( flag )
			clubTestResult.innerHTML = "Passed";
		else
		{
			g_fromDirectCallNoFileDialog = true;
			
			rawAdiBuffer = cleanAndPrepADIF("clublog.adif",rawAdiBuffer);
			
			tryToWriteAdifToDocFolder("clublog.adif",rawAdiBuffer);
			
			onAdiLoadComplete( rawAdiBuffer, true, "clublog.adif", true );
		}
	}
}


var g_isGettingClub = false; 
function grabClubLog(test)
{

    if ( g_isGettingClub ==  false )
    {
		if ( test )
			clubTestResult.innerHTML = "Testing";

		
		var postData = {
			email: clubEmail.value,
			password: clubPassword.value,
			call: clubCall.value
		};
		getAPostBuffer("https://clublog.org/getadif.php", clubLogCallback, test,"https",443,postData,ClubLogImg,"g_isGettingClub");	
	}
	
}


function tryToWriteAdifToDocFolder( filename, buffer, append = false )
{
	var finalFile = g_appData + g_dirSeperator +  filename;
	try 
	{
		if ( append == false )
		{
			fs.writeFileSync(finalFile, buffer);
			return buffer;
		}
		else
		{
			fs.appendFileSync(finalFile, buffer);
			return fs.readFileSync(finalFile);
		}

    } 
	catch (e) 
	{
        return false;
	}
}


function cleanAndPrepADIF( name, adiBuffer, reverse = false, noheader = false)
{
	var rawAdiBuffer = adiBuffer;
	var regex = new RegExp( '<APP_LOTW_EOF>', 'i');
	rawAdiBuffer = rawAdiBuffer.replace(regex,'');
	regex = new RegExp( '<EOH>', 'i');
    var adiArray = rawAdiBuffer.split(regex);
	var activeAdifArray = Array();
	var activeAdifLogMode = true;
	var finalBuffer = "";
	
	if ( noheader == false )
		finalBuffer = name + "<EOH>\r\n";

    if ( adiArray.length > 1 )
    {
		regex = new RegExp( '<EOR>', 'i');
        activeAdifArray = adiArray[1].split(regex);     

		if ( reverse == false )
		{
			for ( var x = 0; x < activeAdifArray.length-1 ; x++ )
			{
				var row = activeAdifArray[x].replace(/[\n\r]/g, '');
				if ( row.length > 0 ) 
					finalBuffer +=  row + "<EOR>\r\n";
			}	
		}
		else
		{
			for ( var x = activeAdifArray.length-1; x > -1  ; x-- )
			{
				var row = activeAdifArray[x].replace(/[\n\r]/g, '');
				if ( row.length > 0 ) 
					finalBuffer +=  row + "<EOR>\r\n";
			}
		}
    }

	return finalBuffer;
}


function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getUTCString( d ) {
  var Y = d.getUTCFullYear();
  var M = addZero(d.getUTCMonth()+1);
  var D = addZero(d.getUTCDate());
  var h = addZero(d.getUTCHours());
  var m = addZero(d.getUTCMinutes());
  var s = addZero(d.getUTCSeconds());
  return Y + "-" + M + "-" + D + " " + h + ":" + m + ":" + s;
}

function lotwCallback(buffer, flag)
{
	var rawAdiBuffer = String(buffer);
	if ( rawAdiBuffer.indexOf("password incorrect") > -1 )
	{
		
		if ( flag )
			lotwTestResult.innerHTML = "Invalid";

	}
	else
	{
		if ( flag )
			lotwTestResult.innerHTML = "Passed";
		else
		{		
			var shouldAppend = false;
			g_fromDirectCallNoFileDialog = true;
			
			var lastQsl =  findAdiField(rawAdiBuffer, "APP_LoTW_LASTQSL");    
			
			if ( lastQsl.length > 0 )
			{
				var dateTime = new Date(Date.UTC(lastQsl.substr(0,4), parseInt(lastQsl.substr(5,2))-1,lastQsl.substr(8,2), lastQsl.substr(11,2), lastQsl.substr(14,2),lastQsl.substr(17,2)));
				dateTime.setSeconds( dateTime.getSeconds() + 1 );
				var newQsl = getUTCString(dateTime);
				if ( !("lotw_qsl" in g_adifLogSettings.downloads ) )
				{
					g_adifLogSettings.downloads["lotw_qsl"] = Object();
				}
				g_adifLogSettings.downloads["lotw_qsl"][lotwLogin.value] = newQsl;
				localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
			}
			
			shouldAppend = shouldWeAppendInsteadOfCreate("lotw_QSL.adif");
			
			rawAdiBuffer = cleanAndPrepADIF("lotw_QSL.adif",rawAdiBuffer, true,shouldAppend);
			
			rawAdiBuffer = tryToWriteAdifToDocFolder("lotw_QSL.adif",rawAdiBuffer, shouldAppend);
			
			onAdiLoadComplete(rawAdiBuffer, true, "lotw_QSL.adif", true);
		}
	}
}

function lotwQsoCallback(buffer, flag)
{
	var rawAdiBuffer = String(buffer);
	if ( rawAdiBuffer.indexOf("password incorrect") > -1 )
	{
		
		if ( flag )
			lotwTestResult.innerHTML = "Invalid";

	}
	else
	{
		if ( flag )
			lotwTestResult.innerHTML = "Passed";
		else
		{		
			var shouldAppend = false;
			g_fromDirectCallNoFileDialog = true;
			
			var lastQsl =  findAdiField(rawAdiBuffer, "APP_LoTW_LASTQSORX");    
			
			if ( lastQsl.length > 0 )
			{
				var dateTime = new Date(Date.UTC(lastQsl.substr(0,4), parseInt(lastQsl.substr(5,2))-1,lastQsl.substr(8,2), lastQsl.substr(11,2), lastQsl.substr(14,2),lastQsl.substr(17,2)));
				dateTime.setSeconds( dateTime.getSeconds() + 1 );
				var newQsl = getUTCString(dateTime);
				if ( !("lotw_qso" in g_adifLogSettings.downloads ) )
				{
					g_adifLogSettings.downloads["lotw_qso"] = Object();
				}
				g_adifLogSettings.downloads["lotw_qso"][lotwLogin.value] = newQsl;
				localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
			}
			
			shouldAppend = shouldWeAppendInsteadOfCreate("lotw_QSO.adif");
			
			rawAdiBuffer = cleanAndPrepADIF("lotw_QSO.adif",rawAdiBuffer, true,shouldAppend);
			
			rawAdiBuffer = tryToWriteAdifToDocFolder("lotw_QSO.adif",rawAdiBuffer, shouldAppend);
			
			onAdiLoadComplete(rawAdiBuffer, true, "lotw_QSO.adif", true);
		}
	}
}


function shouldWeAppendInsteadOfCreate( filename  )
{
	var finalFile = g_appData + g_dirSeperator +  filename;
	try 
	{
		if (fs.existsSync(finalFile))
			return true;
		else
			return false;
	}
	catch (e) 
	{
        return false;
	}
}


function tryToDeleteLog ( filename )
{
	var finalFile = g_appData + g_dirSeperator +  filename;
	try 
	{
		if (fs.existsSync(finalFile))
		{
			fs.unlinkSync(finalFile);
		}
	}
	catch (e) 
	{
        
	}
}


var g_lotwCount = 0;

var g_isGettingLOTW = false;

function grabLOtWLog(test)
{
    if ( g_isGettingLOTW == false )
    {
		var lastQSLDateString = "&qso_qslsince=1900-01-01";
		if ( test )
		{
			lotwTestResult.innerHTML = "Testing";
			lastQSLDateString = "&qso_qslsince=2100-01-01";
		}
		else
		{
			if ( !("lotw_qsl" in g_adifLogSettings.downloads ) )
			{
				g_adifLogSettings.downloads["lotw_qsl"] = Object();
				localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
			}
			if ( lotwLogin.value in g_adifLogSettings.downloads["lotw_qsl"] && shouldWeAppendInsteadOfCreate("lotw_QSL.adif") )
			{
				lastQSLDateString="&qso_qslsince="+g_adifLogSettings.downloads["lotw_qsl"][lotwLogin.value];
			}
		}
		getABuffer("https://lotw.arrl.org/lotwuser/lotwreport.adi?login=" + lotwLogin.value + "&password=" + encodeURIComponent(lotwPassword.value) +"&qso_query=1&qso_qsldetail=yes&qso_withown=yes&qso_qsl=yes"+lastQSLDateString, lotwCallback, test,"https",443, lotwLogImg,"g_isGettingLOTW", 120000, "g_lotwCount");	
	}
}


var g_isGettingLOTWQSO = false;

function grabLOtWLogQSO(test)
{
    if ( g_isGettingLOTWQSO == false )
    {
		var lastQSODateString = "&qso_qsorxsince=1900-01-01";
		if ( test )
		{
			lotwTestResult.innerHTML = "Testing";
			lastQSODateString = "&qso_qsorxsince=2100-01-01";
		}
		else
		{
			if ( !("lotw_qso" in g_adifLogSettings.downloads ) )
			{
				g_adifLogSettings.downloads["lotw_qso"] = Object();
				localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
			}
			if ( lotwLogin.value in g_adifLogSettings.downloads["lotw_qso"] && shouldWeAppendInsteadOfCreate("lotw_QSO.adif") )
			{
				lastQSODateString="&qso_qsorxsince="+g_adifLogSettings.downloads["lotw_qso"][lotwLogin.value];
			}
		}
		
		getABuffer("https://lotw.arrl.org/lotwuser/lotwreport.adi?login=" + lotwLogin.value + "&password=" + encodeURIComponent(lotwPassword.value) +"&qso_query=1&qso_qsldetail=yes&qso_withown=yes&qso_qsl=no"+lastQSODateString, lotwQsoCallback, test,"https",443, lotwLogImg,"g_isGettingLOTWQSO", 120000, "g_lotwCount");	
	}
}


function qrzCallback(buffer, flag)
{
	if ( buffer.indexOf("invalid api key") > -1 )
	{
		if ( flag )
			qrzTestResult.innerHTML = "Invalid";

	}
	else
	{
		if ( flag )
		{
			qrzTestResult.innerHTML = "Passed";
		}
		else
		{	
			g_fromDirectCallNoFileDialog = true;
			var htmlString = String(buffer).replace(/&lt;/g, "<");
			htmlString = htmlString.replace(/&gt;/g, ">");
			htmlString =  htmlString.replace("ADIF=","QRZ<EOH>\r\n");
			
			htmlString = cleanAndPrepADIF("qrz.adif",htmlString);
			
			tryToWriteAdifToDocFolder("qrz.adif",htmlString);
			
			onAdiLoadComplete(htmlString, true , "qrz.adif", true);
			delete htmlString;
		}
	}
}

var g_isGettingQRZCom = false;
function grabQrzComLog( test )
{

    if ( g_isGettingQRZCom == false )
    {
		var action = "FETCH";
		if ( test )
		{
			qrzTestResult.innerHTML = "Testing";
			action = "STATUS";
		}
		
		getABuffer("https://logbook.qrz.com/api?KEY=" + qrzApiKey.value + "&ACTION="+action, qrzCallback, test,"https",443, qrzLogImg,"g_isGettingQRZCom",null);	
	}
}


function ValidateQrzApi(inputText)
{
	inputText.value = inputText.value.toUpperCase(); 
	if((inputText.value.length == 19 ) )
    {
        var passed = false;    
	    var dashcount = 0;
		for ( var i =0; i < inputText.value.length; i++ )
		{
			if ( inputText.value[i] == "-" )
				dashcount++;
		}
        if ( dashcount == 3 )
        {
           passed = true;
        }
        if ( passed )
        {
            inputText.style.color = "#FF0";
            inputText.style.backgroundColor = "green";

            return true;
        }
        else
        {
            inputText.style.color = "white";
            inputText.style.backgroundColor = "red";
            return false;
        }

    }
    else
    {
       inputText.style.color = "white";
       inputText.style.backgroundColor = "red";

       return false;
    }
}

function ValidateText(inputText)
{
	
	if((inputText.value.length > 0 ) )
    {
		inputText.style.color = "#FF0";
		inputText.style.backgroundColor = "green";
        return true;
    }
    else
    {
       inputText.style.color = "white";
       inputText.style.backgroundColor = "red";
       return false;
    }
}

function pskCallback(buffer, flag)
{
    g_fromDirectCallNoFileDialog = true;
    var rawAdiBuffer = String(buffer);
			
    onAdiLoadComplete( rawAdiBuffer, false);
}


var g_isGettingPsk = false;

function grabPsk24()
{
	if ( g_isGettingPsk == true )
		return;
	
	if ( myDEcall.length > 0 && myDEcall != "NOCALL" )
	{
		var days = 1;
		if ( pskImg.src == 1 )
			days = 7;
		getABuffer("https://pskreporter.info/cgi-bin/pskdata.pl?adif=1&days="+days+"&receiverCallsign=" + myDEcall.toLowerCase(), pskCallback,null,"https",443,pskImg,"g_isGettingPsk");		
	}

}



function adifMenuCheckBoxChanged(what)
{
	g_adifLogSettings["menu"][what.id] = what.checked;
	var menuItem = what.id + "Div";
	if ( what.checked == true )
	{
		document.getElementById(menuItem).style.display = "inline-block";
	}
	else
	{
		document.getElementById(menuItem).style.display = "none";
	}
	
	localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
	
	if ( what == buttonAdifCheckBox )
		setAdifStartup(loadAdifCheckBox);
	
}

function adifStartupCheckBoxChanged(what)
{
	g_adifLogSettings["startup"][what.id] = what.checked;
	localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);

	if ( what == loadAdifCheckBox )
		setAdifStartup(loadAdifCheckBox);
}

function adifLogQsoCheckBoxChanged(what)
{
	g_adifLogSettings["qsolog"][what.id] = what.checked;
	if ( what.id == "logLOTWqsoCheckBox" )
	{
		if ( what.checked == true  )
		{
			lotwUpload.style.display = "inline-block";
			trustedTestButton.style.display = "inline-block";
		}
		else
		{
			lotwUpload.style.display = "none";
			trustedTestButton.style.display = "none";
		}
	}
	localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
}

function adifNicknameCheckBoxChanged(what)
{
	g_adifLogSettings["nickname"][what.id] = what.checked;
	if ( what.id == "nicknameeQSLCheckBox" )
	{
		if ( what.checked == true  )
		{
			eQSLNickname.style.display = "inline-block";
		}
		else
		{
			eQSLNickname.style.display = "none";

		}
	}
	localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
}

function adifTextValueChange(what)
{
	g_adifLogSettings["text"][what.id] = what.value;
	localStorage.adifLogSettings = JSON.stringify(g_adifLogSettings);
}



var fileSelector = document.createElement('input');
fileSelector.setAttribute('type', 'file');
fileSelector.setAttribute('accept', '.adi,.adif');
fileSelector.onchange = function ()
{


    if (this.files && this.files[0]) 
    {
        path =  this.value.replace(this.files[0].name,"");
        fileSelector.setAttribute("nwworkingdir",path);     
        
        var reader = new FileReader();
        reader.onload = function(e) 
        {
            if ( e.target.error == null )
            {
				onAdiLoadComplete( e.target.result, false);

            }
        }

        reader.readAsText(this.files[0]);
    }
}

function adifLoadDialog () 
{
    var exists =  fileSelector.getAttribute("nwworkingdir");

    fileSelector.setAttribute("nwworkingdir",g_appData);


    fileSelector.click();
	
    return false;
}

var startupFileSelector = document.createElement('input');
startupFileSelector.setAttribute('type', 'file');
startupFileSelector.setAttribute('accept', '.adi,.adif');
startupFileSelector.onchange = function ()
{
    if (this.files && this.files[0]) 
    {
		for ( var i in g_startupLogs )
		{
			if ( this.value == g_startupLogs[i].file )
				return;
		}
		var newObject = Object();
		newObject.name = this.files[0].name;
		newObject.file = this.value;
		g_startupLogs.push(newObject);
		localStorage.startupLogs = JSON.stringify(g_startupLogs);
		
        path =  this.value.replace(this.files[0].name,"");
        startupFileSelector.setAttribute("nwworkingdir",path);

        setAdifStartup(loadAdifCheckBox);
    }
}

function start_and_end(str) {
  if (str.length > 31) {
    return str.substr(0, 16) + ' ... ' + str.substr(str.length-15, str.length);
  }
  return str;
}

function setFileSelectors()
{
    selectStartupLink = document.getElementById("selectAdifButton");
	selectStartupLink.onclick = function ()
	{
		var exists = startupFileSelector.getAttribute("nwworkingdir");
		if ( exists == null )
		{
			if ( g_workingIniPath.length > 1 )
				startupFileSelector.setAttribute("nwworkingdir",g_appData);
		}
		
		startupFileSelector.click();
		return false;
	}

	
	selectTqsl = document.getElementById("selectTQSLButton");
	selectTqsl.onclick = function ()
	{

		
		tqslFileSelector.click();
		return false;
	}
	lotwUpload.prepend(selectTqsl);
}

var tqslFileSelector = document.createElement('input');
tqslFileSelector.setAttribute('type', 'file');
tqslFileSelector.setAttribute('accept', '*');
tqslFileSelector.onchange = function ()
{
    if (this.files && this.files[0]) 
    {
		g_trustedQslSettings.binaryFile = this.files[0].path;
		var fs = require('fs');
		
		if ( fs.existsSync(g_trustedQslSettings.binaryFile) && (g_trustedQslSettings.binaryFile.endsWith("tqsl.exe") || g_trustedQslSettings.binaryFile.endsWith("tqsl")))
		{
			g_trustedQslSettings.binaryFileValid = true;
		}
		else
			g_trustedQslSettings.binaryFileValid = false;
		
		if ( g_trustedQslSettings.binaryFileValid == true )
		{
			tqslFileDiv.style.backgroundColor = "blue";
		}
		else
		{
			tqslFileDiv.style.backgroundColor = "red";
		}
		
        tqslFileDiv.innerHTML = "<b>" + start_and_end(this.files[0].path) + "</b>";
		localStorage.trustedQslSettings = JSON.stringify(g_trustedQslSettings);
    }
}


function loadGtQSOLogFile()
{

	var fs = require('fs');

	if ( fs.existsSync(g_qsoLogFile) )
	{

		var rawAdiBuffer = fs.readFileSync(g_qsoLogFile);

		g_fromDirectCallNoFileDialog = true;
		
		onAdiLoadComplete( rawAdiBuffer, false);                    
	 }

}

function loadWsjtLogFile()
{
	var fs = require('fs');
	if (fs.existsSync(g_workingIniPath + "wsjtx_log.adi"))
	{
	
		var rawAdiBuffer = fs.readFileSync(g_workingIniPath + "wsjtx_log.adi" );
		g_fromDirectCallNoFileDialog = true;
		onAdiLoadComplete( rawAdiBuffer ,false );
	}
}

function findTrustedQSLPaths()
{
	var process = require('process');
	var base = null;

	if ( g_trustedQslSettings.stationFileValid == true )
	{
		// double check the presence of the station_data;
		if ( !fs.existsSync(g_trustedQslSettings.stationFile) )
		{
			g_trustedQslSettings.stationFileValid = false;
		}
	}
	if ( g_trustedQslSettings.stationFileValid == false )
	{
		if (g_platform == "windows")
		{
			base = process.env.APPDATA + "\\TrustedQSL\\station_data";
			if ( fs.existsSync(base) )
			{
				g_trustedQslSettings.stationFile = base;
				g_trustedQslSettings.stationFileValid = true;
			}
			else
			{
				base = process.env.LOCALAPPDATA + "\\TrustedQSL\\station_data";
				if ( fs.existsSync(base) )
				{
					g_trustedQslSettings.stationFile = base;
					g_trustedQslSettings.stationFileValid = true;
				}
			}
		}
		else
		{
			base = process.env.HOME + "/.tqsl/station_data";
			if ( fs.existsSync(base) )
			{
				g_trustedQslSettings.stationFile = base;
				g_trustedQslSettings.stationFileValid = true;
			}
		}
	}
	if (  g_trustedQslSettings.stationFileValid == true )
	{
		var validate = false;
		 var option = document.createElement("option");
         option.value = "";
         option.text = "Select a Station";
         lotwStation.appendChild(option);
			
		var buffer = fs.readFileSync(g_trustedQslSettings.stationFile,"UTF-8");
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(buffer,"text/xml");
		var x = xmlDoc.getElementsByTagName("StationData");
		for (var i = 0; i < x.length; i++) 
		{ 
            option = document.createElement("option");
            option.value = x[i].getAttribute('name');
            option.text = x[i].getAttribute('name');
			if (option.value == g_adifLogSettings.text.lotwStation ) {
					option.selected = true;	
					validate = true;
			}
            lotwStation.appendChild(option);
		}
		if ( validate )
		{
			ValidateText(lotwStation);
		}
			
	}
	
	if ( g_trustedQslSettings.binaryFileValid == true )
	{
		// double check the presence of the TrustedQSL binary;
		if ( !fs.existsSync(g_trustedQslSettings.binaryFile) )
		{
			g_trustedQslSettings.binaryFileValid = false;
		}
	}
	if ( g_trustedQslSettings.binaryFileValid == false || g_platform == "mac")
	{
		if (g_platform == "windows")
		{
			base =  process.env["ProgramFiles(x86)"] + "\\TrustedQSL\\tqsl.exe";
			if ( fs.existsSync(base) )
			{
				g_trustedQslSettings.binaryFile = base;
				g_trustedQslSettings.binaryFileValid = true;
			}
		}
		else if (g_platform == "mac")
		{
			base = "/Applications/TrustedQSL/tqsl.app/Contents/MacOS/tqsl";
			if ( fs.existsSync(base) )
			{
				g_trustedQslSettings.binaryFile = base;
				g_trustedQslSettings.binaryFileValid = true;
			}
			else
			{
				base = process.env.HOME + "/Applications/TrustedQSL/tqsl.app/Contents/MacOS/tqsl";
				if ( fs.existsSync(base) )
				{
					g_trustedQslSettings.binaryFile = base;
					g_trustedQslSettings.binaryFileValid = true;
				}
				else
				{
					base = process.env.HOME + "/Applications/tqsl.app/Contents/MacOS/tqsl";
					if ( fs.existsSync(base) )
					{
						g_trustedQslSettings.binaryFile = base;
						g_trustedQslSettings.binaryFileValid = true;
					}
					else
					{
						base = "/Applications/tqsl.app/Contents/MacOS/tqsl";
						if ( fs.existsSync(base) )
						{
							g_trustedQslSettings.binaryFile = base;
							g_trustedQslSettings.binaryFileValid = true;
						}
						else
						{
							base = process.env.HOME + "/Desktop/TrustedQSL/tqsl.app/Contents/MacOS/tqsl";
							if ( fs.existsSync(base) )
							{
								g_trustedQslSettings.binaryFile = base;
								g_trustedQslSettings.binaryFileValid = true;
							}
							else
							{
								base = process.env.HOME + "/Applications/Ham Radio/tqsl.app/Contents/MacOS/tqsl";
								if ( fs.existsSync(base) )
								{
									g_trustedQslSettings.binaryFile = base;
									g_trustedQslSettings.binaryFileValid = true;
								}
							}
						}
					}
				}
			}
		}
		else if (g_platform == "linux")
		{
			base = "/usr/bin/tqsl";
			if ( fs.existsSync(base) )
			{
				g_trustedQslSettings.binaryFile = base;
				g_trustedQslSettings.binaryFileValid = true;
			}
			else
			{
				base = "/usr/local/bin/tqsl";
				if ( fs.existsSync(base) )
				{
					g_trustedQslSettings.binaryFile = base;
					g_trustedQslSettings.binaryFileValid = true;
				}
			}
		}
	}
	localStorage.trustedQslSettings = JSON.stringify(g_trustedQslSettings);
}


function startupAdifLoadFunction()
{

	var fs = require('fs');

	for ( var i in g_startupLogs )
	{	
		try {
			if ( fs.existsSync(g_startupLogs[i].file) )
			{
				var rawAdiBuffer = fs.readFileSync(g_startupLogs[i].file);
				g_fromDirectCallNoFileDialog = true;
				onAdiLoadComplete(rawAdiBuffer,false);                    
			}
		}
		catch (e)
		{
		}
	}
}


function setAdifStartup(checkbox)
{
	if ( g_trustedQslSettings.binaryFile == null )
		g_trustedQslSettings.binaryFile = "";
	
	if ( g_trustedQslSettings.binaryFile.endsWith("tqsl.exe") || g_trustedQslSettings.binaryFile.endsWith("tqsl"))
	{
		g_trustedQslSettings.binaryFileValid = true;
	}
	else
		g_trustedQslSettings.binaryFileValid = false;
	
	if ( g_trustedQslSettings.binaryFileValid == true )
	{
		tqslFileDiv.style.backgroundColor = "blue";
	}
	else
	{
		tqslFileDiv.style.backgroundColor = "red";
	}
	tqslFileDiv.innerHTML = "<b>" + start_and_end(g_trustedQslSettings.binaryFile) + "</b>";
	
    if ( buttonAdifCheckBox.checked || loadAdifCheckBox.checked )
    {
		var worker = "";
		if ( g_startupLogs.length > 0 )
		{
			worker += "<table class='darkTable'>";
			for ( var i in g_startupLogs )
			{
				worker += "<tr title='"+g_startupLogs[i].file+"'><td>"+ g_startupLogs[i].name + "</td><td onclick='removeStartupLog("+i+")'><img src='/img/trash_24x48.png' style='height:17px;margin:-1px;margin-bottom:-3px;padding:0px;cursor:pointer'></td></tr>";
			}
			worker += "</table>";
		}
		else
		{
			worker = "No file(s) selected";
		}
        startupLogFileDiv.innerHTML = worker;
		selectFileOnStartupDiv.style.display = "block";
    }
    else
    {
        startupLogFileDiv.innerHTML = "No file(s) selected";
        startupFileSelector.setAttribute('type', '');
        startupFileSelector.setAttribute('type', 'file');
        startupFileSelector.setAttribute('accept', '.adi*');
        startupFileSelector.value = null;
		selectFileOnStartupDiv.style.display = "none";
    }
        
}

function removeStartupLog( i )
{
	if ( i in g_startupLogs )
	{
		g_startupLogs.splice(i,1);
		localStorage.startupLogs = JSON.stringify(g_startupLogs);
		setAdifStartup(loadAdifCheckBox);
	}
}

function startupAdifLoadCheck()
{
	logEventMedia.value = g_alertSettings.logEventMedia;
	
	loadWsjtLogFile();

	if ( loadGTCheckBox.checked == true )
		loadGtQSOLogFile();
	
	if ( loadAdifCheckBox.checked == true &&  g_startupLogs.length > 0 )
		startupAdifLoadFunction();
		
	
	if ( g_mapSettings.offlineMode == false  )
	{
		if (g_appSettings.gtFlagImgSrc == 1)
			showGtFlags();
	
		if ( loadPsk24CheckBox.checked == true )
			grabPsk24();
	
		if ( loadLOTWCheckBox.checked == true )
		{	
			grabLOtWLogQSO(false);
			grabLOtWLog(false);
		}
		
		if ( loadQRZCheckBox.checked == true )
			grabQrzComLog(false);
		
		if ( loadClubCheckBox.checked == true )
			grabClubLog(false);
		
	}

}

function getABuffer(file_url,  callback, flag, mode, port, imgToGray, stringOfFlag , timeoutX, stringOfCounter = null )
{
    var url = require('url');
    var http = require(mode);
    var fileBuffer = null;
	var options = null;

	{
		options = {
			host: url.parse(file_url).host,
			port: port,
			path: url.parse(file_url).path,
			method: "get"
		};
	}
	if ( typeof stringOfFlag != "undefined" )
		window[stringOfFlag] = true;
	if ( typeof imgToGray != "undefined" && imgToGray.style.webkitFilter == "" )
		imgToGray.style.webkitFilter = "invert(100%) grayscale(1)";
	if (  stringOfCounter !=  null )
	{
		window[stringOfCounter]++;
	}
	
    var req = http.request(options, function(res) {
        var fsize = res.headers['content-length'];
		var cookies = null;
		if ( typeof res.headers['set-cookie'] != 'undefined' )
			cookies = res.headers['set-cookie'];
		
		
        res.on('data', function(data) {
                if ( fileBuffer == null )
                    fileBuffer = data;
                else
                    fileBuffer += data;
                      
            }).on('end', function() {
                    if (typeof callback === "function") {
                        // Call it, since we have confirmed it is callable
                        callback(fileBuffer, flag, cookies);
					if ( typeof stringOfFlag != "undefined" )
					{
						window[stringOfFlag] = false;
					}
					if ( stringOfCounter == null && typeof imgToGray != "undefined")
					{
						imgToGray.style.webkitFilter = "";
					}
					if ( stringOfCounter != null && typeof imgToGray != "undefined" )
					{
						window[stringOfCounter]--;
						if ( window[stringOfCounter] == 0 )
						{
							imgToGray.style.webkitFilter = "";
						}
						if (  window[stringOfCounter] < 0 )
						{
							 window[stringOfCounter] = 0;
						}
					}
                     }
            }).on('error', function() {
					if ( typeof stringOfFlag != "undefined" )
					{
						window[stringOfFlag] = false;
					}
					if ( stringOfCounter == null && typeof imgToGray != "undefined")
					{
						imgToGray.style.webkitFilter = "";
					}
					if (  stringOfCounter != null && typeof imgToGray != "undefined" )
					{
						window[stringOfCounter]--;
						if ( window[stringOfCounter] == 0 )
						{
							imgToGray.style.webkitFilter = "";
						}
						if (  window[stringOfCounter] < 0 )
						{
							 window[stringOfCounter] = 0;
						}
					}
            });
        });
		
	req.on('socket', function (socket) 
		{		
			socket.on('timeout', function() 
			{
				req.abort();
			});
		});
		
	req.on('error', function(err) {
			if ( typeof stringOfFlag != "undefined" )
			{
				window[stringOfFlag] = false;
			}
			if (  stringOfCounter == null && typeof imgToGray != "undefined")
			{
				imgToGray.style.webkitFilter = "";
			}
			if (  stringOfCounter != null && typeof imgToGray != "undefined" )
			{
				window[stringOfCounter]--;
				if ( window[stringOfCounter] == 0 )
				{
					imgToGray.style.webkitFilter = "";
				}
			}
				
		});
	
	req.end();
}

function getAPostBuffer(file_url,  callback, flag, mode, port, theData, imgToGray, stringOfFlag )
{
	var querystring = require('querystring');
	var postData = querystring.stringify(theData);
    var url = require('url');
    var http = require(mode);
    var fileBuffer = null;

    var options = {
        host: url.parse(file_url).host,
        port: port,
        path: url.parse(file_url).path,
		method: "post",
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
    };
	
	window[stringOfFlag] = true;

	imgToGray.style.webkitFilter = "invert(100%) grayscale(1)";
	
    var req = http.request(options, function(res) {
        var fsize = res.headers['content-length'];
		var cookies = null;
		if ( typeof res.headers['set-cookie'] != 'undefined' )
			cookies = res.headers['set-cookie'];

			
        res.on('data', function(data) {
                
                if ( fileBuffer == null )
                    fileBuffer = data;
                else
                    fileBuffer += data;
                      
            }).on('end', function() {
                    if (typeof callback === "function") {
                        // Call it, since we have confirmed it is callable
                        callback(fileBuffer, flag, cookies);
						window[stringOfFlag] = false;
						imgToGray.style.webkitFilter = "";
                     }
            }).on('error', function() {
				window[stringOfFlag] = false;
				imgToGray.style.webkitFilter = "";
            });
        });

	req.on('socket', function (socket) 
		{
			socket.setTimeout(60000);  
			socket.on('timeout', function() 
			{
				req.abort();
			});
		});
		
	req.on('error', function(err) {
			window[stringOfFlag] = false;
			imgToGray.style.webkitFilter = "";
		});
	
	req.write(postData);
	req.end();
}

function sendUdpMessage( msg, length, port, address)
{
	var dgram = require('dgram');
	var socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
	socket.send( msg, 0, length, port, address,  (err) => { socket.close(); });	
}

function sendTcpMessage( msg, length, port, address)
{
	var net = require('net');
	var client = new net.Socket();
	client.connect(port, address , function() {

		client.write(msg);
		client.close();
	});

	client.on('close', function() {
		
	});
}


function valueToAdiField( field, value)
{
    var adi = "<" + field + ":";
	adi += String(value).length + ">";
	adi += String(value) + " ";
    return adi;
}



function pad( value) {
    if(value < 10) {
        return '0' + value;
    } else {
        return value;
    }
}

function HMSfromMilli( milli ) 
{
    var seconds = parseInt(milli/1000);
    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;
     
    val = String(pad(hrs))+String(pad(mnts))+String(pad(seconds));
    return  String(val);
}

function colonHMSfromMilli( milli ) 
{
    var seconds = parseInt(milli/1000);
    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;
     
    val = String(pad(hrs))+":"+String(pad(mnts))+":"+String(pad(seconds));
    return  String(val);
}

function colonHMSfromSeconds( secondsIn ) 
{
    var seconds = secondsIn;
    var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;
     
    val = String(pad(hrs))+":"+String(pad(mnts))+":"+String(pad(seconds));
    return  String(val);
}


function convertToDate(julian) {
	var DAY = 86400000;
	var HALF_DAY = DAY / 2;
	var UNIX_EPOCH_JULIAN_DATE = 2440587.5;
	var UNIX_EPOCH_JULIAN_DAY = 2440587;
  return new Date((Number(julian) - UNIX_EPOCH_JULIAN_DATE) * DAY);
}

var CLk = "25bc718451a71954cb6d0d1b50541dd45d4ba148";

var lastReportHash = null;

var g_oldStyleLogMessage = null;

function oldSendToLogger()
{
	var newMessage = Object.assign({},  g_oldStyleLogMessage );
	
	var band =  Number(newMessage.Frequency/1000000).formatBand();
	
	if (newMessage.DXGrid.length == 0 && newMessage.DXCall + band + newMessage.MO in g_liveCallsigns) {
		newMessage.DXGrid = g_liveCallsigns[newMessage.DXCall + band + newMessage.MO].grid.substr(0, 4);
	}
	
	var report = "<EOH>";
	
	report += valueToAdiField("BAND", Number(newMessage.Frequency/1000000).formatBand() );
	report += valueToAdiField("CALL", newMessage.DXCall.toUpperCase() );
	report += valueToAdiField("FREQ", Number(newMessage.Frequency/1000000).toFixed(6) );
	report += valueToAdiField("MODE", newMessage.MO.toUpperCase() );
	var date = convertToDate(parseInt(newMessage.DateOn));
	var dataString = date.getUTCFullYear() + ('0' + (date.getUTCMonth()+1)).slice(-2) + ('0' + (date.getUTCDate())).slice(-2);
	report += valueToAdiField("QSO_DATE", dataString );
	report += valueToAdiField("TIME_ON", HMSfromMilli(newMessage.TimeOn) );
	
	date = convertToDate(parseInt(newMessage.DateOff));
	dataString = date.getUTCFullYear() + ('0' + (date.getUTCMonth()+1)).slice(-2) + ('0' + (date.getUTCDate())).slice(-2);
	report += valueToAdiField("QSO_DATE_OFF", dataString );
	report += valueToAdiField("TIME_OFF", HMSfromMilli(newMessage.TimeOff) );
	
	report += valueToAdiField("RST_RCVD", newMessage.ReportRecieved );
	report += valueToAdiField("RST_SENT", newMessage.ReportSend );
	report += valueToAdiField("TX_PWR",  parseInt(newMessage.TXPower) );
	report += valueToAdiField("GRIDSQUARE", newMessage.DXGrid );


	
	if ( newMessage.Comments.length > 0 )
		report += valueToAdiField("COMMENT", newMessage.Comments );
	
	
	if ( newMessage.Name.length > 0 )
		report += valueToAdiField("NAME",newMessage.Name );
	
	if ( newMessage.Operatorcall.length > 0 )
	{
		report += valueToAdiField("OPERATOR",newMessage.Operatorcall);
	}
	
	if ( newMessage.Mycall.length > 0 )
	{
		report += valueToAdiField("STATION_CALLSIGN",newMessage.Mycall);
	}
	else if ( myDEcall != "NOCALL" && myDEcall.length > 0 )
		report += valueToAdiField("STATION_CALLSIGN",myDEcall);

	if ( newMessage.Mygrid.length > 0 )
	{
		report += valueToAdiField("MY_GRIDSQUARE", newMessage.Mygrid);
	}
	else if ( myDEGrid.length > 1 )
		report += valueToAdiField("MY_GRIDSQUARE",myDEGrid);
	
	report += "<EOR>";

		
	sendToLogger(report);
	
	
	if (g_ignoreMessages == 0) {
		onAdiLoadComplete(report);
	}
	updateCountStats();
}

var g_adifLookupMap = 
{
	"name": "NAME",
	"iota" : "IOTA",
	"sota" : "SOTA_REF",
	"continent" : "CONT",
	"cqzone": "CQZ",
	"ituzone": "ITUZ",
	"email":"EMAIL",
	"county":"CNTY"
};

function sendToLogger(ADIF)
{
	var report = "";
	var regex = new RegExp( "<EOH>", 'i');
	var record = parseADIFRecord( ADIF.split(regex)[1] );
	var localMode = record["MODE"];
	
	if ( localMode == "MFSK" && "SUBMODE" in record )
	{
		localMode =  record["SUBMODE"];
	}
		
	if ( (!("GRIDSQUARE" in record) || record["GRIDSQUARE"].length == 0) && record["CALL"] + record["BAND"] +  localMode in g_liveCallsigns )
	{
		record["GRIDSQUARE"] =  g_liveCallsigns[record["CALL"] + record["BAND"] +  localMode ].grid.substr(0, 4);
	}
	
	if ( "TX_PWR" in record )
	{
		record["TX_PWR"] = String(parseInt(record["TX_PWR"]));
	}

	if ( (!("STATION_CALLSIGN" in record) || record["STATION_CALLSIGN"].length == 0 ) &&  myDEcall != "NOCALL" && myDEcall.length > 0 )
	{
		record["STATION_CALLSIGN"] = myDEcall;
	}
	
	if ( (!("MY_GRIDSQUARE" in record) || record["MY_GRIDSQUARE"].length == 0 ) &&  myDEGrid.length > 1 )
	{
		record["MY_GRIDSQUARE"] = myDEGrid;
	}
	
	if ( !("DXCC" in record) )
	{
		var dxcc = callsignToDxcc(record["CALL"]);
		if ( dxcc == -1 ) 
			dxcc = 0;
		record["DXCC"] = String(dxcc);
	}
	
	if ( !("COUNTRY" in record) && Number(record["DXCC"]) > 0  )
	{
		record["COUNTRY"] = g_dxccToAltName[Number(record["DXCC"])];
	}
	
	if ( g_appSettings.lookupMerge == true && record["CALL"] in g_lookupObjects )
	{
		var lookup = g_lookupObjects[record["CALL"]];
		for ( var key in lookup )
		{
			if ( key in g_adifLookupMap )
			{
				record[g_adifLookupMap[key]] = lookup[key];
			}
		}
		
		if  ( "GRIDSQUARE" in record && "grid" in lookup )
		{
			if ( record["GRIDSQUARE"].substr(0, 4) == lookup["grid"].substr(0, 4) )
			{
				record["GRIDSQUARE"] = lookup["grid"];
			}
		}
		if ( g_appSettings.lookupMissingGrid && "grid" in lookup && ( !("GRIDSQUARE" in record) || record["GRIDSQUARE"].length == 0 ))
		{
			record["GRIDSQUARE"] = lookup["grid"];
		}
	}
	
	for (var  key in record )
	{
		report += "<" +key+ ":" +record[key].length+ ">"+record[key]+" ";
	}
	report += "<EOR>";


	if ( g_N1MMSettings.enable == true && g_N1MMSettings.port > 1024 && g_N1MMSettings.ip.length > 4 )
	{
		sendUdpMessage( report, report.length, parseInt(g_N1MMSettings.port), g_N1MMSettings.ip);
		addLastTraffic("<font style='color:white'>Logged to N1MM</font>");
	}
	
	
	if ( g_log4OMSettings.enable == true && g_log4OMSettings.port > 1024 && g_log4OMSettings.ip.length > 4 )
	{
		sendUdpMessage( "ADD " + report, report.length+4, parseInt(g_log4OMSettings.port), g_log4OMSettings.ip);
		addLastTraffic("<font style='color:white'>Logged to Log4OM</font>");
	}

	
	var reportHash = unique(report);
	
	if ( reportHash != lastReportHash )
	{
		// Log worthy
		if ( logGTqsoCheckBox.checked == true )
		{
			var fs = require('fs');
			fs.appendFileSync( g_qsoLogFile , report + "\r\n");
			addLastTraffic("<font style='color:white'>Logged to GridTracker backup</font>");
		}

		sendQrzLogEntry(report);
		
		sendClubLogEntry(report);
		
		sendHrdLogEntry(report);
		
		sendCloudlogEntry(report);
		
		
		if ( g_acLogSettings.enable == true && g_acLogSettings.port > 0 && g_acLogSettings.ip.length > 4 )
		{
			sendACLogMessage(record,g_acLogSettings.port,g_acLogSettings.ip);
			addLastTraffic("<font style='color:white'>Logged to N3FJP</font>");
		}
		
		if ( g_dxkLogSettings.enable == true && g_dxkLogSettings.port > 0 && g_dxkLogSettings.ip.length > 4 )
		{
			sendDXKeeperLogMessage(report,  g_dxkLogSettings.port ,  g_dxkLogSettings.ip);
			addLastTraffic("<font style='color:white'>Logged to DXKeeper</font>");
		}
		
		if ( g_HRDLogbookLogSettings.enable == true && g_HRDLogbookLogSettings.port > 0 && g_HRDLogbookLogSettings.ip.length > 4 )
		{
			sendHRDLogbookEntry(record,  g_HRDLogbookLogSettings.port ,  g_HRDLogbookLogSettings.ip);
			addLastTraffic("<font style='color:white'>Logged to HRD Logbook</font>");
		}

		sendLotwLogEntry(report);
		
		if ( logeQSLQSOCheckBox.checked == true && nicknameeQSLCheckBox.checked == true && eQSLNickname.value.trim().length > 0 )
		{
			record["APP_EQSL_QTH_NICKNAME"] = eQSLNickname.value.trim();
			report=	"";
			for (var  key in record )
			{
				report += "<" +key+ ":" +record[key].length+ ">"+record[key]+" ";
			}
			report += "<EOR>";
		}
	
		sendeQSLEntry(report);
	
		alertLogMessage();
		
		if ( lookupOnTx.checked == true && lookupCloseLog.checked == true && g_lastTranmitCallsign == g_lastLookupCallsign )
		{
			openLookupWindow(false);
		}
	}
	lastReportHash = reportHash;
	return report;
}

function alertLogMessage()
{
	if ( logEventMedia.value != "none" )
	{
		playAlertMediaFile(g_mediaDir + g_dirSeperator + logEventMedia.value);
	}
}

function eqslCallback(buffer, flag)
{
	var result = String(buffer);
	if ( flag )
	{
		if (  result.indexOf("No such Username/Password found") != -1 ) 
		{
			eQSLTestResult.innerHTML = "Bad<br/>Password<br/>or<br/>Nickname";
			logeQSLQSOCheckBox.checked = false;
			adifLogQsoCheckBoxChanged(logeQSLQSOCheckBox);
		}
		else if (  result.indexOf("No such Callsign found") != -1 ) 
		{
			eQSLTestResult.innerHTML = "Unknown<br/>Callsign";
			logeQSLQSOCheckBox.checked = false;
			adifLogQsoCheckBoxChanged(logeQSLQSOCheckBox);
		}
		else if ( result.indexOf("Your ADIF log file has been built") != -1 )
		{
			eQSLTestResult.innerHTML = "Passed";
		}
		else if ( result.indexOf("specify the desired User by using the QTHNickname" ) != -1 )
		{
			eQSLTestResult.innerHTML = "QTH Nickname<br/>Needed";
		}
		else
		{
			eQSLTestResult.innerHTML = "Unknown<br/>Error";
			logeQSLQSOCheckBox.checked = false;
			adifLogQsoCheckBoxChanged(logeQSLQSOCheckBox);
		}
	}
	else
	{
		if ( result.indexOf("Error: No match on eQSL_User/eQSL_Pswd") != -1 ) 
		{
			addLastTraffic("<font style='color:red'>Fail log eQSL.cc (credentials)</font>");	
		}
		if ( result.indexOf("specify the desired User by using the QTHNickname") != -1 ) 
		{
			addLastTraffic("<font style='color:red'>Fail log eQSL.cc (nickname)</font>");	
		}
		else if ( result.indexOf("Result: 0 out of 1 records") != -1 )
		{
			addLastTraffic("<font style='color:red'>Fail log eQSL.cc (dupe)</font>");
		}
		else if ( result.indexOf("Result: 1 out of 1 records added") != -1 )
		{
			addLastTraffic("<font style='color:white'>Logged to eQSL.cc</font>");
		}
		else
		{
			addLastTraffic("<font style='color:red'>Fail log eQSL.cc (?)</font>");
		}
	}
}

function eQSLTest( test )
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	eQSLTestResult.innerHTML = "Testing";
	
	var fUrl = "https://www.eQSL.cc/qslcard/DownloadInBox.cfm?UserName="+encodeURIComponent(eQSLUser.value)+"&Password="+encodeURIComponent(eQSLPassword.value)+"&RcvdSince=2020101";
	
	if ( nicknameeQSLCheckBox.checked == true )
		fUrl += "&QTHNickname=" + encodeURIComponent(eQSLNickname.value);
	getABuffer( fUrl, eqslCallback, true,"https",443);	

}

function sendeQSLEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if ( logeQSLQSOCheckBox.checked == true )
	{
		var pid = "GridTracker";
		var pver = String(gtVersion);
		var header = "<PROGRAMID:"+pid.length+">"+pid+"\r\n";
		header += "<PROGRAMVERSION:"+pver.length+">"+pver+"\r\n";
		header += "<EOH>\r\n";
		var eReport =  encodeURIComponent(header+report);
		var fUrl = "https://www.eQSL.cc/qslcard/importADIF.cfm?ADIFData=" + eReport + "&EQSL_USER="+encodeURIComponent(eQSLUser.value)+"&EQSL_PSWD="+encodeURIComponent(eQSLPassword.value);
		getABuffer( fUrl, eqslCallback, false,"https",443);	
	}
}

function testTrustedQSL(test)
{
	if ( g_mapSettings.offlineMode == true )
	{
		lotwTestResult.innerHTML = "Currently<br/>offline";
		return;
	}
	
	if (logLOTWqsoCheckBox.checked == true && g_trustedQslSettings.binaryFileValid == true && g_trustedQslSettings.stationFileValid == true && lotwStation.value.length > 0 )
	{
		lotwTestResult.innerHTML = "Testing Upload";
		
		var child_process = require('child_process');
		var options = Array();
		options.push("-q" );
		options.push("-v");

        child_process.execFile(g_trustedQslSettings.binaryFile, options, (error, stdout, stderr) => {
			  if (error) {
				lotwTestResult.innerHTML = "Error encountered";
			  }
				lotwTestResult.innerHTML = stderr;
			} );	
		return;
	}
	else
	{
		var worker = "";
		if ( g_trustedQslSettings.binaryFileValid == false )
			worker += "Invalid tqsl executable<br/>";
		if ( g_trustedQslSettings.stationFileValid == false )
			worker += "TrustQSL not installed<br/>";
		if ( !ValidateText(lotwTrusted) )
			worker += "TQSL Password missing<br/>";
		if ( !ValidateText(lotwStation) )
			worker += "Select Station<br/>";
		lotwTestResult.innerHTML = worker;
		return;
	}
}
var g_trustTempPath = "";

function sendLotwLogEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if (logLOTWqsoCheckBox.checked == true && g_trustedQslSettings.binaryFileValid == true && g_trustedQslSettings.stationFileValid == true && lotwStation.value.length > 0 )
	{
		var header = "Generated " + userTimeString(null) + " for " + myDEcall + "\r\n\r\n";
		var pid = "GridTracker";
		var pver = String(gtVersion);
		header += "<PROGRAMID:"+pid.length+">"+pid+"\r\n";
		header += "<PROGRAMVERSION:"+pver.length+">"+pver+"\r\n";
		header += "<EOH>\r\n";
		var finalLog = header+report+"\r\n";
		
		g_trustTempPath = os.tmpdir() + g_dirSeperator + unique(report) + ".adif";
		fs.writeFileSync(g_trustTempPath,finalLog);
		
		var child_process = require('child_process');
		var options = Array();
		options.push("-a");
		options.push("all");
		options.push("-l");
		options.push(lotwStation.value);
		options.push("-p");
		options.push(lotwTrusted.value);
		options.push("-q" );
		options.push("-x" );
		options.push("-d");
		options.push("-u");
		options.push(g_trustTempPath);
		
        child_process.execFile(g_trustedQslSettings.binaryFile, options, (error, stdout, stderr) => {
				if ( stderr.indexOf("Final Status: Success") < 0 )
				{
					alert(stderr);
					addLastTraffic("<font style='color:red'>Fail log to TQSL</font>");
				}
				else
				{
					addLastTraffic("<font style='color:white'>Logged to TQSL</font>");
				}
				fs.unlinkSync(g_trustTempPath);
				
			} );
	
	}
	
}


function n1mmLoggerChanged()
{
	g_N1MMSettings.enable = buttonN1MMCheckBox.checked;
	g_N1MMSettings.ip = N1MMIpInput.value;
	g_N1MMSettings.port = N1MMPortInput.value;
	
	localStorage.N1MMSettings = JSON.stringify(g_N1MMSettings);
}

function log4OMLoggerChanged()
{
	g_log4OMSettings.enable = buttonLog4OMCheckBox.checked;
	g_log4OMSettings.ip = log4OMIpInput.value;
	g_log4OMSettings.port = log4OMPortInput.value;
	
	localStorage.log4OMSettings = JSON.stringify(g_log4OMSettings);
}

function acLogLoggerChanged()
{
	g_acLogSettings.enable = buttonacLogCheckBox.checked;
	g_acLogSettings.ip = acLogIpInput.value;
	g_acLogSettings.port = acLogPortInput.value;
	
	localStorage.acLogSettings = JSON.stringify(g_acLogSettings);
}

function dxkLogLoggerChanged()
{
	g_dxkLogSettings.enable = buttondxkLogCheckBox.checked;
	g_dxkLogSettings.ip = dxkLogIpInput.value;
	g_dxkLogSettings.port = dxkLogPortInput.value;
	
	localStorage.dxkLogSettings = JSON.stringify(g_dxkLogSettings);
}

function hrdLogbookLoggerChanged()
{
	g_HRDLogbookLogSettings.enable = buttonHrdLogbookCheckBox.checked;
	g_HRDLogbookLogSettings.ip = hrdLogbookIpInput.value;
	g_HRDLogbookLogSettings.port = hrdLogbookPortInput.value;
	
	localStorage.HRDLogbookLogSettings = JSON.stringify(g_HRDLogbookLogSettings);
}


function CloudUrlErrorCallback(file_url, callback, flag, mode, port, theData, timeoutMs, timeoutCallback,message)
{
	CloudlogTestResult.innerHTML = message;
}

function CloudlogSendLogResult(buffer, flag)
{
	if ( flag && flag == true )
	{
		if ( buffer )
		{
			if ( buffer.indexOf("missing api key") > -1 )
			{
				CloudlogTestResult.innerHTML = "API Key Invalid";
			}
			else if ( buffer.indexOf("created") > -1 )
			{
				CloudlogTestResult.innerHTML = "Passed";
			}
			else
			{
				CloudlogTestResult.innerHTML = "Invalid Response";
			}
		}
		else
		{
			CloudlogTestResult.innerHTML = "Invalid Response";
		}
	}
	else
	{
		if ( buffer && buffer.indexOf("created") > -1 )
			addLastTraffic("<font style='color:white'>Logged to Cloudlog</font>");
		else
			addLastTraffic("<font style='color:red'>Fail log to Cloudlog</font>");
	}	
}


function  qrzSendLogResult(buffer, flag )
{
	if ( typeof buffer != 'undefined' &&  buffer != null )
	{
		var data = String(buffer);
		var kv = data.split("&");
		if ( kv.length > 0 )
		{
			var arrData = Object();
			for ( var x in kv )
			{
				var split = kv[x].split("=");
				arrData[split[0]] = split[1];
			}
			if ( typeof arrData["RESULT"] == 'undefined' || arrData["RESULT"] != "OK" )
			{
				alert("Error uploading QSO to QRZ.com (" + (arrData["REASON"] || "Unknown error") +")");
				addLastTraffic("<font style='color:red'>Fail log to QRZ.com</font>");
			}
			else
				addLastTraffic("<font style='color:white'>Logged to QRZ.com</font>");
		}

	}
	else
		alert("Error uploading QSO to QRZ.com (No response)");
}

function postDialogRetryCallback(file_url, callback, flag, mode, port, theData, timeoutMs, timeoutCallback,who)
{
	if (window.confirm("Error sending QSO to "+who+", retry?")) { 
		getPostBuffer(file_url, callback, flag, mode, port, theData, timeoutMs, postDialogRetryCallback,who);
	}
}

function postRetryErrorCallaback(file_url, callback, flag, mode, port, theData, timeoutMs, timeoutCallback,who)
{
	getPostBuffer(file_url, callback, flag, mode, port, theData, timeoutMs, postDialogRetryCallback, who);
}

function sendQrzLogEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if ( logQRZqsoCheckBox.checked == true &&  ValidateQrzApi(qrzApiKey) )
	{
		if ( typeof nw != "undefined" )
		{
			var postData = {
				KEY: qrzApiKey.value ,
				ACTION: "INSERT",
				ADIF: report
			};
			getPostBuffer("https://logbook.qrz.com/api", qrzSendLogResult, null,"https",443,postData,30000, postRetryErrorCallaback,"QRZ.com");	
		}
	}
}


function  clubLogQsoResult(buffer, flag )
{
	addLastTraffic("<font style='color:white'>Logged to ClubLog.org</font>");
}

function sendClubLogEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if ( logClubqsoCheckBox.checked == true )
	{
		if ( typeof nw != "undefined" )
		{

			var postData = {
			email: clubEmail.value,
			password: clubPassword.value,
			callsign: clubCall.value,
			adif: report,
			api: CLk
			};
			
			getPostBuffer("https://clublog.org/realtime.php", clubLogQsoResult, null,"https",443,postData,30000, postRetryErrorCallaback,"ClubLog.org");

		}
	}
	
}

function sendCloudlogEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if ( logCloudlogQSOCheckBox.checked == true )
	{
		if ( typeof nw != "undefined" )
		{

			var postData = { key: CloudlogAPI.value, 
							 type: "adif", 
							 string: report
							};
			getPostJSONBuffer(CloudlogURL.value, CloudlogSendLogResult, null,"https",80, postData,10000, CloudUrlErrorCallback,"Failed to Send");		
		

		}
	}
	
}


function hrdSendLogResult(buffer, flag)
{
	if ( flag && flag == true )
	{
		if ( buffer.indexOf("Unknown user") > -1 )
		{
			HRDLogTestResult.innerHTML = "Failed";
			logHRDLOGqsoCheckBox.checked = false;
			adifLogQsoCheckBoxChanged(logHRDLOGqsoCheckBox);
		}
		else
			HRDLogTestResult.innerHTML = "Passed";
	}
	else
	{
		if ( buffer.indexOf("Unknown user") == -1 )
			addLastTraffic("<font style='color:white'>Logged to HRDLOG.net</font>");
		else
			addLastTraffic("<font style='color:red'>Fail log to HRDLOG.net</font>");
	}
	
}

function sendHrdLogEntry(report)
{
	if ( g_mapSettings.offlineMode == true )
		return;
	
	if ( logHRDLOGqsoCheckBox.checked == true  )
	{
		if ( typeof nw != "undefined" )
		{
			var postData = {
				Callsign: HRDLOGCallsign.value,
				Code: HRDLOGUploadCode.value,
				App: "GridTracker " + gtVersion,
				ADIFData: report
			};
			getPostBuffer("https://www.hrdlog.net/NewEntry.aspx", hrdSendLogResult, null,"https",443,postData,30000, postRetryErrorCallaback,"HRDLog.net");	
		}
	}
}



function hrdCredentialTest( test )
{
	if ( test && test == true )
	{
		HRDLogTestResult.innerHTML = "Testing";

		if ( typeof nw != "undefined" )
		{
			var postData = {
				Callsign: HRDLOGCallsign.value,
				Code: HRDLOGUploadCode.value
			};
			getPostBuffer("https://www.hrdlog.net/NewEntry.aspx", hrdSendLogResult, test,"https",443,postData);	
		}
	}
}

function ClublogTest( test )
{
	if ( test && test == true )
	{
		CloudlogTestResult.innerHTML = "Testing";

		if ( typeof nw != "undefined" )
		{
			var postData = { key: CloudlogAPI.value, 
							 type: "adif", 
							 string: "<eor>"
							};
			getPostJSONBuffer(CloudlogURL.value, CloudlogSendLogResult, test,"https",80, postData,10000, CloudUrlErrorCallback,"No Response<br/>or</br>Timeout");	
		}
	}
}



function getPostJSONBuffer(file_url, callback, flag, mode, port, theData, timeoutMs, timeoutCallback,who) {

	try 
	{
	var postData = JSON.stringify(theData);
	var url = require('url');
	var protocol = url.parse(file_url).protocol;
	var http = require(protocol.replace(":",""));
	var fileBuffer = null;
	var options = {
		host: url.parse(file_url).hostname,
		port: url.parse(file_url).port,
		path: url.parse(file_url).path,
		method: "post",
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': postData.length
		}
	};
	var req = http.request(options, function (res) {
			var fsize = res.headers['content-length'];
			var cookies = null;
			if (typeof res.headers['set-cookie'] != 'undefined')
				cookies = res.headers['set-cookie'];
			res.on('data', function (data) {
				if (fileBuffer == null)
					fileBuffer = data;
				else
					fileBuffer += data;
			}).on('end', function () {
				if (typeof callback === "function") {
					// Call it, since we have confirmed it is callable
					callback(fileBuffer, flag, cookies);
				}
			}).on('error', function () {

			});
		});
	if (typeof timeoutMs == "number" && timeoutMs > 0) {
		req.on('socket', function (socket) {
			socket.setTimeout(timeoutMs);
			socket.on('timeout', function () {
				req.abort();
			});
		});
		req.on('error', function (err) {
			if ( typeof timeoutCallback != 'undefined' )
				timeoutCallback(file_url, callback, flag, mode, 80, theData, timeoutMs, timeoutCallback,who);
		});
	}
	req.write(postData);
	req.end();
	}
	catch (e)
	{
		if ( typeof timeoutCallback != 'undefined' )
			timeoutCallback(file_url, callback, flag, mode, 80, theData, timeoutMs, timeoutCallback,"Invalid Url");
	}
}

function valueToXmlField( field, value)
{
    var adi = "<" + field + ">";
	adi += String(value);
	adi += "</" + field + ">";
    return adi;
}

function aclUpdateControlValue( control, value)
{
    return valueToXmlField("CMD", "<UPDATE>" + valueToXmlField("CONTROL",control) + valueToXmlField("VALUE",value))+"\r\n";

}

function aclAction( action )
{
	return valueToXmlField("CMD", "<ACTION>" + valueToXmlField("VALUE",action))+"\r\n";
}

function adifField( record, key )
{
	if ( key in record )
		return record[key];
	else 
		return "";
}
function sendACLogMessage(record, port, address)
{
	var report = "";

	report += aclAction("CLEAR");
	report += aclUpdateControlValue("TXTENTRYBAND", adifField( record, "BAND" ) );
	report += aclUpdateControlValue("TXTENTRYCALL", adifField( record, "CALL" ) );
	report += aclAction("CALLTAB");
	report += aclUpdateControlValue("TXTENTRYFREQUENCY", adifField( record, "FREQ" ) );
	if ( adifField( record, "SUBMODE").length > 0 )
		report += aclUpdateControlValue("TXTENTRYMODE", adifField( record, "SUBMODE" ) );
	else
		report += aclUpdateControlValue("TXTENTRYMODE", adifField( record, "MODE" ) );
	
	var date = adifField( record, "QSO_DATE" );
	var dataString = date.substr(0,4) + "/" + date.substr(4,2) + "/" + date.substr(6);

	report += aclUpdateControlValue("TXTENTRYDATE", dataString );	
	
	var timeVal = adifField( record, "TIME_ON" );
	var whenString = timeVal.substr(0,2) +":"+ timeVal.substr(2,2) +":"+ timeVal.substr(4,2);
	report += aclUpdateControlValue("TXTENTRYTIMEON", whenString );
	
	timeVal = adifField( record, "TIME_OFF" );
	whenString = timeVal.substr(0,2) +":"+ timeVal.substr(2,2) +":"+ timeVal.substr(4,2);
	report += aclUpdateControlValue("TXTENTRYTIMEOFF", whenString );

	report += aclUpdateControlValue("TXTENTRYRSTR", adifField( record, "RST_RCVD"	) );
	report += aclUpdateControlValue("TXTENTRYRSTS", adifField( record, "RST_SENT" ) );
	report += aclUpdateControlValue("TXTENTRYPOWER", adifField( record, "TX_PWR" ) );
	report += aclUpdateControlValue("TXTENTRYGRID", adifField( record, "GRIDSQUARE" ) );
	report += aclUpdateControlValue("TXTENTRYCOMMENTS", adifField( record, "COMMENT" ) );
	report += aclUpdateControlValue("TXTENTRYNAMER",adifField( record, "NAME" ) );
	report += aclUpdateControlValue("TXTENTRYIOTA",adifField( record, "IOTA" ) );
	report += aclUpdateControlValue("TXTENTRYCONTINENT",adifField( record, "CONT" ) );
	report += aclUpdateControlValue("TXTENTRYITUZ",adifField( record, "ITUZ" ) );
	report += aclUpdateControlValue("TXTENTRYCQZONE",adifField( record, "CQZ" ) );
	report += aclUpdateControlValue("TXTENTRYCOUNTYR",adifField( record, "CNTY" ) );
	
	
	var sentSpcNum = false;
	if ( adifField( record, "SRX" ).length > 0 )
	{
		report += aclUpdateControlValue("TXTENTRYSERIALNOR",adifField( record, "SRX" ) );
	}
	else if ( adifField( record, "CONTEST_ID" ).length > 0 )
	{
		report += aclUpdateControlValue("TXTENTRYSPCNUM",adifField( record, "SRX_STRING" ) );
		sentSpcNum = true;
		report += aclUpdateControlValue("TXTENTRYCLASS",adifField( record, "CLASS" ) );
		report += aclUpdateControlValue("TXTENTRYSECTION",adifField( record, "ARRL_SECT" ) );		  
	}
	
	if ( adifField( record, "STATE" ).length > 0 )
	{
		report += aclUpdateControlValue("TXTENTRYSTATE",adifField( record, "STATE" ) );
		if ( sentSpcNum == false )
			report += aclUpdateControlValue("TXTENTRYSPCNUM",adifField( record, "STATE" ) );
	}
		
	report += aclAction("ENTER");

	sendTcpMessage(report, report.length, port, address);
}

function sendDXKeeperLogMessage(newMessage, port, address)
{
	var report = "";
	
	report += valueToAdiField("command", "log" );
	report += valueToAdiField("parameters", newMessage );
	report += "\r\n";
	
	sendTcpMessage(report, report.length, Number(port)+1, address);
}

function parseADIFRecord( adif )
{
	var regex = new RegExp( '<EOR>', 'i');
	var newLine = adif.split(regex);
	var line = newLine[0].trim();  // Catch the naughty case of someone sending two records at the same time
	var record = {};

	// because strings are not escaped for adif.. ie:  :'s and <'s .. we have to walk from left to right 
	// cheesy, but damn i'm tired of parsing things
	var x = 0;
	while ( line.length > 0 )
	{
		while ( line.charAt(0) != "<" && line.length > 0)
		{
			line = line.substr(1);
		}
		if ( line.length > 0 )
		{
			line = line.substr(1);
			var where = line.indexOf(":");
			if ( where != -1 )
			{
				var fieldName = line.substr(0,where).toUpperCase();
				line = line.substr(fieldName.length+1);
				var fieldLength = parseInt(line);
				var end = line.indexOf(">");
				if ( end > 0 )
				{
					line = line.substr(end+1);
					var fieldValue = line.substr(0,fieldLength);
					line = line.substr(fieldLength);
					record[fieldName] = fieldValue;
				}
			}
		}		
	}
	
	return record;
}

function sendHRDLogbookEntry(report, port, address)
{
	var command = "ver\rdb add {";
	var items = Object.assign({},  report ); 

	items["FREQ"] = items["FREQ"].split(".").join("");

	
	for ( var item in items )
	{
		command += item + '="' + items[item] + '" ' ;
	}
	
	command += "}\rexit\r";
	
	sendTcpMessage(command, command.length, Number(port), address);
}