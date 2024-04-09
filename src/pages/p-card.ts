import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../elements/e-card-with-sources';
import '../elements/e-card-with-divcord-records';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { poeData } from '../PoeData';
import { DivcordTable } from '../DivcordTable';

declare global {
	interface HTMLElementTagNameMap {
		'p-card': CardPage;
	}
}

@customElement('p-card')
export class CardPage extends LitElement {
	@property({ reflect: true }) card!: string;

	@consume({ context: divcordTableContext, subscribe: true })
	divcordTable!: DivcordTable;

	render(): TemplateResult {
		const card = poeData.find.card(this.card);
		const league = card?.league;
		let weight = card?.weight ?? 1;
		if (weight > 0 && weight < 1) weight = 1;
		const weightStr = weight.toLocaleString('ru', { maximumFractionDigits: 0 });

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
								<div>Weight: ${weightStr}</div>
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

		@media (max-width: 600px) {
			e-card-with-sources {
				width: fit-content;
				margin-inline: auto;
			}
		}
	`;
}
