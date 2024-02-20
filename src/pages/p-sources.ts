import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source-type';
import { poeData } from '../PoeData';
import { divcordTableContext } from '../context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight, sourcetypesMap } from '../cards';
import { consume } from '@lit/context';
import { DivcordTable } from '../divcord';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '../elements/e-source-with-cards';
import { SlConverter } from '../utils';
import { SourceType, sourceTypes } from '../gen/ISource.interface';

declare global {
	interface HTMLElementTagNameMap {
		'p-sources': SourcesPage;
	}
}

@customElement('p-sources')
export class SourcesPage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'large';
	@property({ type: Boolean }) showSourceType = true;
	@property() firstColumnName = 'Source';
	@property({ type: Array }) allSourceTypes: SourceType[] = Array.from(sourceTypes);
	@property({ type: Array }) selectedSourceTypes: SourceType[] = [];

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() sourcetypesCountsMap!: Map<SourceType, number>;

	get records() {
		return this.divcordTable.records;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('allSourceTypes') || map.has('divcordTable')) {
			this.sourcetypesCountsMap = sourcetypesMap(this.records, poeData);
		}

		if (map.has('divcordTable') || map.has('selectedSourceTypes')) {
			const sourcesAndCards = cardsBySourceTypes(this.selectedSourceTypes, this.records, poeData);
			for (const { cards } of sourcesAndCards) {
				sortByWeight(cards, poeData);
			}
			this.sourcesAndCards = sourcesAndCards;
		}
	}

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {}

	#onSlSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<SourceType>(opt));
		this.selectedSourceTypes = options;
	}

	protected render() {
		return html`<div class="page">
			<sl-select @sl-change=${this.#onSlSelectChange} label="Select types" multiple clearable>
				${Array.from(this.sourcetypesCountsMap).map(([type, count]) => {
					//
					return html` <sl-option value=${SlConverter.toSlValue(type)}> ${type} (${count}) </sl-option> `;
				})}
			</sl-select>
			<a class="verify-link" href="/verify">Check Need to verify list!</a>
			<details open>
				<summary>List of sourcetypes</summary>
				<ul class="sourcetypes-list">
					${Array.from(this.sourcetypesCountsMap).map(([type, count]) => {
						//
						return html`<li>
							<e-source-type .sourceType=${type}></e-source-type>
							<span>(${count})</span>
						</li>`;
					})}
				</ul>
			</details>

			<ul class="source-with-cards-list" style="padding-top: 4rem">
				${this.sourcesAndCards.map(
					({ source, cards }) =>
						html`<li class="source-with-cards-list_item">
							<e-source-with-cards .source=${source} .cards=${cards}></e-source-with-cards>
						</li>`
				)}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		a:link,
		a:visited {
			color: rgba(255, 255, 255, 0.85);
		}

		a:hover {
			color: var(--link-color-hover, skyblue);
			text-decoration: underline;
		}

		.page {
			padding: 2rem;
		}

		.verify-link {
			display: block;
			margin-block: 2rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}

		.source-with-cards-list li:not(:first-child) {
			margin-top: 4rem;
		}

		li {
			list-style: none;
		}

		.sourcetypes-list {
			margin-left: 1rem;
			display: flex;
			flex-direction: column;
			gap: 0.1rem;
			--source-type-font-size: 1rem;
		}

		.sourcetypes-list li {
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}

		.sourcetypes-list span {
			font-size: 0.8rem;
		}
	`;
}
