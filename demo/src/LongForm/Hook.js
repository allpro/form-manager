import React from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

// This demo also includes test output using BOTH dev-helper tools
import { useFormManager, FieldsTestOutput } from '../../../src'

import FormSection from './form'
import formConfig from './formConfig'


const styles = {
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		margin: '0 auto'
	},
	column: {
		flex: '300px 1 0',
		maxWidth: '500px',
		border: '1px solid rgba(0,0,0,0.14)',
		// padding: 0,
		margin: '12px'
	}
}


function LongFormHookDemo(props) {
	const form = useFormManager(formConfig, props.data)
	const revision = form.getRevision()

	return (
		<div style={styles.wrapper}>
			<Card style={styles.column}>
				<CardContent>
					<FormSection form={form} revision={revision} />
				</CardContent>
			</Card>

			<FieldsTestOutput form={form} style={styles.column} />
		</div>
	)
}

LongFormHookDemo.propTypes = {
	data: PropTypes.object
}

export default LongFormHookDemo
