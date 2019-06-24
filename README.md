# FormManager Data Handler

[![npm package][npm-badge]][npm-link]
[![min-size][min-size-badge]][min-size-link]
[![gzip-size][gzip-size-badge]][gzip-size-link]
[![build][build-badge]][build-link]
[![coverage][coveralls-badge]][coveralls-link]
[![license][license-badge]][license-link]
[![donate][donate-badge]][donate-link]

FormManager (**'FM'**) is collection of data-handling tools for form-data, 
or any data actually.
The motivation for this helper is to have **a total data solution for forms**,
which can virtually eliminate the need for custom code.

## FormManager Capabilities

**Form Integration**

- **Compatible with ANY UI library, including React**
- Integration with any type of form control, standard or custom
- Manages data internally; does not require a `<form>` element
- Optimizations for use with **Material UI** controls
- Form-field property-setter helpers to simplify form markup
- Form-field event handling, with customizable validation events
- Generates relevant ARIA attributes to improve accessibility
- Can _alias_ fieldnames, to normalize names or to flatten nested data
- Development tools for testing and refining form configurations

**Data Validation & Error Messages**

- Comprehensive validation of data; most common validators are built-in
- Configuration options at both the form and field level for maximum control
- Multiple validation options, automatically linked to error-messages
- Error-message auto-generation, using a templating system
- _Automatic_ error output with Material UI; or simple output without

**Data Handling**

- Maintains 4 data caches: server-data, form-values, initial-data, and state
- Automated data-type and format conversion between form-data and field-values
- Parsing, cleaning and reformatting of form-field entries
- Change-tracking, undo capability

**FM does NOT do/require:**
 
- **Does not require any special markup or structure**
- Does not 'render' anything, but does auto-generate field props
- Does not 'wrap' forms; it is agnostic about form layout
- Does not fetch or post data, but does provide post-ready data
- Does not create use global vars (unless imported as a `<script />`)
- Does not use Context in React or similar trickery

**FM is just ordinary Javascript.** There is no magic!


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

**No form helper I've found matches FM's data handling capabilities.** 
Some helpers focus on backend communications, with no built-in validation. 
For me, validation and error message handling is vital for forms,
whereas communications is _not_ something I need or want a form-helper to do.

Most form helpers don't provide value-formatting or data-conversion 
capabilities, so you must write this yourself, repetitively.
**FM integrates all data manipulation features, so they are simple options.**

Most form helpers requires special markup, which adds complexity.
This means 'presentation components' contain form logic
and therefore are not as simple and 'dumb' as they should be.
**FM provides a total separation of concerns, making components simpler.**

**FormManager centralizes all data handling and logic,
separated from any form markup**. 
If you have a large form configuration, 
it's can even go its own file, like `formConfig.js`.

If you already use other helpers, like a validation system, 
it can be easily integrate with FM events and configuration. 
**Every feature in FM is easily extended or overridden.**

I created FM when using Material UI components in a large React app. 
However, **FM is not dependent on React, Material-UI, or any other library**. 
It can be used in any Javascript environment.

**FM is designed for professional developers with diverse needs**. 
It handles rich forms using a wide range of controls,
in potentially complex designs.
There are no limitations on what form FM can handle.

**Even a junior dev can learn the basics of FM very quickly.**
Existing forms require no changes other than changing their attributes/props.
See the '**Simplest Form Example**' below to see how easy it can be.


## Implementation Overview

**FM uses standard properties and events to integrate with form controls.**
Below are examples of basic form control markup.
FM property-setter helpers are used to set many properties at once.
These examples uses React JSX markup, but that's not a requirement.

```jsx harmony
// Native control, with manual error output
<input {...form.fieldProps('firstName')} />
{ form.hasError('firstName') &&
    <p>{form.getError('firstName'}</p>
}

// Material UI control using props setter, including error messages
<TextField {...form.allMuiProps('firstName') />

// Custom date-picker control
<DatePicker {...form.fieldProps('birthdate')} />
```

### Simplest Form Example

**All FM configuration is optional.**
If you don't want validation, data-conversion, or other special features, 
then you don't need _any_ form configuration at all!
This example illustrates the simplest possible form, 
where FM is used just to handle fields and track the form-data.
(This example uses a React Hooks component.)

```jsx harmony
function SimpleNameForm(props) {
    const form = useFormManager({}, props.data);

    return (
    	<div>
            <label>First Name: <input {...form.fieldProps('firstName')} /></label>
            <label>Middle Name: <input {...form.fieldProps('middleName')} /></label>
            <label>Last Name: <input {...form.fieldProps('lastName')} /></label>
            <button 
                disabled={form.isClean()}
                onClick={() => postToServer(form.changes())} 
            >
                Save Changes
            </button>
        </div>
    );
}
```

Note that there is no 'state', no event handlers, and no logic.
FM handles everything. It knows if _anything_ changed 
(`isClean()`/`isDirty()`), and if so, 
then _which data_ needs to be updated (`changes()`).

### Material-UI Form Example

The sample form below uses **Material UI TextFields**. 
A `formManager` instance is created in the parent, container component, 
then passed down as **`props.form`**.

The `form.allMuiProps('fieldname')` helper adds **12 properties and
event handlers**, giving FM full control of each field.
This includes then display of error-messages when applicable.

**NOTES**
- There is no `<form>` element &mdash; it's not necessary.
- The `form.submit` method shown is NOT part of FM.
  It's a container method that was _attached_ to the FM object for convenience.

```jsx harmony
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
<br>There is _no_ form configuration visible in the markup.
This keeps presentation components 'dumb' so they can focus on appearance.

Cosmetic properties can be added to form-fields as normal. 
Field 'labels' are cosmetic because they are a presentation choice.
However, FM can store a 'displayName' for use in error messages and for
auto-generating ARIA field attributes.

**FM easily handles very complex custom forms.** For example:
A form can spans multiple screens, with some controls inside modal popups. 
Just pass `props.form` to integrate any sub-component with a FM instance.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


## FormManager Documentation

**Documentation is spread across multiple files...**

### API Reference

The FM object has a rich API. It provides integration with form-field 
components, plus many methods for interacting with data.
Every feature of FM can be controlled programmatically when necessary.

See 
**[FormManager API Reference](https://github.com/allpro/form-manager/blob/master/docs/API.adoc)** 
for details.


### FormManager Configuration

The power of FM is in its configuration.
This is generally passed-in when creating a FM instance.
However every configuration option can also be changed on-the-fly.

See 
**[FormManager Configuration](https://github.com/allpro/form-manager/blob/master/docs/Configuration.md)** 
for details.


### Data Handling & Form-State

FM caches and manages all relevant data, including a custom 'form state'. 
It automatically transforms complex JSON structures into a flat-structure 
suitable for form-values. It can also clean, reformat, transform and validate 
field values. All features are enabled with simple configuration options.

See 
**[FormManager Data Handling](https://github.com/allpro/form-manager/blob/master/docs/Data.adoc)** 
for details.


### Validation

Validation is a key feature of FM. 
It makes field validation and error handling as easy as possible. 
As with all other features, validation rules and error messages are specified
in the form config - _not_ inside the presentation components.
 
See 
**[FormManager Validation](https://github.com/allpro/form-manager/blob/master/docs/Validation.md)** 
for details.


### Implementing FormManager

FM can be used any way you want. One pattern is to
implement it in a 'container component' that handles the data and view logic.
There is also a **`useFormManager` hook**, to integrate with components
that use **[React Hooks](https://reactjs.org/docs/hooks-intro.html)**.

See 
**[Implementing FormManager in Components](https://github.com/allpro/form-manager/blob/master/docs/Implementation.md)** 
for details.


### FormManager Utilities & Helpers

FM exposes most of the utility methods it uses internally.
These helpers can be imported and used separately from FM 
if you find any useful.
For example, it exposes `parseDate()` and `formatDate()` helpers
that might serve your date handling needs.

See 
**[Exported Helpers](https://github.com/allpro/form-manager/blob/master/docs/Exports.md)** 
for details.


## TODO

FileManager is fully functional. I have used it in multiple projects.
**However, this version is still undergoing refinement
so it's _possible_ that some temporary bugs may appear.**

Over the next weeks I'll add tests to confirm that everything is working, 
and continues to work as specified when I do updates.

I'll also complete the documentation, which is currently a work-in-progress.

If you are already using FM, check back regularly for updates.

**Once these tasks are completed I'll bump the version to 1.0.0.**


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
