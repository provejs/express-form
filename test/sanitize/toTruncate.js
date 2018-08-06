'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toTruncate()', function () {
	it('should handle range of inputs', function () {
		var req = {
			body: {
				field1: '1234567890',
				field2: '',
				field3: '123',
				field4: '123456',
				field5: '1234567890'
			}
		};
		form(
			field('field1').toTruncate(3), // ...
			field('field2').toTruncate(3), // EMPTY
			field('field3').toTruncate(3), // 123
			field('field4').toTruncate(5), // 12...
			field('field5').toTruncate(7) // 1234...
		)(req, {});
		assert.equal(req.form.field1, '...');
		assert.equal(req.form.field2, '');
		assert.equal(req.form.field3, '123');
		assert.equal(req.form.field4, '12...');
		assert.equal(req.form.field5, '1234...');
	});
	it('should handle object inputs', function () {
		var req = {
			body: {
				email: {
					key: '1',
					length: 100
				}
			}
		};
		form(field('email').toTruncate(10))(req, {});
		assert.strictEqual(req.form.email, '[object...');
	});
	it('should handle array inputs', function () {
		var req = {
			body: {
				email: ['myemail1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toTruncate(11))(req, {});
		assert.strictEqual(req.form.email, 'myemail1...');
	});
});
