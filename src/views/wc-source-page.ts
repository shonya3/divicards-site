import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface.ts';
import { PoeData } from '../PoeData.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/wc-source.js';
import { CardsFinder } from '../data/CardsFinder.ts';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-page': SourcePage;
	}
}

@customElement('wc-source-page')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Object }) poeData!: PoeData;
	@property({ type: Object }) cardsFinder!: CardsFinder;

	get cards() {
		if (this.source.kind === 'empty-source') {
			throw new Error('Not supported source');
		}
		switch (this.source.type) {
			case 'Map': {
				return this.cardsFinder.cardsByMap(this.source.id);
			}
			case 'Act': {
				return this.cardsFinder.cardsByActArea(this.source.id).map(a => a.card);
			}
			default: {
				return this.cardsFinder.cardsByIdSource(this.source);
			}
		}
	}

	render() {
		return html`<div>
			<wc-source size="large" .poeData=${this.poeData} .source=${this.source}></wc-source>
			<ul>
				${this.cards.map(card => {
					return html`<li>
						<wc-divination-card size="medium" .name=${card}></wc-divination-card>
					</li>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		ul {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
		}

		wc-source {
			view-transition-name: source;
		}
	`;
}
