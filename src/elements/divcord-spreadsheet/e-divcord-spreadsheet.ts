import { linkStyles } from './../../linkStyles';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '../divination-card/e-divination-card';
import '../e-source/e-source';
import '../e-need-to-verify';
import { classMap } from 'lit/directives/class-map.js';
import type { DivcordRecord } from '../../gen/divcord';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { styles } from './divcord-spreadsheet.styles';
import { Sort, type SortColumn, type Order } from './Sort';
import { DirectiveResult } from 'lit/async-directive.js';
import { UnsafeHTMLDirective, unsafeHTML } from 'lit/directives/unsafe-html.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '../e-sources';
import { WeightData } from '../weights-table/types';
import '../../elements/weights-table/e-weight-value';
import { slug } from '../../gen/divcordWasm/divcord_wasm';
import { NavigateTransitionEvent } from '../../events';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * Adaptation of the Divcord google spreadsheet https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1&gid=0#gid=0
 * @csspart active_divination_card
 */
@customElement('e-divcord-spreadsheet')
export class DivcordSpreadsheetElement extends LitElement {
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' }) showCards = true;
	@property({ type: Array }) records: DivcordRecordAndWeight[] = [];
	@property({ reflect: true }) active_divination_card?: string;

	// Sort
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'card-order' }) cardOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'id-order' }) idOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'verify-order' }) verifyOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'ordered-by' }) orderedBy: SortColumn = 'id';

	@state() private recordsState: DivcordRecordAndWeight[] = [];
	@state() private weightIcon = 'sort-down';
	@state() private nameIcon = 'sort-alpha-down-alt';
	@state() private idIcon = 'sort-alpha-down-alt';
	@state() private verifyIcon = 'sort-down';

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('records')) {
			this.recordsState = structuredClone(this.records);
		}

		if (map.has('weightOrder')) {
			if (this.orderedBy === 'weight') {
				this.weightIcon = this.weightOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byWeight(this.recordsState, this.weightOrder);
			}
		}

		if (map.has('cardOrder')) {
			if (this.orderedBy === 'card') {
				this.nameIcon = this.cardOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byCard(this.recordsState, this.cardOrder);
			}
		}

		if (map.has('idOrder')) {
			if (this.orderedBy === 'id') {
				this.idIcon = this.idOrder === 'desc' ? 'sort-alpha-down-alt' : 'sort-alpha-down';
				Sort.byId(this.recordsState, this.idOrder);
			}
		}

		if (map.has('verifyOrder')) {
			if (this.orderedBy === 'verify') {
				this.verifyIcon = this.verifyOrder === 'desc' ? 'sort-down' : 'sort-up';
				Sort.byVerify(this.recordsState, this.verifyOrder);
			}
		}

		if (
			!map.has('weightOrder') &&
			!map.has('verifyOrder') &&
			!map.has('idOrder') &&
			!map.has('cardOrder') &&
			map.has('records')
		) {
			Sort.by(this.orderedBy, this.recordsState, this[`${this.orderedBy}Order`]);
		}
	}

	#onShowCardsToggled(e: Event) {
		const target = e.target;
		if (target && 'checked' in target && typeof target.checked === 'boolean') {
			this.showCards = target.checked;
			this.dispatchEvent(new Event('show-cards-changed'));
		}
	}

	#toggleSetOrder(column: SortColumn) {
		this[`${column}Order`] = this[`${column}Order`] === 'asc' ? 'desc' : 'asc';
		this.orderedBy = column;
	}

	#onAnchorCardNavigation(e: Event, card: string) {
		const target = e.composedPath()[0];
		if (target instanceof HTMLAnchorElement) {
			target.style.setProperty('view-transition-name', 'card');

			this.dispatchEvent(new NavigateTransitionEvent('card', slug(card)));
		}
	}

	protected render(): TemplateResult {
		return html`<div id="root">
			<table class="table">
				<thead class="thead">
					<tr class="thead__headings">
						<th class="th col-id">
							<div class="header-with-icon">
								id
								<sl-icon
									class=${classMap({ 'ordered-by': this.orderedBy === 'id' })}
									@click=${this.#toggleSetOrder.bind(this, 'id')}
									.name=${this.idIcon}
								></sl-icon>
							</div>
						</th>
						<th class="th col-card">
							<div class="header-with-icon">
								Card
								<sl-icon
									class=${classMap({ 'ordered-by': this.orderedBy === 'card' })}
									@click=${this.#toggleSetOrder.bind(this, 'card')}
									.name=${this.nameIcon}
								></sl-icon>
							</div>
						</th>
						<th class="th col-weight">
							<div class="header-with-icon">
								Weight
								<sl-icon
									class=${classMap({ 'ordered-by': this.orderedBy === 'weight' })}
									@click=${this.#toggleSetOrder.bind(this, 'weight')}
									.name=${this.weightIcon}
								></sl-icon>
							</div>
						</th>
						<th class="th col-tag">Tag</th>
						<th class="th col-confidence">Confidence</th>
						<th class="th col-remaining-work">Remaining Work</th>
						<th class="th col-sources">Verified sources</th>
						<th class="th col-verify">
							<div class="header-with-icon">
								Need to verify
								<sl-icon
									class=${classMap({ 'ordered-by': this.orderedBy === 'verify' })}
									@click=${this.#toggleSetOrder.bind(this, 'verify')}
									.name=${this.verifyIcon}
								></sl-icon>
							</div>
						</th>
						<th class="th col-notes">Notes</th>
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
						items: this.recordsState,
						renderItem: (record: DivcordRecordAndWeight): TemplateResult => {
							return html`<tr>
								<td class="td col-id">
									<a target="_blank" href=${divcordRecordHref(record.id)}>${record.id}</a>
								</td>
								<td class="td col-card">
									${this.showCards
										? html`
												<e-divination-card
													part=${ifDefined(
														this.active_divination_card === slug(record.card)
															? 'active_divination_card'
															: undefined
													)}
													size="small"
													name=${record.card}
												></e-divination-card>
										  `
										: html`<a
												part=${ifDefined(
													this.active_divination_card === slug(record.card)
														? 'active_divination_card'
														: undefined
												)}
												@click=${(e: Event) => this.#onAnchorCardNavigation(e, record.card)}
												href="/card/${slug(record.card)}"
										  >
												${record.card}
										  </a>`}
								</td>
								<td class="td td-weight col-weight">
									<e-weight-value .weightData=${record.weightData}></e-weight-value>
								</td>
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
								<td
									class=${classMap({
										td: true,
										'col-remaining-work': true,
										'remaining-work--story': record.remainingWork === 'story',
										'remaining-work--reverify': record.remainingWork === 'reverify',
										'remaining-work--confirm': record.remainingWork === 'confirm',
									})}
								>
									${record.remainingWork}
								</td>
								<td class="td col-sources">
									<e-sources
										.sources=${record.sources}
										size="small"
										render-mode="compact"
										verification-status="done"
									></e-sources>
								</td>
								<td class="td col-verify">
									<e-sources
										.sources=${record.verifySources}
										size="small"
										render-mode="compact"
										verification-status="verify"
									></e-sources>
								</td>
								<td class="td col-notes">${formattedNotes(record)}</td>
							</tr>`;
						},
					})}
				</tbody>
			</table>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		${linkStyles}

		:host {
			width: fit-content;
			display: block;
		}

		${styles}
	`;
}

function formattedNotes(record: DivcordRecord): DirectiveResult<typeof UnsafeHTMLDirective> {
	const text = record.notes?.replaceAll('\n', '<br>');
	return unsafeHTML(text);
}

function divcordRecordHref(id: DivcordRecord['id']) {
	return `https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0&range=B${id}`;
}

export interface DivcordRecordAndWeight extends DivcordRecord {
	weightData: WeightData;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-spreadsheet': DivcordSpreadsheetElement;
	}
}
