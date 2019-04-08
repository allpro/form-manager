import expect from 'expect'
import moment from 'moment'
import isBoolean from 'lodash/isBoolean'

import FormManager from '../src'
// import formatters from '../src/formatters'
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
			dataType: 'integer',
			valueType: 'string',
		},
		age: {
			dataType: 'string',
			valueType: 'integer',
		},
		isGood: {
			dataType: 'string',
			valueType: 'boolean',
		},
		birthdate: {
			dataType: 'dateISO',
			valueType: ['date', 'date-input'],
		},
	},
}

// Class mock
let state = {}
const setState = function(nextState) {
	state = nextState
	return Promise.resolve(state)
}
const mockClass = { state, setState }

const int = v => parseInt(v, 10)
const str = v => isBoolean(v) ? (v ? '1' : '0') : v + ''


describe('converters', () => {
	const form = FormManager(mockClass, formConfig, data)

	it('correctly converts initial values', () => {
		expect(form.getData('uid')).toBeA('number')
		expect(form.getValue('uid')).toBeA('string')
		expect(form.getValue('uid')).toBe(str(data.uid))

		expect(form.getData('age')).toBeA('string')
		expect(form.getValue('age')).toBeA('number')
		expect(form.getValue('age')).toBe(int(data.age))

		expect(form.getData('isGood')).toBeA('string')
		expect(form.getValue('isGood')).toBeA('boolean')
		expect(form.getValue('isGood')).toBe(false) // TODO

		const mBirthdate = moment(form.getData('birthdate'))
		expect(form.getData('birthdate')).toBeA('string')
		expect(form.getData('birthdate')).toBe(mBirthdate.format())
		expect(form.getValue('birthdate')).toBeA('string')
		expect(form.getValue('birthdate')).toBe(mBirthdate.format('YYYY-MM-DD'))
	})
	//
	// it('converts the dataType of new values', () => {
	// 	form.setData(data)
	// 	expect(form.value('uid')).toBeA('string')
	// 	expect(form.value('age')).toBeA('integer')
	// 	expect(form.value('isGood')).toBeA('boolean')
	// 	expect(form.value('birthdate')).toBe(true)
	// })
})
