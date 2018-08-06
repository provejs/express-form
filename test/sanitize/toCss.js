'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toCss()', function () {
	it('should handle css', function () {
		var req = {
			body: {
				field: '\np\r\n\n{}\t'
			}
		};
		form(field('field').toCss())(req, {});
		assert.equal(req.form.field, 'p {}');
	});
});
