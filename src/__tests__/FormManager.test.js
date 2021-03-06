import FormManager from '../FormManager'

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
		'user.firstName': {
			aliasName: 'firstName',
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

const form = FormManager(mockClass, formConfig, data)

test('contains the data passed in', () => {
	expect(form.getFieldData('user.streetNumber')).toBe(data.user.streetNumber)
	expect(form.getValue('user.streetNumber')).toBe(data.user.streetNumber)

	expect(form.getFieldData('uid')).toBe(data.uid)
	expect(form.getValue('uid')).toBe(data.uid)
})

test('correctly updates data', () => {
	// Test string value
	let firstName = 'John'
	form.setValue('user.firstName', firstName)
	expect(form.getFieldData('user.firstName')).toBe(firstName)
	expect(form.getValue('user.firstName')).toBe(firstName)

	// Test using aliasName for both setter and getters
	firstName = 'Jane'
	form.setValue('firstName', firstName)
	expect(form.getFieldData('firstName')).toBe(firstName)
	expect(form.getValue('firstName')).toBe(firstName)
	expect(form.getFieldData('user.firstName')).toBe(firstName)
	expect(form.getValue('user.firstName')).toBe(firstName)

	// Test numeric value
	const uid = 444
	form.setValue('uid', uid)
	expect(form.getFieldData('uid')).toBe(uid)
	expect(form.getValue('uid')).toBe(uid)
})

/* Sample
test( 'displays a welcome message', () => {
	render(<Component/>, node, () => {
		expect( node.innerHTML ).toContain( 'Welcome to React components' )
	})
})
*/
