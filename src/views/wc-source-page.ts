import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ISource } from '../data/ISource.interface.ts';
import { PoeData } from '../PoeData.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../views/wc-source.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-page': SourcePage;
	}
}

@customElement('wc-source-page')
export class SourcePage extends LitElement {
	@property({ type: Object }) source!: ISource;
	@property({ type: Array }) cards!: string[];
	@property({ type: Object }) poeData!: PoeData;

	render() {
		return html`<div>
			<wc-source .poeData=${this.poeData} .source=${this.source}></wc-source>
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
