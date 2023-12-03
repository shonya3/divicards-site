import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface.ts';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import '../elements/e-source-type.ts';
import './p-sources.ts';
import { CardsFinder, cardsBySourceTypes, sortByWeight } from '../data/CardsFinder.ts';
import { cardsFinderContext } from '../context.ts';
import { consume } from '@lit/context';
import { poeData } from '../PoeData.ts';

declare global {
	interface HTMLElementTagNameMap {
		'p-source-type': SourceTypePage;
	}
}

@customElement('p-source-type')
export class SourceTypePage extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;

	@consume({ context: cardsFinderContext, subscribe: true })
	cardsFinder!: CardsFinder;

	protected mainBlock() {
		const sourceAndCardsArr = cardsBySourceTypes([this.sourceType], this.cardsFinder.divcordTable.records, poeData);
		const kind = sourceAndCardsArr[0].source.kind;
		if (kind === 'empty-source') {
			const cards = sourceAndCardsArr[0].cards;
			sortByWeight(cards, poeData);
			return html` <e-source-type .sourceType=${this.sourceType}></e-source-type>
				<ul>
					${cards.map(card => {
						return html`<li>
							<e-divination-card
								size="medium"
								.boss=${card.boss?.id}
								.name=${card.card}
							></e-divination-card>
						</li>`;
					})}
				</ul>`;
		} else if (kind === 'source-with-member') {
			return html`<p-sources-table
				.firstColumnName=${this.sourceType}
				size="medium"
				.showSourceType=${false}
				.sourceTypes=${[this.sourceType]}
			>
				<e-source-type .sourceType=${this.sourceType}></e-source-type>
			</p-sources-table>`;
		} else throw new Error('Unsupported source kind');
	}

	render() {
		return html`<div>${this.mainBlock()}</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		e-source-type {
			view-transition-name: source-type;
		}
	`;
}
