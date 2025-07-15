import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Confidence } from '../../../gen/divcord';

/**
 * A confidence of divcord record sources.
 * @cssproperty --greynote-color - The text color of greynote.
 * @cssproperty --paragraph-color - The text color of notes and wiki disagreements.
 * @cssproperty	--confidence--done-bg-color - The background color for Done confidence.
 * @cssproperty --confidence--ok-bg-color - The background color for OK confidence.
 * @cssproperty	--confidence--low-bg-color - The background color for Low confidence.
 * @cssproperty	--confidence--none-bg-color - The background color for None confidence.
 * @cssproperty	--confidence--done-color - The text color for Done confidence.
 * @cssproperty --confidence--ok-color - The ok color for OK confidence.
 * @cssproperty	--confidence--low-color - The text color for Low confidence.
 * @cssproperty	--confidence--none-color - The text color for None confidence.
 */
@customElement('e-divcord-record-confidence')
export class DivcordRecordConfidenceElement extends LitElement {
	@property() confidence?: Confidence;

	protected render(): TemplateResult {
		if (!this.confidence) throw new Error('<e-divcord-record-confidence> no .confidence provided');

		return html`<div
			title="Confidence"
			class=${classMap({
				confidence: true,
				[`confidence--${this.confidence}`]: true,
			})}
		>
			<span class="confidence-span">Confidence</span> ${this.confidence}
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			--confidence--done-bg-color: green;
			--confidence--ok-bg-color: #93c47d;
			--confidence--low-bg-color: #f1c232;
			--confidence--none-bg-color: red;

			--confidence--done-color: white;
			--confidence--ok-color: black;
			--confidence--low-color: black;
			--confidence--none-color: white;
		}

		.confidence {
			padding: var(--sl-spacing-small);
			font-size: var(--sl-font-size-large);
			position: relative;
		}
		.confidence--done {
			background-color: var(--confidence--done-bg-color);
			color: var(--confidence--done-color);
		}
		.confidence--ok {
			background-color: var(--confidence--ok-bg-color);
			color: var(--confidence--ok-color);
		}
		.confidence--low {
			background-color: var(--confidence--low-bg-color);
			color: var(--confidence--low-color);
		}
		.confidence--none {
			background-color: var(--confidence--none-bg-color);
			color: var(--confidence--none-color);
		}

		.confidence-span {
			font-size: var(--sl-font-size-small);
			position: absolute;
			bottom: 5px;
			right: 5px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-record-confidence': DivcordRecordConfidenceElement;
	}
}
