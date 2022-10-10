module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.eslint.json',
	},
	extends: [ 
		'eslint:recommended',
		'preact',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'no-useless-constructor': ['off'],
		'jsx-quotes': ['warn', 'prefer-single'],
		'react/jsx-key': ['warn'],
		'@typescript-eslint/semi': ['warn', 'never'],
		'@typescript-eslint/quotes': ['warn', 'single'],
		'@typescript-eslint/comma-dangle': ['warn', 'always-multiline'],
		'@typescript-eslint/comma-spacing': ['warn'],
		'@typescript-eslint/brace-style': ['warn'],
		'@typescript-eslint/keyword-spacing': ['warn'],
		'@typescript-eslint/object-curly-spacing': ['warn', 'always'],
		'@typescript-eslint/space-before-blocks': ['warn'],
		'@typescript-eslint/type-annotation-spacing': ['warn'],
		'@typescript-eslint/member-delimiter-style': ['warn', { multiline: { delimiter: 'none' } }],
	},
	settings: {
		jest: { version: 27 },
	},
}
