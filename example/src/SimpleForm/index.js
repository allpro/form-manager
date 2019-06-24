import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
/* Unused Controls
import Switch from '@material-ui/core/Switch'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
*/

// import FormManager from '@allpro/form-manager' // React Class version
import { useFormManager } from '@allpro/form-manager' // React Hook version
import { FormButtonsBar } from '@allpro/form-manager-devtools'

import sampleData from './data'


const helperTextStyles = {
	root: {
		whiteSpace: 'pre-line', // Puts each error-message on its own line
		lineHeight: '1.3em',
		display: 'none' // Hide blocks when not in error-state
	},
	error: {
		display: 'block'
	}
}

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


const formConfig = {
	initialState: {
		feedback: ''
	},

	fieldDefaults: {
		validateOnBlur: true,
		revalidateOnChange: true,

		// TEXT-FIELD CLEANING/FORMATTING OPTIONS
		cleaning: {
			cleanOnBlur: true,	// Clean field-text onBlur
			trim: true,			// Trim leading & trailing spaces
			trimInner: true		// Replace multi-spaces/tabs with a single space
		}
	},

	fields: {
		username: {},
		password: {},
		'profile.tagline': {
			aliasName: 'tagline'
		},
		'profile.homePhone': {
			aliasName: 'phone',
			cleaning: { reformat: 'phone' },
			validation: { phone: true }
		},
		feedback: {
			isData:   false
		},
		remember: {
			inputType: 'checkbox'
		},
		appointment: {
			valueType: ['date', 'datetime-input'],
			inputType: 'datetime',
		},
	}
}


function SimpleFormDemo(props) {
	const { classes } = props

	const form = useFormManager(formConfig, sampleData)
	// const revision = form.getRevision()

	// Allow form access from console
	window.form = form

	const textFieldProps = {
		fullWidth: true,
		margin: 'dense',
		FormHelperTextProps: { classes }
	}

	console.log(`"${form.value('phone')}"`)

	return (
		<div style={styles.wrapper}>
			<Card style={styles.card}>
				<FormButtonsBar form={form} />

				<CardContent>
					<Typography variant="h6">
						Simple Form
					</Typography>

					<TextField
						label="Username"
						{...form.allMuiProps('username')}
						{...textFieldProps}
					/>

					<TextField
						label="Password"
						{...form.allMuiProps('password')}
						{...textFieldProps}
					/>

					<FormControlLabel
						label="Remember Me"
						control={
							<Checkbox
								{...form.fieldProps('remember')}
							/>
						}
					/>

					<TextField
						label="Tagline"
						{...form.allMuiProps('tagline')}
						{...textFieldProps}
					/>

					<TextField
						label="User Feedback (state)"
						{...form.allMuiProps('feedback')}
						{...textFieldProps}
					/>

					<TextField
						label="Phone"
						{...form.allMuiProps('phone')}
						{...textFieldProps}
					/>

					<TextField
						label="Appointment (native datetime)"
						{...form.allMuiProps('appointment')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>
				</CardContent>
			</Card>
		</div>
	)
}

export default withStyles(helperTextStyles)(SimpleFormDemo)
