import gte from 'lodash/gte'
import lte from 'lodash/lte'
import inRange from 'lodash/inRange'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import isSafeInteger from 'lodash/isSafeInteger'
import isString from 'lodash/isString'
import trim from 'lodash/trim'
import uniq from 'lodash/uniq'

import formatters from '../formatters'
const { toMoment } = formatters

// eslint-disable-next-line
const reEmail = /^\s*(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/

/**
 * Email validator taken from ReactNative email validator
 * NOTE that this may not handle highly abnormal email addresses!
 *
 * @param {string} value
 * @returns {boolean}
 */
const email = value => reEmail.test(value.toLowerCase())

/**
 * @param {string} value
 * @returns {boolean}
 */
const phone = value => {
	const nums = value.replace(/[^0-9]/g, '')
	return nums.length === 7 || nums.length === 10 || nums.length === 11
}

const string = value => isString(value)

const number = value => isNumeric(value)

const integer = value => isNumeric(value, { integer: true })

const minLength = ( value, opt ) => gte(trim(value.toString()).length, opt)

const maxLength = ( value, opt ) => lte(trim(value.toString()).length, opt)

const lengthRange = ( value, opt ) => inRange(trim(value.toString()).length, opt[0], opt[1])

const exactLength = ( value, opt ) => trim(value.toString()).length === opt

const minNumber = ( value, opt ) => gte(value, opt)

const maxNumber = ( value, opt ) => lte(value, opt)

const numberRange = ( value, opt ) => inRange(value, opt[0], opt[1])


const RE_PASSWORD_SYMBOLS = /[ /$^.*+()[\]!"#%&',\-:;<=>?@_`{|}~]/g
const RE_NOT_PASSWORD_SYMBOLS = /[^ /$^.*+()[\]!"#%&',\-:;<=>?@_`{|}~]/g
const stringContentTest = ( str, count, re ) => {
	if (!count) return true
	const arr = str.match(re)
	return arr && arr.length >= (count > 0 ? count : 1)
}
const password = ( value, opts, fieldName, messages ) => {
	if (!opts || isEmpty(opts)) {
		return string(value)
	}

	const toNum = val => val === true ? 1 : val === false ? 0 : (val || 0)
	const lower = toNum(opts.lower)
	const upper = toNum(opts.upper)
	const num = toNum(opts.number)
	const symbol = toNum(opts.symbol)

	const hasLower = stringContentTest(value, lower, /[a-z]/g)
	const hasUpper = stringContentTest(value, upper, /[A-Z]/g)
	const hasNumber = stringContentTest(value, num, /[0-9]/g)
	const hasSymbol = stringContentTest(value, symbol, RE_PASSWORD_SYMBOLS)

	const msg = ( type, val ) => (messages[type] || '').replace(/{value}/, val)
	const errors = []

	if (!hasLower || !hasUpper) {
		if (lower === 1 && upper === 1) {
			errors.push(msg('mixedCase'))
		}
		else {
			if (!hasLower) errors.push(msg('lowerCase', lower))
			if (!hasUpper) errors.push(msg('upperCase', upper))
		}
	}

	if (!hasNumber) errors.push(msg('number', num))

	if (!hasSymbol) errors.push(msg('symbol', symbol))

	// Check for INVALID symbols
	const symbols = value.match(/[^a-z0-9]/gi) || []
	const invalidSymbols = symbols.join('').match(RE_NOT_PASSWORD_SYMBOLS) || []
	if (invalidSymbols.length) {
		errors.push(msg('invalidChars', uniq(invalidSymbols).join(' ')))
	}

	return errors.length ? errors : true
}


const boolean = value => (
	isBoolean(value) ||
	value === 0 ||
	value === 1 ||
	(isString(value) && /^(|0|1|true|false|yes|no)$/.test(value))
)


const date = value => toMoment(value).isValid()

const minDate = ( value, opt ) => toMoment(value).isSameOrAfter(opt)
const maxDate = ( value, opt ) => toMoment(value).isSameOrBefore(opt)
const dateRange = ( value, opt ) => toMoment(value).isBetween(opt[0], opt[1], null, '[]')

const minTime = ( value, opt ) => toTime(value).isSameOrAfter(toTime(opt))
const maxTime = ( value, opt ) => toTime(value).isSameOrBefore(toTime(opt))
const timeRange = ( value, opt ) => (
	toTime(value).isBetween(toTime(opt[0]), toTime(opt[1]), null, '[]')
)


function toTime( value ) {
	return toMoment(value).year(1970).dayOfYear(1)
}

function isNumeric( value, opts = { integer: false, allowNegative: false } ) {
	if (isNumber(value)) {
		return testNumber(value)
	}

	if (isString(value)) {
		const num = Number(value) // Note: NaN == false
		return num ? testNumber(num) : false
	}

	// Only numbers and strings are acceptable values
	return false

	function testNumber( num ) {
		if (opts.integer && !isSafeInteger(num)) return false
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
	email,
	phone,
	password,

	boolean,
	string,
	number,
	integer,

	minLength,
	maxLength,
	lengthRange,
	exactLength,

	minNumber,
	maxNumber,
	numberRange,

	date,
	minDate,
	maxDate,
	dateRange,

	minTime,
	maxTime,
	timeRange
}
