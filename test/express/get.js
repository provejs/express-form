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

	describe('http get method', function () {
		it('should work with query params', function (done) {
			app.get(
				'/user',
				form(
					field('username').toTrim(),
					field('username').isRequired().is(/^[a-z]+$/)
				),
				function (req, res) {
					// console.log(req.form);
					assert.strictEqual(req.form.username, 'dan');
					assert.strictEqual(req.form.isValid, true);
					assert.strictEqual(req.form.errors.length, 0);
					res.send(JSON.stringify(req.form));
				}
			);

			request.get({
				url: 'http://localhost:3000/user?username= dan',
				method: 'GET'
			}, function (err, res) {
				// reqeust callback
				assert.ifError(err);
				assert.strictEqual(res.statusCode, 200);
				done();
			});
		});
	});
});
