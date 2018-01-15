'use strict';

var Utils = require('./utils');
var Validator = require('validator');
var isString = require('lodash.isstring');
var isNumber = require('lodash.isnumber');
var isUndefined = require('lodash.isundefined');
var isBoolean = require('lodash.isboolean');
//var isDate = require('lodash.isdate');


function minmax(range) {
	if (!range) return {};
	var parts = range.split(/ to /i);
	return {
		min: parts[0] + ' 00:00:00',
		max: parts[1] + ' 23:59:59'
	};
}

function isDate(str) {
    var date = new Date(str);
	return date !== undefined && date.toString() !== 'Invalid Date';
}

// ARRAY METHODS

exports.array = function () {
	this.__array = true;
	return this;
};

exports.arrLength = function (from, to) {
	return this.add(function (arr) {
		if (value.length < from) {
			return { error: message || e.message || "%s is too short" };
		}
		if (value.length > to) {
			return { error: message || e.message || "%s is too long" };
		}
		return { valid: true };
	});
};

// FILTER METHODS

exports.blacklist = function(value, chars) {
	return this.add(function (value) {
		return Validator.blacklist(value, chars);
	});
};

exports.escape = function(value) {
	return this.add(function (value) {
		return Validator.escape(value);
	});
};

exports.unescape = function(value) {
	return this.add(function (value) {
		return Validator.unescape(value);
	});
};

exports.ltrim = function(value, chars) {
	return this.add(function (value) {
		return Validator.ltrim(value, chars);
	});
};

exports.normalizeEmail = function(value, options) {
	return this.add(function (value) {
		return Validator.normalizeEmail(value, options);
	});
};

exports.rtrim = function(value, chars) {
	return this.add(function (value) {
		return Validator.rtrim(value, chars);
	});
};

exports.stripLow = function(value, keep_new_lines) {
	return this.add(function (value) {
		return Validator.stripLow(value, keep_new_lines);
	});
};

exports.toBoolean = function(value, strict) {
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return Validator.toBoolean(value, strict);
	});
};

exports.toBooleanStrict = function(value) {
	var strict = true;
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return Validator.toBoolean(value, strict);
	});
};

exports.toDate = function(value) {
	return this.add(function (value) {
		return Validator.toDate(value);
	});
};

exports.toFloat = function(value) {
	return this.add(function (value) {
		return Validator.toFloat(value);
	});
};

exports.toInt = function(value, radix) {
	return this.add(function (value) {
		return Validator.toInt(value, radix);
	});
};

exports.trim = function(value, chars) {
	return this.add(function (value) {
		return Validator.trim(value, chars);
	});
};

exports.whitelist = function(value, chars) {
	return this.add(function (value) {
		return Validator.whitelist(value, chars);
	});
};

exports.ifNull = function (replace) {
	return this.add(function (value) {
		if (isUndefined(value)) return replace;
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

exports.truncate = function (length) {
	return this.add(function (value) {
		value = value.toString();
		if (value.length <= length) return value;
		if (length <= 3) return "...";
		if (value.length > length - 3) return value.substr(0, length - 3) + "...";
		return value;
	});
};

exports.customFilter = function (func) {
	return this.add(func);
};

// VALIDATE METHODS

exports.contains = function (seed, message) {
	message = message || "%s does not contain required characters";
	return this.add(function (value) {
		var valid = Validator.contains(value, seed);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.equals = function (other, message) {
	if (isString(other) && other.match(/^field::/)) {
		this.__required = true;
	}

	return this.add(function (value, source) {
		// If other is a field token (field::fieldname), grab the value of fieldname
		// and use that as the OTHER value.
		var test = other;
		if (isString(other) && other.match(/^field::/)) {
			test = Utils.getProp(other.replace(/^field::/, ""), source);
		}
		if (value != test) {
			return { error: message || "%s does not equal " + String(test) };
		}
		return { valid: true };
	});
};

exports.isAfter = function (date, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isAfter(value, date);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isAlpha = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || "%s contains non-letter characters";
	return this.add(function (value) {
		var valid = Validator.isAlpha(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isAlphanumeric = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || "%s contains non alpha-numeric characters";
	return this.add(function (value) {
		var valid = Validator.isAlphanumeric(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isAscii = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isAscii(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isBase64 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isBase64(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isBefore = function (date, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isBefore(value, date);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isBoolean = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isBoolean(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isByteLength = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isByteLength(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isCreditCard = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isCreditCard(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isCurrency = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isCurrency(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isDataURI = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isDataURI(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isDate = function (message) {
	message = message || "%s is not a date";
	return this.add(function (value) {
		var date = new Date(value);
        var valid = isDate(date);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isDecimal = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isDecimal(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isDivisibleBy = function (number, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isDivisibleBy(value, number);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isEmail = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an email address";
	return this.add(function (value) {
		var valid = Validator.isEmail(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isEmpty = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isEmpty(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isFQDN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isFQDN(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isFloat = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isFloat(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isFullWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isFullWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isHalfWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isHalfWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isHash = function (algorithm, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isHash(value, algorithm);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isHexColor = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isHexColor(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isHexadecimal = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isHexadecimal(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isIP = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an IP address";
	return this.add(function (value) {
		var valid = Validator.isIP(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISBN = function (version, message) {
	if (arguments.length === 1) {
		message = version;
		version = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISBN(value, version);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISSN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISSN(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISIN = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISIN(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISO8601 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISO8601(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISO31661Alpha2 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISO31661Alpha2(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isISRC = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isISRC(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isIn = function (values, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isIn(value, values);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isInt = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an integer";
	return this.add(function (value) {
		value = Utils.coerce(value);
		var valid = Validator.isInt(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isJSON = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isJSON(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isLatLong = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isLatLong(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isLength = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isLength(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isLowercase = function (message) {
	message = message || "%s contains uppercase letters";
	return this.add(function (value) {
		var valid = Validator.isLowercase(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMACAddress = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMACAddress(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMD5 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMD5(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMimeType = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMimeType(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMobilePhone = function (locale, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMobilePhone(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMongoId = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMongoId(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isMultibyte = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isMultibyte(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isNumeric = function (message) {
	message = message || "%s is not a number";
	return this.add(function (value) {
		var valid = Validator.isNumeric(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isPort = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isPort(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isPostalCode = function (locale, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isPostalCode(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isSurrogatePair = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isSurrogatePair(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isString = function (message) {
	message = message || "%s is not a string";
	return this.add(function (value) {
		var valid = isString(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isURL = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not a URL";
	return this.add(function (value) {
		var valid = Validator.isURL(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isUUID = function (version, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isUUID(value, version);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isUppercase = function (message) {
	message = message || "%s contains lowercase letters";
	return this.add(function (value) {
		var valid = Validator.isUppercase(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isVariableWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isVariableWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.isWhitelisted = function (chars, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.isWhitelisted(value, chars);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.matches = function (pattern, modifiers, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = Validator.matches(value, pattern, modifiers);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.notContains = function (seed, message) {
	message = message || "%s contains invalid characters";
	return this.add(function (value) {
		var valid = Validator.contains(value, seed);
		if (!valid) return { valid: true };
		else return { error: message }
	});
};

exports.isFinite = function (message) {
	message = message || "%s is not a number";
	return this.add(function (value) {
		var valid = isFinite(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};


exports.isFloat = exports.isDecimal = function (message) {
	message = message || "%s is not a decimal";
	return this.add(function (value) {
		var valid = (isNumber(value) && value % 1 == 0) || (isString(value) && value.match(/^[-+]?[0-9]*\.[0-9]+$/));
		if (valid) return { valid: true };
		else return { error: message }
	});
};


exports.regex = exports.is = function (pattern, modifiers, message) {
	// regex(/pattern/)
	// regex(/pattern/, "message")
	// regex("pattern")
	// regex("pattern", "modifiers")
	// regex("pattern", "message")
	// regex("pattern", "modifiers", "message")

	if (pattern instanceof RegExp) {
		if (isString(modifiers) && modifiers.match(/^[gimy]+$/)) {
			throw new Error("Invalid arguments: `modifiers` can only be passed in if `pattern` is a string.");
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
	}

	return this.add(function (value) {
		if (pattern.test(value) === false) {
			return { error: message || "%s has invalid characters" };
		}
		return { valid: true };
	});
};

exports.notRegex = exports.not = function (pattern, modifiers, message) {
	// notRegex(/pattern/)
	// notRegex(/pattern/, "message")
	// notRegex("pattern")
	// notRegex("pattern", "modifiers")
	// notRegex("pattern", "message")
	// notRegex("pattern", "modifiers", "message")

	if (pattern instanceof RegExp) {
		if (isString(modifiers) && modifiers.match(/^[gimy]+$/)) {
			throw new Error("Invalid arguments: `modifiers` can only be passed in if `pattern` is a string.");
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
	}

	return this.add(function (value) {
		if (pattern.test(value) === true) {
			return { error: message || "%s has invalid characters" };
		}
		return { valid: true };
	});
};

exports.required = function (placeholderValue, message) {
	this.__required = true;
	return this.add(function (value) {
		if (!Utils.hasValue(value) || value == placeholderValue) {
			return { error: message || "%s is required" };
		}
		return { valid: true };
	});
};

exports.minLength = function (min, message) {
	message = message || "%s is too short";
	return this.add(function (value) {
		var valid = value.toString().length >= min;
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.maxLength = function (max, message) {
	message = message || "%s is too long";
	return this.add(function (value) {
		var valid = value.toString().length <= max;
		if (valid) return { valid: true };
		else return { error: message }
	});
};

exports.notEmpty = function (message) {
	message = message || "%s has no value or is only whitespace";
	return this.add(function (value) {
		value = Utils.coerce(value);
		value = Validator.trim(value);
		var valid = !Validator.isEmpty(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

// todo: what is the point of this when we have Validator(...).custom()?
exports.customValidator = function (func, message) {
	return this.add(function (value, source) {
		try {
			func(value, source);
		} catch (e) {
			return { error: message || e.message || "%s is invalid" };
		}
		return { valid: true };
	});
};

// HYBRID METHODS

exports.custom = function (func, message) {

    // custom function is async 
    if (func.length === 4){
        return this.add(function (value, source, locals, cb) {
            func(value, source, locals, function (err, result) {
                if (err) return cb(new Error(message || err.message || "%s is invalid"));

                // functions that return values are filters
                if (result != null) return cb(null, result);

                // value passed validator
                cb(null, null);
            });
        });
    } else {
        // custom function is sync
        return this.add(function (value, source) {

            try {
                var result = func(value, source);
            } catch (e) {
                return { error: message || e.message || "%s is invalid" };
            }
            // Functions that return values are filters.
            if (result != null) return result;

            // value passed validator
            return { valid: true };
        });
    }
};

exports.daterange = function(message) {
    
    return this.add(function(value) {
        if (!value) return { valid: true};
        
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