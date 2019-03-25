import defaultErrorMessages from './defaultErrorMessages'

/**
 * Internal form configuration defaults. Overridden by config passed-in.
 */
const formConfig = {
	/**
	 * FormManager stores all data and errors inside the component state of the
	 * component that creates the instance; which is passed as first argument.
	 *
	 * By default FM uses state.form as the root for all data it stores, which
	 * is specified by the stateStorageKey. However if a container wishes to
	 * create more than one instance of FM, then each instance should use its
	 * own state-key. Otherwise errors or other metas data written by one
	 * instance can affect the logic of another. This option exists to avoid
	 * such conflicts, by giving each instance a unique storage key.
	 *
	 * This key tells FM to output form data at state.keyName, with all subkeys
	 * below this, such as state.keyName.data, state.keyName.errors, etc.
	 *
	 * All interaction with component state is handled by the getState and
	 * setState, so use of this key is primarily limited to these helpers,
	 * plus the initComponentState and setFieldValues methods.
	 *
	 * NOTE: All comments in this file refer to state.form as the storage root.
	 * If a custom key is specified, these comments really mean the custom key.
	 *
	 * Override the default 'form' key-name ONLY if more than one FM instance
	 * is needed within the same component. This will keep code consistent.
	 *
	 * @type {string} stateStorageKey
	 */
	stateStorageKey: 'form',

	/**
	 * Form validation options can be overridden per-field
	 * Validation can be triggered manually for a single field, or all fields
	 * Separate options exist for validating a field with or without errors
	 */
	// When should we do an INITIAL auto-validation of each field
	autoValidate: false, // [change|blur|falsey]
	// When should we re-validation a field that currently has an error
	autoRevalidate: 'change', // [change|blur|falsey]

	// Should all fields be read-only or disabled by default?
	readOnly: false,
	disabled: false,
	// Data cleaning options
	fixCase: false, // Change all UPPER- or lower-case to Proper-Case
	trimText: true, // Trim leading-/trailing--spaces
	fixSpaces: true, // Replace multi-spaces/tabs with single space
	cleanDataOnBlur: false, // Clean and REPLACE field-data onBlur

	/**
	 * Default error messages for all standard validations
	 */
	errorMessages: defaultErrorMessages,
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
		 name:           'address',  // REQUIRED
		 displayName:    'Address',  // REQUIRED IF want to use in errors
		 autoValidate:   'blur',     // OVERRIDE default form-level option
		 onChange:       this.onAddressChange // OPTIONAL change callback
		 validation: {
		 required:   true,
		 address:    true, // PRESET validations; TBD
		 minLength:  20,
		 maxLength:  120,
		 // All validations have a default error message
		 },
		 // Form default messages can be overridden at field-level
		 // Use of placeholder is optional
		 errorMessages: {
		 maxLength: '{name} cannot exceed {value} characters'
		 }
		 },
		 'person/age': {
		 name:           'person/age',
		 aliasName:      'age', // name user passes to get data-props, etc.
		 displayName:    'Age',
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

	// initialState will be copied to Component.state.form
	// NOTE: 'data' and 'errors' keys are NOT ALLOWED in initialState
	initialState: {},
	// initialData will be copied to Component.state.form.data
	initialData: {},
	// initialErrors will be copied to Component.state.form.errors
	initialErrors: {},
}

export default formConfig
