import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Card } from '../../gen/poeData';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Order } from '../types';
import { keyed } from 'lit/directives/keyed.js';
import { styles as tableStyles } from './table.styles';
import { Source } from '../../gen/Source';

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table': WeightsTableElement;
	}
}

export type RowDataForWeightsTableCard = Pick<Card, 'name' | 'weight'>;
export type RowDataForWeightsTableVerifySources = RowDataForWeightsTableCard & { sources: Source[] };

class Sort {
	static byName(cards: RowDataForWeightsTableCard[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
	}

	static byWeight(cards: RowDataForWeightsTableCard[], order: Order): void {
		cards.sort((a, b) => (order === 'asc' ? a.weight - b.weight : b.weight - a.weight));
	}
}

@customElement('e-weights-table')
export class WeightsTableElement extends LitElement {
	@property({ type: Array }) cards: RowDataForWeightsTableCard[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' = 'weight';
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private cardsClone: RowDataForWeightsTableCard[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('cards')) {
			this.cardsClone = structuredClone(this.cards);
		}

		if (map.has('weightOrder')) {
			if (this.orderedBy === 'weight') {
				this.weightIcon = this.weightOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byWeight(this.cardsClone, this.weightOrder);
			}
		}

		if (map.has('nameOrder')) {
			if (this.orderedBy === 'name') {
				this.nameIcon = this.nameOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byName(this.cardsClone, this.nameOrder);
			}
		}
	}

	#toggleWeightOrder() {
		this.weightOrder = this.weightOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'weight';
	}

	#toggleNameOrder() {
		this.nameOrder = this.nameOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'name';
	}

	protected render() {
		return html`<table class="table">
			<thead>
				<tr>
					<th class="th" scope="col">№</th>
					<th class="th th-name" scope="col">
						<div class="header-with-icon">
							Card
							<sl-icon
								class=${classMap({ 'ordered-by': this.orderedBy === 'name' })}
								@click=${this.#toggleNameOrder}
								.name=${this.nameIcon}
							></sl-icon>
						</div>
					</th>
					<th class="th th-weight">
						<div class="header-with-icon">
							Weight
							<sl-icon
								class=${classMap({ 'ordered-by': this.orderedBy === 'weight' })}
								@click=${this.#toggleWeightOrder}
								.name=${this.weightIcon}
							></sl-icon>
						</div>
					</th>
				</tr>
			</thead>

			<tbody>
				${this.cardsClone.map(({ name, weight }, index) => {
					const weightStr =
						weight > 5
							? weight.toLocaleString('ru', { maximumFractionDigits: 0 })
							: weight.toLocaleString('ru', { maximumFractionDigits: 2 });

					return keyed(
						name,
						html`<tr>
							<td class="td">${index + 1}</td>
							<td class="td">
								<e-divination-card size="small" name=${name}></e-divination-card>
							</td>
							<td class="td td-weight">${weightStr}</td>
						</tr>`
					);
				})}
			</tbody>
		</table>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		${tableStyles}
	`;
}
