'use strict';

var validator = require('validator');
var isString = require('lodash.isstring');
var isNumber = require('lodash.isnumber');
var isUndefined = require('lodash.isundefined');
var isBoolean = require('lodash.isboolean');
var Async = require('async');
var Utils = require('./utils');


function Field(property, label) {
	var stack = [];
	var isArray = false;
	var fieldLabel = label || property;

	this.name = property;
	this.__required = false;
	this.__trimmed = false;

	this.add = function (func) {
		stack.push(func);
		return this;
	};

	this.array = function () {
		isArray = true;
		return this;
	};

	this.run = function (locals, source, form, options, cb) {
		
		var self = this;
		var errors = [];
		var value = Utils.getProp(property, form) || Utils.getProp(property, source);
		var autoTrim = options.autoTrim && !self.__trimmed && isString(value);

		if (autoTrim) {
			self.__trimmed = true;
			stack.unshift(function (value) {
				value = Utils.coerce(value);
				return validator.trim(value);
			});
		}

		function runStack(foo, cb) {

			Async.eachSeries(stack, function (proc, cb) {

				// run the async validator/filter
				if (proc.length === 4) {
					return proc(foo, source, locals, function (err, result) {
						if (err) {
							errors.push(err.message.replace("%s", fieldLabel));
							return cb();
						}

						// filters return values
						if (result !== null) foo = result
						cb();
					});
				} else {
					// run the sync validator/filter
					var result = proc(foo, source);
					if (result.valid) return cb(null);
					if (result.error) {
						// If this field is not required and it doesn't have a value, ignore error.
						if (!Utils.hasValue(value) && !self.__required) return cb(null);

						errors.push(result.error.replace("%s", fieldLabel));
						return cb(null);
					}
					foo = result;
					cb();
				}

			}, function (err) {
				cb(null, foo);
			});
		}

		if (isArray) {
			if (!Utils.hasValue(value)) value = [];
			if (!Array.isArray(value)) value = [value];
			Async.mapSeries(value, runStack, function (err, value) {
				Utils.setProp(property, form, value);
				cb(null, errors);
			});
		} else {
			if (Array.isArray(value)) value = value[0];
			runStack(value, function (err, value) {
				Utils.setProp(property, form, value);
				cb(null, errors);
			});
		}
	};
}

// ARRAY METHODS

Field.prototype.array = function () {
	return this.array();
};

Field.prototype.arrLength = function (from, to) {
	return this.add(function (arr) {
		if (value.length < from) {
			return { error: message || e.message || "%s is too short" };
		}
		if (value.length > to) {
			return { error: message || e.message || "%s is too long" };
		}
		return { valid: true };
	});
}

// HYBRID METHODS

Field.prototype.custom = function (func, message) {

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

// FILTER METHODS

Field.prototype.blacklist = function(value, chars) {
	return this.add(function (value) {
		return validator.blacklist(value, chars);
	});
};

Field.prototype.escape = function(value) {
	return this.add(function (value) {
		return validator.escape(value);
	});
};

Field.prototype.unescape = function(value) {
	return this.add(function (value) {
		return validator.unescape(value);
	});
};

Field.prototype.ltrim = function(value, chars) {
	return this.add(function (value) {
		return validator.ltrim(value, chars);
	});
};

Field.prototype.normalizeEmail = function(value, options) {
	return this.add(function (value) {
		return validator.normalizeEmail(value, options);
	});
};

Field.prototype.rtrim = function(value, chars) {
	return this.add(function (value) {
		return validator.rtrim(value, chars);
	});
};

Field.prototype.stripLow = function(value, keep_new_lines) {
	return this.add(function (value) {
		return validator.stripLow(value, keep_new_lines);
	});
};

Field.prototype.toBoolean = function(value, strict) {
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return validator.toBoolean(value, strict);
	});
};

Field.prototype.toBooleanStrict = function(value) {
	var strict = true;
	return this.add(function (value) {
		if (isBoolean(value)) return value;
		value = Utils.coerce(value);
		return validator.toBoolean(value, strict);
	});
};

Field.prototype.toDate = function(value) {
	return this.add(function (value) {
		return validator.toDate(value);
	});
};

Field.prototype.toFloat = function(value) {
	return this.add(function (value) {
		return validator.toFloat(value);
	});
};

Field.prototype.toInt = function(value, radix) {
	return this.add(function (value) {
		return validator.toInt(value, radix);
	});
};

Field.prototype.trim = function(value, chars) {
	return this.add(function (value) {
		return validator.trim(value, chars);
	});
};

Field.prototype.whitelist = function(value, chars) {
	return this.add(function (value) {
		return validator.whitelist(value, chars);
	});
};

Field.prototype.ifNull = function (replace) {
	return this.add(function (value) {
		if (isUndefined(value)) return replace;
		if (null === value) return replace;
		if ('' === value) return replace;
		return value;
	});
};

Field.prototype.toUpper = function () {
	return this.add(function (value) {
		return value.toString().toUpperCase();
	});
};

Field.prototype.toLower = function () {
	return this.add(function (value) {
		return value.toString().toLowerCase();
	});
};

Field.prototype.truncate = function (length) {
	return this.add(function (value) {
		value = value.toString();
		if (value.length <= length) return value;
		if (length <= 3) return "...";
		if (value.length > length - 3) return value.substr(0, length - 3) + "...";
		return value;
	});
};

Field.prototype.customFilter = function (func) {
	return this.add(func);
};

// VALIDATE METHODS

Field.prototype.contains = function (seed, message) {
	message = message || "%s does not contain required characters";
	return this.add(function (value) {
		var valid = validator.contains(value, seed);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.equals = function (other, message) {
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

Field.prototype.isAfter = function (date, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isAfter(value, date);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isAlpha = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || "%s contains non-letter characters";
	return this.add(function (value) {
		var valid = validator.isAlpha(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isAlphanumeric = function (locale, message) {
	if (arguments.length === 1) {
		message = locale;
		locale = undefined;
	}
	message = message || "%s contains non alpha-numeric characters";
	return this.add(function (value) {
		var valid = validator.isAlphanumeric(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isAscii = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isAscii(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isBase64 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isBase64(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isBefore = function (date, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isBefore(value, date);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isBoolean = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isBoolean(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isByteLength = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isByteLength(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isCreditCard = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isCreditCard(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isCurrency = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isCurrency(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isDataURI = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isDataURI(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isDecimal = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isDecimal(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isDivisibleBy = function (number, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isDivisibleBy(value, number);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isEmail = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an email address";
	return this.add(function (value) {
		var valid = validator.isEmail(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isEmpty = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isEmpty(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isFQDN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isFQDN(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isFloat = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isFloat(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isFullWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isFullWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isHalfWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isHalfWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isHash = function (algorithm, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isHash(value, algorithm);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isHexColor = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isHexColor(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isHexadecimal = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isHexadecimal(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isIP = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an IP address";
	return this.add(function (value) {
		var valid = validator.isIP(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISBN = function (version, message) {
	if (arguments.length === 1) {
		message = version;
		version = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISBN(value, version);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISSN = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISSN(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISIN = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISIN(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISO8601 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISO8601(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISO31661Alpha2 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISO31661Alpha2(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isISRC = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isISRC(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isIn = function (values, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isIn(value, values);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isInt = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not an integer";
	return this.add(function (value) {
		var valid = validator.isInt(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isJSON = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isJSON(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isLatLong = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isLatLong(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isLength = function (options, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isLength(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isLowercase = function (message) {
	message = message || "%s contains uppercase letters";
	return this.add(function (value) {
		var valid = validator.isLowercase(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMACAddress = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMACAddress(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMD5 = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMD5(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMimeType = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMimeType(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMobilePhone = function (locale, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMobilePhone(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMongoId = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMongoId(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isMultibyte = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isMultibyte(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isNumeric = function (message) {
	message = message || "%s is not a number";
	return this.add(function (value) {
		var valid = validator.isNumeric(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isPort = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isPort(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isPostalCode = function (locale, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isPostalCode(value, locale);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isSurrogatePair = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isSurrogatePair(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isString = function (message) {
	message = message || "%s is not a string";
	return this.add(function (value) {
		var valid = isString(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isURL = function (options, message) {
	if (arguments.length === 1) {
		message = options;
		options = undefined;
	}
	message = message || "%s is not a URL";
	return this.add(function (value) {
		var valid = validator.isURL(value, options);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isUUID = function (version, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isUUID(value, version);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isUppercase = function (message) {
	message = message || "%s contains lowercase letters";
	return this.add(function (value) {
		var valid = validator.isUppercase(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isVariableWidth = function (message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isVariableWidth(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isWhitelisted = function (chars, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.isWhitelisted(value, chars);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.matches = function (pattern, modifiers, message) {
	message = message || "%s needs to be after";
	return this.add(function (value) {
		var valid = validator.matches(value, pattern, modifiers);
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.notContains = function (seed, message) {
	message = message || "%s contains invalid characters";
	return this.add(function (value) {
		var valid = validator.contains(value, seed);
		if (!valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.isFinite = function (message) {
	message = message || "%s is not a number";
	return this.add(function (value) {
		var valid = isFinite(value);
		if (valid) return { valid: true };
		else return { error: message }
	});
};


Field.prototype.isFloat = Field.prototype.isDecimal = function (message) {
	message = message || "%s is not a decimal";
	return this.add(function (value) {
		var valid = (isNumber(value) && value % 1 == 0) || (isString(value) && value.match(/^[-+]?[0-9]*\.[0-9]+$/));
		if (valid) return { valid: true };
		else return { error: message }
	});
};


Field.prototype.regex = Field.prototype.is = function (pattern, modifiers, message) {
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

Field.prototype.notRegex = Field.prototype.not = function (pattern, modifiers, message) {
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

Field.prototype.required = function (placeholderValue, message) {
	this.__required = true;
	return this.add(function (value) {
		if (!Utils.hasValue(value) || value == placeholderValue) {
			return { error: message || "%s is required" };
		}
		return { valid: true };
	});
};

Field.prototype.minLength = function (min, message) {
	message = message || "%s is too short";
	return this.add(function (value) {
		var valid = value.toString().length >= min;
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.maxLength = function (max, message) {
	message = message || "%s is too long";
	return this.add(function (value) {
		var valid = value.toString().length <= max;
		if (valid) return { valid: true };
		else return { error: message }
	});
};

Field.prototype.customValidator = function (func, message) {
	return this.add(function (value, source) {
		try {
			func(value, source);
		} catch (e) {
			return { error: message || e.message || "%s is invalid" };
		}
		return { valid: true };
	});
};

module.exports = Field;
