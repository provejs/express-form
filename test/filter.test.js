var assert = require('assert');
var form = require('../index');
var filter = form.field;

module.exports = {
  'filter : trim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(filter('field').trim())(req, {});
    assert.equal(req.form.field, 'value');
  },
  
  'filter : ltrim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(filter('field').ltrim())(req, {});
    assert.equal(req.form.field, 'value   \t');
  },

  'filter : rtrim': function() {
    var req = { body: { field: '\r\n  value   \t' }};
    form(filter('field').rtrim())(req, {});
    assert.equal(req.form.field, '\r\n  value');
  },

  'filter : ifNull': function() {
    // Replace missing value with 'value'
    var req = { body: {} };
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace empty string with value
    var req = { body: { field: '' }};
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace NULL with value
    var req = { body: { field: null }};
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // Replace undefined with value
    var req = { body: { field: undefined }};
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 'value');

    // DO NOT replace false
    var req = { body: { field: false }};
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, false);

    // DO NOT replace zero
    var req = { body: { field: 0 }};
    form(filter('field').ifNull('value'))(req, {});
    assert.equal(req.form.field, 0);
  },

  'filter : toFloat': function() {
    var req = { body: { field: '50.01' }};
    form(filter('field').toFloat())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.equal(req.form.field, 50.01);

    var req = { body: { field: 'fail' }};
    form(filter('field').toFloat())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.ok(isNaN(req.form.field));
  },

  'filter : toInt': function() {
    var req = { body: { field: '50.01' }};
    form(filter('field').toInt())(req, {});
    assert.ok(typeof req.form.field == 'number');
    assert.equal(req.form.field, 50);

    var req = { body: { field: 'fail' }};
    form(filter('field').toInt())(req, {});
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
      filter('field1').toBoolean(),
      filter('field2').toBoolean(),
      filter('field3').toBoolean(),
      filter('field4').toBoolean(),
      filter('field5').toBoolean(),
      filter('field6').toBoolean(),
      filter('field7').toBoolean()
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
      filter('field1').toBoolean(),
      filter('field2').toBoolean(),
      filter('field3').toBoolean(),
      filter('field4').toBoolean(),
      filter('field5').toBoolean(),
      filter('field6').toBoolean(),
      filter('field7').toBoolean()
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
      filter('field1').toBooleanStrict(),
      filter('field2').toBooleanStrict(),
      filter('field3').toBooleanStrict(),
      filter('field4').toBooleanStrict()
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
      filter('field1').toBooleanStrict(),
      filter('field2').toBooleanStrict(),
      filter('field3').toBooleanStrict(),
      filter('field4').toBooleanStrict(),
      filter('field5').toBooleanStrict(),
      filter('field6').toBooleanStrict(),
      filter('field7').toBooleanStrict(),
      filter('field8').toBooleanStrict(),
      filter('field9').toBooleanStrict(),
      filter('field0').toBooleanStrict(),
      filter('fielda').toBooleanStrict()
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
  //   form(filter('field').entityEncode())(req, {});
  //   assert.equal(req.form.field, '&amp;&quot;&lt;&gt;hello!');
  // },

  // 'filter : entityDecode': function() {
  //   var req = { body: { field: '&amp;&quot;&lt;&gt;hello!' }};
  //   form(filter('field').entityDecode())(req, {});
  //   assert.equal(req.form.field, '&\'<>hello!');
  // },

  'filter : toUpper': function() {
    var req = { body: { field: 'hellö!' }};
    form(filter('field').toUpper())(req, {});
    assert.equal(req.form.field, 'HELLÖ!');
  },
  
  'filter : toUpper : object': function() {
    var req = { body: { email: { key: '1' }}};
    form(filter('email').toUpper())(req, {});
    assert.strictEqual(req.form.email, '[OBJECT OBJECT]');
  },
  
  'filter : toUpper : array': function() {
    var req = { body: { email: ['MyEmaiL1@example.com', 'myemail2@example.org'] }};
    form(filter('email').toUpper())(req, {});
    assert.strictEqual(req.form.email, 'MYEMAIL1@EXAMPLE.COM');
  },

  'filter : toLower': function() {
    var req = { body: { field: 'HELLÖ!' }};
    form(filter('field').toLower())(req, {});
    assert.equal(req.form.field, 'hellö!');
  },
  
  'filter : toLower : object': function() {
    var req = { body: { email: { key: '1' }}};
    form(filter('email').toLower())(req, {});
    assert.strictEqual(req.form.email, '[object object]');
  },
  
  'filter : toLower : array': function() {
    var req = { body: { email: ['MyEmaiL1@example.com', 'myemail2@example.org'] }};
    form(filter('email').toLower())(req, {});
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
      filter('field1').truncate(3), // ...
      filter('field2').truncate(3), // EMPTY
      filter('field3').truncate(3), // 123
      filter('field4').truncate(5), // 12...
      filter('field5').truncate(7)  // 1234...
    )(req, {});
    assert.equal(req.form.field1, '...');
    assert.equal(req.form.field2, '');
    assert.equal(req.form.field3, '123');
    assert.equal(req.form.field4, '12...');
    assert.equal(req.form.field5, '1234...');
  },
  
  'filter : truncate : object': function() {
    var req = { body: { email: { key: '1', length: 100 }}};
    form(filter('email').truncate(10))(req, {});
    assert.strictEqual(req.form.email, '[object...');
  },
  
  'filter : truncate : array': function() {
    var req = { body: { email: ['myemail1@example.com', 'myemail2@example.org'] }};
    form(filter('email').truncate(11))(req, {});
    assert.strictEqual(req.form.email, 'myemail1...');
  },

  'filter : custom': function() {
    var req = { body: { field: 'value!' }};
    form(filter('field').custom(function(value) {
      return '!!!';
    }))(req, {});
    assert.equal(req.form.field, '!!!');
  }

};