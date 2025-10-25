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
import { ifDefined } from 'lit/directives/if-defined.js';
import { slug } from '../../../gen/divcordWasm/divcord_wasm';
import 'poe-custom-elements/item-card.js';
import './e-weight-breakdown.js';
import { Appearance, CardSize } from '../divination-card/e-divination-card';
import { divcord_store } from '../../stores/divcord.js';
import { Sources } from '../../DivcordTable.js';

/**
 * @csspart active_divination_card - Active for view transition card(Optional).
 *
 * @event   navigate-transition Emits on card or source navigation
 * @event   e-weights-table__change-limit Emits when limit of visible cards changes
 *
 * @cssproperty --td-border-bottom
 */
@customElement('e-weights-table')
export class WeightsTableElement extends LitElement {
	@property({ type: Array }) rows: WeightData[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'delta-order' }) deltaOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' | 'delta' = 'weight';
	@property({ type: Number, reflect: true }) limit: null | number = 5;
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' })
	showCards = false;
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private rowsClone: WeightData[] = [];
	/** Visible rows by current limit */
	@state() private rowsLimitedVisible: WeightData[] = [];
	/**
	 * Active card state for page transition
	 */
	@property({ reflect: true }) active_divination_card?: string;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('rows')) {
			this.rowsClone = structuredClone(this.rows);
		}

		const shouldSort =
			map.has('rows') ||
			map.has('orderedBy') ||
			(this.orderedBy === 'weight' && map.has('weightOrder')) ||
			(this.orderedBy === 'name' && map.has('nameOrder')) ||
			(this.orderedBy === 'delta' && map.has('deltaOrder'));

		if (shouldSort) {
			this.#sortRows();
		}

		if (shouldSort || map.has('limit')) {
			this.rowsLimitedVisible = this.limit ? this.rowsClone.slice(0, this.limit) : this.rowsClone;
		}
	}

	#sortRows() {
		switch (this.orderedBy) {
			case 'name':
				this.nameIcon = this.nameOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byName(this.rowsClone, this.nameOrder);
				break;
			case 'weight':
				this.weightIcon = this.weightOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byWeight(this.rowsClone, this.weightOrder);
				break;
			case 'delta':
				this.weightIcon = this.deltaOrder === 'desc' ? 'sort-numeric-down' : 'sort-numeric-up';
				Sort.byDelta(this.rowsClone, this.deltaOrder);
				break;
		}
	}

	protected render(): TemplateResult {
		const cardAppearance: Appearance = this.showCards ? 'card' : 'link';
		const cardSize: CardSize = this.showCards ? 'small' : 'medium';
		const getCardSources = (card: string): Sources | undefined =>
			this.showCards ? undefined : divcord_store.get_card_sources(card);

		return html`
			<table class="table">
				<thead>
					<tr class="show-cards-row">
						<td class="td" colspan="3">
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
								${this.orderedBy === 'delta' ? 'Change' : 'Weight'}
								<sl-icon
									class=${classMap({
										'ordered-by': this.orderedBy === 'weight' || this.orderedBy === 'delta',
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
						const card_slug = slug(cardRowData.name);
						return keyed(
							cardRowData.name,
							html`<tr data-card=${cardRowData.name}>
								<td class="td">${index + 1}</td>
								<td class="td td-card">
									<!-- This invisible span is a layout helper that gives the cell its width -->
									${cardAppearance === 'link'
										? html`<span class="card-name-sizer">${cardRowData.name}</span>`
										: nothing}
									<e-divination-card
										.sources=${getCardSources(cardRowData.name)}
										.appearance=${cardAppearance}
										size=${cardSize}
										name=${cardRowData.name}
										part=${ifDefined(
											card_slug === this.active_divination_card
												? 'active_divination_card'
												: undefined
										)}
									></e-divination-card>
								</td>
								<td class="td td-weight">
									<e-weight-breakdown .weightData=${cardRowData}></e-weight-breakdown>
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
									<sl-button @click=${this.#onShowLess} size="small">Show less</sl-button>
								</td>
						  </tr>`
						: nothing}
				</tbody>
			</table>
		`;
	}

	#toggleWeightOrder() {
		const isWeightSort = this.orderedBy === 'weight';
		const isDeltaSort = this.orderedBy === 'delta';

		if (isWeightSort && this.weightOrder === 'desc') {
			// State 1: Weight Desc -> State 2: Weight Asc
			this.weightOrder = 'asc';
		} else if (isWeightSort && this.weightOrder === 'asc') {
			// State 2: Weight Asc -> State 3: Delta Desc
			this.orderedBy = 'delta';
			this.deltaOrder = 'desc';
		} else if (isDeltaSort && this.deltaOrder === 'desc') {
			// State 3: Delta Desc -> State 4: Delta Asc
			this.deltaOrder = 'asc';
		} else if (isDeltaSort && this.deltaOrder === 'asc') {
			// State 4: Delta Asc -> State 1: Weight Desc
			this.orderedBy = 'weight';
			this.weightOrder = 'desc';
		} else {
			// Fallback: Not sorting by weight or delta, so switch to the default weight sort.
			this.orderedBy = 'weight';
			this.weightOrder = 'desc';
		}
	}

	#toggleNameOrder() {
		this.nameOrder = this.nameOrder === 'asc' ? 'desc' : 'asc';
		this.orderedBy = 'name';
	}

	async #dispatchShowLimitChange() {
		await this.updateComplete;
		this.dispatchEvent(
			new ShowLimitChangeEvent(this.limit, Array.from(this.shadowRoot!.querySelectorAll('tbody tr')))
		);
	}

	async #onShowMore() {
		if (this.limit !== null) {
			this.limit += 20;

			await this.#dispatchShowLimitChange();
		}
	}

	async #onShowAll() {
		this.limit = null;

		await this.#dispatchShowLimitChange();
	}

	async #onShowLess() {
		this.limit = 5;

		await this.#dispatchShowLimitChange();
	}

	#onShowCardsToggled(e: Event) {
		const target = e.target;
		if (target && 'checked' in target && typeof target.checked === 'boolean') {
			this.showCards = target.checked;
			this.dispatchEvent(new Event('show-cards-changed'));
		}
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
			background-color: color-mix(in srgb, var(--sl-color-neutral-50) 70%, transparent);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table': WeightsTableElement;
	}
}

export class ShowLimitChangeEvent extends Event {
	static readonly tag = 'e-weights-table__change-limit';

	constructor(public $limit: number | null, public $tableRows: Array<HTMLTableRowElement>) {
		super(ShowLimitChangeEvent.tag, { bubbles: false, composed: false });
	}
}

declare global {
	interface HTMLElementEventMap {
		'e-weights-table__change-limit': ShowLimitChangeEvent;
	}
}
