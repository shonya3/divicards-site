import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import { consume } from '@lit/context';
import '../elements/e-source-with-cards';
import { CardBySource, cardsBySource, sort_by_weight } from '../cards';
import { poeData } from '../PoeData';
import type { Source } from '../gen/Source';
import { DivcordTable } from '../context/divcord/DivcordTable';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { NavigateTransitionEvent } from '../events';

/**
 * @csspart drop_source - Dropsource.
 * @csspart active_divination_card - Active card for view-transition(Optional).
 */
@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: Source;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	@state() cards!: CardBySource[];

	connectedCallback(): void {
		super.connectedCallback();
		this.dispatchEvent(new NavigateTransitionEvent('source', this.source.idSlug));
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable') || map.has('source')) {
			const cards = cardsBySource(this.source, this.divcordTable.records, poeData);
			sort_by_weight(cards, poeData);
			this.cards = cards;
		}
	}

	render(): TemplateResult {
		return html`<div class="page">
			<e-source-with-cards
				.active_divination_card=${this.view_transition_names.active_divination_card}
				exportparts="drop_source,active_divination_card"
				.source=${this.source}
				.cards=${this.cards}
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
