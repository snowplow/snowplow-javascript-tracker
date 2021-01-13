(function () {
  'use strict';

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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly)
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== 'undefined' && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === 'Object' && o.constructor) n = o.constructor.name;
    if (n === 'Map' || n === 'Set') return Array.from(o);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError(
      'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
      if (
        Array.isArray(o) ||
        (it = _unsupportedIterableToArray(o)) ||
        (allowArrayLike && o && typeof o.length === 'number')
      ) {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length)
              return {
                done: true,
              };
            return {
              done: false,
              value: o[i++],
            };
          },
          e: function (e) {
            throw e;
          },
          f: F,
        };
      }

      throw new TypeError(
        'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
      );
    }

    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      },
    };
  }

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

  var _arrayMap = arrayMap;

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

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */

  function stackClear() {
    this.__data__ = new _ListCache();
    this.size = 0;
  }

  var _stackClear = stackClear;

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

  var _stackDelete = stackDelete;

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

  var _stackGet = stackGet;

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

  var _stackHas = stackHas;

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

  function createCommonjsModule(fn) {
    var module = { exports: {} };
    return fn(module, module.exports), module.exports;
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
    objectProto$2 = Object.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString$1 = funcProto$1.toString;
  /** Used to check objects for own properties. */

  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
  /** Used to detect if a method is native. */

  var reIsNative = RegExp(
    '^' +
      funcToString$1
        .call(hasOwnProperty$1)
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

  var objectProto$3 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
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

    return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;

  /** Used for built-in method references. */

  var objectProto$4 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
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
    return _nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
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

    if (data instanceof _ListCache) {
      var pairs = data.__data__;

      if (!_Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }

      data = this.__data__ = new _MapCache(pairs);
    }

    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */

  function Stack(entries) {
    var data = (this.__data__ = new _ListCache(entries));
    this.size = data.size;
  } // Add methods to `Stack`.

  Stack.prototype.clear = _stackClear;
  Stack.prototype['delete'] = _stackDelete;
  Stack.prototype.get = _stackGet;
  Stack.prototype.has = _stackHas;
  Stack.prototype.set = _stackSet;
  var _Stack = Stack;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
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
    this.__data__.set(value, HASH_UNDEFINED$2);

    return this;
  }

  var _setCacheAdd = setCacheAdd;

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

  var _setCacheHas = setCacheHas;

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
    this.__data__ = new _MapCache();

    while (++index < length) {
      this.add(values[index]);
    }
  } // Add methods to `SetCache`.

  SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
  SetCache.prototype.has = _setCacheHas;
  var _SetCache = SetCache;

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

  var _arraySome = arraySome;

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

  var _cacheHas = cacheHas;

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
    } // Check that cyclic values are equal.

    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);

    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }

    var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG ? new _SetCache() : undefined;
    stack.set(array, other);
    stack.set(other, array); // Ignore non-index properties.

    while (++index < arrLength) {
      var arrValue = array[index],
        othValue = other[index];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, arrValue, index, other, array, stack)
          : customizer(arrValue, othValue, index, array, other, stack);
      }

      if (compared !== undefined) {
        if (compared) {
          continue;
        }

        result = false;
        break;
      } // Recursively compare arrays (susceptible to call stack limits).

      if (seen) {
        if (
          !_arraySome(other, function (othValue, othIndex) {
            if (
              !_cacheHas(seen, othIndex) &&
              (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))
            ) {
              return seen.push(othIndex);
            }
          })
        ) {
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

  var _equalArrays = equalArrays;

  /** Built-in value references. */

  var Uint8Array$1 = _root.Uint8Array;
  var _Uint8Array = Uint8Array$1;

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

  var _mapToArray = mapToArray;

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

  var _setToArray = setToArray;

  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;
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

  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
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
        if (object.byteLength != other.byteLength || !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
          return false;
        }

        return true;

      case boolTag:
      case dateTag:
      case numberTag:
        // Coerce booleans to `1` or `0` and dates to milliseconds.
        // Invalid dates are coerced to `NaN`.
        return eq_1(+object, +other);

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings, primitives and objects,
        // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
        // for more details.
        return object == other + '';

      case mapTag:
        var convert = _mapToArray;

      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
        convert || (convert = _setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        } // Assume cyclic values are equal.

        var stacked = stack.get(object);

        if (stacked) {
          return stacked == other;
        }

        bitmask |= COMPARE_UNORDERED_FLAG$1; // Recursively compare objects (susceptible to call stack limits).

        stack.set(object, other);
        var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;

      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }

    return false;
  }

  var _equalByTag = equalByTag;

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

  var _arrayPush = arrayPush;

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
  var isArray_1 = isArray;

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
    return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys;

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

  var _arrayFilter = arrayFilter;

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

  var stubArray_1 = stubArray;

  /** Used for built-in method references. */

  var objectProto$5 = Object.prototype;
  /** Built-in value references. */

  var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;
  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeGetSymbols = Object.getOwnPropertySymbols;
  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */

  var getSymbols = !nativeGetSymbols
    ? stubArray_1
    : function (object) {
        if (object == null) {
          return [];
        }

        object = Object(object);
        return _arrayFilter(nativeGetSymbols(object), function (symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
  var _getSymbols = getSymbols;

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

  var _baseTimes = baseTimes;

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

  var objectProto$6 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
  /** Built-in value references. */

  var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;
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
          isObjectLike_1(value) &&
          hasOwnProperty$4.call(value, 'callee') &&
          !propertyIsEnumerable$1.call(value, 'callee')
        );
      };
  var isArguments_1 = isArguments;

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
    return (
      !!length &&
      (type == 'number' || (type != 'symbol' && reIsUint.test(value))) &&
      value > -1 &&
      value % 1 == 0 &&
      value < length
    );
  }

  var _isIndex = isIndex;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;
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
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var isLength_1 = isLength;

  /** `Object#toString` result references. */

  var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$1 = '[object Map]',
    numberTag$1 = '[object Number]',
    objectTag = '[object Object]',
    regexpTag$1 = '[object RegExp]',
    setTag$1 = '[object Set]',
    stringTag$1 = '[object String]',
    weakMapTag = '[object WeakMap]';
  var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
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
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[
    int16Tag
  ] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[
    uint16Tag
  ] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[
    boolTag$1
  ] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[
    funcTag$1
  ] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag] = typedArrayTags[
    regexpTag$1
  ] = typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag] = false;
  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */

  function baseIsTypedArray(value) {
    return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray;

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

  var _baseUnary = baseUnary;

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

  var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
  var isTypedArray_1 = isTypedArray;

  /** Used for built-in method references. */

  var objectProto$7 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */

  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

    for (var key in value) {
      if (
        (inherited || hasOwnProperty$5.call(value, key)) &&
        !(
          skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
          (key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
            (isBuff && (key == 'offset' || key == 'parent')) || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) || // Skip index properties.
            _isIndex(key, length))
        )
      ) {
        result.push(key);
      }
    }

    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;
  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */

  function isPrototype(value) {
    var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;
    return value === proto;
  }

  var _isPrototype = isPrototype;

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

  var _overArg = overArg;

  /* Built-in method references for those with the same name as other `lodash` methods. */

  var nativeKeys = _overArg(Object.keys, Object);
  var _nativeKeys = nativeKeys;

  /** Used for built-in method references. */

  var objectProto$9 = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$6 = objectProto$9.hasOwnProperty;
  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */

  function baseKeys(object) {
    if (!_isPrototype(object)) {
      return _nativeKeys(object);
    }

    var result = [];

    for (var key in Object(object)) {
      if (hasOwnProperty$6.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }

    return result;
  }

  var _baseKeys = baseKeys;

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
    return value != null && isLength_1(value.length) && !isFunction_1(value);
  }

  var isArrayLike_1 = isArrayLike;

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
    return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
  }

  var keys_1 = keys;

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */

  function getAllKeys(object) {
    return _baseGetAllKeys(object, keys_1, _getSymbols);
  }

  var _getAllKeys = getAllKeys;

  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$2 = 1;
  /** Used for built-in method references. */

  var objectProto$a = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$7 = objectProto$a.hasOwnProperty;
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
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      objProps = _getAllKeys(object),
      objLength = objProps.length,
      othProps = _getAllKeys(other),
      othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }

    var index = objLength;

    while (index--) {
      var key = objProps[index];

      if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
        return false;
      }
    } // Check that cyclic values are equal.

    var objStacked = stack.get(object);
    var othStacked = stack.get(other);

    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
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
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack);
      } // Recursively compare objects (susceptible to call stack limits).

      if (
        !(compared === undefined
          ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)
          : compared)
      ) {
        result = false;
        break;
      }

      skipCtor || (skipCtor = key == 'constructor');
    }

    if (result && !skipCtor) {
      var objCtor = object.constructor,
        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

      if (
        objCtor != othCtor &&
        'constructor' in object &&
        'constructor' in other &&
        !(
          typeof objCtor == 'function' &&
          objCtor instanceof objCtor &&
          typeof othCtor == 'function' &&
          othCtor instanceof othCtor
        )
      ) {
        result = false;
      }
    }

    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  var _equalObjects = equalObjects;

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

  var mapTag$2 = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$2 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';
  var dataViewTag$2 = '[object DataView]';
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
    (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
    (_Map && getTag(new _Map()) != mapTag$2) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set()) != setTag$2) ||
    (_WeakMap && getTag(new _WeakMap()) != weakMapTag$1)
  ) {
    getTag = function getTag(value) {
      var result = _baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag$2;

          case mapCtorString:
            return mapTag$2;

          case promiseCtorString:
            return promiseTag;

          case setCtorString:
            return setTag$2;

          case weakMapCtorString:
            return weakMapTag$1;
        }
      }

      return result;
    };
  }

  var _getTag = getTag;

  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$3 = 1;
  /** `Object#toString` result references. */

  var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$2 = '[object Object]';
  /** Used for built-in method references. */

  var objectProto$b = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
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
    var objIsArr = isArray_1(object),
      othIsArr = isArray_1(other),
      objTag = objIsArr ? arrayTag$1 : _getTag(object),
      othTag = othIsArr ? arrayTag$1 : _getTag(other);
    objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
    othTag = othTag == argsTag$2 ? objectTag$2 : othTag;
    var objIsObj = objTag == objectTag$2,
      othIsObj = othTag == objectTag$2,
      isSameTag = objTag == othTag;

    if (isSameTag && isBuffer_1(object)) {
      if (!isBuffer_1(other)) {
        return false;
      }

      objIsArr = true;
      objIsObj = false;
    }

    if (isSameTag && !objIsObj) {
      stack || (stack = new _Stack());
      return objIsArr || isTypedArray_1(object)
        ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
        : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }

    if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
      var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new _Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }

    if (!isSameTag) {
      return false;
    }

    stack || (stack = new _Stack());
    return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  var _baseIsEqualDeep = baseIsEqualDeep;

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

    if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
      return value !== value && other !== other;
    }

    return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }

  var _baseIsEqual = baseIsEqual;

  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;
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
        var stack = new _Stack();

        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }

        if (
          !(result === undefined
            ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
            : result)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  var _baseIsMatch = baseIsMatch;

  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */

  function isStrictComparable(value) {
    return value === value && !isObject_1(value);
  }

  var _isStrictComparable = isStrictComparable;

  /**
   * Gets the property names, values, and compare flags of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the match data of `object`.
   */

  function getMatchData(object) {
    var result = keys_1(object),
      length = result.length;

    while (length--) {
      var key = result[length],
        value = object[key];
      result[length] = [key, value, _isStrictComparable(value)];
    }

    return result;
  }

  var _getMatchData = getMatchData;

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

  var _matchesStrictComparable = matchesStrictComparable;

  /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */

  function baseMatches(source) {
    var matchData = _getMatchData(source);

    if (matchData.length == 1 && matchData[0][2]) {
      return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }

    return function (object) {
      return object === source || _baseIsMatch(object, source, matchData);
    };
  }

  var _baseMatches = baseMatches;

  /** `Object#toString` result references. */

  var symbolTag$1 = '[object Symbol]';
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
    return _typeof(value) == 'symbol' || (isObjectLike_1(value) && _baseGetTag(value) == symbolTag$1);
  }

  var isSymbol_1 = isSymbol;

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
    if (isArray_1(value)) {
      return false;
    }

    var type = _typeof(value);

    if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol_1(value)) {
      return true;
    }

    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (object != null && value in Object(object));
  }

  var _isKey = isKey;

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
  var _stringToPath = stringToPath;

  /** Used as references for various `Number` constants. */

  var INFINITY = 1 / 0;
  /** Used to convert symbols to primitives and strings. */

  var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
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

    if (isArray_1(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return _arrayMap(value, baseToString) + '';
    }

    if (isSymbol_1(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }

    var result = value + '';
    return result == '0' && 1 / value == -INFINITY ? '-0' : result;
  }

  var _baseToString = baseToString;

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
    return value == null ? '' : _baseToString(value);
  }

  var toString_1 = toString;

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @param {Object} [object] The object to query keys on.
   * @returns {Array} Returns the cast property path array.
   */

  function castPath(value, object) {
    if (isArray_1(value)) {
      return value;
    }

    return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
  }

  var _castPath = castPath;

  /** Used as references for various `Number` constants. */

  var INFINITY$1 = 1 / 0;
  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */

  function toKey(value) {
    if (typeof value == 'string' || isSymbol_1(value)) {
      return value;
    }

    var result = value + '';
    return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
  }

  var _toKey = toKey;

  /**
   * The base implementation of `_.get` without support for default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @returns {*} Returns the resolved value.
   */

  function baseGet(object, path) {
    path = _castPath(path, object);
    var index = 0,
      length = path.length;

    while (object != null && index < length) {
      object = object[_toKey(path[index++])];
    }

    return index && index == length ? object : undefined;
  }

  var _baseGet = baseGet;

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
    var result = object == null ? undefined : _baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  var get_1 = get;

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

  var _baseHasIn = baseHasIn;

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
    path = _castPath(path, object);
    var index = -1,
      length = path.length,
      result = false;

    while (++index < length) {
      var key = _toKey(path[index]);

      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }

      object = object[key];
    }

    if (result || ++index != length) {
      return result;
    }

    length = object == null ? 0 : object.length;
    return !!length && isLength_1(length) && _isIndex(key, length) && (isArray_1(object) || isArguments_1(object));
  }

  var _hasPath = hasPath;

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
    return object != null && _hasPath(object, path, _baseHasIn);
  }

  var hasIn_1 = hasIn;

  /** Used to compose bitmasks for value comparisons. */

  var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;
  /**
   * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
   *
   * @private
   * @param {string} path The path of the property to get.
   * @param {*} srcValue The value to match.
   * @returns {Function} Returns the new spec function.
   */

  function baseMatchesProperty(path, srcValue) {
    if (_isKey(path) && _isStrictComparable(srcValue)) {
      return _matchesStrictComparable(_toKey(path), srcValue);
    }

    return function (object) {
      var objValue = get_1(object, path);
      return objValue === undefined && objValue === srcValue
        ? hasIn_1(object, path)
        : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
    };
  }

  var _baseMatchesProperty = baseMatchesProperty;

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

  var identity_1 = identity;

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

  var _baseProperty = baseProperty;

  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   */

  function basePropertyDeep(path) {
    return function (object) {
      return _baseGet(object, path);
    };
  }

  var _basePropertyDeep = basePropertyDeep;

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
    return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
  }

  var property_1 = property;

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
      return identity_1;
    }

    if (_typeof(value) == 'object') {
      return isArray_1(value) ? _baseMatchesProperty(value[0], value[1]) : _baseMatches(value);
    }

    return property_1(value);
  }

  var _baseIteratee = baseIteratee;

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

  var _createBaseFor = createBaseFor;

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

  var baseFor = _createBaseFor();
  var _baseFor = baseFor;

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */

  function baseForOwn(object, iteratee) {
    return object && _baseFor(object, iteratee, keys_1);
  }

  var _baseForOwn = baseForOwn;

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

      if (!isArrayLike_1(collection)) {
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

  var _createBaseEach = createBaseEach;

  /**
   * The base implementation of `_.forEach` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object} Returns `collection`.
   */

  var baseEach = _createBaseEach(_baseForOwn);
  var _baseEach = baseEach;

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
      result = isArrayLike_1(collection) ? Array(collection.length) : [];
    _baseEach(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  var _baseMap = baseMap;

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
    var func = isArray_1(collection) ? _arrayMap : _baseMap;
    return func(collection, _baseIteratee(iteratee));
  }

  var map_1 = map;

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
    _baseEach(collection, function (value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });
    return result;
  }

  var _baseFilter = baseFilter;

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
   *
   * // Combining several predicates using `_.overEvery` or `_.overSome`.
   * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
   * // => objects for ['fred', 'barney']
   */

  function filter(collection, predicate) {
    var func = isArray_1(collection) ? _arrayFilter : _baseFilter;
    return func(collection, _baseIteratee(predicate));
  }

  var filter_1 = filter;

  /** `Object#toString` result references. */

  var stringTag$2 = '[object String]';
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
    return (
      typeof value == 'string' || (!isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag$2)
    );
  }

  var isString_1 = isString;

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
  var windowAlias = window,
    documentAlias = document,
    localStorageAlias = window.localStorage,
    sessionStorageAlias = window.sessionStorage;
  /**
   * Cleans up the page title
   */

  function fixupTitle(title) {
    if (!isString_1(title)) {
      title = title.text || '';
      var tmp = documentAlias.getElementsByTagName('title');

      if (tmp && !isUndefined_1(tmp[0])) {
        title = tmp[0].text;
      }
    }

    return title;
  }
  /**
   * Extract hostname from URL
   */

  function getHostName(url) {
    // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
    var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
      matches = e.exec(url);
    return matches ? matches[1] : url;
  }
  /**
   * Fix-up domain
   */

  function fixupDomain(domain) {
    var dl = domain.length; // remove trailing '.'

    if (domain.charAt(--dl) === '.') {
      domain = domain.slice(0, dl);
    } // remove leading '*'

    if (domain.slice(0, 2) === '*.') {
      domain = domain.slice(1);
    }

    return domain;
  }
  /**
   * Get page referrer. In the case of a single-page app,
   * if the URL changes without the page reloading, pass
   * in the old URL. It will be returned unless overriden
   * by a "refer(r)er" parameter in the querystring.
   *
   * @param string oldLocation Optional.
   * @return string The referrer
   */

  function getReferrer(oldLocation) {
    var referrer = '';
    var fromQs =
      fromQuerystring('referrer', windowAlias.location.href) || fromQuerystring('referer', windowAlias.location.href); // Short-circuit

    if (fromQs) {
      return fromQs;
    } // In the case of a single-page app, return the old URL

    if (oldLocation) {
      return oldLocation;
    }

    try {
      referrer = windowAlias.top.document.referrer;
    } catch (e) {
      if (windowAlias.parent) {
        try {
          referrer = windowAlias.parent.document.referrer;
        } catch (e2) {
          referrer = '';
        }
      }
    }

    if (referrer === '') {
      referrer = documentAlias.referrer;
    }

    return referrer;
  }
  /**
   * Cross-browser helper function to add event handler
   */

  function addEventListener(element, eventType, eventHandler, useCapture) {
    if (element.addEventListener) {
      element.addEventListener(eventType, eventHandler, useCapture);
      return true;
    }

    if (element.attachEvent) {
      return element.attachEvent('on' + eventType, eventHandler);
    }

    element['on' + eventType] = eventHandler;
  }
  /**
   * Return value from name-value pair in querystring
   */

  function fromQuerystring(field, url) {
    var match = new RegExp('^[^#]*[?&]' + field + '=([^&#]*)').exec(url);

    if (!match) {
      return null;
    }

    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  /*
   * Find dynamic context generating functions and merge their results into the static contexts
   * Combine an array of unchanging contexts with the result of a context-creating function
   *
   * @param {(object|function(...*): ?object)[]} dynamicOrStaticContexts Array of custom context Objects or custom context generating functions
   * @param {...*} Parameters to pass to dynamic callbacks
   */

  function resolveDynamicContexts(dynamicOrStaticContexts) {
    var params = Array.prototype.slice.call(arguments, 1);
    return filter_1(
      map_1(dynamicOrStaticContexts, function (context) {
        if (typeof context === 'function') {
          try {
            return context.apply(null, params);
          } catch (e) {
            //TODO: provide warning
          }
        } else {
          return context;
        }
      })
    );
  }
  /**
   * Only log deprecation warnings if they won't cause an error
   */

  function warn(message) {
    if (typeof console !== 'undefined') {
      console.warn('Snowplow: ' + message);
    }
  }
  /**
   * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
   */

  function getCssClasses(elt) {
    return elt.className.match(/\S+/g) || [];
  }
  /**
   * Check whether an element has at least one class from a given list
   */

  function checkClass(elt, classList) {
    var classes = getCssClasses(elt),
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

  function getFilter(criterion, byClass) {
    // If the criterion argument is not an object, add listeners to all elements
    if (Array.isArray(criterion) || !isObject_1(criterion)) {
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
  }
  /**
   * Convert a criterion object to a transform function
   *
   * @param object criterion {transform: function (elt) {return the result of transform function applied to element}
   */

  function getTransform(criterion) {
    if (!isObject_1(criterion)) {
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
  }
  /**
   * Add a name-value pair to the querystring of a URL
   *
   * @param string url URL to decorate
   * @param string name Name of the querystring pair
   * @param string value Value of the querystring pair
   */

  function decorateQuerystring(url, name, value) {
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
  }
  /**
   * Attempt to get a value from localStorage
   *
   * @param string key
   * @return string The value obtained from localStorage, or
   *                undefined if localStorage is inaccessible
   */

  function attemptGetLocalStorage(key) {
    try {
      var exp = localStorageAlias.getItem(key + '.expires');

      if (exp === null || +exp > Date.now()) {
        return localStorageAlias.getItem(key);
      } else {
        localStorageAlias.removeItem(key);
        localStorageAlias.removeItem(key + '.expires');
      }

      return undefined;
    } catch (e) {}
  }
  /**
   * Attempt to write a value to localStorage
   *
   * @param string key
   * @param string value
   * @param number ttl Time to live in seconds, defaults to 2 years from Date.now()
   * @return boolean Whether the operation succeeded
   */

  function attemptWriteLocalStorage(key, value) {
    var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 63072000;

    try {
      var t = Date.now() + ttl * 1000;
      localStorageAlias.setItem(''.concat(key, '.expires'), t);
      localStorageAlias.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Attempt to delete a value from localStorage
   *
   * @param string key
   * @return boolean Whether the operation succeeded
   */

  function attemptDeleteLocalStorage(key) {
    try {
      localStorageAlias.removeItem(key);
      localStorageAlias.removeItem(key + '.expires');
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Attempt to get a value from sessionStorage
   *
   * @param string key
   * @return string The value obtained from sessionStorage, or
   *                undefined if sessionStorage is inaccessible
   */

  function attemptGetSessionStorage(key) {
    try {
      return sessionStorageAlias.getItem(key);
    } catch (e) {
      return undefined;
    }
  }
  /**
   * Attempt to write a value to sessionStorage
   *
   * @param string key
   * @param string value
   * @return boolean Whether the operation succeeded
   */

  function attemptWriteSessionStorage(key, value) {
    try {
      sessionStorageAlias.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Finds the root domain
   */

  function findRootDomain() {
    var cookiePrefix = '_sp_root_domain_test_';
    var cookieName = cookiePrefix + new Date().getTime();
    var cookieValue = '_test_value_' + new Date().getTime();
    var split = windowAlias.location.hostname.split('.');
    var position = split.length - 1;

    while (position >= 0) {
      var currentDomain = split.slice(position, split.length).join('.');
      cookie(cookieName, cookieValue, 0, '/', currentDomain);

      if (cookie(cookieName) === cookieValue) {
        // Clean up created cookie(s)
        deleteCookie(cookieName, currentDomain);
        var cookieNames = getCookiesWithPrefix(cookiePrefix);

        for (var i = 0; i < cookieNames.length; i++) {
          deleteCookie(cookieNames[i], currentDomain);
        }

        return currentDomain;
      }

      position -= 1;
    } // Cookies cannot be read

    return windowAlias.location.hostname;
  }
  /**
   * Checks whether a value is present within an array
   *
   * @param val The value to check for
   * @param array The array to check within
   * @return boolean Whether it exists
   */

  function isValueInArray(val, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === val) {
        return true;
      }
    }

    return false;
  }
  /**
   * Deletes an arbitrary cookie by setting the expiration date to the past
   *
   * @param cookieName The name of the cookie to delete
   * @param domainName The domain the cookie is in
   */

  function deleteCookie(cookieName, domainName) {
    cookie(cookieName, '', -1, '/', domainName);
  }
  /**
   * Fetches the name of all cookies beginning with a certain prefix
   *
   * @param cookiePrefix The prefix to check for
   * @return array The cookies that begin with the prefix
   */

  function getCookiesWithPrefix(cookiePrefix) {
    var cookies = documentAlias.cookie.split('; ');
    var cookieNames = [];

    for (var i = 0; i < cookies.length; i++) {
      if (cookies[i].substring(0, cookiePrefix.length) === cookiePrefix) {
        cookieNames.push(cookies[i]);
      }
    }

    return cookieNames;
  }
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
  /**
   * Parses an object and returns either the
   * integer or undefined.
   *
   * @param obj The object to parse
   * @return the result of the parse operation
   */

  function parseAndValidateInt(obj) {
    var result = parseInt(obj);
    return isNaN(result) ? undefined : result;
  }
  /**
   * Parses an object and returns either the
   * number or undefined.
   *
   * @param obj The object to parse
   * @return the result of the parse operation
   */

  function parseAndValidateFloat(obj) {
    var result = parseFloat(obj);
    return isNaN(result) ? undefined : result;
  }
  function isFunction$1(func) {
    if (func && typeof func === 'function') {
      return true;
    }

    return false;
  }

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

  var _arrayEach = arrayEach;

  /**
   * Casts `value` to `identity` if it's not a function.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Function} Returns cast function.
   */

  function castFunction(value) {
    return typeof value == 'function' ? value : identity_1;
  }

  var _castFunction = castFunction;

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
    var func = isArray_1(collection) ? _arrayEach : _baseEach;
    return func(collection, _castFunction(iteratee));
  }

  var forEach_1 = forEach;

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

    if (isSymbol_1(value)) {
      return NAN;
    }

    if (isObject_1(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject_1(other) ? other + '' : other;
    }

    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }

    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value)
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : reIsBadHex.test(value)
      ? NAN
      : +value;
  }

  var toNumber_1 = toNumber;

  /** Used as references for various `Number` constants. */

  var INFINITY$2 = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e308;
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

    value = toNumber_1(value);

    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }

    return value === value ? value : 0;
  }

  var toFinite_1 = toFinite;

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
    var result = toFinite_1(value),
      remainder = result % 1;
    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  var toInteger_1 = toInteger;

  /**
   * Checks if `value` is an integer.
   *
   * **Note:** This method is based on
   * [`Number.isInteger`](https://mdn.io/Number/isInteger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
   * @example
   *
   * _.isInteger(3);
   * // => true
   *
   * _.isInteger(Number.MIN_VALUE);
   * // => false
   *
   * _.isInteger(Infinity);
   * // => false
   *
   * _.isInteger('3');
   * // => false
   */

  function isInteger(value) {
    return typeof value == 'number' && value == toInteger_1(value);
  }

  var isInteger_1 = isInteger;

  /*
   * JavaScript tracker for Snowplow: proxies.js
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
  /*
   * Extract parameter from URL
   */

  function getParameter(url, name) {
    // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
    var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
      matches = e.exec(url),
      result = fromQuerystring(name, matches[1]);
    return result;
  }
  /*
   * Fix-up URL when page rendered from search engine cache or translated page.
   * TODO: it would be nice to generalise this and/or move into the ETL phase.
   */

  function fixupUrl(hostName, href, referrer) {
    if (hostName === 'translate.googleusercontent.com') {
      // Google
      if (referrer === '') {
        referrer = href;
      }

      href = getParameter(href, 'u');
      hostName = getHostName(href);
    } else if (
      hostName === 'cc.bingj.com' || // Bing & Yahoo
      hostName === 'webcache.googleusercontent.com' // Google
    ) {
      href = document.links[0].href;
      hostName = getHostName(href);
    }

    return [hostName, href, referrer];
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
  var windowAlias$1 = window,
    navigatorAlias = navigator,
    screenAlias = screen,
    documentAlias$1 = document;
  /*
   * Checks whether localStorage is available, in a way that
   * does not throw a SecurityError in Firefox if "always ask"
   * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
   */

  function hasLocalStorage() {
    try {
      return !!windowAlias$1.localStorage;
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
      windowAlias$1.localStorage.setItem(mod, mod);
      windowAlias$1.localStorage.removeItem(mod);
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
    var e = windowAlias$1,
      a = 'inner';

    if (!('innerWidth' in windowAlias$1)) {
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

    if (isFunction$1(windowAlias$1.GearsFactory)) {
      features.gears = '1';
    } // Other browser features

    features.res = screenAlias.width + 'x' + screenAlias.height;
    features.cd = screenAlias.colorDepth;

    if (useCookies) {
      features.cookie = hasCookies(testCookieName);
    }

    return features;
  }

  var crypt = createCommonjsModule(function (module) {
    (function () {
      var base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        crypt = {
          // Bit-wise rotation left
          rotl: function rotl(n, b) {
            return (n << b) | (n >>> (32 - b));
          },
          // Bit-wise rotation right
          rotr: function rotr(n, b) {
            return (n << (32 - b)) | (n >>> b);
          },
          // Swap big-endian to little-endian and vice versa
          endian: function endian(n) {
            // If number given, swap endian
            if (n.constructor == Number) {
              return (crypt.rotl(n, 8) & 0x00ff00ff) | (crypt.rotl(n, 24) & 0xff00ff00);
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
              words[b >>> 5] |= bytes[i] << (24 - (b % 32));
            }

            return words;
          },
          // Convert big-endian 32-bit words to a byte array
          wordsToBytes: function wordsToBytes(words) {
            for (var bytes = [], b = 0; b < words.length * 32; b += 8) {
              bytes.push((words[b >>> 5] >>> (24 - (b % 32))) & 0xff);
            }

            return bytes;
          },
          // Convert a byte array to a hex string
          bytesToHex: function bytesToHex(bytes) {
            for (var hex = [], i = 0; i < bytes.length; i++) {
              hex.push((bytes[i] >>> 4).toString(16));
              hex.push((bytes[i] & 0xf).toString(16));
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
              var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

              for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 <= bytes.length * 8)
                  base64.push(base64map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                else base64.push('=');
              }
            }

            return base64.join('');
          },
          // Convert a base-64 string to a byte array
          base64ToBytes: function base64ToBytes(base64) {
            // Remove non-base-64 characters
            base64 = base64.replace(/[^A-Z0-9+\/]/gi, '');

            for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
              if (imod4 == 0) continue;
              bytes.push(
                ((base64map.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2)) |
                  (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2))
              );
            }

            return bytes;
          },
        };
      module.exports = crypt;
    })();
  });

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
      },
    },
    // Binary encoding
    bin: {
      // Convert a string to a byte array
      stringToBytes: function stringToBytes(str) {
        for (var bytes = [], i = 0; i < str.length; i++) {
          bytes.push(str.charCodeAt(i) & 0xff);
        }

        return bytes;
      },
      // Convert a byte array to a string
      bytesToString: function bytesToString(bytes) {
        for (var str = [], i = 0; i < bytes.length; i++) {
          str.push(String.fromCharCode(bytes[i]));
        }

        return str.join('');
      },
    },
  };
  var charenc_1 = charenc;

  var sha1 = createCommonjsModule(function (module) {
    (function () {
      var crypt$1 = crypt,
        utf8 = charenc_1.utf8,
        bin = charenc_1.bin,
        // The core
        sha1 = function sha1(message) {
          // Convert to byte array
          if (message.constructor == String) message = utf8.stringToBytes(message); // otherwise assume byte array

          var m = crypt$1.bytesToWords(message),
            l = message.length * 8,
            w = [],
            H0 = 1732584193,
            H1 = -271733879,
            H2 = -1732584194,
            H3 = 271733878,
            H4 = -1009589776; // Padding

          m[l >> 5] |= 0x80 << (24 - (l % 32));
          m[(((l + 64) >>> 9) << 4) + 15] = l;

          for (var i = 0; i < m.length; i += 16) {
            var a = H0,
              b = H1,
              c = H2,
              d = H3,
              e = H4;

            for (var j = 0; j < 80; j++) {
              if (j < 16) w[j] = m[i + j];
              else {
                var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                w[j] = (n << 1) | (n >>> 31);
              }
              var t =
                ((H0 << 5) | (H0 >>> 27)) +
                H4 +
                (w[j] >>> 0) +
                (j < 20
                  ? ((H1 & H2) | (~H1 & H3)) + 1518500249
                  : j < 40
                  ? (H1 ^ H2 ^ H3) + 1859775393
                  : j < 60
                  ? ((H1 & H2) | (H1 & H3) | (H2 & H3)) - 1894007588
                  : (H1 ^ H2 ^ H3) - 899497514);
              H4 = H3;
              H3 = H2;
              H2 = (H1 << 30) | (H1 >>> 2);
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
          var digestbytes = crypt$1.wordsToBytes(sha1(message));
          return options && options.asBytes
            ? digestbytes
            : options && options.asString
            ? bin.bytesToString(digestbytes)
            : crypt$1.bytesToHex(digestbytes);
        };

      api._blocksize = 16;
      api._digestsize = 20;
      module.exports = api;
    })();
  });

  /*
   * JavaScript tracker for Snowplow: links.js
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
  /**
   * Object for handling automatic link tracking
   *
   * @param object core The tracker core
   * @param string trackerId Unique identifier for the tracker instance, used to mark tracked links
   * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
   * @return object linkTrackingManager instance
   */

  function LinkTrackingManager(core, trackerId, contextAdder) {
    // Filter function used to determine whether clicks on a link should be tracked
    var linkTrackingFilter, // Whether pseudo clicks are tracked
      linkTrackingPseudoClicks, // Whether to track the  innerHTML of clicked links
      linkTrackingContent, // The context attached to link click events
      linkTrackingContext, // Internal state of the pseudo click handler
      lastButton,
      lastTarget;
    /*
     * Process clicks
     */

    function processClick(sourceElement, context) {
      var parentElement, tag, elementId, elementClasses, elementTarget, elementContent;

      while (
        (parentElement = sourceElement.parentNode) !== null &&
        !isUndefined_1(parentElement) && // buggy IE5.5
        (tag = sourceElement.tagName.toUpperCase()) !== 'A' &&
        tag !== 'AREA'
      ) {
        sourceElement = parentElement;
      }

      if (!isUndefined_1(sourceElement.href)) {
        // browsers, such as Safari, don't downcase hostname and href
        var originalSourceHostName = sourceElement.hostname || getHostName(sourceElement.href),
          sourceHostName = originalSourceHostName.toLowerCase(),
          sourceHref = sourceElement.href.replace(originalSourceHostName, sourceHostName),
          scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i'); // Ignore script pseudo-protocol links

        if (!scriptProtocol.test(sourceHref)) {
          elementId = sourceElement.id;
          elementClasses = getCssClasses(sourceElement);
          elementTarget = sourceElement.target;
          elementContent = linkTrackingContent ? sourceElement.innerHTML : null; // decodeUrl %xx

          sourceHref = unescape(sourceHref);
          core.trackLinkClick(
            sourceHref,
            elementId,
            elementClasses,
            elementTarget,
            elementContent,
            contextAdder(resolveDynamicContexts(context, sourceElement))
          );
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
        addEventListener(element, 'mouseup', getClickHandler(linkTrackingContext), false);
        addEventListener(element, 'mousedown', getClickHandler(linkTrackingContext), false);
      } else {
        addEventListener(element, 'click', getClickHandler(linkTrackingContext), false);
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
        linkTrackingFilter = getFilter(criterion, true);
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
      },
    };
  }

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

      if (!isArrayLike_1(collection)) {
        var iteratee = _baseIteratee(predicate);
        collection = keys_1(collection);

        predicate = function predicate(key) {
          return iteratee(iterable[key], key, iterable);
        };
      }

      var index = findIndexFunc(collection, predicate, fromIndex);
      return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
    };
  }

  var _createFind = createFind;

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

  var _baseFindIndex = baseFindIndex;

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

    var index = fromIndex == null ? 0 : toInteger_1(fromIndex);

    if (index < 0) {
      index = nativeMax(length + index, 0);
    }

    return _baseFindIndex(array, _baseIteratee(predicate), index);
  }

  var findIndex_1 = findIndex;

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

  var find = _createFind(findIndex_1);
  var find_1 = find;

  /*
   * JavaScript tracker for Snowplow: forms.js
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
  /**
   * Object for handling automatic form tracking
   *
   * @param object core The tracker core
   * @param string trackerId Unique identifier for the tracker instance, used to mark tracked elements
   * @param function contextAdder Function to add common contexts like PerformanceTiming to all events
   * @return object formTrackingManager instance
   */

  function FormTrackingManager(core, trackerId, contextAdder) {
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
      return elt[
        find_1(['name', 'id', 'type', 'nodeName'], function (propName) {
          // If elt has a child whose name is "id", that element will be returned
          // instead of the actual id of elt unless we ensure that a string is returned
          return elt[propName] && typeof elt[propName] === 'string';
        })
      ];
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
      forEach_1(innerElementTags, function (tagname) {
        var trackedChildren = Array.prototype.filter.call(elt.getElementsByTagName(tagname), function (child) {
          return child.hasOwnProperty(trackingMarker);
        });
        forEach_1(trackedChildren, function (child) {
          if (child.type === 'submit') {
            return;
          }

          var elementJson = {
            name: getFormElementName(child),
            value: child.value,
            nodeName: child.nodeName,
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
        var value = elt.type === 'checkbox' && !elt.checked ? null : fieldTransform(elt.value, elt);

        if (event_type === 'change_form' || (type !== 'checkbox' && type !== 'radio')) {
          core.trackFormFocusOrChange(
            event_type,
            getParentFormName(elt),
            getFormElementName(elt),
            elt.nodeName,
            type,
            getCssClasses(elt),
            value,
            contextAdder(resolveDynamicContexts(context, elt, type, value))
          );
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
        forEach_1(innerElements, function (innerElement) {
          innerElement.value = fieldTransform(innerElement.value, innerElement);
        });
        core.trackFormSubmission(
          getFormElementName(elt),
          getCssClasses(elt),
          innerElements,
          contextAdder(resolveDynamicContexts(context, elt, innerElements))
        );
      };
    }

    return {
      /*
       * Configures form tracking: which forms and fields will be tracked, and the context to attach
       */
      configureFormTracking: function configureFormTracking(config) {
        if (config) {
          formFilter = getFilter(config.forms, true);
          fieldFilter = getFilter(config.fields, false);
          fieldTransform = getTransform(config.fields);
        }
      },

      /*
       * Add submission event listeners to all form elements
       * Add value change event listeners to all mutable inner form elements
       */
      addFormListeners: function addFormListeners(context) {
        forEach_1(document.getElementsByTagName('form'), function (form) {
          if (formFilter(form) && !form[trackingMarker]) {
            forEach_1(innerElementTags, function (tagname) {
              forEach_1(form.getElementsByTagName(tagname), function (innerElement) {
                if (
                  fieldFilter(innerElement) &&
                  !innerElement[trackingMarker] &&
                  innerElement.type.toLowerCase() !== 'password'
                ) {
                  addEventListener(innerElement, 'focus', getFormChangeListener('focus_form', context), false);
                  addEventListener(innerElement, 'change', getFormChangeListener('change_form', context), false);
                  innerElement[trackingMarker] = true;
                }
              });
            });
            addEventListener(form, 'submit', getFormSubmissionListener(context));
            form[trackingMarker] = true;
          }
        });
      },
    };
  }

  /*
   * JavaScript tracker for Snowplow: tracker.js
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
  var windowAlias$2 = window;
  function ErrorTrackingManager(core) {
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
      core.trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
          data: {
            programmingLanguage: 'JAVASCRIPT',
            message: message || "JS Exception. Browser doesn't support ErrorEvent API",
            stackTrace: stack,
            lineNumber: lineno,
            lineColumn: colno,
            fileName: filename,
          },
        },
        contexts
      );
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

      if (isFunction$1(contextsAdder)) {
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
          if ((isFunction$1(filter) && filter(errorEvent)) || filter == null) {
            sendError(errorEvent, contexts, contextsAdder);
          }
        }

        addEventListener(windowAlias$2, 'error', captureError, true);
      },
    };
  }

  var defineProperty = (function () {
    try {
      var func = _getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  })();

  var _defineProperty$1 = defineProperty;

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
    if (key == '__proto__' && _defineProperty$1) {
      _defineProperty$1(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true,
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue;

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
    iteratee = _baseIteratee(iteratee);
    _baseForOwn(object, function (value, key, object) {
      _baseAssignValue(result, key, iteratee(value, key, object));
    });
    return result;
  }

  var mapValues_1 = mapValues;

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

  function OutQueueManager(
    functionName,
    namespace,
    mutSnowplowState,
    useLocalStorage,
    eventMethod,
    postPath,
    bufferSize,
    maxPostBytes,
    useStm,
    maxLocalStorageQueueSize,
    connectionTimeout,
    anonymousTracking
  ) {
    var localStorageAlias = window.localStorage,
      queueName,
      executingQueue = false,
      configCollectorUrl,
      outQueue,
      preflightName,
      beaconPreflight; //Force to lower case if its a string

    eventMethod = eventMethod.toLowerCase ? eventMethod.toLowerCase() : eventMethod; // Use the Beacon API if eventMethod is set null, true, or 'beacon'.

    var isBeaconRequested =
      eventMethod === null || eventMethod === true || eventMethod === 'beacon' || eventMethod === 'true'; // Fall back to POST or GET for browsers which don't support Beacon API

    var isBeaconAvailable = Boolean(isBeaconRequested && navigator && navigator.sendBeacon);
    var useBeacon = isBeaconAvailable && isBeaconRequested; // Use GET if specified

    var isGetRequested = eventMethod === 'get'; // Don't use XhrHttpRequest for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)

    var useXhr = Boolean(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest()); // Use POST if specified

    var usePost = !isGetRequested && useXhr && (eventMethod === 'post' || isBeaconRequested); // Resolve all options and capabilities and decide path

    var path = usePost ? postPath : '/i';
    bufferSize = (localStorageAccessible() && useLocalStorage && usePost && bufferSize) || 1; // Different queue names for GET and POST since they are stored differently

    queueName = 'snowplowOutQueue_'
      .concat(functionName, '_')
      .concat(namespace, '_')
      .concat(usePost ? 'post2' : 'get'); // Storage name for checking if preflight POST has been sent for Beacon API

    preflightName = 'spBeaconPreflight_'.concat(functionName, '_').concat(namespace);

    if (useLocalStorage) {
      // Catch any JSON parse errors or localStorage that might be thrown
      try {
        outQueue = JSON.parse(localStorageAlias.getItem(queueName));
      } catch (e) {}
    } // Initialize to and empty array if we didn't get anything out of localStorage

    if (!Array.isArray(outQueue)) {
      outQueue = [];
    } // Used by pageUnloadGuard

    mutSnowplowState.outQueues.push(outQueue);

    if (useXhr && bufferSize > 1) {
      mutSnowplowState.bufferFlushers.push(function () {
        if (!executingQueue) {
          _executeQueue();
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
          co: true,
          cx: true,
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
      var cleanedRequest = mapValues_1(request, function (v) {
        return v.toString();
      });
      return {
        evt: cleanedRequest,
        bytes: getUTF8Length(JSON.stringify(cleanedRequest)),
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
      configCollectorUrl = url + path;

      if (usePost) {
        var body = getBody(request);

        if (body.bytes >= maxPostBytes) {
          warn('Event (' + body.bytes + 'B) too big, max is ' + maxPostBytes);
          var xhr = initializeXMLHttpRequest(configCollectorUrl, true);
          xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent([body.evt])));
          return;
        } else {
          outQueue.push(body);
        }
      } else {
        outQueue.push(getQuerystring(request));
      }

      var savedToLocalStorage = false;

      if (useLocalStorage) {
        savedToLocalStorage = attemptWriteLocalStorage(
          queueName,
          JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize))
        );
      }

      if (!executingQueue && (!savedToLocalStorage || outQueue.length >= bufferSize)) {
        _executeQueue();
      }
    }
    /*
     * Run through the queue of image beacons, sending them one at a time.
     * Stops processing when we run out of queued requests, or we get an error.
     */

    function _executeQueue() {
      // Failsafe in case there is some way for a bad value like "null" to end up in the outQueue
      while (outQueue.length && typeof outQueue[0] !== 'string' && _typeof(outQueue[0]) !== 'object') {
        outQueue.shift();
      }

      if (outQueue.length < 1) {
        executingQueue = false;
        return;
      } // Let's check that we have a Url to ping

      if (!isString_1(configCollectorUrl)) {
        throw 'No collector configured';
      }

      executingQueue = true;
      var nextRequest = outQueue[0];

      if (useXhr) {
        // Keep track of number of events to delete from queue
        var chooseHowManyToSend = function chooseHowManyToSend(queue) {
          var numberToSend = 0;
          var byteCount = 0;

          while (numberToSend < queue.length) {
            byteCount += queue[numberToSend].bytes;

            if (byteCount >= maxPostBytes) {
              break;
            } else {
              numberToSend += 1;
            }
          }

          return numberToSend;
        };

        // The events (`numberToSend` of them), have been sent, so we remove them from the outQueue
        // We also call executeQueue() again, to let executeQueue() check if we should keep running through the queue
        var onPostSuccess = function onPostSuccess(numberToSend) {
          for (var deleteCount = 0; deleteCount < numberToSend; deleteCount++) {
            outQueue.shift();
          }

          if (useLocalStorage) {
            attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
          }

          _executeQueue();
        };

        var url, xhr, numberToSend;

        if (isGetRequested) {
          url = createGetUrl(nextRequest);
          xhr = initializeXMLHttpRequest(url, false);
          numberToSend = 1;
        } else {
          url = configCollectorUrl;
          xhr = initializeXMLHttpRequest(url, true);
          numberToSend = chooseHowManyToSend(outQueue);
        } // Time out POST requests after connectionTimeout

        var xhrTimeout = setTimeout(function () {
          xhr.abort();
          executingQueue = false;
        }, connectionTimeout);

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
            clearTimeout(xhrTimeout);

            if (useBeacon && !beaconPreflight) {
              attemptWriteSessionStorage(preflightName, true);
            }

            onPostSuccess(numberToSend);
          } else if (xhr.readyState === 4 && xhr.status >= 400) {
            clearTimeout(xhrTimeout);
            executingQueue = false;
          }
        };

        if (isGetRequested) {
          xhr.send();
        } else {
          var batch = outQueue.slice(0, numberToSend);

          if (batch.length > 0) {
            var beaconStatus; //If using Beacon, check we have sent at least one request using POST as Safari doesn't preflight Beacon

            beaconPreflight = beaconPreflight || (useBeacon && attemptGetSessionStorage(preflightName));
            var eventBatch = map_1(batch, function (x) {
              return x.evt;
            });

            if (beaconPreflight) {
              var headers = {
                type: 'application/json',
              };

              if (anonymousTracking) {
                header['SP-Anonymous'] = '*';
              }

              var blob = new Blob([encloseInPayloadDataEnvelope(attachStmToEvent(eventBatch))], headers);

              try {
                beaconStatus = navigator.sendBeacon(url, blob);
              } catch (error) {
                beaconStatus = false;
              }
            } // When beaconStatus is true, we can't _guarantee_ that it was successful (beacon queues asynchronously)
            // but the browser has taken it out of our hands, so we want to flush the queue assuming it will do its job

            if (beaconStatus === true) {
              onPostSuccess(numberToSend);
            }

            if (!useBeacon || !beaconStatus) {
              xhr.send(encloseInPayloadDataEnvelope(attachStmToEvent(eventBatch)));
            }
          }
        }
      } else if (!anonymousTracking) {
        var image = new Image(1, 1);
        var loading = true;

        image.onload = function () {
          if (!loading) return;
          loading = false;
          outQueue.shift();

          if (useLocalStorage) {
            attemptWriteLocalStorage(queueName, JSON.stringify(outQueue.slice(0, maxLocalStorageQueueSize)));
          }

          _executeQueue();
        };

        image.onerror = function () {
          if (!loading) return;
          loading = false;
          executingQueue = false;
        };

        image.src = createGetUrl(nextRequest);
        setTimeout(function () {
          if (loading && executingQueue) {
            loading = false;

            _executeQueue();
          }
        }, connectionTimeout);
      } else {
        executingQueue = false;
      }
    }
    /**
     * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
     *
     * @param string url The destination URL
     * @return object The XMLHttpRequest
     */

    function initializeXMLHttpRequest(url, post) {
      var xhr = new XMLHttpRequest();

      if (post) {
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      } else {
        xhr.open('GET', url, true);
      }

      xhr.withCredentials = true;

      if (anonymousTracking) {
        xhr.setRequestHeader('SP-Anonymous', '*');
      }

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
        data: events,
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
    /**
     * Creates the full URL for sending the GET request. Will append `stm` if enabled
     *
     * @param nextRequest the query string of the next request
     */

    function createGetUrl(nextRequest) {
      if (useStm) {
        return configCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
      }

      return configCollectorUrl + nextRequest;
    }

    return {
      enqueueRequest: enqueueRequest,
      executeQueue: function executeQueue() {
        if (!executingQueue) {
          _executeQueue();
        }
      },
      setUseLocalStorage: function setUseLocalStorage(localStorage) {
        useLocalStorage = localStorage;
      },
      setAnonymousTracking: function setAnonymousTracking(anonymous) {
        anonymousTracking = anonymous;
      },
    };
  }

  /*
   * JavaScript tracker for Snowplow: tracker.js
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
  var makeSafe = function makeSafe(fn) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (ex) {
        // TODO: Debug mode
      }
    };
  };

  function productionize(methods) {
    var safeMethods = {};

    if (_typeof(methods) === 'object' && methods !== null) {
      Object.getOwnPropertyNames(methods).forEach(function (val, idx, array) {
        if (typeof methods[val] === 'function') {
          safeMethods[val] = makeSafe(methods[val]);
        }
      });
    }

    return safeMethods;
  }

  var rngBrowser = createCommonjsModule(function (module) {
    // Unique ID creation requires a high quality random # generator.  In the
    // browser this is a little complicated due to unknown quality of Math.random()
    // and inconsistent support for the `crypto` API.  We do the best we can via
    // feature-detection
    // getRandomValues needs to be invoked in a context where "this" is a Crypto
    // implementation. Also, find the complete implementation of crypto on IE11.
    var getRandomValues =
      (typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
      (typeof msCrypto != 'undefined' &&
        typeof window.msCrypto.getRandomValues == 'function' &&
        msCrypto.getRandomValues.bind(msCrypto));

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
          rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
        }

        return rnds;
      };
    }
  });

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

    return [
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
    ].join('');
  }

  var bytesToUuid_1 = bytesToUuid;

  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  var _nodeId;

  var _clockseq; // Previous uuid creation time

  var _lastMSecs = 0;
  var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

  function v1(options, buf, offset) {
    var i = (buf && offset) || 0;
    var b = buf || [];
    options = options || {};
    var node = options.node || _nodeId;
    var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
    // specified.  We do this lazily to minimize issues related to insufficient
    // system entropy.  See #189

    if (node == null || clockseq == null) {
      var seedBytes = rngBrowser();

      if (node == null) {
        // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
        node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      }

      if (clockseq == null) {
        // Per 4.2.2, randomize (14 bit) clockseq
        clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
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
      clockseq = (clockseq + 1) & 0x3fff;
    } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval

    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    } // Per 4.2.1.2 Throw error if too many uuids are requested

    if (nsecs >= 10000) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

    msecs += 12219292800000; // `time_low`

    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = (tl >>> 24) & 0xff;
    b[i++] = (tl >>> 16) & 0xff;
    b[i++] = (tl >>> 8) & 0xff;
    b[i++] = tl & 0xff; // `time_mid`

    var tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    b[i++] = (tmh >>> 8) & 0xff;
    b[i++] = tmh & 0xff; // `time_high_and_version`

    b[i++] = ((tmh >>> 24) & 0xf) | 0x10; // include version

    b[i++] = (tmh >>> 16) & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

    b[i++] = (clockseq >>> 8) | 0x80; // `clock_seq_low`

    b[i++] = clockseq & 0xff; // `node`

    for (var n = 0; n < 6; ++n) {
      b[i + n] = node[n];
    }

    return buf ? buf : bytesToUuid_1(b);
  }

  var v1_1 = v1;

  function v4(options, buf, offset) {
    var i = (buf && offset) || 0;

    if (typeof options == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }

    options = options || {};
    var rnds = options.random || (options.rng || rngBrowser)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || bytesToUuid_1(rnds);
  }

  var v4_1 = v4;

  var uuid = v4_1;
  uuid.v1 = v1_1;
  uuid.v4 = v4_1;
  var uuid_1 = uuid;

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
    return _baseIsEqual(value, other);
  }

  var isEqual_1 = isEqual;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;
  /** Used to check objects for own properties. */

  var hasOwnProperty$9 = objectProto$c.hasOwnProperty;
  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */

  function baseHas(object, key) {
    return object != null && hasOwnProperty$9.call(object, key);
  }

  var _baseHas = baseHas;

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
    return object != null && _hasPath(object, path, _baseHas);
  }

  var has_1 = has;

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

  var _arrayEvery = arrayEvery;

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
    _baseEach(collection, function (value, index, collection) {
      result = !!predicate(value, index, collection);
      return result;
    });
    return result;
  }

  var _baseEvery = baseEvery;

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
    if (!isObject_1(object)) {
      return false;
    }

    var type = _typeof(index);

    if (
      type == 'number' ? isArrayLike_1(object) && _isIndex(index, object.length) : type == 'string' && index in object
    ) {
      return eq_1(object[index], value);
    }

    return false;
  }

  var _isIterateeCall = isIterateeCall;

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
    var func = isArray_1(collection) ? _arrayEvery : _baseEvery;

    if (guard && _isIterateeCall(collection, predicate, guard)) {
      predicate = undefined;
    }

    return func(collection, _baseIteratee(predicate));
  }

  var every_1 = every;

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

  var compact_1 = compact;

  /** Built-in value references. */

  var getPrototype = _overArg(Object.getPrototypeOf, Object);
  var _getPrototype = getPrototype;

  /** `Object#toString` result references. */

  var objectTag$3 = '[object Object]';
  /** Used for built-in method references. */

  var funcProto$2 = Function.prototype,
    objectProto$d = Object.prototype;
  /** Used to resolve the decompiled source of functions. */

  var funcToString$2 = funcProto$2.toString;
  /** Used to check objects for own properties. */

  var hasOwnProperty$a = objectProto$d.hasOwnProperty;
  /** Used to infer the `Object` constructor. */

  var objectCtorString = funcToString$2.call(Object);
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
    if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$3) {
      return false;
    }

    var proto = _getPrototype(value);

    if (proto === null) {
      return true;
    }

    var Ctor = hasOwnProperty$a.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString;
  }

  var isPlainObject_1 = isPlainObject;

  /*
   * Copyright (c) 2013 Kevin van Zonneveld (http://kvz.io)
   * and Contributors (http://phpjs.org/authors)
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy of
   * this software and associated documentation files (the "Software"), to deal in
   * the Software without restriction, including without limitation the rights to
   * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
   * of the Software, and to permit persons to whom the Software is furnished to do
   * so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  function base64urldecode(data) {
    if (!data) {
      return data;
    }

    var padding = 4 - (data.length % 4);

    switch (padding) {
      case 2:
        data += '==';
        break;

      case 3:
        data += '=';
        break;
    }

    var b64Data = data.replace(/-/g, '+').replace(/_/g, '/');
    return base64decode(b64Data);
  }
  /**
   * Encode string as base64.
   * Any type can be passed, but will be stringified
   *
   * @param data string to encode
   * @returns base64-encoded string
   */

  function base64encode(data) {
    // discuss at: http://phpjs.org/functions/base64_encode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Bayron Guevara
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Rafał Kukawski (http://kukawski.pl)
    // bugfixed by: Pellentesque Malesuada
    // example 1: base64_encode('Kevin van Zonneveld');
    // returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // example 2: base64_encode('a');
    // returns 2: 'YQ=='
    // example 3: base64_encode('✓ à la mode');
    // returns 3: '4pyTIMOgIGxhIG1vZGU='
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
      ac = 0;
    var tmp_arr = [];

    if (!data) {
      return data;
    }

    data = unescape(encodeURIComponent(data));

    do {
      // pack three octets into four hexets
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);
      bits = (o1 << 16) | (o2 << 8) | o3;
      h1 = (bits >> 18) & 0x3f;
      h2 = (bits >> 12) & 0x3f;
      h3 = (bits >> 6) & 0x3f;
      h4 = bits & 0x3f; // use hexets to index into b64, and append result to encoded string

      tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    var enc = tmp_arr.join('');
    var r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
  }

  function base64decode(encodedData) {
    //  discuss at: http://locutus.io/php/base64_decode/
    // original by: Tyler Akins (http://rumkin.com)
    // improved by: Thunder.m
    // improved by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Kevin van Zonneveld (http://kvz.io)
    //    input by: Aman Gupta
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // bugfixed by: Pellentesque Malesuada
    // bugfixed by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Indigo744
    //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==')
    //   returns 1: 'Kevin van Zonneveld'
    //   example 2: base64_decode('YQ==')
    //   returns 2: 'a'
    //   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=')
    //   returns 3: '✓ à la mode'
    // decodeUTF8string()
    // Internal function to decode properly UTF8 string
    // Adapted from Solution #1 at https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    var decodeUTF8string = function decodeUTF8string(str) {
      // Going backwards: from bytestream, to percent-encoding, to original string.
      return decodeURIComponent(
        str
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
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
      dec = '';
    var tmpArr = [];

    if (!encodedData) {
      return encodedData;
    }

    encodedData += '';

    do {
      // unpack four hexets into three octets using index points in b64
      h1 = b64.indexOf(encodedData.charAt(i++));
      h2 = b64.indexOf(encodedData.charAt(i++));
      h3 = b64.indexOf(encodedData.charAt(i++));
      h4 = b64.indexOf(encodedData.charAt(i++));
      bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
      o1 = (bits >> 16) & 0xff;
      o2 = (bits >> 8) & 0xff;
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
  /*
   * JavaScript tracker core for Snowplow: payload.ts
   *
   * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
   *
   * This program is licensed to you under the Apache License Version 2.0,
   * and you may not use this file except in compliance with the Apache License Version 2.0.
   * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
   *
   * Unless required by applicable law or agreed to in writing,
   * software distributed under the Apache License Version 2.0 is distributed on an
   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
   */

  /**
   * Base64 encode data with URL and Filename Safe Alphabet (base64url)
   *
   * See: http://tools.ietf.org/html/rfc4648#page-7
   */

  function base64urlencode(data) {
    if (!data) {
      return data;
    }

    var enc = base64encode(data);
    return enc.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
  /**
   * Is property a non-empty JSON?
   */

  function isNonEmptyJson(property) {
    if (!isJson(property)) {
      return false;
    }

    for (var key in property) {
      if (Object.prototype.hasOwnProperty.call(property, key)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Is property a JSON?
   */

  function isJson(property) {
    var record = property;
    return (
      typeof record !== 'undefined' &&
      record !== null &&
      (record.constructor === {}.constructor || record.constructor === [].constructor)
    );
  }
  /**
   * A helper to build a Snowplow request string from an
   * an optional initial value plus a set of individual
   * name-value pairs, provided using the add method.
   *
   * @param base64Encode Whether or not JSONs should be Base64-URL-safe-encoded
   *
   * @return The request string builder, with add, addRaw and build methods
   */

  function payloadBuilder(base64Encode) {
    var dict = {};

    var add = function add(key, value) {
      if (value != null && value !== '') {
        // null also checks undefined
        dict[key] = value;
      }
    };

    var addDict = function addDict(dict) {
      for (var key in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          add(key, dict[key]);
        }
      }
    };

    var addJson = function addJson(keyIfEncoded, keyIfNotEncoded, json) {
      if (json && isNonEmptyJson(json)) {
        var str = JSON.stringify(json);

        if (base64Encode) {
          add(keyIfEncoded, base64urlencode(str));
        } else {
          add(keyIfNotEncoded, str);
        }
      }
    };

    var build = function build() {
      return dict;
    };

    return {
      add: add,
      addDict: addDict,
      addJson: addJson,
      build: build,
    };
  }
  /*
   * JavaScript tracker core for Snowplow: contexts.ts
   *
   * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
   *
   * This program is licensed to you under the Apache License Version 2.0,
   * and you may not use this file except in compliance with the Apache License Version 2.0.
   * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
   *
   * Unless required by applicable law or agreed to in writing,
   * software distributed under the Apache License Version 2.0 is distributed on an
   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
   */

  /**
   * Contains helper functions to aid in the addition and removal of Global Contexts
   */

  function globalContexts() {
    var globalPrimitives = [];
    var conditionalProviders = [];
    /**
     * Returns all applicable global contexts for a specified event
     * @param event The event to check for applicable global contexts for
     */

    var assembleAllContexts = function assembleAllContexts(event) {
      var eventSchema = getUsefulSchema(event);
      var eventType = getEventType(event);
      var contexts = [];
      var generatedPrimitives = generatePrimitives(globalPrimitives, event, eventType, eventSchema);
      contexts.push.apply(contexts, _toConsumableArray(generatedPrimitives));
      var generatedConditionals = generateConditionals(conditionalProviders, event, eventType, eventSchema);
      contexts.push.apply(contexts, _toConsumableArray(generatedConditionals));
      return contexts;
    };

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

        var _iterator = _createForOfIteratorHelper(contexts),
          _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var context = _step.value;

            if (isConditionalContextProvider(context)) {
              acceptedConditionalContexts.push(context);
            } else if (isContextPrimitive(context)) {
              acceptedContextPrimitives.push(context);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        globalPrimitives = globalPrimitives.concat(acceptedContextPrimitives);
        conditionalProviders = conditionalProviders.concat(acceptedConditionalContexts);
      },
      clearGlobalContexts: function clearGlobalContexts() {
        conditionalProviders = [];
        globalPrimitives = [];
      },
      removeGlobalContexts: function removeGlobalContexts(contexts) {
        var _iterator2 = _createForOfIteratorHelper(contexts),
          _step2;

        try {
          var _loop = function _loop() {
            var context = _step2.value;

            if (isConditionalContextProvider(context)) {
              conditionalProviders = conditionalProviders.filter(function (item) {
                return !isEqual_1(item, context);
              });
            } else if (isContextPrimitive(context)) {
              globalPrimitives = globalPrimitives.filter(function (item) {
                return !isEqual_1(item, context);
              });
            }
          };

          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            _loop();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
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
      },
    };
  }
  /**
   * Returns an array containing the parts of the specified schema
   * @param input A schema string
   */

  function getSchemaParts(input) {
    var re = new RegExp(
      '^iglu:([a-zA-Z0-9-_.]+)/([a-zA-Z0-9-_]+)/jsonschema/([1-9][0-9]*)-(0|[1-9][0-9]*)-(0|[1-9][0-9]*)$'
    );
    var matches = re.exec(input);
    if (matches !== null) return matches.slice(1, 6);
    return undefined;
  }
  /**
   * Validates the vendor section of a schema string contains allowed wildcard values
   * @param parts Array of parts from a schema string
   */

  function validateVendorParts(parts) {
    if (parts[0] === '*' || parts[1] === '*') {
      return false; // no wildcard in first or second part
    }

    if (parts.slice(2).length > 0) {
      var asterisk = false;

      var _iterator3 = _createForOfIteratorHelper(parts.slice(2)),
        _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var part = _step3.value;
          if (part === '*')
            // mark when we've found a wildcard
            asterisk = true;
          else if (asterisk)
            // invalid if alpha parts come after wildcard
            return false;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return true;
    } else if (parts.length == 2) return true;

    return false;
  }
  /**
   * Validates the vendor part of a schema string is valid for a rule set
   * @param input Vendor part of a schema string
   */

  function validateVendor(input) {
    var parts = input.split('.');
    if (parts && parts.length > 1) return validateVendorParts(parts);
    return false;
  }
  /**
   * Returns all the sections of a schema string that are used to match rules in a ruleset
   * @param input A Schema string
   */

  function getRuleParts(input) {
    var re = new RegExp(
      '^iglu:((?:(?:[a-zA-Z0-9-_]+|\\*).)+(?:[a-zA-Z0-9-_]+|\\*))/([a-zA-Z0-9-_.]+|\\*)/jsonschema/([1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)-(0|[1-9][0-9]*|\\*)$'
    );
    var matches = re.exec(input);
    if (matches !== null && validateVendor(matches[1])) return matches.slice(1, 6);
    return undefined;
  }
  /**
   * Ensures the rules specified in a schema string of a ruleset are valid
   * @param input A Schema string
   */

  function isValidRule(input) {
    var ruleParts = getRuleParts(input);

    if (ruleParts) {
      var vendor = ruleParts[0];
      return ruleParts.length === 5 && validateVendor(vendor);
    }

    return false;
  }

  function isStringArray(input) {
    return (
      Array.isArray(input) &&
      input.every(function (x) {
        return typeof x === 'string';
      })
    );
  }

  function isValidRuleSetArg(input) {
    if (isStringArray(input))
      return input.every(function (x) {
        return isValidRule(x);
      });
    else if (typeof input === 'string') return isValidRule(input);
    return false;
  }

  function isSelfDescribingJson(input) {
    var sdj = input;
    if (isNonEmptyJson(sdj))
      if ('schema' in sdj && 'data' in sdj) return typeof sdj.schema === 'string' && _typeof(sdj.data) === 'object';
    return false;
  }

  function isEventJson(input) {
    var payload = input;
    if (isNonEmptyJson(payload) && 'e' in payload) return typeof payload.e === 'string';
    return false;
  }

  function isRuleSet(input) {
    var ruleSet = input;
    var ruleCount = 0;

    if (isPlainObject_1(input)) {
      if (has_1(ruleSet, 'accept')) {
        if (isValidRuleSetArg(ruleSet['accept'])) {
          ruleCount += 1;
        } else {
          return false;
        }
      }

      if (has_1(ruleSet, 'reject')) {
        if (isValidRuleSetArg(ruleSet['reject'])) {
          ruleCount += 1;
        } else {
          return false;
        }
      } // if either 'reject' or 'accept' or both exists,
      // we have a valid ruleset

      return ruleCount > 0 && ruleCount <= 2;
    }

    return false;
  }

  function isContextGenerator(input) {
    return typeof input === 'function' && input.length <= 1;
  }

  function isContextFilter(input) {
    return typeof input === 'function' && input.length <= 1;
  }

  function isContextPrimitive(input) {
    return isContextGenerator(input) || isSelfDescribingJson(input);
  }

  function isFilterProvider(input) {
    if (Array.isArray(input)) {
      if (input.length === 2) {
        if (Array.isArray(input[1])) {
          return isContextFilter(input[0]) && every_1(input[1], isContextPrimitive);
        }

        return isContextFilter(input[0]) && isContextPrimitive(input[1]);
      }
    }

    return false;
  }

  function isRuleSetProvider(input) {
    if (Array.isArray(input) && input.length === 2) {
      if (!isRuleSet(input[0])) return false;
      if (Array.isArray(input[1])) return every_1(input[1], isContextPrimitive);
      return isContextPrimitive(input[1]);
    }

    return false;
  }

  function isConditionalContextProvider(input) {
    return isFilterProvider(input) || isRuleSetProvider(input);
  }

  function matchSchemaAgainstRuleSet(ruleSet, schema) {
    var rejectCount = 0;
    var acceptCount = 0;
    var acceptRules = get_1(ruleSet, 'accept');

    if (Array.isArray(acceptRules)) {
      if (
        ruleSet.accept.some(function (rule) {
          return matchSchemaAgainstRule(rule, schema);
        })
      ) {
        acceptCount++;
      }
    } else if (typeof acceptRules === 'string') {
      if (matchSchemaAgainstRule(acceptRules, schema)) {
        acceptCount++;
      }
    }

    var rejectRules = get_1(ruleSet, 'reject');

    if (Array.isArray(rejectRules)) {
      if (
        ruleSet.reject.some(function (rule) {
          return matchSchemaAgainstRule(rule, schema);
        })
      ) {
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

  function matchSchemaAgainstRule(rule, schema) {
    if (!isValidRule(rule)) return false;
    var ruleParts = getRuleParts(rule);
    var schemaParts = getSchemaParts(schema);

    if (ruleParts && schemaParts) {
      if (!matchVendor(ruleParts[0], schemaParts[0])) return false;

      for (var i = 1; i < 5; i++) {
        if (!matchPart(ruleParts[i], schemaParts[i])) return false;
      }

      return true; // if it hasn't failed, it passes
    }

    return false;
  }

  function matchVendor(rule, vendor) {
    // rule and vendor must have same number of elements
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

  function matchPart(rule, schema) {
    // parts should be the string nested between slashes in the URI: /example/
    return (rule && schema && rule === '*') || rule === schema;
  } // Returns the "useful" schema, i.e. what would someone want to use to identify events.
  // The idea being that you can determine the event type from 'e', so getting the schema from
  // 'ue_px.schema'/'ue_pr.schema' would be redundant - it'll return the unstruct_event schema.
  // Instead the schema nested inside the unstruct_event is more useful!
  // This doesn't decode ue_px, it works because it's called by code that has already decoded it

  function getUsefulSchema(sb) {
    if (typeof get_1(sb, 'ue_px.data.schema') === 'string') return get_1(sb, 'ue_px.data.schema');
    else if (typeof get_1(sb, 'ue_pr.data.schema') === 'string') return get_1(sb, 'ue_pr.data.schema');
    else if (typeof get_1(sb, 'schema') === 'string') return get_1(sb, 'schema');
    return '';
  }

  function getDecodedEvent(sb) {
    var decodedEvent = _objectSpread2({}, sb); // spread operator, instantiates new object

    try {
      if (has_1(decodedEvent, 'ue_px')) {
        decodedEvent['ue_px'] = JSON.parse(base64urldecode(get_1(decodedEvent, ['ue_px'])));
      }

      return decodedEvent;
    } catch (e) {
      return decodedEvent;
    }
  }

  function getEventType(sb) {
    return get_1(sb, 'e', '');
  }

  function buildGenerator(generator, event, eventType, eventSchema) {
    var contextGeneratorResult = undefined;

    try {
      // try to evaluate context generator
      var args = {
        event: event,
        eventType: eventType,
        eventSchema: eventSchema,
      };
      contextGeneratorResult = generator(args); // determine if the produced result is a valid SDJ

      if (isSelfDescribingJson(contextGeneratorResult)) {
        return contextGeneratorResult;
      } else if (Array.isArray(contextGeneratorResult) && every_1(contextGeneratorResult, isSelfDescribingJson)) {
        return contextGeneratorResult;
      } else {
        return undefined;
      }
    } catch (error) {
      contextGeneratorResult = undefined;
    }

    return contextGeneratorResult;
  }

  function normalizeToArray(input) {
    if (Array.isArray(input)) {
      return input;
    }

    return Array.of(input);
  }

  function generatePrimitives(contextPrimitives, event, eventType, eventSchema) {
    var _ref;

    var normalizedInputs = normalizeToArray(contextPrimitives);

    var partialEvaluate = function partialEvaluate(primitive) {
      var result = evaluatePrimitive(primitive, event, eventType, eventSchema);

      if (result && result.length !== 0) {
        return result;
      }

      return undefined;
    };

    var generatedContexts = map_1(normalizedInputs, partialEvaluate);
    return (_ref = []).concat.apply(_ref, _toConsumableArray(compact_1(generatedContexts)));
  }

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

  function evaluateProvider(provider, event, eventType, eventSchema) {
    if (isFilterProvider(provider)) {
      var filter = provider[0];
      var filterResult = false;

      try {
        var args = {
          event: event,
          eventType: eventType,
          eventSchema: eventSchema,
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

  function generateConditionals(providers, event, eventType, eventSchema) {
    var _ref2;

    var normalizedInput = normalizeToArray(providers);

    var partialEvaluate = function partialEvaluate(provider) {
      var result = evaluateProvider(provider, event, eventType, eventSchema);

      if (result && result.length !== 0) {
        return result;
      }

      return undefined;
    };

    var generatedContexts = map_1(normalizedInput, partialEvaluate);
    return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(compact_1(generatedContexts)));
  }
  /*
   * JavaScript tracker core for Snowplow: core.ts
   *
   * Copyright (c) 2014-2020 Snowplow Analytics Ltd. All rights reserved.
   *
   * This program is licensed to you under the Apache License Version 2.0,
   * and you may not use this file except in compliance with the Apache License Version 2.0.
   * You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
   *
   * Unless required by applicable law or agreed to in writing,
   * software distributed under the Apache License Version 2.0 is distributed on an
   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.
   */

  /**
   * Transform optional/old-behavior number timestamp into`Timestamp` ADT
   *
   * @param tstamp optional number or timestamp object
   * @returns correct timestamp object
   */

  function getTimestamp(tstamp) {
    if (tstamp == null) {
      return {
        type: 'dtm',
        value: new Date().getTime(),
      };
    } else if (typeof tstamp === 'number') {
      return {
        type: 'dtm',
        value: tstamp,
      };
    } else if (tstamp.type === 'ttm') {
      // We can return tstamp here, but this is safer fallback
      return {
        type: 'ttm',
        value: tstamp.value,
      };
    } else {
      return {
        type: 'dtm',
        value: tstamp.value || new Date().getTime(),
      };
    }
  }
  /**
   * Create a tracker core object
   *
   * @param base64 Whether to base 64 encode contexts and self describing event JSONs
   * @param callback Function applied to every payload dictionary object
   * @return Tracker core
   */

  function trackerCore(base64, callback) {
    var globalContextsHelper = globalContexts(); // Dictionary of key-value pairs which get added to every payload, e.g. tracker version

    var payloadPairs = {}; // base 64 encoding should default to true

    if (typeof base64 === 'undefined') {
      base64 = true;
    }
    /**
     * Returns a copy of a JSON with undefined and null properties removed
     *
     * @param eventJson JSON object to clean
     * @param exemptFields Set of fields which should not be removed even if empty
     * @return A cleaned copy of eventJson
     */

    var removeEmptyProperties = function removeEmptyProperties(eventJson, exemptFields) {
      var ret = {};
      exemptFields = exemptFields || {};

      for (var k in eventJson) {
        if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
          ret[k] = eventJson[k];
        }
      }

      return ret;
    };
    /**
     * Wraps an array of custom contexts in a self-describing JSON
     *
     * @param contexts Array of custom context self-describing JSONs
     * @return Outer JSON
     */

    var completeContexts = function completeContexts(contexts) {
      if (contexts && contexts.length) {
        return {
          schema: 'iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0',
          data: contexts,
        };
      }

      return undefined;
    };
    /**
     * Adds all global contexts to a contexts array
     *
     * @param sb PayloadData
     * @param contexts Custom contexts relating to the event
     */

    var attachGlobalContexts = function attachGlobalContexts(sb, contexts) {
      var applicableContexts = globalContextsHelper.getApplicableContexts(sb);
      var returnedContexts = [];

      if (contexts && contexts.length) {
        returnedContexts.push.apply(returnedContexts, _toConsumableArray(contexts));
      }

      if (applicableContexts && applicableContexts.length) {
        returnedContexts.push.apply(returnedContexts, _toConsumableArray(applicableContexts));
      }

      return returnedContexts;
    };
    /**
     * Gets called by every trackXXX method
     * Adds context and payloadPairs name-value pairs to the payload
     * Applies the callback to the built payload
     *
     * @param sb Payload
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload after the callback is applied
     */

    var track = function track(sb, context, tstamp, afterTrack) {
      sb.addDict(payloadPairs);
      sb.add('eid', uuid_1.v4());
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

      try {
        afterTrack && afterTrack(sb.build());
      } catch (ex) {
        console.warn('Snowplow: error running custom callback');
      }

      return sb;
    };
    /**
     * Log a self-describing event
     *
     * @param properties Contains the properties and schema location for the event
     * @param context Custom contexts relating to the event
     * @param tstamp Timestamp of the event
     * @param afterTrack A callback function triggered after event is tracked
     * @return Payload
     */

    var trackSelfDescribingEvent = function trackSelfDescribingEvent(properties, context, tstamp, afterTrack) {
      var sb = payloadBuilder(base64);
      var ueJson = {
        schema: 'iglu:com.snowplowanalytics.snowplow/unstruct_event/jsonschema/1-0-0',
        data: properties,
      };
      sb.add('e', 'ue');
      sb.addJson('ue_px', 'ue_pr', ueJson);
      return track(sb, context, tstamp, afterTrack);
    };
    /**
     * Set a persistent key-value pair to be added to every payload
     *
     * @param key Field name
     * @param value Field value
     */

    var addPayloadPair = function addPayloadPair(key, value) {
      payloadPairs[key] = value;
    };

    return {
      addPayloadPair: addPayloadPair,
      setBase64Encoding: function setBase64Encoding(encode) {
        base64 = encode;
      },
      addPayloadDict: function addPayloadDict(dict) {
        for (var key in dict) {
          if (Object.prototype.hasOwnProperty.call(dict, key)) {
            payloadPairs[key] = dict[key];
          }
        }
      },
      resetPayloadPairs: function resetPayloadPairs(dict) {
        payloadPairs = isJson(dict) ? dict : {};
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
      trackSelfDescribingEvent: trackSelfDescribingEvent,
      trackPageView: function trackPageView(pageUrl, pageTitle, referrer, context, tstamp, afterTrack) {
        var sb = payloadBuilder(base64);
        sb.add('e', 'pv'); // 'pv' for Page View

        sb.add('url', pageUrl);
        sb.add('page', pageTitle);
        sb.add('refr', referrer);
        return track(sb, context, tstamp, afterTrack);
      },
      trackPagePing: function trackPagePing(
        pageUrl,
        pageTitle,
        referrer,
        minXOffset,
        maxXOffset,
        minYOffset,
        maxYOffset,
        context,
        tstamp,
        afterTrack
      ) {
        var sb = payloadBuilder(base64);
        sb.add('e', 'pp'); // 'pp' for Page Ping

        sb.add('url', pageUrl);
        sb.add('page', pageTitle);
        sb.add('refr', referrer);
        sb.add('pp_mix', minXOffset.toString());
        sb.add('pp_max', maxXOffset.toString());
        sb.add('pp_miy', minYOffset.toString());
        sb.add('pp_may', maxYOffset.toString());
        return track(sb, context, tstamp, afterTrack);
      },
      trackStructEvent: function trackStructEvent(
        category,
        action,
        label,
        property,
        value,
        context,
        tstamp,
        afterTrack
      ) {
        var sb = payloadBuilder(base64);
        sb.add('e', 'se'); // 'se' for Structured Event

        sb.add('se_ca', category);
        sb.add('se_ac', action);
        sb.add('se_la', label);
        sb.add('se_pr', property);
        sb.add('se_va', value == null ? undefined : value.toString());
        return track(sb, context, tstamp, afterTrack);
      },
      trackEcommerceTransaction: function trackEcommerceTransaction(
        orderId,
        affiliation,
        totalValue,
        taxValue,
        shipping,
        city,
        state,
        country,
        currency,
        context,
        tstamp,
        afterTrack
      ) {
        var sb = payloadBuilder(base64);
        sb.add('e', 'tr'); // 'tr' for Transaction

        sb.add('tr_id', orderId);
        sb.add('tr_af', affiliation);
        sb.add('tr_tt', totalValue);
        sb.add('tr_tx', taxValue);
        sb.add('tr_sh', shipping);
        sb.add('tr_ci', city);
        sb.add('tr_st', state);
        sb.add('tr_co', country);
        sb.add('tr_cu', currency);
        return track(sb, context, tstamp, afterTrack);
      },
      trackEcommerceTransactionItem: function trackEcommerceTransactionItem(
        orderId,
        sku,
        name,
        category,
        price,
        quantity,
        currency,
        context,
        tstamp,
        afterTrack
      ) {
        var sb = payloadBuilder(base64);
        sb.add('e', 'ti'); // 'tr' for Transaction Item

        sb.add('ti_id', orderId);
        sb.add('ti_sk', sku);
        sb.add('ti_nm', name);
        sb.add('ti_ca', category);
        sb.add('ti_pr', price);
        sb.add('ti_qu', quantity);
        sb.add('ti_cu', currency);
        return track(sb, context, tstamp, afterTrack);
      },
      trackScreenView: function trackScreenView(name, id, context, tstamp, afterTrack) {
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
            data: removeEmptyProperties({
              name: name,
              id: id,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackLinkClick: function trackLinkClick(
        targetUrl,
        elementId,
        elementClasses,
        elementTarget,
        elementContent,
        context,
        tstamp,
        afterTrack
      ) {
        var eventJson = {
          schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
          data: removeEmptyProperties({
            targetUrl: targetUrl,
            elementId: elementId,
            elementClasses: elementClasses,
            elementTarget: elementTarget,
            elementContent: elementContent,
          }),
        };
        return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
      },
      trackAdImpression: function trackAdImpression(
        impressionId,
        costModel,
        cost,
        targetUrl,
        bannerId,
        zoneId,
        advertiserId,
        campaignId,
        context,
        tstamp,
        afterTrack
      ) {
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
            campaignId: campaignId,
          }),
        };
        return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
      },
      trackAdClick: function trackAdClick(
        targetUrl,
        clickId,
        costModel,
        cost,
        bannerId,
        zoneId,
        impressionId,
        advertiserId,
        campaignId,
        context,
        tstamp,
        afterTrack
      ) {
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
            campaignId: campaignId,
          }),
        };
        return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
      },
      trackAdConversion: function trackAdConversion(
        conversionId,
        costModel,
        cost,
        category,
        action,
        property,
        initialValue,
        advertiserId,
        campaignId,
        context,
        tstamp,
        afterTrack
      ) {
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
            campaignId: campaignId,
          }),
        };
        return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
      },
      trackSocialInteraction: function trackSocialInteraction(action, network, target, context, tstamp, afterTrack) {
        var eventJson = {
          schema: 'iglu:com.snowplowanalytics.snowplow/social_interaction/jsonschema/1-0-0',
          data: removeEmptyProperties({
            action: action,
            network: network,
            target: target,
          }),
        };
        return trackSelfDescribingEvent(eventJson, context, tstamp, afterTrack);
      },
      trackAddToCart: function trackAddToCart(
        sku,
        name,
        category,
        unitPrice,
        quantity,
        currency,
        context,
        tstamp,
        afterTrack
      ) {
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/add_to_cart/jsonschema/1-0-0',
            data: removeEmptyProperties({
              sku: sku,
              name: name,
              category: category,
              unitPrice: unitPrice,
              quantity: quantity,
              currency: currency,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackRemoveFromCart: function trackRemoveFromCart(
        sku,
        name,
        category,
        unitPrice,
        quantity,
        currency,
        context,
        tstamp,
        afterTrack
      ) {
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/remove_from_cart/jsonschema/1-0-0',
            data: removeEmptyProperties({
              sku: sku,
              name: name,
              category: category,
              unitPrice: unitPrice,
              quantity: quantity,
              currency: currency,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackFormFocusOrChange: function trackFormFocusOrChange(
        schema,
        formId,
        elementId,
        nodeName,
        type,
        elementClasses,
        value,
        context,
        tstamp,
        afterTrack
      ) {
        var event_schema = '';
        var event_data = {
          formId: formId,
          elementId: elementId,
          nodeName: nodeName,
          elementClasses: elementClasses,
          value: value,
        };

        if (schema === 'change_form') {
          event_schema = 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0';
          event_data.type = type;
        } else if (schema === 'focus_form') {
          event_schema = 'iglu:com.snowplowanalytics.snowplow/focus_form/jsonschema/1-0-0';
          event_data.elementType = type;
        }

        return trackSelfDescribingEvent(
          {
            schema: event_schema,
            data: removeEmptyProperties(event_data, {
              value: true,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackFormSubmission: function trackFormSubmission(formId, formClasses, elements, context, tstamp, afterTrack) {
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
            data: removeEmptyProperties({
              formId: formId,
              formClasses: formClasses,
              elements: elements,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackSiteSearch: function trackSiteSearch(
        terms,
        filters,
        totalResults,
        pageResults,
        context,
        tstamp,
        afterTrack
      ) {
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0',
            data: removeEmptyProperties({
              terms: terms,
              filters: filters,
              totalResults: totalResults,
              pageResults: pageResults,
            }),
          },
          context,
          tstamp,
          afterTrack
        );
      },
      trackConsentWithdrawn: function trackConsentWithdrawn(
        all,
        id,
        version,
        name,
        description,
        context,
        tstamp,
        afterTrack
      ) {
        var documentJson = {
          schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
          data: removeEmptyProperties({
            id: id,
            version: version,
            name: name,
            description: description,
          }),
        };
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_withdrawn/jsonschema/1-0-0',
            data: removeEmptyProperties({
              all: all,
            }),
          },
          documentJson.data && context ? context.concat([documentJson]) : context,
          tstamp,
          afterTrack
        );
      },
      trackConsentGranted: function trackConsentGranted(
        id,
        version,
        name,
        description,
        expiry,
        context,
        tstamp,
        afterTrack
      ) {
        var documentJson = {
          schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
          data: removeEmptyProperties({
            id: id,
            version: version,
            name: name,
            description: description,
          }),
        };
        return trackSelfDescribingEvent(
          {
            schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
            data: removeEmptyProperties({
              expiry: expiry,
            }),
          },
          context ? context.concat([documentJson]) : [documentJson],
          tstamp,
          afterTrack
        );
      },
      addGlobalContexts: function addGlobalContexts(contexts) {
        globalContextsHelper.addGlobalContexts(contexts);
      },
      clearGlobalContexts: function clearGlobalContexts() {
        globalContextsHelper.clearGlobalContexts();
      },
      removeGlobalContexts: function removeGlobalContexts(contexts) {
        globalContextsHelper.removeGlobalContexts(contexts);
      },
    };
  }

  /*
   * JavaScript tracker for Snowplow: tracker.js
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
   * 8. pageUnloadTimer, 500
   * 9. forceSecureTracker, false
   * 10. forceUnsecureTracker, false
   * 11. sessionCookieTimeout, 1800
   * 12. contexts, {}
   * 13. eventMethod, 'post'
   * 14. postPath, null
   * 15. useStm, true
   * 16. bufferSize, 1
   * 17. crossDomainLinker, false
   * 18. maxPostBytes, 40000
   * 19. discoverRootDomain, false
   * 20. cookieLifetime, 63072000
   * 21. stateStorageStrategy, 'cookieAndLocalStorage'
   * 22. maxLocalStorageQueueSize, 1000
   * 23. resetActivityTrackingOnPageView, true
   * 24. connectionTimeout, 5000
   * 25. skippedBrowserFeatures, []
   * 26. anonymousTracking, false // bool | { withSessionTracking: bool, withServerAnonymisation: bool }
   */

  function Tracker(functionName, namespace, version, mutSnowplowState, argmap) {
    /************************************************************
     * Private members
     ************************************************************/
    var argmap = argmap || {}; //use POST if eventMethod isn't present on the argmap

    argmap.eventMethod = argmap.eventMethod || 'post'; // attach stm to GET requests by default

    if (!argmap.hasOwnProperty('useStm')) {
      argmap.useStm = true;
    }

    var getStateStorageStrategy = function getStateStorageStrategy(config) {
      return config.hasOwnProperty('stateStorageStrategy') ? config.stateStorageStrategy : 'cookieAndLocalStorage';
    };

    var getAnonymousSessionTracking = function getAnonymousSessionTracking(config) {
      return config.hasOwnProperty('anonymousTracking') ? config.anonymousTracking.withSessionTracking === true : false;
    };

    var getAnonymousServerTracking = function getAnonymousServerTracking(config) {
      return config.hasOwnProperty('anonymousTracking')
        ? config.anonymousTracking.withServerAnonymisation === true
        : false;
    };

    var getAnonymousTracking = function getAnonymousTracking(config) {
      return !!config.anonymousTracking;
    }; // Enum for accpted values of the gdprBasisContext's basisForProcessing argument

    var gdprBasisEnum = Object.freeze({
      consent: 'consent',
      contract: 'contract',
      legalObligation: 'legal_obligation',
      vitalInterests: 'vital_interests',
      publicTask: 'public_task',
      legitimateInterests: 'legitimate_interests',
    });
    var // Tracker core
      core = trackerCore(true, function (payload) {
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
      locationArray = fixupUrl(documentAlias.domain, windowAlias.location.href, getReferrer()),
      domainAlias = fixupDomain(locationArray[0]),
      locationHrefAlias = locationArray[1],
      configReferrerUrl = locationArray[2],
      customReferrer,
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
      // Controls whether activity tracking page ping event timers are reset on page view events
      resetActivityTrackingOnPageView = argmap.hasOwnProperty('resetActivityTrackingOnPageView')
        ? argmap.resetActivityTrackingOnPageView
        : true,
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
      // First-party cookie samesite attribute
      configCookieSameSite = argmap.hasOwnProperty('cookieSameSite') ? argmap.cookieSameSite : 'None',
      // First-party cookie secure attribute
      configCookieSecure = argmap.hasOwnProperty('cookieSecure') ? argmap.cookieSecure : true,
      // Do Not Track browser feature
      dnt = navigatorAlias.doNotTrack || navigatorAlias.msDoNotTrack || windowAlias.doNotTrack,
      // Do Not Track
      configDoNotTrack = argmap.hasOwnProperty('respectDoNotTrack')
        ? argmap.respectDoNotTrack && (dnt === 'yes' || dnt === '1')
        : false,
      // Opt out of cookie tracking
      configOptOutCookie,
      // Life of the visitor cookie (in seconds)
      configVisitorCookieTimeout = argmap.hasOwnProperty('cookieLifetime') ? argmap.cookieLifetime : 63072000,
      // 2 years
      // Life of the session cookie (in seconds)
      configSessionCookieTimeout = argmap.hasOwnProperty('sessionCookieTimeout') ? argmap.sessionCookieTimeout : 1800,
      // 30 minutes
      // Document character set
      documentCharset = documentAlias.characterSet || documentAlias.charset,
      // This forces the tracker to be HTTPS even if the page is not secure
      forceSecureTracker = argmap.hasOwnProperty('forceSecureTracker') ? argmap.forceSecureTracker === true : false,
      // This forces the tracker to be HTTP even if the page is secure
      forceUnsecureTracker =
        !forceSecureTracker && argmap.hasOwnProperty('forceUnsecureTracker')
          ? argmap.forceUnsecureTracker === true
          : false,
      // Allows tracking user session (using cookies or local storage), can only be used with anonymousTracking
      configAnonymousSessionTracking = getAnonymousSessionTracking(argmap),
      // Will send a header to server to prevent returning cookie and capturing IP
      configAnonymousServerTracking = getAnonymousServerTracking(argmap),
      // Sets tracker to work in anonymous mode without accessing client storage
      configAnonymousTracking = getAnonymousTracking(argmap),
      // Strategy defining how to store the state: cookie, localStorage, cookieAndLocalStorage or none
      configStateStorageStrategy = getStateStorageStrategy(argmap),
      // Browser language (or Windows language for IE). Imperfect but CloudFront doesn't log the Accept-Language header
      browserLanguage = navigatorAlias.userLanguage || navigatorAlias.language,
      // Browser features via client-side data collection
      browserFeatures = detectBrowserFeatures(
        configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage',
        getSnowplowCookieName('testcookie')
      ),
      // Unique ID for the tracker instance used to mark links which are being tracked
      trackerId = functionName + '_' + namespace,
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
      linkTracking = new LinkTrackingManager(core, trackerId, addCommonContexts),
      // Manager for automatic form tracking
      formTracking = new FormTrackingManager(core, trackerId, addCommonContexts),
      // Manager for tracking unhandled exceptions
      errorTracking = new ErrorTrackingManager(core),
      // Manager for local storage queue
      outQueue = new OutQueueManager(
        functionName,
        namespace,
        mutSnowplowState,
        configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage',
        argmap.eventMethod,
        configPostPath,
        argmap.bufferSize,
        argmap.maxPostBytes || 40000,
        argmap.useStm,
        argmap.maxLocalStorageQueueSize || 1000,
        argmap.connectionTimeout || 5000,
        configAnonymousServerTracking
      ),
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
      pageViewSent = false,
      // Activity tracking config for callback and pacge ping variants
      activityTrackingConfig = {
        enabled: false,
        installed: false,
        // Guard against installing the activity tracker more than once per Tracker instance
        configurations: {},
      },
      uaClientHints = null,
      plugins = argmap.plugins || [];

    if (autoContexts.clientHints) {
      if (navigatorAlias.userAgentData) {
        uaClientHints = {
          isMobile: navigatorAlias.userAgentData.mobile,
          brands: navigatorAlias.userAgentData.brands,
        };

        if (autoContexts.clientHints.includeHighEntropy && navigatorAlias.userAgentData.getHighEntropyValues) {
          navigatorAlias.userAgentData
            .getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'model', 'uaFullVersion'])
            .then(function (res) {
              uaClientHints.architecture = res.architecture;
              uaClientHints.model = res.model;
              uaClientHints.platform = res.platform;
              uaClientHints.uaFullVersion = res.uaFullVersion;
              uaClientHints.platformVersion = res.platformVersion;
            });
        }
      }
    }

    var skippedBrowserFeatures = argmap.skippedBrowserFeatures || []; // Object to house gdpr Basis context values

    var gdprBasisData = {};

    if (argmap.hasOwnProperty('discoverRootDomain') && argmap.discoverRootDomain) {
      configCookieDomain = findRootDomain();
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
    core.setTimezone(detectTimezone());
    core.addPayloadPair('lang', browserLanguage);
    core.addPayloadPair('cs', documentCharset); // Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)

    for (var i in browserFeatures) {
      if (Object.prototype.hasOwnProperty.call(browserFeatures, i)) {
        if ((i === 'res' || i === 'cd' || i === 'cookie') && !shouldSkipFeature(i)) {
          core.addPayloadPair(i, browserFeatures[i]);
        } else if (!shouldSkipFeature(i)) {
          core.addPayloadPair('f_' + i, browserFeatures[i]);
        }
      }
    }
    /**
     * Check whether browserFeature should be logged
     */

    function shouldSkipFeature(browserFeature) {
      return (
        skippedBrowserFeatures
          .map(function (v) {
            return v.toLowerCase();
          })
          .indexOf(browserFeature.toLowerCase()) > -1
      );
    }
    /**
     * Recalculate the domain, URL, and referrer
     */

    function refreshUrl() {
      locationArray = fixupUrl(documentAlias.domain, windowAlias.location.href, getReferrer()); // If this is a single-page app and the page URL has changed, then:
      //   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
      //   - otherwise use the old URL as the referer

      if (locationArray[1] !== locationHrefAlias) {
        configReferrerUrl = getReferrer(locationHrefAlias);
      }

      domainAlias = fixupDomain(locationArray[0]);
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
        this.href = decorateQuerystring(this.href, '_sp', domainUserId + '.' + tstamp);
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
          addEventListener(elt, 'click', linkDecorationHandler, true);
          addEventListener(elt, 'mousedown', linkDecorationHandler, true); // Don't add event listeners more than once

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
        items: [],
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
        return getProtocolScheme(baseUrl) + '://' + getHostName(baseUrl) + url;
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
        toOptoutByCookie = !!cookie(configOptOutCookie);
      } else {
        toOptoutByCookie = false;
      }

      if (!(configDoNotTrack || toOptoutByCookie)) {
        outQueue.enqueueRequest(request.build(), configCollectorUrl);
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
        return attemptGetLocalStorage(fullName);
      } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
        return cookie(fullName);
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
      var iebody =
        documentAlias.compatMode && documentAlias.compatMode !== 'BackCompat'
          ? documentAlias.documentElement
          : documentAlias.body;
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
      var cookieValue =
        _domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs + '.' + sessionId;
      setCookie(cookieName, cookieValue, configVisitorCookieTimeout);
    }
    /*
     * no-op if anonymousTracking enabled, will still set cookies if anonymousSessionTracking is enabled
     * Sets a cookie based on the storage strategy:
     * - if 'localStorage': attemps to write to local storage
     * - if 'cookie' or 'cookieAndLocalStorage': writes to cookies
     * - otherwise: no-op
     */

    function setCookie(name, value, timeout) {
      if (configAnonymousTracking && !configAnonymousSessionTracking) {
        return;
      }

      if (configStateStorageStrategy == 'localStorage') {
        attemptWriteLocalStorage(name, value, timeout);
      } else if (configStateStorageStrategy == 'cookie' || configStateStorageStrategy == 'cookieAndLocalStorage') {
        cookie(name, value, timeout, configCookiePath, configCookieDomain, configCookieSameSite, configCookieSecure);
      }
    }
    /**
     * Generate a pseudo-unique ID to identify this user
     */

    function createNewDomainUserId() {
      return v4_1();
    }
    /**
     * Clears all cookie and local storage for id and ses values
     */

    function deleteCookies() {
      var idname = getSnowplowCookieName('id');
      var sesname = getSnowplowCookieName('ses');
      attemptDeleteLocalStorage(idname);
      attemptDeleteLocalStorage(sesname);
      deleteCookie(idname);
      deleteCookie(sesname);
    }
    /*
     * Load the domain user ID and the session ID
     * Set the cookies (if cookies are enabled)
     */

    function initializeIdsAndCookies() {
      if (configAnonymousTracking && !configAnonymousSessionTracking) {
        return;
      }

      var sesCookieSet = configStateStorageStrategy != 'none' && !!getSnowplowCookieValue('ses');
      var idCookieComponents = loadDomainUserIdCookie();

      if (idCookieComponents[1]) {
        domainUserId = idCookieComponents[1];
      } else if (!configAnonymousTracking) {
        domainUserId = createNewDomainUserId();
        idCookieComponents[1] = domainUserId;
      } else {
        domainUserId = '';
        idCookieComponents[1] = domainUserId;
      }

      memorizedSessionId = idCookieComponents[6];

      if (!sesCookieSet) {
        // Increment the session ID
        idCookieComponents[3]++; // Create a new sessionId

        memorizedSessionId = v4_1();
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
        tmpContainer = [
          // cookies disabled
          '1', // Domain user ID
          domainUserId, // Creation timestamp - seconds since Unix epoch
          nowTs, // visitCount - 0 = no previous visit
          0, // Current visit timestamp
          nowTs, // Last visit timestamp - blank meaning no previous visit
          '',
        ];
      }

      if (!tmpContainer[6]) {
        // session id
        tmpContainer[6] = v4_1();
      }

      return tmpContainer;
    }
    /*
     * Attaches common web fields to every request
     * (resolution, url, referrer, etc.)
     * Also sets the required cookies.
     */

    function addBrowserData(sb) {
      var anonymizeOr = function anonymizeOr(value) {
        return configAnonymousTracking ? null : value;
      };

      var anonymizeSessionOr = function anonymizeSessionOr(value) {
        return configAnonymousSessionTracking ? value : anonymizeOr(value);
      };

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
        sessionIdFromCookie = id[6];
      var toOptoutByCookie;

      if (configOptOutCookie) {
        toOptoutByCookie = !!cookie(configOptOutCookie);
      } else {
        toOptoutByCookie = false;
      }

      if (configDoNotTrack || toOptoutByCookie) {
        deleteCookies();
        return;
      } // If cookies are enabled, base visit count and session ID on the cookies

      if (cookiesDisabled === '0') {
        memorizedSessionId = sessionIdFromCookie; // New session?

        if (!ses && configStateStorageStrategy != 'none') {
          // New session (aka new visit)
          visitCount++; // Update the last visit timestamp

          lastVisitTs = currentVisitTs; // Regenerate the session ID

          memorizedSessionId = v4_1();
        }

        memorizedVisitCount = visitCount;
      } else if (new Date().getTime() - lastEventTime > configSessionCookieTimeout * 1000) {
        memorizedSessionId = v4_1();
        memorizedVisitCount++;
      } // Build out the rest of the request

      sb.add('vp', detectViewport());
      sb.add('ds', detectDocumentSize());
      sb.add('vid', anonymizeSessionOr(memorizedVisitCount));
      sb.add('sid', anonymizeSessionOr(memorizedSessionId));
      sb.add('duid', anonymizeOr(_domainUserId)); // Set to our local variable

      sb.add('uid', anonymizeOr(businessUserId));
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
      }

      plugins.forEach(function (plugin) {
        if (plugin && plugin.getContexts) {
          combinedContexts = combinedContexts.concat(plugin.getContexts());
        }
      }); // Add PerformanceTiming Context

      if (autoContexts.performanceTiming) {
        var performanceTimingContext = getPerformanceTimingContext();

        if (performanceTimingContext) {
          combinedContexts.push(performanceTimingContext);
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

      if (autoContexts.clientHints && uaClientHints) {
        combinedContexts.push(getUAClientHintsContext());
      }

      return combinedContexts;
    }
    /**
     * Initialize new `pageViewId` if it shouldn't be preserved.
     * Should be called when `trackPageView` is invoked
     */

    function resetPageView() {
      if (!preservePageViewId || mutSnowplowState.pageViewId == null) {
        mutSnowplowState.pageViewId = v4_1();
      }
    }
    /**
     * Safe function to get `pageViewId`.
     * Generates it if it wasn't initialized by other tracker
     */

    function getPageViewId() {
      if (mutSnowplowState.pageViewId == null) {
        mutSnowplowState.pageViewId = v4_1();
      }

      return mutSnowplowState.pageViewId;
    }
    /**
     * Put together a http_client_hints context with the UA Client Hint data we have so far
     *
     * @return object http_client_hints context
     */

    function getUAClientHintsContext() {
      return {
        schema: 'iglu:org.ietf/http_client_hints/jsonschema/1-0-0',
        data: uaClientHints,
      };
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
          id: getPageViewId(),
        },
      };
    }
    /**
     * Creates a context from the window.performance.timing object
     *
     * @return object PerformanceTiming context
     */

    function getPerformanceTimingContext() {
      var allowedKeys = [
        'navigationStart',
        'redirectStart',
        'redirectEnd',
        'fetchStart',
        'domainLookupStart',
        'domainLookupEnd',
        'connectStart',
        'secureConnectionStart',
        'connectEnd',
        'requestStart',
        'responseStart',
        'responseEnd',
        'unloadEventStart',
        'unloadEventEnd',
        'domLoading',
        'domInteractive',
        'domContentLoadedEventStart',
        'domContentLoadedEventEnd',
        'domComplete',
        'loadEventStart',
        'loadEventEnd',
        'msFirstPaint',
        'chromeFirstPaint',
        'requestEnd',
        'proxyStart',
        'proxyEnd',
      ];
      var performance =
        windowAlias.performance ||
        windowAlias.mozPerformance ||
        windowAlias.msPerformance ||
        windowAlias.webkitPerformance;

      if (performance) {
        // On Safari, the fields we are interested in are on the prototype chain of
        // performance.timing so we cannot copy them using lodash.clone
        var performanceTiming = {};

        for (var field in performance.timing) {
          if (isValueInArray(field, allowedKeys) && performance.timing[field] !== null) {
            performanceTiming[field] = performance.timing[field];
          }
        } // Old Chrome versions add an unwanted requestEnd field

        delete performanceTiming.requestEnd;
        return {
          schema: 'iglu:org.w3/PerformanceTiming/jsonschema/1-0-0',
          data: performanceTiming,
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
          optout: null,
        };
        context['encryptedId'] = parrable.browserid;
        var regex = new RegExp(
            '(?:^|;)\\s?' + '_parrable_hawk_optout'.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1') + '=(.*?)(?:;|$)',
            'i'
          ),
          match = document.cookie.match(regex);
        context['optout'] = match && decodeURIComponent(match[1]) ? match && decodeURIComponent(match[1]) : 'false';
        return {
          schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
          data: context,
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
            documentDescription: gdprBasisData.gdprDocDesc || null,
          },
        };
      }
    }
    /**
     * Expires current session and starts a new session.
     */

    function newSession() {
      // If cookies are enabled, base visit count and session ID on the cookies
      var nowTs = Math.round(new Date().getTime() / 1000),
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

          memorizedSessionId = v4_1();
        }

        memorizedVisitCount = visitCount; // Create a new session cookie

        setSessionCookie();
      } else {
        memorizedSessionId = v4_1();
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
              timestamp: Math.round(position.timestamp),
            },
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
      forEach_1(['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'], function (cookieType) {
        var value = cookie(cookieType);

        if (value) {
          gaCookieData[cookieType] = value;
        }
      });
      return {
        schema: 'iglu:com.google.analytics/cookies/jsonschema/1-0-0',
        data: gaCookieData,
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
     * @param function afterTrack (optional) A callback function triggered after event is tracked
     */

    function logPageView(customTitle, context, contextCallback, tstamp, afterTrack) {
      refreshUrl();

      if (pageViewSent) {
        // Do not reset pageViewId if previous events were not page_view
        resetPageView();
      }

      pageViewSent = true; // So we know what document.title was at the time of trackPageView

      lastDocumentTitle = documentAlias.title;
      lastConfigTitle = customTitle; // Fixup page title

      var pageTitle = fixupTitle(lastConfigTitle || lastDocumentTitle); // Log page view

      core.trackPageView(
        purify(configCustomUrl || locationHrefAlias),
        pageTitle,
        purify(customReferrer || configReferrerUrl),
        addCommonContexts(finalizeContexts(context, contextCallback)),
        tstamp,
        afterTrack
      ); // Send ping (to log that user has stayed on page)

      var now = new Date();
      var installingActivityTracking = false;

      if (activityTrackingConfig.enabled && !activityTrackingConfig.installed) {
        activityTrackingConfig.installed = true;
        installingActivityTracking = true; // Add mousewheel event handler, detect passive event listeners for performance

        var detectPassiveEvents = {
          update: function update() {
            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
              var passive = false;
              var options = Object.defineProperty({}, 'passive', {
                get: function get() {
                  passive = true;
                },
              }); // note: have to set and remove a no-op listener instead of null
              // (which was used previously), becasue Edge v15 throws an error
              // when providing a null callback.
              // https://github.com/rafrex/detect-passive-events/pull/3

              var noop = function noop() {};

              window.addEventListener('testPassiveEventSupport', noop, options);
              window.removeEventListener('testPassiveEventSupport', noop, options);
              detectPassiveEvents.hasSupport = passive;
            }
          },
        };
        detectPassiveEvents.update(); // Detect available wheel event

        var wheelEvent =
          'onwheel' in document.createElement('div')
            ? 'wheel' // Modern browsers support "wheel"
            : document.onmousewheel !== undefined
            ? 'mousewheel' // Webkit and IE support at least "mousewheel"
            : 'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

        if (Object.prototype.hasOwnProperty.call(detectPassiveEvents, 'hasSupport')) {
          addEventListener(documentAlias, wheelEvent, activityHandler, {
            passive: true,
          });
        } else {
          addEventListener(documentAlias, wheelEvent, activityHandler);
        } // Capture our initial scroll points

        resetMaxScrolls(); // Add event handlers; cross-browser compatibility here varies significantly
        // @see http://quirksmode.org/dom/events

        var documentHandlers = ['click', 'mouseup', 'mousedown', 'mousemove', 'keypress', 'keydown', 'keyup'];
        var windowHandlers = ['resize', 'focus', 'blur'];

        var listener = function listener(alias) {
          var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : activityHandler;
          return function (ev) {
            return addEventListener(documentAlias, ev, handler);
          };
        };

        forEach_1(documentHandlers, listener(documentAlias));
        forEach_1(windowHandlers, listener(windowAlias));
        listener(windowAlias, scrollHandler)('scroll');
      }

      if (activityTrackingConfig.enabled && (resetActivityTrackingOnPageView || installingActivityTracking)) {
        // Periodic check for activity.
        lastActivityTime = now.getTime();

        for (var key in activityTrackingConfig.configurations) {
          if (activityTrackingConfig.configurations.hasOwnProperty(key)) {
            var config = activityTrackingConfig.configurations[key]; //Clear page ping heartbeat on new page view

            clearInterval(config.activityInterval);
            activityInterval(config, finalizeContexts(context, contextCallback));
          }
        }
      }
    }

    function activityInterval(config, context) {
      var executePagePing = function executePagePing(cb, c) {
        refreshUrl();
        cb({
          context: c,
          pageViewId: getPageViewId(),
          minXOffset: minXOffset,
          minYOffset: minYOffset,
          maxXOffset: maxXOffset,
          maxYOffset: maxYOffset,
        });
        resetMaxScrolls();
      };

      var timeout = function timeout() {
        var now = new Date(); // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2

        if (lastActivityTime + config.configMinimumVisitLength > now.getTime()) {
          executePagePing(config.callback, context);
        }

        config.activityInterval = setInterval(heartbeat, config.configHeartBeatTimer);
      };

      var heartbeat = function heartbeat() {
        var now = new Date(); // There was activity during the heart beat period;
        // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2

        if (lastActivityTime + config.configHeartBeatTimer > now.getTime()) {
          executePagePing(config.callback, context);
        }
      };

      if (config.configMinimumVisitLength != 0) {
        config.activityInterval = setTimeout(timeout, config.configMinimumVisitLength);
      } else {
        config.activityInterval = setInterval(heartbeat, config.configHeartBeatTimer);
      }
    }
    /**
     * Configure the activity tracking and
     * ensures good values for min visit and heartbeat
     *
     * @param {int} [minimumVisitLength] The minimum length of a visit before the first page ping
     * @param {int} [heartBeatDelay] The length between checks to see if we should send a page ping
     * @param {function} [callback] A callback function to execute
     */

    function configureActivityTracking(minimumVisitLength, heartBeatDelay, callback) {
      if (isInteger_1(minimumVisitLength) && isInteger_1(heartBeatDelay)) {
        return {
          configMinimumVisitLength: minimumVisitLength * 1000,
          configHeartBeatTimer: heartBeatDelay * 1000,
          activityInterval: null,
          callback: callback,
        };
      }

      warn('Activity tracking not enabled, please provide integer values for minimumVisitLength and heartBeatDelay.');
      return {};
    }
    /**
     * Log that a user is still viewing a given page
     * by sending a page ping.
     * Not part of the public API - only called from
     * logPageView() above.
     *
     * @param context object Custom context relating to the event
     */

    function logPagePing(_ref) {
      var context = _ref.context,
        minXOffset = _ref.minXOffset,
        minYOffset = _ref.minYOffset,
        maxXOffset = _ref.maxXOffset,
        maxYOffset = _ref.maxYOffset;
      var newDocumentTitle = documentAlias.title;

      if (newDocumentTitle !== lastDocumentTitle) {
        lastDocumentTitle = newDocumentTitle;
        lastConfigTitle = null;
      }

      core.trackPagePing(
        purify(configCustomUrl || locationHrefAlias),
        fixupTitle(lastConfigTitle || lastDocumentTitle),
        purify(customReferrer || configReferrerUrl),
        cleanOffset(minXOffset),
        cleanOffset(maxXOffset),
        cleanOffset(minYOffset),
        cleanOffset(maxYOffset),
        addCommonContexts(context)
      );
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

    function logTransaction(
      orderId,
      affiliation,
      total,
      tax,
      shipping,
      city,
      state,
      country,
      currency,
      context,
      tstamp
    ) {
      core.trackEcommerceTransaction(
        orderId,
        affiliation,
        total,
        tax,
        shipping,
        city,
        state,
        country,
        currency,
        addCommonContexts(context),
        tstamp
      );
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
      core.trackEcommerceTransactionItem(
        orderId,
        sku,
        name,
        category,
        price,
        quantity,
        currency,
        addCommonContexts(context),
        tstamp
      );
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
        linkTracking.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
        linkTracking.addClickListeners();
      } else {
        // defer until page has loaded
        mutSnowplowState.registeredOnLoadHandlers.push(function () {
          linkTracking.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
          linkTracking.addClickListeners();
        });
      }
    };
    /**
     * Add click event listeners to links which have been added to the page since the
     * last time enableLinkClickTracking or refreshLinkClickTracking was used
     */

    apiMethods.refreshLinkClickTracking = function () {
      if (mutSnowplowState.hasLoaded) {
        linkTracking.addClickListeners();
      } else {
        mutSnowplowState.registeredOnLoadHandlers.push(function () {
          linkTracking.addClickListeners();
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
      activityTrackingConfig.enabled = true;
      activityTrackingConfig.configurations.pagePing = configureActivityTracking(
        minimumVisitLength,
        heartBeatDelay,
        logPagePing
      );
    };
    /**
     * Enables page activity tracking (replaces collector ping with callback).
     *
     * @param int minimumVisitLength Seconds to wait before sending first page ping
     * @param int heartBeatDelay Seconds to wait between pings
     * @param function callback function called with ping data
     */

    apiMethods.enableActivityTrackingCallback = function (minimumVisitLength, heartBeatDelay, callback) {
      activityTrackingConfig.enabled = true;
      activityTrackingConfig.configurations.callback = configureActivityTracking(
        minimumVisitLength,
        heartBeatDelay,
        callback
      );
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
        formTracking.configureFormTracking(config);
        formTracking.addFormListeners(context);
      } else {
        mutSnowplowState.registeredOnLoadHandlers.push(function () {
          formTracking.configureFormTracking(config);
          formTracking.addFormListeners(context);
        });
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
      apiMethods.setUserId(userId);
    };
    /**
     * Set the business-defined user ID for this user using the location querystring.
     *
     * @param string queryName Name of a querystring name-value pair
     */

    apiMethods.setUserIdFromLocation = function (querystringField) {
      refreshUrl();
      businessUserId = fromQuerystring(querystringField, locationHrefAlias);
    };
    /**
     * Set the business-defined user ID for this user using the referrer querystring.
     *
     * @param string queryName Name of a querystring name-value pair
     */

    apiMethods.setUserIdFromReferrer = function (querystringField) {
      refreshUrl();
      businessUserId = fromQuerystring(querystringField, configReferrerUrl);
    };
    /**
     * Set the business-defined user ID for this user to the value of a cookie.
     *
     * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
     */

    apiMethods.setUserIdFromCookie = function (cookieName) {
      businessUserId = cookie(cookieName);
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
     * Send all events in the outQueue
     * Use only when sending POSTs with a bufferSize of at least 2
     */

    apiMethods.flushBuffer = function () {
      outQueue.executeQueue();
    };
    /**
     * Add the geolocation context to all events
     */

    apiMethods.enableGeolocationContext = enableGeolocationContext;
    /**
     * Log visit to this page
     *
     * @param string customTitle
     * @param object Custom context relating to the event
     * @param object contextCallback Function returning an array of contexts
     * @param tstamp number or Timestamp object
     * @param function afterTrack (optional) A callback function triggered after event is tracked
     */

    apiMethods.trackPageView = function (customTitle, context, contextCallback, tstamp, afterTrack) {
      logPageView(customTitle, context, contextCallback, tstamp, afterTrack);
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
     * @param object context (optional) Custom context relating to the event
     * @param number|Timestamp tstamp (optional) TrackerTimestamp of the event
     * @param function afterTrack (optional) A callback function triggered after event is tracked
     */

    apiMethods.trackStructEvent = function (category, action, label, property, value, context, tstamp, afterTrack) {
      core.trackStructEvent(category, action, label, property, value, addCommonContexts(context), tstamp, afterTrack);
    };
    /**
     * Track a self-describing event happening on this page.
     *
     * @param object eventJson Contains the properties and schema location for the event
     * @param object context Custom context relating to the event
     * @param tstamp number or Timestamp object
     * @param function afterTrack (optional) A callback function triggered after event is tracked
     */

    apiMethods.trackSelfDescribingEvent = function (eventJson, context, tstamp, afterTrack) {
      core.trackSelfDescribingEvent(eventJson, addCommonContexts(context), tstamp, afterTrack);
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

    apiMethods.addTrans = function (
      orderId,
      affiliation,
      total,
      tax,
      shipping,
      city,
      state,
      country,
      currency,
      context,
      tstamp
    ) {
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
        tstamp: tstamp,
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
        tstamp: tstamp,
      });
    };
    /**
     * Commit the ecommerce transaction
     *
     * This call will send the data specified with addTrans,
     * addItem methods to the tracking server.
     */

    apiMethods.trackTrans = function () {
      logTransaction(
        ecommerceTransaction.transaction.orderId,
        ecommerceTransaction.transaction.affiliation,
        ecommerceTransaction.transaction.total,
        ecommerceTransaction.transaction.tax,
        ecommerceTransaction.transaction.shipping,
        ecommerceTransaction.transaction.city,
        ecommerceTransaction.transaction.state,
        ecommerceTransaction.transaction.country,
        ecommerceTransaction.transaction.currency,
        ecommerceTransaction.transaction.context,
        ecommerceTransaction.transaction.tstamp
      );

      for (var i = 0; i < ecommerceTransaction.items.length; i++) {
        var item = ecommerceTransaction.items[i];
        logTransactionItem(
          item.orderId,
          item.sku,
          item.name,
          item.category,
          item.price,
          item.quantity,
          item.currency,
          item.context,
          item.tstamp
        );
      }

      ecommerceTransaction = ecommerceTransactionTemplate();
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

    apiMethods.trackLinkClick = function (
      targetUrl,
      elementId,
      elementClasses,
      elementTarget,
      elementContent,
      context,
      tstamp
    ) {
      core.trackLinkClick(
        targetUrl,
        elementId,
        elementClasses,
        elementTarget,
        elementContent,
        addCommonContexts(context),
        tstamp
      );
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

    apiMethods.trackAdImpression = function (
      impressionId,
      costModel,
      cost,
      targetUrl,
      bannerId,
      zoneId,
      advertiserId,
      campaignId,
      context,
      tstamp
    ) {
      core.trackAdImpression(
        impressionId,
        costModel,
        cost,
        targetUrl,
        bannerId,
        zoneId,
        advertiserId,
        campaignId,
        addCommonContexts(context),
        tstamp
      );
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

    apiMethods.trackAdClick = function (
      targetUrl,
      clickId,
      costModel,
      cost,
      bannerId,
      zoneId,
      impressionId,
      advertiserId,
      campaignId,
      context,
      tstamp
    ) {
      core.trackAdClick(
        targetUrl,
        clickId,
        costModel,
        cost,
        bannerId,
        zoneId,
        impressionId,
        advertiserId,
        campaignId,
        addCommonContexts(context),
        tstamp
      );
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

    apiMethods.trackAdConversion = function (
      conversionId,
      costModel,
      cost,
      category,
      action,
      property,
      initialValue,
      advertiserId,
      campaignId,
      context,
      tstamp
    ) {
      core.trackAdConversion(
        conversionId,
        costModel,
        cost,
        category,
        action,
        property,
        initialValue,
        advertiserId,
        campaignId,
        addCommonContexts(context),
        tstamp
      );
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
      core.trackSocialInteraction(action, network, target, addCommonContexts(context), tstamp);
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
      core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context), tstamp);
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
      core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, addCommonContexts(context), tstamp);
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
      core.trackSiteSearch(terms, filters, totalResults, pageResults, addCommonContexts(context), tstamp);
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
      core.trackSelfDescribingEvent(
        {
          schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
          data: {
            category: category,
            variable: variable,
            timing: timing,
            label: label,
          },
        },
        addCommonContexts(context),
        tstamp
      );
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
      core.trackConsentWithdrawn(all, id, version, name, description, addCommonContexts(context), tstamp);
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
      core.trackConsentGranted(id, version, name, description, expiry, addCommonContexts(context), tstamp);
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
      core.trackSelfDescribingEvent(
        {
          schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
          data: {
            action: action,
          },
        },
        addCommonContexts(combinedEnhancedEcommerceContexts),
        tstamp
      );
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

    apiMethods.addEnhancedEcommerceActionContext = function (
      id,
      affiliation,
      revenue,
      tax,
      shipping,
      coupon,
      list,
      step,
      option,
      currency
    ) {
      enhancedEcommerceContexts.push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          affiliation: affiliation,
          revenue: parseAndValidateFloat(revenue),
          tax: parseAndValidateFloat(tax),
          shipping: parseAndValidateFloat(shipping),
          coupon: coupon,
          list: list,
          step: parseAndValidateInt(step),
          option: option,
          currency: currency,
        },
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

    apiMethods.addEnhancedEcommerceImpressionContext = function (
      id,
      name,
      list,
      brand,
      category,
      variant,
      position,
      price,
      currency
    ) {
      enhancedEcommerceContexts.push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          name: name,
          list: list,
          brand: brand,
          category: category,
          variant: variant,
          position: parseAndValidateInt(position),
          price: parseAndValidateFloat(price),
          currency: currency,
        },
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

    apiMethods.addEnhancedEcommerceProductContext = function (
      id,
      name,
      list,
      brand,
      category,
      variant,
      price,
      quantity,
      coupon,
      position,
      currency
    ) {
      enhancedEcommerceContexts.push({
        schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
        data: {
          id: id,
          name: name,
          list: list,
          brand: brand,
          category: category,
          variant: variant,
          price: parseAndValidateFloat(price),
          quantity: parseAndValidateInt(quantity),
          coupon: coupon,
          position: parseAndValidateInt(position),
          currency: currency,
        },
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
          currency: currency,
        },
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
        warn(
          'enableGdprContext: basisForProcessing must be one of: consent, legalObligation, vitalInterests publicTask, legitimateInterests'
        );
        return;
      } else {
        autoContexts.gdprBasis = true;
        gdprBasisData = {
          gdprBasis: basis,
          gdprDocId: documentId,
          gdprDocVer: documentVersion,
          gdprDocDesc: documentDescription,
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
      errorTracking.enableErrorTracking(filter, contextsAdder, addCommonContexts());
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
      errorTracking.trackError(message, filename, lineno, colno, error, enrichedContexts);
    };
    /**
     * Stop regenerating `pageViewId` (available from `web_page` context)
     */

    apiMethods.preservePageViewId = function () {
      preservePageViewId = true;
    };
    /**
     * Disables anonymous tracking if active (ie. tracker initialized with `anonymousTracking`)
     * For stateStorageStrategy override, uses supplied value first,
     * falls back to one defined in initial config, otherwise uses cookieAndLocalStorage.
     * @param {string} stateStorageStrategy - Override for state storage
     */

    apiMethods.disableAnonymousTracking = function (stateStorageStrategy) {
      if (stateStorageStrategy) {
        argmap.stateStorageStrategy = stateStorageStrategy;
        argmap.anonymousTracking = false;
        configStateStorageStrategy = getStateStorageStrategy(argmap);
      } else {
        argmap.anonymousTracking = false;
      }

      configAnonymousTracking = getAnonymousTracking(argmap);
      configAnonymousSessionTracking = getAnonymousSessionTracking(argmap);
      configAnonymousServerTracking = getAnonymousServerTracking(argmap);
      outQueue.setUseLocalStorage(
        configStateStorageStrategy == 'localStorage' || configStateStorageStrategy == 'cookieAndLocalStorage'
      );
      outQueue.setAnonymousTracking(configAnonymousServerTracking);
      initializeIdsAndCookies();
      outQueue.executeQueue(); // There might be some events in the queue we've been unable to send in anonymous mode
    };
    /**
     * Enables anonymous tracking (ie. tracker initialized without `anonymousTracking`)
     */

    apiMethods.enableAnonymousTracking = function (anonymousArgs) {
      argmap.anonymousTracking = anonymousArgs || true;
      configAnonymousTracking = getAnonymousTracking(argmap);
      configAnonymousSessionTracking = getAnonymousSessionTracking(argmap);
      configAnonymousServerTracking = getAnonymousServerTracking(argmap); // Reset the page view, if not tracking the session, so can't stitch user into new events on the page view id

      if (!configAnonymousSessionTracking) {
        resetPageView();
      }

      outQueue.setAnonymousTracking(configAnonymousServerTracking);
    };
    /**
     * Clears all cookies and local storage containing user and session identifiers
     */

    apiMethods.clearUserData = deleteCookies;

    apiMethods.setDebug = function (isDebug) {
      debug = Boolean(isDebug).valueOf();
      updateReturnMethods();
    }; // Create guarded methods from apiMethods,
    // and set returnMethods to apiMethods or safeMethods depending on value of debug

    safeMethods = productionize(apiMethods);
    updateReturnMethods();
    return returnMethods;
  }

  /*
   * JavaScript tracker for Snowplow: snowplow.js
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
  function SharedState() {
    var documentAlias = document,
      windowAlias = window,
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
        pageViewId: null,
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
      forEach_1(mutSnowplowState.bufferFlushers, function (flusher) {
        flusher();
      });
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
        addEventListener(documentAlias, 'DOMContentLoaded', function ready() {
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

      addEventListener(windowAlias, 'load', loadHandler, false);
    }
    /************************************************************
     * Constructor
     ************************************************************/
    // initialize the Snowplow singleton

    addEventListener(windowAlias, 'beforeunload', beforeUnloadHandler, false);
    addReadyListener();
    return mutSnowplowState;
  }

  var version = '2.17.0';

  var version$1 = 'js-' + version;

  /*
   * JavaScript tracker for Snowplow: init.js
   *
   * Significant portions copyright 2010 Anthon Pang. Remainder copyright
   * 2012-2020 Snowplow Analytics Ltd. All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are
   * met:
   *
   * * Redistributions of source code must retain the above copyright
   * notice, this list of conditions and the following disclaimer.
   *
   * * Redistributions in binary form must reproduce the above copyright
   * notice, this list of conditions and the following disclaimer in the
   * documentation and/or other materials provided with the distribution.
   *
   * * Neither the name of Anthon Pang nor Snowplow Analytics Ltd nor the
   * names of their contributors may be used to endorse or promote products
   * derived from this software without specific prior written permission.
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
  var groups = {};
  /**
   * Initiate a new tracker
   *
   * @param string name
   * @param string endpoint in the form collector.mysite.com
   * @param object argmap contains the initialisation options of the JavaScript tracker
   * @param string trackerGroup used to group multiple trackers and shared state together
   */

  var newTracker = function newTracker(name, endpoint) {
    var argmap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var trackerGroup = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'snowplow';

    if (!groups.hasOwnProperty(trackerGroup)) {
      groups[trackerGroup] = {
        state: new SharedState(),
        trackers: {},
      };
    }

    var trackerDictionary = groups[trackerGroup].trackers;
    var state = groups[trackerGroup].state;

    if (!trackerDictionary.hasOwnProperty(name)) {
      trackerDictionary[name] = new Tracker(trackerGroup, name, version$1, state, argmap);
      trackerDictionary[name].setCollectorUrl(endpoint);
    } else {
      warn('Tracker namespace ' + name + ' already exists.');
    }

    return trackerDictionary[name];
  };
  var getTracker = function getTracker(namespace) {
    var trackerGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'snowplow';

    if (groups.hasOwnProperty(trackerGroup) && groups[trackerGroup].trackers.hasOwnProperty(namespace)) {
      return groups[trackerGroup].trackers[namespace];
    }

    warn('Warning: No tracker configured');
    return null;
  };
  var allTrackers = function allTrackers() {
    var trackerGroup = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'snowplow';

    if (groups.hasOwnProperty(trackerGroup)) {
      return groups[trackerGroup].trackers;
    }

    warn('Warning: No trackers configured');
    return {};
  };

  //  * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
  //  */
  // export function getCssClasses(elt: Element) {
  //   return elt.className.match(/\S+/g) || [];
  // }
  // /**
  //  * Check whether an element has at least one class from a given list
  //  */
  // function checkClass(elt: Element, classList: { [k: string]: boolean}) {
  //   var classes = getCssClasses(elt);
  //   for (const className of classes) {
  //     if (classList[className]) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  // /**
  //  * Convert a criterion object to a filter function
  //  *
  //  * @param object criterion Either {whitelist: [array of allowable strings]}
  //  *                             or {blacklist: [array of allowable strings]}
  //  *                             or {filter: function (elt) {return whether to track the element}
  //  * @param boolean byClass Whether to whitelist/blacklist based on an element's classes (for forms)
  //  *                        or name attribute (for fields)
  //  */
  // export function getFilter(criterion, byClass) {
  //   // If the criterion argument is not an object, add listeners to all elements
  //   if (Array.isArray(criterion) || !isObject(criterion)) {
  //     return function () {
  //       return true;
  //     };
  //   }
  //   if (criterion.hasOwnProperty('filter')) {
  //     return criterion.filter;
  //   } else {
  //     var inclusive = criterion.hasOwnProperty('whitelist');
  //     var specifiedClasses = criterion.whitelist || criterion.blacklist;
  //     if (!Array.isArray(specifiedClasses)) {
  //       specifiedClasses = [specifiedClasses];
  //     }
  //     // Convert the array of classes to an object of the form {class1: true, class2: true, ...}
  //     var specifiedClassesSet = {};
  //     for (var i = 0; i < specifiedClasses.length; i++) {
  //       specifiedClassesSet[specifiedClasses[i]] = true;
  //     }
  //     if (byClass) {
  //       return function (elt) {
  //         return checkClass(elt, specifiedClassesSet) === inclusive;
  //       };
  //     } else {
  //       return function (elt) {
  //         return elt.name in specifiedClassesSet === inclusive;
  //       };
  //     }
  //   }
  // }
  // /**
  //  * Convert a criterion object to a transform function
  //  *
  //  * @param object criterion {transform: function (elt) {return the result of transform function applied to element}
  //  */
  // export function getTransform(criterion) {
  //   if (!isObject(criterion)) {
  //     return function (x) {
  //       return x;
  //     };
  //   }
  //   if (criterion.hasOwnProperty('transform')) {
  //     return criterion.transform;
  //   } else {
  //     return function (x) {
  //       return x;
  //     };
  //   }
  //   return function (x) {
  //     return x;
  //   };
  // }
  // /**
  //  * Add a name-value pair to the querystring of a URL
  //  *
  //  * @param string url URL to decorate
  //  * @param string name Name of the querystring pair
  //  * @param string value Value of the querystring pair
  //  */
  // export function decorateQuerystring(url, name, value) {
  //   var initialQsParams = name + '=' + value;
  //   var hashSplit = url.split('#');
  //   var qsSplit = hashSplit[0].split('?');
  //   var beforeQuerystring = qsSplit.shift();
  //   // Necessary because a querystring may contain multiple question marks
  //   var querystring = qsSplit.join('?');
  //   if (!querystring) {
  //     querystring = initialQsParams;
  //   } else {
  //     // Whether this is the first time the link has been decorated
  //     var initialDecoration = true;
  //     var qsFields = querystring.split('&');
  //     for (var i = 0; i < qsFields.length; i++) {
  //       if (qsFields[i].substr(0, name.length + 1) === name + '=') {
  //         initialDecoration = false;
  //         qsFields[i] = initialQsParams;
  //         querystring = qsFields.join('&');
  //         break;
  //       }
  //     }
  //     if (initialDecoration) {
  //       querystring = initialQsParams + '&' + querystring;
  //     }
  //   }
  //   hashSplit[0] = beforeQuerystring + '?' + querystring;
  //   return hashSplit.join('#');
  // }
  // /**
  //  * Attempt to get a value from localStorage
  //  *
  //  * @param string key
  //  * @return string The value obtained from localStorage, or
  //  *                undefined if localStorage is inaccessible
  //  */
  // export function attemptGetLocalStorage(key) {
  //   try {
  //     const exp = localStorageAlias.getItem(key + '.expires');
  //     if (exp === null || +exp > Date.now()) {
  //       return localStorageAlias.getItem(key);
  //     } else {
  //       localStorageAlias.removeItem(key);
  //       localStorageAlias.removeItem(key + '.expires');
  //     }
  //     return undefined;
  //   } catch (e) {}
  // }
  // /**
  //  * Attempt to write a value to localStorage
  //  *
  //  * @param string key
  //  * @param string value
  //  * @param number ttl Time to live in seconds, defaults to 2 years from Date.now()
  //  * @return boolean Whether the operation succeeded
  //  */
  // export function attemptWriteLocalStorage(key, value, ttl = 63072000) {
  //   try {
  //     const t = Date.now() + ttl * 1000;
  //     localStorageAlias.setItem(`${key}.expires`, t);
  //     localStorageAlias.setItem(key, value);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }
  // /**
  //  * Attempt to delete a value from localStorage
  //  *
  //  * @param string key
  //  * @return boolean Whether the operation succeeded
  //  */
  // export function attemptDeleteLocalStorage(key) {
  //   try {
  //     localStorageAlias.removeItem(key);
  //     localStorageAlias.removeItem(key + '.expires');
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }
  // /**
  //  * Attempt to get a value from sessionStorage
  //  *
  //  * @param string key
  //  * @return string The value obtained from sessionStorage, or
  //  *                undefined if sessionStorage is inaccessible
  //  */
  // export function attemptGetSessionStorage(key) {
  //   try {
  //     return sessionStorageAlias.getItem(key);
  //   } catch (e) {
  //     return undefined;
  //   }
  // }
  // /**
  //  * Attempt to write a value to sessionStorage
  //  *
  //  * @param string key
  //  * @param string value
  //  * @return boolean Whether the operation succeeded
  //  */
  // export function attemptWriteSessionStorage(key, value) {
  //   try {
  //     sessionStorageAlias.setItem(key, value);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }
  // /**
  //  * Finds the root domain
  //  */
  // export function findRootDomain() {
  //   var cookiePrefix = '_sp_root_domain_test_';
  //   var cookieName = cookiePrefix + new Date().getTime();
  //   var cookieValue = '_test_value_' + new Date().getTime();
  //   var split = windowAlias.location.hostname.split('.');
  //   var position = split.length - 1;
  //   while (position >= 0) {
  //     var currentDomain = split.slice(position, split.length).join('.');
  //     cookie(cookieName, cookieValue, 0, '/', currentDomain);
  //     if (cookie(cookieName) === cookieValue) {
  //       // Clean up created cookie(s)
  //       deleteCookie(cookieName, currentDomain);
  //       var cookieNames = getCookiesWithPrefix(cookiePrefix);
  //       for (var i = 0; i < cookieNames.length; i++) {
  //         deleteCookie(cookieNames[i], currentDomain);
  //       }
  //       return currentDomain;
  //     }
  //     position -= 1;
  //   }
  //   // Cookies cannot be read
  //   return windowAlias.location.hostname;
  // }

  /**
   * Checks whether a value is present within an array
   *
   * @param val The value to check for
   * @param array The array to check within
   * @return boolean Whether it exists
   */

  function isValueInArray$1(val, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === val) {
        return true;
      }
    }

    return false;
  } // /**
  //  * Deletes an arbitrary cookie by setting the expiration date to the past
  //  *
  //  * @param cookieName The name of the cookie to delete
  //  * @param domainName The domain the cookie is in
  //  */
  // export function deleteCookie(cookieName, domainName) {
  //   cookie(cookieName, '', -1, '/', domainName);
  // }
  // /**
  //  * Fetches the name of all cookies beginning with a certain prefix
  //  *
  //  * @param cookiePrefix The prefix to check for
  //  * @return array The cookies that begin with the prefix
  //  */
  // export function getCookiesWithPrefix(cookiePrefix) {
  //   var cookies = documentAlias.cookie.split('; ');
  //   var cookieNames = [];
  //   for (var i = 0; i < cookies.length; i++) {
  //     if (cookies[i].substring(0, cookiePrefix.length) === cookiePrefix) {
  //       cookieNames.push(cookies[i]);
  //     }
  //   }
  //   return cookieNames;
  // }
  // /**
  //  * Get and set the cookies associated with the current document in browser
  //  * This implementation always returns a string, returns the cookie value if only name is specified
  //  *
  //  * @param name The cookie name (required)
  //  * @param value The cookie value
  //  * @param ttl The cookie Time To Live (seconds)
  //  * @param path The cookies path
  //  * @param domain The cookies domain
  //  * @param samesite The cookies samesite attribute
  //  * @param secure Boolean to specify if cookie should be secure
  //  * @return string The cookies value
  //  */
  // export function cookie(name, value, ttl, path, domain, samesite, secure) {
  //   if (arguments.length > 1) {
  //     return (documentAlias.cookie =
  //       name +
  //       '=' +
  //       encodeURIComponent(value) +
  //       (ttl ? '; Expires=' + new Date(+new Date() + ttl * 1000).toUTCString() : '') +
  //       (path ? '; Path=' + path : '') +
  //       (domain ? '; Domain=' + domain : '') +
  //       (samesite ? '; SameSite=' + samesite : '') +
  //       (secure ? '; Secure' : ''));
  //   }
  //   return decodeURIComponent((('; ' + documentAlias.cookie).split('; ' + name + '=')[1] || '').split(';')[0]);
  // }

  /**
   * Parses an object and returns either the
   * integer or undefined.
   *
   * @param obj The object to parse
   * @return the result of the parse operation
   */

  function parseAndValidateInt$1(obj) {
    var result = parseInt(obj);
    return isNaN(result) ? undefined : result;
  }

  var OptimizelyPlugin = function OptimizelyPlugin() {
    var summary = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var xSummary = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var experiments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var states = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var variations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var visitor = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
    var audiences = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
    var dimensions = arguments.length > 7 ? arguments[7] : undefined;
    var windowAlias = window;
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
     * Check that *both* optimizely and optimizely.get exist
     *
     * @param property optimizely data property
     * @param snd optional nested property
     */

    function getOptimizelyXData(property, snd) {
      var data;

      if (windowAlias.optimizely && typeof windowAlias.optimizely.get === 'function') {
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
      return map_1(state && experiments && state.activeExperiments, function (activeExperiment) {
        var current = experiments[activeExperiment];
        return {
          activeExperimentId: activeExperiment.toString(),
          // User can be only in one variation (don't know why is this array)
          variation: state.variationIdsMap[activeExperiment][0].toString(),
          conditional: current && current.conditional,
          manual: current && current.manual,
          name: current && current.name,
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
      var experiment_ids = state && state.getActiveExperimentIds();
      var variationMap = state && state.getVariationMap();
      var visitor = getOptimizelyXData('visitor');
      return map_1(experiment_ids, function (activeExperiment) {
        var variation = variationMap[activeExperiment];
        var variationName = (variation && variation.name && variation.name.toString()) || null;
        var variationId = variation && variation.id;
        var visitorId = (visitor && visitor.visitorId && visitor.visitorId.toString()) || null;
        return {
          experimentId: parseAndValidateInt$1(activeExperiment) || null,
          variationName: variationName,
          variation: parseAndValidateInt$1(variationId) || null,
          visitorId: visitorId,
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
              data: context,
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
          context.isActive = isValueInArray$1(experimentIds[i], activeExperiments);
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
            data: context,
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
              data: context,
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
          data: context,
        };
      }

      return null;
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
              isMember: audienceIds[key],
            };
            contexts.push({
              schema: 'iglu:com.optimizely/visitor_audience/jsonschema/1-0-0',
              data: context,
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
              value: dimensionIds[key],
            };
            contexts.push({
              schema: 'iglu:com.optimizely/visitor_dimension/jsonschema/1-0-0',
              data: context,
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
      return map_1(getOptimizelySummary(), function (experiment) {
        return {
          schema: 'iglu:com.optimizely.snowplow/optimizely_summary/jsonschema/1-0-0',
          data: experiment,
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
      return map_1(getOptimizelyXSummary(), function (experiment) {
        return {
          schema: 'iglu:com.optimizely.optimizelyx/summary/jsonschema/1-0-0',
          data: experiment,
        };
      });
    }

    return {
      getContexts: function getContexts() {
        var combinedContexts = []; // Add Optimizely Contexts

        if (windowAlias.optimizely) {
          if (summary) {
            var activeExperiments = getOptimizelySummaryContexts();
            forEach_1(activeExperiments, function (e) {
              combinedContexts.push(e);
            });
          }

          if (xSummary) {
            var activeXExperiments = getOptimizelyXSummaryContexts();
            forEach_1(activeXExperiments, function (e) {
              combinedContexts.push(e);
            });
          }

          if (experiments) {
            var experimentContexts = getOptimizelyExperimentContexts();

            for (var i = 0; i < experimentContexts.length; i++) {
              combinedContexts.push(experimentContexts[i]);
            }
          }

          if (states) {
            var stateContexts = getOptimizelyStateContexts();

            for (var i = 0; i < stateContexts.length; i++) {
              combinedContexts.push(stateContexts[i]);
            }
          }

          if (variations) {
            var variationContexts = getOptimizelyVariationContexts();

            for (var i = 0; i < variationContexts.length; i++) {
              combinedContexts.push(variationContexts[i]);
            }
          }

          if (visitor) {
            var optimizelyVisitorContext = getOptimizelyVisitorContext();

            if (optimizelyVisitorContext) {
              combinedContexts.push(optimizelyVisitorContext);
            }
          }

          if (audiences) {
            var audienceContexts = getOptimizelyAudienceContexts();

            for (var i = 0; i < audienceContexts.length; i++) {
              combinedContexts.push(audienceContexts[i]);
            }
          }

          if (dimensions) {
            var dimensionContexts = getOptimizelyDimensionContexts();

            for (var i = 0; i < dimensionContexts.length; i++) {
              combinedContexts.push(dimensionContexts[i]);
            }
          }
        }

        return combinedContexts;
      },
    };
  };

  /************************************************************
   * Proxy object
   * - this allows the caller to continue push()'ing to _snaq
   *   after the Tracker has been initialized and loaded
   ************************************************************/

  function InQueueManager(functionName, asyncQueue) {
    var basePlugins = [OptimizelyPlugin()];
    /**
     * Get an array of trackers to which a function should be applied.
     *
     * @param array names List of namespaces to use. If empty, use all namespaces.
     */

    function getNamedTrackers(names) {
      var namedTrackers = [];

      if (!names || names.length === 0) {
        namedTrackers = map_1(allTrackers(functionName));
      } else {
        for (var i = 0; i < names.length; i++) {
          namedTrackers.push(getTracker(names[i], functionName));
        }
      }

      if (namedTrackers.length === 0) {
        warn('Warning: No tracker configured');
      }

      return namedTrackers;
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

        if (isFunction$1(input)) {
          try {
            input.apply(allTrackers(functionName), parameterArray);
          } catch (e) {
            warn('Custom callback error - '.concat(e));
          } finally {
            continue;
          }
        }

        parsedString = parseInputString(input);
        f = parsedString[0];
        names = parsedString[1];

        if (f === 'newTracker') {
          parameterArray[2] = _objectSpread2(
            _objectSpread2({}, parameterArray[2]),
            {},
            {
              plugins: basePlugins,
            }
          );
          newTracker(parameterArray[0], parameterArray[1], parameterArray[2], functionName);
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
      push: applyAsyncFunction,
    };
  }

  /*
   * JavaScript tracker for Snowplow: init.js
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
  var windowAlias$3 = window,
    functionName = windowAlias$3.GlobalSnowplowNamespace.shift(),
    queue = windowAlias$3[functionName]; // Now replace initialization array with queue manager object

  queue.q = new InQueueManager(functionName, queue.q);
})();
