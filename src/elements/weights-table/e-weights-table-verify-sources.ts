import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-weights-table-verify-sources': WeightsTableVerifySources;
	}
}

@customElement('e-weights-table-verify-sources')
export class WeightsTableVerifySources extends LitElement {
	protected render() {
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
