import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PoeData } from '../PoeData';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import '../elements/e-card-with-divcord-records';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord': DivcordTablePage;
	}
}

@customElement('p-divcord')
export class DivcordTablePage extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	render() {
		return html`<div class="page">
			<ul>
				${this.divcordTable.cards().map(card => {
					return html`<e-card-with-divcord-records
						.poeData=${this.poeData}
						.card=${card}
						.records=${this.divcordTable.recordsByCard(card)}
					></e-card-with-divcord-records>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page {
			padding: 2rem;
		}

		@media (width < 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			e-card-with-divcord-records::part(card) {
				width: fit-content;
				margin-inline: auto;
			}
		}

		ul {
			display: flex;
			flex-direction: column;
			gap: 3rem;
		}
	`;
}
