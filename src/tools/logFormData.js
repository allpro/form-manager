/**
 * Development helper that logs all form-data using specified alias-names
 * The fieldnames shown in the console should be used in the components
 * @example <TextField {form.value('first_name') /> // first_name is an alias
 */

import { formatDate } from '../formatters'

// THESE ARE JUST DEMO HELPERS - not needed in real form
const getFieldValue = (field, form) => {
	const dataType = (field.validation || {}).dataType || 'text'
	const value = form.value(field.name)

	if (dataType === 'date' && value) {
		return formatDate(value, 'date-input-field')
	}
	else if (dataType === 'boolean') {
		// For boolean fields, 'value' is actually the 'checked' attribute
		if (typeof value === 'string') {
			return value === 'true'
		}
		else if (typeof value !== 'boolean') {
			return false
		}
	}

	return value
}

/**
 * Helper to log form-data using alias-name (if exists) for each field
 *
 * @param {Object} form
 * @param {string} label
 */
function logFormData(form, label) {
	const formFields = form.fieldConfig()
	const formData = {}

	for (const fieldName in formFields) {
		const field = formFields[fieldName]
		const alias = field.aliasName || fieldName
		formData[alias] = getFieldValue(field, form)
	}

	console.log(label || 'Form Fields:', formData)
}

export default logFormData
