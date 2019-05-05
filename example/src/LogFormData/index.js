import React, { Component } from 'react'

// This demo includes field-testing output using a supplied tools
import FormManager, { FieldsTestOutput } from '@allpro/form-manager'

import formConfig from './formConfig'


class LongFormDemo extends Component {
	constructor( props ) {
		super(props)

		this.form = FormManager(this, formConfig)
	}

	render() {
		return (
			<div style={{ maxWidth: '800px', margin: '0 auto' }}>
				<FieldsTestOutput form={this.form} />
			</div>
		)
	}
}

export default LongFormDemo
