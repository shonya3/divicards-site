import { LitElement, css, html, nothing } from 'lit';
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

	render() {
		const league = poeData.card(this.card)?.league;

		return html`<div class="page">
			<e-card-with-divcord-records .card=${this.card} .records=${this.divcordTable.recordsByCard(this.card)}>
				<e-card-with-sources slot="card" .name=${this.card} size="large" .divcordTable=${this.divcordTable}>
				</e-card-with-sources>
				${league ? html` <div slot="main-start">Release: ${league.name} ${league.version}</div> ` : nothing}
			</e-card-with-divcord-records>
		</div>`;
	}

	static styles = css`
		e-card-with-sources::part(card) {
			view-transition-name: card;
		}

		.page {
			padding: 2rem;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			e-card-with-sources {
				width: fit-content;
				margin-inline: auto;
			}
		}
	`;
}
