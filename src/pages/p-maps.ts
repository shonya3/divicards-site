import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-page-controls';
import '../elements/e-cards-by-source';
import { poeData } from '../PoeData';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { paginate } from '../utils';
import { DivcordTable } from '../DivcordTable';
import { NavigateTransitionEvent } from '../events';

/**
 * @csspart active-source - Active for view transition source(Optional).
 * @csspart active-card - Active for view transition card(Optional).
 */
@customElement('p-maps')
export class MapsPage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() filtered: SourceAndCards[] = [];
	@state() paginated: SourceAndCards[] = [];
	@state() activeCard = window.activeCard;
	@state() activeSource = window.activeSource;

	#handleNavigateTransition(e: NavigateTransitionEvent) {
		if (e.transitionName === 'card') {
			window.activeCard = e.slug;
			this.activeCard = e.slug;
		}
		if (e.transitionName === 'source') {
			window.activeSource = e.slug;
			this.activeSource = e.slug;
		}
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes(['Map'], this.divcordTable.records, poeData)
				// Only show maps that are present in current atlas
				.filter(({ cards }) => cards.length > 0)
				.sort((a, b) => {
					let aLevel = poeData.areaLevel(a.source.id, 'Map') ?? 0;
					let bLevel = poeData.areaLevel(b.source.id, 'Map') ?? 0;

					// put unique maps to the end
					const aMap = poeData.find.map(a.source.id);
					if (aMap?.unique) {
						aLevel += 1000;
					}
					const bMap = poeData.find.map(b.source.id);
					if (bMap?.unique) {
						bLevel += 1000;
					}

					return aLevel - bLevel;
				});

			sourcesAndCards.forEach(({ cards }) => {
				sortByWeight(cards, poeData);
			});

			this.sourcesAndCards = sourcesAndCards;
		}

		if (map.has('filter') || map.has('sourcesAndCards')) {
			const query = this.filter.trim().toLowerCase();
			this.filtered = this.sourcesAndCards.filter(({ source }) => source.id.toLowerCase().includes(query));
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

	#onMapnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.filter = input.value;
	}

	maps(): string[] {
		const mapnames = poeData.maps.map(({ name }) => name);
		mapnames.sort((a, b) => a.localeCompare(b));
		return mapnames;
	}
	protected render(): TemplateResult {
		return html`
			<div class="page">
				<header>
					<form>
						<e-input
							label="Enter map name"
							@input="${this.#onMapnameInput}"
							type="text"
							.datalistItems=${this.maps()}
						></e-input>
					</form>
					<e-page-controls
						.n=${this.filtered.length}
						page=${this.page}
						per-page=${this.perPage}
					></e-page-controls>
				</header>
				<ul>
					${this.paginated.map(({ source, cards }) => {
						return html`<li>
							<e-source-with-cards
								.showSourceType=${false}
								.source=${source}
								.cards=${cards}
								.cardSize=${`small`}
								@navigate-transition=${this.#handleNavigateTransition}
								.activeCard=${this.activeCard}
								exportparts=${this.activeSource === source.idSlug
									? `source:active-source,active-card`
									: `active-card`}
							></e-source-with-cards>
						</li>`;
					})}
				</ul>
			</div>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		header {
			margin-top: 1rem;
			justify-content: center;
			max-width: 600px;
			margin-inline: auto;
			padding: 0.2rem;
			@media (width >= 460px) {
				padding: 0rem;
			}
		}

		fieldset {
			padding: 0.8rem;
		}

		header {
			border-bottom: none;
		}

		li {
			list-style: none;
		}

		ul {
			margin-top: 2rem;
			padding: 0.4rem;
			display: flex;
			flex-wrap: wrap;
			gap: 4rem;
			justify-content: center;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-maps': MapsPage;
	}
}
