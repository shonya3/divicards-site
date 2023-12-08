import { styleMap } from 'lit/directives/style-map.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../divcord';
import type { RenderMode } from '../elements/types';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-sources': CardWithSourcesElement;
	}
}

@customElement('e-card-with-sources')
export class CardWithSourcesElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ type: Number }) minLevel?: number;
	@property({ type: Object }) divcordTable!: SourcefulDivcordTable;
	@property() renderMode: RenderMode = 'compact';

	render() {
		const wrapperStyles = styleMap({
			'--card-width': `var(--card-width-${this.size})`,
		});

		return html`
			<div style=${wrapperStyles} class="wrapper">
				<e-divination-card
					.name=${this.name}
					.size=${this.size}
					minLevel=${this.minLevel ?? poeData.minLevel(this.name)}
				></e-divination-card>
				<ul class="sources">
					${this.divcordTable.sourcesByCard(this.name).map(source => {
						return html`<e-source
							renderMode=${this.renderMode}
							.source=${source}
							.size=${this.size}
						></e-source>`;
					})}
				</ul>
			</div>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.wrapper {
			width: var(--card-width);
		}

		.sources {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin-top: 0.25rem;
		}
	`;
}
