import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
// import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import { configs as litConfigs } from 'eslint-plugin-lit';

export default defineConfig([
	{ ignores: ['gen/**/*', 'dist/**/*'] },
	{
		...litConfigs['flat/recommended'],
		files: ['src/**/*.ts'],
	},
	{
		files: ['src/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser },
	},
	// @ts-expect-error tseslint has types problems with defineConfig
	tseslint.configs.recommended,
	// { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
]);
