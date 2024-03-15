import { linkStyles } from './../linkStyles';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { poeData } from '../PoeData';
import '../elements/weights-table/e-weights-table';
import '../elements/e-discord-avatar';

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
				<a
					href="https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906"
					>Weights spreadsheet by
				</a>
				<e-discord-avatar size="40" username="nerdyjoe"></e-discord-avatar>
			</p>
			<e-weights-table ordered-by="weight" .rows=${this.#rows}></e-weights-table>
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
			margin-block: 2rem;
		}

		.weights-spreadsheet-p {
			display: flex;
			align-items: center;
			gap: 0.4rem;
		}

		.page {
			padding: 2rem;
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
