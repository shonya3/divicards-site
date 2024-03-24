import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '../divination-card/e-divination-card';
import '../e-source/e-source';
import '../e-need-to-verify';
import { classMap } from 'lit/directives/class-map.js';
import { Source } from '../../gen/Source';
import type { DivcordRecord } from '../../gen/divcord';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { styles } from './divcord-spreadsheet.styles';

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-spreadsheet': DivcordSpreadsheetElement;
	}
}

export interface DivcordRecordAndWeight extends DivcordRecord {
	weight: string;
}

@customElement('e-divcord-spreadsheet')
export class DivcordSpreadsheetElement extends LitElement {
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' }) showCards = true;
	@property({ type: Array }) records: DivcordRecordAndWeight[] = [];

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

		${styles}
	`;
}
