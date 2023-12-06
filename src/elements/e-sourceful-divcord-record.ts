import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord.js';
import './e-source.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-sourceful-divcord-record': SourcefulDivcordRecordElement;
	}
}

@customElement('e-sourceful-divcord-record')
export class SourcefulDivcordRecordElement extends LitElement {
	@property({ type: Object }) record!: SourcefulDivcordTableRecord;

	formattedNotes() {
		const text = this.record.notes?.replaceAll('\n', '<br>');
		return unsafeHTML(text);
	}

	protected render() {
		return html`<div class="record">
			${this.greynote()}
			<div>${this.record.card}</div>
			${this.tagHypothesis()}
			<div
				class=${classMap({
					confidence: true,
					[`confidence--${this.record.confidence}`]: true,
				})}
			>
				${this.record.confidence}
			</div>

			${this.record.remainingWork === 'n/a'
				? nothing
				: html`<div class="remainingWork">
						<h3>Remaining Work</h3>
						<span>${this.record.remainingWork}</span>
				  </div>`}
			${(this.record.sources ?? []).length > 0
				? html`<div class="wiki-agreements">
						<h3>Wiki agreements</h3>
						<ul class="wiki-agreements_sources">
							${(this.record.sources ?? []).map(
								source => html`<li>
									<e-source .source=${source}></e-source>
								</li>`
							)}
						</ul>
				  </div>`
				: nothing}
			${this.wikiDisagreements()} ${this.sourcesWithTagButNotOnWiki()} ${this.notes()}
		</div>`;
	}

	protected greynote() {
		const markup = html`<div class="greynote">${this.record.greynote}</div>`;
		return this.record.greynote ? markup : nothing;
	}

	protected tagHypothesis() {
		const markup = html`<div class="tagHypothesis">
			<h2>${this.record.tagHypothesis}</h2>
		</div>`;
		return this.record.tagHypothesis ? markup : nothing;
	}

	protected wikiDisagreements() {
		const markup = html`<div class="wikiDisagreements">
			<h3>Wiki disagreements</h3>
			<p>${this.record.wikiDisagreements}</p>
		</div>`;
		return this.record.wikiDisagreements ? markup : nothing;
	}

	protected sourcesWithTagButNotOnWiki() {
		const markup = html`<div class="sourcesWithTagButNotOnWiki">
			<h3>Sources with Tag but not on wiki. Need to verify</h3>
			<p>${this.record.sourcesWithTagButNotOnWiki}</p>
		</div>`;
		return this.record.sourcesWithTagButNotOnWiki ? markup : nothing;
	}

	protected notes() {
		const markup = html`<div class="notes">
			<h3>notes</h3>
			<p>${this.formattedNotes()}</p>
		</div>`;
		return this.record.notes ? markup : nothing;
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
		.notes {
			max-width: 65ch;
			font-size: 1rem;
			margin-top: 2rem;
		}
	`;
}
