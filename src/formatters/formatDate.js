// TEMPORARY IMPORTS
import moment from 'moment'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'


// Match timestamps  with no date portion, like: "08:30" or "14:00:00"
const reTimeOnly = /^[\d]{2}:[\d]{2}[\d:]*$/
const fixTimestamp = date => (
	isString(date) && reTimeOnly.test(date)
		? `1970-01-01T${date}`
		: date
)

/**
 * PUBLIC UTILITY to create moment object, AND handle time-only strings
 *
 * @public
 * @param {(string|Object)} date
 * @returns {moment.Moment|*}
 */
function toMoment( date ) {
	if (!date) return date
	return moment(fixTimestamp(date))
}


const formats = {
	'short-date': 'MMM D/YY', // Feb 23/18 - when space is tight!
	'medium-date': 'MMM D, YYYY', // Feb 23, 2018
	'long-date': 'MMMM D, YYYY', // February 23, 2018

	'short-day-date': 'ddd, MMM D', // Tue, Jan 30
	'medium-day-date': 'dddd, MMM D, YYYY', // Friday, Feb 23, 2018
	'long-day-date': 'dddd, MMMM D, YYYY', // Friday, February 23, 2018

	'short-time': 'h A', // 10 AM
	'medium-time': 'h:mm A', // 10:22 AM
	'long-time': 'h:mm:ss A', // 10:22:35 AM

	// SPECIAL DATA FORMATS
	'date-input': 'YYYY-MM-DD', 			// For input.type="date"
	'time-input': 'HH:mm',					// For input.type="time"
	'datetime-input': 'YYYY-MM-DDTHH:mm',	// For input.type="datetime-local"
	'iso': '' // NOTE: empty format string means iso-8601 standard format
}


/**
 * PUBLIC UTILITY to parse a date and returns it a formatted string.
 * Accepts anything that Moment can parse, like a string or js-date object.
 * Can pass a keyword for a standard date/time format, or a custom format.
 *
 * @public
 * @param {(string|Date)} date
 * @param {string} [dateFmt]
 * @param {string} [timeFmt]
 * @returns {string}
 */
function formatDate( date, dateFmt, timeFmt ) {
	if (!date) return ''

	const mDate = toMoment(date)

	// If the date is missing or invalid, log it and return 'Invalid Date'.
	// The return value will help developers instantly spot format errors.
	if (!date || !mDate.isValid()) {
		console.log(`The date provided to formatters.date is invalid: ${date}`)
		return 'Invalid Date'
	}

	// If a time-format is passed, then DO NOT assume the default date-format
	//  because use may want ONLY time
	let dt = timeFmt ? '' : formats['medium-date']
	let tm = ''

	if (dateFmt) {
		dt = dateFmt
		// See if this is a keyword, like "iso"
		if (isString(formats[dateFmt])) { //
			dt = formats[dateFmt]
		}
		// Accept an array like [ dateFormat, timeFormat ]
		else if (isArray(dt)) {
			dt = dt[0]
			tm = dt[1]
		}
	}
	if (!tm && timeFmt) {
		tm = dateFmt[timeFmt] || timeFmt
	}

	return mDate.format(tm ? `${dt} ${tm}` : dt)
}

export default formatDate
export { toMoment }
