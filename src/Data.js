import assign from 'lodash/assign'
import clone from 'lodash/clone'
import cloneDeep from 'lodash/cloneDeep'
import forOwn from 'lodash/forOwn'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import isFunction from 'lodash/isFunction'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import isUndefined from 'lodash/isUndefined'
// Alias validateField because we use an intermediate method with same name
import utils from './utils'
// Extract utils for code brevity
const { getObjectValue, setObjectValue } = utils


/**
 * FormManager sub-component to handle form-field data
 *
 * @param {Object} formManager        FormManager instance object
 * @param {Object} components            Hash of FormManager sub-components
 * @param {Object} components.config    FormManagerConfig instance object
 * @param {Object} components.state    FormManagerState instance object
 * @returns {Object}                    Config API for this instance
 * @constructor
 */
function Data( formManager, components ) {
	// Auto-instantiate so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof Data)) {
		return new Data(formManager, components)
	}

	const { config, state, internal } = components

	// Extract helper methods for brevity
	const { fireEventCallback, triggerComponentUpdate } = internal
	const { withFieldDefaults } = config
	// Create local aliases for config objects
	const formatters = config.get('formatters')
	const converters = config.get('converters')

	let stateOfForm = {}
	let stateOfData = {}

	let stateOfInitialData = {}
	const dirtyFields = new Set()


	return {
		// Methods used internally by FormManager components
		init,
		get: getData,			// GETTER for stateOfData
		set: setData,			// SETTER for stateOfData
		getValue, 				// GETTER for one or more field-values
		setValue, 				// SETTER for one or more field-values
		cleanValue,				// GETTER/PROCESSOR for one field

		// Methods exposed in FormManager API
		publicAPI: {
			isDirty,			// Has ANY value in data changed?
			isClean,			// Has NO values in data changed?
			getChanges,			// Return hash containing only changed data
			getData,			// GETTER for stateOfData
			setData,			// SETTER for stateOfData
			getValue, 			// GETTER for one or more field-values
			setValue, 			// SETTER for one or more field-values
			// ALIASES
			value: getValue,
			getValues: getValue,
			setValues: setValue
		}
	}


	/**
	 * Initialize form data, state and errors using only the config-options
	 *
	 * @param {(undefined|Object)} [initialData]
	 * @param {(undefined|Object)} [data]
	 */
	function init( initialData, data ) {
		stateOfData = {} // In case called for a RESET
		if (initialData) setData(initialData)
		if (data) setData(data)
	}


	/**
	 * PUBLIC GETTER for a specific field value.
	 *
	 * @param {string} name         Field-name or alias-name
	 * @param {Object} [opts]    Options
	 */
	function getValue( name, opts = {} ) {
		if (!name) {
			return cloneDeep(stateOfForm)
		}

		const getOpts = assign({
			cleanValue: false,
			refresh: false
		}, opts)

		const fieldName = config.verifyFieldName(name)
		const fieldConfig = config.getField(fieldName) || {}

		// NOTE: stateOfForm is ONE LEVEL; no nested fields
		let value = stateOfForm[fieldName]

		// Init or refresh the cached field-value in stateOfForm
		if (opts.refresh || isUndefined(value)) {
			value = setFormValueFromData(fieldName)
		}

		// Clean field-value - NOT cached!
		if (getOpts.cleanValue) {
			value = cleanValue(value, fieldConfig)
		}

		return value
	}

	/**
	 * Helper to parse a field-value from data-value
	 *
	 * @param {string} fieldName
	 * @param {*} [newDataValue]
	 */
	function setFormValueFromData( fieldName, newDataValue ) {
		const fieldConfig = config.getField(fieldName) || {}
		const { isData, valueFormat, valueType } = fieldConfig

		let value = !isUndefined(newDataValue)
			? newDataValue
			: isData
				? getObjectValue(
					stateOfData,
					fieldName,
					{ clone: true, deep: false }
				)
				: state.get(fieldName)

		value = convertDataType(value, valueType)
		value = formatValue(value, valueFormat)
		value = undefinedToDefaultValue(value) // , dataType

		// Update stateOfForm cache
		// NOTE: stateOfForm is ONE LEVEL; no nested fields
		stateOfForm[fieldName] = clone(value)

		// return value to getFieldValue()
		return value
	}

	/**
	 * PUBLIC SETTER for a specific field value.
	 *
	 * @param {string} name        Field-name or alias-name
	 * @param {*} [value]        Any value OR opts in multi-field mode
	 * @param {Object} [opts]    Options
	 * @returns {Object}            All SETTERS return instance for chaining
	 */
	function setValue( name, value, opts = {} ) {
		const { update, event, validate, isInitialValue } = opts

		const set = ( n, v ) => {
			let val = v

			const fieldName = config.verifyFieldName(n)
			const fieldConfig = config.getField(fieldName)
			if (!fieldConfig) return // INVALID name PASSED; ABORT

			// Field may NOT have a configuration...
			if (fieldConfig) {
				if (fieldConfig.isData) {
					// Clean when re/initializing a value from raw data
					// Option passed by setData() IF field.cleanOnBlur = true
					if (opts.cleanValue) {
						val = cleanValue(val, fieldConfig)
					}

					setDataValue(fieldName, val, fieldConfig, isInitialValue)
				}
				else {
					state.set(name, val)
				}

				// Update the stateOfForm cache
				setFormValueFromData(fieldName, val)
			}
			else {
				setDataValue(n, value, null, isInitialValue)

				// Update the stateOfForm cache
				setFormValueFromData(n, value)
			}

			// If called from a field-event, potentially validate and fire
			// callbacks
			if (event || validate) {
				const validationEvent = validate ? 'validate' : event
				const onChangeForm = config.get('onChange')
				const onChangeField = (config.getField(name) || {}).onChange

				if (fieldConfig) {
					// A validation event MAY trigger validation & callback.
					// Validation may or may not run, depending on event-type.
					// Validation CAN BE async, so method always returns a
					// promise.
					formManager.validate(name, val, validationEvent)
					.then(() => {
						// If field value was changed, then fire events
						if (event === 'change') {
							fireEventCallback(onChangeField, value, name)
							fireEventCallback(onChangeForm, value, name)
						}
					})
				}
				else if (event === 'change') {
					// Just fire form-level onChange, if one exists
					fireEventCallback(onChangeForm, value, name)
				}
			}
		}


		// PROCESS METHOD ARGUMENTS - SET ONE -OR- ALL FIELDS?
		if (isString(name)) {
			set(name, value)
		}
		else if (isPlainObject(name)) {
			// Handle data-hash syntax: value(data, opts)
			forOwn(name, ( v, n ) => {
				set(n, v)
			})
		}


		// Note: opts.update default is true; must pass false to prevent update
		if (update !== false) {
			triggerComponentUpdate()
		}

		return formManager
	}

	function cleanValue( value, fldCfg ) {
		// Only string values are cleaned
		if (!value || !isString(value)) return value

		const trimOuter = withFieldDefaults(fldCfg, 'cleaning.trim')
		const trimInner = withFieldDefaults(fldCfg, 'cleaning.trimInner')
		const toProper = withFieldDefaults(fldCfg, 'cleaning.monoCaseToProper')
		const reformat = withFieldDefaults(fldCfg, 'cleaning.reformat')

		let val = value
		if (trimOuter) val = val.trim()
		if (trimInner) val = val.replace(/\s+/g, ' ')
		if (toProper) val = formatValue(val, toProper)
		if (reformat) val = formatValue(val, reformat)

		return val
	}


	/**
	 * @param {(string|Object)} [name]    Fieldname
	 * @returns {(string|Object)}       Data value for one field or all-data
	 */
	function getData( name ) {
		return isString(name)
			? getObjectValue(stateOfData, name, { cloneValue: true })
			: cloneDeep(stateOfData)
	}

	/**
	 * @param {Object} data         Data to be set
	 * @returns {Object}            All SETTERS return instance for chaining
	 */
	function setData( data ) {
		// Subroutine to handle recursively processing nested data paths
		const processDataBranch = ( parentPath, branch ) => {
			if (isPlainObject(branch) && !isEmpty(branch)) {
				forOwn(branch, ( value, name ) => {
					const fieldName = parentPath
						? `${parentPath}.${name}`
						: name
					const fieldConfig = config.getField(fieldName)

					// ASSUME a non-configured fieldname/path that contains a
					//	hash is part of the data structure, NOT a 'hash-value'
					if (!fieldConfig && isPlainObject(value)) {
						// RECURSE into object at this key-value
						processDataBranch(fieldName, value)
					}

					// Not all fields need to have a configuration
					else if (!fieldConfig || fieldConfig.isData) {
						// If cleanOnBlur = true, ALSO means clean on init-value
						const clean = withFieldDefaults(
							fieldConfig,
							'cleaning.cleanOnBlur'
						)
						const setOpts = { isInitialValue: true }
						if (clean) setOpts.cleanValue = true

						setValue(fieldName, value, setOpts)
					}

					// This catches everything else - criteria just for clarity
					else if (!fieldConfig.isData) {
						state.set(fieldName, value, { update: false })
					}
				})
			}
		}

		processDataBranch('', data)

		triggerComponentUpdate()

		return formManager
	}

	function setDataValue( fieldName, value, fieldConfig, isInitialValue ) {
		let val = value

		if (fieldConfig) {
			// dataFormat
			val = convertDataType(val, fieldConfig.dataType)
			val = formatValue(val, fieldConfig.dataFormat)
		}

		setObjectValue(stateOfData, fieldName, val)

		if (isInitialValue) {
			setObjectValue(stateOfInitialData, fieldName, val)
		}

		setIsDirty(fieldName, val)
	}


	function getChanges() {
		const changes = {}

		dirtyFields.forEach(fieldName => {
			const value = getObjectValue(
				stateOfData,
				fieldName,
				{ cloneValue: true }
			)
			setObjectValue(changes, fieldName, value)
		})

		return changes
	}

	/**
	 * @param {string} fieldName
	 * @param {*} value
	 */
	function setIsDirty( fieldName, value ) {
		const originalValue = getObjectValue(stateOfInitialData, fieldName)

		if (isEqual(value, originalValue)) {
			dirtyFields.delete(fieldName)
		}
		else {
			dirtyFields.add(fieldName)
		}
	}

	/**
	 * @param {string } [name]
	 * @returns {boolean}
	 */
	function isDirty( name ) {
		if (name) {
			const fieldName = config.verifyFieldName(name)
			return fieldName ? !!dirtyFields.has(fieldName) : false
		}
		else {
			return !!dirtyFields.size
		}
	}

	/**
	 * @param {string } [name]
	 * @returns {boolean}
	 */
	function isClean( name ) {
		return !isDirty(name)
	}


	/**
	 * @param {*} value
	 * @param {(string|Function)} format
	 * @returns {*}
	 */
	function formatValue( value, format ) {
		if (!format) return value

		if (isFunction(format)) {
			return format(value)
		}

		let fmt = format
		let fmtOpts = undefined
		if (isArray(format)) {
			fmt = format[0]
			fmtOpts = format[1]
		}

		// Format value if a formatter is specified
		if (fmt && formatters[fmt]) {
			return formatters[fmt](value, fmtOpts)
		}

		return value
	}

	/**
	 * @param {*} value
	 * @param {string} dataType
	 * @returns {*}
	 */
	function convertDataType( value, dataType ) {
		if (!dataType) return value

		if (isFunction(dataType)) {
			return dataType(value)
		}

		let type = dataType
		let opts = undefined
		if (isArray(dataType)) {
			type = dataType[0]
			opts = dataType[1]
		}

		// Convert value if a converter is specified
		if (type && converters[type]) {
			return converters[type](value, opts)
		}

		return value
	}

	/**
	 * @param {*} value
	 // * @param {(string|Array|Function)} dataType
	 * @returns {*}
	 */
	function undefinedToDefaultValue( value ) {
		// If a non-nil value is specified, use it
		return isNil(value) ? '' : value
	}
}

export default Data
