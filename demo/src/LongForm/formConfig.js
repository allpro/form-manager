import cloneDeep from 'lodash/cloneDeep'

import sampleData from './data'
// This demo includes dev-logging output using a supplied tool
import { logFormData } from '../../../src'


// Demo of category/subcategory synchronization
let selectedCategory = sampleData.formData.category

function handleCategoryChange( category, field, form ) {
	if (category !== selectedCategory) {
		// Update the tracker var
		selectedCategory = category

		// Set the correct subcategories list, or a blank list
		const subcategories = sampleData.subcategories[category] || []
		form.state('subcategoryList', subcategories)

		// Always clear the subcategory value when category changes
		form.value('subcategory', '', { validate: true })
	}
}


function validatePassword(value) {
	const lower = /[a-z]/.test(value)
	const upper = /[A-Z]/.test(value)
	const number = /[0-9]/.test(value)
	const errors = []

	if (!lower || !upper) {
		errors.push('{name} must contain both upper and lowercase characters,')
	}
	if (!number) {
		errors.push('{name} must contain at least one number')
	}

	return errors.length ? errors : true
}


const formConfig = {
	initialData: cloneDeep(sampleData.formData),
	initialErrors: cloneDeep(sampleData.formErrors),
	initialState: {
		categoryList: sampleData.categories,
		subcategoryList: sampleData.subcategories[selectedCategory] || []
	},

	onBlur: (value, fieldName, form) => {
		logFormData(form, 'FormManager [any field].onBlur()')
		// console.log('Fields Configuration', form.fieldConfig())
	},

	fieldDefaults: {
		validateOnBlur: true,
		revalidateOnChange: true,

		// DATA CLEANING/REFORMATTING OPTIONS
		trimText: true, // Trim leading-/trailing--spaces
		fixMultiSpaces: true, // Replace multi-spaces/tabs with single space
		monoCaseToProper: false, // Change all UPPER- or lower-case to Proper-Case
		cleanDataOnBlur: true // Clean and REPLACE field-data onBlur
	},

	fields: {
		message: {
			displayName: 'Details',
			validation: {
				required: true,
				minLength: 10,
				maxLength: 512
				// custom: value => /x/.test(value)
				// 	? true
				// 	: '{name} must contain the letter "x"'
			}
		},
		password: {
			displayName: 'Password',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 24,
				custom: validatePassword
			}
		},
		birthdate: {
			displayName: 'Birthdate',
			validateOnChange: true,
			validation: {
				dataType:	'dateISOString',
				date:		true,
				minDate:	'1990-01-01',
				maxDate:	'2000-01-01'
			}
		},
		category: {
			displayName: 'Category',
			onChange: handleCategoryChange,
			validateOnChange: true,
			validation: {
				required: true
			}
		},
		subcategory: {
			displayName: 'Subcategory',
			validateOnChange: true,
			validation: {
				required: true
			}
		},
		'who/gender': {
			displayName: 'Gender',
			aliasName: 'gender',
			display: 'Gender',
			validateOnChange: true,
			validation: {
				required: true
			}
		}
	}
}

export default formConfig
