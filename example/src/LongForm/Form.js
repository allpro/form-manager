import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Switch from '@material-ui/core/Switch'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'

import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers'

const styles = {
	formSection: {
		borderTop: '1px dotted #999',
		paddingTop: '16px',
		marginTop: '24px'
	},
	formSectionTop: {}
}

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


class FormSection extends Component {
	constructor( props ) {
		super(props)

		this.form = props.form

		this.messageInput = React.createRef()
	}

	componentDidMount() {
		// Auto-focus Username field on-load
		// const elem = this.messageInput.current
		// if (elem) elem.focus()
	}

	render() {
		const { form, props } = this
		const { classes, title } = props

		const textFieldProps = {
			fullWidth: true,
			margin: 'dense',
			FormHelperTextProps: { classes }
		}

		return (
			<Fragment>
				<Typography variant="h6">
					{title || 'Sample Custom Form'}
				</Typography>

				<Typography paragraph>
					Can access the <b><code>form</code></b> object in browser console.
				</Typography>

				<section style={styles.formSection}>
					<Typography variant="h6">
						Text & Numbers
					</Typography>

					<TextField
						label="Username"
						{...form.allMuiProps('username')}
						{...textFieldProps}
						inputRef={this.messageInput}
					/>

					<TextField
						label="Password"
						{...form.allMuiProps('password')}
						{...textFieldProps}
					/>

					<TextField
						label="Phone"
						{...form.allMuiProps('phone')}
						{...textFieldProps}
					/>

					<TextField
						label="Profile Tagline"
						{...form.allMuiProps('tagline')}
						{...textFieldProps}
					/>

					<TextField
						label="Age"
						{...form.allMuiProps('age')}
						{...textFieldProps}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						Date Pickers
					</Typography>
					<Typography paragraph>
						The Date Joined cannot be before&nbsp;
						{form.getFieldValidation('dateJoined').minDate}
					</Typography>

					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<DatePicker
							label="Date Joined (DatePicker)"
							{...form.allMuiProps('dateJoined')}
							// Override type="date" config for DatePicker
							type="text"
							// DatePicker requires the ISO date value
							value={form.getFieldData('dateJoined')}
							// DatePicker does not return a normal event
							onChange={moment => form.onFieldChange('dateJoined', moment.toISOString())}
							fullWidth={true}
							margin="normal"
							// DatePicker options
							format="MMM d, yyyy"
							autoOk
							clearable
						/>
					</MuiPickersUtilsProvider>

					<TextField
						label="Date Joined (native date)"
						{...form.allMuiProps('dateJoined')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Start Time (native time)"
						{...form.allMuiProps('startTime')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Appointment (native datetime)"
						{...form.allMuiProps('appointment')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						Selection Controls
					</Typography>

					<FormControlLabel
						label="Remember Me"
						control={
							<Checkbox
								{...form.fieldProps('remember')}
							/>
						}
					/>

					<FormControlLabel
						label="Remember Me"
						control={
							<Switch
								{...form.fieldProps('remember')}
							/>
						}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						Radio Buttons
					</Typography>
					<Typography paragraph>
						Errors display inside a FormHelperText element.
					</Typography>

					<FormControl
						error={form.hasError('gender')}
						component="fieldset" // [element-name|Component]
						margin="dense" // [none|normal|dense] Vertical spacing
						fullWidth={false}
					>
						<FormLabel variant="h6" component="legend">
							Select your gender
						</FormLabel>

						<RadioGroup
							{...form.fieldProps('gender')}
							error={form.error('gender')}
							aria-label="gender"
						>
							<FormControlLabel
								value="male"
								label="Male"
								control={<Radio color="primary" />}
								disabled={form.isDisabled('gender')}
							/>
							<FormControlLabel
								value="female"
								label="Female"
								control={<Radio color="secondary" />}
								disabled={form.isDisabled('gender')}
							/>
							<FormControlLabel
								value="other"
								label="Other"
								control={<Radio color="default" />}
								disabled={form.isDisabled('gender')}
							/>
							<FormControlLabel
								value="disabled"
								label="Disabled"
								control={<Radio color="primary" />}
								disabled
							/>
						</RadioGroup>

						<FormHelperText classes={classes}>
							{form.error('gender')}
						</FormHelperText>
					</FormControl>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						Synced Picklists
					</Typography>
					<Typography paragraph>
						Both fields are required.
						Select a category and the subcategories will change.
					</Typography>

					<FormControl
						fullWidth={true}
						margin="dense" // [none|normal|dense] Vertical spacing
						error={form.hasError('category')}
					>
						<InputLabel htmlFor="category">Category</InputLabel>
						<Select
							{...form.fieldProps('category')}
							input={
								<Input
									id="form-category"
									name="form-category"
								/>
							}
						>
							<MenuItem value="" />
							{form.state('categoryList').map(item => (
								<MenuItem value={item.value} key={item.value}>
									{item.display}
								</MenuItem>
							))}
						</Select>

						<FormHelperText classes={classes}>
							{form.error('category')}
						</FormHelperText>
					</FormControl>


					<FormControl
						error={form.hasError('subcategory')}
						fullWidth={true}
						margin="dense"
					>
						<InputLabel htmlFor="form-subcategory">
							Subcategory
						</InputLabel>

						<Select
							{...form.fieldProps('subcategory')}
							input={
								<Input
									id="form-subcategory"
									name="subcategory"
								/>
							}
						>
							<MenuItem value="" />
							{form.state('subcategoryList').map(item => (
								<MenuItem value={item.value} key={item.value}>
									{item.display}
								</MenuItem>
							))}
						</Select>

						<FormHelperText classes={classes}>
							{form.error('subcategory')}
						</FormHelperText>
					</FormControl>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						State-Values
					</Typography>
					<Typography paragraph>
						These fields are designated as <em>state</em> instead
						of <em>data</em> - <code>{'{'} isData: false {'}'}</code>
					</Typography>

					<TextField
						label="User Feedback"
						{...form.allMuiProps('feedback')}
						{...textFieldProps}
					/>

					<FormControlLabel
						label="Like This Form?"
						{...form.fieldProps('like')}
						control={
							<Switch />
						}
					/>
				</section>
			</Fragment>
		)
	}
}


const { object } = PropTypes

FormSection.propTypes = {
	form: object.isRequired,
	classes: object.isRequired
}

export default withStyles(helperTextStyles)(FormSection)
