import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * @csspart base - The component's base wrapper.
 * @csspart label - The label part.
 * @csspart value - The value part.
 *
 * @slot - The default slot for the value.
 * @slot label - The slot for the label.
 */
@customElement('e-card-fact')
export class CardFactElement extends LitElement {
	@property() label?: string;
	@property() value?: string;

	protected render(): TemplateResult {
		return html`
			<div part="base" class="base">
				<div part="label" class="label">
					<slot name="label">${this.label}</slot>
				</div>
				<div part="value" class="value">
					<slot>${this.value}</slot>
				</div>
			</div>
		`;
	}

	static styles = css`
		.base {
			display: flex;
			flex-direction: column;
			gap: var(--sl-spacing-3x-small);
		}

		.label {
			color: var(--sl-color-neutral-600);
			font-size: var(--sl-font-size-small);
			text-transform: uppercase;
			font-weight: var(--sl-font-weight-semibold);
		}

		.value {
			color: var(--sl-color-neutral-900);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-card-fact': CardFactElement;
	}
}
