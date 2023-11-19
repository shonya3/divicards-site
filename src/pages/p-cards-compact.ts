import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { PoeData } from '../PoeData';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import '../elements/e-page-controls';

declare global {
	interface HTMLElementTagNameMap {
		'p-cards-compact': CardsCompactPage;
	}
}

const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('p-cards-compact')
export class CardsCompactPage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;
	@property({ reflect: true }) filter: string = '';

	get filtered() {
		const filter = this.filter.trim().toLowerCase();
		// return Object.entries(this.divcordTable.cards())
		// 	.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
		// 	.sort((a, b) => a[0].localeCompare(b[0]));

		return this.divcordTable.cards().filter(card => card.toLowerCase().includes(filter));
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	render() {
		return html` <e-page-controls page=${this.page} per-page=${this.perPage}></e-page-controls>
			<ul class="cards">
				${this.paginated.map(card => {
					return html`<e-card-with-sources
						.name=${card}
						.poeData=${this.poeData}
						.divcordTable=${this.divcordTable}
						.size=${this.size}
					></e-card-with-sources>`;
				})}
			</ul>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		.cards {
			display: flex;
			flex-wrap: wrap;
		}
	`;
}
