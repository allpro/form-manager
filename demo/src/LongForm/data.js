/**
 * Dummy Data for the FormManager demo
 *
 */

const categories = [
	{ value: 100, display: 'Foo Category' },
	{ value: 200, display: 'Bar Category' },
	{ value: 300, display: 'Baz Category' },
]

const subcategories = {
	100: [
		{ value: 110, display: 'Foo Subcategory A' },
		{ value: 120, display: 'Foo Subcategory B' },
		{ value: 130, display: 'Foo Subcategory C' },
	],
	200: [
		{ value: 210, display: 'Bar Subcategory A' },
		{ value: 220, display: 'Bar Subcategory B' },
		{ value: 230, display: 'Bar Subcategory C' },
	],
	300: [
		{ value: 310, display: 'Baz Subcategory A' },
		{ value: 320, display: 'Baz Subcategory B' },
		{ value: 330, display: 'Baz Subcategory C' },
	],
}

const formData = {
	message: '',
	password: '',
	birthdate: '1980-06-22',
	birthdate2: new Date('1980-06-22T12:00:00'),
	category: '',
	subcategory: '', // subcategories[categories[0].value][0].value,
	who: {
		gender: '',
	},
}

const formErrors = {
	// category:        'This is a custom category error.',
	subcategory: {
		//  required:   'This is a preset Required error',
		//  custom:     'This is a preset Custom message',
	},
	// message:         { custom: 'This is a custom message error' },
	// 'who/gender':    'This is a custom gender error',
}

export default {
	categories,
	subcategories,
	formData,
	formErrors,
}
