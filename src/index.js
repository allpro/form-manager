// Class and Hook versions of FormManager
import FormManager from './FormManager'
import useFormManager from './useFormManager'

// Development utilities
import FieldsTestOutput from './tools/FieldsTestOutput'
import logFormData from './tools/logFormData'

// Date utilities; may be useful beyond form value formatting
import formatDate, { toMoment } from './formatters/formatDate'

export default FormManager
export {
	useFormManager,
	FieldsTestOutput,
	logFormData,
	formatDate,
	toMoment
}
