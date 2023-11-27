import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { version } from './package.json';

export default defineConfig({
	plugins: [topLevelAwait()],
	define: {
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(version),
	},
});
