import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'

import FormManager from '@allpro/form-manager'
import { FieldsTestOutput } from '@allpro/form-manager-devtools'

import formConfig from './formConfig'


const styles = {
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		margin: '0 auto'
	},
	card: {
		maxWidth: '800px',
		margin: '0 0 12px'
	}
}


class LongFormDemo extends Component {
	constructor( props ) {
		super(props)

		this.form = FormManager(this, formConfig)

		// Allow form access from console
		window.form = this.form
	}

	render() {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto' }}>
				<Typography variant="h6" style={styles.card}>
					NOTE: The <code>FieldsTestOutput</code> helper is in a
					separate dev-helpers package to avoid bloating
					FormManager: <a
						href="https://www.npmjs.com/package/@allpro/form-manager-devtools"
						target="_blank"
						rel="noopener noreferrer"
					>
						Form-Manager-DevTools
					</a>
				</Typography>

				<FieldsTestOutput
					form={this.form}
					style={styles.card}
				/>
			</div>
		)
	}
}

export default LongFormDemo
