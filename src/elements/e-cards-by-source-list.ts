import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CardBySource } from '../CardsFinder';
import { poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../divcord';

import './divination-card/e-divination-card';
import './e-source/e-source';
import './e-need-to-verify';

declare global {
	interface HTMLElementTagNameMap {
		'e-cards-by-source-list': CardsBySourceListElement;
	}
}

@customElement('e-cards-by-source-list')
export class CardsBySourceListElement extends LitElement {
	@property({ type: Array }) cards: CardBySource[] = [];
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	#onBossNavigation() {
		this.dispatchEvent(new Event('boss-navigation', { bubbles: true, composed: true }));
	}

	protected render() {
		return html`<ul class="cards">
			${this.cards.map(({ card, transitiveSource, status }) => {
				const cardHtml = html`<e-divination-card
					.minLevelOrRange=${poeData.minLevelOrRange(card, this.divcordTable)}
					size="medium"
					.name=${card}
					.boss=${transitiveSource?.id}
				>
					${transitiveSource
						? html`<e-source
								@click=${this.#onBossNavigation}
								.renderMode=${'compact'}
								.source=${transitiveSource}
								slot="boss"
						  ></e-source>`
						: nothing}
				</e-divination-card>`;

				if (status === 'done') {
					return html`<li>${cardHtml}</li>`;
				} else {
					return html`<li><e-need-to-verify>${cardHtml}</e-need-to-verify></li>`;
				}
			})}
		</ul>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		.cards {
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			gap: 1rem;
		}

		li {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		li > e-need-to-verify {
			margin-bottom: 18px;
		}
	`;
}
