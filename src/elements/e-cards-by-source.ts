import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CardBySource } from '../cards';

import './divination-card/e-divination-card';
import './e-source/e-source';
import './e-need-to-verify';
import type { CardSize } from './divination-card/e-divination-card';

declare global {
	interface HTMLElementTagNameMap {
		'e-cards-by-source': CardsBySourceElement;
	}
}

@customElement('e-cards-by-source')
export class CardsBySourceElement extends LitElement {
	@property({ type: Array }) cards: CardBySource[] = [];
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: CardSize = 'medium';
	@property({ reflect: true, attribute: 'card-size' }) cardSize: CardSize = 'medium';

	#onBossNavigation() {
		this.dispatchEvent(new Event('boss-navigation', { bubbles: true, composed: true }));
	}

	protected render(): TemplateResult {
		return html`<ul class="cards">
			${this.cards.map(({ card, transitiveSource, status }) => {
				const cardHtml = html`<e-divination-card
					size=${this.cardSize}
					.name=${card}
					.boss=${transitiveSource?.id}
				>
					${transitiveSource
						? html`<e-source
								@click=${this.#onBossNavigation}
								.renderMode=${'compact'}
								.source=${transitiveSource}
								slot="boss"
								size=${this.sourceSize}
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

		@media (width <= 700px) {
			.cards {
				flex-direction: column;
				align-items: center;
				flex-wrap: nowrap;
			}
		}
	`;
}
