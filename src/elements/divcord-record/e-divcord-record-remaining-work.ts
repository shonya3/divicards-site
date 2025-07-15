import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RemainingWork } from '../../../gen/divcord';
import { classMap } from 'lit/directives/class-map.js';

@customElement('e-divcord-record-remaining-work')
export class DivcordRecordRemaningWorkElement extends LitElement {
	@property({ attribute: 'remaining-work' }) remainingWork!: RemainingWork;

	protected render(): TemplateResult | typeof nothing {
		if (!this.remainingWork) throw new Error('<e-divcord-record-remaining-work> no .remainingWork provided');

		if (this.remainingWork === 'n/a') return nothing;

		return html`<div
			class="${classMap({
				'remaining-work': true,
				'remaining-work--story': this.remainingWork === 'story',
				'remaining-work--reverify': this.remainingWork === 'reverify',
				'remaining-work--confirm': this.remainingWork === 'confirm',
			})}"
		>
			<span class="remaining-work-span">Remaining Work</span>
			<span>${this.remainingWork}</span>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.remaining-work {
			padding: var(--sl-spacing-small);
			font-size: var(--sl-font-size-large);
			position: relative;
			color: black;
		}
		.remaining-work--reverify {
			background-color: #9fc5e8;
		}
		.remaining-work--story {
			background-color: #efa7c5;
		}
		.remaining-work--confirm {
			background-color: #f5d379;
			color: black;
		}

		.remaining-work-span {
			font-size: var(--sl-font-size-small);
			position: absolute;
			bottom: 5px;
			right: 5px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-record-remaining-work': DivcordRecordRemaningWorkElement;
	}
}
