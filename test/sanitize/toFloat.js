'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toFloat()', function () {
	it('should handle float string inputs', function () {
		var req = {
			body: {
				field: '50.01'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.equal(req.form.field, 50.01);
	});
	it('should handle non-float string inputs', function () {
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.ok(isNaN(req.form.field));
	});
});
