import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { CardBySource } from '../CardsFinder';
import type { ISource } from '../gen/ISource.interface';
import './e-source/e-source';
import './e-cards-by-source-list';

declare global {
	interface HTMLElementTagNameMap {
		'e-source-and-cards': SourceAndCardsElement;
	}
}

@customElement('e-source-and-cards')
export class SourceAndCardsElement extends LitElement {
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
			<e-cards-by-source-list class="cards" .cards=${this.cards}></e-cards-by-source-list>
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
	`;
}
