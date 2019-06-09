import parseISO from 'date-fns/parseISO'
import toDate from 'date-fns/toDate'
import isDate from 'date-fns/isDate'

import { isString } from './nodash'


// Match timestamps  with no date portion, like: "08:30" or "14:00:00"
const reTimeOnly = /^[\d]{2}:[\d]{2}[\d:]*$/
const fixTimestamp = date => (
	isString(date) && reTimeOnly.test(date)
		? `1970-01-01T${date}`
		: date
)

/**
 * PUBLIC UTILITY to create Date object, AND handle time-only strings
 *
 * @public
 * @param {(string|number|Object)} date
 * @returns {Date|*}
 */
const parseDate = date => (
	isDate(date) ? date :
	isString(date) ? parseISO(fixTimestamp(date)) :
	toDate(date)
)

export default parseDate
