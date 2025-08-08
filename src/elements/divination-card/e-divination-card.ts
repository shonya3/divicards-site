import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import 'poe-custom-elements/divination-card.js';
import type { CardSize } from 'poe-custom-elements/divination-card.js';
import { UpdateViewTransitionNameEvent } from '../../context/view-transition-name-provider';
import { slug } from '../../../gen/divcordWasm/divcord_wasm';
export type { CardSize } from 'poe-custom-elements/divination-card.js';
import './e-simple-tooltip.js';
import { linkStyles } from '../../linkStyles.js';
import { tooltip } from './e-simple-tooltip.js';

export type Appearance = 'card' | 'link';

/**
 * @summary Divination Card
 *
 *
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

	@state() transitioning = false;

	get slug() {
		return slug(this.name);
	}

	protected render(): TemplateResult {
		const cardTemplate = html`<poe-divination-card
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

		if (this.appearance === 'link') {
			return html`<a
				${tooltip(cardTemplate)}
				part="link"
				class="link"
				@click=${this.#dispatch_transition}
				href="/card/${this.slug}"
			>
				<span>${this.name}</span>
			</a> `;
		}

		return cardTemplate;
	}
	#dispatch_transition() {
		this.transitioning = true;
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'card', value: this.slug }));
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
