import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './e-relative-time';

@customElement('e-divcord-records-age')
export class DivcordRecordsAgeElement extends LitElement {
	@property({ type: Object }) date?: Date;

	render(): TemplateResult | null {
		if (!this.date) {
			return null;
		}
		return html`<p>Last updated: <e-relative-time .date=${this.date}></e-relative-time> <slot></slot></p> `;
	}

	static styles = css`
		:host {
			color: var(--sl-color-gray-500);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-records-age': DivcordRecordsAgeElement;
	}
}
