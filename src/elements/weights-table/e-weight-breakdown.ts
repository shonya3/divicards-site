import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatWeight, getLatestVersions } from './weights.js';
import type { WeightData } from './types.js';
import '@shoelace-style/shoelace/dist/components/details/details.js';
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
		if (!this.weightData) {
			return html`<span>-</span>`;
		}

		if (this.weightData.disabled) {
			return html`<span>disabled</span>`;
		}

		const { weights } = this.weightData;

		if (!weights || Object.keys(weights).length === 0) {
			return html`<span>-</span>`;
		}

		const { latest, previous, allSorted } = getLatestVersions(weights);

		if (!latest) {
			const singleWeight = Object.values(weights)[0];
			return html`<div class="weight-container">
				<div class="latest-weight"><span>${singleWeight ? formatWeight(singleWeight) : '—'}</span></div>
			</div>`;
		}

		const latestWeight = weights[latest];
		const previousWeight = previous ? weights[previous] : undefined;

		const renderDelta = (): TemplateResult | typeof nothing => {
			const lWeight = latestWeight ?? 0;

			// No previous version to compare to.
			if (previous == null) {
				// If there's a weight, it's new. Otherwise, show nothing.
				return lWeight > 0
					? html`<span class="delta delta--new" title="New in patch ${latest}">NEW</span>`
					: nothing;
			}

			const pWeight = previousWeight ?? 0;

			// Previous version exists.
			// If it's new (previous was 0), show NEW badge.
			if (lWeight > 0 && pWeight === 0) {
				return html`<span class="delta delta--new" title="New in patch ${latest}">NEW</span>`;
			}

			const delta = lWeight - pWeight;

			// Don't show if there's no change.
			// The threshold is set to 0.05 to align with the single-digit precision
			// of formatWeight for small numbers, preventing "0.0" deltas.
			if (Math.abs(delta) < 0.05) {
				return nothing;
			}

			return html`
				<span class="delta ${delta > 0 ? 'delta--up' : 'delta--down'}" title="Change from patch ${previous}">
					${formatWeight(delta, { signDisplay: 'always' })}
				</span>
			`;
		};

		return html`
			<div class="weight-container">
				<div class="latest-weight">
					<span>${formatWeight(latestWeight)}</span>
					${renderDelta()}
				</div>
				${allSorted.length > 1
					? html`
							<sl-details summary="History">
								<table class="history-table">
									<tbody>
										${allSorted.map(
											version => html`
												<tr>
													<td>${version}:</td>
													<td>${formatWeight(weights[version])}</td>
												</tr>
											`
										)}
									</tbody>
								</table>
							</sl-details>
					  `
					: ''}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'e-weight-breakdown': WeightBreakdownElement;
	}
}
