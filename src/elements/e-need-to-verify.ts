import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-need-to-verify': NeedToVerifyElement;
		'e-need-to-verify-border': NeedToVerifyBorderElement;
	}
}

/**
 * @summary Notifiyng border for e-divination-card and e-source, when it needs to be verified.
 * Example:
 * ```js
 * <e-need-to-verify>
 *  <e-divination-card name="The Doctor"></e-divination-card>
 * </e-need-to-verify>
 * ```
 */
@customElement('e-need-to-verify')
export class NeedToVerifyElement extends LitElement {
	@query('.slot-parent') slotParent!: HTMLDivElement;

	protected render() {
		return html`
			<div class="slot-parent">
				<slot></slot>
			</div>
			<e-need-to-verify-border style="z-index: -1"></e-need-to-verify-border>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
			position: relative;
			width: fit-content;
			height: fit-content;

			display: flex;
			justify-content: center;
			align-items: center;

			border-top: 16px solid transparent;
		}

		.slot-parent {
			padding-inline: var(--padding-inline, 0rem);
			padding-block: var(--padding-block, 0rem);
		}

		/** hint which tags are expected */
		::slotted(:is(e-divination-card, e-source, *)) {
			--padding-inline: 1rem;
			--padding-block: 0.4rem;
		}
	`;
}

@customElement('e-need-to-verify-border')
export class NeedToVerifyBorderElement extends LitElement {
	protected render() {
		return html`<p>Need to verify</p>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			--color: var(--sl-color-teal-600, teal);

			width: calc(100%);
			height: calc(100%);

			position: absolute;
			top: 50%;
			left: 50%;
			translate: -50% -50%;

			border-radius: 0.5rem;
			box-shadow: 4px 4px var(--color);
			box-shadow: 1px 1px 5px var(--color);
		}

		p {
			position: absolute;
			top: 0;
			right: 0;
			font-size: 0.75rem;
			translate: 0 -100%;

			white-space: nowrap;
			color: var(--color);
		}
	`;
}
