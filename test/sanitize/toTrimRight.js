'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toTrimRight()', function () {
	it('should handle whitespace', function () {
		var req = {
			body: {
				field: '\r\n  value   \t'
			}
		};
		form(field('field').toTrimRight())(req, {});
		assert.equal(req.form.field, '\r\n  value');
	});
});
