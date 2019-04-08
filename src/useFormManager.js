import { useState } from 'react'
import PropTypes from 'prop-types'

import FormManager from './'


function useFormManager( formConfig, data) {
	// noinspection JSUnusedLocalSymbols
	const [ rev, setRevision ] = useState(0) // eslint-disable-line
	const [ formManager ] = useState(() => (
		FormManager(setRevision, formConfig, data)
	))

	return formManager
}

const { object } = PropTypes

useFormManager.propTypes = {
	formConfig: object,
	data: object
}

export default useFormManager
