// Class and Hook versions of FormManager
import FormManager from './FormManager'
import useFormManager from './useFormManager'

// Development utilities
import logFormData from './tools/logFormData'

// Date formatter may be useful externally
import formatters from './formatters'
const { date: formatDate } = formatters

export default FormManager
export {
	useFormManager,
	logFormData,
	formatDate,
}
// Export ALL utilities; useful in tests
export * from './utils'
