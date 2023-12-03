import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import '../elements/e-source-type';
import './p-sources.ts';
import { SourceAndCards, cardsBySourceTypes } from '../data/CardsFinder';
import { divcordTableContext } from '../context';
import { consume } from '@lit/context';
import { poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';

declare global {
	interface HTMLElementTagNameMap {
		'p-source-type': SourceTypePage;
	}
}

@customElement('p-source-type')
export class SourceTypePage extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: SourcefulDivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			this.sourcesAndCards = cardsBySourceTypes([this.sourceType], this.divcordTable.records, poeData);
		}
	}

	protected render() {
		return html`<div class="page">
			<e-source-type .sourceType=${this.sourceType}></e-source-type>
			<ul>
				${this.sourcesAndCards.slice(0, 1).map(
					({ source, cards }) =>
						html`<li>
							<e-source-and-cards
								.showSourceType=${false}
								.source=${source}
								.cards=${cards}
							></e-source-and-cards>
						</li>`
				)}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			--source-type-font-size: 1.8rem;
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

		e-source-type {
			width: fit-content;
			margin-inline: auto;
			display: block;
			view-transition-name: source-type;
		}
	`;
}
