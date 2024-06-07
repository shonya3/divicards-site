import { LitElement, PropertyValueMap, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/e-card-with-sources';
import '../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { poeData } from '../PoeData';
import { DivcordTable } from '../DivcordTable';
import type { WeightData } from '../elements/weights-table/types';
import { prepareWeightData, weightCellContent } from '../elements/weights-table/lib';
import { classMap } from 'lit/directives/class-map.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}

@customElement('p-card')
export class CardPage extends LitElement {
	@property({ reflect: true }) card!: string;

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() weightData!: WeightData;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const card = poeData.find.card(this.card);
			if (card) {
				this.weightData = prepareWeightData(card);
			}
		}
	}

	render(): TemplateResult {
		const card = poeData.find.card(this.card);
		const league = card?.league;
		let weight = card?.weight ?? 1;
		if (weight > 0 && weight < 1) weight = 1;
		const weightStr = weightCellContent(this.weightData);
		console.log(this.weightData);

		return html`<div class="page">
			<e-card-with-divcord-records .card=${this.card} .records=${this.divcordTable.recordsByCard(this.card)}>
				<e-card-with-sources
					slot="card"
					.name=${this.card}
					card-size="large"
					source-size="medium"
					.divcordTable=${this.divcordTable}
				>
				</e-card-with-sources>
				${card
					? html`
							<div slot="main-start">
								${league ? html`<div>Release: ${league.name} ${league.version}</div>` : nothing}
								<div
									class=${classMap({
										'weight-label': true,
										[`weight-label--${this.weightData.kind}`]: true,
									})}
								>
									Weight: ${weightStr}
								</div>
							</div>
					  `
					: nothing}
			</e-card-with-divcord-records>
		</div>`;
	}

	static styles = css`
		e-card-with-sources::part(card) {
			view-transition-name: card;
		}

		e-card-with-sources {
			margin-inline: auto;
			width: fit-content;
			@media (width >= 460px) {
				margin-inline: 0;
			}
		}

		.weight-label {
			position: relative;
		}

		.weight-label--show-pre-rework-weight::after {
			content: '(3.23)';
			color: pink;
			font-size: 11px;
		}
	`;
}
