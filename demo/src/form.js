import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

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

const styles = {
	formSection: {
		borderTop: '1px dotted #999',
		paddingTop: '12px',
		marginTop: '18px',
	},
	hidden: {
		display: 'none',
	},
}


class FormSection extends Component {
	constructor( props ) {
		super( props )

		this.form = props.form

		this.messageInput = React.createRef()
	}

	componentDidMount() {
		const elem = this.messageInput.current
		if (elem) elem.focus()
	}

	render() {
		const { form } = this

		return (
			<Fragment>
				<section style={styles.formSection}>
					<Typography variant="title">
						Category/Subcategory Synced Fields Example
						<span className="field-required-mark"/>
					</Typography>

					<Typography variant="body1" className="form-tip">
						Select a category and the subcategories will change. If
						no category
						is selected, subcategories is blank.
					</Typography>

					<FormControl
						fullWidth={true}
						margin="dense" // [none|normal|dense] Vertical spacing
						error={form.hasErrors( 'category' )}
					>
						<InputLabel htmlFor="category">Category</InputLabel>
						<Select
							{...form.dataProps( 'category' )}
							input={
								<Input name="form-category" id="form-category"/>
							}
						>
							<MenuItem value=""/>
							{form.state( 'categoryList' ).map( item => (
								<MenuItem value={item.value} key={item.value}>
									{item.display}
								</MenuItem>
							) )}
						</Select>
						<FormHelperText className="hide-when-empty">
							{form.errors( 'category' )}
						</FormHelperText>
					</FormControl>

					<FormControl
						fullWidth={true}
						margin="dense"
						error={form.hasErrors( 'subcategory' )}
					>
						<InputLabel htmlFor="form-subcategory">
							Subcategory
						</InputLabel>
						<Select
							{...form.dataProps( 'subcategory' )}
							input={<Input name="subcategory"
								id="form-subcategory"/>}
						>
							<MenuItem value=""/>
							{form.state( 'subcategoryList' ).map( item => (
								<MenuItem value={item.value} key={item.value}>
									{item.display}
								</MenuItem>
							) )}
						</Select>
						<FormHelperText className="hide-when-empty">
							{form.errors( 'subcategory' )}
						</FormHelperText>
					</FormControl>
				</section>

				<section style={styles.formSection}>
					<Typography variant="title">Text Field Example</Typography>
					<Typography variant="body1" className="form-tip">
						This field is required, and has a minimum-length.
						Validation happens onBlur UNLESS currently is showing an
						error. Once error is fixed, will not validate again until
						onBlur again. This may change in future.
					</Typography>

					<TextField
						label="Details of Issue"
						{...form.dataProps( 'message' )}
						{...form.errorProps( 'message' )}
						fullWidth={true}
						margin="dense"
						multiline
						rowsMax="8"
						inputRef={this.messageInput}
					/>
				</section>

				<section style={styles.formSection}>
					<Typography variant="title">Radio Buttons
						Example</Typography>
					<Typography variant="body1" className="form-tip">
						This field has a FormLabel. It has a default value of
						&quot;Other&quot;.
					</Typography>

					<FormControl
						component="fieldset" // [element-name|Component]
						required={true}
						margin="dense" // [none|normal|dense] Vertical spacing
						fullWidth={false}
						error={form.hasErrors( 'gender' )}
					>
						<FormLabel variant="title" component="legend">
							Select your gender
						</FormLabel>
						<RadioGroup
							{...form.dataProps( 'gender' )}
							error={form.errors( 'gender' )}
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
						<FormHelperText
							style={form.hasErrors('gender') ? '' : styles.hidden}
						>
							{form.errors( 'who/gender' )}
						</FormHelperText>
					</FormControl>
				</section>
			</Fragment>
		)
	}
}


FormSection.propTypes = {
	form: PropTypes.object.isRequired,
}

export default FormSection
