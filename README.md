# FormManager Data Handler

[![npm package][npm-badge]][npm]
[![gzip-size][gzip-size-badge]][gzip-size]
[![install-size][install-size-badge]][install-size]
[![build][build-badge]][build]
[![coverage][coveralls-badge]][coveralls]
[![donate][donate-badge]][donate]

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

---

-   NPM: `npm install @allpro/form-manager`
-   Yarn: `yarn add @allpro/form-manager`
-   CDN: Exposed global is `FormManager`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`

---
FormManager (**"FM'**) is a data-centric solution for handling forms, 
inluding validation, formatting, type-conversion, and more. The goal is
 a **total solution for forms**, requiring as little custom code as possible.
 
FM does not 'render' anything, nor does it
 handle fetching or posting data - that's not its job! 
 **It is a _pure_ data and logic component.** 
 I promote a strong separation of concerns, so 
 **FM does not require any extra mark-up**. It does not know or care 
how you create or design forms, or what kinds of controls you use. 

FM integrates with form-fields using standard properties and event handlers. 
It doesn't use component wrappers; it doesn't use any globals; and it doesn't 
use Context in React. There is no magic behind the curtain!

I created this version of FM when using Material UI form components in React. 
However, since FM is a pure data component, **it is not reliant on React or 
any other library**. It can be used in any environment, for any purpose.

## Why Another Form Handler?

No form handler I've found has the functionality of this one. 
Formik&trade; is one popular form helper for React, but it doesn't include 
validation. For me that's a key requirement so I want it built-in. 
Plus, like virtually all form handlers, Formik requires extra mark-up. 
This adds complexity to screens, and means that the _dumb_ presentational 
components must contain some form logic. 
This goes against my preference for **_total_ separation of concerns**.
These are just some ways that FM is different from all other form handlers.

When using FormManager, _ALL_ data handling and logic is in one place, 
and this is **completely separate from the mark-up**. 
If you have a complex form configuration, 
it's can even go its own file, like `formConfig.js`.

## How Do I Use It?

Below is a sample form presenation component. The 'form' prop is 
the instance of FormManager created in the container component. 
The `handleSubmit` prop is _not_ part of FM, but that method can call FM to 
do validation or to _clean_ the data in preparation for posting.
I'm using the Material UI TextField here to show how simple the markup can be...
```javascript static
const MyForm = (props) => {
    const { form, handleSubmit } = props.form;

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
                <Button color="primary" onClick={handleSubmit}>
                    Submit
                </Button>
                <Button color="secondary" onClick={form.reset}>
                    Undo Changes
                </Button>
            </div>
        </div>
    )
}
```

What you _don't see_ above is the logic behind this form; that's the point! 
This form _could_ have validation for every field, with auto-generated error 
messages. Field-level validation can occur onChange, onBlur or onSubmit, and 
this may change depending whether a field is already in-error. The values can 
be automatically trimmed and reformatted for display (eg: "(604) 555-1212"), 
and can be auto-transformed for posting (eg: "6045551212"). Fields can even 
be disabled in response to data-entry. 
**All things are possible, and this mark-up never needs to change!**

All data handling and logic is set in the form-configuration. If you 
want to adjust validation requirements, you do it there; _not_ inside the 
presentation components. You can add cosmetic properties to the form-fields 
as you like; FM does not know or care about this.

If you have a rich form that spans multiple screens, with some fields that 
popup in dialog boxes, this is no problem. FM does not 'wrap' your form, so 
you can use any component structure you wish - just pass it `props.form` so 
you can integrate the data with FM.


## What Can FormManager Do?

Here is an overview of FM's capabilities...

### Data Handling

FM stores and updates all data (form or otherwise). 
It can automatically transform nested JSON structures into a flat-structure more 
suitable for forms. This 2-way transformation is done on-the-fly and the UI is 
kept in perfect sync with the state stored in the container.

FM can also clean, reformat and transform form values.

See 
**[FormManager Data Handling](https://github.com/allpro/react-fluid-grid/blob/master/docs/Data.md)** 
for details.

### Validation

Validation is a key feature of FormManager (**"FM"**). It is designed to make
 field validation and error handling as simple as possible. As with all other
 features, validation rules and error messages are specified in the form 
 config, not inside the presentation components.
 
See 
**[FormManager Validation](https://github.com/allpro/react-fluid-grid/blob/master/docs/Validation.md)** 
for details.


## FormManager Configuration

The power of FormManager is in its configuration.

See 
**[FormManager Configuration](https://github.com/allpro/react-fluid-grid/blob/master/docs/Configuration.md)** 
for details.


## API Reference

The FM object has a rich API. It provides integration with form-field 
components, plus many methods for interacting with the data.

See 
**[FormManager API Reference](https://github.com/allpro/react-fluid-grid/blob/master/docs/Implementation.md)** 
for details.


## Implementing FormManager

FormManager (**"FM"**) can be used any way you want, but usually will be 
implemented in a 'container component' that handles all the data and view logic 
for the 'presentation components' that it uses.

See 
**[Implementing FormManager in Components](https://github.com/allpro/react-fluid-grid/blob/master/docs/Implementation.md)** 
for details.


## TODO

FormManager _was_ fully functional and used in a large production app. 
However I'm giving it a major update, so for now it's a work in progress. 
The next priorities for this update are:

- _Track_ data so can know when form is 'dirty', and which values changed.
- Add tests for all functionality, for confidence it is production-ready.
- Improve all documentation.
