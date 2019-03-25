/**
 * Default form-field options
 */
const defaultFieldConfig = {
	name: '',
	isData: true, // true = form.data[name]; false = state.form[name]
	onChange: undefined, // Callback after FM done processing event
	onBlur: undefined, // Callback after FM done processing event
	validation: {}, // Validation options
	errorMessages: {}, // Field overrides, and/or `custom` error message
}

/**
 * Values from options-root will also be set if not specified per-field
 */
const inheritedFieldConfigKeys = [
	'readOnly',
	'disabled',
	'fixCase',
	'trimText',
	'fixSpaces',
	'cleanDataOnBlur',
]

export default defaultFieldConfig
export { inheritedFieldConfigKeys }
