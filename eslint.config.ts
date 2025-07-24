import { resolve } from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'
import ESLint from '@eslint/js'
import commentsPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs'
import tsParser from '@typescript-eslint/parser'
import { type FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import { flatConfigs as ESLintPluginImportX } from 'eslint-plugin-import-x'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import { configs as TypeScriptESLintConfigs } from 'typescript-eslint'

import globals from 'globals'

type Config = FlatConfig.Config[]

const defineConfig = (...configs: Config[]) => configs.flatMap(part => part)

const fileGlobs = {
	js: ['**/*.{js,cjs,mjs}'],
	ts: ['**/*.ts'],
}

const onlyTypeChecked = (config: FlatConfig.Config) => ({
	...config,
	files: fileGlobs.ts,
})

const settings: Config = [
	{
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: '.',
			},
			globals: {
				...globals.node,
			},
		},
	},
]

const prettier: Config = [
	prettierPlugin,
	{
		rules: {
			'prettier/prettier': 'warn',
		},
	},
]

const js: Config = [
	ESLint.configs.recommended,
	{
		rules: {
			'linebreak-style': 'off',
			'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
			'eqeqeq': 'error',
			'object-shorthand': 'error',
			'consistent-return': 'error',
			'arrow-body-style': ['warn', 'as-needed'],
			'func-style': ['warn', 'expression'],
			'no-inner-declarations': 'error',
			'no-promise-executor-return': 'error',
			'no-self-compare': 'error',
			'no-template-curly-in-string': 'error',
			'complexity': ['warn', { max: 15, variant: 'modified' }],
			'max-depth': 'warn',
			'max-lines-per-function': [
				'warn',
				{ max: 300, skipBlankLines: true, skipComments: true },
			],
			'max-nested-callbacks': ['warn', { max: 5 }],
			'no-alert': 'warn',
			'no-else-return': 'warn',
			'no-eval': 'error',
			'no-multi-assign': 'warn',
			'no-param-reassign': 'error',
			'no-useless-rename': 'warn',
			'no-useless-return': 'warn',
		},
	},
]

const commentsConfig: Config = [
	commentsPlugin.recommended,
	{
		rules: {
			'@eslint-community/eslint-comments/require-description': 'warn',
			'@eslint-community/eslint-comments/disable-enable-pair': [
				'error',
				{ allowWholeFile: true },
			],
		},
	},
]

const ts: Config = [
	...TypeScriptESLintConfigs.strictTypeChecked.map(onlyTypeChecked),
	...TypeScriptESLintConfigs.stylisticTypeChecked.map(onlyTypeChecked),
	{
		files: fileGlobs.js,
		...TypeScriptESLintConfigs.disableTypeChecked,
	},
	{
		files: fileGlobs.ts,
		rules: {
			'no-debugger': 'error',
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'variable',
					format: [
						'camelCase',
						'PascalCase',
						'snake_case',
						'UPPER_CASE',
					],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow',
				},
			],
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: {
						attributes: false,
					},
				},
			],
			'@typescript-eslint/no-invalid-void-type': 'off',
			// Interface does not satisfy the constraint Record<string, unknown>
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{
					allowAny: false,
					allowArray: false,
					allowBoolean: true,
					allowNever: false,
					allowNullish: false,
					allowNumber: true,
					allowRegExp: false,
				},
			],
			'@typescript-eslint/method-signature-style': ['error', 'property'],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ fixStyle: 'inline-type-imports', prefer: 'type-imports' },
			],
			'@typescript-eslint/no-unnecessary-type-parameters': 'off',
			'@typescript-eslint/no-deprecated': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/prefer-regexp-exec': 'warn',
			'@typescript-eslint/no-unnecessary-condition': 'warn',
			'consistent-return': 'off',
			'@typescript-eslint/consistent-return': 'error',
			'@typescript-eslint/array-type': [
				'warn',
				{ default: 'array-simple' },
			],
			'@typescript-eslint/default-param-last': 'warn',
			'@typescript-eslint/max-params': 'warn',
			'@typescript-eslint/no-magic-numbers': [
				'warn',
				{
					// js
					ignore: [-1, 0, 1],
					ignoreArrayIndexes: true,
					ignoreDefaultValues: true,
					ignoreClassFieldInitialValues: true,
					enforceConst: true,
					// ts
					ignoreEnums: true,
					ignoreNumericLiteralTypes: true,
					ignoreReadonlyClassProperties: true,
					ignoreTypeIndexes: true,
				},
			],
			'@typescript-eslint/no-use-before-define': 'warn',
			'@typescript-eslint/prefer-destructuring': 'warn',
			'@typescript-eslint/require-array-sort-compare': 'warn',
		},
	},
]

const importX: Config = [
	ESLintPluginImportX.recommended,
	ESLintPluginImportX.warnings,
	ESLintPluginImportX.typescript,
	{
		rules: {
			'import-x/first': 'warn',
			'import-x/no-duplicates': 'warn',
			'import-x/no-rename-default': 'off',
			'import-x/newline-after-import': 'warn',
			'import-x/no-deprecated': 'warn',
			'import-x/no-extraneous-dependencies': 'error',
			'import-x/no-cycle': 'warn',
			'import-x/no-useless-path-segments': 'error',
		},
	},
	{
		files: ['eslint.config.ts'],
		rules: {
			'import-x/default': 'off',
		},
	},
]

const unusedImports: Config = [
	{
		files: fileGlobs.ts,
		plugins: {
			'unused-imports': unusedImportsPlugin,
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		files: ['eslint.config.ts', '**/*.d.ts'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-vars': 'off',
		},
	},
	{
		// default ordering for JS files (usually configs)
		files: fileGlobs.js,
		rules: {
			'import-x/order': 'warn',
		},
	},
]

const importSort: Config = [
	{
		files: fileGlobs.ts,
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'simple-import-sort/imports': [
				'warn',
				{
					groups: [
						['^node'],
						['eslint'],
						['^@?\\w'], // Other packages.
						['^'], // Absolute imports or not matched in another group.
						['^\\.'], // import foo from "./foo"
						['^\\.\\.'], // import foo from "../foo"
						['^\\u0000'], // import 'foo'
					],
				},
			],
			'simple-import-sort/exports': 'error',
		},
	},
]

const imports = defineConfig(importX, unusedImports, importSort)

export default defineConfig(
	[includeIgnoreFile(resolve('.gitignore'))],
	settings,
	prettier,
	js,
	ts,
	commentsConfig,
	imports,
)
