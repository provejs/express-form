'use strict';

var Async = require('async');
var Utils = require('./utils');
var Validator = require('validator');
var Methods = require('./methods');
var isString = require('lodash.isstring');
var isArray = Array.isArray;

function Field(property, label2) {
	var stack = [];
	var label = label2 || property;

	this.name = property;
	this.__required = false;
	this.__trimmed = false;
	this.__array = false;

	this.add = function (func) {
		stack.push(func);
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
				return Validator.trim(value);
			});
		}

		function runStack(foo, cb) {

			Async.eachSeries(stack, function (proc, cb) {

				// run the async validator/filter
				if (proc.length === 4) {
					return proc(foo, source, locals, function (err, result) {
						if (err) {
							errors.push(err.message.replace("%s", label));
							return cb();
						}

						// filters return values
						if (result !== null) foo = result
						cb();
					});
				} else {
					// run the sync validator/filter
					var result = proc(foo, source, locals);
					if (result && result.valid) return cb(null);
					if (result && result.error) {
						// If this field is not required and it doesn't have a value, ignore error.
						if (!Utils.hasValue(value) && !self.__required) return cb(null);

						errors.push(result.error.replace("%s", label));
						return cb(null);
					}
					foo = result;
					cb();
				}

			}, function (err) {
				cb(null, foo);
			});
		}

		if (this.__array) {
			if (!Utils.hasValue(value)) value = [];
			if (!isArray(value)) value = [value];	
			Async.mapSeries(value, runStack, function (err, value) {
				Utils.setProp(property, form, value);
				cb(null, errors);
			});
		} else {
			if (isArray(value)) value = value[0];
			runStack(value, function (err, value) {
				Utils.setProp(property, form, value);
				cb(null, errors);
			});
		}
	};
}

// apply built-in methods to field prototype
for (var name in Methods) {
	if (Methods.hasOwnProperty(name)) {
		console.log('### ' + name);
		Field.prototype[name] = Methods[name];
	}
}

module.exports = Field;
