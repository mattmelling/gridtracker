var picker = {
  attach: function (opt)
  {
  // attach() : attach datepicker to target
  //   opt : options (object)
  //     target : datepicker will populate this field
  //     container : datepicker will be generated in this container
  //     startmon : start on Monday (default false)
  //     disableday : array of days to disable, e.g. [2,7] to disable Tue and Sun

    // (A) Create new datepicker
    var dp = document.createElement("div");
    dp.dataset.target = opt.target;
    dp.dataset.fire = opt.fire;
    dp.dataset.startmon = opt.startmon ? "1" : "0";
    dp.classList.add("picker");
    if (opt.disableday)
    {
      dp.dataset.disableday = JSON.stringify(opt.disableday);
    }

    // (B) Default to current month + year
    // ! NOTE: UTC+0 !
    var today = new Date(),
      thisMonth = today.getUTCMonth(), // Note: Jan is 0
      thisYear = today.getUTCFullYear(),
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // (C) Month select
    var select = document.createElement("select"),
      option = null;
    select.classList.add("picker-m");
    for (var mth in months)
    {
      option = document.createElement("option");
      option.value = parseInt(mth) + 1;
      option.text = months[mth];
      select.appendChild(option);
    }
    select.selectedIndex = thisMonth;
    select.addEventListener("change", function() { picker.draw(this); });
    dp.appendChild(select);

    // (D) Year select
    var yRange = 100; // Year range to show, I.E. from thisYear-yRange to thisYear+yRange
    select = document.createElement("select");
    select.classList.add("picker-y");
    for (var y = thisYear - yRange; y < thisYear + 20; y++)
    {
      option = document.createElement("option");
      option.value = y;
      option.text = y;
      select.appendChild(option);
    }
    select.selectedIndex = yRange;
    select.addEventListener("change", function() { picker.draw(this); });
    dp.appendChild(select);

    // (E) Day select
    var days = document.createElement("div");
    days.classList.add("picker-d");
    dp.appendChild(days);

    // (F) Attach date picker to target container + draw the dates
    picker.draw(select);

    // (F1) Popup datepicker
    if (opt.container == 1)
    {
      // Mark this as a "popup"
      var uniqueID = 0;
      while (document.getElementById("picker-" + uniqueID) != null)
      {
        uniqueID = Math.floor(Math.random() * (100 - 2)) + 1;
      }
      dp.dataset.popup = "1";
      dp.dataset.dpid = uniqueID;

      // Create wrapper
      var wrapper = document.createElement("div");
      wrapper.id = "picker-" + uniqueID;
      wrapper.classList.add("picker-wrap");
      wrapper.appendChild(dp);

      // Attach onclick to show/hide datepicker
      var target = document.getElementById(opt.target);
      target.dataset.dp = uniqueID;
      target.onfocus = function ()
      {
        document.getElementById("picker-" + this.dataset.dp).classList.add("show");
      };
      wrapper.addEventListener("click", function (evt)
      {
        if (evt.target.classList.contains("picker-wrap"))
        {
          this.classList.remove("show");
        }
      });

      // Attach popup datepicker to document
      document.documentElement.appendChild(wrapper);
    }

    // (F2) Inline datepicker
    else
    {
      document.getElementById(opt.container).appendChild(dp);
    }
  },

  draw: function (el)
  {
  // draw() : draw the days in month
  //   el : HTML reference to either year or month selector

    // (A) Get date picker components
    var parent = el.parentElement,
      year = parent.getElementsByClassName("picker-y")[0].value,
      month = parent.getElementsByClassName("picker-m")[0].value,
      days = parent.getElementsByClassName("picker-d")[0];

    // (B) Date range calculation
    // ! NOTE: UTC+0 !
    var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate(),
      startDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(), // Note: Sun = 0
      endDay = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay(),
      startDay = startDay == 0 ? 7 : startDay,
      endDay = endDay == 0 ? 7 : endDay;

    // (C) Generate date squares (in array first)
    var squares = [],
      disableday = null;
    if (parent.dataset.disableday)
    {
      disableday = JSON.parse(parent.dataset.disableday);
    }

    // (C1) Empty squares before first day of month
    if (parent.dataset.startmon == "1" && startDay != 1)
    {
      for (var i = 1; i < startDay; i++) { squares.push("B"); }
    }
    if (parent.dataset.startmon == "0" && startDay != 7)
    {
      for (var i = 0; i < startDay; i++) { squares.push("B"); }
    }

    // (C2) Days of month
    // All days enabled, just add
    if (disableday == null)
    {
      for (var i = 1; i <= daysInMonth; i++) { squares.push([i, false]); }
    }
    // Some days disabled
    else
    {
      var thisday = startDay;
      for (var i = 1; i <= daysInMonth; i++)
      {
        // Check if day is disabled
        var disabled = disableday.includes(thisday);
        // Day of month, disabled
        squares.push([i, disabled]);
        // Next day
        thisday++;
        if (thisday == 8) { thisday = 1; }
      }
    }

    // (C2) Empty squares after last day of month
    if (parent.dataset.startmon == "1" && endDay != 7)
    {
      for (var i = endDay; i < 7; i++) { squares.push("B"); }
    }
    if (parent.dataset.startmon == "0" && endDay != 6)
    {
      for (var i = endDay; i < (endDay == 7 ? 13 : 6); i++) { squares.push("B"); }
    }

    // (D) Draw HTML
    var daynames = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (parent.dataset.startmon == "1") { daynames.push("Sun"); }
    else { daynames.unshift("Sun"); }

    // (D1) Header
    var table = document.createElement("table"),
      row = table.insertRow()
    cell = null;
    row.classList.add("picker-d-h");
    for (let d of daynames)
    {
      cell = row.insertCell();
      cell.innerHTML = d;
    }

    // (D2) Date cells
    var total = squares.length;
    row = table.insertRow();
    for (var i = 0; i < total; i++)
    {
      if (i != total && i % 7 == 0) { row = table.insertRow(); }
      cell = row.insertCell();
      if (squares[i] == "B")
      {
        cell.classList.add("picker-d-b");
      }
      else
      {
        cell.innerHTML = squares[i][0];
        // Not allowed to choose this day
        if (squares[i][1])
        {
          cell.classList.add("picker-d-dd");
        }
        // Allowed to choose this day
        else
        {
          cell.classList.add("picker-d-d");
          cell.addEventListener("click", function() { picker.pick(this); });
        }
      }
    }

    // (D3) Attach new calendar to datepicker
    days.innerHTML = "";
    days.appendChild(table);
  },

  pick: function (el)
  {
  // pick() : choose a date
  //   el : HTML reference to selected date cell

    // (A) Get all components
    var parent = el.parentElement;
    while (!parent.classList.contains("picker"))
    {
      parent = parent.parentElement;
    }

    // (B) Get full selected year month day
    var year = parent.getElementsByClassName("picker-y")[0].value,
      month = parent.getElementsByClassName("picker-m")[0].value,
      day = el.innerHTML;

    // YYYY-MM-DD Format
    // ! CHANGE FORMAT HERE IF YOU WANT !
    if (parseInt(month) < 10) { month = "0" + month; }
    if (parseInt(day) < 10) { day = "0" + day; }
    var fullDate = year + "-" + month + "-" + day;

    // (C) Update selected date
    document.getElementById(parent.dataset.target).value = fullDate;

    if (parent.dataset.fire.length > 0)
    {
      window[parent.dataset.fire]();
    }

    // (D) Popup only - close the popup
    if (parent.dataset.popup == "1")
    {
      document.getElementById("picker-" + parent.dataset.dpid).classList.remove("show");
    }
  }
};
