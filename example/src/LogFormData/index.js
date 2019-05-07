import React, { Component } from 'react'

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
				<FieldsTestOutput form={this.form} />
			</div>
		)
	}
}

export default LongFormDemo
