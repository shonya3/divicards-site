import { linkStyles } from './../../linkStyles';
import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
import { Sort, type SortColumn, type Order } from './Sort';
import { DirectiveResult } from 'lit/async-directive.js';
import { UnsafeHTMLDirective, unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { VerificationStatus } from '../../cards';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-spreadsheet': DivcordSpreadsheetElement;
	}
}

export interface DivcordRecordAndWeight extends DivcordRecord {
	weight: number;
}

@customElement('e-divcord-spreadsheet')
export class DivcordSpreadsheetElement extends LitElement {
	@property({ type: Boolean, reflect: true, attribute: 'show-cards' }) showCards = true;
	@property({ type: Array }) records: DivcordRecordAndWeight[] = [];

	// Sort
	@property({ reflect: true, attribute: 'weight-order' }) weightOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'card-order' }) cardOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'id-order' }) idOrder: Order = 'asc';
	@property({ reflect: true, attribute: 'verify-order' }) verifyOrder: Order = 'desc';
	@property({ reflect: true, attribute: 'ordered-by' })
	orderedBy: SortColumn = 'id';

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

	/**  Put maps into distinct container without gaps */
	protected sourcesList(sources: Source[], verificationStatus: VerificationStatus): HTMLUListElement {
		const mapsSources = document.createElement('div');
		mapsSources.classList.add('sources-maps');
		const ul = document.createElement('ul');
		ul.classList.add('sources');
		for (const source of sources) {
			{
				let sourceEl: HTMLElement = Object.assign(document.createElement('e-source'), {
					renderMode: 'strict',
					source,
					size: 'small',
				});

				if (verificationStatus === 'verify') {
					const verifyEl = document.createElement('e-need-to-verify');
					verifyEl.append(sourceEl);
					sourceEl = verifyEl;
				}

				if (source.type === 'Map') {
					mapsSources.append(sourceEl);
				} else {
					ul.append(sourceEl);
				}
			}
		}

		if (mapsSources.children.length > 0) {
			ul.append(mapsSources);
		}

		return ul;
	}

	#onAnchorCardNavigation(e: Event) {
		const target = e.composedPath()[0];
		if (target instanceof HTMLAnchorElement) {
			target.style.setProperty('view-transition-name', 'card');
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
							const weightStr =
								record.weight > 5
									? record.weight.toLocaleString('ru', { maximumFractionDigits: 0 })
									: record.weight.toLocaleString('ru', { maximumFractionDigits: 2 });

							return html`<tr>
								<td class="td col-id"><a href=${divcordRecordHref(record.id)}>${record.id}</a></td>
								<td class="td col-card">
									${this.showCards
										? html`
												<e-divination-card size="small" name=${record.card}></e-divination-card>
										  `
										: html`<a @click=${this.#onAnchorCardNavigation} href="/card/${record.card}">
												${record.card}
										  </a>`}
								</td>
								<td class="td td-weight col-weight">${weightStr}</td>
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
								<td class="td col-sources">${this.sourcesList(record.sources ?? [], 'done')}</td>
								<td class="td col-verify">${this.sourcesList(record.verifySources, 'verify')}</td>
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
