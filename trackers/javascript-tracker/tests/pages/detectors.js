var detectors = (function () {
  'use strict';

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

  var isUndefined_1 = isUndefined;

  var commonjsGlobal =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : typeof self !== 'undefined'
      ? self
      : {};

  function getAugmentedNamespace(n) {
    if (n.__esModule) return n;
    var a = Object.defineProperty({}, '__esModule', { value: true });
    Object.keys(n).forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(n, k);
      Object.defineProperty(
        a,
        k,
        d.get
          ? d
          : {
              enumerable: true,
              get: function () {
                return n[k];
              },
            }
      );
    });
    return a;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
    return fn(module, module.exports), module.exports;
  }

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
  var jstz = createCommonjsModule(function (module, exports) {
    /*jslint undef: true */

    /*global console, exports*/
    (function (root) {
      /**
       * Namespace to hold all the code for timezone detection.
       */
      var jstz = (function () {
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
              return january_offset + ',1';
            } else if (diff > 0) {
              return june_offset + ',1,' + HEMISPHERE_SOUTH;
            }

            return january_offset + ',0';
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
                'Australia/Perth': new Date(2008, 10, 1, 1, 0, 0, 0),
              };
            return dst_starts[tz_name];
          };

        return {
          determine: determine,
          date_is_dst: date_is_dst,
          dst_start_for: dst_start_for,
        };
      })();
      /**
       * Simple object to perform ambiguity check and to return name of time zone.
       */

      jstz.TimeZone = function (tz_name) {
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
            'Africa/Johannesburg': ['Asia/Gaza', 'Africa/Cairo'],
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
          },
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
        '840,0': 'Pacific/Kiritimati',
      };

      {
        exports.jstz = jstz;
      }
    })();
  });

  function _typeof(obj) {
    '@babel/helpers - typeof';

    if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var freeGlobal =
    _typeof(commonjsGlobal) == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var _freeGlobal = freeGlobal;

  /** Detect free variable `self`. */

  var freeSelf =
    (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
  /** Used as a reference to the global object. */

  var root = _freeGlobal || freeSelf || Function('return this')();
  var _root = root;

  /** Built-in value references. */

  var _Symbol2 = _root.Symbol;
  var _Symbol = _Symbol2;

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

  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
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

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;
  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */

  var nativeObjectToString$1 = objectProto$1.toString;
  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */

  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */

  var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
  /** Built-in value references. */

  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
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

    return symToStringTag$1 && symToStringTag$1 in Object(value) ? _getRawTag(value) : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

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

  var isObjectLike_1 = isObjectLike;

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
    return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
  }

  var _baseIsArguments = baseIsArguments;

  /** Used for built-in method references. */

  var objectProto$2 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
  /** Built-in value references. */

  var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
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

  var isArguments = _baseIsArguments(
    (function () {
      return arguments;
    })()
  )
    ? _baseIsArguments
    : function (value) {
        return (
          isObjectLike_1(value) && hasOwnProperty$1.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee')
        );
      };

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

  var stubFalse_1 = stubFalse;

  var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Built-in value references. */

    var Buffer = moduleExports ? _root.Buffer : undefined;
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

    var isBuffer = nativeIsBuffer || stubFalse_1;
    module.exports = isBuffer;
  });

  var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;
    /** Detect free variable `module`. */

    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
    /** Detect the popular CommonJS extension `module.exports`. */

    var moduleExports = freeModule && freeModule.exports === freeExports;
    /** Detect free variable `process` from Node.js. */

    var freeProcess = moduleExports && _freeGlobal.process;
    /** Used to access faster Node.js helpers. */

    var nodeUtil = (function () {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        } // Legacy `process.binding('util')` for Node.js < 10.

        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    })();

    module.exports = nodeUtil;
  });

  /* Node.js helper references. */

  var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

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

  var isObject_1 = isObject;

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
    if (!isObject_1(value)) {
      return false;
    } // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.

    var tag = _baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction;

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

  var _listCacheClear = listCacheClear;

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
    return value === other || (value !== value && other !== other);
  }

  var eq_1 = eq;

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
      if (eq_1(array[length][0], key)) {
        return length;
      }
    }

    return -1;
  }

  var _assocIndexOf = assocIndexOf;

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
      index = _assocIndexOf(data, key);

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

  var _listCacheDelete = listCacheDelete;

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
      index = _assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet;

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
    return _assocIndexOf(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas;

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
      index = _assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }

    return this;
  }

  var _listCacheSet = listCacheSet;

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

  ListCache.prototype.clear = _listCacheClear;
  ListCache.prototype['delete'] = _listCacheDelete;
  ListCache.prototype.get = _listCacheGet;
  ListCache.prototype.has = _listCacheHas;
  ListCache.prototype.set = _listCacheSet;
  var _ListCache = ListCache;

  /** Used to detect overreaching core-js shims. */

  var coreJsData = _root['__core-js_shared__'];
  var _coreJsData = coreJsData;

  /** Used to detect methods masquerading as native. */

  var maskSrcKey = (function () {
    var uid = /[^.]+$/.exec((_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO) || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  })();
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

  var _isMasked = isMasked;

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

  var _toSource = toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  /** Used to detect host constructors (Safari). */

  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  /** Used for built-in method references. */

  var funcProto$1 = Function.prototype,
    objectProto$3 = Object.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString$1 = funcProto$1.toString;
  /** Used to check objects for own properties. */

  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
  /** Used to detect if a method is native. */

  var reIsNative = RegExp(
    '^' +
      funcToString$1
        .call(hasOwnProperty$2)
        .replace(reRegExpChar, '\\$&')
        .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
      '$'
  );
  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */

  function baseIsNative(value) {
    if (!isObject_1(value) || _isMasked(value)) {
      return false;
    }

    var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
  }

  var _baseIsNative = baseIsNative;

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

  var _getValue = getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */

  function getNative(object, key) {
    var value = _getValue(object, key);
    return _baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative;

  /* Built-in method references that are verified to be native. */

  var Map = _getNative(_root, 'Map');
  var _Map = Map;

  /* Built-in method references that are verified to be native. */

  var nativeCreate = _getNative(Object, 'create');
  var _nativeCreate = nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */

  function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear;

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

  var _hashDelete = hashDelete;

  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  /** Used for built-in method references. */

  var objectProto$4 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
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

    if (_nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }

    return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;

  /** Used for built-in method references. */

  var objectProto$5 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
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
    return _nativeCreate ? data[key] !== undefined : hasOwnProperty$4.call(data, key);
  }

  var _hashHas = hashHas;

  /** Used to stand-in for `undefined` hash values. */

  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
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
    data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet;

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

  Hash.prototype.clear = _hashClear;
  Hash.prototype['delete'] = _hashDelete;
  Hash.prototype.get = _hashGet;
  Hash.prototype.has = _hashHas;
  Hash.prototype.set = _hashSet;
  var _Hash = Hash;

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
      hash: new _Hash(),
      map: new (_Map || _ListCache)(),
      string: new _Hash(),
    };
  }

  var _mapCacheClear = mapCacheClear;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = _typeof(value);

    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean'
      ? value !== '__proto__'
      : value === null;
  }

  var _isKeyable = isKeyable;

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
    return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }

  var _getMapData = getMapData;

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
    var result = _getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete;

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
    return _getMapData(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet;

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
    return _getMapData(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas;

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
    var data = _getMapData(this, key),
      size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet;

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

  MapCache.prototype.clear = _mapCacheClear;
  MapCache.prototype['delete'] = _mapCacheDelete;
  MapCache.prototype.get = _mapCacheGet;
  MapCache.prototype.has = _mapCacheHas;
  MapCache.prototype.set = _mapCacheSet;
  var _MapCache = MapCache;

  /** Built-in value references. */

  var Uint8Array = _root.Uint8Array;

  /** Used to convert symbols to primitives and strings. */

  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /* Built-in method references that are verified to be native. */

  var DataView = _getNative(_root, 'DataView');
  var _DataView = DataView;

  /* Built-in method references that are verified to be native. */

  var Promise = _getNative(_root, 'Promise');
  var _Promise = Promise;

  /* Built-in method references that are verified to be native. */

  var Set = _getNative(_root, 'Set');
  var _Set = Set;

  /* Built-in method references that are verified to be native. */

  var WeakMap = _getNative(_root, 'WeakMap');
  var _WeakMap = WeakMap;

  /** `Object#toString` result references. */

  var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';
  var dataViewTag = '[object DataView]';
  /** Used to detect maps, sets, and weakmaps. */

  var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);
  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */

  var getTag = _baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

  if (
    (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (_Map && getTag(new _Map()) != mapTag) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set()) != setTag) ||
    (_WeakMap && getTag(new _WeakMap()) != weakMapTag)
  ) {
    getTag = function getTag(value) {
      var result = _baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

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
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
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

    memoized.cache = new (memoize.Cache || _MapCache)();
    return memoized;
  } // Expose `MapCache`.

  memoize.Cache = _MapCache;
  var memoize_1 = memoize;

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
    var result = memoize_1(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }

      return key;
    });
    var cache = result.cache;
    return result;
  }

  var _memoizeCapped = memoizeCapped;

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

  var stringToPath = _memoizeCapped(function (string) {
    var result = [];

    if (
      string.charCodeAt(0) === 46
      /* . */
    ) {
      result.push('');
    }

    string.replace(rePropName, function (match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
    });
    return result;
  });

  /** Used to convert symbols to primitives and strings. */

  var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

  /*
   * JavaScript tracker for Snowplow: Snowplow.js
   *
   * Significant portions copyright 2010 Anthon Pang. Remainder copyright
   * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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
  var documentAlias = document;
  /**
   * Get and set the cookies associated with the current document in browser
   * This implementation always returns a string, returns the cookie value if only name is specified
   *
   * @param name The cookie name (required)
   * @param value The cookie value
   * @param ttl The cookie Time To Live (seconds)
   * @param path The cookies path
   * @param domain The cookies domain
   * @param samesite The cookies samesite attribute
   * @param secure Boolean to specify if cookie should be secure
   * @return string The cookies value
   */

  function cookie(name, value, ttl, path, domain, samesite, secure) {
    if (arguments.length > 1) {
      return (documentAlias.cookie =
        name +
        '=' +
        encodeURIComponent(value) +
        (ttl ? '; Expires=' + new Date(+new Date() + ttl * 1000).toUTCString() : '') +
        (path ? '; Path=' + path : '') +
        (domain ? '; Domain=' + domain : '') +
        (samesite ? '; SameSite=' + samesite : '') +
        (secure ? '; Secure' : ''));
    }

    return decodeURIComponent((('; ' + documentAlias.cookie).split('; ' + name + '=')[1] || '').split(';')[0]);
  }
  function isFunction$1(func) {
    if (func && typeof func === 'function') {
      return true;
    }

    return false;
  }

  /*
   * JavaScript tracker for Snowplow: detectors.js
   *
   * Significant portions copyright 2010 Anthon Pang. Remainder copyright
   * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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
  var windowAlias = window,
    navigatorAlias = navigator,
    screenAlias = screen,
    documentAlias$1 = document;
  /*
   * Checks whether sessionStorage is available, in a way that
   * does not throw a SecurityError in Firefox if "always ask"
   * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
   */

  function hasSessionStorage() {
    try {
      return !!windowAlias.sessionStorage;
    } catch (e) {
      return true; // SecurityError when referencing it means it exists
    }
  }
  /*
   * Checks whether localStorage is available, in a way that
   * does not throw a SecurityError in Firefox if "always ask"
   * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
   */

  function hasLocalStorage() {
    try {
      return !!windowAlias.localStorage;
    } catch (e) {
      return true; // SecurityError when referencing it means it exists
    }
  }
  /*
   * Checks whether localStorage is accessible
   * sets and removes an item to handle private IOS5 browsing
   * (http://git.io/jFB2Xw)
   */

  function localStorageAccessible() {
    var mod = 'modernizr';

    if (!hasLocalStorage()) {
      return false;
    }

    try {
      windowAlias.localStorage.setItem(mod, mod);
      windowAlias.localStorage.removeItem(mod);
      return true;
    } catch (e) {
      return false;
    }
  }
  /*
   * Does browser have cookies enabled (for this site)?
   */

  function hasCookies(testCookieName) {
    var cookieName = testCookieName || 'testcookie';

    if (isUndefined_1(navigatorAlias.cookieEnabled)) {
      cookie(cookieName, '1');
      return cookie(cookieName) === '1' ? '1' : '0';
    }

    return navigatorAlias.cookieEnabled ? '1' : '0';
  }
  /*
   * Returns visitor timezone
   */

  function detectTimezone() {
    return jstz.jstz.determine().name();
  }
  /**
   * Gets the current viewport.
   *
   * Code based on:
   * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
   * - http://responsejs.com/labs/dimensions/
   */

  function detectViewport() {
    var e = windowAlias,
      a = 'inner';

    if (!('innerWidth' in windowAlias)) {
      a = 'client';
      e = documentAlias$1.documentElement || documentAlias$1.body;
    }

    var width = e[a + 'Width'];
    var height = e[a + 'Height'];

    if (width >= 0 && height >= 0) {
      return width + 'x' + height;
    } else {
      return null;
    }
  }
  /**
   * Gets the dimensions of the current
   * document.
   *
   * Code based on:
   * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
   */

  function detectDocumentSize() {
    var de = documentAlias$1.documentElement,
      // Alias
      be = documentAlias$1.body,
      // document.body may not have rendered, so check whether be.offsetHeight is null
      bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;
    var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
    var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight);
    return isNaN(w) || isNaN(h) ? '' : w + 'x' + h;
  }
  /**
   * Returns browser features (plugins, resolution, cookies)
   *
   * @param boolean useCookies Whether to test for cookies
   * @param string testCookieName Name to use for the test cookie
   * @return Object containing browser features
   */

  function detectBrowserFeatures(useCookies, testCookieName) {
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
        ag: 'application/x-silverlight',
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

    if (
      navigatorAlias.constructor === window.Navigator &&
      typeof navigatorAlias.javaEnabled !== 'unknown' &&
      !isUndefined_1(navigatorAlias.javaEnabled) &&
      navigatorAlias.javaEnabled()
    ) {
      features.java = '1';
    } // Firefox

    if (isFunction$1(windowAlias.GearsFactory)) {
      features.gears = '1';
    } // Other browser features

    features.res = screenAlias.width + 'x' + screenAlias.height;
    features.cd = screenAlias.colorDepth;

    if (useCookies) {
      features.cookie = hasCookies(testCookieName);
    }

    return features;
  }

  var detectors = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    hasSessionStorage: hasSessionStorage,
    hasLocalStorage: hasLocalStorage,
    localStorageAccessible: localStorageAccessible,
    hasCookies: hasCookies,
    detectTimezone: detectTimezone,
    detectViewport: detectViewport,
    detectDocumentSize: detectDocumentSize,
    detectBrowserFeatures: detectBrowserFeatures,
  });

  var detectors$1 = /*@__PURE__*/ getAugmentedNamespace(detectors);

  /*
   * JavaScript tracker for Snowplow: tests/scripts/detectors.js
   *
   * Significant portions copyright 2010 Anthon Pang. Remainder copyright
   * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
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
  document.getElementById('detectViewport').innerHTML = detectors$1.detectViewport();
  document.getElementById('detectDocumentDimensions').innerHTML = detectors$1.detectDocumentSize();
  document.getElementById('localStorageAccessible').innerHTML = detectors$1.localStorageAccessible();
  document.getElementById('hasSessionStorage').innerHTML = detectors$1.hasSessionStorage();
  document.getElementById('hasCookies').innerHTML = detectors$1.hasCookies();
  document.getElementById('detectTimezone').innerHTML = detectors$1.detectTimezone();
  document.getElementById('detectBrowserFeatures').innerHTML = JSON.stringify(
    detectors$1.detectBrowserFeatures(),
    undefined,
    2
  );
  var detectors_1 = {};

  return detectors_1;
})();
