// import forOwn from 'lodash/forOwn'
import clone from 'lodash/clone'
import map from 'lodash/map'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import trim from 'lodash/trim'
import forOwn from 'lodash/forOwn'

// import utils from './utils';


/**
 * @param {Object} opts        All necessary info and helpers for validation
 * @returns {Promise}        Returns promise OR current errors
 */
function validateField( opts ) {
	const {
		fieldName,		// Field to validate
		config,			// Read config.fields[fieldName] & config.validators
		stateOfErrors,	// Hash of existing field errors
		instanceAPI,	// Passed to custom validation functions
		triggerComponentUpdate
	} = opts

	return new Promise(resolve => {
		let { value } = opts

		// Shallow clone current field-errors hash to use as local object.
		// Lodash clone() returns an empty object if a non-object is passed.
		let fieldErrors = clone(stateOfErrors[fieldName]) || {}
		let errorsChanged = false

		// Ensure string-values are trimmed before processing
		if (isString(value)) value = trim(value)

		// const formErrors = stateOfErrors

		const validate = config.validators
		const convertTo = config.converters

		const fieldConfig = config.fields[fieldName] || {}
		let validation = fieldConfig.validation

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
		const isBlankField = value === '' || isNil(value)

		// If field is blank, set errorsChanged to notify that state has changed
		if (isBlankField) {
			errorsChanged = !isEmpty(fieldErrors)
			// Clear any field errors on the field
			fieldErrors = {}
		}


		const testPromises = [] // Used like Promise.all(validationPromises)
		const addTest = ( type, resp, ruleValue ) => {
			testPromises.push(
				promisify(resp)
				.then(() => handleValidatorResp( type, resp, ruleValue ))
			)
		}


		// Validate required fields - clear error if no longer blank
		if (validation.required) {
			let isError = false

			// Call 'custom' validation if specified
			// This test should always be synchronous so no promises needed.
			if (isFunction(validation.required)) {
				const resp = !validation.required(value, fieldName, instanceAPI)
				handleValidatorResp('required', resp)
				// Check to see if an error was just set
				isError = !!stateOfErrors['required']
				// isError = !validation.required(value, fieldName, instanceAPI)
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
			runCustomValidator()

			// Regardless of custom validator result, we are DONE
			return finalizeValidation()
		}


		// Check if a 'dataType' specified; coerce to correct type if possible
		const dataType = validation.dataType || ''
		if (dataType) {
			switch (dataType) {
				case 'text':
					value = convertTo.string(value)
					break

				case 'number':
					value = convertTo.number(value)
					break

				case 'integer':
					value = convertTo.integer(value)
					break

				case 'boolean':
					value = convertTo.boolean(value)
					break

				case 'dateObject':
					value = convertTo.dateObject(value)
					break

				case 'dateString':
					value = convertTo.dateString(value)
					break

				case 'dateISOString':
					value = convertTo.dateISOString(value)
					break

				default:
					// NOT a standard type so check for a custom converter
					if (convertTo[dataType]) {
						value = convertTo[dataType](value)
					}
			}
		}


		// Validate value against field.validation rules specified
		forOwn(validation, ( opt, type ) => {
			// Convert numbers to strings for length testing
			const strValue = trim(value.toString())

			switch (type) {
				case 'number':
					addTest(type, validate.number(value, opt), opt)
					break

				case 'integer':
					addTest(type, validate.integer(value, opt), opt)
					break

				case 'minLength':
					addTest(type, validate.minLength(strValue, opt), opt)
					break

				case 'maxLength':
					addTest(type, validate.maxLength(strValue, opt), opt)
					break

				case 'exactLength':
					addTest(type, validate.exactLength(strValue, opt), opt)
					break

				case 'minNumber':
					addTest(type, validate.minNumber(value, opt), opt)
					break

				case 'maxNumber':
					addTest(type, validate.maxNumber(value, opt), opt)
					break

				case 'numberRange':
					addTest(type, validate.numberRange(value, opt), opt)
					break

				case 'date':
					addTest(type, validate.date(value, opt), opt)
					break

				// TODO: Verify after we know what date format we are using
				case 'minDate':
					addTest(type, validate.minDate(value, opt), opt)
					break

				// TODO: Verify after we know what date format we are using
				case 'maxDate':
					addTest(type, validate.maxDate(value, opt), opt)
					break

				case 'phone':
					addTest(type, validate.phone(value, opt), opt)
					break

				case 'email':
					addTest(type, validate.email(value, opt), opt)
					break

				default:
					// NOT a standard type so check for a custom validator
					if (validate[type]) {
						addTest(`type-${type}`, validate[type](value))
					}
			}
		})

		// Lastly, call the 'custom' validation, if is specified
		runCustomValidator()

		// DONE - process the errors - return the setState promise
		return finalizeValidation()


		function runCustomValidator() {
			if (isFunction(validation.custom)) {
				addTest('custom', validation.custom(value, fieldName, instanceAPI))
			}
		}

		function handleValidatorResp(type, resp, ruleValue) {
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
		 * @param {string} type			Validation type, eg: 'minNumber'
		 * @param {boolean} [isValid]	If true then REMOVE this error, if set
		 * @param {*} ruleValue			The rule settings for this validator
		 * @param {(string|Array)} [errorMessage]  Custom validator message(s)
		 */
		function setError( type, isValid = false, ruleValue = '', errorMessage ) {
			// prettier-ignore
			if (!isValid) {
				// ADD errorMessage(s) to stateOfErrors.[fieldName].[errorKey]
				// Will use CUSTOM errorMessage (template) if one was passed
				let typeError = ''

				// MAY be an array of errors passed; handle that
				if (isArray(errorMessage)) {
					// noinspection JSValidateTypes
					typeError = map(errorMessage, msg => (
						createErrorFromTemplate(type, ruleValue, msg)
					))
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
		function createErrorFromTemplate( type, ruleValue, customTemplate ) {
			const template =
				customTemplate ||
				(fieldConfig.errorMessages || {})[type] ||
				config.errorMessages[type] ||
				config.errorMessages.unknown

			return template
			.replace(/^{name}/g, fieldConfig.displayName || 'This field')
			.replace(/{name}/g, fieldConfig.displayName || 'this field')
			.replace(/{value}/g, ruleValue || '')
		}


		/**
		 * Subroutine to set the errors in component state
		 */
		function finalizeValidation() {
			// WAIT for all validation tests to complete, then process and exit
			Promise.all(testPromises)
			.then(() => {
				const isFieldErrorFree = isEmpty(fieldErrors)

				// if field-errors is empty, remove the entire field-errors object
				if (isFieldErrorFree) {
					// If there is existing errors hash, then this is a change
					errorsChanged = !!stateOfErrors[fieldName]
					delete stateOfErrors[fieldName]
				}
				else if (errorsChanged) {
					// Add the cloned fieldErrors - replace old value/object
					stateOfErrors[fieldName] = fieldErrors
				}

				// Trigger component reload if something changed
				if (errorsChanged) triggerComponentUpdate()

				// Resolve promise so calling code knows we are done.
				resolve(isFieldErrorFree)
			})
		}
	})
}


function promisify( resp ) {
	const isValid = true // for clarity

	if (isFunction(resp.then)) {
		// Ensure any Promise error is caught so will subsequently resolve
		return resp.catch(() => isValid)
	}

	return Promise.resolve(resp)
}


export default validateField
