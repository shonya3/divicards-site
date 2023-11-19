import { customElement, property } from 'lit/decorators.js';
import type { SourceType } from '../data/ISource.interface';
import { LitElement, css, html } from 'lit';

declare global {
	interface HTMLElementTagNameMap {
		'e-source-type': SourceTypeElement;
	}
}

export function sourceTypeHref(sourceType: SourceType) {
	return `/source-type/${sourceType}`;
}

@customElement('e-source-type')
export class SourceTypeElement extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;

	#setViewTransitionName() {
		this.style.setProperty('view-transition-name', 'source-type');
	}

	render() {
		return html`<a @click=${this.#setViewTransitionName} href=${sourceTypeHref(this.sourceType)} class="source-type"
			>${this.sourceType}</a
		>`;
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
