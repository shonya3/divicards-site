import { linkStyles } from './../../linkStyles';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, PropertyValueMap, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Order, WeightData } from './types';
import { keyed } from 'lit/directives/keyed.js';
import { styles as tableStyles } from './table.styles';
import { Sort } from './Sort';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '../divination-card/e-divination-card';
import './e-weight-value';

@customElement('e-weights-table')
export class WeightsTableElement extends LitElement {
	@property({ type: Array }) rows: WeightData[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' = 'weight';
	@property({ type: Number, reflect: true }) limit: null | number = 5;
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' })
	showCards = false;
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private rowsClone: WeightData[] = [];
	/** Visible rows by current limit */
	@state() private rowsLimitedVisible: WeightData[] = [];

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

		if (map.has('rows') || map.has('limit') || map.has('nameOrder') || map.has('weightOrder')) {
			this.rowsLimitedVisible = this.limit ? this.rowsClone.slice(0, this.limit) : this.rowsClone;
		}
	}

	protected render(): TemplateResult {
		return html`
			<table class="table">
				<thead>
					<tr class="show-cards-row">
						<td class="td" class="show-cards-row__td" colspan="3">
							<div>
								<sl-checkbox .checked=${this.showCards} @sl-input=${this.#onShowCardsToggled}
									>Show cards</sl-checkbox
								>
							</div>
						</td>
					</tr>
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
									class=${classMap({
										'ordered-by': this.orderedBy === 'weight',
									})}
									@click=${this.#toggleWeightOrder}
									.name=${this.weightIcon}
								></sl-icon>
							</div>
						</th>
					</tr>
				</thead>

				<tbody>
					${this.rowsLimitedVisible.map((cardRowData, index) => {
						return keyed(
							cardRowData.name,
							html`<tr>
								<td class="td">${index + 1}</td>
								<td class="td">
									${this.showCards
										? html`
												<e-divination-card
													size="small"
													name=${cardRowData.name}
												></e-divination-card>
										  `
										: html`
												<a
													class="link"
													@click=${this.#handleNavSetTransitionName}
													href="/card/${cardRowData.name}"
													>${cardRowData.name}</a
												>
										  `}
								</td>
								<td class="td td-weight">
									<e-weight-value .weightData=${cardRowData}></e-weight-value>
								</td>
							</tr>`
						);
					})}
					${this.limit !== null && this.limit < this.rowsClone.length
						? html`<tr>
								<td class="td" colspan="3">
									<sl-button @click=${this.#onShowMore}>Show more</sl-button>
									<sl-button @click=${this.#onShowAll}>Show All</sl-button>
								</td>
						  </tr>`
						: nothing}
					${this.limit === null || this.limit > 20
						? html`<tr class="sticky">
								<td class="td" colspan="3">
									<sl-button @click=${this.#onShowLess} size="large">Show less</sl-button>
								</td>
						  </tr>`
						: nothing}
				</tbody>
			</table>
		`;
	}

	#toggleWeightOrder() {
		this.weightOrder = this.weightOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'weight';
	}

	#toggleNameOrder() {
		this.nameOrder = this.nameOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'name';
	}

	#onShowMore() {
		if (this.limit !== null) {
			this.limit += 20;
		}
	}

	#onShowAll() {
		this.limit = null;
	}

	#onShowLess() {
		this.limit = 5;
	}

	#onShowCardsToggled(e: Event) {
		const target = e.target;
		if (target && 'checked' in target && typeof target.checked === 'boolean') {
			this.showCards = target.checked;
			this.dispatchEvent(new Event('show-cards-changed'));
		}
	}

	#handleNavSetTransitionName(e: Event) {
		(e.target as HTMLElement).style.setProperty('view-transition-name', 'card');
	}

	static styles = css`
		:host {
			display: block;
		}

		@layer reset {
			* {
				padding: 0;
				margin: 0;
				box-sizing: border-box;
			}
		}

		@layer table-styles {
			${tableStyles}
		}

		@layer link-styles {
			${linkStyles}
		}

		.sticky {
			bottom: 0;
			position: sticky;
			z-index: 20000;
			background-color: rgba(255, 255, 255, 0.3);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table': WeightsTableElement;
	}
}
