import { SourcefulDivcordTable } from './divcord';
import { render } from 'lit';
import { CardsFinder } from './CardsFinder';
import './App';

import { divcordService } from './DivcordService';
import { router, startViewTransition } from './router';

const records = await divcordService.getRecordsAndRunUpdateIfNeeded();
const divcordTable = new SourcefulDivcordTable(records);
const cardsFinder = new CardsFinder(divcordTable);

const root = document.createElement('app-root');
root.divcordTable = divcordTable;
root.cardsFinder = cardsFinder;
document.body.append(root);
await root.updateComplete;

router.addEventListener('route-changed', async _e => {
	await startViewTransition(() => {
		root.pathname = new URL(window.location.href).pathname;
		render(router.render(), root.outlet);
	});
});
router.dispatchEvent(new Event('route-changed'));
