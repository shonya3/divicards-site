import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-act-area.js';
import { SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord.js';
import './divination-card/e-divination-card.js';
import './e-sourceful-divcord-record.js';
import { PoeData } from '../PoeData.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-divcord-records': CardWithDivcordRecordsElement;
	}
}

@customElement('e-card-with-divcord-records')
export class CardWithDivcordRecordsElement extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: SourcefulDivcordTableRecord[];

	render() {
		return html`<div class="view">
			<e-divination-card
				part="card"
				.minLevel=${this.poeData.minLevel(this.card)}
				size="large"
				.name=${this.card}
			></e-divination-card>
			<ul>
				${this.records.map(
					record =>
						html`<li>
							<e-sourceful-divcord-record
								.poeData=${this.poeData}
								.record=${record}
							></e-sourceful-divcord-record>
						</li>`
				)}
			</ul>
		</div>`;
	}

	static styles = css`
		.view {
			display: flex;
		}

		ul {
			list-style: none;
			display: flex;
			gap: 2rem;
			flex-wrap: wrap;
		}

		@media (max-width: 600px) {
			.view {
				flex-direction: column;
			}

			ul {
				flex-direction: column;
			}
		}
	`;
}
