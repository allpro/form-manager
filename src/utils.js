/**
 * Helper methods used by FormManager; exported as an object of methods
 */
import _ from 'lodash'

function itemToArray( item ) {
	// Avoid creating an array with just an empty string or other falsey value
	if (!item) return []

	// ARRAY already
	if (_.isArray( item )) return item

	// HASH value; like a field-errors object
	if (_.isPlainObject( item )) {
		let arrErrors = [] // init, may change

		_.forOwn( item, value => {
			if (value && value.length) {
				if (_.isArray( value )) {
					Array.prototype.push( arrErrors, value )
				}
				else {
					arrErrors.push( value )
				}
			}
		} )

		return arrErrors
	}

	// STRING or OTHER item
	return [item]
}

/**
 * Change all empty-string and undefined values to Null.
 * Mutate the original object - caller should clone first if necessary.
 *
 * @param {Object} data
 */
const emptyValuesToNull = data => {
	_.forOwn( data, ( value, key ) => {
		if (value === '' || value === undefined) {
			data[key] = null
		}
	} )
}

const getChangedFields = ( src, cmp ) => {
	const simpleValue = val => {
		// Stringify Array and Hash values for simple comparison; rarely needed.
		if (_.isObjectLike( val )) return JSON.stringify( val )

		// Undefined and Null (aka Nil) are equal to "" for data comparison.
		if (_.isNil( val )) return ''

		return val
	}
	const equal = ( val1, val2 ) => simpleValue( val1 ) === simpleValue( val2 )

	// _.transform is a reduce over an object's key-value pairs
	return _.transform(
		cmp,
		( acc, val, key ) => (equal( src[key], val ) ? acc : _.set(
			acc,
			key,
			val,
		)),
		{},
	)
}

const trimFormFields = obj => {
	if (!_.isPlainObject( obj )) {
		return obj
	}

	// _.transform is a reduce over an object's key-value pairs
	return _.transform(
		obj,
		( acc, value, key ) => {
			if (_.isString( value )) {
				return _.set( acc, key, value.trim() )
			}
			else if (_.isPlainObject( value )) {
				return _.set( acc, key, trimFormFields( value ) )
			}
			else {
				return _.set( acc, key, value )
			}
		},
		{},
	)
}

// Export as object with methods
// noinspection JSUnusedGlobalSymbols
export default {
	emptyValuesToNull,
	itemToArray,
	getChangedFields,
	trimFormFields,
}

// Also export as individually named methods
export { emptyValuesToNull, itemToArray, getChangedFields, trimFormFields }
