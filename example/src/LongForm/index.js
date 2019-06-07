import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import FormManager from '@allpro/form-manager'
import { FieldsTestOutput } from '@allpro/form-manager-devtools'

import FormSection from './Form'
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
		flex: '300px 1 0',
		maxWidth: '600px',
		margin: '12px'
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
			<div style={styles.wrapper}>
				<Card style={styles.card}>
					<CardContent>
						<FormSection form={this.form}/>
					</CardContent>
				</Card>

				<FieldsTestOutput form={this.form} style={styles.card} />
			</div>
		)
	}
}

export default LongFormDemo
