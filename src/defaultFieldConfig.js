/**
 * Default form-field options
 */
const defaultFieldConfig = {
	name: '',
	isData: true, 			// true = form.data[name]; false = state.form[name]
	dataType: '',			// Convert value to this type for DATA OBJECT
	dataFormat: '', 		// Format to use for input/control DATA OBJECT
	valueType: '',			// Convert value to this type for FIELD VALUE
	valueFormat: '', 		// Format to use for input/control FIELD VALUE
	inputType: '',			// If set, dataProps() includes: `type={inputType}`
	onChange: undefined, 	// Callback after FM done processing event
	onBlur: undefined, 		// Callback after FM done processing event
	onFocus: undefined, 	// Callback after FM done processing event
	cleaning: {}, 			// Value-cleaning options
	validation: {}, 		// Validation options
	errorMessages: {} 		// Field overrides, and/or `custom` error message
}

/*
 * Values in config.fieldDefaults will be inherited if not specified per-field
 */
const inheritedFieldDefaults = [
	'isMUIControl',
	'validateOnChange',
	'validateOnBlur',
	'revalidateOnChange',
	'revalidateOnBlur',
	'returnErrorsAsString',
	'readOnly',
	'disabled',
	// Cleaning options
	'cleaning.cleanOnBlur',
	'cleaning.cleanOnValidation',
	'cleaning.trim',
	'cleaning.trimInner',
	'cleaning.monoCaseToProper',
	'cleaning.reformat'
]

export default defaultFieldConfig
export { inheritedFieldDefaults }
