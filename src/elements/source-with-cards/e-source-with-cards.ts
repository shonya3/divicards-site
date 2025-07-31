import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardBySource } from '../../cards';
import type { Source } from '../../../gen/Source';
import '../e-source/e-source';
import './e-cards-by-source';
import type { CardSize } from '../divination-card/e-divination-card';
import type { SourceSize } from '../e-source/types';

/**
 * Dropsource with it's divination cards list
 * @csspart drop_source - Dropsource.
 * @csspart active_divination_card - Active for view transition card(Optional).
 * @event   navigate-transition - Emits on card or source navigation
 */
@customElement('e-source-with-cards')
export class SourceWithCardsElement extends LitElement {
	@property({ type: Object }) source!: Source;
	@property({ type: Array }) cards!: CardBySource[];
	@property({ type: Boolean }) showSourceType = true;
	@property({ reflect: true }) source_size: SourceSize = 'medium';
	@property({ reflect: true }) card_size: CardSize = 'medium';
	@property({ reflect: true }) active_divination_card?: string;

	render(): TemplateResult {
		return html`<div class="wrapper">
			<e-source
				exportparts="source-type"
				part="drop_source"
				class="source"
				size=${this.source_size}
				.source=${this.source}
				.showSourceType=${this.showSourceType}
			></e-source>
			<e-cards-by-source
				exportparts="active_divination_card"
				.card_size=${this.card_size}
				.source_size=${this.source_size}
				class="cards"
				.cards=${this.cards}
				.active_divination_card=${this.active_divination_card}
			></e-cards-by-source>
		</div>`;
	}

	static styles = css`
		:host {
			--cards-margin-top: 1rem;
			width: fit-content;
			display: block;
		}

		.wrapper {
			display: flex;
			max-width: 1600px;
			flex-direction: column;
			width: fit-content;
		}

		.cards {
			margin-top: var(--cards-margin-top);
		}

		e-source {
			margin-inline: auto;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-source-with-cards': SourceWithCardsElement;
	}
}
