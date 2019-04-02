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

        // DATA CLEANING/FORMATTING OPTIONS
        trimText: true, // Trim leading-/trailing--spaces
        fixMultiSpaces: true, // Replace multi-spaces/tabs with single space
        monoCaseToProper: false, // Change all UPPER- or lower-case to Proper-Case
        cleanDataOnBlur: false, // Clean and REPLACE field-data onBlur
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

## Using Form-State

FM can also store 'state' that isn't part of the 'form data'. It uses this 
internally for flags like `isDirty`, but it can also be used to store, and 
pass, any type of data you wish. This could be arrays to populate picklists, 
logic-flags, event handler, etc. ANYTHING you need to pass-down to components
 can be added to FM state. The `categoryList` and `subcategoryList` keys shown 
 above are examples of how 

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

#### USING FORM.STATE DIRECTLY
```javascript static
let selectedCategory = 1;

function handleCategoryChange(field, category, form) {
    if (category !== selectedCategory) {
        selectedCategory = category;
        const subcategories = sampleSubcategories[category] || [];

        // Set the correct subcategories list, or a blank list
        form.state('subcategoryList', subcategories);

        // Always clear the subcategory value when category changes
        form.value('subcategory', '');
    }
}

const formConfig = {
    initialData: {
        category:        selectedCategory,
        subcategory:     ''
    },
    initialState: {
        categoryList:    sampleCategories,
        subcategoryList: sampleSubcategories[selectedCategory]
    },
    fields: {
        category: {
            onChange: handleCategoryChange
        }
    }
}
```

#### USING FORM.DATA ABSTRACTION
```javascript static
let selectedCategory = 1;

function handleCategoryChange(field, category, form) {
    if (category !== selectedCategory) {
        selectedCategory = category;
        const subcategories = sampleSubcategories[category] || [];

        form.values({
            // Set the correct subcategories list, or a blank list
            subcategoryList: subcategories,

            // Always clear the subcategory value when category changes
            subcategory: ''
        });
    }
}

const formConfig = {
    initialData: {
        category:        selectedCategory,
        subcategory:     '',
        categoryList:    sampleCategories,
        subcategoryList: sampleSubcategories[selectedCategory]
    },
    fields: {
        category: {
            isData:   false,
            onChange: handleCategoryChange
        },
        subcategory: {
            isData:   false
        }
    }
}
```
