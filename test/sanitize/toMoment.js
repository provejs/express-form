'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toMoment()', function () {
	it('should handle timestamp', function () {
		var req = {
			body: {
				field: '1900-01-01T00:00:00'
			}
		};
		var res = {};
		form(field('field').toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.format, 'function');
		assert.equal(req.form.field.format(), '1900-01-01T00:00:00Z');
	});
	it('should handle timestamp with locals.timezone.name', function () {
		var req = {
			body: {
				field: '1900-01-01T00:00:00'
			}
		};
		var res = {
			locals: {
				timezone: {
					name: 'US/Central'
				}
			}
		};
		form(field('field').toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.format, 'function');
		assert.equal(req.form.field.format(), '1900-01-01T06:00:00Z');
	});
	it('should handle invalid timestamp', function () {
		var req = {
			body: {
				field: 'foobar'
			}
		};
		var res = {};
		form(field('field').toMoment())(req, res);
		assert.equal(req.form.field, null);
	});
	it('should handle date range', function () {
		var req = {
			body: {
				field: '1900-01-01 to 2000-01-01'
			}
		};
		var res = {};
		form(field('field').isDateRange().toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.min.format, 'function');
		assert.equal(typeof req.form.field.max.format, 'function');
		assert.equal(req.form.field.min.format(), '1900-01-01T00:00:00Z');
		assert.equal(req.form.field.max.format(), '2000-01-01T23:59:59Z');
	});
});
