/**
 * Default error messages used for standard validation errors
 * Message strings can contain variables that will be substituted:
 * - {name} is replaced by 'displayName' from field-config, if it is set.
 *      Otherwise "This field" will be used to replace {name}.
 * - {value} is the value specified in the validation rule
 * - {value1} is the 1st array value when validation rules use an array
 * - {value2} is the 2nd array value, and so on
 */
const defaultErrorMessages = {
	required: '{name} is required',

	// Data-type errors - usually won't happen; see validators instead
	'type-text': 'This must be text',
	'type-number': 'This is not a valid number',
	'type-integer': 'This is not a valid integer',
	'type-boolean': 'This must be true or false',
	'type-date': 'This is not a valid date',

	// Standard, preset validators - no values required
	phone: 'Enter a valid 10-digit phone number',
	address: 'Enter a valid address',
	email: 'This is not a valid email address.',
	number: '{name} must be a number',
	integer: '{name} must be only numbers',

	// Generic, preset validators - require value(s) to be set
	minLength: '{name} must be at least {value} characters',
	maxLength: '{name} must be less than {value} characters.',
	exactLength: '{name} must be exactly {value} characters.',
	minDate: '{name} must be on or after {value}',
	maxDate: '{name} must be on or before {value}',
	minNumber: '{name} must be at least {value}',
	maxNumber: '{name} must be less than or equal to {value}',
	numberRange: '{name} must be between {value1} and {value2}',

	// The 'unknown' message should never be needed, but just in case...
	unknown: 'This entry is invalid',
}

export default defaultErrorMessages
