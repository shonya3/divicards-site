import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../../gen/Source';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import '../elements/e-source/e-source-type';
import './p-sources';
import { cardsBySourceTypes, sort_by_weight } from '../cards';
import { poeData } from '../PoeData';
import { ArrayAsyncRenderer } from '../utils';
import { computed, SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';

//TODO: add active_drop_source part

@customElement('p-source-type')
export class SourceTypePage extends SignalWatcher(LitElement) {
	@property({ reflect: true }) sourceType!: SourceType;

	#sources_and_cards_renderer = computed(() => {
		const sourcesAndCards = cardsBySourceTypes([this.sourceType], divcord_store.records.get(), poeData);
		if (this.sourceType === 'Act' || this.sourceType === 'Map') {
			sourcesAndCards.sort((a, b) => {
				const aLevel = poeData.areaLevel(a.source.id, this.sourceType as 'Act' | 'Map');
				const bLevel = poeData.areaLevel(b.source.id, this.sourceType as 'Act' | 'Map');
				if (aLevel !== null && bLevel !== null) {
					return this.sourceType === 'Act' ? bLevel - aLevel : aLevel - bLevel;
				} else return 0;
			});
		}

		for (const { cards } of sourcesAndCards) {
			sort_by_weight(cards, poeData);
		}

		return new ArrayAsyncRenderer(sourcesAndCards);
	});

	protected render(): TemplateResult {
		return html`<div class="page">
			<e-source-type .sourceType=${this.sourceType}></e-source-type>
			<ul id="list">
				${this.#sources_and_cards_renderer.get().render(({ source, cards }) => {
					return html`<li>
						<e-source-with-cards
							.showSourceType=${false}
							.source=${source}
							.cards=${cards}
							card_size="small"
						></e-source-with-cards>
					</li>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		:host {
			--source-type-font-size: 1.8rem;
		}

		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page {
			max-width: 1080px;
			margin-inline: auto;
		}

		#list {
			margin-top: 4rem;
		}

		e-source-with-cards {
			&::part(drop_source) {
				--source-font-size: 1.2rem;
				margin-inline: 0;
			}

			margin-inline: auto;
			@media (width >= 460px) {
				margin-inline: 0;
			}
		}

		li {
			list-style: none;
			&:not(:first-child) {
				margin-top: 4rem;
			}
		}

		e-source-type {
			margin-inline: auto;
			display: block;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-source-type': SourceTypePage;
	}
}
