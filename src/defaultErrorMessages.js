import formatters from './formatters'
const { date } = formatters

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

	// Standard, preset validators - no values required
	phone: 'Enter a valid 10-digit phone number',
	address: 'Enter a valid address',
	email: 'This is not a valid email address.',
	number: '{name} must be a number',
	integer: '{name} must be only numbers',

	password: {
		default: 'This is not a valid password',
		mixedCase: '{name} must have both uppercase and lowercase characters,',
		lowerCase: '{name} must have {value} or more lowercase characters,',
		upperCase: '{name} must have {value} or more uppercase characters,',
		number: '{name} must have {value} or more numbers,',
		symbol: '{name} must have {value} or more symbols,',
		invalidChars: `These characters are INVALID: {value}`
	},

	// Generic, preset validators - require value(s) to be set
	minLength: '{name} must be at least {value} characters',
	maxLength: '{name} must be less than {value} characters.',
	exactLength: '{name} must be exactly {value} characters.',
	minNumber: '{name} must be at least {value}',
	maxNumber: '{name} must be less than or equal to {value}',
	numberRange: '{name} must be between {value1} and {value2}',
	minDate: (name, value) => (
		`${name || 'Date'} must be on or after ${date(value, 'medium-date')}`
	),
	maxDate: (name, value) => (
		`${name || 'Date'} must be on or before ${date(value, 'medium-date')}`
	),
	dateRange: (name, value) => (
		`${name || 'Date'} must be between ` +
		`${date(value[0], 'medium-date')} and ${date(value[1], 'medium-date')}`
	),
	minTime: (name, value) => (
		`${name || 'Time'} must be at or after ${date(value, 'medium-time')}`
	),
	maxTime: (name, value) => (
		`${name || 'Time'} must be at or before ${date(value, 'medium-time')}`
	),
	timeRange: (name, value) => (
		`${name || 'Time'} must be between ` +
		`${date(value[0], 'medium-time')} and ${date(value[1], 'medium-time')}`
	),

	// The 'unknown' message should never be needed, but just in case...
	unknown: 'This entry is invalid',
}

export default defaultErrorMessages
