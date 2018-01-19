# provejs-express

Provides data sanitizing and validation as route an express middleware.

## Install

`npm install provejs-express --save`

## Usage

```js
var express = require('provejs-express');
var bodyParser = require('body-parser');
var form = require('express-form');
var field = form.field;

var app = express();
app.use(bodyParser());

var validation = form(
    field("username").toTrim().isRequired().is(/^[a-z]+$/),
    field("password").toTrim().isRequired().is(/^[0-9]+$/),
    field("email").toTrim().isEmail()
);

var controller = function(req, res){

    // Setup: we use req.form as this contains our validated
    // and sanitized data. We don't use req.body because that
    // is un-sanitized and un-validated data.
    var isValid = req.form.isValid;
    var errors = req.form.getErrors();
    var username = req.form.username;
    var password = req.form.password;
    var email = req.form.email;

    if (!isValid) {
        console.log(req.form.errors);
    } else {
        console.log("Username:", username);
        console.log("Password:", password);
        console.log("Email:", email);

        // errors are automatically saved in res.locals
        console.log('res.locals.errors', res.locals.errors);
    }
};

app.post('/user', validation, controller);
app.listen(3000);
```

## Features

- Automatically save errors to res.locals.errors.
- Supports all validators from https://github.com/chriso/validator.js/
- Supports all sanitizers from https://github.com/chriso/validator.js/
- Supports additional validators and sanitizers.

## Module

`provejs-express` returns an `express` [Route Middleware](http://expressjs.com/guide.html#Route-Middleware) function.
You specify filtering and validation by passing filters and validators as
arguments to the main module function. For example:

```js
var form = require("provejs-express");
var middleware = form(form.field("username").toTrim());
var controller = function(req, res) {};

app.post('/user', middleware, controller);
```

## Fields

The `field` property of the module creates a saniter/validator object tied to a specific field.

```
field(fieldname[, label]);
```

You can access nested properties with either dot or square-bracket notation.

```js
field("post.content").isMinLength(50),
field("post[user][id]").isInt(),
field("post.super.nested.property").isRequired()
```

Simply specifying a property like this, makes sure it exists. So, even if `req.body.post` was undefined,
`req.form.post.content` would be defined. This helps avoid any unwanted errors in your code.

The API is chainable, so you can keep calling sanitizer/validator methods one after the other:

```js
filter("username")
  .isRequired()
  .toTrim()
  .toLower()
  .toTruncate(5)
  .isAlphanumeric()
```

## Sanitize API:

The sanitize methods are used to:
- coerce inputs into a specific data type,
- perform string transformations,
- set a default data value.

All sanitizers methods begin with the `to` prefix in the method name.

### toArray()
------

Converts the field input into an array.
```js
var middleware = form(field('colors').toArray());
var controller = function(req, res) {
    console.log(typeof req.form.colors); // => 'array'
};
router.post('/colors', middleware, controller);
```
### toBlacklist(list)

Remove characters that appear in the blacklist. 

- list (String): String of characters to remove. The characters are used in a RegExp and so you will need to escape some chars.

```js
var middleware = form(field('foobar').toBlackList('\\[\\]'));
var controller = function(req, res) {};
router.post('/colors', middleware, controller);
```

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toBoolean()
Convert the input string to a boolean. Everything except for '0', 'false' and '' returns true.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toBooleanStrict()
Convert the input string to a boolean. Everything except for '0', 'false' and '' returns true. In strict mode only '1' and 'true' return true.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toDate()
Convert the input string to a date.

### toDefault(any)
Convert the empty input string to the given value.

- any (Any): The given value to use if the input string is empty.

```js
form(field('issued').toDate().toDefault(new Date()));
form(field('option').toDefault(null));
```

### toEmail(options)
Canonicalizes an email address. (This doesn't validate that the input is an email, if you want to validate the email use isEmail beforehand).

- options (object): is an object with the following keys and default values.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toEscape()
Replace <, >, &, ', " and / with HTML entities.
See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toFloat()
Convert the input string to a float, or NaN if the input is not a float.
See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toHtml(options)
Sanitize the input html.

- options (object): is an object with the following keys and default values.

See [sanitize-html](https://github.com/punkave/sanitize-html).

### toInt(radix)
Convert the input string to an integer, or NaN if the input is not an integer.

- radix (int): radix to use to convert to integer value. Defaults to base 10.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### toLower()
Converts the input string to lower case.

### toMoment()
### toStripLow()
### toTrim()
### toTrimLeft()
### toTrimRight()
### toTruncate()
### toUnescape()
### toUpper()
Converts the input string to upper case.

### toWhitelist(whitelist)
Remove characters that do not appear in the whitelist.

- whitelist (String): String of characters to allowed. The characters are used in a RegExp and so you will need to escape some chars.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

### custom(function)

You can define your own sanitizers. The only requirement for custom sanitizers are they must return a value.

```js
var toFoobar = function(value, source, locals) { return 'foobar';};
var middleware = form(field('silly'.custom(toFoobar));
var controller = function(req, res) {
    console.log(req.form.silly); // => 'foobar'
};
router.post('/colors', middleware, controller);
```





### Validator API:

**Validation messages**: each validator has its own default validation message.
These can easily be overridden at runtime by passing a custom validation message
to the validator. The custom message is always the **last** argument passed to
the validator. `required()` allows you to set a placeholder (or default value)
that your form contains when originally presented to the user. This prevents the
placeholder value from passing the `required()` check.

Use "%s" in the message to have the field name or label printed in the message:

Example of the default message will being shown:
- validate("username").required()
- // -> "username is required"

Example of overriding the default message and the placeholder message:
- validate("username").required("Type your desired username", "What is your %s?")
- // -> "What is your username?"

Example of overriding the default message:
- validate("username", "Username").required("", "What is your %s?")
- // -> "What is your Username?"


### is(pattern[, modifiers[, message]])

Checks that the value matches the given regular expression.

- pattern (RegExp|String): RegExp (with flags) or String pattern.
- modifiers (String): Optional, and only if `pattern` is a String.
- message (String): Optional validation message.

        
```javascript
validate("username").is('[a-z]', 'i', 'Only letters are valid in %s')
validate("username").is(/[a-z]/i, 'Only letters are valid in %s')
```
### isAfter([message])
### isAlpha([message])
### isAlphanumeric([message])
### isArrayLength([message])
### isAscii([message])
### isBase64([message])
### isBefore([message])
### isBoolean([message])
### isByteLength([message])
### isContains([message])
### isCreditCard([message])
### isCurrency([message])
### isDataURI([message])
### isDate([message])
### isDaterange([message])
### isDecimal([message])
### isDivisibleBy([message])
### isEmail([message])
### isEmpty([message])
### isEquals([message])
### isFQDN([message])
### isFinite([message])
### isFloat([message])
### isFullWidth([message])
### isHalfWidth([message])
### isHash([message])
### isHexColor([message])
### isHexadecimal([message])
### isIP([message])
### isISBN([message])
### isISIN([message])
### isISO31661Alpha2([message])
### isISO8601([message])
### isISRC([message])
### isISSN([message])
### isIn([message])
### isInt([message])
### isJSON([message])
### isLatLong([message])
### isLength([message])
### isLowercase([message])
### isMACAddress([message])
### isMD5([message])
### isMatches([message])
### isMaxLength([message])
### isMimeType([message])
### isMinLength([message])
### isMobilePhone([message])
### isMongoId([message])
### isMultibyte([message])
### isNot([message])
### isNotContains([message])
### isNotEmpty([message])
### isNumeric([message])
### isPort([message])
### isPostalCode([message])
### isRequired([message])
### isString([message])
### isSurrogatePair([message])
### isURL([message])
### isUUID([message])
### isUppercase([message])
### isVariableWidth([message])
### isWhitelisted([message])
### custom([message])

**Validation Methods**

*By Regular Expressions*

    regex(pattern[, modifiers[, message]])
    - pattern (RegExp|String): RegExp (with flags) or String pattern.
    - modifiers (String): Optional, and only if `pattern` is a String.
    - message (String): Optional validation message.

        alias: is

        Checks that the value matches the given regular expression.

        Example:

        validate("username").is("[a-z]", "i", "Only letters are valid in %s")
        validate("username").is(/[a-z]/i, "Only letters are valid in %s")


    notRegex(pattern[, modifiers[, message]])
    - pattern (RegExp|String): RegExp (with flags) or String pattern.
    - modifiers (String): Optional, and only if `pattern` is a String.
    - message (String): Optional validation message.

        alias: not

        Checks that the value does NOT match the given regular expression.

        Example:

        validate("username").not("[a-z]", "i", "Letters are not valid in %s")
        validate("username").not(/[a-z]/i, "Letters are not valid in %s")


*By Type*

    isNumeric([message])

    isInt([message])

    isDecimal([message])

    isFloat([message])


*By Format*

    isDate([message])

    isEmail([message])

    isUrl([message])

    isIP([message])

    isAlpha([message])

    isAlphanumeric([message])

    isLowercase([message])

    isUppercase([message])


*By Content*

    notEmpty([message])

        Checks if the value is not just whitespace.


    equals( value [, message] )
    - value (String): A value that should match the field value OR a fieldname
                      token to match another field, ie, `field::password`.

        Compares the field to `value`.

        Example:
        validate("username").isEquals("admin")

        validate("password").is(/^\w{6,20}$/)
        validate("password_confirmation").isEquals("field::password")


    contains(value[, message])
    - value (String): The value to test for.

        Checks if the field contains `value`.


    notContains(string[, message])
    - value (String): A value that should not exist in the field.

        Checks if the field does NOT contain `value`.

    minLength(length[, message])
    - length (integer): The min character to test for.

        Checks the field value min length.

    maxLength(length[, message])
    - length (integer): The max character to test for.

        Checks the field value max length.


*Other*

    required([message])

        Checks that the field is present in form data, and has a value.

### Array Method

    array()
        Using the array() flag means that field always gives an array. If the field value is an array, but there is no flag, then the first value in that array is used instead.

        This means that you don't have to worry about unexpected post data that might break your code. Eg/ when you call an array method on what is actually a string.

        field("project.users").toArray(),
        // undefined => [], "" => [], "q" => ["q"], ["a", "b"] => ["a", "b"]

        field("project.block"),
        // project.block: ["a", "b"] => "a". No "array()", so only first value used.

        In addition, any other methods called with the array method, are applied to every value within the array.

        field("post.users").toArray().toUpper()
        // post.users: ["one", "two", "three"] => ["ONE", "TWO", "THREE"]

### Custom Methods

    custom(function[, message])
    - function (Function): A custom filter or validation function.

        This method can be utilised as either a filter or validator method.

        If the function throws an error, then an error is added to the form. (If `message` is not provided, the thrown error message is used.)

        If the function returns a value, then it is considered a filter method, with the field then becoming the returned value.

        If the function returns undefined, then the method has no effect on the field.

        Examples:

        If the `name` field has a value of "hello there", this would
        transform it to "hello-there".

        field("name").custom(function(value) {
          return value.replace(/\s+/g, "-");
        });

        Throws an error if `username` field does not have value "admin".

        field("username").custom(function(value) {
            if (value !== "admin") {
                throw new Error("%s must be 'admin'.");
            }
        });

        Validator based value on another field of the incoming source being validated

        field("sport", "favorite sport").custom(function(value, source) {
          if (!source.country) {
            throw new Error('unable to validate %s');
          }

          switch (source.country) {
            case 'US':
              if (value !=== 'baseball') {
                throw new Error('America likes baseball');
              }
              break;

            case 'UK':
              if (value !=== 'football') {
                throw new Error('UK likes football');
              }
              break;
          }

        });

        Asynchronous custom validator (3 argument function signature)

        form.field('username').custom(function(value, source, callback) {
          username.check(value, function(err) {
            if (err) return callback(new Error('Invalid %s'));
            callback(null);
          });
        });


### http.ServerRequest.prototype.form

Express Form adds a `form` object with various properties to the request.

    isValid -> Boolean

    errors  -> Array

    flashErrors(name) -> undefined

        Flashes all errors. Configurable, enabled by default.

    getErrors(name) -> Array or Object if no name given
    - fieldname (String): The name of the field

        Gets all errors for the field with the given name.

        You can also call this method with no parameters to get a map of errors for all of the fields.

    Example request handler:

    function(req, res) {
      if (!req.form.isValid) {
        console.log(req.form.errors);
        console.log(req.form.getErrors("username"));
        console.log(req.form.getErrors());
      }
    }

### Configuration

There are two configuration options:

```javascript
var form = require('provejs-express');
form.configure({
    sources: ['body'], // defaults to ['body', 'query', 'params']
    autoTrim: true // defaults to false;
});
```

sources (Array): An array of Express request properties to use as data sources when filtering and validating data. Default: ["body", "query", "params"].

autoTrim (Boolean): If true, all fields will be automatically trimmed. Default: false.

### Credits

Currently, this module uses many of the validation and sanitizer functions provided by Chris O'Hara's [node-validator](https://github.com/chriso/node-validator).
