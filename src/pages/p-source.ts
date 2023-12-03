import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import { consume } from '@lit/context';
import { cardsFinderContext } from '../context';
import '../elements/e-source-and-cards';
import { CardsFinder } from '../data/CardsFinder';

declare global {
	interface HTMLElementTagNameMap {
		'p-source': SourcePage;
	}
}

@customElement('p-source')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: ISource;

	@consume({ context: cardsFinderContext, subscribe: true })
	cardsFinder!: CardsFinder;

	render() {
		const cards = this.cardsFinder.cardsFromSource(this.source);

		return html`<div class="page">
			<e-source-and-cards .source=${this.source} .cards=${cards}></e-source-and-cards>
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		e-source-and-cards::part(source) {
			view-transition-name: source;
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
