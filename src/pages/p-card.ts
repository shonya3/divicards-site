import { LitElement, PropertyValueMap, PropertyValues, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/e-card-with-sources';
import '../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { poeData } from '../PoeData';
import { DivcordTable } from '../context/divcord/DivcordTable';
import type { WeightData } from '../elements/weights-table/types';
import { prepareWeightData } from '../elements/weights-table/lib';
import '../elements/weights-table/e-weight-value';
import { NavigateTransitionEvent } from '../events';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { divcordTableContext } from '../context/divcord/divcord-provider';

@customElement('p-card')
export class CardPage extends LitElement {
	@property({ reflect: true }) card!: string;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() weightData!: WeightData;
	/** Dropsource involved in view transitions */
	@state() activeSource?: string = window.activeSource;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const card = poeData.find.card(this.card);
			if (card) {
				this.weightData = prepareWeightData(card);
			}
		}
	}

	protected firstUpdated(_changedProperties: PropertyValues): void {
		window.activeCard = slug(this.card);
	}

	render(): TemplateResult {
		const card = poeData.find.card(this.card);
		const league = card?.league;
		let weight = card?.weight ?? 1;
		if (weight > 0 && weight < 1) weight = 1;

		return html`<div class="page">
			<e-card-with-divcord-records .card=${this.card} .records=${this.divcordTable.recordsByCard(this.card)}>
				<e-card-with-sources
					exportparts="card,active-source"
					slot="card"
					.name=${this.card}
					card-size="large"
					source-size="medium"
					.divcordTable=${this.divcordTable}
					.activeSource=${this.activeSource}
					@navigate-transition=${this.#handleNavigateTransition}
				>
				</e-card-with-sources>
				${card
					? html`
							<div slot="main-start">
								${league
									? html`<div>
											<span class="text-gray-700">Release:</span>
											<span class="text-gray-900">${league.name} ${league.version}</span>
									  </div>`
									: nothing}
								<span class="text-gray-700">Weight:</span>
								<span class="text-gray-900"
									><e-weight-value .weightData=${this.weightData}></e-weight-value
								></span>
							</div>
					  `
					: nothing}
			</e-card-with-divcord-records>
		</div>`;
	}

	#handleNavigateTransition(e: NavigateTransitionEvent) {
		window.activeSource = e.slug;
		this.activeSource = e.slug;
	}

	static styles = css`
		e-card-with-sources {
			margin-inline: auto;
			width: fit-content;
			@media (width >= 460px) {
				margin-inline: 0;
			}
		}

		.text-gray-900 {
			color: var(--sl-color-gray-900);
		}
		.text-gray-700 {
			color: var(--sl-color-gray-700);
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}
