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


const formConfig = {
	initialData: cloneDeep(sampleData.formData),
	initialErrors: cloneDeep(sampleData.formErrors),
	initialState: {
		categoryList: sampleData.categories,
		subcategoryList: sampleData.subcategories[selectedCategory] || []
	},

	onBlur: (value, fieldName, form) => {
		logFormData(form, 'FormManager [any field].onBlur()')
		// console.log('Fields Configuration', form.getFieldConfig())
	},

	fieldDefaults: {
		isMUIControl: true, // These demos are using Material UI controls

		validateOnBlur: true,
		revalidateOnChange: true,

		// TEXT-FIELD CLEANING/FORMATTING OPTIONS
		cleaning: {
			cleanOnBlur: true, // Clean field-text onBlur
			trim: true, // Trim leading-/trailing--spaces
			trimInner: true, // Replace multi-spaces/tabs with single space
			monoCaseToProper: false // Change UPPER- or lower-case to Proper-Case
		}
	},

	fields: {
		username: {
			displayName: 'Username',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 20,
				custom: value => value.test(/[^0-9a-z-]/gi)
					? '{name} can contain only numbers, letters and dashes'
					: true
			}
		},
		password: {
			displayName: 'Password',
			inputType: 'password',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 24,
				password: { lower: 1, upper: 1, number: 1, symbol: 1 }
			}
		},
		remember: {
			displayName: 'Remember Me',
			dataType: 'boolean',
			inputType: 'checkbox'
		},
		age: {
			displayName: 'Your Age',
			dataType: 'integer',
			inputType: 'number',
			validation: {
				minNumber: v => v >= 18 ? true : 'You must be at least 18',
				maxNumber: v => v >= 130 ? true : 'This is an invalid age'
			}
		},
		dateJoined: {
			displayName: 'Date Joined',
			dataType: 'dateISO',
			valueType: ['date', 'date-input'],
			inputType: 'date',
			validateOnChange: true,
			validation: {
				date: true,
				minDate: '2000-01-01',
				maxDate: '2015-01-01'
			}
		},
		'profile.homePhone': {
			displayName: 'Phone Numbers',
			aliasName: 'phone',
			dataFormat: 'numbersOnly',
			cleaning: {
				reformat: 'phone',
			},
			validation: {
				required: true,
				phone: true
			}
		},
		'profile.gender': {
			displayName: 'Gender',
			aliasName: 'gender',
			validateOnChange: true,
			validation: {
				required: true
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
		}
	}
}

export default formConfig
