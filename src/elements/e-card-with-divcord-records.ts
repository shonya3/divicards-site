import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './divination-card/e-divination-card';
import './divcord-record/e-divcord-record';
import './e-divcord-needs-info';
import type { DivcordRecord } from '../../gen/divcord';
import 'poe-custom-elements/divination-card.js';
import { when } from 'lit/directives/when.js';

/**
 * Element for card page and divcord page list
 * @slot    card - Divination card slot.
 * @slot    main-start - The very start of the main section.
 * @csspart card - Divination card.
 */
@customElement('e-card-with-divcord-records')
export class CardWithDivcordRecordsElement extends LitElement {
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: DivcordRecord[];

	render(): TemplateResult {
		const allRecordsHaveNoSources = this.records.every(s => s.sources.length === 0);
		const hasReverifySource = this.records.some(record => record.remainingWork === 'reverify');

		return html`
			<slot name="card">
				<e-divination-card part="card" size="large" .name=${this.card}></e-divination-card>
			</slot>
			<main class="main">
				<slot name="main-start"></slot>

				${when(
					allRecordsHaveNoSources && !hasReverifySource,
					() => html`<e-divcord-needs-info .card=${this.card}></e-divcord-needs-info>`
				)}

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
			align-items: start;
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
