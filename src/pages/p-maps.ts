import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-pagination';
import '../elements/e-cards-by-source';
import { poeData } from '../PoeData';
import { cardsBySourceTypes, sort_by_weight, SourceAndCards } from '../cards';
import { consume } from '@lit/context';
import { paginate } from '../utils';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';

const DEFAULTS = {
	page: 1,
	per_page: 10,
} as const;

/**
 * @csspart active_drop_source - Active for view transition source(Optional).
 * @csspart active_divination_card - Active for view transition card(Optional).
 */
@customElement('p-maps')
export class MapsPage extends SignalWatcher(LitElement) {
	@property({ reflect: true, type: Number }) page: number = DEFAULTS.page;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) per_page: number = DEFAULTS.per_page;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';

	#page = signal<number>(DEFAULTS.page);
	#per_page = signal<number>(DEFAULTS.per_page);
	#filter = signal('');

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	#sources_and_cards = computed<Array<SourceAndCards>>(() => {
		const sources_and_cards = cardsBySourceTypes(['Map'], divcord_store.records.get(), poeData)
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

		sources_and_cards.forEach(({ cards }) => {
			sort_by_weight(cards, poeData);
		});

		return sources_and_cards;
	});

	#filtered = computed<Array<SourceAndCards>>(() => {
		const query = this.filter.trim().toLocaleLowerCase();
		return this.#sources_and_cards.get().filter(({ source }) => source.id.toLowerCase().includes(query));
	});

	#paginated = computed<Array<SourceAndCards>>(() => {
		return paginate(this.#filtered.get(), this.#page.get(), this.#per_page.get());
	});

	protected willUpdate(map: PropertyValueMap<this>): void {
		map.has('page') && this.#page.set(this.page);
		map.has('per_page') && this.#per_page.set(this.per_page);
		map.has('filter') && this.#filter.set(this.filter);
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

	protected render(): TemplateResult {
		return html`
			<div class="page">
				<header>
					<form>
						<sl-input label="Enter map name" @input="${this.#h_search_change}" type="text"></sl-input>
					</form>
					<e-pagination
						.n=${this.#filtered.get().length}
						page=${this.#page.get()}
						per_page=${this.#per_page.get()}
					></e-pagination>
				</header>
				<ul>
					${this.#paginated.get().map(({ source, cards }) => {
						return html`<li>
							<e-source-with-cards
								.showSourceType=${false}
								.source=${source}
								.cards=${cards}
								.card_size=${`small`}
								.active_divination_card=${this.view_transition_names.active_divination_card}
								exportparts=${this.view_transition_names.active_drop_source === source.idSlug
									? `drop_source:active_drop_source,active_divination_card`
									: `active_divination_card`}
							></e-source-with-cards>
						</li>`;
					})}
				</ul>
			</div>
		`;
	}

	#h_search_change(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.filter = input.value;
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
