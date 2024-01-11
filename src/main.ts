import { render } from 'lit';
import './App';
import { router, startViewTransition } from './router';
import { divcordService } from './DivcordService';
import { CardsFinder } from './CardsFinder';
import { SourcefulDivcordTable } from './divcord';

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
