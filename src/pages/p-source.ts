import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
			<e-source size="large" .poeData=${this.poeData} .source=${this.source}></e-source>
			<ul>
				${this.cards.map(card => {
					return html`<li>
						<e-divination-card size="medium" .name=${card}></e-divination-card>
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

		e-source {
			view-transition-name: source;
		}

		e-source-type {
			view-transition-name: source-type;
		}
	`;
}
