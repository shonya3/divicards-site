import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/e-divination-card';
import { DivcordTable } from '../DivcordTable';
import '../elements/e-page-controls';
import '../elements/e-card-with-sources';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { SlConverter, paginate } from '../utils';
import '../elements/input/e-input';
import inputStyles from '../elements/input/input.styles';
import { poeData } from '../PoeData';
import { sortByWeight } from '../cards';
import { SearchCardsCriteria, searchCardsByQuery, SEARCH_CRITERIA_VARIANTS } from '../searchCardsByQuery';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import type { SourceSize } from '../elements/e-source/types';
import { NavigateTransitionEvent } from '../events';

declare global {
	interface Window {
		/*
		 * Active card state for page transitions view-transition-name: card
		 */
		activeCard?: string;
		activeSource?: string;
	}
}

@customElement('p-home')
export class HomePage extends LitElement {
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: SourceSize = 'small';
	@property({ reflect: true })
	filter: string = '';
	@property({ type: Array }) searchCriterias: SearchCardsCriteria[] = Array.from(SEARCH_CRITERIA_VARIANTS);

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	/**
	 * Active card state for page transitions view-transition-name: card
	 */
	@state() activeCard: string | null = window.activeCard ?? null;
	/** Dropsource involved in view transitions */
	@state() activeSource?: string = window.activeSource;
	@state() filtered: string[] = [];
	@state() paginated: string[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('filter') || map.has('searchCriterias') || map.has('divcordTable')) {
			const query = this.filter.trim().toLowerCase();
			const cards = searchCardsByQuery(query, this.searchCriterias, this.divcordTable);
			sortByWeight(cards, poeData);
			this.filtered = cards;
		}

		if (map.has('filtered') || map.has('page') || map.has('perPage')) {
			this.paginated = paginate(this.filtered, this.page, this.perPage);
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
		return html`<div class="page">
			<header>
				<form>
					<div style="max-width: 600px">
						<e-input
							autofocus
							label="Search"
							.value=${this.filter}
							.datalistItems=${this.divcordTable.cards()}
							@input="${this.#onCardnameInput}"
							type="text"
						>
						</e-input>
						<sl-select
							label="By"
							.value=${this.searchCriterias.map(c => SlConverter.toSlValue(c))}
							@sl-change=${this.#onCriteriasSelect}
							multiple
							clearable
						>
							${Array.from(SEARCH_CRITERIA_VARIANTS).map(c => {
								return html`<sl-option value=${SlConverter.toSlValue(c)}>${c}</sl-option>`;
							})}
						</sl-select>
					</div>
				</form>
				<e-page-controls
					.n=${this.filtered.length}
					page=${this.page}
					per-page=${this.perPage}
				></e-page-controls>
			</header>
			<ul class="cards">
				${this.paginated.map(card => {
					return html`<li>
						${card === this.activeCard
							? html`<e-card-with-sources
									.name=${card}
									.divcordTable=${this.divcordTable}
									.cardSize=${this.cardSize}
									.sourceSize=${this.sourceSize}
									@navigate=${() => this.#setActiveCard(card)}
									@navigate-transition=${this.#handleNavigateTransition}
									.activeSource=${this.activeSource}
									exportparts="active-source"
									part="card"
							  ></e-card-with-sources>`
							: html`<e-card-with-sources
									.name=${card}
									.divcordTable=${this.divcordTable}
									.cardSize=${this.cardSize}
									.sourceSize=${this.sourceSize}
									@navigate-transition=${this.#handleNavigateTransition}
									.activeSource=${this.activeSource}
									exportparts="active-source"
									@navigate=${() => this.#setActiveCard(card)}
							  ></e-card-with-sources>`}
					</li>`;
				})}
			</ul>
		</div>`;
	}

	#handleNavigateTransition(e: NavigateTransitionEvent) {
		window.activeSource = e.sourceSlug;
		this.activeSource = e.sourceSlug;
	}

	#setActiveCard(card: string) {
		window.activeCard = card;
		this.activeCard = card;
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	#onCriteriasSelect(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<SearchCardsCriteria>(opt));
		this.searchCriterias = options;
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

		header {
			margin-top: 1rem;
			justify-content: center;
			max-width: 600px;
			margin-inline: auto;
			padding: 0.2rem;
			@media (width >=460px) {
				padding: 0rem;
			}
		}

		.cards {
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
