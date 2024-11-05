import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/e-divination-card';
import { DivcordTable } from '../context/divcord/DivcordTable';
import '../elements/e-pagination';
import '../elements/e-card-with-sources';
import { consume } from '@lit/context';
import { paginate } from '../utils';
import '../elements/input/e-input';
import inputStyles from '../elements/input/input.styles';
import { poeData } from '../PoeData';
import { sortByWeight } from '../cards';
import { SearchCardsCriteria, searchCardsByQuery, SEARCH_CRITERIA_VARIANTS } from '../searchCardsByQuery';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import type { SourceSize } from '../elements/e-source/types';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { repeat } from 'lit/directives/repeat.js';

/**
 * Home page with cards, search and pagination.
 * @csspart active_drop_source Active source for view-transition(optional).
 * @csspart active_divination-card   Active card for view-transition(optional).
 */
@customElement('p-home')
export class HomePage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number }) per_page = 10;
	@property({ reflect: true }) card_size: CardSize = 'medium';
	@property({ reflect: true }) source_size: SourceSize = 'small';
	@property({ reflect: true })
	filter: string = '';
	@property({ type: Array }) searchCriterias: SearchCardsCriteria[] = Array.from(SEARCH_CRITERIA_VARIANTS);

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	@state() filtered: string[] = [];
	@state() paginated: string[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('filter') || map.has('searchCriterias') || map.has('divcordTable')) {
			const query = this.filter.trim().toLowerCase();
			const cards = searchCardsByQuery(query, this.searchCriterias, this.divcordTable);
			sortByWeight(cards, poeData);
			this.filtered = cards;
		}

		if (map.has('filtered') || map.has('page') || map.has('per_page')) {
			this.paginated = paginate(this.filtered, this.page, this.per_page);
		}
	}

	attributeChangedCallback(name: string, old: string | null, value: string | null): void {
		super.attributeChangedCallback(name, old, value);

		if (name === 'filter') {
			if (old === value || old == null) {
				return;
			}
			const url = new URL(window.location.href);
			url.searchParams.set('filter', this.filter);
			window.history.pushState(null, '', url);
		}
	}

	render(): TemplateResult {
		return html`
			<div id="search-pagination-controls">
				<e-input
					autofocus
					label="Search"
					.value=${this.filter}
					.datalistItems=${this.divcordTable.cards()}
					@input="${this.#on_card_name_input}"
					type="text"
				>
				</e-input>
				<sl-select
					label="By"
					.value=${this.searchCriterias}
					@sl-change=${this.#on_criterias_select}
					multiple
					clearable
				>
					${Array.from(SEARCH_CRITERIA_VARIANTS).map(value => {
						return html`<sl-option value=${value}>${value}</sl-option>`;
					})}
				</sl-select>
				<e-pagination .n=${this.filtered.length} page=${this.page} per-page=${this.per_page}></e-pagination>
			</div>

			<ul id="divination-cards-list">
				${repeat(
					this.paginated,
					card_name => card_name,
					card => html`<li>
						<e-card-with-sources
							.name=${card}
							.divcordTable=${this.divcordTable}
							.card_size=${this.card_size}
							.source_size=${this.source_size}
							.active_drop_source=${this.view_transition_names.active_drop_source}
							exportparts=${slug(card) === this.view_transition_names.active_divination_card
								? 'active_drop_source,divination_card:active_divination_card'
								: 'active_drop_source'}
						></e-card-with-sources>
					</li>`
				)}
			</ul>
		`;
	}

	#on_card_name_input(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	#on_criterias_select(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		this.searchCriterias = target.value as Array<SearchCardsCriteria>;
	}

	static styles = css`
		${inputStyles}
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		#search-pagination-controls {
			margin-top: 1rem;
			justify-content: center;
			max-width: 600px;
			margin-inline: auto;
			padding: 0.2rem;
			@media (width >=460px) {
				padding: 0rem;
			}
		}

		#divination-cards-list {
			margin-top: 3rem;
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			gap: 4rem;
			max-width: 1600px;
			margin-inline: auto;
			justify-content: center;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-home': HomePage;
	}
}
