import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';

export default {
	watch: true,
	dev: true,
	litelement: true,
	plugins: [
		customElementVsCodePlugin({
			htmlFileName: './.vscode/vscode.html-custom-data.json',
			cssFileName: './.vscode/vscode.css-custom-data.json',
		}),
	],
	lit: true,
};
