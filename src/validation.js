import moment from 'moment'
import _ from 'lodash'

// import utils from './utils';

/**
 * @param {Object} opts     All necessary info and helpers to do validation
 * @returns {(Promise || Object)} Returns promise OR current errors
 */
function validateField( opts ) {
	// Necessary helper methods are passed in along with field name & value
	const {
		fieldName,
		config, // Used to read config.fields[fieldName]
		setState,
		getState,
		getAllData,
		//  thisInstance,   // Passed to validation functions
	} = opts

	// Ensure string-values are trimmed before validation
	const value = _.isString( opts.value ) ? _.trim( opts.value ) : opts.value

	const formErrors = getState( 'errors', { clone: true } )

	const fieldConfig = config.fields[fieldName] || {}
	let validation = fieldConfig.validation

	// if field validation is not configured, then nothing to do!
	if (!validation || _.isEmpty( validation )) {
		// Return a promise IF setState param was passed, otherwise same state
		return setState ? Promise.resolve() : formErrors
	}

	// If a validation function is specified, normalize to 'custom' key
	if (_.isFunction( validation )) {
		validation = { custom: validation }
	}

	let fieldErrors = _.clone( formErrors[fieldName] || {} )
	let errorsChanged = false

	// Check basic validators first and short-circuit if fail
	// Note that -0- (zero) IS VALID - use minNumber if need > 0
	const isBlankField = value === '' || _.isNil( value )

	// If field is blank set errorsChanged to notify the state has changed
	if (isBlankField) {
		errorsChanged = !_.isEmpty( fieldErrors )
		// Clear any field errors on the field
		fieldErrors = {}
	}

	// Validate required fields - clear error if no longer blank
	if (validation.required) {
		let error = false

		// Call 'custom' validation if specified
		if (_.isFunction( validation.required )) {
			error = !validation.required( value, fieldName, getAllData() )
		}
		else {
			error = isBlankField
		}

		// Add or remove the custom error based on response
		setError( 'required', !error, error )

		// If failed required test, then abort further validation
		if (error) {
			return finalizeValidation()
		}
	}

	// ABORT validation if field is blank/empty...
	if (isBlankField) {
		// ...EXCEPT for a custom validator, if one is set
		runCustomValidator()
		// Regardless of custom validator result, we are DONE
		return finalizeValidation()
	}

	// Validate the value 'dataType', if specified
	const type = validation.dataType || ''
	if (type) {
		// eslint-disable-next-line
		switch (type) {
			case 'text':
				setError( `type-${type}`, _.isString( value ) )
				break

			case 'number':
				setError( `type-${type}`, isNumber( value ) )
				break

			case 'integer':
				setError( `type-${type}`, isNumber( value, { integer: true } ) )
				break

			case 'boolean':
				setError( `type-${type}`, isBoolean( value ) )
				break

			case 'date':
				// if moment is able to parse it, then it's a valid date!
				setError( `type-${type}`, moment( value ).isValid() )
				break
		}
	}

	// Validate other preset validators
	_.forOwn( validation, ( opt, key ) => {
		// Convert numbers to strings for length testing
		const strValue = _.trim( value.toString() )

		/* eslint-disable default-case, no-fallthrough */
		// noinspection FallThroughInSwitchStatementJS
		switch (key) {
			case 'number':
				setError( key, isNumber( value ) )
				break

			case 'integer':
				setError( key, isNumber( value, { integer: true } ) )
				break

			case 'minLength':
				setError( key, _.gte( strValue.length, opt ), opt )
				break

			case 'maxLength':
				setError( key, _.lte( strValue.length, opt ), opt )
				break

			case 'exactLength':
				setError( key, strValue.length === opt, opt )
				break

			case 'minNumber':
				setError( key, _.gte( value, opt ) )
				break

			case 'maxNumber':
				setError( key, _.lte( value, opt ) )
				break

			case 'numberRange':
				setError( key, _.inRange( value, opt[0], opt[1] ), opt )
				break

			// TODO: Verify after we know what date format we are using
			case 'minDate':
				setError( key, _.gte( opt, value ) )
				break

			// TODO: Verify after we know what date format we are using
			case 'maxDate':
				setError( key, _.lte( opt, value ) )
				break

			case 'phone':
				setError( key, value.replace( /[^0-9]/g, '' ).length === 10 )
				break

			case 'email':
				setError( key, validateEmail( value ) )
				break

			// case 'address':
			//    TBD
		}
		/* eslint-enable default-case, no-fallthrough */
	} )

	// Call 'custom' validation if specified
	if (_.isFunction( validation.custom )) {
		const error = validation.custom( value, fieldName, getAllData() )
		// Add or remove the custom error based on response
		if (_.isString( error ) && error.length) {
			setError( 'custom', !error, '', error )
		}
		else {
			setError( 'custom', !error, error )
		}
	}

	// DONE - process the errors - return the setState promise
	return finalizeValidation()

	function runCustomValidator() {
		// Call 'custom' validation if specified
		if (_.isFunction( validation.custom )) {
			const error = validation.custom( value, fieldName, getAllData() )
			// Add or remove the custom error based on response
			// TODO: Test this code and refactor as needed
			console.log( { error } )
			if (error && error.length) {
				setError( 'custom', !error, '', error )
			}
			else {
				setError( 'custom', !error, '', error )
			}
		}
	}

	/**
	 * Subroutine to set or clear errors in fieldState
	 *
	 * @param {string} key          Validation key, eg: 'minNumber'
	 * @param {boolean} [isValid]   If true then REMOVE this error, if set
	 * @param {*} ruleValue         The rule settings for this validator
	 * @param {string} [errorMessage] Custom validator sends custom message
	 */
	function setError( key, isValid = false, ruleValue, errorMessage ) {
		// prettier-ignore
		if (!isValid) {
			// ADD errorMessage to state.form.errors.[fieldName].[errorKey]
			// Will use CUSTOM errorMessage (template) if one was passed
			const typeError = createErrorFromTemplate(
				key,
				ruleValue,
				errorMessage,
			)

			// If error is 'required', remove any others first
			if (key === 'required') {
				fieldErrors = {}
			}

			if (fieldErrors[key] !== typeError) {
				fieldErrors[key] = typeError
				errorsChanged = true
			}
		}
		else if (fieldErrors[key]) {
			delete fieldErrors[key]
			errorsChanged = true
		}
	}

	/**
	 * Helper method to process Error Message templates
	 *
	 * @param {string} key
	 * @param {*} [ruleValue]
	 * @param {string} [customTemplate]
	 * @returns {string}
	 */
	function createErrorFromTemplate( key, ruleValue, customTemplate ) {
		const template =
			customTemplate ||
			(fieldConfig.errorMessages || {})[key] ||
			config.errorMessages[key] ||
			config.errorMessages.unknown

		return template
		.replace( /^{name}/g, fieldConfig.displayName || 'This field' )
		.replace( /{name}/g, fieldConfig.displayName || 'this field' )
		.replace( /{value}/g, ruleValue || '' )
	}

	/**
	 * Subroutine to set the errors in component state
	 */
	function finalizeValidation() {
		// prettier-ignore
		// if field-errors is empty, remove the entire field-errors object
		if (_.isEmpty( fieldErrors )) {
			delete formErrors[fieldName]
		}
		else {
			// Attach the cloned fieldErrors - replace old value/object
			formErrors[fieldName] = fieldErrors
		}

		// prettier-ignore
		if (!errorsChanged) {
			return setState ? Promise.resolve() : formErrors
		}
		else {
			// Return promise that will resolve after state is update
			// When validating multiple fields, setState is not passed;
			// Instead just return the formErrors object
			return setState ? setState( `errors`, formErrors ) : formErrors
		}
	}
}

function isBoolean( value ) {
	return (
		_.isBoolean( value ) ||
		value === 0 ||
		value === 1 ||
		(_.isString( value ) && /^(|0|1|true|false|yes|no)$/.test( value ))
	)
}

function isNumber( value, opts = { integer: false, allowNegative: false } ) {
	if (_.isNumber( value )) {
		return testNumber( value )
	}

	if (_.isString( value )) {
		const num = Number( value ) // Note: NaN == false
		return num ? testNumber( num ) : false
	}

	// Only numbers and strings are acceptable values
	return false

	function testNumber( number ) {
		if (opts.integer && !_.isSafeInteger( number )) return false
		return opts.allowNegative ? true : number >= 0
	}
}

/**
 * Email validator taken from ReactNative email validator
 * NOTE that this may not handle highly abnormal email addresses!
 *
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail( email ) {
	// eslint-disable-next-line
	const re = /^\s*(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/
	return re.test( email.toLowerCase() )
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
	field: validateField,
}
