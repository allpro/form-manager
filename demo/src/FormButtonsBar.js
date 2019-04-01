import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'

function FormButtonsBar(props) {
	const { form, styles } = props

	return (
		<section style={styles}>
			<Button
				color="primary"
				variant="contained"
				style={{ margin: '10px 0 10px 10px' }}
				onClick={form.validate}
			>
				Validate All
			</Button>

			<Button
				color="secondary"
				variant="contained"
				style={{ margin: '10px 0 10px 10px' }}
				onClick={form.reset}
			>
				Reset Form
			</Button>
		</section>

	)
}

const { object } = PropTypes

FormButtonsBar.propTypes = {
	form: object.isRequired,
	styles: object
}

export default FormButtonsBar
