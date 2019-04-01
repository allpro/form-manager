import expect from 'expect'

import FormManager from '../src'
// import convertTo from '../src/converters'

const data = {
	uid: 222,
	isGood: 'no',
	age: '40',
	birthdate: new Date(),
}

const formConfig = {
	fields: {
		uid: {
			dataType: 'string',
		},
		age: {
			dataType: 'integer',
		},
		isGood: {
			dataType: 'boolean',
		},
		birthdate: {
			dataType: 'dateISOString',
		},
	},
}

let state = {}

const setState = function(nextState) {
	state = nextState
	return Promise.resolve(state)
}

const mockClass = { state, setState }


describe('converters', () => {
	const form = FormManager(mockClass, formConfig, data)

	it('correctly converts initial values', () => {
		expect(form.value('uid')).toBeA('string')
		expect(form.value('age')).toBeA('integer')
		expect(form.value('isGood')).toBeA('boolean')
		expect(form.value('birthdate')).toBe(true)
	})
	//
	// it('converts the dataType of new values', () => {
	// 	form.data(data)
	// 	expect(form.value('uid')).toBeA('string')
	// 	expect(form.value('age')).toBeA('integer')
	// 	expect(form.value('isGood')).toBeA('boolean')
	// 	expect(form.value('birthdate')).toBe(true)
	// })
})
