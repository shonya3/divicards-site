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

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const sourcesAndCards = cardsBySourceTypes(['Map'], this.divcordTable.records, poeData);
			sourcesAndCards.sort((a, b) => {
				const aLevel = poeData.areaLevel(a.source.id, 'Map');
				const bLevel = poeData.areaLevel(b.source.id, 'Map');
				if (aLevel !== null && bLevel !== null) {
					return aLevel - bLevel;
				} else return 0;
			});

			for (const { cards } of sourcesAndCards) {
				sortByWeight(cards, poeData);
			}

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
		console.log('AttributeChangedCallback', { name, old, value });
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
			padding: 0.4rem;
			display: flex;
			flex-wrap: wrap;
			gap: 4rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-maps': MapsPage;
	}
}
