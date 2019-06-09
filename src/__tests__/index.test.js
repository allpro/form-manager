import index from '../'
import FormManager from '../FormManager'
import { isFunction } from '../utils'


test('FormManager exports correctly', () => {
	expect(isFunction(FormManager)).toBeTruthy()
})

test('Default Export is correct', () => {
	expect(isFunction(index)).toBeTruthy()
	expect(index).toBe(FormManager)
})
