import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { poeData } from '../PoeData';
import '../elements/weights-table/e-weights-table';

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
		return html`<h1 class="heading">Weights</h1>
			<e-weights-table ordered-by="weight" .rows=${this.#rows}></e-weights-table>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		.heading {
			text-align: center;
			margin-block: 2rem;
		}
	`;
}

// https://docs.google.com/spreadsheets/d/1PmGES_e1on6K7O5ghHuoorEjruAVb7dQ5m7PGrW7t80/edit#gid=272334906
