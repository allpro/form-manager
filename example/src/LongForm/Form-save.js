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

import DateFnsUtils from '@date-io/date-fns'
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

		this.messageInput = React.createRef()
	}

	componentDidMount() {
		const elem = this.messageInput.current
		if (elem) elem.focus()
	}

	render() {
		const { form, props } = this
		const { classes } = props

		return (
			<Fragment>
				<FormButtonsBar form={form} />

				<section style={styles.formSection}>
					<Typography variant="title">
						Text & Numbers
					</Typography>
					<Typography paragraph className="form-tip">
						Field is required and has a minimum-length.
					</Typography>

					<TextField
						label="Username"
						{...form.allProps('username')}
						fullWidth={true}
						margin="dense"
						inputRef={this.messageInput}
						FormHelperTextProps={{ classes }}
					/>

					<TextField
						label="Password"
						{...form.allProps('password')}
						fullWidth={true}
						margin="dense"
						FormHelperTextProps={{ classes }}
					/>
				</section>


				<section style={styles.formSection}>
					<TextField
						label="Phone"
						{...form.allProps('phone')}
						margin="dense"
						fullWidth={true}
						FormHelperTextProps={{ classes }}
					/>

					<TextField
						label="Age"
						{...form.allProps('age')}
						margin="dense"
						fullWidth={true}
						FormHelperTextProps={{ classes }}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
						Date Pickers
					</Typography>
					<Typography paragraph className="form-tip">
						Valid dates are between Jan-2000 and Jan-2015.
					</Typography>

					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<DatePicker
							label="Date Joined (DatePicker)"
							{...form.allProps('dateJoined')}
							// Override type="date" config for DatePicker
							type="text"
							// DatePicker requires the ISO date value
							value={form.getData('dateJoined')}
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
						{...form.allProps('dateJoined')}
						fullWidth={true}
						margin="normal"
						FormHelperTextProps={{ classes }}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Start Time (native time)"
						{...form.allProps('startTime')}
						fullWidth={true}
						margin="normal"
						FormHelperTextProps={{ classes }}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						label="Appointment (native datetime)"
						{...form.allProps('appointment')}
						fullWidth={true}
						margin="normal"
						FormHelperTextProps={{ classes }}
						InputLabelProps={{ shrink: true }}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
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
					<Typography variant="title">
						Radio Buttons
					</Typography>

					<Typography paragraph className="form-tip">
						Errors display inside a FormHelperText element.
					</Typography>

					<FormControl
						error={form.hasErrors('gender')}
						component="fieldset" // [element-name|Component]
						margin="dense" // [none|normal|dense] Vertical spacing
						fullWidth={false}
					>
						<FormLabel variant="title" component="legend">
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
							/>
							<FormControlLabel
								value="female"
								label="Female"
								control={<Radio color="secondary" />}
							/>
							<FormControlLabel
								value="other"
								label="Other"
								control={<Radio color="default" />}
							/>
							<FormControlLabel
								value="disabled"
								label="Disabled"
								control={<Radio color="primary" />}
								disabled
							/>
						</RadioGroup>

						<FormHelperText classes={classes}>
							{form.errors('who/gender')}
						</FormHelperText>
					</FormControl>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
						Synced Picklists
					</Typography>

					<Typography paragraph className="form-tip">
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
