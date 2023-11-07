import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../elements/act-area/wc-act-area.js';
import { ISourcefulDivcordTableRecord } from '../data/records.types.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-card-with-divcord-records-view': CardWithDivcordRecordsViewElement;
	}
}

@customElement('wc-card-with-divcord-records-view')
export class CardWithDivcordRecordsViewElement extends LitElement {
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) divcordRecords!: ISourcefulDivcordTableRecord[];
}
