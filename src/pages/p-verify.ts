import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { DivcordTable } from '../DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { poeData } from '../PoeData';
import { ArrayAsyncRenderer } from '../utils';
import { SOURCE_TYPE_VARIANTS } from '../gen/ISource.interface';
import '../elements/e-source-with-cards';
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
	divcordTable!: DivcordTable;

	@state() sourcesAndCardsRenderer!: ArrayAsyncRenderer<SourceAndCards>;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes(
				Array.from(SOURCE_TYPE_VARIANTS),
				this.divcordTable.records,
				poeData
			)
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
					<e-source-with-cards .source=${source} .cards=${cards}></e-source-with-cards>
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
		* {
			padding: 0;
			margin: 0;
		}

		:host {
		}

		e-source-with-cards {
			--cards-margin-top: 0rem;
		}

		.page {
			padding: 2rem;
		}

		.list {
			margin-top: 2rem;
			margin-left: 1rem;

			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			.list {
				margin-left: 0;
			}
		}
	`;
}
