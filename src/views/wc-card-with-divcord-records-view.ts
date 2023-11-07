import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../elements/act-area/wc-act-area.js';
import { SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord.js';
import '../elements/divination-card/wc-divination-card.js';
import type { IPoeData } from '../data/poeData.types.js';
import './wc-sourceful-divcord-record.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-card-with-divcord-records-view': CardWithDivcordRecordsViewElement;
	}
}

@customElement('wc-card-with-divcord-records-view')
export class CardWithDivcordRecordsViewElement extends LitElement {
	@property({ type: Object }) poeData!: IPoeData;
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: SourcefulDivcordTableRecord[];

	render() {
		return html`<div class="view">
			<wc-divination-card .name=${this.card}></wc-divination-card>
			${this.records.map(
				record =>
					html`<wc-sourceful-divcord-record
						.poeData=${this.poeData}
						.record=${record}
					></wc-sourceful-divcord-record>`
			)}
		</div>`;
	}

	static styles = css``;
}
