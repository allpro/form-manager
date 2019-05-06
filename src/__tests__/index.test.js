import isFunction from 'lodash/isFunction'

import index from '../'
import FormManager from '../FormManager'


test('FormManager exports correctly', () => {
	expect(isFunction(FormManager)).toBeTruthy()
})

test('Default Export is correct', () => {
	expect(isFunction(index)).toBeTruthy()
	expect(index).toBe(FormManager)
})
