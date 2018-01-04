'use strict';

var Async = require('async');
var Utils = require('./utils');
var Field = require('./field');

function form() {
	var routines = Array.prototype.slice.call(arguments);
	var options = form._options;

	return function (req, res, next) {
		var map = {};
		var data = {};

		req.form = req.form || {};
		res.locals = res.locals || {};

		options.sources.forEach(function (source) {
			Utils.merge(data, req[source]);
		});

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
				if (!Array.isArray(result) || !result.length) return process.nextTick(cb);
				
				var errors = req.form.errors;
				var name = routine.name;

				map[name] = map[name] || [];

				result.forEach(function (error) {
					errors.push(error);
					map[name].push(error);
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

form.filter = form.validate = form.field;

form._options = {
	sources: ['body', 'query', 'params'],
	autoTrim: false,
	passThrough: false
};

form.configure = function (options) {
	for (var p in options) {
		this._options[p] = options[p];
	}
	return this;
}

module.exports = form;