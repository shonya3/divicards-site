import { linkStyles } from './../linkStyles';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { poeData } from '../PoeData';
import '../elements/weights-table/e-weights-table';
import '../elements/e-discord-avatar';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { Storage } from '../storage';
import type { WeightsTableElement } from '../elements/weights-table/e-weights-table';
import { consume } from '@lit/context';
import { DivcordTable } from '../DivcordTable';
import { divcordTableContext } from '../context';
import { WeightData } from '../elements/weights-table/types';
import { prepareWeightData } from '../elements/weights-table/lib';

declare module '../storage' {
	interface Registry {
		weightsPageShowCards: boolean;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'p-weights': WeightsPage;
	}
}

@customElement('p-weights')
export class WeightsPage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	#showCardsStorage = new Storage('weightsPageShowCards', false);
	@state() rows: Array<WeightData> = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			this.rows = Object.values(poeData.cards).map(prepareWeightData);
			this.rows.sort((a, b) => b.weight - a.weight);
		}
	}

	#onShowCardsChanged(e: Event) {
		const target = e.target as WeightsTableElement;
		this.#showCardsStorage.save(target.showCards);
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<h1 class="heading">Weights</h1>
			<p class="weights-spreadsheet-p">
				<sl-icon class="spreadsheet-icon" name="file-earmark-spreadsheet"></sl-icon>
				<a
					href="https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906"
					>Weights spreadsheet by
				</a>
				<e-discord-avatar size="40" username="nerdyjoe"></e-discord-avatar>
			</p>
			<section class="section-table">
				<h3>Weights Table</h3>
				<e-weights-table
					@show-cards-changed=${this.#onShowCardsChanged}
					class="section-table__table"
					ordered-by="weight"
					.showCards=${this.#showCardsStorage.load()}
					.rows=${this.rows}
				></e-weights-table>
			</section>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		${linkStyles}
		a:link {
			text-decoration: underline;
		}

		.heading {
			text-align: center;
			margin-bottom: 3rem;
		}

		.section-table {
			margin-top: 2rem;
		}

		.section-table__table {
			margin-top: 0.4rem;
		}

		.weights-spreadsheet-p {
			display: flex;
			align-items: center;
			gap: 0.4rem;
		}

		.spreadsheet-icon {
			color: var(--sl-color-green-700);
		}
	`;
}

// https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906
