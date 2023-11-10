import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/wc-divination-card.ts';
import type { ISource } from '../data/ISource.interface.ts.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/act-area/wc-act-area.js';
import './wc-source.js';
import './wc-page-controls.ts';
import { PoeData } from '../PoeData.ts';

declare global {
	interface HTMLElementTagNameMap {
		'wc-cards-table': CardsTableElement;
	}
}

const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('wc-cards-table')
export class CardsTableElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ type: Object }) poeData!: Readonly<PoeData>;
	@property({ type: Object, attribute: false }) sourcesByCards!: Readonly<Record<string, ISource[]>>;
	@property({ reflect: true }) filter: string = '';

	get filtered() {
		const filter = this.filter.trim().toLowerCase();
		return Object.entries(this.sourcesByCards)
			.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
			.sort((a, b) => a[0].localeCompare(b[0]));
	}

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		if (_changedProperties.has('filter')) {
			const url = new URL(window.location.href);

			if (this.filter) {
				url.searchParams.set('filter', this.filter);
				window.history.pushState({}, '', url);
			}
		}
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.page = 1;

		this.filter = input.value;
	}

	#oncardSizeSelect(e: InputEvent) {
		if (e.target instanceof HTMLSelectElement) {
			const value = e.target.value;
			if (['small', 'medium', 'large'].some(size => size === value)) {
				this.cardSize = value as CardSize;
			}
		}
	}

	protected render() {
		return html`
			<header>
				<form>
					<fieldset>
						<legend>Find card</legend>
						<div>
							<label for="input-cardname">Input card name</label>
							<input @input="${this.#onCardnameInput}" type="text" id="input-cardname" />
						</div>
					</fieldset>
					<fieldset>
						<legend>card size</legend>
						<div>
							<select @input=${this.#oncardSizeSelect} .value=${this.cardSize} name="" id="">
								<option value="small">small</option>
								<option value="medium">medium</option>
								<option value="large">large</option>
							</select>
						</div>
					</fieldset>
				</form>
				<wc-page-controls page=${this.page} per-page=${this.perPage}></wc-page-controls>
			</header>
			${this.table()}
		`;
	}

	protected table() {
		const width = this.cardSize === 'small' ? '134px' : this.cardSize === 'medium' ? '268px' : '326px';
		const markup = html`<table>
			<thead>
				<tr>
					<th style="width:${width}" scope="col">Cards</th>
					<th style="width: 20px" scope="col">Min Level</th>
					<th scope="col">Sources</th>
				</tr>
			</thead>
			<tbody>
				${this.paginated.map(
					([card, sources]) =>
						html`
							<tr>
								<td>
									<wc-divination-card size=${this.cardSize} name=${card}></wc-divination-card>
								</td>
								<td>${this.poeData.cards.find(c => c.name === card)?.minLevel ?? 0}</td>
								<td>
									<ul>
										${sources.map(
											source => html`<li>
												<wc-source
													.size=${this.cardSize}
													.poeData=${this.poeData}
													.source=${source}
												></wc-source>
											</li>`
										)}
									</ul>
								</td>
							</tr>
						`
				)}
			</tbody>
		</table> `;

		return markup;
	}

	static styles = css`
		* {
		}
		:host {
			--card-width-small: 134px;
			--card-width-medium: 268px;
			--card-width-large: 326px;
			font-size: 1.5rem;
		}

		form {
			width: fit-content;
			margin: auto;
		}

		legend {
			padding: initial;
			margin: initial;
		}

		header {
			border-bottom: none;
		}
		table {
			min-width: 100%;
			table-layout: fixed;
			border-collapse: collapse;
		}

		tbody tr:nth-child(odd) {
			background-color: #222;
		}

		th {
			font-size: 20px;
			padding: 1rem;
		}

		th:first-child {
			width: 356px;
		}

		td {
			text-align: center;
		}

		li {
			list-style: none;
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: 1.5rem;
		}
	`;
}
