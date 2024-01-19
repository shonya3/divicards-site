import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { SourceType } from '../gen/ISource.interface.ts';
import '../elements/divination-card/e-divination-card.ts';
import '../elements/e-source/e-source.ts';
import '../elements/e-source-type';
import './p-sources.ts';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../CardsFinder.ts';
import { divcordTableContext } from '../context';
import { consume } from '@lit/context';
import { poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../divcord.ts';
import { ArrayAsyncRenderer } from '../utils.ts';

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

	// @state() sourcesAndCards!: AsyncGenerator<SourceAndCards>;
	@state() sourcesAndCardsRenderer!: ArrayAsyncRenderer<SourceAndCards>;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes([this.sourceType], this.divcordTable.records, poeData);
			if (this.sourceType === 'Act' || this.sourceType === 'Map') {
				sourcesAndCards.sort((a, b) => {
					const aLevel = poeData.level(a.source.id, this.sourceType as 'Act' | 'Map');
					const bLevel = poeData.level(b.source.id, this.sourceType as 'Act' | 'Map');
					if (aLevel !== null && bLevel !== null) {
						return this.sourceType === 'Act' ? bLevel - aLevel : aLevel - bLevel;
					} else return 0;
				});
			}

			for (const { cards } of sourcesAndCards) {
				sortByWeight(cards, poeData);
			}

			// this.sourcesAndCards = generator(sourcesAndCards);
			this.sourcesAndCardsRenderer = new ArrayAsyncRenderer(sourcesAndCards);
		}
	}

	protected render() {
		return html`<div class="page">
			<e-source-type .sourceType=${this.sourceType}></e-source-type>
			<ul>
				${this.sourcesAndCardsRenderer.render(({ source, cards }) => {
					return html`<li>
						<e-source-and-cards
							.showSourceType=${false}
							.source=${source}
							.cards=${cards}
							.divcordTable=${this.divcordTable}
						></e-source-and-cards>
					</li>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		:host {
			--source-type-font-size: 1.8rem;
		}

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

		e-source-type {
			width: fit-content;
			margin-inline: auto;
			display: block;
			view-transition-name: source-type;
		}
	`;
}
