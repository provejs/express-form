'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toBooleanStrict()', function () {
	it('should handle boolean inputs', function () {
		// Truthy values
		var req = {
			body: {
				field1: true,
				field2: 'true',
				field3: 1,
				field4: '1'
			}
		};
		form(
			field('field1').toBooleanStrict(),
			field('field2').toBooleanStrict(),
			field('field3').toBooleanStrict(),
			field('field4').toBooleanStrict()
		)(req, {});
		'1234'.split('').forEach(function (i) {
			var name = 'field' + i;
			assert.strictEqual(typeof req.form[name], 'boolean');
			assert.strictEqual(req.form[name], true);
		});

		// Falsy values
		req = {
			body: {
				field1: false,
				field2: 'false',
				field3: null,
				field4: undefined,
				field5: 0,
				field6: '0',
				field7: '',
				field8: new Date(),
				field9: 50,
				field0: -1,
				fielda: '3000'
			}
		};
		form(
			field('field1').toBooleanStrict(),
			field('field2').toBooleanStrict(),
			field('field3').toBooleanStrict(),
			field('field4').toBooleanStrict(),
			field('field5').toBooleanStrict(),
			field('field6').toBooleanStrict(),
			field('field7').toBooleanStrict(),
			field('field8').toBooleanStrict(),
			field('field9').toBooleanStrict(),
			field('field0').toBooleanStrict(),
			field('fielda').toBooleanStrict()
		)(req, {});
		'1234567890a'.split('').forEach(function (i) {
			var name = 'field' + i;
			assert.strictEqual(typeof req.form[name], 'boolean');
			assert.strictEqual(req.form[name], false);
		});
	});
});
