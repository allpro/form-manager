import React from 'react'
import { render } from 'react-dom'

import DemoLayout from '@allpro/demo-layout'

import LongFormClass from './LongForm'
import LongFormHook from './LongForm/Hook'
import SimpleForm from './SimpleForm'
import FieldsTestOutput from './LongForm/FieldsTestOutput'


function FormManagerDemos() {
	return (
		<DemoLayout
			packageName="form-manager"
			title="Form Manager Examples"
			readme="https://github.com/allpro/form-manager/blob/master/README.md"
			demo="https://codesandbox.io/s/github/allpro/form-manager/tree/master/example"
			pages={[
				{
					label: 'Class Form',
					path: '/class-form',
					component: LongFormClass
				},
				{
					label: 'Hooks Form',
					path: '/hook-form',
					component: LongFormHook
				},
				{
					label: 'Simple Form',
					path: '/simple-form',
					component: SimpleForm
				},
				{
					label: 'Fields Test Output',
					path: '/test-output',
					component: FieldsTestOutput
				}
			]}
		/>
	)
}

render(<FormManagerDemos />, document.getElementById('root'))
