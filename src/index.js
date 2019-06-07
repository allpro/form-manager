// Class and Hook versions of FormManager
import FormManager from './FormManager'
import useFormManager from './useFormManager'

// Development utilities
import logFormData from './tools/logFormData'

// Date utilities; may be useful externally
import formatters from './formatters'
const { date: formatDate, toMoment } = formatters

export default FormManager
export {
	useFormManager,
	logFormData,
	formatDate,
	toMoment
}
