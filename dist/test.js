(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var f = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$1 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$1
	};

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */


	var check = function (O, proto) {
	  _anObject(O);
	  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	var _setProto = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function (test, buggy, set) {
	      try {
	        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch (e) { buggy = true; }
	      return function setPrototypeOf(O, proto) {
	        check(O, proto);
	        if (buggy) O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

	var setPrototypeOf = _setProto.set;
	var _inheritIfRequired = function (that, target, C) {
	  var S = target.constructor;
	  var P;
	  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
	    setPrototypeOf(that, P);
	  } return that;
	};

	var dP = Object.defineProperty;

	var f$2 = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f$2
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.5.7' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});

	var _library = false;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: _library ? 'pure' : 'global',
	  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$3
	};

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	// 7.2.8 IsRegExp(argument)


	var MATCH = _wks('match');
	var _isRegexp = function (it) {
	  var isRegExp;
	  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
	};

	// 21.2.5.3 get RegExp.prototype.flags

	var _flags = function () {
	  var that = _anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var _redefine = createCommonjsModule(function (module) {
	var SRC = _uid('src');
	var TO_STRING = 'toString';
	var $toString = Function[TO_STRING];
	var TPL = ('' + $toString).split(TO_STRING);

	_core.inspectSource = function (it) {
	  return $toString.call(it);
	};

	(module.exports = function (O, key, val, safe) {
	  var isFunction = typeof val == 'function';
	  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
	  if (O[key] === val) return;
	  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
	  if (O === _global) {
	    O[key] = val;
	  } else if (!safe) {
	    delete O[key];
	    _hide(O, key, val);
	  } else if (O[key]) {
	    O[key] = val;
	  } else {
	    _hide(O, key, val);
	  }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, TO_STRING, function toString() {
	  return typeof this == 'function' && this[SRC] || $toString.call(this);
	});
	});

	var SPECIES = _wks('species');

	var _setSpecies = function (KEY) {
	  var C = _global[KEY];
	  if (_descriptors && C && !C[SPECIES]) _objectDp.f(C, SPECIES, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};

	var dP$1 = _objectDp.f;
	var gOPN = _objectGopn.f;


	var $RegExp = _global.RegExp;
	var Base = $RegExp;
	var proto = $RegExp.prototype;
	var re1 = /a/g;
	var re2 = /a/g;
	// "new" creates a new object, old webkit buggy here
	var CORRECT_NEW = new $RegExp(re1) !== re1;

	if (_descriptors && (!CORRECT_NEW || _fails(function () {
	  re2[_wks('match')] = false;
	  // RegExp constructor can alter flags and IsRegExp works correct with @@match
	  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
	}))) {
	  $RegExp = function RegExp(p, f) {
	    var tiRE = this instanceof $RegExp;
	    var piRE = _isRegexp(p);
	    var fiU = f === undefined;
	    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
	      : _inheritIfRequired(CORRECT_NEW
	        ? new Base(piRE && !fiU ? p.source : p, f)
	        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f)
	      , tiRE ? this : proto, $RegExp);
	  };
	  var proxy = function (key) {
	    key in $RegExp || dP$1($RegExp, key, {
	      configurable: true,
	      get: function () { return Base[key]; },
	      set: function (it) { Base[key] = it; }
	    });
	  };
	  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
	  proto.constructor = $RegExp;
	  $RegExp.prototype = proto;
	  _redefine(_global, 'RegExp', $RegExp);
	}

	_setSpecies('RegExp');

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
	var _addToUnscopables = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	var _iterators = {};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
	  var key, own, out, exp;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    // export native or passed
	    out = (own ? target : source)[key];
	    // bind timers to global for call from export context
	    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // extend global
	    if (target) _redefine(target, key, out, type & $export.U);
	    // export
	    if (exports[key] != out) _hide(exports, key, exp);
	    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
	  }
	};
	_global.core = _core;
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var def = _objectDp.f;

	var TAG = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var ITERATOR = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!_library && typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	_addToUnscopables('keys');
	_addToUnscopables('values');
	_addToUnscopables('entries');

	var ITERATOR$1 = _wks('iterator');
	var TO_STRING_TAG = _wks('toStringTag');
	var ArrayValues = _iterators.Array;

	var DOMIterables = {
	  CSSRuleList: true, // TODO: Not spec compliant, should be false.
	  CSSStyleDeclaration: false,
	  CSSValueList: false,
	  ClientRectList: false,
	  DOMRectList: false,
	  DOMStringList: false,
	  DOMTokenList: true,
	  DataTransferItemList: false,
	  FileList: false,
	  HTMLAllCollection: false,
	  HTMLCollection: false,
	  HTMLFormElement: false,
	  HTMLSelectElement: false,
	  MediaList: true, // TODO: Not spec compliant, should be false.
	  MimeTypeArray: false,
	  NamedNodeMap: false,
	  NodeList: true,
	  PaintRequestList: false,
	  Plugin: false,
	  PluginArray: false,
	  SVGLengthList: false,
	  SVGNumberList: false,
	  SVGPathSegList: false,
	  SVGPointList: false,
	  SVGStringList: false,
	  SVGTransformList: false,
	  SourceBufferList: false,
	  StyleSheetList: true, // TODO: Not spec compliant, should be false.
	  TextTrackCueList: false,
	  TextTrackList: false,
	  TouchList: false
	};

	for (var collections = _objectKeys(DOMIterables), i$1 = 0; i$1 < collections.length; i$1++) {
	  var NAME = collections[i$1];
	  var explicit = DOMIterables[NAME];
	  var Collection = _global[NAME];
	  var proto$1 = Collection && Collection.prototype;
	  var key;
	  if (proto$1) {
	    if (!proto$1[ITERATOR$1]) _hide(proto$1, ITERATOR$1, ArrayValues);
	    if (!proto$1[TO_STRING_TAG]) _hide(proto$1, TO_STRING_TAG, NAME);
	    _iterators[NAME] = ArrayValues;
	    if (explicit) for (key in es6_array_iterator) if (!proto$1[key]) _redefine(proto$1, key, es6_array_iterator[key], true);
	  }
	}

	function _typeof(obj) {
	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	function _objectSpread(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};
	    var ownKeys = Object.keys(source);

	    if (typeof Object.getOwnPropertySymbols === 'function') {
	      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
	        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	      }));
	    }

	    ownKeys.forEach(function (key) {
	      _defineProperty(target, key, source[key]);
	    });
	  }

	  return target;
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	function _wrapNativeSuper(Class) {
	  var _cache = typeof Map === "function" ? new Map() : undefined;

	  _wrapNativeSuper = function _wrapNativeSuper(Class) {
	    if (Class === null || !_isNativeFunction(Class)) return Class;

	    if (typeof Class !== "function") {
	      throw new TypeError("Super expression must either be null or a function");
	    }

	    if (typeof _cache !== "undefined") {
	      if (_cache.has(Class)) return _cache.get(Class);

	      _cache.set(Class, Wrapper);
	    }

	    function Wrapper() {
	      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
	    }

	    Wrapper.prototype = Object.create(Class.prototype, {
	      constructor: {
	        value: Wrapper,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    return _setPrototypeOf(Wrapper, Class);
	  };

	  return _wrapNativeSuper(Class);
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	var _fixReWks = function (KEY, length, exec) {
	  var SYMBOL = _wks(KEY);
	  var fns = exec(_defined, SYMBOL, ''[KEY]);
	  var strfn = fns[0];
	  var rxfn = fns[1];
	  if (_fails(function () {
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  })) {
	    _redefine(String.prototype, KEY, strfn);
	    _hide(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return rxfn.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return rxfn.call(string, this); }
	    );
	  }
	};

	// @@split logic
	_fixReWks('split', 2, function (defined, SPLIT, $split) {
	  var isRegExp = _isRegexp;
	  var _split = $split;
	  var $push = [].push;
	  var $SPLIT = 'split';
	  var LENGTH = 'length';
	  var LAST_INDEX = 'lastIndex';
	  if (
	    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
	    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
	    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
	    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
	    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
	    ''[$SPLIT](/.?/)[LENGTH]
	  ) {
	    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
	    // based on es5-shim implementation, need to rework it
	    $split = function (separator, limit) {
	      var string = String(this);
	      if (separator === undefined && limit === 0) return [];
	      // If `separator` is not a regex, use native split
	      if (!isRegExp(separator)) return _split.call(string, separator, limit);
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var separator2, match, lastIndex, lastLength, i;
	      // Doesn't need flags gy, but they don't hurt
	      if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
	      while (match = separatorCopy.exec(string)) {
	        // `separatorCopy.lastIndex` is not reliable cross-browser
	        lastIndex = match.index + match[0][LENGTH];
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
	          // eslint-disable-next-line no-loop-func
	          if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
	            for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
	          });
	          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
	          lastLength = match[0][LENGTH];
	          lastLastIndex = lastIndex;
	          if (output[LENGTH] >= splitLimit) break;
	        }
	        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string[LENGTH]) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
	    };
	  // Chakra, V8
	  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
	    $split = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
	    };
	  }
	  // 21.1.3.17 String.prototype.split(separator, limit)
	  return [function split(separator, limit) {
	    var O = defined(this);
	    var fn = separator == undefined ? undefined : separator[SPLIT];
	    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
	  }, $split];
	});

	var dP$2 = _objectDp.f;
	var FProto = Function.prototype;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME$1 = 'name';

	// 19.2.4.2 name
	NAME$1 in FProto || _descriptors && dP$2(FProto, NAME$1, {
	  configurable: true,
	  get: function () {
	    try {
	      return ('' + this).match(nameRE)[1];
	    } catch (e) {
	      return '';
	    }
	  }
	});

	// @@match logic
	_fixReWks('match', 1, function (defined, MATCH, $match) {
	  // 21.1.3.11 String.prototype.match(regexp)
	  return [function match(regexp) {
	    var O = defined(this);
	    var fn = regexp == undefined ? undefined : regexp[MATCH];
	    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	  }, $match];
	});

	// @@replace logic
	_fixReWks('replace', 2, function (defined, REPLACE, $replace) {
	  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
	  return [function replace(searchValue, replaceValue) {
	    var O = defined(this);
	    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return fn !== undefined
	      ? fn.call(searchValue, O, replaceValue)
	      : $replace.call(String(O), searchValue, replaceValue);
	  }, $replace];
	});

	/*
	* @version    1.0.4
	* @date       2015-03-13
	* @stability  3 - Stable
	* @author     Lauri Rooden <lauri@rooden.ee>
	* @license    MIT License
	*/


	// In browser `this` refers to the window object,
	// in NodeJS `this` refers to the exports.

	commonjsGlobal.cookie = function(name, value, ttl, path, domain, secure) {

		if (arguments.length > 1) {
			return document.cookie = name + "=" + encodeURIComponent(value) +
				(ttl ? "; expires=" + new Date(+new Date()+(ttl*1000)).toUTCString() : "") +
				(path   ? "; path=" + path : "") +
				(domain ? "; domain=" + domain : "") +
				(secure ? "; secure" : "")
		}

		return decodeURIComponent((("; "+document.cookie).split("; "+name+"=")[1]||"").split(";")[0])
	};

	var browserCookieLite = {

	};
	var browserCookieLite_1 = browserCookieLite.cookie;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Built-in value references. */
	var Symbol$1 = root.Symbol;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty$1.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

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

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

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
	  return (symToStringTag$1 && symToStringTag$1 in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

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
	  return value != null && typeof value == 'object';
	}

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
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
	}

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
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	/**
	 * Cleans up the page title
	 *
	 * @param {String} title - page title to clean up
	 * @returns {String} - cleaned up page title
	 */

	var fixupTitle = function fixupTitle(title) {
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
	 *
	 * @param {String} url - the url to extract the hostname from
	 * @returns {String} - the hostname
	 */

	var getHostName = function getHostName(url) {
	  // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
	  var e = new RegExp('^(?:(?:https?|ftp):)/*(?:[^@]+@)?([^:/#]+)'),
	      matches = e.exec(url);
	  return matches ? matches[1] : url;
	};
	/**
	 * Fix-up domain
	 *
	 * @param {String} domain - domain to fix up
	 * @returns {String} - fixed up domain
	 */

	var fixupDomain = function fixupDomain(domain) {
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
	 * @param {String} oldLocation  - optional.
	 * @returns {String} - the referrer
	 */

	var getReferrer = function getReferrer(oldLocation) {
	  var referrer = '';
	  var fromQs = fromQuerystring('referrer', window.location.href) || fromQuerystring('referer', window.location.href); // Short-circuit

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
	 *
	 * @param {HTMLElement} element - the element to add the event to
	 * @param {eventType} eventType - the type of event to listen to
	 * @param {Function} eventHandler - the function to attach
	 * @param {Boolean} useCapture - set to true to enable "capture mode"
	 * @returns {Boolean} - returns the result of adding the listner, should always be true.
	 */

	var addEventListener = function addEventListener(element, eventType, eventHandler, useCapture) {
	  if (element.addEventListener) {
	    element.addEventListener(eventType, eventHandler, useCapture);
	    return true;
	  }

	  if (element.attachEvent) {
	    return element.attachEvent('on' + eventType, eventHandler);
	  }

	  element['on' + eventType] = eventHandler;
	  return true;
	};
	/**
	 * Return value from name-value pair in querystring
	 *
	 * @param {String} field - query string field to get value from
	 * @param {String} url - the url to get the query string from
	 * @returns {String} - the value of the field in the query string
	 */

	var fromQuerystring = function fromQuerystring(field, url) {
	  var match = new RegExp('^[^#]*[?&]' + field + '=([^&#]*)').exec(url);

	  if (!match) {
	    return null;
	  }

	  return decodeURIComponent(match[1].replace(/\+/g, ' '));
	};
	/**
	 * Find dynamic context generating functions and merge their results into the static contexts
	 * Combine an array of unchanging contexts with the result of a context-creating function
	 * @param {(object|function(...*): ?object)[]} dynamicOrStaticContexts - Array of custom context Objects or custom context generating functions
	 * @param {...any} callbackParameters - Parameters to pass to dynamic callbacks
	 */

	var resolveDynamicContexts = function resolveDynamicContexts(dynamicOrStaticContexts) {
	  for (var _len = arguments.length, callbackParameters = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    callbackParameters[_key - 1] = arguments[_key];
	  }

	  //var params = Array.prototype.slice.call(arguments, 1);
	  if (dynamicOrStaticContexts) {
	    return dynamicOrStaticContexts.map(function (context) {
	      if (typeof context === 'function') {
	        try {
	          return context.apply(null, callbackParameters);
	        } catch (e) {
	          warn('Exception thrown in dynamic context generator: ' + e);
	        }
	      } else {
	        return context;
	      }
	    });
	  }
	};
	/**
	 * Only log deprecation warnings if they won't cause an error
	 *
	 * @param {String} message - the warning message
	 */

	var warn = function warn(message) {
	  if (typeof window.console !== 'undefined') {
	    window.console.warn('Snowplow: ' + message);
	  }
	};
	/**
	 * List the classes of a DOM element without using elt.classList (for compatibility with IE 9)
	 *
	 * @param {HTMLElement} element - The HTMLElement object to search
	 * @returns {String[]} - an array of the classes on the element
	 */

	var getCssClasses = function getCssClasses(element) {
	  return element.className.match(/\S+/g) || [];
	};
	/**
	 * Check whether an element has at least one class from a given list
	 *
	 * @param {*} element - The HTMLElement object to search
	 * @param {Object} classList - hashtable of class name strings to check
	 * @returns {Boolean} - true if the element contains any of the classes in the array
	 */

	var checkClass = function checkClass(element, classList) {
	  var classes = getCssClasses(element),
	      i;

	  for (i = 0; i < classes.length; i++) {
	    if (classList[classes[i]]) {
	      return true;
	    }
	  }

	  return false;
	};
	/**
	 * Convert a criterion object to a filter function
	 *
	 * @param {Object} criterion Either {whitelist: [array of allowable strings]}
	 *                             or {blacklist: [array of allowable strings]}
	 *                             or {filter: function (elt) {return whether to track the element}
	 * @param {Boolean} byClass Whether to whitelist/blacklist based on an element's classes (for forms)
	 *                        		or name attribute (for fields)
	 * @returns {Function} - resultant filter function
	 */

	var getFilter = function getFilter(criterion, byClass) {
	  // If the criterion argument is not an object, add listeners to all elements
	  if (isArray(criterion) || !isObject(criterion)) {
	    return function () {
	      return true;
	    };
	  }

	  if (criterion.hasOwnProperty('filter')) {
	    return criterion.filter;
	  } else {
	    var inclusive = criterion.hasOwnProperty('whitelist');
	    var specifiedClasses = criterion.whitelist || criterion.blacklist;

	    if (!isArray(specifiedClasses)) {
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
	 * @param {Object} criterion  - {transform: function (elt) {return the result of transform function applied to element}
	 * @returns {Function} - the resultant transform function
	 */

	var getTransform = function getTransform(criterion) {
	  if (isObject(criterion) && criterion.hasOwnProperty('transform')) {
	    return criterion.transform;
	  }

	  return function (x) {
	    return x;
	  };
	};
	/**
	 * Add a name-value pair to the querystring of a URL
	 *
	 * @param {String} url -  URL to decorate
	 * @param {String} name - Name of the querystring pair
	 * @param {String} value  - Value of the querystring pair
	 * @returns {String} - resultant url
	 */

	var decorateQuerystring = function decorateQuerystring(url, name, value) {
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
	 * @param {String} key - the key to read from localStorage
	 * @returns {String|undefined} The value obtained from localStorage, or undefined if localStorage is inaccessible
	 */

	var attemptGetLocalStorage = function attemptGetLocalStorage(key) {
	  try {
	    return localStorage.getItem(key);
	  } catch (e) {//The try is to prevent an error, but it is OK to swallow it here as that is expected behaviour
	  }
	};
	/**
	 * Attempt to write a value to localStorage
	 *
	 * @param {String} key - the key to write to in localStorage
	 * @param {String} value - the value to write to localStorage
	 * @returns {Boolean} true if the operation was successful
	 */

	var attemptWriteLocalStorage = function attemptWriteLocalStorage(key, value) {
	  try {
	    localStorage.setItem(key, value);
	    return true;
	  } catch (e) {
	    return false;
	  }
	};
	/**
	 * Finds the root domain. Attempts to use cookies, or defaults to the hostname
	 *
	 * @returns {String}  - the root domain of the page
	 */

	var findRootDomain = function findRootDomain() {
	  var cookiePrefix = '_sp_root_domain_test_';
	  var cookieName = cookiePrefix + new Date().getTime();
	  var cookieValue = '_test_value_' + new Date().getTime();
	  var split = window.location.hostname.split('.');
	  var position = split.length - 1;

	  while (position >= 0) {
	    var currentDomain = split.slice(position, split.length).join('.');
	    browserCookieLite_1.cookie(cookieName, cookieValue, 0, '/', currentDomain);

	    if (browserCookieLite_1.cookie(cookieName) === cookieValue) {
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


	  return window.location.hostname;
	};
	/**
	 * Checks whether a value is present within an array
	 *
	 * @param {any} val  - The value to check for
	 * @param {Array} array - The array to check within
	 * @returns {Boolean}  - Whether it exists
	 */

	var isValueInArray = function isValueInArray(val, array) {
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
	 * @param {String} cookieName -  The name of the cookie to delete
	 * @param {String} domainName  - The domain the cookie is in
	 */

	var deleteCookie = function deleteCookie(cookieName, domainName) {
	  browserCookieLite_1.cookie(cookieName, '', -1, '/', domainName);
	};
	/**
	 * Fetches the name of all cookies beginning with a certain prefix
	 *
	 * @param {String} cookiePrefix - The prefix to check for
	 * @returns {Array} an array of the cookies that begin with the prefix
	 */

	var getCookiesWithPrefix = function getCookiesWithPrefix(cookiePrefix) {
	  var cookies = document.cookie.split('; ');
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
	 * @param {any} obj - The object to parse
	 * @returns {Number|undefined} - the result of the parse operation
	 */

	var pInt = function pInt(obj) {
	  var result = parseInt(obj);
	  return isNaN(result) ? undefined : result;
	};
	/**
	 * Parses an object and returns either the
	 * number or undefined.
	 *
	 * @param {any} obj -  The object to parse
	 * @returns {Number|undefined} the result of the parse operation
	 */

	var pFloat = function pFloat(obj) {
	  var result = parseFloat(obj);
	  return isNaN(result) ? undefined : result;
	};
	var helpers = {
	  addEventListener: addEventListener,
	  attemptGetLocalStorage: attemptGetLocalStorage,
	  attemptWriteLocalStorage: attemptWriteLocalStorage,
	  decorateQuerystring: decorateQuerystring,
	  deleteCookie: deleteCookie,
	  findRootDomain: findRootDomain,
	  fixupDomain: fixupDomain,
	  fixupTitle: fixupTitle,
	  fromQuerystring: fromQuerystring,
	  getCookiesWithPrefix: getCookiesWithPrefix,
	  getCssClasses: getCssClasses,
	  getFilter: getFilter,
	  getHostName: getHostName,
	  getReferrer: getReferrer,
	  getTransform: getTransform,
	  isValueInArray: isValueInArray,
	  parseFloat: parseFloat,
	  parseInt: parseInt,
	  resolveDynamicContexts: resolveDynamicContexts,
	  warn: warn
	};

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	var f$4 = _wks;

	var _wksExt = {
		f: f$4
	};

	var defineProperty = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
	};

	_wksDefine('asyncIterator');

	var _meta = createCommonjsModule(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});

	var f$5 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$5
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN$1 = _objectGopn.f;
	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN$1(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$6 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$6
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;



















	var gOPD$1 = _objectGopd.f;
	var dP$3 = _objectDp.f;
	var gOPN$2 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON = _global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE = _wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto$1 = Object[PROTOTYPE$2];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$3({}, 'a', {
	    get: function () { return dP$3(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$1(ObjectProto$1, key);
	  if (protoDesc) delete ObjectProto$1[key];
	  dP$3(it, key, D);
	  if (protoDesc && it !== ObjectProto$1) dP$3(ObjectProto$1, key, protoDesc);
	} : dP$3;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) dP$3(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$3(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = _toPrimitive(key, true));
	  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
	  var D = gOPD$1(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$2(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto$1;
	  var names = gOPN$2(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto$1) $set.call(OPSymbols, value);
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

	_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    if (!_isArray(replacer)) replacer = function (key, value) {
	      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

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
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	var getNamedTrackers = Symbol('getNamedTrackers');
	var applyAsyncFunction = Symbol('applyAsyncFunction');
	var legacyCreateNewNamespace = Symbol('legacyCreateNewNamespace');
	var createNewNamespace = Symbol('createNewNamespace');
	var parseInputString = Symbol('parseInputString'); // Page view ID should be shared between all tracker instances

	var trackerDictionary = {};

	var InQueueManager =
	/*#__PURE__*/
	function () {
	  /**
	   * Creates a new proxy object to manage the event queue
	   *
	   * @param {Function} TrackerConstructor - the constructor a new tracker
	   * @param {String} version - the version of the tracker
	   * @param {Object} mutSnowplowState - the mutable snowplow state
	   * @param {Object} asyncQueue - the queue object to manage
	   * @param {Object} functionName - the Snowplow function name (used to generate the localStorage key)
	   */
	  function InQueueManager(TrackerConstructor, version, mutSnowplowState, asyncQueue, functionName) {
	    _classCallCheck(this, InQueueManager);

	    this.TrackerConstructor = TrackerConstructor;
	    this.version = version;
	    this.mutSnowplowState = mutSnowplowState;
	    this.asyncQueue = asyncQueue;
	    this.functionName = functionName; // We need to manually apply any events collected before this initialization

	    for (var i = 0; i < asyncQueue.length; i++) {
	      this[applyAsyncFunction](asyncQueue[i]);
	    }
	  }
	  /**
	   *
	   * Private Methods
	   *
	   */

	  /**
	   * Get an array of trackers to which a function should be applied.
	   *
	   * @param {Array} names -  List of namespaces to use. If empty, use all namespaces.
	   * @returns {Array} - array of trackers
	   */


	  _createClass(InQueueManager, [{
	    key: getNamedTrackers,
	    value: function value(names) {
	      var namedTrackers = [];

	      if (!names || names.length === 0) {
	        namedTrackers = Object.keys(trackerDictionary).map(function (tracker) {
	          return trackerDictionary[tracker];
	        });
	      } else {
	        for (var i = 0; i < names.length; i++) {
	          if (trackerDictionary.hasOwnProperty(names[i])) {
	            namedTrackers.push(trackerDictionary[names[i]]);
	          } else {
	            warn('Warning: Tracker namespace "' + names[i] + '" not configured');
	          }
	        }
	      }

	      if (namedTrackers.length === 0) {
	        warn('Warning: No tracker configured');
	      }

	      return namedTrackers;
	    }
	    /**
	     * Legacy support for input of the form _snaq.push(['setCollectorCf', 'd34uzc5hjrimh8'])
	     *
	     * @param {String} f - Either 'setCollectorCf' or 'setCollectorUrl'
	     * @param {String} endpoint - Collector endpoint
	     * @param {String} namespace -  Optional tracker name
	     * @deprecated - This will be removed soon. Use createNewNamespace instead
	     */

	  }, {
	    key: legacyCreateNewNamespace,
	    value: function value(f, endpoint, namespace) {
	      //TODO: remove this in 2.1.0
	      warn("".concat(f, " is deprecated. Set the collector when a new tracker instance using newTracker."));
	      var name;

	      if (namespace === undefined) {
	        name = 'sp';
	      } else {
	        name = namespace;
	      }

	      this[createNewNamespace](name);
	      trackerDictionary[name][f](endpoint);
	    }
	    /**
	     * Initiate a new tracker namespace
	     *
	     * @param {String} namespace - Namespace to create
	     * @param {String} endpoint -  with the form d3rkrsqld9gmqf.cloudfront.net
	     */

	  }, {
	    key: createNewNamespace,
	    value: function value(namespace, endpoint, argmap) {
	      argmap = argmap || {};

	      if (!trackerDictionary.hasOwnProperty(namespace)) {
	        trackerDictionary[namespace] = new this.TrackerConstructor(this.functionName, namespace, this.version, this.mutSnowplowState, argmap);
	        trackerDictionary[namespace].setCollectorUrl(endpoint);
	      } else {
	        warn('Tracker namespace ' + namespace + ' already exists.');
	      }
	    }
	    /**
	     * Output an array of the form ['functionName', [trackerName1, trackerName2, ...]]
	     *
	     * @param {String} inputString - The input string to parse
	     * @returns {Array} - ['functionName', [trackerName1, trackerName2, ...]]
	     */

	  }, {
	    key: parseInputString,
	    value: function value(inputString) {
	      var separatedString = inputString.split(':'),
	          extractedFunction = separatedString[0],
	          extractedNames = separatedString.length > 1 ? separatedString[1].split(';') : [];
	      return [extractedFunction, extractedNames];
	    }
	    /**
	     * Apply wrapper function
	     *
	     * @param {Array} parameterArray An array comprising either:
	     *      [ 'methodName', optional_parameters ]
	     * or:
	     *      [ functionObject, optional_parameters ]
	     */

	  }, {
	    key: applyAsyncFunction,
	    value: function value() {
	      var i, j, f, parameterArray, input, parsedString, names, namedTrackers; // Outer loop in case someone push'es in zarg of arrays

	      for (i = 0; i < arguments.length; i += 1) {
	        parameterArray = arguments[i]; // Arguments is not an array, so we turn it into one

	        input = Array.prototype.shift.call(parameterArray); // Custom callback rather than tracker method, called with trackerDictionary as the context

	        if (isFunction(input)) {
	          input.apply(trackerDictionary, parameterArray);
	          continue;
	        }

	        parsedString = this[parseInputString](input);
	        f = parsedString[0];
	        names = parsedString[1];

	        if (f === 'newTracker') {
	          this[createNewNamespace](parameterArray[0], parameterArray[1], parameterArray[2]);
	          continue;
	        }

	        if ((f === 'setCollectorCf' || f === 'setCollectorUrl') && (!names || names.length === 0)) {
	          this[legacyCreateNewNamespace](f, parameterArray[0], parameterArray[1]);
	          continue;
	        }

	        namedTrackers = this[getNamedTrackers](names);

	        for (j = 0; j < namedTrackers.length; j++) {
	          namedTrackers[j][f].apply(namedTrackers[j], parameterArray);
	        }
	      }
	    }
	    /**
	     *
	     * Public Methods
	     *
	     */

	    /**
	     * @param {any} - Push x to async queue
	     */

	  }, {
	    key: "push",
	    value: function push() {
	      this[applyAsyncFunction].apply(this, arguments);
	    }
	  }]);

	  return InQueueManager;
	}();

	// 21.2.5.3 get RegExp.prototype.flags()
	if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
	  configurable: true,
	  get: _flags
	});

	var TO_STRING = 'toString';
	var $toString = /./[TO_STRING];

	var define = function (fn) {
	  _redefine(RegExp.prototype, TO_STRING, fn, true);
	};

	// 21.2.5.14 RegExp.prototype.toString()
	if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
	  define(function toString() {
	    var R = _anObject(this);
	    return '/'.concat(R.source, '/',
	      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
	  });
	// FF44- RegExp#toString has a wrong name
	} else if ($toString.name != TO_STRING) {
	  define(function toString() {
	    return $toString.call(this);
	  });
	}

	/**
	 * Test whether a string is an IP address
	 *
	 * @param {String} string - The string to test
	 * @returns {Boolean} - true if the string is an IP address
	 */

	var isIpAddress = function isIpAddress(string) {
	  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(string);
	};
	/**
	 * If the hostname is an IP address, look for text indicating that the page is cached by Yahoo
	 *
	 * @param {String} hostName  - host name to check
	 * @returns {Boolean} - true if the page is cached by Yahoo
	 */


	var isYahooCachedPage = function isYahooCachedPage(hostName) {
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
	};
	/**
	 * Extract parameter from URL
	 *
	 * @param {String} url - url to extract the parameter from
	 * @param {String} name - name of the parameter to extract
	 * @returns {String} - string value of the extracted parameter
	 */


	var getParameter = function getParameter(url, name) {
	  //TODO: This should possibly be moved to Helpers.
	  // scheme : // [username [: password] @] hostname [: port] [/ [path] [? query] [# fragment]]
	  var e = new RegExp('^(?:https?|ftp)(?::/*(?:[^?]+))([?][^#]+)'),
	      matches = e.exec(url),
	      result = fromQuerystring(name, matches[1]);
	  return result;
	};
	/**
	 * Fix-up URL when page rendered from search engine cache or translated page.
	 *
	 * @param {String} hostName - the host name of the server
	 * @param {String} href - the href of the page
	 * @param {String} referrer - the referrer of the page
	 */


	var fixupUrl = function fixupUrl(hostName, href, referrer) {
	  //TODO: it would be nice to generalise this and/or move into the ETL phase.
	  var _host = isYahooCachedPage(hostName) ? 'yahoo' : hostName;

	  switch (_host) {
	    case 'translate.googleusercontent.com':
	      if (referrer === '') {
	        referrer = href;
	      }

	      href = getParameter(href, 'u');
	      hostName = getHostName(href);
	      break;

	    case 'cc.bingj.com':
	    case 'webcache.googleusercontent.com':
	    case 'yahoo':
	      href = document.links[0].href;
	      hostName = getHostName(href);
	      break;
	  }

	  return [hostName, href, referrer];
	};

	var _strictMethod = function (method, arg) {
	  return !!method && _fails(function () {
	    // eslint-disable-next-line no-useless-call
	    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
	  });
	};

	var $sort = [].sort;
	var test = [1, 2, 3];

	_export(_export.P + _export.F * (_fails(function () {
	  // IE8-
	  test.sort(undefined);
	}) || !_fails(function () {
	  // V8 bug
	  test.sort(null);
	  // Old WebKit
	}) || !_strictMethod($sort)), 'Array', {
	  // 22.1.3.25 Array.prototype.sort(comparefn)
	  sort: function sort(comparefn) {
	    return comparefn === undefined
	      ? $sort.call(_toObject(this))
	      : $sort.call(_toObject(this), _aFunction(comparefn));
	  }
	});

	var murmurhash = createCommonjsModule(function (module) {
	(function(){

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
	    var
	      l = str.length,
	      h = seed ^ l,
	      i = 0,
	      k;

	    while (l >= 4) {
	      k =
	        ((str.charCodeAt(i) & 0xff)) |
	        ((str.charCodeAt(++i) & 0xff) << 8) |
	        ((str.charCodeAt(++i) & 0xff) << 16) |
	        ((str.charCodeAt(++i) & 0xff) << 24);

	      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
	      k ^= k >>> 24;
	      k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

	    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

	      l -= 4;
	      ++i;
	    }

	    switch (l) {
	    case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
	    case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
	    case 1: h ^= (str.charCodeAt(i) & 0xff);
	            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
	    }

	    h ^= h >>> 13;
	    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
	    h ^= h >>> 15;

	    return h >>> 0;
	  }
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
	    var remainder, bytes, h1, h1b, c1, c2, k1, i;

	    remainder = key.length & 3; // key.length % 4
	    bytes = key.length - remainder;
	    h1 = seed;
	    c1 = 0xcc9e2d51;
	    c2 = 0x1b873593;
	    i = 0;

	    while (i < bytes) {
	        k1 =
	          ((key.charCodeAt(i) & 0xff)) |
	          ((key.charCodeAt(++i) & 0xff) << 8) |
	          ((key.charCodeAt(++i) & 0xff) << 16) |
	          ((key.charCodeAt(++i) & 0xff) << 24);
	      ++i;

	      k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
	      k1 = (k1 << 15) | (k1 >>> 17);
	      k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

	      h1 ^= k1;
	          h1 = (h1 << 13) | (h1 >>> 19);
	      h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
	      h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
	    }

	    k1 = 0;

	    switch (remainder) {
	      case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
	      case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
	      case 1: k1 ^= (key.charCodeAt(i) & 0xff);

	      k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
	      k1 = (k1 << 15) | (k1 >>> 17);
	      k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
	      h1 ^= k1;
	    }

	    h1 ^= key.length;

	    h1 ^= h1 >>> 16;
	    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
	    h1 ^= h1 >>> 13;
	    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
	    h1 ^= h1 >>> 16;

	    return h1 >>> 0;
	  }

	  var murmur = MurmurHashV3;
	  murmur.v2 = MurmurHashV2;
	  murmur.v3 = MurmurHashV3;

	  {
	    module.exports = murmur;
	  }
	}());
	});
	var murmurhash_1 = murmurhash.v3;

	var jstz = createCommonjsModule(function (module) {
	(function (root) {/*global exports, Intl*/
	/**
	 * This script gives you the zone info key representing your device's time zone setting.
	 *
	 * @name jsTimezoneDetect
	 * @version 1.0.6
	 * @author Jon Nylander
	 * @license MIT License - https://bitbucket.org/pellepim/jstimezonedetect/src/default/LICENCE.txt
	 *
	 * For usage and examples, visit:
	 * http://pellepim.bitbucket.org/jstz/
	 *
	 * Copyright (c) Jon Nylander
	 */


	/**
	 * Namespace to hold all the code for timezone detection.
	 */
	var jstz = (function () {
	    var HEMISPHERE_SOUTH = 's',

	        consts = {
	            DAY: 86400000,
	            HOUR: 3600000,
	            MINUTE: 60000,
	            SECOND: 1000,
	            BASELINE_YEAR: 2014,
	            MAX_SCORE: 864000000, // 10 days
	            AMBIGUITIES: {
	                'America/Denver':       ['America/Mazatlan'],
	                'Europe/London':        ['Africa/Casablanca'],
	                'America/Chicago':      ['America/Mexico_City'],
	                'America/Asuncion':     ['America/Campo_Grande', 'America/Santiago'],
	                'America/Montevideo':   ['America/Sao_Paulo', 'America/Santiago'],
	                // Europe/Minsk should not be in this list... but Windows.
	                'Asia/Beirut':          ['Asia/Amman', 'Asia/Jerusalem', 'Europe/Helsinki', 'Asia/Damascus', 'Africa/Cairo', 'Asia/Gaza', 'Europe/Minsk'],
	                'Pacific/Auckland':     ['Pacific/Fiji'],
	                'America/Los_Angeles':  ['America/Santa_Isabel'],
	                'America/New_York':     ['America/Havana'],
	                'America/Halifax':      ['America/Goose_Bay'],
	                'America/Godthab':      ['America/Miquelon'],
	                'Asia/Dubai':           ['Asia/Yerevan'],
	                'Asia/Jakarta':         ['Asia/Krasnoyarsk'],
	                'Asia/Shanghai':        ['Asia/Irkutsk', 'Australia/Perth'],
	                'Australia/Sydney':     ['Australia/Lord_Howe'],
	                'Asia/Tokyo':           ['Asia/Yakutsk'],
	                'Asia/Dhaka':           ['Asia/Omsk'],
	                // In the real world Yerevan is not ambigous for Baku... but Windows.
	                'Asia/Baku':            ['Asia/Yerevan'],
	                'Australia/Brisbane':   ['Asia/Vladivostok'],
	                'Pacific/Noumea':       ['Asia/Vladivostok'],
	                'Pacific/Majuro':       ['Asia/Kamchatka', 'Pacific/Fiji'],
	                'Pacific/Tongatapu':    ['Pacific/Apia'],
	                'Asia/Baghdad':         ['Europe/Minsk', 'Europe/Moscow'],
	                'Asia/Karachi':         ['Asia/Yekaterinburg'],
	                'Africa/Johannesburg':  ['Asia/Gaza', 'Africa/Cairo']
	            }
	        },

	        /**
	         * Gets the offset in minutes from UTC for a certain date.
	         * @param {Date} date
	         * @returns {Number}
	         */
	        get_date_offset = function get_date_offset(date) {
	            var offset = -date.getTimezoneOffset();
	            return (offset !== null ? offset : 0);
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
	            var january_offset = get_date_offset(new Date(consts.BASELINE_YEAR, 0, 2)),
	                june_offset = get_date_offset(new Date(consts.BASELINE_YEAR, 5, 2)),
	                diff = january_offset - june_offset;

	            if (diff < 0) {
	                return january_offset + ",1";
	            } else if (diff > 0) {
	                return june_offset + ",1," + HEMISPHERE_SOUTH;
	            }

	            return january_offset + ",0";
	        },


	        /**
	         * Tries to get the time zone key directly from the operating system for those
	         * environments that support the ECMAScript Internationalization API.
	         */
	        get_from_internationalization_api = function get_from_internationalization_api() {
	            var format, timezone;
	            if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat === "undefined") {
	                return;
	            }

	            format = Intl.DateTimeFormat();

	            if (typeof format === "undefined" || typeof format.resolvedOptions === "undefined") {
	                return;
	            }

	            timezone = format.resolvedOptions().timeZone;

	            if (timezone && (timezone.indexOf("/") > -1 || timezone === 'UTC')) {
	                return timezone;
	            }

	        },

	        /**
	         * Starting point for getting all the DST rules for a specific year
	         * for the current timezone (as described by the client system).
	         *
	         * Returns an object with start and end attributes, or false if no
	         * DST rules were found for the year.
	         *
	         * @param year
	         * @returns {Object} || {Boolean}
	         */
	        dst_dates = function dst_dates(year) {
	            var yearstart = new Date(year, 0, 1, 0, 0, 1, 0).getTime();
	            var yearend = new Date(year, 12, 31, 23, 59, 59).getTime();
	            var current = yearstart;
	            var offset = (new Date(current)).getTimezoneOffset();
	            var dst_start = null;
	            var dst_end = null;

	            while (current < yearend - 86400000) {
	                var dateToCheck = new Date(current);
	                var dateToCheckOffset = dateToCheck.getTimezoneOffset();

	                if (dateToCheckOffset !== offset) {
	                    if (dateToCheckOffset < offset) {
	                        dst_start = dateToCheck;
	                    }
	                    if (dateToCheckOffset > offset) {
	                        dst_end = dateToCheck;
	                    }
	                    offset = dateToCheckOffset;
	                }

	                current += 86400000;
	            }

	            if (dst_start && dst_end) {
	                return {
	                    s: find_dst_fold(dst_start).getTime(),
	                    e: find_dst_fold(dst_end).getTime()
	                };
	            }

	            return false;
	        },

	        /**
	         * Probably completely unnecessary function that recursively finds the
	         * exact (to the second) time when a DST rule was changed.
	         *
	         * @param a_date - The candidate Date.
	         * @param padding - integer specifying the padding to allow around the candidate
	         *                  date for finding the fold.
	         * @param iterator - integer specifying how many milliseconds to iterate while
	         *                   searching for the fold.
	         *
	         * @returns {Date}
	         */
	        find_dst_fold = function find_dst_fold(a_date, padding, iterator) {
	            if (typeof padding === 'undefined') {
	                padding = consts.DAY;
	                iterator = consts.HOUR;
	            }

	            var date_start = new Date(a_date.getTime() - padding).getTime();
	            var date_end = a_date.getTime() + padding;
	            var offset = new Date(date_start).getTimezoneOffset();

	            var current = date_start;

	            var dst_change = null;
	            while (current < date_end - iterator) {
	                var dateToCheck = new Date(current);
	                var dateToCheckOffset = dateToCheck.getTimezoneOffset();

	                if (dateToCheckOffset !== offset) {
	                    dst_change = dateToCheck;
	                    break;
	                }
	                current += iterator;
	            }

	            if (padding === consts.DAY) {
	                return find_dst_fold(dst_change, consts.HOUR, consts.MINUTE);
	            }

	            if (padding === consts.HOUR) {
	                return find_dst_fold(dst_change, consts.MINUTE, consts.SECOND);
	            }

	            return dst_change;
	        },

	        windows7_adaptations = function windows7_adaptions(rule_list, preliminary_timezone, score, sample) {
	            if (score !== 'N/A') {
	                return score;
	            }
	            if (preliminary_timezone === 'Asia/Beirut') {
	                if (sample.name === 'Africa/Cairo') {
	                    if (rule_list[6].s === 1398376800000 && rule_list[6].e === 1411678800000) {
	                        return 0;
	                    }
	                }
	                if (sample.name === 'Asia/Jerusalem') {
	                    if (rule_list[6].s === 1395964800000 && rule_list[6].e === 1411858800000) {
	                        return 0;
	                }
	            }
	            } else if (preliminary_timezone === 'America/Santiago') {
	                if (sample.name === 'America/Asuncion') {
	                    if (rule_list[6].s === 1412481600000 && rule_list[6].e === 1397358000000) {
	                        return 0;
	                    }
	                }
	                if (sample.name === 'America/Campo_Grande') {
	                    if (rule_list[6].s === 1413691200000 && rule_list[6].e === 1392519600000) {
	                        return 0;
	                    }
	                }
	            } else if (preliminary_timezone === 'America/Montevideo') {
	                if (sample.name === 'America/Sao_Paulo') {
	                    if (rule_list[6].s === 1413687600000 && rule_list[6].e === 1392516000000) {
	                        return 0;
	                    }
	                }
	            } else if (preliminary_timezone === 'Pacific/Auckland') {
	                if (sample.name === 'Pacific/Fiji') {
	                    if (rule_list[6].s === 1414245600000 && rule_list[6].e === 1396101600000) {
	                        return 0;
	                    }
	                }
	            }

	            return score;
	        },

	        /**
	         * Takes the DST rules for the current timezone, and proceeds to find matches
	         * in the jstz.olson.dst_rules.zones array.
	         *
	         * Compares samples to the current timezone on a scoring basis.
	         *
	         * Candidates are ruled immediately if either the candidate or the current zone
	         * has a DST rule where the other does not.
	         *
	         * Candidates are ruled out immediately if the current zone has a rule that is
	         * outside the DST scope of the candidate.
	         *
	         * Candidates are included for scoring if the current zones rules fall within the
	         * span of the samples rules.
	         *
	         * Low score is best, the score is calculated by summing up the differences in DST
	         * rules and if the consts.MAX_SCORE is overreached the candidate is ruled out.
	         *
	         * Yah follow? :)
	         *
	         * @param rule_list
	         * @param preliminary_timezone
	         * @returns {*}
	         */
	        best_dst_match = function best_dst_match(rule_list, preliminary_timezone) {
	            var score_sample = function score_sample(sample) {
	                var score = 0;

	                for (var j = 0; j < rule_list.length; j++) {

	                    // Both sample and current time zone report DST during the year.
	                    if (!!sample.rules[j] && !!rule_list[j]) {

	                        // The current time zone's DST rules are inside the sample's. Include.
	                        if (rule_list[j].s >= sample.rules[j].s && rule_list[j].e <= sample.rules[j].e) {
	                            score = 0;
	                            score += Math.abs(rule_list[j].s - sample.rules[j].s);
	                            score += Math.abs(sample.rules[j].e - rule_list[j].e);

	                        // The current time zone's DST rules are outside the sample's. Discard.
	                        } else {
	                            score = 'N/A';
	                            break;
	                        }

	                        // The max score has been reached. Discard.
	                        if (score > consts.MAX_SCORE) {
	                            score = 'N/A';
	                            break;
	                        }
	                    }
	                }

	                score = windows7_adaptations(rule_list, preliminary_timezone, score, sample);

	                return score;
	            };
	            var scoreboard = {};
	            var dst_zones = jstz.olson.dst_rules.zones;
	            var dst_zones_length = dst_zones.length;
	            var ambiguities = consts.AMBIGUITIES[preliminary_timezone];

	            for (var i = 0; i < dst_zones_length; i++) {
	                var sample = dst_zones[i];
	                var score = score_sample(dst_zones[i]);

	                if (score !== 'N/A') {
	                    scoreboard[sample.name] = score;
	                }
	            }

	            for (var tz in scoreboard) {
	                if (scoreboard.hasOwnProperty(tz)) {
	                    for (var j = 0; j < ambiguities.length; j++) {
	                        if (ambiguities[j] === tz) {
	                            return tz;
	                        }
	                    }
	                }
	            }

	            return preliminary_timezone;
	        },

	        /**
	         * Takes the preliminary_timezone as detected by lookup_key().
	         *
	         * Builds up the current timezones DST rules for the years defined
	         * in the jstz.olson.dst_rules.years array.
	         *
	         * If there are no DST occurences for those years, immediately returns
	         * the preliminary timezone. Otherwise proceeds and tries to solve
	         * ambiguities.
	         *
	         * @param preliminary_timezone
	         * @returns {String} timezone_name
	         */
	        get_by_dst = function get_by_dst(preliminary_timezone) {
	            var get_rules = function get_rules() {
	                var rule_list = [];
	                for (var i = 0; i < jstz.olson.dst_rules.years.length; i++) {
	                    var year_rules = dst_dates(jstz.olson.dst_rules.years[i]);
	                    rule_list.push(year_rules);
	                }
	                return rule_list;
	            };
	            var check_has_dst = function check_has_dst(rules) {
	                for (var i = 0; i < rules.length; i++) {
	                    if (rules[i] !== false) {
	                        return true;
	                    }
	                }
	                return false;
	            };
	            var rules = get_rules();
	            var has_dst = check_has_dst(rules);

	            if (has_dst) {
	                return best_dst_match(rules, preliminary_timezone);
	            }

	            return preliminary_timezone;
	        },

	        /**
	         * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
	         *
	         * Returns an object with one function ".name()"
	         *
	         * @returns Object
	         */
	        determine = function determine() {
	            var preliminary_tz = get_from_internationalization_api();

	            if (!preliminary_tz) {
	                preliminary_tz = jstz.olson.timezones[lookup_key()];

	                if (typeof consts.AMBIGUITIES[preliminary_tz] !== 'undefined') {
	                    preliminary_tz = get_by_dst(preliminary_tz);
	                }
	            }

	            return {
	                name: function () {
	                    return preliminary_tz;
	                }
	            };
	        };

	    return {
	        determine: determine
	    };
	}());


	jstz.olson = jstz.olson || {};

	/**
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
	 * jstz.determine();
	 */
	jstz.olson.timezones = {
	    '-720,0': 'Etc/GMT+12',
	    '-660,0': 'Pacific/Pago_Pago',
	    '-660,1,s': 'Pacific/Apia', // Why? Because windows... cry!
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
	    '-240,1,s': 'America/Asuncion',
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
	    '720,0': 'Pacific/Majuro',
	    '765,1,s': 'Pacific/Chatham',
	    '780,0': 'Pacific/Tongatapu',
	    '780,1,s': 'Pacific/Apia',
	    '840,0': 'Pacific/Kiritimati'
	};

	/* Build time: 2015-11-02 13:01:00Z Build by invoking python utilities/dst.py generate */
	jstz.olson.dst_rules = {
	    "years": [
	        2008,
	        2009,
	        2010,
	        2011,
	        2012,
	        2013,
	        2014
	    ],
	    "zones": [
	        {
	            "name": "Africa/Cairo",
	            "rules": [
	                {
	                    "e": 1219957200000,
	                    "s": 1209074400000
	                },
	                {
	                    "e": 1250802000000,
	                    "s": 1240524000000
	                },
	                {
	                    "e": 1285880400000,
	                    "s": 1284069600000
	                },
	                false,
	                false,
	                false,
	                {
	                    "e": 1411678800000,
	                    "s": 1406844000000
	                }
	            ]
	        },
	        {
	            "name": "Africa/Casablanca",
	            "rules": [
	                {
	                    "e": 1220223600000,
	                    "s": 1212278400000
	                },
	                {
	                    "e": 1250809200000,
	                    "s": 1243814400000
	                },
	                {
	                    "e": 1281222000000,
	                    "s": 1272758400000
	                },
	                {
	                    "e": 1312066800000,
	                    "s": 1301788800000
	                },
	                {
	                    "e": 1348970400000,
	                    "s": 1345428000000
	                },
	                {
	                    "e": 1382839200000,
	                    "s": 1376100000000
	                },
	                {
	                    "e": 1414288800000,
	                    "s": 1406944800000
	                }
	            ]
	        },
	        {
	            "name": "America/Asuncion",
	            "rules": [
	                {
	                    "e": 1205031600000,
	                    "s": 1224388800000
	                },
	                {
	                    "e": 1236481200000,
	                    "s": 1255838400000
	                },
	                {
	                    "e": 1270954800000,
	                    "s": 1286078400000
	                },
	                {
	                    "e": 1302404400000,
	                    "s": 1317528000000
	                },
	                {
	                    "e": 1333854000000,
	                    "s": 1349582400000
	                },
	                {
	                    "e": 1364094000000,
	                    "s": 1381032000000
	                },
	                {
	                    "e": 1395543600000,
	                    "s": 1412481600000
	                }
	            ]
	        },
	        {
	            "name": "America/Campo_Grande",
	            "rules": [
	                {
	                    "e": 1203217200000,
	                    "s": 1224388800000
	                },
	                {
	                    "e": 1234666800000,
	                    "s": 1255838400000
	                },
	                {
	                    "e": 1266721200000,
	                    "s": 1287288000000
	                },
	                {
	                    "e": 1298170800000,
	                    "s": 1318737600000
	                },
	                {
	                    "e": 1330225200000,
	                    "s": 1350792000000
	                },
	                {
	                    "e": 1361070000000,
	                    "s": 1382241600000
	                },
	                {
	                    "e": 1392519600000,
	                    "s": 1413691200000
	                }
	            ]
	        },
	        {
	            "name": "America/Goose_Bay",
	            "rules": [
	                {
	                    "e": 1225594860000,
	                    "s": 1205035260000
	                },
	                {
	                    "e": 1257044460000,
	                    "s": 1236484860000
	                },
	                {
	                    "e": 1289098860000,
	                    "s": 1268539260000
	                },
	                {
	                    "e": 1320555600000,
	                    "s": 1299988860000
	                },
	                {
	                    "e": 1352005200000,
	                    "s": 1331445600000
	                },
	                {
	                    "e": 1383454800000,
	                    "s": 1362895200000
	                },
	                {
	                    "e": 1414904400000,
	                    "s": 1394344800000
	                }
	            ]
	        },
	        {
	            "name": "America/Havana",
	            "rules": [
	                {
	                    "e": 1224997200000,
	                    "s": 1205643600000
	                },
	                {
	                    "e": 1256446800000,
	                    "s": 1236488400000
	                },
	                {
	                    "e": 1288501200000,
	                    "s": 1268542800000
	                },
	                {
	                    "e": 1321160400000,
	                    "s": 1300597200000
	                },
	                {
	                    "e": 1352005200000,
	                    "s": 1333256400000
	                },
	                {
	                    "e": 1383454800000,
	                    "s": 1362891600000
	                },
	                {
	                    "e": 1414904400000,
	                    "s": 1394341200000
	                }
	            ]
	        },
	        {
	            "name": "America/Mazatlan",
	            "rules": [
	                {
	                    "e": 1225008000000,
	                    "s": 1207472400000
	                },
	                {
	                    "e": 1256457600000,
	                    "s": 1238922000000
	                },
	                {
	                    "e": 1288512000000,
	                    "s": 1270371600000
	                },
	                {
	                    "e": 1319961600000,
	                    "s": 1301821200000
	                },
	                {
	                    "e": 1351411200000,
	                    "s": 1333270800000
	                },
	                {
	                    "e": 1382860800000,
	                    "s": 1365325200000
	                },
	                {
	                    "e": 1414310400000,
	                    "s": 1396774800000
	                }
	            ]
	        },
	        {
	            "name": "America/Mexico_City",
	            "rules": [
	                {
	                    "e": 1225004400000,
	                    "s": 1207468800000
	                },
	                {
	                    "e": 1256454000000,
	                    "s": 1238918400000
	                },
	                {
	                    "e": 1288508400000,
	                    "s": 1270368000000
	                },
	                {
	                    "e": 1319958000000,
	                    "s": 1301817600000
	                },
	                {
	                    "e": 1351407600000,
	                    "s": 1333267200000
	                },
	                {
	                    "e": 1382857200000,
	                    "s": 1365321600000
	                },
	                {
	                    "e": 1414306800000,
	                    "s": 1396771200000
	                }
	            ]
	        },
	        {
	            "name": "America/Miquelon",
	            "rules": [
	                {
	                    "e": 1225598400000,
	                    "s": 1205038800000
	                },
	                {
	                    "e": 1257048000000,
	                    "s": 1236488400000
	                },
	                {
	                    "e": 1289102400000,
	                    "s": 1268542800000
	                },
	                {
	                    "e": 1320552000000,
	                    "s": 1299992400000
	                },
	                {
	                    "e": 1352001600000,
	                    "s": 1331442000000
	                },
	                {
	                    "e": 1383451200000,
	                    "s": 1362891600000
	                },
	                {
	                    "e": 1414900800000,
	                    "s": 1394341200000
	                }
	            ]
	        },
	        {
	            "name": "America/Santa_Isabel",
	            "rules": [
	                {
	                    "e": 1225011600000,
	                    "s": 1207476000000
	                },
	                {
	                    "e": 1256461200000,
	                    "s": 1238925600000
	                },
	                {
	                    "e": 1288515600000,
	                    "s": 1270375200000
	                },
	                {
	                    "e": 1319965200000,
	                    "s": 1301824800000
	                },
	                {
	                    "e": 1351414800000,
	                    "s": 1333274400000
	                },
	                {
	                    "e": 1382864400000,
	                    "s": 1365328800000
	                },
	                {
	                    "e": 1414314000000,
	                    "s": 1396778400000
	                }
	            ]
	        },
	        {
	            "name": "America/Santiago",
	            "rules": [
	                {
	                    "e": 1206846000000,
	                    "s": 1223784000000
	                },
	                {
	                    "e": 1237086000000,
	                    "s": 1255233600000
	                },
	                {
	                    "e": 1270350000000,
	                    "s": 1286683200000
	                },
	                {
	                    "e": 1304823600000,
	                    "s": 1313899200000
	                },
	                {
	                    "e": 1335668400000,
	                    "s": 1346558400000
	                },
	                {
	                    "e": 1367118000000,
	                    "s": 1378612800000
	                },
	                {
	                    "e": 1398567600000,
	                    "s": 1410062400000
	                }
	            ]
	        },
	        {
	            "name": "America/Sao_Paulo",
	            "rules": [
	                {
	                    "e": 1203213600000,
	                    "s": 1224385200000
	                },
	                {
	                    "e": 1234663200000,
	                    "s": 1255834800000
	                },
	                {
	                    "e": 1266717600000,
	                    "s": 1287284400000
	                },
	                {
	                    "e": 1298167200000,
	                    "s": 1318734000000
	                },
	                {
	                    "e": 1330221600000,
	                    "s": 1350788400000
	                },
	                {
	                    "e": 1361066400000,
	                    "s": 1382238000000
	                },
	                {
	                    "e": 1392516000000,
	                    "s": 1413687600000
	                }
	            ]
	        },
	        {
	            "name": "Asia/Amman",
	            "rules": [
	                {
	                    "e": 1225404000000,
	                    "s": 1206655200000
	                },
	                {
	                    "e": 1256853600000,
	                    "s": 1238104800000
	                },
	                {
	                    "e": 1288303200000,
	                    "s": 1269554400000
	                },
	                {
	                    "e": 1319752800000,
	                    "s": 1301608800000
	                },
	                false,
	                false,
	                {
	                    "e": 1414706400000,
	                    "s": 1395957600000
	                }
	            ]
	        },
	        {
	            "name": "Asia/Damascus",
	            "rules": [
	                {
	                    "e": 1225486800000,
	                    "s": 1207260000000
	                },
	                {
	                    "e": 1256850000000,
	                    "s": 1238104800000
	                },
	                {
	                    "e": 1288299600000,
	                    "s": 1270159200000
	                },
	                {
	                    "e": 1319749200000,
	                    "s": 1301608800000
	                },
	                {
	                    "e": 1351198800000,
	                    "s": 1333058400000
	                },
	                {
	                    "e": 1382648400000,
	                    "s": 1364508000000
	                },
	                {
	                    "e": 1414702800000,
	                    "s": 1395957600000
	                }
	            ]
	        },
	        {
	            "name": "Asia/Dubai",
	            "rules": [
	                false,
	                false,
	                false,
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Gaza",
	            "rules": [
	                {
	                    "e": 1219957200000,
	                    "s": 1206655200000
	                },
	                {
	                    "e": 1252015200000,
	                    "s": 1238104800000
	                },
	                {
	                    "e": 1281474000000,
	                    "s": 1269640860000
	                },
	                {
	                    "e": 1312146000000,
	                    "s": 1301608860000
	                },
	                {
	                    "e": 1348178400000,
	                    "s": 1333058400000
	                },
	                {
	                    "e": 1380229200000,
	                    "s": 1364508000000
	                },
	                {
	                    "e": 1414098000000,
	                    "s": 1395957600000
	                }
	            ]
	        },
	        {
	            "name": "Asia/Irkutsk",
	            "rules": [
	                {
	                    "e": 1224957600000,
	                    "s": 1206813600000
	                },
	                {
	                    "e": 1256407200000,
	                    "s": 1238263200000
	                },
	                {
	                    "e": 1288461600000,
	                    "s": 1269712800000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Jerusalem",
	            "rules": [
	                {
	                    "e": 1223161200000,
	                    "s": 1206662400000
	                },
	                {
	                    "e": 1254006000000,
	                    "s": 1238112000000
	                },
	                {
	                    "e": 1284246000000,
	                    "s": 1269561600000
	                },
	                {
	                    "e": 1317510000000,
	                    "s": 1301616000000
	                },
	                {
	                    "e": 1348354800000,
	                    "s": 1333065600000
	                },
	                {
	                    "e": 1382828400000,
	                    "s": 1364515200000
	                },
	                {
	                    "e": 1414278000000,
	                    "s": 1395964800000
	                }
	            ]
	        },
	        {
	            "name": "Asia/Kamchatka",
	            "rules": [
	                {
	                    "e": 1224943200000,
	                    "s": 1206799200000
	                },
	                {
	                    "e": 1256392800000,
	                    "s": 1238248800000
	                },
	                {
	                    "e": 1288450800000,
	                    "s": 1269698400000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Krasnoyarsk",
	            "rules": [
	                {
	                    "e": 1224961200000,
	                    "s": 1206817200000
	                },
	                {
	                    "e": 1256410800000,
	                    "s": 1238266800000
	                },
	                {
	                    "e": 1288465200000,
	                    "s": 1269716400000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Omsk",
	            "rules": [
	                {
	                    "e": 1224964800000,
	                    "s": 1206820800000
	                },
	                {
	                    "e": 1256414400000,
	                    "s": 1238270400000
	                },
	                {
	                    "e": 1288468800000,
	                    "s": 1269720000000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Vladivostok",
	            "rules": [
	                {
	                    "e": 1224950400000,
	                    "s": 1206806400000
	                },
	                {
	                    "e": 1256400000000,
	                    "s": 1238256000000
	                },
	                {
	                    "e": 1288454400000,
	                    "s": 1269705600000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Yakutsk",
	            "rules": [
	                {
	                    "e": 1224954000000,
	                    "s": 1206810000000
	                },
	                {
	                    "e": 1256403600000,
	                    "s": 1238259600000
	                },
	                {
	                    "e": 1288458000000,
	                    "s": 1269709200000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Yekaterinburg",
	            "rules": [
	                {
	                    "e": 1224968400000,
	                    "s": 1206824400000
	                },
	                {
	                    "e": 1256418000000,
	                    "s": 1238274000000
	                },
	                {
	                    "e": 1288472400000,
	                    "s": 1269723600000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Asia/Yerevan",
	            "rules": [
	                {
	                    "e": 1224972000000,
	                    "s": 1206828000000
	                },
	                {
	                    "e": 1256421600000,
	                    "s": 1238277600000
	                },
	                {
	                    "e": 1288476000000,
	                    "s": 1269727200000
	                },
	                {
	                    "e": 1319925600000,
	                    "s": 1301176800000
	                },
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Australia/Lord_Howe",
	            "rules": [
	                {
	                    "e": 1207407600000,
	                    "s": 1223134200000
	                },
	                {
	                    "e": 1238857200000,
	                    "s": 1254583800000
	                },
	                {
	                    "e": 1270306800000,
	                    "s": 1286033400000
	                },
	                {
	                    "e": 1301756400000,
	                    "s": 1317483000000
	                },
	                {
	                    "e": 1333206000000,
	                    "s": 1349537400000
	                },
	                {
	                    "e": 1365260400000,
	                    "s": 1380987000000
	                },
	                {
	                    "e": 1396710000000,
	                    "s": 1412436600000
	                }
	            ]
	        },
	        {
	            "name": "Australia/Perth",
	            "rules": [
	                {
	                    "e": 1206813600000,
	                    "s": 1224957600000
	                },
	                false,
	                false,
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Europe/Helsinki",
	            "rules": [
	                {
	                    "e": 1224982800000,
	                    "s": 1206838800000
	                },
	                {
	                    "e": 1256432400000,
	                    "s": 1238288400000
	                },
	                {
	                    "e": 1288486800000,
	                    "s": 1269738000000
	                },
	                {
	                    "e": 1319936400000,
	                    "s": 1301187600000
	                },
	                {
	                    "e": 1351386000000,
	                    "s": 1332637200000
	                },
	                {
	                    "e": 1382835600000,
	                    "s": 1364691600000
	                },
	                {
	                    "e": 1414285200000,
	                    "s": 1396141200000
	                }
	            ]
	        },
	        {
	            "name": "Europe/Minsk",
	            "rules": [
	                {
	                    "e": 1224979200000,
	                    "s": 1206835200000
	                },
	                {
	                    "e": 1256428800000,
	                    "s": 1238284800000
	                },
	                {
	                    "e": 1288483200000,
	                    "s": 1269734400000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Europe/Moscow",
	            "rules": [
	                {
	                    "e": 1224975600000,
	                    "s": 1206831600000
	                },
	                {
	                    "e": 1256425200000,
	                    "s": 1238281200000
	                },
	                {
	                    "e": 1288479600000,
	                    "s": 1269730800000
	                },
	                false,
	                false,
	                false,
	                false
	            ]
	        },
	        {
	            "name": "Pacific/Apia",
	            "rules": [
	                false,
	                false,
	                false,
	                {
	                    "e": 1301752800000,
	                    "s": 1316872800000
	                },
	                {
	                    "e": 1333202400000,
	                    "s": 1348927200000
	                },
	                {
	                    "e": 1365256800000,
	                    "s": 1380376800000
	                },
	                {
	                    "e": 1396706400000,
	                    "s": 1411826400000
	                }
	            ]
	        },
	        {
	            "name": "Pacific/Fiji",
	            "rules": [
	                false,
	                false,
	                {
	                    "e": 1269698400000,
	                    "s": 1287842400000
	                },
	                {
	                    "e": 1327154400000,
	                    "s": 1319292000000
	                },
	                {
	                    "e": 1358604000000,
	                    "s": 1350741600000
	                },
	                {
	                    "e": 1390050000000,
	                    "s": 1382796000000
	                },
	                {
	                    "e": 1421503200000,
	                    "s": 1414850400000
	                }
	            ]
	        },
	        {
	            "name": "Europe/London",
	            "rules": [
	                {
	                    "e": 1224982800000,
	                    "s": 1206838800000
	                },
	                {
	                    "e": 1256432400000,
	                    "s": 1238288400000
	                },
	                {
	                    "e": 1288486800000,
	                    "s": 1269738000000
	                },
	                {
	                    "e": 1319936400000,
	                    "s": 1301187600000
	                },
	                {
	                    "e": 1351386000000,
	                    "s": 1332637200000
	                },
	                {
	                    "e": 1382835600000,
	                    "s": 1364691600000
	                },
	                {
	                    "e": 1414285200000,
	                    "s": 1396141200000
	                }
	            ]
	        }
	    ]
	};
	{
	    module.exports = jstz;
	}
	}());
	});

	var tz = jstz.determine(),
	    windowAlias = window,
	    navigatorAlias = navigator,
	    screenAlias = screen,
	    documentAlias = document;
	/**
	 * Checks whether sessionStorage is available, in a way that
	 * does not throw a SecurityError in Firefox if "always ask"
	 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
	 *
	 * @returns {Boolean} - true if user agent supports sessionStorage
	 */

	var hasSessionStorage = function hasSessionStorage() {
	  try {
	    return !!windowAlias.sessionStorage;
	  } catch (e) {
	    return true; // SecurityError when referencing it means it exists
	  }
	};
	/**
	 * Checks whether localStorage is available, in a way that
	 * does not throw a SecurityError in Firefox if "always ask"
	 * is enabled for cookies (https://github.com/snowplow/snowplow/issues/163).
	 *
	 * @returns {Boolean} - true if user agent supports localStorage
	 */

	var hasLocalStorage = function hasLocalStorage() {
	  try {
	    return !!windowAlias.localStorage;
	  } catch (e) {
	    return true; // SecurityError when referencing it means it exists
	  }
	};
	/**
	 * Checks whether localStorage is accessible
	 * sets and removes an item to handle private IOS5 browsing
	 * (http://git.io/jFB2Xw)
	 *
	 * @returns {Boolean} - true if localStorage is accessible
	 */

	var localStorageAccessible = function localStorageAccessible() {
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
	};
	/**
	 * Does browser have cookies enabled (for this site)?
	 *
	 * @returns {Boolran} - true if the cookies are enabled
	 */

	var hasCookies = function hasCookies(testCookieName) {
	  var cookieName = testCookieName || 'testcookie';

	  if (navigatorAlias.cookieEnabled === undefined) {
	    browserCookieLite.cookie(cookieName, '1');
	    return browserCookieLite.cookie(cookieName) === '1' ? '1' : '0';
	  }

	  return navigatorAlias.cookieEnabled ? '1' : '0';
	};
	/**
	 * JS Implementation for browser fingerprint.
	 * Does not require any external resources.
	 * Based on https://github.com/carlo/jquery-browser-fingerprint
	 *
	 * @returns {number} 32-bit positive integer hash
	 */

	var detectSignature = function detectSignature(hashSeed) {
	  var fingerprint = [navigatorAlias.userAgent, [screenAlias.height, screenAlias.width, screenAlias.colorDepth].join('x'), new Date().getTimezoneOffset(), hasSessionStorage(), hasLocalStorage()];
	  var plugins = [];

	  if (navigatorAlias.plugins) {
	    for (var i = 0; i < navigatorAlias.plugins.length; i++) {
	      if (navigatorAlias.plugins[i]) {
	        var mt = [];

	        for (var j = 0; j < navigatorAlias.plugins[i].length; j++) {
	          mt.push([navigatorAlias.plugins[i][j].type, navigatorAlias.plugins[i][j].suffixes]);
	        }

	        plugins.push([navigatorAlias.plugins[i].name + '::' + navigatorAlias.plugins[i].description, mt.join('~')]);
	      }
	    }
	  }

	  return murmurhash_1(fingerprint.join('###') + '###' + plugins.sort().join(';'), hashSeed);
	};
	/**
	 * Returns visitor timezone
	 *
	 * @returns {String} - the visitors timezone
	 */

	var detectTimezone = function detectTimezone() {
	  tz ? tz.name() : '';
	};
	/**
	 * Gets the current viewport.
	 *
	 * Code based on:
	 * - http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
	 * - http://responsejs.com/labs/dimensions/
	 *
	 * @returns {String|null} - the current viewport in the format width x height or null
	 */

	var detectViewport = function detectViewport() {
	  var e = windowAlias,
	      a = 'inner';

	  if (!('innerWidth' in windowAlias)) {
	    a = 'client';
	    e = documentAlias.documentElement || documentAlias.body;
	  }

	  var width = e[a + 'Width'];
	  var height = e[a + 'Height'];

	  if (width >= 0 && height >= 0) {
	    return "".concat(width, "x").concat(height);
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
	 *
	 * @returns {String} - the current document size in the format width x height or empty string
	 */

	var detectDocumentSize = function detectDocumentSize() {
	  var de = documentAlias.documentElement,
	      // Alias
	  be = documentAlias.body,
	      // document.body may not have rendered, so check whether be.offsetHeight is null
	  bodyHeight = be ? Math.max(be.offsetHeight, be.scrollHeight) : 0;
	  var w = Math.max(de.clientWidth, de.offsetWidth, de.scrollWidth);
	  var h = Math.max(de.clientHeight, de.offsetHeight, de.scrollHeight, bodyHeight);
	  return isNaN(w) || isNaN(h) ? '' : "".concat(w, "x").concat(h);
	};
	/**
	 * Returns browser features (plugins, resolution, cookies)
	 *
	 * @param {Boolean} useCookies - Whether to test for cookies
	 * @param {String} testCookieName - Name to use for the test cookie
	 * @returns {Object} - object containing browser features
	 */

	var detectBrowserFeatures = function detectBrowserFeatures(useCookies, testCookieName) {
	  var i, mimeType;
	  var pluginMap = {
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


	  if (navigatorAlias.constructor === window.Navigator && _typeof(navigatorAlias.javaEnabled) !== undefined && navigatorAlias.javaEnabled !== undefined && navigatorAlias.javaEnabled()) {
	    features.java = '1';
	  } // Firefox


	  if (typeof windowAlias.GearsFactory == 'function') {
	    features.gears = '1';
	  } // Other browser features


	  features.res = screenAlias.width + 'x' + screenAlias.height;
	  features.cd = screenAlias.colorDepth;

	  if (useCookies) {
	    features.cookie = hasCookies(testCookieName);
	  }

	  return features;
	};

	var crypt = createCommonjsModule(function (module) {
	(function() {
	  var base64map
	      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

	  crypt = {
	    // Bit-wise rotation left
	    rotl: function(n, b) {
	      return (n << b) | (n >>> (32 - b));
	    },

	    // Bit-wise rotation right
	    rotr: function(n, b) {
	      return (n << (32 - b)) | (n >>> b);
	    },

	    // Swap big-endian to little-endian and vice versa
	    endian: function(n) {
	      // If number given, swap endian
	      if (n.constructor == Number) {
	        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
	      }

	      // Else, assume array and swap all items
	      for (var i = 0; i < n.length; i++)
	        n[i] = crypt.endian(n[i]);
	      return n;
	    },

	    // Generate an array of any length of random bytes
	    randomBytes: function(n) {
	      for (var bytes = []; n > 0; n--)
	        bytes.push(Math.floor(Math.random() * 256));
	      return bytes;
	    },

	    // Convert a byte array to big-endian 32-bit words
	    bytesToWords: function(bytes) {
	      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
	        words[b >>> 5] |= bytes[i] << (24 - b % 32);
	      return words;
	    },

	    // Convert big-endian 32-bit words to a byte array
	    wordsToBytes: function(words) {
	      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
	        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	      return bytes;
	    },

	    // Convert a byte array to a hex string
	    bytesToHex: function(bytes) {
	      for (var hex = [], i = 0; i < bytes.length; i++) {
	        hex.push((bytes[i] >>> 4).toString(16));
	        hex.push((bytes[i] & 0xF).toString(16));
	      }
	      return hex.join('');
	    },

	    // Convert a hex string to a byte array
	    hexToBytes: function(hex) {
	      for (var bytes = [], c = 0; c < hex.length; c += 2)
	        bytes.push(parseInt(hex.substr(c, 2), 16));
	      return bytes;
	    },

	    // Convert a byte array to a base-64 string
	    bytesToBase64: function(bytes) {
	      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
	        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
	        for (var j = 0; j < 4; j++)
	          if (i * 8 + j * 6 <= bytes.length * 8)
	            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
	          else
	            base64.push('=');
	      }
	      return base64.join('');
	    },

	    // Convert a base-64 string to a byte array
	    base64ToBytes: function(base64) {
	      // Remove non-base-64 characters
	      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

	      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
	          imod4 = ++i % 4) {
	        if (imod4 == 0) continue;
	        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
	            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
	            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
	      }
	      return bytes;
	    }
	  };

	  module.exports = crypt;
	})();
	});

	var charenc = {
	  // UTF-8 encoding
	  utf8: {
	    // Convert a string to a byte array
	    stringToBytes: function(str) {
	      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
	    },

	    // Convert a byte array to a string
	    bytesToString: function(bytes) {
	      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
	    }
	  },

	  // Binary encoding
	  bin: {
	    // Convert a string to a byte array
	    stringToBytes: function(str) {
	      for (var bytes = [], i = 0; i < str.length; i++)
	        bytes.push(str.charCodeAt(i) & 0xFF);
	      return bytes;
	    },

	    // Convert a byte array to a string
	    bytesToString: function(bytes) {
	      for (var str = [], i = 0; i < bytes.length; i++)
	        str.push(String.fromCharCode(bytes[i]));
	      return str.join('');
	    }
	  }
	};

	var charenc_1 = charenc;

	var sha1 = createCommonjsModule(function (module) {
	(function() {
	  var crypt$$1 = crypt,
	      utf8 = charenc_1.utf8,
	      bin = charenc_1.bin,

	  // The core
	  sha1 = function (message) {
	    // Convert to byte array
	    if (message.constructor == String)
	      message = utf8.stringToBytes(message);
	    // otherwise assume byte array

	    var m  = crypt$$1.bytesToWords(message),
	        l  = message.length * 8,
	        w  = [],
	        H0 =  1732584193,
	        H1 = -271733879,
	        H2 = -1732584194,
	        H3 =  271733878,
	        H4 = -1009589776;

	    // Padding
	    m[l >> 5] |= 0x80 << (24 - l % 32);
	    m[((l + 64 >>> 9) << 4) + 15] = l;

	    for (var i = 0; i < m.length; i += 16) {
	      var a = H0,
	          b = H1,
	          c = H2,
	          d = H3,
	          e = H4;

	      for (var j = 0; j < 80; j++) {

	        if (j < 16)
	          w[j] = m[i + j];
	        else {
	          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
	          w[j] = (n << 1) | (n >>> 31);
	        }

	        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
	                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
	                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
	                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
	                         (H1 ^ H2 ^ H3) - 899497514);

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
	  api = function (message, options) {
	    var digestbytes = crypt$$1.wordsToBytes(sha1(message));
	    return options && options.asBytes ? digestbytes :
	        options && options.asString ? bin.bytesToString(digestbytes) :
	        crypt$$1.bytesToHex(digestbytes);
	  };

	  api._blocksize = 16;
	  api._digestsize = 20;

	  module.exports = api;
	})();
	});

	var SPECIES$1 = _wks('species');

	var _arraySpeciesConstructor = function (original) {
	  var C;
	  if (_isArray(original)) {
	    C = original.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
	    if (_isObject(C)) {
	      C = C[SPECIES$1];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


	var _arraySpeciesCreate = function (original, length) {
	  return new (_arraySpeciesConstructor(original))(length);
	};

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex





	var _arrayMethods = function (TYPE, $create) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  var create = $create || _arraySpeciesCreate;
	  return function ($this, callbackfn, that) {
	    var O = _toObject($this);
	    var self = _iobject(O);
	    var f = _ctx(callbackfn, that, 3);
	    var length = _toLength(self.length);
	    var index = 0;
	    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var val, res;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      val = self[index];
	      res = f(val, index, O);
	      if (TYPE) {
	        if (IS_MAP) result[index] = res;   // map
	        else if (res) switch (TYPE) {
	          case 3: return true;             // some
	          case 5: return val;              // find
	          case 6: return index;            // findIndex
	          case 2: result.push(val);        // filter
	        } else if (IS_EVERY) return false; // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

	// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

	var $find = _arrayMethods(5);
	var KEY = 'find';
	var forced = true;
	// Shouldn't skip holes
	if (KEY in []) Array(1)[KEY](function () { forced = false; });
	_export(_export.P + _export.F * forced, 'Array', {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	_addToUnscopables(KEY);

	var getFormElementName = Symbol('getFormElementName');
	var getParentFormName = Symbol('getParentFormName');
	var getInnerFormElements = Symbol('getInnerFormElements');
	var getFormChangeListener = Symbol('getFormChangeListener');
	var getFormSubmissionListener = Symbol('getFormSubmissionListener');
	/**
	 * @class FormTrackingManager
	 */

	var FormTrackingManager =
	/*#__PURE__*/
	function () {
	  /**
	   * Object for handling automatic form tracking
	   *
	   * @param {Object} core - The tracker core
	   * @param {String} trackerId - Unique identifier for the tracker instance, used to mark tracked elements
	   * @param {Function} contextAdder - Function to add common contexts like PerformanceTiming to all events
	   * @returns {FormTrackingManager} - FormTrackingManager instance
	   */
	  function FormTrackingManager(core, trackerId, contextAdder) {
	    _classCallCheck(this, FormTrackingManager);

	    this.core = core;
	    this.trackerId = trackerId;
	    this.contextAdder = contextAdder;
	    this.innerElementTags = ['textarea', 'input', 'select'];
	    this.propNames = ['name', 'id', 'type', 'nodeName'];
	    this.trackingMarker = "".concat(trackerId, "form");
	    /**
	     * Filter to determine which forms should be tracked
	     */

	    this.formFilter = function () {
	    };
	    /**
	     * Filter to determine which form fields should be tracked
	     */


	    this.fieldFilter = function () {
	    };
	    /**
	     *  Default function applied to all elements, optionally overridden by transform field
	     *
	     * @param {any} x
	     */


	    this.fieldTransform = function (x) {
	    };
	  }
	  /**
	   *
	   * Private Methods
	   *
	   */

	  /**
	   * Get an identifier for a form, input, textarea, or select element
	   *
	   * @param {HTMLElement} elt - HTMLElement to identify
	   * @returns {String} - the identifier
	   */


	  _createClass(FormTrackingManager, [{
	    key: getFormElementName,
	    value: function value(elt) {
	      return elt[this.propNames.find(function (propName) {
	        // If elt has a child whose name is "id", that element will be returned
	        // instead of the actual id of elt unless we ensure that a string is returned
	        return elt[propName] && typeof elt[propName] === 'string';
	      })];
	    }
	    /**
	     * Identifies the parent form in which an element is contained
	     *
	     * @param {HTMLElement} elt - HTMLElement to check
	     * @returns {String} - the identifier
	     */

	  }, {
	    key: getParentFormName,
	    value: function value(elt) {
	      while (elt && elt.nodeName && elt.nodeName.toUpperCase() !== 'HTML' && elt.nodeName.toUpperCase() !== 'FORM') {
	        elt = elt.parentNode;
	      }

	      if (elt && elt.nodeName && elt.nodeName.toUpperCase() === 'FORM') {
	        return this[getFormElementName](elt);
	      }
	    }
	    /**
	     * Returns a list of the input, textarea, and select elements inside a form along with their values
	     *
	     * @param {HTMLElement} elt - parent HTMLElement to get form inputs for
	     * @returns {HTMLElement[]} - Array of HTMLElements contained in the parent
	     */

	  }, {
	    key: getInnerFormElements,
	    value: function value(elt) {
	      var _this = this;

	      var innerElements = [];
	      this.innerElementTags.forEach(function (tagname) {
	        var trackedChildren = elt.getElementsByTagName(tagname).filter(function (child) {
	          return child.hasOwnProperty(_this.trackingMarker);
	        });
	        trackedChildren.forEach(function (child) {
	          if (child.type === 'submit') {
	            return;
	          }

	          var elementJson = {
	            name: _this[getFormElementName](child),
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
	    /**
	     * Return function to handle form field change event
	     *
	     * @param {Object} context - dynamic context object
	     * @returns {Function} - the handler for the field change event
	     */

	  }, {
	    key: getFormChangeListener,
	    value: function value(context) {
	      var _this2 = this;

	      return function (e) {
	        var elt = e.target;
	        var type = elt.nodeName && elt.nodeName.toUpperCase() === 'INPUT' ? elt.type : null;
	        var value = elt.type === 'checkbox' && !elt.checked ? null : _this2.fieldTransform(elt.value);

	        _this2.core.trackFormChange(_this2[getParentFormName](elt), _this2[getFormElementName](elt), elt.nodeName, type, getCssClasses(elt), value, _this2.contextAdder(resolveDynamicContexts(context, elt, type, value)));
	      };
	    }
	    /**
	     * Return function to handle form submission event
	     *
	     * @param {Object} context  - dynamic context object
	     * @returns {Function} - the handler for the form submission event
	     */

	  }, {
	    key: getFormSubmissionListener,
	    value: function value(context) {
	      var _this3 = this;

	      return function (e) {
	        var elt = e.target;

	        var innerElements = _this3[getInnerFormElements](elt);

	        innerElements.forEach(function (innerElement) {
	          innerElement.value = _this3.fieldTransform(innerElement.value);
	        });

	        _this3.core.trackFormSubmission(_this3[getFormElementName](elt), getCssClasses(elt), innerElements, _this3.contextAdder(resolveDynamicContexts(context, elt, innerElements)));
	      };
	    }
	    /**
	     *
	     * Public Methods
	     *
	     */

	    /**
	     * Configures form tracking: which forms and fields will be tracked, and the context to attach
	     * @param {Object} config - the configuration options object
	     */

	  }, {
	    key: "configureFormTracking",
	    value: function configureFormTracking(config) {
	      if (config) {
	        this.formFilter = getFilter(config.forms, true);
	        this.fieldFilter = getFilter(config.fields, false);
	        this.fieldTransform = getTransform(config.fields);
	      }
	    }
	    /**
	     * Add submission event listeners to all form elements
	     * Add value change event listeners to all mutable inner form elements
	     *
	     * @param {Object} context - dynamic context object
	     */

	  }, {
	    key: "addFormListeners",
	    value: function addFormListeners(context) {
	      var _this4 = this;

	      Array.prototype.forEach.call(document.getElementsByTagName('form'), function (form) {
	        window.console.log(form);
	        window.console.log(_this4.innerElementTags);
	        window.console.log(_this4.formFilter);
	        window.console.log(_this4.formFilter(form));

	        if (_this4.formFilter(form) && !form[_this4.trackingMarker]) {
	          _this4.innerElementTags.forEach(function (tagname) {
	            window.console.log(tagname);
	            Array.prototype.forEach.call(form.getElementsByTagName(tagname), function (innerElement) {
	              window.console.log(innerElement);

	              if (_this4.fieldFilter(innerElement) && !innerElement[_this4.trackingMarker] && innerElement.type.toLowerCase() !== 'password') {
	                addEventListener(innerElement, 'change', _this4[getFormChangeListener](context), false);
	                innerElement[_this4.trackingMarker] = true;
	              }
	            });
	          });

	          addEventListener(form, 'submit', _this4[getFormSubmissionListener](context));
	          form[_this4.trackingMarker] = true;
	        }
	      });
	    }
	  }]);

	  return FormTrackingManager;
	}();

	var windowAlias$1 = window;
	/**
	 * @class ErrorManager
	 */

	var ErrorManager =
	/*#__PURE__*/
	function () {
	  /**
	   * Creates a new ErrorManager object.
	   *
	   * @param {trackerCore} core  - the Snowplow trackerCore object to use.
	   * @returns {ErrorManager} - an instance of the ErrorManager class
	   */
	  function ErrorManager(core) {
	    _classCallCheck(this, ErrorManager);

	    this.core = core;
	  }
	  /**
	   * Send error as self-describing event
	   *
	   * @param {String} message - Message appeared in console
	   * @param {String} filename - Source file (not used)
	   * @param {Number} lineno - Line number
	   * @param {Number} colno  - Column number (not used)
	   * @param {Error} error - error object (not present in all browsers)
	   * @param {Object[]} contexts - Array of custom contexts
	   */


	  _createClass(ErrorManager, [{
	    key: "track",
	    value: function track(message, filename, lineno, colno, error, contexts) {
	      var stack = error && error.stack ? error.stack : null;
	      this.core.trackSelfDescribingEvent({
	        schema: 'iglu:com.snowplowanalytics.snowplow/application_error/jsonschema/1-0-1',
	        data: {
	          programmingLanguage: 'JAVASCRIPT',
	          message: message || 'JS Exception. Browser doesn\'t support ErrorEvent API',
	          stackTrace: stack,
	          lineNumber: lineno,
	          lineColumn: colno,
	          fileName: filename
	        }
	      }, contexts);
	    }
	    /**
	     * Sends an error as a self describing event.
	     * Attach custom contexts using `contextAdder`
	     *
	     * @param {Event} errorEvent - Error event to send.
	     * @param {Object[]} commonContexts  - Array of custom contexts
	     * @param {Function} contextsAdder - function to get details from internal browser state
	     */

	  }, {
	    key: "sendError",
	    value: function sendError(errorEvent, commonContexts, contextsAdder) {
	      var contexts;

	      if (isFunction(contextsAdder)) {
	        contexts = commonContexts.concat(contextsAdder(errorEvent));
	      } else {
	        contexts = commonContexts;
	      }

	      this.track(errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error, contexts);
	    }
	    /**
	     * Curried function to enable tracking of unhandled exceptions.
	     * Listen for `error` event and send to tracker.
	     *
	     * @param {Function} filter - ErrorEvent => Bool to check whether error should be tracked
	     * @param {Function} contextsAdder - ErrorEvent => Array<Context> to add custom contexts with internal state based on particular error
	     * @param {Object[]} contexts - Array of custtom contexts
	     */

	  }, {
	    key: "enableErrorTracking",
	    value: function enableErrorTracking(filter, contextsAdder, contexts) {
	      /**
	       * Closure callback to filter, contextualize and track unhandled exceptions
	       * @param {ErrorEvent} errorEvent - ErrorEvent passed to event listener
	       */
	      function captureError(errorEvent) {
	        if (isFunction(filter) && filter(errorEvent) || filter == null) {
	          this.sendError(errorEvent, contexts, contextsAdder);
	        }
	      }

	      addEventListener(windowAlias$1, 'error', captureError, true);
	    }
	    /**
	     * Track unhandled exception.
	     * This method supposed to be used inside try/catch block or with window.onerror
	     * (contexts won't be attached), but NOT with `addEventListener` - use
	     * `enableErrorTracker` for this
	     *
	     * @param {String} message - Message appeared in console
	     * @param {String} filename - Source file (not used)
	     * @param {Number} lineno - Line number
	     * @param {Number} colno - Column number (not used)
	     * @param {Error} error - error object (not present in all browsers)
	     * @param {Object[]} contexts - Array of custom contexts
	     */

	  }, {
	    key: "trackError",
	    value: function trackError(message, filename, lineno, colno, error, contexts) {
	      return this.track(message, filename, lineno, colno, error, contexts);
	    }
	  }]);

	  return ErrorManager;
	}();

	var ManagedError =
	/*#__PURE__*/
	function (_Error) {
	  _inherits(ManagedError, _Error);

	  function ManagedError(message) {
	    var _this;

	    _classCallCheck(this, ManagedError);

	    _this = _possibleConstructorReturn(this, _getPrototypeOf(ManagedError).call(this, message));
	    _this.message = message;
	    return _this;
	  }

	  return ManagedError;
	}(_wrapNativeSuper(Error));

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

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
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

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
	var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
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
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

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

	var defineProperty$1 = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

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
	  if (key == '__proto__' && defineProperty$1) {
	    defineProperty$1(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
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

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

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
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty$3.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
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

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

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
	  var type = typeof value;
	  length = length == null ? MAX_SAFE_INTEGER : length;

	  return !!length &&
	    (type == 'number' ||
	      (type != 'symbol' && reIsUint.test(value))) &&
	        (value > -1 && value % 1 == 0 && value < length);
	}

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
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
	}

	/** `Object#toString` result references. */
	var argsTag$1 = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag$1 = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag$1 = '[object String]',
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
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag$1] =
	typedArrayTags[weakMapTag] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	/** Detect free variable `exports`. */
	var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports$1 && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    // Use `util.types` for Node.js 10+.
	    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

	    if (types) {
	      return types;
	    }

	    // Legacy `process.binding('util')` for Node.js < 10.
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

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

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

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
	    if ((inherited || hasOwnProperty$4.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

	  return value === proto;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

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
	    if (hasOwnProperty$5.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

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
	function keys$1(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys$1);
	}

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
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}

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

	/* Built-in method references that are verified to be native. */
	var Map$1 = getNative(root, 'Map');

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

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

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto$7 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

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
	  return hasOwnProperty$6.call(data, key) ? data[key] : undefined;
	}

	/** Used for built-in method references. */
	var objectProto$8 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

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
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$7.call(data, key);
	}

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
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
	  return this;
	}

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
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

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
	    'hash': new Hash,
	    'map': new (Map$1 || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

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
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

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
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

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
	    if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
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
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

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

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

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
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
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
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	/** Built-in value references. */
	var Uint8Array$1 = root.Uint8Array;

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

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

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

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$1 = 1,
	    COMPARE_UNORDERED_FLAG$1 = 2;

	/** `Object#toString` result references. */
	var boolTag$1 = '[object Boolean]',
	    dateTag$1 = '[object Date]',
	    errorTag$1 = '[object Error]',
	    mapTag$1 = '[object Map]',
	    numberTag$1 = '[object Number]',
	    regexpTag$1 = '[object RegExp]',
	    setTag$1 = '[object Set]',
	    stringTag$2 = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag$1 = '[object ArrayBuffer]',
	    dataViewTag$1 = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
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
	    case dataViewTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag$1:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
	        return false;
	      }
	      return true;

	    case boolTag$1:
	    case dateTag$1:
	    case numberTag$1:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag$1:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag$1:
	    case stringTag$2:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag$1:
	      var convert = mapToArray;

	    case setTag$1:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG$1;

	      // Recursively compare objects (susceptible to call stack limits).
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

	/** Used for built-in method references. */
	var objectProto$9 = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable$1.call(object, symbol);
	  });
	};

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys$1, getSymbols);
	}

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$2 = 1;

	/** Used for built-in method references. */
	var objectProto$a = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

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
	    if (!(isPartial ? key in other : hasOwnProperty$8.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
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
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	/* Built-in method references that are verified to be native. */
	var Promise$1 = getNative(root, 'Promise');

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	/** `Object#toString` result references. */
	var mapTag$2 = '[object Map]',
	    objectTag$1 = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag$2 = '[object Set]',
	    weakMapTag$1 = '[object WeakMap]';

	var dataViewTag$2 = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map$1),
	    promiseCtorString = toSource(Promise$1),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
	    (Map$1 && getTag(new Map$1) != mapTag$2) ||
	    (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag$2) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag$1 ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag$2;
	        case mapCtorString: return mapTag$2;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag$2;
	        case weakMapCtorString: return weakMapTag$1;
	      }
	    }
	    return result;
	  };
	}

	var getTag$1 = getTag;

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG$3 = 1;

	/** `Object#toString` result references. */
	var argsTag$2 = '[object Arguments]',
	    arrayTag$1 = '[object Array]',
	    objectTag$2 = '[object Object]';

	/** Used for built-in method references. */
	var objectProto$b = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

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
	      objTag = objIsArr ? arrayTag$1 : getTag$1(object),
	      othTag = othIsArr ? arrayTag$1 : getTag$1(other);

	  objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
	  othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

	  var objIsObj = objTag == objectTag$2,
	      othIsObj = othTag == objectTag$2,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
	    var objIsWrapped = objIsObj && hasOwnProperty$9.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty$9.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

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
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

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
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
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
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

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

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys$1(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}

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
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

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
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

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
	function isSymbol$1(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && baseGetTag(value) == symbolTag$1);
	}

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
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol$1(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
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
	  var memoized = function() {
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
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize.Cache = MapCache;

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
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

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
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (string.charCodeAt(0) === 46 /* . */) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, subString) {
	    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

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

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
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
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol$1(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

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
	function toString$2(value) {
	  return value == null ? '' : baseToString(value);
	}

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
	  return isKey(value, object) ? [value] : stringToPath(toString$2(value));
	}

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
	  if (typeof value == 'string' || isSymbol$1(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
	}

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
	  return (index && index == length) ? object : undefined;
	}

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
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}

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
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
	  };
	}

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

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

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
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

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

	  baseForOwn(object, function(value, key, object) {
	    baseAssignValue(result, key, iteratee(value, key, object));
	  });
	  return result;
	}

	var getQuerystring = Symbol('getQuerystring');
	var getBody = Symbol('getBody');
	var getUTF8Length = Symbol('getUTF8Length');
	var initializeXMLHttpRequest = Symbol('initializeXMLHttpRequest');
	var encloseInPayloadDataEnvelope = Symbol('encloseInPayloadDataEnvelope');
	var attachStmToEvent = Symbol('attachStmToEvent');

	var OutQueueManager =
	/*#__PURE__*/
	function () {
	  /**
	   * Object handling sending events to a collector.
	   * Instantiated once per tracker instance.
	   *
	   * @param {String} functionName - The Snowplow function name (used to generate the localStorage key)
	   * @param {String} namespace - The tracker instance's namespace (used to generate the localStorage key)
	   * @param {Object} mutSnowplowState - Gives the pageUnloadGuard a reference to the outbound queue
	   *                                so it can unload the page when all queues are empty
	   * @param {Boolean} useLocalStorage - Whether to use localStorage at all
	   * @param {Boolean} usePost - Whether to send events by POST or GET
	   * @param {Number} bufferSize - How many events to batch in localStorage before sending them all.
	   *                       Only applies when sending POST requests and when localStorage is available.
	   * @param {Number} maxPostBytes -  Maximum combined size in bytes of the event JSONs in a POST request
	   * @returns {Object} OutQueueManager instance
	   */
	  function OutQueueManager(functionName, namespace, mutSnowplowState, useLocalStorage, usePost, bufferSize, maxPostBytes) {
	    _classCallCheck(this, OutQueueManager);

	    this.functionName = functionName;
	    this.namespace = namespace;
	    this.mutSnowplowState = mutSnowplowState;
	    this.useLocalStorage = useLocalStorage;
	    this.usePost = usePost;
	    this.bufferSize = bufferSize;
	    this.maxPostBytes = maxPostBytes;
	    this.executingQueue = false;
	    this.configCollectorUrl = null;
	    this.outQueue = null; // Fall back to GET for browsers which don't support CORS XMLHttpRequests (e.g. IE <= 9)

	    usePost = usePost && window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest();
	    this.path = usePost ? '/com.snowplowanalytics.snowplow/tp2' : '/i';
	    bufferSize = localStorageAccessible() && useLocalStorage && usePost && bufferSize || 1; // Different queue names for GET and POST since they are stored differently

	    this.queueName = ['snowplowOutQueue', functionName, namespace, usePost ? 'post2' : 'get'].join('_');

	    if (this.useLocalStorage) {
	      // Catch any JSON parse errors or localStorage that might be thrown
	      try {
	        // TODO: backward compatibility with the old version of the queue for POST requests
	        this.outQueue = JSON.parse(localStorage.getItem(this.queueName));
	      } catch (e) {//TODO: add error handling here?
	      }
	    } // Initialize to and empty array if we didn't get anything out of localStorage


	    if (!isArray(this.outQueue)) {
	      this.outQueue = [];
	    } // Used by pageUnloadGuard


	    this.mutSnowplowState.outQueues.push(this.outQueue);

	    if (usePost && bufferSize > 1) {
	      this.mutSnowplowState.bufferFlushers.push(function () {
	        if (!this.executingQueue) {
	          this.executeQueue();
	        }
	      });
	    }
	  }
	  /**
	   *
	   * Private Methods
	   *
	   */

	  /*
	   * Convert a dictionary to a querystring
	   * The context field is the last in the querystring
	   */


	  _createClass(OutQueueManager, [{
	    key: getQuerystring,
	    value: function value(request) {
	      var querystring = '?',
	          lowPriorityKeys = {
	        co: true,
	        cx: true
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

	  }, {
	    key: getBody,
	    value: function value(request) {
	      var cleanedRequest = mapValues(request, function (v) {
	        return v.toString();
	      });
	      return {
	        evt: cleanedRequest,
	        bytes: this[getUTF8Length](JSON.stringify(cleanedRequest))
	      };
	    }
	    /**
	     * Count the number of bytes a string will occupy when UTF-8 encoded
	     * Taken from http://stackoverflow.com/questions/2848462/count-bytes-in-textarea-using-javascript/
	     *
	     * @param {String} s - string
	     * @returns {Number} Length of s in bytes when UTF-8 encoded
	     */

	  }, {
	    key: getUTF8Length,
	    value: function value(s) {
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
	    /**
	     * Open an XMLHttpRequest for a given endpoint with the correct credentials and header
	     *
	     * @param {String} url = The destination URL
	     * @returns {Object} -  The XMLHttpRequest
	     */

	  }, {
	    key: initializeXMLHttpRequest,
	    value: function value(url) {
	      var xhr = new XMLHttpRequest();
	      xhr.open('POST', url, true);
	      xhr.withCredentials = true;
	      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	      return xhr;
	    }
	    /**
	     * Enclose an array of events in a self-describing payload_data JSON string
	     *
	     * @param {Array} events Batch of events
	     * @returns {String} payload_data self-describing JSON
	     */

	  }, {
	    key: encloseInPayloadDataEnvelope,
	    value: function value(events) {
	      return JSON.stringify({
	        schema: 'iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4',
	        data: events
	      });
	    }
	    /**
	     * Attaches the STM field to outbound POST events.
	     *
	     * @param {Array} events -  the array events to attach the STM to
	     * @returns {Array} - the modified array
	     */

	  }, {
	    key: attachStmToEvent,
	    value: function value(events) {
	      var stm = new Date().getTime().toString();

	      for (var i = 0; i < events.length; i++) {
	        events[i]['stm'] = stm;
	      }

	      return events;
	    }
	    /**
	     *
	     * Public Methods
	     *
	     */

	    /*
	     * Queue an image beacon for submission to the collector.
	     * If we're not processing the queue, we'll start.
	     */

	  }, {
	    key: "enqueueRequest",
	    value: function enqueueRequest(request, url) {
	      this.configCollectorUrl = "".concat(url).concat(this.path);

	      if (this.usePost) {
	        var body = this[getBody](request);

	        if (body.bytes >= this.maxPostBytes) {
	          warn('Event of size ' + body.bytes + ' is too long - the maximum size is ' + this.maxPostBytes);
	          var xhr = this[initializeXMLHttpRequest](this.configCollectorUrl);
	          xhr.send(this[encloseInPayloadDataEnvelope](this[attachStmToEvent]([body.evt])));
	          return;
	        } else {
	          this.outQueue.push(body);
	        }
	      } else {
	        this.outQueue.push(this[getQuerystring](request));
	      }

	      var savedToLocalStorage = false;

	      if (this.useLocalStorage) {
	        savedToLocalStorage = attemptWriteLocalStorage(this.queueName, JSON.stringify(this.outQueue));
	      }

	      if (!this.executingQueue && (!savedToLocalStorage || this.outQueue.length >= this.bufferSize)) {
	        this.executeQueue();
	      }
	    }
	    /*
	     * Run through the queue of image beacons, sending them one at a time.
	     * Stops processing when we run out of queued requests, or we get an error.
	     */

	  }, {
	    key: "executeQueue",
	    value: function executeQueue() {
	      var _this = this;

	      var chooseHowManyToExecute = function chooseHowManyToExecute(q) {
	        var numberToSend = 0;
	        var byteCount = 0;

	        while (numberToSend < q.length) {
	          byteCount += q[numberToSend].bytes;

	          if (byteCount >= _this.maxPostBytes) {
	            break;
	          } else {
	            numberToSend += 1;
	          }
	        }

	        return numberToSend;
	      }; // Failsafe in case there is some way for a bad value like "null" to end up in the outQueue


	      while (this.outQueue.length && typeof this.outQueue[0] !== 'string' && _typeof(this.outQueue[0]) !== 'object') {
	        this.outQueue.shift();
	      }

	      if (this.outQueue.length < 1) {
	        this.executingQueue = false;
	        return;
	      } // Let's check that we have a Url to ping


	      if (!isString(this.configCollectorUrl)) {
	        throw 'No Snowplow collector configured, cannot track';
	      }

	      this.executingQueue = true;
	      var nextRequest = this.outQueue[0];

	      if (this.usePost) {
	        var xhr = this[initializeXMLHttpRequest](this.configCollectorUrl); // Time out POST requests after 5 seconds

	        var xhrTimeout = setTimeout(function () {
	          xhr.abort();
	          _this.executingQueue = false;
	        }, 5000); // Keep track of number of events to delete from queue

	        var numberToSend = chooseHowManyToExecute(this.outQueue);

	        xhr.onreadystatechange = function () {
	          if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
	            for (var deleteCount = 0; deleteCount < numberToSend; deleteCount++) {
	              _this.outQueue.shift();
	            }

	            if (_this.useLocalStorage) {
	              attemptWriteLocalStorage(_this.queueName, JSON.stringify(_this.outQueue));
	            }

	            clearTimeout(xhrTimeout);

	            _this.executeQueue();
	          } else if (xhr.readyState === 4 && xhr.status >= 400) {
	            clearTimeout(xhrTimeout);
	            _this.executingQueue = false;
	          }
	        };

	        var batch = this.outQueue.slice(0, numberToSend).map(function (x) {
	          return x.evt;
	        });

	        if (batch.length > 0) {
	          xhr.send(this[encloseInPayloadDataEnvelope](this[attachStmToEvent](batch)));
	        }
	      } else {
	        var image = new Image(1, 1);

	        image.onload = function () {
	          _this.outQueue.shift();

	          if (_this.useLocalStorage) {
	            attemptWriteLocalStorage(_this.queueName, JSON.stringify(_this.outQueue));
	          }

	          _this.executeQueue();
	        };

	        image.onerror = function () {
	          _this.executingQueue = false;
	        };

	        image.src = this.configCollectorUrl + nextRequest.replace('?', '?stm=' + new Date().getTime() + '&');
	      }
	    }
	  }]);

	  return OutQueueManager;
	}();

	var rng;

	var crypto$1 = commonjsGlobal.crypto || commonjsGlobal.msCrypto; // for IE 11
	if (crypto$1 && crypto$1.getRandomValues) {
	  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	  // Moderately fast, high quality
	  var _rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto$1.getRandomValues(_rnds8);
	    return _rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var  _rnds = new Array(16);
	  rng = function() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return _rnds;
	  };
	}

	var rngBrowser = rng;

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required


	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i$2 = 0; i$2 < 256; i$2++) {
	  _byteToHex[i$2] = (i$2 + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i$2]] = i$2;
	}

	// **`parse()` - Parse a UUID into it's component bytes**
	function parse(s, buf, offset) {
	  var i = (buf && offset) || 0, ii = 0;

	  buf = buf || [];
	  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	    if (ii < 16) { // Don't overflow!
	      buf[i + ii++] = _hexToByte[oct];
	    }
	  });

	  // Zero out remaining bytes if string was short
	  while (ii < 16) {
	    buf[i + ii++] = 0;
	  }

	  return buf;
	}

	// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	function unparse(buf, offset) {
	  var i = offset || 0, bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = rngBrowser();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; n++) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : unparse(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rngBrowser)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ii++) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || unparse(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	uuid.parse = parse;
	uuid.unparse = unparse;

	var uuid_1 = uuid;

	var base64 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	function base64encode(data) {
	    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc, tmp_arr = [];
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

	});

	unwrapExports(base64);

	var payload = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

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
	    return (typeof property !== 'undefined' && property !== null &&
	        (property.constructor === {}.constructor || property.constructor === [].constructor));
	}
	exports.isJson = isJson;
	function payloadBuilder(base64Encode) {
	    var dict = {};
	    var add = function (key, value) {
	        if (value != null && value !== '') {
	            dict[key] = value;
	        }
	    };
	    var addDict = function (dict) {
	        for (var key in dict) {
	            if (dict.hasOwnProperty(key)) {
	                add(key, dict[key]);
	            }
	        }
	    };
	    var addJson = function (keyIfEncoded, keyIfNotEncoded, json) {
	        if (isNonEmptyJson(json)) {
	            var str = JSON.stringify(json);
	            if (base64Encode) {
	                add(keyIfEncoded, base64urlencode(str));
	            }
	            else {
	                add(keyIfNotEncoded, str);
	            }
	        }
	    };
	    return {
	        add: add,
	        addDict: addDict,
	        addJson: addJson,
	        build: function () {
	            return dict;
	        }
	    };
	}
	exports.payloadBuilder = payloadBuilder;

	});

	unwrapExports(payload);

	var core = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });


	function getTimestamp(tstamp) {
	    if (tstamp == null) {
	        return { type: 'dtm', value: new Date().getTime() };
	    }
	    else if (typeof tstamp === 'number') {
	        return { type: 'dtm', value: tstamp };
	    }
	    else if (tstamp.type === 'ttm') {
	        return { type: 'ttm', value: tstamp.value };
	    }
	    else {
	        return { type: 'dtm', value: (tstamp.value || new Date().getTime()) };
	    }
	}
	function trackerCore(base64, callback) {
	    if (typeof base64 === 'undefined') {
	        base64 = true;
	    }
	    var payloadPairs = {};
	    function addPayloadPair(key, value) {
	        payloadPairs[key] = value;
	    }
	    function removeEmptyProperties(eventJson, exemptFields) {
	        var ret = {};
	        exemptFields = exemptFields || {};
	        for (var k in eventJson) {
	            if (exemptFields[k] || (eventJson[k] !== null && typeof eventJson[k] !== 'undefined')) {
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
	    function track(sb, context, tstamp) {
	        sb.addDict(payloadPairs);
	        sb.add('eid', uuid_1.v4());
	        var timestamp = getTimestamp(tstamp);
	        sb.add(timestamp.type, timestamp.value.toString());
	        var wrappedContexts = completeContexts(context);
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
	        setBase64Encoding: function (encode) {
	            base64 = encode;
	        },
	        addPayloadPair: addPayloadPair,
	        addPayloadDict: function (dict) {
	            for (var key in dict) {
	                if (dict.hasOwnProperty(key)) {
	                    payloadPairs[key] = dict[key];
	                }
	            }
	        },
	        resetPayloadPairs: function (dict) {
	            payloadPairs = payload.isJson(dict) ? dict : {};
	        },
	        setTrackerVersion: function (version) {
	            addPayloadPair('tv', version);
	        },
	        setTrackerNamespace: function (name) {
	            addPayloadPair('tna', name);
	        },
	        setAppId: function (appId) {
	            addPayloadPair('aid', appId);
	        },
	        setPlatform: function (value) {
	            addPayloadPair('p', value);
	        },
	        setUserId: function (userId) {
	            addPayloadPair('uid', userId);
	        },
	        setScreenResolution: function (width, height) {
	            addPayloadPair('res', width + 'x' + height);
	        },
	        setViewport: function (width, height) {
	            addPayloadPair('vp', width + 'x' + height);
	        },
	        setColorDepth: function (depth) {
	            addPayloadPair('cd', depth);
	        },
	        setTimezone: function (timezone) {
	            addPayloadPair('tz', timezone);
	        },
	        setLang: function (lang) {
	            addPayloadPair('lang', lang);
	        },
	        setIpAddress: function (ip) {
	            addPayloadPair('ip', ip);
	        },
	        trackUnstructEvent: trackSelfDescribingEvent,
	        trackSelfDescribingEvent: trackSelfDescribingEvent,
	        trackPageView: function (pageUrl, pageTitle, referrer, context, tstamp) {
	            var sb = payload.payloadBuilder(base64);
	            sb.add('e', 'pv');
	            sb.add('url', pageUrl);
	            sb.add('page', pageTitle);
	            sb.add('refr', referrer);
	            return track(sb, context, tstamp);
	        },
	        trackPagePing: function (pageUrl, pageTitle, referrer, minXOffset, maxXOffset, minYOffset, maxYOffset, context, tstamp) {
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
	        trackStructEvent: function (category, action, label, property, value, context, tstamp) {
	            var sb = payload.payloadBuilder(base64);
	            sb.add('e', 'se');
	            sb.add('se_ca', category);
	            sb.add('se_ac', action);
	            sb.add('se_la', label);
	            sb.add('se_pr', property);
	            sb.add('se_va', (value == null ? undefined : value.toString()));
	            return track(sb, context, tstamp);
	        },
	        trackEcommerceTransaction: function (orderId, affiliation, totalValue, taxValue, shipping, city, state, country, currency, context, tstamp) {
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
	        trackEcommerceTransactionItem: function (orderId, sku, name, category, price, quantity, currency, context, tstamp) {
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
	        trackScreenView: function (name, id, context, tstamp) {
	            return trackSelfDescribingEvent({
	                schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0',
	                data: removeEmptyProperties({
	                    name: name,
	                    id: id
	                })
	            }, context, tstamp);
	        },
	        trackLinkClick: function (targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp) {
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
	        trackAdImpression: function (impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
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
	        trackAdClick: function (targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp) {
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
	        trackAdConversion: function (conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp) {
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
	        trackSocialInteraction: function (action, network, target, context, tstamp) {
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
	        trackAddToCart: function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
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
	        trackRemoveFromCart: function (sku, name, category, unitPrice, quantity, currency, context, tstamp) {
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
	        trackFormChange: function (formId, elementId, nodeName, type, elementClasses, value, context, tstamp) {
	            return trackSelfDescribingEvent({
	                schema: 'iglu:com.snowplowanalytics.snowplow/change_form/jsonschema/1-0-0',
	                data: removeEmptyProperties({
	                    formId: formId,
	                    elementId: elementId,
	                    nodeName: nodeName,
	                    type: type,
	                    elementClasses: elementClasses,
	                    value: value
	                }, { value: true })
	            }, context, tstamp);
	        },
	        trackFormSubmission: function (formId, formClasses, elements, context, tstamp) {
	            return trackSelfDescribingEvent({
	                schema: 'iglu:com.snowplowanalytics.snowplow/submit_form/jsonschema/1-0-0',
	                data: removeEmptyProperties({
	                    formId: formId,
	                    formClasses: formClasses,
	                    elements: elements
	                })
	            }, context, tstamp);
	        },
	        trackSiteSearch: function (terms, filters, totalResults, pageResults, context, tstamp) {
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
	        trackConsentWithdrawn: function (all, id, version, name, description, context, tstamp) {
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
	        trackConsentGranted: function (id, version, name, description, expiry, context, tstamp) {
	            var documentJson = {
	                schema: 'iglu:com.snowplowanalytics.snowplow/consent_document/jsonschema/1-0-0',
	                data: removeEmptyProperties({
	                    id: id,
	                    version: version,
	                    name: name,
	                    description: description,
	                })
	            };
	            return trackSelfDescribingEvent({
	                schema: 'iglu:com.snowplowanalytics.snowplow/consent_granted/jsonschema/1-0-0',
	                data: removeEmptyProperties({
	                    expiry: expiry,
	                })
	            }, context ? context.concat([documentJson]) : [documentJson], tstamp);
	        }
	    };
	}
	exports.trackerCore = trackerCore;

	});

	unwrapExports(core);

	var snowplowTrackerCore = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.trackerCore = core.trackerCore;

	});

	unwrapExports(snowplowTrackerCore);
	var snowplowTrackerCore_1 = snowplowTrackerCore.trackerCore;

	var rngBrowser$1 = createCommonjsModule(function (module) {
	// Unique ID creation requires a high quality random # generator.  In the
	// browser this is a little complicated due to unknown quality of Math.random()
	// and inconsistent support for the `crypto` API.  We do the best we can via
	// feature-detection

	// getRandomValues needs to be invoked in a context where "this" is a Crypto
	// implementation. Also, find the complete implementation of crypto on IE11.
	var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
	                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

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
	});

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i$3 = 0; i$3 < 256; ++i$3) {
	  byteToHex[i$3] = (i$3 + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	  return ([bth[buf[i++]], bth[buf[i++]], 
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]]]).join('');
	}

	var bytesToUuid_1 = bytesToUuid;

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId$1;
	var _clockseq$1;

	// Previous uuid creation time
	var _lastMSecs$1 = 0;
	var _lastNSecs$1 = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1$1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};
	  var node = options.node || _nodeId$1;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq$1;

	  // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189
	  if (node == null || clockseq == null) {
	    var seedBytes = rngBrowser$1();
	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId$1 = [
	        seedBytes[0] | 0x01,
	        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
	      ];
	    }
	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq$1 = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  }

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs$1 + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs$1) + (nsecs - _lastNSecs$1)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs$1) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs$1 = msecs;
	  _lastNSecs$1 = nsecs;
	  _clockseq$1 = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid_1(b);
	}

	var v1_1 = v1$1;

	function v4$1(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || rngBrowser$1)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid_1(rnds);
	}

	var v4_1 = v4$1;

	var uuid$1 = v4_1;
	uuid$1.v1 = v1_1;
	uuid$1.v4 = v4_1;

	var uuid_1$1 = uuid$1;

	/**
	 * The configuration defaults
	 * @typedef {Object} TrackerConfiguration
	 *
	 * @property {Boolean} encodeBase64 - defaults to true
	 * @property {String} cookieDomain - defaults to null
	 * @property {String} cookieName - defaults to '_sp_'
	 * @property {String} appId - defaults to ''
	 * @property {String} platform - defaults to 'web'
	 * @property {Boolean} respectDoNotTrack - defaults to false
	 * @property {Number} userFingerprintSeed - defaults to 123412414
	 * @property {Boolean} userFingerprint - Fingerprint users
	 * @property {Number} pageUnloadTimer - defaults to 500
	 * @property {Boolean} forceSecureTracker, - defaults to alse
	 * @property {Boolean} forceUnsecureTracker, - defaults to alse
	 * @property {Boolean} useLocalStorage - defaults to true
	 * @property {Boolean} useCookies - defaults to true
	 * @property {Number} sessionCookieTimeout - defaults to 1800
	 * @property {Object} contexts - defaults to {}
	 * @property {Boolean} post - defaults to false
	 * @property {Numner} bufferSize - defaults to 1
	 * @property {Boolean} crossDomainLinker - defaults to false
	 * @property {Number} maxPostBytes - defaults to 40000
	 * @property {Boolean} discoverRootDomain - defaults to false
	 * @property {Number} cookieLifetime - defaults to 63072000
	 * @property {String} stateStorageStrategy - defaults to 'cookieAndLocalStorage'
	 */

	/**
	 * @returns {TrackerConfiguration} - The configuration defaults
	 */
	var ConfigDefaults = {
	  encodeBase64: true,
	  cookieDomain: null,
	  cookieName: '_sp_',
	  appId: '',
	  platform: 'web',
	  respectDoNotTrack: false,
	  userFingerprint: true,
	  userFingerprintSeed: 123412414,
	  pageUnloadTimer: 500,
	  forceSecureTracker: false,
	  forceUnsecureTracker: false,
	  useLocalStorage: true,
	  useCookies: true,
	  sessionCookieTimeout: 1800,
	  contexts: {},
	  post: false,
	  bufferSize: 1,
	  crossDomainLinker: false,
	  maxPostBytes: 40000,
	  discoverRootDomain: false,
	  cookieLifetime: 63072000,
	  stateStorageStrategy: 'cookieAndLocalStorage'
	  /**
	   * @class ConfigManager
	   */

	};

	var ConfigManager =
	/*#__PURE__*/
	function () {
	  /**
	   *
	   * @param {TrackerConfiguration}  - Custom tracker configuration settings
	   * @returns {ConfigManager} instance of the ConfigManager class
	   */
	  function ConfigManager(config) {
	    _classCallCheck(this, ConfigManager);

	    this._config = config;
	  }
	  /**
	   * @returns {TrackerConfiguration}
	   */


	  _createClass(ConfigManager, [{
	    key: "config",
	    get: function get() {
	      // // Whether to use localStorage to store events between sessions while offline
	      // this.useLocalStorage = argmap.hasOwnProperty('useLocalStorage')
	      //     ? (helpers.warn(
	      //         'argmap.useLocalStorage is deprecated. ' +
	      //               'Use argmap.stateStorageStrategy instead.'
	      //     ),
	      //     argmap.useLocalStorage)
	      //     : true
	      // // Whether to use cookies
	      // this.configUseCookies = argmap.hasOwnProperty('useCookies')
	      //     ? (helpers.warn(
	      //         'argmap.useCookies is deprecated. Use argmap.stateStorageStrategy instead.'
	      //     ),
	      //     argmap.useCookies)
	      //     : true
	      // // Strategy defining how to store the state: cookie, localStorage or none
	      // this.configStateStorageStrategy = argmap.hasOwnProperty(
	      //     'stateStorageStrategy'
	      // )
	      //     ? argmap.stateStorageStrategy
	      //     : !configUseCookies && !useLocalStorage
	      //         ? 'none'
	      //         : configUseCookies && useLocalStorage
	      //             ? 'cookieAndLocalStorage'
	      //             : configUseCookies
	      //                 ? 'cookie'
	      //                 : 'localStorage'
	      return _objectSpread({}, ConfigDefaults, this._config);
	    }
	  }]);

	  return ConfigManager;
	}();

	var processClick = Symbol('processClick');
	var getClickHandler = Symbol('getClickHandler');
	var addClickListener = Symbol('addClickListener');

	var LinkTrackingManager =
	/*#__PURE__*/
	function () {
	  /**
	   * Object for handling automatic link tracking
	   *
	   * @param {Object} core - The tracker core
	   * @param {String} trackerId - Unique identifier for the tracker instance, used to mark tracked links
	   * @param {Function} contextAdder - Function to add common contexts like PerformanceTiming to all events
	   * @returns {Object} - linkTrackingManager instance
	   */
	  function LinkTrackingManager(core, trackerId, contextAdder) {
	    _classCallCheck(this, LinkTrackingManager);

	    this.core = core;
	    this.trackerId = trackerId;
	    this.contextAdder = contextAdder; // Filter function used to determine whether clicks on a link should be tracked

	    this.linkTrackingFilter = null; // Whether pseudo clicks are tracked

	    this.linkTrackingPseudoClicks = null; // Whether to track the  innerHTML of clicked links

	    this.linkTrackingContent = null; // The context attached to link click events

	    this.linkTrackingContext = null; // Internal state of the pseudo click handler

	    this.lastButton = null;
	    this.lastTarget = null;
	  }
	  /**
	   *
	   * Private Methods
	   *
	   */

	  /**
	   * Process clicks
	   *
	   * @param {HTMLElement} sourceElement  - source element to process clicks on
	   * @param {Object} context  - dynamic context
	   */


	  _createClass(LinkTrackingManager, [{
	    key: processClick,
	    value: function value(sourceElement, context) {
	      var parentElement, tag, elementId, elementClasses, elementTarget, elementContent;

	      while ((parentElement = sourceElement.parentNode) !== null && !parentElement === undefined && (tag = sourceElement.tagName.toUpperCase()) !== 'A' && tag !== 'AREA') {
	        sourceElement = parentElement;
	      }

	      if (!sourceElement.href === undefined) {
	        // browsers, such as Safari, don't downcase hostname and href
	        var originalSourceHostName = sourceElement.hostname || helpers.getHostName(sourceElement.href),
	            sourceHostName = originalSourceHostName.toLowerCase(),
	            sourceHref = sourceElement.href.replace(originalSourceHostName, sourceHostName),
	            scriptProtocol = new RegExp('^(javascript|vbscript|jscript|mocha|livescript|ecmascript|mailto):', 'i'); // Ignore script pseudo-protocol links

	        if (!scriptProtocol.test(sourceHref)) {
	          elementId = sourceElement.id;
	          elementClasses = helpers.getCssClasses(sourceElement);
	          elementTarget = sourceElement.target;
	          elementContent = this.linkTrackingContent ? sourceElement.innerHTML : null; // decodeUrl %xx

	          sourceHref = unescape(sourceHref);
	          this.core.trackLinkClick(sourceHref, elementId, elementClasses, elementTarget, elementContent, this.contextAdder(helpers.resolveDynamicContexts(context, sourceElement)));
	        }
	      }
	    }
	    /**
	     * Return function to handle click event
	     *
	     * @param {OBject} - dynamic context
	     * @returns {Function} - handler function for click event
	     */

	  }, {
	    key: getClickHandler,
	    value: function value(context) {
	      var _this = this;

	      return function (evt) {
	        var button, target;
	        evt = evt || window.event;
	        button = evt.which || evt.button;
	        target = evt.target || evt.srcElement; // Using evt.type (added in IE4), we avoid defining separate handlers for mouseup and mousedown.

	        if (evt.type === 'click') {
	          if (target) {
	            _this[processClick](target, context);
	          }
	        } else if (evt.type === 'mousedown') {
	          if ((button === 1 || button === 2) && target) {
	            _this.lastButton = button;
	            _this.lastTarget = target;
	          } else {
	            _this.lastButton = _this.lastTarget = null;
	          }
	        } else if (evt.type === 'mouseup') {
	          if (button === _this.lastButton && target === _this.lastTarget) {
	            _this[processClick](target, context);
	          }

	          _this.lastButton = _this.lastTarget = null;
	        }
	      };
	    }
	    /**
	     * Add click listener to a DOM element
	     *
	     * @param {HTMLElement} element - HTMLElement to add listener too
	     */

	  }, {
	    key: addClickListener,
	    value: function value(element) {
	      if (this.linkTrackingPseudoClicks) {
	        // for simplicity and performance, we ignore drag events
	        helpers.addEventListener(element, 'mouseup', this[getClickHandler](this.linkTrackingContext), false);
	        helpers.addEventListener(element, 'mousedown', this[getClickHandler](this.linkTrackingContext), false);
	      } else {
	        helpers.addEventListener(element, 'click', this[getClickHandler](this.linkTrackingContext), false);
	      }
	    }
	    /**
	     *
	     * Public Methods
	     *
	     */

	    /**
	     * Configures link click tracking: how to filter which links will be tracked,
	     * whether to use pseudo click tracking, and what context to attach to link_click events
	     *
	     * @param {Object} criterion - criteria for filter
	     * @param {Boolean} pseudoClicks - Should pseudo clicks be tracker?
	     * @param {Boolean} trackContent - Track innerHTML of elements?
	     * @param {Object} context - context to attach to click events
	     */

	  }, {
	    key: "configureLinkClickTracking",
	    value: function configureLinkClickTracking(criterion, pseudoClicks, trackContent, context) {
	      this.linkTrackingContent = trackContent;
	      this.linkTrackingContext = context;
	      this.linkTrackingPseudoClicks = pseudoClicks;
	      this.linkTrackingFilter = helpers.getFilter(criterion, true);
	    }
	    /**
	     * Add click handlers to anchor and AREA elements, except those to be ignored
	     *
	     */

	  }, {
	    key: "addClickListeners",
	    value: function addClickListeners() {
	      var linkElements = document.links,
	          i;

	      for (i = 0; i < linkElements.length; i++) {
	        // Add a listener to link elements which pass the filter and aren't already tracked
	        if (this.linkTrackingFilter(linkElements[i]) && !linkElements[i][this.trackerId]) {
	          this[addClickListener](linkElements[i]);
	          linkElements[i][this.trackerId] = true;
	        }
	      }
	    }
	  }]);

	  return LinkTrackingManager;
	}();

	var refreshUrl = Symbol('refreshUrl');
	var linkDecorationHandler = Symbol('linkDecorationHandler');
	var decorateLinks = Symbol('decorateLinks');
	var ecommerceTransactionTemplate = Symbol('ecommerceTransactionTemplate');
	var purify = Symbol('purify');
	var getProtocolScheme = Symbol('getProtocolScheme');
	var resolveRelativeReference = Symbol('resolveRelativeReference');
	var sendRequest = Symbol('sendRequest');
	var getSnowplowCookieName = Symbol('getSnowplowCookieName');
	var getSnowplowCookieValue = Symbol('getSnowplowCookieValue');
	var updateDomainHash = Symbol('updateDomainHash');
	var activityHandler = Symbol('activityHandler');
	var scrollHandler = Symbol('scrollHandler');
	var getPageOffsets = Symbol('getPageOffsets');
	var resetMaxScrolls = Symbol('resetMaxScrolls');
	var cleanOffset = Symbol('cleanOffset');
	var updateMaxScrolls = Symbol('updateMaxScrolls');
	var setSessionCookie = Symbol('setSessionCookie');
	var setDomainUserIdCookie = Symbol('setDomainUserIdCookie');
	var setCookie = Symbol('setCookie');
	var createNewDomainUserId = Symbol('createNewDomainUserId');
	var initializeIdsAndCookies = Symbol('initializeIdsAndCookies');
	var loadDomainUserIdCookie = Symbol('loadDomainUserIdCookie');
	var addBrowserData = Symbol('addBrowserData');
	var collectorUrlFromCfDist = Symbol('collectorUrlFromCfDist');
	var asCollectorUrl = Symbol('asCollectorUrl');
	var addCommonContexts = Symbol('addCommonContexts');
	var resetPageView = Symbol('resetPageView');

	var _getPageViewId = Symbol('getPageViewId');

	var getWebPageContext = Symbol('getWebPageContext');
	var getPerformanceTimingContext = Symbol('getPerformanceTimingContext');
	var getOptimizelyData = Symbol('getOptimizelyData');
	var getOptimizelyXData = Symbol('getOptimizelyXData');
	var getOptimizelySummary = Symbol('getOptimizelySummary');
	var getOptimizelyXSummary = Symbol('getOptimizelyXSummary');
	var getOptimizelyExperimentContexts = Symbol['getOptimizelyExperimentContexts'];
	var getOptimizelyStateContexts = Symbol('getOptimizelyStateContexts');
	var getOptimizelyVariationContexts = Symbol('getOptimizelyVariationContexts');
	var getOptimizelyVisitorContext = Symbol('getOptimizelyVisitorContext');
	var getOptimizelyAudienceContexts = Symbol('getOptimizelyAudienceContexts');
	var getOptimizelyDimensionContexts = Symbol('getOptimizelyDimensionContexts');
	var getOptimizelySummaryContexts = Symbol('getOptimizelySummaryContexts');
	var getOptimizelyXSummaryContexts = Symbol('getOptimizelyXSummaryContexts');
	var getAugurIdentityLiteContext = Symbol('getAugurIdentityLiteContext');
	var getParrableContext = Symbol('getParrableContext');

	var _newSession = Symbol('newSession');

	var _enableGeolocationContext = Symbol('enableGeolocationContext');

	var getGaCookiesContext = Symbol('getGaCookiesContext');
	var finalizeContexts = Symbol('finalizeContexts');
	var logPageView = Symbol('logPageView');
	var logPagePing = Symbol('logPagePing');
	var logTransaction = Symbol('logTransaction');
	var logTransactionItem = Symbol('logTransactionItem');
	var prefixPropertyName = Symbol('prefixPropertyName');
	var trackCallback = Symbol('trackCallback'); // const refreshUrl = Symbol('refreshUrl')
	// const refreshUrl = Symbol('refreshUrl')
	// const refreshUrl = Symbol('refreshUrl')
	// const refreshUrl = Symbol('refreshUrl')

	/**
	 * Snowplow Tracker class
	 * @class JavascriptTracker
	 */

	var JavascriptTracker =
	/*#__PURE__*/
	function () {
	  /**
	   * Snowplow Tracker class constructor
	   *
	   * @param {String} functionName - global function name
	   * @param {String} namespace - The namespace of the tracker object
	   * @param {String} version - The current version of the JavaScript Tracker
	   * @param {Object} mutSnowplowState - An object containing hasLoaded, registeredOnLoadHandlers, and expireDateTime
	   * 									  Passed in by reference in case they are altered by snowplow.js
	   * @param {TrackerConfiguration} argmap -  Optional dictionary of configuration options.
	   * @returns {JavascriptTracker} - an isntance of the SnowplowTracker
	   */
	  function JavascriptTracker(functionName, namespace, version, mutSnowplowState, argmap) {
	    var _this2 = this;

	    _classCallCheck(this, JavascriptTracker);

	    this.configManager = new ConfigManager(argmap || {});
	    var config = this.config = this.configManager.config;

	    var _this = this;
	    /************************************************************
	     * * Private members
	     * ************************************************************/
	    // Debug - whether to raise errors to console and log to console
	    // or silence all errors from public methods
	    //this.debug = false
	    // API functions of the tracker
	    //this.apiMethods = {};
	    // Safe methods (i.e. ones that won't raise errors)
	    // These values should be guarded publicMethods
	    //this.safeMethods = {};
	    // The client-facing methods returned from tracker IIFE
	    //this.returnMethods = {};


	    this.mutSnowplowState = mutSnowplowState;
	    this.state = {
	      documentAlias: document,
	      windowAlias: window,
	      navigatorAlias: navigator,

	      get locationArray() {
	        return fixupUrl(this.documentAlias.domain, this.windowAlias.location.href, getReferrer());
	      },

	      get domainAlias() {
	        return fixupDomain(this.locationArray[0]);
	      },

	      locationHrefAlias: '',
	      referrerUrl: '',
	      pagePingInterval: 20,
	      customReferrer: '',
	      requestMethod: 'GET',
	      collectorUrl: '',
	      customUrl: '',
	      lastDocumentTitle: '',
	      // get lastDocumentTitle() {
	      //     return this.documentAlias.title
	      // },
	      lastConfigTitle: '',
	      activityTrackingEnabled: false,
	      minimumVisitTime: 0,
	      heartBeatTimer: 0,
	      //TODO: Should this be set to true by default?
	      discardHashTag: false,
	      cookiePath: '/',

	      get dnt() {
	        return this.navigatorAlias.doNotTrack || this.navigatorAlias.msDoNotTrack || this.windowAlias.doNotTrack;
	      },

	      get doNotTrack() {
	        return config.respectDoNotTrack && (this.dnt === 'yes' || this.dnt === '1' || this.dnt === true);
	      },

	      optOutCookie: false,
	      countPreRendered: false,

	      get documentCharset() {
	        return this.documentAlias.characterSet || this.documentAlias.charset;
	      },

	      get forceSecureTracker() {
	        return config.forceSecureTracker;
	      },

	      get forceUnsecureTracker() {
	        return !this.forceSecureTracker && config.forceUnsecureTracker;
	      },

	      get browserLanguage() {
	        return this.navigatorAlias.userLanguage || this.navigatorAlias.language;
	      },

	      get browserFeatures() {
	        return detectBrowserFeatures(config.stateStorageStrategy == 'cookie' || config.stateStorageStrategy == 'cookieAndLocalStorage', _this[getSnowplowCookieName]('testcookie'));
	      },

	      get userFingerprint() {
	        return config.userFingerprint === false ? '' : detectSignature(config.userFingerprintSeed);
	      },

	      trackerId: "".concat(functionName, "_").concat(namespace),
	      activityTrackingInstalled: false,
	      lastActivityTime: null,
	      lastEventTime: new Date().getTime(),
	      minXOffset: 0,
	      maxXOffset: 0,
	      minYOffset: 0,
	      maxYOffset: 0,
	      hash: sha1,
	      domainHash: null,
	      domainUserId: null,
	      memorizedSessionId: 1,
	      businessUserId: null,
	      ecommerceTransaction: _this[ecommerceTransactionTemplate](),
	      geolocationContextAdded: false,
	      commonContexts: [],
	      enhancedEcommerceContexts: [],
	      preservePageViewId: false,
	      pageViewSent: false // Tracker core

	    };
	    this.core = snowplowTrackerCore_1(true, function (payload) {
	      _this2[addBrowserData](payload);

	      _this2[sendRequest](payload, config.pageUnloadTimer);
	    }); // Manager for automatic link click tracking

	    this.linkTrackingManager = new LinkTrackingManager(this.core, this.state.trackerId, this[addCommonContexts]); // Manager for automatic form tracking

	    this.formTrackingManager = new FormTrackingManager(this.core, this.state.trackerId, this[addCommonContexts]); // Manager for tracking unhandled exceptions

	    this.errorManager = new ErrorManager(this.core); // Manager for local storage queue

	    this.outQueueManager = new OutQueueManager(functionName, namespace, mutSnowplowState, config.stateStorageStrategy == 'localStorage' || config.stateStorageStrategy == 'cookieAndLocalStorage', config.post, config.bufferSize, config.maxPostBytes);

	    if (config.discoverRootDomain) {
	      config.cookieDomain = findRootDomain();
	    }

	    if (config.contexts.gaCookies) {
	      this.state.commonContexts.push(this[getGaCookiesContext]());
	    }

	    if (config.contexts.geolocation) {
	      this[_enableGeolocationContext]();
	    } // Enable base 64 encoding for self-describing events and custom contexts


	    this.core.setBase64Encoding(config.encodeBase64); // Set up unchanging name-value pairs

	    this.core.setTrackerVersion(version);
	    this.core.setTrackerNamespace(namespace);
	    this.core.setAppId(config.appId);
	    this.core.setPlatform(config.platform);
	    this.core.setTimezone(detectTimezone());
	    this.core.addPayloadPair('lang', this.state.browserLanguage);
	    this.core.addPayloadPair('cs', this.state.documentCharset); // Browser features. Cookies, color depth and resolution don't get prepended with f_ (because they're not optional features)

	    var bf = this.state.browserFeatures;
	    Object.keys(bf).forEach(function (feature) {
	      if (feature === 'res' || feature === 'cd' || feature === 'cookie') {
	        _this2.core.addPayloadPair(feature, bf[feature]);
	      } else {
	        _this2.core.addPayloadPair('f_' + feature, bf[feature]);
	      }
	    });
	    /*
	     * Initialize tracker
	     */

	    this.state.locationHrefAlias = this.state.locationArray[1];
	    this.state.referrerUrl = this.state.locationArray[2];
	    this[updateDomainHash]();
	    this[initializeIdsAndCookies]();

	    if (config.crossDomainLinker) {
	      this[decorateLinks](config.crossDomainLinker);
	    } // Create guarded methods from apiMethods,
	    // and set returnMethods to apiMethods or safeMethods depending on value of debug
	    //safeMethods = productionize(apiMethods)
	    //updateReturnMethods()
	    //return returnMethods;

	  }
	  /**
	   * Recalculate the domain, URL, and referrer
	   **/


	  _createClass(JavascriptTracker, [{
	    key: refreshUrl,
	    value: function value() {
	      // If this is a single-page app and the page URL has changed, then:
	      //   - if the new URL's querystring contains a "refer(r)er" parameter, use it as the referrer
	      //   - otherwise use the old URL as the referer
	      //TODO: This might be able to be moved to a object literal function
	      var _locationHrefAlias = this.state.locationHrefAlias;

	      if (this.state.locationArray[1] !== _locationHrefAlias) {
	        this.state.ReferrerUrl = getReferrer(_locationHrefAlias);
	      }

	      this.state.locationHrefAlias = this.state.locationArray[1];
	    }
	    /**
	     * Decorate the querystring of a single link
	     *
	     * @param event e The event targeting the link
	     */

	  }, {
	    key: linkDecorationHandler,
	    value: function value(e) {
	      var _timestamp = new Date().getTime();

	      if (e.target.href) {
	        e.target.href = decorateQuerystring(e.target.href, '_sp', "".concat(this.state.domainUserId, ".").concat(_timestamp));
	      }
	    }
	    /**
	     * Enable querystring decoration for links pasing a filter
	     * Whenever such a link is clicked on or navigated to via the keyboard,
	     * add "_sp={{duid}}.{{timestamp}}" to its querystring
	     *
	     * @param crossDomainLinker Function used to determine which links to decorate
	     */

	  }, {
	    key: decorateLinks,
	    value: function value(crossDomainLinker) {
	      var _this3 = this;

	      for (var i = 0; i < this.state.documentAlias.links.length; i++) {
	        var elt = this.state.documentAlias.links[i];

	        if (!elt.spDecorationEnabled && crossDomainLinker(elt)) {
	          addEventListener(elt, 'click', function (e) {
	            _this3[linkDecorationHandler](e);
	          }, true);
	          addEventListener(elt, 'mousedown', function (e) {
	            _this3[linkDecorationHandler](e);
	          }, true); // Don't add event listeners more than once

	          elt.spDecorationEnabled = true;
	        }
	      }
	    }
	    /*
	     * Initializes an empty ecommerce
	     * transaction and line items
	     */

	  }, {
	    key: ecommerceTransactionTemplate,
	    value: function value() {
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

	  }, {
	    key: purify,
	    value: function value(url) {
	      return this.state.discardHashTag ? url.replace(/#.*/, '') : url;
	    }
	    /*
	     * Extract scheme/protocol from URL
	     */

	  }, {
	    key: getProtocolScheme,
	    value: function value(url) {
	      var matches = /^([a-z]+):/.exec(url);
	      return matches ? matches[1] : null;
	    }
	    /*
	     * Resolve relative reference
	     *
	     * Note: not as described in rfc3986 section 5.2
	     */

	  }, {
	    key: resolveRelativeReference,
	    value: function value(baseUrl, url) {
	      var protocol = this[getProtocolScheme](url),
	          i;

	      if (protocol) {
	        return url;
	      }

	      if (url.slice(0, 1) === '/') {
	        return "".concat(this[getProtocolScheme](baseUrl), "://").concat(getHostName(baseUrl)).concat(url);
	      }

	      baseUrl = this[purify](baseUrl);

	      if ((i = baseUrl.indexOf('?')) >= 0) {
	        baseUrl = baseUrl.slice(0, i);
	      }

	      if ((i = baseUrl.lastIndexOf('/')) !== baseUrl.length - 1) {
	        baseUrl = baseUrl.slice(0, i + 1);
	      }

	      return "".concat(baseUrl).concat(url);
	    }
	    /*
	     * Send request
	     */

	  }, {
	    key: sendRequest,
	    value: function value(request, delay) {
	      var now = new Date(); // Set to true if Opt-out cookie is defined

	      var toOptoutByCookie = !!window.cookie(this.config.optOutCookie);

	      if (!(this.config.doNotTrack || toOptoutByCookie)) {
	        this.outQueueManager.enqueueRequest(request.build(), this.config.collectorUrl);
	        this.mutSnowplowState.expireDateTime = now.getTime() + delay;
	      }
	    }
	    /*
	     * Get cookie name with prefix and domain hash
	     */

	  }, {
	    key: getSnowplowCookieName,
	    value: function value(baseName) {
	      return "".concat(this.config.cookieName).concat(baseName, ".").concat(this.state.domainHash);
	    }
	    /*
	     * Cookie getter.
	     */

	  }, {
	    key: getSnowplowCookieValue,
	    value: function value(cookieName) {
	      var fullName = this[getSnowplowCookieName](cookieName);

	      if (this.config.stateStorageStrategy == 'localStorage') {
	        return attemptGetLocalStorage(fullName);
	      } else if (this.config.stateStorageStrategy == 'cookie' || this.config.stateStorageStrategy == 'cookieAndLocalStorage') {
	        return window.cookie(fullName);
	      }
	    }
	    /*
	     * Update domain hash
	     */

	  }, {
	    key: updateDomainHash,
	    value: function value() {
	      this[refreshUrl]();
	      this.state.domainHash = this.state.hash((this.config.cookieDomain || this.state.domainAlias) + (this.state.cookiePath || '/')).slice(0, 4); // 4 hexits = 16 bits
	    }
	    /*
	     * Process all "activity" events.
	     * For performance, this function must have low overhead.
	     */

	  }, {
	    key: activityHandler,
	    value: function value() {
	      var now = new Date();
	      this.state.lastActivityTime = now.getTime();
	    }
	    /*
	     * Process all "scroll" events.
	     */

	  }, {
	    key: scrollHandler,
	    value: function value() {
	      this[updateMaxScrolls]();
	      this[activityHandler]();
	    }
	    /*
	     * Returns [pageXOffset, pageYOffset].
	     * Adapts code taken from: http://www.javascriptkit.com/javatutors/static2.shtml
	     */

	  }, {
	    key: getPageOffsets,
	    value: function value() {
	      var iebody = this.state.documentAlias.compatMode && this.state.documentAlias.compatMode !== 'BackCompat' ? this.state.documentAlias.documentElement : this.state.documentAlias.body;
	      return [iebody.scrollLeft || this.state.windowAlias.pageXOffset, iebody.scrollTop || this.state.windowAlias.pageYOffset];
	    }
	    /*
	     * Quick initialization/reset of max scroll levels
	     */

	  }, {
	    key: resetMaxScrolls,
	    value: function value() {
	      var offsets = this[getPageOffsets]();
	      var x = offsets[0],
	          y = offsets[1];
	      this.state.minXOffset = x;
	      this.state.maxXOffset = x;
	      this.state.minYOffset = y;
	      this.state.maxYOffset = y;
	    }
	    /*
	     * Check the max scroll levels, updating as necessary
	     */

	  }, {
	    key: updateMaxScrolls,
	    value: function value() {
	      var offsets = this[getPageOffsets]();
	      var x = offsets[0],
	          y = offsets[1];

	      if (x < this.state.minXOffset) {
	        this.state.minXOffset = x;
	      } else if (x > this.state.maxXOffset) {
	        this.state.maxXOffset = x;
	      }

	      if (y < this.state.minYOffset) {
	        this.state.minYOffset = y;
	      } else if (y > this.state.maxYOffset) {
	        this.state.maxYOffset = y;
	      }
	    }
	    /*
	     * Prevents offsets from being decimal or NaN
	     * See https://github.com/snowplow/snowplow-javascript-tracker/issues/324
	     * TODO: the NaN check should be moved into the core
	     */

	  }, {
	    key: cleanOffset,
	    value: function value(offset) {
	      var rounded = Math.round(offset);

	      if (!isNaN(rounded)) {
	        return rounded;
	      }
	    }
	    /*
	     * Sets or renews the session cookie
	     */

	  }, {
	    key: setSessionCookie,
	    value: function value() {
	      var cookieName = this[getSnowplowCookieName]('ses');
	      var cookieValue = '*';
	      this[setCookie](cookieName, cookieValue, this.config.sessionCookieTimeout);
	    }
	    /*
	     * Sets the Visitor ID cookie: either the first time loadDomainUserIdCookie is called
	     * or when there is a new visit or a new page view
	     */

	  }, {
	    key: setDomainUserIdCookie,
	    value: function value(_domainUserId, createTs, visitCount, nowTs, lastVisitTs, sessionId) {
	      var cookieName = this[getSnowplowCookieName]('id');
	      var cookieValue = _domainUserId + '.' + createTs + '.' + visitCount + '.' + nowTs + '.' + lastVisitTs + '.' + sessionId;
	      this[setCookie](cookieName, cookieValue, this.config.sessionCookieTimeout);
	    }
	    /*
	     * Sets a cookie based on the storage strategy:
	     * - if 'localStorage': attemps to write to local storage
	     * - if 'cookie': writes to cookies
	     * - otherwise: no-op
	     */

	  }, {
	    key: setCookie,
	    value: function value(name, _value, timeout) {
	      if (this.config.stateStorageStrategy == 'localStorage') {
	        attemptWriteLocalStorage(name, _value);
	      } else if (this.config.stateStorageStrategy == 'cookie' || this.config.stateStorageStrategy == 'cookieAndLocalStorage') {
	        window.cookie(name, _value, timeout, this.config.cookiePath, this.config.cookieDomain);
	      }
	    }
	    /**
	     * Generate a pseudo-unique ID to fingerprint this user
	     */

	  }, {
	    key: createNewDomainUserId,
	    value: function value() {
	      return uuid_1$1.v4();
	    }
	    /*
	     * Load the domain user ID and the session ID
	     * Set the cookies (if cookies are enabled)
	     */

	  }, {
	    key: initializeIdsAndCookies,
	    value: function value() {
	      var sesCookieSet = this.config.stateStorageStrategy != 'none' && !!this[getSnowplowCookieValue]('ses');
	      var idCookieComponents = this[loadDomainUserIdCookie]();

	      if (idCookieComponents[1]) {
	        this.state.domainUserId = idCookieComponents[1];
	      } else {
	        this.state.domainUserId = this[createNewDomainUserId]();
	        idCookieComponents[1] = this.state.domainUserId;
	      }

	      this.state.memorizedSessionId = idCookieComponents[6];

	      if (!sesCookieSet) {
	        // Increment the session ID
	        idCookieComponents[3]++; // Create a new sessionId

	        this.state.memorizedSessionId = uuid_1$1.v4();
	        idCookieComponents[6] = this.state.memorizedSessionId; // Set lastVisitTs to currentVisitTs

	        idCookieComponents[5] = idCookieComponents[4];
	      }

	      if (this.config.stateStorageStrategy != 'none') {
	        this[setSessionCookie](); // Update currentVisitTs

	        idCookieComponents[4] = Math.round(new Date().getTime() / 1000);
	        idCookieComponents.shift();
	        this[setDomainUserIdCookie].apply(this, idCookieComponents);
	      }
	    }
	    /*
	     * Load visitor ID cookie
	     */

	  }, {
	    key: loadDomainUserIdCookie,
	    value: function value() {
	      if (this.config.stateStorageStrategy == 'none') {
	        return [];
	      }

	      var now = new Date(),
	          nowTs = Math.round(now.getTime() / 1000),
	          id = this[getSnowplowCookieValue]('id');
	      var tmpContainer;

	      if (id) {
	        tmpContainer = id.split('.'); // cookies enabled

	        tmpContainer.unshift('0');
	      } else {
	        tmpContainer = [// cookies disabled
	        '1', // Domain user ID
	        this.state.domainUserId, // Creation timestamp - seconds since Unix epoch
	        nowTs, // visitCount - 0 = no previous visit
	        0, // Current visit timestamp
	        nowTs, // Last visit timestamp - blank meaning no previous visit
	        ''];
	      }

	      if (!tmpContainer[6]) {
	        // session id
	        tmpContainer[6] = uuid_1$1.v4();
	      }

	      return tmpContainer;
	    }
	    /*
	     * Attaches common web fields to every request
	     * (resolution, url, referrer, etc.)
	     * Also sets the required cookies.
	     */

	  }, {
	    key: addBrowserData,
	    value: function value(sb) {
	      var nowTs = Math.round(new Date().getTime() / 1000),
	          idname = this[getSnowplowCookieName]('id'),
	          sesname = this[getSnowplowCookieName]('ses'),
	          ses = this[getSnowplowCookieValue]('ses'),
	          id = this[loadDomainUserIdCookie](),
	          cookiesDisabled = id[0],
	          _domainUserId = id[1],
	          // We could use the global (domainUserId) but this is better etiquette
	      createTs = id[2],
	          visitCount = id[3],
	          currentVisitTs = id[4],
	          lastVisitTs = id[5],
	          sessionIdFromCookie = id[6];
	      var toOptoutByCookie = !!window.cookie(this.config.optOutCookie);

	      if ((this.config.doNotTrack || toOptoutByCookie) && this.config.stateStorageStrategy != 'none') {
	        if (this.config.stateStorageStrategy == 'localStorage') {
	          attemptWriteLocalStorage(idname, '');
	          attemptWriteLocalStorage(sesname, '');
	        } else if (this.config.stateStorageStrategy == 'cookie' || this.config.stateStorageStrategy == 'cookieAndLocalStorage') {
	          window.cookie(idname, '', -1, this.config.cookiePath, this.config.cookieDomain);
	          window.cookie(sesname, '', -1, this.config.cookiePath, this.config.cookieDomain);
	        }

	        return;
	      } // If cookies are enabled, base visit count and session ID on the cookies


	      if (cookiesDisabled === '0') {
	        this.state.memorizedSessionId = sessionIdFromCookie; // New session?

	        if (!ses && this.config.stateStorageStrategy != 'none') {
	          // New session (aka new visit)
	          visitCount++; // Update the last visit timestamp

	          lastVisitTs = currentVisitTs; // Regenerate the session ID

	          this.state.memorizedSessionId = uuid_1$1.v4();
	        }

	        this.state.memorizedVisitCount = visitCount; // Otherwise, a new session starts if configSessionCookieTimeout seconds have passed since the last event
	      } else {
	        if (new Date().getTime() - this.state.lastEventTime > this.config.sessionCookieTimeout * 1000) {
	          this.state.memorizedSessionId = uuid_1$1.v4();
	          this.state.memorizedVisitCount++;
	        }
	      } // Build out the rest of the request


	      sb.add('vp', detectViewport());
	      sb.add('ds', detectDocumentSize());
	      sb.add('vid', this.state.memorizedVisitCount);
	      sb.add('sid', this.state.memorizedSessionId);
	      sb.add('duid', _domainUserId); // Set to our local variable

	      sb.add('fp', this.state.userFingerprint);
	      sb.add('uid', this.state.businessUserId);
	      this[refreshUrl]();
	      sb.add('refr', this[purify](this.config.customReferrer || this.state.referrerUrl)); // Add the page URL last as it may take us over the IE limit (and we don't always need it)

	      sb.add('url', this[purify](this.config.customReferrer || this.state.locationHrefAlias)); // Update cookies

	      if (this.config.stateStorageStrategy != 'none') {
	        this[setDomainUserIdCookie](_domainUserId, createTs, this.state.memorizedVisitCount, nowTs, lastVisitTs, this.state.memorizedSessionId);
	        this[setSessionCookie]();
	      }

	      this.state.lastEventTime = new Date().getTime();
	    }
	    /**
	     * Builds a collector URL from a CloudFront distribution.
	     * We don't bother to support custom CNAMEs because Amazon CloudFront doesn't support that for SSL.
	     *
	     * @param string account The account ID to build the tracker URL from
	     *
	     * @return string The URL on which the collector is hosted
	     */

	  }, {
	    key: collectorUrlFromCfDist,
	    value: function value(distSubdomain) {
	      return this[asCollectorUrl](distSubdomain + '.cloudfront.net');
	    }
	    /**
	     * Adds the protocol in front of our collector URL, and i to the end
	     *
	     * @param string rawUrl The collector URL without protocol
	     *
	     * @return string collectorUrl The tracker URL with protocol
	     */

	  }, {
	    key: asCollectorUrl,
	    value: function value(rawUrl) {
	      if (this.state.forceSecureTracker) {
	        return "https://".concat(rawUrl);
	      }

	      if (this.state.forceUnsecureTracker) {
	        return "http://".concat(rawUrl);
	      }

	      return ('https:' === this.state.documentAlias.location.protocol ? 'https' : 'http') + "://".concat(rawUrl);
	    }
	    /**
	     * Add common contexts to every event
	     * TODO: move this functionality into the core
	     *
	     * @param array userContexts List of user-defined contexts
	     * @return userContexts combined with commonContexts
	     */

	  }, {
	    key: addCommonContexts,
	    value: function value(userContexts) {
	      var combinedContexts = this.state.commonContexts.concat(userContexts || []);

	      if (this.config.contexts.webPage) {
	        combinedContexts.push(this[getWebPageContext]());
	      } // Add PerformanceTiming Context


	      if (this.config.contexts.performanceTiming) {
	        var performanceTimingContext = this[getPerformanceTimingContext]();

	        if (performanceTimingContext) {
	          combinedContexts.push(performanceTimingContext);
	        }
	      } // Add Optimizely Contexts


	      if (this.state.windowAlias.optimizely) {
	        if (this.config.contexts.optimizelySummary) {
	          var activeExperiments = this[getOptimizelySummaryContexts]();
	          activeExperiments.forEach(function (e) {
	            combinedContexts.push(e);
	          });
	        }

	        if (this.config.contexts.optimizelyXSummary) {
	          var _activeExperiments = this[getOptimizelyXSummaryContexts]();

	          _activeExperiments.forEach(function (e) {
	            combinedContexts.push(e);
	          });
	        }

	        if (this.config.contexts.optimizelyExperiments) {
	          var experimentContexts = this[getOptimizelyExperimentContexts]();
	          experimentContexts.forEach(function (e) {
	            combinedContexts.push(e);
	          }); // for (var i = 0; i < experimentContexts.length; i++) {
	          //     combinedContexts.push(experimentContexts[i])
	          // }
	        }

	        if (this.config.contexts.optimizelyStates) {
	          var stateContexts = this[getOptimizelyStateContexts]();
	          stateContexts.forEach(function (e) {
	            combinedContexts.push(e);
	          }); // for (var i = 0; i < stateContexts.length; i++) {
	          //     combinedContexts.push(stateContexts[i])
	          // }
	        }

	        if (this.config.contexts.optimizelyVariations) {
	          var variationContexts = this[getOptimizelyVariationContexts]();
	          variationContexts.forEach(function (e) {
	            combinedContexts.push(e);
	          }); // for (var i = 0; i < variationContexts.length; i++) {
	          //     combinedContexts.push(variationContexts[i])
	          // }
	        }

	        if (this.config.contexts.optimizelyVisitor) {
	          var optimizelyVisitorContext = getOptimizelyVisitorContext();

	          if (optimizelyVisitorContext) {
	            combinedContexts.push(optimizelyVisitorContext);
	          }
	        }

	        if (this.config.contexts.optimizelyAudiences) {
	          var audienceContexts = getOptimizelyAudienceContexts();

	          for (var i = 0; i < audienceContexts.length; i++) {
	            combinedContexts.push(audienceContexts[i]);
	          }
	        }

	        if (this.config.contexts.optimizelyDimensions) {
	          var dimensionContexts = getOptimizelyDimensionContexts();
	          dimensionContexts.forEach(function (e) {
	            combinedContexts.push(e);
	          }); // for (var i = 0; i < dimensionContexts.length; i++) {
	          //     combinedContexts.push(dimensionContexts[i])
	          // }
	        }
	      } // Add Augur Context


	      if (this.config.contexts.augurIdentityLite) {
	        var augurIdentityLiteContext = this[getAugurIdentityLiteContext]();

	        if (augurIdentityLiteContext) {
	          combinedContexts.push(augurIdentityLiteContext);
	        }
	      } //Add Parrable Context


	      if (this.config.contexts.parrable) {
	        var parrableContext = this[getParrableContext]();

	        if (parrableContext) {
	          combinedContexts.push(parrableContext);
	        }
	      }

	      return combinedContexts;
	    }
	    /**
	     * Initialize new `pageViewId` if it shouldn't be preserved.
	     * Should be called when `trackPageView` is invoked
	     */

	  }, {
	    key: resetPageView,
	    value: function value() {
	      if (!this.state.preservePageViewId || this.mutSnowplowState.pageViewId == null) {
	        this.mutSnowplowState.pageViewId = uuid_1$1.v4();
	      }
	    }
	    /**
	     * Safe function to get `pageViewId`.
	     * Generates it if it wasn't initialized by other tracker
	     */

	  }, {
	    key: _getPageViewId,
	    value: function value() {
	      if (this.mutSnowplowState.pageViewId == null) {
	        this.mutSnowplowState.pageViewId = uuid_1$1.v4();
	      }

	      return this.mutSnowplowState.pageViewId;
	    }
	    /**
	     * Put together a web page context with a unique UUID for the page view
	     *
	     * @return object web_page context
	     */

	  }, {
	    key: getWebPageContext,
	    value: function value() {
	      return {
	        schema: 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0',
	        data: {
	          id: this[_getPageViewId]()
	        }
	      };
	    }
	    /**
	     * Creates a context from the window.performance.timing object
	     *
	     * @return object PerformanceTiming context
	     */

	  }, {
	    key: getPerformanceTimingContext,
	    value: function value() {
	      var allowedKeys = ['navigationStart', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'secureConnectionStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'unloadEventStart', 'unloadEventEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd', 'msFirstPaint', 'chromeFirstPaint', 'requestEnd', 'proxyStart', 'proxyEnd'];
	      var performance = this.state.windowAlias.performance || this.state.windowAlias.mozPerformance || this.state.windowAlias.msPerformance || this.state.windowAlias.webkitPerformance;

	      if (performance) {
	        // On Safari, the fields we are interested in are on the prototype chain of
	        // performance.timing so we cannot copy them using lodash.clone
	        var performanceTiming = {};

	        for (var field in performance.timing) {
	          if (isValueInArray(field, allowedKeys) && performance.timing[field] !== null) {
	            performanceTiming[field] = performance.timing[field];
	          }
	        } // Old Chrome versions add an unwanted requestEnd field


	        delete performanceTiming.requestEnd; // Add the Chrome firstPaintTime to the performance if it exists

	        if (this.state.windowAlias.chrome && this.state.windowAlias.chrome.loadTimes && typeof this.state.windowAlias.chrome.loadTimes().firstPaintTime === 'number') {
	          performanceTiming.chromeFirstPaint = Math.round(this.state.windowAlias.chrome.loadTimes().firstPaintTime * 1000);
	        }

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

	  }, {
	    key: getOptimizelyData,
	    value: function value(property, snd) {
	      var data;

	      if (this.state.windowAlias.optimizely && this.state.windowAlias.optimizely.data) {
	        data = this.state.windowAlias.optimizely.data[property];

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

	  }, {
	    key: getOptimizelyXData,
	    value: function value(property, snd) {
	      var data;

	      if (this.state.windowAlias.optimizely) {
	        data = this.state.windowAlias.optimizely.get(property);

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

	  }, {
	    key: getOptimizelySummary,
	    value: function value() {
	      var state = this[getOptimizelyData]('state');
	      var experiments = this[getOptimizelyData]('experiments');
	      return (state && experiments && state.activeExperiments).map(function (activeExperiment) {
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

	  }, {
	    key: getOptimizelyXSummary,
	    value: function value() {
	      var state = this[getOptimizelyXData]('state');
	      var experiment_ids = state.getActiveExperimentIds(); //const experiments = this[getOptimizelyXData]('data', 'experiments')

	      var visitor = this[getOptimizelyXData]('visitor');
	      return experiment_ids.map(function (activeExperiment) {
	        var variation = state.getVariationMap()[activeExperiment];
	        var variationName = variation.name;
	        var variationId = variation.id;
	        var visitorId = visitor.visitorId;
	        return {
	          experimentId: pInt(activeExperiment),
	          variationName: variationName,
	          variation: pInt(variationId),
	          visitorId: visitorId
	        };
	      });
	    }
	    /**
	     * Creates a context from the window['optimizely'].data.experiments object
	     *
	     * @return Array Experiment contexts
	     */

	  }, {
	    key: getOptimizelyExperimentContexts,
	    value: function value() {
	      var experiments = this[getOptimizelyData]('experiments');

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

	  }, {
	    key: getOptimizelyStateContexts,
	    value: function value() {
	      var experimentIds = [];
	      var experiments = this[getOptimizelyData]('experiments');

	      if (experiments) {
	        for (var key in experiments) {
	          if (experiments.hasOwnProperty(key)) {
	            experimentIds.push(key);
	          }
	        }
	      }

	      var state = this[getOptimizelyData]('state');

	      if (state) {
	        var contexts = [];
	        var activeExperiments = state.activeExperiments || [];

	        for (var i = 0; i < experimentIds.length; i++) {
	          var experimentId = experimentIds[i];
	          var context = {};
	          context.experimentId = experimentId;
	          context.isActive = isValueInArray(experimentIds[i], activeExperiments);
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

	  }, {
	    key: getOptimizelyVariationContexts,
	    value: function value() {
	      var variations = this[getOptimizelyData]('variations');

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

	  }, {
	    key: getOptimizelyVisitorContext,
	    value: function value() {
	      var visitor = this[getOptimizelyData]('visitor');

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

	  }, {
	    key: getOptimizelyAudienceContexts,
	    value: function value() {
	      var audienceIds = this[getOptimizelyData]('visitor', 'audiences');

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

	  }, {
	    key: getOptimizelyDimensionContexts,
	    value: function value() {
	      var dimensionIds = this[getOptimizelyData]('visitor', 'dimensions');

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

	  }, {
	    key: getOptimizelySummaryContexts,
	    value: function value() {
	      return this[getOptimizelySummary]().map(function (experiment) {
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

	  }, {
	    key: getOptimizelyXSummaryContexts,
	    value: function value() {
	      return this[getOptimizelyXSummary]().map(function (experiment) {
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

	  }, {
	    key: getAugurIdentityLiteContext,
	    value: function value() {
	      var augur = this.state.windowAlias.augur;

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

	  }, {
	    key: getParrableContext,
	    value: function value() {
	      var parrable = window['_hawk'];

	      if (parrable) {
	        var context = {
	          encryptedId: null,
	          optout: null
	        };
	        context['encryptedId'] = parrable.browserid;
	        var regex = new RegExp('(?:^|;)\\s?' + '_parrable_hawk_optout'.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1') + '=(.*?)(?:;|$)', 'i'),
	            match = document.cookie.match(regex);
	        context['optout'] = match && decodeURIComponent(match[1]) ? match && decodeURIComponent(match[1]) : 'false';
	        return {
	          schema: 'iglu:com.parrable/encrypted_payload/jsonschema/1-0-0',
	          data: context
	        };
	      }
	    }
	    /**
	     * Expires current session and starts a new session.
	     */

	  }, {
	    key: _newSession,
	    value: function value() {
	      // If cookies are enabled, base visit count and session ID on the cookies
	      var nowTs = Math.round(new Date().getTime() / 1000),
	          //ses = this[getSnowplowCookieValue]('ses'),
	      id = this[loadDomainUserIdCookie](),
	          cookiesDisabled = id[0],
	          _domainUserId = id[1],
	          // We could use the global (domainUserId) but this is better etiquette
	      createTs = id[2],
	          visitCount = id[3],
	          currentVisitTs = id[4],
	          lastVisitTs = id[5],
	          sessionIdFromCookie = id[6]; // When cookies are enabled

	      if (cookiesDisabled === '0') {
	        this.state.memorizedSessionId = sessionIdFromCookie; // When cookie/local storage is enabled - make a new session

	        if (this.stateStorageStrategy != 'none') {
	          // New session (aka new visit)
	          visitCount++; // Update the last visit timestamp

	          lastVisitTs = currentVisitTs; // Regenerate the session ID

	          this.state.memorizedSessionId = uuid_1$1.v4();
	        }

	        this.state.memorizedVisitCount = visitCount; // Create a new session cookie

	        setSessionCookie();
	      } else {
	        this.state.memorizedSessionId = uuid_1$1.v4();
	        this.state.memorizedVisitCount++;
	      } // Update cookies


	      if (this.config.stateStorageStrategy != 'none') {
	        setDomainUserIdCookie(_domainUserId, createTs, this.state.memorizedVisitCount, nowTs, lastVisitTs, this.state.memorizedSessionId);
	        setSessionCookie();
	      }

	      this.state.lastEventTime = new Date().getTime();
	    }
	    /**
	     * Attempts to create a context using the geolocation API and add it to commonContexts
	     */

	  }, {
	    key: _enableGeolocationContext,
	    value: function value() {
	      var _this4 = this;

	      if (!this.state.geolocationContextAdded && this.state.navigatorAlias.geolocation && this.state.navigatorAlias.geolocation.getCurrentPosition) {
	        this.state.geolocationContextAdded = true;
	        this.state.navigatorAlias.geolocation.getCurrentPosition(function (position) {
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

	          _this4.state.commonContexts.push(geolocationContext);
	        });
	      }
	    }
	    /**
	     * Creates a context containing the values of the cookies set by GA
	     *
	     * @return object GA cookies context
	     */

	  }, {
	    key: getGaCookiesContext,
	    value: function value() {
	      var gaCookieData = {};
	      var gaCookies = ['__utma', '__utmb', '__utmc', '__utmv', '__utmz', '_ga'];
	      gaCookies.forEach(function (cookieType) {
	        var value = window.cookie(cookieType);

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

	  }, {
	    key: finalizeContexts,
	    value: function value(staticContexts, contextCallback) {
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

	  }, {
	    key: logPageView,
	    value: function value(customTitle, context, contextCallback, tstamp) {
	      var _this5 = this;

	      //TODO: This function is a monster and probably should be refactored.
	      this[refreshUrl]();

	      if (this.state.pageViewSent) {
	        // Do not reset pageViewId if previous events were not page_view
	        this[resetPageView]();
	      }

	      this.state.pageViewSent = true; // So we know what document.title was at the time of trackPageView

	      this.state.lastDocumentTitle = this.state.documentAlias.title;
	      this.state.lastConfigTitle = customTitle; // Fixup page title

	      var pageTitle = fixupTitle(this.state.lastConfigTitle || this.state.lastDocumentTitle); // Log page view

	      this.core.trackPageView(this[purify](this.config.customUrl || this.state.locationHrefAlias), pageTitle, this[purify](this.state.customReferrer || this.state.referrerUrl), this[addCommonContexts](this[finalizeContexts](context, contextCallback)), tstamp); // Send ping (to log that user has stayed on page)

	      var now = new Date();

	      if (this.state.activityTrackingEnabled && !this.state.activityTrackingInstalled) {
	        this.state.activityTrackingInstalled = true; // Add mousewheel event handler, detect passive event listeners for performance

	        var detectPassiveEvents = {
	          update: function update() {
	            if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
	              var passive = false;
	              var options = Object.defineProperty({}, 'passive', {
	                get: function get() {
	                  return passive = true;
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

	        var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' // Modern browsers support "wheel"
	        : document.onmousewheel !== undefined ? 'mousewheel' // Webkit and IE support at least "mousewheel"
	        : 'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

	        if (Object.prototype.hasOwnProperty.call(detectPassiveEvents, 'hasSupport')) {
	          addEventListener(this.state.documentAlias, wheelEvent, function () {
	          }, {
	            passive: true
	          });
	        } else {
	          addEventListener(this.state.documentAlias, wheelEvent, function () {
	          });
	        } // Capture our initial scroll points


	        this[resetMaxScrolls](); // Add event handlers; cross-browser compatibility here varies significantly
	        // @see http://quirksmode.org/dom/events

	        addEventListener(this.state.documentAlias, 'click', function () {
	        });
	        addEventListener(this.state.documentAlias, 'mouseup', function () {
	        });
	        addEventListener(this.state.documentAlias, 'mousedown', function () {
	        });
	        addEventListener(this.state.documentAlias, 'mousemove', function () {
	        });
	        addEventListener(this.state.windowAlias, 'scroll', function () {
	        }); // Will updateMaxScrolls() for us

	        addEventListener(this.state.documentAlias, 'keypress', function () {
	        });
	        addEventListener(this.state.documentAlias, 'keydown', function () {
	        });
	        addEventListener(this.state.documentAlias, 'keyup', function () {
	        });
	        addEventListener(this.state.windowAlias, 'resize', function () {
	        });
	        addEventListener(this.state.windowAlias, 'focus', function () {
	        });
	        addEventListener(this.state.windowAlias, 'blur', function () {
	        }); // Periodic check for activity.

	        this.state.lastActivityTime = now.getTime();
	        clearInterval(this.state.pagePingInterval);
	        this.state.pagePingInterval = setInterval(function () {
	          var now = new Date(); // There was activity during the heart beat period;
	          // on average, this is going to overstate the visitDuration by configHeartBeatTimer/2

	          if (_this5.state.lastActivityTime + _this5.config.heartBeatTimer > now.getTime()) {
	            // Send ping if minimum visit time has elapsed
	            if (_this5.state.minimumVisitTime < now.getTime()) {
	              _this5[logPagePing](_this5[finalizeContexts](context, contextCallback)); // Grab the min/max globals

	            }
	          }
	        }, this.config.heartBeatTimer);
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

	  }, {
	    key: logPagePing,
	    value: function value(context) {
	      this[refreshUrl]();
	      var newDocumentTitle = this.state.documentAlias.title;

	      if (newDocumentTitle !== this.state.lastDocumentTitle) {
	        this.state.lastDocumentTitle = newDocumentTitle;
	        this.state.lastConfigTitle = null;
	      }

	      this.core.trackPagePing(this[purify](this.config.customUrl || this.state.locationHrefAlias), fixupTitle(this.state.lastConfigTitle || this.state.lastDocumentTitle), this[purify](this.config.customReferrer || this.config.referrerUrl), this[cleanOffset](this.state.minXOffset), this[cleanOffset](this.state.maxXOffset), this[cleanOffset](this.state.minYOffset), this[cleanOffset](this.state.maxYOffset), this[addCommonContexts](context));
	      this[resetMaxScrolls]();
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

	  }, {
	    key: logTransaction,
	    value: function value(orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
	      this.core.trackEcommerceTransaction(orderId, affiliation, total, tax, shipping, city, state, country, currency, this[addCommonContexts](context), tstamp);
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

	  }, {
	    key: logTransactionItem,
	    value: function value(orderId, sku, name, category, price, quantity, currency, context, tstamp) {
	      this.core.trackEcommerceTransactionItem(orderId, sku, name, category, price, quantity, currency, this[addCommonContexts](context), tstamp);
	    }
	    /**
	     * Construct a browser prefix
	     *
	     * E.g: (moz, hidden) -> mozHidden
	     */

	  }, {
	    key: prefixPropertyName,
	    value: function value(prefix, propertyName) {
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

	  }, {
	    key: trackCallback,
	    value: function value(callback) {
	      var _this6 = this;

	      var isPreRendered,
	          i,
	          // Chrome 13, IE10, FF10
	      prefixes = ['', 'webkit', 'ms', 'moz'],
	          prefix; // If configPrerendered == true - we'll never set `isPreRendered` to true and fire immediately,
	      // otherwise we need to check if this is just prerendered

	      if (!this.config.countPreRendered) {
	        // true by default
	        for (i = 0; i < prefixes.length; i++) {
	          prefix = prefixes[i]; // does this browser support the page visibility API? (drop this check along with IE9 and iOS6)

	          if (this.state.documentAlias[this[prefixPropertyName](prefix, 'hidden')]) {
	            // if pre-rendered, then defer callback until page visibility changes
	            if (this.state.documentAlias[this[prefixPropertyName](prefix, 'visibilityState')] === 'prerender') {
	              isPreRendered = true;
	            }

	            break;
	          } else if (this.state.documentAlias[this[prefixPropertyName](prefix, 'hidden')] === false) {
	            break;
	          }
	        }
	      }

	      var eventHandler = function eventHandler() {
	        _this6.state.documentAlias.removeEventListener(prefix + 'visibilitychange', eventHandler, false);

	        callback();
	      }; // Implies configCountPreRendered = false


	      if (isPreRendered) {
	        // note: the event name doesn't follow the same naming convention as vendor properties
	        addEventListener(this.state.documentAlias, prefix + 'visibilitychange', eventHandler);
	        return;
	      } // configCountPreRendered === true || isPreRendered === false


	      callback();
	    }
	    /**
	     * Get the domain session index also known as current memorized visit count.
	     *
	     * @return int Domain session index
	     */

	  }, {
	    key: "getDomainSessionIndex",
	    value: function getDomainSessionIndex() {
	      return this.state.memorizedVisitCount;
	    }
	    /**
	     * Get the page view ID as generated or provided by mutSnowplowState.pageViewId.
	     *
	     * @return string Page view ID
	     */

	  }, {
	    key: "getPageViewId",
	    value: function getPageViewId() {
	      return this[_getPageViewId]();
	    }
	    /**
	     * Expires current session and starts a new session.
	     */

	  }, {
	    key: "newSession",
	    value: function newSession() {
	      this[_newSession]();
	    }
	    /**
	     * Get the cookie name as cookieName + basename + . + domain.
	     *
	     * @return string Cookie name
	     */

	  }, {
	    key: "getCookieName",
	    value: function getCookieName(basename) {
	      return this[getSnowplowCookieName](basename);
	    }
	    /**
	     * Get the current user ID (as set previously
	     * with setUserId()).
	     *
	     * @return string Business-defined user ID
	     */

	  }, {
	    key: "getUserId",
	    value: function getUserId() {
	      return this.state.businessUserId;
	    }
	    /**
	     * Get visitor ID (from first party cookie)
	     *
	     * @return string Visitor ID in hexits (or null, if not yet known)
	     */

	  }, {
	    key: "getDomainUserId",
	    value: function getDomainUserId() {
	      return this[loadDomainUserIdCookie]()[1];
	    }
	    /**
	     * Get the visitor information (from first party cookie)
	     *
	     * @return array
	     */

	  }, {
	    key: "getDomainUserInfo",
	    value: function getDomainUserInfo() {
	      return this[loadDomainUserIdCookie]();
	    }
	    /**
	     * Get the user fingerprint
	     *
	     * @return string The user fingerprint
	     */

	  }, {
	    key: "getUserFingerprint",
	    value: function getUserFingerprint() {
	      return this.state.userFingerprint;
	    }
	    /**
	     * Specify the app ID
	     *
	     * @param int|string appId
	     */

	  }, {
	    key: "setAppId",
	    value: function setAppId(appId) {
	      warn('setAppId is deprecated. Instead add an "appId" field to the argmap argument of newTracker.');
	      this.core.setAppId(appId);
	    }
	    /**
	     * Override referrer
	     *
	     * @param string url
	     */

	  }, {
	    key: "setReferrerUrl",
	    value: function setReferrerUrl(url) {
	      this.config.customReferrer = url;
	    }
	    /**
	     * Override url
	     *
	     * @param string url
	     */

	  }, {
	    key: "setCustomUrl",
	    value: function setCustomUrl(url) {
	      this[refreshUrl]();
	      this.config.customUrl = this[resolveRelativeReference](this.state.locationHrefAlias, url);
	    }
	    /**
	     * Override document.title
	     *
	     * @param string title
	     */

	  }, {
	    key: "setDocumentTitle",
	    value: function setDocumentTitle(title) {
	      // So we know what document.title was at the time of trackPageView
	      this.state.lastDocumentTitle = this.state.documentAlias.title;
	      this.state.lastConfigTitle = title;
	    }
	    /**
	     * Strip hash tag (or anchor) from URL
	     *
	     * @param bool enableFilter
	     */

	  }, {
	    key: "discardHashTag",
	    value: function discardHashTag(enableFilter) {
	      this.state.discardHashTag = enableFilter;
	    }
	    /**
	     * Set first-party cookie name prefix
	     *
	     * @param string cookieName
	     */

	  }, {
	    key: "setCookieNamePrefix",
	    value: function setCookieNamePrefix(cookieNamePrefix) {
	      warn('setCookieNamePrefix is deprecated. Instead add a "cookieName" field to the argmap argument of newTracker.');
	      this.config.cookieName = cookieNamePrefix;
	    }
	    /**
	     * Set first-party cookie domain
	     *
	     * @param string domain
	     */

	  }, {
	    key: "setCookieDomain",
	    value: function setCookieDomain(domain) {
	      warn('setCookieDomain is deprecated. Instead add a "cookieDomain" field to the argmap argument of newTracker.');
	      this.config.cookieDomain = fixupDomain(domain);
	      this[updateDomainHash]();
	    }
	    /**
	     * Set first-party cookie path
	     *
	     * @param string domain
	     */

	  }, {
	    key: "setCookiePath",
	    value: function setCookiePath(path) {
	      this.state.cookiePath = path;
	      this[updateDomainHash]();
	    }
	    /**
	     * Set visitor cookie timeout (in seconds)
	     *
	     * @param int timeout
	     */

	  }, {
	    key: "setVisitorCookieTimeout",
	    value: function setVisitorCookieTimeout(timeout) {
	      this.config.sessionCookieTimeout = timeout;
	    }
	    /**
	     * Set session cookie timeout (in seconds)
	     *
	     * @param int timeout
	     */

	  }, {
	    key: "setSessionCookieTimeout",
	    value: function setSessionCookieTimeout(timeout) {
	      warn('setSessionCookieTimeout is deprecated. Instead add a "sessionCookieTimeout" field to the argmap argument of newTracker.');
	      this.config.sessionCookieTimeout = timeout;
	    }
	    /**
	     * @param number seed The seed used for MurmurHash3
	     */

	  }, {
	    key: "setUserFingerprintSeed",
	    value: function setUserFingerprintSeed(seed) {
	      warn('setUserFingerprintSeed is deprecated. Instead add a "userFingerprintSeed" field to the argmap argument of newTracker.');
	      this.config.userFingerprintSeed = seed;
	      this.state.userFingerprint = detectSignature(this.config.userFingerprintSeed);
	    }
	    /**
	     * Enable/disable user fingerprinting. User fingerprinting is enabled by default.
	     * @param bool enable If false, turn off user fingerprinting
	     */

	  }, {
	    key: "enableUserFingerprint",
	    value: function enableUserFingerprint(enable) {
	      warn('enableUserFingerprintSeed is deprecated. Instead add a "userFingerprint" field to the argmap argument of newTracker.');

	      if (!enable) {
	        this.config.userFingerprint = false;
	        this.state.userFingerprint = '';
	      }
	    }
	    /**
	     * Prevent tracking if user's browser has Do Not Track feature enabled,
	     * where tracking is:
	     * 1) Sending events to a collector
	     * 2) Setting first-party cookies
	     * @param bool enable If true and Do Not Track feature enabled, don't track.
	     */

	  }, {
	    key: "respectDoNotTrack",
	    value: function respectDoNotTrack(enable) {
	      warn('This usage of respectDoNotTrack is deprecated. Instead add a "respectDoNotTrack" field to the argmap argument of newTracker.');
	      var dnt = this.state.navigatorAlias.doNotTrack || this.state.navigatorAlias.msDoNotTrack;
	      this.config.doNotTrack = enable && (dnt === 'yes' || dnt === '1');
	    }
	    /**
	     * Enable querystring decoration for links pasing a filter
	     *
	     * @param function crossDomainLinker Function used to determine which links to decorate
	     */

	  }, {
	    key: "crossDomainLinker",
	    value: function crossDomainLinker(crossDomainLinkerCriterion) {
	      this[decorateLinks](crossDomainLinkerCriterion);
	    }
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

	  }, {
	    key: "enableLinkClickTracking",
	    value: function enableLinkClickTracking(criterion, pseudoClicks, trackContent, context) {
	      var _this7 = this;

	      if (this.mutSnowplowState.hasLoaded) {
	        // the load event has already fired, add the click listeners now
	        this.linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);
	        LinkTrackingManager.addClickListeners();
	      } else {
	        // defer until page has loaded
	        this.mutSnowplowState.registeredOnLoadHandlers.push(function () {
	          _this7.linkTrackingManager.configureLinkClickTracking(criterion, pseudoClicks, trackContent, context);

	          _this7.linkTrackingManager.addClickListeners();
	        });
	      }
	    }
	    /**
	     * Add click event listeners to links which have been added to the page since the
	     * last time enableLinkClickTracking or refreshLinkClickTracking was used
	     */

	  }, {
	    key: "refreshLinkClickTracking",
	    value: function refreshLinkClickTracking() {
	      if (this.mutSnowplowState.hasLoaded) {
	        this.linkTrackingManager.addClickListeners();
	      } else {
	        this.mutSnowplowState.registeredOnLoadHandlers.push(function () {
	          this.linkTrackingManager.addClickListeners();
	        });
	      }
	    }
	    /**
	     * Enables page activity tracking (sends page
	     * pings to the Collector regularly).
	     *
	     * @param int minimumVisitLength Seconds to wait before sending first page ping
	     * @param int heartBeatDelay Seconds to wait between pings
	     */

	  }, {
	    key: "enableActivityTracking",
	    value: function enableActivityTracking(minimumVisitLength, heartBeatDelay) {
	      if (minimumVisitLength === pInt(minimumVisitLength, 10) && heartBeatDelay === pInt(heartBeatDelay, 10)) {
	        this.state.activityTrackingEnabled = true;
	        this.config.minimumVisitTime = new Date().getTime() + minimumVisitLength * 1000;
	        this.config.heartBeatTimer = heartBeatDelay * 1000;
	      } else {
	        warn('Activity tracking not enabled, please provide integer values ' + 'for minimumVisitLength and heartBeatDelay.');
	      }
	    }
	    /**
	     * Triggers the activityHandler manually to allow external user defined
	     * activity. i.e. While watching a video
	     */

	  }, {
	    key: "updatePageActivity",
	    value: function updatePageActivity() {
	      this[activityHandler]();
	    }
	    /**
	     * Enables automatic form tracking.
	     * An event will be fired when a form field is changed or a form submitted.
	     * This can be called multiple times: only forms not already tracked will be tracked.
	     *
	     * @param object config Configuration object determining which forms and fields to track.
	     *                      Has two properties: "forms" and "fields"
	     * @param array context Context for all form tracking events
	     */

	  }, {
	    key: "enableFormTracking",
	    value: function enableFormTracking(config, context) {
	      var _this8 = this;

	      if (this.mutSnowplowState.hasLoaded) {
	        this.formTrackingManager.configureFormTracking(config);
	        this.formTrackingManager.addFormListeners(context);
	      } else {
	        this.mutSnowplowState.registeredOnLoadHandlers.push(function () {
	          _this8.formTrackingManager.configureFormTracking(config);

	          _this8.formTrackingManager.addFormListeners(context);
	        });
	      }
	    }
	    /**
	     * Frame buster
	     */

	  }, {
	    key: "killFrame",
	    value: function killFrame() {
	      if (this.state.windowAlias.location !== this.state.windowAlias.top.location) {
	        this.state.windowAlias.top.location = this.state.windowAlias.location;
	      }
	    }
	    /**
	     * Redirect if browsing offline (aka file: buster)
	     *
	     * @param string url Redirect to this URL
	     */

	  }, {
	    key: "redirectFile",
	    value: function redirectFile(url) {
	      if (this.state.windowAlias.location.protocol === 'file:') {
	        this.state.windowAlias.location = url;
	      }
	    }
	    /**
	     * Sets the opt out cookie.
	     *
	     * @param string name of the opt out cookie
	     */

	  }, {
	    key: "setOptOutCookie",
	    value: function setOptOutCookie(name) {
	      this.config.optOutCookie = name;
	    }
	    /**
	     * Count sites in pre-rendered state
	     *
	     * @param bool enable If true, track when in pre-rendered state
	     */

	  }, {
	    key: "setCountPreRendered",
	    value: function setCountPreRendered(enable) {
	      this.config.countPreRendered = enable;
	    }
	    /**
	     * Set the business-defined user ID for this user.
	     *
	     * @param string userId The business-defined user ID
	     */

	  }, {
	    key: "setUserId",
	    value: function setUserId(userId) {
	      this.state.businessUserId = userId;
	    }
	    /**
	     * Alias for setUserId.
	     *
	     * @param string userId The business-defined user ID
	     */

	  }, {
	    key: "identifyUser",
	    value: function identifyUser(userId) {
	      this.setUserId(userId);
	    }
	    /**
	     * Set the business-defined user ID for this user using the location querystring.
	     *
	     * @param string queryName Name of a querystring name-value pair
	     */

	  }, {
	    key: "setUserIdFromLocation",
	    value: function setUserIdFromLocation(querystringField) {
	      this[refreshUrl]();
	      this.state.businessUserId = fromQuerystring(querystringField, this.state.locationHrefAlias);
	    }
	    /**
	     * Set the business-defined user ID for this user using the referrer querystring.
	     *
	     * @param string queryName Name of a querystring name-value pair
	     */

	  }, {
	    key: "setUserIdFromReferrer",
	    value: function setUserIdFromReferrer(querystringField) {
	      refreshUrl();
	      this.state.businessUserId = fromQuerystring(querystringField, this.config.referrerUrl);
	    }
	    /**
	     * Set the business-defined user ID for this user to the value of a cookie.
	     *
	     * @param string cookieName Name of the cookie whose value will be assigned to businessUserId
	     */

	  }, {
	    key: "setUserIdFromCookie",
	    value: function setUserIdFromCookie(cookieName) {
	      this.state.businessUserId = window.cookie(cookieName);
	    }
	    /**
	     * Configure this tracker to log to a CloudFront collector.
	     *
	     * @param string distSubdomain The subdomain on your CloudFront collector's distribution
	     */

	  }, {
	    key: "setCollectorCf",
	    value: function setCollectorCf(distSubdomain) {
	      this.config.collectorUrl = this[collectorUrlFromCfDist](distSubdomain);
	    }
	    /**
	     *
	     * Specify the Snowplow collector URL. No need to include HTTP
	     * or HTTPS - we will add this.
	     *
	     * @param string rawUrl The collector URL minus protocol and /i
	     */

	  }, {
	    key: "setCollectorUrl",
	    value: function setCollectorUrl(rawUrl) {
	      this.config.collectorUrl = this[asCollectorUrl](rawUrl);
	    }
	    /**
	     * Specify the platform
	     *
	     * @param string platform Overrides the default tracking platform
	     */

	  }, {
	    key: "setPlatform",
	    value: function setPlatform(platform) {
	      warn('setPlatform is deprecated. Instead add a "platform" field to the argmap argument of newTracker.');
	      this.core.setPlatform(platform);
	    }
	    /**
	     *
	     * Enable Base64 encoding for self-describing event payload
	     *
	     * @param bool enabled A boolean value indicating if the Base64 encoding for self-describing events should be enabled or not
	     */

	  }, {
	    key: "encodeBase64",
	    value: function encodeBase64(enabled) {
	      warn('This usage of encodeBase64 is deprecated. Instead add an "encodeBase64" field to the argmap argument of newTracker.');
	      this.core.setBase64Encoding(enabled);
	    }
	    /**
	     * Send all events in the outQueue
	     * Use only when sending POSTs with a bufferSize of at least 2
	     */

	  }, {
	    key: "flushBuffer",
	    value: function flushBuffer() {
	      this.outQueueManager.executeQueue();
	    }
	    /**
	     * Add the geolocation context to all events
	     */

	  }, {
	    key: "enableGeolocationContext",
	    value: function enableGeolocationContext() {
	      this[_enableGeolocationContext]();
	    }
	    /**
	     * Log visit to this page
	     *
	     * @param string customTitle
	     * @param object Custom context relating to the event
	     * @param object contextCallback Function returning an array of contexts
	     * @param tstamp number or Timestamp object
	     */

	  }, {
	    key: "trackPageView",
	    value: function trackPageView(customTitle, context, contextCallback, tstamp) {
	      var _this9 = this;

	      this[trackCallback](function () {
	        _this9[logPageView](customTitle, context, contextCallback, tstamp);
	      });
	    }
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

	  }, {
	    key: "trackStructEvent",
	    value: function trackStructEvent(category, action, label, property, value, context, tstamp) {
	      var _this10 = this;

	      this[trackCallback](function () {
	        _this10.core.trackStructEvent(category, action, label, property, value, _this10[addCommonContexts](context), tstamp);
	      });
	    }
	    /**
	     * Track a self-describing event (previously unstructured event) happening on this page.
	     *
	     * @param object eventJson Contains the properties and schema location for the event
	     * @param object context Custom context relating to the event
	     * @param tstamp number or Timestamp object
	     */

	  }, {
	    key: "trackSelfDescribingEvent",
	    value: function trackSelfDescribingEvent(eventJson, context, tstamp) {
	      var _this11 = this;

	      this[trackCallback](function () {
	        _this11.core.trackSelfDescribingEvent(eventJson, _this11[addCommonContexts](context), tstamp);
	      });
	    }
	    /**
	     * Alias for `trackSelfDescribingEvent`, left for compatibility
	     */

	  }, {
	    key: "trackUnstructEvent",
	    value: function trackUnstructEvent(eventJson, context, tstamp) {
	      var _this12 = this;

	      this[trackCallback](function () {
	        _this12.core.trackSelfDescribingEvent(eventJson, _this12[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "addTrans",
	    value: function addTrans(orderId, affiliation, total, tax, shipping, city, state, country, currency, context, tstamp) {
	      this.state.ecommerceTransaction.transaction = {
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
	    }
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

	  }, {
	    key: "addItem",
	    value: function addItem(orderId, sku, name, category, price, quantity, currency, context, tstamp) {
	      this.state.ecommerceTransaction.items.push({
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
	    }
	    /**
	     * Commit the ecommerce transaction
	     *
	     * This call will send the data specified with addTrans,
	     * addItem methods to the tracking server.
	     */

	  }, {
	    key: "trackTrans",
	    value: function trackTrans() {
	      var _this13 = this;

	      this[trackCallback](function () {
	        _this13[logTransaction](_this13.state.ecommerceTransaction.transaction.orderId, _this13.state.ecommerceTransaction.transaction.affiliation, _this13.state.ecommerceTransaction.transaction.total, _this13.state.ecommerceTransaction.transaction.tax, _this13.state.ecommerceTransaction.transaction.shipping, _this13.state.ecommerceTransaction.transaction.city, _this13.state.ecommerceTransaction.transaction.state, _this13.state.ecommerceTransaction.transaction.country, _this13.state.ecommerceTransaction.transaction.currency, _this13.state.ecommerceTransaction.transaction.context, _this13.state.ecommerceTransaction.transaction.tstamp);

	        for (var i = 0; i < _this13.state.ecommerceTransaction.items.length; i++) {
	          var item = _this13.state.ecommerceTransaction.items[i];

	          _this13[logTransactionItem](item.orderId, item.sku, item.name, item.category, item.price, item.quantity, item.currency, item.context, item.tstamp);
	        }

	        _this13.state.ecommerceTransaction = _this13[ecommerceTransactionTemplate]();
	      });
	    }
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

	  }, {
	    key: "trackLinkClick",
	    value: function trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, context, tstamp) {
	      var _this14 = this;

	      this[trackCallback](function () {
	        _this14.core.trackLinkClick(targetUrl, elementId, elementClasses, elementTarget, elementContent, _this14[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackAdImpression",
	    value: function trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, context, tstamp) {
	      var _this15 = this;

	      this[trackCallback](function () {
	        _this15.core.trackAdImpression(impressionId, costModel, cost, targetUrl, bannerId, zoneId, advertiserId, campaignId, _this15[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackAdClick",
	    value: function trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, context, tstamp) {
	      var _this16 = this;

	      this[trackCallback](function () {
	        _this16.core.trackAdClick(targetUrl, clickId, costModel, cost, bannerId, zoneId, impressionId, advertiserId, campaignId, _this16[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackAdConversion",
	    value: function trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, context, tstamp) {
	      var _this17 = this;

	      this[trackCallback](function () {
	        _this17.core.trackAdConversion(conversionId, costModel, cost, category, action, property, initialValue, advertiserId, campaignId, _this17[addCommonContexts](context), tstamp);
	      });
	    }
	    /**
	     * Track a social interaction event
	     *
	     * @param string action (required) Social action performed
	     * @param string network (required) Social network
	     * @param string target Object of the social action e.g. the video liked, the tweet retweeted
	     * @param object Custom context relating to the event
	     * @param tstamp number or Timestamp object
	     */

	  }, {
	    key: "trackSocialInteraction",
	    value: function trackSocialInteraction(action, network, target, context, tstamp) {
	      var _this18 = this;

	      this[trackCallback](function () {
	        _this18.core.trackSocialInteraction(action, network, target, _this18[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackAddToCart",
	    value: function trackAddToCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
	      var _this19 = this;

	      this[trackCallback](function () {
	        _this19.core.trackAddToCart(sku, name, category, unitPrice, quantity, currency, _this19[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackRemoveFromCart",
	    value: function trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, context, tstamp) {
	      var _this20 = this;

	      this[trackCallback](function () {
	        _this20.core.trackRemoveFromCart(sku, name, category, unitPrice, quantity, currency, _this20[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackSiteSearch",
	    value: function trackSiteSearch(terms, filters, totalResults, pageResults, context, tstamp) {
	      var _this21 = this;

	      this[trackCallback](function () {
	        _this21.core.trackSiteSearch(terms, filters, totalResults, pageResults, _this21[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackTiming",
	    value: function trackTiming(category, variable, timing, label, context, tstamp) {
	      var _this22 = this;

	      this[trackCallback](function () {
	        _this22.core.trackSelfDescribingEvent({
	          schema: 'iglu:com.snowplowanalytics.snowplow/timing/jsonschema/1-0-0',
	          data: {
	            category: category,
	            variable: variable,
	            timing: timing,
	            label: label
	          }
	        }, _this22[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackConsentWithdrawn",
	    value: function trackConsentWithdrawn(all, id, version, name, description, context, tstamp) {
	      var _this23 = this;

	      this[trackCallback](function () {
	        _this23.core.trackConsentWithdrawn(all, id, version, name, description, _this23[addCommonContexts](context), tstamp);
	      });
	    }
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

	  }, {
	    key: "trackConsentGranted",
	    value: function trackConsentGranted(id, version, name, description, expiry, context, tstamp) {
	      var _this24 = this;

	      this[trackCallback](function () {
	        _this24.core.trackConsentGranted(id, version, name, description, expiry, _this24[addCommonContexts](context), tstamp);
	      });
	    }
	    /**
	     * Track a GA Enhanced Ecommerce Action with all stored
	     * Enhanced Ecommerce contexts
	     *
	     * @param string action
	     * @param array context Optional. Context relating to the event.
	     * @param tstamp Opinal number or Timestamp object
	     */

	  }, {
	    key: "trackEnhancedEcommerceAction",
	    value: function trackEnhancedEcommerceAction(action, context, tstamp) {
	      var _this25 = this;

	      var combinedEnhancedEcommerceContexts = this.state.enhancedEcommerceContexts.concat(context || []);
	      this.state.enhancedEcommerceContexts.length = 0;
	      this[trackCallback](function () {
	        _this25.core.trackSelfDescribingEvent({
	          schema: 'iglu:com.google.analytics.enhanced-ecommerce/action/jsonschema/1-0-0',
	          data: {
	            action: action
	          }
	        }, _this25[addCommonContexts](combinedEnhancedEcommerceContexts), tstamp);
	      });
	    }
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

	  }, {
	    key: "addEnhancedEcommerceActionContext",
	    value: function addEnhancedEcommerceActionContext(id, affiliation, revenue, tax, shipping, coupon, list, step, option, currency) {
	      this.state.enhancedEcommerceContexts.push({
	        schema: 'iglu:com.google.analytics.enhanced-ecommerce/actionFieldObject/jsonschema/1-0-0',
	        data: {
	          id: id,
	          affiliation: affiliation,
	          revenue: pFloat(revenue),
	          tax: pFloat(tax),
	          shipping: pFloat(shipping),
	          coupon: coupon,
	          list: list,
	          step: pInt(step),
	          option: option,
	          currency: currency
	        }
	      });
	    }
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

	  }, {
	    key: "addEnhancedEcommerceImpressionContext",
	    value: function addEnhancedEcommerceImpressionContext(id, name, list, brand, category, variant, position, price, currency) {
	      this.state.enhancedEcommerceContexts.push({
	        schema: 'iglu:com.google.analytics.enhanced-ecommerce/impressionFieldObject/jsonschema/1-0-0',
	        data: {
	          id: id,
	          name: name,
	          list: list,
	          brand: brand,
	          category: category,
	          variant: variant,
	          position: pInt(position),
	          price: pFloat(price),
	          currency: currency
	        }
	      });
	    }
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

	  }, {
	    key: "addEnhancedEcommerceProductContext",
	    value: function addEnhancedEcommerceProductContext(id, name, list, brand, category, variant, price, quantity, coupon, position, currency) {
	      this.state.enhancedEcommerceContexts.push({
	        schema: 'iglu:com.google.analytics.enhanced-ecommerce/productFieldObject/jsonschema/1-0-0',
	        data: {
	          id: id,
	          name: name,
	          list: list,
	          brand: brand,
	          category: category,
	          variant: variant,
	          price: pFloat(price),
	          quantity: pInt(quantity),
	          coupon: coupon,
	          position: pInt(position),
	          currency: currency
	        }
	      });
	    }
	    /**
	     * Adds a GA Enhanced Ecommerce Promo Context
	     *
	     * @param string id
	     * @param string name
	     * @param string creative
	     * @param string position
	     * @param string currency
	     */

	  }, {
	    key: "addEnhancedEcommercePromoContext",
	    value: function addEnhancedEcommercePromoContext(id, name, creative, position, currency) {
	      this.state.enhancedEcommerceContexts.push({
	        schema: 'iglu:com.google.analytics.enhanced-ecommerce/promoFieldObject/jsonschema/1-0-0',
	        data: {
	          id: id,
	          name: name,
	          creative: creative,
	          position: position,
	          currency: currency
	        }
	      });
	    }
	    /**
	     * Enable tracking of unhandled exceptions with custom contexts
	     *
	     * @param filter Function ErrorEvent => Bool to check whether error should be tracker
	     * @param contextsAdder Function ErrorEvent => Array<Context> to add custom contexts with
	     *		             internal state based on particular error
	     */

	  }, {
	    key: "enableErrorTracking",
	    value: function enableErrorTracking(filter, contextsAdder) {
	      this.errorManager.enableErrorTracking(filter, contextsAdder, this[addCommonContexts]());
	    }
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

	  }, {
	    key: "trackError",
	    value: function trackError(message, filename, lineno, colno, error, contexts) {
	      var enrichedContexts = addCommonContexts(contexts);
	      this.errorManager.trackError(message, filename, lineno, colno, error, enrichedContexts);
	    }
	    /**
	     * Stop regenerating `pageViewId` (available from `web_page` context)
	     */

	  }, {
	    key: "preservePageViewId",
	    value: function preservePageViewId() {
	      this.state.preservePageViewId = true;
	    }
	  }, {
	    key: "setDebug",
	    value: function setDebug(isDebug) {
	      this.state.debug = Boolean(isDebug).valueOf(); //updateReturnMethods()
	    }
	  }]);

	  return JavascriptTracker;
	}();

	var version = "2.11.0-ALPHA";

	var SnowplowTracker = function SnowplowTracker(asynchronousQueue, functionName) {
	  var _this = this;

	  _classCallCheck(this, SnowplowTracker);

	  /************************************************************
	   * Private methods
	   ************************************************************/
	  this.documentAlias = document;
	  this.windowAlias = window;
	  /* Tracker identifier with version */

	  this.version = "js-".concat(version); // Update banner.js too

	  /* Contains four variables that are shared with tracker.js and must be passed by reference */

	  this.mutSnowplowState = {
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
	    /*
	     * Handle beforeunload event
	     *
	     * Subject to Safari's "Runaway JavaScript Timer" and
	     * Chrome V8 extension that terminates JS that exhibits
	     * "slow unload", i.e., calling getTime() > 1000 times
	     */

	  };

	  var beforeUnloadHandler = function beforeUnloadHandler() {
	    var now; // Flush all POST queues

	    _this.mutSnowplowState.bufferFlushers.forEach(function (flusher) {
	      flusher();
	    });
	    /*
	     * Delay/pause (blocks UI)
	     */


	    if (_this.mutSnowplowState.expireDateTime) {
	      // the things we do for backwards compatibility...
	      // in ECMA-262 5th ed., we could simply use:
	      //     while (Date.now() < mutSnowplowState.expireDateTime) { }
	      do {
	        now = new Date();

	        if (_this.mutSnowplowState.outQueues.filter(function (queue) {
	          return queue.length > 0;
	        }).length === 0) {
	          break;
	        }
	      } while (now.getTime() < _this.mutSnowplowState.expireDateTime);
	    }
	  };
	  /*
	   * Handler for onload event
	   */


	  var loadHandler = function loadHandler() {
	    var i;

	    if (!_this.mutSnowplowState.hasLoaded) {
	      _this.mutSnowplowState.hasLoaded = true;

	      for (i = 0; i < _this.mutSnowplowState.registeredOnLoadHandlers.length; i++) {
	        _this.mutSnowplowState.registeredOnLoadHandlers[i]();
	      }
	    }

	    return true;
	  };
	  /*
	   * Add onload or DOM ready handler
	   */


	  var addReadyListener = function addReadyListener() {
	    var _timer;

	    if (_this.documentAlias.addEventListener) {
	      addEventListener(_this.documentAlias, 'DOMContentLoaded', function ready() {
	        this.documentAlias.removeEventListener('DOMContentLoaded', ready, false);
	        loadHandler();
	      });
	    } else if (_this.documentAlias.attachEvent) {
	      _this.documentAlias.attachEvent('onreadystatechange', function ready() {
	        if (this.documentAlias.readyState === 'complete') {
	          this.documentAlias.detachEvent('onreadystatechange', ready);
	          loadHandler();
	        }
	      });

	      if (_this.documentAlias.documentElement.doScroll && _this.windowAlias === _this.windowAlias.top) {
	        (function ready() {
	          if (!this.mutSnowplowState.hasLoaded) {
	            try {
	              this.documentAlias.documentElement.doScroll('left');
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
	        if (_this.mutSnowplowState.hasLoaded || /loaded|complete/.test(_this.documentAlias.readyState)) {
	          clearInterval(_timer);
	          loadHandler();
	        }
	      }, 10);
	    } // fallback


	    addEventListener(_this.windowAlias, 'load', loadHandler, false);
	  };
	  /************************************************************
	   * Public data and methods
	   ************************************************************/


	  this.windowAlias.Snowplow = {
	    /**
	     * Returns a Tracker object, configured with a
	     * CloudFront collector.
	     *
	     * @param string distSubdomain The subdomain on your CloudFront collector's distribution
	     */
	    getTrackerCf: function getTrackerCf(distSubdomain) {
	      var t = new JavascriptTracker(functionName, '', this.version, this.mutSnowplowState, {});
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
	      var t = new JavascriptTracker(functionName, '', this.version, this.mutSnowplowState, {});
	      t.setCollectorUrl(rawUrl);
	      return t;
	    },

	    /**
	     * Get internal asynchronous tracker object
	     *
	     * @return Tracker
	     */
	    getAsyncTracker: function getAsyncTracker() {
	      return new JavascriptTracker(functionName, '', this.version, this.mutSnowplowState, {});
	    } // initialize the Snowplow singleton

	  };
	  addEventListener(this.windowAlias, 'beforeunload', beforeUnloadHandler, false);
	  addReadyListener(); // Now replace initialization array with queue manager object

	  return new InQueueManager(JavascriptTracker, this.version, this.mutSnowplowState, asynchronousQueue, functionName);
	};

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
	var queueName, queue;
	var windowAlias$2 = window;

	if (windowAlias$2.GlobalSnowplowNamespace && windowAlias$2.GlobalSnowplowNamespace.length > 0) {
	  queueName = windowAlias$2.GlobalSnowplowNamespace.shift();
	  queue = windowAlias$2[queueName];
	  queue.q = new SnowplowTracker(queue.q, queueName);
	} else {
	  windowAlias$2._snaq = windowAlias$2._snaq || [];
	  windowAlias$2._snaq = new SnowplowTracker(windowAlias$2._snaq, '_snaq');
	}

})));
