import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Order, WeightData } from './types';
import '../e-need-to-verify';
import { keyed } from 'lit/directives/keyed.js';
import { styles as tableStyles } from './table.styles';
import { Sort } from './Sort';
import '../divination-card/e-divination-card';
import '../e-source/e-source';
import '../weights-table/e-weight-breakdown.js';
import { Source } from '../../../gen/Source';
import { ifDefined } from 'lit/directives/if-defined.js';
import { slug } from '../../../gen/divcordWasm/divcord_wasm';

/**
 * @csspart active_divination_card
 */
@customElement('e-weights-table-verify-sources')
export class WeightsTableVerifySources extends LitElement {
	@property({ type: Array }) rows: RowData[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' = 'weight';
	@property({ reflect: true }) active_divination_card?: string;

	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private rowsClone: RowData[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('rows')) {
			this.rowsClone = structuredClone(this.rows);
		}

		if (map.has('weightOrder')) {
			if (this.orderedBy === 'weight') {
				this.weightIcon = this.weightOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byWeight(this.rowsClone, this.weightOrder);
			}
		}

		if (map.has('nameOrder')) {
			if (this.orderedBy === 'name') {
				this.nameIcon = this.nameOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byName(this.rowsClone, this.nameOrder);
			}
		}

		if (map.has('rows') && !map.has('weightOrder') && !map.has('nameOrder')) {
			if (this.orderedBy === 'weight') {
				this.weightIcon = this.weightOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byWeight(this.rowsClone, this.weightOrder);
			}
			if (this.orderedBy === 'name') {
				this.nameIcon = this.nameOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byName(this.rowsClone, this.nameOrder);
			}
		}
	}

	protected render(): TemplateResult {
		return html` <table class="table">
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
					<th class="th">Sources</th>
				</tr>
			</thead>

			<tbody>
				${this.rowsClone.map((cardRowData, index) => {
					return keyed(
						cardRowData.name,
						html`<tr>
							<td class="td">${index + 1}</td>
							<td class="td">
								<e-need-to-verify>
									<e-divination-card
										part=${ifDefined(
											this.active_divination_card === slug(cardRowData.name)
												? 'active_divination_card'
												: undefined
										)}
										size="small"
										name=${cardRowData.name}
									></e-divination-card>
								</e-need-to-verify>
							</td>
							<td class="td td-weight">
								<e-weight-breakdown .weights=${cardRowData.weights}></e-weight-breakdown>
							</td>
							<td class="td sources">
								<ul class="sources-list">
									${cardRowData.sources.map(
										source => html`<li><e-source size="small" .source=${source}></e-source></li>`
									)}
								</ul>
							</td>
						</tr>`
					);
				})}
			</tbody>
		</table>`;
	}

	#toggleWeightOrder() {
		this.weightOrder = this.weightOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'weight';
	}

	#toggleNameOrder() {
		this.nameOrder = this.nameOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'name';
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			list-style: none;
		}

		:host {
			display: block;
			max-width: 1080px;
		}

		${tableStyles}

		.sources-list {
			display: flex;
			flex-wrap: wrap;
			gap: 2rem;
		}

		.sources {
			vertical-align: top;
		}
	`;
}

export type RowData = WeightData & { sources: Array<Source> };
declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table-verify-sources': WeightsTableVerifySources;
	}
}
