import React from 'react'
import { render } from 'react-dom'

import DemoLayout from '@allpro/demo-layout'

import LongFormClass from './LongForm'
import LongFormHook from './LongForm/Hook'
import LogFormData from './LogFormData'


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
					label: 'Fields Test Output',
					path: '/test-output',
					component: LogFormData
				}
			]}
		/>
	)
}

render(<FormManagerDemos />, document.getElementById('root'))
