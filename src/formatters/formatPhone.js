const reDissectParts = /([01]+)?([0-9]{0,3})([0-9]{3})([0-9]{4})(.+)?/

const formatPhone = (value, template) => {
	if (!value) return ''

	const numbers = value.replace( /[^0-9]/g, '' )
	const parts = numbers.match( reDissectParts )

	if (parts) {
		let display = `${parts[3]}-${parts[4]}`

		if (parts[2]) {
			display = `${parts[2]}-${display}`
		}
		if (parts[1]) {
			display = `${parts[1]}-${display}`
		}
		if (parts[5]) {
			display = `${display} ${parts[5]}`
		}

		return display
	}

	// If parsing failed, return the original value
	return value
}

export default formatPhone
