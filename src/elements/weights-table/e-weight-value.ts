import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { WeightData } from './types';

/**
 * @summary - Shows weight value. Also shows pre-rework game version
 *            if card is unobtainable from divination cards anymore.
 */
@customElement('e-weight-value')
export class WeightValueElement extends LitElement {
	@property({ type: Object }) weightData!: WeightData;

	protected render() {
		const label = weightLabel(this.weightData);
		return html`
			${label}
			${this.weightData.kind === 'show-pre-rework-weight'
				? html`<span class="pre-rework-version">3.23</span>`
				: nothing}
		`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
		:host {
			display: inline-flex;
			justify-content: center;
		}
		.pre-rework-version {
			color: var(--sl-color-fuchsia-900);
			font-size: 10px;
		}
	`;
}

function weightLabel(weightData: WeightData) {
	switch (weightData.kind) {
		case 'disabled': {
			return 'disabled';
		}
		case 'normal': {
			return formatWeight(weightData.weight);
		}
		case 'show-pre-rework-weight': {
			return formatWeight(weightData.weight);
		}
	}
}

const fmts = {
	'0': new Intl.NumberFormat('ru', { maximumFractionDigits: 0 }),
	'2': new Intl.NumberFormat('ru', { maximumFractionDigits: 2 }),
};
function formatWeight(weight: number, formatters: Record<0 | 2, Intl.NumberFormat> = fmts) {
	const maximumFractionDigits = weight > 5 ? 0 : 2;
	return formatters[maximumFractionDigits].format(weight);
}

declare global {
	interface HTMLElementTagNameMap {
		'e-weight-value': WeightValueElement;
	}
}
