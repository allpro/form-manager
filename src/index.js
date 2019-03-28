import _ from 'lodash'

import validation from './validation'
import utils from './utils'
import { formatDate, formatPhone, formatTextCase } from './formatters'
import defaultFormConfig from './defaultFormConfig'
import defaultFieldConfig, { inheritedFieldConfigKeys } from './defaultFieldConfig'

// Re-export tools for testing
export { default as FieldsTestOutput } from './tools/FieldsTestOutput'
export { default as logFormData } from './tools/logFormData'

// Re-export utils
// export * from './utils'
// noinspection JSUnusedGlobalSymbols
// export { default as demo } from '../demo'

const protectedConfigKeys = [
	'fields',
	'fieldAliasMap',
	'initialData',
	'initialErrors',
	'initialState',
	'errorMessages',
]

const protectedStateKeys = ['data', 'errors']

/**
 * Default state for each form thisInstance
 * This data is injected into: Component.state.form
 */
const defaultFormState = {
	// TODO: need to track load-values so know if current value is the same
	// isDirty:    false,  // true if ANY field has changed
	// hasErrors:  false,  // true if ANY field has an error
	//  standard FormControl state keys
	// dirty:          false,
	// adornedStart:   false,
}

const reFalseyString = /^(0|false)$/
const reAllPeriods = /\./g

// noinspection UnterminatedStatementJS
/**
 * Helper for managing form data, error, validation, etc.
 * Uses component.state to store form data, with getter/setter methods
 *
 * @param {Object} Container    The component ('this') consuming this
 * @param {Object} [options]    Initial configuration of form
 * @param {Object} [extraData]  Data is dynamic so can be passed separately
 * @returns {Object}            Returns an API for this FormManager instance
 * @constructor
 */
function FormManager( Container, options = {}, extraData ) {
	// Auto-instantiate thisInstance so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof FormManager)) {
		return new FormManager( Container, options, extraData )
	}

	// MUST assign to var to create closure and retain pointer to Container
	// JS does NOT maintain 'arguments' in closure the same as it does vars
	// Before adding this var, the 'Container' arg would become undefined
	const Component = Container

	// Init form configuration data using defaults
	const config = _.cloneDeep( defaultFormConfig )

	let stateInitialized = false

	// INIT the component/FormManager
	initComponentState()
	initFormConfiguration()
	initFormData( extraData )

	stateInitialized = true

	// noinspection JSUnusedGlobalSymbols
	/**
	 * PUBLIC API - provides simplified method names for internal functions
	 * Methods are accessed like: form.value('name'), form.validate('address')
	 * Assigned to thisInstance variable so can pass this API to callbacks
	 */
	const thisInstance = {
		reset: resetForm, // Method to reset form data, errors & state.

		// The field-config is exposed, but should rarely be needed
		fieldConfig: getSetFieldConfig, // SETTER/GETTER for field-configuration
		setFieldValidation, // SETTER for easy validation changes
		setFieldIsRequired, // SETTER for easy 'required' changes

		// Form-level getters
		state: formState, // SETTER/GETTER for form-state ONLY
		data: formData, // SETTER/GETTER for form-data

		// Validation can be triggered manually, for one or all fields
		validate: validateField, // ACTION for field OR form validation
		errors: getErrors, // GETTER for field OR form errors

		setFieldError, // SETTER for ONE error on 1 field
		setFieldErrors, // SETTER for MULTIPLE errors on 1 field
		clearFieldErrors, // SETTER clears ALL errors for 1 field
		hasErrors: doesItemHaveErrors, // CHECK if field OR form has errors

		// Methods used when writing form component props
		setFieldValues, // SETTER for MULTIPLE field-values
		setFieldValue: fieldValue, // SETTER/GETTER for 1 field-values
		value: fieldValue, // SETTER/GETTER for 1 field-value

		dataProps: getDataProps, // HELPER for writing component props
		errorProps: getErrorProps, // HELPER for writing component props
		onFieldChange, // HANDLER for component.onChange
		onFieldFocus, // HANDLER for component.onFocus
		onFieldBlur, // HANDLER for component.onBlur
	}

	// RETURN THE PUBLIC API
	return thisInstance

	/**
	 * Initialization method to set internal configuration.
	 * NOTE that config.fields can be an array OR a hash keyed by fieldname.
	 */
	function initFormConfiguration() {
		if (!options) return // nothing to process!

		// Process config options now, ignoring special keys
		_.forOwn( options, ( value, key ) => {
			if (!_.includes( protectedConfigKeys, key )) {
				config[key] = value
			}
		} )

		// Configure form-fields
		getSetFieldConfig( options.fields )
	}

	/**
	 * PUBLIC SETTER & GETTER for field-config(s).
	 * If no args passed, returns clone of all fields config
	 * If data arg is a fieldName (string), returns field's existing config.
	 * Otherwise is a setter for one or more field-config.
	 * Accepts an array -or- hash keyed by fieldname to set multiple fields.
	 *
	 * NOTE: fieldConfig is a var-name so method uses a special internal name.
	 *
	 * @param {(Object|Array|string)} [data]
	 * @param {Object} [opts]   Option for merging with existing config
	 * @returns {Object}        Returns fieldConfig, even when is a SETTER
	 */
	function getSetFieldConfig( data, opts = {} ) {
		const fields = config.fields

		// GETTER - if data is a fieldName or nothing (get-all)
		if (_.isNil( data ) || _.isString( data )) {
			return data ? fields[data] : _.cloneDeep( fields )
		}

		// SETTER - MULTIPLE FIELD-CONFIGS AS ARRAY
		if (_.isArray( data )) {
			return data.map(
				fieldConfig => setFieldConfig( fieldConfig, opts ) )
		}

		const name = data['name'] || opts.fieldName

		// SETTER - MULTIPLE FIELD-CONFIGS AS HASH KEYED BY FIELDNAMES
		// NOTE: Also handle scenario like: fieldName == 'name'
		if (!name || _.isPlainObject( name )) {
			const { replace } = opts
			return _.map( data, ( fieldConfig, fieldName ) =>
				setFieldConfig( fieldConfig, { replace, fieldName } ),
			)
		}

		// SETTER - SINGLE FIELD-CONFIG
		return setFieldConfig( data, opts )
	}

	/**
	 * SETTER for a single field-config; merge or replace.
	 *
	 * @param {(Object|Array|string)} [data]
	 * @param {Object} [opts]   Option for merging with existing config
	 * @returns {Object}        Returns fieldConfig, even when is a SETTER
	 */
	function setFieldConfig( data, opts = { replace: false, fieldName: '' } ) {
		const fieldName = verifyFieldName( data['name'] || opts.fieldName )
		const fields = config.fields
		let fieldConfig = fields[fieldName]

		// INIT fieldConfig if not exists, OR opts.replace specified
		if (!fieldConfig || opts.replace) {
			fieldConfig = fields[fieldName] = _.cloneDeep( defaultFieldConfig )

			// Set field-config default values from root of config
			for (const key of inheritedFieldConfigKeys) {
				if (!_.isNil( config[key] )) {
					fields[fieldName][key] = config[key]
				}
			}
		}

		// Now merge the new configuration data
		_.merge( fieldConfig, data )

		// ensure field.name is set - may have been passed as opts.fieldName
		fieldConfig.name = fieldName

		if (fieldConfig.aliasName) {
			config.fieldAliasMap[fieldConfig.aliasName] = fieldName
		}

		return fieldConfig
	}

	/**
	 * PUBLIC SETTER for changing field(s) validation options easily
	 *
	 * @param {(Array|string)} name 	Fieldname, (or array of), for mass update
	 * @param {Object} validationConfig New Validation setting(s)
	 * @param {Object} [opts]    		Option for merging with existing config
	 * @returns {*}                    Returns validation-config if single field
	 */
	function setFieldValidation( name, validationConfig, opts = { merge: false } ) {
		// Allow passing an array of fieldnames to set them all the same
		// This is useful for setting multiple fields required/not-required
		if (_.isArray( name )) {
			return name.map( fieldName =>
				setFieldValidation( fieldName, validationConfig, opts ),
			)
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const field = config.fields[fieldName] || {}

		// ensure field config exists
		if (!field) return

		if (opts.merge && field.validation) {
			_.merge( field.validation, validationConfig )
		}
		else {
			field.validation = _.clone( validationConfig )
		}

		return field.validation
	}

	/**
	 * PUBLIC SETTER for dynamically setting 'required' flag for validation.
	 * This may be a common need for multi-part forms or conditional fields.
	 *
	 * @param {(Array|string)} name    Fieldname, (or array), for mass update
	 * @param {boolean} require            Is this field(s) required?
	 * @returns {*}                        Returns new validation if a single
	 *     name
	 */
	function setFieldIsRequired( name, require = true ) {
		return setFieldValidation(
			name,
			{ required: !!require },
			{ merge: true },
		)
	}

	/**
	 * Initialization method to init Component.state
	 */
	function initComponentState( reset ) {
		// Init the Component state; this code probably running in constructor
		// Avoid making any assumptions about the existing state structure
		const state = Component.state || (Component.state = {})
		const formKey = config.stateStorageKey
		const newFormState = _.merge(
			{
				data: {},
				errors: {},
			},
			defaultFormState,
		)

		// prettier-ignore
		if (reset) {
			// TODO: Quick fix for resetting errors
			clearAllFieldErrors()

			// TODO: Test this to ensure works as intended
			Component.setState( {
				[formKey]: newFormState,
			} )
		}
		else {
			state[formKey] = newFormState
		}
	}

	function initFormData( data ) {
		const { initialState, initialData, initialErrors, errorMessages } = options

		// INITIAL-DATA - data is optional arg passed at instance creation
		if (initialData) {
			setData( initialData )
		}
		if (data) {
			setData( data )
		}

		// INITIAL-ERRORS
		if (initialErrors && _.isPlainObject( initialErrors )) {
			_.forOwn( initialErrors, ( errors, fieldName ) => {
				// noinspection JSIgnoredPromiseFromCall
				setFieldErrors( fieldName, errors )
			} )
		}

		// OVERRIDE DEFAULT ERROR MESSAGES
		if (errorMessages && _.isPlainObject( errorMessages )) {
			_.merge( config.errorMessages, errorMessages )
		}

		// INITIAL-STATE - can be anything!
		if (initialState && _.isPlainObject( initialState )) {
			_.forOwn( initialState, ( value, key ) => {
				// IGNORE standard form subkeys - not allowed here
				if (!_.includes( protectedStateKeys, key )) {
					// noinspection JSIgnoredPromiseFromCall
					formState( key, value )
				}
			} )
		}
	}

	/**
	 * SPECIAL method to reset form data, errors & state.
	 * Does not reinitialize or reset field configuration.
	 * Does not remove any handlers or data bound after creation.
	 *
	 * @param {Object} [data]
	 */
	function resetForm( data ) {
		initComponentState( true ) // true = reset
		initFormData( data )
	}

	/**
	 * Alias Component.setState to handle object merging, immutables, etc.
	 * ALL form-state is stored under the state.form branch. (stateStorageKey)
	 *
	 * @param {string} path     String-path like 'data/who/gender'
	 * @param {*} value         Value - could be anything!
	 * @param {Object} [opts]   Configuration options
	 * @returns {Promise}       Promise resolves after state is set
	 */
	function setState(
		path,
		value,
		opts = { cloneValue: false, waitForState: false },
	) {
		const form = _.clone( Component.state[config.stateStorageKey] )
		let branch = form

		// prettier-ignore
		if (path && path !== '/') {
			const keys = pathToKeysArray( path )
			const lastIdx = keys.length - 1
			const lastKey = keys[lastIdx]

			for (let i = 0; i < lastKey; i++) {
				const key = keys[i]
				let branchValue = branch[key]

				if (branchValue && _.isPlainObject( branchValue )) {
					branch[key] = _.clone( branchValue )
				}
				else {
					// Create a branch (hash) here if it doesn't exist yet
					// OVERWRITE any simple value here because path specifies!
					branch[key] = {}
				}

				// Update branch for next loop, if not done yet
				branch = branch[key]
			}

			// Write the value
			branch[lastKey] = opts.clone ? _.clone( value ) : value
		}
		else if (_.isObjectLike( value )) {
			_.merge( form, value )
		}
		else {
			console.warn(
				`FormManager.setState() - 
				no path specified to set state value: "${value}"`,
			)
			return Promise.resolve()
		}

		// prettier-ignore
		// Return a promise that resolves AFTER state is updated
		if (!stateInitialized) {
			Component.state[config.stateStorageKey] = form
			return Promise.resolve()
		}
		else if (opts.waitForState) {
			// Wait for setState to complete before resolving promise
			return new Promise( resolve => {
				Component.setState(
					{ [config.stateStorageKey]: form },
					resolve,
				)
			} )
		}
		else {
			Component.setState( { [config.stateStorageKey]: form } )
			// resolve immediately; caller may be batching state updates
			return Promise.resolve()
		}
	}

	/**
	 * @param {Object} data     Hash of Field-name/value pairs
	 * @returns {Promise}       Promise resolves after state has updated
	 */
	function setFieldValues( data ) {
		const form = _.clone( getState() )
		form.data = _.clone( form.data )

		_.forOwn( data, ( value, name ) => {
			setFieldValue( name, value, form )
		} )

		return new Promise( resolve => {
			Component.setState( { [config.stateStorageKey]: form }, resolve )
		} )
	}

	/**
	 * Helper to get a specific state branch or value.
	 * If no path is specified, it returns the entire state.form hash.
	 * If an object is returned, it is BY REF, so should NOT be mutated.
	 * If state needs to be changed, pass a flag so it is cloned.
	 *
	 * @param {string} [path]   String-path like 'data/who/gender'
	 * @param {Object} [opts]   Options, like { clone: true }
	 * @returns {*}             SOMETHING from state; could be anything
	 */
	function getState( path, opts = { clone: false } ) {
		const stateData = Component.state[config.stateStorageKey]
		let state = opts.clone ? _.clone( stateData ) : stateData
		let parentBranch = state

		// If a path was passed, trace the path inside state.form
		if (path) {
			// Slash(es) in the path indicate that we should recurse downward
			const keys = pathToKeysArray( path )
			for (const key of keys) {
				state = state[key]

				if (opts.clone) {
					state = _.clone( state )
					parentBranch[key] = state
					parentBranch = state
				}

				// If key not found in this object then return undefined
				if (_.isUndefined( state )) return undefined
			}
		}

		return state
	}

	/**
	 * GETTER for form-state, which is stored in the root of state.form.
	 *
	 * @param {string} [key]
	 * @param {Object} opts     Clone-value option
	 * @returns {*}         Either all form-state or just the key requested
	 */
	function getFormState( key, opts = { cloneValue: true } ) {
		// If a key is passed, then return value for just that, if exists
		if (key) {
			const value = getState( key )
			return opts.cloneValue !== false && _.isObjectLike( value )
				? _.cloneDeep( value )
				: value // could be anything, including undefined
		}

		// Start with a shallow clone of entire state.form branch.
		const state = _.clone( getState() )

		// Remove special keys that are NOT part of 'form-state'.
		// Do this BEFORE a deepClone because so will speeds up deepClone
		delete state.data
		delete state.errors

		// Return a deep clone to ensure state cannot be mutated
		return _.cloneDeep( state )
	}

	/**
	 * Subroutine to set values in the root of form.state
	 *
	 * @param {(Object|string)} key        Fieldname OR a hash of data to set
	 * @param {*} [value]                Value to SET, if key is a string
	 * @param {Object} [opts]
	 * @returns {Promise}
	 */
	function formState( key, value, opts = { clone: true } ) {
		// prettier-ignore
		// GETTER - Return shallow clone of ALL state, MINUS 'data' and 'errors'
		if (!key) {
			return getFormState()
		}
		// GETTER/SETTER - A string-key, _possibly_ with a value to set
		else if (_.isString( key )) {
			return value === undefined
				// Return form.state[key], possibly cloned if value is an object
				? getFormState( key, { cloneValue: opts.clone } )
				// Return promise that will resolve after state is update
				: setState( key, value, { cloneValue: true } )
		}
		// SETTER - hash of key/value pairs - set them all
		else if (_.isPlainObject( key )) {
			const promises = []
			_.forOwn( key, ( v, k ) => {
				promises.push(
					setState( k, v, { cloneValue: true } ),
				)
			} )
			return Promise.all( promises )
		}
	}

	/**
	 * @param {string} name         Field-name or alias-name
	 * @param {*} value             New value for specified fieldName
	 * @param {Object} [objState]   Object to update instead of calling setState
	 * @param {string} [event]    Name of event that triggered this ('change')
	 * @returns {(Promise|Object)}  Promise resolves after state has
	 * updated
	 */
	function setFieldValue( name, value, objState, event ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const fieldConfig = config.fields[fieldName]
		const isDataField = !fieldConfig || fieldConfig.isData
		const fieldValidation = fieldConfig ? fieldConfig.validation : {}
		const dataType = fieldValidation.dataType
		const isNil = _.isNil( value )
		let newValue = value

		// prettier-ignore
		// NOTE: Backend may pass NULL for empty string fields
		if ((!dataType || dataType === 'text') && isNil) {
			newValue = ''
		}
		// Allow Null/Undefined booleans - means no-default value
		else if (dataType === 'boolean' && !isNil && !_.isBoolean( value )) {
			newValue = valueToBoolean( value )
		}
		else if (dataType === 'date') {
			// Transform dates to ISO standard; if dateType is set
			newValue = formatDate( value, 'iso-string' )
		}
		else if (fieldValidation.phone) {
			// Normalize phone-numbers to "[0-][000-]000-0000"
			newValue = formatPhone( value )
		}

		if (!isDataField) {
			if (objState) {
				objState[fieldName] = newValue
				return objState
			}
			else {
				return formState( fieldName, newValue )
			}
		}

		const keys = pathToKeysArray( fieldName )
		const lastIdx = keys.length - 1
		const lastKey = keys[lastIdx]

		// Get a cloned copy of the current data (shallow clone)
		const data = objState ? objState.data : getState(
			'data',
			{ clone: true },
		)
		let branch = data // for recursion

		// Recurse into data for name-paths like 'who/location/address1'
		for (let idx = 0; idx <= lastIdx; idx++) {
			const key = keys[idx]
			// If value is nested, recurse into branch
			if (idx < lastIdx) {
				const keyValue = branch[key]
				// Create a nested object if doesn't exist yet
				if (keyValue && _.isPlainObject( keyValue )) {
					branch[key] = _.clone( keyValue )
				}
				// Update branch for next loop
				// Create new object in tree if need to recurse deeper
				if (idx < lastIdx && _.isNil( branch[key] )) {
					branch = branch[key] = {}
				}
				else {
					branch = branch[key]
				}
			}
		}

		// If field value has not changed, do nothing - ABORT
		if (branch[lastKey] === newValue) {
			return objState || Promise.resolve()
		}

		// Set the field value; shallow clone if value is a hash or array
		branch[lastKey] = _.isObjectLike( newValue ) ? _.clone( newValue ) : newValue

		// prettier-ignore
		// Return updated object OR promise that resolves after state updates
		if (objState) {
			return objState
		}
		else if (event) {
			// Passing a validation event can trigger validation & callback,
			// so WAIT for state to be set before we validate
			return setState( 'data', data, { waitForState: true } )
				.then( () => validateField( fieldName, newValue, event ) )
				// Note: onChange is called even if validation doesn't
				.then( () => runFieldChangeCallback( fieldName, newValue ) )
		}
		else {
			return setState( 'data', data )
		}
	}

	/**
	 * PUBLIC SETTER & GETTER for a specific field value.
	 *
	 * @param {string} name     Field-name or alias-name
	 * @param {Object} [opts]   Options
	 * @param {*} [value]
	 */
	function fieldValue( name, value, opts = { cleanValue: false } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const fieldConfig = config.fields[fieldName] || {}
		const fieldValidation = fieldConfig.validation || {}
		const isData = fieldConfig.isData !== false

		// prettier-ignore
		// SETTER - 0 and empty strings ARE 'values' to set
		if (value !== undefined) {
			// Clean value here, if requested
			const val = opts.cleanValue
				? cleanFieldValue( value, fieldConfig )
				: value

			return isData
				? setFieldValue( fieldName, val )
				: formState( fieldName, val )
		}
		// GETTER
		else {
			const path = isData ? `data/${fieldName}` : fieldName
			let curValue = getState( path, { clone: true } )
			return undefinedToDefaultValue( curValue, fieldValidation.dataType )
		}
	}

	function formData( data, opts ) {
		return _.isPlainObject( data ) ? setData( data ) : getAllData( opts )
	}

	function setData( data ) {
		if (_.isPlainObject( data ) && !_.isEmpty( data )) {
			const newState = getState( '', { clone: true } )

			_.forOwn( data, ( value, name ) => {
				const fieldName = verifyFieldName( name )
				const field = config.fields[fieldName]

				// prettier-ignore
				if (!field || field.isData !== false) {
					setFieldValue( fieldName, value, newState )
				}
				else {
					// noinspection JSIgnoredPromiseFromCall
					formState( fieldName, value, newState )
				}
			} )

			// noinspection JSIgnoredPromiseFromCall
			setState( '', newState )
		}
	}

	/**
	 * GETTER for the current form data values, stored in state.form.data
	 *
	 * @param {Object} [opts]    Options
	 * @returns {Object} Data in JSON format ready to POST to server
	 */
	function getAllData( opts = { cleanData: true } ) {
		let data = getState( 'data' )

		// Handle option to bypass automatic data-cleaning
		if (opts.cleanData) {
			// Clone data so we don't mutate original
			data = cleanData( data, { clone: true } )
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
		const data = opts.clone ? _.clone( originalData ) : originalData

		_.forOwn( data, ( value, name ) => {
			if (!value) return

			// Currently only strings are cleaned
			if (_.isString( value )) {
				const fieldConfig = config.fields[name] || {}
				data[name] = cleanFieldValue( value, fieldConfig )
			}
		} )

		return data
	}

	function cleanFieldValue( value, fieldConfig ) {
		if (!value) return value
		let val = value

		// Currently only strings are cleaned
		if (_.isString( value )) {
			// Text and space cleaning are defaults
			if (fieldConfig.trimText !== false) val = val.trim()
			if (fieldConfig.fixSpaces !== false) {
				val = val.replace(
					/\s+/g,
					' ',
				)
			}
			if (fieldConfig.fixCase) val = formatTextCase( val, true )
		}

		return val
	}

	function getAllFormErrors( opts = { asArray: true } ) {
		// Iterate everything in state.form.errors to create list of errors
		// Error data is in a hash so can include fieldNames
		const errorData = getState( 'errors' )
		const arrErrors = []

		_.forOwn( errorData, ( errors, fieldName ) => {
			if (errors && !_.isEmpty( errors )) {
				// get field-config so we can add displayName to data
				const fieldConfig = config.fields[fieldName]

				arrErrors.push( {
					name: fieldName,
					alias: fieldConfig.aliasName || fieldName,
					display: fieldConfig.displayName, // undefined if not set
					errors: utils.itemToArray( errors ),
				} )
			}
		} )

		// NOTE: Is an empty array if there are no field-error
		// Auto-join errors into a string if option passed
		return opts.asArray === false ? arrErrors.join( '\n' ) : arrErrors
	}

	/**
	 * Helper for error methods to keep things DRY
	 */
	function getFieldErrorsHash( fieldName ) {
		// DO NOT use getState(`errors/${fieldName}`) - see NOTE below
		const errors = getState( 'errors' )

		// NOTE that we do NOT support nested structure for errors, so...
		// A 'who/gender' field stores errors at: form.errors['who/gender']
		// However the field data is NESTED at:   form.data.who.gender
		let fieldErrors = errors[fieldName] || {}

		// If field-errors is a string, normalize it to a custom error
		if (_.isString( fieldErrors )) {
			fieldErrors = {
				custom: errors,
			}
		}

		return fieldErrors
	}

	/**
	 * Public method to fetch error(s) for a specific field.
	 * Errors are stored in a hash, which we convert to a simple array.
	 * Calling code can output message(s) using join() or iterate array.
	 *
	 * @param {string} name     Field-name or alias-name
	 * @param {Object} opts     Options for return value
	 * @returns {(string|Array)}
	 */
	function getErrors( name, opts = { asArray: false } ) {
		if (!name) {
			return getAllFormErrors()
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const errors = getFieldErrorsHash( fieldName )

		// Iterate through all error-keys and combine errors into an array
		const arrErrors = utils.itemToArray( errors )

		// auto-join errors into a string if related config option is set
		return config.returnErrorsAsString && !opts.asArray
			? arrErrors.join( '\n' )
			: arrErrors
	}

	/**
	 * PUBLIC SETTER for ONE field error, by fieldName
	 *
	 * @param {string} name     Field-name or alias-name
	 * @param {string} type     Validation type, eg: 'required', 'custom'
	 * @param {string} message  Error-message text for this type
	 * @param {Object} opts     Merge options
	 * @returns {Promise}       Promise returned by setState
	 */
	function setFieldError( name, type, message, opts = { merge: true } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const curErrMsg = getState( `errors/${fieldName}/${type}` )

		// Skip update if this error-message is already set
		if (curErrMsg !== message) {
			return setFieldErrors( name, { [type]: message || '' }, opts )
		}
	}

	/**
	 * PUBLIC SETTER for field errors in form.errors; keyed by fieldName.
	 * This hash is a single-level, unlike data, eg:form.errors.'key/subkey'.
	 * If errors is falsey or an empty array, current errors will be cleared.
	 *
	 * @param {string} name         Name or aliasName of field
	 * @param {(Object|Array|string|boolean|null)} errors
	 * @param {Object} opts         Merge options
	 */
	function setFieldErrors( name, errors, opts = { merge: false } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )

		// Get current state.form.errors
		const errorsState = getState( 'errors', { clone: true } )

		// Any falsey value means clear all field errors
		// prettier-ignore
		if (!errors) {
			delete errorsState[fieldName]
		}
		else {
			// TODO: Verify this is correct handling for non-object 'errors'
			// Normalize custom error to a hash
			const newErrors = !_.isPlainObject( errors )
				? { custom: errors }
				: errors

			// MERGE FIELD ERRORS
			if (opts.merge) {
				// Clone errors.fieldName branch
				const fieldErrors = _.clone( errorsState[fieldName] || {} )

				// Shallow-merge new error(s) into existing errors hash
				_.assign( fieldErrors, newErrors )

				// Attach NEW fieldErrors object to errorState object
				errorsState[fieldName] = fieldErrors
			}
			else {
				// REPLACE FIELD ERRORS - clone errors to break byRef
				// connections
				errorsState[fieldName] = newErrors ? _.clone( newErrors ) : {}
			}
		}

		return setState( 'errors', errorsState )
	}

	/**
	 * PUBLIC SETTER for field errors - remove errors only
	 *
	 * @param {(Array|string)} name     Field-name(s) or alias-name(s)
	 */
	function clearFieldErrors( name ) {
		if (!name) {
			clearAllFieldErrors()
		}
		else if (_.isArray( name )) {
			// noinspection JSUnresolvedFunction
			name.map( setFieldErrors )
		}
		else {
			// noinspection JSIgnoredPromiseFromCall
			setFieldErrors( name, null )
		}
	}

	/**
	 * SETTER for field errors - clears all
	 * IMPORTANT: Must 'empty' existing form.errors and reuse object;
	 *    otherwise certain sequences of setState will keep the OLD object!
	 */
	function clearAllFieldErrors() {
		const errors = getState( 'errors' )
		for (const key in errors) {
			// noinspection JSUnfilteredForInLoop
			delete errors[key]
		}
		// noinspection JSIgnoredPromiseFromCall
		setState( 'errors', errors )
	}

	/**
	 * PUBLIC GETTER to check if a specific field has any errors
	 *
	 * @param {string} name     Field-name or alias-name
	 * @returns {boolean}
	 */
	function doesItemHaveErrors( name ) {
		if (name) {
			return getErrors( name, { asArray: true } ).length > 0
		}
		else {
			return !_.isEmpty( getState( 'errors' ) )
		}
	}

	/**
	 * @param {string} name     Field-name or alias-name
	 * @param {*} value
	 * @param {string} [event]  Name of event that triggered this, eg: 'change'
	 * @returns {Promise}
	 */
	function validateField( name, value, event ) {
		if (!name || _.isObjectLike( name )) {
			return validateAllFields( name )
		}

		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const fieldConfig = config.fields[fieldName] || {}

		// If an event was passed, check to see if we should validate or not.
		// If not, then abort validation
		if (event) {
			const hasErrors = doesItemHaveErrors( fieldName )

			// validation options at field-level override those at form-level
			const autoValidate =
				fieldConfig.autoValidate ||
				(fieldConfig.autoValidate !== false && config.autoValidate)

			const autoRevalidate =
				fieldConfig.autoRevalidate ||
				(fieldConfig.autoRevalidate !== false && config.autoRevalidate)

			if (
				(hasErrors && autoRevalidate !== event) ||
				(!hasErrors && autoValidate !== event)
			) {
				return Promise.resolve()
			}
		}

		return validation.field( {
			fieldName,
			value,
			config,
			setState,
			getState,
			getAllData,
			thisInstance,
		} )
	}

	function validateAllFields( opts ) {
		const fields = config.fields
		const data = getState( 'data' )
		const errors = getState( 'errors', { clone: true } )

		let only, skip

		if (opts && _.isPlainObject( opts )) {
			only = arrayToHash( opts.only, true )
			skip = arrayToHash( opts.ignore, true )
		}
		else if (opts && _.isArray( opts )) {
			only = arrayToHash( opts, true )
		}

		_.forOwn( fields, ( field, fieldName ) => {
			// Skip fields if specified in opts
			if (only && !only[fieldName]) return
			if (skip && skip[fieldName]) return
			// Skip fields that are really 'form.state'; those don't validate
			if (field.isData === false) return

			validation.field( {
				fieldName: fieldName,
				value: data[fieldName],
				config,
				getState: () => errors, // pass accumulated errors object
				// setState, DO NOT pass setState because we are accumulating
				getAllData,
				thisInstance,
			} )
		} )

		const allFieldsValid = _.isEmpty( errors )

		// Return Promise from setState so we wait until state updates
		return (
			setState( 'errors', errors )
			// return true if NO errors; false otherwise
			.then( () => allFieldsValid )
		)
	}

	/**
	 * Helper for components to integrate with FormManager.
	 *
	 * @param {string} name     Field-name or alias-name
	 * @returns {Object}        Props for components like a TextField
	 */
	function getErrorProps( name ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const errorMessage = getErrors( fieldName )

		return {
			error: errorMessage.length > 0,
			helperText: errorMessage,
			FormHelperTextProps: {
				className: 'hide-when-empty',
			},
		}
	}

	/**
	 * Helper for components to integrate with FormManager.
	 *
	 * @param {string} name     Field-name or alias-name
	 * @param {Object} [opts]    Options, like non-text field details
	 * @returns {*}
	 */
	function getDataProps( name, opts = { checkbox: false, radio: false } ) {
		// field MAY have an aliasName
		const fieldName = verifyFieldName( name )
		const fieldConfig = config.fields[fieldName] || {}
		const fieldValidation = fieldConfig.validation || {}
		const dataType = fieldValidation.dataType
		const value = fieldValue( fieldName )

		// noinspection JSUnusedGlobalSymbols
		const props = {
			name: fieldName,
			'aria-label': fieldName, // default, can override in view
			onChange: onFieldChange,
			onFocus: onFieldFocus,
			onBlur: onFieldBlur,
		}

		if (fieldValidation.required) {
			props.required = true
		}

		// prettier-ignore
		if (fieldConfig.disabled) {
			props.InputProps = {
				disabled: true,
			}
		}
		else if (fieldConfig.readOnly) {
			props.InputProps = {
				readOnly: true,
			}
		}

		if (opts.checkbox) {
			// Checkboxes can only be true or false
			props.checked = valueToBoolean( value )
		}
		else if (dataType === 'boolean') {
			// Allow NULL for other booleans; means no value selected
			props.value = _.isNil( value ) ? null : valueToBoolean( value )
				? '1'
				: '0'
		}
		// else if (opts.radio) {} // Any radio value can be valid
		else if (value && dataType === 'date') {
			// Transform dates to input.type="date" format
			props.value = formatDate( value, 'date-input-field' )
		}
		else {
			props.value = undefinedToDefaultValue( value )
		}

		return props
	}

	/**
	 * @param {Object} e     Event object
	 */
	function onFieldChange( e ) {
		const field = e.target
		const inputType = field.type || ''

		const fieldName = verifyFieldName( field.name )
		const fieldConfig = config.fields[fieldName] || {}
		const fieldValidation = fieldConfig.validation || {}
		const dataType = fieldValidation.dataType || 'text'

		let value = /checkbox/.test( inputType ) ? field.checked : field.value

		// prettier-ignore
		if (dataType === 'text' || inputType === 'text') {
			// Text-Inputs MUST have string values, even if string is numbers
			value = value || '' // avoid undefined or null values
		}
		// Coerce string-value to correct dataType
		else if (_.isString( value )) {
			if (dataType === 'date') {
				// Leave dates as strings
			}
			else if (dataType === 'integer') {
				value = parseInt( value, 10 )
				if (isNaN( value )) value = null
			}
			else if (dataType === 'number') {
				value = Number( value )
				if (isNaN( value )) value = null
			}
			else if (dataType === 'boolean') {
				const isFalsey = !value || reFalseyString.test( value )
				value = !isFalsey
			}
		}

		return setFieldValue( fieldName, value, null, 'change' )
	}

	function runFieldChangeCallback( fieldName, value ) {
		const fieldConfig = config.fields[fieldName] || {}
		const onChange = fieldConfig.onChange

		if (_.isFunction( onChange )) {
			onChange( fieldName, value, thisInstance )
		}

		return Promise.resolve()
	}

	/**
	 * @TODO This method requires a closure to work on most components
	 * // @param {Object} e     Event object
	 */
	function onFieldFocus() {
		// NOTE: Select controls do not return a target we can use
		// const fieldName = e.target && e.target.name;
	}

	/**
	 * @TODO This method requires a closure to work on most components
	 * @param {Object} e     Event object
	 */
	function onFieldBlur( e ) {
		// NOTE: Select controls do not return a target we can use
		const field = e.target
		if (!field || !field.name) return

		let { name, value } = field

		// prettier-ignore
		// noinspection JSIgnoredPromiseFromCall
		validateField( name, value, 'blur' )
		.then( () => {
			// Note: This will run even if validation did not run
			const fieldConfig = config.fields[name] || {}
			const hasErrors = doesItemHaveErrors( name )

			// Skip data-cleaning if field currently has errors
			if (!hasErrors && fieldConfig.cleanDataOnBlur) {
				const newValue = cleanFieldValue( value, fieldConfig )
				if (newValue !== value) {
					// prettier=ignore
					fieldValue( name, newValue )
					.then( () => {
						runFieldBlurCallback( name, newValue )
					} )
					return
				}
			}

			runFieldBlurCallback( name, value )
		} )
	}

	function runFieldBlurCallback( fieldName, value ) {
		const fieldConfig = config.fields[fieldName] || {}
		const onBlur = fieldConfig.onBlur

		if (_.isFunction( onBlur )) {
			onBlur( fieldName, value, thisInstance )
		}
	}

	/**
	 * Internal helper to convert aliasName to fieldName
	 * @param name          The name OR aliasName of a field
	 * @returns {string}    If alias found then mapped fieldName, else name
	 */
	function verifyFieldName( name ) {
		if (!name) return name
		if (_.isArray( name )) return name.map( verifyFieldName )

		if (config.fields[name]) return name

		const realName = config.fieldAliasMap[name]
		if (config.fields[realName]) return realName

		// field nay not have a field-configuration, so can't find the name
		return name
	}

	function undefinedToDefaultValue( value, dataType ) {
		if (!_.isUndefined( value )) return value

		switch (dataType) {
			case 'boolean':
				return false
			default:
				return ''
		}
	}

	function valueToBoolean( value ) {
		if (_.isBoolean( value )) return value

		// Any non-zero number is true
		if (_.isNumber( value )) return value !== 0

		// Any string other than these becomes true
		if (_.isString( value )) return !/^(|0|false|no)$/.test( value )

		// DO NOT test for NULL or undefined - those mean 'unspecified'
	}

	/**
	 * Convert array to hash with 'true' values for easier value check
	 */
	function arrayToHash( arr, isFieldNames = false ) {
		if (!_.isArray( arr )) return arr

		const hash = {}
		for (let value of arr) {
			// Handle alias fieldNames in array
			if (isFieldNames) value = verifyFieldName( value )
			hash[value] = true
		}
		return hash
	}

	/**
	 * Convert a fieldName into an array of keys - may only be one key.
	 *
	 * @param {string} path
	 */
	function pathToKeysArray( path ) {
		// Slashes or dots in fieldName indicate data is stored in a subkey
		return path.replace( reAllPeriods, '/' ).split( '/' )
	}
}

// noinspection JSUnusedGlobalSymbols
export default FormManager
