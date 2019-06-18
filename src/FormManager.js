import {
	isFunction,
	isObject,
	isString,
	isUndefined
} from './utils'

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
		reset: initForm, 			// ACTION: Reset form data, errors & state.
		render: triggerComponentUpdate,
		update: triggerComponentUpdate,
		revision: getRevision,		// GETTER for formRevision number
		getRevision,				// GETTER for formRevision number

		// FORM-ELEMENT PROPERTY SETTERS (HELPERS)
		getFieldProps,				// HELPER for writing component props
		getMuiErrorProps,			// HELPER for writing component props
		getMuiFieldProps,			// HELPER for writing component props
		// Aliases
		fieldProps: getFieldProps,
		muiErrorProps: getMuiErrorProps,
		allMuiProps: getMuiFieldProps,

		// FORM-ELEMENT EVENT-HANDLERS
		onFieldChange,				// EVENT HANDLER for field.onChange
		onFieldFocus,				// EVENT HANDLER for field.onFocus
		onFieldBlur					// EVENT HANDLER for field.onBlur
	}


	let formRevision = 0

	let formInitialized = false

	// Internal API so sub-components can access internal helper methods
	const internal = { fireEventCallback, triggerComponentUpdate }
	const components = { internal }

	// Config sub-component, internal API
	const config = Config(publicAPI, components)
	config.init(options)
	Object.assign(publicAPI, config.publicAPI)
	components.config = config

	// State sub-component, internal API
	const state = State(publicAPI, components)
	state.init(options.initialState)
	Object.assign(publicAPI, state.publicAPI)
	components.state = state

	// Data sub-component, internal API
	const data = Data(publicAPI, components)
	data.init(options.initialData, extraData)
	Object.assign(publicAPI, data.publicAPI)
	components.data = data

	// Validation sub-component, internal API
	const validation = Validation(publicAPI, components)
	Object.assign(publicAPI, validation.publicAPI)
	components.validation = validation

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

		// Can be called as reset(), so return API
		return publicAPI
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

		return publicAPI
	}


	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @public
	 * @param {string} name    Field-name or alias-name
	 * @param {Object} [opts]    Options, like non-text field details
	 * @returns {*}
	 */
	function getFieldProps( name, opts = { inputType: null } ) {
		const fieldName = aliasToRealName(name)

		const defaults = config.get('fieldDefaults')
		const fieldConfig = Object.assign({}, defaults, config.getField(fieldName))
		const { displayName, disabled, readOnly } = fieldConfig
		const inputType = opts.inputType || fieldConfig.inputType

		const fieldValidations = config.getValidation(fieldName) || {}
		const { required } = fieldValidations

		const value = data.getValue(fieldName)
		const { hasError } = validation

		const props = {
			name: fieldName,
			value,
			'aria-label': displayName || fieldName, // can override in view
			'aria-invalid': hasError(fieldName),
			onChange: onFieldChange,
			onFocus: onFieldFocus,
			onBlur: onFieldBlur
		}

		if (inputType) {
			let type = inputType
			if (type === 'datetime') type = 'datetime-local'
			props.type = type
		}

		if (inputType === 'checkbox') {
			// Checkboxes can only be true or false
			props.checked = config.get('converters').boolean(value)
			// Checkbox values MUST be a string - use default value if not
			if (!isString(value)) props.value = 'on'
		}

		if (required) props.required = true
		if (disabled) props.disabled = true
		if (readOnly) props.readOnly = true

		return props
	}

	/**
	 * PUBLIC HELPER for components to integrate with FormManager.
	 *
	 * @public
	 * @param {string} name    Field-name or alias-name
	 * @returns {Object}        Props for components like a TextField
	 */
	function getMuiErrorProps( name ) {
		return {
			error: validation.hasError(name),
			helperText: validation.getError(name)
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
	function getMuiFieldProps( name, opts = {} ) {
		return {
			...getFieldProps(name, opts),
			...getMuiErrorProps(name)
		}
	}


	/**
	 * Field.onChange event-handler
	 * CURRENTLY the onFocus event is not used , but is included in API
	 *    because may want to add onFocus options in the future.
	 *
	 * @param {(Object|string)} event_name	Event object OR fieldName
	 * @param {*} [value]					Field value
	 * @returns {Promise}					Validation promise
	 */
	function onFieldChange( event_name, value ) {
		const [ name, val ] = parseEvent(event_name, value)
		// Will fire onChange callbacks AFTER updating field-value
		return data.setValue(name, val, { event: 'change' })
	}

	/**
	 * Field.onFocus event-handler
	 * CURRENTLY the onFocus event is not used , but is included in API
	 *	because may want to add onFocus options in the future.
	 *
	 * @param {(Object|string)} event_name	Event object OR fieldName
	 * @param {*} [value]					Field value
	 * @returns {Promise}					Dummy promise for consistency
	 */
	function onFieldFocus( event_name, value ) {
		const [ name, val ] = parseEvent(event_name, value)
		const fieldConfig = config.getField(name)
		if (!fieldConfig) return // INVALID name PASSED; ABORT

		fireEventCallback(fieldConfig.onFocus, val, fieldConfig.name)
		fireEventCallback(config.get('onFocus'), val, fieldConfig.name)

		return Promise.resolve(true) // Return value true means isValid
	}

	/**
	 * Field.onBlur event-handler
	 *
	 * @param {(Object|string)} event_name	Event object OR fieldName
	 * @param {*} [value]					Field value
	 * @returns {Promise}					Validation promise
	 */
	function onFieldBlur( event_name, value ) {
		const [ name, val ] = parseEvent(event_name, value)
		const fieldConfig = config.getField(name)
		if (!fieldConfig) return // INVALID name PASSED; ABORT

		const fieldName = fieldConfig.name
		// const hasError = validation.hasError(fieldName)

		const cleanOnBlur = withFieldDefaults(
			fieldConfig,
			'cleaning.cleanOnBlur'
		)
		if (cleanOnBlur) {
			const newValue = data.cleanValue(val, fieldConfig)
			if (newValue !== val) {
				// Pass 'change' event so will fire event with new value
				data.setValue(fieldName, newValue, { event: 'change' })
			}
		}

		return validation.validate(name, val, 'blur')
		.then(() => {
			// Note: This will run even if validation did not run
			fireEventCallback(fieldConfig.onBlur, val, fieldName)
			fireEventCallback(config.get('onBlur'), val, fieldName)
		})
	}

	function fireEventCallback( func, value, fieldName ) {
		if (isFunction(func)) {
			func(value, fieldName, publicAPI)
		}
	}

	/**
	 * Helper for field event handlers.
	 * Can be a normal event handler OR be called manually with (name, value).
	 *
	 * @param {(Object|string)} event	Event object OR fieldName
	 * @param {*} [value]				Field value
	 * @returns {[string, *]}			Array of [name, value]
	 */
	function parseEvent( event, value ) {
		let fieldName = ''
		let val = value

		if (isString(event)) {
			// A fieldName was passed - method was called manually.
			fieldName = aliasToRealName(event)
			// If value was NOT also passed, then use current value.
			if (isUndefined(val)) {
				val = data.getValue(fieldName)
			}
		}
		// NORMAL fields return an event object
		// noinspection JSUnresolvedVariable
		if (isObject(event) && isObject(event.target)) {
			// noinspection JSUnresolvedVariable
			const field = event.target
			fieldName = aliasToRealName(field.name || '')
			val = /checkbox/.test(field.type || '')
				? field.checked
				: field.value
		}

		return [ fieldName, val ]
	}
}

// noinspection JSUnusedGlobalSymbols
export default FormManager
