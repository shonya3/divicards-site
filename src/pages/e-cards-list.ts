import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/e-divination-card.ts';
import type { ISource } from '../ISource.interface.ts';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-act-area.js';
import '../elements/e-source.js';
import '../elements/e-page-controls.ts';
import { poeData } from '../PoeData.ts';
import { paginate } from '../utils.ts';

declare global {
	interface HTMLElementTagNameMap {
		'e-cards-list': CardsListElement;
	}
}

@customElement('e-cards-list')
export class CardsListElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ type: Object, attribute: false }) sourcesByCards!: Readonly<Record<string, ISource[]>>;
	@property({ reflect: true }) filter: string = '';

	get filtered() {
		const filter = this.filter.trim().toLowerCase();
		return Object.entries(this.sourcesByCards)
			.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
			.sort((a, b) => a[0].localeCompare(b[0]));
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	protected render() {
		const newMarkup = html`<ul class="cards-list">
			${this.paginated.map(
				([card, sources]) => html`
					<li class="cards-list_item">
						<e-divination-card
							.minLevel=${poeData.minLevel(card)}
							size=${this.cardSize}
							name=${card}
						></e-divination-card>
						<ul class="sources-list">
							${sources.map(
								source => html`<li class="sources-list_item">
									<e-source .size=${this.cardSize} .source=${source}></e-source>
								</li>`
							)}
						</ul>
					</li>
				`
			)}
		</ul>`;

		return newMarkup;
	}

	static styles = css`
		:host {
			display: block;
			--card-width-small: 134px;
			--card-width-medium: 268px;
			--card-width-large: 326px;
		}

		* {
			padding: 0;
			margin: 0;
		}

		ul {
			list-style: none;
		}

		.cards-list {
			display: flex;
			flex-direction: column;
		}

		.cards-list_item:nth-child(odd) {
			background-color: #222;
		}

		@media (max-width: 500px) {
			.cards-list {
				justify-content: center;
			}

			.cards-list_item {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			.sources-list {
				margin-top: 0.8rem;
			}

			.sources-list_item {
				display: flex;
				justify-content: center;
			}
		}

		@media (min-width: 500px) {
			.sources-list {
				display: flex;
				flex-wrap: wrap;
				align-self: start;
				gap: 1rem;
			}

			.cards-list_item {
				display: flex;
				gap: 2rem;
			}

			e-source {
				--map-width: fit-content;
			}
		}
	`;
}
