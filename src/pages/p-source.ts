import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import { consume } from '@lit/context';
import '../elements/e-source-with-cards';
import { CardBySource, cardsBySource, sort_by_weight } from '../cards';
import { poeData } from '../PoeData';
import type { Source } from '../gen/Source';
import {
	UpdateViewTransitionNameEvent,
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { computed, SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';

/**
 * @csspart drop_source - Dropsource.
 * @csspart active_divination_card - Active card for view-transition(Optional).
 */
@customElement('p-source')
export class SourcePage extends SignalWatcher(LitElement) {
	@property({ type: Object }) source!: Source;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	#cards = computed<Array<CardBySource>>(() => {
		const cards = cardsBySource(this.source, divcord_store.records.get(), poeData);
		sort_by_weight(cards, poeData);
		return cards;
	});

	connectedCallback(): void {
		super.connectedCallback();
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'source', value: this.source.idSlug }));
	}

	render(): TemplateResult {
		return html`<div class="page">
			<e-source-with-cards
				.active_divination_card=${this.view_transition_names.active_divination_card}
				exportparts="drop_source,active_divination_card"
				.source=${this.source}
				.cards=${this.#cards.get()}
			></e-source-with-cards>
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		e-source-with-cards {
			margin-inline: auto;
			@media (width >= 460px) {
				margin-inline: 0;
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-source': SourcePage;
	}
}
