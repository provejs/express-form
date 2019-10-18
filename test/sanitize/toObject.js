'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toObject()', function () {
	it('should support converting query params to object', function () {
		var overrides = {f100: 'a', f101: 'b', f102: 'c'};
		var req = {
			query: {
				overrides: overrides
			}
		};

		form(field('overrides').toObject())(req, {});
		// console.log('req.form', req.form);
		assert.deepEqual(req.form.overrides, overrides);
	});
	it('should support invalid object params to object', function () {
		var req = {
			query: {
				overrides: '{{{'
			}
		};

		form(field('overrides').toObject())(req, {});
		// console.log('req.form', req);
		assert.deepEqual(req.form.overrides, '{{{');
	});
	it('should support converting body params to object', function () {
		var overrides = {f100: 'a', f101: 'b', f102: 'c'};
		var req = {
			body: {
				overrides: overrides
			}
		};

		form(field('overrides').toObject())(req, {});
		// console.log('req.form', req.form);
		assert.deepEqual(req.form.overrides, overrides);
	});
});
