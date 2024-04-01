import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-useful-resources': UsefulResourcesPage;
	}
}

@customElement('p-useful-resources')
export class UsefulResourcesPage extends LitElement {
	protected render(): TemplateResult {
		return html`<div class="page">1</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.page {
			padding: 2rem;
			padding-bottom: 0;
		}

		@media (width <=600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
				padding-bottom: 0;
			}
		}
	`;
}
