import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source-type';
import { poeData } from '../PoeData';
import { SourceAndCards, cardsBySourceTypes, sort_by_weight, sourcetypesMap } from '../cards';
import { consume } from '@lit/context';
import { DivcordTable } from '../context/divcord/DivcordTable';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '../elements/e-source-with-cards';
import { SlConverter } from '../utils';
import { SOURCE_TYPE_VARIANTS, SourceType } from '../gen/Source';
import { divcordTableContext } from '../context/divcord/divcord-provider';

@customElement('p-sources')
export class SourcesPage extends LitElement {
	@property({ type: Array }) all_source_types: SourceType[] = Array.from(SOURCE_TYPE_VARIANTS);
	@property({ type: Array }) selected_source_types: SourceType[] = [];

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sources_and_cards: SourceAndCards[] = [];
	@state() source_types_count_map: Map<SourceType, number> = new Map();

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('all_source_types') || map.has('divcordTable')) {
			this.source_types_count_map = sourcetypesMap(this.divcordTable.records, poeData);
		}

		if (map.has('selected_source_types') || map.has('divcordTable')) {
			this.sources_and_cards = cardsBySourceTypes(this.selected_source_types, this.divcordTable.records, poeData);
			this.sources_and_cards.forEach(({ cards }) => sort_by_weight(cards, poeData));
		}
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<sl-select @sl-change=${this.#update_selected_source_types} label="Select types" multiple clearable>
				${Array.from(this.source_types_count_map).map(
					([type, count]) =>
						html`<sl-option value=${SlConverter.toSlValue(type)}> ${type} (${count}) </sl-option>`
				)}
			</sl-select>
			<a class="verify-link" href="/verify">Check Need to verify list!</a>
			<details open>
				<summary>List of sourcetypes</summary>
				<ul id="list-of-source-types">
					${Array.from(this.source_types_count_map).map(
						([type, count]) =>
							html`<li>
								<e-source-type .sourceType=${type}></e-source-type>
								<span>(${count})</span>
							</li>`
					)}
				</ul>
			</details>

			<ul id="sources-and-cards" style="padding-top: 4rem">
				${this.sources_and_cards.map(
					({ source, cards }) =>
						html`<li class="source-with-cards-list__item">
							<e-source-with-cards .source=${source} .cards=${cards}></e-source-with-cards>
						</li>`
				)}
			</ul>
		</div>`;
	}

	#update_selected_source_types(e: Event): void {
		const sl_select = e.target as EventTarget & { value: string[] };
		this.selected_source_types = sl_select.value.map(SlConverter.fromSlValue<SourceType>);
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			list-style: none;
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

		#list-of-source-types {
			margin-left: 1rem;
			display: flex;
			flex-direction: column;
			gap: 0.1rem;
			--source-type-font-size: 1rem;

			& li {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				& span {
					font-size: 0.8rem;
				}
			}
		}

		#sources-and-cards {
			& li {
				margin-inline: auto;
				@media (width >= 460px) {
					margin-inline: 0rem;
				}
			}

			& li:not(:first-child) {
				margin-top: 4rem;
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-sources': SourcesPage;
	}
}
