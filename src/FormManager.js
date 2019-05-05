import assign from 'lodash/assign'
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'

import Data from './Data'
import State from './State'
import Config from './Config'
import Validation from './Validation'


/**
 * FormManager - helper for managing form data, error, validation, etc.
 *
 * @param {(Object|Function)} componentObject    Class OR Hook setState method
 * @param {Object} [options]        Initial configuration of form
 * @param {Object} [extraData]            Data passed in at instantiation
 * @returns {Object}                    Returns API for this instance
 * @constructor
 */
function FormManager( componentObject, options = {}, extraData ) {
	// Auto-instantiate so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof FormManager)) {
		return new FormManager(componentObject, options, extraData)
	}

	/**
	 * PUBLIC API for this instance
	 * This API is extended by each sub-component's public methods. See below.
	 *
	 * @public
	 */
	const publicAPI = {
		getRevision,				// GETTER for formRevision number
		reset: initForm, 			// ACTION: Reset form data, errors & state.

		// FORM-ELEMENT PROPERTY SETTERS (HELPERS)
		dataProps: getDataProps,	// HELPER for writing component props
		errorProps: getErrorProps,	// HELPER for writing component props
		allProps: getAllProps,		// HELPER for writing component props

		// FORM-ELEMENT EVENT-HANDLERS
		onFieldChange,				// EVENT HANDLER for field.onChange
		onFieldFocus,				// EVENT HANDLER for field.onFocus
		onFieldBlur					// EVENT HANDLER for field.onBlur
	}


	let formRevision = 0

	let formInitialized = false

	// Internal API so sub-components can access internal helper methods
	const internal = { fireEventCallback, triggerComponentUpdate }

	// Config sub-component, internal API
	const config = Config(publicAPI, { internal })
	config.init(options)
	assign(publicAPI, config.publicAPI)

	// State sub-component, internal API
	const state = State(publicAPI, { internal })
	state.init(options.initialState)
	assign(publicAPI, state.publicAPI)

	// Data sub-component, internal API
	const data = Data(publicAPI, { config, state, internal })
	data.init(options.initialData, extraData)
	assign(publicAPI, data.publicAPI)

	// Validation sub-component, internal API
	const validation = Validation(publicAPI, { config, data, internal })
	assign(publicAPI, validation.publicAPI)

	// Extract helper methods from config API for brevity
	const { aliasToRealName, withFieldDefaults } = config

	formInitialized = true

	// RETURN THE FORM-MANAGER API/OBJECT
	return publicAPI


	/**
	 * PUBLIC METHOD to reset form data, errors & state.
	 * Does not reinitialize or reset field configuration.
	 * Does not remove any handlers or data bound after creation.
	 *
	 * @public
	 */
	function initForm() {
		// RE-INIT all state-hashes
		config.init(options)
		state.init(options.initialState)
		data.init(options.initialData, extraData)
		validation.clearErrors()
	}

	function getRevision() {
		return formRevision
	}

	/**
	 * Method to trigger a setState action in React component
	 */
	function triggerComponentUpdate() {
		// Trigger a re-render only if component has been initialized
		if (formInitialized) {
			// Increment unique index used as component-state value
			formRevision++

			// noinspection JSUnresolvedVariable
			if (componentObject.setState) {
				// Class method
				componentObject.setState({ formRevision })
			}
			else {
				// Hook setFormState method (or whatever its name is!)
				componentObject(formRevision)
			}
		}
	}


	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @public
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]    Options, like non-text field details
	 * @returns {*}
	 */
	function getDataProps( name, opts = { checkbox: false, radio: false } ) {
		const fieldName = aliasToRealName(name)

		const fieldConfig = config.getField(fieldName) || {}
		const { inputType, displayName, disabled, readOnly } = fieldConfig

		const fieldValidations = config.getValidation(fieldName) || {}
		const { required } = fieldValidations

		const value = data.getValue(fieldName)

		const props = {
			name: fieldName,
			value,
			'aria-label': displayName || fieldName, // can override in view
			onChange: partiallyApplyEventHandler(onFieldChange, fieldConfig),
			onFocus: partiallyApplyEventHandler(onFieldFocus, fieldConfig),
			onBlur: partiallyApplyEventHandler(onFieldBlur, fieldConfig)
		}

		if (inputType) {
			let type = inputType
			if (type === 'datetime') type = 'datetime-local'
			props.type = type
		}

		if (opts.checkbox || inputType === 'checkbox') {
			// Checkboxes can only be true or false
			props.checked = config.get('converters').boolean(value)
			// Checkbox values MUST be a string - use default value if not
			if (!isString(value)) props.value = 'on'
		}

		if (required) props.required = true
		if (disabled) props.disabled = true
		if (readOnly) {
			if (fieldConfig.isMUIControl) {
				props.InputProps = { readOnly: true }
			}
			else {
				props.readOnly = true
			}
		}

		return props
	}

	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @public
	 * @param {string} name    Field-name or alias-name
	 * @returns {Object}        Props for components like a TextField
	 */
	function getErrorProps( name ) {
		return {
			error: validation.hasErrors(name),
			helperText: validation.getErrors(name)
			// FormHelperTextProps: {
			// 	className: 'hide-when-empty'
			// }
		}
	}


	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @public
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]  Options, like non-text field details
	 * @returns {*}
	 */
	function getAllProps( name, opts = {} ) {
		return {
			...getDataProps(name, opts),
			...getErrorProps(name)
		}
	}


	/**
	 * @param {string} name        FieldName or alias
	 * @param {*} value         Field Value
	 */
	function onFieldChange( name, value ) {
		// We will fire onChange callbacks AFTER updating field-value
		data.setValue(name, value, { event: 'change' })
	}

	/**
	 * CURRENTLY the onFocus event is not used , but is included in API
	 *    because may want to add onFocus options in the future.
	 *
	 * @param {string} name        FieldName or alias
	 * @param {*} value         Field Value
	 */
	function onFieldFocus( name, value ) {
		const fieldConfig = config.getField(name)
		if (!fieldConfig) return // INVALID name PASSED; ABORT

		fireEventCallback(fieldConfig.onFocus, value, fieldConfig.name)
		fireEventCallback(config.get('onFocus'), value, fieldConfig.name)
	}

	/**
	 * @param {string} name        FieldName or alias
	 * @param {*} value         Field Value
	 */
	function onFieldBlur( name, value ) {
		const fieldConfig = config.getField(name)
		if (!fieldConfig) return // INVALID name PASSED; ABORT

		const fieldName = fieldConfig.name
		// const hasErrors = validation.hasErrors(fieldName)

		const cleanOnBlur = withFieldDefaults(
			fieldConfig,
			'cleaning.cleanOnBlur'
		)
		if (cleanOnBlur) {
			const newValue = data.cleanValue(value, fieldConfig)
			if (newValue !== value) {
				// Pass 'change' event so will fire event with new value
				data.setValue(fieldName, newValue, { event: 'change' })
			}
		}

		validation.validate(name, value, 'blur')
		.then(() => {
			// Note: This will run even if validation did not run
			fireEventCallback(fieldConfig.onBlur, value, fieldName)
			fireEventCallback(config.get('onBlur'), value, fieldName)
		})
	}

	function fireEventCallback( func, value, fieldName ) {
		if (isFunction(func)) {
			func(value, fieldName, publicAPI)
		}
	}

	function partiallyApplyEventHandler( fn, fieldConfig ) {
		const fieldName = fieldConfig.name

		return function ( e, val ) {
			let value = val

			// NORMAL fields return an event object
			// noinspection JSUnresolvedVariable
			if (isObject(e) && isObject(e.target)) {
				const field = e.target
				value = /checkbox/.test(field.type || '')
					? field.checked
					: field.value
			}
			else {
				value = e
			}

			return fn(fieldName, value)
		}
	}
}

// noinspection JSUnusedGlobalSymbols
export default FormManager
