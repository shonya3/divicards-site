import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { linkStyles } from './linkStyles';
import './elements/e-topnav';

declare global {
	interface HTMLElementTagNameMap {
		'app-root': RootElement;
	}
}

@customElement('app-root')
export class RootElement extends LitElement {
	render(): TemplateResult {
		return html`<div class="wrapper">
			<header class="header">
				<e-topnav exportparts="active-link"></e-topnav>
			</header>
			<div class="outlet">
				<slot></slot>
			</div>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		@layer base {
			${linkStyles}

			a {
				transition: 0.2s color;
			}
		}

		:host {
			display: block;
			min-height: 100vh;
			--source-color: var(--sl-color-gray-800);
		}

		.header {
			position: sticky;
			top: 0;
			z-index: 10;
		}

		.outlet {
			margin-top: 1rem;
			padding: 1rem;
			padding-bottom: 0;

			@media (width >= 640px) {
				padding: 2rem;
				padding-bottom: 0;
			}
		}
	`;
}
