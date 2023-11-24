import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface.ts';
import { PoeData } from '../PoeData.ts';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import { CardsFinder } from '../data/CardsFinder.ts';

declare global {
	interface HTMLElementTagNameMap {
		'p-source': SourcePage;
	}
}

@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) cardsFinder!: CardsFinder;

	@query('.source') mainSourceElement!: HTMLElement;

	#onBossNavigation() {
		this.mainSourceElement.style.setProperty('view-transition-name', 'none');
	}

	cardsList() {
		if (this.source.kind === 'empty-source') {
			throw new Error('Not supported source');
		}

		const cards = this.cardsFinder.cardsFromSource(this.source);
		return html`<ul>
			${cards.map(({ card, boss }) => {
				return html`<e-divination-card size="large" .name=${card} .boss=${boss?.id}>
					${boss
						? html`<e-source
								@click=${this.#onBossNavigation}
								.poeData=${this.poeData}
								.renderMode=${'compact'}
								.source=${boss}
								slot="boss"
						  ></e-source>`
						: nothing}
				</e-divination-card>`;
			})}
		</ul>`;
	}

	render() {
		return html`<div class="page">
			<e-source class="source" size="large" .poeData=${this.poeData} .source=${this.source}></e-source>
			${this.cardsList()}
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		.source {
			view-transition-name: source;
		}

		e-source-type {
			view-transition-name: source-type;
		}

		.page {
			padding: 2rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}
	`;
}
