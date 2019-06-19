import format from 'date-fns/format'
import isValid from 'date-fns/isValid'

import { isArray, isString, parseDate } from '../utils'


const dateFormats = {
	'short-date': 'MMM d/yy', // Feb 23/18 - when space is tight!
	'medium-date': 'MMM d, yyyy', // Feb 23, 2018
	'long-date': 'MMMM d, yyyy', // February 23, 2018

	'short-day-date': 'EEE, MMM d', // Tue, Jan 30
	'medium-day-date': 'EEE, MMM d, yyyy', // Friday, Feb 23, 2018
	'long-day-date': 'EEEE, MMMM d, yyyy', // Friday, February 23, 2018

	'short-time': 'HH:mm', // 14:22
	'medium-time': 'h:mm aa', // 10:22 AM
	'long-time': 'h:mm:ss aa', // 10:22:35 AM

	// SPECIAL DATA FORMATS
	'date-input': 'yyyy-MM-dd', 			// For input.type="date"
	'time-input': 'HH:mm',					// For input.type="time"
	'datetime-input': "yyyy-MM-dd'T'HH:mm",	// For input.type="datetime-local"
	'isoLocal': "yyyy-MM-dd'T'HH:mm:ssx", 	// ISO-8601 WITH timezone offset
	'iso': '' // Default format - means Date().toISOString (ISO-8601)
}

/**
 * PUBLIC UTILITY to parse a date and returns it a formatted string.
 * Accepts anything that Moment can parse, like a string or js-date object.
 * Can pass a keyword for a standard date/time format, or a custom format.
 *
 * @public
 * @param {(string|Date)} dateVal
 * @param {string} [dateFmt]
 * @param {string} [timeFmt]
 * @returns {string}
 */
function formatDate(dateVal, dateFmt, timeFmt ) {
	if (!dateVal) return ''

	const date = parseDate(dateVal)

	// If the date is missing or invalid, log it and return 'Invalid Date'.
	// The return value will help developers instantly spot format errors.
	// noinspection JSCheckFunctionSignatures
	if (!isValid(date)) {
		console.log(
			`The date provided to formatters.date is invalid: ${dateVal}`
		)
		return 'Invalid Date'
	}

	let dt = dateFmt || ''
	let tm = timeFmt || ''

	// Accept an array like [ dateFmt, timeFmt ]
	if (dt && isArray(dt)) {
		dt = dateFmt[0]
		tm = dateFmt[1]
	}

	// See if this is a keyword like "iso" or "short-date"
	if (isString(dateFormats[dt])) { //
		dt = dateFormats[dt] // NOTE: 'iso' -> ''
	}
	if (isString(dateFormats[tm])) {
		tm = dateFormats[tm]
	}

	return !dt && !tm
		? date.toISOString()
		: !dt
			? format(date, tm)
		: !tm
			? format(date, dt)
			: format(date, `${dt} ${tm}`)
}

export default formatDate
export { dateFormats }
