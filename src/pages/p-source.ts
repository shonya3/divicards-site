import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source/e-source';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import '../elements/e-source-with-cards';
import { CardBySource, cardsBySource, sortByWeight } from '../cards';
import { poeData } from '../PoeData';
import type { Source } from '../gen/Source';
import { DivcordTable } from '../DivcordTable';
import { NavigateTransitionEvent } from '../events';

/**
 * @csspart source - Dropsource.
 * @csspart active-card - Active card for view-transition(Optional).
 */
@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: Source;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() activeCard?: string = window.activeCard;
	@state() cards!: CardBySource[];

	protected firstUpdated(): void {
		window.activeSource = this.source.idSlug;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable') || map.has('source')) {
			const cards = cardsBySource(this.source, this.divcordTable.records, poeData);
			sortByWeight(cards, poeData);
			this.cards = cards;
		}
	}

	render(): TemplateResult {
		return html`<div class="page">
			<e-source-with-cards
				@navigate-transition=${this.#handleNavigateTransition}
				.activeCard=${this.activeCard}
				exportparts="source,active-card"
				.source=${this.source}
				.cards=${this.cards}
			></e-source-with-cards>
		</div>`;
	}

	#handleNavigateTransition(e: NavigateTransitionEvent) {
		if (e.transitionName === 'card') {
			window.activeCard = e.slug;
			this.activeCard = e.slug;
		}
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
