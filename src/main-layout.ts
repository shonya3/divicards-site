import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'main-layout': MainLayoutElement;
	}
}

/**
 * Main Layout for index.html
 * @slot header
 * @slot page
 */
@customElement('main-layout')
export class MainLayoutElement extends LitElement {
	render(): TemplateResult {
		return html`
			<header id="header">
				<slot name="header"></slot>
			</header>

			<div id="page">
				<slot name="page"></slot>
			</div>

			<footer id="footer"></footer>
		`;
	}

	static styles = css`
		:host {
			display: block;
			min-height: 100vh;
		}

		#header {
			position: sticky;
			top: 0;
			z-index: 10;
			background-color: var(--bg-clr);
		}

		#page {
			padding: 1rem;
			padding-bottom: 0;

			@media (width >= 640px) {
				padding: 1.5rem;
				padding-bottom: 0;
			}
		}

		#footer {
			padding: 2rem;
		}
	`;
}
