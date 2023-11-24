import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord.js';
import { poeData } from '../PoeData';

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}

@customElement('p-card')
export class CardPage extends LitElement {
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: SourcefulDivcordTableRecord[];
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	render() {
		return html`<div class="page">
			<e-card-with-divcord-records .poeData=${poeData} .card=${this.card} .records=${this.records}>
				<e-card-with-sources
					slot="card"
					.name=${this.card}
					size="large"
					.minLevel=${poeData.minLevel(this.card)}
					.poeData=${poeData}
					.divcordTable=${this.divcordTable}
				></e-card-with-sources>
			</e-card-with-divcord-records>
		</div>`;
	}

	static styles = css`
		e-card-with-sources {
			view-transition-name: card;
		}

		.page {
			padding: 2rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			e-card-with-sources {
				width: fit-content;
				margin-inline: auto;
			}
		}
	`;
}
