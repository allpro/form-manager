import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import FormManager from '@allpro/form-manager'
import { FieldsTestOutput, FormButtonsBar } from '@allpro/form-manager-devtools'

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

		this.form = FormManager(this, formConfig, props.data)

		// Allow form access from console
		window.form = this.form
	}

	render() {
		const { form } = this

		return (
			<div style={styles.wrapper}>
				<Card style={styles.card}>
					<FormButtonsBar form={form} />

					<CardContent>
						<FormSection
							form={form}
							title="Sample Class Form"
						/>
					</CardContent>
				</Card>

				<FieldsTestOutput form={form} style={styles.card} />
			</div>
		)
	}
}

export default LongFormDemo
