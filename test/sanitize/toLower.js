'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toLower()', function () {
	it('should handle non-ascii inputs', function () {
		var req = {
			body: {
				field: 'HELLÖ!'
			}
		};
		form(field('field').toLower())(req, {});
		assert.equal(req.form.field, 'hellö!');
	});
	it('should handle object inputs', function () {
		var req = {
			body: {
				email: {
					key: '1'
				}
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '[object object]');
	});
	it('should handle array inputs', function () {
		var req = {
			body: {
				email: ['MyEmaiL1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, 'myemail1@example.com');
	});
});
