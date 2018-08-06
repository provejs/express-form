'use strict';

var Async = require('async');
var Utils = require('./utils');
var Validator = require('validator');
var Methods = require('./methods');
var isString = require('lodash.isstring');
var isUndefined = require('lodash.isundefined');
var isArray = Array.isArray;
var hasValue = Utils.hasValue;

function Field(property, label2) {
	var stack = [];
	var label = label2 || property;

	this.name = property;
	this.__trimmed = false;
	this.__toArray = false;

	this.add = function (func) {
		stack.push(func);
		return this;
	};

	this.run = function (locals, source, form, options, cb) {

		var self = this;
		this.errors = [];
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

				var callback;

				// run the async validator/filter
				if (proc.length === 4) {
					callback = function (err, result) {
						if (err) {
							self.errors.push(err.message.replace("%s", label));
							return cb();
						} else if (!isUndefined(result)) {
							foo = result;
							cb();
						} else {
							cb();
						}
					};
					return proc.apply(self, [foo, source, locals, callback]);
				} else {
					/*
						Custom sync methods will return either:
						- { valid: true } , validation success
						- { error: '...' }, validation error
						- undefined, should have no impact
						- sanitized value, should replace current value
					*/
					// var result = proc(foo, source, locals);
					var result = proc.apply(self, [foo, source, locals]);
					if (result && result.valid) {
						// validation success
						cb();
					} else if (result && result.error) {
						// validation danger
						self.errors.push(result.error.replace('%s', label));
						cb();
					} else if (isUndefined(result)) {
						cb();
					} else {
						// todo: if result is undefined should we not be ignore the result?
						foo = result;
						cb();
					}
				}

			}, function (err) {
				if (err) return cb(err);
				cb(null, foo);
			});
		}

		// **** run stack *****
		if (this.__toArray && hasValue(value)) {
			// toArray() and there is a value, so run stack
			// using Async.mapSeries().
			if (!isArray(value)) value = [value];
			Async.mapSeries(value, runStack, function (err, value) {
				if (err) return cb(err);
				Utils.setProp(property, form, value);
				cb(null, self.errors);
			});
		} else if (this.__toArray && !hasValue(value)) {
			// Async.mapSeries() will not invoke runStack() on an empty array.
			// Therefore, the chained methods will not get executed. So handle
			// empty array case by calling runStack() on an undefined value.
			// After runStack() convert value back to an array.
			runStack(undefined, function (err, value) {
				if (err) return cb(err);
				value = (isUndefined(value))? [] : [value];
				Utils.setProp(property, form, value);
				cb(null, self.errors);
			});
		} else {
			// Not expecting an array so set the value
			// to just the first value of the array.
			if (isArray(value)) value = value[0];

			// Run stack on single value.
			runStack(value, function (err, value) {
				if (err) return cb(err);
				Utils.setProp(property, form, value);
				cb(null, self.errors);
			});
		}
	};
}

// apply built-in methods to field prototype
for (var name in Methods) {
	if (Methods.hasOwnProperty(name)) {
		Field.prototype[name] = Methods[name];
	}
}

module.exports = Field;
