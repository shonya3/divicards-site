import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PoeData } from '../PoeData';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import './p-card-with-divcord-records-view';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord-table': DivcordTablePage;
	}
}

@customElement('p-divcord-table')
export class DivcordTablePage extends LitElement {
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	render() {
		return html`<ul>
			${this.divcordTable.cards().map(card => {
				return html`<p-card-with-divcord-records
					.poeData=${this.poeData}
					.card=${card}
					.records=${this.divcordTable.recordsByCard(card)}
				></p-card-with-divcord-records>`;
			})}
		</ul>`;
	}

	static styles = css``;
}
