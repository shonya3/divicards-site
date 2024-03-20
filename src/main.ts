import { render } from 'lit';
import './App';
import { router } from './router';
import { divcordLoader } from './DivcordLoader';
import { DivcordTable } from './DivcordTable';
import { startViewTransition } from './utils';
import { cardsBySource } from './cards';
import { poeData } from './PoeData';
import { Source } from './gen/Source';

const records = await divcordLoader.getRecordsAndStartUpdateIfNeeded();
// const divcordTable = new DivcordTable(records);

// const root = document.createElement('app-root');
// root.divcordTable = divcordTable;
// document.body.append(root);
// await root.updateComplete;

// router.addEventListener('route-changed', async _e => {
// 	await startViewTransition(() => {
// 		root.pathname = new URL(window.location.href).pathname;
// 		render(router.render(), root.outlet);
// 	});
// });
// router.dispatchEvent(new Event('route-changed'));

const coreMap: Source = {
	id: 'Core Map',
	kind: 'source-with-member',
	type: 'Map',
};

// console.log(cardsBySource({ id: 'Core Map', kind: 'source-with-member', type: 'Map' }, records, poeData));

const t0 = performance.now();
for (let i = 0; i < 10; i++) {
	cardsBySource(coreMap, records, poeData);
}
console.log(performance.now() - t0);
