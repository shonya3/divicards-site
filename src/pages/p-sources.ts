import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import '../elements/e-source-type';
import { poeData } from '../PoeData';
import { divcordTableContext } from '../context';
import { SourceAndCards, cardsBySourceTypes } from '../data/CardsFinder';
import { consume } from '@lit/context';
import { SourceType, sourceTypes } from '../data/ISource.interface';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import '../elements/e-source-and-cards';

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
	@state() sourcetypesCountsMap!: Map<SourceType, number>;

	get records() {
		return this.divcordTable.records;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const { sourcesAndCards, sourcetypesCountsMap } = cardsBySourceTypes(
				this.sourceTypes,
				this.records,
				poeData
			);
			this.sourcesAndCards = sourcesAndCards.slice(0, 5);
			this.sourcetypesCountsMap = sourcetypesCountsMap;
		}

		if (map.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.replaceState({}, '', url);
		}
	}

	// <li>
	// 					<e-source-type .sourceType=${}></e-source-type>
	// 				</li>

	protected render() {
		return html`<div class="page">
			<details open>
				<summary>List of sourcetypes</summary>
				<ul class="sourcetypes-list">
					${Array.from(this.sourcetypesCountsMap.keys()).map(type => {
						//
						return html`<e-source-type .sourceType=${type}></e-source-type>`;
					})}
				</ul>
			</details>

			<ul style="padding-top: 4rem">
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
			--source-type-font-size: 1rem;
			--source-type-text-color: lightyellow;
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

		.sourcetypes-list {
			display: flex;
			flex-direction: column;
		}
	`;
}
