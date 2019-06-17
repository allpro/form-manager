# FormManager Data Handler

[![npm package][npm-badge]][npm-link]
[![min-size][min-size-badge]][min-size-link]
[![gzip-size][gzip-size-badge]][gzip-size-link]
[![build][build-badge]][build-link]
[![coverage][coveralls-badge]][coveralls-link]
[![license][license-badge]][license-link]
[![donate][donate-badge]][donate-link]

FormManager (**"FM'**) is collection of data-handling tools for form-data, 
or any data actually.
The motivation for this helper is to have **a total data solution for forms**,
that can virtually eliminate the need for custom code.

## FormManager Capabilities

**Form Integration**

- **Compatible with ANY UI library, including React**
- Integration with any type of form control, standard or custom
- Manages data internally; does not require a `<form>` element
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
- _Automatic_ error output with Material UI; or simple output without

**Data Handling**

- Maintains 4 data caches: server-data, form-values, initial-data, and state
- Automated data-type and format conversion between form-data and field-values
- Parsing, cleaning and reformatting of form-field entries
- Change-tracking, undo capability

**FM does NOT do/require:**
 
- **Does not require any special mark-up or structure**.
- Does not 'render' anything - **it's a _pure_ data and logic handler.**
- Does not 'wrap' your forms; it is _agnostic_ about form mark-up
- Does not fetch or post data, but does provide data ready to post.
- Does not create any global vars (unless imported as a `<script />`)
- Does not use Context in React or any similar trickery

FM is **pure Javascript**. There is no magic behind the curtain!


## Live Examples

**Try the demos at: https://allpro.github.io/form-manager**

Play with the demo code at:
https://codesandbox.io/s/github/allpro/form-manager/tree/master/example

If you pull or fork the repo, you can run the demos like this:
- In the root folder, run `npm start`
- In a second terminal, in the `/example` folder, run `npm start`
- The demo will start at http://localhost:3000
- Changes to the component _or_ the demo will auto-update the browser


## Installation

-   NPM: `npm install @allpro/form-manager`
-   Yarn: `yarn add @allpro/form-manager`
-   CDN: Exposed global is `FormManager`
    -   Unpkg: `<script src="https://unpkg.com/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`
    -   JSDelivr: `<script src="https://cdn.jsdelivr.net/npm/@allpro/form-manager/umd/@allpro/form-manager.min.js"></script>`


## How Is FormManager Different?

**No helper I've found matches FM's data handling capabilities.** 
Many helpers focus on backend communications, with no built-in validation. 
For me, validation and error message handling is vital for forms,
whereas communications is NOT something I need a form-helper to do.

Most form helpers requires special mark-up, which adds significant complexity 
and limits the use of custom controls.
It also means that _dumb_ presentation components must contain form logic. 
This is against my preference for **total separation of concerns**.

Most helpers don't provide any formatting or data-conversion capabilities.
This means you must write your own code, often repetitively.
FM is a TOTAL data handler, so all such features are integrated and easy to use.

When using FormManager, **ALL data handling and logic is in one place**, 
and this configuration is **completely separate from the mark-up**. 
If you have a complex form configuration, 
it's can even go its own file, like `formConfig.js`.

If you are already use some helpers, like a validation system, 
it can be easily integrate with FM events and configuration. 
**Every feature in FM is designed to be easily extended or overridden.**

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


## Implementation Overview

**FM uses ordinary properties and events to integrate with form controls.**
Below are examples of basic form control mark-up.
FM property-setter helpers are used to set many properties at once.
This example uses React JSX markup, but ordinary HTML could also be used.

```javascript static
// Native control, with manual error output
<input {...form.fieldProps('firstName')} />
{ form.hasError('firstName') &&
    <p>{form.error('firstName'}</p>
}

// Material UI control using props setter, including error messages
<TextField {...form.allMuiProps('firstName') />

// Custom control that emulates Material UI component API
<DatePicker {...form.allMuiProps('birthdate')} />
```

## Material-UI Form Example

The sample form below uses **Material UI TextFields**. 
A `formManager` instance is created in the parent, container component, 
then passed down as **`props.form`**.

The `form.allMuiProps('fieldname')` helper adds **12 properties and
event handlers**, giving FM full control of all the fields.
This includes output of error-messages when applicable.

**NOTES**
- There is no `<form>` element &mdash; it's not necessary.
- The `form.submit` method shown is NOT part of FM.
  It's a container method that was _attached_ to the FM object for convenience.

```javascript static
const MyForm = (props) => {
    const { form } = props;

    return (
        <div>
            <TextField label="First Name" {...form.allMuiProps('firstName')} />
            <TextField label="Last Name"  {...form.allMuiProps('lastName')} />
            <TextField label="Address"    {...form.allMuiProps('address')} />
            <TextField label="City"       {...form.allMuiProps('city')} />
            <TextField label="State"      {...form.allMuiProps('state')} />
            <TextField label="Country"    {...form.allMuiProps('country')} />
            <TextField label="Phone"      {...form.allMuiProps('phone')} />
            <TextField label="Email"      {...form.allMuiProps('email')} />

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

**ALL form options and logic is set in the form-configuration.** 
<br>Validation, data-transformations, and other features are all specified in 
the container component &mdash; _not_ in presentation component(s). 

Cosmetic properties can be added to the form-fields in the presentation 
component as normal. Field 'labels' are considered 'cosmetic' because they are
a presentation choice, and do not affect the 'data'.

**FM easily handles very complex custom forms.** For example:
A form that spans multiple screens, with some controls inside modal popups. 
FM does not 'wrap' markup so page structure doesn't matter. 
Just pass `props.form` to integrate any control with FM.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


## FormManager Documentation

**Documentation is spread across multiple files...**

### Data Handling

FM stores and updates all data (form or otherwise). 
It can automatically transform nested JSON structures into a flat-structure more 
suitable for forms. This 2-way transformation is done on-the-fly and the UI is 
kept in perfect sync with the state stored in the container.

FM can also clean, reformat and transform form values.

See 
**[FormManager Data Handling](https://github.com/allpro/form-manager/blob/master/docs/Data.adoc)** 
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
**[FormManager API Reference](https://github.com/allpro/form-manager/blob/master/docs/API.adoc)** 
for details.


### Implementing FormManager

FM can be used any way you want, but usually will be 
implemented in a 'container component' that handles the data and view logic.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


### FormManager Utilities & Helpers

## Utilities and Helpers

FM exposes many of the utility methods it uses internally.
These helpers can be imported and used separately from FM 
if you find any useful.
For example, it exposes `parseDate` and `formatDate()` helpers
that might serve all your date handling needs.

See 
**[Exported Helpers](https://github.com/allpro/form-manager/blob/master/docs/Exports.md)** 
for details.


## TODO

FileManager is fully functional.
I used it in my last project, _but_ I did a major update last month when I
decided to put it on Git.
The tests will find whether the update created any bugs.

The core functionality is working, as can be seen in the demos.
Therefore you can use this in a project right now.
Just check back regularly for updates.

**These tasks need to be completed before I set the version to 1.0.0.**

- Add tests for all functionality, for confidence it is production-ready.
- Add and improve documentation.


## Built With

- [create-react-library](https://github.com/DimiMikadze/create-react-library) - 
A React component framework based on
[create-react-app](https://github.com/facebook/create-react-app)

## Contributing

Please read 
[CONTRIBUTING.md](https://github.com/allpro/form-manager/blob/master/CONTRIBUTING.md)
for details on our code of conduct, 
and the process for submitting pull requests to us.

## Versioning

We use SemVer for versioning. For the versions available, 
see the tags on this repository.

## License

MIT © [allpro](https://github.com/allpro)
<br>See
[LICENSE](https://github.com/allpro/form-manager/blob/master/LICENSE)
file for details


[npm-badge]: http://img.shields.io/npm/v/@allpro/form-manager.svg
[npm-link]: https://www.npmjs.com/package/@allpro/form-manager

[min-size-badge]: https://img.shields.io/bundlephobia/min/@allpro/form-manager.svg?label=minified
[min-size-link]: https://bundlephobia.com/result?p=@allpro/form-manager

[gzip-size-badge]: https://img.shields.io/bundlephobia/minzip/@allpro/form-manager.svg?label=min%2Bgzip
[gzip-size-link]: https://bundlephobia.com/result?p=@allpro/form-manager

[build-badge]: https://img.shields.io/travis/allpro/form-manager/master.svg
[build-link]: https://travis-ci.org/allpro/form-manager

[coveralls-badge]: https://img.shields.io/coveralls/github/allpro/form-manager.svg
[coveralls-link]: https://coveralls.io/github/allpro/form-manager?branch=master

[license-badge]: https://img.shields.io/github/license/allpro/form-manager.svg
[license-link]: https://github.com/allpro/form-manager/blob/master/LICENSE

[donate-badge]: https://img.shields.io/badge/Donate-PayPal-green.svg
[donate-link]: https://paypal.me/KevinDalman
