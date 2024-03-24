import { consume } from '@lit/context';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DivcordTable } from '../../DivcordTable';
import { divcordTableContext } from '../../context';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '../divination-card/e-divination-card';
import '../e-source/e-source';
import '../e-need-to-verify';
import { classMap } from 'lit/directives/class-map.js';
import { Source } from '../../gen/Source';
import type { DivcordRecord } from '../../gen/divcord';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { poeData } from '../../PoeData';

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-spreadsheet': DivcordSpreadsheetElement;
	}
}

interface DivcordRecordAndWeight extends DivcordRecord {
	weight: string;
}

@customElement('e-divcord-spreadsheet')
export class DivcordSpreadsheetElement extends LitElement {
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' }) showCards = true;
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() records: DivcordRecordAndWeight[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
			const weights: Record<string, number> = Object.fromEntries(
				Object.values(poeData.cards).map(({ name, weight }) => [name, weight])
			);

			this.records = this.divcordTable.records.map(record => {
				const weight = weights[record.card];
				const weightStr =
					weights[record.card] > 5
						? weight.toLocaleString('ru', { maximumFractionDigits: 0 })
						: weight.toLocaleString('ru', { maximumFractionDigits: 2 });

				return { ...record, weight: weightStr };
			});
		}
	}

	#onShowCardsToggled(e: Event) {
		const target = e.target;
		if (target && 'checked' in target && typeof target.checked === 'boolean') {
			this.showCards = target.checked;
			this.dispatchEvent(new Event('show-cards-changed'));
		}
	}

	/**  Put maps into distinct container without gaps */
	protected sourcesList(sources: Source[]): HTMLUListElement {
		const mapsSources = document.createElement('div');
		mapsSources.classList.add('sources-maps');
		const ul = document.createElement('ul');
		ul.classList.add('sources');
		for (const source of sources) {
			const sourceEl = Object.assign(document.createElement('e-source'), {
				renderMode: 'strict',
				source,
				size: 'small',
			});

			if (source.type === 'Map') {
				mapsSources.append(sourceEl);
			} else {
				ul.append(sourceEl);
			}
		}

		if (mapsSources.children.length > 0) {
			ul.append(mapsSources);
		}

		return ul;
	}

	protected render(): TemplateResult {
		return html`<div id="root">
			<table class="table">
				<thead class="thead">
					<tr class="thead__headings">
						<th class="th col-id">id</th>
						<th class="th col-card">Card</th>
						<th class="th col-weight">Weight</th>
						<th class="th col-tag">Tag</th>
						<th class="th col-confidence">Confidence</th>
						<th class="th col-remaining-work">Remaining Work</th>
						<th class="th col-sources">Verified sources</th>
						<th class="th col-verify">Need to verify</th>
						<!--<th class="th col-notes">Notes</th>-->
					</tr>
					<tr class="show-cards-row">
						<td class="td"></td>
						<td class="td show-cards-row__td">
							<div>
								<sl-checkbox .checked=${this.showCards} @sl-input=${this.#onShowCardsToggled}
									>Show cards</sl-checkbox
								>
							</div>
						</td>
						<td class="td"></td>
					</tr>
				</thead>
				<tbody class="tbody">
					${virtualize({
						items: this.records,
						renderItem: (record: DivcordRecordAndWeight): TemplateResult => {
							return this.TableRow(record);
						},
					})}
				</tbody>
			</table>
		</div>`;
	}

	protected TableRow(record: DivcordRecordAndWeight): TemplateResult {
		return html`<tr>
			<td class="td col-id">${record.id}</td>
			<td class="td col-card">
				${this.showCards
					? html` <e-divination-card size="small" name=${record.card}></e-divination-card> `
					: html`${record.card}`}
			</td>
			<td class="td td-weight col-weight">${record.weight}</td>
			<td class="td col-tag">${record.tagHypothesis}</td>
			<td
				class=${classMap({
					td: true,
					confidence: true,
					[`confidence--${record.confidence}`]: true,
					'col-confidence': true,
				})}
			>
				${record.confidence}
			</td>
			<td class="td col-remaining-work">${record.remainingWork}</td>
			<td class="td col-sources">
				<!--${(record.sources ?? []).map(source => {
					return html`<e-source .source=${source}></e-source>`;
				})}-->
				${this.sourcesList(record.sources ?? [])}
			</td>
			<td class="td col-verify">
				<!--${record.verifySources.map(source => {
					return html`<e-need-to-verify>
						<e-source size="small" .source=${source}></e-source>
					</e-need-to-verify>`;
				})}-->
				${this.sourcesList(record.verifySources)}
			</td>
			<!--<td class="td td-notes">${record.notes}</td>-->
		</tr>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		#root {
			height: calc(100vh - 100px);
			overflow-y: scroll;
			width: fit-content;
			padding: 2rem;
		}

		${tableStyles()}
	`;
}

export function tableStyles() {
	return css`
		.table {
			border-collapse: collapse;
			border: 1px solid rgba(140, 140, 140, 0.3);
			table-layout: fixed;
			width: 1250px;
			font-size: 14px;
			position: relative;
		}

		.tbody {
			width: 1450px;
			display: table-row-group;
			transform: translateX(-1px);
		}

		.thead__headings {
			position: sticky;
			top: -40px;
			background-color: black;
			z-index: 9999;
		}

		.col-id.td {
			border-left: none;
		}

		.col-verify.td {
			border-right: none;
		}

		.col-id {
			width: 50px;
		}
		.col-card {
			width: 200px;
		}
		.col-weight {
			width: 100px;
		}
		.col-tag {
			word-break: break-word;
			width: 200px;
		}
		.col-confidence {
			width: 100px;
		}
		.col-remaining-work {
			width: 100px;
		}
		.col-sources {
			width: 400px;
		}
		.col-verify {
			width: 300px;
		}

		.sources {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin-top: 0.25rem;
			column-gap: 0.5rem;
		}

		.sources-maps {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.confidence {
			position: relative;
			text-transform: uppercase;
			font-size: 13px;
		}

		.confidence--done {
			background-color: green;
		}
		.confidence--ok {
			background-color: #93c47d;
			color: black;
		}
		.confidence--none {
			background-color: red;
		}
		.confidence--low {
			background-color: #f1c232;
			color: black;
		}

		.th {
			font-size: 14px;
		}

		.th,
		.td {
			padding: 0.4rem;
			border: 1px solid rgba(160, 160, 160, 0.2);
			text-align: center;
		}

		.header-with-icon {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.4rem;
		}

		.td-notes {
			text-align: left;
		}

		.td-weight {
			font-weight: 700;
			font-size: 20px;
		}

		.ordered-by {
			color: yellow;
		}

		@media (width < 25rem) {
			.th,
			.td {
				padding: 0.4rem;
			}
		}
	`;
}
