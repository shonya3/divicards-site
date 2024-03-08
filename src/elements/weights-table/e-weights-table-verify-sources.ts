import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import type { Order, RowDataForWeightsTableVerifySources } from './types';
import { keyed } from 'lit/directives/keyed.js';
import { styles as tableStyles } from './table.styles';
import { Sort } from './Sort';

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table-verify-sources': WeightsTableVerifySources;
	}
}

@customElement('e-weights-table-verify-sources')
export class WeightsTableVerifySources extends LitElement {
	@property({ type: Array }) cards: RowDataForWeightsTableVerifySources[] = [];
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'name-order' }) nameOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: 'name' | 'weight' = 'weight';
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private cardsClone: RowDataForWeightsTableVerifySources[] = [];

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
		return html`content`;
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
