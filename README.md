# provejs-express

Provides data sanitizing and validation as express middleware.

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
    field('username').toTrim().isRequired().is(/^[a-z]+$/),
    field('password').toTrim().isRequired().is(/^[0-9]+$/),
    field('email').toTrim().isEmail()
);

var controller = function(req, res){

    // Use req.form as this contains your validated and sanitized data. 
    // Don't use req.body because that is unsanitized and unvalidated data.
    var isValid = req.form.isValid;
    var errors = req.form.getErrors();
    var username = req.form.username;
    var password = req.form.password;
    var email = req.form.email;

    if (!isValid) {
        console.log(req.form.errors);
    } else {
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Email:', email);

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
You specify sanitizing and validation by passing sanitizers and validators as arguments to the main module function. For example:

```js
var form = require('provejs-express');
var available = function(value, data, locals, next) {
    // check username available
    // next(new Error('That %s is already taken'));
    next();
};
var validator = form(form.field('username').toTrim().isMinLength(6).custom(avaliable));
var controller = function(req, res) {};
app.post('/user', validator, controller);
```

## Fields

The `field` property of the module creates a saniter/validator object tied to a specific field. All sanitizers method names begin with `to` and all validator method names with `is`.

```
field(fieldname[, label]);
```

You can access nested properties with either dot or square-bracket notation.

```js
field('post.content').isMinLength(50),
field('post[user][id]').isInt(),
field('post.super.nested.property').isRequired()
```

Simply specifying a property like this, makes sure it exists. So, even if `req.body.post` was undefined,
`req.form.post.content` would be defined. This helps avoid any unwanted errors in your code.

The API is chainable, so you can keep calling sanitizer/validator methods one after the other:

```js
field('username')
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

## toArray()

Converts the field input into an array. 

By design if the input not intended to be an array (and you don't use `array()`), but the user submits an array value only the first value will be used.  This means that you don't have to worry about unexpected post data that might break your code. Eg/ when you call an array method on what is actually a string.

Example: we want 'project.users' to be an array.
```javascript
field('project.users').toArray(),
// undefined => [], '' => [], 'q' => ['q'], ['a', 'b'] => ['a', 'b']
```

Example: we do not want 'project.block' to be an array.
```javascript
field('project.block'),
// project.block: ['a', 'b'] => 'a'. No 'array()', so only first value used.
```

In addition, any other methods called with the array method, are applied to every value within the array.
```javascript
field('post.users').toArray().toUpper()
// post.users: ['one', 'two', 'three'] => ['ONE', 'TWO', 'THREE']
```


## toBlacklist(blacklist)

Remove characters that appear in the blacklist. 

- blacklist (String): String of characters to remove. The characters are used in a RegExp and so you will need to escape some chars.

```js
var middleware = form(field('foobar').toBlackList('\\[\\]'));
var controller = function(req, res) {};
router.post('/colors', middleware, controller);
```

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toBoolean()
Convert the input string to a boolean. Everything except for '0', 'false' and '' returns true.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toBooleanStrict()
Convert the input string to a boolean. Everything except for '0', 'false' and '' returns true. In strict mode only '1' and 'true' return true.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toDate()
Convert the input string to a date, or null if the input is not a date.

```js
form(field('issued').toDate());
```
See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toDefault(any)
Convert the empty input string to the given value.

- any (Any): The given value to use if the input string is empty.

```js
form(field('issued').toDate().toDefault(new Date('2000-01-01')));
form(field('option').toDefault(null));
```

See `isRequired(default)`.

## toEmail(options)
Canonicalizes an email address. (This doesn't validate that the input is an email, if you want to validate the email use isEmail beforehand).

- options (object): is an object with the following keys and default values.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toEscape()
Replace <, >, &, ', ' and / with HTML entities.
See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toFloat()
Convert the input string to a float, or NaN if the input is not a float.
See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toHtml(options)
Sanitize the input html.

- options (object): is an object with the following keys and default values.

See [sanitize-html](https://github.com/punkave/sanitize-html).

## toInt(radix)
Convert the input string to an integer, or NaN if the input is not an integer.

- radix (int): radix to use to convert to integer value. Defaults to base 10.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toLower()
Converts the input string to lower case.

## toMoment([timezoneFrom[, timezoneTo]])

Convert the input to an Moment Timezone object, or null if the input is not a date.

- timezoneFrom (String|Function): The user's timezone name or a function which should return the timezone value from the res.locals. If timezoneFrom is not given then `res.locals.timezone.name` is used, or otherwise `UTC`.
- timezoneTo (String): The server's timezone name. Defaults to 'UTC'.

Example of hardcoded timezones:
```javascript
form(field('timestamp').toMoment('US/Central', 'UTC'));
```

Example of using `res.locals.timezone.name` to contain the user's timezone, and the server's timezone being `UTC`.
```javascript
form(field('timestamp').toMoment());
```

Example of defining the user and server timezones:
```javascript
var tzFrom = function(locals){ 
    return locals.user.timezone || 'US/Central'; 
};
form(field('timestamp').toMoment(tzFrom, 'UTC'));
```

See [Moment Timezone](http://momentjs.com/timezone/docs/).

## toStripLow([keep_new_lines])

Remove characters with a numerical value < 32 and 127, mostly control characters. If keep_new_lines is true, newline characters are preserved (\n and \r, hex 0xA and 0xD). Unicode-safe in JavaScript.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toTrim([chars])

Trim characters (whitespace by default) from both sides of the input.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toTrimLeft([chars])
Trim characters from the left-side of the input.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toTrimRight([chars])
Trim characters from the right-side of the input.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toTruncate(length)
Truncate input string. Adds `...` to the end of the string.

## toUnescape()
Replaces HTML encoded entities with <, >, &, ', ' and /.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## toUpper()
Converts the input string to upper case.

## toWhitelist(whitelist)
Remove characters that do not appear in the whitelist.

- whitelist (String): String of characters to allowed. The characters are used in a RegExp and so you will need to escape some chars.

See [Validator.js](https://github.com/chriso/validator.js#sanitizers).

## custom(func)

You can define your own sanitizers.

- func (Function): Your custom sync or async sanitizer method.

Sync sanitizers should:
- Have 3 (or less) function parameters (`value`, `source`, and `locals`).
- When sanitizing the input your sanitizer should return a new value other then undefined.
- If your sanitizer returns undefined the input is not changed.

Async sanitizers should:
- Have 4 function parameters (`value`, `source`, `locals`, and `next`).
- When sanitizing the input your sanitizer should return a new value (eg `next(null, newValue)`).
- If your sanitizer returns undefined (eg `next()`) then the in put is not changed.

```js
var toFoobar = function(value, source, locals) { 
    return new Foobar(value);
};
form(field('silly'.custom(toFoobar));
```

Custom sanitizers can also be custom validators.

## Validator API:

All validator methods begin with the `is` prefix in the method name.

**Validation messages**: each validator has its own default validation message.
These can easily be overridden at runtime by passing a custom validation message
to the validator. The custom message is always the **last** argument passed to
the validator. `isRequired()` allows you to set a placeholder (or default value)
that your form contains when originally presented to the user. This prevents the
placeholder value from passing the `isRequired()` check.

Use '%s' in the message to have the field name or label printed in the message:

Example of the default message will being shown:
```javascript
field('username').isRequired() // -> 'username is required'
```
Example of overriding the default message and the placeholder message:
```javascript
field('username').isRequired('Type your desired username', 'What is your %s?') // -> 'What is your username?'
```

Example of overriding the default message:
```javascript
field('username', 'Username').isRequired('', 'What is your %s?') // -> 'What is your Username?'
```


## is(pattern[, modifiers[, message]])

Checks that the value matches the given regular expression.

- pattern (RegExp|String): RegExp (with flags) or String pattern.
- modifiers (String): Optional, and only if `pattern` is a String.
- message (String): Optional validation message.

        
```javascript
validate('username').is('[a-z]', 'i', 'Only letters are valid in %s')
validate('username').is(/[a-z]/i, 'Only letters are valid in %s')
```
## isAfter([str[,message]])

Check if the string is a date that's after the specified date (defaults to now).

- str (String): Optional, date string to compare against.
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isAlpha([locale [,message]])

Check if the string contains only letters (a-zA-Z).

- locale (String): Locale is one of ['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sk-SK', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']) and defaults to en-US.
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isAlphanumeric([locale [,message]])
Check if the string contains only letters and numbers.

- locale (String): Locale is one of ['ar', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-QA', 'ar-QM', 'ar-SA', 'ar-SD', 'ar-SY', 'ar-TN', 'ar-YE', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-AU', 'en-GB', 'en-HK', 'en-IN', 'en-NZ', 'en-US', 'en-ZA', 'en-ZM', 'es-ES', 'fr-FR', 'hu-HU', 'it-IT', 'nb-NO', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'sk-SK', 'sr-RS', 'sr-RS@latin', 'sv-SE', 'tr-TR', 'uk-UA']) and defaults to en-US.
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isArrayLength(min, max [,message])

Check array length.

- min (Integer): Min array length.
- max (Integer): Max array length.
- message (String): Optional validation message.

## isAscii([message])

Check if the string contains ASCII chars only.

- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isBase64([message])

Check if a string is base64 encoded.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isBefore([date [,message]])

Check if the string is a date that's before the specified date.

- date (String): Date string to compare against.
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isBoolean([message])

Check if a string is a boolean.

- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isByteLength([options [,message]])
Check if the string's length (in UTF-8 bytes) falls in a range.

- options (object): defaults to {min:0, max: undefined}.
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isContains(value [,message])
Checks if the field contains `value`.

- value (String): The value to test for.     
- message (String): Optional validation message.

See [Validator.js](https://github.com/chriso/validator.js#validators).

## isCreditCard([message])
## isCurrency([options[, message]])
## isDataURI([message])
## isDate([message])
## isDateRange([message])
## isDecimal([options[, message]])
## isDivisibleBy([number[, message]])
## isEmail([options[, message]])
## isEmpty([message])
## isEquals(value [,message])

Compares the field to `value`.

- value (String): A value that should match the field value OR a fieldname token to match another field, ie, `field::password`.

```javascript
Example:
validate('username').isEquals('admin')
validate('password').is(/^\w{6,20}$/)
validate('password_confirmation').isEquals('field::password')
```

## isFQDN([options[, message]])
## isFinite([message])
## isFloat([options[, message]])
## isFullWidth([message])
## isHalfWidth([message])
## isHash([message])
## isHexColor([message])
## isHexadecimal([message])
## isIP([message])
## isISBN([message])
## isISIN([message])
## isISO31661Alpha2([message])
## isISO8601([message])
## isISRC([message])
## isISSN([message])
## isIn([message])
## isInt([message])
## isJSON([message])
## isLatLong([message])
## isLength([message])
## isLowercase([message])
## isMACAddress([message])
## isMD5([message])
## isMatches([message])
## isMaxLength(length [,message])
Checks the field value max length.

- length (integer): The max character to test for.

## isMimeType([message])
## isMinLength(length [,message])
Checks the field value min length.
    
- length (integer): The min character to test for.
        

## isMobilePhone([message])
## isMongoId([message])
## isMultibyte([message])
## isNot(pattern[, modifiers[, message]])

Checks that the value does NOT match the given regular expression.

- pattern (RegExp|String): RegExp (with flags) or String pattern.
- modifiers (String): Optional, and only if `pattern` is a String.
- message (String): Optional validation message.

```javascript
validate('username').not('[a-z]', 'i', 'Letters are not valid in %s')
validate('username').not(/[a-z]/i, 'Letters are not valid in %s')
```

## isNotContains(value [,message])
Checks if the field does NOT contain `value`.

- value (String): A value that should not exist in the field.

## isNotEmpty([message])
Checks if the value is not just whitespace.

## isNumeric([message])
## isPort([message])
## isPostalCode([message])
## isRequired([message])
Checks that the field is present in form data, and has a value.

## isString([message])
## isSurrogatePair([message])
## isURL([message])
## isUUID([message])
## isUppercase([message])
## isVariableWidth([message])
## isWhitelisted([message])
## custom(func [,message])

You can define your own custom sync and async validators.

- func (Function): Your custom async or sync validator.
- message (String): Optional validation message.

Sync validators should:
- Have 3 (or less) function parameters (`value`, `source`, and `locals`).
- When validating the input for
    - On validation **error** your validator should throw an error (eg `throw new Error('Your %s is invalid.')`).
    - On validation **success** your validator should return undefined.
- If the input is optional then your validator should return success.
- Validators can also sanitize so you can return a new value to change the input.


Async validators should:
- Have 4 function parameters (`value`, `source`, `locals`, and `next`).
- When validating the input for
    - On validation **error** your validator should return an error (eg `callback(new Error('Your %s is invalid'))`).
    - On validation **success** your validator should return undefined (eg `callback()`).
- If the input is optional then your validator should return success.
- Validators can also sanitize so you can return a new value to change the input (eg `next(null, newValue)`).

Example: Throws an error if `username` field does not have value 'admin'.
```javascript
var isAdmin = function(value, source, locals) {
    if (value !== 'admin') throw new Error('%s must be 'admin'.');
}
field('username').custom(isAdmin);
```

Example: Validate based value on another field of the incoming source being validated.
```javascript
field('sport', 'favorite sport').custom(function(value, data, locals) {
    if (!data.country) throw new Error('unable to validate %s');

    switch (data.country) {
        case 'US':
            if (value !=== 'baseball')  throw new Error('America likes baseball');
            break;
        case 'UK':
            if (value !=== 'football') throw new Error('UK likes football');
            break;
        }
    }
);
```
Example: Asynchronous custom validator (4 argument function signature):
```javascript
var Users = require('../models/users');
form.field('username').custom(function(value, data, locals, next) {
    Users.findByUsername(value, function(err, user) {
        if (err) return next(err);
        if (user) return next(new Error('That %s is already taken.'));
        next();
    });
});
```

## Express Reqeust

The Express Request is modified by the addition of `req.form` object with various properties to the request.

- req.form.isValid -> Boolean
- req.form.errors  -> Array
- req.form.getErrors() -> Object
- req.form.getErrors(name) Array

Example request handler:

```javascript
var controller = function(req, res, next) {
    if (!req.form.isValid) {
    console.log(req.form.errors);
    console.log(req.form.getErrors('username'));
    console.log(req.form.getErrors());
    }
}
```

Your code should get the validated and sanitized data from `req.form`.
```javascript
var controller = function(req, res, next) {

    var isValid = req.form.isValid
    var username = req.form.username;
    var password = req.form.password;
};
```

## Express Response
The Express Response is modified by the addition of `res.locals.errors` object.


## Configuration

There are two configuration options:

```javascript
var form = require('provejs-express');
form.configure({
    sources: ['body'], // defaults to ['body', 'query', 'params']
    autoTrim: true // defaults to false;
});
```

- sources (Array): An array of Express request properties to use as data sources when sanitizing and validating data. Default: ['body', 'query', 'params'].
- autoTrim (Boolean): If true, all fields will be automatically trimmed. Default: false.

## Credits

Currently, this module uses many of the validation and sanitizer functions provided by Chris O'Hara's [node-validator](https://github.com/chriso/node-validator).
