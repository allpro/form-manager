# FormManager Data Handler

[![npm package][npm-badge]][npm]
[![gzip-size][gzip-size-badge]][gzip-size]
[![install-size][install-size-badge]][install-size]
[![build][build-badge]][build]
[![coverage][coveralls-badge]][coveralls]
[![license][license-badge]][license]
[![donate][donate-badge]][donate]

---

-   NPM: `npm install @allpro/form-manager`
-   Yarn: `yarn add @allpro/form-manager`
-   CDN: Exposed global is `FormManager`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`

---
FormManager (**"FM'**) is collection of data-handling tools for form-data, 
or any data actually.
The motivation for this helper is to have **a total data solution for forms**,
that can almost eliminates the need for custom code. 
FM's capabilities include:

**Form Integration**

- **Compatible with ANY UI library, including React**
- Integration with any type of form control, standard or custom
- Optimizations for use with **Material UI controls**
- Form-field property-setter helpers to simplify form mark-up
- Form-field event handling, with customizable validation events
- Can _alias_ fieldnames, to normalize names or to flatten nested data
- Development tools for testing and refining form configurations

**Data Validation & Error Messages**

- Comprehensive validation of data; with most common validators built-in.
- Configuration options at both the form and field level for maximum control
- Simple, multiple validation options linked to error-message system
- Error-message auto-generation, using a templating system
- Automatic error output with Material UI; easy output without

**Data Handling**

- Parsing, cleaning and reformatting of form-field entries
- Maintains and synchronizes separate server-data and form-data caches
- Automated data-type conversion between form and server field formats
- Change-tracking, undo capability

**FM does NOT do/require:**
 
- **Does not require any special mark-up or structure**.
- Does NOT 'render' anything - **it's a _pure_ data and logic handler.**
- Does NOT 'wrap' your forms; it is _agnostic_ about form mark-up
- Does NOT fetch or post data, but does provide data ready to post.
- Does NOT create any global vars (unless imported as a `<script />`)
- Does NOT use Context in React or any similar trickery

FM is **_pure_ Javascript**. There is no magic behind the curtain!


## How Is FormManager Different?

**No helpers I've found matches the range of FM's data handling capabilities.** 
Many helpers focus on backend communications, with no built-in validation. 
For me, validation and error message handling is vital for forms,
whereas communications is NOT something I need a form-helper to do.

Most form helpers requires special mark-up, which adds significant complexity 
and limits the use of custom controls.
It also means that _dumb_ presentation components must contain form logic. 
This is against my preference for **_total_ separation of concerns**.

Most helpers don't provide any formatting or data-conversion capabilities.
This means you must write your own code, often repetitively.
FM is a TOTAL data handler, so all such features are integrated and easy to use.

When using FormManager, **_ALL_ data handling and logic is in one place**, 
and this configuration is **completely separate from the mark-up**. 
If you have a complex form configuration, 
it's can even go its own file, like `formConfig.js`.

If you are already use some helpers, like a validation system, 
it can be easily integrate with FM events and configuration. 
**_Every_ feature in FM is designed to be easily extended and/or overridden.**

I created FM when using Material UI components in a large React app. 
However, **FM is not reliant on React or any other library**. 
It can be used in any environment, for any purpose.

**FM is designed for professional developers with diverse needs**. 
It handles rich forms using a wide range of controls,
in potentially complex designs.
**There are no limitations on what kind of form FM can handle.**

Although FM's focus is _not_ creating simple forms for beginners,
it is extremely easy to learn and to use.
Anyone who has created an HTML form already knows how to implement FM.


## How Is FormManager Implemented?

**FM uses ordinary properties and events to integrate with form controls.**
Below are some basic examples of basic form control mark-up.
FM property-setter helpers are used to set many properties at once.
This example uses React JSX markup, but ordinary HTML could also be used.

```javascript static
// Native control, with manual error output
<input {...form.dataProps('firstName')} />
{ form.hasError('firstName') &&
    <p>{form.errors('firstName'}</p>
}

// Material UI control using props setter, including error messages
<TextField {...form.allProps('firstName') />

// Custom control that emulates Material UI component API
<DatePicker {...form.allProps('birthdate')} />
```

Below is a sample React component, using **Material UI TextFields**. 
The FM instance is created in the parent/container component, 
and passed in as **`props.form`**. 
The `form.allProps('fieldname')` helper addes 8 to 12 individual properties,
including event handlers, giving FM full control of each input.
This includes output of error-messages as needed.

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


### FormManager Configuration

The power of FormManager is in its configuration.

See 
**[FormManager Configuration](https://github.com/allpro/form-manager/blob/master/docs/Configuration.md)** 
for details.


### API Reference

The FM object has a rich API. It provides integration with form-field 
components, plus many methods for interacting with the data.

See 
**[FormManager API Reference](https://github.com/allpro/form-manager/blob/master/docs/API.md)** 
for details.


### Implementing FormManager

FM can be used any way you want, but usually will be 
implemented in a 'container component' that handles the data and view logic.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


## TODO

FormManager _was_ fully functional and used in a large production app. 
However it has had a major update since then. 
Therefore the next priorities are:

- Add tests for all functionality, for confidence it is production-ready.
- Add and iImprove documentation.


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

[license-badge]: https://badgen.now.sh/badge/license/MIT/blue
[license]: https://github.com/allpro/form-manager/blob/master/LICENSE

[donate-badge]: https://img.shields.io/badge/Donate-PayPal-green.svg?style=flat-round
[donate]: https://paypal.me/KevinDalman
