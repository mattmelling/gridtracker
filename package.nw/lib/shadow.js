/**

**/
(function (global, factory)
{
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
      ? define(factory)
      : (global.GeoJSONTerminator = factory());
})(this, function ()
{
  "use strict";

  function julian(date)
  {
    /* Calculate the present UTC Julian Date. Function is valid after
     * the beginning of the UNIX epoch 1970-01-01 and ignores leap
     * seconds. */
    return date / 86400000 + 2440587.5;
  }

  function GMST(julianDay)
  {
    /* Calculate Greenwich Mean Sidereal Time according to
       http://aa.usno.navy.mil/faq/docs/GAST.php */
    var d = julianDay - 2451545.0;
    // Low precision equation is good enough for our purposes.
    return (18.697374558 + 24.06570982441908 * d) % 24;
  }

  class Terminator
  {
    constructor(options = { resolution: 1 })
    {
      this.options = options;
      this.version = "0.1.0";
      this._R2D = 180 / Math.PI;
      this._D2R = Math.PI / 180;
      // this.options.resolution = options.resolution || this.options.resolution;
      // this.options.time = options.time;
      var latLngs = this._compute(this.options.time);
      return this._toGeoJSON(latLngs);
    }

    setTime(date)
    {
      this.options.time = date;
      var latLngs = this._compute(date);
      return this._toGeoJSON(latLngs);
    }

    _toGeoJSON(latLngs)
    {
      /* Return 'pseudo' GeoJSON representation of the coordinates
        Why 'pseudo'?
        Coordinates longitude range go from -360 to 360
        whereas it should be -180, + 180
        API like OpenLayers or Leaflet can consume them although invalid
        from GeoJSON spec
        In this case, use something like GDAL/OGR to clip to a valid range with
        ogr2ogr -f "GeoJSON" output.geojson input.geojson \
        -clipsrc -180 90 180 90
      */
      return {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              ...latLngs.map((latLng) =>
              {
                return [latLng[1], latLng[0]];
              }),
              [latLngs[0][1], latLngs[0][0]]
            ]
              .slice()
              .reverse()
          ]
        }
      };
    }

    _sunEclipticPosition(julianDay)
    {
      /* Compute the position of the Sun in ecliptic coordinates at
         julianDay.  Following
         http://en.wikipedia.org/wiki/Position_of_the_Sun */
      // Days since start of J2000.0
      var n = julianDay - 2451545.0;
      // mean longitude of the Sun
      var L = 280.46 + 0.9856474 * n;
      L %= 360;
      // mean anomaly of the Sun
      var g = 357.528 + 0.9856003 * n;
      g %= 360;
      // ecliptic longitude of Sun
      var lambda =
        L +
        1.915 * Math.sin(g * this._D2R) +
        0.02 * Math.sin(2 * g * this._D2R);

      return { lambda: lambda };
    }

    _eclipticObliquity(julianDay)
    {
      // Following the short term expression in
      // http://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
      var n = julianDay - 2451545.0;
      // Julian centuries since J2000.0
      var T = n / 36525;
      var epsilon =
        23.43929111 -
        T *
          (46.836769 / 3600 -
            T *
              (0.0001831 / 3600 +
                T *
                  (0.0020034 / 3600 -
                    T * (0.576e-6 / 3600 - (T * 4.34e-8) / 3600))));
      return epsilon;
    }

    _jday(date)
    {
      return date.getTime() / 86400000.0 + 2440587.5;
    }

    _calculatePositionOfSun(date)
    {
      date = date instanceof Date ? date : new Date();

      var rad = 0.017453292519943295;

      // based on NOAA solar calculations
      var ms_past_midnight =
        ((date.getUTCHours() * 60 + date.getUTCMinutes()) * 60 +
          date.getUTCSeconds()) *
          1000 +
        date.getUTCMilliseconds();
      var jc = (this._jday(date) - 2451545) / 36525;
      var mean_long_sun =
        (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
      var mean_anom_sun = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
      var sun_eq =
        Math.sin(rad * mean_anom_sun) *
          (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
        Math.sin(rad * 2 * mean_anom_sun) * (0.019993 - 0.000101 * jc) +
        Math.sin(rad * 3 * mean_anom_sun) * 0.000289;
      var sun_true_long = mean_long_sun + sun_eq;
      var sun_app_long =
        sun_true_long -
        0.00569 -
        0.00478 * Math.sin(rad * 125.04 - 1934.136 * jc);
      var mean_obliq_ecliptic =
        23 +
        (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) /
          60;
      var obliq_corr =
        mean_obliq_ecliptic + 0.00256 * Math.cos(rad * 125.04 - 1934.136 * jc);

      var lat =
        Math.asin(Math.sin(rad * obliq_corr) * Math.sin(rad * sun_app_long)) /
        rad;

      var eccent = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
      var y =
        Math.tan(rad * (obliq_corr / 2)) * Math.tan(rad * (obliq_corr / 2));
      var rq_of_time =
        4 *
        ((y * Math.sin(2 * rad * mean_long_sun) -
          2 * eccent * Math.sin(rad * mean_anom_sun) +
          4 *
            eccent *
            y *
            Math.sin(rad * mean_anom_sun) *
            Math.cos(2 * rad * mean_long_sun) -
          0.5 * y * y * Math.sin(4 * rad * mean_long_sun) -
          1.25 * eccent * eccent * Math.sin(2 * rad * mean_anom_sun)) /
          rad);
      var true_solar_time_in_deg =
        ((ms_past_midnight + rq_of_time * 60000) % 86400000) / 240000;

      var lng = -(true_solar_time_in_deg < 0
        ? true_solar_time_in_deg + 180
        : true_solar_time_in_deg - 180);

      return [lng, lat];
    }

    _sunEquatorialPosition(sunEclLng, eclObliq)
    {
      /* Compute the Sun's equatorial position from its ecliptic
       * position. Inputs are expected in degrees. Outputs are in
       * degrees as well. */
      var alpha =
        Math.atan(
          Math.cos(eclObliq * this._D2R) * Math.tan(sunEclLng * this._D2R)
        ) * this._R2D;
      var delta =
        Math.asin(
          Math.sin(eclObliq * this._D2R) * Math.sin(sunEclLng * this._D2R)
        ) * this._R2D;

      var lQuadrant = Math.floor(sunEclLng / 90) * 90;
      var raQuadrant = Math.floor(alpha / 90) * 90;
      alpha = alpha + (lQuadrant - raQuadrant);

      return { alpha: alpha, delta: delta };
    }

    _hourAngle(lng, sunPos, gst)
    {
      /* Compute the hour angle of the sun for a longitude on
       * Earth. Return the hour angle in degrees. */
      var lst = gst + lng / 15;
      return lst * 15 - sunPos.alpha;
    }

    _latitude(ha, sunPos)
    {
      /* For a given hour angle and sun position, compute the
       * latitude of the terminator in degrees. */
      var lat =
        Math.atan(
          -Math.cos(ha * this._D2R) / Math.tan(sunPos.delta * this._D2R)
        ) * this._R2D;
      return lat;
    }

    _compute(time)
    {
      var today = time ? new Date(time) : new Date();
      var julianDay = julian(today);
      var gst = GMST(julianDay);
      var latLng = [];
      var startMinus = -360;

      var sunEclPos = this._sunEclipticPosition(julianDay);
      var eclObliq = this._eclipticObliquity(julianDay);
      var sunEqPos = this._sunEquatorialPosition(sunEclPos.lambda, eclObliq);
      for (var i = 0; i <= 720 * this.options.resolution; i++)
      {
        var lng = startMinus + i / this.options.resolution;
        var ha = this._hourAngle(lng, sunEqPos, gst);
        latLng[i + 1] = [this._latitude(ha, sunEqPos), lng];
      }
      if (sunEqPos.delta < 0)
      {
        latLng[0] = [90, startMinus];
        latLng[latLng.length] = [90, 360];
      }
      else
      {
        latLng[0] = [-90, startMinus];
        latLng[latLng.length] = [-90, 360];
      }
      return latLng;
    }
  }
  function terminator(options)
  {
    return new Terminator(options);
  }

  return terminator;
});

var dayNight = {
  map: null,
  vectorLayer: null,

  init: function (map)
  {
    this.map = map;

    var geoJSON = new GeoJSONTerminator();

    this.vectorSource = new ol.source.Vector({
      features: new ol.format.GeoJSON().readFeatures(geoJSON, {
        featureProjection: "EPSG:3857"
      })
    });

    this.vectorLayer = new ol.layer.Vector({
      source: this.vectorSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgb(0,0,0)"
        }),
        stroke: null
      }),
      opacity: Number(g_mapSettings.shadow),
      zIndex: 0
    });
    this.map.getLayers().insertAt(1, this.vectorLayer);
  },
  refresh: function ()
  {
    var circleStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgb(0,0,0)"
      })
    });
    this.vectorLayer.setStyle(circleStyle);
    this.vectorLayer.setOpacity(Number(g_mapSettings.shadow));
    this.vectorSource.clear();

    this.vectorSource.addFeature(
      new ol.format.GeoJSON().readFeature(new GeoJSONTerminator(), {
        featureProjection: "EPSG:3857"
      })
    );
    var point = ol.proj.fromLonLat([g_myLon, g_myLat]);
    var arr = this.vectorSource.getFeaturesAtCoordinate(point);
    return arr.length > 0;
  },

  show: function ()
  {
    this.vectorLayer.setVisible(true);
    return this.refresh();
  },
  hide: function ()
  {
    this.vectorLayer.setVisible(false);
  },
  isVisible: function ()
  {
    return this.vectorLayer.getVisible();
  }
};

var moonLayer = {
  map: null,
  vectorLayer: null,
  icon: null,
  pin: null,
  init: function (map)
  {
    this.map = map;

    this.icon = new ol.style.Icon({
      src: "./img/luna.png",
      anchorYUnits: "pixels",
      anchorXUnits: "pixels",
      anchor: [255, 255],
      scale: 0.1,
      opacity: 0.5
    });

    this.pin = iconFeature(
      ol.proj.fromLonLat(subLunar(timeNowSec()).ll),
      this.icon,
      0
    );
    this.pin.size = 99;
    this.vectorSource = new ol.source.Vector({});

    this.vectorLayer = new ol.layer.Vector({
      source: this.vectorSource,
      zIndex: 30
    });
    this.map.getLayers().insertAt(1, this.vectorLayer);
  },
  future: function (now)
  {
    var r = 0;
    var x = 25;
    var i = 3600;
    var data = Array();
    for (r = 0; r < x; r++)
    {
      data.push(subLunar(now + r * i).ll);
    }
    line = [];

    var lonOff = 0;
    var lastc = 0;

    for (var i = 0; i < data.length; i++)
    {
      var c = data[i];
      if (isNaN(c[0]))
      {
        continue;
      }
      if (Math.abs(lastc - c[0]) > 270)
      {
        // Wrapped
        if (c[0] < lastc)
        {
          lonOff += 360;
        }
        else
        {
          lonOff -= 360;
        }
      }
      lastc = c[0];
      line.push(ol.proj.fromLonLat([c[0] + lonOff, c[1]]));
    }

    if (line.length == 0)
    {
      line.push(ol.proj.fromLonLat(start));
    }

    line = new ol.geom.LineString(line);
    var feature = new ol.Feature({ geometry: line, name: "moonFlight" });

    feature.setStyle(
      new ol.style.Style({
        stroke: new ol.style.Stroke({ color: "#FFF", width: 1 })
      })
    );

    return feature;
  },
  refresh: function ()
  {
    this.vectorSource.clear();
    if (g_appSettings.moonTrack == 1)
    {
      now = timeNowSec();
      if (g_appSettings.moonPath == 1)
      { this.vectorSource.addFeature(this.future(now)); }
      this.pin = iconFeature(
        ol.proj.fromLonLat(subLunar(now).ll),
        this.icon,
        0
      );
      this.pin.size = 99;
      this.vectorSource.addFeature(this.pin);
    }
  },

  show: function ()
  {
    this.refresh();
    this.vectorLayer.setVisible(true);
    lunaButonImg.style.webkitFilter = "brightness(100%)";
  },
  hide: function ()
  {
    this.vectorLayer.setVisible(false);
    lunaButonImg.style.webkitFilter = "brightness(50%)";
  },
  isVisible: function ()
  {
    return this.vectorLayer.getVisible();
  }
};
