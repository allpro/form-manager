import gte from 'lodash/gte'
import lte from 'lodash/lte'
import inRange from 'lodash/inRange'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'
import isRegExp from 'lodash/isRegExp'
import isSafeInteger from 'lodash/isSafeInteger'
import isString from 'lodash/isString'
import trim from 'lodash/trim'
import uniq from 'lodash/uniq'

import formatters from '../formatters'
const { toMoment } = formatters


/**
 * RegExp pattern tester; can handle numeric values
 *
 * @param {(string|number|null)} value
 * @param {(RegExp|string)} regex
 * @returns {boolean}
 */
const pattern = (value, regex) => {
	if (isNil(value)) return false
	const re = isRegExp(regex) ? regex : new RegExp(regex.toString())
	return re.test(value.toString())
}

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
	const nums = formatters.numbersOnly(value || '')
	return nums.length === 7 || nums.length === 10 || nums.length === 11
}

const string = value => isString(value)

const number = (value, opts) => isNumeric(value, opts)

const integer = (value, opts = {}) => isNumeric(value, { ...opts, integer: true })

const minLength = ( value, len ) => gte(trim(value.toString()).length, len)

const maxLength = ( value, len ) => lte(trim(value.toString()).length, len)

const lengthRange = ( value, lens ) => inRange(trim(value.toString()).length, lens[0], lens[1])

const exactLength = ( value, len ) => trim(value.toString()).length === len

const minNumber = ( value, num ) => gte(value, num)

const maxNumber = ( value, num ) => lte(value, num)

const numberRange = ( value, nums ) => inRange(value, nums[0], nums[1])


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

const minDate = ( value, dt ) => toMoment(value).isSameOrAfter(dt)
const maxDate = ( value, dt ) => toMoment(value).isSameOrBefore(dt)
const dateRange = ( value, dts ) => toMoment(value).isBetween(dts[0], dts[1], null, '[]')

const minTime = ( value, tm ) => toTime(value).isSameOrAfter(toTime(tm))
const maxTime = ( value, tm ) => toTime(value).isSameOrBefore(toTime(tm))
const timeRange = ( value, tms ) => (
	toTime(value).isBetween(toTime(tms[0]), toTime(tms[1]), null, '[]')
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
		return num || num === 0 ? testNumber(num) : false
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
	pattern,

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
