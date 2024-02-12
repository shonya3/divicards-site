import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { SourcefulDivcordTable } from '../divcord';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../CardsFinder';
import { poeData } from '../PoeData';
import { ArrayAsyncRenderer } from '../utils';
import { sourceTypes } from '../gen/ISource.interface';
import '../elements/e-source-and-cards';
import '../elements/e-verify-faq-alert';

declare global {
	interface HTMLElementTagNameMap {
		'p-verify': VerifyPage;
	}
}

@customElement('p-verify')
export class VerifyPage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: SourcefulDivcordTable;

	@state() sourcesAndCardsRenderer!: ArrayAsyncRenderer<SourceAndCards>;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes(Array.from(sourceTypes), this.divcordTable.records, poeData)
				.map(({ cards, source }) => ({
					cards: cards.filter(c => c.status === 'verify'),
					source,
				}))
				.filter(({ cards }) => cards.length > 0)
				.sort((a, b) => b.cards.length - a.cards.length);
			for (const { cards } of sourcesAndCards) {
				sortByWeight(cards, poeData);
			}

			this.sourcesAndCardsRenderer = new ArrayAsyncRenderer(sourcesAndCards);
		}
	}

	render() {
		const list = this.sourcesAndCardsRenderer.render(
			({ source, cards }: SourceAndCards) =>
				html`<li>
					<e-source-and-cards
						.divcordTable=${this.divcordTable}
						.source=${source}
						.cards=${cards}
					></e-source-and-cards>
				</li>`
		);

		return html`<div class="page">
			<e-verify-faq-alert></e-verify-faq-alert>
			<ul class="list">
				${list}
			</ul>
		</div>`;
	}

	static styles = css`
		:host {
		}

		e-source-and-cards {
			--cards-margin-top: 0rem;
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

		.list {
			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	`;
}
