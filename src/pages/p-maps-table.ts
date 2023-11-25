import { LitElement, html, css, PropertyValueMap, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import '../elements/e-page-controls';
import { poeData } from '../PoeData';
import { CardFromSource } from '../data/CardsFinder';

declare global {
	interface HTMLElementTagNameMap {
		'p-maps-table': MapsTablePage;
	}
}

const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('p-maps-table')
export class MapsTablePage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ type: Object, attribute: false }) cardsByMaps: Record<string, CardFromSource[]> = Object.create({});
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';

	get filtered() {
		const filter = this.filter.trim().toLowerCase();
		return Object.entries(this.cardsByMaps)
			.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
			.sort((a, b) => a[0].localeCompare(b[0]));
	}

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		if (_changedProperties.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.pushState({}, '', url);
		}
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
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
			${this.table()}
		`;
	}

	protected table() {
		return html`<table>
			<thead>
				<tr>
					<th scope="col">Map</th>
					<th scope="col">Cards</th>
				</tr>
			</thead>
			<tbody>
				${this.paginated.map(
					([map, cards]) =>
						html`
							<tr>
								<td>
									<e-source
										.size=${this.size}
										.source=${{ id: map, type: 'Map', kind: 'source-with-member' } as const}
										.showSourceType=${false}
									></e-source>
								</td>
								<td>
									<ul>
										${cards.map(({ card, boss }) => {
											return html`<li>
												<e-divination-card
													.minLevel=${poeData.minLevel(card)}
													size=${this.size}
													name=${card}
													.boss=${boss?.id}
												>
													${boss
														? html`<e-source
																.renderMode=${'compact'}
																.source=${boss}
																slot="boss"
														  ></e-source>`
														: nothing}
												</e-divination-card>
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
