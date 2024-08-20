import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './divination-card/e-divination-card';
import './e-divcord-record';
import './e-divcord-needs-info';
import type { DivcordRecord } from '../gen/divcord';
import 'poe-custom-elements/divination-card.js';

/**
 * @summary Element for card page and divcord page list
 */
@customElement('e-card-with-divcord-records')
export class CardWithDivcordRecordsElement extends LitElement {
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: DivcordRecord[];

	render(): TemplateResult {
		const allRecordsHaveNoSources = this.records.every(s => s.sources.length === 0);

		return html`
			<slot name="card">
				<e-divination-card part="card" size="large" .name=${this.card}></e-divination-card>
			</slot>
			<main class="main">
				<slot name="main-start"></slot>
				${allRecordsHaveNoSources
					? html`<e-divcord-needs-info .card=${this.card}></e-divcord-needs-info>`
					: nothing}
				<ul class="records">
					${this.records.map(
						record =>
							html`<li>
								<e-divcord-record .record=${record}></e-divcord-record>
							</li>`
					)}
				</ul>
			</main>
		`;
	}

	static styles = css`
		* {
			padding: 0rem;
			margin: 0rem;
			box-sizing: border-box;
		}

		:host {
			display: flex;
			flex-direction: column;
			max-width: max-content;
			gap: 2rem;
			@media (width >= 640px) {
				flex-direction: row;
			}
		}

		.main {
			display: flex;
			flex-direction: column;
			gap: 2rem;
		}

		.records {
			list-style: none;
			display: flex;
			gap: 2rem;
			flex-wrap: wrap;
			flex-direction: column;
			@media (width >=640px) {
				flex-direction: row;
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-divcord-records': CardWithDivcordRecordsElement;
	}
}
