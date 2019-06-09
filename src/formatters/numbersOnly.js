import { isNumber, isString } from '../utils'

const formatNumbersOnly = value => (
	isNumber(value)
		? value + '' // coerce to a string
		: isString(value)
			? (value.match(/[0-9]/g) || []).join('')
			: value // Unknown data-type
)

export default formatNumbersOnly
