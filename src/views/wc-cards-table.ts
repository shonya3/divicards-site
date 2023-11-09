import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/wc-divination-card.ts';
import type { ISource } from '../data/ISource.interface.ts.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/act-area/wc-act-area.js';
import './wc-source.js';
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
	@property({ reflect: true, type: Number }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ type: Object }) poeData!: Readonly<PoeData>;
	@property({ type: Object, attribute: false }) sourcesByCards!: Readonly<Record<string, ISource[]>>;

	@state() nameQuery: string = '';

	get filtered() {
		const mapQuery = this.nameQuery.trim().toLowerCase();
		return Object.entries(this.sourcesByCards)
			.filter(([map]) => map.toLowerCase().includes(mapQuery.trim().toLowerCase()))
			.sort((a, b) => a[0].localeCompare(b[0]));
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	#onCardnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.nameQuery = input.value;
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
			</header>
			${this.table()}
		`;
	}

	protected table() {
		const t0 = performance.now();

		const width = this.cardSize === 'small' ? '134px' : this.cardSize === 'medium' ? '268px' : '326px';
		const markup = html`<table>
			<thead>
				<tr>
					<th style="width:${width}" scope="col">Cards</th>
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

		console.log(performance.now() - t0);

		return markup;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
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

		header {
			border-bottom: none;
		}
		table {
			table-layout: fixed;
			width: 100%;
			border-collapse: collapse;
		}

		tbody tr:nth-child(odd) {
			background-color: #222;
		}

		th {
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
