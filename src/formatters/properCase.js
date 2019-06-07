/**
 * Helper to reformat text as Proper Case
 */

const formatProperCase = (text, force) => {
	// handle incorrect data-type, like Null
	if (!text) return ''

	// IGNORE text that is already mixed case
	if (!force) {
		const mixedCase = text !== text.toUpperCase() && text !== text.toLowerCase()
		if (mixedCase) return text
	}

	return text.toLowerCase().replace(/^(.)|[\s/-](.)/g, $1 => $1.toUpperCase())
}

export default formatProperCase
