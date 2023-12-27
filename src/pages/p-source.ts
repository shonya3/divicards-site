import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import { consume } from '@lit/context';
import { cardsFinderContext } from '../context';
import '../elements/e-source-and-cards';
import { CardFromSource, CardsFinder, sortByWeight } from '../CardsFinder';
import { poeData } from '../PoeData';
import type { ISource } from '../gen/ISource.interface';

declare global {
	interface HTMLElementTagNameMap {
		'p-source': SourcePage;
	}
}

@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: ISource;

	@consume({ context: cardsFinderContext, subscribe: true })
	@state()
	cardsFinder!: CardsFinder;

	@state() cards!: CardFromSource[];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('cardsFinder') || map.has('source')) {
			const cards = this.cardsFinder.cardsFromSource(this.source);
			sortByWeight(cards, poeData);
			this.cards = cards;
		}
	}

	render() {
		return html`<div class="page">
			<e-source-and-cards
				.divcordTable=${this.cardsFinder.divcordTable}
				.source=${this.source}
				.cards=${this.cards}
			></e-source-and-cards>
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		e-source-and-cards::part(source) {
			view-transition-name: source;
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
	`;
}
