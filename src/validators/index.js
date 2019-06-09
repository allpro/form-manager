import isValid from 'date-fns/isValid'
import isEqual from 'date-fns/isEqual'
import isSameDay from 'date-fns/isSameDay'
import isAfter from 'date-fns/isAfter'
import isBefore from 'date-fns/isBefore'
import isWithinInterval from 'date-fns/isWithinInterval'
import setDayOfYear from 'date-fns/setDayOfYear'
import setYear from 'date-fns/setYear'

import {
	inRange,
	isBoolean,
	isEmpty,
	isNil,
	isNumber,
	isInteger,
	isRegExp,
	isString,
	parseDate,
	trim,
	uniq
} from '../utils'

import formatters from '../formatters'


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

const minLength = ( value, len ) => trim(value.toString()).length >= len

const maxLength = ( value, len ) => trim(value.toString()).length <= len

const lengthRange = ( value, lens ) => inRange(trim(value.toString()).length, lens[0], lens[1])

const exactLength = ( value, len ) => trim(value.toString()).length === len

const minNumber = ( value, num ) => +value >= num

const maxNumber = ( value, num ) => +value < num

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


const date = value => !isNaN(parseDate(value))

const minDate = ( value, dt ) => {
	const val = parseDate(value)
	const cmp = parseDate(dt)
	return isSameDay(val, cmp) || isAfter(val, cmp)
}

const maxDate = ( value, dt ) => {
	const val = parseDate(value)
	const cmp = parseDate(dt)
	return isSameDay(val, cmp) || isBefore(val, cmp)
}

// NOTE: dateRange ERROR if 1st comparison date is AFTER 2nd comparison
const dateRange = ( value, dts ) => {
	const dt = parseDate(value)
	const range = {
		start: parseDate(dts[0]),
		end: parseDate(dts[1])
	}
	if (isValid(dt) && isValid(range.start) && isValid(range.end)) {
		return isWithinInterval(dt, range)
	}

	return false // BAD DATA!
}


const minTime = ( value, tm ) => {
	const val = toTime(value)
	const cmp = toTime(tm)
	return isEqual(val, cmp) || isAfter(val, cmp)
}

const maxTime = ( value, tm ) => {
	const val = toTime(value)
	const cmp = toTime(tm)
	return isEqual(val, cmp) || isBefore(val, cmp)
}

const timeRange = ( value, tms ) => (
	dateRange(toTime(value), [ toTime(tms[0]), toTime(tms[1]) ])
)

function toTime( value ) {
	let dt = parseDate(value)
	dt = setYear(dt, 1970)
	dt = setDayOfYear(dt, 1)
	return dt
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
		if (opts.integer && !isInteger(num)) return false
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
