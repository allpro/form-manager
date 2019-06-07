/**
 * Internal form configuration defaults. Overridden by config passed-in.
 */
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

	// Map of aliasName(s) to real field.name(s)
	// AUTO-GENERATED - CONFIG DATA WILL BE IGNORED
	fieldAliasMap: {},

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
		revalidateOnChange: false,
		revalidateOnBlur: false,

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
	 * Can be passed as a hash keyed by fieldName OR as an array.
	 * When passed as an array, each item must include a 'name' key.
	 * When passed as a hash, the key will be COPIED to item.name automatically.
	 *
	 * Only fields requiring validation or type-conversion need to be included,
	 *  however it can be useful to include all fields as a reference
	 */
	fields: {},
	/* SAMPLE field data using Hash format (same as internal format)
	fields: {
		address: {
			displayName:	'Address',  // REQUIRED IF want to use in errors
			autoValidate:	'blur',	// OVERRIDE default form-level option
			onChange:		this.onAddressChange // OPTIONAL change callback
			validation: {
				required:	true,
				address:	true, // PRESET validations; TBD
				minLength:  20,
				maxLength:  120,
			},
			// All validations have a default error message, but...
			// Form default messages can be overridden at field-level
			// Use of template placeholders is optional
			errorMessages: {
				maxLength: '{name} cannot exceed {value} characters'
			}
		},
		'person/age': {
			aliasName:		'age', // name user passes to get data-props, etc.
			displayName:	'Your Age',
			defaultValue:	25,
			dataType:		'integer',
			validation: {
				fieldType:		'dataISOString',
				required:		true,
				numberRange:	[ 18, 120 ],
			},
		},
		expandSectionOne: {
			name:	'expandSectionOne',
			isData: false  // value stored in form-state, NOT form-data
		}
	},
	*/
}

export default formConfig
