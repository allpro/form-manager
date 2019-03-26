# FormManager Helper

## Overview

The FormManager (**FM**) module is used by components to simplify data handling. Although the name includes "Form", it can also be useful for passing down read-only data rather than passing dozens of value-props.

This FormManager is lighter than similar helpers available for Material-UI (**MUI**) components. Instead of wrapping' every form-element the FM just provides a number of methods to use with the normal MUI components.

The FM stores its configuration internally, but all data and error messages are stored in the state of the component that implements it, starting at `state.form`. See State Data Structure below for details

A demo of this component can be seen at: `/demos/FormManager` *(demo may be outdated!)*

## What It Does

FM is multi-purpose. This is a summary of its capabilities:

### Data Handling

FM stores and updates all data (form or otherwise). It can automatically transform nested JSON structures into a flat-structure more suitable for forms. This 2-way transformation is done on-the-fly and the UI is kept in perfect sync with the state stored in the container.

### Validation

In forms, data is automatically validated, in the manner specified by the form
 configuration. The most common validations are built-in. These can be 
 enabled with simple options, like:

```javascript static
emailAddress: {
    ...
    validation: {
        required: true,
        email: true,
        maxLength: 100,
    }
},
homePhone: {
    ...
    validation: {
        phone: true,
        minLength: 10,
    }
},
age: {
    displayName: 'Your Age',
    ...
    validation: {
        minNumber: 18,
    }
}
```

| Options      | Values         | Notes |
| -----------: | :------------- | :-----------------|
| required:    | (true/false)   | Any type of value|
| address:     | (true/false)   | Text - Address|
| phone:       | (true/false)   | Text - Phone|
| email:       | (true/false)   | Text - Email|
| minLength:   | (number)       | Text values|
| maxLength:   | (number)       | Text values|
| minNumber:   | (number)       | Numeric values|
| maxNumber:   | (number)       | Numeric values|
| numberRange: | [(num), (num)] | Numeric values|
| minDate:     | (number)       | Date values|
| maxDate:     | (number)       | Date values|
| custom:      | (function)     | Anything else|

#### Custom Validators

In addition to the specific `custom` validation option, any of the validation options can use a custom validation. Instead of setting simple values as shown above, specify a function to handle the validation instead.

For example, you might want a custom validator to decide whether a field is 'required' based on what other data has been entered. Your validation function will be passed 3 parameters so it can do whatever it needs:
```javascript static
myField: {
    validation: {
        required: (fieldName, value, formManager) => { ... }
    }
}
```

The validation function can get any data it needs from the formManager instance. So if you need the value of 'anotherFieldname', it's easy to get:
```javascript static
const otherValue = formManager.value('anotherFieldname');
```

The validation function can return true or false to indicate valid or not-valid. In this case the default error-message for that validation will be used. Or the function can return an error-message string to use instead of the default.

### Error Messages

Since the FM does validation, it also generates all the error-messages needed. There are global-default error-messages for each type of validation. The configuration of each FM instance can specify one or more messages to override the default. Plus each field can also specify error-messages to override the default for just that field.

Error Messages are simple strings, but also can contain special placeholders that will be replaced with info from the field they are validating. For example:
```javascript static
errorMessages: {
    minNumber: '{displayName} must be at least {option} years old.'
}
```
This will output an error like this:

`Your Age must be at least 18 years old.`

#### Using Error Messages

Material UI does not have a consistent API for handling errors so different types of controls must be handled slightly differently. However, all of them allow error-text to be displayed, and an 'error' className to be applied that affects the field display _and_ the error-text display.

When more than one validation fails, the field will display ALL the 
corresponding error-messages. By default FM will combine these into a single 
string, adding a **line-break** between the messages so each displays on a separate line. OR, you can specify errors to be returned in an array. This allows you to wrap _each error_ in an HTML tag, like `LI` or `P`.

Error-messages can also be set and cleared manually using methods of the FM. This is useful for setting validation errors returned by the server or an external component.

\* See the error implementation info in the next section.

## Implementing FormManager

FormManager can be used any way you want, but usually will be implemented in a 'container component' that handles all the data and view logic for the 'presentation components' that it uses.

Each of the presentation components need only be passed a single - the FM object. This replaces all the individual data-props, change-handlers, validation-handlers and error-messages that normally must be passed down to handle form fields.

### Implementing in Container

Here's an example of a container component using FM. It shows only basic FM configuration to keep it simple. Note that no handlers need to be written and no extra props passed. The FM replaces all that.

```javascript static
import React, { Fragment } from 'react';
import FormManager from 'react-form-manager';

import Header from './Header';
import Instructions from './Instructions';
import List from './List';
import Footer from './Footer';

const defaultData = { ... };

const formConfig = {
    initialData: defaultData
};

class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        // EXTRA initialData can be passed as a 3rd parameter.
        // This allows data to be added from props, if applicable.
        this.form = FormManager(this, formConfig, props.items);
    }

    render() {
        const { form } = this;

        return (
            <Fragment>
                <Header form={form} />
                <Instructions form={form} />
                <List form={form} />
                <Footer form={form} />
            </Fragment>
        )
    }
}

```

### Implementing in a Form

This example shows a form with a few fields on it. It does not show cosmetic
props like `classes` or `fullWidth`, which you can add as normal. The FM
props shown here _only_ handles props like `name`, `value` and event-handlers.

This sample includes the fieldname `user/gender`. This indicates the data has
 gender _nested_ inside a user object. Use slashes or dots, (`user.gender`), to
  refer to values nested at _any depth_. OR you can set an `aliasName` in the 
  field-config, (eg: `gender`), and then use this alias-name in your code.

Note that some MUI elements, like `TextField` don't need `FormControl` and `FormTextHelper` components **because it auto-generates these**!

```javascript static
import React, { Fragment } from 'react';

const MyForm = (props) => {
    const form = props.form;

    return (
        <Fragment>

            <FormControl
                error={form.hasErrors('category')}
            >
                <InputLabel htmlFor="category">Category</InputLabel>
                <Select
                    {...form.dataProps('category')}
                    input={<Input name="form-category" id="form-category"/>}
                >
                    <MenuItem value="" />
                    { form.value('categoryList').map(item =>
                        <MenuItem value={item.value} key={item.value}>
                            {item.display}
                        </MenuItem>
                    )}
                </Select>
                <FormHelperText className="hide-when-empty">
                    {form.errors('category')}
                </FormHelperText>
            </FormControl>

            <TextField
                label="Details of Issue"
                {...form.dataProps('message')}
                {...form.errorProps('message')}
                inputRef={ (el) => { this.messageInput = el} }
            />

            <FormControl
                component="fieldset"
                error={form.hasErrors('user/gender')}
            >
                <FormLabel type="title" component="legend">
                    Select your gender
                </FormLabel>
                <RadioGroup
                    {...form.dataProps('user/gender')}
                >
                    <FormControlLabel value="male" label="Male" control={<Radio/>} />
                    <FormControlLabel value="female" label="Female" control={<Radio/>} />
                    <FormControlLabel value="other" label="Other" control={<Radio/>} />
                </RadioGroup>
                <FormHelperText className="hide-when-empty">
                    {form.errors('user/gender')}
                </FormHelperText>
            </FormControl>

        </Fragment>
    )
}
```

### State Data Structure

FM stores all data and form-state in the component that creates it. When any value is updated or errors are added, it call `MyComponent.setState()`, which triggers re-rendering of child/presentation components.
This is the same as if you wrote change-handlers for every field in your container component.

Here's a sample of what `state.form` might looks like. You can read and modify this state _manually_, but usually it's better (and easier) to use FM methods.

```javascript static
MyComponent.state = {
    form: {
        data: {
            fieldOne: '',
            user: {
                name: '',
                email: 'me@you',
                address: {
                    unit: '',
                    street: '',
                    postal: '',
                    province: '',
                    country: ''
                }
            }
        },

        errors: {
            'user/name': {
                required: 'Your name is required.'
            },
            'user/email': {
                email: 'The email address "me@you" is not valid.'
            }
        },

        isDirty: true,
        hasErrors: true,

        categoryList: [ ... ],
        subcategoryList: [ ... ],
    }
}
```

### Using Form State Beyond Data

The `categoryList` and `subcategoryList` keys shown above are examples of how FM can store 'state' that isn't part of the 'form data'. This may be arrays to populate picklists, logic-flags, etc. You can use FM to pass ANYTHING to child-components, including event listeners.

Using form-state can be done 2 ways:

1. Use the methods available for setting and getting form-state, primarily:

    ```javascript static
    form.state(key);         // GETTER
    form.state(key, value);  // SETTER
    ```

2. Add a field configuration and specify `isData: false`; then this 'data field' is stored as form-state instead of with other form-data. This syntax can be useful to hide the details of what's data and what's state; eg:

    ```javascript static
    form.data(key);         // GETTER
    form.data(key, value);  // SETTER
    ```

Below is an example for **syncing category and subcategory lists**. It requires a simple onChange function and a little FM configuration. Two variations are shown to illustrate the 2 methods described above.

##### USING FORM.STATE DIRECTLY
```javascript static
let selectedCategory = 1;

function handleCategoryChange(field, category, formManager) {
    if (category !== selectedCategory) {
        selectedCategory = category;
        const subcategories = sampleSubcategories[category] || [];

        // Set the correct subcategories list, or a blank list
        formManager.state('subcategoryList', subcategories);

        // Always clear the subcategory value when category changes
        formManager.value('subcategory', '');
    }
}

const formConfig = {
    initialState: {
        categoryList:    sampleCategories,
        subcategoryList: sampleSubcategories[selectedCategory],
    }
}
```

##### USING FORM.DATA ABSTRACTION
```javascript static
let selectedCategory = 1;

function handleCategoryChange(field, category, formManager) {
    if (category !== selectedCategory) {
        selectedCategory = category;
        const subcategories = sampleSubcategories[category] || [];

        formManager.setFieldValues({
            // Set the correct subcategories list, or a blank list
            subcategoryList: subcategories,

            // Always clear the subcategory value when category changes
            subcategory: '',
        });
    }
}

const formConfig = {
    fields: {
        category: {
            value:    categoryList,
            isData:   false,
            onChange: handleCategoryChange,
        },
        subcategory: {
            value:    subcategoryList,
            isData:   false,
        },
    },
    initialData: {
        categoryList:    sampleCategories,
        subcategoryList: sampleSubcategories[selectedCategory],
    }
}
```

## FormManager Configuration

Below is a sample form-configuration that shows many of the options available. Usually your form-config will be simpler than this.

Note that **not all fields need configuration in FM**. Only fields that require validation, callbacks or other features of FM need to be specified. **If using FM for read-only data, you need no configuration**, except to set the `initialData`, if you have it.

Some options can be set at both the form and fields levels. Setting an option at the form/top level makes it the _default_ for all fields. This default can be overridden by individual fields by setting an option in the config  for that field. See `validateOn` examples below.

 You can see the default configuration for FM in: `defaultFormConfig.js`. It 
 includes many of the same default values and comments as shown below.

```javascript static
const formConfig = {
    /**
     * Form validation options can be overridden per-field
     * Validation can be triggered manually for a single field, or all fields
     * Separate options exist for validating a field with or without errors
     */
    // When should we do an INITIAL auto-validation of each field
    autoValidate:   false,      // [change|blur|false] false = none
    // When should we re-validation a field that currently has an error
    autoRevalidate: 'change',   // [change|blur|false] false = none

    /**
     * Override the default error messages for standard validations
     */
    errorMessages: {
        required: ''
    },
    returnErrorsAsString: true, // false = always return error(s) in an array

    /**
     * Form-fields configuration; SHOWN HERE AFTER NORMALIZATION TO A HASH.
     * Can be passed as a hash keyed by fieldName OR as an array.
     * When passed as an array, then items must include the 'name' key.
     * When passed as a hash, the key will be COPIED to item.name automatically.
     *
     * Only fields requiring validation need to be included,
     *  however it can be useful to include all for reference
     */
    fields: {
        /* SAMPLE field data using Hash format (same as internal format)
        address: {
            displayName:    'Address',  // Used only for error-messages
            autoValidate:   'blur',     // OVERRIDE of a form-level option
            onChange:       this.onAddressChange // OPTIONAL change callback
            validation: {
                required:   true,
                address:    true, // PRESET validations; TBD
                minLength:  20,
                maxLength:  120,
                // All validations have a default error message
                // Form default messages can be overridden at field-level
                // Use of placeholder is optional
                errorMessages: {
                    maxLength: '{name} cannot exceed {value} characters'
                }
            },
        },
        'person/age': {
            aliasName:      'age',
            displayName:    'Your Age',
            defaultValue:   25,
            validation: {
                required:       true,
                dataType:       'integer'
                numberRange:    [ 18, 120 ],
            },
        },
        expandSectionOne: {
            name:   'expandSectionOne',
            isData: false  // value stored in state.form, NOT state.form.data
        },
        // OPTIONALLY can include fieldnames just for reference
        unvalidatedDate: { dataType: 'date' },
        unvalidatedTime: { dataType: 'time' },
        */
    },

    /**
     * Fields with a nameAlias will be mapped here for quick access.
     * If an aliasName duplicates a real fieldName, the real field is superior.
     */
    fieldAliasMap: {
        // aliasName: 'realFieldName', // SAMPLE
    },

    // initialState is copied to Component.state.form
    // If initialState includes a 'data' or 'errors' key, it will be IGNORED
    initialState: {},

    // initialData is copied to Component.state.form.data
    initialData: {},

    // initialData is copied to Component.state.form.errors
    initialErrors: {},
}
```

## TODO

This helper is fully functional, but is still a work in progress. Some
 of the 
outstanding issues are:

- Validation can be further extended
- The onBlur handler doesn't handle all fields; needs closure
- Documentation & JS-Docs are incomplete
- Track initial-values to know when a field is 'dirty'
- Add more unit tests
- Test with more of latest Material UI form elements
- Integration with React Hooks; requires different state-storage
