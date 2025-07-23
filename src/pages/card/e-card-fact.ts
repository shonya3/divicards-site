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
				<span part="label" class="label">
					<slot name="label">${this.label}:</slot>
				</span>
				<span part="value" class="value">
					<slot>${this.value}</slot>
				</span>
			</div>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.base {
			display: inline-flex;
			align-items: baseline;
			gap: var(--sl-spacing-2x-small);
			background-color: var(--sl-color-neutral-50);
			padding: var(--sl-spacing-2x-small) var(--sl-spacing-small);
			border-radius: var(--sl-border-radius-medium);
			border: 1px solid var(--sl-color-neutral-200);
		}

		.label {
			color: var(--sl-color-neutral-600);
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
