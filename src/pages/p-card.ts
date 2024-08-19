import { LitElement, PropertyValueMap, PropertyValues, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/e-card-with-sources';
import '../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { poeData } from '../PoeData';
import { DivcordTable } from '../DivcordTable';
import type { WeightData } from '../elements/weights-table/types';
import { prepareWeightData } from '../elements/weights-table/lib';
import '../elements/weights-table/e-weight-value';
import { NavigateTransitionEvent } from '../events';
import { cardElementData } from 'poe-custom-elements/divination-card/data.js';

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
		const slug = cardElementData.find(c => c.name === this.card)?.slug;
		window.activeCard = slug;
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
								${league ? html`<div>Release: ${league.name} ${league.version}</div>` : nothing} Weight:
								<e-weight-value .weightData=${this.weightData}></e-weight-value>
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
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}
