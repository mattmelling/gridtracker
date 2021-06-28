function processRosterFiltering(callRoster, rosterSettings)
{
  // First loop, exclude calls, mostly based on "Exceptions" settings
  // this whole section is full of individual if's that could be broken out
  for (var callHash in callRoster)
  {
    var entry = callRoster[callHash];
    var callObj = entry.callObj;

    var call = entry.DEcall;

    entry.tx = true;
    callObj.shouldAlert = false;
    callObj.reason = Array();
    callObj.awardReason = "Callsign";

    if (now - callObj.age > window.opener.g_mapSettings.rosterTime)
    {
      entry.tx = false;
      entry.alerted = false;
      callObj.qrz = false;
      callObj.reset = true;
      continue;
    }
    if (window.opener.g_instances[callObj.instance].crEnable == false)
    {
      entry.tx = false;
      continue;
    }
    if (call in g_blockedCalls)
    {
      entry.tx = false;
      continue;
    }
    if (
      entry.DXcall + " from All" in g_blockedCQ ||
      entry.DXcall + " from " + window.opener.g_dxccToAltName[callObj.dxcc] in g_blockedCQ
    )
    {
      entry.tx = false;
      continue;
    }
    if (callObj.dxcc in g_blockedDxcc)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.cqOnly == true && callObj.CQ == false)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.useRegex && g_rosterSettings.callsignRegex.length > 0)
    {
      try
      {
        if (!call.match(g_rosterSettings.callsignRegex))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }
    if (g_rosterSettings.requireGrid == true && callObj.grid.length != 4)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMinDB == true && entry.message.SR < g_rosterSettings.minDb)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMaxDT == true && Math.abs(entry.message.DT) > g_rosterSettings.maxDT)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMinFreq == true && entry.message.DF < g_rosterSettings.minFreq)
    {
      entry.tx = false;
      continue;
    }
    if (g_rosterSettings.wantMaxFreq == true && entry.message.DF > g_rosterSettings.maxFreq)
    {
      entry.tx = false;
      continue;
    }

    if (g_rosterSettings.noMsg == true)
    {
      try
      {
        if (callObj.msg.match(g_rosterSettings.noMsgValue))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }
    if (g_rosterSettings.onlyMsg == true)
    {
      try
      {
        if (!callObj.msg.match(g_rosterSettings.onlyMsgValue))
        {
          entry.tx = false;
          continue;
        }
      }
      catch (e) {}
    }

    if (callObj.dxcc == window.opener.g_myDXCC)
    {
      if (g_rosterSettings.noMyDxcc == true)
      {
        entry.tx = false;
        continue;
      }
    }
    else
    {
      if (g_rosterSettings.onlyMyDxcc == true)
      {
        entry.tx = false;
        continue;
      }
    }

    if (window.opener.g_callsignLookups.lotwUseEnable == true && g_rosterSettings.usesLoTW == true)
    {
      if (!(call in window.opener.g_lotwCallsigns))
      {
        entry.tx = false;
        continue;
      }
      if (g_rosterSettings.maxLoTW < 27)
      {
        var months = (g_day - window.opener.g_lotwCallsigns[call]) / 30;
        if (months > g_rosterSettings.maxLoTW)
        {
          entry.tx = false;
          continue;
        }
      }
    }

    if (window.opener.g_callsignLookups.eqslUseEnable == true && g_rosterSettings.useseQSL == true)
    {
      if (!(call in window.opener.g_eqslCallsigns))
      {
        entry.tx = false;
        continue;
      }
    }

    if (window.opener.g_callsignLookups.oqrsUseEnable == true && g_rosterSettings.usesOQRS == true)
    {
      if (!(call in window.opener.g_oqrsCallsigns))
      {
        entry.tx = false;
        continue;
      }
    }

    if (callMode != "all")
    {
      if (entry.DXcall == "CQ DX" && callObj.dxcc == window.opener.g_myDXCC)
      {
        entry.tx = false;
        continue;
      }

      var hash = hashMaker(call, callObj, g_rosterSettings.reference);
      if (callMode == "worked" && hash in g_worked.call)
      {
        entry.tx = false;
        continue;
      }
      if (callMode == "confirmed" && hash in g_confirmed.call)
      {
        entry.tx = false;
        continue;
      }

      if (g_rosterSettings.hunting == "grid")
      {
        var hash = hashMaker(callObj.grid.substr(0, 4),
          callObj, g_rosterSettings.reference);
        if (huntIndex && hash in huntIndex.grid)
        {
          entry.tx = false;
          continue;
        }
        if (callObj.grid.length == 0)
        {
          entry.tx = false;
          continue;
        }
        continue;
      }
      if (g_rosterSettings.hunting == "dxcc")
      {
        var hash = hashMaker(String(callObj.dxcc),
          callObj, g_rosterSettings.reference);

        if (huntIndex && (hash in huntIndex.dxcc))
        {
          entry.tx = false;
          continue;
        }
        continue;
      }

      if (callObj.dxcc === -1)
      {
        entry.tx = false;
        continue;
      }

      if (g_rosterSettings.hunting == "dxccs" && r_currentDXCCs != -1)
      {
        if (callObj.dxcc != r_currentDXCCs)
        {
          entry.tx = false;
          continue;
        }
      }

      if (g_rosterSettings.hunting == "wpx")
      {
        if (String(callObj.px) == null)
        {
          entry.tx = false;
          continue;
        }
        var hash = hashMaker(String(callObj.px),
          callObj, g_rosterSettings.reference);

        if (huntIndex && (hash in huntIndex.px))
        {
          entry.tx = false;
          continue;
        }

        continue;
      }

      if (g_rosterSettings.hunting == "cq")
      {
        var huntTotal = callObj.cqza.length;
        if (huntTotal == 0 || !huntIndex)
        {
          entry.tx = false;
          continue;
        }
        var huntFound = 0;
        for (index in callObj.cqza)
        {
          var hash = hashMaker(callObj.cqza[index], callObj, g_rosterSettings.reference);

          if (hash in huntIndex.cqz) huntFound++;
        }
        if (huntFound == huntTotal)
        {
          entry.tx = false;
          continue;
        }
        continue;
      }

      if (g_rosterSettings.hunting == "itu")
      {
        var huntTotal = callObj.ituza.length;
        if (huntTotal == 0 || !huntIndex)
        {
          entry.tx = false;
          continue;
        }
        var huntFound = 0;
        for (index in callObj.ituza)
        {
          var hash = hashMaker(callObj.ituza[index], callObj, g_rosterSettings.reference);

          if (hash in huntIndex.ituz) huntFound++;
        }
        if (huntFound == huntTotal)
        {
          entry.tx = false;
          continue;
        }

        if (callObj.grid.length == 0)
        {
          entry.tx = false;
          continue;
        }
        continue;
      }

      if (g_rosterSettings.hunting == "usstates" && window.opener.g_callsignLookups.ulsUseEnable == true)
      {
        var state = callObj.state;
        var finalDxcc = callObj.dxcc;
        if (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6)
        {
          if (state in window.opener.g_StateData)
          {
            var hash = hashMaker(state, callObj, g_rosterSettings.reference);

            if (huntIndex && hash in huntIndex.state)
            {
              entry.tx = false;
              continue;
            }
          }
          else entry.tx = false;
        }
        else entry.tx = false;

        continue;
      }

      if (g_rosterSettings.hunting == "usstate" && g_currentUSCallsigns)
      {
        if (call in g_currentUSCallsigns)
        {
          // Do Nothing
        }
        else
        {
          entry.tx = false;
          continue;
        }
        continue;
      }
    }
    if (isAwardTracker)
    {
      var tx = false;
      var baseHash = hashMaker("", callObj, g_rosterSettings.reference);

      for (var award in g_awardTracker)
      {
        if (g_awardTracker[award].enable)
        {
          tx = testAward(award, callObj, baseHash);
          if (tx)
          {
            var x = g_awardTracker[award];

            // TODO: Move award reason out of exclusions code?
            callObj.awardReason =
              g_awards[x.sponsor].awards[x.name].tooltip +
              " (" +
              g_awards[x.sponsor].sponsor +
              ")";

            break;
          }
        }
      }
      entry.tx = tx;
    }
  }
}
