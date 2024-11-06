// @ts-expect-error TypeScript does not know about globalThis.URLPattern for now
if (!globalThis.URLPattern) {
	await import('urlpattern-polyfill');
}

import { Router } from '@thepassle/app-tools/router.js';
import { html } from 'lit';
import { SourceType, Source } from './gen/Source';

declare module '@thepassle/app-tools/router.js' {
	interface Router {
		/**
		 * Indicates whether the View Transition should be skipped.
		 */
		skip_transition?: boolean;
	}
}

import './pages/p-home';
import './pages/p-card';
import './pages/p-source';
import './pages/p-source-type';
import './pages/p-verify-faq';
import './pages/p-verify';
import './pages/p-useful-resources';
import './elements/divcord-spreadsheet/e-divcord-spreadsheet';

import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';
import { findCardBySlug } from 'poe-custom-elements/divination-card/data.js';

import sourcesJson from './gen/json/sources.json';
import { ACTIVE_VIEW_VARIANTS, ActiveView } from './pages/p-verify';
const sources = sourcesJson as Record<string, Source>;

export const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: ({ query }) => {
				return html`<p-home
					.page=${Number(query.page ?? 1)}
					.per_page=${Number(query.per_page ?? 10)}
					filter=${query.filter ?? ''}
				></p-home>`;
			},
		},
		{
			path: '/divcord',
			title: 'Divcord',
			plugins: [lazy(() => import('./pages/p-divcord'))],
			render: ({ query }) => html`<p-divcord
				.page=${Number(query.page ?? 1)}
				.per_page=${Number(query['per-page'] ?? 10)}
				.filter=${query.filter ?? ''}
			></p-divcord>`,
		},
		{
			path: '/card/:slug',
			title: context => {
				const slug = context.params?.slug;
				if (!slug) {
					return 'Not Found';
				}
				return findCardBySlug(slug)?.name ?? 'Not Found';
			},
			render: context => {
				const card = findCardBySlug(context.params.slug);
				if (!card) {
					return html`<p>Card Not Found</p>`;
				}
				return html`<p-card .card=${card!.name}></p-card>`;
			},
		},
		{
			path: '/verify',
			title: 'Need to verify',
			render: () => {
				return html`<p-verify .activeView=${`weights-table`}></p-verify>`;
			},
		},
		{
			path: '/verify/:activeView',
			title: 'Need to verify',
			render: context => {
				if (context.params.activeView === 'faq') {
					return html`<p-verify-faq></p-verify-faq>`;
				}
				let activeView: ActiveView = 'weights-table';
				if (ACTIVE_VIEW_VARIANTS.includes(context.params.activeView as ActiveView)) {
					activeView = context.params.activeView as ActiveView;
				}
				return html`<p-verify .activeView=${activeView}></p-verify>`;
			},
		},
		{
			path: '/useful-resources',
			title: 'Useful Resources',
			render: () => {
				return html`<p-useful-resources></p-useful-resources>`;
			},
		},
		// {
		// 	path: '/source',
		// 	title: context => decodeURI(context.query!.id),
		// 	render: context => {
		// 		const id: string = context.query.id;
		// 		const type = context.query.type as SourceType;
		// 		const source: Source = { id, type, kind: 'source-with-member' };
		// 		return html`<p-source .source=${source}></p-source>`;
		// 	},
		// },
		{
			path: '/source/:typeSlug/:idSlug',
			title: context => sources[context.params!.idSlug].id ?? 'Not found',
			render: context => {
				context.title = 'hiiiii';
				const source = sources[context.params.idSlug];
				if (!source) {
					return html`<h2>Not Found</h2>`;
				}
				return html`<p-source .source=${source}></p-source>`;
			},
		},
		{
			path: '/maps',
			title: 'Maps',
			plugins: [lazy(() => import('./pages/p-maps'))],
			render: ({ query }) => {
				return html`<p-maps
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
					filter=${query.filter}
				></p-maps>`;
			},
		},
		{
			path: '/sources',
			title: 'Sources',
			plugins: [lazy(() => import('./pages/p-sources'))],
			render: () => {
				return html`<p-sources></p-sources>`;
			},
		},
		{
			path: '/weights',
			title: 'Weights',
			plugins: [lazy(() => import('./pages/p-weights'))],
			render: () => html`<p-weights></p-weights>`,
		},
		{
			path: '/source-type/:id',
			title: context => decodeURI(context.params!.id),
			render: ({ params }) => {
				const sourceType = decodeURI(params.id) as SourceType;
				return html`<p-source-type .sourceType=${sourceType}></p-source-type>`;
			},
		},
		{
			path: '/spreadsheet',
			title: 'Divcord spreadsheet',
			render: () => html`<e-divcord-spreadsheet></e-divcord-spreadsheet>`,
		},
	],
});
