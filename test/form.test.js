var assert = require('assert');
var form = require('../index');
var field = form.field;
var utils = require('../lib/utils');

module.exports = {
  'form : isValid': function() {
    // Failure.
    var req = { body: { field: 'fail' }};
    form(field('field').isEmail())(req, {});
    assert.strictEqual(req.form.isValid, false);

    // Success
    var req = { body: { field: 'me@dandean.com' }};
    form(field('field').isEmail())(req, {});
    assert.strictEqual(req.form.isValid, true);
    
    // form.isValid is a getter only
    req.form.isValid = false;
    assert.strictEqual(req.form.isValid, true);
  },
  
  'form : getErrors': function() {
    var req = {
      body: {
        field0: 'win',
        field1: 'fail',
        field2: 'fail',
        field3: 'fail'
      }
    };
    
    form(
      field('field0').equals('win'),
      field('field1').isEmail(),
      field('field2').isEmail().isURL(),
      field('field3').isEmail().isURL().isIP()
    )(req, {});
    
    assert.equal(req.form.isValid, false);
    assert.equal(req.form.errors.length, 6);

    assert.equal(req.form.getErrors('field0').length, 0);
    assert.equal(req.form.getErrors('field1').length, 1);
    assert.equal(req.form.getErrors('field2').length, 2);
    assert.equal(req.form.getErrors('field3').length, 3);
  },
  
  'form : configure : sources': function() {
    form.configure({ sources: ['other'] });

    var req = { other: { field: 'me@dandean.com' }};
    form(field('field').isEmail())(req, {});
    assert.strictEqual(req.form.isValid, true);
    assert.equal(req.form.field, 'me@dandean.com');

    form.configure({ sources: ['body', 'query', 'params'] });
  },
  
  'form : configure : autoTrim': function() {
    // req with username field containing a trailing space
    var req = {
      body: {
        username: 'myuser1 '
      }
    };
    
    var req2 = utils.clone(req);
    
    // alphanumeric
    var regex = /^[0-9A-Z]+$/i
    
    // autoTrim defaults to false, test results with it off
    assert.strictEqual(form._options.autoTrim, false);
    form(field('username').is(regex))(req, {});
    assert.strictEqual(req.form.isValid, false);
    
    // test results with autoTrim turned on 
    form.configure({ autoTrim: true });
    assert.strictEqual(form._options.autoTrim, true);
    form(field('username').is(regex))(req2, {});
    assert.strictEqual(req2.form.isValid, true);
    assert.strictEqual(req2.form.username, 'myuser1');
    
    // turn autoTrim back off
    form.configure({ autoTrim: false });
    assert.strictEqual(form._options.autoTrim, false);
  }
  
};
