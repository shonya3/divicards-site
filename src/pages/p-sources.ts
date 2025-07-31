import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source/e-source-type';
import { poeData } from '../PoeData';
import { SourceAndCards, cardsBySourceTypes, sort_by_weight, sourcetypesMap } from '../cards';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '../elements/source-with-cards/e-source-with-cards';
import { SlConverter } from '../utils';
import { SourceType } from '../../gen/Source';
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';

@customElement('p-sources')
export class SourcesPage extends SignalWatcher(LitElement) {
	#selected_source_types = signal<Array<SourceType>>([]);

	#sources_and_cards = computed<Array<SourceAndCards>>(() => {
		const sources_and_cards = cardsBySourceTypes(
			this.#selected_source_types.get(),
			divcord_store.records.get(),
			poeData
		);
		sources_and_cards.forEach(({ cards }) => sort_by_weight(cards, poeData));
		return sources_and_cards;
	});

	#source_types_count_map = computed<Map<SourceType, number>>(() => {
		return sourcetypesMap(divcord_store.records.get(), poeData);
	});

	protected render(): TemplateResult {
		return html`<div class="page">
			<sl-select @sl-change=${this.#update_selected_source_types} label="Select types" multiple clearable>
				${Array.from(this.#source_types_count_map.get()).map(
					([type, count]) =>
						html`<sl-option value=${SlConverter.toSlValue(type)}> ${type} (${count}) </sl-option>`
				)}
			</sl-select>
			<a class="verify-link" href="/verify">Check Need to verify list!</a>
			<details open>
				<summary>List of sourcetypes</summary>
				<ul id="list-of-source-types">
					${Array.from(this.#source_types_count_map.get()).map(
						([type, count]) =>
							html`<li>
								<e-source-type .sourceType=${type}></e-source-type>
								<span>(${count})</span>
							</li>`
					)}
				</ul>
			</details>

			<ul id="sources-and-cards">
				${this.#sources_and_cards.get().map(
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
		this.#selected_source_types.set(sl_select.value.map(SlConverter.fromSlValue<SourceType>));
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page {
			max-width: 1080px;
			margin-inline: auto;
		}

		a:link,
		a:visited {
			color: var(--sl-color-gray-800);
		}

		ul {
			list-style: none;
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
			padding-top: 4rem;
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
