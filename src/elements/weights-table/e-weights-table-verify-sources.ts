import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Order, RowDataForWeightsTableVerifySources } from './types';
import '../e-need-to-verify';
import { keyed } from 'lit/directives/keyed.js';
import { styles as tableStyles } from './table.styles';
import { Sort } from './Sort';
import '../divination-card/e-divination-card';
import '../e-source/e-source';
import '../weights-table/e-weight-value';

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table-verify-sources': WeightsTableVerifySources;
	}
}

@customElement('e-weights-table-verify-sources')
export class WeightsTableVerifySources extends LitElement {
	@property({ type: Array }) rows: RowDataForWeightsTableVerifySources[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' = 'weight';
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private rowsClone: RowDataForWeightsTableVerifySources[] = [];

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
	}

	#toggleWeightOrder() {
		this.weightOrder = this.weightOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'weight';
	}

	#toggleNameOrder() {
		this.nameOrder = this.nameOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'name';
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
									<e-divination-card size="small" name=${cardRowData.name}></e-divination-card>
								</e-need-to-verify>
							</td>
							<td class="td td-weight">
								<e-weight-value .weightData=${cardRowData}></e-weight-value>
							</td>
							<td class="td">
								<ul class="sources-list">
									${cardRowData.sources.map(
										source => html`<li><e-source size="medium" .source=${source}></e-source></li>`
									)}
								</ul>
							</td>
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
			list-style: none;
		}

		:host {
			display: block;
		}

		${tableStyles}

		.sources-list {
			display: flex;
			flex-wrap: wrap;
			gap: 2rem;
		}
	`;
}
