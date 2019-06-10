import React from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { useFormManager } from '@allpro/form-manager'
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


function LongFormHookDemo(props) {
	const form = useFormManager(formConfig, props.data)
	const revision = form.getRevision()

	// Allow form access from console
	window.form = form

	return (
		<div style={styles.wrapper}>
			<Card style={styles.card}>
				<CardContent>
					<FormSection form={form} revision={revision} />
				</CardContent>
			</Card>

			<FieldsTestOutput form={form} style={styles.card} />
		</div>
	)
}

LongFormHookDemo.propTypes = {
	data: PropTypes.object
}

export default LongFormHookDemo
