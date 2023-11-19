import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface.ts';
import { PoeData } from '../PoeData.ts';
import '../elements/divination-card/e-divination-card.js';
import '../elements/e-source.js';
import '../elements/e-source-type.ts';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord.ts';

declare global {
	interface HTMLElementTagNameMap {
		'p-source-type': SourceTypePage;
	}
}

@customElement('p-source-type')
export class SourceTypePage extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	protected mainBlock() {
		const { cards, kind } = this.divcordTable.cardsBySourceType(this.sourceType);
		if (kind === 'empty-source') {
			return html` <e-source-type .sourceType=${this.sourceType}></e-source-type>
				<ul>
					${cards.map(card => {
						return html`<li>
							<e-divination-card size="medium" .name=${card}></e-divination-card>
						</li>`;
					})}
				</ul>`;
		} else if (kind === 'source-with-member') {
			const cardsBySources = cards.map(([sourceId, cards]) => {
				return [{ type: this.sourceType, kind: 'source-with-member', id: sourceId }, cards];
			});
			return html`<e-sources-table
				.firstColumnName=${this.sourceType}
				size="medium"
				.showSourceType=${false}
				.poeData=${this.poeData}
				.cardsBySources=${cardsBySources}
			>
				<e-source-type .sourceType=${this.sourceType}></e-source-type>
			</e-sources-table>`;
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
