import { styleMap } from 'lit/directives/style-map.js';
import { LitElement, PropertyValueMap, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { CardSize } from './divination-card/e-divination-card';
import { poeData } from '../PoeData';
import type { RenderMode } from './types';
import './divination-card/e-divination-card';
import './e-source/e-source';
import { DivcordTable } from '../DivcordTable';
import type { Source } from '../../gen/Source';
import { sortSourcesByLevel } from '../utils';
import type { SourceSize } from './e-source/types';
import './e-sources';

/**
 * Divination card + list of it's drop sources.
 * @csspart active_drop_source - Dropsource involved in view transitions.
 * @csspart divination_card - Divination card element
 * @event   navigate-transition NavigateTransitionEvent - Emits on navigation.
 */
@customElement('e-card-with-sources')
export class CardWithSourcesElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) card_size: CardSize = 'medium';
	@property({ reflect: true }) source_size: SourceSize = 'medium';
	@property({ type: Object }) divcordTable!: DivcordTable;
	@property() renderMode: RenderMode = 'compact';
	/** Dropsource involved in view transitions */
	@property({ reflect: true }) active_drop_source?: string;

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
			'--card-width': `var(--card-width-${this.card_size})`,
		});

		return html`
			<div style=${wrapperStyles} class="wrapper">
				<e-divination-card
					part="divination_card"
					.name=${this.name}
					.size=${this.card_size}
				></e-divination-card>
				<e-sources
					.sources=${this.sources}
					.size=${this.source_size}
					verification-status="done"
					.renderMode=${this.renderMode}
					.active_drop_source=${this.active_drop_source}
					exportparts="active_drop_source"
				></e-sources>
				<e-sources
					.sources=${this.verifySources}
					.size=${this.source_size}
					verification-status="verify"
					.renderMode=${this.renderMode}
					.active_drop_source=${this.active_drop_source}
					exportparts="active_drop_source"
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

		:host {
			display: inline-block;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-sources': CardWithSourcesElement;
	}
}
