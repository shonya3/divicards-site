import { LitElement, TemplateResult, css, html } from 'lit';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-verify-faq-alert': VerifyFaqAlertElement;
	}
}

@customElement('e-verify-faq-alert')
export class VerifyFaqAlertElement extends LitElement {
	protected render(): TemplateResult {
		return html`<div class="element">
			<sl-alert open>
				<img
					slot="icon"
					src="/images/45px-Divcord.png"
					decoding="async"
					width="45"
					height="45"
					alt="Icon Stacked decks with questionmark"
				/>
				<p>
					Please take a moment to review our <a href="/verify-faq">faq</a> section. This will help you better
					understand the community rules and expectations. Thank you for your attention and for making a
					constructive contribution!
				</p>
			</sl-alert>
		</div>`;
	}

	static styles = css`
		:host {
			display: block;
			width: fit-content;
		}

		* {
			padding: 0;
			margin: 0;
			font-family: Geist;
		}

		a,
		a:visited {
			color: var(--source-color, #bbbbbb);
		}

		a:hover {
			color: var(--link-color-hover);
		}

		.element {
			max-width: 600px;
		}

		sl-alert {
			font-family: Geist;
		}
	`;
}
