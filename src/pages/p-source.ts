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

declare global {
	interface HTMLElementTagNameMap {
		'p-source': SourcePage;
	}
}

@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: Source;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() cards!: CardBySource[];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable') || map.has('source')) {
			const cards = cardsBySource(this.source, this.divcordTable.records, poeData);
			sortByWeight(cards, poeData);
			this.cards = cards;
		}
	}

	render(): TemplateResult {
		return html`<div class="page">
			<e-source-with-cards .source=${this.source} .cards=${this.cards}></e-source-with-cards>
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		e-source-with-cards::part(source) {
			view-transition-name: source;
		}

		.page {
			padding: 2rem;
			padding-bottom: 0;
		}

		@media (width <=600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
				padding-bottom: 0;
			}

			e-source-with-cards {
				margin-inline: auto;
			}
		}
	`;
}
