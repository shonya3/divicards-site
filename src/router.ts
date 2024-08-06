// @ts-expect-error TypeScript does not know about globalThis.URLPattern for now
if (!globalThis.URLPattern) {
	await import('urlpattern-polyfill');
}

import { Router } from '@thepassle/app-tools/router.js';
import { html } from 'lit';
import { SourceType, Source } from './gen/Source';

import './pages/p-home';
import './pages/p-card';
import './pages/p-source';
import './pages/p-source-type';
import './pages/p-verify-faq';
import './pages/p-verify';
import './pages/p-useful-resources';
import './elements/divcord-spreadsheet/e-divcord-spreadsheet';

import { lazy } from '@thepassle/app-tools/router/plugins/lazy.js';

export const router = new Router({
	routes: [
		{
			path: '/',
			title: 'Divicards',
			render: ({ query }) => {
				return html`<p-home
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
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
				.perPage=${Number(query['per-page'] ?? 10)}
				.filter=${query.filter ?? ''}
			></p-divcord>`,
		},
		{
			path: '/verify-faq',
			title: 'faq',
			render: () => html`<p-verify-faq></p-verify-faq>`,
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
			path: '/verify',
			title: 'Need to verify',
			render: () => {
				return html`<p-verify></p-verify>`;
			},
		},
		{
			path: '/useful-resources',
			title: 'Useful Resources',
			render: () => {
				return html`<p-useful-resources></p-useful-resources>`;
			},
		},
		{
			path: '/source',
			title: context => decodeURI(context.query!.id),
			render: context => {
				const id: string = context.query.id;
				const type = context.query.type as SourceType;
				const source: Source = { id, type, kind: 'source-with-member' };
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
			render: ({ query }) => {
				return html`<p-sources
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
				></p-sources>`;
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
