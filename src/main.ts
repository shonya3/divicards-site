import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { divcordRecords, poeDataJson } from './jsons/jsons';
import './views/wc-sourceful-divcord-record';
import './views/wc-cards-table.js';
import { Router } from '@thepassle/app-tools/router.js';
import { html, render } from 'lit';
import './views/wc-card-with-divcord-records-view.js';
import { PoeData } from './data/PoeData.js';

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}
}

const divcordTable = new SourcefulDivcordTable(divcordRecords.map(r => new SourcefulDivcordTableRecord(r)));
const poeData = new PoeData(poeDataJson);
const sourcesByCards = divcordTable.sourcesByCards();

const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: () => html`<wc-cards-table .poeData=${poeData} .sourcesByCards=${sourcesByCards}></wc-cards-table>`,
		},
		{
			path: '/card/:name',
			title: context => decodeURI(context.params!.name),
			render: context => {
				const name = decodeURI(context.params.name);
				return html`<wc-card-with-divcord-records-view
					.card=${name}
					.records=${divcordTable.recordsByCard(name)}
					.poeData=${poeData}
				></wc-card-with-divcord-records-view>`;
			},
		},
	],
});

router.addEventListener('route-changed', () => {
	document.startViewTransition(() => {
		render(router.render(), document.body);
	});
});
