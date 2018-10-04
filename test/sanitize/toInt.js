'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toInt()', function () {
	it('should handle string float inputs', function () {
		var req = {
			body: {
				field: '50.01'
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.equal(req.form.field, 50);
	});
	it('should handle non-float string inputs', function () {
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.ok(isNaN(req.form.field));
	});
	it('should handle empty string inputs', function () {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(isNaN(req.form.field));
	});
	it('should handle undefined inputs', function () {
		var req = {
			body: {
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(isNaN(req.form.field));
	});
});
