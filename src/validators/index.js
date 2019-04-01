import moment from 'moment'
import gte from 'lodash/gte'
import lte from 'lodash/lte'
import inRange from 'lodash/inRange'
import isBoolean from 'lodash/isBoolean'
import isDate from 'lodash/isDate'
import isNumber from 'lodash/isNumber'
import isSafeInteger from 'lodash/isSafeInteger'
import isString from 'lodash/isString'

// eslint-disable-next-line
const reEmail = /^\s*(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/

/**
 * Email validator taken from ReactNative email validator
 * NOTE that this may not handle highly abnormal email addresses!
 *
 * @param {string} value
 * @returns {boolean}
 */
const email = value => reEmail.test( value.toLowerCase() )

/**
 * @param {string} value
 * @returns {boolean}
 */
const phone = value => {
	const nums = value.replace( /[^0-9]/g, '' )
	return nums.length === 7 || nums.length === 10 || nums.length === 11
}

const text = value => isString( value )

const number = value => isNumeric( value )

const integer = value => isNumeric( value, { integer: true } )

const minLength = (value, opt) => gte( value.length, opt )

const maxLength = (value, opt) => lte( value.length, opt )

const exactLength = (value, opt) => value.length === opt

const minNumber = (value, opt) => gte( value, opt )

const maxNumber = (value, opt) => lte( value, opt )

const numberRange = (value, opt) => inRange( value, opt[0], opt[1] )

// TODO: Verify after we know what date format we are using
const toDateString = value => (
	isDate(value)
		? moment(value).format('YYYY-MM-DD')
		: value
)
const date = value => moment( value ).isValid()
const minDate = (value, opt) => gte( toDateString(value), toDateString(opt) )
const maxDate = (value, opt) => lte( toDateString(value), toDateString(opt) )

const boolean = value => (
	isBoolean( value ) ||
	value === 0 ||
	value === 1 ||
	(isString( value ) && /^(|0|1|true|false|yes|no)$/.test( value ))
)


function isNumeric( value, opts = { integer: false, allowNegative: false } ) {
	if (isNumber( value )) {
		return testNumber( value )
	}

	if (isString( value )) {
		const num = Number( value ) // Note: NaN == false
		return num ? testNumber( num ) : false
	}

	// Only numbers and strings are acceptable values
	return false

	function testNumber( num ) {
		if (opts.integer && !isSafeInteger( num )) return false
		return opts.allowNegative ? true : num >= 0
	}
}

/**
 * Keep for future ref
 *
 function callValidationFunction(fn, fieldConfig, fieldValue, thisInstance) {
	 let errors = fn(fieldValue, fieldConfig.name, thisInstance);

	 if (errors === false) {
	 }

	 // Errors must be a string or non-empty array
	 if (!errors || (!_.isArray(errors) && !_.isString(errors))) {
		 return [];
	 }
 }
 */

export default {
	boolean,
	email,
	phone,
	text,
	number,
	integer,
	minLength,
	maxLength,
	exactLength,
	minNumber,
	maxNumber,
	numberRange,
	date,
	minDate,
	maxDate,
}
