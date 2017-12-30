/*!
 * Express - Form
 * Copyright(c) 2010 Dan Dean <me@dandean.com>
 * MIT Licensed
 */

var Async = require('async');
var Utils = require('./utils');
var Field = require('./field');

function form() {
	var routines = Array.prototype.slice.call(arguments);
	var options = form._options;

	return function (req, res, next) {
		var map = {};
		var mergedSource = {};

		req.form = req.form || {};
		res.locals = res.locals || {};

		options.dataSources.forEach(function (source) {
			Utils.merge(mergedSource, req[source]);
		});

		if (options.passThrough) req.form = Utils.clone(mergedSource);

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
			routine.run(res.locals, mergedSource, req.form, options, function (err, result) {

				// return early if no errors
				if (!Array.isArray(result) || !result.length) return cb(null);

				var errors = req.form.errors = req.form.errors || [];
				var name = routine.name;

				map[name] = map[name] || [];

				result.forEach(function (error) {
					errors.push(error);
					map[name].push(error);
				});

				cb(null);
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
	dataSources: ['body', 'query', 'params'],
	autoTrim: false,
	passThrough: false
};

form.configure = function (options) {
	for (var p in options) {
		if (!Array.isArray(options[p]) && p === 'dataSources') {
			options[p] = [options[p]];
		}
		this._options[p] = options[p];
	}
	return this;
}

module.exports = form;