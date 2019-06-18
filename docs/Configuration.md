# FormManager Configuration

Below is a sample form-configuration that shows many of the options available. 
Usually your form-config will be simpler than this.

Note that **not all fields need configuration in FM**. 
Only fields that require validation, callbacks or other features of FM need to be specified. **If using FM for read-only data, you need no configuration**, except to set the `initialData`, if you have it.

Some options can be set at both the form and fields levels. 
Setting an option at the form/top level makes it the _default_ for all fields. 
This default can be overridden by individual fields by setting an option in the 
config  for that field. See `validateOn` examples below.

 You can see the default configuration for FM in: `defaultFormConfig.js`. It 
 includes many of the same default values and comments as shown below.

```javascript static
const formConfig = {
    // Specify initial form state, data and errors
    initialState: {},
    initialData: {},
    initialErrors: {},

    // CUSTOMIZE HELPER METHODS AND ERROR-MESSAGES
    // Built-in defaults will be added by initFormConfiguration()
    formatters: {},
    validators: {},
    converters: {},
    errorMessages: {},

    // form.onChange & onBlur is fired after ANY field same-event is fired
    onChange: undefined,
    onBlur: undefined,

    fieldDefaults: {
        /*
         * Form validation options can be overridden per-field
         * Validation can be triggered manually for a single field, or all fields
         * Separate options exist for validating a field with or without errors
         */
        // When should we do an INITIAL auto-validation of each field
        validateOnChange: false,
        validateOnBlur: false,
        // When should we re-validation a field that currently has an error
        revalidateOnChange: true,
        revalidateOnBlur: true,

        // How should we return error messages (by default)
        returnErrorsAsString: true, // false = return error(s) in an array

        // Should fields be read-only or disabled by default?
        readOnly: false,
        disabled: false,

        // TEXT-FIELD CLEANING/FORMATTING OPTIONS
        cleaning: {
            cleanOnBlur: true, // Clean field-text onBlur
            trim: true, // Trim leading-/trailing--spaces
            trimInner: false, // Replace multi-spaces/tabs with single space
			reformat: '' // {(string|Function)} Apply a formatter to value
        }
    },

    /*
     * Form-fields configuration; SHOWN HERE AFTER NORMALIZATION TO A HASH.
     * Can be passed as a hash keyed by fieldname OR as an array.
     * When passed as an array, each item must include a 'name' key.
     * When passed as a hash, the key will be COPIED to item.name automatically.
     *
     * Only fields requiring validation or type-conversion need to be included,
     *  however it can be useful to include all fields as a reference
     */
    fields: {},
}
```

## DETAILS COMING SOON
