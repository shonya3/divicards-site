import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/wc-divination-card.ts';
import type { ISource } from '../data/ISource.interface.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/wc-act-area.js';
import '../elements/wc-source.js';
import '../elements/wc-page-controls.ts';
import './wc-cards-list.ts';
import { PoeData } from '../PoeData.ts';

declare global {
	interface HTMLElementTagNameMap {
		'wc-cards-table': CardsTableElement;
	}
}

const paginate = <T>(arr: T[], page: number, perPage: number) => {
	const start = (page - 1) * perPage;
	const end = start + perPage;
	return arr.slice(start, end);
};

@customElement('wc-cards-table')
export class CardsTableElement extends LitElement {
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) cardSize: CardSize = 'medium';
	@property({ type: Object }) poeData!: Readonly<PoeData>;
	@property({ type: Object, attribute: false }) sourcesByCards!: Readonly<Record<string, ISource[]>>;
	@property({ reflect: true }) filter: string = '';

	protected willUpdate(_changedProperties: PropertyValueMap<this>): void {
		if (_changedProperties.has('filter')) {
			const url = new URL(window.location.href);

			url.searchParams.set('filter', this.filter);
			window.history.pushState({}, '', url);
		}
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.page = 1;

		this.filter = input.value;
	}

	#oncardSizeSelect(e: InputEvent) {
		if (e.target instanceof HTMLSelectElement) {
			const value = e.target.value;
			if (['small', 'medium', 'large'].some(size => size === value)) {
				this.cardSize = value as CardSize;
			}
		}
	}

	protected render() {
		return html`
			<header>
				<form>
					<fieldset>
						<legend>Find card</legend>
						<div>
							<label for="input-cardname">Input card name</label>
							<input @input="${this.#onCardnameInput}" type="text" id="input-cardname" />
						</div>
					</fieldset>
					<fieldset>
						<legend>card size</legend>
						<div>
							<select @input=${this.#oncardSizeSelect} .value=${this.cardSize} name="" id="">
								<option value="small">small</option>
								<option value="medium">medium</option>
								<option value="large">large</option>
							</select>
						</div>
					</fieldset>
				</form>
				<wc-page-controls page=${this.page} per-page=${this.perPage}></wc-page-controls>
			</header>
			<wc-cards-list
				.filter=${this.filter}
				.sourcesByCards=${this.sourcesByCards}
				.poeData=${this.poeData}
				.page=${this.page}
				.perPage=${this.perPage}
				.cardSize=${this.cardSize}
			></wc-cards-list>
		`;
	}

	static styles = css`
		:host {
			--card-width-small: 134px;
			--card-width-medium: 268px;
			--card-width-large: 326px;
			font-size: 1.5rem;
		}

		form {
			width: fit-content;
			margin: auto;
		}

		legend {
			padding: initial;
			margin: initial;
		}

		header {
			border-bottom: none;
		}
		table {
			min-width: 100%;
			table-layout: fixed;
			border-collapse: collapse;
		}

		tbody tr:nth-child(odd) {
			background-color: #222;
		}

		th {
			font-size: 20px;
			padding: 1rem;
		}

		th:first-child {
			width: 356px;
		}

		td {
			text-align: center;
		}

		li {
			list-style: none;
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: 1.5rem;
		}
	`;
}
