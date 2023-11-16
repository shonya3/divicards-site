import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface';
import { LitElement, css, html } from 'lit';

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-type': SourceTypeElement;
	}
}

export function sourceTypeHref(sourceType: SourceType) {
	return `/source-type/${sourceType}`;
}

@customElement('wc-source-type')
export class SourceTypeElement extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;

	render() {
		return html`<a href=${sourceTypeHref(this.sourceType)} class="source-type">${this.sourceType}</a>`;
	}

	static styles = css`
		.source-type {
			text-align: center;
			color: orange;
			font-weight: 500;
			font-size: var(--source-type-font-size, 20px);
		}
	`;
}
