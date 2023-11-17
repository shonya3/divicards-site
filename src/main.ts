import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { poeDataJson } from './jsons/jsons';
import './elements/wc-sourceful-divcord-record';
import './views/wc-cards-table';
import { Router } from '@thepassle/app-tools/router.js';
import { LitElement, css, html, render } from 'lit';
import './views/wc-card-with-divcord-records-view';
import { PoeData } from './PoeData';
import { ISource, SourceType } from './data/ISource.interface';
import { CardsFinder } from './data/CardsFinder';
import './views/wc-source-page';
import './views/wc-maps-table';
import './views/wc-sources-table';
import './views/wc-source-type-page';
import { customElement, query } from 'lit/decorators.js';
import { loadDivcordRecords } from './loadDivcordRecords';
import './views/wc-simple-table';

// @ts-expect-error
if (!globalThis.URLPattern) {
	await import('urlpattern-polyfill');
}

export async function startViewTransition(cb: (...args: any[]) => any): Promise<unknown> {
	if (Object.hasOwn(Document.prototype, 'startViewTransition')) {
		return document.startViewTransition(() => {
			cb();
		});
	} else {
		cb();
	}
}

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
		return html`<header style="padding:1rem;">
				<nav>
					<ul style="display:flex;gap:0.4rem;width:fit-content;margin-left:3rem;">
						<li>
							<a href="/">Home</a>
						</li>
						<li>
							<a href="/maps">Maps</a>
						</li>
						<li>
							<a href="/sources">Sources</a>
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

const divcordRecordsJson = await loadDivcordRecords();
let divcordRecords = divcordRecordsJson.map(r => new SourcefulDivcordTableRecord(r));
const divcordTable = new SourcefulDivcordTable(divcordRecords);
let poeData = new PoeData(poeDataJson);
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
					per-page=${query['per-page'] ?? 3}
					filter=${query.filter ?? ''}
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
				const id: string = context.query.id;
				const type = context.query.type as SourceType;
				const source: ISource = { id, type, kind: 'source-with-member' };

				return html`<wc-source-page
					.cardsFinder=${cardsFinder}
					.source=${source}
					.poeData=${poeData}
				></wc-source-page>`;
			},
		},
		{
			path: '/maps',
			title: 'Maps',
			render: ({ query }) => {
				return html`<wc-maps-table
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 10}
					filter=${query.filter}
					.poeData=${poeData}
					.cardsByMaps=${cardsFinder.cardsByMaps()}
				></wc-maps-table>`;
			},
		},
		{
			path: '/sources',
			title: 'Sources',
			render: ({ query }) => {
				return html`<wc-sources-table
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 10}
					filter=${query.filter}
					.poeData=${poeData}
					.cardsBySources=${cardsFinder.cardsBySources()}
				></wc-sources-table>`;
			},
		},
		{
			path: '/source-type/:id',
			title: context => context.params!.id,
			render: ({ params }) => {
				const sourceType = decodeURI(params.id) as SourceType;
				return html`<wc-source-type-page
					.poeData=${poeData}
					.divcordTable=${divcordTable}
					.sourceType=${sourceType}
				></wc-source-type-page>`;
			},
		},
	],
});

router.addEventListener('route-changed', _e => {
	startViewTransition(() => {
		render(router.render(), rootElement.outlet);
	});
});
