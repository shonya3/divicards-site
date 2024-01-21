// @ts-expect-error
if (!globalThis.URLPattern) {
	await import('urlpattern-polyfill');
}

import { Router } from '@thepassle/app-tools/router.js';
import { html } from 'lit';
import { SourceType, ISource } from './gen/ISource.interface';

import './pages/p-home';
import './pages/p-card';
import './pages/p-source';
import './pages/p-source-type';
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
			plugins: [lazy(() => import('./pages/p-maps-table'))],
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
			plugins: [lazy(() => import('./pages/p-sources'))],
			render: ({ query }) => {
				return html`<p-sources
					.page=${Number(query.page ?? 1)}
					.perPage=${Number(query['per-page'] ?? 10)}
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

declare global {
	interface Document {
		startViewTransition: (cb: (...args: any[]) => any) => Promise<unknown>;
	}
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
