import { css, html, HTMLTemplateResult, LitElement, nothing, render, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'poe-custom-elements/divination-card.js';
import type { CardSize } from 'poe-custom-elements/divination-card.js';
import { UpdateViewTransitionNameEvent } from '../../context/view-transition-name-provider';
import { slug } from '../../../gen/divcordWasm/divcord_wasm';
export type { CardSize } from 'poe-custom-elements/divination-card.js';
import './e-simple-tooltip.js';
import { linkStyles } from '../../linkStyles.js';
import { SimpleTooltip } from './e-simple-tooltip.js';
import type { SourceSize } from '../e-source/types.js';
import type { Sources } from '../../DivcordTable.js';
import { styleMap } from 'lit/directives/style-map.js';
import '../e-sources.js';

export type Appearance = 'card' | 'link';

/**
 * @summary Divination Card
 *
 *
 * @csspart divination_card - Divination card element
 * @csspart active_drop_source - Dropsource involved in view transitions.
 * @csspart     link - Text link when appearance is "link".
 * @event       navigate-transition Event - Emits on divination card navigation.
 * @cssproperty --padding-inline - The inline padding to use for for element.
 * @cssproperty --padding-block - The block padding to use for for element.
 *
 */
@customElement('e-divination-card')
export class DivinationCardElement extends LitElement {
	@property({ reflect: true }) appearance: Appearance = 'card';
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) boss?: string;

	/** Card's drop sources. If provided, shows drop sources under the card */
	@property({ type: Object }) sources?: Sources;

	@property({ reflect: true }) source_size: SourceSize = 'medium';

	/** Dropsource involved in view transitions */
	@property({ reflect: true }) active_drop_source?: string;

	tooltip: SimpleTooltip | null = null;
	tooltipTemplate: HTMLTemplateResult | null = null;

	get slug() {
		return slug(this.name);
	}

	protected render(): TemplateResult | typeof nothing {
		const cardTemplate = this.sources
			? html`
					<div
						style=${styleMap({
							width: `var(--card-width-${this.size})`,
						})}
					>
						<poe-divination-card
							part="divination_card"
							.name=${this.name}
							.size=${this.size}
							.hrefPattern=${`/card/{{slug}}`}
							@navigate=${this.#dispatch_transition}
						></poe-divination-card>
						<e-sources
							.sources=${this.sources.done}
							.size=${this.source_size}
							verification-status="done"
							.active_drop_source=${this.active_drop_source}
							exportparts="active_drop_source"
						></e-sources>
						<e-sources
							.sources=${this.sources.verify}
							.size=${this.source_size}
							verification-status="verify"
							.active_drop_source=${this.active_drop_source}
							exportparts="active_drop_source"
						></e-sources>
					</div>
			  `
			: html`<poe-divination-card
					part="divination_card"
					.name=${this.name}
					.size=${this.appearance === 'link' ? 'medium' : this.size}
					.boss=${this.boss}
					.hrefPattern=${`/card/{{slug}}`}
					@navigate=${this.#dispatch_transition}
			  >
					<div slot="boss">
						<slot name="boss"></slot>
					</div>
			  </poe-divination-card>`;
		this.tooltipTemplate = cardTemplate;

		return this.appearance === 'link'
			? html`<a part="link" class="link" @click=${this.#dispatch_transition} href="/card/${this.slug}">
					<span>${this.name}</span>
			  </a>`
			: cardTemplate;
	}

	protected firstUpdated(): void {
		if (this.appearance === 'link') {
			this.lazyCreateTooltip();
		}
	}

	#dispatch_transition() {
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'card', value: this.slug }));
	}

	lazyCreateTooltip() {
		if (!this.tooltipTemplate) {
			return;
		}

		SimpleTooltip.lazy(this, tooltip => {
			this.tooltip = tooltip;
			render(this.tooltipTemplate, tooltip);
		});
	}

	createTooltip() {
		if (this.tooltip) {
			console.error('Card tooltip already exists');
			return;
		}

		this.tooltip = document.createElement('e-simple-tooltip');
		this.shadowRoot!.append(this.tooltip);
		render(this.tooltipTemplate, this.tooltip);
	}

	static styles = [
		linkStyles,
		css`
			.link {
				font-family: 'fontin';
				display: flex;
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divination-card': DivinationCardElement;
	}
}
