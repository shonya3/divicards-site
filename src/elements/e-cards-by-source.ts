import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CardBySource } from '../cards';
import './divination-card/e-divination-card';
import './e-source/e-source';
import './e-need-to-verify';
import type { CardSize } from './divination-card/e-divination-card';
import type { SourceSize } from './e-source/types';
import { ifDefined } from 'lit/directives/if-defined.js';
import { NavigateTransitionEvent, redispatchTransition } from '../events';
import { slug } from '../gen/divcordWasm/divcord_wasm';

/**
 * Group of cards for dropsource page and maps page
 * @csspart active-card - Active for view transition card(Optional).
 * @event   navigate-transition Emits on card or source navigation
 */
@customElement('e-cards-by-source')
export class CardsBySourceElement extends LitElement {
	@property({ type: Array }) cards: CardBySource[] = [];
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: SourceSize = 'medium';
	@property({ reflect: true, attribute: 'card-size' }) cardSize: CardSize = 'medium';
	@property({ reflect: true, attribute: 'active-card' }) activeCard?: string;

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
					part=${ifDefined(this.activeCard === slug(card) ? 'active-card' : undefined)}
					@navigate-transition=${(e: NavigateTransitionEvent) => redispatchTransition.call(this, e)}
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
