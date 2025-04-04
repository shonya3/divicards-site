import { LitElement, PropertyValues, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/e-pagination';
import '../elements/e-card-with-sources';
import { consume } from '@lit/context';
import { paginate } from '../utils';
import { poeData } from '../PoeData';
import { sort_by_weight } from '../cards';
import { SearchCardsCriteria, search_cards_by_query, SEARCH_CRITERIA_VARIANTS } from '../search_cards_by_query';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import type { SourceSize } from '../elements/e-source/types';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { repeat } from 'lit/directives/repeat.js';
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { divcord_store } from '../stores/divcord';

const DEFAULTS = {
	page: 1,
	per_page: 10,
	card_size: 'medium',
	source_size: 'small',
} as const;

/**
 * Home page with cards, search and pagination.
 * @csspart active_drop_source Active source for view-transition(optional).
 * @csspart active_divination-card   Active card for view-transition(optional).
 */
@customElement('p-home')
export class HomePage extends SignalWatcher(LitElement) {
	@property({ type: Number, reflect: true }) page: number = DEFAULTS.page;
	@property({ type: Number, reflect: true }) per_page: number = DEFAULTS.per_page;
	@property({ reflect: true }) filter = '';
	@property({ reflect: true }) card_size: CardSize = DEFAULTS.card_size;
	@property({ reflect: true }) source_size: SourceSize = DEFAULTS.source_size;
	@property({ attribute: false }) search_criterias = Array.from(SEARCH_CRITERIA_VARIANTS);

	#page = signal<number>(DEFAULTS.page);
	#per_page = signal<number>(DEFAULTS.per_page);
	#filter = signal('');
	#card_size = signal<CardSize>(DEFAULTS.card_size);
	#source_size = signal<SourceSize>(DEFAULTS.source_size);
	#search_criterias = signal<Array<SearchCardsCriteria>>([]);

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	filtered = computed(() => {
		const query = this.#filter.get().trim().toLowerCase();
		const cards = search_cards_by_query(query, this.#search_criterias.get(), divcord_store.table.get());
		sort_by_weight(cards, poeData);
		return cards;
	});

	/** Paginated and filtered by search query and by weight cards. */
	paginated = computed(() => {
		return paginate(this.filtered.get(), this.#page.get(), this.#per_page.get());
	});

	protected willUpdate(map: PropertyValues<this>): void {
		map.has('page') && this.#page.set(this.page);
		map.has('per_page') && this.#per_page.set(this.per_page);
		map.has('filter') && this.#filter.set(this.filter);
		map.has('card_size') && this.#card_size.set(this.card_size);
		map.has('source_size') && this.#source_size.set(this.source_size);
		map.has('search_criterias') && this.#search_criterias.set(this.search_criterias);
	}

	protected firstUpdated(): void {
		effect(() => {
			const url = new URL(window.location.href);
			if (!url.searchParams.get('filter') && !this.#filter.get()) {
				return;
			}

			url.searchParams.set('filter', this.#filter.get());
			window.history.pushState(null, '', url);
		});
	}

	protected render(): TemplateResult {
		return html`
			<div id="search-pagination-controls">
				<sl-input
					autofocus
					label="Search"
					.value=${this.#filter.get()}
					@input="${this.#h_search_change}"
					type="text"
				>
				</sl-input>
				<sl-select
					id="select-by"
					label="By"
					.value=${this.#search_criterias.get()}
					@sl-change=${this.#h_criterias_select}
					multiple
					clearable
				>
					${Array.from(SEARCH_CRITERIA_VARIANTS).map(value => {
						return html`<sl-option value=${value}>${value}</sl-option>`;
					})}
				</sl-select>
				<e-pagination
					.n=${this.filtered.get().length}
					page=${this.#page.get()}
					per_page=${this.#per_page.get()}
				></e-pagination>
			</div>

			<ul id="divination-cards-list">
				${repeat(
					this.paginated.get(),
					card => card,
					card => html`<li>
						<e-card-with-sources
							.name=${card}
							.divcordTable=${divcord_store.table.get()}
							.card_size=${this.#card_size.get()}
							.source_size=${this.#source_size.get()}
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

	#h_search_change(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.#page.set(1);
		this.#filter.set(input.value);
	}

	#h_criterias_select(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		this.#search_criterias.set(target.value as Array<SearchCardsCriteria>);
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		#select-by {
			display: none;
			@media (width >= 600px) {
				display: block;
			}
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
