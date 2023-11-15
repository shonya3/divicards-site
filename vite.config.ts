import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
	plugins: [topLevelAwait()],
	build: {
		minify: false,
		terserOptions: {
			mangle: false,
		},
	},
});
