# FormManager Validation

Validation is a key feature of FormManager (**"FM"**). It is designed to make
 field validation and error handling as simple as possible. As with all other
 features, validation rules and error messages are specified in the form 
 config, not inside the presentation components.
 
## Validation Configuration

In forms, data is automatically validated, in the manner specified by the form
 configuration. The most common "validation types" are built-in. These 
 validators can be enabled and configured with simple values, like:

```javascript static
emailAddress: {
    aliasName: 'email',
    displayName: 'Email',
    validation: {
        required: true,
        email: true,
        maxLength: 100,
    }
},
homePhone: {
    displayName: 'Home Phone',
    validation: {
        phone: true,
        minLength: 10,
    }
},
age: {
    displayName: 'Your Age',
    validation: {
        minNumber: 18,
    }
}
```

| Type         | Values         | Applies To |
| -----------: | :------------- | :-----------------|
| required:    | true/false     | Any type of value|
| address:     | true/false     | Text - Address|
| phone:       | true/false     | Text - Phone|
| email:       | true/false     | Text - Email|
| minLength:   | number         | Text values|
| maxLength:   | number         | Text values|
| minNumber:   | number         | Numeric values|
| maxNumber:   | number         | Numeric values|
| numberRange: | [number, number] | Numeric values|
| minDate:     | number         | Date values|
| maxDate:     | number         | Date values|
| custom:      | function       | Anything else|


## Custom Validators

The 'custom' validator is how you set additional validations. It must be a 
function and should return one of true/false (is valid?), or a string (error 
message to be displayed), or an array of strings (multiple error messages to 
be displayed). Returning an empty string or an empty array means the same as 
returning true - the value is valid. The array option allows a 
custom validator to perform _multiple_ validations, and return a separate
error-message for each failed test.

Custom validation functions are passed 3 parameters:
- value to be validated
- fieldname, in case using a generic validator
- FormManager object, so can query other fields, and even set other values

If you need to perform validation asynchronously, **return a promise** from the 
validation function, then _resolve_ the promise with the result of the 
validation.
```javascript static
username: {
    validation: {
        custom: (value, fieldname, form) => { ... }
    }
}
```

Actually, _any_ of the validation options can be a custom validation. Instead
 of setting options for the built-in validator, set a function to handle 
the validation yourself. This allows overrides the basic validators. For 
example, you might need a custom validator to decide whether a field is 
'required' based on what other data has been entered. 

```javascript static
unitNumber: {
    validation: {
        required: (value, fieldname, form) => { ... }
    }
}
```

A custom validation function can get any data it needs from the FormManager 
object. For examle:
```javascript static
function myValidator(value, fieldname, form) {
    const otherValue = form.value('anotherFieldname');
    if (otherValue && !value) {
        return '...'; // error-message to display
    } else {
        return true; // valid
    }
```

The validation function can return true or false to indicate valid or not-valid. In this case the default error-message for that validation will be used. Or the function can return an error-message string to use instead of the default.

## Error Messages

Since the FM does validation, it also generates all the error-messages needed. There are global-default error-messages for each type of validation. The configuration of each FM instance can specify one or more messages to override the default. Plus each field can also specify error-messages to override the default for just that field.

Error Messages are simple strings, but also can contain special placeholders that will be replaced with info from the field they are validating. For example:
```javascript static
errorMessages: {
    minNumber: '{displayName} must be at least {option} years old.'
}
```
This will output an error like this:

`Your Age must be at least 18 years old.`

### Using Error Messages

Material UI does not have a consistent API for handling errors so different types of controls must be handled slightly differently. However, all of them allow error-text to be displayed, and an 'error' className to be applied that affects the field display _and_ the error-text display.

When more than one validation fails, the field will display ALL the 
corresponding error-messages. By default FM will combine these into a single 
string, adding a **line-break** between the messages so each displays on a separate line. OR, you can specify errors to be returned in an array. This allows you to wrap _each error_ in an HTML tag, like `LI` or `P`.

Error-messages can also be set and cleared manually using methods of the FM. This is useful for setting validation errors returned by the server or an external component.

\* See the error implementation info in the next section.


## Extending Built-in Validators and Error-Messages

Any of the built-in validators can be replaced by your own, plus you can add 
more built-ins. For example, a standard password validator. This is done by 
adding a 'validators' object in the form-config. To make them global, you 
could _wrap_ the FormManager in your own helper and then use your own helper 
for forms. This allows you to inject customization options into the form 
config of every form. For example:

```javascript static
import FormManager from '@allpro/form-manager';
import defaultDeep from 'lodash/defaultDeep';

const globalConfig = {
    validators: {
        phone: value => { ... },
        password: value => { ... }
    },
    errorMessages: {
        email: 'We require a valid email so we can send you a receipt',
        password': The password entered is too simple. Please try again.'
    },
    formatters: {
        date: value => { ... },
        phone: value => { ... }
    },
    fieldDefaults: {
        // VALIDATION OPTIONS
        validateOnChange: false,
        validateOnBlur: true,
        revalidateOnChange: true,
        revalidateOnBlur: false,

        // DATA CLEANING/FORMATTING OPTIONS
        cleanDataOnBlur: true, // Clean and REPLACE field-data onBlur
        trimText: true, // Trim leading-/trailing--spaces
        fixMultiSpaces: true // Replace multi-spaces/tabs with single space
    },
};

function AppFormManager(obj, config, data) {
    const extendedConfig = defaultsDeep(config, globalConfig);
    return FormManager(obj, extendedConfig, data);
}

export default AppFormManager
```

The custom 'password' validator can now be used for any field, and combined 
with other validation rules, like:
```javascript static
fields: {
    accountPassword: {
        validation: {
            required: true
            password: true,
            minLength: 8,
            maxLength: 24
        }
    }
}
```
