// TEMPORARY IMPORTS
import moment from 'moment'
import assign from 'lodash/assign'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'

const timeFormats = {
	'short-time': 'h A', // 10 AM
	'medium-time': 'h:mm A', // 10:22 AM
	'long-time': 'h:mm:ss A' // 10:22:35 AM
}

const dateFormats = {
	...timeFormats,

	'short-date': 'MMM D/YY', // Feb 23/18 - when space is tight!
	'medium-date': 'MMM D, YYYY', // Feb 23, 2018
	'long-date': 'MMMM D, YYYY', // February 23, 2018

	'short-date-day': 'ddd, MMM D', // Tue, Jan 30
	'medium-date-day': 'dddd, MMM D, YYYY', // Friday, Feb 23, 2018
	'long-date-day': 'dddd, MMMM D, YYYY', // Friday, February 23, 2018

	'short-day-month': 'ddd, MMM D', // Fri, Feb 23
	'medium-day-month': 'dddd, MMM D', // Friday, Feb 23
	'long-day-month': 'dddd, MMMM D', // Friday, February 23

	'short-month-day': 'MM-dd', // 10-22 - NOT USED
	'medium-month-day': 'MMM d', // Oct 22 - Used in date-range when same year
	'long-month-day': 'MMMM d', // October 22

	'short-month-year': 'MMM/YY',
	'medium-month-year': 'MMM-YYYY',
	'long-month-year': 'MMMM YYYY',

	'medium-year': 'YYYY',
	'medium-year-quarter': 'YYYY [Q]Q',

	// NON-DISPLAY FORMATS
	'date-input': 'YYYY-MM-DD', 			// input.type="date"
	'time-input': 'HH:mm',					// input.type="time"
	'datetime-input': 'YYYY-MM-DDTHH:mm',	// input.type="datetime-local"
	'iso-string': '' // empty format string means iso-8601 standard format
}
assign(dateFormats, {
	'short-date-time': [dateFormats['short-date'], timeFormats['short-time']],
	'medium-date-time': [
		dateFormats['medium-date'],
		timeFormats['medium-time']
	],
	'long-date-time': [dateFormats['long-date'], timeFormats['medium-time']],
	'long-date-day-time': [
		dateFormats['long-date-day'],
		timeFormats['medium-time']
	]
})


const reTimeOnly = /^[0-9]+:[0-9]+[0-9:]*$/
const reBadTimestamp = /\.0{1,4}Z$/ // SAMPLE: "19891102T120000.0Z"
const reDissectBadTimestamp = /^([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/

function fixTimestamp(strDate) {
	if (isString(strDate)) {
		if (reTimeOnly.test(strDate)) {
			return `1970-01-01T${strDate}`
		}

		if (reBadTimestamp.test(strDate)) {
			const match = strDate.match(reDissectBadTimestamp)
			if (match && match.length > 6) {
				return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`
			}
		}
	}

	return strDate
}

function toMoment( date ) {
	if (!date) return date
	return moment(fixTimestamp(date))
}

/**
 *
 * @param {(string|Date)} date
 * @param {string} [dateFmt]
 * @param {string} [timeFmt]
 */
function formatDate( date, dateFmt, timeFmt ) {
	if (!date) return ''

	const mDate = toMoment( date )

	// If the date is missing or invalid, log it and return 'Invalid Date'.
	// The return value will help developers instantly spot format errors.
	if (!date || !mDate.isValid()) {
		console.log(`The date provided to formatDate is invalid: ${date}`)
		return 'Invalid Date'
	}

	// If a time-format is passed, then DO NOT assume the default date-format
	//  because use may want ONLY time
	let dt = timeFmt ? '' : dateFormats['medium-date']
	let tm = ''

	if (dateFmt) {
		dt = dateFormats[dateFmt] // NOTE: empty-string == iso-format
		if (!isString(dt)) {
			dt = dateFmt || ''
		}

		if (isArray(dt)) {
			tm = dt[1]
			dt = dt[0]
		}
	}
	if (!tm && timeFmt) {
		tm = timeFormats[timeFmt] || timeFmt
	}

	return mDate.format(tm ? `${dt} ${tm}` : dt)
}

export default formatDate
export { toMoment }
