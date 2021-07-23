"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }

        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }

      return n[i].exports;
    }

    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
      o(t[i]);
    }

    return o;
  }

  return r;
})()({
  1: [function (require, module, exports) {
    /*
    * @version    1.0.4
    * @date       2015-03-13
    * @stability  3 - Stable
    * @author     Lauri Rooden <lauri@rooden.ee>
    * @license    MIT License
    */
    // In browser `this` refers to the window object,
    // in NodeJS `this` refers to the exports.
    this.cookie = function (name, value, ttl, path, domain, secure) {
      if (arguments.length > 1) {
        return document.cookie = name + "=" + encodeURIComponent(value) + (ttl ? "; expires=" + new Date(+new Date() + ttl * 1000).toUTCString() : "") + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (secure ? "; secure" : "");
      }

      return decodeURIComponent((("; " + document.cookie).split("; " + name + "=")[1] || "").split(";")[0]);
    };
  }, {}],
  2: [function (require, module, exports) {
    var charenc = {
      // UTF-8 encoding
      utf8: {
        // Convert a string to a byte array
        stringToBytes: function stringToBytes(str) {
          return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
        },
        // Convert a byte array to a string
        bytesToString: function bytesToString(bytes) {
          return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
        }
      },
      // Binary encoding
      bin: {
        // Convert a string to a byte array
        stringToBytes: function stringToBytes(str) {
          for (var bytes = [], i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) & 0xFF);
          }

          return bytes;
        },
        // Convert a byte array to a string
        bytesToString: function bytesToString(bytes) {
          for (var str = [], i = 0; i < bytes.length; i++) {
            str.push(String.fromCharCode(bytes[i]));
          }

          return str.join('');
        }
      }
    };
    module.exports = charenc;
  }, {}],
  3: [function (require, module, exports) {
    (function () {
      var base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
          crypt = {
        // Bit-wise rotation left
        rotl: function rotl(n, b) {
          return n << b | n >>> 32 - b;
        },
        // Bit-wise rotation right
        rotr: function rotr(n, b) {
          return n << 32 - b | n >>> b;
        },
        // Swap big-endian to little-endian and vice versa
        endian: function endian(n) {
          // If number given, swap endian
          if (n.constructor == Number) {
            return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
          } // Else, assume array and swap all items


          for (var i = 0; i < n.length; i++) {
            n[i] = crypt.endian(n[i]);
          }

          return n;
        },
        // Generate an array of any length of random bytes
        randomBytes: function randomBytes(n) {
          for (var bytes = []; n > 0; n--) {
            bytes.push(Math.floor(Math.random() * 256));
          }

          return bytes;
        },
        // Convert a byte array to big-endian 32-bit words
        bytesToWords: function bytesToWords(bytes) {
          for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) {
            words[b >>> 5] |= bytes[i] << 24 - b % 32;
          }

          return words;
        },
        // Convert big-endian 32-bit words to a byte array
        wordsToBytes: function wordsToBytes(words) {
          for (var bytes = [], b = 0; b < words.length * 32; b += 8) {
            bytes.push(words[b >>> 5] >>> 24 - b % 32 & 0xFF);
          }

          return bytes;
        },
        // Convert a byte array to a hex string
        bytesToHex: function bytesToHex(bytes) {
          for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
          }

          return hex.join('');
        },
        // Convert a hex string to a byte array
        hexToBytes: function hexToBytes(hex) {
          for (var bytes = [], c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substr(c, 2), 16));
          }

          return bytes;
        },
        // Convert a byte array to a base-64 string
        bytesToBase64: function bytesToBase64(bytes) {
          for (var base64 = [], i = 0; i < bytes.length; i += 3) {
            var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];

            for (var j = 0; j < 4; j++) {
              if (i * 8 + j * 6 <= bytes.length * 8) base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 0x3F));else base64.push('=');
            }
          }

          return base64.join('');
        },
        // Convert a base-64 string to a byte array
        base64ToBytes: function base64ToBytes(base64) {
          // Remove non-base-64 characters
          base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

          for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
            if (imod4 == 0) continue;
            bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
          }

          return bytes;
        }
      };
      module.exports = crypt;
    })();
  }, {}],
  4: [function (require, module, exports) {
    /**
     * This script gives you the zone info key representing your device's time zone setting.
     *
     * @name jsTimezoneDetect
     * @version 1.0.5
     * @author Jon Nylander
     * @license MIT License - http://www.opensource.org/licenses/mit-license.php
     *
     * For usage and examples, visit:
     * http://pellepim.bitbucket.org/jstz/
     *
     * Copyright (c) Jon Nylander
     */

    /*jslint undef: true */

    /*global console, exports*/
    (function (root) {
      /**
       * Namespace to hold all the code for timezone detection.
       */
      var jstz = function () {
        'use strict';

        var HEMISPHERE_SOUTH = 's',

        /**
         * Gets the offset in minutes from UTC for a certain date.
         * @param {Date} date
         * @returns {Number}
         */
        get_date_offset = function get_date_offset(date) {
          var offset = -date.getTimezoneOffset();
          return offset !== null ? offset : 0;
        },
            get_date = function get_date(year, month, date) {
          var d = new Date();

          if (year !== undefined) {
            d.setFullYear(year);
          }

          d.setMonth(month);
          d.setDate(date);
          return d;
        },
            get_january_offset = function get_january_offset(year) {
          return get_date_offset(get_date(year, 0, 2));
        },
            get_june_offset = function get_june_offset(year) {
          return get_date_offset(get_date(year, 5, 2));
        },

        /**
         * Private method.
         * Checks whether a given date is in daylight saving time.
         * If the date supplied is after august, we assume that we're checking
         * for southern hemisphere DST.
         * @param {Date} date
         * @returns {Boolean}
         */
        date_is_dst = function date_is_dst(date) {
          var is_southern = date.getMonth() > 7,
              base_offset = is_southern ? get_june_offset(date.getFullYear()) : get_january_offset(date.getFullYear()),
              date_offset = get_date_offset(date),
              is_west = base_offset < 0,
              dst_offset = base_offset - date_offset;

          if (!is_west && !is_southern) {
            return dst_offset < 0;
          }

          return dst_offset !== 0;
        },

        /**
         * This function does some basic calculations to create information about
         * the user's timezone. It uses REFERENCE_YEAR as a solid year for which
         * the script has been tested rather than depend on the year set by the
         * client device.
         *
         * Returns a key that can be used to do lookups in jstz.olson.timezones.
         * eg: "720,1,2". 
         *
         * @returns {String}
         */
        lookup_key = function lookup_key() {
          var january_offset = get_january_offset(),
              june_offset = get_june_offset(),
              diff = january_offset - june_offset;

          if (diff < 0) {
            return january_offset + ",1";
          } else if (diff > 0) {
            return june_offset + ",1," + HEMISPHERE_SOUTH;
          }

          return january_offset + ",0";
        },

        /**
         * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
         *
         * Returns a primitive object on the format:
         * {'timezone': TimeZone, 'key' : 'the key used to find the TimeZone object'}
         *
         * @returns Object
         */
        determine = function determine() {
          var key = lookup_key();
          return new jstz.TimeZone(jstz.olson.timezones[key]);
        },

        /**
         * This object contains information on when daylight savings starts for
         * different timezones.
         *
         * The list is short for a reason. Often we do not have to be very specific
         * to single out the correct timezone. But when we do, this list comes in
         * handy.
         *
         * Each value is a date denoting when daylight savings starts for that timezone.
         */
        dst_start_for = function dst_start_for(tz_name) {
          var ru_pre_dst_change = new Date(2010, 6, 15, 1, 0, 0, 0),
              // In 2010 Russia had DST, this allows us to detect Russia :)
          dst_starts = {
            'America/Denver': new Date(2011, 2, 13, 3, 0, 0, 0),
            'America/Mazatlan': new Date(2011, 3, 3, 3, 0, 0, 0),
            'America/Chicago': new Date(2011, 2, 13, 3, 0, 0, 0),
            'America/Mexico_City': new Date(2011, 3, 3, 3, 0, 0, 0),
            'America/Asuncion': new Date(2012, 9, 7, 3, 0, 0, 0),
            'America/Santiago': new Date(2012, 9, 3, 3, 0, 0, 0),
            'America/Campo_Grande': new Date(2012, 9, 21, 5, 0, 0, 0),
            'America/Montevideo': new Date(2011, 9, 2, 3, 0, 0, 0),
            'America/Sao_Paulo': new Date(2011, 9, 16, 5, 0, 0, 0),
            'America/Los_Angeles': new Date(2011, 2, 13, 8, 0, 0, 0),
            'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
            'America/Havana': new Date(2012, 2, 10, 2, 0, 0, 0),
            'America/New_York': new Date(2012, 2, 10, 7, 0, 0, 0),
            'Europe/Helsinki': new Date(2013, 2, 31, 5, 0, 0, 0),
            'Pacific/Auckland': new Date(2011, 8, 26, 7, 0, 0, 0),
            'America/Halifax': new Date(2011, 2, 13, 6, 0, 0, 0),
            'America/Goose_Bay': new Date(2011, 2, 13, 2, 1, 0, 0),
            'America/Miquelon': new Date(2011, 2, 13, 5, 0, 0, 0),
            'America/Godthab': new Date(2011, 2, 27, 1, 0, 0, 0),
            'Europe/Moscow': ru_pre_dst_change,
            'Asia/Amman': new Date(2013, 2, 29, 1, 0, 0, 0),
            'Asia/Beirut': new Date(2013, 2, 31, 2, 0, 0, 0),
            'Asia/Damascus': new Date(2013, 3, 6, 2, 0, 0, 0),
            'Asia/Jerusalem': new Date(2013, 2, 29, 5, 0, 0, 0),
            'Asia/Yekaterinburg': ru_pre_dst_change,
            'Asia/Omsk': ru_pre_dst_change,
            'Asia/Krasnoyarsk': ru_pre_dst_change,
            'Asia/Irkutsk': ru_pre_dst_change,
            'Asia/Yakutsk': ru_pre_dst_change,
            'Asia/Vladivostok': ru_pre_dst_change,
            'Asia/Baku': new Date(2013, 2, 31, 4, 0, 0),
            'Asia/Yerevan': new Date(2013, 2, 31, 3, 0, 0),
            'Asia/Kamchatka': ru_pre_dst_change,
            'Asia/Gaza': new Date(2010, 2, 27, 4, 0, 0),
            'Africa/Cairo': new Date(2010, 4, 1, 3, 0, 0),
            'Europe/Minsk': ru_pre_dst_change,
            'Pacific/Apia': new Date(2010, 10, 1, 1, 0, 0, 0),
            'Pacific/Fiji': new Date(2010, 11, 1, 0, 0, 0),
            'Australia/Perth': new Date(2008, 10, 1, 1, 0, 0, 0)
          };
          return dst_starts[tz_name];
        };

        return {
          determine: determine,
          date_is_dst: date_is_dst,
          dst_start_for: dst_start_for
        };
      }();
      /**
       * Simple object to perform ambiguity check and to return name of time zone.
       */


      jstz.TimeZone = function (tz_name) {
        'use strict';
        /**
         * The keys in this object are timezones that we know may be ambiguous after
         * a preliminary scan through the olson_tz object.
         *
         * The array of timezones to compare must be in the order that daylight savings
         * starts for the regions.
         */

        var AMBIGUITIES = {
          'America/Denver': ['America/Denver', 'America/Mazatlan'],
          'America/Chicago': ['America/Chicago', 'America/Mexico_City'],
          'America/Santiago': ['America/Santiago', 'America/Asuncion', 'America/Campo_Grande'],
          'America/Montevideo': ['America/Montevideo', 'America/Sao_Paulo'],
          'Asia/Beirut': ['Asia/Amman', 'Asia/Jerusalem', 'Asia/Beirut', 'Europe/Helsinki', 'Asia/Damascus'],
          'Pacific/Auckland': ['Pacific/Auckland', 'Pacific/Fiji'],
          'America/Los_Angeles': ['America/Los_Angeles', 'America/Santa_Isabel'],
          'America/New_York': ['America/Havana', 'America/New_York'],
          'America/Halifax': ['America/Goose_Bay', 'America/Halifax'],
          'America/Godthab': ['America/Miquelon', 'America/Godthab'],
          'Asia/Dubai': ['Europe/Moscow'],
          'Asia/Dhaka': ['Asia/Yekaterinburg'],
          'Asia/Jakarta': ['Asia/Omsk'],
          'Asia/Shanghai': ['Asia/Krasnoyarsk', 'Australia/Perth'],
          'Asia/Tokyo': ['Asia/Irkutsk'],
          'Australia/Brisbane': ['Asia/Yakutsk'],
          'Pacific/Noumea': ['Asia/Vladivostok'],
          'Pacific/Tarawa': ['Asia/Kamchatka', 'Pacific/Fiji'],
          'Pacific/Tongatapu': ['Pacific/Apia'],
          'Asia/Baghdad': ['Europe/Minsk'],
          'Asia/Baku': ['Asia/Yerevan', 'Asia/Baku'],
          'Africa/Johannesburg': ['Asia/Gaza', 'Africa/Cairo']
        },
            timezone_name = tz_name,

        /**
         * Checks if a timezone has possible ambiguities. I.e timezones that are similar.
         *
         * For example, if the preliminary scan determines that we're in America/Denver.
         * We double check here that we're really there and not in America/Mazatlan.
         *
         * This is done by checking known dates for when daylight savings start for different
         * timezones during 2010 and 2011.
         */
        ambiguity_check = function ambiguity_check() {
          var ambiguity_list = AMBIGUITIES[timezone_name],
              length = ambiguity_list.length,
              i = 0,
              tz = ambiguity_list[0];

          for (; i < length; i += 1) {
            tz = ambiguity_list[i];

            if (jstz.date_is_dst(jstz.dst_start_for(tz))) {
              timezone_name = tz;
              return;
            }
          }
        },

        /**
         * Checks if it is possible that the timezone is ambiguous.
         */
        is_ambiguous = function is_ambiguous() {
          return typeof AMBIGUITIES[timezone_name] !== 'undefined';
        };

        if (is_ambiguous()) {
          ambiguity_check();
        }

        return {
          name: function name() {
            return timezone_name;
          }
        };
      };

      jstz.olson = {};
      /*
       * The keys in this dictionary are comma separated as such:
       *
       * First the offset compared to UTC time in minutes.
       *
       * Then a flag which is 0 if the timezone does not take daylight savings into account and 1 if it
       * does.
       *
       * Thirdly an optional 's' signifies that the timezone is in the southern hemisphere,
       * only interesting for timezones with DST.
       *
       * The mapped arrays is used for constructing the jstz.TimeZone object from within
       * jstz.determine_timezone();
       */

      jstz.olson.timezones = {
        '-720,0': 'Pacific/Majuro',
        '-660,0': 'Pacific/Pago_Pago',
        '-600,1': 'America/Adak',
        '-600,0': 'Pacific/Honolulu',
        '-570,0': 'Pacific/Marquesas',
        '-540,0': 'Pacific/Gambier',
        '-540,1': 'America/Anchorage',
        '-480,1': 'America/Los_Angeles',
        '-480,0': 'Pacific/Pitcairn',
        '-420,0': 'America/Phoenix',
        '-420,1': 'America/Denver',
        '-360,0': 'America/Guatemala',
        '-360,1': 'America/Chicago',
        '-360,1,s': 'Pacific/Easter',
        '-300,0': 'America/Bogota',
        '-300,1': 'America/New_York',
        '-270,0': 'America/Caracas',
        '-240,1': 'America/Halifax',
        '-240,0': 'America/Santo_Domingo',
        '-240,1,s': 'America/Santiago',
        '-210,1': 'America/St_Johns',
        '-180,1': 'America/Godthab',
        '-180,0': 'America/Argentina/Buenos_Aires',
        '-180,1,s': 'America/Montevideo',
        '-120,0': 'America/Noronha',
        '-120,1': 'America/Noronha',
        '-60,1': 'Atlantic/Azores',
        '-60,0': 'Atlantic/Cape_Verde',
        '0,0': 'UTC',
        '0,1': 'Europe/London',
        '60,1': 'Europe/Berlin',
        '60,0': 'Africa/Lagos',
        '60,1,s': 'Africa/Windhoek',
        '120,1': 'Asia/Beirut',
        '120,0': 'Africa/Johannesburg',
        '180,0': 'Asia/Baghdad',
        '180,1': 'Europe/Moscow',
        '210,1': 'Asia/Tehran',
        '240,0': 'Asia/Dubai',
        '240,1': 'Asia/Baku',
        '270,0': 'Asia/Kabul',
        '300,1': 'Asia/Yekaterinburg',
        '300,0': 'Asia/Karachi',
        '330,0': 'Asia/Kolkata',
        '345,0': 'Asia/Kathmandu',
        '360,0': 'Asia/Dhaka',
        '360,1': 'Asia/Omsk',
        '390,0': 'Asia/Rangoon',
        '420,1': 'Asia/Krasnoyarsk',
        '420,0': 'Asia/Jakarta',
        '480,0': 'Asia/Shanghai',
        '480,1': 'Asia/Irkutsk',
        '525,0': 'Australia/Eucla',
        '525,1,s': 'Australia/Eucla',
        '540,1': 'Asia/Yakutsk',
        '540,0': 'Asia/Tokyo',
        '570,0': 'Australia/Darwin',
        '570,1,s': 'Australia/Adelaide',
        '600,0': 'Australia/Brisbane',
        '600,1': 'Asia/Vladivostok',
        '600,1,s': 'Australia/Sydney',
        '630,1,s': 'Australia/Lord_Howe',
        '660,1': 'Asia/Kamchatka',
        '660,0': 'Pacific/Noumea',
        '690,0': 'Pacific/Norfolk',
        '720,1,s': 'Pacific/Auckland',
        '720,0': 'Pacific/Tarawa',
        '765,1,s': 'Pacific/Chatham',
        '780,0': 'Pacific/Tongatapu',
        '780,1,s': 'Pacific/Apia',
        '840,0': 'Pacific/Kiritimati'
      };

      if (typeof exports !== 'undefined') {
        exports.jstz = jstz;
      } else {
        root.jstz = jstz;
      }
    })(this);
  }, {}],
  5: [function (require, module, exports) {
    var getNative = require('./_getNative'),
        root = require('./_root');
    /* Built-in method references that are verified to be native. */


    var DataView = getNative(root, 'DataView');
    module.exports = DataView;
  }, {
    "./_getNative": 68,
    "./_root": 105
  }],
  6: [function (require, module, exports) {
    var hashClear = require('./_hashClear'),
        hashDelete = require('./_hashDelete'),
        hashGet = require('./_hashGet'),
        hashHas = require('./_hashHas'),
        hashSet = require('./_hashSet');
    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */


    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    } // Add methods to `Hash`.


    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    module.exports = Hash;
  }, {
    "./_hashClear": 75,
    "./_hashDelete": 76,
    "./_hashGet": 77,
    "./_hashHas": 78,
    "./_hashSet": 79
  }],
  7: [function (require, module, exports) {
    var listCacheClear = require('./_listCacheClear'),
        listCacheDelete = require('./_listCacheDelete'),
        listCacheGet = require('./_listCacheGet'),
        listCacheHas = require('./_listCacheHas'),
        listCacheSet = require('./_listCacheSet');
    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */


    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    } // Add methods to `ListCache`.


    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    module.exports = ListCache;
  }, {
    "./_listCacheClear": 87,
    "./_listCacheDelete": 88,
    "./_listCacheGet": 89,
    "./_listCacheHas": 90,
    "./_listCacheSet": 91
  }],
  8: [function (require, module, exports) {
    var getNative = require('./_getNative'),
        root = require('./_root');
    /* Built-in method references that are verified to be native. */


    var Map = getNative(root, 'Map');
    module.exports = Map;
  }, {
    "./_getNative": 68,
    "./_root": 105
  }],
  9: [function (require, module, exports) {
    var mapCacheClear = require('./_mapCacheClear'),
        mapCacheDelete = require('./_mapCacheDelete'),
        mapCacheGet = require('./_mapCacheGet'),
        mapCacheHas = require('./_mapCacheHas'),
        mapCacheSet = require('./_mapCacheSet');
    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */


    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;
      this.clear();

      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    } // Add methods to `MapCache`.


    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    module.exports = MapCache;
  }, {
    "./_mapCacheClear": 92,
    "./_mapCacheDelete": 93,
    "./_mapCacheGet": 94,
    "./_mapCacheHas": 95,
    "./_mapCacheSet": 96
  }],
  10: [function (require, module, exports) {
    var getNative = require('./_getNative'),
        root = require('./_root');
    /* Built-in method references that are verified to be native. */


    var Promise = getNative(root, 'Promise');
    module.exports = Promise;
  }, {
    "./_getNative": 68,
    "./_root": 105
  }],
  11: [function (require, module, exports) {
    var getNative = require('./_getNative'),
        root = require('./_root');
    /* Built-in method references that are verified to be native. */


    var Set = getNative(root, 'Set');
    module.exports = Set;
  }, {
    "./_getNative": 68,
    "./_root": 105
  }],
  12: [function (require, module, exports) {
    var MapCache = require('./_MapCache'),
        setCacheAdd = require('./_setCacheAdd'),
        setCacheHas = require('./_setCacheHas');
    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */


    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();

      while (++index < length) {
        this.add(values[index]);
      }
    } // Add methods to `SetCache`.


    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    module.exports = SetCache;
  }, {
    "./_MapCache": 9,
    "./_setCacheAdd": 106,
    "./_setCacheHas": 107
  }],
  13: [function (require, module, exports) {
    var ListCache = require('./_ListCache'),
        stackClear = require('./_stackClear'),
        stackDelete = require('./_stackDelete'),
        stackGet = require('./_stackGet'),
        stackHas = require('./_stackHas'),
        stackSet = require('./_stackSet');
    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */


    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    } // Add methods to `Stack`.


    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    module.exports = Stack;
  }, {
    "./_ListCache": 7,
    "./_stackClear": 109,
    "./_stackDelete": 110,
    "./_stackGet": 111,
    "./_stackHas": 112,
    "./_stackSet": 113
  }],
  14: [function (require, module, exports) {
    var root = require('./_root');
    /** Built-in value references. */


    var _Symbol = root.Symbol;
    module.exports = _Symbol;
  }, {
    "./_root": 105
  }],
  15: [function (require, module, exports) {
    var root = require('./_root');
    /** Built-in value references. */


    var Uint8Array = root.Uint8Array;
    module.exports = Uint8Array;
  }, {
    "./_root": 105
  }],
  16: [function (require, module, exports) {
    var getNative = require('./_getNative'),
        root = require('./_root');
    /* Built-in method references that are verified to be native. */


    var WeakMap = getNative(root, 'WeakMap');
    module.exports = WeakMap;
  }, {
    "./_getNative": 68,
    "./_root": 105
  }],
  17: [function (require, module, exports) {
    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }

      return array;
    }

    module.exports = arrayEach;
  }, {}],
  18: [function (require, module, exports) {
    /**
     * A specialized version of `_.every` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     */
    function arrayEvery(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }

      return true;
    }

    module.exports = arrayEvery;
  }, {}],
  19: [function (require, module, exports) {
    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }

      return result;
    }

    module.exports = arrayFilter;
  }, {}],
  20: [function (require, module, exports) {
    var baseTimes = require('./_baseTimes'),
        isArguments = require('./isArguments'),
        isArray = require('./isArray'),
        isBuffer = require('./isBuffer'),
        isIndex = require('./_isIndex'),
        isTypedArray = require('./isTypedArray');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */

    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
        key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }

      return result;
    }

    module.exports = arrayLikeKeys;
  }, {
    "./_baseTimes": 50,
    "./_isIndex": 80,
    "./isArguments": 128,
    "./isArray": 129,
    "./isBuffer": 131,
    "./isTypedArray": 140
  }],
  21: [function (require, module, exports) {
    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }

      return result;
    }

    module.exports = arrayMap;
  }, {}],
  22: [function (require, module, exports) {
    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }

      return array;
    }

    module.exports = arrayPush;
  }, {}],
  23: [function (require, module, exports) {
    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }

      return false;
    }

    module.exports = arraySome;
  }, {}],
  24: [function (require, module, exports) {
    var eq = require('./eq');
    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */


    function assocIndexOf(array, key) {
      var length = array.length;

      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }

      return -1;
    }

    module.exports = assocIndexOf;
  }, {
    "./eq": 118
  }],
  25: [function (require, module, exports) {
    var defineProperty = require('./_defineProperty');
    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */


    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    module.exports = baseAssignValue;
  }, {
    "./_defineProperty": 60
  }],
  26: [function (require, module, exports) {
    var baseForOwn = require('./_baseForOwn'),
        createBaseEach = require('./_createBaseEach');
    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */


    var baseEach = createBaseEach(baseForOwn);
    module.exports = baseEach;
  }, {
    "./_baseForOwn": 31,
    "./_createBaseEach": 57
  }],
  27: [function (require, module, exports) {
    var baseEach = require('./_baseEach');
    /**
     * The base implementation of `_.every` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`
     */


    function baseEvery(collection, predicate) {
      var result = true;
      baseEach(collection, function (value, index, collection) {
        result = !!predicate(value, index, collection);
        return result;
      });
      return result;
    }

    module.exports = baseEvery;
  }, {
    "./_baseEach": 26
  }],
  28: [function (require, module, exports) {
    var baseEach = require('./_baseEach');
    /**
     * The base implementation of `_.filter` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */


    function baseFilter(collection, predicate) {
      var result = [];
      baseEach(collection, function (value, index, collection) {
        if (predicate(value, index, collection)) {
          result.push(value);
        }
      });
      return result;
    }

    module.exports = baseFilter;
  }, {
    "./_baseEach": 26
  }],
  29: [function (require, module, exports) {
    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }

      return -1;
    }

    module.exports = baseFindIndex;
  }, {}],
  30: [function (require, module, exports) {
    var createBaseFor = require('./_createBaseFor');
    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */


    var baseFor = createBaseFor();
    module.exports = baseFor;
  }, {
    "./_createBaseFor": 58
  }],
  31: [function (require, module, exports) {
    var baseFor = require('./_baseFor'),
        keys = require('./keys');
    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */


    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    module.exports = baseForOwn;
  }, {
    "./_baseFor": 30,
    "./keys": 142
  }],
  32: [function (require, module, exports) {
    var castPath = require('./_castPath'),
        toKey = require('./_toKey');
    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */


    function baseGet(object, path) {
      path = castPath(path, object);
      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }

      return index && index == length ? object : undefined;
    }

    module.exports = baseGet;
  }, {
    "./_castPath": 55,
    "./_toKey": 115
  }],
  33: [function (require, module, exports) {
    var arrayPush = require('./_arrayPush'),
        isArray = require('./isArray');
    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */


    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    module.exports = baseGetAllKeys;
  }, {
    "./_arrayPush": 22,
    "./isArray": 129
  }],
  34: [function (require, module, exports) {
    var _Symbol2 = require('./_Symbol'),
        getRawTag = require('./_getRawTag'),
        objectToString = require('./_objectToString');
    /** `Object#toString` result references. */


    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';
    /** Built-in value references. */

    var symToStringTag = _Symbol2 ? _Symbol2.toStringTag : undefined;
    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */

    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }

      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }

    module.exports = baseGetTag;
  }, {
    "./_Symbol": 14,
    "./_getRawTag": 70,
    "./_objectToString": 103
  }],
  35: [function (require, module, exports) {
    /** Used for built-in method references. */
    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */

    function baseHas(object, key) {
      return object != null && hasOwnProperty.call(object, key);
    }

    module.exports = baseHas;
  }, {}],
  36: [function (require, module, exports) {
    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    module.exports = baseHasIn;
  }, {}],
  37: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        isObjectLike = require('./isObjectLike');
    /** `Object#toString` result references. */


    var argsTag = '[object Arguments]';
    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */

    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    module.exports = baseIsArguments;
  }, {
    "./_baseGetTag": 34,
    "./isObjectLike": 136
  }],
  38: [function (require, module, exports) {
    var baseIsEqualDeep = require('./_baseIsEqualDeep'),
        isObjectLike = require('./isObjectLike');
    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */


    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }

      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }

      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    module.exports = baseIsEqual;
  }, {
    "./_baseIsEqualDeep": 39,
    "./isObjectLike": 136
  }],
  39: [function (require, module, exports) {
    var Stack = require('./_Stack'),
        equalArrays = require('./_equalArrays'),
        equalByTag = require('./_equalByTag'),
        equalObjects = require('./_equalObjects'),
        getTag = require('./_getTag'),
        isArray = require('./isArray'),
        isBuffer = require('./isBuffer'),
        isTypedArray = require('./isTypedArray');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1;
    /** `Object#toString` result references. */

    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        objectTag = '[object Object]';
    /** Used for built-in method references. */

    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */

    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag(object),
          othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }

        objIsArr = true;
        objIsObj = false;
      }

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }

      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }

      if (!isSameTag) {
        return false;
      }

      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    module.exports = baseIsEqualDeep;
  }, {
    "./_Stack": 13,
    "./_equalArrays": 61,
    "./_equalByTag": 62,
    "./_equalObjects": 63,
    "./_getTag": 72,
    "./isArray": 129,
    "./isBuffer": 131,
    "./isTypedArray": 140
  }],
  40: [function (require, module, exports) {
    var Stack = require('./_Stack'),
        baseIsEqual = require('./_baseIsEqual');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */

    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }

      object = Object(object);

      while (index--) {
        var data = matchData[index];

        if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
          return false;
        }
      }

      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack();

          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }

          if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
            return false;
          }
        }
      }

      return true;
    }

    module.exports = baseIsMatch;
  }, {
    "./_Stack": 13,
    "./_baseIsEqual": 38
  }],
  41: [function (require, module, exports) {
    var isFunction = require('./isFunction'),
        isMasked = require('./_isMasked'),
        isObject = require('./isObject'),
        toSource = require('./_toSource');
    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */


    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    /** Used to detect host constructors (Safari). */

    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    /** Used for built-in method references. */

    var funcProto = Function.prototype,
        objectProto = Object.prototype;
    /** Used to resolve the decompiled source of functions. */

    var funcToString = funcProto.toString;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /** Used to detect if a method is native. */

    var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */

    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }

      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    module.exports = baseIsNative;
  }, {
    "./_isMasked": 84,
    "./_toSource": 116,
    "./isFunction": 133,
    "./isObject": 135
  }],
  42: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        isLength = require('./isLength'),
        isObjectLike = require('./isObjectLike');
    /** `Object#toString` result references. */


    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';
    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';
    /** Used to identify `toStringTag` values of typed arrays. */

    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */

    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    module.exports = baseIsTypedArray;
  }, {
    "./_baseGetTag": 34,
    "./isLength": 134,
    "./isObjectLike": 136
  }],
  43: [function (require, module, exports) {
    var baseMatches = require('./_baseMatches'),
        baseMatchesProperty = require('./_baseMatchesProperty'),
        identity = require('./identity'),
        isArray = require('./isArray'),
        property = require('./property');
    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */


    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }

      if (value == null) {
        return identity;
      }

      if (_typeof(value) == 'object') {
        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
      }

      return property(value);
    }

    module.exports = baseIteratee;
  }, {
    "./_baseMatches": 46,
    "./_baseMatchesProperty": 47,
    "./identity": 127,
    "./isArray": 129,
    "./property": 146
  }],
  44: [function (require, module, exports) {
    var isPrototype = require('./_isPrototype'),
        nativeKeys = require('./_nativeKeys');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */

    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }

      var result = [];

      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }

      return result;
    }

    module.exports = baseKeys;
  }, {
    "./_isPrototype": 85,
    "./_nativeKeys": 101
  }],
  45: [function (require, module, exports) {
    var baseEach = require('./_baseEach'),
        isArrayLike = require('./isArrayLike');
    /**
     * The base implementation of `_.map` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */


    function baseMap(collection, iteratee) {
      var index = -1,
          result = isArrayLike(collection) ? Array(collection.length) : [];
      baseEach(collection, function (value, key, collection) {
        result[++index] = iteratee(value, key, collection);
      });
      return result;
    }

    module.exports = baseMap;
  }, {
    "./_baseEach": 26,
    "./isArrayLike": 130
  }],
  46: [function (require, module, exports) {
    var baseIsMatch = require('./_baseIsMatch'),
        getMatchData = require('./_getMatchData'),
        matchesStrictComparable = require('./_matchesStrictComparable');
    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */


    function baseMatches(source) {
      var matchData = getMatchData(source);

      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }

      return function (object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    module.exports = baseMatches;
  }, {
    "./_baseIsMatch": 40,
    "./_getMatchData": 67,
    "./_matchesStrictComparable": 98
  }],
  47: [function (require, module, exports) {
    var baseIsEqual = require('./_baseIsEqual'),
        get = require('./get'),
        hasIn = require('./hasIn'),
        isKey = require('./_isKey'),
        isStrictComparable = require('./_isStrictComparable'),
        matchesStrictComparable = require('./_matchesStrictComparable'),
        toKey = require('./_toKey');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */

    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }

      return function (object) {
        var objValue = get(object, path);
        return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
      };
    }

    module.exports = baseMatchesProperty;
  }, {
    "./_baseIsEqual": 38,
    "./_isKey": 82,
    "./_isStrictComparable": 86,
    "./_matchesStrictComparable": 98,
    "./_toKey": 115,
    "./get": 124,
    "./hasIn": 126
  }],
  48: [function (require, module, exports) {
    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function (object) {
        return object == null ? undefined : object[key];
      };
    }

    module.exports = baseProperty;
  }, {}],
  49: [function (require, module, exports) {
    var baseGet = require('./_baseGet');
    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */


    function basePropertyDeep(path) {
      return function (object) {
        return baseGet(object, path);
      };
    }

    module.exports = basePropertyDeep;
  }, {
    "./_baseGet": 32
  }],
  50: [function (require, module, exports) {
    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }

      return result;
    }

    module.exports = baseTimes;
  }, {}],
  51: [function (require, module, exports) {
    var _Symbol3 = require('./_Symbol'),
        arrayMap = require('./_arrayMap'),
        isArray = require('./isArray'),
        isSymbol = require('./isSymbol');
    /** Used as references for various `Number` constants. */


    var INFINITY = 1 / 0;
    /** Used to convert symbols to primitives and strings. */

    var symbolProto = _Symbol3 ? _Symbol3.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;
    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */

    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }

      if (isArray(value)) {
        // Recursively convert values (susceptible to call stack limits).
        return arrayMap(value, baseToString) + '';
      }

      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }

      var result = value + '';
      return result == '0' && 1 / value == -INFINITY ? '-0' : result;
    }

    module.exports = baseToString;
  }, {
    "./_Symbol": 14,
    "./_arrayMap": 21,
    "./isArray": 129,
    "./isSymbol": 139
  }],
  52: [function (require, module, exports) {
    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function (value) {
        return func(value);
      };
    }

    module.exports = baseUnary;
  }, {}],
  53: [function (require, module, exports) {
    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    module.exports = cacheHas;
  }, {}],
  54: [function (require, module, exports) {
    var identity = require('./identity');
    /**
     * Casts `value` to `identity` if it's not a function.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Function} Returns cast function.
     */


    function castFunction(value) {
      return typeof value == 'function' ? value : identity;
    }

    module.exports = castFunction;
  }, {
    "./identity": 127
  }],
  55: [function (require, module, exports) {
    var isArray = require('./isArray'),
        isKey = require('./_isKey'),
        stringToPath = require('./_stringToPath'),
        toString = require('./toString');
    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @param {Object} [object] The object to query keys on.
     * @returns {Array} Returns the cast property path array.
     */


    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }

      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }

    module.exports = castPath;
  }, {
    "./_isKey": 82,
    "./_stringToPath": 114,
    "./isArray": 129,
    "./toString": 152
  }],
  56: [function (require, module, exports) {
    var root = require('./_root');
    /** Used to detect overreaching core-js shims. */


    var coreJsData = root['__core-js_shared__'];
    module.exports = coreJsData;
  }, {
    "./_root": 105
  }],
  57: [function (require, module, exports) {
    var isArrayLike = require('./isArrayLike');
    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */


    function createBaseEach(eachFunc, fromRight) {
      return function (collection, iteratee) {
        if (collection == null) {
          return collection;
        }

        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }

        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while (fromRight ? index-- : ++index < length) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }

        return collection;
      };
    }

    module.exports = createBaseEach;
  }, {
    "./isArrayLike": 130
  }],
  58: [function (require, module, exports) {
    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function (object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];

          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }

        return object;
      };
    }

    module.exports = createBaseFor;
  }, {}],
  59: [function (require, module, exports) {
    var baseIteratee = require('./_baseIteratee'),
        isArrayLike = require('./isArrayLike'),
        keys = require('./keys');
    /**
     * Creates a `_.find` or `_.findLast` function.
     *
     * @private
     * @param {Function} findIndexFunc The function to find the collection index.
     * @returns {Function} Returns the new find function.
     */


    function createFind(findIndexFunc) {
      return function (collection, predicate, fromIndex) {
        var iterable = Object(collection);

        if (!isArrayLike(collection)) {
          var iteratee = baseIteratee(predicate, 3);
          collection = keys(collection);

          predicate = function predicate(key) {
            return iteratee(iterable[key], key, iterable);
          };
        }

        var index = findIndexFunc(collection, predicate, fromIndex);
        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
      };
    }

    module.exports = createFind;
  }, {
    "./_baseIteratee": 43,
    "./isArrayLike": 130,
    "./keys": 142
  }],
  60: [function (require, module, exports) {
    var getNative = require('./_getNative');

    var defineProperty = function () {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }();

    module.exports = defineProperty;
  }, {
    "./_getNative": 68
  }],
  61: [function (require, module, exports) {
    var SetCache = require('./_SetCache'),
        arraySome = require('./_arraySome'),
        cacheHas = require('./_cacheHas');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */

    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(array);

      if (stacked && stack.get(other)) {
        return stacked == other;
      }

      var index = -1,
          result = true,
          seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
      stack.set(array, other);
      stack.set(other, array); // Ignore non-index properties.

      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }

        if (compared !== undefined) {
          if (compared) {
            continue;
          }

          result = false;
          break;
        } // Recursively compare arrays (susceptible to call stack limits).


        if (seen) {
          if (!arraySome(other, function (othValue, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }

      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    module.exports = equalArrays;
  }, {
    "./_SetCache": 12,
    "./_arraySome": 23,
    "./_cacheHas": 53
  }],
  62: [function (require, module, exports) {
    var _Symbol4 = require('./_Symbol'),
        Uint8Array = require('./_Uint8Array'),
        eq = require('./eq'),
        equalArrays = require('./_equalArrays'),
        mapToArray = require('./_mapToArray'),
        setToArray = require('./_setToArray');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;
    /** `Object#toString` result references. */

    var boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]';
    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]';
    /** Used to convert symbols to primitives and strings. */

    var symbolProto = _Symbol4 ? _Symbol4.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */

    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }

          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }

          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == other + '';

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          } // Assume cyclic values are equal.


          var stacked = stack.get(object);

          if (stacked) {
            return stacked == other;
          }

          bitmask |= COMPARE_UNORDERED_FLAG; // Recursively compare objects (susceptible to call stack limits).

          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }

      }

      return false;
    }

    module.exports = equalByTag;
  }, {
    "./_Symbol": 14,
    "./_Uint8Array": 15,
    "./_equalArrays": 61,
    "./_mapToArray": 97,
    "./_setToArray": 108,
    "./eq": 118
  }],
  63: [function (require, module, exports) {
    var getAllKeys = require('./_getAllKeys');
    /** Used to compose bitmasks for value comparisons. */


    var COMPARE_PARTIAL_FLAG = 1;
    /** Used for built-in method references. */

    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */

    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }

      var index = objLength;

      while (index--) {
        var key = objProps[index];

        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked && stack.get(other)) {
        return stacked == other;
      }

      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;

      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        } // Recursively compare objects (susceptible to call stack limits).


        if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }

        skipCtor || (skipCtor = key == 'constructor');
      }

      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

        if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }

      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    module.exports = equalObjects;
  }, {
    "./_getAllKeys": 65
  }],
  64: [function (require, module, exports) {
    (function (global) {
      /** Detect free variable `global` from Node.js. */
      var freeGlobal = _typeof(global) == 'object' && global && global.Object === Object && global;
      module.exports = freeGlobal;
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, {}],
  65: [function (require, module, exports) {
    var baseGetAllKeys = require('./_baseGetAllKeys'),
        getSymbols = require('./_getSymbols'),
        keys = require('./keys');
    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */


    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    module.exports = getAllKeys;
  }, {
    "./_baseGetAllKeys": 33,
    "./_getSymbols": 71,
    "./keys": 142
  }],
  66: [function (require, module, exports) {
    var isKeyable = require('./_isKeyable');
    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */


    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
    }

    module.exports = getMapData;
  }, {
    "./_isKeyable": 83
  }],
  67: [function (require, module, exports) {
    var isStrictComparable = require('./_isStrictComparable'),
        keys = require('./keys');
    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */


    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
      }

      return result;
    }

    module.exports = getMatchData;
  }, {
    "./_isStrictComparable": 86,
    "./keys": 142
  }],
  68: [function (require, module, exports) {
    var baseIsNative = require('./_baseIsNative'),
        getValue = require('./_getValue');
    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */


    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    module.exports = getNative;
  }, {
    "./_baseIsNative": 41,
    "./_getValue": 73
  }],
  69: [function (require, module, exports) {
    var overArg = require('./_overArg');
    /** Built-in value references. */


    var getPrototype = overArg(Object.getPrototypeOf, Object);
    module.exports = getPrototype;
  }, {
    "./_overArg": 104
  }],
  70: [function (require, module, exports) {
    var _Symbol5 = require('./_Symbol');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */

    var nativeObjectToString = objectProto.toString;
    /** Built-in value references. */

    var symToStringTag = _Symbol5 ? _Symbol5.toStringTag : undefined;
    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */

    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);

      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }

      return result;
    }

    module.exports = getRawTag;
  }, {
    "./_Symbol": 14
  }],
  71: [function (require, module, exports) {
    var arrayFilter = require('./_arrayFilter'),
        stubArray = require('./stubArray');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Built-in value references. */

    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    /* Built-in method references for those with the same name as other `lodash` methods. */

    var nativeGetSymbols = Object.getOwnPropertySymbols;
    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */

    var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
      if (object == null) {
        return [];
      }

      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function (symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    module.exports = getSymbols;
  }, {
    "./_arrayFilter": 19,
    "./stubArray": 147
  }],
  72: [function (require, module, exports) {
    var DataView = require('./_DataView'),
        Map = require('./_Map'),
        Promise = require('./_Promise'),
        Set = require('./_Set'),
        WeakMap = require('./_WeakMap'),
        baseGetTag = require('./_baseGetTag'),
        toSource = require('./_toSource');
    /** `Object#toString` result references. */


    var mapTag = '[object Map]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        setTag = '[object Set]',
        weakMapTag = '[object WeakMap]';
    var dataViewTag = '[object DataView]';
    /** Used to detect maps, sets, and weakmaps. */

    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */

    var getTag = baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function getTag(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;

            case mapCtorString:
              return mapTag;

            case promiseCtorString:
              return promiseTag;

            case setCtorString:
              return setTag;

            case weakMapCtorString:
              return weakMapTag;
          }
        }

        return result;
      };
    }

    module.exports = getTag;
  }, {
    "./_DataView": 5,
    "./_Map": 8,
    "./_Promise": 10,
    "./_Set": 11,
    "./_WeakMap": 16,
    "./_baseGetTag": 34,
    "./_toSource": 116
  }],
  73: [function (require, module, exports) {
    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    module.exports = getValue;
  }, {}],
  74: [function (require, module, exports) {
    var castPath = require('./_castPath'),
        isArguments = require('./isArguments'),
        isArray = require('./isArray'),
        isIndex = require('./_isIndex'),
        isLength = require('./isLength'),
        toKey = require('./_toKey');
    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */


    function hasPath(object, path, hasFunc) {
      path = castPath(path, object);
      var index = -1,
          length = path.length,
          result = false;

      while (++index < length) {
        var key = toKey(path[index]);

        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }

        object = object[key];
      }

      if (result || ++index != length) {
        return result;
      }

      length = object == null ? 0 : object.length;
      return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
    }

    module.exports = hasPath;
  }, {
    "./_castPath": 55,
    "./_isIndex": 80,
    "./_toKey": 115,
    "./isArguments": 128,
    "./isArray": 129,
    "./isLength": 134
  }],
  75: [function (require, module, exports) {
    var nativeCreate = require('./_nativeCreate');
    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */


    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    module.exports = hashClear;
  }, {
    "./_nativeCreate": 100
  }],
  76: [function (require, module, exports) {
    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    module.exports = hashDelete;
  }, {}],
  77: [function (require, module, exports) {
    var nativeCreate = require('./_nativeCreate');
    /** Used to stand-in for `undefined` hash values. */


    var HASH_UNDEFINED = '__lodash_hash_undefined__';
    /** Used for built-in method references. */

    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */

    function hashGet(key) {
      var data = this.__data__;

      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }

      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    module.exports = hashGet;
  }, {
    "./_nativeCreate": 100
  }],
  78: [function (require, module, exports) {
    var nativeCreate = require('./_nativeCreate');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */

    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }

    module.exports = hashHas;
  }, {
    "./_nativeCreate": 100
  }],
  79: [function (require, module, exports) {
    var nativeCreate = require('./_nativeCreate');
    /** Used to stand-in for `undefined` hash values. */


    var HASH_UNDEFINED = '__lodash_hash_undefined__';
    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */

    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
      return this;
    }

    module.exports = hashSet;
  }, {
    "./_nativeCreate": 100
  }],
  80: [function (require, module, exports) {
    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;
    /** Used to detect unsigned integer values. */

    var reIsUint = /^(?:0|[1-9]\d*)$/;
    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */

    function isIndex(value, length) {
      var type = _typeof(value);

      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }

    module.exports = isIndex;
  }, {}],
  81: [function (require, module, exports) {
    var eq = require('./eq'),
        isArrayLike = require('./isArrayLike'),
        isIndex = require('./_isIndex'),
        isObject = require('./isObject');
    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */


    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }

      var type = _typeof(index);

      if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
        return eq(object[index], value);
      }

      return false;
    }

    module.exports = isIterateeCall;
  }, {
    "./_isIndex": 80,
    "./eq": 118,
    "./isArrayLike": 130,
    "./isObject": 135
  }],
  82: [function (require, module, exports) {
    var isArray = require('./isArray'),
        isSymbol = require('./isSymbol');
    /** Used to match property names within property paths. */


    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/;
    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */

    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }

      var type = _typeof(value);

      if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
        return true;
      }

      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }

    module.exports = isKey;
  }, {
    "./isArray": 129,
    "./isSymbol": 139
  }],
  83: [function (require, module, exports) {
    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = _typeof(value);

      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
    }

    module.exports = isKeyable;
  }, {}],
  84: [function (require, module, exports) {
    var coreJsData = require('./_coreJsData');
    /** Used to detect methods masquerading as native. */


    var maskSrcKey = function () {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? 'Symbol(src)_1.' + uid : '';
    }();
    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */


    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }

    module.exports = isMasked;
  }, {
    "./_coreJsData": 56
  }],
  85: [function (require, module, exports) {
    /** Used for built-in method references. */
    var objectProto = Object.prototype;
    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */

    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
      return value === proto;
    }

    module.exports = isPrototype;
  }, {}],
  86: [function (require, module, exports) {
    var isObject = require('./isObject');
    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */


    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    module.exports = isStrictComparable;
  }, {
    "./isObject": 135
  }],
  87: [function (require, module, exports) {
    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    module.exports = listCacheClear;
  }, {}],
  88: [function (require, module, exports) {
    var assocIndexOf = require('./_assocIndexOf');
    /** Used for built-in method references. */


    var arrayProto = Array.prototype;
    /** Built-in value references. */

    var splice = arrayProto.splice;
    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */

    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }

      var lastIndex = data.length - 1;

      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }

      --this.size;
      return true;
    }

    module.exports = listCacheDelete;
  }, {
    "./_assocIndexOf": 24
  }],
  89: [function (require, module, exports) {
    var assocIndexOf = require('./_assocIndexOf');
    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);
      return index < 0 ? undefined : data[index][1];
    }

    module.exports = listCacheGet;
  }, {
    "./_assocIndexOf": 24
  }],
  90: [function (require, module, exports) {
    var assocIndexOf = require('./_assocIndexOf');
    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    module.exports = listCacheHas;
  }, {
    "./_assocIndexOf": 24
  }],
  91: [function (require, module, exports) {
    var assocIndexOf = require('./_assocIndexOf');
    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */


    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }

      return this;
    }

    module.exports = listCacheSet;
  }, {
    "./_assocIndexOf": 24
  }],
  92: [function (require, module, exports) {
    var Hash = require('./_Hash'),
        ListCache = require('./_ListCache'),
        Map = require('./_Map');
    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */


    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash(),
        'map': new (Map || ListCache)(),
        'string': new Hash()
      };
    }

    module.exports = mapCacheClear;
  }, {
    "./_Hash": 6,
    "./_ListCache": 7,
    "./_Map": 8
  }],
  93: [function (require, module, exports) {
    var getMapData = require('./_getMapData');
    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */


    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    module.exports = mapCacheDelete;
  }, {
    "./_getMapData": 66
  }],
  94: [function (require, module, exports) {
    var getMapData = require('./_getMapData');
    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */


    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    module.exports = mapCacheGet;
  }, {
    "./_getMapData": 66
  }],
  95: [function (require, module, exports) {
    var getMapData = require('./_getMapData');
    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */


    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    module.exports = mapCacheHas;
  }, {
    "./_getMapData": 66
  }],
  96: [function (require, module, exports) {
    var getMapData = require('./_getMapData');
    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */


    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    module.exports = mapCacheSet;
  }, {
    "./_getMapData": 66
  }],
  97: [function (require, module, exports) {
    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);
      map.forEach(function (value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    module.exports = mapToArray;
  }, {}],
  98: [function (require, module, exports) {
    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function (object) {
        if (object == null) {
          return false;
        }

        return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
      };
    }

    module.exports = matchesStrictComparable;
  }, {}],
  99: [function (require, module, exports) {
    var memoize = require('./memoize');
    /** Used as the maximum memoize cache size. */


    var MAX_MEMOIZE_SIZE = 500;
    /**
     * A specialized version of `_.memoize` which clears the memoized function's
     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
     *
     * @private
     * @param {Function} func The function to have its output memoized.
     * @returns {Function} Returns the new memoized function.
     */

    function memoizeCapped(func) {
      var result = memoize(func, function (key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }

        return key;
      });
      var cache = result.cache;
      return result;
    }

    module.exports = memoizeCapped;
  }, {
    "./memoize": 145
  }],
  100: [function (require, module, exports) {
    var getNative = require('./_getNative');
    /* Built-in method references that are verified to be native. */


    var nativeCreate = getNative(Object, 'create');
    module.exports = nativeCreate;
  }, {
    "./_getNative": 68
  }],
  101: [function (require, module, exports) {
    var overArg = require('./_overArg');
    /* Built-in method references for those with the same name as other `lodash` methods. */


    var nativeKeys = overArg(Object.keys, Object);
    module.exports = nativeKeys;
  }, {
    "./_overArg": 104
  }],
  102: [function (require, module, exports) {
    var freeGlobal = require('./_freeGlobal');
    /** Detect free variable `exports`. */


    var freeExports = _typeof(exports) == 'object' && exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && _typeof(module) == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Detect free variable `process` from Node.js. */

    var freeProcess = moduleExports && freeGlobal.process;
    /** Used to access faster Node.js helpers. */

    var nodeUtil = function () {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        } // Legacy `process.binding('util')` for Node.js < 10.


        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();

    module.exports = nodeUtil;
  }, {
    "./_freeGlobal": 64
  }],
  103: [function (require, module, exports) {
    /** Used for built-in method references. */
    var objectProto = Object.prototype;
    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */

    var nativeObjectToString = objectProto.toString;
    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */

    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    module.exports = objectToString;
  }, {}],
  104: [function (require, module, exports) {
    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg));
      };
    }

    module.exports = overArg;
  }, {}],
  105: [function (require, module, exports) {
    var freeGlobal = require('./_freeGlobal');
    /** Detect free variable `self`. */


    var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;
    /** Used as a reference to the global object. */

    var root = freeGlobal || freeSelf || Function('return this')();
    module.exports = root;
  }, {
    "./_freeGlobal": 64
  }],
  106: [function (require, module, exports) {
    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';
    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */

    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);

      return this;
    }

    module.exports = setCacheAdd;
  }, {}],
  107: [function (require, module, exports) {
    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    module.exports = setCacheHas;
  }, {}],
  108: [function (require, module, exports) {
    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);
      set.forEach(function (value) {
        result[++index] = value;
      });
      return result;
    }

    module.exports = setToArray;
  }, {}],
  109: [function (require, module, exports) {
    var ListCache = require('./_ListCache');
    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */


    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }

    module.exports = stackClear;
  }, {
    "./_ListCache": 7
  }],
  110: [function (require, module, exports) {
    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);
      this.size = data.size;
      return result;
    }

    module.exports = stackDelete;
  }, {}],
  111: [function (require, module, exports) {
    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    module.exports = stackGet;
  }, {}],
  112: [function (require, module, exports) {
    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    module.exports = stackHas;
  }, {}],
  113: [function (require, module, exports) {
    var ListCache = require('./_ListCache'),
        Map = require('./_Map'),
        MapCache = require('./_MapCache');
    /** Used as the size to enable large array optimizations. */


    var LARGE_ARRAY_SIZE = 200;
    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */

    function stackSet(key, value) {
      var data = this.__data__;

      if (data instanceof ListCache) {
        var pairs = data.__data__;

        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }

        data = this.__data__ = new MapCache(pairs);
      }

      data.set(key, value);
      this.size = data.size;
      return this;
    }

    module.exports = stackSet;
  }, {
    "./_ListCache": 7,
    "./_Map": 8,
    "./_MapCache": 9
  }],
  114: [function (require, module, exports) {
    var memoizeCapped = require('./_memoizeCapped');
    /** Used to match property names within property paths. */


    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    /** Used to match backslashes in property paths. */

    var reEscapeChar = /\\(\\)?/g;
    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */

    var stringToPath = memoizeCapped(function (string) {
      var result = [];

      if (string.charCodeAt(0) === 46
      /* . */
      ) {
          result.push('');
        }

      string.replace(rePropName, function (match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
      });
      return result;
    });
    module.exports = stringToPath;
  }, {
    "./_memoizeCapped": 99
  }],
  115: [function (require, module, exports) {
    var isSymbol = require('./isSymbol');
    /** Used as references for various `Number` constants. */


    var INFINITY = 1 / 0;
    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */

    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }

      var result = value + '';
      return result == '0' && 1 / value == -INFINITY ? '-0' : result;
    }

    module.exports = toKey;
  }, {
    "./isSymbol": 139
  }],
  116: [function (require, module, exports) {
    /** Used for built-in method references. */
    var funcProto = Function.prototype;
    /** Used to resolve the decompiled source of functions. */

    var funcToString = funcProto.toString;
    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */

    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}

        try {
          return func + '';
        } catch (e) {}
      }

      return '';
    }

    module.exports = toSource;
  }, {}],
  117: [function (require, module, exports) {
    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are falsey.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Array
     * @param {Array} array The array to compact.
     * @returns {Array} Returns the new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value) {
          result[resIndex++] = value;
        }
      }

      return result;
    }

    module.exports = compact;
  }, {}],
  118: [function (require, module, exports) {
    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }

    module.exports = eq;
  }, {}],
  119: [function (require, module, exports) {
    var arrayEvery = require('./_arrayEvery'),
        baseEvery = require('./_baseEvery'),
        baseIteratee = require('./_baseIteratee'),
        isArray = require('./isArray'),
        isIterateeCall = require('./_isIterateeCall');
    /**
     * Checks if `predicate` returns truthy for **all** elements of `collection`.
     * Iteration is stopped once `predicate` returns falsey. The predicate is
     * invoked with three arguments: (value, index|key, collection).
     *
     * **Note:** This method returns `true` for
     * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
     * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
     * elements of empty collections.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': false },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * // The `_.matches` iteratee shorthand.
     * _.every(users, { 'user': 'barney', 'active': false });
     * // => false
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.every(users, ['active', false]);
     * // => true
     *
     * // The `_.property` iteratee shorthand.
     * _.every(users, 'active');
     * // => false
     */


    function every(collection, predicate, guard) {
      var func = isArray(collection) ? arrayEvery : baseEvery;

      if (guard && isIterateeCall(collection, predicate, guard)) {
        predicate = undefined;
      }

      return func(collection, baseIteratee(predicate, 3));
    }

    module.exports = every;
  }, {
    "./_arrayEvery": 18,
    "./_baseEvery": 27,
    "./_baseIteratee": 43,
    "./_isIterateeCall": 81,
    "./isArray": 129
  }],
  120: [function (require, module, exports) {
    var arrayFilter = require('./_arrayFilter'),
        baseFilter = require('./_baseFilter'),
        baseIteratee = require('./_baseIteratee'),
        isArray = require('./isArray');
    /**
     * Iterates over elements of `collection`, returning an array of all elements
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * **Note:** Unlike `_.remove`, this method returns a new array.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     * @see _.reject
     * @example
     *
     * var users = [
     *   { 'user': 'barney', 'age': 36, 'active': true },
     *   { 'user': 'fred',   'age': 40, 'active': false }
     * ];
     *
     * _.filter(users, function(o) { return !o.active; });
     * // => objects for ['fred']
     *
     * // The `_.matches` iteratee shorthand.
     * _.filter(users, { 'age': 36, 'active': true });
     * // => objects for ['barney']
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.filter(users, ['active', false]);
     * // => objects for ['fred']
     *
     * // The `_.property` iteratee shorthand.
     * _.filter(users, 'active');
     * // => objects for ['barney']
     */


    function filter(collection, predicate) {
      var func = isArray(collection) ? arrayFilter : baseFilter;
      return func(collection, baseIteratee(predicate, 3));
    }

    module.exports = filter;
  }, {
    "./_arrayFilter": 19,
    "./_baseFilter": 28,
    "./_baseIteratee": 43,
    "./isArray": 129
  }],
  121: [function (require, module, exports) {
    var createFind = require('./_createFind'),
        findIndex = require('./findIndex');
    /**
     * Iterates over elements of `collection`, returning the first element
     * `predicate` returns truthy for. The predicate is invoked with three
     * arguments: (value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {*} Returns the matched element, else `undefined`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'age': 36, 'active': true },
     *   { 'user': 'fred',    'age': 40, 'active': false },
     *   { 'user': 'pebbles', 'age': 1,  'active': true }
     * ];
     *
     * _.find(users, function(o) { return o.age < 40; });
     * // => object for 'barney'
     *
     * // The `_.matches` iteratee shorthand.
     * _.find(users, { 'age': 1, 'active': true });
     * // => object for 'pebbles'
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.find(users, ['active', false]);
     * // => object for 'fred'
     *
     * // The `_.property` iteratee shorthand.
     * _.find(users, 'active');
     * // => object for 'barney'
     */


    var find = createFind(findIndex);
    module.exports = find;
  }, {
    "./_createFind": 59,
    "./findIndex": 122
  }],
  122: [function (require, module, exports) {
    var baseFindIndex = require('./_baseFindIndex'),
        baseIteratee = require('./_baseIteratee'),
        toInteger = require('./toInteger');
    /* Built-in method references for those with the same name as other `lodash` methods. */


    var nativeMax = Math.max;
    /**
     * This method is like `_.find` except that it returns the index of the first
     * element `predicate` returns truthy for instead of the element itself.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Array
     * @param {Array} array The array to inspect.
     * @param {Function} [predicate=_.identity] The function invoked per iteration.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var users = [
     *   { 'user': 'barney',  'active': false },
     *   { 'user': 'fred',    'active': false },
     *   { 'user': 'pebbles', 'active': true }
     * ];
     *
     * _.findIndex(users, function(o) { return o.user == 'barney'; });
     * // => 0
     *
     * // The `_.matches` iteratee shorthand.
     * _.findIndex(users, { 'user': 'fred', 'active': false });
     * // => 1
     *
     * // The `_.matchesProperty` iteratee shorthand.
     * _.findIndex(users, ['active', false]);
     * // => 0
     *
     * // The `_.property` iteratee shorthand.
     * _.findIndex(users, 'active');
     * // => 2
     */

    function findIndex(array, predicate, fromIndex) {
      var length = array == null ? 0 : array.length;

      if (!length) {
        return -1;
      }

      var index = fromIndex == null ? 0 : toInteger(fromIndex);

      if (index < 0) {
        index = nativeMax(length + index, 0);
      }

      return baseFindIndex(array, baseIteratee(predicate, 3), index);
    }

    module.exports = findIndex;
  }, {
    "./_baseFindIndex": 29,
    "./_baseIteratee": 43,
    "./toInteger": 150
  }],
  123: [function (require, module, exports) {
    var arrayEach = require('./_arrayEach'),
        baseEach = require('./_baseEach'),
        castFunction = require('./_castFunction'),
        isArray = require('./isArray');
    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _.forEach([1, 2], function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */


    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, castFunction(iteratee));
    }

    module.exports = forEach;
  }, {
    "./_arrayEach": 17,
    "./_baseEach": 26,
    "./_castFunction": 54,
    "./isArray": 129
  }],
  124: [function (require, module, exports) {
    var baseGet = require('./_baseGet');
    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */


    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    module.exports = get;
  }, {
    "./_baseGet": 32
  }],
  125: [function (require, module, exports) {
    var baseHas = require('./_baseHas'),
        hasPath = require('./_hasPath');
    /**
     * Checks if `path` is a direct property of `object`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = { 'a': { 'b': 2 } };
     * var other = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.has(object, 'a');
     * // => true
     *
     * _.has(object, 'a.b');
     * // => true
     *
     * _.has(object, ['a', 'b']);
     * // => true
     *
     * _.has(other, 'a');
     * // => false
     */


    function has(object, path) {
      return object != null && hasPath(object, path, baseHas);
    }

    module.exports = has;
  }, {
    "./_baseHas": 35,
    "./_hasPath": 74
  }],
  126: [function (require, module, exports) {
    var baseHasIn = require('./_baseHasIn'),
        hasPath = require('./_hasPath');
    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */


    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    module.exports = hasIn;
  }, {
    "./_baseHasIn": 36,
    "./_hasPath": 74
  }],
  127: [function (require, module, exports) {
    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    module.exports = identity;
  }, {}],
  128: [function (require, module, exports) {
    var baseIsArguments = require('./_baseIsArguments'),
        isObjectLike = require('./isObjectLike');
    /** Used for built-in method references. */


    var objectProto = Object.prototype;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /** Built-in value references. */

    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */

    var isArguments = baseIsArguments(function () {
      return arguments;
    }()) ? baseIsArguments : function (value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
    };
    module.exports = isArguments;
  }, {
    "./_baseIsArguments": 37,
    "./isObjectLike": 136
  }],
  129: [function (require, module, exports) {
    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;
    module.exports = isArray;
  }, {}],
  130: [function (require, module, exports) {
    var isFunction = require('./isFunction'),
        isLength = require('./isLength');
    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */


    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    module.exports = isArrayLike;
  }, {
    "./isFunction": 133,
    "./isLength": 134
  }],
  131: [function (require, module, exports) {
    var root = require('./_root'),
        stubFalse = require('./stubFalse');
    /** Detect free variable `exports`. */


    var freeExports = _typeof(exports) == 'object' && exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && _typeof(module) == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Built-in value references. */

    var Buffer = moduleExports ? root.Buffer : undefined;
    /* Built-in method references for those with the same name as other `lodash` methods. */

    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */

    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  }, {
    "./_root": 105,
    "./stubFalse": 148
  }],
  132: [function (require, module, exports) {
    var baseIsEqual = require('./_baseIsEqual');
    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */


    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    module.exports = isEqual;
  }, {
    "./_baseIsEqual": 38
  }],
  133: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        isObject = require('./isObject');
    /** `Object#toString` result references. */


    var asyncTag = '[object AsyncFunction]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';
    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */

    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      } // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.


      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    module.exports = isFunction;
  }, {
    "./_baseGetTag": 34,
    "./isObject": 135
  }],
  134: [function (require, module, exports) {
    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;
    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */

    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    module.exports = isLength;
  }, {}],
  135: [function (require, module, exports) {
    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = _typeof(value);

      return value != null && (type == 'object' || type == 'function');
    }

    module.exports = isObject;
  }, {}],
  136: [function (require, module, exports) {
    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && _typeof(value) == 'object';
    }

    module.exports = isObjectLike;
  }, {}],
  137: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        getPrototype = require('./_getPrototype'),
        isObjectLike = require('./isObjectLike');
    /** `Object#toString` result references. */


    var objectTag = '[object Object]';
    /** Used for built-in method references. */

    var funcProto = Function.prototype,
        objectProto = Object.prototype;
    /** Used to resolve the decompiled source of functions. */

    var funcToString = funcProto.toString;
    /** Used to check objects for own properties. */

    var hasOwnProperty = objectProto.hasOwnProperty;
    /** Used to infer the `Object` constructor. */

    var objectCtorString = funcToString.call(Object);
    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */

    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }

      var proto = getPrototype(value);

      if (proto === null) {
        return true;
      }

      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }

    module.exports = isPlainObject;
  }, {
    "./_baseGetTag": 34,
    "./_getPrototype": 69,
    "./isObjectLike": 136
  }],
  138: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        isArray = require('./isArray'),
        isObjectLike = require('./isObjectLike');
    /** `Object#toString` result references. */


    var stringTag = '[object String]';
    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */

    function isString(value) {
      return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
    }

    module.exports = isString;
  }, {
    "./_baseGetTag": 34,
    "./isArray": 129,
    "./isObjectLike": 136
  }],
  139: [function (require, module, exports) {
    var baseGetTag = require('./_baseGetTag'),
        isObjectLike = require('./isObjectLike');
    /** `Object#toString` result references. */


    var symbolTag = '[object Symbol]';
    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */

    function isSymbol(value) {
      return _typeof(value) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
    }

    module.exports = isSymbol;
  }, {
    "./_baseGetTag": 34,
    "./isObjectLike": 136
  }],
  140: [function (require, module, exports) {
    var baseIsTypedArray = require('./_baseIsTypedArray'),
        baseUnary = require('./_baseUnary'),
        nodeUtil = require('./_nodeUtil');
    /* Node.js helper references. */


    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */

    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
  }, {
    "./_baseIsTypedArray": 42,
    "./_baseUnary": 52,
    "./_nodeUtil": 102
  }],
  141: [function (require, module, exports) {
    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     *
     * _.isUndefined(null);
     * // => false
     */
    function isUndefined(value) {
      return value === undefined;
    }

    module.exports = isUndefined;
  }, {}],
  142: [function (require, module, exports) {
    var arrayLikeKeys = require('./_arrayLikeKeys'),
        baseKeys = require('./_baseKeys'),
        isArrayLike = require('./isArrayLike');
    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */


    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    module.exports = keys;
  }, {
    "./_arrayLikeKeys": 20,
    "./_baseKeys": 44,
    "./isArrayLike": 130
  }],
  143: [function (require, module, exports) {
    var arrayMap = require('./_arrayMap'),
        baseIteratee = require('./_baseIteratee'),
        baseMap = require('./_baseMap'),
        isArray = require('./isArray');
    /**
     * Creates an array of values by running each element in `collection` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, index|key, collection).
     *
     * Many lodash methods are guarded to work as iteratees for methods like
     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
     *
     * The guarded methods are:
     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     * @example
     *
     * function square(n) {
     *   return n * n;
     * }
     *
     * _.map([4, 8], square);
     * // => [16, 64]
     *
     * _.map({ 'a': 4, 'b': 8 }, square);
     * // => [16, 64] (iteration order is not guaranteed)
     *
     * var users = [
     *   { 'user': 'barney' },
     *   { 'user': 'fred' }
     * ];
     *
     * // The `_.property` iteratee shorthand.
     * _.map(users, 'user');
     * // => ['barney', 'fred']
     */


    function map(collection, iteratee) {
      var func = isArray(collection) ? arrayMap : baseMap;
      return func(collection, baseIteratee(iteratee, 3));
    }

    module.exports = map;
  }, {
    "./_arrayMap": 21,
    "./_baseIteratee": 43,
    "./_baseMap": 45,
    "./isArray": 129
  }],
  144: [function (require, module, exports) {
    var baseAssignValue = require('./_baseAssignValue'),
        baseForOwn = require('./_baseForOwn'),
        baseIteratee = require('./_baseIteratee');
    /**
     * Creates an object with the same keys as `object` and values generated
     * by running each own enumerable string keyed property of `object` thru
     * `iteratee`. The iteratee is invoked with three arguments:
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns the new mapped object.
     * @see _.mapKeys
     * @example
     *
     * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
     *
     * _.mapValues(users, function(o) { return o.age; });
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     *
     * // The `_.property` iteratee shorthand.
     * _.mapValues(users, 'age');
     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
     */


    function mapValues(object, iteratee) {
      var result = {};
      iteratee = baseIteratee(iteratee, 3);
      baseForOwn(object, function (value, key, object) {
        baseAssignValue(result, key, iteratee(value, key, object));
      });
      return result;
    }

    module.exports = mapValues;
  }, {
    "./_baseAssignValue": 25,
    "./_baseForOwn": 31,
    "./_baseIteratee": 43
  }],
  145: [function (require, module, exports) {
    var MapCache = require('./_MapCache');
    /** Error message constants. */


    var FUNC_ERROR_TEXT = 'Expected a function';
    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */

    function memoize(func, resolver) {
      if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }

      var memoized = function memoized() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }

        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };

      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    } // Expose `MapCache`.


    memoize.Cache = MapCache;
    module.exports = memoize;
  }, {
    "./_MapCache": 9
  }],
  146: [function (require, module, exports) {
    var baseProperty = require('./_baseProperty'),
        basePropertyDeep = require('./_basePropertyDeep'),
        isKey = require('./_isKey'),
        toKey = require('./_toKey');
    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */


    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    module.exports = property;
  }, {
    "./_baseProperty": 48,
    "./_basePropertyDeep": 49,
    "./_isKey": 82,
    "./_toKey": 115
  }],
  147: [function (require, module, exports) {
    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    module.exports = stubArray;
  }, {}],
  148: [function (require, module, exports) {
    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = stubFalse;
  }, {}],
  149: [function (require, module, exports) {
    var toNumber = require('./toNumber');
    /** Used as references for various `Number` constants. */


    var INFINITY = 1 / 0,
        MAX_INTEGER = 1.7976931348623157e+308;
    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */

    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }

      value = toNumber(value);

      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }

      return value === value ? value : 0;
    }

    module.exports = toFinite;
  }, {
    "./toNumber": 151
  }],
  150: [function (require, module, exports) {
    var toFinite = require('./toFinite');
    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */


    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }

    module.exports = toInteger;
  }, {
    "./toFinite": 149
  }],
  151: [function (require, module, exports) {
    var isObject = require('./isObject'),
        isSymbol = require('./isSymbol');
    /** Used as references for various `Number` constants. */


    var NAN = 0 / 0;
    /** Used to match leading and trailing whitespace. */

    var reTrim = /^\s+|\s+$/g;
    /** Used to detect bad signed hexadecimal string values. */

    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    /** Used to detect binary string values. */

    var reIsBinary = /^0b[01]+$/i;
    /** Used to detect octal string values. */

    var reIsOctal = /^0o[0-7]+$/i;
    /** Built-in method references without a dependency on `root`. */

    var freeParseInt = parseInt;
    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */

    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }

      if (isSymbol(value)) {
        return NAN;
      }

      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? other + '' : other;
      }

      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }

      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }

    module.exports = toNumber;
  }, {
    "./isObject": 135,
    "./isSymbol": 139
  }],
  152: [function (require, module, exports) {
    var baseToString = require('./_baseToString');
    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */


    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    module.exports = toString;
  }, {
    "./_baseToString": 51
  }],
  153: [function (require, module, exports) {
    (function () {
      var _global = this;
      /**
       * JS Implementation of MurmurHash2
       *
       * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
       * @see http://github.com/garycourt/murmurhash-js
       * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
       * @see http://sites.google.com/site/murmurhash/
       *
       * @param {string} str ASCII only
       * @param {number} seed Positive integer only
       * @return {number} 32-bit positive integer hash
       */


      function MurmurHashV2(str, seed) {
        var l = str.length,
            h = seed ^ l,
            i = 0,
            k;

        while (l >= 4) {
          k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
          k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
          k ^= k >>> 24;
          k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
          h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;
          l -= 4;
          ++i;
        }

        switch (l) {
          case 3:
            h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

          case 2:
            h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

          case 1:
            h ^= str.charCodeAt(i) & 0xff;
            h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
        }

        h ^= h >>> 13;
        h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
        h ^= h >>> 15;
        return h >>> 0;
      }

      ;
      /**
       * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
       *
       * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
       * @see http://github.com/garycourt/murmurhash-js
       * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
       * @see http://sites.google.com/site/murmurhash/
       *
       * @param {string} key ASCII only
       * @param {number} seed Positive integer only
       * @return {number} 32-bit positive integer hash
       */

      function MurmurHashV3(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
        remainder = key.length & 3; // key.length % 4

        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
          k1 = key.charCodeAt(i) & 0xff | (key.charCodeAt(++i) & 0xff) << 8 | (key.charCodeAt(++i) & 0xff) << 16 | (key.charCodeAt(++i) & 0xff) << 24;
          ++i;
          k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
          k1 = k1 << 15 | k1 >>> 17;
          k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;
          h1 ^= k1;
          h1 = h1 << 13 | h1 >>> 19;
          h1b = (h1 & 0xffff) * 5 + (((h1 >>> 16) * 5 & 0xffff) << 16) & 0xffffffff;
          h1 = (h1b & 0xffff) + 0x6b64 + (((h1b >>> 16) + 0xe654 & 0xffff) << 16);
        }

        k1 = 0;

        switch (remainder) {
          case 3:
            k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;

          case 2:
            k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;

          case 1:
            k1 ^= key.charCodeAt(i) & 0xff;
            k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
            k1 = k1 << 15 | k1 >>> 17;
            k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= key.length;
        h1 ^= h1 >>> 16;
        h1 = (h1 & 0xffff) * 0x85ebca6b + (((h1 >>> 16) * 0x85ebca6b & 0xffff) << 16) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = (h1 & 0xffff) * 0xc2b2ae35 + (((h1 >>> 16) * 0xc2b2ae35 & 0xffff) << 16) & 0xffffffff;
        h1 ^= h1 >>> 16;
        return h1 >>> 0;
      }

      var murmur = MurmurHashV3;
      murmur.v2 = MurmurHashV2;
      murmur.v3 = MurmurHashV3;

      if (typeof module != 'undefined') {
        module.exports = murmur;
      } else {
        var _previousRoot = _global.murmur;

        murmur.noConflict = function () {
          _global.murmur = _previousRoot;
          return murmur;
        };

        _global.murmur = murmur;
      }
    })();
  }, {}],
  154: [function (require, module, exports) {
    (function () {
      var crypt = require('crypt'),
          utf8 = require('charenc').utf8,
          bin = require('charenc').bin,
          // The core
      sha1 = function sha1(message) {
        // Convert to byte array
        if (message.constructor == String) message = utf8.stringToBytes(message); // otherwise assume byte array

        var m = crypt.bytesToWords(message),
            l = message.length * 8,
            w = [],
            H0 = 1732584193,
            H1 = -271733879,
            H2 = -1732584194,
            H3 = 271733878,
            H4 = -1009589776; // Padding

        m[l >> 5] |= 0x80 << 24 - l % 32;
        m[(l + 64 >>> 9 << 4) + 15] = l;

        for (var i = 0; i < m.length; i += 16) {
          var a = H0,
              b = H1,
              c = H2,
              d = H3,
              e = H4;

          for (var j = 0; j < 80; j++) {
            if (j < 16) w[j] = m[i + j];else {
              var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
              w[j] = n << 1 | n >>> 31;
            }
            var t = (H0 << 5 | H0 >>> 27) + H4 + (w[j] >>> 0) + (j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 : j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 : j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 : (H1 ^ H2 ^ H3) - 899497514);
            H4 = H3;
            H3 = H2;
            H2 = H1 << 30 | H1 >>> 2;
            H1 = H0;
            H0 = t;
          }

          H0 += a;
          H1 += b;
          H2 += c;
          H3 += d;
          H4 += e;
        }

        return [H0, H1, H2, H3, H4];
      },
          // Public API
      api = function api(message, options) {
        var digestbytes = crypt.wordsToBytes(sha1(message));
        return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
      };

      api._blocksize = 16;
      api._digestsize = 20;
      module.exports = api;
    })();
  }, {
    "charenc": 2,
    "crypt": 3
  }],
  155: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var core_1 = require("./lib/core");

    exports.trackerCore = core_1.trackerCore;
  }, {
    "./lib/core": 158
  }],
  156: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    function base64urldecode(data) {
      if (!data) {
        return data;
      }

      var padding = 4 - data.length % 4;

      switch (padding) {
        case 2:
          data += "==";
          break;

        case 3:
          data += "=";
          break;
      }

      var b64Data = data.replace(/-/g, '+').replace(/_/g, '/');
      return base64decode(b64Data);
    }

    exports.base64urldecode = base64urldecode;

    function base64encode(data) {
      var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var o1,
          o2,
          o3,
          h1,
          h2,
          h3,
          h4,
          bits,
          i = 0,
          ac = 0,
          enc,
          tmp_arr = [];

      if (!data) {
        return data;
      }

      data = unescape(encodeURIComponent(data));

      do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);

      enc = tmp_arr.join('');
      var r = data.length % 3;
      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    }

    exports.base64encode = base64encode;

    function base64decode(encodedData) {
      var decodeUTF8string = function decodeUTF8string(str) {
        return decodeURIComponent(str.split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      };

      var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      var o1,
          o2,
          o3,
          h1,
          h2,
          h3,
          h4,
          bits,
          i = 0,
          ac = 0,
          dec = '',
          tmpArr = [];

      if (!encodedData) {
        return encodedData;
      }

      encodedData += '';

      do {
        h1 = b64.indexOf(encodedData.charAt(i++));
        h2 = b64.indexOf(encodedData.charAt(i++));
        h3 = b64.indexOf(encodedData.charAt(i++));
        h4 = b64.indexOf(encodedData.charAt(i++));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 === 64) {
          tmpArr[ac++] = String.fromCharCode(o1);
        } else if (h4 === 64) {
          tmpArr[ac++] = String.fromCharCode(o1, o2);
        } else {
          tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
        }
      } while (i < encodedData.length);

      dec = tmpArr.join('');
      return decodeUTF8string(dec.replace(/\0+$/, ''));
    }

    exports.base64decode = base64decode;
  }, {}],
  157: [function (require, module, exports) {
    "use strict";

    var __assign = this && this.__assign || Object.assign || function (t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];

        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
      }

      return t;
    };

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var payload_1 = require("./payload");

    var base64_1 = require("./base64");

    var isEqual = require("lodash/isEqual");

    var has = require("lodash/has");

    var get = require("lodash/get");

    var isPlainObject = require("lodash/isPlainObject");

    var every = require("lodash/every");

    var compact = require("lodash/compact");

    var map = require("lodash/map");

    function getSchemaParts(input) {
      var re = new RegExp('^iglu:([a-zA-Z0-9-_\.]+)\/([a-zA-Z0-9-_]+)\/jsonschema\/([1-9][0-9]*)\-(0|[1-9][0-9]*)\-(0|[1-9][0-9]*)$');
      var matches = re.exec(input);
      if (matches !== null) return matches.slice(1, 6);
      return undefined;
    }

    exports.getSchemaParts = getSchemaParts;

    function validateVendorParts(parts) {
      if (parts[0] === '*' || parts[1] === '*') {
        return false;
      }

      if (parts.slice(2).length > 0) {
        var asterisk = false;

        for (var _i = 0, _a = parts.slice(2); _i < _a.length; _i++) {
          var part = _a[_i];
          if (part === '*') asterisk = true;else if (asterisk) return false;
        }

        return true;
      } else if (parts.length == 2) return true;

      return false;
    }

    exports.validateVendorParts = validateVendorParts;

    function validateVendor(input) {
      var parts = input.split('.');
      if (parts && parts.length > 1) return validateVendorParts(parts);
      return false;
    }

    exports.validateVendor = validateVendor;

    function getRuleParts(input) {
      var re = new RegExp('^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*)\.)+(?:[a-zA-Z0-9-_]+|\\*))\/([a-zA-Z0-9-_.]+|\\*)\/jsonschema\/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$');
      var matches = re.exec(input);
      if (matches !== null && validateVendor(matches[1])) return matches.slice(1, 6);
      return undefined;
    }

    exports.getRuleParts = getRuleParts;

    function isValidRule(input) {
      var ruleParts = getRuleParts(input);

      if (ruleParts) {
        var vendor = ruleParts[0];
        return ruleParts.length === 5 && validateVendor(vendor);
      }

      return false;
    }

    exports.isValidRule = isValidRule;

    function isStringArray(input) {
      return Array.isArray(input) && input.every(function (x) {
        return typeof x === 'string';
      });
    }

    exports.isStringArray = isStringArray;

    function isValidRuleSetArg(input) {
      if (isStringArray(input)) return input.every(function (x) {
        return isValidRule(x);
      });else if (typeof input === 'string') return isValidRule(input);
      return false;
    }

    exports.isValidRuleSetArg = isValidRuleSetArg;

    function isSelfDescribingJson(input) {
      if (payload_1.isNonEmptyJson(input)) if ('schema' in input && 'data' in input) return typeof input.schema === 'string' && _typeof(input.data) === 'object';
      return false;
    }

    exports.isSelfDescribingJson = isSelfDescribingJson;

    function isEventJson(input) {
      if (payload_1.isNonEmptyJson(input) && 'e' in input) return typeof input.e === 'string';
      return false;
    }

    exports.isEventJson = isEventJson;

    function isRuleSet(input) {
      var ruleCount = 0;

      if (isPlainObject(input)) {
        if (has(input, 'accept')) {
          if (isValidRuleSetArg(input['accept'])) {
            ruleCount += 1;
          } else {
            return false;
          }
        }

        if (has(input, 'reject')) {
          if (isValidRuleSetArg(input['reject'])) {
            ruleCount += 1;
          } else {
            return false;
          }
        }

        return ruleCount > 0 && ruleCount <= 2;
      }

      return false;
    }

    exports.isRuleSet = isRuleSet;

    function isContextGenerator(input) {
      return typeof input === 'function' && input.length <= 1;
    }

    exports.isContextGenerator = isContextGenerator;

    function isContextFilter(input) {
      return typeof input === 'function' && input.length <= 1;
    }

    exports.isContextFilter = isContextFilter;

    function isContextPrimitive(input) {
      return isContextGenerator(input) || isSelfDescribingJson(input);
    }

    exports.isContextPrimitive = isContextPrimitive;

    function isFilterProvider(input) {
      if (Array.isArray(input)) {
        if (input.length === 2) {
          if (Array.isArray(input[1])) {
            return isContextFilter(input[0]) && every(input[1], isContextPrimitive);
          }

          return isContextFilter(input[0]) && isContextPrimitive(input[1]);
        }
      }

      return false;
    }

    exports.isFilterProvider = isFilterProvider;

    function isRuleSetProvider(input) {
      if (Array.isArray(input) && input.length === 2) {
        if (!isRuleSet(input[0])) return false;
        if (Array.isArray(input[1])) return every(input[1], isContextPrimitive);
        return isContextPrimitive(input[1]);
      }

      return false;
    }

    exports.isRuleSetProvider = isRuleSetProvider;

    function isConditionalContextProvider(input) {
      return isFilterProvider(input) || isRuleSetProvider(input);
    }

    exports.isConditionalContextProvider = isConditionalContextProvider;

    function matchSchemaAgainstRule(rule, schema) {
      if (!isValidRule(rule)) return false;
      var ruleParts = getRuleParts(rule);
      var schemaParts = getSchemaParts(schema);

      if (ruleParts && schemaParts) {
        if (!matchVendor(ruleParts[0], schemaParts[0])) return false;

        for (var i = 1; i < 5; i++) {
          if (!matchPart(ruleParts[i], schemaParts[i])) return false;
        }

        return true;
      }

      return false;
    }

    exports.matchSchemaAgainstRule = matchSchemaAgainstRule;

    function matchVendor(rule, vendor) {
      var vendorParts = vendor.split('.');
      var ruleParts = rule.split('.');

      if (vendorParts && ruleParts) {
        if (vendorParts.length !== ruleParts.length) return false;

        for (var i = 0; i < ruleParts.length; i++) {
          if (!matchPart(vendorParts[i], ruleParts[i])) return false;
        }

        return true;
      }

      return false;
    }

    exports.matchVendor = matchVendor;

    function matchPart(rule, schema) {
      return rule && schema && rule === '*' || rule === schema;
    }

    exports.matchPart = matchPart;

    function matchSchemaAgainstRuleSet(ruleSet, schema) {
      var rejectCount = 0;
      var acceptCount = 0;
      var acceptRules = get(ruleSet, 'accept');

      if (Array.isArray(acceptRules)) {
        if (ruleSet.accept.some(function (rule) {
          return matchSchemaAgainstRule(rule, schema);
        })) {
          acceptCount++;
        }
      } else if (typeof acceptRules === 'string') {
        if (matchSchemaAgainstRule(acceptRules, schema)) {
          acceptCount++;
        }
      }

      var rejectRules = get(ruleSet, 'reject');

      if (Array.isArray(rejectRules)) {
        if (ruleSet.reject.some(function (rule) {
          return matchSchemaAgainstRule(rule, schema);
        })) {
          rejectCount++;
        }
      } else if (typeof rejectRules === 'string') {
        if (matchSchemaAgainstRule(rejectRules, schema)) {
          rejectCount++;
        }
      }

      if (acceptCount > 0 && rejectCount === 0) {
        return true;
      } else if (acceptCount === 0 && rejectCount > 0) {
        return false;
      }

      return false;
    }

    exports.matchSchemaAgainstRuleSet = matchSchemaAgainstRuleSet;

    function getUsefulSchema(sb) {
      if (typeof get(sb, 'ue_px.data.schema') === 'string') return get(sb, 'ue_px.data.schema');else if (typeof get(sb, 'ue_pr.data.schema') === 'string') return get(sb, 'ue_pr.data.schema');else if (typeof get(sb, 'schema') === 'string') return get(sb, 'schema');
      return '';
    }

    exports.getUsefulSchema = getUsefulSchema;

    function getDecodedEvent(sb) {
      var decodedEvent = __assign({}, sb);

      try {
        if (has(decodedEvent, 'ue_px')) {
          decodedEvent['ue_px'] = JSON.parse(base64_1.base64urldecode(get(decodedEvent, ['ue_px'])));
        }
      } catch (e) {}

      return decodedEvent;
    }

    exports.getDecodedEvent = getDecodedEvent;

    function getEventType(sb) {
      return get(sb, 'e', '');
    }

    exports.getEventType = getEventType;

    function buildGenerator(generator, event, eventType, eventSchema) {
      var contextGeneratorResult = undefined;

      try {
        var args = {
          event: event,
          eventType: eventType,
          eventSchema: eventSchema
        };
        contextGeneratorResult = generator(args);

        if (isSelfDescribingJson(contextGeneratorResult)) {
          return contextGeneratorResult;
        } else if (Array.isArray(contextGeneratorResult) && every(contextGeneratorResult, isSelfDescribingJson)) {
          return contextGeneratorResult;
        } else {
          return undefined;
        }
      } catch (error) {
        contextGeneratorResult = undefined;
      }

      return contextGeneratorResult;
    }

    exports.buildGenerator = buildGenerator;

    function normalizeToArray(input) {
      if (Array.isArray(input)) {
        return input;
      }

      return Array.of(input);
    }

    exports.normalizeToArray = normalizeToArray;

    function generatePrimitives(contextPrimitives, event, eventType, eventSchema) {
      var normalizedInputs = normalizeToArray(contextPrimitives);

      var partialEvaluate = function partialEvaluate(primitive) {
        var result = evaluatePrimitive(primitive, event, eventType, eventSchema);

        if (result && result.length !== 0) {
          return result;
        }
      };

      var generatedContexts = map(normalizedInputs, partialEvaluate);
      return [].concat.apply([], compact(generatedContexts));
    }

    exports.generatePrimitives = generatePrimitives;

    function evaluatePrimitive(contextPrimitive, event, eventType, eventSchema) {
      if (isSelfDescribingJson(contextPrimitive)) {
        return [contextPrimitive];
      } else if (isContextGenerator(contextPrimitive)) {
        var generatorOutput = buildGenerator(contextPrimitive, event, eventType, eventSchema);

        if (isSelfDescribingJson(generatorOutput)) {
          return [generatorOutput];
        } else if (Array.isArray(generatorOutput)) {
          return generatorOutput;
        }
      }

      return undefined;
    }

    exports.evaluatePrimitive = evaluatePrimitive;

    function evaluateProvider(provider, event, eventType, eventSchema) {
      if (isFilterProvider(provider)) {
        var filter = provider[0];
        var filterResult = false;

        try {
          var args = {
            event: event,
            eventType: eventType,
            eventSchema: eventSchema
          };
          filterResult = filter(args);
        } catch (error) {
          filterResult = false;
        }

        if (filterResult === true) {
          return generatePrimitives(provider[1], event, eventType, eventSchema);
        }
      } else if (isRuleSetProvider(provider)) {
        if (matchSchemaAgainstRuleSet(provider[0], eventSchema)) {
          return generatePrimitives(provider[1], event, eventType, eventSchema);
        }
      }

      return [];
    }

    exports.evaluateProvider = evaluateProvider;

    function generateConditionals(providers, event, eventType, eventSchema) {
      var normalizedInput = normalizeToArray(providers);

      var partialEvaluate = function partialEvaluate(provider) {
        var result = evaluateProvider(provider, event, eventType, eventSchema);

        if (result && result.length !== 0) {
          return result;
        }
      };

      var generatedContexts = map(normalizedInput, partialEvaluate);
      return [].concat.apply([], compact(generatedContexts));
    }

    exports.generateConditionals = generateConditionals;

    function contextModule() {
      var globalPrimitives = [];
      var conditionalProviders = [];

      function assembleAllContexts(event) {
        var eventSchema = getUsefulSchema(event);
        var eventType = getEventType(event);
        var contexts = [];
        var generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
        contexts.push.apply(contexts, generatedPrimitives);
        var generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
        contexts.push.apply(contexts, generatedConditionals);
        return contexts;
      }

      return {
        getGlobalPrimitives: function getGlobalPrimitives() {
          return globalPrimitives;
        },
        getConditionalProviders: function getConditionalProviders() {
          return conditionalProviders;
        },
        addGlobalContexts: function addGlobalContexts(contexts) {
          var acceptedConditionalContexts = [];
          var acceptedContextPrimitives = [];

          for (var _i = 0, contexts_1 = contexts; _i < contexts_1.length; _i++) {
            var context = contexts_1[_i];

            if (isConditionalContextProvider(context)) {
              acceptedConditionalContexts.push(context);
            } else if (isContextPrimitive(context)) {
              acceptedContextPrimitives.push(context);
            }
          }

          globalPrimitives = globalPrimitives.concat(acceptedContextPrimitives);
          conditionalProviders = conditionalProviders.concat(acceptedConditionalContexts);
        },
        clearGlobalContexts: function clearGlobalContexts() {
          conditionalProviders = [];
          globalPrimitives = [];
        },
        removeGlobalContexts: function removeGlobalContexts(contexts) {
          var _loop_1 = function _loop_1(context) {
            if (isConditionalContextProvider(context)) {
              conditionalProviders = conditionalProviders.filter(function (item) {
                return !isEqual(item, context);
              });
            } else if (isContextPrimitive(context)) {
              globalPrimitives = globalPrimitives.filter(function (item) {
                return !isEqual(item, context);
              });
            } else {}
          };

          for (var _i = 0, contexts_2 = contexts; _i < contexts_2.length; _i++) {
            var context = contexts_2[_i];

            _loop_1(context);
          }
        },
        getApplicableContexts: function getApplicableContexts(event) {
          var builtEvent = event.build();

          if (isEventJson(builtEvent)) {
            var decodedEvent = getDecodedEvent(builtEvent);
            return assembleAllContexts(decodedEvent);
          } else {
            return [];
          }
        }
      };
    }

    exports.contextModule = contextModule;
  }, {
    "./base64": 156,
    "./payload": 159,
    "lodash/compact": 117,
    "lodash/every": 119,
    "lodash/get": 124,
    "lodash/has": 125,
    "lodash/isEqual": 132,
    "lodash/isPlainObject": 137,
    "lodash/map": 143
  }],
  158: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var uuid = require("uuid");

    var payload = require("./payload");

    var contexts_1 = require("./contexts");

    function getTimestamp(tstamp) {
      if (tstamp == null) {
        return {
          type: 'dtm',
          value: new Date().getTime()
        };
      } else if (typeof tstamp === 'number') {
        return {
          type: 'dtm',
          value: tstamp
        };
      } else if (tstamp.type === 'ttm') {
        return {
          type: 'ttm',
          value: tstamp.value
        };
      } else {
        return {
          type: 'dtm',
          value: tstamp.value || new Date().getTime()
        };
      }
    }

    function trackerCore(base64, callback) {
      if (typeof base64 === 'undefined') {
        base64 = true;
      }

      var payloadPairs = {};
      var contextModule = contexts_1.contextModule();

      function getAllContexts(event) {
        return contextModule.getApplicableContexts(event);
      }

      function addPayloadPair(key, value) {
        payloadPairs[key] = value;
      }

      function removeEmptyProperties(eventJson, exemptFields) {
        var ret = {};
        exemptFields = exemptFields || {};

        for (var k in eventJson) {
          if (exemptFields[k] || eventJson[k] !== null && typeof eventJson[k] !== 'undefined') {
            ret[k] = eventJson[k];
          }
        }

        return ret;
      }

      function completeContexts(contexts) {
        if (contexts && contexts.length) {
          return {
            schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
            data: contexts
          };
        }
      }

      function attachGlobalContexts(sb, contexts) {
        var globalContexts = getAllContexts(sb);
        var returnedContexts = [];

        if (contexts && contexts.length) {
          returnedContexts.push.apply(returnedContexts, contexts);
        }

        if (globalContexts && globalContexts.length) {
          returnedContexts.push.apply(returnedContexts, globalContexts);
        }

        return returnedContexts;
      }

      function track(sb, context, tstamp) {
        sb.addDict(payloadPairs);
        sb.add('eid', uuid.v4());
        var timestamp = getTimestamp(tstamp);
        sb.add(timestamp.type, timestamp.value.toString());
        var allContexts = attachGlobalContexts(sb, context);
        var wrappedContexts = completeContexts(allContexts);

        if (wrappedContexts !== undefined) {
          sb.addJson('cx', 'co', wrappedContexts);
        }

        if (typeof callback === 'function') {
          callback(sb);
        }

        return sb;
      }

      function trackSelfDescribingEvent(properties, context, tstamp) {
        var sb = payload.payloadBuilder(base64);
        var ueJson = {
          schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
          data: properties
        };
        sb.add('e', 'ue');
        sb.addJson('ue_px', 'ue_pr', ueJson);
        return track(sb, context, tstamp);
      }

      return {
        setBase64Encoding: function setBase64Encoding(encode) {
          base64 = encode;
        },
        addPayloadPair: addPayloadPair,
        addPayloadDict: function addPayloadDict(dict) {
          for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
              payloadPairs[key] = dict[key];
            }
          }
        },
        resetPayloadPairs: function resetPayloadPairs(dict) {
          payloadPairs = payload.isJson(dict) ? dict : {};
        },
        setTrackerVersion: function setTrackerVersion(version) {
          addPayloadPair('tv', version);
        },
        setTrackerNamespace: function setTrackerNamespace(name) {
          addPayloadPair('tna', name);
        },
        setAppId: function setAppId(appId) {
          addPayloadPair('aid', appId);
        },
        setPlatform: function setPlatform(value) {
          addPayloadPair('p', value);
        },
        setUserId: function setUserId(userId) {
          addPayloadPair('uid', userId);
        },
        setScreenResolution: function setScreenResolution(width, height) {
          addPayloadPair('res', width + 'x' + height);
        },
        setViewport: function setViewport(width, height) {
          addPayloadPair('vp', width + 'x' + height);
        },
        setColorDepth: function setColorDepth(depth) {
          addPayloadPair('cd', depth);
        },
        setTimezone: function setTimezone(timezone) {
          addPayloadPair('tz', timezone);
        },
        setLang: function setLang(lang) {
          addPayloadPair('lang', lang);
        },
        setIpAddress: function setIpAddress(ip) {
          addPayloadPair('ip', ip);
        },
        setUseragent: function setUseragent(useragent) {
          addPayloadPair('ua', useragent);
        },
        trackUnstructEvent: trackSelfDescribingEvent,
        trackSelfDescribingEvent: trackSelfDescribingEvent,
        trackPageView: function trackPageView(pageUrl, pageTitle, referrer, context, tstamp) {
          var sb = payload.payloadBuilder(base64);
          sb.add('e', 'pv');
          sb.add('url', pageUrl);
          sb.add('page', pageTitle);
          sb.add('refr', referrer);
          return track(sb, context, tstamp);
        },
        trackPagePing: function trackPagePing(pageUrl, pageTitle, referrer, minXOffset, maxXOffset, minYOffset, maxYOffset, context, tstamp) {
          var sb = payload.payloadBuilder(base64);
          sb.add('e', 'pp');
          sb.add('url', pageUrl);
          sb.add('page', pageTitle);
          sb.add('refr', referrer);
          sb.add('pp_mix', minXOffset.toString());
          sb.add('pp_max', maxXOffset.toString());
          sb.add('pp_miy', minYOffset.toString());
          sb.add('pp_may', maxYOffset.toString());
          return track(sb, context, tstamp);
        },
        trackStructEvent: function trackStructEvent(category, action, label, property, value, context, tstamp) {
          var sb = payload.payloadBuilder(base64);
          sb.add('e', 'se');
          sb.add('se_ca', category);
          sb.add('se_ac', action);
          sb.add('se_la', label);
          sb.add('se_pr', property);
          sb.add('se_va', value == null ? undefined : value.toString());
          return track(sb, context, tstamp);
        },
        trackEcommerceTransaction: function trackEcommerceTransaction(orderId, affiliation, totalValue, taxValue, shipping, city, state, country, currency, context, tstamp) {
          var sb = payload.payloadBuilder(base64);
          sb.add('e', 'tr');
          sb.add("tr_id", orderId);
          sb.add("tr_af", affiliation);
          sb.add("tr_tt", totalValue);
          sb.add("tr_tx", taxValue);
          sb.add("tr_sh", shipping);
          sb.add("tr_ci", city);
          sb.add("tr_st", state);
          sb.add("tr_co", country);
          sb.add("tr_cu", currency);
          return track(sb, context, tstamp);
        },
        trackEcommerceTransactionItem: function trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, context, tstamp) {
          var sb = payload.payloadBuilder(base64);
          sb.add("e", "ti");
          sb.add("ti_id", orderId);
          sb.add("ti_sk", sku);
          sb.add("ti_nm", name);
          sb.add("ti_ca", category);
          sb.add("ti_pr", price);
          sb.add("ti_qu", quantity);
          sb.add("ti_cu", currency);
          return track(sb, context, tstamp);
        },
        trackScreenView: function trackScreenView(name, id, context, tstamp) {
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
            data: removeEmptyProperties({
              name: name,
              id: id
            })
          }, context, tstamp);
        },
        trackLinkClick: function trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp) {
          var eventJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
            data: removeEmptyProperties({
              targetUrl: targetUrl,
              elementId: elementId,
              elementClasses: elementClasses,
              elementTarget: elementTarget,
              elementContent: elementContent
            })
          };
          return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAdImpression: function trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
          var eventJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/ad_impression/jsonschema/1-0-0',
            data: removeEmptyProperties({
              impressionId: impressionId,
              costModel: costModel,
              cost: cost,
              targetUrl: targetUrl,
              bannerId: bannerId,
              zoneId: zoneId,
              advertiserId: advertiserId,
              campaignId: campaignId
            })
          };
          return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAdClick: function trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp) {
          var eventJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/ad_click/jsonschema/1-0-0',
            data: removeEmptyProperties({
              targetUrl: targetUrl,
              clickId: clickId,
              costModel: costModel,
              cost: cost,
              bannerId: bannerId,
              zoneId: zoneId,
              impressionId: impressionId,
              advertiserId: advertiserId,
              campaignId: campaignId
            })
          };
          return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAdConversion: function trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp) {
          var eventJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/ad_conversion/jsonschema/1-0-0',
            data: removeEmptyProperties({
              conversionId: conversionId,
              costModel: costModel,
              cost: cost,
              category: category,
              action: action,
              property: property,
              initialValue: initialValue,
              advertiserId: advertiserId,
              campaignId: campaignId
            })
          };
          return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackSocialInteraction: function trackSocialInteraction(action, network, target, context, tstamp) {
          var eventJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
            data: removeEmptyProperties({
              action: action,
              network: network,
              target: target
            })
          };
          return trackSelfDescribingEvent(eventJson, context, tstamp);
        },
        trackAddToCart: function trackAddToCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
            data: removeEmptyProperties({
              sku: sku,
              name: name,
              category: category,
              unitPrice: unitPrice,
              quantity: quantity,
              currency: currency
            })
          }, context, tstamp);
        },
        trackRemoveFromCart: function trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
            data: removeEmptyProperties({
              sku: sku,
              name: name,
              category: category,
              unitPrice: unitPrice,
              quantity: quantity,
              currency: currency
            })
          }, context, tstamp);
        },
        trackFormFocusOrChange: function trackFormFocusOrChange(schema, formId, elementId, nodeName, type, elementClasses, value, context, tstamp) {
          var event_schema = '';
          var event_data = {
            formId: formId,
            elementId: elementId,
            nodeName: nodeName,
            elementClasses: elementClasses,
            value: value
          };

          if (schema === 'change_form') {
            event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
            event_data.type = type;
          } else if (schema === 'focus_form') {
            event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
            event_data.elementType = type;
          }

          return trackSelfDescribingEvent({
            schema: event_schema,
            data: removeEmptyProperties(event_data, {
              value: true
            })
          }, context, tstamp);
        },
        trackFormSubmission: function trackFormSubmission(formId, formClasses, elements, context, tstamp) {
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
            data: removeEmptyProperties({
              formId: formId,
              formClasses: formClasses,
              elements: elements
            })
          }, context, tstamp);
        },
        trackSiteSearch: function trackSiteSearch(terms, filters, totalResults, pageResults, context, tstamp) {
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
            data: removeEmptyProperties({
              terms: terms,
              filters: filters,
              totalResults: totalResults,
              pageResults: pageResults
            })
          }, context, tstamp);
        },
        trackConsentWithdrawn: function trackConsentWithdrawn(all, id, version, name, description, context, tstamp) {
          var documentJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
            data: removeEmptyProperties({
              id: id,
              version: version,
              name: name,
              description: description
            })
          };
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
            data: removeEmptyProperties({
              all: all
            })
          }, documentJson.data && context ? context.concat([documentJson]) : context, tstamp);
        },
        trackConsentGranted: function trackConsentGranted(id, version, name, description, expiry, context, tstamp) {
          var documentJson = {
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
            data: removeEmptyProperties({
              id: id,
              version: version,
              name: name,
              description: description
            })
          };
          return trackSelfDescribingEvent({
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
            data: removeEmptyProperties({
              expiry: expiry
            })
          }, context ? context.concat([documentJson]) : [documentJson], tstamp);
        },
        addGlobalContexts: function addGlobalContexts(contexts) {
          contextModule.addGlobalContexts(contexts);
        },
        clearGlobalContexts: function clearGlobalContexts() {
          contextModule.clearGlobalContexts();
        },
        removeGlobalContexts: function removeGlobalContexts(contexts) {
          contextModule.removeGlobalContexts(contexts);
        }
      };
    }

    exports.trackerCore = trackerCore;
  }, {
    "./contexts": 157,
    "./payload": 159,
    "uuid": 161
  }],
  159: [function (require, module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var base64 = require("./base64");

    function base64urlencode(data) {
      if (!data) {
        return data;
      }

      var enc = base64.base64encode(data);
      return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    function isNonEmptyJson(property) {
      if (!isJson(property)) {
        return false;
      }

      for (var key in property) {
        if (property.hasOwnProperty(key)) {
          return true;
        }
      }

      return false;
    }

    exports.isNonEmptyJson = isNonEmptyJson;

    function isJson(property) {
      return typeof property !== 'undefined' && property !== null && (property.constructor === {}.constructor || property.constructor === [].constructor);
    }

    exports.isJson = isJson;

    function payloadBuilder(base64Encode) {
      var dict = {};

      var add = function add(key, value) {
        if (value != null && value !== '') {
          dict[key] = value;
        }
      };

      var addDict = function addDict(dict) {
        for (var key in dict) {
          if (dict.hasOwnProperty(key)) {
            add(key, dict[key]);
          }
        }
      };

      var addJson = function addJson(keyIfEncoded, keyIfNotEncoded, json) {
        if (isNonEmptyJson(json)) {
          var str = JSON.stringify(json);

          if (base64Encode) {
            add(keyIfEncoded, base64urlencode(str));
          } else {
            add(keyIfNotEncoded, str);
          }
        }
      };

      return {
        add: add,
        addDict: addDict,
        addJson: addJson,
        build: function build() {
          return dict;
        }
      };
    }

    exports.payloadBuilder = payloadBuilder;
  }, {
    "./base64": 156
  }],
  160: [function (require, module, exports) {
    (function (global) {
      var rng;
      var crypto = global.crypto || global.msCrypto; // for IE 11

      if (crypto && crypto.getRandomValues) {
        // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
        // Moderately fast, high quality
        var _rnds8 = new Uint8Array(16);

        rng = function whatwgRNG() {
          crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
      }

      if (!rng) {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        var _rnds = new Array(16);

        rng = function rng() {
          for (var i = 0, r; i < 16; i++) {
            if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
            _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
          }

          return _rnds;
        };
      }

      module.exports = rng;
    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
  }, {}],
  161: [function (require, module, exports) {
    //     uuid.js
    //
    //     Copyright (c) 2010-2012 Robert Kieffer
    //     MIT License - http://opensource.org/licenses/mit-license.php
    // Unique ID creation requires a high quality random # generator.  We feature
    // detect to determine the best RNG source, normalizing to a function that
    // returns 128-bits of randomness, since that's what's usually required
    var _rng = require('./rng'); // Maps for number <-> hex string conversion


    var _byteToHex = [];
    var _hexToByte = {};

    for (var i = 0; i < 256; i++) {
      _byteToHex[i] = (i + 0x100).toString(16).substr(1);
      _hexToByte[_byteToHex[i]] = i;
    } // **`parse()` - Parse a UUID into it's component bytes**


    function parse(s, buf, offset) {
      var i = buf && offset || 0,
          ii = 0;
      buf = buf || [];
      s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
        if (ii < 16) {
          // Don't overflow!
          buf[i + ii++] = _hexToByte[oct];
        }
      }); // Zero out remaining bytes if string was short

      while (ii < 16) {
        buf[i + ii++] = 0;
      }

      return buf;
    } // **`unparse()` - Convert UUID byte array (ala parse()) into a string**


    function unparse(buf, offset) {
      var i = offset || 0,
          bth = _byteToHex;
      return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
    } // **`v1()` - Generate time-based UUID**
    //
    // Inspired by https://github.com/LiosK/UUID.js
    // and http://docs.python.org/library/uuid.html
    // random #'s we need to init node and clockseq


    var _seedBytes = _rng(); // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)


    var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]]; // Per 4.2.2, randomize (14 bit) clockseq

    var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff; // Previous uuid creation time


    var _lastMSecs = 0,
        _lastNSecs = 0; // See https://github.com/broofa/node-uuid for API details

    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // UUID timestamps are 100 nano-second units since the Gregorian epoch,
      // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
      // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
      // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.

      var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
      // cycle to simulate higher resolution clock

      var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

      if (dt < 0 && options.clockseq === undefined) {
        clockseq = clockseq + 1 & 0x3fff;
      } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
      // time interval


      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
      } // Per 4.2.1.2 Throw error if too many uuids are requested


      if (nsecs >= 10000) {
        throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
      }

      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

      msecs += 12219292800000; // `time_low`

      var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
      b[i++] = tl >>> 24 & 0xff;
      b[i++] = tl >>> 16 & 0xff;
      b[i++] = tl >>> 8 & 0xff;
      b[i++] = tl & 0xff; // `time_mid`

      var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
      b[i++] = tmh >>> 8 & 0xff;
      b[i++] = tmh & 0xff; // `time_high_and_version`

      b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

      b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

      b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

      b[i++] = clockseq & 0xff; // `node`

      var node = options.node || _nodeId;

      for (var n = 0; n < 6; n++) {
        b[i + n] = node[n];
      }

      return buf ? buf : unparse(b);
    } // **`v4()` - Generate random UUID**
    // See https://github.com/broofa/node-uuid for API details


    function v4(options, buf, offset) {
      // Deprecated - 'format' argument, as supported in v1.2
      var i = buf && offset || 0;

      if (typeof options == 'string') {
        buf = options == 'binary' ? new Array(16) : null;
        options = null;
      }

      options = options || {};

      var rnds = options.random || (options.rng || _rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        for (var ii = 0; ii < 16; ii++) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || unparse(rnds);
    } // Export public API


    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    uuid.parse = parse;
    uuid.unparse = unparse;
    module.exports = uuid;
  }, {
    "./rng": 160
  }],
  162: [function (require, module, exports) {
    var v1 = require('./v1');

    var v4 = require('./v4');

    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    module.exports = uuid;
  }, {
    "./v1": 165,
    "./v4": 166
  }],
  163: [function (require, module, exports) {
    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

      return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
    }

    module.exports = bytesToUuid;
  }, {}],
  164: [function (require, module, exports) {
    // Unique ID creation requires a high quality random # generator.  In the
    // browser this is a little complicated due to unknown quality of Math.random()
    // and inconsistent support for the `crypto` API.  We do the best we can via
    // feature-detection
    // getRandomValues needs to be invoked in a context where "this" is a Crypto
    // implementation. Also, find the complete implementation of crypto on IE11.
    var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (getRandomValues) {
      // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
      var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

      module.exports = function whatwgRNG() {
        getRandomValues(rnds8);
        return rnds8;
      };
    } else {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var rnds = new Array(16);

      module.exports = function mathRNG() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
          rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return rnds;
      };
    }
  }, {}],
  165: [function (require, module, exports) {
    var rng = require('./lib/rng');

    var bytesToUuid = require('./lib/bytesToUuid'); // **`v1()` - Generate time-based UUID**
    //
    // Inspired by https://github.com/LiosK/UUID.js
    // and http://docs.python.org/library/uuid.html


    var _nodeId;

    var _clockseq; // Previous uuid creation time


    var _lastMSecs = 0;
    var _lastNSecs = 0; // See https://github.com/broofa/node-uuid for API details

    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var node = options.node || _nodeId;
      var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
      // specified.  We do this lazily to minimize issues related to insufficient
      // system entropy.  See #189

      if (node == null || clockseq == null) {
        var seedBytes = rng();

        if (node == null) {
          // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
          node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        }

        if (clockseq == null) {
          // Per 4.2.2, randomize (14 bit) clockseq
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
        }
      } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
      // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
      // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
      // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


      var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
      // cycle to simulate higher resolution clock

      var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

      if (dt < 0 && options.clockseq === undefined) {
        clockseq = clockseq + 1 & 0x3fff;
      } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
      // time interval


      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
      } // Per 4.2.1.2 Throw error if too many uuids are requested


      if (nsecs >= 10000) {
        throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
      }

      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

      msecs += 12219292800000; // `time_low`

      var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
      b[i++] = tl >>> 24 & 0xff;
      b[i++] = tl >>> 16 & 0xff;
      b[i++] = tl >>> 8 & 0xff;
      b[i++] = tl & 0xff; // `time_mid`

      var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
      b[i++] = tmh >>> 8 & 0xff;
      b[i++] = tmh & 0xff; // `time_high_and_version`

      b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

      b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

      b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

      b[i++] = clockseq & 0xff; // `node`

      for (var n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }

      return buf ? buf : bytesToUuid(b);
    }

    module.exports = v1;
  }, {
    "./lib/bytesToUuid": 163,
    "./lib/rng": 164
  }],
  166: [function (require, module, exports) {
    var rng = require('./lib/rng');

    var bytesToUuid = require('./lib/bytesToUuid');

    function v4(options, buf, offset) {
      var i = buf && offset || 0;

      if (typeof options == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
      }

      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || bytesToUuid(rnds);
    }

    module.exports = v4;
  }, {
    "./lib/bytesToUuid": 163,
    "./lib/rng": 164
  }],
  167: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: tracker.js
     *
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright
     * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     * * Redistributions of source code must retain the above copyright
     *   notice, this list of conditions and the following disclaimer.
     *
     * * Redistributions in binary form must reproduce the above copyright
     *   notice, this list of conditions and the following disclaimer in the
     *   documentation and/or other materials provided with the distribution.
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    var isFunction = require('lodash/isFunction'),
        helpers = require('./lib/helpers'),
        object = typeof exports !== 'undefined' ? exports : this,
        windowAlias = window;

    object.errorManager = function (core) {
      /**
       * Send error as self-describing event
       *
       * @param message string Message appeared in console
       * @param filename string Source file (not used)
       * @param lineno number Line number
       * @param colno number Column number (not used)
       * @param error Error error object (not present in all browsers)
       * @param contexts Array of custom contexts
       */
      function track(message, filename, lineno, colno, error, contexts) {
        var stack = error && error.stack ? error.stack : null;
        core.trackSelfDescribingEvent({
          schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
          data: {
            programmingLanguage: "JAVASCRIPT",
            message: message || "JS Exception. Browser doesn't support ErrorEvent API",
            stackTrace: stack,
            lineNumber: lineno,
            lineColumn: colno,
            fileName: filename
          }
        }, contexts);
      }
      /**
       * Attach custom contexts using `contextAdder`
       *
       * 
       * @param contextsAdder function to get details from internal browser state
       * @returns {Array} custom contexts
       */


      function sendError(errorEvent, commonContexts, contextsAdder) {
        var contexts;

        if (isFunction(contextsAdder)) {
          contexts = commonContexts.concat(contextsAdder(errorEvent));
        } else {
          contexts = commonContexts;
        }

        track(errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error, contexts);
      }

      return {
        /**
         * Track unhandled exception.
         * This method supposed to be used inside try/catch block or with window.onerror
         * (contexts won't be attached), but NOT with `addEventListener` - use
         * `enableErrorTracker` for this
         *
         * @param message string Message appeared in console
         * @param filename string Source file (not used)
         * @param lineno number Line number
         * @param colno number Column number (not used)
         * @param error Error error object (not present in all browsers)
         * @param contexts Array of custom contexts
         */
        trackError: track,

        /**
               * Curried function to enable tracking of unhandled exceptions.
         * Listen for `error` event and
         *
         * @param filter Function ErrorEvent => Bool to check whether error should be tracker
         * @param contextsAdder Function ErrorEvent => Array<Context> to add custom contexts with
         *                     internal state based on particular error
         */
        enableErrorTracking: function enableErrorTracking(filter, contextsAdder, contexts) {
          /**
           * Closure callback to filter, contextualize and track unhandled exceptions
           *
           * @param errorEvent ErrorEvent passed to event listener
           */
          function captureError(errorEvent) {
            if (isFunction(filter) && filter(errorEvent) || filter == null) {
              sendError(errorEvent, contexts, contextsAdder);
            }
          }

          helpers.addEventListener(windowAlias, 'error', captureError, true);
        }
      };
    };
  }, {
    "./lib/helpers": 173,
    "lodash/isFunction": 133
  }],
  168: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: forms.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    var forEach = require('lodash/forEach'),
        filter = require('lodash/filter'),
        find = require('lodash/find'),
        helpers = require('./lib/helpers'),
        object = typeof exports !== 'undefined' ? exports : this;
    /**
     * Object for handling automatic form tracking
     *
     * @param object core The tracker core
     * @param string trackerId Unique identifier for the tracker instance, used to mark tracked elements
     * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
     * @return object formTrackingManager instance
     */


    object.getFormTrackingManager = function (core, trackerId, contextAdder) {
      // Tag names of mutable elements inside a form
      var innerElementTags = ['textarea', 'input', 'select']; // Used to mark elements with event listeners

      var trackingMarker = trackerId + 'form'; // Filter to determine which forms should be tracked

      var formFilter = function formFilter() {
        return true;
      }; // Filter to determine which form fields should be tracked


      var fieldFilter = function fieldFilter() {
        return true;
      }; // Default function applied to all elements, optionally overridden by transform field


      var fieldTransform = function fieldTransform(x) {
        return x;
      };
      /*
       * Get an identifier for a form, input, textarea, or select element
       */


      function getFormElementName(elt) {
        return elt[find(['name', 'id', 'type', 'nodeName'], function (propName) {
          // If elt has a child whose name is "id", that element will be returned
          // instead of the actual id of elt unless we ensure that a string is returned
          return elt[propName] && typeof elt[propName] === 'string';
        })];
      }
      /*
       * Identifies the parent form in which an element is contained
       */


      function getParentFormName(elt) {
        while (elt && elt.nodeName && elt.nodeName.toUpperCase() !== 'HTML' && elt.nodeName.toUpperCase() !== 'FORM') {
          elt = elt.parentNode;
        }

        if (elt && elt.nodeName && elt.nodeName.toUpperCase() === 'FORM') {
          return getFormElementName(elt);
        }
      }
      /*
       * Returns a list of the input, textarea, and select elements inside a form along with their values
       */


      function getInnerFormElements(elt) {
        var innerElements = [];
        forEach(innerElementTags, function (tagname) {
          var trackedChildren = filter(elt.getElementsByTagName(tagname), function (child) {
            return child.hasOwnProperty(trackingMarker);
          });
          forEach(trackedChildren, function (child) {
            if (child.type === 'submit') {
              return;
            }

            var elementJson = {
              name: getFormElementName(child),
              value: child.value,
              nodeName: child.nodeName
            };

            if (child.type && child.nodeName.toUpperCase() === 'INPUT') {
              elementJson.type = child.type;
            }

            if ((child.type === 'checkbox' || child.type === 'radio') && !child.checked) {
              elementJson.value = null;
            }

            innerElements.push(elementJson);
          });
        });
        return innerElements;
      }
      /*
       * Return function to handle form field change event
       */


      function getFormChangeListener(event_type, context) {
        return function (e) {
          var elt = e.target;
          var type = elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT' ? elt.type : null;
          var value = elt.type === 'checkbox' && !elt.checked ? null : fieldTransform(elt.value);

          if (event_type === 'change_form' || type !== 'checkbox' && type !== 'radio') {
            core.trackFormFocusOrChange(event_type, getParentFormName(elt), getFormElementName(elt), elt.nodeName, type, helpers.getCssClasses(elt), value, contextAdder(helpers.resolveDynamicContexts(context, elt, type, value)));
          }
        };
      }
      /*
       * Return function to handle form submission event
       */


      function getFormSubmissionListener(context) {
        return function (e) {
          var elt = e.target;
          var innerElements = getInnerFormElements(elt);
          forEach(innerElements, function (innerElement) {
            innerElement.value = fieldTransform(innerElement.value);
          });
          core.trackFormSubmission(getFormElementName(elt), helpers.getCssClasses(elt), innerElements, contextAdder(helpers.resolveDynamicContexts(context, elt, innerElements)));
        };
      }

      return {
        /*
         * Configures form tracking: which forms and fields will be tracked, and the context to attach
         */
        configureFormTracking: function configureFormTracking(config) {
          if (config) {
            formFilter = helpers.getFilter(config.forms, true);
            fieldFilter = helpers.getFilter(config.fields, false);
            fieldTransform = helpers.getTransform(config.fields);
          }
        },

        /*
         * Add submission event listeners to all form elements
         * Add value change event listeners to all mutable inner form elements
         */
        addFormListeners: function addFormListeners(context) {
          forEach(document.getElementsByTagName('form'), function (form) {
            if (formFilter(form) && !form[trackingMarker]) {
              forEach(innerElementTags, function (tagname) {
                forEach(form.getElementsByTagName(tagname), function (innerElement) {
                  if (fieldFilter(innerElement) && !innerElement[trackingMarker] && innerElement.type.toLowerCase() !== 'password') {
                    helpers.addEventListener(innerElement, 'focus', getFormChangeListener('focus_form', context), false);
                    helpers.addEventListener(innerElement, 'change', getFormChangeListener('change_form', context), false);
                    innerElement[trackingMarker] = true;
                  }
                });
              });
              helpers.addEventListener(form, 'submit', getFormSubmissionListener(context));
              form[trackingMarker] = true;
            }
          });
        }
      };
    };
  }, {
    "./lib/helpers": 173,
    "lodash/filter": 120,
    "lodash/find": 121,
    "lodash/forEach": 123
  }],
  169: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: tracker.js
     *
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright
     * 2012-2018 Snowplow Analytics Ltd. All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     * * Redistributions of source code must retain the above copyright
     *   notice, this list of conditions and the following disclaimer.
     *
     * * Redistributions in binary form must reproduce the above copyright
     *   notice, this list of conditions and the following disclaimer in the
     *   documentation and/or other materials provided with the distribution.
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    var object = typeof exports !== 'undefined' ? exports : this;

    var makeSafe = function makeSafe(fn) {
      return function () {
        try {
          return fn.apply(this, arguments);
        } catch (ex) {// TODO: Debug mode
        }
      };
    };

    exports.productionize = function (methods) {
      var safeMethods = {};

      if (_typeof(methods) === 'object' && methods !== null) {
        Object.getOwnPropertyNames(methods).forEach(function (val, idx, array) {
          if (typeof methods[val] === 'function') {
            safeMethods[val] = makeSafe(methods[val]);
          }
        });
      }

      return safeMethods;
    };
  }, {}],
  170: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: queue.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var map = require('lodash/map'),
          isUndefined = require('lodash/isUndefined'),
          isFunction = require('lodash/isFunction'),
          helpers = require('./lib/helpers'),
          object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

      /************************************************************
       * Proxy object
       * - this allows the caller to continue push()'ing to _snaq
       *   after the Tracker has been initialized and loaded
       ************************************************************/


      object.InQueueManager = function (TrackerConstructor, version, mutSnowplowState, asyncQueue, functionName) {
        // Page view ID should be shared between all tracker instances
        var trackerDictionary = {};
        /**
         * Get an array of trackers to which a function should be applied.
         *
         * @param array names List of namespaces to use. If empty, use all namespaces.
         */

        function getNamedTrackers(names) {
          var namedTrackers = [];

          if (!names || names.length === 0) {
            namedTrackers = map(trackerDictionary);
          } else {
            for (var i = 0; i < names.length; i++) {
              if (trackerDictionary.hasOwnProperty(names[i])) {
                namedTrackers.push(trackerDictionary[names[i]]);
              } else {
                helpers.warn('Warning: Tracker namespace "' + names[i] + '" not configured');
              }
            }
          }

          if (namedTrackers.length === 0) {
            helpers.warn('Warning: No tracker configured');
          }

          return namedTrackers;
        }
        /**
         * Legacy support for input of the form _snaq.push(['setCollectorCf', 'd34uzc5hjrimh8'])
         * 
         * @param string f Either 'setCollectorCf' or 'setCollectorUrl'
         * @param string endpoint
         * @param string namespace Optional tracker name
         * 
         * TODO: remove this in 2.1.0
         */


        function legacyCreateNewNamespace(f, endpoint, namespace) {
          helpers.warn(f + ' is deprecated. Set the collector when a new tracker instance using newTracker.');
          var name;

          if (isUndefined(namespace)) {
            name = 'sp';
          } else {
            name = namespace;
          }

          createNewNamespace(name);
          trackerDictionary[name][f](endpoint);
        }
        /**
         * Initiate a new tracker namespace
         *
         * @param string namespace
         * @param string endpoint Of the form d3rkrsqld9gmqf.cloudfront.net
         */


        function createNewNamespace(namespace, endpoint, argmap) {
          argmap = argmap || {};

          if (!trackerDictionary.hasOwnProperty(namespace)) {
            trackerDictionary[namespace] = new TrackerConstructor(functionName, namespace, version, mutSnowplowState, argmap);
            trackerDictionary[namespace].setCollectorUrl(endpoint);
          } else {
            helpers.warn('Tracker namespace ' + namespace + ' already exists.');
          }
        }
        /**
         * Output an array of the form ['functionName', [trackerName1, trackerName2, ...]]
         *
         * @param string inputString
         */


        function parseInputString(inputString) {
          var separatedString = inputString.split(':'),
              extractedFunction = separatedString[0],
              extractedNames = separatedString.length > 1 ? separatedString[1].split(';') : [];
          return [extractedFunction, extractedNames];
        }
        /**
         * apply wrapper
         *
         * @param array parameterArray An array comprising either:
         *      [ 'methodName', optional_parameters ]
         * or:
         *      [ functionObject, optional_parameters ]
         */


        function applyAsyncFunction() {
          var i, j, f, parameterArray, input, parsedString, names, namedTrackers; // Outer loop in case someone push'es in zarg of arrays

          for (i = 0; i < arguments.length; i += 1) {
            parameterArray = arguments[i]; // Arguments is not an array, so we turn it into one

            input = Array.prototype.shift.call(parameterArray); // Custom callback rather than tracker method, called with trackerDictionary as the context

            if (isFunction(input)) {
              input.apply(trackerDictionary, parameterArray);
              continue;
            }

            parsedString = parseInputString(input);
            f = parsedString[0];
            names = parsedString[1];

            if (f === 'newTracker') {
              createNewNamespace(parameterArray[0], parameterArray[1], parameterArray[2]);
              continue;
            }

            if ((f === 'setCollectorCf' || f === 'setCollectorUrl') && (!names || names.length === 0)) {
              legacyCreateNewNamespace(f, parameterArray[0], parameterArray[1]);
              continue;
            }

            namedTrackers = getNamedTrackers(names);

            for (j = 0; j < namedTrackers.length; j++) {
              namedTrackers[j][f].apply(namedTrackers[j], parameterArray);
            }
          }
        } // We need to manually apply any events collected before this initialization


        for (var i = 0; i < asyncQueue.length; i++) {
          applyAsyncFunction(asyncQueue[i]);
        }

        return {
          push: applyAsyncFunction
        };
      };
    })();
  }, {
    "./lib/helpers": 173,
    "lodash/isFunction": 133,
    "lodash/isUndefined": 141,
    "lodash/map": 143
  }],
  171: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: init.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    // Snowplow Asynchronous Queue

    /*
     * Get the name of the global input function
     */
    var snowplow = require('./snowplow'),
        queueName,
        queue,
        windowAlias = window;

    if (windowAlias.GlobalSnowplowNamespace && windowAlias.GlobalSnowplowNamespace.length > 0) {
      queueName = windowAlias.GlobalSnowplowNamespace.shift();
      queue = windowAlias[queueName];
      queue.q = new snowplow.Snowplow(queue.q, queueName);
    } else {
      windowAlias._snaq = windowAlias._snaq || [];
      windowAlias._snaq = new snowplow.Snowplow(windowAlias._snaq, '_snaq');
    }
  }, {
    "./snowplow": 177
  }],
  172: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: detectors.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var isFunction = require('lodash/isFunction'),
          isUndefined = require('lodash/isUndefined'),
          murmurhash3_32_gc = require('murmurhash').v3,
          tz = require('jstimezonedetect').jstz.determine(),
          cookie = require('browser-cookie-lite'),
          object = typeof exports !== 'undefined' ? exports : this,
          // For eventual node.js environment support
      windowAlias = window,
          navigatorAlias = navigator,
          screenAlias = screen,
          documentAlias = document;
      /*
       * Checks whether sessionStorage is available, in a way that
       * does not throw a SecurityError in Firefox if "always ask"
       * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
       */


      object.hasSessionStorage = function () {
        try {
          return !!windowAlias.sessionStorage;
        } catch (e) {
          return true; // SecurityError when referencing it means it exists
        }
      };
      /*
       * Checks whether localStorage is available, in a way that
       * does not throw a SecurityError in Firefox if "always ask"
       * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
       */


      object.hasLocalStorage = function () {
        try {
          return !!windowAlias.localStorage;
        } catch (e) {
          return true; // SecurityError when referencing it means it exists
        }
      };
      /*
       * Checks whether localStorage is accessible
       * sets and removes an item to handle private IOS5 browsing
       * (http://git.io/jFB2Xw)
       */


      object.localStorageAccessible = function () {
        var mod = 'modernizr';

        if (!object.hasLocalStorage()) {
          return false;
        }

        try {
          windowAlias.localStorage.setItem(mod, mod);
          windowAlias.localStorage.removeItem(mod);
          return true;
        } catch (e) {
          return false;
        }
      };
      /*
       * Does browser have cookies enabled (for this site)?
       */


      object.hasCookies = function (testCookieName) {
        var cookieName = testCookieName || 'testcookie';

        if (isUndefined(navigatorAlias.cookieEnabled)) {
          cookie.cookie(cookieName, '1');
          return cookie.cookie(cookieName) === '1' ? '1' : '0';
        }

        return navigatorAlias.cookieEnabled ? '1' : '0';
      };
      /**
       * JS Implementation for browser fingerprint.
       * Does not require any external resources.
       * Based on https://github.com/carlo/jquery-browser-fingerprint
       * @return {number} 32-bit positive integer hash 
       */


      object.detectSignature = function (hashSeed) {
        var fingerprint = [navigatorAlias.userAgent, [screenAlias.height, screenAlias.width, screenAlias.colorDepth].join("x"), new Date().getTimezoneOffset(), object.hasSessionStorage(), object.hasLocalStorage()];
        var plugins = [];

        if (navigatorAlias.plugins) {
          for (var i = 0; i < navigatorAlias.plugins.length; i++) {
            if (navigatorAlias.plugins[i]) {
              var mt = [];

              for (var j = 0; j < navigatorAlias.plugins[i].length; j++) {
                mt.push([navigatorAlias.plugins[i][j].type, navigatorAlias.plugins[i][j].suffixes]);
              }

              plugins.push([navigatorAlias.plugins[i].name + "::" + navigatorAlias.plugins[i].description, mt.join("~")]);
            }
          }
        }

        return murmurhash3_32_gc(fingerprint.join("###") + "###" + plugins.sort().join(";"), hashSeed);
      };
      /*
       * Returns visitor timezone
       */


      object.detectTimezone = function () {
        return typeof tz === 'undefined' ? '' : tz.name();
      };
      /**
       * Gets the current viewport.
       *
       * Code based on:
       * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
       * - http://responsejs.com/labs/dimensions/
       */


      object.detectViewport = function () {
        var e = windowAlias,
            a = 'inner';

        if (!('innerWidth' in windowAlias)) {
          a = 'client';
          e = documentAlias.documentElement || documentAlias.body;
        }

        var width = e[a + 'Width'];
        var height = e[a + 'Height'];

        if (width >= 0 && height >= 0) {
          return width + 'x' + height;
        } else {
          return null;
        }
      };
      /**
       * Gets the dimensions of the current
       * document.
       *
       * Code based on:
       * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
       */


      object.detectDocumentSize = function () {
        var de = documentAlias.documentElement,
            // Alias
        be = documentAlias.body,
            // document.body may not have rendered, so check whether be.offsetHeight is null
        bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;
        var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
        var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight);
        return isNaN(w) || isNaN(h) ? '' : w + 'x' + h;
      };
      /**
       * Returns browser features (plugins, resolution, cookies)
       *
       * @param boolean useCookies Whether to test for cookies
       * @param string testCookieName Name to use for the test cookie
       * @return Object containing browser features
       */


      object.detectBrowserFeatures = function (useCookies, testCookieName) {
        var i,
            mimeType,
            pluginMap = {
          // document types
          pdf: 'application/pdf',
          // media players
          qt: 'video/quicktime',
          realp: 'audio/x-pn-realaudio-plugin',
          wma: 'application/x-mplayer2',
          // interactive multimedia
          dir: 'application/x-director',
          fla: 'application/x-shockwave-flash',
          // RIA
          java: 'application/x-java-vm',
          gears: 'application/x-googlegears',
          ag: 'application/x-silverlight'
        },
            features = {}; // General plugin detection

        if (navigatorAlias.mimeTypes && navigatorAlias.mimeTypes.length) {
          for (i in pluginMap) {
            if (Object.prototype.hasOwnProperty.call(pluginMap, i)) {
              mimeType = navigatorAlias.mimeTypes[pluginMap[i]];
              features[i] = mimeType && mimeType.enabledPlugin ? '1' : '0';
            }
          }
        } // Safari and Opera
        // IE6/IE7 navigator.javaEnabled can't be aliased, so test directly


        if (navigatorAlias.constructor === window.Navigator && typeof navigatorAlias.javaEnabled !== 'unknown' && !isUndefined(navigatorAlias.javaEnabled) && navigatorAlias.javaEnabled()) {
          features.java = '1';
        } // Firefox


        if (isFunction(windowAlias.GearsFactory)) {
          features.gears = '1';
        } // Other browser features


        features.res = screenAlias.width + 'x' + screenAlias.height;
        features.cd = screenAlias.colorDepth;

        if (useCookies) {
          features.cookie = object.hasCookies(testCookieName);
        }

        return features;
      };
    })();
  }, {
    "browser-cookie-lite": 1,
    "jstimezonedetect": 4,
    "lodash/isFunction": 133,
    "lodash/isUndefined": 141,
    "murmurhash": 153
  }],
  173: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: Snowplow.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var filter = require('lodash/filter'),
          isString = require('lodash/isString'),
          isUndefined = require('lodash/isUndefined'),
          isObject = require('lodash/isObject'),
          map = require('lodash/map'),
          cookie = require('browser-cookie-lite'),
          object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

      /**
       * Cleans up the page title
       */


      object.fixupTitle = function (title) {
        if (!isString(title)) {
          title = title.text || '';
          var tmp = document.getElementsByTagName('title');

          if (tmp && !isUndefined(tmp[0])) {
            title = tmp[0].text;
          }
        }

        return title;
      };
      /**
       * Extract hostname from URL
       */


      object.getHostName = function (url) {
        // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
        var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
            matches = e.exec(url);
        return matches ? matches[1] : url;
      };
      /**
       * Fix-up domain
       */


      object.fixupDomain = function (domain) {
        var dl = domain.length; // remove trailing '.'

        if (domain.charAt(--dl) === '.') {
          domain = domain.slice(0, dl);
        } // remove leading '*'


        if (domain.slice(0, 2) === '*.') {
          domain = domain.slice(1);
        }

        return domain;
      };
      /**
       * Get page referrer. In the case of a single-page app,
       * if the URL changes without the page reloading, pass
       * in the old URL. It will be returned unless overriden
       * by a "refer(r)er" parameter in the querystring.
       *
       * @param string oldLocation Optional.
       * @return string The referrer
       */


      object.getReferrer = function (oldLocation) {
        var referrer = '';
        var fromQs = object.fromQuerystring('referrer', window.location.href) || object.fromQuerystring('referer', window.location.href); // Short-circuit

        if (fromQs) {
          return fromQs;
        } // In the case of a single-page app, return the old URL


        if (oldLocation) {
          return oldLocation;
        }

        try {
          referrer = window.top.document.referrer;
        } catch (e) {
          if (window.parent) {
            try {
              referrer = window.parent.document.referrer;
            } catch (e2) {
              referrer = '';
            }
          }
        }

        if (referrer === '') {
          referrer = document.referrer;
        }

        return referrer;
      };
      /**
       * Cross-browser helper function to add event handler
       */


      object.addEventListener = function (element, eventType, eventHandler, useCapture) {
        if (element.addEventListener) {
          element.addEventListener(eventType, eventHandler, useCapture);
          return true;
        }

        if (element.attachEvent) {
          return element.attachEvent('on' + eventType, eventHandler);
        }

        element['on' + eventType] = eventHandler;
      };
      /**
       * Return value from name-value pair in querystring 
       */


      object.fromQuerystring = function (field, url) {
        var match = new RegExp('^[^#]*[?&]' + field + '=([^&#]*)').exec(url);

        if (!match) {
          return null;
        }

        return decodeURIComponent(match[1].replace(/\+/g, ' '));
      };
      /*
       * Find dynamic context generating functions and merge their results into the static contexts
       * Combine an array of unchanging contexts with the result of a context-creating function
       *
       * @param {(object|function(...*): ?object)[]} dynamicOrStaticContexts Array of custom context Objects or custom context generating functions
       * @param {...*} Parameters to pass to dynamic callbacks
       */


      object.resolveDynamicContexts = function (dynamicOrStaticContexts) {
        var params = Array.prototype.slice.call(arguments, 1);
        return filter(map(dynamicOrStaticContexts, function (context) {
          if (typeof context === 'function') {
            try {
              return context.apply(null, params);
            } catch (e) {//TODO: provide warning
            }
          } else {
            return context;
          }
        }));
      };
      /**
       * Only log deprecation warnings if they won't cause an error
       */


      object.warn = function (message) {
        if (typeof console !== 'undefined') {
          console.warn('Snowplow: ' + message);
        }
      };
      /**
       * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
       */


      object.getCssClasses = function (elt) {
        return elt.className.match(/\S+/g) || [];
      };
      /**
       * Check whether an element has at least one class from a given list
       */


      function checkClass(elt, classList) {
        var classes = object.getCssClasses(elt),
            i;

        for (i = 0; i < classes.length; i++) {
          if (classList[classes[i]]) {
            return true;
          }
        }

        return false;
      }
      /**
       * Convert a criterion object to a filter function
       *
       * @param object criterion Either {whitelist: [array of allowable strings]}
       *                             or {blacklist: [array of allowable strings]}
       *                             or {filter: function (elt) {return whether to track the element}
       * @param boolean byClass Whether to whitelist/blacklist based on an element's classes (for forms)
       *                        or name attribute (for fields)
       */


      object.getFilter = function (criterion, byClass) {
        // If the criterion argument is not an object, add listeners to all elements
        if (Array.isArray(criterion) || !isObject(criterion)) {
          return function () {
            return true;
          };
        }

        if (criterion.hasOwnProperty('filter')) {
          return criterion.filter;
        } else {
          var inclusive = criterion.hasOwnProperty('whitelist');
          var specifiedClasses = criterion.whitelist || criterion.blacklist;

          if (!Array.isArray(specifiedClasses)) {
            specifiedClasses = [specifiedClasses];
          } // Convert the array of classes to an object of the form {class1: true, class2: true, ...}


          var specifiedClassesSet = {};

          for (var i = 0; i < specifiedClasses.length; i++) {
            specifiedClassesSet[specifiedClasses[i]] = true;
          }

          if (byClass) {
            return function (elt) {
              return checkClass(elt, specifiedClassesSet) === inclusive;
            };
          } else {
            return function (elt) {
              return elt.name in specifiedClassesSet === inclusive;
            };
          }
        }
      };
      /**
       * Convert a criterion object to a transform function
       *
       * @param object criterion {transform: function (elt) {return the result of transform function applied to element}
       */


      object.getTransform = function (criterion) {
        if (!isObject(criterion)) {
          return function (x) {
            return x;
          };
        }

        if (criterion.hasOwnProperty('transform')) {
          return criterion.transform;
        } else {
          return function (x) {
            return x;
          };
        }

        return function (x) {
          return x;
        };
      };
      /**
       * Add a name-value pair to the querystring of a URL
       *
       * @param string url URL to decorate
       * @param string name Name of the querystring pair
       * @param string value Value of the querystring pair
       */


      object.decorateQuerystring = function (url, name, value) {
        var initialQsParams = name + '=' + value;
        var hashSplit = url.split('#');
        var qsSplit = hashSplit[0].split('?');
        var beforeQuerystring = qsSplit.shift(); // Necessary because a querystring may contain multiple question marks

        var querystring = qsSplit.join('?');

        if (!querystring) {
          querystring = initialQsParams;
        } else {
          // Whether this is the first time the link has been decorated
          var initialDecoration = true;
          var qsFields = querystring.split('&');

          for (var i = 0; i < qsFields.length; i++) {
            if (qsFields[i].substr(0, name.length + 1) === name + '=') {
              initialDecoration = false;
              qsFields[i] = initialQsParams;
              querystring = qsFields.join('&');
              break;
            }
          }

          if (initialDecoration) {
            querystring = initialQsParams + '&' + querystring;
          }
        }

        hashSplit[0] = beforeQuerystring + '?' + querystring;
        return hashSplit.join('#');
      };
      /**
       * Attempt to get a value from localStorage
       *
       * @param string key
       * @return string The value obtained from localStorage, or
       *                undefined if localStorage is inaccessible
       */


      object.attemptGetLocalStorage = function (key) {
        try {
          var exp = localStorage.getItem(key + '.expires');

          if (exp === null || +exp > Date.now()) {
            return localStorage.getItem(key);
          } else {
            localStorage.removeItem(key);
            localStorage.removeItem(key + '.expires');
          }

          return undefined;
        } catch (e) {}
      };
      /**
       * Attempt to write a value to localStorage
       *
       * @param string key
       * @param string value
       * @param number ttl Time to live in seconds, defaults to 2 years from Date.now()
       * @return boolean Whether the operation succeeded
       */


      object.attemptWriteLocalStorage = function (key, value) {
        var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 63072000;

        try {
          var t = Date.now() + ttl * 1000;
          localStorage.setItem("".concat(key, ".expires"), t);
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          return false;
        }
      };
      /**
       * Finds the root domain
       */


      object.findRootDomain = function () {
        var cookiePrefix = '_sp_root_domain_test_';
        var cookieName = cookiePrefix + new Date().getTime();
        var cookieValue = '_test_value_' + new Date().getTime();
        var split = window.location.hostname.split('.');
        var position = split.length - 1;

        while (position >= 0) {
          var currentDomain = split.slice(position, split.length).join('.');
          cookie.cookie(cookieName, cookieValue, 0, '/', currentDomain);

          if (cookie.cookie(cookieName) === cookieValue) {
            // Clean up created cookie(s)
            object.deleteCookie(cookieName, currentDomain);
            var cookieNames = object.getCookiesWithPrefix(cookiePrefix);

            for (var i = 0; i < cookieNames.length; i++) {
              object.deleteCookie(cookieNames[i], currentDomain);
            }

            return currentDomain;
          }

          position -= 1;
        } // Cookies cannot be read


        return window.location.hostname;
      };
      /**
       * Checks whether a value is present within an array
       *
       * @param val The value to check for
       * @param array The array to check within
       * @return boolean Whether it exists
       */


      object.isValueInArray = function (val, array) {
        for (var i = 0; i < array.length; i++) {
          if (array[i] === val) {
            return true;
          }
        }

        return false;
      };
      /**
       * Deletes an arbitrary cookie by setting the expiration date to the past
       *
       * @param cookieName The name of the cookie to delete
       * @param domainName The domain the cookie is in
       */


      object.deleteCookie = function (cookieName, domainName) {
        cookie.cookie(cookieName, '', -1, '/', domainName);
      };
      /**
       * Fetches the name of all cookies beginning with a certain prefix
       *
       * @param cookiePrefix The prefix to check for
       * @return array The cookies that begin with the prefix
       */


      object.getCookiesWithPrefix = function (cookiePrefix) {
        var cookies = document.cookie.split("; ");
        var cookieNames = [];

        for (var i = 0; i < cookies.length; i++) {
          if (cookies[i].substring(0, cookiePrefix.length) === cookiePrefix) {
            cookieNames.push(cookies[i]);
          }
        }

        return cookieNames;
      };
      /**
       * Parses an object and returns either the
       * integer or undefined.
       *
       * @param obj The object to parse
       * @return the result of the parse operation
       */


      object.parseInt = function (obj) {
        var result = parseInt(obj);
        return isNaN(result) ? undefined : result;
      };
      /**
       * Parses an object and returns either the
       * number or undefined.
       *
       * @param obj The object to parse
       * @return the result of the parse operation
       */


      object.parseFloat = function (obj) {
        var result = parseFloat(obj);
        return isNaN(result) ? undefined : result;
      };
    })();
  }, {
    "browser-cookie-lite": 1,
    "lodash/filter": 120,
    "lodash/isObject": 135,
    "lodash/isString": 138,
    "lodash/isUndefined": 141,
    "lodash/map": 143
  }],
  174: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: proxies.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var helpers = require('./helpers'),
          object = typeof exports !== 'undefined' ? exports : this;
      /*
       * Test whether a string is an IP address
       */


      function isIpAddress(string) {
        var IPRegExp = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
        return IPRegExp.test(string);
      }
      /*
       * If the hostname is an IP address, look for text indicating
       * that the page is cached by Yahoo
       */


      function isYahooCachedPage(hostName) {
        var initialDivText, cachedIndicator;

        if (isIpAddress(hostName)) {
          try {
            initialDivText = document.body.children[0].children[0].children[0].children[0].children[0].children[0].innerHTML;
            cachedIndicator = 'You have reached the cached page for';
            return initialDivText.slice(0, cachedIndicator.length) === cachedIndicator;
          } catch (e) {
            return false;
          }
        }
      }
      /*
       * Extract parameter from URL
       */


      function getParameter(url, name) {
        // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
        var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
            matches = e.exec(url),
            result = helpers.fromQuerystring(name, matches[1]);
        return result;
      }
      /*
       * Fix-up URL when page rendered from search engine cache or translated page.
       * TODO: it would be nice to generalise this and/or move into the ETL phase.
       */


      object.fixupUrl = function (hostName, href, referrer) {
        if (hostName === 'translate.googleusercontent.com') {
          // Google
          if (referrer === '') {
            referrer = href;
          }

          href = getParameter(href, 'u');
          hostName = helpers.getHostName(href);
        } else if (hostName === 'cc.bingj.com' || // Bing
        hostName === 'webcache.googleusercontent.com' || // Google
        isYahooCachedPage(hostName)) {
          // Yahoo (via Inktomi 74.6.0.0/16)
          href = document.links[0].href;
          hostName = helpers.getHostName(href);
        }

        return [hostName, href, referrer];
      };
    })();
  }, {
    "./helpers": 173
  }],
  175: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: links.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    var isUndefined = require('lodash/isUndefined'),
        helpers = require('./lib/helpers'),
        object = typeof exports !== 'undefined' ? exports : this;
    /**
     * Object for handling automatic link tracking
     *
     * @param object core The tracker core
     * @param string trackerId Unique identifier for the tracker instance, used to mark tracked links
     * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
     * @return object linkTrackingManager instance
     */


    object.getLinkTrackingManager = function (core, trackerId, contextAdder) {
      // Filter function used to determine whether clicks on a link should be tracked
      var linkTrackingFilter, // Whether pseudo clicks are tracked
      linkTrackingPseudoClicks, // Whether to track the  innerHTML of clicked links
      linkTrackingContent, // The context attached to link click events
      linkTrackingContext, // Internal state of the pseudo click handler
      lastButton, lastTarget;
      /*
       * Process clicks
       */

      function processClick(sourceElement, context) {
        var parentElement, tag, elementId, elementClasses, elementTarget, elementContent;

        while ((parentElement = sourceElement.parentNode) !== null && !isUndefined(parentElement) && // buggy IE5.5
        (tag = sourceElement.tagName.toUpperCase()) !== 'A' && tag !== 'AREA') {
          sourceElement = parentElement;
        }

        if (!isUndefined(sourceElement.href)) {
          // browsers, such as Safari, don't downcase hostname and href
          var originalSourceHostName = sourceElement.hostname || helpers.getHostName(sourceElement.href),
              sourceHostName = originalSourceHostName.toLowerCase(),
              sourceHref = sourceElement.href.replace(originalSourceHostName, sourceHostName),
              scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i'); // Ignore script pseudo-protocol links

          if (!scriptProtocol.test(sourceHref)) {
            elementId = sourceElement.id;
            elementClasses = helpers.getCssClasses(sourceElement);
            elementTarget = sourceElement.target;
            elementContent = linkTrackingContent ? sourceElement.innerHTML : null; // decodeUrl %xx

            sourceHref = unescape(sourceHref);
            core.trackLinkClick(sourceHref, elementId, elementClasses, elementTarget, elementContent, contextAdder(helpers.resolveDynamicContexts(context, sourceElement)));
          }
        }
      }
      /*
       * Return function to handle click event
       */


      function getClickHandler(context) {
        return function (evt) {
          var button, target;
          evt = evt || window.event;
          button = evt.which || evt.button;
          target = evt.target || evt.srcElement; // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.

          if (evt.type === 'click') {
            if (target) {
              processClick(target, context);
            }
          } else if (evt.type === 'mousedown') {
            if ((button === 1 || button === 2) && target) {
              lastButton = button;
              lastTarget = target;
            } else {
              lastButton = lastTarget = null;
            }
          } else if (evt.type === 'mouseup') {
            if (button === lastButton && target === lastTarget) {
              processClick(target, context);
            }

            lastButton = lastTarget = null;
          }
        };
      }
      /*
       * Add click listener to a DOM element
       */


      function addClickListener(element) {
        if (linkTrackingPseudoClicks) {
          // for simplicity and performance, we ignore drag events
          helpers.addEventListener(element, 'mouseup', getClickHandler(linkTrackingContext), false);
          helpers.addEventListener(element, 'mousedown', getClickHandler(linkTrackingContext), false);
        } else {
          helpers.addEventListener(element, 'click', getClickHandler(linkTrackingContext), false);
        }
      }

      return {
        /*
         * Configures link click tracking: how to filter which links will be tracked,
         * whether to use pseudo click tracking, and what context to attach to link_click events
         */
        configureLinkClickTracking: function configureLinkClickTracking(criterion, pseudoClicks, trackContent, context) {
          linkTrackingContent = trackContent;
          linkTrackingContext = context;
          linkTrackingPseudoClicks = pseudoClicks;
          linkTrackingFilter = helpers.getFilter(criterion, true);
        },

        /*
         * Add click handlers to anchor and AREA elements, except those to be ignored
         */
        addClickListeners: function addClickListeners() {
          var linkElements = document.links,
              i;

          for (i = 0; i < linkElements.length; i++) {
            // Add a listener to link elements which pass the filter and aren't already tracked
            if (linkTrackingFilter(linkElements[i]) && !linkElements[i][trackerId]) {
              addClickListener(linkElements[i]);
              linkElements[i][trackerId] = true;
            }
          }
        }
      };
    };
  }, {
    "./lib/helpers": 173,
    "lodash/isUndefined": 141
  }],
  176: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: out_queue.js
     * 
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright 
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved. 
     * 
     * Redistribution and use in source and binary forms, with or without 
     * modification, are permitted provided that the following conditions are 
     * met: 
     *
     * * Redistributions of source code must retain the above copyright 
     *   notice, this list of conditions and the following disclaimer. 
     *
     * * Redistributions in binary form must reproduce the above copyright 
     *   notice, this list of conditions and the following disclaimer in the 
     *   documentation and/or other materials provided with the distribution. 
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission. 
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR 
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT 
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT 
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY 
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT 
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var mapValues = require('lodash/mapValues'),
          isString = require('lodash/isString'),
          map = require('lodash/map'),
          localStorageAccessible = require('./lib/detectors').localStorageAccessible,
          helpers = require('./lib/helpers'),
          object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support


      var groveCollectorUrl = 'https://snowplow.tools.grove.co';
      /**
       * Object handling sending events to a collector.
       * Instantiated once per tracker instance.
       *
       * @param string functionName The Snowplow function name (used to generate the localStorage key)
       * @param string namespace The tracker instance's namespace (used to generate the localStorage key)
       * @param object mutSnowplowState Gives the pageUnloadGuard a reference to the outbound queue
       *                                so it can unload the page when all queues are empty
       * @param boolean useLocalStorage Whether to use localStorage at all
       * @param string eventMethod if null will use 'beacon' otherwise can be set to 'post', 'get', or 'beacon' to force.
       * @param string postPath The path where events are to be posted
       * @param int bufferSize How many events to batch in localStorage before sending them all.
       *                       Only applies when sending POST requests and when localStorage is available.
       * @param int maxPostBytes Maximum combined size in bytes of the event JSONs in a POST request
       * @param boolean useStm Whether to add timestamp to events
       * @param int maxLocalStorageQueueSize Maximum number of queued events we will attempt to store in local storage.
       *
       * @return object OutQueueManager instance
       */

      object.OutQueueManager = function (functionName, namespace, mutSnowplowState, useLocalStorage, eventMethod, postPath, bufferSize, maxPostBytes, useStm, maxLocalStorageQueueSize) {
        var queueName,
            executingQueue = false,
            configCollectorUrl,
            outQueue; //Force to lower case if its a string

        eventMethod = eventMethod.toLowerCase ? eventMethod.toLowerCase() : eventMethod; // Use the Beacon API if eventMethod is set null, true, or 'beacon'.

        var isBeaconRequested = eventMethod === null || eventMethod === true || eventMethod === "beacon" || eventMethod === "true"; // Fall back to POST or GET for browsers which don't support Beacon API

        var isBeaconAvailable = Boolean(isBeaconRequested && navigator && navigator.sendBeacon);
        var useBeacon = isBeaconAvailable && isBeaconRequested; // Use GET if specified

        var isGetRequested = eventMethod === "get"; // Use POST if specified

        var isPostRequested = eventMethod === "post"; // usePost acts like a catch all for POST methods - Beacon or XHR

        var usePost = (isPostRequested || useBeacon) && !isGetRequested; // Don't use POST for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)

        usePost = usePost && Boolean(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()); // Resolve all options and capabilities and decide path

        var path = usePost ? postPath : '/i';
        bufferSize = localStorageAccessible() && useLocalStorage && usePost && bufferSize || 1; // Different queue names for GET and POST since they are stored differently

        queueName = ['snowplowOutQueue', functionName, namespace, usePost ? 'post2' : 'get'].join('_');

        if (useLocalStorage) {
          // Catch any JSON parse errors or localStorage that might be thrown
          try {
            // TODO: backward compatibility with the old version of the queue for POST requests
            outQueue = JSON.parse(localStorage.getItem(queueName));
          } catch (e) {}
        } // Initialize to and empty array if we didn't get anything out of localStorage


        if (!Array.isArray(outQueue)) {
          outQueue = [];
        } // Used by pageUnloadGuard


        mutSnowplowState.outQueues.push(outQueue);

        if (usePost && bufferSize > 1) {
          mutSnowplowState.bufferFlushers.push(function () {
            if (!executingQueue) {
              executeQueue();
            }
          });
        }
        /*
         * Convert a dictionary to a querystring
         * The context field is the last in the querystring
         */


        function getQuerystring(request) {
          var querystring = '?',
              lowPriorityKeys = {
            'co': true,
            'cx': true
          },
              firstPair = true;

          for (var key in request) {
            if (request.hasOwnProperty(key) && !lowPriorityKeys.hasOwnProperty(key)) {
              if (!firstPair) {
                querystring += '&';
              } else {
                firstPair = false;
              }

              querystring += encodeURIComponent(key) + '=' + encodeURIComponent(request[key]);
            }
          }

          for (var contextKey in lowPriorityKeys) {
            if (request.hasOwnProperty(contextKey) && lowPriorityKeys.hasOwnProperty(contextKey)) {
              querystring += '&' + contextKey + '=' + encodeURIComponent(request[contextKey]);
            }
          }

          return querystring;
        }
        /*
         * Convert numeric fields to strings to match payload_data schema
         */


        function getBody(request) {
          var cleanedRequest = mapValues(request, function (v) {
            return v.toString();
          });
          return {
            evt: cleanedRequest,
            bytes: getUTF8Length(JSON.stringify(cleanedRequest))
          };
        }
        /**
         * Count the number of bytes a string will occupy when UTF-8 encoded
         * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
         *
         * @param string s
         * @return number Length of s in bytes when UTF-8 encoded
         */


        function getUTF8Length(s) {
          var len = 0;

          for (var i = 0; i < s.length; i++) {
            var code = s.charCodeAt(i);

            if (code <= 0x7f) {
              len += 1;
            } else if (code <= 0x7ff) {
              len += 2;
            } else if (code >= 0xd800 && code <= 0xdfff) {
              // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
              // (Assume next char is the other [valid] half and just skip it)
              len += 4;
              i++;
            } else if (code < 0xffff) {
              len += 3;
            } else {
              len += 4;
            }
          }

          return len;
        }
        /*
         * Queue an image beacon for submission to the collector.
         * If we're not processing the queue, we'll start.
         */


        function enqueueRequest(request, url) {
          // url tracing down to url in during tracker init + auto schema resolve
          // we use only TLS so safe to put https://snowplow.tools.grove.co
          configCollectorUrl = url + path;
          var configCollectorUrlDup = groveCollectorUrl + path;

          if (usePost) {
            var body = getBody(request);

            if (body.bytes >= maxPostBytes) {
              helpers.warn("Event of size " + body.bytes + " is too long - the maximum size is " + maxPostBytes);
              var xhr = initializeXMLHttpRequest(configCollectorUrl);
              var xhr_dup = initializeXMLHttpRequest(configCollectorUrlDup);
              xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent([body.evt]))); // Attach attachStmToEvent is mutating, no copy-on-write

              xhr_dup.send(encloseInPayloadDataEnvelope([body.evt]));
              return;
            } else {
              outQueue.push(body);
            }
          } else {
            outQueue.push(getQuerystring(request));
          }

          var savedToLocalStorage = false;

          if (useLocalStorage) {
            savedToLocalStorage = helpers.attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
          }

          if (!executingQueue && (!savedToLocalStorage || outQueue.length >= bufferSize)) {
            executeQueue();
          }
        }
        /*
         * Run through the queue of image beacons, sending them one at a time.
         * Stops processing when we run out of queued requests, or we get an error.
         */


        function executeQueue() {
          // Failsafe in case there is some way for a bad value like "null" to end up in the outQueue
          while (outQueue.length && typeof outQueue[0] !== 'string' && _typeof(outQueue[0]) !== 'object') {
            outQueue.shift();
          }

          if (outQueue.length < 1) {
            executingQueue = false;
            return;
          } // Let's check that we have a Url to ping


          if (!isString(configCollectorUrl)) {
            throw "No Snowplow collector configured, cannot track";
          }

          executingQueue = true;
          var nextRequest = outQueue[0];

          if (usePost) {
            var chooseHowManyToExecute = function chooseHowManyToExecute(q) {
              var numberToSend = 0;
              var byteCount = 0;

              while (numberToSend < q.length) {
                byteCount += q[numberToSend].bytes;

                if (byteCount >= maxPostBytes) {
                  break;
                } else {
                  numberToSend += 1;
                }
              }

              return numberToSend;
            }; // Keep track of number of events to delete from queue


            // The events (`numberToSend` of them), have been sent, so we remove them from the outQueue
            // We also call executeQueue() again, to let executeQueue() check if we should keep running through the queue
            var onPostSuccess = function onPostSuccess(numberToSend) {
              for (var deleteCount = 0; deleteCount < numberToSend; deleteCount++) {
                outQueue.shift();
              }

              if (useLocalStorage) {
                helpers.attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
              }

              executeQueue();
            };

            var xhr = initializeXMLHttpRequest(configCollectorUrl);
            var xhr_dup = initializeXMLHttpRequest(groveCollectorUrl); // Time out POST requests after 5 seconds

            var xhrTimeout = setTimeout(function () {
              xhr.abort(); // If leading HTTP req timeouted, halting original also

              xhr_dup.abort();
              executingQueue = false;
            }, 5000);
            var numberToSend = chooseHowManyToExecute(outQueue);

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
                clearTimeout(xhrTimeout);
                onPostSuccess(numberToSend);
              } else if (xhr.readyState === 4 && xhr.status >= 400) {
                clearTimeout(xhrTimeout);
                executingQueue = false;
              }
            };

            var batch = map(outQueue.slice(0, numberToSend), function (x) {
              return x.evt;
            });

            if (batch.length > 0) {
              var beaconStatus;

              if (useBeacon) {
                var headers = {
                  type: 'application/json'
                };
                var blob = new Blob([encloseInPayloadDataEnvelope(attachStmToEvent(batch))], headers);

                try {
                  beaconStatus = navigator.sendBeacon(configCollectorUrl, blob);
                  beaconStatus = navigator.sendBeacon(groveCollectorUrl, blob);
                } catch (error) {
                  beaconStatus = false;
                }
              } // When beaconStatus is true, we can't _guarantee_ that it was successful (beacon queues asynchronously)
              // but the browser has taken it out of our hands, so we want to flush the queue assuming it will do its job


              if (beaconStatus === true) {
                onPostSuccess(numberToSend);
              }

              if (!useBeacon || !beaconStatus) {
                xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent(batch))); // attachStmToEvent is mutating, not copy-on-write, removing

                xhr_dup.send(encloseInPayloadDataEnvelope(batch));
              }
            }
          } else {
            var image = new Image(1, 1);
            var imageDup = new Image(1, 1);

            image.onload = function () {
              outQueue.shift();

              if (useLocalStorage) {
                helpers.attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
              }

              executeQueue();
            };

            image.onerror = function () {
              executingQueue = false;
            }; // note: this currently on applies to GET requests


            if (useStm) {
              image.src = configCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
              imageDup.src = groveCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
            } else {
              image.src = configCollectorUrl + nextRequest;
              image.src = groveCollectorUrl + nextRequest;
            }
          }
        }
        /**
         * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
         *
         * @param string url The destination URL
         * @return object The XMLHttpRequest
         */


        function initializeXMLHttpRequest(url) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.withCredentials = true;
          xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
          return xhr;
        }
        /**
         * Enclose an array of events in a self-describing payload_data JSON string
         *
         * @param array events Batch of events
         * @return string payload_data self-describing JSON
         */


        function encloseInPayloadDataEnvelope(events) {
          return JSON.stringify({
            schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
            data: events
          });
        }
        /**
         * Attaches the STM field to outbound POST events.
         *
         * @param events the events to attach the STM to
         */


        function attachStmToEvent(events) {
          var stm = new Date().getTime().toString();

          for (var i = 0; i < events.length; i++) {
            events[i]['stm'] = stm;
          }

          return events;
        }

        return {
          enqueueRequest: enqueueRequest,
          executeQueue: executeQueue
        };
      };
    })();
  }, {
    "./lib/detectors": 172,
    "./lib/helpers": 173,
    "lodash/isString": 138,
    "lodash/map": 143,
    "lodash/mapValues": 144
  }],
  177: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: snowplow.js
     *
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright
     * 2012-2014 Snowplow Analytics Ltd. All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     * * Redistributions of source code must retain the above copyright
     *   notice, this list of conditions and the following disclaimer.
     *
     * * Redistributions in binary form must reproduce the above copyright
     *   notice, this list of conditions and the following disclaimer in the
     *   documentation and/or other materials provided with the distribution.
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    /*jslint browser:true, plusplus:true, vars:true, nomen:true, evil:true */

    /*global window */

    /*global unescape */

    /*global ActiveXObject */

    /*global _snaq:true */

    /*members encodeURIComponent, decodeURIComponent, getElementsByTagName,
    	shift, unshift,
    	addEventListener, attachEvent, removeEventListener, detachEvent,
    	cookie, domain, readyState, documentElement, doScroll, title, text,
    	location, top, document, referrer, parent, links, href, protocol, GearsFactory,
    	event, which, button, srcElement, type, target,
    	parentNode, tagName, hostname, className,
    	userAgent, cookieEnabled, platform, mimeTypes, enabledPlugin, javaEnabled,
    	XDomainRequest, XMLHttpRequest, ActiveXObject, open, setRequestHeader, onreadystatechange, setRequestHeader, send, readyState, status,
    	getTime, getTimeAlias, setTime, toGMTString, getHours, getMinutes, getSeconds,
    	toLowerCase, charAt, indexOf, lastIndexOf, split, slice, toUpperCase,
    	onload, src,
    	round, random,
    	exec,
    	res, width, height,
    	pdf, qt, realp, wma, dir, fla, java, gears, ag,
    	hook, getHook,
    	setCollectorCf, setCollectorUrl, setAppId,
    	setDownloadExtensions, addDownloadExtensions,
    	setDomains, setIgnoreClasses, setRequestMethod,
    	setReferrerUrl, setCustomUrl, setDocumentTitle,
    	setDownloadClasses, setLinkClasses,
    	discardHashTag,
    	setCookieNamePrefix, setCookieDomain, setCookiePath, setVisitorIdCookie,
    	setVisitorCookieTimeout, setSessionCookieTimeout, setReferralCookieTimeout,
    	doNotTrack, respectDoNotTrack, msDoNotTrack, getTimestamp, getCookieValue,
    	detectTimezone, detectViewport,
    	addListener, enableLinkTracking, enableActivityTracking, setLinkTrackingTimer,
    	enableDarkSocialTracking,
    	killFrame, redirectFile, setCountPreRendered,
    	trackLink, trackPageView, trackImpression,
    	addPlugin, getAsyncTracker
    */
    ;

    (function () {
      // Load all our modules (at least until we fully modularize & remove grunt-concat)
      var uuid = require('uuid'),
          forEach = require('lodash/forEach'),
          filter = require('lodash/filter'),
          helpers = require('./lib/helpers'),
          queue = require('./in_queue'),
          tracker = require('./tracker'),
          object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support


      object.Snowplow = function (asynchronousQueue, functionName) {
        var documentAlias = document,
            windowAlias = window,

        /* Tracker identifier with version */
        version = 'js-' + '2.12.0',
            // Update banner.js too

        /* Contains four variables that are shared with tracker.js and must be passed by reference */
        mutSnowplowState = {
          /* List of request queues - one per Tracker instance */
          outQueues: [],
          bufferFlushers: [],

          /* Time at which to stop blocking excecution */
          expireDateTime: null,

          /* DOM Ready */
          hasLoaded: false,
          registeredOnLoadHandlers: [],

          /* pageViewId, which can changed by other trackers on page;
           * initialized by tracker sent first event */
          pageViewId: null
        };
        /************************************************************
         * Private methods
         ************************************************************/

        /*
         * Handle beforeunload event
         *
         * Subject to Safari's "Runaway JavaScript Timer" and
         * Chrome V8 extension that terminates JS that exhibits
         * "slow unload", i.e., calling getTime() > 1000 times
         */

        function beforeUnloadHandler() {
          var now; // Flush all POST queues

          forEach(mutSnowplowState.bufferFlushers, function (flusher) {
            flusher();
          });
          /*
           * Delay/pause (blocks UI)
           */

          if (mutSnowplowState.expireDateTime) {
            // the things we do for backwards compatibility...
            // in ECMA-262 5th ed., we could simply use:
            //     while (Date.now() < mutSnowplowState.expireDateTime) { }
            do {
              now = new Date();

              if (filter(mutSnowplowState.outQueues, function (queue) {
                return queue.length > 0;
              }).length === 0) {
                break;
              }
            } while (now.getTime() < mutSnowplowState.expireDateTime);
          }
        }
        /*
         * Handler for onload event
         */


        function loadHandler() {
          var i;

          if (!mutSnowplowState.hasLoaded) {
            mutSnowplowState.hasLoaded = true;

            for (i = 0; i < mutSnowplowState.registeredOnLoadHandlers.length; i++) {
              mutSnowplowState.registeredOnLoadHandlers[i]();
            }
          }

          return true;
        }
        /*
         * Add onload or DOM ready handler
         */


        function addReadyListener() {
          var _timer;

          if (documentAlias.addEventListener) {
            helpers.addEventListener(documentAlias, 'DOMContentLoaded', function ready() {
              documentAlias.removeEventListener('DOMContentLoaded', ready, false);
              loadHandler();
            });
          } else if (documentAlias.attachEvent) {
            documentAlias.attachEvent('onreadystatechange', function ready() {
              if (documentAlias.readyState === 'complete') {
                documentAlias.detachEvent('onreadystatechange', ready);
                loadHandler();
              }
            });

            if (documentAlias.documentElement.doScroll && windowAlias === windowAlias.top) {
              (function ready() {
                if (!mutSnowplowState.hasLoaded) {
                  try {
                    documentAlias.documentElement.doScroll('left');
                  } catch (error) {
                    setTimeout(ready, 0);
                    return;
                  }

                  loadHandler();
                }
              })();
            }
          } // sniff for older WebKit versions


          if (new RegExp('WebKit').test(navigator.userAgent)) {
            _timer = setInterval(function () {
              if (mutSnowplowState.hasLoaded || /loaded|complete/.test(documentAlias.readyState)) {
                clearInterval(_timer);
                loadHandler();
              }
            }, 10);
          } // fallback


          helpers.addEventListener(windowAlias, 'load', loadHandler, false);
        }
        /************************************************************
         * Public data and methods
         ************************************************************/


        windowAlias.Snowplow = {
          /**
           * Returns a Tracker object, configured with a
           * CloudFront collector.
           *
           * @param string distSubdomain The subdomain on your CloudFront collector's distribution
           */
          getTrackerCf: function getTrackerCf(distSubdomain) {
            var t = new tracker.Tracker(functionName, '', version, mutSnowplowState, {});
            t.setCollectorCf(distSubdomain);
            return t;
          },

          /**
           * Returns a Tracker object, configured with the
           * URL to the collector to use.
           *
           * @param string rawUrl The collector URL minus protocol and /i
           */
          getTrackerUrl: function getTrackerUrl(rawUrl) {
            var t = new tracker.Tracker(functionName, '', version, mutSnowplowState, {});
            t.setCollectorUrl(rawUrl);
            return t;
          },

          /**
           * Get internal asynchronous tracker object
           *
           * @return Tracker
           */
          getAsyncTracker: function getAsyncTracker() {
            return new tracker.Tracker(functionName, '', version, mutSnowplowState, {});
          }
        };
        /************************************************************
         * Constructor
         ************************************************************/
        // initialize the Snowplow singleton

        helpers.addEventListener(windowAlias, 'beforeunload', beforeUnloadHandler, false);
        addReadyListener(); // Now replace initialization array with queue manager object

        return new queue.InQueueManager(tracker.Tracker, version, mutSnowplowState, asynchronousQueue, functionName);
      };
    })();
  }, {
    "./in_queue": 170,
    "./lib/helpers": 173,
    "./tracker": 178,
    "lodash/filter": 120,
    "lodash/forEach": 123,
    "uuid": 162
  }],
  178: [function (require, module, exports) {
    /*
     * JavaScript tracker for Snowplow: tracker.js
     *
     * Significant portions copyright 2010 Anthon Pang. Remainder copyright
     * 2012-2016 Snowplow Analytics Ltd. All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     * * Redistributions of source code must retain the above copyright
     *   notice, this list of conditions and the following disclaimer.
     *
     * * Redistributions in binary form must reproduce the above copyright
     *   notice, this list of conditions and the following disclaimer in the
     *   documentation and/or other materials provided with the distribution.
     *
     * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
     *   names of their contributors may be used to endorse or promote products
     *   derived from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    ;

    (function () {
      var forEach = require('lodash/forEach'),
          map = require('lodash/map'),
          helpers = require('./lib/helpers'),
          proxies = require('./lib/proxies'),
          cookie = require('browser-cookie-lite'),
          detectors = require('./lib/detectors'),
          sha1 = require('sha1'),
          links = require('./links'),
          forms = require('./forms'),
          errors = require('./errors'),
          requestQueue = require('./out_queue'),
          coreConstructor = require('snowplow-tracker-core').trackerCore,
          productionize = require('./guard').productionize,
          uuid = require('uuid'),
          object = typeof exports !== 'undefined' ? exports : this; // For eventual node.js environment support

      /**
       * Snowplow Tracker class
       *
       * @param functionName global function name
       * @param namespace The namespace of the tracker object
       * @param version The current version of the JavaScript Tracker
       * @param mutSnowplowState An object containing hasLoaded, registeredOnLoadHandlers, and expireDateTime
       * 	      Passed in by reference in case they are altered by snowplow.js
       * @param argmap Optional dictionary of configuration options. Supported fields and their default values:
       *
       * 1. encodeBase64, true
       * 2. cookieDomain, null
       * 3. cookieName, '_sp_'
       * 4. appId, ''
       * 5. platform, 'web'
       * 6. respectDoNotTrack, false
       * 7. userFingerprintSeed, 123412414
       * 8. pageUnloadTimer, 500
       * 9. forceSecureTracker, false
       * 10. forceUnsecureTracker, false
       * 11. useLocalStorage, true
       * 12. useCookies, true
       * 13. sessionCookieTimeout, 1800
       * 14. contexts, {}
       * 15. eventMethod, 'post'
       * 16. post, false *DEPRECATED use eventMethod instead*
       * 17. postPath, null
       * 18. useStm, true
       * 19. bufferSize, 1
       * 20. crossDomainLinker, false
       * 21. maxPostBytes, 40000
       * 22. discoverRootDomain, false
       * 23. cookieLifetime, 63072000
       * 24. stateStorageStrategy, 'cookieAndLocalStorage'
       * 25. maxLocalStorageQueueSize, 1000
       */


      object.Tracker = function Tracker(functionName, namespace, version, mutSnowplowState, argmap) {
        /************************************************************
         * Private members
         ************************************************************/
        var argmap = argmap || {}; //use POST if that property is present on the argmap

        if (argmap.hasOwnProperty('post')) {
          argmap.eventMethod = argmap.post === true ? 'post' : 'get';
        } else {
          argmap.eventMethod = argmap.eventMethod || 'post';
        } // attach stm to GET requests by default


        if (!argmap.hasOwnProperty('useStm')) {
          argmap.useStm = true;
        } // Enum for accpted values of the gdprBasisContext's basisForProcessing argument


        var gdprBasisEnum = Object.freeze({
          consent: 'consent',
          contract: 'contract',
          legalObligation: 'legal_obligation',
          vitalInterests: 'vital_interests',
          publicTask: 'public_task',
          legitimateInterests: 'legitimate_interests'
        });
        var // Tracker core
        core = coreConstructor(true, function (payload) {
          addBrowserData(payload);
          sendRequest(payload, configTrackerPause);
        }),
            // Debug - whether to raise errors to console and log to console
        // or silence all errors from public methods
        debug = false,
            // API functions of the tracker
        apiMethods = {},
            // Safe methods (i.e. ones that won't raise errors)
        // These values should be guarded publicMethods
        safeMethods = {},
            // The client-facing methods returned from tracker IIFE
        returnMethods = {},
            // Aliases
        documentAlias = document,
            windowAlias = window,
            navigatorAlias = navigator,
            // Current URL and Referrer URL
        locationArray = proxies.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer()),
            domainAlias = helpers.fixupDomain(locationArray[0]),
            locationHrefAlias = locationArray[1],
            configReferrerUrl = locationArray[2],
            // Holder of the logPagePing interval
        pagePingInterval,
            customReferrer,
            // Request method is always GET for Snowplow
        configRequestMethod = 'GET',
            // Platform defaults to web for this tracker
        configPlatform = argmap.hasOwnProperty('platform') ? argmap.platform : 'web',
            // Snowplow collector URL
        configCollectorUrl,
            // Custom path for post requests (to get around adblockers)
        configPostPath = argmap.hasOwnProperty('postPath') ? argmap.postPath : '/com.snowplowanalytics.snowplow/tp2',
            // Site ID
        configTrackerSiteId = argmap.hasOwnProperty('appId') ? argmap.appId : '',
            // Updated for Snowplow
        // Document URL
        configCustomUrl,
            // Document title
        lastDocumentTitle = documentAlias.title,
            // Custom title
        lastConfigTitle,
            // Maximum delay to wait for web bug image to be fetched (in milliseconds)
        configTrackerPause = argmap.hasOwnProperty('pageUnloadTimer') ? argmap.pageUnloadTimer : 500,
            // Whether appropriate values have been supplied to enableActivityTracking
        activityTrackingEnabled = false,
            // Minimum visit time after initial page view (in milliseconds)
        configMinimumVisitTime,
            // Recurring heart beat after initial ping (in milliseconds)
        configHeartBeatTimer,
            // Disallow hash tags in URL. TODO: Should this be set to true by default?
        configDiscardHashTag,
            // Disallow brace in URL.
        configDiscardBrace,
            // First-party cookie name prefix
        configCookieNamePrefix = argmap.hasOwnProperty('cookieName') ? argmap.cookieName : '_sp_',
            // First-party cookie domain
        // User agent defaults to origin hostname
        configCookieDomain = argmap.hasOwnProperty('cookieDomain') ? argmap.cookieDomain : null,
            // First-party cookie path
        // Default is user agent defined.
        configCookiePath = '/',
            // Do Not Track browser feature
        dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack || windowAlias.doNotTrack,
            // Do Not Track
        configDoNotTrack = argmap.hasOwnProperty('respectDoNotTrack') ? argmap.respectDoNotTrack && (dnt === 'yes' || dnt === '1') : false,
            // Opt out of cookie tracking
        configOptOutCookie,
            // Count sites which are pre-rendered
        configCountPreRendered,
            // Life of the visitor cookie (in seconds)
        configVisitorCookieTimeout = argmap.hasOwnProperty('cookieLifetime') ? argmap.cookieLifetime : 63072000,
            // 2 years
        // Life of the session cookie (in seconds)
        configSessionCookieTimeout = argmap.hasOwnProperty('sessionCookieTimeout') ? argmap.sessionCookieTimeout : 1800,
            // 30 minutes
        // Default hash seed for MurmurHash3 in detectors.detectSignature
        configUserFingerprintHashSeed = argmap.hasOwnProperty('userFingerprintSeed') ? argmap.userFingerprintSeed : 123412414,
            // Document character set
        documentCharset = documentAlias.characterSet || documentAlias.charset,
            // This forces the tracker to be HTTPS even if the page is not secure
        forceSecureTracker = argmap.hasOwnProperty('forceSecureTracker') ? argmap.forceSecureTracker === true : false,
            // This forces the tracker to be HTTP even if the page is secure
        forceUnsecureTracker = !forceSecureTracker && argmap.hasOwnProperty('forceUnsecureTracker') ? argmap.forceUnsecureTracker === true : false,
            // Whether to use localStorage to store events between sessions while offline
        useLocalStorage = argmap.hasOwnProperty('useLocalStorage') ? (helpers.warn('argmap.useLocalStorage is deprecated. ' + 'Use argmap.stateStorageStrategy instead.'), argmap.useLocalStorage) : true,
            // Whether to use cookies
        configUseCookies = argmap.hasOwnProperty('useCookies') ? (helpers.warn('argmap.useCookies is deprecated. Use argmap.stateStorageStrategy instead.'), argmap.useCookies) : true,
            // Strategy defining how to store the state: cookie, localStorage or none
        configStateStorageStrategy = argmap.hasOwnProperty('stateStorageStrategy') ? argmap.stateStorageStrategy : !configUseCookies && !useLocalStorage ? 'none' : configUseCookies && useLocalStorage ? 'cookieAndLocalStorage' : configUseCookies ? 'cookie' : 'localStorage',
            // Browser language (or Windows language for IE). Imperfect but CloudFront doesn't log the Accept-Language header
        browserLanguage = navigatorAlias.userLanguage || navigatorAlias.language,
            // Browser features via client-side data collection
        browserFeatures = detectors.detectBrowserFeatures(configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage', getSnowplowCookieName('testcookie')),
            // Visitor fingerprint
        userFingerprint = argmap.userFingerprint === false ? '' : detectors.detectSignature(configUserFingerprintHashSeed),
            // Unique ID for the tracker instance used to mark links which are being tracked
        trackerId = functionName + '_' + namespace,
            // Guard against installing the activity tracker more than once per Tracker instance
        activityTrackingInstalled = false,
            // Last activity timestamp
        lastActivityTime,
            // The last time an event was fired on the page - used to invalidate session if cookies are disabled
        lastEventTime = new Date().getTime(),
            // How are we scrolling?
        minXOffset,
            maxXOffset,
            minYOffset,
            maxYOffset,
            // Hash function
        hash = sha1,
            // Domain hash value
        domainHash,
            // Domain unique user ID
        domainUserId,
            // ID for the current session
        memorizedSessionId,
            // Index for the current session - kept in memory in case cookies are disabled
        memorizedVisitCount = 1,
            // Business-defined unique user ID
        businessUserId,
            // Ecommerce transaction data
        // Will be committed, sent and emptied by a call to trackTrans.
        ecommerceTransaction = ecommerceTransactionTemplate(),
            // Manager for automatic link click tracking
        linkTrackingManager = links.getLinkTrackingManager(core, trackerId, addCommonContexts),
            // Manager for automatic form tracking
        formTrackingManager = forms.getFormTrackingManager(core, trackerId, addCommonContexts),
            // Manager for tracking unhandled exceptions
        errorManager = errors.errorManager(core),
            // Manager for local storage queue
        outQueueManager = new requestQueue.OutQueueManager(functionName, namespace, mutSnowplowState, configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage', argmap.eventMethod, configPostPath, argmap.bufferSize, argmap.maxPostBytes || 40000, argmap.useStm, argmap.maxLocalStorageQueueSize || 1000),
            // Flag to prevent the geolocation context being added multiple times
        geolocationContextAdded = false,
            // Set of contexts to be added to every event
        autoContexts = argmap.contexts || {},
            // Context to be added to every event
        commonContexts = [],
            // Enhanced Ecommerce Contexts to be added on every `trackEnhancedEcommerceAction` call
        enhancedEcommerceContexts = [],
            // Whether pageViewId should be regenerated after each trackPageView. Affect web_page context
        preservePageViewId = false,
            // Whether first trackPageView was fired and pageViewId should not be changed anymore until reload
        pageViewSent = false; // Object to house gdpr Basis context values

        var gdprBasisData = {};

        if (argmap.hasOwnProperty('discoverRootDomain') && argmap.discoverRootDomain) {
          configCookieDomain = helpers.findRootDomain();
        }

        if (autoContexts.gaCookies) {
          commonContexts.push(getGaCookiesContext());
        }

        if (autoContexts.geolocation) {
          enableGeolocationContext();
        } // Enable base 64 encoding for self-describing events and custom contexts


        core.setBase64Encoding(argmap.hasOwnProperty('encodeBase64') ? argmap.encodeBase64 : true); // Set up unchanging name-value pairs

        core.setTrackerVersion(version);
        core.setTrackerNamespace(namespace);
        core.setAppId(configTrackerSiteId);
        core.setPlatform(configPlatform);
        core.setTimezone(detectors.detectTimezone());
        core.addPayloadPair('lang', browserLanguage);
        core.addPayloadPair('cs', documentCharset); // Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)

        for (var i in browserFeatures) {
          if (Object.prototype.hasOwnProperty.call(browserFeatures, i)) {
            if (i === 'res' || i === 'cd' || i === 'cookie') {
              core.addPayloadPair(i, browserFeatures[i]);
            } else {
              core.addPayloadPair('f_' + i, browserFeatures[i]);
            }
          }
        }
        /**
         * Recalculate the domain, URL, and referrer
         */


        function refreshUrl() {
          locationArray = proxies.fixupUrl(documentAlias.domain, windowAlias.location.href, helpers.getReferrer()); // If this is a single-page app and the page URL has changed, then:
          //   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
          //   - otherwise use the old URL as the referer

          if (locationArray[1] !== locationHrefAlias) {
            configReferrerUrl = helpers.getReferrer(locationHrefAlias);
          }

          domainAlias = helpers.fixupDomain(locationArray[0]);
          locationHrefAlias = locationArray[1];
        }
        /**
         * Decorate the querystring of a single link
         *
         * @param event e The event targeting the link
         */


        function linkDecorationHandler() {
          var tstamp = new Date().getTime();

          if (this.href) {
            this.href = helpers.decorateQuerystring(this.href, '_sp', domainUserId + '.' + tstamp);
          }
        }
        /**
         * Enable querystring decoration for links pasing a filter
         * Whenever such a link is clicked on or navigated to via the keyboard,
         * add "_sp={{duid}}.{{timestamp}}" to its querystring
         *
         * @param crossDomainLinker Function used to determine which links to decorate
         */


        function decorateLinks(crossDomainLinker) {
          for (var i = 0; i < documentAlias.links.length; i++) {
            var elt = documentAlias.links[i];

            if (!elt.spDecorationEnabled && crossDomainLinker(elt)) {
              helpers.addEventListener(elt, 'click', linkDecorationHandler, true);
              helpers.addEventListener(elt, 'mousedown', linkDecorationHandler, true); // Don't add event listeners more than once

              elt.spDecorationEnabled = true;
            }
          }
        }
        /*
         * Initializes an empty ecommerce
         * transaction and line items
         */


        function ecommerceTransactionTemplate() {
          return {
            transaction: {},
            items: []
          };
        }
        /*
         * Removes hash tag from the URL
         *
         * URLs are purified before being recorded in the cookie,
         * or before being sent as GET parameters
         */


        function purify(url) {
          var targetPattern;

          if (configDiscardHashTag) {
            targetPattern = new RegExp('#.*');
            url = url.replace(targetPattern, '');
          }

          if (configDiscardBrace) {
            targetPattern = new RegExp('[{}]', 'g');
            url = url.replace(targetPattern, '');
          }

          return url;
        }
        /*
         * Extract scheme/protocol from URL
         */


        function getProtocolScheme(url) {
          var e = new RegExp('^([a-z]+):'),
              matches = e.exec(url);
          return matches ? matches[1] : null;
        }
        /*
         * Resolve relative reference
         *
         * Note: not as described in rfc3986 section 5.2
         */


        function resolveRelativeReference(baseUrl, url) {
          var protocol = getProtocolScheme(url),
              i;

          if (protocol) {
            return url;
          }

          if (url.slice(0, 1) === '/') {
            return getProtocolScheme(baseUrl) + '://' + helpers.getHostName(baseUrl) + url;
          }

          baseUrl = purify(baseUrl);

          if ((i = baseUrl.indexOf('?')) >= 0) {
            baseUrl = baseUrl.slice(0, i);
          }

          if ((i = baseUrl.lastIndexOf('/')) !== baseUrl.length - 1) {
            baseUrl = baseUrl.slice(0, i + 1);
          }

          return baseUrl + url;
        }
        /*
         * Send request
         */


        function sendRequest(request, delay) {
          var now = new Date(); // Set to true if Opt-out cookie is defined

          var toOptoutByCookie;

          if (configOptOutCookie) {
            toOptoutByCookie = !!cookie.cookie(configOptOutCookie);
          } else {
            toOptoutByCookie = false;
          }

          if (!(configDoNotTrack || toOptoutByCookie)) {
            outQueueManager.enqueueRequest(request.build(), configCollectorUrl);
            mutSnowplowState.expireDateTime = now.getTime() + delay;
          }
        }
        /*
         * Get cookie name with prefix and domain hash
         */


        function getSnowplowCookieName(baseName) {
          return configCookieNamePrefix + baseName + '.' + domainHash;
        }
        /*
         * Cookie getter.
         */


        function getSnowplowCookieValue(cookieName) {
          var fullName = getSnowplowCookieName(cookieName);

          if (configStateStorageStrategy == 'localStorage') {
            return helpers.attemptGetLocalStorage(fullName);
          } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
            return cookie.cookie(fullName);
          }
        }
        /*
         * Update domain hash
         */


        function updateDomainHash() {
          refreshUrl();
          domainHash = hash((configCookieDomain || domainAlias) + (configCookiePath || '/')).slice(0, 4); // 4 hexits = 16 bits
        }
        /*
         * Process all "activity" events.
         * For performance, this function must have low overhead.
         */


        function activityHandler() {
          var now = new Date();
          lastActivityTime = now.getTime();
        }
        /*
         * Process all "scroll" events.
         */


        function scrollHandler() {
          updateMaxScrolls();
          activityHandler();
        }
        /*
         * Returns [pageXOffset, pageYOffset].
         * Adapts code taken from: http://www.javascriptkit.com/javatutors/static2.shtml
         */


        function getPageOffsets() {
          var iebody = documentAlias.compatMode && documentAlias.compatMode !== "BackCompat" ? documentAlias.documentElement : documentAlias.body;
          return [iebody.scrollLeft || windowAlias.pageXOffset, iebody.scrollTop || windowAlias.pageYOffset];
        }
        /*
         * Quick initialization/reset of max scroll levels
         */


        function resetMaxScrolls() {
          var offsets = getPageOffsets();
          var x = offsets[0];
          minXOffset = x;
          maxXOffset = x;
          var y = offsets[1];
          minYOffset = y;
          maxYOffset = y;
        }
        /*
         * Check the max scroll levels, updating as necessary
         */


        function updateMaxScrolls() {
          var offsets = getPageOffsets();
          var x = offsets[0];

          if (x < minXOffset) {
            minXOffset = x;
          } else if (x > maxXOffset) {
            maxXOffset = x;
          }

          var y = offsets[1];

          if (y < minYOffset) {
            minYOffset = y;
          } else if (y > maxYOffset) {
            maxYOffset = y;
          }
        }
        /*
         * Prevents offsets from being decimal or NaN
         * See https://github.com/snowplow/snowplow-javascript-tracker/issues/324
         * TODO: the NaN check should be moved into the core
         */


        function cleanOffset(offset) {
          var rounded = Math.round(offset);

          if (!isNaN(rounded)) {
            return rounded;
          }
        }
        /*
         * Sets or renews the session cookie
         */


        function setSessionCookie() {
          var cookieName = getSnowplowCookieName('ses');
          var cookieValue = '*';
          setCookie(cookieName, cookieValue, configSessionCookieTimeout);
        }
        /*
         * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
         * or when there is a new visit or a new page view
         */


        function setDomainUserIdCookie(_domainUserId, createTs, visitCount, nowTs, lastVisitTs, sessionId) {
          var cookieName = getSnowplowCookieName('id');
          var cookieValue = _domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs + '.' + sessionId;
          setCookie(cookieName, cookieValue, configVisitorCookieTimeout);
        }
        /*
         * Sets a cookie based on the storage strategy:
         * - if 'localStorage': attemps to write to local storage
         * - if 'cookie': writes to cookies
         * - otherwise: no-op
         */


        function setCookie(name, value, timeout) {
          if (configStateStorageStrategy == 'localStorage') {
            helpers.attemptWriteLocalStorage(name, value, timeout);
          } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
            cookie.cookie(name, value, timeout, configCookiePath, configCookieDomain);
          }
        }
        /**
         * Generate a pseudo-unique ID to fingerprint this user
         */


        function createNewDomainUserId() {
          return uuid.v4();
        }
        /*
         * Load the domain user ID and the session ID
         * Set the cookies (if cookies are enabled)
         */


        function initializeIdsAndCookies() {
          var sesCookieSet = configStateStorageStrategy != 'none' && !!getSnowplowCookieValue('ses');
          var idCookieComponents = loadDomainUserIdCookie();

          if (idCookieComponents[1]) {
            domainUserId = idCookieComponents[1];
          } else {
            domainUserId = createNewDomainUserId();
            idCookieComponents[1] = domainUserId;
          }

          memorizedSessionId = idCookieComponents[6];

          if (!sesCookieSet) {
            // Increment the session ID
            idCookieComponents[3]++; // Create a new sessionId

            memorizedSessionId = uuid.v4();
            idCookieComponents[6] = memorizedSessionId; // Set lastVisitTs to currentVisitTs

            idCookieComponents[5] = idCookieComponents[4];
          }

          if (configStateStorageStrategy != 'none') {
            setSessionCookie(); // Update currentVisitTs

            idCookieComponents[4] = Math.round(new Date().getTime() / 1000);
            idCookieComponents.shift();
            setDomainUserIdCookie.apply(null, idCookieComponents);
          }
        }
        /*
         * Load visitor ID cookie
         */


        function loadDomainUserIdCookie() {
          if (configStateStorageStrategy == 'none') {
            return [];
          }

          var now = new Date(),
              nowTs = Math.round(now.getTime() / 1000),
              id = getSnowplowCookieValue('id'),
              tmpContainer;

          if (id) {
            tmpContainer = id.split('.'); // cookies enabled

            tmpContainer.unshift('0');
          } else {
            tmpContainer = [// cookies disabled
            '1', // Domain user ID
            domainUserId, // Creation timestamp - seconds since Unix epoch
            nowTs, // visitCount - 0 = no previous visit
            0, // Current visit timestamp
            nowTs, // Last visit timestamp - blank meaning no previous visit
            ''];
          }

          if (!tmpContainer[6]) {
            // session id
            tmpContainer[6] = uuid.v4();
          }

          return tmpContainer;
        }
        /*
         * Attaches common web fields to every request
         * (resolution, url, referrer, etc.)
         * Also sets the required cookies.
         */


        function addBrowserData(sb) {
          var nowTs = Math.round(new Date().getTime() / 1000),
              idname = getSnowplowCookieName('id'),
              sesname = getSnowplowCookieName('ses'),
              ses = getSnowplowCookieValue('ses'),
              id = loadDomainUserIdCookie(),
              cookiesDisabled = id[0],
              _domainUserId = id[1],
              // We could use the global (domainUserId) but this is better etiquette
          createTs = id[2],
              visitCount = id[3],
              currentVisitTs = id[4],
              lastVisitTs = id[5],
              sessionIdFromCookie = id[6];
          var toOptoutByCookie;

          if (configOptOutCookie) {
            toOptoutByCookie = !!cookie.cookie(configOptOutCookie);
          } else {
            toOptoutByCookie = false;
          }

          if ((configDoNotTrack || toOptoutByCookie) && configStateStorageStrategy != 'none') {
            if (configStateStorageStrategy == 'localStorage') {
              helpers.attemptWriteLocalStorage(idname, '');
              helpers.attemptWriteLocalStorage(sesname, '');
            } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
              cookie.cookie(idname, '', -1, configCookiePath, configCookieDomain);
              cookie.cookie(sesname, '', -1, configCookiePath, configCookieDomain);
            }

            return;
          } // If cookies are enabled, base visit count and session ID on the cookies


          if (cookiesDisabled === '0') {
            memorizedSessionId = sessionIdFromCookie; // New session?

            if (!ses && configStateStorageStrategy != 'none') {
              // New session (aka new visit)
              visitCount++; // Update the last visit timestamp

              lastVisitTs = currentVisitTs; // Regenerate the session ID

              memorizedSessionId = uuid.v4();
            }

            memorizedVisitCount = visitCount; // Otherwise, a new session starts if configSessionCookieTimeout seconds have passed since the last event
          } else {
            if (new Date().getTime() - lastEventTime > configSessionCookieTimeout * 1000) {
              memorizedSessionId = uuid.v4();
              memorizedVisitCount++;
            }
          } // Build out the rest of the request


          sb.add('vp', detectors.detectViewport());
          sb.add('ds', detectors.detectDocumentSize());
          sb.add('vid', memorizedVisitCount);
          sb.add('sid', memorizedSessionId);
          sb.add('duid', _domainUserId); // Set to our local variable

          sb.add('fp', userFingerprint);
          sb.add('uid', businessUserId);
          refreshUrl();
          sb.add('refr', purify(customReferrer || configReferrerUrl)); // Add the page URL last as it may take us over the IE limit (and we don't always need it)

          sb.add('url', purify(configCustomUrl || locationHrefAlias)); // Update cookies

          if (configStateStorageStrategy != 'none') {
            setDomainUserIdCookie(_domainUserId, createTs, memorizedVisitCount, nowTs, lastVisitTs, memorizedSessionId);
            setSessionCookie();
          }

          lastEventTime = new Date().getTime();
        }
        /**
         * Builds a collector URL from a CloudFront distribution.
         * We don't bother to support custom CNAMEs because Amazon CloudFront doesn't support that for SSL.
         *
         * @param string account The account ID to build the tracker URL from
         *
         * @return string The URL on which the collector is hosted
         */


        function collectorUrlFromCfDist(distSubdomain) {
          return asCollectorUrl(distSubdomain + '.cloudfront.net');
        }
        /**
         * Adds the protocol in front of our collector URL, and i to the end
         *
         * @param string rawUrl The collector URL without protocol
         *
         * @return string collectorUrl The tracker URL with protocol
         */


        function asCollectorUrl(rawUrl) {
          if (forceSecureTracker) {
            return 'https' + '://' + rawUrl;
          }

          if (forceUnsecureTracker) {
            return 'http' + '://' + rawUrl;
          }

          return ('https:' === documentAlias.location.protocol ? 'https' : 'http') + '://' + rawUrl;
        }
        /**
         * Add common contexts to every event
         * TODO: move this functionality into the core
         *
         * @param array userContexts List of user-defined contexts
         * @return userContexts combined with commonContexts
         */


        function addCommonContexts(userContexts) {
          var combinedContexts = commonContexts.concat(userContexts || []);

          if (autoContexts.webPage) {
            combinedContexts.push(getWebPageContext());
          } // Add PerformanceTiming Context


          if (autoContexts.performanceTiming) {
            var performanceTimingContext = getPerformanceTimingContext();

            if (performanceTimingContext) {
              combinedContexts.push(performanceTimingContext);
            }
          } // Add Optimizely Contexts


          if (windowAlias.optimizely) {
            if (autoContexts.optimizelySummary) {
              var activeExperiments = getOptimizelySummaryContexts();
              forEach(activeExperiments, function (e) {
                combinedContexts.push(e);
              });
            }

            if (autoContexts.optimizelyXSummary) {
              var activeExperiments = getOptimizelyXSummaryContexts();
              forEach(activeExperiments, function (e) {
                combinedContexts.push(e);
              });
            }

            if (autoContexts.optimizelyExperiments) {
              var experimentContexts = getOptimizelyExperimentContexts();

              for (var i = 0; i < experimentContexts.length; i++) {
                combinedContexts.push(experimentContexts[i]);
              }
            }

            if (autoContexts.optimizelyStates) {
              var stateContexts = getOptimizelyStateContexts();

              for (var i = 0; i < stateContexts.length; i++) {
                combinedContexts.push(stateContexts[i]);
              }
            }

            if (autoContexts.optimizelyVariations) {
              var variationContexts = getOptimizelyVariationContexts();

              for (var i = 0; i < variationContexts.length; i++) {
                combinedContexts.push(variationContexts[i]);
              }
            }

            if (autoContexts.optimizelyVisitor) {
              var optimizelyVisitorContext = getOptimizelyVisitorContext();

              if (optimizelyVisitorContext) {
                combinedContexts.push(optimizelyVisitorContext);
              }
            }

            if (autoContexts.optimizelyAudiences) {
              var audienceContexts = getOptimizelyAudienceContexts();

              for (var i = 0; i < audienceContexts.length; i++) {
                combinedContexts.push(audienceContexts[i]);
              }
            }

            if (autoContexts.optimizelyDimensions) {
              var dimensionContexts = getOptimizelyDimensionContexts();

              for (var i = 0; i < dimensionContexts.length; i++) {
                combinedContexts.push(dimensionContexts[i]);
              }
            }
          } // Add Augur Context


          if (autoContexts.augurIdentityLite) {
            var augurIdentityLiteContext = getAugurIdentityLiteContext();

            if (augurIdentityLiteContext) {
              combinedContexts.push(augurIdentityLiteContext);
            }
          } //Add Parrable Context


          if (autoContexts.parrable) {
            var parrableContext = getParrableContext();

            if (parrableContext) {
              combinedContexts.push(parrableContext);
            }
          }

          if (autoContexts.gdprBasis && gdprBasisData.gdprBasis) {
            var gdprBasisContext = getGdprBasisContext();

            if (gdprBasisContext) {
              combinedContexts.push(gdprBasisContext);
            }
          }

          return combinedContexts;
        }
        /**
         * Initialize new `pageViewId` if it shouldn't be preserved.
         * Should be called when `trackPageView` is invoked
         */


        function resetPageView() {
          if (!preservePageViewId || mutSnowplowState.pageViewId == null) {
            mutSnowplowState.pageViewId = uuid.v4();
          }
        }
        /**
         * Safe function to get `pageViewId`.
         * Generates it if it wasn't initialized by other tracker
         */


        function getPageViewId() {
          if (mutSnowplowState.pageViewId == null) {
            mutSnowplowState.pageViewId = uuid.v4();
          }

          return mutSnowplowState.pageViewId;
        }
        /**
         * Put together a web page context with a unique UUID for the page view
         *
         * @return object web_page context
         */


        function getWebPageContext() {
          return {
            schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
            data: {
              id: getPageViewId()
            }
          };
        }
        /**
         * Creates a context from the window.performance.timing object
         *
         * @return object PerformanceTiming context
         */


        function getPerformanceTimingContext() {
          var allowedKeys = ['navigationStart', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'secureConnectionStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'unloadEventStart', 'unloadEventEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd', 'msFirstPaint', 'chromeFirstPaint', 'requestEnd', 'proxyStart', 'proxyEnd'];
          var performance = windowAlias.performance || windowAlias.mozPerformance || windowAlias.msPerformance || windowAlias.webkitPerformance;

          if (performance) {
            // On Safari, the fields we are interested in are on the prototype chain of
            // performance.timing so we cannot copy them using lodash.clone
            var performanceTiming = {};

            for (var field in performance.timing) {
              if (helpers.isValueInArray(field, allowedKeys) && performance.timing[field] !== null) {
                performanceTiming[field] = performance.timing[field];
              }
            } // Old Chrome versions add an unwanted requestEnd field


            delete performanceTiming.requestEnd;
            return {
              schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
              data: performanceTiming
            };
          }
        }
        /**
         * Check that *both* optimizely and optimizely.data exist and return
         * optimizely.data.property
         *
         * @param property optimizely data property
         * @param snd optional nested property
         */


        function getOptimizelyData(property, snd) {
          var data;

          if (windowAlias.optimizely && windowAlias.optimizely.data) {
            data = windowAlias.optimizely.data[property];

            if (typeof snd !== 'undefined' && data !== undefined) {
              data = data[snd];
            }
          }

          return data;
        }
        /**
         * Check that *both* optimizely and optimizely.data exist
         *
         * @param property optimizely data property
         * @param snd optional nested property
         */


        function getOptimizelyXData(property, snd) {
          var data;

          if (windowAlias.optimizely) {
            data = windowAlias.optimizely.get(property);

            if (typeof snd !== 'undefined' && data !== undefined) {
              data = data[snd];
            }
          }

          return data;
        }
        /**
         * Get data for Optimizely "lite" contexts - active experiments on current page
         *
         * @returns Array content of lite optimizely lite context
         */


        function getOptimizelySummary() {
          var state = getOptimizelyData('state');
          var experiments = getOptimizelyData('experiments');
          return map(state && experiments && state.activeExperiments, function (activeExperiment) {
            var current = experiments[activeExperiment];
            return {
              activeExperimentId: activeExperiment.toString(),
              // User can be only in one variation (don't know why is this array)
              variation: state.variationIdsMap[activeExperiment][0].toString(),
              conditional: current && current.conditional,
              manual: current && current.manual,
              name: current && current.name
            };
          });
        }
        /**
         * Get data for OptimizelyX contexts - active experiments on current page
         *
         * @returns Array content of lite optimizely lite context
         */


        function getOptimizelyXSummary() {
          var state = getOptimizelyXData('state');
          var experiment_ids = state.getActiveExperimentIds();
          var experiments = getOptimizelyXData('data', 'experiments');
          var visitor = getOptimizelyXData('visitor');
          return map(experiment_ids, function (activeExperiment) {
            var variation = state.getVariationMap()[activeExperiment];
            var variationName = variation.name;
            var variationId = variation.id;
            var visitorId = visitor.visitorId;
            return {
              experimentId: parseInt(activeExperiment),
              variationName: variationName,
              variation: parseInt(variationId),
              visitorId: visitorId
            };
          });
        }
        /**
         * Creates a context from the window['optimizely'].data.experiments object
         *
         * @return Array Experiment contexts
         */


        function getOptimizelyExperimentContexts() {
          var experiments = getOptimizelyData('experiments');

          if (experiments) {
            var contexts = [];

            for (var key in experiments) {
              if (experiments.hasOwnProperty(key)) {
                var context = {};
                context.id = key;
                var experiment = experiments[key];
                context.code = experiment.code;
                context.manual = experiment.manual;
                context.conditional = experiment.conditional;
                context.name = experiment.name;
                context.variationIds = experiment.variation_ids;
                contexts.push({
                  schema: 'iglu:com.optimizely/experiment/jsonschema/1-0-0',
                  data: context
                });
              }
            }

            return contexts;
          }

          return [];
        }
        /**
         * Creates a context from the window['optimizely'].data.state object
         *
         * @return Array State contexts
         */


        function getOptimizelyStateContexts() {
          var experimentIds = [];
          var experiments = getOptimizelyData('experiments');

          if (experiments) {
            for (var key in experiments) {
              if (experiments.hasOwnProperty(key)) {
                experimentIds.push(key);
              }
            }
          }

          var state = getOptimizelyData('state');

          if (state) {
            var contexts = [];
            var activeExperiments = state.activeExperiments || [];

            for (var i = 0; i < experimentIds.length; i++) {
              var experimentId = experimentIds[i];
              var context = {};
              context.experimentId = experimentId;
              context.isActive = helpers.isValueInArray(experimentIds[i], activeExperiments);
              var variationMap = state.variationMap || {};
              context.variationIndex = variationMap[experimentId];
              var variationNamesMap = state.variationNamesMap || {};
              context.variationName = variationNamesMap[experimentId];
              var variationIdsMap = state.variationIdsMap || {};

              if (variationIdsMap[experimentId] && variationIdsMap[experimentId].length === 1) {
                context.variationId = variationIdsMap[experimentId][0];
              }

              contexts.push({
                schema: 'iglu:com.optimizely/state/jsonschema/1-0-0',
                data: context
              });
            }

            return contexts;
          }

          return [];
        }
        /**
         * Creates a context from the window['optimizely'].data.variations object
         *
         * @return Array Variation contexts
         */


        function getOptimizelyVariationContexts() {
          var variations = getOptimizelyData('variations');

          if (variations) {
            var contexts = [];

            for (var key in variations) {
              if (variations.hasOwnProperty(key)) {
                var context = {};
                context.id = key;
                var variation = variations[key];
                context.name = variation.name;
                context.code = variation.code;
                contexts.push({
                  schema: 'iglu:com.optimizely/variation/jsonschema/1-0-0',
                  data: context
                });
              }
            }

            return contexts;
          }

          return [];
        }
        /**
         * Creates a context from the window['optimizely'].data.visitor object
         *
         * @return object Visitor context
         */


        function getOptimizelyVisitorContext() {
          var visitor = getOptimizelyData('visitor');

          if (visitor) {
            var context = {};
            context.browser = visitor.browser;
            context.browserVersion = visitor.browserVersion;
            context.device = visitor.device;
            context.deviceType = visitor.deviceType;
            context.ip = visitor.ip;
            var platform = visitor.platform || {};
            context.platformId = platform.id;
            context.platformVersion = platform.version;
            var location = visitor.location || {};
            context.locationCity = location.city;
            context.locationRegion = location.region;
            context.locationCountry = location.country;
            context.mobile = visitor.mobile;
            context.mobileId = visitor.mobileId;
            context.referrer = visitor.referrer;
            context.os = visitor.os;
            return {
              schema: 'iglu:com.optimizely/visitor/jsonschema/1-0-0',
              data: context
            };
          }
        }
        /**
         * Creates a context from the window['optimizely'].data.visitor.audiences object
         *
         * @return Array VisitorAudience contexts
         */


        function getOptimizelyAudienceContexts() {
          var audienceIds = getOptimizelyData('visitor', 'audiences');

          if (audienceIds) {
            var contexts = [];

            for (var key in audienceIds) {
              if (audienceIds.hasOwnProperty(key)) {
                var context = {
                  id: key,
                  isMember: audienceIds[key]
                };
                contexts.push({
                  schema: 'iglu:com.optimizely/visitor_audience/jsonschema/1-0-0',
                  data: context
                });
              }
            }

            return contexts;
          }

          return [];
        }
        /**
         * Creates a context from the window['optimizely'].data.visitor.dimensions object
         *
         * @return Array VisitorDimension contexts
         */


        function getOptimizelyDimensionContexts() {
          var dimensionIds = getOptimizelyData('visitor', 'dimensions');

          if (dimensionIds) {
            var contexts = [];

            for (var key in dimensionIds) {
              if (dimensionIds.hasOwnProperty(key)) {
                var context = {
                  id: key,
                  value: dimensionIds[key]
                };
                contexts.push({
                  schema: 'iglu:com.optimizely/visitor_dimension/jsonschema/1-0-0',
                  data: context
                });
              }
            }

            return contexts;
          }

          return [];
        }
        /**
         * Creates an Optimizely lite context containing only data required to join
         * event to experiment data
         *
         * @returns Array of custom contexts
         */


        function getOptimizelySummaryContexts() {
          return map(getOptimizelySummary(), function (experiment) {
            return {
              schema: 'iglu:com.optimizely.snowplow/optimizely_summary/jsonschema/1-0-0',
              data: experiment
            };
          });
        }
        /**
         * Creates an OptimizelyX context containing only data required to join
         * event to experiment data
         *
         * @returns Array of custom contexts
         */


        function getOptimizelyXSummaryContexts() {
          return map(getOptimizelyXSummary(), function (experiment) {
            return {
              schema: 'iglu:com.optimizely.optimizelyx/summary/jsonschema/1-0-0',
              data: experiment
            };
          });
        }
        /**
         * Creates a context from the window['augur'] object
         *
         * @return object The IdentityLite context
         */


        function getAugurIdentityLiteContext() {
          var augur = windowAlias.augur;

          if (augur) {
            var context = {
              consumer: {},
              device: {}
            };
            var consumer = augur.consumer || {};
            context.consumer.UUID = consumer.UID;
            var device = augur.device || {};
            context.device.ID = device.ID;
            context.device.isBot = device.isBot;
            context.device.isProxied = device.isProxied;
            context.device.isTor = device.isTor;
            var fingerprint = device.fingerprint || {};
            context.device.isIncognito = fingerprint.browserHasIncognitoEnabled;
            return {
              schema: 'iglu:io.augur.snowplow/identity_lite/jsonschema/1-0-0',
              data: context
            };
          }
        }
        /**
         * Creates a context from the window['_hawk'] object
         *
         * @return object The Parrable context
         */


        function getParrableContext() {
          var parrable = window['_hawk'];

          if (parrable) {
            var context = {
              encryptedId: null,
              optout: null
            };
            context['encryptedId'] = parrable.browserid;
            var regex = new RegExp('(?:^|;)\\s?' + "_parrable_hawk_optout".replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '=(.*?)(?:;|$)', 'i'),
                match = document.cookie.match(regex);
            context['optout'] = match && decodeURIComponent(match[1]) ? match && decodeURIComponent(match[1]) : "false";
            return {
              schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
              data: context
            };
          }
        }
        /* Creates GDPR context Self-describing JSON object
        */


        function getGdprBasisContext() {
          if (gdprBasisData.gdprBasis) {
            return {
              schema: 'iglu:com.snowplowanalytics.snowplow/gdpr/jsonschema/1-0-0',
              data: {
                basisForProcessing: gdprBasisData.gdprBasis,
                // Needs to reference local storage
                documentId: gdprBasisData.gdprDocId || null,
                documentVersion: gdprBasisData.gdprDocVer || null,
                documentDescription: gdprBasisData.gdprDocDesc || null
              }
            };
          }
        }
        /**
         * Expires current session and starts a new session.
         */


        function newSession() {
          // If cookies are enabled, base visit count and session ID on the cookies
          var nowTs = Math.round(new Date().getTime() / 1000),
              ses = getSnowplowCookieValue('ses'),
              id = loadDomainUserIdCookie(),
              cookiesDisabled = id[0],
              _domainUserId = id[1],
              // We could use the global (domainUserId) but this is better etiquette
          createTs = id[2],
              visitCount = id[3],
              currentVisitTs = id[4],
              lastVisitTs = id[5],
              sessionIdFromCookie = id[6]; // When cookies are enabled

          if (cookiesDisabled === '0') {
            memorizedSessionId = sessionIdFromCookie; // When cookie/local storage is enabled - make a new session

            if (configStateStorageStrategy != 'none') {
              // New session (aka new visit)
              visitCount++; // Update the last visit timestamp

              lastVisitTs = currentVisitTs; // Regenerate the session ID

              memorizedSessionId = uuid.v4();
            }

            memorizedVisitCount = visitCount; // Create a new session cookie

            setSessionCookie();
          } else {
            memorizedSessionId = uuid.v4();
            memorizedVisitCount++;
          } // Update cookies


          if (configStateStorageStrategy != 'none') {
            setDomainUserIdCookie(_domainUserId, createTs, memorizedVisitCount, nowTs, lastVisitTs, memorizedSessionId);
            setSessionCookie();
          }

          lastEventTime = new Date().getTime();
        }
        /**
         * Attempts to create a context using the geolocation API and add it to commonContexts
         */


        function enableGeolocationContext() {
          if (!geolocationContextAdded && navigatorAlias.geolocation && navigatorAlias.geolocation.getCurrentPosition) {
            geolocationContextAdded = true;
            navigatorAlias.geolocation.getCurrentPosition(function (position) {
              var coords = position.coords;
              var geolocationContext = {
                schema: 'iglu:com.snowplowanalytics.snowplow/geolocation_context/jsonschema/1-1-0',
                data: {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeLongitudeAccuracy: coords.accuracy,
                  altitude: coords.altitude,
                  altitudeAccuracy: coords.altitudeAccuracy,
                  bearing: coords.heading,
                  speed: coords.speed,
                  timestamp: Math.round(position.timestamp)
                }
              };
              commonContexts.push(geolocationContext);
            });
          }
        }
        /**
         * Creates a context containing the values of the cookies set by GA
         *
         * @return object GA cookies context
         */


        function getGaCookiesContext() {
          var gaCookieData = {};
          forEach(['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'], function (cookieType) {
            var value = cookie.cookie(cookieType);

            if (value) {
              gaCookieData[cookieType] = value;
            }
          });
          return {
            schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
            data: gaCookieData
          };
        }
        /**
         * Combine an array of unchanging contexts with the result of a context-creating function
         *
         * @param staticContexts Array of custom contexts
         * @param contextCallback Function returning an array of contexts
         */


        function finalizeContexts(staticContexts, contextCallback) {
          return (staticContexts || []).concat(contextCallback ? contextCallback() : []);
        }
        /**
         * Log the page view / visit
         *
         * @param customTitle string The user-defined page title to attach to this page view
         * @param context object Custom context relating to the event
         * @param contextCallback Function returning an array of contexts
         * @param tstamp number
         */


        function logPageView(customTitle, context, contextCallback, tstamp) {
          refreshUrl();

          if (pageViewSent) {
            // Do not reset pageViewId if previous events were not page_view
            resetPageView();
          }

          pageViewSent = true; // So we know what document.title was at the time of trackPageView

          lastDocumentTitle = documentAlias.title;
          lastConfigTitle = customTitle; // Fixup page title

          var pageTitle = helpers.fixupTitle(lastConfigTitle || lastDocumentTitle); // Log page view

          core.trackPageView(purify(configCustomUrl || locationHrefAlias), pageTitle, purify(customReferrer || configReferrerUrl), addCommonContexts(finalizeContexts(context, contextCallback)), tstamp); // Send ping (to log that user has stayed on page)

          var now = new Date();

          if (activityTrackingEnabled && !activityTrackingInstalled) {
            activityTrackingInstalled = true; // Add mousewheel event handler, detect passive event listeners for performance

            var detectPassiveEvents = {
              update: function update() {
                if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                  var passive = false;
                  var options = Object.defineProperty({}, 'passive', {
                    get: function get() {
                      passive = true;
                    }
                  }); // note: have to set and remove a no-op listener instead of null
                  // (which was used previously), becasue Edge v15 throws an error
                  // when providing a null callback.
                  // https://github.com/rafrex/detect-passive-events/pull/3

                  var noop = function noop() {};

                  window.addEventListener('testPassiveEventSupport', noop, options);
                  window.removeEventListener('testPassiveEventSupport', noop, options);
                  detectPassiveEvents.hasSupport = passive;
                }
              }
            };
            detectPassiveEvents.update(); // Detect available wheel event

            var wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
            "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

            if (Object.prototype.hasOwnProperty.call(detectPassiveEvents, 'hasSupport')) {
              helpers.addEventListener(documentAlias, wheelEvent, activityHandler, {
                passive: true
              });
            } else {
              helpers.addEventListener(documentAlias, wheelEvent, activityHandler);
            } // Capture our initial scroll points


            resetMaxScrolls(); // Add event handlers; cross-browser compatibility here varies significantly
            // @see http://quirksmode.org/dom/events

            helpers.addEventListener(documentAlias, 'click', activityHandler);
            helpers.addEventListener(documentAlias, 'mouseup', activityHandler);
            helpers.addEventListener(documentAlias, 'mousedown', activityHandler);
            helpers.addEventListener(documentAlias, 'mousemove', activityHandler);
            helpers.addEventListener(windowAlias, 'scroll', scrollHandler); // Will updateMaxScrolls() for us

            helpers.addEventListener(documentAlias, 'keypress', activityHandler);
            helpers.addEventListener(documentAlias, 'keydown', activityHandler);
            helpers.addEventListener(documentAlias, 'keyup', activityHandler);
            helpers.addEventListener(windowAlias, 'resize', activityHandler);
            helpers.addEventListener(windowAlias, 'focus', activityHandler);
            helpers.addEventListener(windowAlias, 'blur', activityHandler); // Periodic check for activity.

            lastActivityTime = now.getTime();
            clearInterval(pagePingInterval);
            pagePingInterval = setInterval(function heartBeat() {
              var now = new Date(); // There was activity during the heart beat period;
              // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2

              if (lastActivityTime + configHeartBeatTimer > now.getTime()) {
                // Send ping if minimum visit time has elapsed
                if (configMinimumVisitTime < now.getTime()) {
                  logPagePing(finalizeContexts(context, contextCallback)); // Grab the min/max globals
                }
              }
            }, configHeartBeatTimer);
          }
        }
        /**
         * Log that a user is still viewing a given page
         * by sending a page ping.
         * Not part of the public API - only called from
         * logPageView() above.
         *
         * @param context object Custom context relating to the event
         */


        function logPagePing(context) {
          refreshUrl();
          var newDocumentTitle = documentAlias.title;

          if (newDocumentTitle !== lastDocumentTitle) {
            lastDocumentTitle = newDocumentTitle;
            lastConfigTitle = null;
          }

          core.trackPagePing(purify(configCustomUrl || locationHrefAlias), helpers.fixupTitle(lastConfigTitle || lastDocumentTitle), purify(customReferrer || configReferrerUrl), cleanOffset(minXOffset), cleanOffset(maxXOffset), cleanOffset(minYOffset), cleanOffset(maxYOffset), addCommonContexts(context));
          resetMaxScrolls();
        }
        /**
         * Log ecommerce transaction metadata
         *
         * @param string orderId
         * @param string affiliation
         * @param string total
         * @param string tax
         * @param string shipping
         * @param string city
         * @param string state
         * @param string country
         * @param string currency The currency the total/tax/shipping are expressed in
         * @param object context Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        function logTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
          core.trackEcommerceTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, addCommonContexts(context), tstamp);
        }
        /**
         * Log ecommerce transaction item
         *
         * @param string orderId
         * @param string sku
         * @param string name
         * @param string category
         * @param string price
         * @param string quantity
         * @param string currency The currency the price is expressed in
         * @param object context Custom context relating to the event
         */


        function logTransactionItem(orderId, sku, name, category, price, quantity, currency, context, tstamp) {
          core.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, addCommonContexts(context), tstamp);
        }
        /**
         * Construct a browser prefix
         *
         * E.g: (moz, hidden) -> mozHidden
         */


        function prefixPropertyName(prefix, propertyName) {
          if (prefix !== '') {
            return prefix + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
          }

          return propertyName;
        }
        /**
         * Check for pre-rendered web pages, and log the page view/link
         * according to the configuration and/or visibility
         *
         * @see http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/PageVisibility/Overview.html
         */


        function trackCallback(callback) {
          var isPreRendered,
              i,
              // Chrome 13, IE10, FF10
          prefixes = ['', 'webkit', 'ms', 'moz'],
              prefix; // If configPrerendered == true - we'll never set `isPreRendered` to true and fire immediately,
          // otherwise we need to check if this is just prerendered

          if (!configCountPreRendered) {
            // true by default
            for (i = 0; i < prefixes.length; i++) {
              prefix = prefixes[i]; // does this browser support the page visibility API? (drop this check along with IE9 and iOS6)

              if (documentAlias[prefixPropertyName(prefix, 'hidden')]) {
                // if pre-rendered, then defer callback until page visibility changes
                if (documentAlias[prefixPropertyName(prefix, 'visibilityState')] === 'prerender') {
                  isPreRendered = true;
                }

                break;
              } else if (documentAlias[prefixPropertyName(prefix, 'hidden')] === false) {
                break;
              }
            }
          } // Implies configCountPreRendered = false


          if (isPreRendered) {
            // note: the event name doesn't follow the same naming convention as vendor properties
            helpers.addEventListener(documentAlias, prefix + 'visibilitychange', function ready() {
              documentAlias.removeEventListener(prefix + 'visibilitychange', ready, false);
              callback();
            });
            return;
          } // configCountPreRendered === true || isPreRendered === false


          callback();
        }
        /**
         * Update the returned methods (public facing methods)
         */


        function updateReturnMethods() {
          if (debug) {
            returnMethods = apiMethods;
          } else {
            returnMethods = safeMethods;
          }
        }
        /************************************************************
         * Constructor
         ************************************************************/

        /*
         * Initialize tracker
         */


        updateDomainHash();
        initializeIdsAndCookies();

        if (argmap.crossDomainLinker) {
          decorateLinks(argmap.crossDomainLinker);
        }
        /************************************************************
         * Public data and methods
         ************************************************************/

        /**
         * Get the domain session index also known as current memorized visit count.
         *
         * @return int Domain session index
         */


        apiMethods.getDomainSessionIndex = function () {
          return memorizedVisitCount;
        };
        /**
         * Get the page view ID as generated or provided by mutSnowplowState.pageViewId.
         *
         * @return string Page view ID
         */


        apiMethods.getPageViewId = function () {
          return getPageViewId();
        };
        /**
         * Expires current session and starts a new session.
         */


        apiMethods.newSession = newSession;
        /**
         * Get the cookie name as cookieNamePrefix + basename + . + domain.
         *
         * @return string Cookie name
         */

        apiMethods.getCookieName = function (basename) {
          return getSnowplowCookieName(basename);
        };
        /**
         * Get the current user ID (as set previously
         * with setUserId()).
         *
         * @return string Business-defined user ID
         */


        apiMethods.getUserId = function () {
          return businessUserId;
        };
        /**
         * Get visitor ID (from first party cookie)
         *
         * @return string Visitor ID in hexits (or null, if not yet known)
         */


        apiMethods.getDomainUserId = function () {
          return loadDomainUserIdCookie()[1];
        };
        /**
         * Get the visitor information (from first party cookie)
         *
         * @return array
         */


        apiMethods.getDomainUserInfo = function () {
          return loadDomainUserIdCookie();
        };
        /**
         * Get the user fingerprint
         *
         * @return string The user fingerprint
         */


        apiMethods.getUserFingerprint = function () {
          return userFingerprint;
        };
        /**
         * Specify the app ID
         *
         * @param int|string appId
         */


        apiMethods.setAppId = function (appId) {
          helpers.warn('setAppId is deprecated. Instead add an "appId" field to the argmap argument of newTracker.');
          core.setAppId(appId);
        };
        /**
         * Override referrer
         *
         * @param string url
         */


        apiMethods.setReferrerUrl = function (url) {
          customReferrer = url;
        };
        /**
         * Override url
         *
         * @param string url
         */


        apiMethods.setCustomUrl = function (url) {
          refreshUrl();
          configCustomUrl = resolveRelativeReference(locationHrefAlias, url);
        };
        /**
         * Override document.title
         *
         * @param string title
         */


        apiMethods.setDocumentTitle = function (title) {
          // So we know what document.title was at the time of trackPageView
          lastDocumentTitle = documentAlias.title;
          lastConfigTitle = title;
        };
        /**
         * Strip hash tag (or anchor) from URL
         *
         * @param bool enableFilter
         */


        apiMethods.discardHashTag = function (enableFilter) {
          configDiscardHashTag = enableFilter;
        };
        /**
         * Strip braces from URL
         *
         * @param bool enableFilter
         */


        apiMethods.discardBrace = function (enableFilter) {
          configDiscardBrace = enableFilter;
        };
        /**
         * Set first-party cookie name prefix
         *
         * @param string cookieNamePrefix
         */


        apiMethods.setCookieNamePrefix = function (cookieNamePrefix) {
          helpers.warn('setCookieNamePrefix is deprecated. Instead add a "cookieName" field to the argmap argument of newTracker.');
          configCookieNamePrefix = cookieNamePrefix;
        };
        /**
         * Set first-party cookie domain
         *
         * @param string domain
         */


        apiMethods.setCookieDomain = function (domain) {
          helpers.warn('setCookieDomain is deprecated. Instead add a "cookieDomain" field to the argmap argument of newTracker.');
          configCookieDomain = helpers.fixupDomain(domain);
          updateDomainHash();
        };
        /**
         * Set first-party cookie path
         *
         * @param string domain
         */


        apiMethods.setCookiePath = function (path) {
          configCookiePath = path;
          updateDomainHash();
        };
        /**
         * Set visitor cookie timeout (in seconds)
         *
         * @param int timeout
         */


        apiMethods.setVisitorCookieTimeout = function (timeout) {
          configVisitorCookieTimeout = timeout;
        };
        /**
         * Set session cookie timeout (in seconds)
         *
         * @param int timeout
         */


        apiMethods.setSessionCookieTimeout = function (timeout) {
          helpers.warn('setSessionCookieTimeout is deprecated. Instead add a "sessionCookieTimeout" field to the argmap argument of newTracker.');
          configSessionCookieTimeout = timeout;
        };
        /**
         * @param number seed The seed used for MurmurHash3
         */


        apiMethods.setUserFingerprintSeed = function (seed) {
          helpers.warn('setUserFingerprintSeed is deprecated. Instead add a "userFingerprintSeed" field to the argmap argument of newTracker.');
          configUserFingerprintHashSeed = seed;
          userFingerprint = detectors.detectSignature(configUserFingerprintHashSeed);
        };
        /**
         * Enable/disable user fingerprinting. User fingerprinting is enabled by default.
         * @param bool enable If false, turn off user fingerprinting
         */


        apiMethods.enableUserFingerprint = function (enable) {
          helpers.warn('enableUserFingerprintSeed is deprecated. Instead add a "userFingerprint" field to the argmap argument of newTracker.');

          if (!enable) {
            userFingerprint = '';
          }
        };
        /**
         * Prevent tracking if user's browser has Do Not Track feature enabled,
         * where tracking is:
         * 1) Sending events to a collector
         * 2) Setting first-party cookies
         * @param bool enable If true and Do Not Track feature enabled, don't track.
         */


        apiMethods.respectDoNotTrack = function (enable) {
          helpers.warn('This usage of respectDoNotTrack is deprecated. Instead add a "respectDoNotTrack" field to the argmap argument of newTracker.');
          var dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack;
          configDoNotTrack = enable && (dnt === 'yes' || dnt === '1');
        };
        /**
         * Enable querystring decoration for links pasing a filter
         *
         * @param function crossDomainLinker Function used to determine which links to decorate
         */


        apiMethods.crossDomainLinker = function (crossDomainLinkerCriterion) {
          decorateLinks(crossDomainLinkerCriterion);
        };
        /**
         * Install link tracker
         *
         * The default behaviour is to use actual click events. However, some browsers
         * (e.g., Firefox, Opera, and Konqueror) don't generate click events for the middle mouse button.
         *
         * To capture more "clicks", the pseudo click-handler uses mousedown + mouseup events.
         * This is not industry standard and is vulnerable to false positives (e.g., drag events).
         *
         * There is a Safari/Chrome/Webkit bug that prevents tracking requests from being sent
         * by either click handler.  The workaround is to set a target attribute (which can't
         * be "_self", "_top", or "_parent").
         *
         * @see https://bugs.webkit.org/show_bug.cgi?id=54783
         *
         * @param object criterion Criterion by which it will be decided whether a link will be tracked
         * @param bool pseudoClicks If true, use pseudo click-handler (mousedown+mouseup)
         * @param bool trackContent Whether to track the innerHTML of the link element
         * @param array context Context for all link click events
         */


        apiMethods.enableLinkClickTracking = function (criterion, pseudoClicks, trackContent, context) {
          if (mutSnowplowState.hasLoaded) {
            // the load event has already fired, add the click listeners now
            linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
            linkTrackingManager.addClickListeners();
          } else {
            // defer until page has loaded
            mutSnowplowState.registeredOnLoadHandlers.push(function () {
              linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
              linkTrackingManager.addClickListeners();
            });
          }
        };
        /**
         * Add click event listeners to links which have been added to the page since the
         * last time enableLinkClickTracking or refreshLinkClickTracking was used
         */


        apiMethods.refreshLinkClickTracking = function () {
          if (mutSnowplowState.hasLoaded) {
            linkTrackingManager.addClickListeners();
          } else {
            mutSnowplowState.registeredOnLoadHandlers.push(function () {
              linkTrackingManager.addClickListeners();
            });
          }
        };
        /**
         * Enables page activity tracking (sends page
         * pings to the Collector regularly).
         *
         * @param int minimumVisitLength Seconds to wait before sending first page ping
         * @param int heartBeatDelay Seconds to wait between pings
         */


        apiMethods.enableActivityTracking = function (minimumVisitLength, heartBeatDelay) {
          if (minimumVisitLength === parseInt(minimumVisitLength, 10) && heartBeatDelay === parseInt(heartBeatDelay, 10)) {
            activityTrackingEnabled = true;
            configMinimumVisitTime = new Date().getTime() + minimumVisitLength * 1000;
            configHeartBeatTimer = heartBeatDelay * 1000;
          } else {
            helpers.warn("Activity tracking not enabled, please provide integer values " + "for minimumVisitLength and heartBeatDelay.");
          }
        };
        /**
         * Triggers the activityHandler manually to allow external user defined
         * activity. i.e. While watching a video
         */


        apiMethods.updatePageActivity = function () {
          activityHandler();
        };
        /**
         * Enables automatic form tracking.
         * An event will be fired when a form field is changed or a form submitted.
         * This can be called multiple times: only forms not already tracked will be tracked.
         *
         * @param object config Configuration object determining which forms and fields to track.
         *                      Has two properties: "forms" and "fields"
         * @param array context Context for all form tracking events
         */


        apiMethods.enableFormTracking = function (config, context) {
          if (mutSnowplowState.hasLoaded) {
            formTrackingManager.configureFormTracking(config);
            formTrackingManager.addFormListeners(context);
          } else {
            mutSnowplowState.registeredOnLoadHandlers.push(function () {
              formTrackingManager.configureFormTracking(config);
              formTrackingManager.addFormListeners(context);
            });
          }
        };
        /**
         * Frame buster
         */


        apiMethods.killFrame = function () {
          if (windowAlias.location !== windowAlias.top.location) {
            windowAlias.top.location = windowAlias.location;
          }
        };
        /**
         * Redirect if browsing offline (aka file: buster)
         *
         * @param string url Redirect to this URL
         */


        apiMethods.redirectFile = function (url) {
          if (windowAlias.location.protocol === 'file:') {
            windowAlias.location = url;
          }
        };
        /**
         * Sets the opt out cookie.
         *
         * @param string name of the opt out cookie
         */


        apiMethods.setOptOutCookie = function (name) {
          configOptOutCookie = name;
        };
        /**
         * Count sites in pre-rendered state
         *
         * @param bool enable If true, track when in pre-rendered state
         */


        apiMethods.setCountPreRendered = function (enable) {
          configCountPreRendered = enable;
        };
        /**
         * Set the business-defined user ID for this user.
         *
         * @param string userId The business-defined user ID
         */


        apiMethods.setUserId = function (userId) {
          businessUserId = userId;
        };
        /**
         * Alias for setUserId.
         *
         * @param string userId The business-defined user ID
         */


        apiMethods.identifyUser = function (userId) {
          setUserId(userId);
        };
        /**
         * Set the business-defined user ID for this user using the location querystring.
         *
         * @param string queryName Name of a querystring name-value pair
         */


        apiMethods.setUserIdFromLocation = function (querystringField) {
          refreshUrl();
          businessUserId = helpers.fromQuerystring(querystringField, locationHrefAlias);
        };
        /**
         * Set the business-defined user ID for this user using the referrer querystring.
         *
         * @param string queryName Name of a querystring name-value pair
         */


        apiMethods.setUserIdFromReferrer = function (querystringField) {
          refreshUrl();
          businessUserId = helpers.fromQuerystring(querystringField, configReferrerUrl);
        };
        /**
         * Set the business-defined user ID for this user to the value of a cookie.
         *
         * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
         */


        apiMethods.setUserIdFromCookie = function (cookieName) {
          businessUserId = cookie.cookie(cookieName);
        };
        /**
         * Configure this tracker to log to a CloudFront collector.
         *
         * @param string distSubdomain The subdomain on your CloudFront collector's distribution
         */


        apiMethods.setCollectorCf = function (distSubdomain) {
          configCollectorUrl = collectorUrlFromCfDist(distSubdomain);
        };
        /**
         *
         * Specify the Snowplow collector URL. No need to include HTTP
         * or HTTPS - we will add this.
         *
         * @param string rawUrl The collector URL minus protocol and /i
         */


        apiMethods.setCollectorUrl = function (rawUrl) {
          configCollectorUrl = asCollectorUrl(rawUrl);
        };
        /**
         * Specify the platform
         *
         * @param string platform Overrides the default tracking platform
         */


        apiMethods.setPlatform = function (platform) {
          helpers.warn('setPlatform is deprecated. Instead add a "platform" field to the argmap argument of newTracker.');
          core.setPlatform(platform);
        };
        /**
         *
         * Enable Base64 encoding for self-describing event payload
         *
         * @param bool enabled A boolean value indicating if the Base64 encoding for self-describing events should be enabled or not
         */


        apiMethods.encodeBase64 = function (enabled) {
          helpers.warn('This usage of encodeBase64 is deprecated. Instead add an "encodeBase64" field to the argmap argument of newTracker.');
          core.setBase64Encoding(enabled);
        };
        /**
         * Send all events in the outQueue
         * Use only when sending POSTs with a bufferSize of at least 2
         */


        apiMethods.flushBuffer = function () {
          outQueueManager.executeQueue();
        };
        /**
         * Add the geolocation context to all events
         */


        apiMethods.enableGeolocationContext = enableGeolocationContext,
        /**
         * Log visit to this page
         *
         * @param string customTitle
         * @param object Custom context relating to the event
         * @param object contextCallback Function returning an array of contexts
         * @param tstamp number or Timestamp object
         */
        apiMethods.trackPageView = function (customTitle, context, contextCallback, tstamp) {
          trackCallback(function () {
            logPageView(customTitle, context, contextCallback, tstamp);
          });
        };
        /**
         * Track a structured event happening on this page.
         *
         * Replaces trackEvent, making clear that the type
         * of event being tracked is a structured one.
         *
         * @param string category The name you supply for the group of objects you want to track
         * @param string action A string that is uniquely paired with each category, and commonly used to define the type of user interaction for the web object
         * @param string label (optional) An optional string to provide additional dimensions to the event data
         * @param string property (optional) Describes the object or the action performed on it, e.g. quantity of item added to basket
         * @param int|float|string value (optional) An integer that you can use to provide numerical data about the user event
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */

        apiMethods.trackStructEvent = function (category, action, label, property, value, context, tstamp) {
          trackCallback(function () {
            core.trackStructEvent(category, action, label, property, value, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a self-describing event (previously unstructured event) happening on this page.
         *
         * @param object eventJson Contains the properties and schema location for the event
         * @param object context Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackSelfDescribingEvent = function (eventJson, context, tstamp) {
          trackCallback(function () {
            core.trackSelfDescribingEvent(eventJson, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Alias for `trackSelfDescribingEvent`, left for compatibility
         */


        apiMethods.trackUnstructEvent = function (eventJson, context, tstamp) {
          trackCallback(function () {
            core.trackSelfDescribingEvent(eventJson, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an ecommerce transaction
         *
         * @param string orderId Required. Internal unique order id number for this transaction.
         * @param string affiliation Optional. Partner or store affiliation.
         * @param string total Required. Total amount of the transaction.
         * @param string tax Optional. Tax amount of the transaction.
         * @param string shipping Optional. Shipping charge for the transaction.
         * @param string city Optional. City to associate with transaction.
         * @param string state Optional. State to associate with transaction.
         * @param string country Optional. Country to associate with transaction.
         * @param string currency Optional. Currency to associate with this transaction.
         * @param object context Optional. Context relating to the event.
         * @param tstamp number or Timestamp object
         */


        apiMethods.addTrans = function (orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
          ecommerceTransaction.transaction = {
            orderId: orderId,
            affiliation: affiliation,
            total: total,
            tax: tax,
            shipping: shipping,
            city: city,
            state: state,
            country: country,
            currency: currency,
            context: context,
            tstamp: tstamp
          };
        };
        /**
         * Track an ecommerce transaction item
         *
         * @param string orderId Required Order ID of the transaction to associate with item.
         * @param string sku Required. Item's SKU code.
         * @param string name Optional. Product name.
         * @param string category Optional. Product category.
         * @param string price Required. Product price.
         * @param string quantity Required. Purchase quantity.
         * @param string currency Optional. Product price currency.
         * @param object context Optional. Context relating to the event.
         * @param tstamp number or Timestamp object
         */


        apiMethods.addItem = function (orderId, sku, name, category, price, quantity, currency, context, tstamp) {
          ecommerceTransaction.items.push({
            orderId: orderId,
            sku: sku,
            name: name,
            category: category,
            price: price,
            quantity: quantity,
            currency: currency,
            context: context,
            tstamp: tstamp
          });
        };
        /**
         * Commit the ecommerce transaction
         *
         * This call will send the data specified with addTrans,
         * addItem methods to the tracking server.
         */


        apiMethods.trackTrans = function () {
          trackCallback(function () {
            logTransaction(ecommerceTransaction.transaction.orderId, ecommerceTransaction.transaction.affiliation, ecommerceTransaction.transaction.total, ecommerceTransaction.transaction.tax, ecommerceTransaction.transaction.shipping, ecommerceTransaction.transaction.city, ecommerceTransaction.transaction.state, ecommerceTransaction.transaction.country, ecommerceTransaction.transaction.currency, ecommerceTransaction.transaction.context, ecommerceTransaction.transaction.tstamp);

            for (var i = 0; i < ecommerceTransaction.items.length; i++) {
              var item = ecommerceTransaction.items[i];
              logTransactionItem(item.orderId, item.sku, item.name, item.category, item.price, item.quantity, item.currency, item.context, item.tstamp);
            }

            ecommerceTransaction = ecommerceTransactionTemplate();
          });
        };
        /**
         * Manually log a click from your own code
         *
         * @param string elementId
         * @param array elementClasses
         * @param string elementTarget
         * @param string targetUrl
         * @param string elementContent innerHTML of the element
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */
        // TODO: break this into trackLink(destUrl) and trackDownload(destUrl)


        apiMethods.trackLinkClick = function (targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp) {
          trackCallback(function () {
            core.trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an ad being served
         *
         * @param string impressionId Identifier for a particular ad impression
         * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
         * @param number cost Cost
         * @param string bannerId Identifier for the ad banner displayed
         * @param string zoneId Identifier for the ad zone
         * @param string advertiserId Identifier for the advertiser
         * @param string campaignId Identifier for the campaign which the banner belongs to
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackAdImpression = function (impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
          trackCallback(function () {
            core.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an ad being clicked
         *
         * @param string clickId Identifier for the ad click
         * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
         * @param number cost Cost
         * @param string targetUrl (required) The link's target URL
         * @param string bannerId Identifier for the ad banner displayed
         * @param string zoneId Identifier for the ad zone
         * @param string impressionId Identifier for a particular ad impression
         * @param string advertiserId Identifier for the advertiser
         * @param string campaignId Identifier for the campaign which the banner belongs to
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackAdClick = function (targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp) {
          trackCallback(function () {
            core.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an ad conversion event
         *
         * @param string conversionId Identifier for the ad conversion event
         * @param number cost Cost
         * @param string category The name you supply for the group of objects you want to track
         * @param string action A string that is uniquely paired with each category
         * @param string property Describes the object of the conversion or the action performed on it
         * @param number initialValue Revenue attributable to the conversion at time of conversion
         * @param string advertiserId Identifier for the advertiser
         * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
         * @param string campaignId Identifier for the campaign which the banner belongs to
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackAdConversion = function (conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp) {
          trackCallback(function () {
            core.trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a social interaction event
         *
         * @param string action (required) Social action performed
         * @param string network (required) Social network
         * @param string target Object of the social action e.g. the video liked, the tweet retweeted
         * @param object Custom context relating to the event
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackSocialInteraction = function (action, network, target, context, tstamp) {
          trackCallback(function () {
            core.trackSocialInteraction(action, network, target, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an add-to-cart event
         *
         * @param string sku Required. Item's SKU code.
         * @param string name Optional. Product name.
         * @param string category Optional. Product category.
         * @param string unitPrice Optional. Product price.
         * @param string quantity Required. Quantity added.
         * @param string currency Optional. Product price currency.
         * @param array context Optional. Context relating to the event.
         * @param tstamp number or Timestamp object
         */


        apiMethods.trackAddToCart = function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
          trackCallback(function () {
            core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a remove-from-cart event
         *
         * @param string sku Required. Item's SKU code.
         * @param string name Optional. Product name.
         * @param string category Optional. Product category.
         * @param string unitPrice Optional. Product price.
         * @param string quantity Required. Quantity removed.
         * @param string currency Optional. Product price currency.
         * @param array context Optional. Context relating to the event.
         * @param tstamp Opinal number or Timestamp object
         */


        apiMethods.trackRemoveFromCart = function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
          trackCallback(function () {
            core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track an internal search event
         *
         * @param array terms Search terms
         * @param object filters Search filters
         * @param number totalResults Number of results
         * @param number pageResults Number of results displayed on page
         * @param array context Optional. Context relating to the event.
         * @param tstamp Opinal number or Timestamp object
         */


        apiMethods.trackSiteSearch = function (terms, filters, totalResults, pageResults, context, tstamp) {
          trackCallback(function () {
            core.trackSiteSearch(terms, filters, totalResults, pageResults, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a timing event (such as the time taken for a resource to load)
         *
         * @param string category Required.
         * @param string variable Required.
         * @param number timing Required.
         * @param string label Optional.
         * @param array context Optional. Context relating to the event.
         * @param tstamp Opinal number or Timestamp object
         */


        apiMethods.trackTiming = function (category, variable, timing, label, context, tstamp) {
          trackCallback(function () {
            core.trackSelfDescribingEvent({
              schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
              data: {
                category: category,
                variable: variable,
                timing: timing,
                label: label
              }
            }, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a consent withdrawn action
         *
         * @param {boolean} all - Indicates user withdraws all consent regardless of context documents.
         * @param {string} [id] - Number associated with document.
         * @param {string} [version] - Document version number.
         * @param {string} [name] - Document name.
         * @param {string} [description] - Document description.
         * @param {array} [context] - Context relating to the event.
         * @param {number|Timestamp} [tstamp] - Number or Timestamp object.
         */


        apiMethods.trackConsentWithdrawn = function (all, id, version, name, description, context, tstamp) {
          trackCallback(function () {
            core.trackConsentWithdrawn(all, id, version, name, description, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a consent granted action
         *
         * @param {string} id - ID number associated with document.
         * @param {string} version - Document version number.
         * @param {string} [name] - Document name.
         * @param {string} [description] - Document description.
         * @param {string} [expiry] - Date-time when consent document(s) expire.
         * @param {array} [context] - Context containing consent documents.
         * @param {Timestamp|number} [tstamp] - number or Timestamp object.
         */


        apiMethods.trackConsentGranted = function (id, version, name, description, expiry, context, tstamp) {
          trackCallback(function () {
            core.trackConsentGranted(id, version, name, description, expiry, addCommonContexts(context), tstamp);
          });
        };
        /**
         * Track a GA Enhanced Ecommerce Action with all stored
         * Enhanced Ecommerce contexts
         *
         * @param string action
         * @param array context Optional. Context relating to the event.
         * @param tstamp Opinal number or Timestamp object
         */


        apiMethods.trackEnhancedEcommerceAction = function (action, context, tstamp) {
          var combinedEnhancedEcommerceContexts = enhancedEcommerceContexts.concat(context || []);
          enhancedEcommerceContexts.length = 0;
          trackCallback(function () {
            core.trackSelfDescribingEvent({
              schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
              data: {
                action: action
              }
            }, addCommonContexts(combinedEnhancedEcommerceContexts), tstamp);
          });
        };
        /**
         * Adds a GA Enhanced Ecommerce Action Context
         *
         * @param string id
         * @param string affiliation
         * @param number revenue
         * @param number tax
         * @param number shipping
         * @param string coupon
         * @param string list
         * @param integer step
         * @param string option
         * @param string currency
         */


        apiMethods.addEnhancedEcommerceActionContext = function (id, affiliation, revenue, tax, shipping, coupon, list, step, option, currency) {
          enhancedEcommerceContexts.push({
            schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
            data: {
              id: id,
              affiliation: affiliation,
              revenue: helpers.parseFloat(revenue),
              tax: helpers.parseFloat(tax),
              shipping: helpers.parseFloat(shipping),
              coupon: coupon,
              list: list,
              step: helpers.parseInt(step),
              option: option,
              currency: currency
            }
          });
        };
        /**
         * Adds a GA Enhanced Ecommerce Impression Context
         *
         * @param string id
         * @param string name
         * @param string list
         * @param string brand
         * @param string category
         * @param string variant
         * @param integer position
         * @param number price
         * @param string currency
         */


        apiMethods.addEnhancedEcommerceImpressionContext = function (id, name, list, brand, category, variant, position, price, currency) {
          enhancedEcommerceContexts.push({
            schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
            data: {
              id: id,
              name: name,
              list: list,
              brand: brand,
              category: category,
              variant: variant,
              position: helpers.parseInt(position),
              price: helpers.parseFloat(price),
              currency: currency
            }
          });
        };
        /**
         * Adds a GA Enhanced Ecommerce Product Context
         *
         * @param string id
         * @param string name
         * @param string list
         * @param string brand
         * @param string category
         * @param string variant
         * @param number price
         * @param integer quantity
         * @param string coupon
         * @param integer position
         * @param string currency
         */


        apiMethods.addEnhancedEcommerceProductContext = function (id, name, list, brand, category, variant, price, quantity, coupon, position, currency) {
          enhancedEcommerceContexts.push({
            schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
            data: {
              id: id,
              name: name,
              list: list,
              brand: brand,
              category: category,
              variant: variant,
              price: helpers.parseFloat(price),
              quantity: helpers.parseInt(quantity),
              coupon: coupon,
              position: helpers.parseInt(position),
              currency: currency
            }
          });
        };
        /**
         * Adds a GA Enhanced Ecommerce Promo Context
         *
         * @param string id
         * @param string name
         * @param string creative
         * @param string position
         * @param string currency
         */


        apiMethods.addEnhancedEcommercePromoContext = function (id, name, creative, position, currency) {
          enhancedEcommerceContexts.push({
            schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
            data: {
              id: id,
              name: name,
              creative: creative,
              position: position,
              currency: currency
            }
          });
        };
        /* Adds GDPR context to all events.
        * basisForProcessing is a required enum, accepted values are:
        * consent, contract, legalObligation, vitalInterests, publicTask or legitimateInterests
        * All other arguments are strings
        */


        apiMethods.enableGdprContext = function (basisForProcessing) {
          var documentId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var documentVersion = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          var documentDescription = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
          var basis = gdprBasisEnum[basisForProcessing];

          if (!basis) {
            helpers.warn('enableGdprContext failed. basisForProcessing must be set to one of: consent, legalObligation, vitalInterests publicTask, legitimateInterests');
            return;
          } else {
            autoContexts.gdprBasis = true;
            gdprBasisData = {
              gdprBasis: basis,
              gdprDocId: documentId,
              gdprDocVer: documentVersion,
              gdprDocDesc: documentDescription
            };
          }
        };
        /**
         * All provided contexts will be sent with every event
         *
         * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
         */


        apiMethods.addGlobalContexts = function (contexts) {
          core.addGlobalContexts(contexts);
        };
        /**
         * All provided contexts will no longer be sent with every event
         *
         * @param contexts Array<ContextPrimitive | ConditionalContextProvider>
         */


        apiMethods.removeGlobalContexts = function (contexts) {
          core.removeGlobalContexts(contexts);
        };
        /**
         * Clear all global contexts that are sent with events
         */


        apiMethods.clearGlobalContexts = function () {
          core.clearGlobalContexts();
        };
        /**
         * Enable tracking of unhandled exceptions with custom contexts
         *
         * @param filter Function ErrorEvent => Bool to check whether error should be tracker
         * @param contextsAdder Function ErrorEvent => Array<Context> to add custom contexts with
         *		             internal state based on particular error
         */


        apiMethods.enableErrorTracking = function (filter, contextsAdder) {
          errorManager.enableErrorTracking(filter, contextsAdder, addCommonContexts());
        };
        /**
         * Track unhandled exception.
         * This method supposed to be used inside try/catch block
         *
         * @param message string Message appeared in console
         * @param filename string Source file (not used)
         * @param lineno number Line number
         * @param colno number Column number (not used)
         * @param error Error error object (not present in all browsers)
         * @param contexts Array of custom contexts
         */


        apiMethods.trackError = function (message, filename, lineno, colno, error, contexts) {
          var enrichedContexts = addCommonContexts(contexts);
          errorManager.trackError(message, filename, lineno, colno, error, enrichedContexts);
        };
        /**
         * Stop regenerating `pageViewId` (available from `web_page` context)
         */


        apiMethods.preservePageViewId = function () {
          preservePageViewId = true;
        };

        apiMethods.setDebug = function (isDebug) {
          debug = Boolean(isDebug).valueOf();
          updateReturnMethods();
        }; // Create guarded methods from apiMethods,
        // and set returnMethods to apiMethods or safeMethods depending on value of debug


        safeMethods = productionize(apiMethods);
        updateReturnMethods();
        return returnMethods;
      };
    })();
  }, {
    "./errors": 167,
    "./forms": 168,
    "./guard": 169,
    "./lib/detectors": 172,
    "./lib/helpers": 173,
    "./lib/proxies": 174,
    "./links": 175,
    "./out_queue": 176,
    "browser-cookie-lite": 1,
    "lodash/forEach": 123,
    "lodash/map": 143,
    "sha1": 154,
    "snowplow-tracker-core": 155,
    "uuid": 162
  }]
}, {}, [171]);
