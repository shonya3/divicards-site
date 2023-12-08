import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { SourcefulDivcordTable } from '../divcord';
import '../elements/e-page-controls';
import './e-card-with-sources';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { paginate } from '../utils';
import '../elements/input/e-input';
import inputStyles from '../elements/input/input.styles';

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
		const input = e.target as HTMLInputElement;
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
		return html`<div class="page">
			<header>
				<form>
					<div style="max-width: 600px">
						<e-input
							label="Enter card name"
							.datalistItems=${this.divcordTable.cards()}
							@input="${this.#onCardnameInput}"
							type="text"
						>
						</e-input>
					</div>
				</form>
				<e-page-controls
					.n=${this.filtered.length}
					page=${this.page}
					per-page=${this.perPage}
				></e-page-controls>
			</header>
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
			</ul>
		</div>`;
	}

	static styles = css`
		${inputStyles}
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}

		header {
			margin-top: 1rem;
			justify-content: center;
			max-width: 600px;
			margin-inline: auto;
		}

		@media (max-width: 600px) {
			header {
				padding: 0.2rem;
			}
		}

		.cards {
			margin-top: 3rem;
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
