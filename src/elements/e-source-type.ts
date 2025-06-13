import { customElement, property } from 'lit/decorators.js';
import { LitElement, TemplateResult, css, html } from 'lit';
import type { SourceType } from '../../gen/Source';

@customElement('e-source-type')
export class SourceTypeElement extends LitElement {
	@property({ reflect: true }) sourceType!: SourceType;

	render(): TemplateResult {
		return html`<a href=${sourceTypeHref(this.sourceType)} class="source-type">${this.sourceType}</a>`;
	}

	static styles = css`
		:host {
			width: fit-content;
			margin-inline: auto;
			display: inline-block;
		}

		a:link {
			text-decoration: none;
		}

		.source-type {
			text-align: center;
			color: var(--source-type-text-color, var(--sl-color-orange-700));
			font-weight: 500;
			font-size: var(--source-type-font-size, 20px);
		}

		.source-type:hover {
			color: var(--link-color-hover, skyblue);
		}
	`;
}

function sourceTypeHref(sourceType: SourceType): string {
	// return `/source-type/${slug(sourceType)}`
	return `/source-type/${sourceType}`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-source-type': SourceTypeElement;
	}
}
