var assert = require('assert');
var form = require('../index');
var field = form.field;

module.exports = {
  'filter : trim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(field('field').trim())(req, {});
    assert.equal(req.form.field, 'value');
  },
  
  'filter : ltrim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(field('field').ltrim())(req, {});
    assert.equal(req.form.field, 'value   \t');
  },

  'filter : rtrim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(field('field').rtrim())(req, {});
    assert.equal(req.form.field, '\r\n  value');
  },

  'filter : ifNull': function() {
    // Replace missing value with 'value'
    var req = { body: {} };
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace empty string with value
    var req = { body: { field: '' }};
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace NULL with value
    var req = { body: { field: null }};
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace undefined with value
    var req = { body: { field: undefined }};
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // DO NOT replace false
    var req = { body: { field: false }};
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, false);

    // DO NOT replace zero
    var req = { body: { field: 0 }};
    form(field('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 0);
  },

  'filter : toFloat': function() {
    var req = { body: { field: '50.01' }};
    form(field('field').toFloat())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.equal(req.form.field, 50.01);

    var req = { body: { field: 'fail' }};
    form(field('field').toFloat())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.ok(isNaN(req.form.field));
  },

  'filter : toInt': function() {
    var req = { body: { field: '50.01' }};
    form(field('field').toInt())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.equal(req.form.field, 50);

    var req = { body: { field: 'fail' }};
    form(field('field').toInt())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.ok(isNaN(req.form.field));
  },

  'filter : toBoolean': function() {
    // Truthy values
    var req = { body: {
      field1: true,
      field2: 'true',
      field3: 'hi',
      field4: new Date(),
      field5: 50,
      field6: -1,
      field7: '3000'
    }};
    form(
      field('field1').toBoolean(),
      field('field2').toBoolean(),
      field('field3').toBoolean(),
      field('field4').toBoolean(),
      field('field5').toBoolean(),
      field('field6').toBoolean(),
      field('field7').toBoolean()
    )(req, {});
    '1234567'.split('').forEach(function(i) {
      var name = 'field' + i;
      assert.strictEqual(typeof req.form[name], 'boolean');
      assert.strictEqual(req.form[name], true);
    });

    // Falsy values
    var req = { body: {
      field1: false,
      field2: 'false',
      field3: null,
      field4: undefined,
      field5: 0,
      field6: '0',
      field7: ''
    }};
    form(
      field('field1').toBoolean(),
      field('field2').toBoolean(),
      field('field3').toBoolean(),
      field('field4').toBoolean(),
      field('field5').toBoolean(),
      field('field6').toBoolean(),
      field('field7').toBoolean()
    )(req, {});
    '1234567'.split('').forEach(function(i) {
      var name = 'field' + i;
      assert.strictEqual(typeof req.form[name], 'boolean');
      assert.strictEqual(req.form[name], false);
    });
  },

  'filter : toBooleanStrict': function() {
    // Truthy values
    var req = { body: {
      field1: true,
      field2: 'true',
      field3: 1,
      field4: '1'
    }};
    form(
      field('field1').toBooleanStrict(),
      field('field2').toBooleanStrict(),
      field('field3').toBooleanStrict(),
      field('field4').toBooleanStrict()
    )(req, {});
    '1234'.split('').forEach(function(i) {
      var name = 'field' + i;
      assert.strictEqual(typeof req.form[name], 'boolean');
      assert.strictEqual(req.form[name], true);
    });

    // Falsy values
    var req = { body: {
      field1: false,
      field2: 'false',
      field3: null,
      field4: undefined,
      field5: 0,
      field6: '0',
      field7: '',
      field8: new Date(),
      field9: 50,
      field0: -1,
      fielda: '3000'
    }};
    form(
      field('field1').toBooleanStrict(),
      field('field2').toBooleanStrict(),
      field('field3').toBooleanStrict(),
      field('field4').toBooleanStrict(),
      field('field5').toBooleanStrict(),
      field('field6').toBooleanStrict(),
      field('field7').toBooleanStrict(),
      field('field8').toBooleanStrict(),
      field('field9').toBooleanStrict(),
      field('field0').toBooleanStrict(),
      field('fielda').toBooleanStrict()
    )(req, {});
    '1234567890a'.split('').forEach(function(i) {
      var name = 'field' + i;
      assert.strictEqual(typeof req.form[name], 'boolean');
      assert.strictEqual(req.form[name], false);
    });
  },

  // 'filter : entityEncode': function() {
  //   // NOTE: single quotes are not encoded
  //   var req = { body: { field: '&\'<>hello!' }};
  //   form(field('field').entityEncode())(req, {});
  //   assert.equal(req.form.field, '&amp;&quot;&lt;&gt;hello!');
  // },

  // 'filter : entityDecode': function() {
  //   var req = { body: { field: '&amp;&quot;&lt;&gt;hello!' }};
  //   form(field('field').entityDecode())(req, {});
  //   assert.equal(req.form.field, '&\'<>hello!');
  // },

  'filter : toUpper': function() {
    var req = { body: { field: 'hellö!' }};
    form(field('field').toUpper())(req, {});
    assert.equal(req.form.field, 'HELLÖ!');
  },
  
  'filter : toUpper : object': function() {
    var req = { body: { email: { key: '1' }}};
    form(field('email').toUpper())(req, {});
    assert.strictEqual(req.form.email, '[OBJECT OBJECT]');
  },
  
  'filter : toUpper : array': function() {
    var req = { body: { email: ['MyEmaiL1@example.com', 'myemail2@example.org'] }};
    form(field('email').toUpper())(req, {});
    assert.strictEqual(req.form.email, 'MYEMAIL1@EXAMPLE.COM');
  },

  'filter : toLower': function() {
    var req = { body: { field: 'HELLÖ!' }};
    form(field('field').toLower())(req, {});
    assert.equal(req.form.field, 'hellö!');
  },
  
  'filter : toLower : object': function() {
    var req = { body: { email: { key: '1' }}};
    form(field('email').toLower())(req, {});
    assert.strictEqual(req.form.email, '[object object]');
  },
  
  'filter : toLower : array': function() {
    var req = { body: { email: ['MyEmaiL1@example.com', 'myemail2@example.org'] }};
    form(field('email').toLower())(req, {});
    assert.strictEqual(req.form.email, 'myemail1@example.com');
  },

  'filter : truncate': function() {
    var req = { body: {
      field1: '1234567890',
      field2: '',
      field3: '123',
      field4: '123456',
      field5: '1234567890'
    }};
    form(
      field('field1').truncate(3), // ...
      field('field2').truncate(3), // EMPTY
      field('field3').truncate(3), // 123
      field('field4').truncate(5), // 12...
      field('field5').truncate(7)  // 1234...
    )(req, {});
    assert.equal(req.form.field1, '...');
    assert.equal(req.form.field2, '');
    assert.equal(req.form.field3, '123');
    assert.equal(req.form.field4, '12...');
    assert.equal(req.form.field5, '1234...');
  },
  
  'filter : truncate : object': function() {
    var req = { body: { email: { key: '1', length: 100 }}};
    form(field('email').truncate(10))(req, {});
    assert.strictEqual(req.form.email, '[object...');
  },
  
  'filter : truncate : array': function() {
    var req = { body: { email: ['myemail1@example.com', 'myemail2@example.org'] }};
    form(field('email').truncate(11))(req, {});
    assert.strictEqual(req.form.email, 'myemail1...');
  },

  'filter : custom': function() {
    var req = { body: { field: 'value!' }};
    form(field('field').custom(function(value) {
      return '!!!';
    }))(req, {});
    assert.equal(req.form.field, '!!!');
  }

};