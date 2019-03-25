module.exports = {
	type: 'react-component',
	npm: {
		esModules: true,
		umd: {
			global: 'ReactFormManager',
			externals: {
				react: 'React',
			},
		},
	},
}
