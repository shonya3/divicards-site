import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-act-area';
import { SourcefulDivcordTableRecord } from '../divcord';
import './divination-card/e-divination-card';
import './e-sourceful-divcord-record';
import { poeData } from '../PoeData';

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-divcord-records': CardWithDivcordRecordsElement;
	}
}

@customElement('e-card-with-divcord-records')
export class CardWithDivcordRecordsElement extends LitElement {
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: SourcefulDivcordTableRecord[];

	render() {
		return html`<div class="view">
			<slot name="card">
				<e-divination-card
					part="card"
					.minLevel=${poeData.minLevel(this.card)}
					size="large"
					.name=${this.card}
				></e-divination-card>
			</slot>
			<ul>
				${this.records.map(
					record =>
						html`<li>
							<e-sourceful-divcord-record .record=${record}></e-sourceful-divcord-record>
						</li>`
				)}
			</ul>
		</div>`;
	}

	static styles = css`
		.view {
			display: flex;
			gap: 2rem;
		}

		* {
			padding: 0rem;
			margin: 0rem;
			box-sizing: border-box;
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
