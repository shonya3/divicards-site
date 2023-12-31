import { classMap } from 'lit/directives/class-map.js';
import { linkStyles } from './linkStyles';
import { SourcefulDivcordTable } from './divcord';
import './elements/e-sourceful-divcord-record';
import { Router } from '@thepassle/app-tools/router.js';
import { LitElement, PropertyValueMap, css, html, render } from 'lit';
import './pages/p-card';
import type { ISource, SourceType } from './gen/ISource.interface';
import { CardsFinder } from './CardsFinder';
import './pages/p-source';
import './pages/p-maps-table';
import './pages/p-sources';
import './pages/p-source-type';
import './pages/p-home';
import './pages/p-divcord';
import { customElement, property, query, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { cardsFinderContext, divcordTableContext } from './context';
import { divcordService } from './DivcordService';
import { toast } from './toast';

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
	@property() pathname?: string;

	@provide({ context: divcordTableContext })
	@property({ type: Object })
	divcordTable!: SourcefulDivcordTable;

	@provide({ context: cardsFinderContext })
	@state()
	cardsFinder!: CardsFinder;

	protected willUpdate(changedProperties: PropertyValueMap<this>): void {
		if (changedProperties.has('divcordTable')) {
			this.cardsFinder = new CardsFinder(this.divcordTable);
		}
	}

	constructor() {
		super();

		divcordService.on('records-updated', e => {
			this.divcordTable = new SourcefulDivcordTable(e.detail);
			toast('Your Divcord data is up-to-date', 'success', 3000);
		});
	}

	render() {
		const links = [
			['/', 'Home'],
			['/maps', 'Maps'],
			['/sources', 'Sources'],
			['/divcord', 'Divcord'],
		].map(
			([path, label]) => html`
				<li class="navlist_item">
					<a class=${classMap({ 'link--active': path === this.pathname })} href=${path}>${label}</a>
				</li>
			`
		);

		return html`<div class="wrapper">
			<header class="header">
				<nav>
					<ul class="navlist">
						${links}
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

		@layer base {
			${linkStyles}

			a {
				transition: 0.2s color;
			}
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

		.link--active {
			color: var(--link-color-hover);
		}

		.outlet > * {
			height: 100%;
			display: block;
			overflow-y: scroll;
		}
	`;
}

const rootElement = document.createElement('wc-root');
const divcordTable = new SourcefulDivcordTable(await divcordService.read());
const cardsFinder = new CardsFinder(divcordTable);

rootElement.divcordTable = divcordTable;
rootElement.cardsFinder = cardsFinder;

document.body.append(rootElement);

export const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: ({ query }) =>
				html`<p-home
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
					filter=${query.filter ?? ''}
				></p-home>`,
		},
		{
			path: '/divcord',
			title: 'Divcord',
			render: ({ query }) => html`<p-divcord
				.page=${Number(query.page ?? 1)}
				.perPage=${Number(query['per-page'] ?? 10)}
			></p-divcord>`,
		},
		{
			path: '/card/:name',
			title: context => decodeURI(context.params!.name),
			render: context => {
				const name = decodeURI(context.params.name);
				return html`<p-card .card=${name}></p-card>`;
			},
		},
		{
			path: '/source',
			title: context => decodeURI(context.query!.id),
			render: context => {
				const id: string = context.query.id;
				const type = context.query.type as SourceType;
				const source: ISource = { id, type, kind: 'source-with-member' };
				return html`<p-source .source=${source}></p-source>`;
			},
		},
		{
			path: '/maps',
			title: 'Maps',
			render: ({ query }) => {
				return html`<p-maps-table
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
					filter=${query.filter}
				></p-maps-table>`;
			},
		},
		{
			path: '/sources',
			title: 'Sources',
			render: ({ query }) => {
				return html`<p-sources
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
					filter=${query.filter}
				></p-sources>`;
			},
		},
		{
			path: '/source-type/:id',
			title: context => decodeURI(context.params!.id),
			render: ({ params }) => {
				const sourceType = decodeURI(params.id) as SourceType;
				return html`<p-source-type .sourceType=${sourceType}></p-source-type>`;
			},
		},
	],
});

router.addEventListener('route-changed', async _e => {
	await startViewTransition(() => {
		rootElement.pathname = new URL(window.location.href).pathname;
		render(router.render(), rootElement.outlet);
	});
});
