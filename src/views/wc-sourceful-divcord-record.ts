import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord';
import './wc-source.js';
import { PoeData } from '../PoeData.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-sourceful-divcord-record': SourcefulDivcordRecordElement;
	}
}

@customElement('wc-sourceful-divcord-record')
export class SourcefulDivcordRecordElement extends LitElement {
	@property({ type: Object }) record!: SourcefulDivcordTableRecord;
	@property({ type: Object }) poeData!: PoeData;
	protected render() {
		return html`<div class="record">
			${this.greynote()}
			<div>${this.record.card}</div>
			${this.tagHypothesis()}
			<div>${this.record.confidence}</div>
			<ul class="dropsources">
				${(this.record.sources ?? []).map(
					source => html`<wc-source .poeData=${this.poeData} .source=${source}></wc-source>`
				)}
			</ul>
			${this.wikiDisagreements()} ${this.sourcesWithTagButNotOnWiki()} ${this.notes()}
		</div>`;
	}

	protected greynote() {
		const markup = html`<div class="greynote">${this.record.greynote}</div>`;
		return this.record.greynote ? markup : nothing;
	}

	protected tagHypothesis() {
		const markup = html`<div class="tagHypothesis">${this.record.tagHypothesis}</div>`;
		return this.record.tagHypothesis ? markup : nothing;
	}

	protected wikiDisagreements() {
		const markup = html`<div class="wikiDisagreements">${this.record.wikiDisagreements}</div>`;
		return this.record.wikiDisagreements ? markup : nothing;
	}

	protected sourcesWithTagButNotOnWiki() {
		const markup = html`<div class="sourcesWithTagButNotOnWiki">${this.record.sourcesWithTagButNotOnWiki}</div>`;
		return this.record.sourcesWithTagButNotOnWiki ? markup : nothing;
	}

	protected notes() {
		const markup = html`<div class="notes">${this.record.notes}</div>`;
		return this.record.notes ? markup : nothing;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}
	`;
}
