'use strict';

var assert = require('assert');
var form = require('../index');
var field = form.field;

describe('validate', function () {
	it('isDate', function () {
		// Skip validating empty values
		var req = {
			body: {}
		};
		form(field('field').isDate())(req, {});
		assert.equal(req.form.errors.length, 0);

		// Failure.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isDate())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not a date');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isDate('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: '01/29/2012'
			}
		};
		form(field('field').isDate())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isEmail', function () {
		// Skip validating empty values
		var req = {
			body: {}
		};
		form(field('field').isEmail())(req, {});
		assert.equal(req.form.errors.length, 0);

		// Failure.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isEmail())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not an email address');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isEmail('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'me@dandean.com'
			}
		};
		form(field('field').isEmail())(req, {});
		assert.equal(req.form.errors.length, 0);

		var validEmails = [
			'user@host.com',
			'user@host.info',
			'user@host.co.uk',
			'user+service@host.co.uk',
			'user-ok.yes+tag@host.k12.mi.us',
			'FirstNameLastName2000@hotmail.com',
			'FooBarEmail@foo.apartments'
		];

		for (var i in validEmails) {
			req = {
				body: {
					field: validEmails[i]
				}
			};
			form(field('field').isEmail())(req, {});
			assert.equal(req.form.errors.length, 0, 'failed to validate email: ' + validEmails[i]);
		}

		var badEmails = [
			'dontvalidateme',
			'nope@',
			'someUser',
			'<script@host.com',
			//'userawesome*@host.com',
			'userawesom@ok.com?&vl=1'
		];

		for (var i1 in badEmails) {
			req = {
				body: {
					field: badEmails[i1]
				}
			};
			form(field('field').isEmail())(req, {});
			assert.equal(req.form.errors.length, 1, 'should not validate email: ' + badEmails[i1]);
		}

	});
	it('isUrl', function () {
		// Failure.
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isURL())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not a URL');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isURL('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'http://www.google.com'
			}
		};
		form(field('field').isURL())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isIP', function () {
		// Failure.
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isIP())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not an IP address');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isIP('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: '0.0.0.0'
			}
		};
		form(field('field').isIP())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isAlpha', function () {
		// Failure.
		var req = {
			body: {
				field: '123456'
			}
		};
		form(field('field').isAlpha())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field contains non-letter characters');

		// Failure w/ custom message.
		req = {
			body: {
				field: '123456'
			}
		};
		form(field('field').isAlpha('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'abcde'
			}
		};
		form(field('field').isAlpha())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isAlphanumeric', function () {
		// Failure.
		var req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isAlphanumeric())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field contains non alpha-numeric characters');

		// Failure w/ custom message.
		req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isAlphanumeric('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'abc123'
			}
		};
		form(field('field').isAlphanumeric())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isNumeric', function () {
		// Failure.
		var req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isNumeric())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not a number');

		// Failure w/ custom message.
		req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isNumeric('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success Int
		req = {
			body: {
				integer: '123456'
				//floating: '123456.45',
				//negative: '-123456.45',
				//positive: '+123456.45',
				//padded: '000045.343'
			}
		};
		form(
			field('integer').isNumeric()
			//field('floating').isNumeric(),
			//field('negative').isNumeric(),
			//field('positive').isNumeric(),
			//field('padded').isNumeric()
		)(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isInt', function () {
		// Failure.
		var req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isInt())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not an integer');

		// Failure w/ custom message.
		req = {
			body: {
				field: '------'
			}
		};
		form(field('field').isInt('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: '50'
			}
		};
		form(field('field').isInt())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isLowercase', function () {
		// Failure.
		var req = {
			body: {
				field: 'FAIL'
			}
		};
		form(field('field').isLowercase())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field contains uppercase letters');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'FAIL'
			}
		};
		form(field('field').isLowercase('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'win'
			}
		};
		form(field('field').isLowercase())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isUppercase', function () {
		// Failure.
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isUppercase())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field contains lowercase letters');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').isUppercase('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'WIN'
			}
		};
		form(field('field').isUppercase())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isFloat', function () {
		// Failure.
		var req = {
			body: {
				field: '5000'
			}
		};
		form(field('field').isFloat())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not a decimal');

		// Failure w/ custom message.
		req = {
			body: {
				field: '5000'
			}
		};
		form(field('field').isFloat('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: '5000.00'
			}
		};
		form(field('field').isFloat())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isNotEmpty', function () {
		// Failure.
		var req = {
			body: {
				field: '  \t'
			}
		};
		form(field('field').isNotEmpty())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field has no value or is only whitespace');

		// Failure w/ custom message.
		req = {
			body: {
				field: '  \t'
			}
		};
		form(field('field').isNotEmpty('!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'win'
			}
		};
		form(field('field').isNotEmpty())(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isEquals', function () {
		// Failure.
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isEquals('other'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field does not equal other');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isEquals('other', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isEquals('value'))(req, {});
		assert.equal(req.form.errors.length, 0);


		// Failure
		req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		form(field('field1').isEquals('field::field2'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field1 does not equal value2');

		// Success
		req = {
			body: {
				field1: 'value',
				field2: 'value'
			}
		};
		form(field('field1').isEquals('field::field2'))(req, {});
		assert.equal(req.form.errors.length, 0);

		// Failure with nested values
		req = {
			body: {
				field1: {
					deep: 'value1'
				},
				field2: {
					deeper: 'value2'
				}
			}
		};
		form(field('field1.deep').isEquals('field::field2[deeper]'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field1.deep does not equal value2');

		// Success with nested values
		req = {
			body: {
				field1: {
					deep: 'value'
				},
				field2: {
					deeper: 'value'
				}
			}
		};
		form(field('field1[deep]').isEquals('field::field2.deeper'))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isContains', function () {
		// Failure.
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isContains('other'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field does not contain required characters');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isContains('other', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isContains('alu'))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isNotContains', function () {
		// Failure.
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNotContains('alu'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field contains invalid characters');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNotContains('alu', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNotContains('win'))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('is', function () {
		// is(/pattern/)
		// is(/pattern/, 'message')
		// is('pattern')
		// is('pattern', 'modifiers')
		// is('pattern', 'message')
		// is('pattern', 'modifiers', 'message')

		// Failure: RegExp with default args
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is(/^\d+$/))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field has invalid characters');

		// Failure: RegExp with custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is(/^\d+$/, '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Failure: String with default args.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is('^\d+$'))(req, {}); //eslint-disable-line no-useless-escape
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field has invalid characters');

		// Success: String with modifiers
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is('^VALUE$', 'i'))(req, {});
		assert.equal(req.form.errors.length, 0);

		// Failure: String with custom message
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is('^\d+$', '!!! %s !!!'))(req, {}); //eslint-disable-line no-useless-escape
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Failure: String with modifiers and custom message
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is('^\d+$', 'i', '!!! %s !!!'))(req, {}); //eslint-disable-line no-useless-escape
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');


		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').is(/^value$/))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isNot', function () {
		// notRegex(/pattern/)
		// notRegex(/pattern/, 'message')
		// notRegex('pattern')
		// notRegex('pattern', 'modifiers')
		// notRegex('pattern', 'message')
		// notRegex('pattern', 'modifiers', 'message')

		// Failure: RegExp with default args
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot(/^value$/))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field has invalid characters');

		// Failure: RegExp with custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot(/^value$/, '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Failure: String with default args.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot('^value$'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field has invalid characters');

		// Success: String with modifiers
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot('^win$', 'i'))(req, {});
		assert.equal(req.form.errors.length, 0);

		// Failure: String with custom message
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot('^value$', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Failure: String with modifiers and custom message
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot('^value$', 'i', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isNot(/^win$/))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isMinLength', function () {
		// Failure.
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isMinLength(10))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is too short');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isMinLength(10, '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isMinLength(1))(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isString()', function () {
		var req = {
			body: {
				username: 'adasds@example.com',
				password: {
					'somevalue': '1'
				}
			}
		};
		form(field('password', 'Password')
			.isRequired()
			.isString()
			.isMinLength(10, '%s must be a minimum of 10 characters')
			.isMaxLength(256, '%s must be a maximum of 256 characters'))(req, {});
		assert.ok(!req.form.isValid);
		assert.strictEqual(req.form.errors[0], 'Password is not a string');
	});
	it('isMaxLength', function () {
		// Failure.
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isMaxLength(1))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is too long');

		// Failure w/ custom message.
		// var req = { body: { field: 'value' }};
		// form(field('field').isMaxLength(1, '!!! %s !!!'))(req, {});
		// assert.equal(req.form.errors.length, 1);
		// assert.equal(req.form.errors[0], '!!! field !!!');

		// Success
		// var req = { body: { field: 'value' }};
		// form(field('field').isMaxLength(5))(req, {});
		// assert.equal(req.form.errors.length, 0);
	});
	it('isRequired : failure', function() {
		var req = {
			body: {}
		};
		form(field('field').isRequired())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is required');
	});
	it('isRequired : failure : message', function() {
		var req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').isRequired('value', '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');
	});
	it('isRequired : success', function () {
		var req = {
			body: {
				field: '5000.00'
			}
		};
		form(field('field').isRequired())(req, {});
		assert.equal(req.form.errors.length, 0);

		// Non-required fields with no value should not trigger errors
		// Success
		req = {
			body: {
				fieldEmpty: '',
				fieldUndefined: undefined,
				fieldNull: null
			}
		};
		form(
			field('fieldEmpty').is(/whatever/),
			field('fieldUndefined').is(/whatever/),
			field('fieldNull').is(/whatever/),
			field('fieldMissing').is(/whatever/)
		)(req, {});
		assert.equal(req.form.errors.length, 0);
	});
	it('isRequired : toArray : success', function() {
		var req = {
			body: {
				field: 'xxx'
			}
		};
		form(field('field').toArray().isRequired())(req, {});
		assert.deepEqual(req.form.field, ['xxx']);
		assert.equal(req.form.errors.length, 0);
		assert.equal(req.form.isValid, true);
	});
	it('toArray : isRequired : failure', function() {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').toArray().isRequired())(req, {});
		assert.deepEqual(req.form.field, []);
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.isValid, false);
	});
	it('isRequired : toArray : failure', function() {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').isRequired().toArray())(req, {});
		assert.deepEqual(req.form.field, []);
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.isValid, false);
	});
	it('isRequired : toArray : failure', function() {
		var req = {
			body: {
				field: []
			}
		};
		form(field('field').isRequired().toArray())(req, {});
		assert.deepEqual(req.form.field, []);
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.isValid, false);
	});
	it('custom', function () {
		var req;

		// Failure.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').custom(function () {
			throw new Error();
		}))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is invalid');

		// Failure w/ custom message.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').custom(function () {
			throw new Error();
		}, '!!! %s !!!'))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], '!!! field !!!');

		// Failure w/ custom message from internal error.
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').custom(function () {
			throw new Error('Radical %s');
		}))(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'Radical field');

		// Success
		req = {
			body: {
				field: 'value'
			}
		};
		form(field('field').custom(function () {}))(req, {});
		assert.equal(req.form.errors.length, 0);

		// Pass form data as 2nd argument to custom validators
		req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		form(field('field1').custom(function (value, formData) {
			assert.equal('value1', value);
			assert.ok(formData);
			assert.equal('value1', formData.field1);
			assert.equal('value2', formData.field2);
			throw new Error('This is a custom error thrown for %s.');
		}))(req, {});
		assert.equal(req.form.errors.length, 1);
	});
	it('custom : async', function (done) {
		var req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		var next = function next() {
			assert.strictEqual(req.form.isValid, false);
			assert.strictEqual(req.form.errors.length, 1);
			assert.strictEqual(req.form.errors[0], 'Invalid field1');
			done();
		};

		form(field('field1').custom(function (value, source, locals, callback) {
			process.nextTick(function () {
				assert.strictEqual(value, 'value1');
				callback(new Error('Invalid %s'));
			});
		}))(req, {}, next);
	});
	it('custom : async : success', function (done) {
		var req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		var callbackCalled = false;
		var next = function next() {
			assert.strictEqual(callbackCalled, true);
			assert.strictEqual(req.form.isValid, true);
			assert.strictEqual(req.form.errors.length, 0);
			done();
		};
		form(field('field1').custom(function (value, source, locals, callback) {
			process.nextTick(function () {
				assert.strictEqual(value, 'value1');
				callbackCalled = true;
				callback(null);
			});
		}))(req, {}, next);
	});
	it('custom : async : chaining', function (done) {
		var req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		var callbackCalled = 0;
		var next = function next() {
			assert.strictEqual(callbackCalled, 2);
			assert.strictEqual(req.form.isValid, false);
			assert.strictEqual(req.form.errors.length, 2);
			assert.strictEqual(req.form.errors[0], 'Fail! field1');
			assert.strictEqual(req.form.errors[1], 'yes sync custom funcs still work !! field1');
			done();
		};

		form(field('field1')
			.custom(function (value, source, locals, callback) {
				process.nextTick(function () {
					++callbackCalled;
					callback(null);
				});
			})
			.custom(function (value, source, locals, callback) {
				process.nextTick(function () {
					++callbackCalled;
					callback(new Error('Fail! %s'));
				});
			})
			.custom(function () {
				throw new Error('yes sync custom funcs still work !! %s');
			})
		)(req, {}, next);
	});
	it('custom : async : multiple fields', function (done) {
		var req = {
			body: {
				field1: 'value1',
				field2: 'value2'
			}
		};
		var callbackCalled = 0;
		var next = function next() {
			assert.strictEqual(callbackCalled, 2);
			assert.strictEqual(req.form.isValid, false);
			assert.strictEqual(req.form.errors.length, 2);
			assert.strictEqual(req.form.errors[0], 'field1 error');
			assert.strictEqual(req.form.errors[1], 'field2 error');
			done();
		};
		form(
			field('field1').custom(function (value, source, locals, callback) {
				process.nextTick(function () {
					++callbackCalled;
					assert.strictEqual(value, 'value1');
					callback(new Error('%s error'));
				});
			}),
			field('field2').custom(function (value, source, locals, callback) {
				process.nextTick(function () {
					++callbackCalled;
					assert.strictEqual(value, 'value2');
					callback(new Error('%s error'));
				});
			})
		)(req, {}, next);
	});
	it('req.form property-pollution', function () {
		var req = {
			body: {}
		};
		form()(req, {});
		assert.equal(req.form.errors.length, 0);
		assert.equal('{}', JSON.stringify(req.form));
	});
	it('complex properties', function () {
		var req = {
			body: {
				field: {
					inner: 'value',
					even: {
						more: {
							inner: 'value'
						}
					}
				}
			}
		};
		form(
			field('field[inner]').isRequired().isEquals('value'),
			field('field[inner]').isRequired().isEquals('fail'),
			field('field[even][more][inner]').isRequired().isEquals('value'),
			field('field[even][more][inner]').isRequired().isEquals('fail')
		)(req, {});
		assert.equal(req.form.errors.length, 2);
	});
});
