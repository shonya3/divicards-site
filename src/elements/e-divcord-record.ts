import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnsafeHTMLDirective, unsafeHTML } from 'lit/directives/unsafe-html.js';
import './e-source/e-source';
import './e-need-to-verify';
import './e-verify-faq-alert';
import { classMap } from 'lit/directives/class-map.js';
import type { DivcordRecord } from '../gen/divcord';
import { DirectiveResult } from 'lit/async-directive.js';
import { divcordRecordHref, escapeHtml } from '../utils';
import { linkStyles } from '../linkStyles';

/**
 * @cssproperty --greynote-color - The text color of greynote.
 * @cssproperty --paragraph-color - The text color of notes and wiki disagreements.
 * @cssproperty	--confidence--done-bg-color - The background color for Done confidence.
 * @cssproperty --confidence--ok-bg-color - The background color for OK confidence.
 * @cssproperty	--confidence--low-bg-color - The background color for Low confidence.
 * @cssproperty	--confidence--none-bg-color - The background color for None confidence.
 * @cssproperty	--confidence--done-color - The text color for Done confidence.
 * @cssproperty --confidence--ok-color - The ok color for OK confidence.
 * @cssproperty	--confidence--low-color - The text color for Low confidence.
 * @cssproperty	--confidence--none-color - The text color for None confidence.
 */
@customElement('e-divcord-record')
export class SourcefulDivcordRecordElement extends LitElement {
	@property({ type: Object }) record!: DivcordRecord;

	protected render(): TemplateResult {
		return html`<div class="record">
			<!-- ${this.record.greynote === 'Empty'
				? nothing
				: html`<div class="greynote">${this.record.greynote}</div>`} -->
			<a href=${divcordRecordHref(this.record.id)} target="_blank" class="cardName">${this.record.card}</a>
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
				: html`<div
						class="${classMap({
							'remaining-work': true,
							'remaining-work--story': this.record.remainingWork === 'story',
							'remaining-work--reverify': this.record.remainingWork === 'reverify',
							'remaining-work--confirm': this.record.remainingWork === 'confirm',
						})}"
				  >
						<span class="remaining-work-span">Remaining Work</span>
						<span>${this.record.remainingWork}</span>
				  </div>`}
			${this.record.sources.length > 0
				? html`<div class="wiki-agreements">
						<h3>Verified drop sources</h3>
						<ul class="wiki-agreements_sources">
							${this.record.sources.map(
								source => html`<li>
									<e-source .source=${source}></e-source>
								</li>`
							)}
						</ul>
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
						<h3>Notes</h3>
						<p>${formatNotes(this.record.notes)}</p>
				  </div>`
				: nothing}
		</div>`;
	}

	static styles = css`
		:host {
			display: block;
			--greynote-color: var(--sl-color-gray-400);
			--paragraph-color: var(--sl-color-gray-700);

			--confidence--done-bg-color: green;
			--confidence--ok-bg-color: #93c47d;
			--confidence--low-bg-color: #f1c232;
			--confidence--none-bg-color: red;

			--confidence--done-color: white;
			--confidence--ok-color: black;
			--confidence--low-color: black;
			--confidence--none-color: white;
		}

		${linkStyles}

		.cardName {
			display: block;
			padding-bottom: 0.4rem;
			font-size: 1.2rem;
			margin-bottom: 1.5rem;

			&:not(:hover) {
				&:link,
				&:visited {
					color: var(--sl-color-gray-950);
				}
			}
		}

		* {
			padding: 0;
			margin: 0;
		}

		p {
			color: var(--paragraph-color);
		}

		.record {
			max-width: 600px;
		}

		.tagHypothesis {
			font-style: italic;
			color: var(--sl-color-gray-500);
		}

		.greynote {
			color: var(--greynote-color);
			font-style: italic;
		}

		/** Confidence */
		.confidence {
			padding: 2rem;
			font-size: 18px;
			position: relative;
		}
		.confidence--done {
			background-color: var(--confidence--done-bg-color);
			color: var(--confidence--done-color);
		}
		.confidence--ok {
			background-color: var(--confidence--ok-bg-color);
			color: var(--confidence--ok-color);
		}
		.confidence--low {
			background-color: var(--confidence--low-bg-color);
			color: var(--confidence--low-color);
		}
		.confidence--none {
			background-color: var(--confidence--none-bg-color);
			color: var(--confidence--none-color);
		}
		.confidence-span,
		.remaining-work-span {
			font-size: 14px;
			position: absolute;
			bottom: 5px;
			right: 5px;
		}

		.remaining-work {
			padding: 2rem;
			font-size: 18px;
			position: relative;
			color: black;
		}
		.remaining-work--reverify {
			background-color: #9fc5e8;
		}
		.remaining-work--story {
			background-color: #efa7c5;
		}
		.remaining-work--confirm {
			background-color: #f5d379;
			color: black;
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

		h3 {
			margin-top: 4rem;
			margin-bottom: 1rem;
			font-size: 1.05rem;
			font-weight: 500;
		}
	`;
}

function formatNotes(notes?: string): DirectiveResult<typeof UnsafeHTMLDirective> {
	return unsafeHTML(escapeHtml(`${notes ?? ''}`).replaceAll('\n', '<br>'));
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-record': SourcefulDivcordRecordElement;
	}
}
