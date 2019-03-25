import React, { Component, Fragment } from 'react'
import { render } from 'react-dom'
import _ from 'lodash'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

// This demo also includes test output using BOTH dev-helper tools
import FormManager, { FieldsTestOutput, logFormData } from '../../src'
import FormSection from './form'
import sampleData from './data'

// Demo of category/subcategory synchronization
let selectedCategory = sampleData.categories[0].value
function handleCategoryChange( field, category, formManager ) {
	if (category !== selectedCategory) {
		selectedCategory = category
		const subcategories = sampleData.subcategories[category] || []

		// Set the correct subcategories list, or a blank list
		formManager.state( 'subcategoryList', subcategories )
		// Always clear the subcategory value when category changes
		formManager.value( 'subcategory', '' )
	}
}


const formManagerConfig = {
	autoValidate: 'blur', // [change|blur|falsey]
	autoRevalidate: 'change', // [change|blur|falsey]

	fields: {
		category: {
			displayName: 'Category',
			onChange: handleCategoryChange,
			autoValidate: 'change', // on-blur doesn't work for Select, yet
			validation: {
				required: true,
			},
		},
		subcategory: {
			displayName: 'Subcategory',
			autoValidate: 'change', // on-blur doesn't work for Select, yet
			validation: {
				required: true,
			},
		},
		'who/gender': {
			displayName: 'Gender',
			aliasName: 'gender',
			display: 'Gender',
			autoValidate: 'change', // [change|blur|submit]
			validation: {
				required: true,
			},
		},
		message: {
			displayName: 'Details',
			validation: {
				required: true,
				minLength: 10,
			},
		},
	},
	/* ALTERNATE FIELD-CONFIG FORMAT - ARRAY
	 fields: [
	 {
	 name:       'who/gender',
	 alias:      'gender',
	 display:    'Gender',
	 autoValidate: 'change',   // [change|blur|submit]
	 validation: {
	 required: true,
	 }
	 },
	 {
	 name:       'message',
	 display:    'Details',
	 },
	 {
	 name:       'age',
	 validation: {
	 required:       true,
	 dataType:       'integer',
	 numberRange:    [ 18, 120 ],
	 }
	 },
	 ],
	 */
	initialData: _.cloneDeep( sampleData.formData ),
	initialErrors: _.cloneDeep( sampleData.formErrors ),
	initialState: {
		categoryList: sampleData.categories,
		subcategoryList: sampleData.subcategories[selectedCategory],
	},
}


export class Demo extends Component {
	constructor( props ) {
		super(props)

		this.form = FormManager( this, formManagerConfig )
	}

	render() {
		logFormData(this.form, 'Form Manager Data')

		return (
			<Fragment>
				<Card style={{ margin: '24px' }}>
					<CardContent>
						<Typography variant="display1">
							React FormManager Demo
						</Typography>

						<FormSection form={this.form}/>
					</CardContent>
				</Card>

				<FieldsTestOutput form={this.form}/>
			</Fragment>
		)
	}
}


render( <Demo/>, document.querySelector( '#demo' ) )
