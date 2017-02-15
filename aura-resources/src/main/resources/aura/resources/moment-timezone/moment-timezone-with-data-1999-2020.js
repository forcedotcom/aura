//! moment-timezone.js
//! version : 0.5.10
//! Copyright (c) JS Foundation and other contributors
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
	"use strict";

	/*global define*/
	if (typeof define === 'function' && define.amd) {
		define(['moment'], factory);			  // AMD
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory(require('moment')); // Node
	} else {
		factory(root.moment);				    // Browser
	}
}(this, function (moment) {
	"use strict";

	// Do not load moment-timezone a second time.
	if (moment.tz !== undefined) {
		logError('Moment Timezone ' + moment.tz.version + ' was already loaded ' + (moment.tz.dataVersion ? 'with data from ' : 'without any data') + moment.tz.dataVersion);
		return moment;
	}

	var VERSION = "0.5.10",
		zones = {},
		links = {},
		names = {},
		guesses = {},
		cachedGuess,

		momentVersion = moment.version.split('.'),
		major = +momentVersion[0],
		minor = +momentVersion[1];

	// Moment.js version check
	if (major < 2 || (major === 2 && minor < 6)) {
		logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
	}

	/************************************
		Unpacking
	************************************/

	function charCodeToInt(charCode) {
		if (charCode > 96) {
			return charCode - 87;
		} else if (charCode > 64) {
			return charCode - 29;
		}
		return charCode - 48;
	}

	function unpackBase60(string) {
		var i = 0,
			parts = string.split('.'),
			whole = parts[0],
			fractional = parts[1] || '',
			multiplier = 1,
			num,
			out = 0,
			sign = 1;

		// handle negative numbers
		if (string.charCodeAt(0) === 45) {
			i = 1;
			sign = -1;
		}

		// handle digits before the decimal
		for (i; i < whole.length; i++) {
			num = charCodeToInt(whole.charCodeAt(i));
			out = 60 * out + num;
		}

		// handle digits after the decimal
		for (i = 0; i < fractional.length; i++) {
			multiplier = multiplier / 60;
			num = charCodeToInt(fractional.charCodeAt(i));
			out += num * multiplier;
		}

		return out * sign;
	}

	function arrayToInt (array) {
		for (var i = 0; i < array.length; i++) {
			array[i] = unpackBase60(array[i]);
		}
	}

	function intToUntil (array, length) {
		for (var i = 0; i < length; i++) {
			array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
		}

		array[length - 1] = Infinity;
	}

	function mapIndices (source, indices) {
		var out = [], i;

		for (i = 0; i < indices.length; i++) {
			out[i] = source[indices[i]];
		}

		return out;
	}

	function unpack (string) {
		var data = string.split('|'),
			offsets = data[2].split(' '),
			indices = data[3].split(''),
			untils  = data[4].split(' ');

		arrayToInt(offsets);
		arrayToInt(indices);
		arrayToInt(untils);

		intToUntil(untils, indices.length);

		return {
			name	  : data[0],
			abbrs	 : mapIndices(data[1].split(' '), indices),
			offsets    : mapIndices(offsets, indices),
			untils	: untils,
			population : data[5] | 0
		};
	}

	/************************************
		Zone object
	************************************/

	function Zone (packedString) {
		if (packedString) {
			this._set(unpack(packedString));
		}
	}

	Zone.prototype = {
		_set : function (unpacked) {
			this.name	  = unpacked.name;
			this.abbrs	 = unpacked.abbrs;
			this.untils	= unpacked.untils;
			this.offsets    = unpacked.offsets;
			this.population = unpacked.population;
		},

		_index : function (timestamp) {
			var target = +timestamp,
				untils = this.untils,
				i;

			for (i = 0; i < untils.length; i++) {
				if (target < untils[i]) {
					return i;
				}
			}
		},

		parse : function (timestamp) {
			var target  = +timestamp,
				offsets = this.offsets,
				untils  = this.untils,
				max	= untils.length - 1,
				offset, offsetNext, offsetPrev, i;

			for (i = 0; i < max; i++) {
				offset	= offsets[i];
				offsetNext = offsets[i + 1];
				offsetPrev = offsets[i ? i - 1 : i];

				if (offset < offsetNext && tz.moveAmbiguousForward) {
					offset = offsetNext;
				} else if (offset > offsetPrev && tz.moveInvalidForward) {
					offset = offsetPrev;
				}

				if (target < untils[i] - (offset * 60000)) {
					return offsets[i];
				}
			}

			return offsets[max];
		},

		abbr : function (mom) {
			return this.abbrs[this._index(mom)];
		},

		offset : function (mom) {
			return this.offsets[this._index(mom)];
		}
	};

	/************************************
		Current Timezone
	************************************/

	function OffsetAt(at) {
		var timeString = at.toTimeString();
		var abbr = timeString.match(/\([a-z ]+\)/i);
		if (abbr && abbr[0]) {
			// 17:56:31 GMT-0600 (CST)
			// 17:56:31 GMT-0600 (Central Standard Time)
			abbr = abbr[0].match(/[A-Z]/g);
			abbr = abbr ? abbr.join('') : undefined;
		} else {
			// 17:56:31 CST
			// 17:56:31 GMT+0800 (台北標準時間)
			abbr = timeString.match(/[A-Z]{3,5}/g);
			abbr = abbr ? abbr[0] : undefined;
		}

		if (abbr === 'GMT') {
			abbr = undefined;
		}

		this.at = +at;
		this.abbr = abbr;
		this.offset = at.getTimezoneOffset();
	}

	function ZoneScore(zone) {
		this.zone = zone;
		this.offsetScore = 0;
		this.abbrScore = 0;
	}

	ZoneScore.prototype.scoreOffsetAt = function (offsetAt) {
		this.offsetScore += Math.abs(this.zone.offset(offsetAt.at) - offsetAt.offset);
		if (this.zone.abbr(offsetAt.at).replace(/[^A-Z]/g, '') !== offsetAt.abbr) {
			this.abbrScore++;
		}
	};

	function findChange(low, high) {
		var mid, diff;

		while ((diff = ((high.at - low.at) / 12e4 | 0) * 6e4)) {
			mid = new OffsetAt(new Date(low.at + diff));
			if (mid.offset === low.offset) {
				low = mid;
			} else {
				high = mid;
			}
		}

		return low;
	}

	function userOffsets() {
		var startYear = new Date().getFullYear() - 2,
			last = new OffsetAt(new Date(startYear, 0, 1)),
			offsets = [last],
			change, next, i;

		for (i = 1; i < 48; i++) {
			next = new OffsetAt(new Date(startYear, i, 1));
			if (next.offset !== last.offset) {
				change = findChange(last, next);
				offsets.push(change);
				offsets.push(new OffsetAt(new Date(change.at + 6e4)));
			}
			last = next;
		}

		for (i = 0; i < 4; i++) {
			offsets.push(new OffsetAt(new Date(startYear + i, 0, 1)));
			offsets.push(new OffsetAt(new Date(startYear + i, 6, 1)));
		}

		return offsets;
	}

	function sortZoneScores (a, b) {
		if (a.offsetScore !== b.offsetScore) {
			return a.offsetScore - b.offsetScore;
		}
		if (a.abbrScore !== b.abbrScore) {
			return a.abbrScore - b.abbrScore;
		}
		return b.zone.population - a.zone.population;
	}

	function addToGuesses (name, offsets) {
		var i, offset;
		arrayToInt(offsets);
		for (i = 0; i < offsets.length; i++) {
			offset = offsets[i];
			guesses[offset] = guesses[offset] || {};
			guesses[offset][name] = true;
		}
	}

	function guessesForUserOffsets (offsets) {
		var offsetsLength = offsets.length,
			filteredGuesses = {},
			out = [],
			i, j, guessesOffset;

		for (i = 0; i < offsetsLength; i++) {
			guessesOffset = guesses[offsets[i].offset] || {};
			for (j in guessesOffset) {
				if (guessesOffset.hasOwnProperty(j)) {
					filteredGuesses[j] = true;
				}
			}
		}

		for (i in filteredGuesses) {
			if (filteredGuesses.hasOwnProperty(i)) {
				out.push(names[i]);
			}
		}

		return out;
	}

	function rebuildGuess () {

		// use Intl API when available and returning valid time zone
		try {
			var intlName = Intl.DateTimeFormat().resolvedOptions().timeZone;
			if (intlName){
				var name = names[normalizeName(intlName)];
				if (name) {
					return name;
				}
				logError("Moment Timezone found " + intlName + " from the Intl api, but did not have that data loaded.");
			}
		} catch (e) {
			// Intl unavailable, fall back to manual guessing.
		}

		var offsets = userOffsets(),
			offsetsLength = offsets.length,
			guesses = guessesForUserOffsets(offsets),
			zoneScores = [],
			zoneScore, i, j;

		for (i = 0; i < guesses.length; i++) {
			zoneScore = new ZoneScore(getZone(guesses[i]), offsetsLength);
			for (j = 0; j < offsetsLength; j++) {
				zoneScore.scoreOffsetAt(offsets[j]);
			}
			zoneScores.push(zoneScore);
		}

		zoneScores.sort(sortZoneScores);

		return zoneScores.length > 0 ? zoneScores[0].zone.name : undefined;
	}

	function guess (ignoreCache) {
		if (!cachedGuess || ignoreCache) {
			cachedGuess = rebuildGuess();
		}
		return cachedGuess;
	}

	/************************************
		Global Methods
	************************************/

	function normalizeName (name) {
		return (name || '').toLowerCase().replace(/\//g, '_');
	}

	function addZone (packed) {
		var i, name, split, normalized;

		if (typeof packed === "string") {
			packed = [packed];
		}

		for (i = 0; i < packed.length; i++) {
			split = packed[i].split('|');
			name = split[0];
			normalized = normalizeName(name);
			zones[normalized] = packed[i];
			names[normalized] = name;
			if (split[5]) {
				addToGuesses(normalized, split[2].split(' '));
			}
		}
	}

	function getZone (name, caller) {
		name = normalizeName(name);

		var zone = zones[name];
		var link;

		if (zone instanceof Zone) {
			return zone;
		}

		if (typeof zone === 'string') {
			zone = new Zone(zone);
			zones[name] = zone;
			return zone;
		}

		// Pass getZone to prevent recursion more than 1 level deep
		if (links[name] && caller !== getZone && (link = getZone(links[name], getZone))) {
			zone = zones[name] = new Zone();
			zone._set(link);
			zone.name = names[name];
			return zone;
		}

		return null;
	}

	function getNames () {
		var i, out = [];

		for (i in names) {
			if (names.hasOwnProperty(i) && (zones[i] || zones[links[i]]) && names[i]) {
				out.push(names[i]);
			}
		}

		return out.sort();
	}

	function addLink (aliases) {
		var i, alias, normal0, normal1;

		if (typeof aliases === "string") {
			aliases = [aliases];
		}

		for (i = 0; i < aliases.length; i++) {
			alias = aliases[i].split('|');

			normal0 = normalizeName(alias[0]);
			normal1 = normalizeName(alias[1]);

			links[normal0] = normal1;
			names[normal0] = alias[0];

			links[normal1] = normal0;
			names[normal1] = alias[1];
		}
	}

	function loadData (data) {
		addZone(data.zones);
		addLink(data.links);
		tz.dataVersion = data.version;
	}

	function zoneExists (name) {
		if (!zoneExists.didShowError) {
			zoneExists.didShowError = true;
				logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
		}
		return !!getZone(name);
	}

	function needsOffset (m) {
		return !!(m._a && (m._tzm === undefined));
	}

	function logError (message) {
		if (typeof console !== 'undefined' && typeof console.error === 'function') {
			console.error(message);
		}
	}

	/************************************
		moment.tz namespace
	************************************/

	function tz (input) {
		var args = Array.prototype.slice.call(arguments, 0, -1),
			name = arguments[arguments.length - 1],
			zone = getZone(name),
			out  = moment.utc.apply(null, args);

		if (zone && !moment.isMoment(input) && needsOffset(out)) {
			out.add(zone.parse(out), 'minutes');
		}

		out.tz(name);

		return out;
	}

	tz.version	 = VERSION;
	tz.dataVersion  = '';
	tz._zones	  = zones;
	tz._links	  = links;
	tz._names	  = names;
	tz.add		= addZone;
	tz.link	    = addLink;
	tz.load	    = loadData;
	tz.zone	    = getZone;
	tz.zoneExists   = zoneExists; // deprecated in 0.1.0
	tz.guess	   = guess;
	tz.names	   = getNames;
	tz.Zone	    = Zone;
	tz.unpack	  = unpack;
	tz.unpackBase60 = unpackBase60;
	tz.needsOffset  = needsOffset;
	tz.moveInvalidForward   = true;
	tz.moveAmbiguousForward = false;

	/************************************
		Interface with Moment.js
	************************************/

	var fn = moment.fn;

	moment.tz = tz;

	moment.defaultZone = null;

	moment.updateOffset = function (mom, keepTime) {
		var zone = moment.defaultZone,
			offset;

		if (mom._z === undefined) {
			if (zone && needsOffset(mom) && !mom._isUTC) {
				mom._d = moment.utc(mom._a)._d;
				mom.utc().add(zone.parse(mom), 'minutes');
			}
			mom._z = zone;
		}
		if (mom._z) {
			offset = mom._z.offset(mom);
			if (Math.abs(offset) < 16) {
				offset = offset / 60;
			}
			if (mom.utcOffset !== undefined) {
				mom.utcOffset(-offset, keepTime);
			} else {
				mom.zone(offset, keepTime);
			}
		}
	};

	fn.tz = function (name) {
		if (name) {
			this._z = getZone(name);
			if (this._z) {
				moment.updateOffset(this);
			} else {
				logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
			}
			return this;
		}
		if (this._z) { return this._z.name; }
	};

	function abbrWrap (old) {
		return function () {
			if (this._z) { return this._z.abbr(this); }
			return old.call(this);
		};
	}

	function resetZoneWrap (old) {
		return function () {
			this._z = null;
			return old.apply(this, arguments);
		};
	}

	fn.zoneName = abbrWrap(fn.zoneName);
	fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
	fn.utc	 = resetZoneWrap(fn.utc);

	moment.tz.setDefault = function(name) {
		if (major < 2 || (major === 2 && minor < 9)) {
			logError('Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js ' + moment.version + '.');
		}
		moment.defaultZone = name ? getZone(name) : null;
		return moment;
	};

	// Cloning a moment should include the _z property.
	var momentProperties = moment.momentProperties;
	if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
		// moment 2.8.1+
		momentProperties.push('_z');
		momentProperties.push('_a');
	} else if (momentProperties) {
		// moment 2.7.0
		momentProperties._z = null;
	}

	loadData({
		"version": "2016j",
		"zones": [
			'Africa/Abidjan|GMT|0|0||48e5',
			'Africa/Nairobi|EAT|-30|0||47e5',
			'Africa/Algiers|CET|-10|0||26e5',
			'Africa/Lagos|WAT|-10|0||17e6',
			'Africa/Maputo|CAT|-20|0||26e5',
			'Africa/Cairo|EET EEST|-20 -30|0101010101010101010101010101010|1bom0 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1o10 11z0 1qN0 11z0 1o10 11z0 1o10 WL0 1qN0 Rb0 1wp0 On0 1zd0 Lz0 1EN0 Fb0 c10 8n0 8Nd0 gL0 e10 mn0|15e6',
			'Africa/Casablanca|WET WEST|0 -10|010101010101010101010101010101010101010101010|1xwo0 AL0 1Nd0 wn0 1FB0 Db0 1zd0 Lz0 1Nf0 wM0 co0 go0 1o00 s00 dA0 vc0 11A0 A00 e00 y00 11A0 uM0 e00 Dc0 11A0 s00 e00 IM0 WM0 mo0 gM0 LA0 WM0 jA0 e00 Rc0 11A0 e00 e00 U00 11A0 8o0 e00 11A0|32e5',
			'Europe/Paris|CET CEST|-10 -20|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|11e6',
			'Africa/Johannesburg|SAST|-20|0||84e5',
			'Africa/Khartoum|CAT EAT|-20 -30|01|1d8y0|51e5',
			'Africa/Tripoli|EET CET CEST|-20 -10 -20|0120|1IlA0 TA0 1o00|11e5',
			'Africa/Tunis|CET CEST|-10 -20|010101010|1q1z0 10N0 1aN0 1qM0 WM0 1qM0 11A0 1o00|20e5',
			'Africa/Windhoek|WAST WAT|-20 -10|010101010101010101010101010101010101010101010|1be00 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0|32e4',
			'America/Adak|HST HDT|a0 90|010101010101010101010101010101010101010101010|1bec0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|326',
			'America/Anchorage|AKST AKDT|90 80|010101010101010101010101010101010101010101010|1beb0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|30e4',
			'America/Puerto_Rico|AST|40|0||24e5',
			'America/Araguaina|BRST BRT|20 30|010101010101|1aVe0 1tB0 WL0 1tB0 Rb0 1zd0 On0 1HB0 FX0 ny10 Lz0|14e4',
			'America/Argentina/Buenos_Aires|ART ARST ARST|30 30 20|0102020|1cqP0 10M0 j3c0 uL0 1qN0 WL0',
			'America/Argentina/Catamarca|ART ARST WART ARST|30 30 40 20|0102030|1cqP0 10M0 ako0 7B0 8zb0 uL0',
			'America/Argentina/Jujuy|ART ARST ARST|30 30 20|01020|1cqP0 10M0 j3c0 uL0',
			'America/Argentina/Mendoza|ART ARST WART ARST|30 30 40 20|0102030|1cqP0 10M0 agM0 Op0 7TX0 uL0',
			'America/Argentina/San_Juan|ART ARST WART ARST|30 30 40 20|0102030|1cqP0 10M0 ak00 m10 8lb0 uL0',
			'America/Argentina/San_Luis|ART WARST WART ARST|30 30 40 20|01020312120|1cqP0 10M0 ak00 m10 8lb0 8L0 jd0 1qN0 WL0 1qN0',
			'America/Argentina/Tucuman|ART ARST WART ARST|30 30 40 20|010203030|1cqP0 10M0 ako0 4N0 8BX0 uL0 1qN0 WL0',
			'America/Argentina/Ushuaia|ART ARST WART ARST|30 30 40 20|0102030|1cqP0 10M0 ajA0 8p0 8zb0 uL0',
			'America/Asuncion|PYST PYT|30 40|010101010101010101010101010101010101010101010|1b2P0 1o10 11z0 1o10 11z0 1qN0 1cL0 WN0 1qL0 11B0 1nX0 1ip0 WL0 1qN0 WL0 1qN0 WL0 1tB0 TX0 1tB0 TX0 1tB0 19X0 1a10 1fz0 1a10 1fz0 1cN0 17b0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0 19X0 1ip0 17b0 1ip0 17b0 1ip0|28e5',
			'America/Panama|EST|50|0||15e5',
			'America/Bahia|BRST BRT|20 30|010101010101|1aVe0 1tB0 WL0 1tB0 Rb0 1zd0 On0 1HB0 FX0 l5B0 Rb0|27e5',
			'America/Bahia_Banderas|MST MDT CDT CST|70 60 50 60|010101010101010101010102323232323232323232323|1be90 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nW0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|84e3',
			'America/Belem|BRT|30|0||20e5',
			'America/Costa_Rica|CST|60|0||12e5',
			'America/Boa_Vista|AMT AMST|40 30|01010|1cqQ0 WL0 1tB0 2L0|62e2',
			'America/Bogota|COT|50|0||90e5',
			'America/Denver|MST MDT|70 60|010101010101010101010101010101010101010101010|1be90 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|26e5',
			'America/Cambridge_Bay|MST MDT CST CDT EST|70 60 60 50 50|0123421010101010101010101010101010101010101010|1be90 1nX0 11A0 1nX0 2K0 WQ0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e2',
			'America/Campo_Grande|AMST AMT|30 40|010101010101010101010101010101010101010101010|1aVf0 1tB0 WL0 1tB0 Rb0 1zd0 On0 1HB0 FX0 1C10 Lz0 1Ip0 HX0 1zd0 On0 1HB0 IL0 1wp0 On0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10|77e4',
			'America/Cancun|CST CDT EST|60 50 50|0101010101010101010101010101010102|1be80 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 Dd0|63e4',
			'America/Caracas|VET VET|40 4u|010|1wmv0 kqo0|29e5',
			'America/Cayenne|GFT|30|0||58e3',
			'America/Chicago|CST CDT|60 50|010101010101010101010101010101010101010101010|1be80 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|92e5',
			'America/Chihuahua|MST MDT|70 60|010101010101010101010101010101010101010101010|1be90 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|81e4',
			'America/Phoenix|MST|70|0||42e5',
			'America/Cuiaba|AMST AMT|30 40|0101010101010101010101010101010101010101010|1aVf0 1tB0 WL0 1tB0 Rb0 1zd0 On0 1HB0 FX0 4a10 HX0 1zd0 On0 1HB0 IL0 1wp0 On0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10|54e4',
			'America/Los_Angeles|PST PDT|80 70|010101010101010101010101010101010101010101010|1bea0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|15e6',
			'America/New_York|EST EDT|50 40|010101010101010101010101010101010101010101010|1be70 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|21e6',
			'America/Rio_Branco|ACT AMT|50 40|010|1xFF0 d5X0|31e4',
			'America/Tijuana|PST PDT|80 70|010101010101010101010101010101010101010101010|1bea0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 U10 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|20e5',
			'America/Fort_Nelson|PST PDT MST|80 70 70|0101010101010101010101010101010102|1bea0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0|39e2',
			'America/Fort_Wayne|EST EDT|50 40|0101010101010101010101010101010|1sg70 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/Fortaleza|BRT BRST|30 20|0101010|1cqP0 WL0 1tB0 5z0 2mN0 On0|34e5',
			'America/Halifax|AST ADT|40 30|010101010101010101010101010101010101010101010|1be60 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|39e4',
			'America/Godthab|WGT WGST|30 20|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|17e3',
			'America/Goose_Bay|AST ADT|40 30|010101010101010101010101010101010101010101010|1be41 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|76e2',
			'America/Grand_Turk|EST EDT AST|50 40 40|01010101010101010101010101010101012|1be70 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|37e2',
			'America/Guatemala|CST CDT|60 50|010|1sri0 11z0|13e5',
			'America/Guayaquil|ECT|50|0||27e5',
			'America/Guyana|GYT|40|0||80e4',
			'America/Havana|CST CDT|50 40|01010101010101010101010101010101010101010|1bbh0 1qM0 11A0 1o00 11A0 1o00 14o0 1lc0 14o0 1lc0 11A0 6i00 Rc0 1wo0 U00 1tA0 Rc0 1wo0 U00 1wo0 U00 1zc0 U00 1qM0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0|21e5',
			'America/Indiana/Knox|EST CDT CST|50 50 60|0121212121212121212121212121212|1sg70 1o00 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/Indiana/Petersburg|EST CDT CST EDT|50 50 60 40|0121030303030303030303030303030|1sg70 1o00 Rd0 1zb0 Oo0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/Indiana/Winamac|EST CDT CST EDT|50 50 60 40|0123030303030303030303030303030|1sg70 1o00 Rd0 1za0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/Iqaluit|EST EDT CST CDT|50 40 60 50|012301010101010101010101010101010101010101010|1be70 1nX0 11C0 1nX0 11A0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|67e2',
			'America/Kentucky/Monticello|CST CDT EST EDT|60 50 50 40|010123232323232323232323232323232323232323232|1be80 1nX0 11B0 1nX0 11A0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/La_Paz|BOT|40|0||19e5',
			'America/Lima|PET|50|0||11e6',
			'America/Managua|CST CDT|60 50|01010|1pRi0 19X0 1o30 11y0|22e5',
			'America/Manaus|AMT|40|0||19e5',
			'America/Matamoros|CST CDT|60 50|010101010101010101010101010101010101010101010|1be80 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 U10 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|45e4',
			'America/Mexico_City|CST CDT|60 50|010101010101010101010101010101010101010101010|1be80 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0|20e6',
			'America/Metlakatla|PST AKST AKDT|80 90 80|012121212121|1PAa0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|14e2',
			'America/Miquelon|PMST PMDT|30 20|010101010101010101010101010101010101010101010|1be50 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|61e2',
			'America/Moncton|AST ADT|40 30|010101010101010101010101010101010101010101010|1be41 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 ReX 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|64e3',
			'America/Montevideo|UYT UYST|30 20|01010101010101010101010|1ow30 1fB0 1ip0 11z0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10 14n0 1ld0 14n0 1ld0 14n0 1o10 11z0 1o10 11z0 1o10 11z0|17e5',
			'America/Noronha|FNT FNST|20 10|0101010|1cqO0 WL0 1tB0 2L0 2pB0 On0|30e2',
			'America/North_Dakota/Beulah|MST MDT CST CDT|70 60 60 50|010101010101010101010101232323232323232323232|1be90 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Oo0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/North_Dakota/New_Salem|MST MDT CST CDT|70 60 60 50|010101010123232323232323232323232323232323232|1be90 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14o0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0',
			'America/Ojinaga|MST MDT|70 60|010101010101010101010101010101010101010101010|1be90 1nX0 11B0 1nX0 1fB0 WL0 1fB0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 U10 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|23e3',
			'America/Paramaribo|SRT|30|0||24e4',
			'America/Port-au-Prince|EST EDT|50 40|0101010101010|1pOt0 1nX0 11B0 1nX0 d430 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|23e5',
			'America/Rankin_Inlet|CST CDT EST|60 50 50|010121010101010101010101010101010101010101010|1be80 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|26e2',
			'America/Recife|BRT BRST|30 20|0101010|1cqP0 WL0 1tB0 2L0 2pB0 On0|33e5',
			'America/Resolute|CST CDT EST|60 50 50|010121010101010121010101010101010101010101010|1be80 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|229',
			'America/Santarem|AMT BRT|40 30|01|1xFE0|21e4',
			'America/Santiago|CLST CLT|30 40|0101010101010101010101010101010101010101010|1be30 1fB0 11z0 1qN0 WL0 1qN0 WL0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 17b0 1ip0 11z0 1o10 19X0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0|62e5',
			'America/Santo_Domingo|AST EST|40 50|010|1f3G0 e00|29e5',
			'America/Sao_Paulo|BRST BRT|20 30|010101010101010101010101010101010101010101010|1aVe0 1tB0 WL0 1tB0 Rb0 1zd0 On0 1HB0 FX0 1C10 Lz0 1Ip0 HX0 1zd0 On0 1HB0 IL0 1wp0 On0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 Rb0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10|20e6',
			'America/Scoresbysund|EGT EGST|10 0|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|452',
			'America/St_Johns|NST NDT|3u 2u|010101010101010101010101010101010101010101010|1be3v 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zcX Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|11e4',
			'America/Tegucigalpa|CST CDT|60 50|010|1su60 AL0|11e5',
			'America/Winnipeg|CST CDT|60 50|010101010101010101010101010101010101010101010|1be80 1o00 11A0 1o00 11A0 1o00 14o0 1lc0 14o0 1lc0 14o0 1o00 11A0 1o00 11A0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|66e4',
			'Antarctica/Casey|+08 +11|-80 -b0|010101|1ARS0 T90 40P0 KL0 blz0|10',
			'Antarctica/Davis|+07 +05|-70 -50|01010|1ART0 VB0 3Wn0 KN0|70',
			'Antarctica/DumontDUrville|+10|-a0|0||80',
			'Antarctica/Macquarie|AEDT AEST MIST|-b0 -a0 -b0|010101010101010101010102|1bb40 1fA0 1a00 11A0 1o00 1io0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1cM0 1a00 1io0 1cM0 1cM0 1cM0 1cM0 1cM0|1',
			'Antarctica/Mawson|+06 +05|-60 -50|01|1ARU0|60',
			'Pacific/Auckland|NZDT NZST|-d0 -c0|010101010101010101010101010101010101010101010|1b8e0 1io0 17c0 1io0 17c0 1lc0 14o0 1lc0 14o0 1lc0 17c0 1io0 17c0 1io0 17c0 1io0 17c0 1io0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|14e5',
			'Antarctica/Rothera|-03|30|0||130',
			'Antarctica/Syowa|+03|-30|0||20',
			'Antarctica/Troll|-00 +00 +02|0 0 -20|0121212121212121212121212121212121|1puo0 hd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|40',
			'Antarctica/Vostok|+06|-60|0||25',
			'Asia/Riyadh|AST|-30|0||57e5',
			'Asia/Almaty|+06 +07|-60 -70|0101010101010|1bb80 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0|15e5',
			'Asia/Amman|EET EEST|-20 -30|0101010101010101010101010101010101010101010|1bNa0 y00 1fc0 1dc0 1co0 1dc0 1cM0 1cM0 1cM0 1o00 11A0 1lc0 17c0 1cM0 1cM0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 4bX0 Dd0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0|25e5',
			'Asia/Kamchatka|+12 +13 +11|-c0 -d0 -b0|0101010101010101010101020|1bb20 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 2sp0 WM0|18e4',
			'Asia/Oral|+04 +05|-40 -50|010101010101|1bba0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0|27e4',
			'Asia/Aqtobe|+05 +06|-50 -60|0101010101010|1bb90 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0|27e4',
			'Asia/Tashkent|+05|-50|0||23e5',
			'Asia/Atyrau|+05 +04|-50 -40|01010101010|1cBW0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0',
			'Asia/Baghdad|AST ADT|-30 -40|0101010101010101010|1bcM0 1dc0 1dc0 1dc0 1cM0 1dc0 1cM0 1dc0 1cM0 1dc0 1dc0 1dc0 1cM0 1dc0 1cM0 1dc0 1cM0 1dc0|66e5',
			'Asia/Baku|+04 +05|-40 -50|01010101010101010101010101010101010|1bbc0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00|27e5',
			'Asia/Bangkok|ICT|-70|0||15e6',
			'Asia/Barnaul|+06 +07|-60 -70|0101010101010101010101010101|1bb80 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3rd0',
			'Asia/Beirut|EET EEST|-20 -30|010101010101010101010101010101010101010101010|1bba0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0|22e5',
			'Asia/Bishkek|+05 +06|-50 -60|01010101010101|1bb9u 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0|87e4',
			'Asia/Brunei|BNT|-80|0||42e4',
			'Asia/Kolkata|IST|-5u|0||15e6',
			'Asia/Chita|+09 +10 +08|-90 -a0 -80|0101010101010101010101010120|1bb50 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3re0|33e4',
			'Asia/Choibalsan|CHOT CHOST CHOT CHOST|-90 -a0 -80 -90|01010101010102323232323232|1gfR0 11z0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 3Db0 h1f0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|38e3',
			'Asia/Shanghai|CST|-80|0||23e6',
			'Asia/Colombo|+06 +0530|-60 -5u|01|1sl6u|22e5',
			'Asia/Dhaka|BDT BDST|-60 -70|010|1A5R0 1i00|16e6',
			'Asia/Damascus|EET EEST|-20 -30|010101010101010101010101010101010101010101010|1bcK0 1db0 1dd0 1db0 1cN0 1db0 1cN0 1db0 1cN0 1db0 1dd0 1db0 1cN0 1db0 1cN0 19z0 1fB0 1qL0 11B0 1on0 Wp0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0|26e5',
			'Asia/Dili|WITA TLT|-80 -90|01|1eKE0|19e4',
			'Asia/Dubai|GST|-40|0||39e5',
			'Asia/Famagusta|EET EEST +03|-20 -30 -30|0101010101010101010101010101010101012|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 15U0',
			'Asia/Gaza|EET EEST|-20 -30|010101010101010101010101010101010101010101010|1biK0 1cL0 1fB0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 17c0 1io0 18N0 1bz0 19z0 1gp0 1610 1iL0 11z0 1o10 14o0 1lA1 SKX 1xd1 MKX 1AN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1220 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0|18e5',
			'Asia/Hebron|EET EEST|-20 -30|01010101010101010101010101010101010101010101010|1biK0 1cL0 1fB0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 17c0 1io0 18N0 1bz0 19z0 1gp0 1610 1iL0 12L0 1mN0 14o0 1lc0 Tb0 1xd1 MKX bB0 cn0 1cN0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1220 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0|25e4',
			'Asia/Hong_Kong|HKT|-80|0||73e5',
			'Asia/Hovd|HOVT HOVST|-70 -80|0101010101010101010101010|1gfT0 11z0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 kEp0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|81e3',
			'Asia/Irkutsk|+08 +09|-80 -90|010101010101010101010101010|1bb60 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|60e4',
			'Europe/Istanbul|EET EEST +03|-20 -30 -30|0101010101010101010101010101010101012|1bbb0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WO0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 Xc0 1qo0 WM0 1qM0 11A0 1o00 1200 1nA0 11A0 1tA0 U00 15w0|13e6',
			'Asia/Jakarta|WIB|-70|0||31e6',
			'Asia/Jayapura|WIT|-90|0||26e4',
			'Asia/Jerusalem|IST IDT|-20 -30|010101010101010101010101010101010101010101010|1bdc0 11z0 1tB0 19W0 1e10 17b0 1ep0 1gL0 18N0 1fz0 1eN0 17b0 1gq0 1gn0 19d0 1dz0 1c10 17X0 1hB0 1gn0 19d0 1dz0 1c10 17X0 1kp0 1dz0 1c10 1aL0 1eN0 1oL0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0 W10 1rz0 10N0 1oL0 10N0 1oL0|81e4',
			'Asia/Kabul|AFT|-4u|0||46e5',
			'Asia/Karachi|PKT PKST|-50 -60|0101010|1ixv0 1cL0 dK10 11b0 1610 1jX0|24e6',
			'Asia/Urumqi|XJT|-60|0||32e5',
			'Asia/Kathmandu|NPT|-5J|0||12e5',
			'Asia/Khandyga|+09 +10 +11|-90 -a0 -b0|01010101010121212121212121210|1bb50 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 qK0 yN0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 17V0 7zD0|66e2',
			'Asia/Krasnoyarsk|+07 +08|-70 -80|010101010101010101010101010|1bb70 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|10e5',
			'Asia/Kuala_Lumpur|MYT|-80|0||71e5',
			'Asia/Macau|MOT CST|-80 -80|01|1cVQ0|57e4',
			'Asia/Magadan|+11 +12 +10|-b0 -c0 -a0|0101010101010101010101010120|1bb30 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3Cq0|95e3',
			'Asia/Makassar|WITA|-80|0||15e5',
			'Asia/Manila|PHT|-80|0||24e6',
			'Europe/Athens|EET EEST|-20 -30|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
			'Asia/Novokuznetsk|+07 +08 +06|-70 -80 -60|0101010101010101010101020|1bb70 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 2sp0 WM0|55e4',
			'Asia/Novosibirsk|+06 +07|-60 -70|0101010101010101010101010101|1bb80 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 4eN0|15e5',
			'Asia/Omsk|+06 +07|-60 -70|010101010101010101010101010|1bb80 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|12e5',
			'Asia/Pyongyang|KST KST|-90 -8u|01|1P4D0|29e5',
			'Asia/Qyzylorda|+05 +06|-50 -60|010101010101|1bb90 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0|73e4',
			'Asia/Rangoon|MMT|-6u|0||48e5',
			'Asia/Sakhalin|+10 +11|-a0 -b0|0101010101010101010101010101|1bb40 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3rd0|58e4',
			'Asia/Seoul|KST|-90|0||23e6',
			'Asia/Singapore|SGT|-80|0||56e5',
			'Asia/Srednekolymsk|+11 +12|-b0 -c0|010101010101010101010101010|1bb30 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|35e2',
			'Asia/Tbilisi|+04 +05 +03|-40 -50 -30|010101010101020|1bb80 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 An0 Os0 WM0|11e5',
			'Asia/Tehran|IRST IRDT|-3u -4u|01010101010101010101010101010101010101010|1b8Iu 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 64p0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0|14e6',
			'Asia/Thimphu|BTT|-60|0||79e3',
			'Asia/Tokyo|JST|-90|0||38e6',
			'Asia/Tomsk|+07 +08 +06|-70 -80 -60|01010101020202020202020202020|1bb70 1qM0 WM0 1qM0 WM0 1qM0 11A0 co0 1bB0 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3Qp0|10e5',
			'Asia/Ulaanbaatar|ULAT ULAST|-80 -90|0101010101010101010101010|1gfS0 11z0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 kEp0 1cJ0 1cP0 1cJ0 1cP0 1fx0 1cP0 1cJ0 1cP0 1cJ0 1cP0 1cJ0|12e5',
			'Asia/Ust-Nera|+11 +12 +10|-b0 -c0 -a0|0101010101010101010101010102|1bb30 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 17V0 7zD0|65e2',
			'Asia/Vladivostok|+10 +11|-a0 -b0|010101010101010101010101010|1bb40 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|60e4',
			'Asia/Yakutsk|+09 +10|-90 -a0|010101010101010101010101010|1bb50 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|28e4',
			'Asia/Yekaterinburg|+05 +06|-50 -60|010101010101010101010101010|1bb90 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|14e5',
			'Asia/Yerevan|+04 +05|-40 -50|010101010101010101010101010|1bba0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|13e5',
			'Atlantic/Azores|AZOT AZOST|10 0|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|25e4',
			'Europe/Lisbon|WET WEST|0 -10|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|27e5',
			'Atlantic/Cape_Verde|CVT|10|0||50e4',
			'Atlantic/South_Georgia|GST|20|0||30',
			'Atlantic/Stanley|FKST FKT|30 40|0101010101010101010101010|1bjD0 WN0 1qL0 WN0 1qN0 U10 1wn0 Rd0 1wn0 U10 1tz0 U10 1tz0 U10 1tz0 U10 1tz0 U10 1wn0 U10 1tz0 U10 1tz0 U10|21e2',
			'Australia/Sydney|AEDT AEST|-b0 -a0|010101010101010101010101010101010101010101010|1bb40 1qM0 WM0 11A0 1o00 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 11A0 1o00 WM0 1qM0 14o0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|40e5',
			'Australia/Adelaide|ACDT ACST|-au -9u|010101010101010101010101010101010101010101010|1bb4u 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 11A0 1o00 WM0 1qM0 14o0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|11e5',
			'Australia/Brisbane|AEST|-a0|0||20e5',
			'Australia/Hobart|AEDT AEST|-b0 -a0|010101010101010101010101010101010101010101010|1bb40 1fA0 1a00 11A0 1o00 1io0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1cM0 1a00 1io0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0|21e4',
			'Australia/Darwin|ACST|-9u|0||12e4',
			'Australia/Eucla|ACWST ACWDT|-8J -9J|0101010|1tRRf IM0 1qM0 11A0 1o00 11A0|368',
			'Australia/Lord_Howe|LHDT LHST|-b0 -au|010101010101010101010101010101010101010101010|1bb30 1qMu WLu 11Au 1nXu 1qMu 11zu 1o0u 11zu 1o0u 11zu 1qMu WLu 1qMu 11zu 1o0u WLu 1qMu 14nu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu|347',
			'Australia/Perth|AWST AWDT|-80 -90|0101010|1tRS0 IM0 1qM0 11A0 1o00 11A0|18e5',
			'Pacific/Easter|EASST EAST|50 60|0101010101010101010101010101010101010101010|1be30 1fB0 11z0 1qN0 WL0 1qN0 WL0 1qN0 WL0 1qN0 11z0 1o10 11z0 1o10 11z0 1qN0 WL0 1qN0 17b0 1ip0 11z0 1o10 19X0 1fB0 1nX0 G10 1EL0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0|30e2',
			'Europe/Dublin|GMT IST|0 -10|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|12e5',
			'Etc/GMT+1|-01|10|0|',
			'Etc/GMT+10|-10|a0|0|',
			'Etc/GMT+11|-11|b0|0|',
			'Etc/GMT+12|-12|c0|0|',
			'Etc/GMT+2|-02|20|0|',
			'Etc/GMT+4|-04|40|0|',
			'Etc/GMT+5|-05|50|0|',
			'Etc/GMT+6|-06|60|0|',
			'Etc/GMT+7|-07|70|0|',
			'Etc/GMT+8|-08|80|0|',
			'Etc/GMT+9|-09|90|0|',
			'Etc/GMT-1|+01|-10|0|',
			'Etc/GMT-11|+11|-b0|0|',
			'Etc/GMT-12|+12|-c0|0|',
			'Etc/GMT-13|+13|-d0|0|',
			'Etc/GMT-14|+14|-e0|0|',
			'Etc/GMT-2|+02|-20|0|',
			'Etc/GMT-4|+04|-40|0|',
			'Etc/GMT-7|+07|-70|0|',
			'Etc/GMT-8|+08|-80|0|',
			'Etc/GMT-9|+09|-90|0|',
			'Etc/UCT|UCT|0|0|',
			'Etc/UTC|UTC|0|0|',
			'Europe/Astrakhan|+03 +04|-30 -40|0101010101010101010101010101|1bbb0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3rd0',
			'Europe/London|GMT BST|0 -10|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|10e6',
			'Europe/Chisinau|EET EEST|-20 -30|010101010101010101010101010101010101010101010|1bbc0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|67e4',
			'Europe/Kaliningrad|EET EEST +03|-20 -30 -30|010101010101010101010101020|1bbc0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|44e4',
			'Europe/Volgograd|+03 +04|-30 -40|010101010101010101010101010|1bbb0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|10e5',
			'Europe/Minsk|EET EEST +03|-20 -30 -30|01010101010101010101010102|1bbc0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0|19e5',
			'Europe/Moscow|MSK MSD MSK|-30 -40 -40|010101010101010101010101020|1bbb0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0|16e6',
			'Europe/Riga|EET EEST|-20 -30|0101010101010101010101010101010101010101010|1bbd0 1qM0 3oo0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|64e4',
			'Europe/Samara|+04 +05 +03|-40 -50 -30|0101010101010101010101020|1bba0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 2sp0 WM0|12e5',
			'Europe/Saratov|+03 +04|-30 -40|0101010101010101010101010101|1bbb0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 5810',
			'Europe/Simferopol|EET EEST MSK MSK|-20 -30 -40 -30|010101010101010101010101010101023|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11z0 1nW0|33e4',
			'Europe/Tallinn|EET EEST|-20 -30|01010101010101010101010101010101010101010|1bbd0 1qM0 5QM0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|41e4',
			'Europe/Vilnius|CET CEST EET EEST|-10 -20 -20 -30|012323232323232323232323232323232323232|1bbd0 1qM0 8io0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|54e4',
			'Pacific/Honolulu|HST|a0|0||37e4',
			'Indian/Chagos|IOT|-60|0||30e2',
			'Indian/Christmas|CXT|-70|0||21e2',
			'Indian/Cocos|CCT|-6u|0||596',
			'Indian/Mahe|SCT|-40|0||79e3',
			'Indian/Maldives|MVT|-50|0||35e4',
			'Indian/Mauritius|MUT MUST|-40 -50|010|1yva0 11z0|15e4',
			'Indian/Reunion|RET|-40|0||84e4',
			'Pacific/Majuro|MHT|-c0|0||28e3',
			'MET|MET MEST|-10 -20|010101010101010101010101010101010101010101010|1bbd0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00',
			'Pacific/Chatham|CHADT CHAST|-dJ -cJ|010101010101010101010101010101010101010101010|1b8e0 1io0 17c0 1io0 17c0 1lc0 14o0 1lc0 14o0 1lc0 17c0 1io0 17c0 1io0 17c0 1io0 17c0 1io0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|600',
			'Pacific/Apia|SST SDT WSDT WSST|b0 a0 -e0 -d0|01012323232323232323232|1Dbn0 1ff0 1a00 CI0 AQ0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00|37e3',
			'Pacific/Bougainville|PGT BST|-a0 -b0|01|1NwE0|18e4',
			'Pacific/Chuuk|CHUT|-a0|0||49e3',
			'Pacific/Efate|VUT|-b0|0||66e3',
			'Pacific/Enderbury|PHOT|-d0|0||1',
			'Pacific/Fakaofo|TKT TKT|b0 -d0|01|1Gfn0|483',
			'Pacific/Fiji|FJST FJT|-d0 -c0|010101010101010101010101010|1aXO0 1EM0 IM0 nJc0 LA0 1o00 Rc0 1wo0 Ao0 1Nc0 Ao0 1Q00 xz0 1SN0 uM0 1SM0 uM0 1VA0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0|88e4',
			'Pacific/Funafuti|TVT|-c0|0||45e2',
			'Pacific/Galapagos|GALT|60|0||25e3',
			'Pacific/Gambier|GAMT|90|0||125',
			'Pacific/Guadalcanal|SBT|-b0|0||11e4',
			'Pacific/Guam|GST ChST|-a0 -a0|01|1fpq0|17e4',
			'Pacific/Kiritimati|LINT|-e0|0||51e2',
			'Pacific/Kosrae|KOST|-b0|0||66e2',
			'Pacific/Marquesas|MART|9u|0||86e2',
			'Pacific/Pago_Pago|SST|b0|0||37e2',
			'Pacific/Nauru|NRT|-c0|0||10e3',
			'Pacific/Niue|NUT|b0|0||12e2',
			'Pacific/Norfolk|NFT NFT|-bu -b0|01|1PoCu|25e4',
			'Pacific/Noumea|NCT|-b0|0||98e3',
			'Pacific/Palau|PWT|-90|0||21e3',
			'Pacific/Pitcairn|PST|80|0||56',
			'Pacific/Pohnpei|PONT|-b0|0||34e3',
			'Pacific/Port_Moresby|PGT|-a0|0||25e4',
			'Pacific/Rarotonga|CKT|a0|0||13e3',
			'Pacific/Tahiti|TAHT|a0|0||18e4',
			'Pacific/Tarawa|GILT|-c0|0||29e3',
			'Pacific/Tongatapu|+13 +14|-d0 -e0|0101010101010101|1csd0 15A0 1wo0 xz0 1Q10 xz0 zWN0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0|75e3',
			'Pacific/Wake|WAKT|-c0|0||16e3',
			'Pacific/Wallis|WFT|-c0|0||94' ],
		  links:
		   [ 'Africa/Abidjan|Africa/Accra',
			'Africa/Abidjan|Africa/Bamako',
			'Africa/Abidjan|Africa/Banjul',
			'Africa/Abidjan|Africa/Bissau',
			'Africa/Abidjan|Africa/Conakry',
			'Africa/Abidjan|Africa/Dakar',
			'Africa/Abidjan|Africa/Freetown',
			'Africa/Abidjan|Africa/Lome',
			'Africa/Abidjan|Africa/Monrovia',
			'Africa/Abidjan|Africa/Nouakchott',
			'Africa/Abidjan|Africa/Ouagadougou',
			'Africa/Abidjan|Africa/Sao_Tome',
			'Africa/Abidjan|Africa/Timbuktu',
			'Africa/Abidjan|America/Danmarkshavn',
			'Africa/Abidjan|Atlantic/Reykjavik',
			'Africa/Abidjan|Atlantic/St_Helena',
			'Africa/Abidjan|Etc/GMT',
			'Africa/Abidjan|Etc/GMT+0',
			'Africa/Abidjan|Etc/GMT-0',
			'Africa/Abidjan|Etc/GMT0',
			'Africa/Abidjan|Etc/Greenwich',
			'Africa/Abidjan|GMT',
			'Africa/Abidjan|GMT+0',
			'Africa/Abidjan|GMT-0',
			'Africa/Abidjan|GMT0',
			'Africa/Abidjan|Greenwich',
			'Africa/Abidjan|Iceland',
			'Africa/Cairo|Egypt',
			'Africa/Casablanca|Africa/El_Aaiun',
			'Africa/Johannesburg|Africa/Maseru',
			'Africa/Johannesburg|Africa/Mbabane',
			'Africa/Khartoum|Africa/Juba',
			'Africa/Lagos|Africa/Bangui',
			'Africa/Lagos|Africa/Brazzaville',
			'Africa/Lagos|Africa/Douala',
			'Africa/Lagos|Africa/Kinshasa',
			'Africa/Lagos|Africa/Libreville',
			'Africa/Lagos|Africa/Luanda',
			'Africa/Lagos|Africa/Malabo',
			'Africa/Lagos|Africa/Ndjamena',
			'Africa/Lagos|Africa/Niamey',
			'Africa/Lagos|Africa/Porto-Novo',
			'Africa/Maputo|Africa/Blantyre',
			'Africa/Maputo|Africa/Bujumbura',
			'Africa/Maputo|Africa/Gaborone',
			'Africa/Maputo|Africa/Harare',
			'Africa/Maputo|Africa/Kigali',
			'Africa/Maputo|Africa/Lubumbashi',
			'Africa/Maputo|Africa/Lusaka',
			'Africa/Nairobi|Africa/Addis_Ababa',
			'Africa/Nairobi|Africa/Asmara',
			'Africa/Nairobi|Africa/Asmera',
			'Africa/Nairobi|Africa/Dar_es_Salaam',
			'Africa/Nairobi|Africa/Djibouti',
			'Africa/Nairobi|Africa/Kampala',
			'Africa/Nairobi|Africa/Mogadishu',
			'Africa/Nairobi|Indian/Antananarivo',
			'Africa/Nairobi|Indian/Comoro',
			'Africa/Nairobi|Indian/Mayotte',
			'Africa/Tripoli|Libya',
			'America/Adak|America/Atka',
			'America/Adak|US/Aleutian',
			'America/Anchorage|America/Juneau',
			'America/Anchorage|America/Nome',
			'America/Anchorage|America/Sitka',
			'America/Anchorage|America/Yakutat',
			'America/Anchorage|US/Alaska',
			'America/Argentina/Buenos_Aires|America/Argentina/Cordoba',
			'America/Argentina/Buenos_Aires|America/Buenos_Aires',
			'America/Argentina/Buenos_Aires|America/Cordoba',
			'America/Argentina/Buenos_Aires|America/Rosario',
			'America/Argentina/Catamarca|America/Argentina/ComodRivadavia',
			'America/Argentina/Catamarca|America/Argentina/La_Rioja',
			'America/Argentina/Catamarca|America/Argentina/Rio_Gallegos',
			'America/Argentina/Catamarca|America/Catamarca',
			'America/Argentina/Jujuy|America/Argentina/Salta',
			'America/Argentina/Jujuy|America/Jujuy',
			'America/Argentina/Mendoza|America/Mendoza',
			'America/Chicago|America/Menominee',
			'America/Chicago|America/North_Dakota/Center',
			'America/Chicago|America/Rainy_River',
			'America/Chicago|CST6CDT',
			'America/Chicago|US/Central',
			'America/Chihuahua|America/Mazatlan',
			'America/Chihuahua|Mexico/BajaSur',
			'America/Costa_Rica|America/Belize',
			'America/Costa_Rica|America/El_Salvador',
			'America/Costa_Rica|America/Regina',
			'America/Costa_Rica|America/Swift_Current',
			'America/Costa_Rica|Canada/East-Saskatchewan',
			'America/Costa_Rica|Canada/Saskatchewan',
			'America/Denver|America/Boise',
			'America/Denver|America/Edmonton',
			'America/Denver|America/Inuvik',
			'America/Denver|America/Shiprock',
			'America/Denver|America/Yellowknife',
			'America/Denver|Canada/Mountain',
			'America/Denver|MST7MDT',
			'America/Denver|Navajo',
			'America/Denver|US/Mountain',
			'America/Fort_Wayne|America/Indiana/Indianapolis',
			'America/Fort_Wayne|America/Indiana/Marengo',
			'America/Fort_Wayne|America/Indiana/Vevay',
			'America/Fort_Wayne|America/Indianapolis',
			'America/Fort_Wayne|US/East-Indiana',
			'America/Fortaleza|America/Maceio',
			'America/Halifax|America/Glace_Bay',
			'America/Halifax|America/Thule',
			'America/Halifax|Atlantic/Bermuda',
			'America/Halifax|Canada/Atlantic',
			'America/Havana|Cuba',
			'America/Indiana/Knox|America/Indiana/Tell_City',
			'America/Indiana/Knox|America/Knox_IN',
			'America/Indiana/Knox|US/Indiana-Starke',
			'America/Indiana/Petersburg|America/Indiana/Vincennes',
			'America/Iqaluit|America/Pangnirtung',
			'America/Los_Angeles|America/Dawson',
			'America/Los_Angeles|America/Vancouver',
			'America/Los_Angeles|America/Whitehorse',
			'America/Los_Angeles|Canada/Pacific',
			'America/Los_Angeles|Canada/Yukon',
			'America/Los_Angeles|PST8PDT',
			'America/Los_Angeles|US/Pacific',
			'America/Los_Angeles|US/Pacific-New',
			'America/Manaus|America/Porto_Velho',
			'America/Manaus|Brazil/West',
			'America/Mexico_City|America/Merida',
			'America/Mexico_City|America/Monterrey',
			'America/Mexico_City|Mexico/General',
			'America/New_York|America/Detroit',
			'America/New_York|America/Kentucky/Louisville',
			'America/New_York|America/Louisville',
			'America/New_York|America/Montreal',
			'America/New_York|America/Nassau',
			'America/New_York|America/Nipigon',
			'America/New_York|America/Thunder_Bay',
			'America/New_York|America/Toronto',
			'America/New_York|Canada/Eastern',
			'America/New_York|EST5EDT',
			'America/New_York|US/Eastern',
			'America/New_York|US/Michigan',
			'America/Noronha|Brazil/DeNoronha',
			'America/Panama|America/Atikokan',
			'America/Panama|America/Cayman',
			'America/Panama|America/Coral_Harbour',
			'America/Panama|America/Jamaica',
			'America/Panama|EST',
			'America/Panama|Jamaica',
			'America/Phoenix|America/Creston',
			'America/Phoenix|America/Dawson_Creek',
			'America/Phoenix|America/Hermosillo',
			'America/Phoenix|MST',
			'America/Phoenix|US/Arizona',
			'America/Puerto_Rico|America/Anguilla',
			'America/Puerto_Rico|America/Antigua',
			'America/Puerto_Rico|America/Aruba',
			'America/Puerto_Rico|America/Barbados',
			'America/Puerto_Rico|America/Blanc-Sablon',
			'America/Puerto_Rico|America/Curacao',
			'America/Puerto_Rico|America/Dominica',
			'America/Puerto_Rico|America/Grenada',
			'America/Puerto_Rico|America/Guadeloupe',
			'America/Puerto_Rico|America/Kralendijk',
			'America/Puerto_Rico|America/Lower_Princes',
			'America/Puerto_Rico|America/Marigot',
			'America/Puerto_Rico|America/Martinique',
			'America/Puerto_Rico|America/Montserrat',
			'America/Puerto_Rico|America/Port_of_Spain',
			'America/Puerto_Rico|America/St_Barthelemy',
			'America/Puerto_Rico|America/St_Kitts',
			'America/Puerto_Rico|America/St_Lucia',
			'America/Puerto_Rico|America/St_Thomas',
			'America/Puerto_Rico|America/St_Vincent',
			'America/Puerto_Rico|America/Tortola',
			'America/Puerto_Rico|America/Virgin',
			'America/Rio_Branco|America/Eirunepe',
			'America/Rio_Branco|America/Porto_Acre',
			'America/Rio_Branco|Brazil/Acre',
			'America/Santiago|Antarctica/Palmer',
			'America/Santiago|Chile/Continental',
			'America/Sao_Paulo|Brazil/East',
			'America/St_Johns|Canada/Newfoundland',
			'America/Tijuana|America/Ensenada',
			'America/Tijuana|America/Santa_Isabel',
			'America/Tijuana|Mexico/BajaNorte',
			'America/Winnipeg|Canada/Central',
			'Antarctica/DumontDUrville|Etc/GMT-10',
			'Antarctica/Rothera|Etc/GMT+3',
			'Antarctica/Syowa|Etc/GMT-3',
			'Antarctica/Vostok|Etc/GMT-6',
			'Asia/Bangkok|Asia/Ho_Chi_Minh',
			'Asia/Bangkok|Asia/Phnom_Penh',
			'Asia/Bangkok|Asia/Saigon',
			'Asia/Bangkok|Asia/Vientiane',
			'Asia/Dhaka|Asia/Dacca',
			'Asia/Dubai|Asia/Muscat',
			'Asia/Hong_Kong|Hongkong',
			'Asia/Jakarta|Asia/Pontianak',
			'Asia/Jerusalem|Asia/Tel_Aviv',
			'Asia/Jerusalem|Israel',
			'Asia/Kamchatka|Asia/Anadyr',
			'Asia/Kathmandu|Asia/Katmandu',
			'Asia/Kolkata|Asia/Calcutta',
			'Asia/Kuala_Lumpur|Asia/Kuching',
			'Asia/Macau|Asia/Macao',
			'Asia/Makassar|Asia/Ujung_Pandang',
			'Asia/Oral|Asia/Aqtau',
			'Asia/Rangoon|Asia/Yangon',
			'Asia/Riyadh|Asia/Aden',
			'Asia/Riyadh|Asia/Bahrain',
			'Asia/Riyadh|Asia/Kuwait',
			'Asia/Riyadh|Asia/Qatar',
			'Asia/Seoul|ROK',
			'Asia/Shanghai|Asia/Chongqing',
			'Asia/Shanghai|Asia/Chungking',
			'Asia/Shanghai|Asia/Harbin',
			'Asia/Shanghai|Asia/Taipei',
			'Asia/Shanghai|PRC',
			'Asia/Shanghai|ROC',
			'Asia/Singapore|Singapore',
			'Asia/Tashkent|Asia/Ashgabat',
			'Asia/Tashkent|Asia/Ashkhabad',
			'Asia/Tashkent|Asia/Dushanbe',
			'Asia/Tashkent|Asia/Samarkand',
			'Asia/Tashkent|Etc/GMT-5',
			'Asia/Tashkent|Indian/Kerguelen',
			'Asia/Tehran|Iran',
			'Asia/Thimphu|Asia/Thimbu',
			'Asia/Tokyo|Japan',
			'Asia/Ulaanbaatar|Asia/Ulan_Bator',
			'Asia/Urumqi|Asia/Kashgar',
			'Australia/Adelaide|Australia/Broken_Hill',
			'Australia/Adelaide|Australia/South',
			'Australia/Adelaide|Australia/Yancowinna',
			'Australia/Brisbane|Australia/Lindeman',
			'Australia/Brisbane|Australia/Queensland',
			'Australia/Darwin|Australia/North',
			'Australia/Hobart|Australia/Currie',
			'Australia/Hobart|Australia/Tasmania',
			'Australia/Lord_Howe|Australia/LHI',
			'Australia/Perth|Australia/West',
			'Australia/Sydney|Australia/ACT',
			'Australia/Sydney|Australia/Canberra',
			'Australia/Sydney|Australia/Melbourne',
			'Australia/Sydney|Australia/NSW',
			'Australia/Sydney|Australia/Victoria',
			'Etc/UCT|UCT',
			'Etc/UTC|Etc/Universal',
			'Etc/UTC|Etc/Zulu',
			'Etc/UTC|UTC',
			'Etc/UTC|Universal',
			'Etc/UTC|Zulu',
			'Europe/Astrakhan|Europe/Ulyanovsk',
			'Europe/Athens|Asia/Nicosia',
			'Europe/Athens|EET',
			'Europe/Athens|Europe/Bucharest',
			'Europe/Athens|Europe/Helsinki',
			'Europe/Athens|Europe/Kiev',
			'Europe/Athens|Europe/Mariehamn',
			'Europe/Athens|Europe/Nicosia',
			'Europe/Athens|Europe/Sofia',
			'Europe/Athens|Europe/Uzhgorod',
			'Europe/Athens|Europe/Zaporozhye',
			'Europe/Chisinau|Europe/Tiraspol',
			'Europe/Dublin|Eire',
			'Europe/Istanbul|Asia/Istanbul',
			'Europe/Istanbul|Turkey',
			'Europe/Lisbon|Atlantic/Canary',
			'Europe/Lisbon|Atlantic/Faeroe',
			'Europe/Lisbon|Atlantic/Faroe',
			'Europe/Lisbon|Atlantic/Madeira',
			'Europe/Lisbon|Portugal',
			'Europe/Lisbon|WET',
			'Europe/London|Europe/Belfast',
			'Europe/London|Europe/Guernsey',
			'Europe/London|Europe/Isle_of_Man',
			'Europe/London|Europe/Jersey',
			'Europe/London|GB',
			'Europe/London|GB-Eire',
			'Europe/Moscow|W-SU',
			'Europe/Paris|Africa/Ceuta',
			'Europe/Paris|Arctic/Longyearbyen',
			'Europe/Paris|Atlantic/Jan_Mayen',
			'Europe/Paris|CET',
			'Europe/Paris|Europe/Amsterdam',
			'Europe/Paris|Europe/Andorra',
			'Europe/Paris|Europe/Belgrade',
			'Europe/Paris|Europe/Berlin',
			'Europe/Paris|Europe/Bratislava',
			'Europe/Paris|Europe/Brussels',
			'Europe/Paris|Europe/Budapest',
			'Europe/Paris|Europe/Busingen',
			'Europe/Paris|Europe/Copenhagen',
			'Europe/Paris|Europe/Gibraltar',
			'Europe/Paris|Europe/Ljubljana',
			'Europe/Paris|Europe/Luxembourg',
			'Europe/Paris|Europe/Madrid',
			'Europe/Paris|Europe/Malta',
			'Europe/Paris|Europe/Monaco',
			'Europe/Paris|Europe/Oslo',
			'Europe/Paris|Europe/Podgorica',
			'Europe/Paris|Europe/Prague',
			'Europe/Paris|Europe/Rome',
			'Europe/Paris|Europe/San_Marino',
			'Europe/Paris|Europe/Sarajevo',
			'Europe/Paris|Europe/Skopje',
			'Europe/Paris|Europe/Stockholm',
			'Europe/Paris|Europe/Tirane',
			'Europe/Paris|Europe/Vaduz',
			'Europe/Paris|Europe/Vatican',
			'Europe/Paris|Europe/Vienna',
			'Europe/Paris|Europe/Warsaw',
			'Europe/Paris|Europe/Zagreb',
			'Europe/Paris|Europe/Zurich',
			'Europe/Paris|Poland',
			'Europe/Volgograd|Europe/Kirov',
			'Pacific/Auckland|Antarctica/McMurdo',
			'Pacific/Auckland|Antarctica/South_Pole',
			'Pacific/Auckland|NZ',
			'Pacific/Chatham|NZ-CHAT',
			'Pacific/Chuuk|Pacific/Truk',
			'Pacific/Chuuk|Pacific/Yap',
			'Pacific/Easter|Chile/EasterIsland',
			'Pacific/Guam|Pacific/Saipan',
			'Pacific/Honolulu|HST',
			'Pacific/Honolulu|Pacific/Johnston',
			'Pacific/Honolulu|US/Hawaii',
			'Pacific/Majuro|Kwajalein',
			'Pacific/Majuro|Pacific/Kwajalein',
			'Pacific/Pago_Pago|Pacific/Midway',
			'Pacific/Pago_Pago|Pacific/Samoa',
			'Pacific/Pago_Pago|US/Samoa',
			'Pacific/Pohnpei|Pacific/Ponape'
		]
	});


	return moment;
}));
