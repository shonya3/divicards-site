import { linkStyles } from './../linkStyles';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { poeData } from '../PoeData';
import '../elements/weights-table/e-weights-table';
import '../elements/e-discord-avatar';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-weights': WeightsPage;
	}
}

@customElement('p-weights')
export class WeightsPage extends LitElement {
	#rows = Object.values(poeData.cards).map(({ name, weight }) => ({ name, weight }));

	constructor() {
		super();
		this.#rows.sort((a, b) => b.weight - a.weight);
	}

	protected render() {
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
				<h2>Weights Table</h2>
				<e-weights-table class="section-table__table" ordered-by="weight" .rows=${this.#rows}></e-weights-table>
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

		.page {
			padding: 2rem;
			padding-top: 1rem;
			padding-bottom: 0rem;
		}

		@media (width <=600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}
	`;
}

// https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906
