import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const testGlobals = {
	afterEach: 'readonly',
	beforeEach: 'readonly',
	describe: 'readonly',
	expect: 'readonly',
	it: 'readonly',
	vi: 'readonly',
};

export default tseslint.config(
	{
		ignores: ['out', 'dist', 'node_modules'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'indent': ['error', 'tab', { SwitchCase: 1 }],
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
			],
			'quotes': ['error', 'single', { avoidEscape: true }],
		},
	},
	{
		files: ['tests/**/*.{ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...testGlobals,
			},
		},
	},
);
