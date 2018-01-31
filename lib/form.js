'use strict';

var Async = require('async');
var Utils = require('./utils');
var Field = require('./field');
var isBoolean = require('lodash.isboolean');
var isObject = require('lodash.isobject');
var assign = require('lodash.assign');
var isArray = Array.isArray;

function form() {
	var routines = Array.prototype.slice.call(arguments);
	var options = form._options;
	var sources = options.sources;

	return function (req, res, next) {
		var map = {};
		var data = Utils.mergeSources(sources, req);

		req.form = req.form || {};
		res.locals = res.locals || {};
		res.locals.errors = {};

		Object.defineProperties(req.form, {
			'errors': {
				value: [],
				enumerable: false
			},
			'getErrors': {
				value: function (name) {
					if (!name) return map;
					return map[name] || [];
				},
				enumerable: false
			},
			'isValid': {
				get: function () {
					return this.errors.length === 0;
				},
				enumerable: false
			}
		});

		Async.each(routines, function (routine, cb) {
			routine.run(res.locals, data, req.form, options, function (err, result) {

				// return early if no errors
				if (!isArray(result) || !result.length) return process.nextTick(cb);
				
				var errors = req.form.errors;
				var name = routine.name;

				map[name] = map[name] || [];

				result.forEach(function (error) {
					errors.push(error);
					map[name].push(error);
					res.locals.errors[name] = error;
				});

				process.nextTick(cb);
			});
		}, function (err) {
			if (err) return next(err);
			if (next) next();
		});
	}
}

form.field = function (property, label) {
	return new Field(property, label);
};

form._options = {
	sources: ['body', 'query', 'params'],
	autoTrim: false
};

form.configure = function (options) {
	if (isBoolean(options.autoTrim)) this._options.autoTrim = options.autoTrim;
	if (isArray(options.sources)) this._options.sources = options.sources;
	return this;
}

module.exports = form;