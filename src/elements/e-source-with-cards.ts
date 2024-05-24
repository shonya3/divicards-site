import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { CardBySource } from '../cards';
import type { Source } from '../gen/Source';
import './e-source/e-source';
import './e-cards-by-source';
import type { CardSize } from './divination-card/e-divination-card';
import type { SourceSize } from './e-source/types';

declare global {
	interface HTMLElementTagNameMap {
		'e-source-with-cards': SourceWithCardsElement;
	}
}

@customElement('e-source-with-cards')
export class SourceWithCardsElement extends LitElement {
	@property({ type: Object }) source!: Source;
	@property({ type: Array }) cards!: CardBySource[];
	@property({ type: Boolean }) showSourceType = true;
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: SourceSize = 'medium';
	@property({ reflect: true, attribute: 'card-size' }) cardSize: CardSize = 'medium';

	@query('.source') mainSourceElement!: HTMLElement;

	constructor() {
		super();
		this.addEventListener('boss-navigation', this.#onBossNavigation.bind(this));
	}

	#onBossNavigation() {
		this.mainSourceElement.style.setProperty('view-transition-name', 'none');
	}

	render(): TemplateResult {
		return html`<div class="wrapper">
			<e-source
				exportparts="source-type"
				part="source"
				class="source"
				size=${this.sourceSize}
				.source=${this.source}
				.showSourceType=${this.showSourceType}
			></e-source>
			<e-cards-by-source
				card-size=${this.cardSize}
				source-size=${this.sourceSize}
				class="cards"
				.cards=${this.cards}
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

		@media (width <=700px) {
			e-source {
				margin-inline: auto;
			}
		}
	`;
}
