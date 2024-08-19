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
import { NavigateTransitionEvent, redispatchTransition } from '../events';

/**
 * @csspart active-source - Dropsource involved in view transitions.
 * @csspart card - Divination card element
 * @event   navigate Event - Emits on divination card navigation.
 * @event   navigate-transition NavigateTransitionEvent - Emits on navigation.
 */
@customElement('e-card-with-sources')
export class CardWithSourcesElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true, attribute: 'card-size' }) cardSize: CardSize = 'medium';
	@property({ reflect: true, attribute: 'source-size' }) sourceSize: SourceSize = 'medium';
	@property({ type: Object }) divcordTable!: DivcordTable;
	@property() renderMode: RenderMode = 'compact';
	/** Dropsource involved in view transitions */
	@property({ reflect: true, attribute: 'active-source' }) activeSource?: string;

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
				<e-divination-card
					@navigate=${this.#dispatchNavigate}
					part="card"
					.name=${this.name}
					.size=${this.cardSize}
				></e-divination-card>
				<e-sources
					.sources=${this.sources}
					.size=${this.sourceSize}
					verification-status="done"
					.renderMode=${this.renderMode}
					.activeSource=${this.activeSource}
					exportparts="active-source"
					@navigate-transition=${this.#redispatchTransition}
				></e-sources>
				<e-sources
					.sources=${this.verifySources}
					.size=${this.sourceSize}
					verification-status="verify"
					.renderMode=${this.renderMode}
					.activeSource=${this.activeSource}
					exportparts="active-source"
					@navigate-transition=${this.#redispatchTransition}
				></e-sources>
			</div>
		`;
	}

	#dispatchNavigate() {
		this.dispatchEvent(new Event('navigate'));
	}

	#redispatchTransition(e: NavigateTransitionEvent) {
		redispatchTransition.call(this, e);
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

declare global {
	interface HTMLElementTagNameMap {
		'e-card-with-sources': CardWithSourcesElement;
	}
}
