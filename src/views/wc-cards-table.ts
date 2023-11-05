import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type CardSize } from '../elements/divination-card/wc-divination-card.ts';
import type { IPoeData } from '../data/poeData.types.ts';
import type { ISource } from '../data/ISource.interface.ts.ts';
import '../elements/divination-card/wc-divination-card.js';
import '../elements/act-area/wc-act-area.js';

declare global {
	interface HTMLElementTagNameMap {
		'wc-cards-table': CardsTableElement;
	}
}

@customElement('wc-cards-table')
export class CardsTableElement extends LitElement {
	@property({ type: Object }) poeData!: Readonly<IPoeData>;
	@property({ type: Object, attribute: false }) sourcesByCards: Record<string, ISource[]> = Object.create({});
	@property({ reflect: true }) cardSize: CardSize = 'small';
	@state() filtered: (typeof this)['sourcesByCards'] = {};
	@state() nameQuery: string = '';

	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		console.log('FIRST UPDATED');
	}

	protected willUpdate(changed: PropertyValueMap<this>): void {
		if (changed.has('nameQuery')) {
			console.log('CHANGED');
			const mapQuery = this.nameQuery.trim().toLowerCase();

			const filtered = Object.entries(this.sourcesByCards)
				.filter(([map]) => map.toLowerCase().includes(mapQuery.trim().toLowerCase()))
				.sort((a, b) => a[0].localeCompare(b[0]));
			this.filtered = Object.fromEntries(filtered);
		}
	}

	#onCardnameInput(e: InputEvent) {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		this.nameQuery = input.value;
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
			</header>
			${this.table()}
		`;
	}

	protected table() {
		const width = this.cardSize === 'small' ? '134px' : this.cardSize === 'medium' ? '268px' : '326px';
		return html`<table>
			<thead>
				<tr>
					<th style="width:${width}" scope="col">Cards</th>
					<th scope="col">Sources</th>
				</tr>
			</thead>
			<tbody>
				${Object.entries(this.filtered).map(
					([card, sources]) =>
						html`
							<tr>
								<td>
									<wc-divination-card size=${this.cardSize} name=${card}></wc-divination-card>
								</td>
								<td>
									<ul>
										${sources.map(
											source => html`<li>
												<wc-source-element
													.size=${this.cardSize}
													.poeData=${this.poeData}
													.source=${source}
												></wc-source-element>
											</li>`
										)}
									</ul>
								</td>
							</tr>
						`
				)}
			</tbody>
		</table> `;
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

		header {
			border-bottom: none;
		}
		table {
			table-layout: fixed;
			width: 100%;
			border-collapse: collapse;
		}

		tbody tr:nth-child(odd) {
			background-color: #222;
		}

		th {
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

		wc-divination-card {
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'wc-source-element': SourceElement;
	}
}

@customElement('wc-source-element')
export class SourceElement extends LitElement {
	@property({ type: Object }) poeData!: IPoeData;
	@property({ type: Object }) source!: ISource;
	@property() size: CardSize = 'small';

	render() {
		if (this.source.type === 'Act') {
			return this.actArea(this.source.id);
		}

		return this.fallback();
	}

	fallback() {
		return html`<pre
			style="font-size: 18px; text-align: left; box-shadow: rgba(100, 100, 111, 0.2) 0px 2px 10px 0px;"
		>
${JSON.stringify(this.source, null, 2)}</pre
		> `;
	}

	actArea(actId: string) {
		if (!this.poeData) {
			console.warn('no poeData');
		}
		return html`<wc-act-area
			.size=${this.size === 'medium' ? 'large' : this.size}
			.actId=${actId}
			.actsData=${this.poeData.acts}
		></wc-act-area>`;
	}
}
