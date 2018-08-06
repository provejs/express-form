'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('sanitize.toSplit()', function () {
	it('should split input in body', function () {
		var req = {
			body: {
				field: 'a,b,c'
			}
		};
		form(field('field').toSplit())(req, {});
		assert.equal(req.form.field.length, 3);
	});
	it('should split in query', function () {
		var req = {
			query: {
				field: 'a,b,c'
			}
		};
		form(field('field').toSplit())(req, {});
		assert.equal(req.form.field.length, 3);
	});
});
