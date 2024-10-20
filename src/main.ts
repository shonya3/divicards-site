import { render } from 'lit';
import './App';
import { router } from './router';
import { divcordLoader } from './DivcordLoader';
import { DivcordTable } from './DivcordTable';
import { startViewTransition } from './utils';

// init divcord_wasm
const divcord_wasm_package = await import('./gen/divcordWasm/divcord_wasm.js');
await divcord_wasm_package.default();

const records = await divcordLoader.getRecordsAndStartUpdateIfNeeded();
const divcordTable = new DivcordTable(records);

const root = document.createElement('app-root');
root.divcordTable = divcordTable;
document.body.append(root);
await root.updateComplete;

router.addEventListener('route-changed', async _e => {
	await startViewTransition(() => {
		root.pathname = new URL(window.location.href).pathname;
		render(router.render(), root);
	});
});
router.dispatchEvent(new Event('route-changed'));
