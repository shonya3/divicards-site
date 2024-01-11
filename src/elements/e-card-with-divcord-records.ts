import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from '../divcord';
import './divination-card/e-divination-card';
import './e-sourceful-divcord-record';
import './e-divcord-needs-info';
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
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	render() {
		const allRecordsHasNoSources = this.records.every(s => (s.sources ?? []).length === 0);

		return html`<div class="view">
			<slot name="card">
				<e-divination-card
					part="card"
					.minLevelOrRange=${poeData.minLevelOrRange(this.card, this.divcordTable)}
					size="large"
					.name=${this.card}
				></e-divination-card>
			</slot>
			<main class="main">
				<slot name="main-start"></slot>
				${allRecordsHasNoSources
					? html`<e-divcord-needs-info .card=${this.card}></e-divcord-needs-info>`
					: nothing}
				<ul>
					${this.records.map(
						record =>
							html`<li>
								<e-sourceful-divcord-record .record=${record}></e-sourceful-divcord-record>
							</li>`
					)}
				</ul>
			</main>
		</div>`;
	}

	static styles = css`
		.view {
			display: flex;
			gap: 2rem;
		}

		.main {
			display: flex;
			flex-direction: column;
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
