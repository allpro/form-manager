import React, { Component, Fragment } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'

import LongForm from './LongForm'
import LogFormData from './LogFormData'

const { array, element, oneOfType } = PropTypes

function TabContainer( props ) {
	return (
		<div style={{ padding: '0', border: '1px solid rgba(0,0,0,0.14)' }}>
			{props.children}
		</div>
	)
}
TabContainer.propTypes = {
	children: oneOfType([array, element])
}


class FormManagerDemos extends Component {
	state = {
		currentTab: 0,
	}

	onChangeTab = ( event, currentTab ) => {
		this.setState( { currentTab } ) // eslint-disable-line
	}

	render() {
		const { currentTab } = this.state

		return (
			<Fragment>
				<Typography variant="headline" style={{ margin: '10px' }}>
					Form Manager Examples
				</Typography>

				<AppBar position="static" color="default">
					<Tabs
						value={currentTab}
						onChange={this.onChangeTab}
						indicatorColor="primary"
						textColor="primary"
						variant="scrollable"
						scrollButtons="auto"
					>
						<Tab label="MUI Form"/>
						<Tab label="Fields Test Output"/>
					</Tabs>
				</AppBar>

				{currentTab === 0 && (
					<TabContainer><LongForm /></TabContainer>
				)}
				{currentTab === 1 && (
					<TabContainer><LogFormData /></TabContainer>
				)}
			</Fragment>
		)
	}
}


render( <FormManagerDemos/>, document.querySelector( '#demo' ) )
