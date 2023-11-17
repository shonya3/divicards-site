import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/wc-divination-card.ts';
import type { ISource } from '../data/ISource.interface.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/wc-act-area.js';
import '../elements/wc-source.js';
import '../elements/wc-page-controls.ts';
import { PoeData } from '../PoeData.ts';

declare global {
	interface HTMLElementTagNameMap {
		'wc-cards-list': CardsListElement;
	}
}

const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('wc-cards-list')
export class CardsListElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ type: Object }) poeData!: Readonly<PoeData>;
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
					<li class="card-entry">
						<div class="card-list_item">
							<wc-divination-card
								.minLevel=${this.poeData.minLevel(card)}
								size=${this.cardSize}
								name=${card}
							></wc-divination-card>
							<ul class="sources-list">
								${sources.map(
									source => html`<li class="sources-list_item">
										<wc-source
											.size=${this.cardSize}
											.poeData=${this.poeData}
											.source=${source}
										></wc-source>
									</li>`
								)}
							</ul>
						</div>
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

		@media (max-width: 800px) {
			.cards-list {
				display: flex;
				flex-direction: column;
				gap: 6rem;
				justify-content: center;
				align-items: center;
			}

			ul {
				list-style: none;
			}

			.card-list_item {
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

		wc-source {
		}
	`;
}
