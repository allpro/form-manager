import assign from 'lodash/assign'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import utils from './utils'
// Extract utils for code brevity
const { getObjectValue, setObjectValue } = utils


const defaultFormState = {
	// TODO: need to track load-values so know if current value is the same
	// isDirty:		false,	// true if ANY field has changed
	// hasErrors:	false,	// true if ANY field has an error
	// Standard FormControl state keys
	// dirty:		false,
	// adornedStart:	false,
}


/**
 * FormManager sub-component to handle form-field data
 *
 * @param {Object} formManager  	FormManager instance object
 * @param {Object} components		Hash of FormManager sub-components
 * @returns {Object}             	Config API for this instance
 * @constructor
 */
function State( formManager, components ) {
	// Auto-instantiate so 'new' keyword is NOT required
	// (It's best practice to not require 'new' as it's an internal design)
	if (!(this instanceof State)) {
		return new State(formManager, components)
	}

	const { internal } = components

	// Extract helper methods for brevity
	const { triggerComponentUpdate } = internal

	// Form-State cache - data accessible only via config methods
	let stateOfForm = cloneDeep(defaultFormState)

	return {
		init,
		get: getState,
		set: setState,

		// Methods exposed in FormManager API
		publicAPI: {
			setState,			// SETTER
			getState,			// GETTER
			// ALIASES
			state: getState
		}
	}


	/**
	 * Init form state - also aliased as reset()
	 *
	 * @param {Object} [initialState]
	 */
	function init( initialState = {} ) {
		stateOfForm = cloneDeep(defaultFormState)
		merge(stateOfForm, initialState)
	}

	/**
	 * PUBLIC GETTER for values in the ROOT of state
	 *
	 * @public
	 * @param {string} [key]		Path in state to return
	 * @param {Object} opts        	Clone-value option
	 * @returns {*}                	All form-state OR just specific key requested
	 */
	function getState( key, opts = {} ) {
		const getOpts = assign({ cloneValue: true }, opts)
		// If a key is passed, then return value for just that, if exists
		if (key) return getObjectValue(stateOfForm, key, getOpts)

		// Return a deep clone to ensure state cannot be mutated
		return cloneDeep(stateOfForm)
	}

	/**
	 * PUBLIC SETTER for values in the ROOT of state
	 *
	 * @public
	 * @param {(Object|string)} key  	Path OR a hash of data to set
	 * @param {*} [value]               Value to SET, if key is a string
	 * @param {Object} [opts]           Options, like { cloneValue: false }
	 */
	function setState( key, value, opts = {} ) {
		const setOpts = assign({ cloneValue: true, update: true }, opts)
		setObjectValue(stateOfForm, key, value, setOpts)

		if (setOpts.update) triggerComponentUpdate()
	}
}

export default State
