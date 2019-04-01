import assign from 'lodash/assign'
import clone from 'lodash/clone'
import cloneDeep from 'lodash/cloneDeep'
import defaults from 'lodash/defaults'
import defaultsDeep from 'lodash/defaultsDeep'
import forOwn from 'lodash/forOwn'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isObjectLike from 'lodash/isObjectLike'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import isPlainObject from 'lodash/isPlainObject'
import map from 'lodash/map'
import merge from 'lodash/merge'
// Alias validateField because we use an intermediate method with same name
import performFieldValidation from './validateField'
import defaultValidators from './validators'
import defaultFormatters from './formatters'
import defaultConverters from './converters'
import defaultFormConfig from './defaultFormConfig'
import defaultFieldConfig from './defaultFieldConfig'
import defaultErrorMessages from './defaultErrorMessages'
import utils from './utils'

// Re-export tools for testing
export { default as FieldsTestOutput } from './tools/FieldsTestOutput'
export { default as logFormData } from './tools/logFormData'

// Re-export utils?
// export * from './utils'

const defaultFormState = {
	// TODO: need to track load-values so know if current value is the same
	// isDirty:		false,	// true if ANY field has changed
	// hasErrors:	false,	// true if ANY field has an error
	// Standard FormControl state keys
	// dirty:		false,
	// adornedStart:	false,
}


/**
 * Helper for managing form data, error, validation, etc.
 * Uses component.state to store form data, with getter/setter methods
 *
 * @param {(Object|Function)} componentObject    Class OR Hook setState method
 * @param {Object} [options]        Initial configuration of form
 * @param {Object} [extraData]            Data passed in at instantiation
 * @returns {Object}                    Returns API for this instance
 * @constructor
 */
function FormManager( componentObject, options = {}, extraData ) {
	// Auto-instantiate instanceAPI so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof FormManager)) {
		return new FormManager(componentObject, options, extraData)
	}

	// MUST assign to var to create closure and retain pointer to Container
	// JS does NOT maintain 'arguments' in closure the same as it does vars
	// Before adding this var, the 'Container' arg could become undefined
	// const setComponentState = componentObject

	let stateOfForm = cloneDeep(defaultFormState)
	let stateOfData = {}
	let stateOfErrors = {}

	// Init form-configuration using passed options
	const config = cloneDeep(options)

	// Local alias for formatters object
	const format = config.formatters

	let stateInitialized = false

	// INIT FormManager
	initFormConfiguration()
	initFormData(extraData)

	let formManagerIndex = 0

	stateInitialized = true

	// noinspection JSUnusedGlobalSymbols
	/**
	 * PUBLIC API - provides simplified method names for internal functions
	 * Methods are accessed like: form.value('name'), form.validate('address')
	 * Assigned to instanceAPI variable so can pass this API to callbacks
	 */
	const instanceAPI = {
		reset: resetForm, // Method to reset form data, errors & state.

		// The field-config is exposed, but should rarely be needed
		fieldConfig: publicFieldConfig, // SETTER/GETTER for field-configuration
		setFieldValidation, // SETTER for easy validation changes
		setFieldIsRequired, // SETTER for easy 'required' changes

		// Validation can be triggered manually, for one or all fields
		validate: validateField, // ACTION for field OR form validation

		// Form-level setters/getters
		state: formState,		// SETTER/GETTER for stateOfForm
		data: formData,			// SETTER/GETTER for stateOfData
		errors: getFieldErrors,	// GETTER for field OR form errors
		getFieldErrors,			// GETTER for field OR form errors
		setFieldError,			// SETTER for ONE error on 1 field
		setFieldErrors,			// SETTER for MULTIPLE errors on 1 field
		clearFieldErrors,		// SETTER - clears ALL errors for 1 field
		hasErrors: doesItemHaveErrors, // CHECK if field OR form has errors

		// Methods used when writing form component props
		value: publicFieldValue, // SETTER/GETTER for 1 field-value
		values: setFieldValues, // SETTER for MULTIPLE field-values

		dataProps: getDataProps, // HELPER for writing component props
		errorProps: getErrorProps, // HELPER for writing component props
		allProps: getAllProps, // HELPER for writing component props

		onFieldChange, // HANDLER for component.onChange
		onFieldFocus, // HANDLER for component.onFocus
		onFieldBlur // HANDLER for component.onBlur
	}

	// RETURN THE PUBLIC API
	return instanceAPI


	/**
	 * Method to trigger a setState action in React component
	 */
	function triggerComponentUpdate() {
		// Trigger a re-render only if component has been initialized
		if (stateInitialized) {
			// Increment unique index used as component-state value
			formManagerIndex++

			// noinspection JSUnresolvedVariable
			if (componentObject.setState) {
				// Class method
				componentObject.setState({ formManagerIndex })
			}
			else {
				// Hook setFormState method (or whatever its name is!)
				componentObject(formManagerIndex)
			}
		}
	}


	/**
	 * PUBLIC METHOD to reset form data, errors & state.
	 * Does not reinitialize or reset field configuration.
	 * Does not remove any handlers or data bound after creation.
	 *
	 * @param {Object} [data]
	 */
	function resetForm( data ) {
		// RE-INIT all state-hashes
		stateOfForm = cloneDeep(defaultFormState)
		stateOfData = {}
		stateOfErrors = {}

		initFormData(data)
	}

	/**
	 * Initialize form data, state and errors using only the config-options
	 *
	 * @param {Object} [data]
	 */
	function initFormData( data ) {
		const { initialState, initialData, initialErrors } = options

		// INITIAL-DATA - data is optional arg passed at instance creation
		if (initialData) {
			setFormData(initialData)
		}
		if (data) {
			setFormData(data)
		}

		// INITIAL-ERRORS
		if (initialErrors && isPlainObject(initialErrors)) {
			forOwn(initialErrors, ( errors, fieldName ) => {
				// noinspection JSIgnoredPromiseFromCall
				setFieldErrors(fieldName, errors)
			})
		}

		// INITIAL-STATE - can be anything!
		if (initialState && isPlainObject(initialState)) {
			forOwn(initialState, ( value, key ) => {
				setFormState(key, value)
			})
		}
	}


	/**
	 * Initialization method to set internal configuration.
	 * NOTE that config.fields can be an array OR a hash keyed by fieldname.
	 */
	function initFormConfiguration() {
		if (!options) return // nothing to process!

		const configRootKeys = [
			'onChange',
			'onBlur'
		]
		// Copy options in the config root
		for (const key of configRootKeys) {
			if (!isUndefined(options[key])) {
				config[key] = options[key]
			}
		}

		defaultsDeep(config, defaultFormConfig)
		defaults(config.formatters, defaultFormatters)
		defaults(config.validators, defaultValidators)
		defaults(config.converters, defaultConverters)
		defaults(config.errorMessages, defaultErrorMessages)

		// IGNORE any config.fieldAliasMap data specified by user;
		// This will be autogenerated by setFieldConfig()
		config.fieldAliasMap = {}

		// Now configure all the form-fields
		setFieldsConfig(options.fields)
	}


	/**
	 * PUBLIC SETTER & GETTER for field-config(s).
	 * If no args passed, returns clone of all fields config
	 * If only a fieldName (string) passed, returns that field's config.
	 * Otherwise is a setter for one or more field-config.
	 * Accepts an array -or- hash keyed by fieldname to set multiple fields.
	 *
	 * NOTE: fieldConfig is a var-name so method uses a special internal name.
	 *
	 * @param {(string|Array|Object)} [name]
	 * @param {(Object|Array|string)} [data]
	 * @param {Object} [opts]    Option for merging with existing config
	 * @returns {Object}        Returns fieldConfig, even when is a SETTER
	 */
	function publicFieldConfig(name, data, opts = {}) {
		const hasFieldName = isString(name)
		const fieldName = hasFieldName ? verifyFieldName(name) : ''

		// 2nd & 3rd arguments shift if 'name' (string) is not passed
		const configData = hasFieldName ? data : name
		const configOpts = hasFieldName ? opts : data

		// GETTER for one -or- all fields
		if (!configData) {
			return getFieldConfig(fieldName)
		}

		if (fieldName) configOpts.fieldName = fieldName
		const returnData = setFieldsConfig( configData, configOpts )

		// Configuration may change how fields display, so update component
		triggerComponentUpdate()

		return returnData
	}

	/**
	 * Get field-config for ONE-OR-MORE FIELDS
	 *
	 * @param {string} [name]
	 * @returns {Object}	Returns fieldConfig for one -or- all fields
	 */
	function getFieldConfig( name ) {
		const fieldName = verifyFieldName(name)
		const fields = config.fields
		return cloneDeep(fieldName ? fields[fieldName] : fields)
	}

	/**
	 * Set field-config for ONE-OR-MORE FIELDS; merge or replace
	 *
	 * @param {(Object|Array|string)} [data]
	 * @param {Object} [opts]	Option for merging with existing config
	 * @returns {Object}		Returns fieldConfig, even when is a SETTER
	 */
	function setFieldsConfig( data, opts = {} ) {
		// MULTIPLE FIELD-CONFIGS AS ARRAY
		if (isArray(data)) {
			return data.map(
				fieldConfig => setFieldConfig(fieldConfig, opts))
		}

		// NOTE: Also handle scenario like: fieldName == 'name'
		if (isPlainObject(data)) {
			const name = data['name'] || opts.fieldName
			const isSingleField = name && !isPlainObject(name)

			if (isSingleField) {
				// SETTER - HASH IS CONFIG FOR A SINGLE FIELD
				return setFieldConfig(data, opts)
			}
			else {
				// SETTER - MULTIPLE FIELD-CONFIGS AS HASH KEYED BY FIELDNAMES
				// IS A HASH KEYED BY FIELDNAMES
				const { replace } = opts
				return map(data, ( fieldConfig, fieldName ) =>
					setFieldConfig(fieldConfig, { replace, fieldName })
				)
			}
		}
	}

	/**
	 * Set field-config for a SINGLE FIELD; merge or replace
	 *
	 * @param {(Object|Array|string)} [data]
	 * @param {Object} [opts]    Option for merging with existing config
	 * @returns {Object}         Returns fieldConfig, even when is a SETTER
	 */
	function setFieldConfig( data, opts = { replace: false, fieldName: '' } ) {
		const fieldName = verifyFieldName(data['name'] || opts.fieldName)
		const fields = config.fields
		let fieldConfig = fields[fieldName]

		// INIT fieldConfig if not exists, OR opts.replace specified
		if (!fieldConfig || opts.replace) {
			fieldConfig = fields[fieldName] = cloneDeep(defaultFieldConfig)
		}
		else {
			defaultsDeep(fieldConfig, defaultFieldConfig)
		}

		// Merge the new configuration data; in case this is an 'update'
		merge(fieldConfig, data)

		// ensure field.name is set - may have been passed as opts.fieldName
		fieldConfig.name = fieldName

		if (fieldConfig.aliasName) {
			config.fieldAliasMap[fieldConfig.aliasName] = fieldName
		}

		return fieldConfig
	}


	/**
	 * PUBLIC SETTER/GETTER for values in the ROOT of state
	 *
	 * @param {(Object|string)} key        Fieldname OR a hash of data to set
	 * @param {*} [value]                Value to SET, if key is a string
	 * @param {Object} [opts]
	 * @returns {*}
	 */
	function formState( key, value, opts = { cloneValue: true } ) {
		// GETTER - Return shallow clone of ALL state, MINUS 'data' and 'errors'
		if (!key || (isString(key) && isUndefined(value))) {
			return getFormState(key, opts)
		}
		// SETTER
		else {
			setFormState(key, value)
			triggerComponentUpdate()
		}
	}

	/**
	 * @param {string} [key]
	 * @param {Object} opts        Clone-value option
	 * @returns {*}                All form-state OR just specific key requested
	 */
	function getFormState( key, opts ) {
		// If a key is passed, then return value for just that, if exists
		if (key) return utils.getObjectValue(stateOfForm, key, opts)

		// Return a deep clone to ensure state cannot be mutated
		return cloneDeep(stateOfForm)
	}

	/**
	 * @param {(Object|string)} key        Fieldname OR a hash of data to set
	 * @param {*} [value]                Value to SET, if key is a string
	 * @param {Object} [opts]            Options, like { clone: true }
	 */
	function setFormState( key, value, opts = { cloneValue: true } ) {
		utils.setObjectValue(stateOfForm, key, value, opts)
	}


	/**
	 * PUBLIC SETTER for setting multiple field values
	 *
	 * @param {Object} data        Hash of Field-name/value pairs
	 */
	function setFieldValues( data ) {
		forOwn(data, ( value, name ) => {
			setFieldValue(name, value)
		})
	}

	/**
	 * Set the value of one field
	 *
	 * @param {string} name        Field-name or alias-name
	 * @param {*} value            New value for specified fieldName
	 * @param {string} [event]    Name of event that triggered this (eg:
	 *     'change')
	 * @returns {Object}
	 */
	function setFieldValue( name, value, event ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const fieldConfig = config.fields[fieldName]
		let newValue = value

		// Field may NOT have a configuration...
		if (fieldConfig) {
			const isDataField = !fieldConfig || fieldConfig.isData
			const fieldValidation = fieldConfig ? fieldConfig.validation : {}
			const dataType = fieldValidation.dataType

			newValue = coerceDataType(value, dataType)

			// if (fieldValidation.phone) {
			// 	// Normalize phone-numbers to "[0-][000-]000-0000"
			// 	newValue = format.phone( value )
			// }

			if (!isDataField) {
				setFormState(fieldName, newValue)
				triggerComponentUpdate()
				return
			}
		}

		// Method will return false if newValue is same as existing value
		const valueSet = utils.setObjectValue(
			stateOfData,
			fieldName,
			value,
			{ cloneValue: true }
		)

		triggerComponentUpdate()

		if (event) {
			if (fieldConfig) {
				// A validation event MAY trigger validation & callback.
				// Validation may or may not run, depending on event-type.
				// Validation CAN BE async, so method always returns a promise.
				// NOTE: Validate even if value unchanged; may be first event!
				validateField(fieldName, newValue, event)
				.then(() => {
					// If field value was changed, then fire events
					if (event === 'change' && valueSet) {
						fireEventCallback(fieldConfig.onChange, value, name)
						fireEventCallback(config.onChange, value, name)
					}
				})
			}
			else if (event === 'change' && valueSet) {
				// Just fire form-level onChange, if one exists
				fireEventCallback(config.onChange, value, name)
			}
		}
	}

	function getFieldValue( fieldName, opts = { cleanValue: false } ) {
		const fieldConfig = config.fields[fieldName] || {}
		const fieldValidation = fieldConfig.validation || {}
		const isData = fieldConfig.isData !== false
		const state = isData ? stateOfData : stateOfForm

		let value = utils.getObjectValue(
			state,
			fieldName,
			{ clone: true }
		)
		// Clean value here, if requested
		if (opts.cleanValue) {
			value = cleanFieldValue(value, fieldConfig)
		}

		return undefinedToDefaultValue(value, fieldValidation.dataType)
	}

	/**
	 * PUBLIC SETTER & GETTER for a specific field value.
	 *
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]    Options
	 * @param {*} [value]
	 */
	function publicFieldValue( name, value, opts = { cleanValue: false, validate: false } ) {
		const fieldName = verifyFieldName(name)

		// SETTER - Note that 0 and empty strings ARE 'values' to set
		if (value !== undefined) {
			// If opts.validate, use 'validate' event to force validation;
			//	otherwise consider this a standard 'change' event.
			const event = opts.validate ? 'validate' : 'change'
			setFieldValue( name, value, event )
		}
		// GETTER
		else {
			return getFieldValue(fieldName, opts)
		}
	}


	/**
	 * PUBLIC SETTER/GETTER for form data
	 *
	 * @param {Object} [data]    Data to 'set' OR 'get' options
	 */
	function formData( data ) {
		// There is only a single possible 'option', so check for it
		return isPlainObject(data) && isUndefined(data.cleanData)
			? setFormData(data)
			: getFormData(data)
	}

	/**
	 * @param {Object} data        Data to be set
	 */
	function setFormData( data ) {
		if (isPlainObject(data) && !isEmpty(data)) {
			forOwn(data, ( value, name ) => {
				const fieldName = verifyFieldName(name)
				const field = config.fields[fieldName]

				if (!field || field.isData !== false) {
					setFieldValue(fieldName, value)
				}
				else {
					setFormState(fieldName, value)
				}
			})

			triggerComponentUpdate()
		}
	}

	/**
	 * @param {Object} [opts]    Options (cleanData)
	 * @returns {Object}        Data in JSON format, ready to POST to server
	 */
	function getFormData( opts = { cleanData: true } ) {
		// Clone data so we don't mutate original object
		let data = clone(stateOfData)

		// Handle option to bypass automatic data-cleaning
		if (opts.cleanData) {
			data = cleanData(data)
		}

		return data
	}


	/**
	 * Clean field-value as specified in field options.
	 * Processes only the top-level of data object; no recursion.
	 *
	 * @param {Object} originalData        Likely form.data(), but can be
	 *     anything
	 * @param {Object} [opts]            Options
	 */
	function cleanData( originalData, opts = { clone: false } ) {
		const data = opts.clone ? clone(originalData) : originalData

		forOwn(data, ( value, name ) => {
			if (!value) return

			const fieldConfig = config.fields[name] || {}
			data[name] = cleanFieldValue(value, fieldConfig)
		})

		return data
	}

	function cleanFieldValue( value, fieldConfig ) {
		// Only string values are cleaned
		if (!value || !isString(value)) return value

		const trimText = withFieldDefaults(fieldConfig, 'trimText')
		const fixMultiSpaces = withFieldDefaults(fieldConfig, 'fixMultiSpaces')
		const monoCaseToProper = withFieldDefaults(fieldConfig, 'monoCaseToProper')

		let val = value
		if (trimText) val = val.trim()
		if (fixMultiSpaces) val = val.replace(/\s+/g, ' ')
		if (monoCaseToProper) val = format.properCase(val, true)

		return val
	}

	function coerceDataType( value, dataType ) {
		// Coerce value if a dataType is specified
		if (dataType && config.converters[dataType]) {
			return config.converters[dataType](value)
		}
		return value
	}


	function getFormErrors( opts = { asArray: true } ) {
		// Iterate everything in state.form.errors to create list of errors
		// Error data is in a hash so can include fieldNames
		const arrErrors = []

		forOwn(stateOfErrors, ( errors, fieldName ) => {
			if (errors && !isEmpty(errors)) {
				// get field-config so we can add displayName to data
				const fieldConfig = config.fields[fieldName]

				arrErrors.push({
					name: fieldName,
					alias: fieldConfig.aliasName || fieldName,
					display: fieldConfig.displayName, // undefined if not set
					errors: utils.itemToArray(errors)
				})
			}
		})

		// NOTE: Is an empty array if there are no field-error
		// Auto-join errors into a string if option passed
		return opts.asArray === false ? arrErrors.join('\n') : arrErrors
	}

	/**
	 * Helper for error methods to keep things DRY
	 */
	function getFieldErrorsHash( fieldName ) {
		// NOTE that we do NOT support nested structure for errors, so...
		// A 'who/gender' field stores errors at: form.errors['who/gender']
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
	 * Public method to fetch error(s) for a specific field.
	 * Errors are stored in a hash, which we convert to a simple array.
	 * Calling code can output message(s) using join() or iterate array.
	 *
	 * @param {string} name        Field-name or alias-name
	 * @param {Object} opts        Options for return value
	 * @returns {(string|Array)}
	 */
	function getFieldErrors( name, opts = { asArray: false } ) {
		if (!name) {
			return getFormErrors()
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const fieldConfig = config.fields[fieldName]
		const errors = getFieldErrorsHash(fieldName)

		// Iterate through all error-keys and combine errors into an array
		const arrErrors = utils.itemToArray(errors)

		let returnAsString = withFieldDefaults(fieldConfig, 'returnErrorsAsString')
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
	 * PUBLIC SETTER for ONE field error, by fieldName
	 *
	 * @param {string} name        Field-name or alias-name
	 * @param {string} type        Validation type, eg: 'required', 'custom'
	 * @param {string} message    Error-message text for this type
	 * @param {Object} opts        Merge options
	 */
	function setFieldError( name, type, message, opts = { merge: true } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const curErrMsg = utils.getObjectValue(
			stateOfErrors,
			`${fieldName}/${type}`
		)

		// Skip update if this error-message is already set
		if (curErrMsg !== message) {
			setFieldErrors(name, { [type]: message || '' }, opts)
		}
	}

	/**
	 * PUBLIC SETTER for field errors in form.errors; keyed by fieldName.
	 * This hash is a single-level, unlike data, eg:form.errors.'key/subkey'.
	 * If errors is falsey or an empty array, current errors will be cleared.
	 *
	 * @param {string} name                    Name or aliasName of field
	 * @param {(Object|Array|string|boolean|null)} [errors]
	 * @param {Object} opts                    Merge options
	 */
	function setFieldErrors( name, errors, opts = { merge: false } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)

		// Any falsey value means clear all field errors
		if (!errors) {
			delete stateOfErrors[fieldName]
		}
		else {
			// TODO: Verify this is correct handling for non-object 'errors'
			// Normalize custom error to a hash
			const newErrors = !isPlainObject(errors)
				? { custom: errors }
				: errors

			// MERGE FIELD ERRORS
			if (opts.merge) {
				const fieldErrors = stateOfErrors[fieldName] || {}

				// Shallow-merge new error(s) into errors hash
				assign(fieldErrors, newErrors)

				// Set NEW fieldErrors object
				stateOfErrors[fieldName] = fieldErrors
			}
			// REPLACE FIELD ERRORS - clone to break byRef connection
			else {
				stateOfErrors[fieldName] = clone(newErrors)
			}
		}
	}

	/**
	 * PUBLIC SETTER for field errors - remove errors only
	 *
	 * @param {(Array|string)} [name]        Field-name(s) and/or alias-name(s)
	 */
	function clearFieldErrors( name ) {
		if (!name) {
			stateOfErrors = {}
		}
		else if (isArray(name)) {
			map(name, setFieldErrors)
		}
		else {
			setFieldErrors(name)
		}
	}

	/**
	 * PUBLIC GETTER to check if a specific field has any errors
	 *
	 * @param {string} name        Field-name or alias-name
	 * @returns {boolean}
	 */
	function doesItemHaveErrors( name ) {
		if (name) {
			const fieldName = verifyFieldName(name)
			const fieldErrors = stateOfErrors[fieldName]
			return !!fieldErrors && !isEmpty(fieldErrors)
		}
		else {
			return !isEmpty(stateOfErrors)
		}
	}


	/**
	 * PUBLIC SETTER for changing field(s) validation options easily
	 *
	 * @param {(Array|string)} name        Fieldname (or array of), for mass
	 *     update
	 * @param {Object} validationConfig New Validation setting(s)
	 * @param {Object} [opts]            Option for merging with existing
	 *     config
	 * @returns {*}                        Validation-config if for 1 field
	 *     only
	 */
	function setFieldValidation(
		name,
		validationConfig,
		opts = { merge: false }
	) {
		// Allow passing an array of fieldnames to set them all the same
		// This is useful for setting multiple fields required/not-required
		if (isArray(name)) {
			return name.map(fieldName =>
				setFieldValidation(fieldName, validationConfig, opts)
			)
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const field = config.fields[fieldName] || {}

		// ensure field config exists
		if (!field) return

		if (opts.merge && field.validation) {
			merge(field.validation, validationConfig)
		}
		else {
			field.validation = clone(validationConfig)
		}

		return field.validation
	}

	/**
	 * PUBLIC SETTER for dynamically setting 'required' flag for validation.
	 * This may be a common need for multi-part forms or conditional fields.
	 *
	 * @param {(Array|string)} name    Fieldname (or array of), for mass update
	 * @param {boolean} require        Is this field(s) required?
	 * @returns {*}                    Returns new validation if a single name
	 */
	function setFieldIsRequired( name, require = true ) {
		return setFieldValidation(
			name,
			{ required: !!require },
			{ merge: true }
		)
	}


	/**
	 * @param {string} name        Field-name or alias-name
	 * @param {*} value            Field value to validate
	 * @param {string} [event]    Name of event that triggered this, eg:
	 *     'change'
	 * @returns {Promise}        Validation can be async so returns a promise
	 */
	function validateField( name, value, event ) {
		if (!name || isObjectLike(name)) {
			return validateAllFields(name)
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const fieldConfig = config.fields[fieldName] || {}

		const forceValidation = event === 'validate'
		const suffixes = {
			blur: 'OnBlur',
			change: 'OnChange'
		}

		// If an event was passed, check to see if we should validate or not.
		// If not, then abort without doing validation
		if (event && !forceValidation) {
			const hasErrors = doesItemHaveErrors(fieldName)
			const prefix = hasErrors ? 'revalidate' : 'validate'
			const suffix = suffixes[event]
			const validate = withFieldDefaults(fieldConfig, `${prefix}${suffix}`)

			if (!validate) {
				// ABORT by returning a resolved promise
				return Promise.resolve(!hasErrors)
			}
		}

		// Return the validation promise - will return true if is-valid value
		return performFieldValidation({
			fieldName,		// Field to validate
			value,			// Value to validate
			config,			// Read config.fields[fieldName] & config.validators
			stateOfErrors,	// Hash of existing field errors
			instanceAPI,	// Passed to custom validation functions
			triggerComponentUpdate // Will be called if anything changes
		})
	}

	function validateAllFields( opts ) {
		const fields = config.fields

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
			// Skip fields that are really 'form.state'; those don't validate
			if (field.isData === false) return

			fieldValidations.push(
				performFieldValidation({
					fieldName,		// Field to validate
					value: utils.getObjectValue(stateOfData, fieldName),
					config,			// Read config.fields[fieldName] & config.validators
					stateOfErrors,	// Hash of existing field errors
					instanceAPI,	// Passed to custom validation functions
					triggerComponentUpdate // Will be called if anything changes
				})
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
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @param {string} name    Field-name or alias-name
	 * @returns {Object}        Props for components like a TextField
	 */
	function getErrorProps( name ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const errorMessage = getFieldErrors(fieldName)

		return {
			error: errorMessage.length > 0,
			helperText: errorMessage,
			FormHelperTextProps: {
				className: 'hide-when-empty'
			}
		}
	}

	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]    Options, like non-text field details
	 * @returns {*}
	 */
	function getDataProps( name, opts = { checkbox: false, radio: false } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName(name)
		const fieldConfig = config.fields[fieldName] || {}
		const fieldValidation = fieldConfig.validation || {}
		const dataType = fieldValidation.dataType
		const value = getFieldValue(fieldName)

		// noinspection JSUnusedGlobalSymbols
		const props = {
			name: fieldName,
			'aria-label': fieldName, // default, can override in view
			onChange: onFieldChange,
			onFocus: onFieldFocus,
			onBlur: onFieldBlur
		}

		if (fieldValidation.required) {
			props.required = true
		}

		// prettier-ignore
		if (fieldConfig.disabled) {
			props.InputProps = {
				disabled: true
			}
		}
		else if (fieldConfig.readOnly) {
			props.InputProps = {
				readOnly: true
			}
		}

		if (opts.checkbox) {
			// Checkboxes can only be true or false
			props.checked = config.converters.boolean(value)
		}
		else if (dataType === 'boolean') {
			// Allow NULL for other booleans; means no value selected
			props.value = config.converters.boolean(value)
				? '1'
				: '0'
		}
		// else if (opts.radio) {} // Any radio value can be valid
		else if (value && dataType === 'date') {
			// Transform dates to input.type="date" format
			props.value = format.date(value, 'date-input-field')
		}
		else {
			props.value = undefinedToDefaultValue(value)
		}

		return props
	}


	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]  Options, like non-text field details
	 * @returns {*}
	 */
	function getAllProps( name, opts ) {
		return {
			...getDataProps(name, opts),
			...getErrorProps(name, opts)
		}
	}


	/**
	 * @param {Object} e    Event object
	 */
	function onFieldChange( e ) {
		const field = e.target
		const value = /checkbox/.test(field.type || '')
			? field.checked
			: field.value

		// We will fire onChange callbacks AFTER updating field-value
		setFieldValue(field.name, value, 'change')
	}

	/**
	 * @TODO This requires a closure or currying to work on most components
	 * // @param {Object} e    Event object
	 */
	function onFieldFocus() {
		// NOTE: Select controls do not return a target we can use
		// const fieldName = e.target && e.target.name;
	}

	/**
	 * @TODO This requires a closure or currying to work on most components
	 * @param {Object} e    Event object
	 */
	function onFieldBlur( e ) {
		// NOTE: Select controls do not return a target we can use
		const field = e.target
		if (!field || !field.name) return

		let { name, value } = field

		validateField(name, value, 'blur')
		.then(() => {
			// Note: This will run even if validation did not run
			const fieldConfig = config.fields[name] || {}
			const hasErrors = doesItemHaveErrors(name)
			const cleanDataOnBlur = withFieldDefaults(fieldConfig, 'cleanDataOnBlur')

			// Skip data-cleaning if field currently has errors
			if (!hasErrors && cleanDataOnBlur) {
				const newValue = cleanFieldValue(value, fieldConfig)
				if (newValue !== value) {
					// Pass 'change' event so will fire event with new value
					setFieldValue(name, newValue, 'change' )
				}
			}

			fireEventCallback(fieldConfig.onBlur, value, name)
			fireEventCallback(config.onBlur, value, name)
		})
	}

	function fireEventCallback( func, value, fieldName ) {
		if (isFunction(func)) {
			func(value, fieldName, instanceAPI)
		}
	}


	/**
	 * Internal helper to convert aliasName to fieldName
	 * @param name            The name OR aliasName of a field
	 * @returns {string}    If alias found then mapped fieldName, else name
	 */
	function verifyFieldName( name ) {
		if (!name) return name
		if (isArray(name)) return name.map(verifyFieldName)

		if (config.fields[name]) return name

		const realName = config.fieldAliasMap[name]
		if (config.fields[realName]) return realName

		// field nay not have a field-configuration, so can't find the name
		return name
	}


	function undefinedToDefaultValue( value, dataType ) {
		if (!isUndefined(value)) return value

		switch (dataType) {
			case 'boolean':
				return false
			default:
				return ''
		}
	}

	/**
	 * Convert array to hash with 'true' values for easier value check
	 */
	function arrayToHash( arr, isFieldNames = false ) {
		if (!isArray(arr)) return arr

		const hash = {}
		for (let value of arr) {
			// Handle alias fieldNames in array
			if (isFieldNames) value = verifyFieldName(value)
			hash[value] = true
		}
		return hash
	}


	function withFieldDefaults(fieldConfig, key) {
		// If field specifies a value, use it!
		const fieldConfigValue = (fieldConfig || {})[key]
		if (!isNil(fieldConfigValue)) return fieldConfigValue

		const defaultValue = config.fieldDefaults[key]
		if (!isNil(defaultValue)) return defaultValue

		return undefined
	}
}

// noinspection JSUnusedGlobalSymbols
export default FormManager
