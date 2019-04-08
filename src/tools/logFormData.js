/**
 * Helper to log form-data using alias-name (if exists) for each field
 *
 * @param {Object} form   		Form-Manager instance object
 * @param {string} [label]      Title in log
 */
function logFormData( form, label ) {
	console.log(label || 'FormManager', {
		'form.isDirty()': form.isDirty(),
		'form.getChanges()': form.getChanges(),
		'form.getData()': form.getData(),
		'form.getValues()': form.getValues(),
		'form.getState()': form.getState(),
		'form.getErrors()': form.getErrors()
	})
}

export default logFormData
