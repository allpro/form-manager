import moment from 'moment'
import isBoolean from 'lodash/isBoolean'

import FormManager from '../FormManager'
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

const form = FormManager(mockClass, formConfig, data)

test('correctly converts initial values', () => {
	expect(form.getData('uid')).toEqual(expect.any(Number))
	expect(form.getValue('uid')).toEqual(expect.any(String))
	expect(form.getValue('uid')).toBe(str(data.uid))

	expect(form.getData('age')).toEqual(expect.any(String))
	expect(form.getValue('age')).toEqual(expect.any(Number))
	expect(form.getValue('age')).toBe(int(data.age))

	expect(form.getData('isGood')).toEqual(expect.any(String))
	expect(form.getValue('isGood')).toEqual(expect.any(Boolean))
	expect(form.getValue('isGood')).toBe(false) // TODO

	const mBirthdate = moment(form.getData('birthdate'))
	expect(form.getData('birthdate')).toEqual(expect.any(String))
	expect(form.getData('birthdate')).toBe(mBirthdate.format())
	expect(form.getValue('birthdate')).toEqual(expect.any(String))
	expect(form.getValue('birthdate')).toBe(mBirthdate.format('YYYY-MM-DD'))
})

// test('converts the dataType of new values', () => {
// 	form.setData(data)
// 	expect(form.value('uid')).toEqual(expect.any(String))
// 	expect(form.value('age')).toEqual(expect.any(Integer))
// 	expect(form.value('isGood')).toEqual(expect.any(Boolean))
// 	expect(form.value('birthdate')).toBe(true)
// })
