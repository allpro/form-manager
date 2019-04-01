import moment from 'moment'
import isBoolean from 'lodash/isBoolean'
import isDateObject from 'lodash/isDate'
import isNil from 'lodash/isNil'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import toInteger from 'lodash/toInteger'
import toNumber from 'lodash/toNumber'
import toString from 'lodash/toString'
import trim from 'lodash/trim'


const string = value => toString( value )

const integer = value => toInteger( value )

const number = value => toNumber( value )

const boolean = value => {
	// DO NOT convert NULL or undefined - these mean 'unspecified'
	if (isBoolean( value ) || isNil( value )) return value

	// Any non-zero number is true
	if (isNumber( value )) return value !== 0

	// Any string other than these special string values becomes true
	if (isString( value )) {
		const val = trim(value)
		return val && !/^(|0|false|no)$/.test( value )
	}

	// For all other types, convert truthy/falsey to a boolean
	return !!value
}

const dateObject = value => {
	if (!value) return null
	if (isDateObject(value)) return value

	// Avoid arrays and objects that will result in a Now date
	if (!isString(value) && !isNumber(value)) return null

	return moment( value ).valueOf()
}
const dateString = value => (
	isString(value) ? value : moment( value ).format('YYYY-MM-DD')
)
const dateISOString = value => moment( value ).toISOString()


export default {
	boolean,
	string,
	integer,
	number,
	dateObject,
	dateString,
	dateISOString,
}
