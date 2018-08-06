'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toDefault()', function () {
	it('replace missing value with value', function() {
		var req = {
			body: {}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('replace empty string with `value`', function() {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('replace missing value with `value`', function() {
		var req = {
			body: {}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('replace empty string with `value`', function() {
		var req = {
			body: {
				field: ''
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('replace null value with `value`', function() {
		var req = {
			body: {
				field: null
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('replace undefined value with `value`', function() {
		var req = {
			body: {
				field: undefined
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('Replace NaN with value', function () {
		var req = {
			body: {
				field: NaN
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 'value');
	});
	it('do not replace false', function () {
		var req = {
			body: {
				field: false
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, false);

	});
	it('do not replace zero value', function () {
		var req = {
			body: {
				field: 0
			}
		};
		form(field('field').toDefault('value'))(req, {});
		assert.equal(req.form.field, 0);
	});
});
