import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card.js';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import { poeData } from '../PoeData.js';
import { divcordTableContext } from '../context.js';
import { SourceAndCards, cardsBySourceTypes } from '../data/CardsFinder.js';
import { consume } from '@lit/context';
import { SourceType, sourceTypes } from '../data/ISource.interface.js';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-sources': SourcesPage;
	}
}

@customElement('p-sources')
export class SourcesPage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'large';
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) showSourceType = true;
	@property() firstColumnName = 'Source';
	@property({ type: Array }) sourceTypes: SourceType[] = Array.from(sourceTypes);

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: SourcefulDivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];

	get records() {
		return this.divcordTable.records;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			this.sourcesAndCards = cardsBySourceTypes(this.sourceTypes, this.records, poeData);
		}

		if (map.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.replaceState({}, '', url);
		}
	}

	protected render() {
		return html`<div class="page">
			<ul>
				${this.sourcesAndCards.map(
					({ source, cards }) =>
						html`<li><e-source-and-cards .source=${source} .cards=${cards}></e-source-and-cards></li>`
				)}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page {
			padding: 2rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}

		li:not(:first-child) {
			margin-top: 4rem;
		}

		li {
			list-style: none;
		}
	`;
}
