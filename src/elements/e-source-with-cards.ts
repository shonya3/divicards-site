import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { CardBySource } from '../cards';
import type { ISource } from '../gen/ISource.interface';
import './e-source/e-source';
import './e-cards-by-source';

declare global {
	interface HTMLElementTagNameMap {
		'e-source-with-cards': SourceWithCardsElement;
	}
}

@customElement('e-source-with-cards')
export class SourceWithCardsElement extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Array }) cards!: CardBySource[];
	@property({ type: Boolean }) showSourceType = true;

	@query('.source') mainSourceElement!: HTMLElement;

	constructor() {
		super();
		this.addEventListener('boss-navigation', this.#onBossNavigation.bind(this));
	}

	#onBossNavigation() {
		this.mainSourceElement.style.setProperty('view-transition-name', 'none');
	}

	render() {
		return html`<div class="wrapper">
			<e-source
				exportparts="source-type"
				part="source"
				class="source"
				size="large"
				.source=${this.source}
				.showSourceType=${this.showSourceType}
			></e-source>
			<e-cards-by-source class="cards" .cards=${this.cards}></e-cards-by-source>
		</div>`;
	}

	static styles = css`
		:host {
			--source-font-size: 1.2rem;
			--cards-margin-top: 1rem;
		}

		.wrapper {
			display: flex;
			max-width: 1600px;
			flex-direction: column;
		}

		.cards {
			margin-top: var(--cards-margin-top);
		}

		@media (width <=700px) {
			e-source {
				margin-inline: auto;
			}
		}
	`;
}
