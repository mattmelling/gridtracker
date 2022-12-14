function processRosterHunting(callRoster, rosterSettings, awardTracker)
{
  // these lets, do they rely on anything between the top and here?
  // if not could they be put in the let list at the beginning?
  let hasGtPin = false;

  let inversionAlpha = "DD";
  let row = "#000000";
  let bold = "#000000;font-weight: bold;";
  let unconf = "background-clip:padding-box;box-shadow: 0 0 7px 3px inset ";
  let layeredAlpha = "77";
  let layeredInversionAlpha = "66";
  let layeredUnconf = "background-clip:padding-box;box-shadow: 0 0 4px 2px inset ";
  let layeredUnconfAlpha = "AA";

  const currentYear = new Date().getFullYear();
  const currentYearSuffix = `&rsquo;${currentYear - 2000}`;
  const potaEnabled = (window.opener.g_appSettings.potaEnabled === 1);
  // TODO: Hunting results might be used to filter, based on the "Callsigns: Only Wanted" option,
  //       so maybe we can move this loop first, and add a check to the filtering loop?

  // Second loop, hunting and highlighting
  for (const callHash in callRoster)
  {
    let entry = callRoster[callHash];
    let callObj = entry.callObj;

    // Special case check for called station
    if (callObj.qrz == true && entry.tx == false)
    {
      // The instance has to be enabled
      if (window.opener.g_instances[callObj.instance].crEnable == true)
      {
        // Calling us, but we wouldn't normally display
        // If they are not ignored or we're in a QSO with them, let it through

        // TODO: This is here because it's after the filtering stage
        if ((!(entry.DEcall in g_blockedCalls) && !(callObj.dxcc in g_blockedDxcc)) ||
          window.opener.g_instances[callObj.instance].status.DXcall == entry.DEcall)
        {
          entry.tx = true;
        }
      }
    }

    // Only render entries with `tx == true`, ignore the rest
    if (entry.tx == true)
    {
      // In layered mode ("Hunting: mixed") the workHashSuffix becomes a more stricter 'live band',
      // while the layered suffix is a broader 'mixed band'
      let workHashSuffix, layeredHashSuffix;
      if (rosterSettings.layeredMode)
      {
        workHashSuffix = hashMaker("", callObj, rosterSettings.layeredMode);
        layeredHashSuffix = hashMaker("", callObj, g_rosterSettings.reference);
      }
      else
      {
        workHashSuffix = hashMaker("", callObj, g_rosterSettings.reference);
        layeredHashSuffix = false
      }
      let workHash = workHashSuffix; // TODO: Remove after replacing all occurrences with Suffix

      let callsign = entry.DEcall;

      callObj.hunting = {}
      callObj.callFlags = {}
      callObj.style = callObj.style || {}
      callObj.DEcallHTML = callObj.DEcall

      let colorObject = Object();

      let callPointer = callObj.CQ == true ? "cursor:pointer" : "";

      let didWork = false;

      let call = "#FFFF00";
      let grid = "#00FFFF";
      let calling = "#90EE90";
      let dxcc = "#FFA500";
      let state = "#90EE90";
      let cnty = "#CCDD00";
      let cont = "#00DDDD";
      let pota = "#fbb6fc";
      let cqz = "#DDDDDD";
      let ituz = "#DDDDDD";
      let wpx = "#FFFF00";

      hasGtPin = false;
      let shouldAlert = false;
      let callBg, gridBg, callingBg, dxccBg, stateBg, cntyBg, contBg, potaBg, cqzBg, ituzBg, wpxBg, gtBg;
      let callConf, gridConf, callingConf, dxccConf, stateConf, cntyConf, contConf, potaConf, cqzConf, ituzConf, wpxConf;

      callBg = gridBg = callingBg = dxccBg = stateBg = cntyBg = contBg = potaBg = cqzBg = ituzBg = wpxBg = gtBg = row;

      callConf = gridConf = callingConf = dxccConf = stateConf = cntyConf = contConf = potaConf = cqzConf = ituzConf = wpxConf =
        "";

      let cntyPointer = (callObj.cnty && callObj.qual == false) ? "cursor: pointer;" : "";

      let hash = callsign + workHashSuffix;
      let layeredHash = layeredHashSuffix && (callsign + layeredHashSuffix)

      // Call worked in current logbook settings, regardless of hunting mode
      if (hash in g_worked.call)
      {
        callObj.callFlags.worked = true;
        didWork = true;
        callConf = `${unconf}${call}${inversionAlpha};`;

        if (hash in g_confirmed.call)
        {
          callObj.callFlags.confirmed = true;
          callPointer = "text-decoration: line-through; ";
          callConf = "";
        }
      }

      // Calls that have OAMS chat support
      if (callsign in window.opener.g_gtCallsigns)
      {
        callObj.gt = 0;
        for (const cid in window.opener.g_gtCallsigns[callsign])
        {
          if (cid in window.opener.g_gtFlagPins && window.opener.g_gtFlagPins[cid].canmsg == true)
          {
            // found the first one we can message, break now
            callObj.callFlags.oams = true;
            callObj.gt = cid;
            hasGtPin = true;
            break;
          }
        }
      }
      else
      {
        callObj.gt = 0;
      }

      // We only do hunt highlighting when showing all entries
      // This means "Callsigns: All Traffic", "Callsigns: All Traffic/Only Wanted"
      // There is no highlighting in other modes
      if (rosterSettings.callMode == "all")
      {
        // Skip when "only new calls"
        // Questions: Move to the first loop? Why only skip new calls in "all traffic" and not other modes?
        if (allOnlyNew.checked == true && didWork && callObj.qrz == false)
        {
          entry.tx = false;
          continue;
        }

        // Special Calls
        if (callObj.DEcall.match("^[A-Z][0-9][A-Z](/w+)?$"))
        {
          callObj.style.call = "class='oneByOne'";
        }

        // Entries currently calling or being called by us
        if (callObj.DEcall == window.opener.g_instances[callObj.instance].status.DXcall)
        {
          if (window.opener.g_instances[callObj.instance].status.TxEnabled == 1)
          {
            callObj.hunting.call = "calling";
            callObj.style.call = "class='dxCalling'";
          }
          else
          {
            callObj.hunting.call = "caller";
            callObj.style.call = "class='dxCaller'";
          }
        }

        // award tracker overrides
        let awardTrackerOverrides = {
          call: false,
          grids: false,
          dxcc: false,
          states: false,
          cnty: false,
          cqz: false,
          px: false,
          cont: false
        };
        if (g_rosterSettings.reference == LOGBOOK_AWARD_TRACKER)
        {
          for (let key in awardTracker)
          {
            if (awardTracker[key].enable)
            {
              awardTrackerOverrides[awardTracker[key].rule.type] = true;
            }
          }
        }

        // Hunting for callsigns
        if (huntCallsign.checked || awardTrackerOverrides.call)
        {
          let hash = callsign + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (callsign + layeredHashSuffix)

          if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.call))
          {
            shouldAlert = true;
            callObj.reason.push("call");

            if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.call)
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.call)
              {
                callObj.hunting.call = "worked-and-mixed";
                callConf = `${layeredUnconf}${call}${layeredUnconfAlpha};`;
                callBg = `${call}${layeredInversionAlpha}`;
                call = bold;
              }
              // /* Currently we don't have a way to figure out
              //  * if the call is worked only in this band or also others,
              //  * so we cannot cover this particular combination
              //  * and have to default to just showing it as plain "worked"
              //  */
              // else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.call)
              // {
              //   callObj.hunting.call = "worked-and-mixed-worked";
              //   callConf = `${layeredUnconf}${call}${layeredAlpha};`;
              // }
              else
              {
                callObj.hunting.call = "worked";
                callConf = `${unconf}${call}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.call)
              {
                callObj.hunting.call = "mixed";
                callBg = `${call}${layeredAlpha};`;
                call = bold;
              }
              else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.call)
              {
                callObj.hunting.call = "mixed-worked";
                callConf = `${unconf}${call}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.call = "hunted";
                callBg = `${call}${inversionAlpha};`;
                call = bold;
              }
            }
          }
        }

        if (huntRegex.checked == true && g_rosterSettings.huntRegexValue.length > 0)
        {
          var huntRegexObj = huntRegexObj || new RegExp(g_rosterSettings.huntRegexValue, "gi")
          try
          {
            if (callsign.match(huntRegexObj))
            {
              shouldAlert = true;
              callObj.reason.push("regex");
              callObj.hunting.regex = "hunted";
              callObj.DEcallHTML = callsign.replace(huntRegexObj, (x, y) => `<span class='regexMatch'>${x}</span>`)
              if (!callObj.hunting.call && !callObj.callFlags.worked)
              {
                callBg = `${call}${inversionAlpha};`;
                call = bold;
              }
            }
          }
          catch (e) {}
        }

        // Hunting for "stations calling you"
        if (huntQRZ.checked == true && callObj.qrz == true)
        {
          callObj.callFlags.calling = true
          callObj.hunting.qrz = "hunted";
          shouldAlert = true;
          callObj.reason.push("qrz");
        }

        // Hunting for stations with OAMS
        if (huntOAMS.checked == true && hasGtPin == true)
        {
          callObj.hunting.oams = "hunted";
          shouldAlert = true;
          callObj.reason.push("oams");
        }

        // Hunting for grids
        if ((huntGrid.checked || awardTrackerOverrides.grids) && callObj.grid.length > 1)
        {
          let hash = callObj.grid.substr(0, 4) + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (callObj.grid.substr(0, 4) + layeredHashSuffix)

          if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.grid))
          {
            shouldAlert = true;
            callObj.reason.push("grid");

            if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.grid)
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.grid)
              {
                callObj.hunting.grid = "worked-and-mixed";
                gridConf = `${layeredUnconf}${grid}${layeredUnconfAlpha};`;
                gridBg = `${grid}${layeredInversionAlpha}`;
                grid = bold;
              }
              else
              {
                callObj.hunting.grid = "worked";
                gridConf = `${unconf}${grid}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.grid)
              {
                callObj.hunting.grid = "mixed";
                gridBg = `${grid}${layeredAlpha};`;
                grid = bold;
              }
              else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.grid)
              {
                callObj.hunting.grid = "mixed-worked";
                gridConf = `${unconf}${grid}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.grid = "hunted";
                gridBg = `${grid}${inversionAlpha};`;
                grid = bold;
              }
            }
          }
        }

        // Hunting for DXCC
        if (huntDXCC.checked || awardTrackerOverrides.dxcc)
        {
          let hash = String(callObj.dxcc) + "|" + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (String(callObj.dxcc) + "|" + layeredHashSuffix)

          if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.dxcc))
          {
            shouldAlert = true;
            callObj.reason.push("dxcc");

            if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.dxcc)
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.dxcc)
              {
                callObj.hunting.dxcc = "worked-and-mixed";
                dxccConf = `${layeredUnconf}${dxcc}${layeredUnconfAlpha};`;
                dxccBg = `${dxcc}${layeredInversionAlpha}`;
                dxcc = bold;
              }
              else
              {
                callObj.hunting.dxcc = "worked";
                dxccConf = `${unconf}${dxcc}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.dxcc)
              {
                callObj.hunting.dxcc = "mixed";
                dxccBg = `${dxcc}${layeredAlpha};`;
                dxcc = bold;
              }
              else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.dxcc)
              {
                callObj.hunting.dxcc = "mixed-worked";
                dxccConf = `${unconf}${dxcc}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.dxcc = "hunted";
                dxccBg = `${dxcc}${inversionAlpha};`;
                dxcc = bold;
              }
            }
          }

          callObj.dxccSuffix = null
          if (huntMarathon.checked && callObj.hunting.dxcc != "hunted" && callObj.hunting.dxcc != "checked")
          {
            callObj.reason.push("dxcc-marathon");

            let hash = `${callObj.dxcc}-${currentYear}`;
            if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.dxcc))
            {
              if (!rosterSettings.workedIndex || !(hash in rosterSettings.workedIndex.dxcc))
              {
                callObj.dxccSuffix = currentYearSuffix;

                callObj.hunting.dxccMarathon = "hunted";
                if (!callObj.hunting.dxcc)
                {
                  dxccConf = `${unconf}${dxcc}${layeredAlpha};`;
                }
              }
            }
          }
        }

        // Hunting for US States
        if ((huntState.checked || awardTrackerOverrides.states) && window.opener.g_callsignLookups.ulsUseEnable == true)
        {
          let stateSearch = callObj.state;
          let finalDxcc = callObj.dxcc;
          if (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6)
          {
            if (stateSearch in window.opener.g_StateData)
            {
              let hash = stateSearch + workHashSuffix;
              let layeredHash = rosterSettings.layeredMode && (stateSearch + layeredHashSuffix)

              if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.state))
              {
                shouldAlert = true;
                callObj.reason.push("state");

                if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.state)
                {
                  if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.state)
                  {
                    callObj.hunting.state = "worked-and-mixed";
                    stateConf = `${layeredUnconf}${state}${layeredUnconfAlpha};`;
                    stateBg = `${state}${layeredInversionAlpha}`;
                    state = bold;
                  }
                  else
                  {
                    callObj.hunting.state = "worked";
                    stateConf = `${unconf}${state}${inversionAlpha};`;
                  }
                }
                else
                {
                  if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.state)
                  {
                    callObj.hunting.state = "mixed";
                    stateBg = `${state}${layeredAlpha};`;
                    state = bold;
                  }
                  else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.state)
                  {
                    callObj.hunting.state = "mixed-worked";
                    stateConf = `${unconf}${state}${layeredAlpha};`;
                  }
                  else
                  {
                    callObj.hunting.state = "hunted";
                    stateBg = `${state}${inversionAlpha};`;
                    state = bold;
                  }
                }
              }
            }
          }
        }

        // Hunting for US Counties
        if ((huntCounty.checked || awardTrackerOverrides.cnty) && window.opener.g_callsignLookups.ulsUseEnable == true)
        {
          let finalDxcc = callObj.dxcc;
          if (
            callObj.cnty &&
            (finalDxcc == 291 || finalDxcc == 110 || finalDxcc == 6 || finalDxcc == 202) &&
            callObj.cnty.length > 0
          )
          {
            let hash = callObj.cnty + (rosterSettings.layeredMode ? layeredHashSuffix : workHashSuffix);

            if ((rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.cnty)) || callObj.qual == false)
            {
              if (callObj.qual == false)
              {
                let counties = window.opener.g_zipToCounty[callObj.zipcode];
                let foundHit = false;
                for (const cnt in counties)
                {
                  let hh = counties[cnt] + workHash;
                  callObj.cnty = counties[cnt];
                  if (rosterSettings.huntIndex && !(hh in rosterSettings.huntIndex.cnty))
                  {
                    foundHit = true;
                    break;
                  }
                }
                if (foundHit) shouldAlert = true;
              }
              else
              {
                shouldAlert = true;
              }

              if (shouldAlert)
              {
                callObj.reason.push("cnty");

                if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.cnty)
                {
                  callObj.hunting.cnty = "worked";
                  cntyConf = `${unconf}${cnty}${inversionAlpha};`;
                }
                else
                {
                  callObj.hunting.cnty = "hunted";
                  cntyBg = `${cnty}${inversionAlpha}`;
                  cnty = bold;
                }
              }
            }
          }
        }

        // Hunting for POTAs
        if (potaEnabled && huntPOTA.checked == true && callObj.pota)
        {
          let huntTotal = 1;
          let workedFound = 0;

          let hash = g_dayAsString + callsign + callObj.pota + (rosterSettings.layeredMode ? layeredHashSuffix : workHashSuffix);

          if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.pota) workedFound++;
          
          if (workedFound != huntTotal)
          {
            shouldAlert = true;
            callObj.reason.push("pota");

            callObj.hunting.pota = "hunted";
            potaBg = `${pota}${inversionAlpha};`;
            pota = bold;
          }
        }

        // Hunting for CQ Zones
        if ((huntCQz.checked || awardTrackerOverrides.cqz) && callObj.cqz)
        {
          let huntTotal = 1;
          let huntFound = 0, layeredFound = 0, workedFound = 0, layeredWorkedFound = 0, marathonFound = 0;
          let hash = callObj.cqz + "|" + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (callObj.cqz + "|" + layeredHashSuffix);
          let marathonHash = huntMarathon.checked && `${callObj.cqz}-${currentYear}`;

          if (rosterSettings.huntIndex && hash in rosterSettings.huntIndex.cqz) huntFound++;
          if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.cqz) layeredFound++;
          if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.cqz) workedFound++;
          if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.cqz) layeredWorkedFound++;
          if (marathonHash)
          {
            if (rosterSettings.huntIndex && marathonHash in rosterSettings.huntIndex.cqz) marathonFound++;
            else if (rosterSettings.workedIndex && marathonHash in rosterSettings.workedIndex.cqz) marathonFound++;
          }

          if (huntFound != huntTotal)
          {
            shouldAlert = true;
            callObj.reason.push("cqz");

            if (rosterSettings.workedIndex && workedFound == huntTotal)
            {
              if (rosterSettings.layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.cqz = "worked-and-mixed";
                cqzConf = `${layeredUnconf}${cqz}${layeredUnconfAlpha};`;
                cqzBg = `${cqz}${layeredInversionAlpha}`;
                cqz = bold;
              }
              else
              {
                callObj.hunting.cqz = "worked";
                cqzConf = `${unconf}${cqz}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.cqz = "mixed";
                cqzBg = `${cqz}${layeredAlpha};`;
                cqz = bold;
              }
              else if (rosterSettings.layeredMode && layeredWorkedFound == huntTotal)
              {
                callObj.hunting.cqz = "mixed-worked";
                cqzConf = `${unconf}${cqz}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.cqz = "hunted";
                cqzBg = `${cqz}${inversionAlpha};`;
                cqz = bold;
              }
            }
          }

          callObj.cqzSuffix = null;
          if (huntMarathon.checked && callObj.hunting.cqz != "hunted" && callObj.hunting.cqz != "worked")
          {
            if (marathonFound != huntTotal)
            {
              callObj.reason.push("cqz-marathon");

              callObj.cqzSuffix = currentYearSuffix;

              callObj.hunting.cqzMarathon = "hunted";
              if (!callObj.hunting.cqz)
              {
                cqzConf = `${unconf}${cqz}${layeredAlpha};`;
              }
            }
          }
        }

        // Hunting for ITU Zones
        if (huntITUz.checked == true && callObj.ituz)
        {
          let huntTotal = 1;
          let huntFound = 0, layeredFound = 0, workedFound = 0, layeredWorkedFound = 0;
          let hash = callObj.ituz + "|" + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (callObj.ituz + "|" + layeredHashSuffix)

          if (rosterSettings.huntIndex && hash in rosterSettings.huntIndex.ituz) huntFound++;
          if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.ituz) layeredFound++;
          if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.ituz) workedFound++;
          if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.ituz) layeredWorkedFound++;

          if (huntFound != huntTotal)
          {
            shouldAlert = true;
            callObj.reason.push("ituz");

            if (rosterSettings.workedIndex && workedFound == huntTotal)
            {
              if (rosterSettings.layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.ituz = "worked-and-mixed";
                ituzConf = `${layeredUnconf}${ituz}${layeredUnconfAlpha};`;
                ituzBg = `${ituz}${layeredInversionAlpha}`;
                ituz = bold;
              }
              else
              {
                callObj.hunting.ituz = "worked";
                ituzConf = `${unconf}${ituz}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredFound == huntTotal)
              {
                callObj.hunting.ituz = "mixed";
                ituzBg = `${ituz}${layeredAlpha};`;
                ituz = bold;
              }
              else if (rosterSettings.layeredMode && layeredWorkedFound == huntTotal)
              {
                callObj.hunting.ituz = "mixed-worked";
                ituzConf = `${unconf}${ituz}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.ituz = "hunted";
                ituzBg = `${ituz}${inversionAlpha};`;
                ituz = bold;
              }
            }
          }
        }

        // Hunting for WPX (Prefixes)
        if ((huntPX.checked || awardTrackerOverrides.px) && callObj.px)
        {
          let hash = String(callObj.px) + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (String(callObj.px) + layeredHashSuffix)

          if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.px))
          {
            shouldAlert = true;
            callObj.reason.push("wpx");

            if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.px)
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.px)
              {
                callObj.hunting.wpx = "worked-and-mixed";
                wpxConf = `${layeredUnconf}${wpx}${layeredUnconfAlpha};`;
                wpxBg = `${wpx}${layeredInversionAlpha}`;
                wpx = bold;
              }
              else
              {
                callObj.hunting.wpx = "worked";
                wpxConf = `${unconf}${wpx}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.px)
              {
                callObj.hunting.wpx = "mixed";
                wpxBg = `${wpx}${layeredAlpha};`;
                wpx = bold;
              }
              else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.px)
              {
                callObj.hunting.wpx = "mixed-worked";
                wpxConf = `${unconf}${wpx}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.wpx = "hunted";
                wpxBg = `${wpx}${inversionAlpha};`;
                wpx = bold;
              }
            }
          }
        }

        // Hunting for Continents
        if ((huntCont.checked || awardTrackerOverrides.cont) && callObj.cont)
        {
          let hash = String(callObj.cont) + workHashSuffix;
          let layeredHash = rosterSettings.layeredMode && (String(callObj.cont) + layeredHashSuffix)

          if (rosterSettings.huntIndex && !(hash in rosterSettings.huntIndex.cont))
          {
            shouldAlert = true;
            callObj.reason.push("cont");

            if (rosterSettings.workedIndex && hash in rosterSettings.workedIndex.cont)
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.cont)
              {
                callObj.hunting.cont = "worked-and-mixed";
                contConf = `${layeredUnconf}${cont}${layeredUnconfAlpha};`;
                contBg = `${cont}${layeredInversionAlpha}`;
                cont = bold;
              }
              else
              {
                callObj.hunting.cont = "worked";
                contConf = `${unconf}${cont}${inversionAlpha};`;
              }
            }
            else
            {
              if (rosterSettings.layeredMode && layeredHash in rosterSettings.huntIndex.cont)
              {
                callObj.hunting.cont = "mixed";
                contBg = `${cont}${layeredAlpha};`;
                cont = bold;
              }
              else if (rosterSettings.layeredMode && layeredHash in rosterSettings.workedIndex.cont)
              {
                callObj.hunting.cont = "mixed-worked";
                contConf = `${unconf}${cont}${layeredAlpha};`;
              }
              else
              {
                callObj.hunting.cont = "hunted";
                contBg = `${cont}${inversionAlpha};`;
                cont = bold;
              }
            }
          }
        }
      }

      // Station is calling us
      if (callObj.DXcall == window.opener.myDEcall)
      {
        callingBg = "#0000FF" + inversionAlpha;
        calling = "#FFFF00;text-shadow: 0px 0px 2px #FFFF00";
      }
      else if ((callObj.CQ == true || (g_rosterSettings.wantRRCQ && callObj.RR73 == true)) && !g_rosterSettings.cqOnly)
      {
        callingBg = calling + inversionAlpha;
        calling = bold;
        // If treating RR73/73 as CQ, soften highlighting to help differentiate foreshadow from an actual CQ
        if (g_rosterSettings.wantRRCQ && callObj.RR73 == true)
        {
          callingConf = `${unconf}#90EE90${inversionAlpha};`;
          calling = `#90EE90${inversionAlpha};`
          callingBg = "#000000"
        }
      }

      // Assemble all styles
      colorObject.call = "style='" + callConf + "background-color:" + callBg + ";color:" +
        call + ";" + callPointer + "'";
      colorObject.grid = "style='" + gridConf + "background-color:" + gridBg + ";color:" + grid + ";cursor:pointer'";
      colorObject.calling = "style='" + callingConf + "background-color:" + callingBg + ";color:" + calling + "'";
      colorObject.dxcc = "style='" + dxccConf + "background-color:" + dxccBg + ";color:" + dxcc + "'";
      colorObject.state = "style='" + stateConf + "background-color:" + stateBg + ";color:" + state + "'";
      colorObject.cnty = "style='" + cntyConf + "background-color:" + cntyBg + ";color:" + cnty + ";" + cntyPointer + "'";
      colorObject.pota = "style='" + potaConf + "background-color:" + potaBg + ";color:" + pota + "'";
      colorObject.cont = "style='" + contConf + "background-color:" + contBg + ";color:" + cont + "'";
      colorObject.cqz = "style='" + cqzConf + "background-color:" + cqzBg + ";color:" + cqz + "'";
      colorObject.ituz = "style='" + ituzConf + "background-color:" + ituzBg + ";color:" + ituz + "'";
      colorObject.px = "style='" + wpxConf + "background-color:" + wpxBg + ";color:" + wpx + "'";

      // Just in case, don't alert if we worked this callsign alread
      if (didWork && shouldAlert) shouldAlert = false;

      // callObj.shouldAlert ||= shouldAlert; // eslint doesn't like this, why?

      // If alert was set (award tracker), don't clear it
      if (!callObj.shouldAlert)
      {
        callObj.shouldAlert = shouldAlert;
      }

      callObj.style = colorObject;

      if (g_rosterSettings.columns.Spot)
      {
        callObj.spot = window.opener.getSpotTime(
          callObj.DEcall + callObj.mode + callObj.band + callObj.grid
        );
        if (callObj.spot == null)
        {
          callObj.spot = { when: 0, snr: 0 };
        }
      }
      else
      {
        callObj.spot = { when: 0, snr: 0 };
      }

      rosterSettings.modes[callObj.mode] = true;
      rosterSettings.bands[callObj.band] = true;
    }
  }
}
