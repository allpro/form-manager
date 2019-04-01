/**
 * Default form-field options
 */
const defaultFieldConfig = {
	name: '',
	isData: true, // true = form.data[name]; false = state.form[name]
	onChange: undefined, // Callback after FM done processing event
	onBlur: undefined, // Callback after FM done processing event
	validation: {}, // Validation options
	errorMessages: {} // Field overrides, and/or `custom` error message
}

/*
 * Values in config.fieldDefaults will be inherited if not specified per-field
 */
const inheritedFieldDefaults = [
	'validateOnChange',
	'validateOnBlur',
	'revalidateOnChange',
	'revalidateOnBlur',
	'returnErrorsAsString',
	'readOnly',
	'disabled',
	'trimText',
	'fixMultiSpaces',
	'monoCaseToProper',
	'cleanDataOnBlur'
]

export default defaultFieldConfig
export { inheritedFieldDefaults }
