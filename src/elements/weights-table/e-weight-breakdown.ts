import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatWeight, getLatestVersions } from './weights.js';
import { classMap } from 'lit/directives/class-map.js';
import type { WeightData } from './types.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

@customElement('e-weight-breakdown')
export class WeightBreakdownElement extends LitElement {
	@property({ type: Object })
	weightData?: WeightData;

	static styles = css`
		:host {
			display: flex;
			justify-content: center;
		}
		.weight-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.25rem;
			min-width: 120px; /* Ensure some space for delta */
		}
		.latest-weight {
			font-weight: 600;
			font-size: 18px;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.fallback-icon {
			color: var(--sl-color-primary-600);
			font-size: 14px;
			margin-left: -0.25rem;
		}
		.no-data-span {
			cursor: help;
			border-bottom: 1px dotted;
			color: var(--sl-color-neutral-600);
		}
		.delta {
			font-size: 12px;
			padding: 2px 4px;
			border-radius: 4px;
			color: white;
			font-weight: bold;
		}
		.delta--up {
			background-color: var(--sl-color-success-600);
		}
		.delta--down {
			background-color: var(--sl-color-danger-600);
		}
		.delta--new {
			background-color: var(--sl-color-primary-600);
			font-size: 11px;
		}

		sl-details {
			width: 100%;
		}
		sl-details::part(base) {
			border: none;
		}
		sl-details::part(header) {
			padding: 0.25rem 0;
			font-size: 12px;
			justify-content: center;
		}
		sl-details::part(summary) {
			color: var(--sl-color-neutral-600);
		}
		sl-details::part(summary-icon) {
			font-size: 10px;
			margin-left: -4px;
		}
		sl-details::part(content) {
			padding: 0.5rem 0 0 0;
		}
		.history-table {
			font-size: 12px;
			text-align: left;
			border-collapse: collapse;
			margin: 0 auto;
		}
		.history-table td {
			padding: 2px 6px;
			color: var(--sl-color-neutral-700);
		}
		.history-table td:first-child {
			font-weight: 500;
			color: var(--sl-color-neutral-600);
		}
	`;

	render() {
		if (!this.weightData) return html`<span>-</span>`;

		switch (this.weightData.displayKind) {
			case 'disabled':
				return html`<span>disabled</span>`;
			case 'no-data':
			case 'normal':
			case 'fallback-to-prerework':
				return this.renderWeightDisplay();
			default:
				return html`<span>-</span>`;
		}
	}

	private renderWeightDisplay(): TemplateResult {
		if (!this.weightData) return html``;

		const { weights, displayWeight, displayKind, fallbackSourceLeague, delta } = this.weightData;

		if (!weights || Object.keys(weights).length === 0) {
			return html`<span>-</span>`;
		}

		const { allSorted } = getLatestVersions(weights);

		const renderDelta = (): TemplateResult | typeof nothing => {
			if (displayKind === 'fallback-to-prerework' || displayKind === 'no-data') {
				return nothing;
			}

			// To avoid showing a "+0" or "-0" delta, we check if the rounded delta is zero using the same logic as
			// the formatWeight() utility. This can happen with very small floating point differences, or with small
			// numbers that round to zero with the given precision (e.g., -0.04 rounds to 0 with one decimal place).
			const precision = Math.abs(delta) > 5 ? 0 : 1;
			const p = Math.pow(10, precision);
			const roundedDelta = Math.round(delta * p) / p;

			if (roundedDelta === 0) {
				return nothing;
			}

			// If the delta is the same as the display weight, it means the previous weight was 0, so it's a new card.
			if (delta > 0 && delta === displayWeight) {
				return html`<span class="delta delta--new">new</span>`;
			}

			const direction = delta > 0 ? 'up' : 'down';
			return html`<span
				class=${classMap({ delta: true, 'delta--up': direction === 'up', 'delta--down': direction === 'down' })}
				>${formatWeight(delta, { signDisplay: 'always' })}</span
			>`;
		};

		const renderFallbackIcon = () => {
			if (displayKind !== 'fallback-to-prerework') {
				return nothing;
			}
			const content = `Pre-rework weight from patch ${fallbackSourceLeague} is shown.`;
			return html`
				<sl-tooltip .content=${content}>
					<sl-icon name="info-circle" class="fallback-icon"></sl-icon>
				</sl-tooltip>
			`;
		};

		return html`
			<div class="weight-container">
				<div class="latest-weight">
					${displayKind === 'no-data'
						? html`<sl-tooltip
								content="The card has a weight of 0 in the current league. To avoid showing potentially outdated information, no fallback weight from a previous league is displayed."
								><span class="no-data-span">no data</span></sl-tooltip
						  >`
						: html`<span>${formatWeight(displayWeight)}</span> ${renderFallbackIcon()} ${renderDelta()}`}
				</div>
				${allSorted.length > 1
					? html`
							<sl-details summary="History">
								<table class="history-table">
									<tbody>
										${allSorted.map(
											league => html`
												<tr>
													<td>${league}:</td>
													<td>${formatWeight(weights[league])}</td>
												</tr>
											`
										)}
									</tbody>
								</table>
							</sl-details>
					  `
					: nothing}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-weight-breakdown': WeightBreakdownElement;
	}
}
