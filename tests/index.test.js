import expect from 'expect'
// import React from 'react'
// import { render, unmountComponentAtNode } from 'react-dom'

import FormManager from '../src'

const data = {
	id: 111,
	uid: '222',
	user: {
		firstName: '',
		lastName: '',
		streetNumber: 555,
		streetName: 'Main St',
		email1: 'me@you.com',
		email2: 'in@valid',
	},
}

const formConfig = {
	fields: {
		id: {
			dataType: 'integer',
		},
		uid: {
			dataType: 'string',
		},
		'user/firstName': {
			aliasName: 'firstName',
			validation: {
				required: true,
			},
		},
	},
}

let state = {}

const setState = function(nextState) {
	state = nextState
	return Promise.resolve(state)
}

const mockClass = { state, setState }


describe('FormManager', () => {
	const form = FormManager(mockClass, formConfig, data)

	it('contains the data passed in', () => {
		expect(form.value('user/streetNumber')).toBe(data.user.streetNumber)
		expect(form.value('user.streetNumber')).toBe(data.user.streetNumber)
	})

	it('correctly updates data', () => {
		const firstName = 'Kevin'
		const uid = 444

		form.value('user.firstName', firstName)
		expect(form.value('user.firstName')).toBe(firstName)

		form.value('uid', uid)
		expect(form.value('uid')).toBe(uid)
	})

	/* Sample
	it( 'displays a welcome message', () => {
		render(<Component/>, node, () => {
			expect( node.innerHTML ).toContain( 'Welcome to React components' )
		})
	})
	*/
})
