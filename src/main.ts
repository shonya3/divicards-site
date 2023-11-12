import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { divcordRecords as divcordRecordsJson, poeDataJson } from './jsons/jsons';
import './views/wc-sourceful-divcord-record';
import './views/wc-cards-table.js';
import { Router } from '@thepassle/app-tools/router.js';
import { LitElement, css, html, render } from 'lit';
import './views/wc-card-with-divcord-records-view.js';
import { PoeData } from './PoeData.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ISource, SourceType } from './data/ISource.interface.ts.js';
import { CardsFinder } from './data/CardsFinder.js';
import './views/wc-source-page.js';
import { customElement, query } from 'lit/decorators.js';

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}

	interface HTMLElementTagNameMap {
		'wc-root': RootElement;
	}
}

@customElement('wc-root')
export class RootElement extends LitElement {
	@query('#outlet') outlet!: HTMLElement;

	render() {
		return html`<header>
				<nav>
					<ul>
						<li>
							<a href="/">Home</a>
						</li>
					</ul>
				</nav>
			</header>
			<div id="outlet"></div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		ul {
			list-style: none;
		}
	`;
}

const rootElement = document.createElement('wc-root');
document.body.append(rootElement);

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
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 10}
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
			path: '/source',
			title: context => decodeURI(context.query!.id),
			render: context => {
				const id: ISource['id'] = context.query.id;
				const type = context.query.type as SourceType;
				const source: ISource = { id, type };

				return html`<wc-source-page
					.cardsFinder=${cardsFinder}
					.source=${source}
					.poeData=${poeData}
				></wc-source-page>`;
			},
		},
	],
});

router.addEventListener('route-changed', _e => {
	document.startViewTransition(() => {
		render(router.render(), rootElement.outlet);
	});
});
