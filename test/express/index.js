'use strict';

var assert = require('assert');
var form = require('../../index');
var field = form.field;
var express = require('express');
var http = require('http');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var server;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

describe('express', function () {
	before(function() {
		server = http.createServer(app).listen(3000);
	});

	after(function() {
		server.close();
	});

	describe('middleware : valid-form', function () {
		it('should should work', function (done) {
			app.post(
				'/user',
				form(
					field('username').toTrim(),
					field('username').isRequired().is(/^[a-z]+$/),
					field('password').toTrim(),
					field('password').isRequired().is(/^[0-9]+$/)
				),
				function (req, res) {
					assert.strictEqual(req.form.username, 'dandean');
					assert.strictEqual(req.form.password, '12345');
					assert.strictEqual(req.form.isValid, true);
					assert.strictEqual(req.form.errors.length, 0);
					res.send(JSON.stringify(req.form));
				}
			);

			request.post({
				url: 'http://localhost:3000/user',
				method: 'POST',
				body: JSON.stringify({
					username: '   dandean   \n\n\t',
					password: ' 12345 '
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}, function (err, res) {
				assert.ifError(err);
				assert.strictEqual(res.statusCode, 200);
				done();
			});
		});
	});

	describe('middleware : merged-data', function () {
		it('should should work', function (done) {
			app.post(
				'/user/:id',
				form(
					field('id').toInt(),
					field('stuff').toUpper(),
					field('rad').toUpper()
				),
				function (req, res) {
					// Validate filtered form data
					assert.strictEqual(req.form.id, 5); // from param
					assert.equal(req.form.stuff, 'THINGS'); // from query param
					assert.equal(req.form.rad, 'COOL'); // from body

					// Check that originl values are still in place
					assert.ok(typeof req.params.id, 'string');
					assert.equal(req.query.stuff, 'things');
					assert.equal(req.body.rad, 'cool');

					res.send(JSON.stringify(req.form));
				}
			);

			request({
				url: 'http://localhost:3000/user/5?stuff=things&id=overridden',
				method: 'POST',
				body: JSON.stringify({
					id: 'overridden by url param',
					stuff: 'overridden by query param',
					rad: 'cool'
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}, function (err, res) {
				assert.ifError(err);
				assert.strictEqual(res.statusCode, 200);
				done();
			});
		});
	});
});
