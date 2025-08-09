import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

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
	@property({ type: Boolean }) reverify = false;

	@query('.slot-parent') slotParent!: HTMLDivElement;

	protected render(): TemplateResult {
		return html`
			<div class="slot-parent">
				<slot></slot>
			</div>
			<e-need-to-verify-border .reverify=${this.reverify} part="border"></e-need-to-verify-border>
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
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
			z-index: 1;
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
	@property({ type: Boolean }) reverify = false;

	protected render(): TemplateResult {
		return html`<a href="/verify/faq">Need to ${this.reverify ? 're' : ''}verify</a>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			--color: var(--sl-color-sky-700, teal);

			width: calc(100%);
			height: calc(100%);

			position: absolute;
			top: 50%;
			left: 50%;
			translate: -50% -50%;

			border-radius: 0.3rem;
			border: 2px dotted;
			border-color: color-mix(in srgb, var(--color) 20%, transparent);
		}

		a {
			position: absolute;
			top: 0;
			right: 0;
			font-size: 1rem;
			translate: 0 -100%;

			white-space: nowrap;
			color: var(--color);
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-need-to-verify': NeedToVerifyElement;
		'e-need-to-verify-border': NeedToVerifyBorderElement;
	}
}
