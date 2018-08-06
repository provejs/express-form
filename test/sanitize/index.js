'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize', function () {
	it('toCss', function () {
		var req = {
			body: {
				field: '\np\r\n\n{}\t'
			}
		};
		form(field('field').toCss())(req, {});
		assert.equal(req.form.field, 'p {}');
	});
	it('toHtml');

	it('toTrim', function () {
		var req = {
			body: {
				field: '\r\n  value   \t'
			}
		};
		form(field('field').toTrim())(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('ltrim', function () {
		var req = {
			body: {
				field: '\r\n  value   \t'
			}
		};
		form(field('field').toTrimLeft())(req, {});
		assert.equal(req.form.field, 'value   \t');
	});
	it('rtrim', function () {
		var req = {
			body: {
				field: '\r\n  value   \t'
			}
		};
		form(field('field').toTrimRight())(req, {});
		assert.equal(req.form.field, '\r\n  value');
	});
	it('toFloat', function () {
		var req = {
			body: {
				field: '50.01'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.equal(req.form.field, 50.01);

		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.ok(isNaN(req.form.field));
	});
	it('toInt', function () {
		var req = {
			body: {
				field: '50.01'
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.equal(req.form.field, 50);

		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').toInt())(req, {});
		assert.ok(typeof req.form.field == 'number');
		assert.ok(isNaN(req.form.field));
	});
	it('toBoolean', function () {
		// Truthy values
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
		'1234567'.split('').forEach(function (i) {
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
		'1234567'.split('').forEach(function (i) {
			var name = 'field' + i;
			assert.strictEqual(typeof req.form[name], 'boolean');
			assert.strictEqual(req.form[name], false);
		});
	});
	it('toBooleanStrict', function () {
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
	it('toUpper', function () {
		var req = {
			body: {
				field: 'hellö!'
			}
		};
		form(field('field').toUpper())(req, {});
		assert.equal(req.form.field, 'HELLÖ!');
	});
	it('toUpper : object', function () {
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
	it('toUpper : array', function () {
		var req = {
			body: {
				email: ['MyEmaiL1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toUpper())(req, {});
		assert.strictEqual(req.form.email, 'MYEMAIL1@EXAMPLE.COM');
	});
	it('toLower', function () {
		var req = {
			body: {
				field: 'HELLÖ!'
			}
		};
		form(field('field').toLower())(req, {});
		assert.equal(req.form.field, 'hellö!');
	});
	it('toLower : object', function () {
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
	it('toLower : array', function () {
		var req = {
			body: {
				email: ['MyEmaiL1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, 'myemail1@example.com');
	});
	it('toTruncate', function () {
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
	it('toTruncate : object', function () {
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
	it('toTruncate : array', function () {
		var req = {
			body: {
				email: ['myemail1@example.com', 'myemail2@example.org']
			}
		};
		form(field('email').toTruncate(11))(req, {});
		assert.strictEqual(req.form.email, 'myemail1...');
	});
	it('toDate', function () {
		var req = {
			body: {
				field: '1900-01-01'
			}
		};
		form(field('field').toDate())(req, {});
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.toISOString, 'function');
	});
	it('toMoment', function () {
		var req = {
			body: {
				field: '1900-01-01T00:00:00'
			}
		};
		var res = {};
		form(field('field').toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.format, 'function');
		assert.equal(req.form.field.format(), '1900-01-01T00:00:00Z');
	});
	it('toMoment : timezone', function () {
		var req = {
			body: {
				field: '1900-01-01T00:00:00'
			}
		};
		var res = {
			locals: {
				timezone: {
					name: 'US/Central'
				}
			}
		};
		form(field('field').toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.format, 'function');
		assert.equal(req.form.field.format(), '1900-01-01T06:00:00Z');
	});
	it('toMoment : timezone : invalid', function () {
		var req = {
			body: {
				field: 'foobar'
			}
		};
		var res = {};
		form(field('field').toMoment())(req, res);
		assert.equal(req.form.field, null);
	});
	it('daterange: toMoment', function () {
		var req = {
			body: {
				field: '1900-01-01 to 2000-01-01'
			}
		};
		var res = {};
		form(field('field').isDateRange().toMoment())(req, res);
		assert.equal(typeof req.form.field, 'object');
		assert.equal(typeof req.form.field.min.format, 'function');
		assert.equal(typeof req.form.field.max.format, 'function');
		assert.equal(req.form.field.min.format(), '1900-01-01T00:00:00Z');
		assert.equal(req.form.field.max.format(), '2000-01-01T23:59:59Z');
	});
	it('toSplit in body', function () {
		var req = {
			body: {
				field: 'a,b,c'
			}
		};
		form(field('field').toSplit())(req, {});
		assert.equal(req.form.field.length, 3);
	});
	it('toSplit in query', function () {
		var req = {
			query: {
				field: 'a,b,c'
			}
		};
		form(field('field').toSplit())(req, {});
		assert.equal(req.form.field.length, 3);
	});
});
