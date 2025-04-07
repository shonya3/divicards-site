import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../elements/e-card-with-sources';
import '../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { poeData } from '../PoeData';
import { prepare_weight_data } from '../elements/weights-table/lib';
import '../elements/weights-table/e-weight-value';
import {
	UpdateViewTransitionNameEvent,
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';
import { slug } from '../gen/divcordWasm/divcord_wasm';

/**
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

		return html`<div class="page">
			<e-card-with-divcord-records
				.card=${this.card}
				.records=${divcord_store.table.get().recordsByCard(this.card)}
			>
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
				${card
					? html`
							<div slot="main-start">
								${card.league
									? html`<div>
											<span class="text-gray-700">Release:</span>
											<span class="text-gray-900"
												>${card.league.name} ${card.league.version}</span
											>
									  </div>`
									: nothing}
								<span class="text-gray-700">Weight:</span>
								<span class="text-gray-900"
									><e-weight-value .weightData=${prepare_weight_data(card)}></e-weight-value
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
