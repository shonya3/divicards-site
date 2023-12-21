import { styleMap } from 'lit/directives/style-map.js';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { PoeData, poeData } from '../PoeData';
import { SourcefulDivcordTable } from '../divcord';
import type { RenderMode } from '../elements/types';
import '../elements/divination-card/e-divination-card';
import '../elements/e-source';
import { ISource } from '../ISource.interface';

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

	@state() sources: ISource[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('name') || map.has('divcordTable')) {
			const sources = this.divcordTable.sourcesByCard(this.name);
			sortSourcesByLevel(sources, poeData);
			this.sources = sources;
		}
	}

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
					${this.sources.map(source => {
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

function sourceLevel(source: ISource, poeData: Readonly<PoeData>): number | null {
	switch (source.type) {
		case 'Act': {
			return poeData.level(source.id, source.type);
		}
		case 'Act Boss': {
			const b = poeData.findActbossAndArea(source.id);
			if (!b) return null;
			return b.area.areaLevel;
		}
		case 'Map': {
			return poeData.level(source.id, source.type);
		}
		case 'Map Boss': {
			const b = poeData.mapboss(source.id);
			if (!b) return null;
			const mapLevels: number[] = [];
			for (const map of b.maps) {
				const level = poeData.level(map, 'Map');
				if (level !== null) {
					mapLevels.push(level);
				}
			}
			const minLevel = Math.min(...mapLevels);
			return minLevel === Infinity ? null : minLevel;
		}
		default: {
			return null;
		}
	}
}

function sortSourcesByLevel(sources: ISource[], poeData: Readonly<PoeData>): void {
	sources.sort((s1, s2) => {
		// if source has no level, put it to the end
		const level1 = sourceLevel(s1, poeData) ?? 200;
		const level2 = sourceLevel(s2, poeData) ?? 200;
		return level1 - level2;
	});
}
