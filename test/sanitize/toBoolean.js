'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toBoolean()', function () {
	it('should handle truthy values', function () {
		var req = {
			body: {
				field1: true,
				field2: 'true',
				field3: 'hi',
				field4: new Date(),
				field5: 50,
				field6: -1,
				field7: '3000'
			}
		};
		form(
			field('field1').toBoolean(),
			field('field2').toBoolean(),
			field('field3').toBoolean(),
			field('field4').toBoolean(),
			field('field5').toBoolean(),
			field('field6').toBoolean(),
			field('field7').toBoolean()
		)(req, {});

		// loop inputs
		'1234567'.split('').forEach(function (i) {
			var name = 'field' + i;
			assert.strictEqual(typeof req.form[name], 'boolean');
			assert.strictEqual(req.form[name], true);
		});
	});
	it('should handle falsy values', function () {
		var req = {
			body: {
				field1: false,
				field2: 'false',
				field3: null,
				field4: undefined,
				field5: 0,
				field6: '0',
				field7: ''
			}
		};
		form(
			field('field1').toBoolean(),
			field('field2').toBoolean(),
			field('field3').toBoolean(),
			field('field4').toBoolean(),
			field('field5').toBoolean(),
			field('field6').toBoolean(),
			field('field7').toBoolean()
		)(req, {});

		// loop inputs
		'1234567'.split('').forEach(function (i) {
			var name = 'field' + i;
			assert.strictEqual(typeof req.form[name], 'boolean');
			assert.strictEqual(req.form[name], false);
		});
	});
});
