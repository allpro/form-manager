import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import isDate from 'lodash/isDate'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
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
import convertTo from '../../../src/converters'

const styles = {
	formSection: {
		borderTop: '1px dotted #999',
		paddingTop: '16px',
		marginTop: '24px'
	},
	formSectionTop: {
	}
}

const helperTextStyles = {
	root: {
		whiteSpace: 'pre-line', // Puts each error-message on its own line
		lineHeight: '1.3em',
		display: 'none' // Hide blocks when not in error-state
	},
	error: {
		display: 'block',
	}
}


const datePickerValue = val => (isDate(val) ? convertTo.dateString(val) : val)


class FormSection extends Component {
	constructor(props) {
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
						MUI Text Fields
					</Typography>
					<Typography variant="body1" className="form-tip">
						Field is required and has a minimum-length.
					</Typography>

					<TextField
						label="Details of Issue"
						{...form.allProps('message')}
						fullWidth={true}
						margin="dense"
						multiline
						rowsMax="8"
						inputRef={this.messageInput}
						FormHelperTextProps={{ classes }}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
						Multiple Rule Field
					</Typography>
					<Typography variant="body1" className="form-tip">
						Uses both standard and custom validators.
						Custom validator adds <em>multiple</em> error messages.
					</Typography>

					<TextField
						label="Password"
						type="password"
						{...form.allProps('password')}
						fullWidth={true}
						margin="dense"
						FormHelperTextProps={{ classes }}
					/>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
						Date Pickers
					</Typography>
					<Typography variant="body1" className="form-tip">
						Valid dates are between Jan-1990 and Jan-2000.
					</Typography>

					<TextField
						label="Birthdate (native)"
						type="date"
						{...form.allProps('birthdate')}
						value={datePickerValue(form.value('birthdate'))}
						fullWidth={true}
						margin="dense"
						FormHelperTextProps={{ classes }}
						InputLabelProps={{
							shrink: true,
						}}
					/>
				</section>

				<section style={styles.formSection}>
					<MuiPickersUtilsProvider utils={DateFnsUtils}>
						<DatePicker
							label="Birthdate (picker)"
							{...form.dataProps('birthdate')}
							value={datePickerValue(form.value('birthdate'))}
							format="MMM d, yyyy"
							autoOk
							clearable
							onChange={date => {
								form.value('birthdate', date)
							}}
						/>
					</MuiPickersUtilsProvider>

					<FormControl
						fullWidth={true}
						margin="none" // [none|normal|dense] Vertical spacing
						error={form.hasErrors('birthdate')}
					>
						<FormHelperText classes={classes}>
							{form.error('birthdate')}
						</FormHelperText>
					</FormControl>
				</section>


				<section style={styles.formSection}>
					<Typography variant="title">
						Synced MUI Picklists
					</Typography>

					<Typography variant="body1" className="form-tip">
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
								<Input name="form-category" id="form-category"/>
							}
						>
							<MenuItem value=""/>
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
								<Input name="subcategory" id="form-subcategory"/>
							}
						>
							<MenuItem value=""/>
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
					<Typography variant="title">
						MUI Radio Buttons
					</Typography>

					<Typography variant="body1" className="form-tip">
						Errors display inside a FormHelperText element.
					</Typography>

					<FormControl
						error={form.hasErrors('gender')}
						component="fieldset" // [element-name|Component]
						required={true}
						margin="dense" // [none|normal|dense] Vertical spacing
						fullWidth={false}
					>
						<FormLabel variant="title" component="legend">
							Select your gender
						</FormLabel>

						<RadioGroup
							{...form.dataProps('gender')}
							error={form.error('gender')}
							aria-label="gender"
						>
							<FormControlLabel
								value="male"
								label="Male"
								control={<Radio color="primary"/>}
							/>
							<FormControlLabel
								value="female"
								label="Female"
								control={<Radio color="secondary"/>}
							/>
							<FormControlLabel
								value="other"
								label="Other"
								control={<Radio color="default"/>}
							/>
							<FormControlLabel
								value="disabled"
								label="Disabled"
								control={<Radio color="primary"/>}
								disabled
							/>
						</RadioGroup>

						<FormHelperText classes = {classes}>
							{form.error('who/gender')}
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
