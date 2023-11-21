import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord.js';
import { PoeData } from '../PoeData';

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}

@customElement('p-card')
export class CardPage extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ reflect: true }) card!: string;
	@property({ type: Array }) records!: SourcefulDivcordTableRecord[];

	render() {
		return html`<e-card-with-divcord-records
			.poeData=${this.poeData}
			.card=${this.card}
			.records=${this.records}
		></e-card-with-divcord-records>`;
	}

	static styles = css`
		e-card-with-divcord-records::part(card) {
			view-transition-name: card;
		}
	`;
}
