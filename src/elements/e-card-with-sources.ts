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
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ type: Object }) divcordTable!: DivcordTable;
	@property() renderMode: RenderMode = 'compact';

	@state() sources: Source[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('name') || map.has('divcordTable')) {
			const sources = this.divcordTable.sourcesByCard(this.name);
			sortSourcesByLevel(sources, poeData);
			this.sources = sources;
		}
	}

	/**  Put maps into distinct container without gaps */
	protected sourcesList(): HTMLUListElement {
		const mapsSources = document.createElement('div');
		mapsSources.classList.add('sources-maps');
		const ul = document.createElement('ul');
		ul.classList.add('sources');
		for (const source of this.sources) {
			const sourceEl = Object.assign(document.createElement('e-source'), {
				renderMode: this.renderMode,
				source,
				size: this.size,
			});

			if (source.type === 'Map') {
				mapsSources.append(sourceEl);
			} else {
				ul.append(sourceEl);
			}
		}

		if (mapsSources.children.length > 0) {
			ul.append(mapsSources);
		}

		return ul;
	}

	render(): TemplateResult {
		const wrapperStyles = styleMap({
			'--card-width': `var(--card-width-${this.size})`,
		});

		return html`
			<div style=${wrapperStyles} class="wrapper">
				<e-divination-card part="card" .name=${this.name} .size=${this.size}></e-divination-card>
				${this.sourcesList()}
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
			column-gap: 0.5rem;
		}

		.sources-maps {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
		}
	`;
}
