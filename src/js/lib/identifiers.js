var Identifiers = {};
module.exports = Identifiers;

/*
 * Is property defined?
 */
Identifiers.isDefined = function (property) {
	return typeof property !== 'undefined';
}

/**
 * Is property null?
 */
Identifiers.isNotNull = function (property) {
	return property !== null;
}

/*
 * Is property a function?
 */
Identifiers.isFunction = function (property) {
	return typeof property === 'function';
}

/*
 * Is property an array?
 */
Identifiers.isArray = ('isArray' in Array) ? 
	Array.isArray : 
	function (value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	}

/*
 * Is property an empty array?
 */
Identifiers.isEmptyArray = function (property) {
	return Identifiers.isArray(property) && property.length < 1;
}

/*
 * Is property an object?
 *
 * @return bool Returns true if property is null, an Object, or subclass of Object (i.e., an instanceof String, Date, etc.)
 */
Identifiers.isObject = function (property) {
	return typeof property === 'object';
}

/*
 * Is property a JSON?
 */
Identifiers.isJson = function (property) {
	return (Identifiers.isDefined(property) && Identifiers.isNotNull(property) && property.constructor === {}.constructor);
}

/*
 * Is property a non-empty JSON?
 */
Identifiers.isNonEmptyJson = function (property) {
	return Identifiers.isJson(property) && property !== {};
}

/*
 * Is property a string?
 */
Identifiers.isString = function (property) {
	return typeof property === 'string' || property instanceof String;
}

/*
 * Is property a non-empty string?
 */
Identifiers.isNonEmptyString = function (property) {
	return Identifiers.isString(property) && property !== '';
}

/*
 * Is property a date?
 */
Identifiers.isDate = function (property) {
	return Object.prototype.toString.call(property) === "[object Date]";
}
