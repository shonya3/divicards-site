import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-page-controls';
import '../elements/e-cards-by-source';
import { poeData } from '../PoeData';
import { CardBySource, cardsByMaps, sortByWeight } from '../cards';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { paginate } from '../utils';
import { SourcefulDivcordTable } from '../divcord';

declare global {
	interface HTMLElementTagNameMap {
		'p-maps-table': MapsTablePage;
	}
}

@customElement('p-maps-table')
export class MapsTablePage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: SourcefulDivcordTable;

	@state() cardsByMaps: Record<string, CardBySource[]> = {};

	get filtered() {
		const filter = this.filter.trim().toLowerCase();
		const entries = Object.entries(this.cardsByMaps)
			.filter(([map]) => map.toLowerCase().includes(filter.trim().toLowerCase()))
			.sort((a, b) => a[0].localeCompare(b[0]));

		return entries;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			this.cardsByMaps = cardsByMaps(this.divcordTable.records);
		}

		if (map.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.replaceState({}, '', url);
		}
	}

	get paginated() {
		const entries = paginate(this.filtered, this.page, this.perPage);
		for (const [_, cards] of entries) {
			sortByWeight(cards, poeData);
		}
		return entries;
	}

	#onMapnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;

		this.filter = input.value;
	}

	maps() {
		const mapnames = poeData.maps.map(({ name }) => name);
		mapnames.sort((a, b) => a.localeCompare(b));
		return mapnames;
	}
	protected render() {
		return html`
			<div class="page">
				<header>
					<form>
						<e-input
							label="Enter map name"
							@input="${this.#onMapnameInput}"
							type="text"
							.datalistItems=${this.maps()}
						></e-input>
					</form>
					<e-page-controls
						.n=${this.filtered.length}
						page=${this.page}
						per-page=${this.perPage}
					></e-page-controls>
				</header>
				${this.table()}
			</div>
		`;
	}

	protected table() {
		return html`
			<table>
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
										<e-cards-by-source .cards=${cards}></e-cards-by-source>
									</td>
								</tr>
							`
					)}
				</tbody>
			</table>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
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

		th:first-child {
			width: 200px;
		}

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
