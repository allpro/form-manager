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

import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers'

import FormButtonsBar from '../FormButtonsBar'

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

		this.form.setFieldConfig('password', {
			onChange: (val, name) => console.log(name, '=', val)
		})

		this.messageInput = React.createRef()
	}

	componentDidMount() {
		// Auto-focus Username field on-load
		// const elem = this.messageInput.current
		// if (elem) elem.focus()
	}

	render() {
		const { form, props } = this
		const { classes } = props

		const textFieldProps = {
			fullWidth: true,
			margin: 'dense',
			FormHelperTextProps: { classes }
		}

		return (
			<Fragment>
				<FormButtonsBar form={form} />

				<section style={styles.formSection}>
					<Typography variant="h6">
						Text & Numbers
					</Typography>

					<TextField
						label="Username"
						{...form.allProps('username')}
						{...textFieldProps}
						inputRef={this.messageInput}
					/>

					<TextField
						label="Password"
						{...form.allProps('password')}
						{...textFieldProps}
					/>

					<TextField
						label="Phone"
						{...form.allProps('phone')}
						{...textFieldProps}
					/>

					<TextField
						label="Profile Tagline"
						{...form.allProps('tagline')}
						{...textFieldProps}
					/>

					<TextField
						label="Age"
						{...form.allProps('age')}
						{...textFieldProps}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="h6">
						Date Pickers
					</Typography>
					<Typography paragraph>
						Valid dates are between Jan-2000 and Jan-2015.
					</Typography>

					<MuiPickersUtilsProvider utils={MomentUtils}>
						<DatePicker
							label="Date Joined (DatePicker)"
							{...form.allProps('dateJoined')}
							// Override type="date" config for DatePicker
							type="text"
							// DatePicker requires the ISO date value
							value={form.getData('dateJoined')}
							// DatePicker does not return a normal event
							onChange={moment => form.onFieldChange('dateJoined', moment.toISOString())}
							fullWidth={true}
							margin="normal"
							// DatePicker options
							format="MMM D, YYYY"
							autoOk
							clearable
						/>
					</MuiPickersUtilsProvider>

					<TextField
						label="Date Joined (native date)"
						{...form.allProps('dateJoined')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Start Time (native time)"
						{...form.allProps('startTime')}
						{...textFieldProps}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Appointment (native datetime)"
						{...form.allProps('appointment')}
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
								{...form.dataProps('remember')}
							/>
						}
					/>

					<FormControlLabel
						label="Remember Me"
						control={
							<Switch
								{...form.dataProps('remember')}
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
						error={form.hasErrors('gender')}
						component="fieldset" // [element-name|Component]
						margin="dense" // [none|normal|dense] Vertical spacing
						fullWidth={false}
					>
						<FormLabel variant="h6" component="legend">
							Select your gender
						</FormLabel>

						<RadioGroup
							{...form.dataProps('gender')}
							error={form.errors('gender')}
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
							{form.errors('gender')}
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
						error={form.hasErrors('category')}
					>
						<InputLabel htmlFor="category">Category</InputLabel>
						<Select
							{...form.dataProps('category')}
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
							{form.errors('category')}
						</FormHelperText>
					</FormControl>


					<FormControl
						error={form.hasErrors('subcategory')}
						fullWidth={true}
						margin="dense"
					>
						<InputLabel htmlFor="form-subcategory">
							Subcategory
						</InputLabel>

						<Select
							{...form.dataProps('subcategory')}
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
							{form.errors('subcategory')}
						</FormHelperText>
					</FormControl>
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
