import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import 'poe-custom-elements/divination-card.js';
import type { CardSize } from 'poe-custom-elements/divination-card.js';
import { cardElementData } from 'poe-custom-elements/divination-card/data.js';
import { dispatchTransition } from '../../events';
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
			@navigate=${this.#dispatchNavigate}
		>
			<div slot="boss">
				<slot name="boss"></slot>
			</div>
		</poe-divination-card>`;
	}
	#dispatchNavigate() {
		const slug = cardElementData.find(card => card.name === this.name)?.slug;
		dispatchTransition.call(this, 'card', slug);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divination-card': DivinationCardElement;
	}
}
