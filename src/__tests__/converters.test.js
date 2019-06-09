import FormManager from '../FormManager'
import formatDate from '../formatters/date'
import { isBoolean, parseDate } from '../utils'


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

test('correctly converts integer to strings', () => {
	expect(form.getData('uid')).toEqual(expect.any(Number))
	expect(form.getValue('uid')).toEqual(expect.any(String))
	expect(form.getValue('uid')).toBe(str(data.uid))
})

test('correctly converts strings to integer', () => {
	expect(form.getData('age')).toEqual(expect.any(String))
	expect(form.getValue('age')).toEqual(expect.any(Number))
	expect(form.getValue('age')).toBe(int(data.age))

})

test('correctly converts string to boolean', () => {
	expect(form.getData('isGood')).toEqual(expect.any(String))
	expect(form.getValue('isGood')).toEqual(expect.any(Boolean))
	expect(form.getValue('isGood')).toBe(false)
})

test('correctly converts between date strings and objects', () => {
	const dtBirthdate = parseDate(form.getData('birthdate'))

	expect(form.getData('birthdate')).toEqual(expect.any(String))
	expect(form.getData('birthdate')).toBe(formatDate(dtBirthdate, 'iso'))

	expect(form.getValue('birthdate')).toEqual(expect.any(String))
	expect(form.getValue('birthdate')).toBe(formatDate(dtBirthdate, 'date-input'))
})
