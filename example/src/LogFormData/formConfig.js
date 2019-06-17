// This demo includes dev-logging output using a supplied tool
import { logFormData, cloneDeep } from '@allpro/form-manager'

import sampleData from './data'


// Demo of category/subcategory synchronization
let selectedCategory = sampleData.formData.category

function handleCategoryChange( category, field, form ) {
	if (category !== selectedCategory) {
		// Update the tracker var
		selectedCategory = category

		// Set the correct subcategories list, or a blank list
		const subcategories = sampleData.subcategories[category] || []
		form.setState('subcategoryList', subcategories)

		// Always clear the subcategory value when category changes
		form.setValue('subcategory', '', { validate: true })
	}
}


const formConfig = {
	initialData: cloneDeep(sampleData.formData),
	initialErrors: cloneDeep(sampleData.formErrors),
	initialState: {
		categoryList: sampleData.categories,
		subcategoryList: sampleData.subcategories[selectedCategory] || []
	},

	onBlur: ( value, fieldName, form ) => {
		logFormData(form, `FormManager [${fieldName}].onBlur()`)
		// console.log('Fields Configuration', form.getFieldsConfig())
	},

	fieldDefaults: {
		validateOnBlur: true,
		revalidateOnChange: true,

		// TEXT-FIELD CLEANING/FORMATTING OPTIONS
		cleaning: {
			cleanOnBlur: true, // Clean field-text onBlur
			trim: true, // Trim leading-/trailing--spaces
			trimInner: true // Replace multi-spaces/tabs with single space
		}
	},

	fields: {
		username: {
			displayName: 'Username',
			validation: {
				required: true,
				minLength: 8,
				maxLength: 20,
				custom: value => /[^0-9a-z-]/gi.test(value)
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
		'profile.tagline': {
			aliasName: 'tagline',
			displayName: 'Profile Tagline',
			cleaning: {
				reformat: 'properCase'
			},
			validateOnChange: true,
			validation: {
				minLength: 2,
				maxLength: 64
			}
		},
		'profile.gender': {
			aliasName: 'gender',
			displayName: 'Gender',
			validateOnChange: true,
			validation: {
				required: true
			}
		},
		'profile.homePhone': {
			aliasName: 'phone',
			displayName: 'Phone Numbers',
			dataFormat: 'numbersOnly',
			cleaning: {
				reformat: 'phone',
			},
			validation: {
				phone: true
			}
		},
		age: {
			displayName: 'Your Age',
			dataType: 'integer',
			dataFormat: num => num >= 0 ? num : null,
			inputType: 'number',
			validation: {
				integer: true,
				minNumber: v => v >= 18 ? true : 'You must be at least 18',
				maxNumber: v => v <= 100 ? true : 'This is an invalid age'
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
				minDate: '2010-01-01',
				maxDate: new Date()
			}
		},
		startTime: {
			displayName: 'Start Time',
			dataType: 'dateISO',
			valueType: ['date', 'time-input'],
			inputType: 'time',
			validateOnChange: true,
			validation: {
				timeRange: ['08:30', '17:00']
			}
		},
		appointment: {
			displayName: 'Appointment',
			dataType: 'dateISO',
			valueType: ['date', 'datetime-input'],
			inputType: 'datetime',
			validateOnChange: true,
			validation: {
				dateRange: ['2019-01-01', '2019-12-31'],
				timeRange: ['08:30', '17:00']
			}
		},
		remember: {
			displayName: 'Remember Me',
			dataType: 'boolean',
			inputType: 'checkbox'
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
