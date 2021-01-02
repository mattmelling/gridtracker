/* eslint-disable */

// HamGridSquare.js
// Copyright 2014 Paul Brewer KI6CQ
// License:  MIT License http://opensource.org/licenses/MIT
//
// Javascript routines to convert from lat-lon to Maidenhead Grid Squares
// typically used in Ham Radio Satellite operations and VHF Contests
//
// Inspired in part by K6WRU Walter Underwood's python answer
// http://ham.stackexchange.com/a/244
// to this stack overflow question:
// How Can One Convert From Lat/Long to Grid Square
// http://ham.stackexchange.com/questions/221/how-can-one-convert-from-lat-long-to-grid-square
//
function latLonToGridSquare(param1,param2){
  var lat=-100.0;
  var lon=0.0;
  var adjLat,adjLon,GLat,GLon,nLat,nLon,gLat,gLon,rLat,rLon;
  var U = 'ABCDEFGHIJKLMNOPQRSTUVWX'
  var L = U.toLowerCase();
  // support Chris Veness 2002-2012 LatLon library and
  // other objects with lat/lon properties
  // properties could be getter functions, numbers, or strings
  function toNum(x){
    if (typeof(x) === 'number') return x;
    if (typeof(x) === 'string') return parseFloat(x);
    if (typeof(x) === 'function') return parseFloat(x());
    throw "HamGridSquare -- toNum -- can not convert input: "+x;
  }
  if (typeof(param1)==='object'){
    if (param1.length === 2){
      lat = toNum(param1[0]);
      lon = toNum(param1[1]);
    } else if (('lat' in param1) && ('lon' in param1)){
      lat = toNum(param1.lat);
      lon = toNum(param1.lon);
    } else if (('latitude' in param1) && ('longitude' in param1)){
      lat = toNum(param1.latitude);
      lon = toNum(param1.longitude);
    } else {
      throw "HamGridSquare -- can not convert object -- "+param1;
    }
  } else {
    lat = toNum(param1);
    lon = toNum(param2);
  }
  if (isNaN(lat)) throw "lat is NaN";
  if (isNaN(lon)) throw "lon is NaN";
  if (Math.abs(lat) === 90.0) throw "grid g_grids invalid at N/S poles";
  if (Math.abs(lat) > 90) throw "invalid latitude: "+lat;
  if (Math.abs(lon) > 180)
  {
	  if ( lon > 180 )
	  {
			var temp = lon + 360;
			temp = temp % 360;
			lon = temp - 360;
	  }
	  while ( lon < -180 )
	  {
		  lon += 180;
		  lon = 180 + lon;
	  } // 53032
  }
  adjLat = lat + 90;
  adjLon = lon + 180;
  GLat = U[Math.trunc(adjLat/10)];
  GLon = U[Math.trunc(adjLon/20)];
  nLat = ''+Math.trunc(adjLat % 10);
  nLon = ''+Math.trunc((adjLon/2) % 10);
 // gLat = L[Math.trunc(rLat/2.5)];
//  gLon = L[Math.trunc(rLon/5)];
  return GLon+GLat+nLon+nLat;
}



function bitwise(str){
	var hash = 0;
	if (str.length == 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var ch = str.charCodeAt(i);
		hash = ((hash<<5)-hash) + ch;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

// convert 10 binary to customized binary, max is 62
function binaryTransfer(integer, binary) {
	binary = binary || 62;
	var stack = [];
	var num;
	var result = '';
	var sign = integer < 0 ? '-' : '';

	function table (num) {
		var t = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		return t[num];
	}

	integer = Math.abs(integer);

	while (integer >= binary) {
		num = integer % binary;
		integer = Math.floor(integer / binary);
		stack.push(table(num));
	}

	if (integer > 0) {
		stack.push(table(integer));
	}

	for (var i = stack.length - 1; i >= 0; i--) {
		result += stack[i];
	}

	return sign + result;
}


/**
 * why choose 61 binary, because we need the last element char to replace the minus sign
 * eg: -aGtzd will be ZaGtzd
 */
function unique (text) {
	var id = binaryTransfer(bitwise(text), 61);
	return id.replace('-', 'Z');
}





var MyCircle = {

    validateRadius: function(unit) {
        var r = {'M': 6371009, 'KM': 6371.009, 'MI': 3958.761, 'NM': 3440.070, 'YD': 6967420, 'FT': 20902260, 'DG':57.2958};
        if ( unit in r ) return r[unit];
        else return unit;
    },

    distance: function(lat1, lon1, lat2, lon2, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit);
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var a = Math.pow(Math.cos(lat2) * Math.sin(lonDelta) , 2) + Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta) , 2);
        var b = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var angle = Math.atan2(Math.sqrt(a) , b);

        return angle;
    },

    bearing: function(lat1, lon1, lat2, lon2) {
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        lat2 *= Math.PI / 180;
        lon2 *= Math.PI / 180;
        var lonDelta = lon2 - lon1;
        var y = Math.sin(lonDelta) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
        var brng = Math.atan2(y, x);
        brng = brng * (180 / Math.PI);

        if ( brng < 0 ) { brng += 360; }

        return brng;
    },

    destination: function(lat1, lon1, brng, dt, unit) {
        if ( unit === undefined ) unit = 'KM';
        var r = this.validateRadius(unit);
        lat1 *= Math.PI / 180;
        lon1 *= Math.PI / 180;
        var lat3 = Math.asin(Math.sin(lat1) * Math.cos(dt / r) + Math.cos(lat1) * Math.sin(dt / r) * Math.cos( brng * Math.PI / 180 ));
        var lon3 = lon1 + Math.atan2(Math.sin( brng * Math.PI / 180 ) * Math.sin(dt / r) * Math.cos(lat1) , Math.cos(dt / r) - Math.sin(lat1) * Math.sin(lat3));

        return {
            'LAT': lat3 * 180 / Math.PI,
            'LON': lon3 * 180 / Math.PI
        };
    }

}

if (typeof module != 'undefined' && module.exports) {
    module.exports = MyCircle;
} else {
    window['MyCircle'] = MyCircle;
}


/**
 * XML2jsobj v1.0
 * Converts XML to a JavaScript object
 * so it can be handled like a JSON message
 *
 * By Craig Buckler, @craigbuckler, http://optimalworks.net
 *
 * As featured on SitePoint.com:
 * http://www.sitepoint.com/xml-to-javascript-object/
 *
 * Please use as you wish at your own risk.
 */

function XML2jsobj(node) {

	var	data = {};

	// append a value
	function Add(name, value) {
		if (data[name]) {
			if (data[name].constructor != Array) {
				data[name] = [data[name]];
			}
			data[name][data[name].length] = value;
		}
		else {
			data[name] = value;
		}
	};

	// element attributes
	var c, cn;
	for (c = 0; cn = node.attributes[c]; c++) {
		Add(cn.name, cn.value);
	}

	// child elements
	for (c = 0; cn = node.childNodes[c]; c++) {
		if (cn.nodeType == 1) {
			if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
				// text value
				Add(cn.nodeName, cn.firstChild.nodeValue);
			}
			else {
				// sub-object
				Add(cn.nodeName, XML2jsobj(cn));
			}
		}
	}

	return data;
}

// From https://pskreporter.info/
// Many many thanks!!!
function flightFeature(line, opts, layer, canAnimate) {
	var steps = opts.steps;
	// Map coords into lat lngs
	var start = ol.proj.toLonLat(line[0]);
	var end = ol.proj.toLonLat(line[1]);
	var generator = new arc.GreatCircle({ x: start[0], y: start[1] }, { x: end[0], y: end[1] });
	var path = generator.Arc(steps, { offset: 10 });

	line = [];
	var geom = path.geometries;
	var lonOff = 0;
	var lastc = 0;
	for (var j = 0; j < geom.length; j++) {
	var ls = geom[j];
	for (var i = 0; i < ls.coords.length; i++) {
	  var c = ls.coords[i];
	  if (isNaN(c[0])) {
		continue;
	  }
	  if (Math.abs(lastc - c[0]) > 270) {
		// Wrapped
	if (c[0] < lastc) {
	  lonOff += 360;
	} else {
	  lonOff -= 360;
	}
	  }
	  lastc = c[0];
	  line.push(ol.proj.fromLonLat([ c[0] + lonOff, c[1]]));
	}
	}
	if (line.length == 0) {
	line.push(ol.proj.fromLonLat(start));
	}

	var dash = [];
	var dashOff = 0;
	if ( canAnimate == true && g_mapSettings.animate == true )
	{
		dash = g_flightPathLineDash;
		dashOff = g_flightPathTotal - g_flightPathOffset;
	}

	var featureArrow = new ol.Feature(new ol.geom.Point(line[0]));


	line = new ol.geom.LineString(line);
	var feature = new ol.Feature({ geometry: line, name: 'flight' });


	feature.setStyle(new ol.style.Style({
		stroke: new ol.style.Stroke({ color: opts.color, width: opts.weight, lineDash: dash, lineDashOffset:dashOff}) }));


	var stroke = new ol.style.Stroke({color: opts.color, width: opts.weight});
	var thisStle =  new ol.style.Style({
	 image: new ol.style.Circle({
								stroke: stroke,
								radius: 3
							  })
		})
	featureArrow.setStyle(thisStle);
	feature.Arrow = featureArrow;

	g_layerSources[layer].addFeature(featureArrow);
	g_layerSources[layer].addFeature(feature);
	return feature;
}


function rad2deg (r) { return (57.29578*r); }
function deg2rad (d) { return (0.01745329*d); }

function sind( x) { return (sin(deg2rad(x))); }
function cosd( x) { return (cos(deg2rad(x))); }
function tand( x) { return (tan(deg2rad(x))); }
function acosd(x) { return (rad2deg(acos(x))); }
function atand(x) { return (rad2deg(atan(x))); }

function sin(x) { return Math.sin(x); }
function cos(x) { return Math.cos(x); }
function atan2(x,y) { return Math.atan2(x,y); }
function sqrt(x) { return Math.sqrt(x); }
function fmod(a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

/* given seconds since 1/1/1970 compute sublunar lat and long.
 * http://www.stjarnhimlen.se/comp/ppcomp.html
 */
function subLunar (t)
{
    // want days since 1999 Dec 31, 0:00 UT
     d = (t - 946598400)/(3600.0*24.0);

    /* use this if given year month day hour
     * double d = 367*y - 7 * ( y + (m+9)/12 ) / 4 + 275*m/9 + D - 730530;	// all integer divisions
     * d = d + UT/24.0;
     */

	M_PI = Math.PI;
    // obliquity of the ecliptic
     ecl = M_PI/180.0*(23.4393 - 3.563E-7 * d);

    /* N = longitude of the ascending node
     * i = inclination to the ecliptic
     * w = argument of perihelion
     * a = semi-major axis
     * e = eccentricity (0=circle, 0-1=ellipse, 1=parabola)
     * M = mean anomaly (0 at perihelion; increases uniformly with time)
     */

    // lunar orbital elements, with respect to Earth
     N_m = M_PI/180.0*(125.1228 - 0.0529538083 * d);
     i_m = M_PI/180.0*(5.1454);
     w_m = M_PI/180.0*(318.0634 + 0.1643573223 * d);
     a_m = 60.2666;		// Earth radii
     e_m = 0.054900;
     M_m = M_PI/180.0*(115.3654 + 13.0649929509 * d);

    // solar orbital elements (really Earth's)
    // double N_s = M_PI/180.0 * (0.0);
    // double i_s = M_PI/180.0 * (0.0);
    w_s = M_PI/180.0 * (282.9404 + 4.70935E-5 * d);
    // double a_s = 1.000000;			// AU
    // double e_s = 0.016709 - 1.151E-9 * d;
     M_s = M_PI/180.0 * (356.0470 + 0.9856002585 * d);

    // solar eccentric anomaly
    // double E_s = M_s + e_s * sin(M_s) * ( 1.0 + e_s * cos(M_s) );

    // eccentric anomaly, no need to refine if e < ~0.05
     E_m = M_m + e_m * sin(M_m) * ( 1.0 + e_m * cos(M_m) );

    // solar distance and true anomaly
    // double xv_s = cos(E_s) - e_s;
    // double yv_s = sqrt(1.0 - e_s*e_s) * sin(E_s);
    // double v_s = atan2( yv_s, xv_s );
    // double r_s = sqrt( xv_s*xv_s + yv_s*yv_s );

    // lunar distance and true anomaly
     xv_m = a_m * ( cos(E_m) - e_m );
     yv_m = a_m * ( sqrt(1.0 - e_m*e_m) * sin(E_m) );
     v_m = atan2 ( yv_m, xv_m );
     r_m = sqrt ( xv_m*xv_m + yv_m*yv_m );

    // ideal (without perturbations) geocentric ecliptic position in 3-dimensional space:
     xh_m = r_m * ( cos(N_m) * cos(v_m+w_m) - sin(N_m) * sin(v_m+w_m) * cos(i_m) );
     yh_m = r_m * ( sin(N_m) * cos(v_m+w_m) + cos(N_m) * sin(v_m+w_m) * cos(i_m) );
     zh_m = r_m * ( sin(v_m+w_m) * sin(i_m) );

    // ecliptic long and lat
    lonecl_m = atan2( yh_m, xh_m );
    latecl_m = atan2( zh_m, sqrt(xh_m*xh_m+yh_m*yh_m) );

    // add enough perturbations to yield max error 0.25 degrees long, 0.15 degs lat
     L_s = M_s + w_s;					// Mean Longitude of the Sun (Ns=0)
     L_m = M_m + w_m + N_m;				// Mean longitude of the Moon
     D_m = L_m - L_s;        				// Mean elongation of the Moon
     F_m = L_m - N_m; 					// Argument of latitude for the Moon
    lonecl_m += M_PI/180.0 * (-1.274 * sin(M_m - 2*D_m));	// Ptolemy's "Evection"
    lonecl_m +=	M_PI/180.0 * ( 0.658 * sin(2*D_m));		// Brahe's "Variation"
    lonecl_m += M_PI/180.0 * ( 0.186 * sin(M_s));		// Brahe's "Yearly Equation"
    latecl_m += M_PI/180.0 * (-0.173 * sin(F_m - 2*D_m));

    // convert back to geocentric, now with perturbations applied
    xh_m = r_m * cos(lonecl_m) * cos(latecl_m);
    yh_m = r_m * sin(lonecl_m) * cos(latecl_m);
    zh_m = r_m * sin(latecl_m);

    // lunar ecliptic to geocentric (already)
     xg_m = xh_m;
     yg_m = yh_m;
     zg_m = zh_m;

    // convert to equatorial by rotating ecliptic by obliquity
     xe_m = xg_m;
     ye_m = yg_m * cos(ecl) - zg_m * sin(ecl);
     ze_m = yg_m * sin(ecl) + zg_m * cos(ecl);

    // compute the planet's Right Ascension (RA) and Declination (Dec):
     RA  = 180/M_PI * fmod (atan2( ye_m, xe_m ) + 2*M_PI, 2*M_PI);	// degrees
     Dec = atan2( ze_m, sqrt(xe_m*xe_m+ye_m*ye_m) );			// rads

	ll = Object();
    ll.lat = Dec;
    ll.lat_d = rad2deg(ll.lat);

     JD = (t/86400.0) + 2440587.5;
     D = JD - 2451545.0;
     GMST = fmod(15*(18.697374558 + 24.06570982441908*D), 360.0);
    ll.lng_d = fmod(RA-GMST+36000.0+180.0, 360.0) - 180.0;
    ll.lng = deg2rad(ll.lng_d);

	data = Object();
	data.ll = [ll.lng_d,ll.lat_d];
	data.RA = RA/15;
	data.Dec = 180/M_PI*Dec;

	return data;
}



function doRAconvert(lg, la, ras, decs) {

  jd=datetojd();
  lgt=lg;
  lat=rad(la);
  ra=ras;
  dec=rad(decs);
  st=sidTime(jd-2400000.5, lgt)

  return convert(ra, dec, st,lat);

}



function fraction(x) {
  x=x-Math.floor(x)
  if(x<0) {
    x++
  }
  return(x)
}

function sidTime(mjd, lambda) {
  mjdo=Math.floor(mjd)
  ut=(mjd-mjdo)*24
  t=(mjdo-51544.5)/36525.0
  gmst=6.697374558+1.0027379093*ut+(8640184.812866+(0.093104-6.2E-6*t)*t)*t/3600.0
  return(24.0*fraction((gmst+lambda/15.0)/24.0))
}


function datetojd(datestring) {


	jd = (timeNowSec() /86400.0) + 2440587.5;



  return jd
}


function deg(angle) {
  return angle*180/Math.PI
}

function rad(angle) {
  return angle*Math.PI/180
}

function convert(ra, dec, lmst,lat) {
	hangle=rad((lmst-ra)*15)
	sinalt=Math.sin(dec)*Math.sin(lat)+Math.cos(dec)*Math.cos(hangle)*Math.cos(lat)
	alt=Math.asin(sinalt)
	sinaz=-Math.cos(dec)*Math.sin(hangle)/Math.cos(alt)
	cosaz=Math.sin(dec)*Math.cos(lat)-Math.cos(dec)*Math.cos(hangle)*Math.sin(lat)
	if(cosaz <= 0.0) {
	az=Math.PI-Math.asin(sinaz)
	} else {
	if(sinaz <= 0.0) {
	  az=2*Math.PI+Math.asin(sinaz)
	} else {
	  az=Math.asin(sinaz)
	}
	}

	var data = Object();
	data.azimuth = deg(az);
	data.elevation = deg(alt);

	return data;
}

function isMergeableObject(val) {
    var nonNullObject = val && typeof val === 'object'

    return nonNullObject
        && Object.prototype.toString.call(val) !== '[object RegExp]'
        && Object.prototype.toString.call(val) !== '[object Date]'
}

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice()
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument)
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument)
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument))
        }
    })
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var destination = {}
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument)
        })
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneIfNecessary(source[key], optionsArgument)
        } else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument)
        }
    })
    return destination
}

function deepmerge(target, source, optionsArgument) {
    var array = Array.isArray(source);
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var arrayMerge = options.arrayMerge || defaultArrayMerge

    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
}


// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}
