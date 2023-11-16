import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface.ts';
import { PoeData } from '../PoeData.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/wc-source.js';
import '../elements/wc-source-type.ts';
import { SourcefulDivcordTable } from '../data/SourcefulDivcordTableRecord.ts';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-type-page': SourceTypePage;
	}
}

@customElement('wc-source-type-page')
export class SourceTypePage extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;

	get cards() {
		return this.divcordTable.cardsBySourceType(this.sourceType);
	}

	protected mainBlock() {
		if (Array.isArray(this.cards)) {
			return html`<ul>
				${this.cards.map(card => {
					return html`<li>
						<wc-divination-card size="medium" .name=${card}></wc-divination-card>
					</li>`;
				})}
			</ul>`;
		}

		return 'Hi';
	}

	render() {
		return html`<div>
			<wc-source-type .sourceType=${this.sourceType}></wc-source-type>
			${this.mainBlock()}
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		wc-source-type {
			view-transition-name: source-type;
		}
	`;
}
