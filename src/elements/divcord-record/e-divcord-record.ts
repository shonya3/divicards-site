import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../e-source/e-source';
import '../e-need-to-verify';
import '../e-verify-faq-alert';
import './e-divcord-record-notes.js';
import './e-divcord-record-confidence.js';
import './e-divcord-record-remaining-work.js';
import type { DivcordRecord } from '../../../gen/divcord';
import { divcordRecordHref } from '../../utils';
import { linkStyles } from '../../linkStyles';

/**
 * A block representation of a in divcord spreadsheet row.
 */
@customElement('e-divcord-record')
export class SourcefulDivcordRecordElement extends LitElement {
	@property({ type: Object }) record!: DivcordRecord;

	protected render(): TemplateResult {
		return html`<div class="record">
			${this.record.greynote === 'Empty' ? nothing : html`<span class="greynote">${this.record.greynote}</span>`}

			<a href=${divcordRecordHref(this.record.id)} target="_blank" class="cardName">
				#${this.record.id} ${this.record.card}</a
			>

			<e-divcord-record-confidence .confidence=${this.record.confidence}></e-divcord-record-confidence>
			<e-divcord-record-remaining-work
				.remainingWork=${this.record.remainingWork}
			></e-divcord-record-remaining-work>

			${this.record.sources.length > 0
				? html`
						<ul class="sources-list">
							${this.record.sources.map(
								source => html`<li>
									<e-source .source=${source}></e-source>
								</li>`
							)}
						</ul>
				  `
				: nothing}
			${this.record.verifySources.length
				? html`<div class="verify-sources">
						<h3>Need to verify</h3>
						<e-verify-faq-alert></e-verify-faq-alert>
						<ul>
							${this.record.verifySources.map(
								source => html`<li>
									<e-need-to-verify>
										<e-source .source=${source}></e-source>
									</e-need-to-verify>
								</li>`
							)}
						</ul>
				  </div>`
				: nothing}

			<e-divcord-record-notes class="notes" .notes=${this.record.notes}></e-divcord-record-notes>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		:host {
			display: block;
			--greynote-color: var(--sl-color-gray-400);
			--paragraph-color: var(--sl-color-gray-700);
		}

		${linkStyles}

		.record {
			min-width: 400px;
			max-width: 600px;

			border: solid 1px var(--sl-color-neutral-200);
			border-radius: var(--sl-border-radius-medium);
			box-shadow: var(--sl-shadow-small);

			padding: 2rem;
		}

		.cardName {
			display: block;
			gap: var(--sl-spacing-x-small);
			padding-bottom: var(--sl-spacing-x-small);
			font-size: var(--sl-font-size-medium);
			text-decoration: underline;
			font-weight: var(--sl-font-weight-bold);
		}

		.greynote {
			color: var(--greynote-color);
			font-style: italic;
		}

		.sources-list {
			display: flex;
			gap: var(--sl-spacing-small);
			list-style: none;
			flex-wrap: wrap;
			padding-block: var(--sl-spacing-2x-large);
		}

		.verify-sources {
			margin-top: 2rem;

			& e-verify-faq-alert {
				margin-top: var(--sl-spacing-small);
			}

			& ul {
				margin-top: var(--sl-spacing-x-small);
				list-style: none;
				display: flex;
				gap: 2rem;
				flex-wrap: wrap;
			}
		}

		.notes {
			margin-top: var(--sl-spacing-4x-large);
		}

		h3 {
			margin-top: 4rem;
			margin-bottom: 1rem;
			font-size: 1.05rem;
			font-weight: 500;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-record': SourcefulDivcordRecordElement;
	}
}
