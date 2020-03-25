'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toFloat()', function () {
	it('should handle string integer inputs', function () {
		var req = {
			body: {
				field: '50'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.strictEqual(req.form.field, 50);
	});
	it('should handle string float inputs', function () {
		var req = {
			body: {
				field: '50.01'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.strictEqual(req.form.field, 50.01);
	});
	it('should handle number inputs', function () {
		var req = {
			body: {
				field: 123
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.strictEqual(req.form.field, 123);
	});
	it('should handle number 0 inputs', function () {
		var req = {
			body: {
				field: 0
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.strictEqual(req.form.field, 0);
	});
	it('should handle non-float string inputs', function () {
		var req = {
			body: {
				field: 'fail'
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(typeof req.form.field === 'number');
		assert.ok(isNaN(req.form.field));
	});
	it('should handle empty string inputs', function () {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(isNaN(req.form.field));
	});
	it('should handle undefined inputs', function () {
		var req = {
			body: {
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(isNaN(req.form.field));
	});
	it('should handle null inputs', function () {
		var req = {
			body: {
				field: null
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(isNaN(req.form.field));
	});
	it('should handle true inputs', function () {
		var req = {
			body: {
				field: true
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(isNaN(req.form.field));
	});
	it('should handle false inputs', function () {
		var req = {
			body: {
				field: false
			}
		};
		form(field('field').toFloat())(req, {});
		assert.ok(isNaN(req.form.field));
	});
});
