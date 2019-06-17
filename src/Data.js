import {
	clone,
	cloneDeep,
	forOwn,
	isArray,
	isEqual,
	isFunction,
	isNil,
	isPlainObject,
	isString,
	isUndefined,
	getObjectValue,
	setObjectValue
} from './utils'

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
	const { withFieldDefaults, aliasToRealName } = config
	// Create local aliases for config objects
	const formatters = config.get('formatters')
	const converters = config.get('converters')

	// DATA CACHES - both server and form versions of data
	let stateOfValues = {}
	let stateOfData = {}

	let stateOfInitialData = {}
	const dirtyFields = new Set()


	return {
		// Methods used internally by FormManager components
		init,
		get: getData,			// GETTER for stateOfData
		set: setData,			// SETTER for stateOfData
		getValue, 				// GETTER for one field-value
		getValues, 				// GETTER for all field-values
		setValue, 				// SETTER for one field-value
		setValues, 				// SETTER for multiple field-values
		cleanValue,				// GETTER/PROCESSOR for one field

		// Methods exposed in FormManager API
		publicAPI: {
			isDirty,			// Has ANY value in data changed?
			isClean,			// Has NO values in data changed?
			getChanges,			// Return hash containing only changed data
			getData,			// GETTER for stateOfData
			getFieldData,		// GETTER for one field-data
			setData,			// SETTER for stateOfData
			setFieldData,		// SETTER for one field-data
			getValue, 			// GETTER for one field-value
			getValues, 			// GETTER for all field-values
			setValue, 			// SETTER for one field-value
			setValues, 			// SETTER for multiple field-values
			cleanField,			// SETTER for one field
			// ALIASES
			data: getData,
			value: getValue,
			values: getValue,
			changes: getChanges,
			cleanFieldValue: cleanField
		}
	}


	/**
	 * Initialize form data, state and errors using only the config-options
	 *
	 * @param {(undefined|Object)} [initialData]
	 * @param {(undefined|Object)} [data]
	 */
	function init( initialData, data ) {
		stateOfData = {} // In case called by form.reset()
		if (initialData) setData(initialData)
		if (data) setData(data)
	}


	/**
	 * PUBLIC GETTER for a specific field value.
	 *
	 * @public
	 * @param {string} name    	Field-name or alias-name
	 * @param {Object} [opts]   Options
	 */
	function getValue( name, opts = {} ) {
		const getOpts = Object.assign({
			cleanValue: false,
			refresh: false
		}, opts)

		const fieldName = aliasToRealName(name)
		const fieldConfig = config.getField(fieldName) || {}

		// NOTE: stateOfValues is ONE LEVEL; no nested fields
		let value = stateOfValues[fieldName]

		// Init or refresh the cached field-value in stateOfValues
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
	 * PUBLIC GETTER for ALL field values.
	 *
	 * @public
	 */
	function getValues() {
		return cloneDeep(stateOfValues)
	}


	/**
	 * PUBLIC SETTER for a specific field value.
	 *
	 * @public
	 * @param {string} name        Field-name or alias-name
	 * @param {*} [value]        Any value OR opts in multi-field mode
	 * @param {Object} [opts]    Options
	 * @returns {Object}            All SETTERS return instance for chaining
	 */
	function setValue( name, value, opts = {} ) {
		const { update, event, validate, isInitialValue } = opts

		const fieldName = aliasToRealName(name)
		const fieldConfig = config.getField(fieldName)
		let val = value
		let validationPromise = null

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

			// Update the stateOfValues cache
			setFormValueFromData(fieldName, val)
		}
		else {
			setDataValue(name, value, null, isInitialValue)

			// Update the stateOfValues cache
			setFormValueFromData(name, value)
		}

		// If triggered by a field-event, validate BEFORE firing callbacks
		if (event || validate) {
			const validationEvent = validate ? 'validate' : event
			const onChangeForm = config.get('onChange')
			const onChangeField = (config.getField(name) || {}).onChange

			if (fieldConfig) {
				// A validation event MAY trigger validation & callback.
				// Validation MAY run, depending on event-type.
				// Validation is async so always returns a promise.
				validationPromise = internal.validate(
					name,
					val,
					validationEvent,
					{ update: false }
				)
				.then(() => {
					// If field value was changed, then fire events
					// noinspection JSIncompatibleTypesComparison
					if (event === 'change') {
						fireEventCallback(onChangeField, value, name)
						fireEventCallback(onChangeForm, value, name)
					}
				})
			}
			else {
				// noinspection JSIncompatibleTypesComparison
				if (event === 'change') {
					// Just fire form-level onChange, if one exists
					fireEventCallback(onChangeForm, value, name)
				}
			}
		}

		// Note: opts.update default == true; must pass false to prevent update
		if (update !== false) {
			// If field(s) is validating, wait for that to complete
			if (validationPromise) {
				// noinspection JSUnresolvedFunction
				return validationPromise.then(triggerComponentUpdate)
			}
			else {
				triggerComponentUpdate()
			}
		}

		return validationPromise || formManager
	}

	/**
	 * PUBLIC SETTER for a specific field value.
	 *
	 * @public
	 * @param {Object} data    	Hash of new values keyed by fieldname or alias
	 * @param {Object} [opts]   Options
	 * @returns {Object}       	All SETTERS return instance for chaining
	 */
	function setValues( data, opts = {} ) {
		const { update } = opts
		const valueOpts = { ...opts, update: false }
		const validationPromises = []

		forOwn(data, (value, name ) => {
			const retVal = setValue(name, value, valueOpts)
			if (retVal.then) validationPromises.push(retVal)
		})

		if (validationPromises.length) {
			const retVal = Promise.all(validationPromises)
			if (update) retVal.then(triggerComponentUpdate)
			return retVal
		}

		return formManager
	}

	/**
	 * INTERNAL HELPER to parse a field-value from data-value
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

		// Update stateOfValues cache
		// NOTE: stateOfValues is ONE LEVEL; no nested fields
		stateOfValues[fieldName] = clone(value)

		// return value to getValue()
		return value
	}


	/**
	 * INTERNAL HELPER to clean a field value
	 *
	 * @param {*} value
	 * @param {Object} fldCfg
	 * @returns {*}
	 */
	function cleanValue( value, fldCfg ) {
		if (!value) return value
		let val = value

		// The formatter may change the data-type, like number -> string
		const reformat = withFieldDefaults(fldCfg, 'cleaning.reformat')
		if (reformat) val = formatValue(val, reformat)

		// Only string values can be trimmed
		if (isString(value)) {
			const trimOuter = withFieldDefaults(fldCfg, 'cleaning.trim')
			const trimInner = withFieldDefaults(fldCfg, 'cleaning.trimInner')
			if (trimOuter) val = val.trim()
			if (trimInner) val = val.replace(/\s+/g, ' ')
		}

		return val
	}

	function cleanField( name ) {
		const fieldName = aliasToRealName(name)
		const fieldConfig = config.getField(fieldName)

		// Field may NOT have a configuration, or could be a 'state' value
		if (fieldConfig && fieldConfig.isData) {
			const curValue = getValue(fieldName)
			const newValue = cleanValue(curValue, fieldConfig)

			if (newValue !== curValue) {
				// Pass 'change' event so will fire event with new value
				setValue(fieldName, newValue, { event: 'change' })
			}
		}

		return formManager
	}


	/**
	 * @param {string} [name]  	Fieldname
	 * @returns {*}       		Data value(s) for one-field or all-data
	 */
	function getFieldData( name ) {
		const fieldname = aliasToRealName(name)
		return getObjectValue(stateOfData, fieldname, { clone: true })
	}

	/**
	 * @returns {Object}	All data
	 */
	function getData() {
		return cloneDeep(stateOfData)
	}


	/**
	 * INTERNAL HELPER for setData() & setFieldData().
	 * Recurse into data structure to find 'nested-fields' and 'data-objects'.
	 *
	 * @param {string} parentPath
	 * @param {*} branchData
	 */
	function setDataAtBranch( parentPath, branchData ) {
		forOwn(branchData, ( value, key ) => {
			// Create a concatenated filename like 'user.profile.nickname'
			const fieldName = parentPath ? `${parentPath}.${key}` : key
			const fieldConfig = config.getField(fieldName)

			// ASSUME a non-configured fieldname/path that contains a
			//	hash is part of the data-keys structure, and NOT a 'value'
			if (!fieldConfig && isPlainObject(value)) {
				// RECURSE into object to find nested fields
				setDataAtBranch(fieldName, value)
			}

			// Handle non-data fields (state)
			else if (fieldConfig && !fieldConfig.isData) {
				state.set(fieldName, value, { update: false })
			}

			// Anything else is a data field, even if no field-config found.
			// Not all fields require a field configuration.
			else {
				// If cleanOnBlur = true, ALSO means clean on init-value.
				// This setting will usually come from config.fieldDefaults.
				const clean = withFieldDefaults(
					fieldConfig, // NOTE: this may be undefined
					'cleaning.cleanOnBlur'
				)
				const setOpts = { isInitialValue: true }
				if (clean) setOpts.cleanValue = true

				setValue(fieldName, value, setOpts)
			}
		})
	}

	/**
	 * @param {(string|Object)} [name]  Fieldname OR Data hash
	 * @param {*} [fieldData]            Data for a single field
	 * @returns {Object}                All SETTERS return instance for chaining
	 */
	function setFieldData( name, fieldData ) {
		const fieldName = aliasToRealName(name)
		setDataAtBranch('', { [fieldName]: fieldData })
		return triggerComponentUpdate()
	}

	/**
	 * @param {(string|Object)} data 	Data hash
	 * @param {*} [data]           		Data for a single field
	 * @returns {Object}            	All SETTERS return instance for chaining
	 */
	function setData( data ) {
		setDataAtBranch('', data)
		return triggerComponentUpdate()
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
		const isOriginalValue = isUndefined(originalValue)
			// If no initial value was define, consider the value falsey
			? value === '' || value === null || value === false
			: isEqual(value, originalValue)

		if (isOriginalValue) {
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
			const fieldName = aliasToRealName(name)
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
