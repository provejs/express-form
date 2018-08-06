'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toUpper()', function () {
	it('should handle non-ascii inputs', function () {
		var req = {
			body: {
				field: 'hellö!'
			}
		};
		form(field('field').toUpper())(req, {});
		assert.equal(req.form.field, 'HELLÖ!');
	});
	it('should handle object inputs', function () {
		var req = {
			body: {
				email: {
					key: '1'
				}
			}
		};
		form(field('email').toUpper())(req, {});
		assert.strictEqual(req.form.email, '[OBJECT OBJECT]');
	});
	it('should handle array inputs', function () {
		var req = {
			body: {
				email: ['MyEmaiL1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toUpper())(req, {});
		assert.strictEqual(req.form.email, 'MYEMAIL1@EXAMPLE.COM');
	});
});
