import { styleMap } from 'lit/directives/style-map.js';
import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from './divination-card/e-divination-card';
import { poeData } from '../PoeData';
import type { RenderMode } from './types';
import './divination-card/e-divination-card';
import './e-source/e-source';
import { DivcordTable } from '../DivcordTable';
import type { Source } from '../gen/Source';
import { sortSourcesByLevel } from '../utils';
import type { SourceSize } from './e-source/types';
import './e-sources';

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-sources': CardWithSourcesElement;
	}
}

/**
 * @csspart card - Divination card element
 */
@customElement('e-card-with-sources')
export class CardWithSourcesElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true, attribute: 'card-size' }) cardSize: CardSize = 'medium';
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: SourceSize = 'medium';
	@property({ type: Object }) divcordTable!: DivcordTable;
	@property() renderMode: RenderMode = 'compact';

	@state() sources: Source[] = [];
	@state() verifySources: Source[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('name') || map.has('divcordTable')) {
			const sources = this.divcordTable.sourcesByCard(this.name);
			sortSourcesByLevel(sources, poeData);
			this.sources = sources;

			const verifySources = this.divcordTable.verifySourcesByCard(this.name);
			sortSourcesByLevel(verifySources, poeData);
			this.verifySources = verifySources;
		}
	}

	render(): TemplateResult {
		const wrapperStyles = styleMap({
			'--card-width': `var(--card-width-${this.cardSize})`,
		});

		return html`
			<div style=${wrapperStyles} class="wrapper">
				<e-divination-card part="card" .name=${this.name} .size=${this.cardSize}></e-divination-card>
				<e-sources
					.sources=${this.sources}
					.size=${this.sourceSize}
					verification-status="done"
					.renderMode=${this.renderMode}
				></e-sources>
				<e-sources
					.sources=${this.verifySources}
					.size=${this.sourceSize}
					verification-status="verify"
					.renderMode=${this.renderMode}
				></e-sources>
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

		.wrapper {
			display: flex;
			flex-direction: column;
		}
	`;
}
