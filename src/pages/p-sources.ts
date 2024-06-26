import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source-type';
import { poeData } from '../PoeData';
import { divcordTableContext } from '../context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight, sourcetypesMap } from '../cards';
import { consume } from '@lit/context';
import { DivcordTable } from '../DivcordTable';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '../elements/e-source-with-cards';
import { SlConverter } from '../utils';
import { SOURCE_TYPE_VARIANTS, SourceType } from '../gen/Source';
import type { DivcordRecord } from '../gen/divcord';

@customElement('p-sources')
export class SourcesPage extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'large';
	@property({ type: Boolean }) showSourceType = true;
	@property() firstColumnName = 'Source';
	@property({ type: Array }) allSourceTypes: SourceType[] = Array.from(SOURCE_TYPE_VARIANTS);
	@property({ type: Array }) selectedSourceTypes: SourceType[] = [];

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() sourcetypesCountsMap!: Map<SourceType, number>;

	get records(): DivcordRecord[] {
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

	protected firstUpdated(_changedProperties: PropertyValueMap<this>): void {}

	#onSlSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<SourceType>(opt));
		this.selectedSourceTypes = options;
	}

	protected render(): TemplateResult {
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
						html`<li class="source-with-cards-list__item">
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
			color: var(--sl-color-gray-800);
		}

		a:hover {
			color: var(--link-color-hover, skyblue);
			text-decoration: underline;
		}

		.verify-link {
			display: block;
			margin-block: 2rem;
		}

		.source-with-cards-list__item {
			margin-inline: auto;
			@media (width >= 460px) {
				margin-inline: 0rem;
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

declare global {
	interface HTMLElementTagNameMap {
		'p-sources': SourcesPage;
	}
}
