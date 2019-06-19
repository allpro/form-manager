import isDate from 'date-fns/isDate'

import {
	isBoolean,
	isNil,
	isNumber,
	isString,
	toInteger,
	toNumber,
	toString,
	parseDate,
	trim
} from '../utils'

import formatDate from '../formatters/date'


const string = value => toString(value)

const integer = value => isNil(value) ? null : toInteger(value)

const number = value => isNil(value) ? null : toNumber(value)

const boolean = value => {
	if (isBoolean(value)) return value

	// DO NOT convert NULL or undefined to boolean - these mean 'unspecified'
	if (isNil(value)) return null

	// Any non-zero number is true
	if (isNumber(value)) return value !== 0

	// Any string other than these special string values becomes true
	if (isString(value)) {
		const val = trim(value)
		return val && !/^(|0|false|no)$/.test(value)
	}

	// For all other types, convert truthy/falsey to a boolean
	return !!value
}


const date = ( value, dt = 'medium-date', tm ) => formatDate(value, dt, tm)
const dateISO = value => formatDate(value, 'iso')
const dateISOLocal = value => formatDate(value, 'isoLocal')

const dateObject = value => {
	if (!value) return null
	if (isDate(value)) return value
	// Avoid arrays and objects that will result in a Now date
	if (!isString(value) && !isNumber(value)) return null

	return parseDate(value)
}


export default {
	boolean,
	string,
	integer,
	number,
	date,
	dateISO,
	dateISOLocal,
	dateObject
}
