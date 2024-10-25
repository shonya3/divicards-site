import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import './elements/e-topnav';

declare global {
	interface HTMLElementTagNameMap {
		'main-layout': MainLayoutElement;
	}
}

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
		}

		#page {
			padding: 1rem;
			padding-bottom: 0;

			@media (width >= 640px) {
				padding: 1.5rem;
				padding-bottom: 0;
			}
		}
	`;
}
