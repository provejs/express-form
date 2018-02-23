'use strict';

require('colors');
var Async = require('async');
var Utils = require('./utils');
var Validator = require('validator');
var Methods = require('./methods');
var isString = require('lodash.isstring');
var isUndefined = require('lodash.isundefined');
var isArray = Array.isArray;

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
						} else if (!isUndefined(result)) {
							foo = result;
							cb();
						} else {
							cb();
						}
					});
				} else {
					/*
						Custom sync methods will return either:
						- { valid: true } , validation success
						- { error: '...' }, validation error
						- undefined, should have no impact
						- sanitized value, should replace current value
					*/
					var result = proc(foo, source, locals);
					if (result && result.valid) {
						// validation success
						cb();
					} else if (result && result.error) {
						// validation danger
						errors.push(result.error.replace('%s', label));
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

		if (this.__toArray) {
			
			// Since toArray() was called wrap the value in an array
			// if the value is not already an array. Note that when
			// settings the value to an empty array the Async.mapSeries()
			// will not actually the `runStack` method.
			if (!Utils.hasValue(value)) value = [];
			if (!isArray(value)) value = [value];

			if (value.length === 0) {
				// run the stack on the single value returning a validated
				// and sanitized value.
				runStack(undefined, function (err, value) {
					if (err) return cb(err);
					value = (isUndefined(value))? [] : [value];
					Utils.setProp(property, form, value);
					cb(null, errors);
				});
			} else {
				// Run the stack on each value in the array returning
				// a new validated and sanitized value in the array.
				Async.mapSeries(value, runStack, function (err, value) {
					if (err) return cb(err);
					Utils.setProp(property, form, value);
					cb(null, errors);
				});
			}
			

		} else {
			
			// since we are not expecting an array set the value
			// to just the first value of the array.
			if (isArray(value)) value = value[0];

			// run the stack on the single value returning a validated
			// and sanitized value.
			runStack(value, function (err, value) {
				if (err) return cb(err);
				Utils.setProp(property, form, value);
				cb(null, errors);
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
