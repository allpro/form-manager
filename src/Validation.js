import assign from 'lodash/assign'
import clone from 'lodash/clone'
import cloneDeep from 'lodash/cloneDeep'
import defaultsDeep from 'lodash/defaultsDeep'
import forOwn from 'lodash/forOwn'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import map from 'lodash/map'
import trim from 'lodash/trim'

import utils from './utils'

// Extract utils for code brevity
const { itemToArray } = utils


/**
 * FormManager sub-component to handle form-field data
 *
 * @param {Object} formManager    FormManager instance object
 * @param {Object} components        Hash of FormManager sub-components
 * @returns {Object}                Config API for this instance
 * @constructor
 */
function Validation( formManager, components ) {
	// Auto-instantiate so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof Validation)) {
		return new Validation(formManager, components)
	}

	const { config, data, internal } = components

	// Extract helper methods from config for brevity
	const { aliasToRealName, withFieldDefaults } = config

	// Form-Errors cache - data accessible only via config methods
	let stateOfErrors = {}

	/**
	 * CONFIG API - provides simplified method names for internal functions
	 */
	return {
		// Methods used internally by FormManager components
		init,
		hasErrors,				// GETTER - does field OR form have errors
		getErrors,				// GETTER for stateOfErrors
		setErrors,				// SETTER for stateOfErrors
		clearErrors,			// SETTER - clears ALL errors for 1 field
		validate,				// ACTION for field OR form validation

		// Methods exposed in FormManager API
		publicAPI: {
			validate,			// ACTION for field OR form validation
			validateAll,		// ACTION for field OR form validation
			getErrors,			// GETTER for stateOfErrors
			setErrors,			// SETTER for stateOfErrors
			clearErrors,		// SETTER - clears ALL errors for 1 field
			hasErrors,			// GETTER - does field OR form have errors
			// ALIASES
			hasError: hasErrors,
			clearError: clearErrors,
			setError: setErrors,
			getError: getErrors,
			errors: getErrors
		}
	}


	/**
	 * Initialize form errors
	 */
	function init() {
		stateOfErrors = {} // In case called for a RESET
	}


	function getFormErrors( opts = { asArray: true } ) {
		// Iterate everything in state.form.error to create list of errors
		// Error data is in a hash so can include fieldNames
		const arrErrors = []

		forOwn(stateOfErrors, ( errors, fieldName ) => {
			if (errors && !isEmpty(errors)) {
				const error = {
					name: fieldName,
					errors: itemToArray(errors)
				}

				// Add aliasName & displayName to error from field-config
				const { aliasName, displayName } = config.getField(fieldName) || {}
				if (aliasName) error.aliasName = aliasName
				if (displayName) error.displayName = displayName

				arrErrors.push(error)
			}
		})

		// NOTE: Is an empty array if there are no field-error
		// Auto-join errors into a string if option passed
		return opts.asArray === false ? arrErrors.join('\n') : arrErrors
	}

	/**
	 * Helper for error methods to keep things DRY
	 */
	function getErrorsHash( fieldName ) {
		// NOTE that we do NOT support nested structure for errors, so...
		// A 'who/gender' field stores errors at: form.error['who/gender']
		// However the field data is NESTED at:	form.data.who.gender
		let fieldErrors = stateOfErrors[fieldName] || {}

		// If field-errors is a string, normalize it to a custom error
		if (isString(fieldErrors)) {
			fieldErrors = {
				custom: fieldErrors
			}
		}

		return fieldErrors
	}


	/**
	 * PUBLIC GETTER to fetch error(s) for a specific field.
	 * Errors are stored in a hash, which this converts to a simple array.
	 * Calling code can output message(s) using join() or iterate array.
	 *
	 * @param {string} name        Field-name or alias-name
	 * @param {Object} opts        Options for return value
	 * @returns {(string|Array)}
	 */
	function getErrors( name, opts = { asArray: false } ) {
		if (!name) {
			return getFormErrors()
		}

		// field MAY have an aliasName
		const fieldName = aliasToRealName(name)
		const fieldConfig = config.getField(fieldName)
		const errors = getErrorsHash(fieldName)

		// Iterate through all error-keys and combine errors into an array
		const arrErrors = itemToArray(errors)

		let returnAsString = withFieldDefaults(
			fieldConfig,
			'returnErrorsAsString'
		)
		// If a specific option was passed, it overrides field-configuration
		if (isBoolean(opts.asArray)) {
			returnAsString = !opts.asArray
		}

		// Auto-join errors into a string if related config option is set,
		return returnAsString
			? arrErrors.join('\n')
			: arrErrors
	}

	/**
	 * PUBLIC SETTER for 1 type of error on 1 field; can be an array of errors
	 * Note: Errors can only be set ONE FIELD AT A TIME
	 * Call this method multiple times to set errors on additional fields.
	 *
	 * @param {string} name                Field-name or alias-name
	 * @param {string} type                Type, eg: 'required', 'custom'
	 * @param {(Array|string)} errorMsg    Error-message text for this type
	 * @param {Object} opts                Merge options
	 */
	function setErrors( name, type, errorMsg, opts = {} ) {
		const setOpts = assign({ merge: true }, opts)
		const fieldName = aliasToRealName(name)
		let fieldErrors = setOpts.merge ? stateOfErrors[fieldName] || {} : {}

		// Field error values should be an array of messages, even if only one
		fieldErrors[type] = isString(errorMsg) ? [errorMsg] : errorMsg

		// Multiple error-types as hash keyed by type
		if (isPlainObject(errorMsg)) {
			assign(fieldErrors, cloneDeep(errorMsg))
		}
		else if (isArray(errorMsg)) {
			fieldErrors[type] = clone(errorMsg)
		}
		else {
			fieldErrors[type] = [errorMsg]
		}
	}


	/**
	 * PUBLIC SETTER for field errors - removes errors only
	 * Can remove for 1 field (string), multiple fields (Array) or all (blank)
	 *
	 * @param {(Array|string)} [name]        Field-name(s) and/or alias-name(s)
	 */
	function clearErrors( name ) {
		if (!name) {
			stateOfErrors = {}
		}
		else if (isArray(name)) {
			for (const n of name) {
				const fieldName = aliasToRealName(n)
				delete stateOfErrors[fieldName]
			}
		}
		else {
			const fieldName = aliasToRealName(name)
			delete stateOfErrors[fieldName]
		}
	}


	/**
	 * PUBLIC GETTER to check if a specific field has any errors
	 *
	 * @param {string} name        Field-name or alias-name
	 * @returns {boolean}
	 */
	function hasErrors( name ) {
		if (name) {
			const fieldName = aliasToRealName(name)
			const fieldErrors = stateOfErrors[fieldName]
			return !!fieldErrors && !isEmpty(fieldErrors)
		}
		else {
			return !isEmpty(stateOfErrors)
		}
	}


	/**
	 * @param {string} name            Field-name or alias-name
	 * @param {*} value                Field value to validate
	 * @param {string} [event]        Event that triggered this, eg: 'change'
	 * @returns {Promise<boolean>}    Validation can be async so returns a
	 *     promise
	 */
	function validate( name, value, event ) {
		if (!name || isPlainObject(name)) {
			return validateAll(name)
		}

		// field MAY have an aliasName
		const fieldName = aliasToRealName(name)
		const fieldConfig = config.getField(fieldName) || {}

		const forceValidation = event === 'validate'
		const suffixes = {
			blur: 'OnBlur',
			change: 'OnChange'
		}

		// If an event was passed, check to see if we should validate or not.
		// If not, then abort without doing validation
		if (event && !forceValidation) {
			const fieldHasErrors = hasErrors(fieldName)
			const prefix = fieldHasErrors ? 'revalidate' : 'validate'
			const suffix = suffixes[event]
			const isValidationEvent = withFieldDefaults(
				fieldConfig,
				`${prefix}${suffix}`
			)

			if (!isValidationEvent) {
				// ABORT by returning a resolved promise
				return Promise.resolve(!fieldHasErrors)
			}
		}

		// Return the validation promise - will return true if is-valid value
		return validateField(fieldName, value)
	}


	/**
	 * @param {Object} [opts]
	 * @returns {Promise<boolean>}
	 */
	function validateAll( opts = {} ) {
		const fields = config.getField()

		let only, skip

		if (opts && isPlainObject(opts)) {
			only = arrayToHash(opts.only, true)
			skip = arrayToHash(opts.ignore, true)
		}
		else if (opts && isArray(opts)) {
			only = arrayToHash(opts, true)
		}

		const fieldValidations = []

		forOwn(fields, ( field, fieldName ) => {
			// Skip fields if specified in opts
			if (only && !only[fieldName]) return
			if (skip && skip[fieldName]) return
			// Skip fields that are really form-state; those don't validate
			if (field.isData === false) return

			fieldValidations.push(
				validateField(fieldName, data.getValue(fieldName))
			)
		})

		// WAIT for all validations to complete, then resolve
		return Promise.all(fieldValidations)
		.then(() => {
			// Return Promise with true if NO errors; false otherwise
			const allFieldsErrorFree = isEmpty(stateOfErrors)
			return Promise.resolve(allFieldsErrorFree)
		})
	}


	/**
	 * @param {string} fieldName
	 * @param {*} value
	 * @returns {Promise}            Returns validation promise
	 */
	function validateField( fieldName, value ) {
		return new Promise(resolve => {
			let val = value

			// Shallow clone current field-errors hash to use as local object.
			// Lodash clone() returns an empty object if a non-object is passed.
			let fieldErrors = clone(stateOfErrors[fieldName]) || {}
			let errorsChanged = false

			// Ensure string-values are trimmed before processing
			if (isString(val)) val = trim(val)

			const validators = config.get('validators')

			const fieldConfig = config.getField(fieldName) || {}
			let { validation, errorMessages } = fieldConfig

			const messages = cloneDeep(errorMessages)
			defaultsDeep(messages, config.get('errorMessages'))

			// if field validation is not configured, then nothing to do!
			if (!validation || isEmpty(validation)) {
				return resolve(errorsChanged)
			}

			// If a validation function is specified, normalize to 'custom' type
			if (isFunction(validation)) {
				validation = { custom: validation }
			}

			// Check basic validators first and short-circuit if fail
			// Note that -0- (zero) IS VALID - use minNumber if need > 0
			// noinspection JSValidateTypes
			const isBlankField = val === '' || isNil(val)

			// If field is blank, set errorsChanged to notify that state has
			// changed
			if (isBlankField) {
				errorsChanged = !isEmpty(fieldErrors)
				// Clear any field errors on the field
				fieldErrors = {}
			}


			const testPromises = [] // Used like Promise.all(validationPromises)
			const addTest = ( type, resp, ruleValue ) => {
				testPromises.push(
					promisify(resp)
					.then(() => handleValidatorResp(type, resp, ruleValue))
				)
			}


			// Validate required fields - clear error if no longer blank
			const required = validation.required
			if (required) {
				let isError = false

				// Call 'custom' validation if specified
				// This test should always be synchronous so no promises needed.
				if (isFunction(required)) {
					const resp = !required(
						val,
						fieldName,
						messages['required'] || '',
						formManager
					)
					handleValidatorResp('required', resp)
					// Check to see if an error was just set
					isError = !!stateOfErrors['required']
				}
				else {
					isError = isBlankField
				}

				// Add or remove the custom error based on response.
				setError('required', !isError, isError)

				// If failed required test then abort all further validation
				if (isError) {
					return finalizeValidation()
				}
			}

			// ABORT validation if field is blank/empty...
			if (isBlankField) {
				// ...EXCEPT for a custom validator, if one is set
				runValidatorFunction('custom')

				// Regardless of custom validator result, we are DONE
				return finalizeValidation()
			}

			// Validate value against field.validation rules specified
			forOwn(validation, ( opt, type ) => {
				// Check for a validation function
				if (isFunction(opt)) {
					runValidatorFunction(type)
				}
				// Else look for a standard validator with this type-name
				else if (validators[type]) {
					addTest(
						type,
						validators[type](
							val,
							opt, // Pass validation option; may just be 'true'
							fieldName,
							messages[type] || '',
							formManager
						),
						opt
					)
				}
			})

			// DONE - process the errors - return the setState promise
			return finalizeValidation()


			// === SUBROUTINES ===

			function runValidatorFunction( type ) {
				const fn = validation[type]
				const typeMessages = messages[type] || ''
				if (isFunction(fn)) {
					addTest(type, fn(val, fieldName, typeMessages, formManager))
				}
			}

			function handleValidatorResp( type, resp, ruleValue ) {
				// Add or remove error-type based on response
				if (isBoolean(resp)) {
					setError(type, resp, ruleValue)
				}
				else if (isString(resp) || isArray(resp)) {
					// Consider empty-string OR empty-array as no-error
					if (!resp.length) {
						setError(type, true)
					}
					else {
						setError(type, false, ruleValue, resp)
					}
				}
				else {
					// Consider any other type of response as inValid
					// Either configured or default error-message applies
					setError(type, false, ruleValue)
				}
			}

			/**
			 * Subroutine to set or clear errors in stateOfErrors
			 *
			 * @param {string} type       Validation type, eg: 'minNumber'
			 * @param {boolean} [isValid] If true then REMOVE this error, if set
			 * @param {*} [ruleValue]     The rule settings for this validator
			 * @param {(string|Array)} [errorMessage]  Custom validator message
			 */
			function setError( type, isValid, ruleValue = '', errorMessage ) {
				if (!isValid) {
					// ADD errorMessage(s) to
					// stateOfErrors.[fieldName].[errorKey] Will use CUSTOM
					// errorMessage (template) if one was passed
					let typeError = ''

					// MAY be an array of errors passed; handle that
					if (isArray(errorMessage)) {
						// noinspection JSValidateTypes
						typeError = []
						map(errorMessage, msg => {
							// Ignore blank items in errorMessage array
							if (msg) {
								typeError.push(
									createErrorFromTemplate(
										type,
										ruleValue,
										msg
									)
								)
							}
						})
					}
					else {
						typeError = createErrorFromTemplate(
							type,
							ruleValue,
							errorMessage
						)
					}

					// If error is 'required', remove all other errors first
					if (type === 'required') {
						fieldErrors = {}
					}

					if (fieldErrors[type] !== typeError) {
						fieldErrors[type] = typeError
						errorsChanged = true
					}
				}
				else if (fieldErrors[type]) {
					delete fieldErrors[type]
					errorsChanged = true
				}
			}

			/**
			 * Helper method to process Error Message templates
			 *
			 * @param {string} type
			 * @param {*} [ruleValue]
			 * @param {string} [customTemplate]
			 * @returns {string}
			 */
			function createErrorFromTemplate(
				type,
				ruleValue,
				customTemplate
			) {
				const { displayName } = fieldConfig
				const nil = v => isNil(v) ? '' : v

				let template = customTemplate || messages[type] || messages.unknown

				// Messages can be a hash of multiple messages, eg: 'password'
				if (isPlainObject(template)) {
					template = template.default || messages.unknown
				}

				// A template can be a function for more advanced formatting
				if (isFunction(template)) {
					return template(displayName, ruleValue)
				}

				let message = template
				.replace(/^{name}/, displayName || 'This field')
				.replace(/{name}/g, displayName || 'this field')
				.replace(/{value}/g, nil(ruleValue))

				if (isArray(ruleValue)) {
					message = message
					.replace(/{value1}/g, nil(ruleValue[0]))
					.replace(/{value2}/g, nil(ruleValue[1]))
				}

				return message
			}

			/**
			 * Subroutine to set the errors in stateOfErrors
			 */
			function finalizeValidation() {
				// WAIT for all validation tests to complete, then process and
				// exit
				Promise.all(testPromises)
				.then(() => {
					const isFieldErrorFree = isEmpty(fieldErrors)

					// if field-errors is empty, remove the entire field-errors
					// object
					if (isFieldErrorFree) {
						// If there is existing errors hash, then this is a
						// change
						errorsChanged = !!stateOfErrors[fieldName]
						delete stateOfErrors[fieldName]
					}
					else if (errorsChanged) {
						// Add the cloned fieldErrors - replace old value/object
						stateOfErrors[fieldName] = fieldErrors
					}

					// Trigger component reload if something changed
					if (errorsChanged) internal.triggerComponentUpdate()

					// Resolve promise so calling code knows we are done.
					resolve(isFieldErrorFree)
				})
			}
		})
	}


	function promisify( resp ) {
		const isValid = true // for clarity

		if (resp && isFunction(resp.then)) {
			// Ensure any Promise error is caught so will subsequently resolve
			return resp.catch(() => isValid)
		}

		return Promise.resolve(resp)
	}

	/**
	 * Convert array to hash with 'true' values for easier value check
	 */
	function arrayToHash( arr, isFieldNames = false ) {
		if (!isArray(arr)) return arr

		const hash = {}
		for (let value of arr) {
			// Handle alias fieldNames in array
			if (isFieldNames) value = aliasToRealName(value)
			hash[value] = true
		}
		return hash
	}
}

export default Validation
