# FormManager API Reference

**THIS IS A JUST AN OUTLINE - WORK IN PROGRESS**

FM is designed to avoid accidental mutations to the data it handles.
Therefore FM exposes _only_ 'methods' - no 'properties' that could be 
directly mutated.
All data caches and state are _private_ and thereby immutable.

FM has a rich API that provides control of _everything_ FM handles.
Anything a user can do or trigger can also be done programmatically, so you 
have full control of all data, as well as every _field_ FM manages.

This API documentation is divided by into the primary areas that FM handles.

**Some methods have multiple names to help simplify and clarify your code.**
<br>Many have both singular and plural variations because they can be used for
one-or-multiple fields, like `getValue()` and `getValues()`. 
<br>Some commonly used _getters_ also have a short version for code brevity, 
like `value()` for `getValue()`.

All _setter_ methods return the FM object so that commands can be chained, like:
`form.setFieldRequired('phone').render()`

Also see the **Utilities** documentation for a list of all the helpers FM exports,
which can be used in your own data handling code.


## Form Rendering Methods


##### update || render ()

FM _automatically_ triggers renders when necessary.
However if you programically change form configuration, 
you need to trigger a re-render for the changes to take effect.
This method provides that, and also increments the form revision value.

##### getRevision ()


## Configuration Methods

Every aspect of FM is controlled by the form-configuration.
Normally you provide a set of confuration options when you create a FM
instance for a form.
However all configuration is dynamic, and can be changed at any time.
The most common configuration changes have special methods to simplify things.
For example, changing field validation rules, disabling one or all fields,
changing the error-messages (eg: a different languange), etc.


##### setConfig || setFieldConfig (name, data)

##### setFieldDefaults (settings)


##### isDisabled || isFieldDisabled (name)

##### setDisabled || setFieldDisabled (name)

##### setDefaultDisabled ([disable] = true)


##### isFieldReadOnly (name)

##### setReadOnly || setFieldReadOnly (name)

##### isReadOnly (name)

##### setDefaultReadOnly ([readOnly] = true)


## Validation & Error Methods

Validation is usually handled by configuration the fields that require it,
so it is a _subset_ of configuration.
However there are cases when its useful to read, perform, or change validation 
rules programatically, so there is a rich API devoted to validation rules.


##### validate (name, value, [eventName])

##### validateAll ()


##### getFieldValidation (name)

##### setFieldValidation (name, settings)

##### getFieldConfig (name)

##### isRequired || isFieldRequired (name)

##### setRequired || setFieldRequired (name)

##### errors || getError || getErrors (name)

##### setError || setErrors (name, type, [errorMessage])

##### clearError || clearErrors ([name])


## Data & Value Methods

FM _caches_ and _synchronizes_ two separate sets of data.
It is important to understand the difference when deciding which
API methods to use.

Methods containing the word "data" target the Data cache,
while those containing "value" target the Values cache.
However changes to either cache are immediately _synced_ to the other.
When you want to programically set data in a form-field,
a Value method should be used. 
If you need to update the _source_ data, use a Data method.

Any change to _either_ cache will immediately update the Data cache.
If a data transformation is required, it is done on the fly.

### 'Data' Cache

The 'Data' cache starts as a _copy_ of the data originally supplied to FM,
if any was. This cache has the same structure and fieldnames as the source.
When any 'data getter' (eg: `getData()`) is called, 
the data will be returned in the source structure, ready to be posted.

FM tracks the _original_ data, so knows precisely which data has
changed since the form was initialized. 
This is useful if you want to do a PATCH update. 

Data tracking also allows FM to know whether the form is 'clean' or 'dirty'.
If a user changes a value, then later changes it _back_ to the original value,
FM knows that this data value is _no longer_ 'changed'.


### 'Values' Cache
 
The 'Values' cache contains the values supplied to the form fields via props.
These values may be a different data-type of format than the source data, 
to suit the requirements of each field-type.

**The Values cache is a single level deep.** There has no _nested keys_.
Nested structures from the 'Data' cache are flattened to become 'paths',
like `"user.profile.address.street"`.
These paths are the keys used in the Values object, 
and are used as the **fieldnames** in the form...

### Field aliasName

Instead of using long 'path-names' (eg: "user.profile.address.street"), 
an '**aliasName**' can is set in a field's configuration,
like `"addressStreet"`.
All code can then _optionally_ use this alias instead of the path-name. 
Using aliases is recommended to make form markup simpler.

Aliases can also be used to _normalize_ fieldnames from different datasets.
For example, if you have multiple sets of data than contain an address,
and these don't all have identical fieldnames, 
then aliases can normalize them so they can use the same `<AddressForm>` 
component, without needing any extra logic.


##### isClean ([name])

##### isDirty ([name])

##### reset ()


##### changes || getChanges ()

##### data || getData ([name], [options])

##### setData (nameOrData, [fieldData])



##### value || values || getValue || getValues ([name])

##### setValue || setValues (name, value)


## Form 'State' Methods


##### state || getState ([key])

##### setState (key, value)


## Form and Field Methods

ALSO SEE methods like:

 - `getValue()` in the Values section
- `getError()` in the Validation section
- `isFieldDisabled()` in the Configuration section

These methods are used to set field props, 
but usually you'll use the `allProps()` or `dataProps()` helpers instead,
which _combine_ all the individual props into a single setter.


##### allProps (name)

##### dataProps (name)

##### errorProps (name)

##### cleanField || cleanFieldValue (name)

##### hasError || hasErrors (name)

##### onFieldBlur (event_or_name, [value])

##### onFieldChange (event_or_name, [value])

##### onFieldFocus (event_or_name, [value])

