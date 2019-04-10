import isBoolean from 'lodash/isBoolean'
import isDateObject from 'lodash/isDate'
import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import toInteger from 'lodash/toInteger'
import toNumber from 'lodash/toNumber'
import toString from 'lodash/toString'
import trim from 'lodash/trim'

import formatters from '../formatters'
const { toMoment } = formatters


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


const date = ( value, format = 'YYYY-MM-DD' ) => formatters.date(value, format)

const dateISO = value => formatters.date(value, 'iso')

const dateObject = value => {
	if (!value) return null
	if (isDateObject(value)) return value
	// Avoid arrays and objects that will result in a Now date
	if (!isString(value) && !isNumber(value)) return null

	return toMoment(value).valueOf()
}


export default {
	boolean,
	string,
	integer,
	number,
	date,
	dateISO,
	dateObject
}
