var assert = require("assert"),
    form = require("../index"),
    validate = form.validate;

module.exports = {
  'validate : isDate': function() {
    // Skip validating empty values
    var req = { body: {} };
    form(validate("field").isDate())(req, {});
    assert.equal(req.form.errors.length, 0);

    // Failure.
    var req = { body: { field: "fail" }};
    form(validate("field").isDate())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not a date");

    // Failure w/ custom message.
    var req = { body: { field: "fail" }};
    form(validate("field").isDate("!!! %s !!!"))(req, {});
    console.log('errors', req.form.errors);
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "01/29/2012" }};
    form(validate("field").isDate())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isEmail': function() {
    // Skip validating empty values
    var req = { body: {} };
    form(validate("field").isEmail())(req, {});
    assert.equal(req.form.errors.length, 0);

    // Failure.
    var req = { body: { field: "fail" }};
    form(validate("field").isEmail())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not an email address");

    // Failure w/ custom message.
    var req = { body: { field: "fail" }};
    form(validate("field").isEmail("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "me@dandean.com" }};
    form(validate("field").isEmail())(req, {});
    assert.equal(req.form.errors.length, 0);

    var validEmails = [
      "user@host.com",
      "user@host.info",
      "user@host.co.uk",
      "user+service@host.co.uk",
      "user-ok.yes+tag@host.k12.mi.us",
      "FirstNameLastName2000@hotmail.com",
      "FooBarEmail@foo.apartments"
    ];

    for (var i in validEmails) {
      var req = { body: { field: validEmails[i] }};
      form(validate("field").isEmail())(req, {});
      assert.equal(req.form.errors.length, 0, 'failed to validate email: ' + validEmails[i]);
    }

    var badEmails = [
      "dontvalidateme",
      "nope@",
      "someUser",
      "<script@host.com",
      //"userawesome*@host.com",
      "userawesom@ok.com?&vl=1"
    ];

    for (var i in badEmails) {
      var req = { body: { field: badEmails[i] }};
      form(validate("field").isEmail())(req, {});
      assert.equal(req.form.errors.length, 1, 'should not validate email: ' + badEmails[i]);
    }

  },

  'validate : isUrl': function() {
    // Failure.
    var req = { body: { field: "fail" }};
    form(validate("field").isURL())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not a URL");

    // Failure w/ custom message.
    var req = { body: { field: "fail" }};
    form(validate("field").isURL("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "http://www.google.com" }};
    form(validate("field").isURL())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isIP': function() {
    // Failure.
    var req = { body: { field: "fail" }};
    form(validate("field").isIP())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not an IP address");

    // Failure w/ custom message.
    var req = { body: { field: "fail" }};
    form(validate("field").isIP("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "0.0.0.0" }};
    form(validate("field").isIP())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isAlpha': function() {
    // Failure.
    var req = { body: { field: "123456" }};
    form(validate("field").isAlpha())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field contains non-letter characters");

    // Failure w/ custom message.
    var req = { body: { field: "123456" }};
    form(validate("field").isAlpha("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "abcde" }};
    form(validate("field").isAlpha())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isAlphanumeric': function() {
    // Failure.
    var req = { body: { field: "------" }};
    form(validate("field").isAlphanumeric())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field contains non alpha-numeric characters");

    // Failure w/ custom message.
    var req = { body: { field: "------" }};
    form(validate("field").isAlphanumeric("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "abc123" }};
    form(validate("field").isAlphanumeric())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isNumeric': function() {
    // Failure.
    var req = { body: { field: "------" }};
    form(validate("field").isNumeric())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not a number");

    // Failure w/ custom message.
    var req = { body: { field: "------" }};
    form(validate("field").isNumeric("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success Int
    var req = { body: {
      integer: "123456"
      //floating: "123456.45",
      //negative: "-123456.45",
      //positive: "+123456.45",
      //padded: "000045.343"
    }};
    form(
      validate("integer").isNumeric(),
      //validate("floating").isNumeric(),
      //validate("negative").isNumeric(),
      //validate("positive").isNumeric(),
      //validate("padded").isNumeric()
    )(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isInt': function() {
    // Failure.
    var req = { body: { field: "------" }};
    form(validate("field").isInt())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not an integer");

    // Failure w/ custom message.
    var req = { body: { field: "------" }};
    form(validate("field").isInt("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "50" }};
    form(validate("field").isInt())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isLowercase': function() {
    // Failure.
    var req = { body: { field: "FAIL" }};
    form(validate("field").isLowercase())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field contains uppercase letters");

    // Failure w/ custom message.
    var req = { body: { field: "FAIL" }};
    form(validate("field").isLowercase("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "win" }};
    form(validate("field").isLowercase())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isUppercase': function() {
    // Failure.
    var req = { body: { field: "fail" }};
    form(validate("field").isUppercase())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field contains lowercase letters");

    // Failure w/ custom message.
    var req = { body: { field: "fail" }};
    form(validate("field").isUppercase("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "WIN" }};
    form(validate("field").isUppercase())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : isFloat': function() {
    // Failure.
    var req = { body: { field: "5000" }};
    form(validate("field").isFloat())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is not a decimal");

    // Failure w/ custom message.
    var req = { body: { field: "5000" }};
    form(validate("field").isFloat("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "5000.00" }};
    form(validate("field").isFloat())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : notEmpty': function() {
    // Failure.
    var req = { body: { field: "  \t" }};
    form(validate("field").notEmpty())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field has no value or is only whitespace");

    // Failure w/ custom message.
    var req = { body: { field: "  \t" }};
    form(validate("field").notEmpty("!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "win" }};
    form(validate("field").notEmpty())(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : equals': function() {
    // Failure.
    var req = { body: { field: "value" }};
    form(validate("field").equals("other"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field does not equal other");

    // Failure w/ custom message.
    var req = { body: { field: "value" }};
    form(validate("field").equals("other", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "value" }};
    form(validate("field").equals("value"))(req, {});
    assert.equal(req.form.errors.length, 0);


    // Failure
    var req = {
      body: {
        field1: "value1",
        field2: "value2"
      }
    };
    form(validate("field1").equals("field::field2"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field1 does not equal value2");

    // Success
    var req = {
      body: {
        field1: "value",
        field2: "value"
      }
    };
    form(validate("field1").equals("field::field2"))(req, {});
    assert.equal(req.form.errors.length, 0);

    // Failure with nested values
    var req = {
      body: {
        field1: { deep: "value1"},
        field2: { deeper: "value2"}
      }
    };
    form(validate("field1.deep").equals("field::field2[deeper]"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field1.deep does not equal value2");

    // Success with nested values
    var req = {
      body: {
        field1: { deep: "value"},
        field2: { deeper: "value"}
      }
    };
    form(validate("field1[deep]").equals("field::field2.deeper"))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : contains': function() {
    // Failure.
    var req = { body: { field: "value" }};
    form(validate("field").contains("other"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field does not contain required characters");

    // Failure w/ custom message.
    var req = { body: { field: "value" }};
    form(validate("field").contains("other", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "value" }};
    form(validate("field").contains("alu"))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : notContains': function() {
    // Failure.
    var req = { body: { field: "value" }};
    form(validate("field").notContains("alu"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field contains invalid characters");

    // Failure w/ custom message.
    var req = { body: { field: "value" }};
    form(validate("field").notContains("alu", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "value" }};
    form(validate("field").notContains("win"))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : regex/is': function() {
    // regex(/pattern/)
    // regex(/pattern/, "message")
    // regex("pattern")
    // regex("pattern", "modifiers")
    // regex("pattern", "message")
    // regex("pattern", "modifiers", "message")

    // Failure: RegExp with default args
    var req = { body: { field: "value" }};
    form(validate("field").regex(/^\d+$/))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field has invalid characters");

    // Failure: RegExp with custom message.
    var req = { body: { field: "value" }};
    form(validate("field").regex(/^\d+$/, "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Failure: String with default args.
    var req = { body: { field: "value" }};
    form(validate("field").regex("^\d+$"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field has invalid characters");

    // Success: String with modifiers
    var req = { body: { field: "value" }};
    form(validate("field").regex("^VALUE$", "i"))(req, {});
    assert.equal(req.form.errors.length, 0);

    // Failure: String with custom message
    var req = { body: { field: "value" }};
    form(validate("field").regex("^\d+$", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Failure: String with modifiers and custom message
    var req = { body: { field: "value" }};
    form(validate("field").regex("^\d+$", "i", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");


    // Success
    var req = { body: { field: "value" }};
    form(validate("field").regex(/^value$/))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validate : notRegex/not': function() {
    // notRegex(/pattern/)
    // notRegex(/pattern/, "message")
    // notRegex("pattern")
    // notRegex("pattern", "modifiers")
    // notRegex("pattern", "message")
    // notRegex("pattern", "modifiers", "message")

    // Failure: RegExp with default args
    var req = { body: { field: "value" }};
    form(validate("field").notRegex(/^value$/))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field has invalid characters");

    // Failure: RegExp with custom message.
    var req = { body: { field: "value" }};
    form(validate("field").notRegex(/^value$/, "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Failure: String with default args.
    var req = { body: { field: "value" }};
    form(validate("field").notRegex("^value$"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field has invalid characters");

    // Success: String with modifiers
    var req = { body: { field: "value" }};
    form(validate("field").notRegex("^win$", "i"))(req, {});
    assert.equal(req.form.errors.length, 0);

    // Failure: String with custom message
    var req = { body: { field: "value" }};
    form(validate("field").notRegex("^value$", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Failure: String with modifiers and custom message
    var req = { body: { field: "value" }};
    form(validate("field").notRegex("^value$", "i", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "value" }};
    form(validate("field").notRegex(/^win$/))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validation : minLength': function() {
    // Failure.
    var req = { body: { field: "value" }};
    form(validate("field").minLength(10))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is too short");

    // Failure w/ custom message.
    var req = { body: { field: "value" }};
    form(validate("field").minLength(10, "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "value" }};
    form(validate("field").minLength(1))(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validation : isString()': function() {
    var req = { body: { username: 'adasds@example.com', password: { 'somevalue': '1' } }};
    form(validate('password', 'Password')
      .required()
      .isString()
      .minLength(10, '%s must be a minimum of 10 characters')
      .maxLength(256, '%s must be a maximum of 256 characters'))(req, {});
    assert.ok(!req.form.isValid);
    assert.strictEqual(req.form.errors[0], 'Password is not a string');
  },

  'validation : maxLength': function() {
    // Failure.
    var req = { body: { field: "value" }};
    form(validate("field").maxLength(1))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is too long");

    // Failure w/ custom message.
    // var req = { body: { field: "value" }};
    // form(validate("field").maxLength(1, "!!! %s !!!"))(req, {});
    // assert.equal(req.form.errors.length, 1);
    // assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    // var req = { body: { field: "value" }};
    // form(validate("field").maxLength(5))(req, {});
    // assert.equal(req.form.errors.length, 0);
  },

  'validation : required': function() {
    // Failure.
    var req = { body: {} };
    form(validate("field").required())(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is required");

    // Failure w/ placeholder value and custom message.
    var req = { body: { field: "value" }};
    form(validate("field").required("value", "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Success
    var req = { body: { field: "5000.00" }};
    form(validate("field").required())(req, {});
    assert.equal(req.form.errors.length, 0);

    // Non-required fields with no value should not trigger errors
    // Success
    var req = { body: {
      fieldEmpty: "",
      fieldUndefined: undefined,
      fieldNull: null
    }};
    form(
      validate("fieldEmpty").is(/whatever/),
      validate("fieldUndefined").is(/whatever/),
      validate("fieldNull").is(/whatever/),
      validate("fieldMissing").is(/whatever/)
    )(req, {});
    assert.equal(req.form.errors.length, 0);
  },

  'validation : custom': function() {
    var req;

    // Failure.
    req = { body: { field: "value" }};
    form(validate("field").custom(function(value) {
      throw new Error();
    }))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "field is invalid");

    // Failure w/ custom message.
    req = { body: { field: "value" }};
    form(validate("field").custom(function(value) {
      throw new Error();
    }, "!!! %s !!!"))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "!!! field !!!");

    // Failure w/ custom message from internal error.
    req = { body: { field: "value" }};
    form(validate("field").custom(function(value) {
      throw new Error("Radical %s");
    }))(req, {});
    assert.equal(req.form.errors.length, 1);
    assert.equal(req.form.errors[0], "Radical field");

    // Success
    req = { body: { field: "value" }};
    form(validate("field").custom(function(value) {}))(req, {});
    assert.equal(req.form.errors.length, 0);

    // Pass form data as 2nd argument to custom validators
    req = { body: { field1: "value1", field2: "value2" }};
    form(validate("field1").custom(function(value, formData) {
      assert.equal("value1", value);
      assert.ok(formData);
      assert.equal("value1", formData.field1);
      assert.equal("value2", formData.field2);
      throw new Error("This is a custom error thrown for %s.");
    }))(req, {});
    assert.equal(req.form.errors.length, 1);
  },

  "validation: custom : async": function(done) {
    var req = { body: { field1: "value1", field2: "value2" }};
    var next = function next() {
      assert.strictEqual(req.form.isValid, false);
      assert.strictEqual(req.form.errors.length, 1);
      assert.strictEqual(req.form.errors[0], 'Invalid field1');
      done();
    };

    form(validate("field1").custom(function(value, source, locals, callback) {
      process.nextTick(function() {
        assert.strictEqual(value, 'value1');
        callback(new Error("Invalid %s"));
      });
    }))(req, {}, next);
  },

  "validation : custom : async : success": function(done) {
    var req = { body: { field1: "value1", field2: "value2" }};
    var callbackCalled = false;
    var next = function next() {
      assert.strictEqual(callbackCalled, true);
      assert.strictEqual(req.form.isValid, true);
      assert.strictEqual(req.form.errors.length, 0);
      done();
    };
    form(validate("field1").custom(function(value, source, locals, callback) {
      process.nextTick(function() {
        assert.strictEqual(value, 'value1');
        callbackCalled = true;
        callback(null);
      });
    }))(req, {}, next);
  },

  "validation : custom : async : chaining": function(done) {
    var req = { body: { field1: "value1", field2: "value2" }};
    var callbackCalled = 0;
    var next = function next() {
      assert.strictEqual(callbackCalled, 2);
      assert.strictEqual(req.form.isValid, false);
      assert.strictEqual(req.form.errors.length, 2);
      assert.strictEqual(req.form.errors[0], 'Fail! field1');
      assert.strictEqual(req.form.errors[1], 'yes sync custom funcs still work !! field1');
      done();
    };

    form(validate("field1")
      .custom(function(value, source, locals, callback) {
        process.nextTick(function() {
          ++callbackCalled;
          callback(null);
        });
      })
      .custom(function(value, source, locals, callback) {
        process.nextTick(function() {
          ++callbackCalled;
          callback(new Error('Fail! %s'));
        });
      })
      .custom(function(value, source) {
        throw new Error('yes sync custom funcs still work !! %s');
      })
    )(req, {}, next);
  },

  "validation : custom : async : multiple fields": function(done) {
    var req = { body: { field1: "value1", field2: "value2" }};
    var callbackCalled = 0;
    var next = function next() {
      assert.strictEqual(callbackCalled, 2);
      assert.strictEqual(req.form.isValid, false);
      assert.strictEqual(req.form.errors.length, 2);
      assert.strictEqual(req.form.errors[0], 'field1 error');
      assert.strictEqual(req.form.errors[1], 'field2 error');
      done();
    };
    form(
      validate("field1").custom(function(value, source, locals, callback) {
        process.nextTick(function() {
          ++callbackCalled;
          assert.strictEqual(value, 'value1')
          callback(new Error('%s error'));
        });
      }),
      validate("field2").custom(function(value, source, locals, callback) {
        process.nextTick(function() {
          ++callbackCalled;
          assert.strictEqual(value, 'value2');
          callback(new Error('%s error'));
        });
      })
    )(req, {}, next);
  },

  "validation : req.form property-pollution": function() {
    var req = { body: { }};
    form()(req, {});
    assert.equal(req.form.errors.length, 0);
    assert.equal('{}', JSON.stringify(req.form));
  },

  "validation : complex properties": function() {
    var req = { body: { field: { inner: "value", even: { more: { inner: "value" }}}}};
    form(
      validate("field[inner]").required().equals("value"),
      validate("field[inner]").required().equals("fail"),
      validate("field[even][more][inner]").required().equals("value"),
      validate("field[even][more][inner]").required().equals("fail")
    )(req, {});
    assert.equal(req.form.errors.length, 2);
  }
};
