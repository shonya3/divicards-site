import { SourcefulDivcordTable } from './data/SourcefulDivcordTableRecord';
import './elements/e-sourceful-divcord-record';
import './pages/p-cards-table';
import { Router } from '@thepassle/app-tools/router.js';
import { LitElement, css, html, render } from 'lit';
import './pages/p-card';
import { ISource, SourceType } from './data/ISource.interface';
import { CardsFinder } from './data/CardsFinder';
import './pages/p-source';
import './pages/p-maps-table';
import './pages/p-sources-table';
import './pages/p-source-type';
import './pages/p-home';
import './pages/p-divcord';
import { customElement, query } from 'lit/decorators.js';
import { loadDivcordRecords } from './loadDivcordRecords';
import { poeData } from './PoeData';

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
	@query('.outlet') outlet!: HTMLElement;

	render() {
		return html`<div class="wrapper">
			<header class="header">
				<nav>
					<ul class="navlist">
						<li class="navlist_item">
							<a href="/">Home</a>
						</li>
						<li class="navlist_item">
							<a href="/maps">Maps</a>
						</li>
						<li class="navlist_item">
							<a href="/sources">Sources</a>
						</li>
						<li class="navlist_item">
							<a href="/divcord">Divcord</a>
						</li>
					</ul>
				</nav>
			</header>
			<div class="outlet"></div>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
			height: 100vh;
			--source-color: #eeeeee;
		}

		.wrapper {
			height: 100vh;
			display: flex;
			flex-direction: column;
		}

		.outlet {
			flex-grow: 1;
			height: 90vh;
		}

		.navlist {
			list-style: none;
			padding: 1rem;

			display: flex;
			gap: 1.5rem;
			background-color: #222;
		}

		.navlist_item {
			font-size: 1.2rem;
		}

		.navlist_item:first-child {
			margin-left: 2rem;
		}

		a,
		a:visited {
			color: #fff;
		}

		.outlet > * {
			height: 100%;
			display: block;
			overflow-y: scroll;
		}
	`;
}

const rootElement = document.createElement('wc-root');
document.body.append(rootElement);

const divcordTable = new SourcefulDivcordTable(await loadDivcordRecords());

const sourcesByCards = divcordTable.sourcesByCards();
const cardsFinder = new CardsFinder(poeData, divcordTable);

const cardsByMaps = cardsFinder.cardsByMaps();

export const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: ({ query }) =>
				html`<p-home
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 14}
					filter=${query.filter ?? ''}
					.sourcesByCards=${sourcesByCards}
					name="A Fate Worse Than Death"
					.divcordTable=${divcordTable}
				></p-home>`,
		},
		{
			path: '/divcord',
			title: 'Divicards',
			render: ({ query }) =>
				html`<p-divcord
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 14}
					filter=${query.filter ?? ''}
					.sourcesByCards=${sourcesByCards}
					.divcordTable=${divcordTable}
				></p-divcord>`,
		},
		{
			path: '/card/:name',
			title: context => decodeURI(context.params!.name),
			render: context => {
				const name = decodeURI(context.params.name);
				return html`<p-card
					.card=${name}
					.records=${divcordTable.recordsByCard(name)}
					.divcordTable=${divcordTable}
				></p-card>`;
			},
		},
		{
			path: '/source',
			title: context => decodeURI(context.query!.id),
			render: context => {
				const id: string = context.query.id;
				const type = context.query.type as SourceType;
				const source: ISource = { id, type, kind: 'source-with-member' };

				return html`<p-source .cardsFinder=${cardsFinder} .source=${source}></p-source>`;
			},
		},
		{
			path: '/maps',
			title: 'Maps',
			render: ({ query }) => {
				return html`<p-maps-table
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 10}
					filter=${query.filter}
					.cardsByMaps=${cardsByMaps}
				></p-maps-table>`;
			},
		},
		{
			path: '/sources',
			title: 'Sources',
			render: ({ query }) => {
				return html`<p-sources-table
					page=${query.page ?? 1}
					per-page=${query['per-page'] ?? 10}
					filter=${query.filter}
					.cardsBySources=${cardsFinder.cardsBySources()}
				></p-sources-table>`;
			},
		},
		{
			path: '/source-type/:id',
			title: context => context.params!.id,
			render: ({ params }) => {
				const sourceType = decodeURI(params.id) as SourceType;
				return html`<p-source-type .divcordTable=${divcordTable} .sourceType=${sourceType}></p-source-type>`;
			},
		},
	],
});

router.addEventListener('route-changed', _e => {
	startViewTransition(() => {
		render(router.render(), rootElement.outlet);
	});
});
