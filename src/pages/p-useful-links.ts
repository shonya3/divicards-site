import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-useful-links': UsefulLinksPage;
	}
}

@customElement('p-useful-links')
export class UsefulLinksPage extends LitElement {
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
