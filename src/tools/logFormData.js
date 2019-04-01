/**
 * Helper to log form-data using alias-name (if exists) for each field
 *
 * @param {Object} form			Form-Manager instance object
 * @param {string} [label]		Title in log
 */
function logFormData(form, label) {
	console.log(label || 'Form-Manager', {
		'form.data()': form.data(),
		'form.errors()': form.errors(),
		'form.state()': form.state()
	})
}

export default logFormData
