// GridTracker Copyright © 2022 GridTracker.org
// All rights reserved.
// See LICENSE for more information.

// Incoming is already   float fixed (  14.037 ) for 14,037,000hz
Number.prototype.formatBand = function ()
{
  var freq = this;
  var bands = [
    "OOB",
    "0",
    1,
    "160m",
    3,
    "80m",
    5,
    "60m",
    7,
    "40m",
    10,
    "30m",
    14,
    "20m",
    18,
    "17m",
    21,
    "15m",
    24,
    "12m",
    27,
    "11m",
    28,
    "10m",
    29,
    "10m",
    50,
    "6m",
    51,
    "6m",
    52,
    "6m",
    53,
    "6m",
    54,
    "6m",
    70,
    "4m",
    141,
    "2m",
    142,
    "2m",
    143,
    "2m",
    144,
    "2m",
    145,
    "2m",
    146,
    "2m",
    147,
    "2m",
    148,
    "2m",
    219,
    "1.25m",
    220,
    "1.25m",
    221,
    "1.25m",
    222,
    "1.25m",
    223,
    "1.25m",
    224,
    "1.25m",
    225,
    "1.25m"
  ];

  var newFreq = parseInt(freq);
  if (newFreq > 0 && newFreq < 226) return bands[bands.indexOf(newFreq) + 1];
  else if (newFreq >= 420 && newFreq <= 450) return "70cm";
  else if (newFreq >= 902 && newFreq <= 928) return "33cm";
  else if (newFreq >= 1240 && newFreq <= 1300) return "23cm";
  else if (freq >= 0.472 && freq <= 0.479) return "630m";
  else if (freq >= 0.1357 && freq <= 0.1485) return "2200m";
  else if (freq >= 0.009 && freq <= 0.02) return "4000m";
  else return "OOB";
};

Number.prototype.formatMhz = function (n, x)
{
  var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\." : "$") + ")";
  return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, "g"), "$&.");
};

Number.prototype.formatSignalReport = function ()
{
  var val = this;
  var report = String();

  if (val >= 0) report = "+" + val;
  else report = val;
  return report;
};

String.prototype.formatCallsign = function ()
{
  var re = new RegExp("0", "g");
  return this.replace(re, "Ø");
};

Number.prototype.toDHMS = function ()
{
  var seconds = this;
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  days = days ? days + "d " : "";
  hrs = hrs ? hrs + "h " : "";
  mnts = mnts ? mnts + "m " : "";
  var first = days + hrs + mnts;
  if (first == "") val = seconds + "s";
  else val = first + (seconds > 0 ? seconds + "s" : "");
  return val;
};

Number.prototype.msToDHMS = function ()
{
  var seconds = parseInt(this / 1000);
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  days = days ? days + "d " : "";
  hrs = hrs ? hrs + "h " : "";
  mnts = mnts ? mnts + "m " : "";
  var first = days + hrs + mnts;
  if (first == "") val = seconds + "s";
  else val = first + (seconds > 0 ? seconds + "s" : "");
  return val;
};

Number.prototype.toDHMS15 = function ()
{
  // round to earliest 15 seconds

  var seconds = Math.floor(this / 15) * 15;
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  days = days ? days + "d " : "";
  hrs = hrs ? hrs + "h " : "";
  mnts = mnts ? mnts + "m " : "";
  var first = days + hrs + mnts;
  if (first == "") val = seconds + "s";
  else val = first + (seconds > 0 ? seconds + "s" : "");
  return val;
};

Number.prototype.toDHM = function ()
{
  var seconds = this;
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  days = days ? days + "d " : "";
  hrs = hrs ? hrs + "h " : "";
  mnts = mnts || seconds ? mnts + "m " : "";
  val = days + hrs + mnts;
  if (val == "") val = "0m";

  return val;
};

Number.prototype.toYM = function ()
{
  var months = this;
  var years = parseInt(Math.floor(months / 12));
  months -= years * 12;
  months = parseInt(months);
  years = years ? years + "y " : "";
  months = months ? months + "m" : "";
  var total = years + months;
  return total == "" ? "any" : total;
};

Number.prototype.toHMS = function ()
{
  var seconds = this;
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;

  hrs = hrs < 10 ? "0" + hrs : hrs;
  mnts = mnts < 10 ? "0" + mnts : mnts;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  val = hrs + "" + mnts + "" + seconds;
  return val;
};

String.prototype.toProperCase = function ()
{
  return this.replace(/\w\S*/g, function (txt)
  {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

Number.prototype.pad = function (size)
{
  var s = String(this);
  while (s.length < (size || 2))
  {
    s = "0" + s;
  }
  return s;
};

String.prototype.replaceAll = function (str1, str2)
{
  return this.split(str1).join(str2);
};
