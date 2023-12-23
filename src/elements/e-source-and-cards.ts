import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { CardFromSource } from '../CardsFinder';
import type { ISource } from '../ISource.interface';
import './divination-card/e-divination-card';
import './e-source';
import { poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../divcord';
import '../pages/e-card-with-sources';

declare global {
	interface HTMLElementTagNameMap {
		'e-source-and-cards': SourceAndCardsElement;
	}
}

@customElement('e-source-and-cards')
export class SourceAndCardsElement extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Array }) cards!: CardFromSource[];
	@property({ type: Boolean }) showSourceType = true;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	@query('.source') mainSourceElement!: HTMLElement;

	#onBossNavigation() {
		this.mainSourceElement.style.setProperty('view-transition-name', 'none');
	}

	cardsList() {
		return html`<ul>
			${this.cards.map(({ card, boss }) => {
				return html`<e-divination-card
					.minLevel=${poeData.minLevel(card)}
					size="large"
					.name=${card}
					.boss=${boss?.id}
				>
					${boss
						? html`<e-source
								@click=${this.#onBossNavigation}
								.renderMode=${'compact'}
								.source=${boss}
								slot="boss"
						  ></e-source>`
						: nothing}
				</e-divination-card>`;
			})}
		</ul>`;
	}

	render() {
		if (this.source.type === 'Global Drop') {
			return html`<ul class="cards">
				${this.cards.map(card => {
					return html`<li>
					<e-card-with-sources
						.name=${card.card}
						.divcordTable=${this.divcordTable}
						size="medium"
					></e-card-with-sources>
				</li>
            </ul>`;
				})}
			</ul>`;
		}

		return html`<div class="wrapper">
			<e-source
				exportparts="source-type"
				part="source"
				class="source"
				size="large"
				.source=${this.source}
				.showSourceType=${this.showSourceType}
			></e-source>
			${this.cardsList()}
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}
		.cards {
			margin-top: 3rem;
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			gap: 4rem;
			max-width: 1600px;
			margin-inline: auto;
			justify-content: center;
		}
	`;
}
