import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../../elements/e-card-with-sources';
import '../../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { poeData } from '../../PoeData';
import {
	UpdateViewTransitionNameEvent,
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../../context/view-transition-name-provider';
import { SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../../stores/divcord';
import { slug } from '../../../gen/divcordWasm/divcord_wasm';
import './e-card-fact.js';
import '../../elements/weights-table/e-weight-breakdown.js';
import { prepare_weight_data } from '../../elements/weights-table/lib.js';

/**
 * A card fact chip used for displaying a label and a value.
 * @csspart active_drop_source
 * @csspart divination_card
 */
@customElement('p-card')
export class CardPage extends SignalWatcher(LitElement) {
	@property({ reflect: true }) card!: string;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	connectedCallback(): void {
		super.connectedCallback();
		this.dispatchEvent(new UpdateViewTransitionNameEvent({ transition_name: 'card', value: slug(this.card) }));
	}

	render(): TemplateResult {
		const card = poeData.find.card(this.card);

		if (!card) {
			return html`<p>Card ${this.card} not found</p>`;
		}
		const records = divcord_store.table.get().recordsByCard(this.card);

		return html`<div class="page">
			<h2>${this.card}</h2>
			<e-card-with-divcord-records .card=${this.card} .records=${records}>
				<e-card-with-sources
					exportparts="divination_card,active_drop_source"
					slot="card"
					.name=${this.card}
					card_size="large"
					source_size="medium"
					.divcordTable=${divcord_store.table.get()}
					.active_drop_source=${this.view_transition_names.active_drop_source}
				>
				</e-card-with-sources>

				<div slot="main-start" class="facts">
					${card.league
						? html`<e-card-fact label="Release">${card.league.name} ${card.league.version}</e-card-fact>`
						: nothing}
					<e-card-fact label="Weight">
						<e-weight-breakdown .weightData=${prepare_weight_data(card)}></e-weight-breakdown>
					</e-card-fact>
				</div>
			</e-card-with-divcord-records>
		</div>`;
	}

	static styles = css`
		.page {
			max-width: 1080px;
			margin-inline: auto;
		}

		e-card-with-sources {
			margin-inline: auto;
			width: fit-content;
			@media (width >= 460px) {
				margin-inline: 0;
			}
		}

		.facts {
			display: flex;
			gap: var(--sl-spacing-medium);
			flex-wrap: wrap;
			align-items: baseline;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}
