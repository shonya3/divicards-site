import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'active-card-provider': ActiveCardProviderElement;
	}
}

@customElement('active-card-provider')
export class ActiveCardProviderElement extends LitElement {
	protected render(): TemplateResult {
		return html`content`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
	`;
}
