import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CardBySource } from '../cards';
import './divination-card/e-divination-card';
import './e-source/e-source';
import './e-need-to-verify';
import type { CardSize } from './divination-card/e-divination-card';
import type { SourceSize } from './e-source/types';
import { ifDefined } from 'lit/directives/if-defined.js';
import { slug } from '../gen/divcordWasm/divcord_wasm';

/**
 * Group of cards by dropsource page and maps page
 * @csspart active_divination_card - Active for view transition card(Optional).
 * @event   navigate-transition Emits on card or source navigation
 */
@customElement('e-cards-by-source')
export class CardsBySourceElement extends LitElement {
	@property({ type: Array }) cards: CardBySource[] = [];
	@property({ reflect: true }) source_size: SourceSize = 'medium';
	@property({ reflect: true }) card_size: CardSize = 'medium';
	@property({ reflect: true }) active_divination_card?: string;

	#onBossNavigation() {
		this.dispatchEvent(new Event('boss-navigation', { bubbles: true, composed: true }));
	}

	protected render(): TemplateResult {
		return html`<ul class="cards">
			${this.cards.map(({ card, transitiveSource, status }) => {
				const cardHtml = html`<e-divination-card
					size=${this.card_size}
					.name=${card}
					.boss=${transitiveSource?.id}
					part=${ifDefined(this.active_divination_card === slug(card) ? 'active_divination_card' : undefined)}
				>
					${transitiveSource
						? html`<e-source
								@click=${this.#onBossNavigation}
								.renderMode=${'compact'}
								.source=${transitiveSource}
								slot="boss"
								size=${this.source_size}
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

		.cards {
			display: flex;
			list-style: none;
			gap: 1rem;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			@media (width >=640px) {
				justify-content: start;
			}

			& > li {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				& > e-need-to-verify {
					margin-bottom: 18px;
				}
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-cards-by-source': CardsBySourceElement;
	}
}
