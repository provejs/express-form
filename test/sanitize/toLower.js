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
		assert.strictEqual(req.form.field, 'hellö!');
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
		assert.strictEqual(req.form.email, '');
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
	it('should handle empty array inputs', function () {
		var req = {
			body: {
				email: []
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '');
	});
	it('should handle undefined inputs', function () {
		var req = {
			body: {
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '');
	});
	it('should handle null inputs', function () {
		var req = {
			body: {
				email: null
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '');
	});
	it('should handle NaN inputs', function () {
		var req = {
			body: {
				email: NaN
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '');
	});
	it('should handle number inputs', function () {
		var req = {
			body: {
				email: 1
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '1');
	});
	it('should handle number 0 inputs', function () {
		var req = {
			body: {
				email: 0
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, '0');
	});
	it('should handle true inputs', function () {
		var req = {
			body: {
				email: true
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, 'true');
	});
	it('should handle false inputs', function () {
		var req = {
			body: {
				email: false
			}
		};
		form(field('email').toLower())(req, {});
		assert.strictEqual(req.form.email, 'false');
	});
});
