'use strict';

var Utils = require('./utils');
var Validator = require('validator');
var isString = require('lodash.isstring');
var isNaN = require('lodash.isnan');
var isNumber = require('lodash.isnumber');
var isUndefined = require('lodash.isundefined');
var isBoolean = require('lodash.isboolean');
var isFunction = require('lodash.isfunction');
var sanitizeHtml = require('sanitize-html');
var Moment = require('moment-timezone');

function minmax(range) {
	if (!range) return {};
	var parts = range.split(/ [a-z-]{1,2} /i);
	return {
		min: parts[0] + ' 00:00:00',
		max: parts[1] + ' 23:59:59'
	};
}

function isDate(str) {
	var timestamp = Date.parse(str);
	return !isNaN(timestamp);
}


// SANITIZE METHODS

exports.toArray = function () {
	this.__toArray = true;
	return this;
};

exports.toBlacklist = function (value, chars) {
	return this.add(function (value) {
		return Validator.blacklist(value, chars);
	});
};

exports.toEscape = function () {
	return this.add(function (value) {
		return Validator.escape(value);
	});
};

exports.toUnescape = function () {
	return this.add(function (value) {
		return Validator.unescape(value);
	});
};

exports.toTrimLeft = function (value, chars) {
	return this.add(function (value) {
		return Validator.ltrim(value, chars);
	});
};

exports.toEmail = function (value, options) {
	return this.add(function (value) {
		return Validator.normalizeEmail(value, options);
	});
};

exports.toTrimRight = function (value, chars) {
	return this.add(function (value) {
		return Validator.rtrim(value, chars);
	});
};

exports.toStripLow = function (value, keep_new_lines) {
	return this.add(function (value) {
		return Validator.stripLow(value, keep_new_lines);
	});
};

exports.toBoolean = function (value, strict) {
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return Validator.toBoolean(value, strict);
	});
};

exports.toBooleanStrict = function () {
	var strict = true;
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return Validator.toBoolean(value, strict);
	});
};

exports.toDate = function () {
	return this.add(function (value) {
		return Validator.toDate(value);
	});
};

exports.toFloat = function () {
	return this.add(function (value) {
		return Validator.toFloat(value);
	});
};

exports.toInt = function (value, radix) {
	return this.add(function (value) {
		return Validator.toInt(value, radix);
	});
};

exports.toTrim = function (value, chars) {
	return this.add(function (value) {
		return Validator.trim(value, chars);
	});
};

exports.toWhitelist = function (value, chars) {
	return this.add(function (value) {
		return Validator.whitelist(value, chars);
	});
};

exports.toDefault = function (replace) {
	return this.add(function (value) {
		if (isUndefined(value)) return replace;
		if (isNaN(value)) return replace;
		if (null === value) return replace;
		if ('' === value) return replace;
		return value;
	});
};

exports.toUpper = function () {
	return this.add(function (value) {
		return value.toString().toUpperCase();
	});
};

exports.toLower = function () {
	return this.add(function (value) {
		return value.toString().toLowerCase();
	});
};

exports.toTruncate = function (length) {
	return this.add(function (value) {
		value = value.toString();
		if (value.length <= length) return value;
		if (length <= 3) return '...';
		if (value.length > length - 3) return value.substr(0, length - 3) + '...';
		return value;
	});
};

exports.toHtml = function (options) {
	return this.add(function (value) {
		if (!value) return value;
		return sanitizeHtml(value, options);
	});
};

exports.toDate = function () {
	return this.add(function (value) {
		if (!value) return value;
		return new Date(value);
	});
};

exports.toMoment = function (tzFrom, tzTo) {

	tzFrom = tzFrom || 'UTC';
	tzTo = tzTo || 'UTC';

	return this.add(function (value, source, locals) {

		if (!Utils.hasValue(value)) return value;

		if (locals && locals.timezone && locals.timezone.name) {
			tzFrom = locals.timezone.name;
		} else if (isFunction(tzFrom)) {
			tzFrom = tzFrom(locals);
		}

		if (isFunction(tzTo)) {
			tzTo = tzTo(locals);
		}

		if (isDate(value)) {
			// handle date
			return Moment.tz(value, tzFrom).tz(tzTo);
		} else if (isDate(value.min) && isDate(value.max)) {
			// handle date range
			return {
				min: Moment.tz(value.min, tzFrom).tz(tzTo),
				max: Moment.tz(value.max, tzFrom).tz(tzTo)
			};
		} else {
			return null;
		}
	});
};

// VALIDATE METHODS

exports.isArrayLength = function (from, to, message) {
	return this.add(function (arr) {
		if (arr.length < from) {
			return {
				error: message || '%s is too short'
			};
		}
		if (arr.length > to) {
			return {
				error: message || '%s is too long'
			};
		}
		return {
			valid: true
		};
	});
};


exports.isContains = function (seed, message) {
	message = message || '%s does not contain required characters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.contains(value, seed);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isEquals = function (other, message) {
	return this.add(function (value, source) {
		// If other is a field token (field::fieldname), grab the value of fieldname
		// and use that as the OTHER value.
		var test = other;
		if (isString(other) && other.match(/^field::/)) {
			test = Utils.getProp(other.replace(/^field::/, ''), source);
		}
		if (value != test) {
			return {
				error: message || '%s does not equal ' + String(test)
			};
		}
		return {
			valid: true
		};
	});
};

exports.isAfter = function (date, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isAfter(value, date);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isAlpha = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || '%s contains non-letter characters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isAlpha(value, locale);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isAlphanumeric = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || '%s contains non alpha-numeric characters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isAlphanumeric(value, locale);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isAscii = function (message) {
	message = message || '%s contains non ascii characters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isAscii(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isBase64 = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isBase64(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isBefore = function (date, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isBefore(value, date);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isBoolean = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isBoolean(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isByteLength = function (options, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isByteLength(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isCreditCard = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isCreditCard(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isCurrency = function (options, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isCurrency(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isDataURI = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isDataURI(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isDate = function (message) {
	message = message || '%s is not a date';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var date = new Date(value);
		var valid = isDate(date);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isDecimal = function (options, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isDecimal(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isDivisibleBy = function (number, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isDivisibleBy(value, number);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isEmail = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is not an email address';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isEmail(value, options);
		if (value === '') {
			return {valid: true};
		} else if (valid) {
			return {valid: true};
		} else {
			return {error: message};
		}
	});
};

exports.isEmpty = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isEmpty(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isFQDN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isFQDN(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isFloat = function (options, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isFloat(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isFullWidth = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isFullWidth(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isHalfWidth = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isHalfWidth(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isHash = function (algorithm, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isHash(value, algorithm);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isHexColor = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isHexColor(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isHexadecimal = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isHexadecimal(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isIP = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is not an IP address';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isIP(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISBN = function (version, message) {
	if (arguments.length === 1) {
		message = version;
		version = undefined;
	}
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISBN(value, version);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISSN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISSN(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISIN = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISIN(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISO8601 = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISO8601(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISO31661Alpha2 = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISO31661Alpha2(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isISRC = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isISRC(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isIn = function (values, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isIn(value, values);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isInt = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is not an integer';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		value = Utils.coerce(value);
		var valid = Validator.isInt(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isJSON = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isJSON(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isLatLong = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isLatLong(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isLength = function (options, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isLength(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isLowercase = function (message) {
	message = message || '%s contains uppercase letters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isLowercase(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMACAddress = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMACAddress(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMD5 = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMD5(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMimeType = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMimeType(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMobilePhone = function (locale, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMobilePhone(value, locale);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMongoId = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMongoId(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMultibyte = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isMultibyte(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isNumeric = function (message) {
	message = message || '%s is not a number';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isNumeric(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isPort = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isPort(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isPostalCode = function (locale, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isPostalCode(value, locale);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isSurrogatePair = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isSurrogatePair(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isString = function (message) {
	message = message || '%s is not a string';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = isString(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isURL = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || '%s is not a URL';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isURL(value, options);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isUUID = function (version, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isUUID(value, version);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isUppercase = function (message) {
	message = message || '%s contains lowercase letters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isUppercase(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isVariableWidth = function (message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isVariableWidth(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isWhitelisted = function (chars, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.isWhitelisted(value, chars);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMatches = function (pattern, modifiers, message) {
	message = message || '%s is invalid';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.matches(value, pattern, modifiers);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isNotContains = function (seed, message) {
	message = message || '%s contains invalid characters';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = Validator.contains(value, seed);
		if (!valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isFinite = function (message) {
	message = message || '%s is not a number';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = isFinite(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};


exports.isFloat = exports.isDecimal = function (message) {
	message = message || '%s is not a decimal';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = (isNumber(value) && value % 1 == 0) || (isString(value) && value.match(/^[-+]?[0-9]*\.[0-9]+$/));
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};


exports.is = function (pattern, modifiers, message) {
	// is(/pattern/)
	// is(/pattern/, 'message')
	// is('pattern')
	// is('pattern', 'modifiers')
	// is('pattern', 'message')
	// is('pattern', 'modifiers', 'message')

	if (pattern instanceof RegExp) {
		if (isString(modifiers) && modifiers.match(/^[gimy]+$/)) {
			throw new Error('Invalid arguments: `modifiers` can only be passed in if `pattern` is a string.');
		}

		message = modifiers;
		modifiers = undefined;

	} else if (isString(pattern)) {
		if (arguments.length == 2 && !modifiers.match(/^[gimy]+$/)) {
			// 2nd arg doesn't look like modifier flags, it's the message (might also be undefined)
			message = modifiers;
			modifiers = undefined;
		}
		pattern = new RegExp(pattern, modifiers);
	} else {
		throw new Error('Undefined pattern for regex validation of field `' + this.name + '`.');
	}

	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		if (pattern.test(value) === false) {
			return {
				error: message || '%s has invalid characters'
			};
		} else {
			return {
				valid: true
			};
		}
	});
};

exports.isNot = function (pattern, modifiers, message) {
	// isNot(/pattern/)
	// isNot(/pattern/, 'message')
	// isNot('pattern')
	// isNot('pattern', 'modifiers')
	// isNot('pattern', 'message')
	// isNot('pattern', 'modifiers', 'message')

	if (pattern instanceof RegExp) {
		if (isString(modifiers) && modifiers.match(/^[gimy]+$/)) {
			throw new Error('Invalid arguments: `modifiers` can only be passed in if `pattern` is a string.');
		}

		message = modifiers;
		modifiers = undefined;

	} else if (isString(pattern)) {
		if (arguments.length == 2 && !modifiers.match(/^[gimy]+$/)) {
			// 2nd arg doesn't look like modifier flags, it's the message (might also be undefined)
			message = modifiers;
			modifiers = undefined;
		}
		pattern = new RegExp(pattern, modifiers);
	} else {
		throw new Error('Undefined pattern for regex validation of field `' + this.name + '`.');
	}

	return this.add(function (value) {
		if (pattern.test(value) === true) {
			return {
				error: message || '%s has invalid characters'
			};
		}
		return {
			valid: true
		};
	});
};

exports.isRequired = function (placeholderValue, message) {
	return this.add(function (value) {
		if (!Utils.hasValue(value) || value == placeholderValue) {
			return {
				error: message || '%s is required'
			};
		}
		return {
			valid: true
		};
	});
};

exports.isMinLength = function (min, message) {
	message = message || '%s is too short';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = value.toString().length >= min;
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isMaxLength = function (max, message) {
	message = message || '%s is too long';
	return this.add(function (value) {
		if (!Utils.hasValue(value)) return value;
		var valid = value.toString().length <= max;
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

exports.isNotEmpty = function (message) {
	message = message || '%s has no value or is only whitespace';
	return this.add(function (value) {
		value = Utils.coerce(value);
		value = Validator.trim(value);
		var valid = !Validator.isEmpty(value);
		if (valid) return {
			valid: true
		};
		else return {
			error: message
		};
	});
};

// HYBRID METHODS

exports.custom = function (func, message) {

	// custom function is async
	if (func.length === 4) {
		return this.add(function (value, source, locals, cb) {

			// async custom should return errors.
			func(value, source, locals, function (err, result) {
				if (err) return cb(new Error(message || err.message || '%s is invalid'));

				// functions that return non-undefined values are saniters
				if (!isUndefined(result)) return cb(null, result);

				// value passed validator
				cb();
			});
		});
	} else {
		// sync custom function
		return this.add(function (value, source, locals) {
			var result;
			try {
				// custom sync functions should throw errors
				result = func(value, source, locals);
			} catch (e) {
				return {
					error: message || e.message || '%s is invalid'
				};
			}
			// functions that return non-undefined values are saniters
			if (!isUndefined(result)) return result;

			// value passed validator
			return {
				valid: true
			};
		});
	}
};

/*
The daterange validator/sanitizer validates and sanitizes inputs in the
form of: `YYYY-MM-DD to YYYY-MM-DD`. It parses, validates and sanitizes
the input date range string. The sanitized returned value is: `{ min: min, max: max}`
where min and max are the date range values of type date.

field('revised').isDateRange().toMoment()
*/
exports.isDateRange = function (message) {

	return this.add(function (value) {
		if (!Utils.hasValue(value)) return {min: undefined, max: undefined};

		var regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2} to [0-9]{4}-[0-9]{2}-[0-9]{2}$/i;
		var range = minmax(value);

		if (!regex.test(value)) throw new Error(message || '%s invalid date range, check the format.');
		if (!isDate(range.min)) throw new Error(message || '%s invalid date range, check start date.');
		if (!isDate(range.max)) throw new Error(message || '%s invalid date range, check ending date.');
		if (range.max < range.min) throw new Error(message || '%s invalid date range, ending date is after staring date.');

		// return range so that req.form has min/max object instead of a range string
		return range;
	});
};
