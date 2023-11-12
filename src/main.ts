import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { divcordRecords as divcordRecordsJson, poeDataJson } from './jsons/jsons';
import './views/wc-sourceful-divcord-record';
import './views/wc-cards-table.js';
import { Router } from '@thepassle/app-tools/router.js';
import { LitElement, html, render } from 'lit';
import './views/wc-card-with-divcord-records-view.js';
import { PoeData } from './PoeData.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { customElement, property, query } from 'lit/decorators.js';
import { ISource, SourceType } from './data/ISource.interface.ts.js';
import { CardsFinder } from './data/CardsFinder.js';
import './views/wc-source-page.js';

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}

	interface HTMLElementTagNameMap {
		'wc-app': AppElement;
	}
}

const divcordRecords = divcordRecordsJson.map(r => new SourcefulDivcordTableRecord(r));
const divcordTable = new SourcefulDivcordTable(divcordRecords);
const poeData = new PoeData(poeDataJson);
const sourcesByCards = divcordTable.sourcesByCards();
const cardsFinder = new CardsFinder(poeData, divcordRecords);

export const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: ({ query }) =>
				html`<wc-cards-table
					page=${ifDefined(query.page)}
					per-page=${ifDefined(query['per-page'])}
					filter=${ifDefined(query.filter)}
					.poeData=${poeData}
					.sourcesByCards=${sourcesByCards}
				></wc-cards-table>`,
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
		{
			path: '/source/',
			title: context => decodeURI(context.query!.id),
			render: context => {
				const id: ISource['id'] = context.query.id;
				const type = context.query.type as SourceType;

				if (type === 'Map') {
					return html`<wc-source-page
						.source=${{ id, type }}
						.poeData=${poeData}
						.cards=${cardsFinder.cardsByMap(id)}
					></wc-source-page>`;
				}

				if (type === 'Act') {
					return html`<wc-source-page
						.source=${{ id, type }}
						.poeData=${poeData}
						.cards=${cardsFinder.cardsByActArea(id).map(a => a.card)}
					></wc-source-page>`;
				}

				return html`<wc-source-page
					.source=${{ id, type }}
					.poeData=${poeData}
					.cards=${cardsFinder.cardsByIdSource({ id, type })}
				></wc-source-page>`;
			},
		},
	],
});

@customElement('wc-app')
export class AppElement extends LitElement {
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) sourcesByCards!: Record<string, ISource[]>;

	@query('#outlet') outlet!: HTMLElement;

	constructor() {
		super();
		router.addEventListener('route-changed', _e => {
			document.startViewTransition(() => {
				render(router.render(), document.body);
			});
		});
	}

	render() {
		html`<div id="outlet"></div>`;
	}
}

render(
	html`<wc-app .poeData=${poeData} .divcordTable=${divcordTable} .sourcesByCards=${sourcesByCards}></wc-app>`,
	document.body
);
