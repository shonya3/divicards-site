import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-need-to-verify': NeedToVerifyElement;
	}
}

@customElement('e-need-to-verify')
export class NeedToVerifyElement extends LitElement {
	render() {
		return html` <p class="label">need to verify</p>
			<div class="border">
				<slot></slot>
			</div>`;
	}

	static styles = css`
		:host {
            --color: var(--sl-color-teal-600, teal);
		}

		* {
			padding: 0;
			margin: 0;
		}

		.label {
			text-align: end;
			color: var(--color);
            font-size: 0.75rem;
		}

		.border {
			display: block;
			padding-inline: 1rem;
            padding-block: 0.4rem;
			border-radius: 0.5rem;
			position: relative;
			box-shadow: 4px 4px var(--color);
			box-shadow: 1px 1px 5px  var(--color)
	`;
}
