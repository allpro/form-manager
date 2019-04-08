# FormManager Data Handler

[![npm package][npm-badge]][npm]
[![gzip-size][gzip-size-badge]][gzip-size]
[![install-size][install-size-badge]][install-size]
[![build][build-badge]][build]
[![coverage][coveralls-badge]][coveralls]
[![donate][donate-badge]][donate]

---

-   NPM: `npm install @allpro/form-manager`
-   Yarn: `yarn add @allpro/form-manager`
-   CDN: Exposed global is `FormManager`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`

---
FormManager (**"FM'**) is a data-handler for forms, or any data actually.
The motivation is to have **a total data solution for forms**,
that requires as little custom code as possible.

**FM's capabilities include:**

- Integration with any type of form control, standard or custom
- Optimizations for use with **Material UI controls**
- Comprehensive validation of data, with the most common validators built-in.
- Error-message auto-generation, using a templating system
- Parsing, cleaning and reformatting of form-field entries
- Automated data-type conversion between form-fields and the data object
- Form-field event handling, with customizable validation events
- Form-field property-setter helpers to simplify form mark-up
- Ability to _alias_ fieldnames; to normalize names or to flatten nested data
- Configuration options at both the form and field level for maximum control
- All features are easily customizable and extensible
- Development tools make it easy to test and refine form configurations
- **Is compatible with ANY UI library, including React and React Native**

**FM does NOT do/require:**
 
- **Does not require any special mark-up or structure**.
- Does NOT 'render' anything - **it's a _pure_ data and logic handler.**
- Does NOT 'wrap' your forms; it is _agnostic_ about form mark-up
- Does NOT fetch or post data, though it can _convert_ data in each direction.
- Does NOT create any global vars (unless imported as a `<script />`)
- Does NOT use Context in React or any similar trickery

FM is **_pure_ Javascript**. There is no magic behind the curtain!

## How Is FormManager Different?

**No form helpers I've found has the data handling capabilities of FM.** 
Some popular helpers focus on backend communications, 
but have no built-in validation features. 
For me, validation is a primary feature, while 
communications is NOT something I want or need a helper for.

Most form helpers requires extra mark-up, which adds complexity to markup.
It also means that _dumb_ presentation components must contain some form logic. 
This goes against my preference for **_total_ separation of concerns**.

Most helpers don't provide any formatting or data-conversion capabilities.
This means you must write your own code, often repetitively.
FM is a TOTAL data handler, so these features are built-in and simple to use.

When using FormManager, **_ALL_ data handling and logic is in one place**, 
and this configuration is **completely separate from the mark-up**. 
If you have a complex form configuration, 
it's can even go its own file, like `formConfig.js`.

If you are already use some helpers, like a validation system, 
it's simple to integrate these with FM. 
Every feature in FM is designed to be easily extended and/or overridden.

I created this version of FM when using Material UI components in a React app. 
However, **FM is not reliant on React or any other library**. 
It can be used in any environment, for any purpose.

**FM is designed for professional developers with diverse needs**. 
It is designed to handle rich forms using a wide range of controls,
in potentially complex designs.
**There are no limitations on what kind of form FM can handle.**

Although FM's focus is _not_ creating simple forms for beginners,
it is extremely easy to learn and to use.
Anyone who has created an HTML form already knows how to implement FM. 

### Validation Is Key!

Some time-consuming aspects of creating highly usable forms are
validation and error-messages. FM's built-in validators can handle many
common requirements so you don't need to write your own validators, 
or even your own error-messages! 
Simple options are all that's needed to enable automatic validation and 
intelligent error-messages generation.

Here are a few validation configuration samples:

```javascript static
fields: {
    name: {
        displayName: 'Your Name',
        validation: {
            required: true,
            minLength: 2,
            maxLength: 60
        }
    },
    password: {
        displayName: 'Account Password',
        validation: {
            required: true,
            password: true,
            minLength: 8,
            maxLength: 24,
            passwordComplexity: { lower: 1, upper: 1, number: 1, symbol: 0 },
            custom: myCustomPasswordTester
        }
    },
    dateJoined: {
        displayName: 'Date Joined',
        validation: {
            date: true,
            minDate: '20008-06-15',
            maxDate: new Date()
        }
    }
    age: {
        displayName: 'Your Age',
        validation: {
            integer: true,
            numberRange: [ 18, 80 ]
        }
    }
    SIN: {
        displayName: 'Socal Insurance Number',
        dataType: 'string',
        validation: {
            integer: true,
            exactLength: 9
        }
    }
    email: {
        displayName: 'Email',
        validation: {
            required: true,
            email: true
        }
    },
    phone: {
        displayName: 'Phone',
        validation: {
            phone: true
        }
    },
    address: {
        displayName: 'Phone',
        validation: {
            address: true
        }
    },
```

These are some of the ways FM is different.


## How does FM work?


## How Do I Implement It?

FM integrates with form controls using standard properties and event handlers.
Below are some basic examples. These React JSX markup, but it could be normal
HTML mark-up if not using React.

```javascript static
// Native control
<input
    name="firstName"
    value={form.value('firstName')}
    required={form.fieldRequired('firstName')}
    disabled={form.fieldDisabled('firstName')}
    readOnly={form.fieldReadonly('firstName')}
    onChange={form.onFieldChange}
    onBlur={form.onFieldBlur}
    onFocus={form.onFieldFocus}
    aria-label="First Name"
>
// OR using prop-setter helper...
<input {...form.dataProps('firstName')} />

// Material UI control using props setter, including error messages
<TextField {...form.allProps('firstName') />

// Custom control that has non-standard events
<DatePicker
    name="birthdate"
    value={form.value('birthdate')}
    aria-label="First Name"
    required={form.fieldRequired('birthdate')}
    disabled={form.fieldDisabled('birthdate')}
    readOnly={form.fieldReadonly('birthdate')}
    onChange={date => form.onFieldChange('birthdate', date)}
/>
// OR using prop-setter helper, and then overriding onChange
<DatePicker
    {...form.dataProps('birthdate')}
    onChange={date => form.onFieldChange('birthdate', date)}
/>
```

Below is a sample presentation component for a form. The FM instance was 
created in the parent/container component, and passed in as **`props.form`**. 
I'm using the **Material UI TextField** in this sample to show how simple 
the form markup can be with FM. 
The `form.allProps('fieldname')` helper method is adding about 8 different 
properties to the field, giving FM full control of it.

**NOTE that the `form.submit` method is NOT part of FM!**
It's actually a container method that was _attached_ to the FM object rather 
than passing a separate prop. 
If necessary, that submit method can _call_ FM to get the form data,
perform validation, or _clean/transform_ the data in preparation for posting.
```javascript static
const MyForm = (props) => {
    const { form } = props;

    return (
        <div>
            <TextField label="First Name" {...form.allProps('firstName')} />
            <TextField label="Last Name"  {...form.allProps('lastName')} />
            <TextField label="Address"    {...form.allProps('address')} />
            <TextField label="City"       {...form.allProps('city')} />
            <TextField label="State"      {...form.allProps('state')} />
            <TextField label="Country"    {...form.allProps('country')} />
            <TextField label="Phone"      {...form.allProps('phone')} />
            <TextField label="Email"      {...form.allProps('email')} />

            <div>
                <Button color="primary" onClick={form.submit}>
                    Submit
                </Button>
                <Button color="secondary" onClick={form.reset}>
                    Undo Changes
                </Button>
            </div>
        </div>
    );
}
```

**What you _don't see_ above is the logic behind this form; that's the point!**
This form _could_ have validation for every field, with auto-generated error 
messages. Field-level validation can occur onChange, onBlur or onSubmit, and 
this may change depending whether a field is already in-error. The values can 
be automatically trimmed and reformatted for display (eg: "(604) 555-1212"), 
and can be auto-transformed for posting (eg: "6045551212"). Fields can even 
be disabled in response to data-entry. 
**All things are possible, and this mark-up never needs to change!**

**ALL data handling and logic is set in the form-configuration.** 
If you want to adjust validation requirements, you do it there; _not_ inside the 
presentation components. 
You can add cosmetic properties to the form-fields 
in your presentation component as normal; FM does not know or care about this.

If you have a rich form that spans multiple screens, with some controls inside
a popup dialog-box, that's no problem. FM does not 'wrap' your form, so 
you can create any component structure required -
just pass in `props.form` so you can integrate the data with FM.


## FormManager Documentation

### Data Handling

FM stores and updates all data (form or otherwise). 
It can automatically transform nested JSON structures into a flat-structure more 
suitable for forms. This 2-way transformation is done on-the-fly and the UI is 
kept in perfect sync with the state stored in the container.

FM can also clean, reformat and transform form values.

See 
**[FormManager Data Handling](https://github.com/allpro/form-manager/blob/master/docs/Data.md)** 
for details.

### Validation

Validation is a key feature of FormManager (**"FM"**). It is designed to make
 field validation and error handling as simple as possible. As with all other
 features, validation rules and error messages are specified in the form 
 config, not inside the presentation components.
 
See 
**[FormManager Validation](https://github.com/allpro/form-manager/blob/master/docs/Validation.md)** 
for details.


## FormManager Configuration

The power of FormManager is in its configuration.

See 
**[FormManager Configuration](https://github.com/allpro/form-manager/blob/master/docs/Configuration.md)** 
for details.


## API Reference

The FM object has a rich API. It provides integration with form-field 
components, plus many methods for interacting with the data.

See 
**[FormManager API Reference](https://github.com/allpro/form-manager/blob/master/docs/API.md)** 
for details.


## Implementing FormManager

FM can be used any way you want, but usually will be 
implemented in a 'container component' that handles the data and view logic.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


## TODO

FormManager _was_ fully functional and used in a large production app. 
However I'm giving it a major update, so for now it's a work in progress. 
The next priorities for this update are:

- _Track_ data so can know when form is 'dirty', and which values changed.
- Add tests for all functionality, for confidence it is production-ready.
- Improve all documentation.


[gzip-size-badge]: http://img.badgesize.io/https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js?compression=gzip
[gzip-size]: http://img.badgesize.io/https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js

[install-size-badge]: https://packagephobia.now.sh/badge?p=@allpro/form-manager
[install-size]: https://packagephobia.now.sh/result?p=@allpro/form-manager

[npm-badge]: http://img.shields.io/npm/v/@allpro/form-manager.svg?style=flat-round
[npm]: https://www.npmjs.com/package/@allpro/form-manager

[build-badge]: https://travis-ci.org/allpro/form-manager.svg?branch=master
[build]: https://travis-ci.org/allpro/form-manager

[coveralls-badge]: https://coveralls.io/repos/github/allpro/form-manager/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/allpro/form-manager?branch=master

[donate-badge]: https://img.shields.io/badge/Donate-PayPal-green.svg?style=flat-round
[donate]: https://paypal.me/KevinDalman

[dependency-badge]: https://badgen.now.sh/david/dep/styfle/packagephobia
[dependency]: https://david-dm.org/styfle/packagephobia

[devDependency-badge]: https://badgen.now.sh/david/dev/styfle/packagephobia
[devDependency]: https://david-dm.org/styfle/packagephobia?type=dev
