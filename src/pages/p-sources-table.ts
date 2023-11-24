import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card.js';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import { PoeData } from '../PoeData.js';
import { ISource } from '../data/ISource.interface.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-sources-table': SourcesTablePage;
	}
}

export const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('p-sources-table')
export class SourcesTablePage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ type: Object }) poeData!: Readonly<PoeData>;
	@property({ type: Array, attribute: false }) cardsBySources: [ISource, string[]][] = Object.create({});
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) showSourceType = true;
	@property() firstColumnName = 'Source';

	// get filtered() {
	// 	const filter = this.filter.trim().toLowerCase();
	// 	return this.cardsBySources
	// 		.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
	// 		.sort((a, b) => a[0].localeCompare(b[0]));
	// }

	// get paginated() {
	// 	return paginate(this.filtered, this.page, this.perPage);
	// }

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		if (_changedProperties.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.pushState({}, '', url);
		}
	}

	#onMapnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.filter = input.value;
	}

	#oncardSizeSelect(e: InputEvent) {
		if (e.target instanceof HTMLSelectElement) {
			const value = e.target.value;
			if (['small', 'medium', 'large'].some(size => size === value)) {
				this.size = value as CardSize;
			}
		}
	}

	protected render() {
		return html`
			<!--
			<header>
				<form>
					<div>
						<label for="input-mapname">Input map name</label>
						<input @input="${this.#onMapnameInput}" type="text" id="input-mapname" />
					</div>
					<div>
						<label for="select-size">Select size</label>
						<select @input=${this.#oncardSizeSelect} .value=${this.size} name="" id="select-size">
							<option value="small">small</option>
							<option value="medium">medium</option>
							<option value="large">large</option>
						</select>
					</div>
				</form>
				<e-page-controls page=${this.page} per-page=${this.perPage}></e-page-controls>
			</header>

			!-->

			${this.table()}
		`;
	}

	protected table() {
		return html`<table>
			<thead>
				<tr>
					<th style="width: 300px" scope="col">
						<slot>Source</slot>
					</th>
					<th scope="col">Cards</th>
				</tr>
			</thead>
			<tbody>
				${this.cardsBySources.map(
					([source, cards]) =>
						html`
							<tr>
								<td>
									<e-source
										.showSourceType=${this.showSourceType}
										.size=${this.size}
										.poeData=${this.poeData}
										.source=${source}
									></e-source>
								</td>
								<td>
									<ul>
										${cards.map(card => {
											// const minLevel =
											// 	this.poeData.cards.find(c => c.name === card)?.minLevel ?? 0;
											return html`<li>
												<e-divination-card
													.minLevel=${this.poeData.minLevel(card)}
													size=${this.size}
													name=${card}
												></e-divination-card>
											</li>`;
										})}
									</ul>
								</td>
							</tr>
						`
				)}
			</tbody>
		</table> `;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
		form {
			padding: 1rem;
			display: grid;
			gap: 0.25rem;
			width: fit-content;
		}

		fieldset {
			padding: 0.8rem;
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

		/*
		th:first-child {
			width: 356px;
		}
        */

		td {
			text-align: center;
		}

		li {
			list-style: none;
		}

		ul {
			padding: 0.4rem;
			display: flex;
			flex-wrap: wrap;
			gap: 0.6rem;
		}
	`;
}
