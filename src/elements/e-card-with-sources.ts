import { styleMap } from 'lit/directives/style-map.js';
import { LitElement, TemplateResult, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from './divination-card/e-divination-card';
import type { RenderMode } from './types';
import './divination-card/e-divination-card';
import './e-source/e-source';
import { type Sources } from '../DivcordTable';
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
	@property() renderMode: RenderMode = 'compact';
	/** Dropsource involved in view transitions */
	@property({ reflect: true }) active_drop_source?: string;
	@property({ type: Object }) sources!: Sources;

	render(): TemplateResult | typeof nothing {
		if (!this.sources) {
			console.error(`<e-card-with-sources> requires "sources" field`);
			return nothing;
		}

		return html`
			<div
				style=${styleMap({
					width: `var(--card-width-${this.card_size})`,
				})}
				class="wrapper"
			>
				<e-divination-card
					part="divination_card"
					.name=${this.name}
					.size=${this.card_size}
				></e-divination-card>
				<e-sources
					.sources=${this.sources.done}
					.size=${this.source_size}
					verification-status="done"
					.renderMode=${this.renderMode}
					.active_drop_source=${this.active_drop_source}
					exportparts="active_drop_source"
				></e-sources>
				<e-sources
					.sources=${this.sources.verify}
					.size=${this.source_size}
					verification-status="verify"
					.renderMode=${this.renderMode}
					.active_drop_source=${this.active_drop_source}
					exportparts="active_drop_source"
				></e-sources>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-sources': CardWithSourcesElement;
	}
}
