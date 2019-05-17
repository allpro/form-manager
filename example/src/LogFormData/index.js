import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'

import FormManager from '@allpro/form-manager'
import { FieldsTestOutput } from '@allpro/form-manager-devtools'

import formConfig from './formConfig'


class LongFormDemo extends Component {
	constructor( props ) {
		super(props)

		this.form = FormManager(this, formConfig)
	}

	render() {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto' }}>
				<Typography variant="h6">
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

				<FieldsTestOutput form={this.form} />
			</div>
		)
	}
}

export default LongFormDemo
