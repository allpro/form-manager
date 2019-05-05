import isFunction from 'lodash/isFunction'

import index from '../'
// ReactRouterPauseHooks NOT exported by index.js - for testing only!
import FormManager from '../FormManager'


test('FormManager exports correctly', () => {
	expect(isFunction(FormManager)).toBeTruthy()
})

test('Default Export is correct', () => {
	expect(isFunction(index)).toBeTruthy()
	expect(index).toBe(FormManager)
})
