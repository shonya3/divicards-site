import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord';
import '../elements/e-page-controls';
import './e-card-with-sources';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { paginate } from '../utils';

declare global {
	interface HTMLElementTagNameMap {
		'p-home': HomePage;
	}
}

@customElement('p-home')
export class HomePage extends LitElement {
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';

	@consume({ context: divcordTableContext, subscribe: true })
	divcordTable!: SourcefulDivcordTable;

	async #onCardnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.page = 1;

		this.filter = input.value;
	}

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
		return html` <form>
				<div>
					<label for="input-cardname">search card</label>
					<input list="cards-datalist" @input="${this.#onCardnameInput}" type="text" id="input-cardname" />
					<datalist id="cards-datalist">
						${this.divcordTable.cards().map(card => html`<option value=${card}>${card}</option>`)}
					</datalist>
				</div>
			</form>
			<e-page-controls page=${this.page} per-page=${this.perPage}></e-page-controls>
			<ul class="cards">
				${this.paginated.map(card => {
					return html`<li>
						<e-card-with-sources
							.name=${card}
							.divcordTable=${this.divcordTable}
							.size=${this.size}
						></e-card-with-sources>
					</li>`;
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
			list-style: none;
			gap: 4rem;
			max-width: 1600px;
			margin-inline: auto;
			justify-content: center;
		}
	`;
}
