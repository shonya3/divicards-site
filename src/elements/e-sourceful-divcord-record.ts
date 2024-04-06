import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnsafeHTMLDirective, unsafeHTML } from 'lit/directives/unsafe-html.js';
import './e-source/e-source';
import './e-need-to-verify';
import './e-verify-faq-alert';
import { classMap } from 'lit/directives/class-map.js';
import type { DivcordRecord } from '../gen/divcord';
import { DirectiveResult } from 'lit/async-directive.js';
import { escapeHtml } from '../utils';

declare global {
	interface HTMLElementTagNameMap {
		'e-sourceful-divcord-record': SourcefulDivcordRecordElement;
	}
}

function formatNotes(notes?: string): DirectiveResult<typeof UnsafeHTMLDirective> {
	return unsafeHTML(escapeHtml(`${notes ?? ''}`).replaceAll('\n', '<br>'));
}

@customElement('e-sourceful-divcord-record')
export class SourcefulDivcordRecordElement extends LitElement {
	@property({ type: Object }) record!: DivcordRecord;

	protected render(): TemplateResult {
		return html`<div class="record">
			${this.record.greynote === 'Empty' ? nothing : html`<div class="greynote">${this.record.greynote}</div>`}
			<div>${this.record.card}</div>
			${this.record.tagHypothesis
				? html`<div class="tagHypothesis">
						<h2>${this.record.tagHypothesis}</h2>
				  </div>`
				: nothing}
			<div
				title="Confidence"
				class=${classMap({
					confidence: true,
					[`confidence--${this.record.confidence}`]: true,
				})}
			>
				<span class="confidence-span">Confidence</span> ${this.record.confidence}
			</div>
			${this.record.remainingWork === 'n/a'
				? nothing
				: html`<div class="remainingWork">
						<h3>Remaining Work</h3>
						<span>${this.record.remainingWork}</span>
				  </div>`}
			${(this.record.sources ?? []).length > 0
				? html`<div class="wiki-agreements">
						<h3>Verified drop sources</h3>
						<ul class="wiki-agreements_sources">
							${(this.record.sources ?? []).map(
								source => html`<li>
									<e-source .source=${source}></e-source>
								</li>`
							)}
						</ul>
				  </div>`
				: nothing}
			${this.record.wikiDisagreements
				? html`<div class="wikiDisagreements">
						<h3>Wiki disagreements</h3>
						<p>${this.record.wikiDisagreements}</p>
				  </div>`
				: nothing}
			${this.record.verifySources.length
				? html`<div class="sourcesWithTagButNotOnWiki">
						<h3>Need to verify</h3>
						<e-verify-faq-alert class="verify-faq-alert"></e-verify-faq-alert>
						<ul class="need-to-verify_list">
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
			${this.record.notes
				? html`<div class="notes">
						<h3>notes</h3>
						<p>${formatNotes(this.record.notes)}</p>
				  </div>`
				: nothing}
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		h3 {
			color: #fff;
		}

		p {
			color: #bcbcbc;
		}

		.record {
			max-width: 600px;
		}

		.greynote {
			color: #bbb;
			font-style: italic;
		}

		/** Confidence */

		.confidence {
			padding: 2rem;
			font-size: 18px;
			position: relative;
		}

		.confidence--done {
			background-color: green;
		}
		.confidence--ok {
			background-color: #93c47d;
			color: black;
		}
		.confidence--none {
			background-color: red;
		}
		.confidence--low {
			background-color: #f1c232;
			color: black;
		}
		.confidence-span {
			font-size: 13px;
			position: absolute;
			bottom: 5px;
			right: 5px;
		}

		.remainingWork {
			display: flex;
			align-items: center;
			gap: 2rem;
		}

		.wiki-agreements {
			margin-top: 2rem;
		}

		.wiki-agreements_sources {
			margin-top: 0.5rem;
			list-style: none;
			display: flex;
			gap: 0.8rem;
			flex-wrap: wrap;
		}

		.wikiDisagreements {
			display: flex;
			gap: 0.8rem;
			flex-wrap: wrap;
			margin-top: 2rem;
		}

		.sourcesWithTagButNotOnWiki {
			margin-top: 2rem;
		}

		.verify-faq-alert {
			margin-top: 0.4rem;
		}

		.need-to-verify_list {
			margin-top: 0.5rem;
			list-style: none;
			display: flex;
			gap: 2rem;
			flex-wrap: wrap;
		}

		.notes {
			max-width: 65ch;
			font-size: 1rem;
			margin-top: 2rem;
		}
	`;
}
