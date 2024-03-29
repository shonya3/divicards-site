import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { linkStyles } from '../linkStyles';

declare global {
	interface HTMLElementTagNameMap {
		'e-sheets-link': SheetsLinkElement;
	}
}

@customElement('e-sheets-link')
export class SheetsLinkElement extends LitElement {
	@property({ reflect: true }) href = '';

	protected render(): TemplateResult {
		return html`<div class="el">
			<sl-icon class="icon" name="file-earmark-spreadsheet"></sl-icon>
			<a .href=${this.href}><slot></slot> </a>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		${linkStyles}
		a:link {
			text-decoration: underline;
		}

		.el {
			display: flex;
			align-items: center;
			gap: 0.4rem;
		}

		.icon {
			color: var(--sl-color-green-700);
		}
	`;
}
