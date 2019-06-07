import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

function FormButtonsBar(props) {
	const { form, styles } = props

	return (
		<section style={styles}>
			<Button
				variant="contained"
				color="primary"
				style={{ margin: '10px 0 10px 10px' }}
				onClick={form.validateAll}
			>
				Validate All
			</Button>

			<Button
				variant="contained"
				color="secondary"
				style={{ margin: '10px 0 10px 10px' }}
				onClick={form.reset}
			>
				Reset Form
			</Button>

			<div style={{ display: 'inline-block' }}>
				<Button
					variant="contained"
					color="default"
					style={{ margin: '10px 0 10px 10px' }}
					onClick={() => form.setDefaultDisabled(true)}
				>
					Disable All
				</Button>

				<Button
					variant="contained"
					color="default"
					style={{ margin: '10px 0 10px 10px' }}
					onClick={() => form.setDefaultDisabled(false)}
				>
					Un-Disable
				</Button>
			</div>

			<Typography variant="subtitle1" style={{ marginTop: '12px' }}>
				Can access <b><code>form</code></b> object in console.
			</Typography>
		</section>

	)
}

const { object } = PropTypes

FormButtonsBar.propTypes = {
	form: object.isRequired,
	styles: object
}

export default FormButtonsBar
