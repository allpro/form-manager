module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: {
			global: 'FormManager',
			externals: {
				react: 'React',
			},
		},
	},
}
