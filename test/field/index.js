'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;

describe('field(): array', function () {
	it('should accept array inputs, and convert non-array inputs to arrays', function () {
		var req = {
			body: {
				field1: '',
				field2: 'Hello!',
				field3: ['Alpacas?', 'Llamas!!?', 'Vicunas!', 'Guanacos!!!']
			}
		};
		form(
			field('fieldx').toArray(),
			field('field1').toArray(),
			field('field2').toArray(),
			field('field3').toArray()
		)(req, {});
		assert.strictEqual(Array.isArray(req.form.fieldx), true);
		assert.strictEqual(req.form.fieldx.length, 0);
		assert.strictEqual(Array.isArray(req.form.field1), true);
		assert.strictEqual(req.form.field1.length, 0);
		assert.strictEqual(req.form.field2[0], 'Hello!');
		assert.strictEqual(req.form.field2.length, 1);
		assert.strictEqual(req.form.field3[0], 'Alpacas?');
		assert.strictEqual(req.form.field3[1], 'Llamas!!?');
		assert.strictEqual(req.form.field3[2], 'Vicunas!');
		assert.strictEqual(req.form.field3[3], 'Guanacos!!!');
		assert.strictEqual(req.form.field3.length, 4);
	});
	it('should convert array input to first array element when not expecting array input', function () {
		var req = {
			body: {
				field: ['red', 'blue']
			}
		};
		form(field('field'))(req, {});
		assert.strictEqual(req.form.field, 'red');
	});
	it('should pass array input to sanitize methods', function () {
		var req = {
			body: {
				field: ['david', 'stephen', 'greg']
			}
		};
		form(field('field').toArray().toUpper())(req, {});
		assert.strictEqual(req.form.field[0], 'DAVID');
		assert.strictEqual(req.form.field[1], 'STEPHEN');
		assert.strictEqual(req.form.field[2], 'GREG');
		assert.strictEqual(req.form.field.length, 3);

	});
	it('should pass pass array input  to validate method', function () {
		var req = {
			body: {
				field: [1, 2, 'f']
			}
		};
		form(field('field').toArray().isInt())(req, {});
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field is not an integer');
	});
	it('should handle deeply nested inputs using dot notation', function () {
		// Nesting with dot notation
		var req = {
			body: {
				field: {
					nest: 'wow',
					child: '4',
					gb: {
						a: 'a',
						b: 'aaaa',
						c: {
							fruit: 'deeper',
							must: {
								go: 'deeperrrr'
							}
						}
					}
				}

			}
		};
		form(
			field('field.nest').toUpper(),
			field('field.child').toUpper(),
			field('field.gb.a').toUpper(),
			field('field.gb.b').toUpper(),
			field('field.gb.c.fruit').toUpper(),
			field('field.gb.c.must.go').toUpper()
		)(req, {});
		assert.strictEqual(req.form.field.nest, 'WOW');
		assert.strictEqual(req.form.field.child, '4');
		assert.strictEqual(req.form.field.gb.a, 'A');
		assert.strictEqual(req.form.field.gb.b, 'AAAA');
		assert.strictEqual(req.form.field.gb.c.fruit, 'DEEPER');
		assert.strictEqual(req.form.field.gb.c.must.go, 'DEEPERRRR');
	});
	it('should handle deeply nested inputs using square-bracket notation', function () {
		var req = {
			body: {
				field: {
					nest: 'wow',
					child: '4',
					gb: {
						a: 'a',
						b: 'aaaa',
						c: {
							fruit: 'deeper',
							must: {
								go: 'deeperrrr'
							}
						}
					}
				}

			}
		};
		form(
			field('field[nest]').toUpper(),
			field('field[child]').toUpper(),
			field('field[gb][a]').toUpper(),
			field('field[gb][b]').toUpper(),
			field('field[gb][c][fruit]').toUpper(),
			field('field[gb][c][must][go]').toUpper()
		)(req, {});
		assert.strictEqual(req.form.field.nest, 'WOW');
		assert.strictEqual(req.form.field.child, '4');
		assert.strictEqual(req.form.field.gb.a, 'A');
		assert.strictEqual(req.form.field.gb.b, 'AAAA');
		assert.strictEqual(req.form.field.gb.c.fruit, 'DEEPER');
		assert.strictEqual(req.form.field.gb.c.must.go, 'DEEPERRRR');
	});

	it('should chain sanitizers and pass to validator', function() {
		var req = {
			body: {
				field1: '    whatever    ',
				field2: '    some thing     '
			}
		};
		form(
			field('field1').toTrim().toUpper().isMaxLength(5),
			field('field2').isMinLength(12).toTrim()
		)(req, {});
		assert.strictEqual(req.form.field1, 'WHATEVER');
		assert.strictEqual(req.form.field2, 'some thing');
		assert.equal(req.form.errors.length, 1);
		assert.equal(req.form.errors[0], 'field1 is too long');
	});

	it('should autoTrim inputs', function() {
		// Auto-trim declared fields.
		form.configure({
			autoTrim: true
		});
		var req = {
			body: {
				field: '    whatever    '
			}
		};
		form(field('field'))(req, {});
		assert.strictEqual(req.form.field, 'whatever');
		form.configure({
			autoTrim: false
		});
	});
});
