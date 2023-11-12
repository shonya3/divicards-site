import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/wc-divination-card.js';
import '../elements/divination-card/wc-divination-card.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-maps-table': MapsTableElement;
	}
}

@customElement('wc-maps-table')
export class MapsTableElement extends LitElement {
	@property({ type: Object, attribute: false }) cardsByMaps: Record<string, string[]> = Object.create({});
	@property({ reflect: true }) cardSize: CardSize = 'small';
	@state() filteredMaps: Record<string, string[]> = {};
	@state() mapnameQuery: string = '';

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		console.log('FIRST UPDATED');
	}

	protected willUpdate(changed: PropertyValueMap<this>): void {
		if (changed.has('mapnameQuery')) {
			console.log('CHANGED');
			const mapQuery = this.mapnameQuery.trim().toLowerCase();

			const filtered = Object.entries(this.cardsByMaps)
				.filter(([map, cards]) => map.toLowerCase().includes(mapQuery.trim().toLowerCase()) && cards.length > 0)
				.sort((a, b) => a[0].localeCompare(b[0]));
			this.filteredMaps = Object.fromEntries(filtered);
		}
	}

	#onMapnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.mapnameQuery = input.value;
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
		console.log('here');
		return html`
			<header>
				<form>
					<fieldset>
						<legend>Find map</legend>
						<div>
							<label for="input-mapname">Input map name</label>
							<input @input="${this.#onMapnameInput}" type="text" id="input-mapname" />
						</div>
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
		return html`<table>
			<thead>
				<tr>
					<th scope="col">Map</th>
					<th scope="col">Cards</th>
				</tr>
			</thead>
			<tbody>
				${Object.entries(this.filteredMaps).map(
					([map, cards]) =>
						html`
							<tr>
								<td>${map}</td>
								<td>
									<ul>
										${cards.map(
											card => html`<li>
												<wc-divination-card
													size=${this.cardSize}
													name=${card}
												></wc-divination-card>
											</li>`
										)}
									</ul>
								</td>
							</tr>
						`
				)}
			</tbody>
		</table> `;
	}

	static styles = css`
		:host {
			font-size: 1.5rem;
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
			width: 10%;
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
			gap: 0.4rem;
		}
	`;
}
