'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toDate()', function () {
	it('should handle ISO date', function () {
		var req = {
			body: {
				field: '1900-01-01'
			}
		};
		form(field('field').toDate())(req, {});
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.toISOString, 'function');
	});
});
