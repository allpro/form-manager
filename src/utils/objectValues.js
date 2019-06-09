/**
 * Helper methods used by FormManager; exported as an object of methods
 */
import {
	clone,
	cloneDeep,
	forOwn,
	isArray,
	isObject,
	isPlainObject,
	isUndefined,
	merge
} from './nodash'


function itemToArray( item ) {
	// Avoid creating an array with just an empty string or other falsey value
	if (!item) return []

	// ARRAY already - ASSUME has no nested arrays
	if (isArray( item )) return item

	// HASH value; like a field-errors object
	if (isPlainObject( item )) {
		let arrItems = [] // init, may change

		forOwn( item, value => {
			if (value && value.length) {
				if (isArray( value )) {
					arrItems = arrItems.concat(value)
				}
				else {
					arrItems.push( value )
				}
			}
		} )

		return arrItems
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
	forOwn( data, ( value, key ) => {
		if (value === '' || value === undefined) {
			data[key] = null
		}
	} )
}


/**
 * Convert a fieldName into an array of keys - may only be one key.
 * NOT exported - helper for get/setObjectValue methods
 *
 * @param {string} path
 */
function pathToKeysArray( path ) {
	// Dots delimit an 'object path'
	return isArray(path) ? path : path.split( '.' )
}

/**
 *
 * @param {Object} hash		Object to modify
 * @param {string} path		String-path like 'data/who/gender'
 * @param {Object} [opts]   Configuration options
 * @returns {*}				Value at specified path, or undefined if not found
 */
function getObjectValue( hash, path, opts ) {
	if (!hash || !isPlainObject(hash)) return undefined

	const getOpts = Object.assign({ cloneValue: false, deepClone: true }, opts)
	let branch = hash

	// If a path was passed, trace the path inside state.form
	if (path && path !== '/') {
		// Slash(es) in the path indicate that we should recurse downward
		const keys = pathToKeysArray( path )
		for (const key of keys) {
			// If branch is not an object, then cannot recurse; abort
			if (!isPlainObject(branch)) return undefined

			branch = branch[key]

			// If requested key not found, abort
			if (isUndefined( branch )) return undefined
		}
	}

	return !getOpts.cloneValue
		? branch
		: getOpts.deepClone
			? cloneDeep( branch )
			: clone( branch )
}

/**
 *
 * @param {Object} hash		Object to modify
 * @param {string} path		String-path like 'data/who/gender'
 * @param {*} value			Value - could be anything!
 * @param {Object} [opts]   Configuration
 * @returns {boolean}		True if value set; false if value is unchanged
 */
function setObjectValue( hash, path, value, opts ) {
	if (!hash || !isPlainObject(hash)) return undefined

	const setOpts = Object.assign({ cloneValue: false, merge: false }, opts)

	// If a path was passed, recurse into the object
	if (path && path !== '/') {
		const keys = pathToKeysArray( path )
		const lastIdx = keys.length - 1
		const lastKey = keys[lastIdx]
		let branch = hash

		// Recurse into data hash for name-paths like 'who/location/address1'
		for (let idx = 0; idx < lastIdx; idx++) {
			const key = keys[idx]
			const branchValue = branch[key]

			// Create a branch (hash) here if it doesn't exist yet
			// OVERWRITE any non-object value because path specifies it!
			if (!isPlainObject( branchValue )) {
				branch[key] = {}
			}

			// Update branch for next loop
			branch = branch[key]
		}

		const oldValue = branch[lastKey]

		// Check whether value has changed - ignore objects, assume changed
		if (!isObject(value) && value === oldValue) {
			return false // Value was NOT updated
		}

		// If passed value is undefined, then DELETE the specified path
		if (value === undefined) {
			delete branch[lastKey] // OK if key does not exist
			return !isUndefined(oldValue) // True IF a value existed before
		}

		// Write the passed value at end of the path (last branch)
		// Ignore any existing value - we do not merge data here.
		if (setOpts.merge && isPlainObject(branch[lastKey]) && isPlainObject(value)) {
			merge(branch[lastKey], setOpts.cloneValue ? clone( value ) : value)
		}
		// Set value at path specified; clone value to break byRef
		else {
			branch[lastKey] = setOpts.cloneValue ? clone( value ) : value
		}

		return true // Value was updated
	}
	else if (isPlainObject( path )) {
		// The path is an object (key/value pairs) to merge into hash-root
		merge( hash, setOpts.cloneValue ? cloneDeep( path ) : path )
		return true // Values were updated
	}
	else {
		console.warn(`FormManager: No path specified to set value: "${value}"`)
		return false // Value was NOT updated
	}
}


// Export as object with methods
// noinspection JSUnusedGlobalSymbols
export {
	emptyValuesToNull,
	itemToArray,
	getObjectValue,
	setObjectValue
}
