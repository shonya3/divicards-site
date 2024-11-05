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
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';

/**
 * @csspart active_drop_source
 * @csspart divination_card
 */
@customElement('p-card')
export class CardPage extends LitElement {
	@property({ reflect: true }) card!: string;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	@state() weightData!: WeightData;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const card = poeData.find.card(this.card);
			if (card) {
				this.weightData = prepareWeightData(card);
			}
		}
	}

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this.view_transition_names = {
			...this.view_transition_names,
			active_divination_card: slug(this.card),
		};
	}

	render(): TemplateResult {
		const card = poeData.find.card(this.card);
		const league = card?.league;
		let weight = card?.weight ?? 1;
		if (weight > 0 && weight < 1) weight = 1;

		return html`<div class="page">
			<e-card-with-divcord-records .card=${this.card} .records=${this.divcordTable.recordsByCard(this.card)}>
				<e-card-with-sources
					exportparts="divination_card,active_drop_source"
					slot="card"
					.name=${this.card}
					card_size="large"
					source_size="medium"
					.divcordTable=${this.divcordTable}
					.active_drop_source=${this.view_transition_names.active_drop_source}
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
