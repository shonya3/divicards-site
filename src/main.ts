import { render } from 'lit';
import './App';
import { router } from './router';
import { divcordService } from './DivcordService';
import { SourcefulDivcordTable } from './divcord';
import { startViewTransition } from './utils';

const records = await divcordService.getRecordsAndRunUpdateIfNeeded();
const divcordTable = new SourcefulDivcordTable(records);

const root = document.createElement('app-root');
root.divcordTable = divcordTable;
document.body.append(root);
await root.updateComplete;

router.addEventListener('route-changed', async _e => {
	await startViewTransition(() => {
		root.pathname = new URL(window.location.href).pathname;
		render(router.render(), root.outlet);
	});
});
router.dispatchEvent(new Event('route-changed'));
