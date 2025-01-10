import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'poe-custom-elements/divination-card.js';
import type { CardSize } from 'poe-custom-elements/divination-card.js';
import { slug } from '../../gen/divcordWasm/divcord_wasm';
import { NavigateTransitionEvent } from '../../events';
export type { CardSize } from 'poe-custom-elements/divination-card.js';

/**
 * @summary Divination Card

 * @event       navigate-transition Event - Emits on divination card navigation.
 * @cssproperty --padding-inline - The inline padding to use for for element.
 * @cssproperty --padding-block - The block padding to use for for element.
 * 
 */
@customElement('e-divination-card')
export class DivinationCardElement extends LitElement {
	@property({ reflect: true }) name: string = '';
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) boss?: string;

	protected render(): TemplateResult {
		return html`<poe-divination-card
			.name=${this.name}
			.size=${this.size}
			.boss=${this.boss}
			.hrefPattern=${`/card/{{slug}}`}
			@navigate=${this.#dispatch_transition}
		>
			<div slot="boss">
				<slot name="boss"></slot>
			</div>
		</poe-divination-card>`;
	}
	#dispatch_transition() {
		this.dispatchEvent(new NavigateTransitionEvent('card', slug(this.name)));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divination-card': DivinationCardElement;
	}
}
