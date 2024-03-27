import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { SourceType } from '../gen/Source';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source-type';
import './p-sources';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { divcordTableContext } from '../context';
import { consume } from '@lit/context';
import { poeData } from '../PoeData';
import { DivcordTable } from '../DivcordTable';
import { ArrayAsyncRenderer } from '../utils';

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
	divcordTable!: DivcordTable;

	@state() sourcesAndCardsRenderer!: ArrayAsyncRenderer<SourceAndCards>;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes([this.sourceType], this.divcordTable.records, poeData);
			if (this.sourceType === 'Act' || this.sourceType === 'Map') {
				sourcesAndCards.sort((a, b) => {
					const aLevel = poeData.areaLevel(a.source.id, this.sourceType as 'Act' | 'Map');
					const bLevel = poeData.areaLevel(b.source.id, this.sourceType as 'Act' | 'Map');
					if (aLevel !== null && bLevel !== null) {
						return this.sourceType === 'Act' ? bLevel - aLevel : aLevel - bLevel;
					} else return 0;
				});
			}

			for (const { cards } of sourcesAndCards) {
				sortByWeight(cards, poeData);
			}

			this.sourcesAndCardsRenderer = new ArrayAsyncRenderer(sourcesAndCards);
		}
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<e-source-type .sourceType=${this.sourceType}></e-source-type>
			<ul>
				${this.sourcesAndCardsRenderer.render(({ source, cards }) => {
					return html`<li>
						<e-source-with-cards
							.showSourceType=${false}
							.source=${source}
							.cards=${cards}
						></e-source-with-cards>
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
			padding-bottom: 0;
		}

		@media (width <=600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
				padding-bottom: 0;
			}

			e-source-with-cards {
				margin-inline: auto;
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
