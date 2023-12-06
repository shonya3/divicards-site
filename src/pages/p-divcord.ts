import { LitElement, PropertyValueMap, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import {
	IConfidence,
	IGreynote,
	IRemainingWork,
	SourcefulDivcordTable,
	confidenceVariants,
	greynoteVariants,
	remainingWorkVariants,
} from '../data/SourcefulDivcordTableRecord';
import { divcordTableContext } from '../context';

import '../elements/e-card-with-divcord-records';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { type DivcordServiceState, divcordService } from '../DivcordService';
import { SlConverter, paginate } from '../utils';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord': DivcordTablePage;
	}
}

export function someCardRecordHasConfidenceVariant(
	card: string,
	confidenceVariants: IConfidence[],
	divcordTable: SourcefulDivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => confidenceVariants.includes(record.confidence));
}

export function someCardRecordHasRemainingWorkVariant(
	card: string,
	remainingWorkVariants: Array<IRemainingWork | 'n/a'>,
	divcordTable: SourcefulDivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => remainingWorkVariants.includes(record.remainingWork));
}

export function someCardRecordHasGreynoteWorkVariant(
	card: string,
	greynoteVariants: Array<IGreynote | 'n/a'>,
	divcordTable: SourcefulDivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => greynoteVariants.includes(record.greynote));
}

export type FiltersPreset = (typeof filtersPresetVariants)[number];

export const filtersPresetVariants = ['Show All', 'Divcord Preset', 'not specified'] as const;
export function assertFiltersPreset(s: string): s is FiltersPreset {
	return filtersPresetVariants.some(v => s === v);
}

@customElement('p-divcord')
export class DivcordTablePage extends LitElement {
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) applySelectFilters = true;

	@property({ type: Array }) activeConfidences: IConfidence[] = [...confidenceVariants];
	@property({ type: Array }) activeRemainingWorks: Array<IRemainingWork> = [...remainingWorkVariants];
	@property({ type: Array }) activeGreynoteVariants: Array<IGreynote> = [...greynoteVariants];

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: SourcefulDivcordTable;

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	#onRecordsUpdated() {
		this.ageEl.lastUpdated.run();
	}

	@state() filtered: string[] = [];

	protected willUpdate(map: PropertyValueMap<this>): void {
		const keys: unknown[] = [
			'activeConfidences',
			'activeRemainingWorks',
			'activeGreynoteVariants',
			'filter',
			'divcordTable',
			'applySelectFilters',
		];
		if (Array.from(map.keys()).some(k => keys.includes(k))) {
			this.filtered = this.applyFilters();
		}
	}

	applyFilters() {
		const filter = this.filter.trim().toLowerCase();

		return this.divcordTable.cards().filter(card => {
			const filteredByName = card.toLowerCase().includes(filter);
			switch (this.applySelectFilters) {
				case false: {
					return filteredByName;
				}
				case true: {
					return (
						filteredByName &&
						someCardRecordHasConfidenceVariant(card, this.activeConfidences, this.divcordTable) &&
						someCardRecordHasGreynoteWorkVariant(card, this.activeGreynoteVariants, this.divcordTable) &&
						someCardRecordHasRemainingWorkVariant(card, this.activeRemainingWorks, this.divcordTable)
					);
				}
			}
		});
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	#onGreynotesSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<IGreynote>(opt));
		this.activeGreynoteVariants = options;
	}
	#onRemainingWorkSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<IRemainingWork>(opt));
		this.activeRemainingWorks = options;
	}
	#onConfidenceSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<IConfidence>(opt));
		this.activeConfidences = options;
	}

	#onApplySelectFiltersCheckbox(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.applySelectFilters = target.checked;
		}
	}

	#setFiltersBasedOnPreset(preset: FiltersPreset) {
		switch (preset) {
			case 'Show All': {
				this.activeGreynoteVariants = [...greynoteVariants];
				this.activeConfidences = [...confidenceVariants];
				this.activeRemainingWorks = [...remainingWorkVariants];
				break;
			}

			case 'Divcord Preset': {
				this.activeGreynoteVariants = [
					'Empty',
					'Area-specific',
					'Chest_object',
					'disabled',
					'Monster-specific',
				];
				this.activeConfidences = ['low', 'none', 'ok'];
				this.activeRemainingWorks = [...remainingWorkVariants];

				break;
			}
			case 'not specified': {
				break;
			}
		}
	}

	render() {
		return html`<div class="page">
			<header>
				<div class="load">
					<div class="load_btn-and-status">
						<e-update-divcord-data @records-updated=${this.#onRecordsUpdated}></e-update-divcord-data>
						<e-divcord-records-age> </e-divcord-records-age>
					</div>
					<sl-alert class="load_tip" open>
						<sl-icon slot="icon" name="info-circle"></sl-icon>
						<p>You don't have to load manually, it loads and caches if older than 24h, but you can.</p>
					</sl-alert>
				</div>

				<section class="select-filters-section">
					<div class="apply-select-filters-control">
						<sl-checkbox .checked=${this.applySelectFilters} @sl-input=${this.#onApplySelectFiltersCheckbox}
							>Apply filters</sl-checkbox
						>
					</div>
					${this.applySelectFilters
						? html`<div class="select-filters">
								<div class="select-filters_presets">
									<h3>Presets</h3>

									<sl-button @click=${this.#setFiltersBasedOnPreset.bind(this, 'Show All')}
										>Show All</sl-button
									>
									<sl-button @click=${this.#setFiltersBasedOnPreset.bind(this, 'Divcord Preset')}
										>Divcord Preset</sl-button
									>
								</div>

								<div class="select-filters_filters">
									<sl-select
										label="Greynote"
										.value=${this.activeGreynoteVariants.map(c => SlConverter.toSlValue(c))}
										@sl-change=${this.#onGreynotesSelectChange}
										multiple
										clearable
									>
										${Array.from(greynoteVariants).map(variant => {
											return html` <sl-option value=${SlConverter.toSlValue(variant)}
												>${variant}</sl-option
											>`;
										})}
									</sl-select>
									<sl-select
										label="Confidence"
										.value=${this.activeConfidences.map(c => SlConverter.toSlValue(c))}
										@sl-change=${this.#onConfidenceSelectChange}
										multiple
										clearable
									>
										${Array.from(confidenceVariants).map(variant => {
											return html` <sl-option value=${SlConverter.toSlValue(variant)}
												>${variant}</sl-option
											>`;
										})}
									</sl-select>

									<sl-select
										.value=${this.activeRemainingWorks.map(c => SlConverter.toSlValue(c))}
										@sl-change=${this.#onRemainingWorkSelectChange}
										label="Remaining Work"
										multiple
										clearable
									>
										${Array.from(remainingWorkVariants).map(variant => {
											return html` <sl-option value=${SlConverter.toSlValue(variant)}
												>${variant}</sl-option
											>`;
										})}
									</sl-select>
								</div>
						  </div>`
						: nothing}
				</section>

				<section class="search-and-navigation">
					<e-input
						label="Enter card name"
						.datalistItems=${this.divcordTable.cards()}
						@input="${this.#onCardnameInput}"
						type="text"
					>
					</e-input>
					<e-page-controls
						.n=${this.filtered.length}
						page=${this.page}
						per-page=${this.perPage}
					></e-page-controls>
				</section>
			</header>
			<ul>
				${this.paginated.map(card => {
					return html`<e-card-with-divcord-records
						.card=${card}
						.records=${this.divcordTable.recordsByCard(card)}
					></e-card-with-divcord-records>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			font-family: 'Geist';
		}

		.page {
			padding: 2rem;
			font-size: 14px;
		}

		.load_btn-and-status {
			display: flex;
			align-items: center;
			padding: 1rem;
			gap: 1rem;
		}

		.load_tip {
			display: block;
			max-width: 450px;
		}

		.search-and-navigation {
			margin-top: 4rem;
		}

		.select-filters-section {
			margin-top: 2rem;
			display: grid;
			gap: 1rem;
		}

		.select-filters_filters {
			display: flex;
			flex-wrap: wrap;
		}

		.select-filters {
			display: grid;
			gap: 1rem;
		}

		.select-filters_filters > * {
			min-width: 400px;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			e-card-with-divcord-records::part(card) {
				width: fit-content;
				margin-inline: auto;
			}
		}

		ul {
			display: flex;
			flex-direction: column;
			gap: 3rem;
			margin-top: 2rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-relative-time': RelativeTimeElement;
	}
}

@customElement('e-relative-time')
export class RelativeTimeElement extends LitElement {
	#fmt = new Intl.RelativeTimeFormat('en');

	@property({ type: Object }) date!: Date;
	@property() unit?: 'seconds' | 'minutes';

	minutes() {
		return (Date.now() - this.date.getTime()) / 60 / 1000;
	}

	seconds() {
		return Math.floor((Date.now() - this.date.getTime()) / 1000);
	}

	minutesRelativeString() {
		const minutes = this.minutes();
		if (minutes >= 1) {
			return this.#fmt.format(-1 * Math.floor(minutes), 'minutes');
		} else {
			return minutes < 0.2 ? 'now' : 'less than minute ago';
		}
	}

	secondsRelativeString() {
		const seconds = this.seconds();
		if (seconds >= 1) {
			return this.#fmt.format(-1 * seconds, 'seconds');
		} else {
			return 'now';
		}
	}

	connectedCallback(): void {
		super.connectedCallback();
		setInterval(() => {
			this.requestUpdate();
		}, 1000);
	}

	render() {
		if (this.unit === 'seconds') {
			return this.secondsRelativeString();
		}

		return this.minutesRelativeString();
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		:host {
			display: inline;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-divcord-records-age': DivcordRecordsAgeElement;
	}
}

@customElement('e-divcord-records-age')
export class DivcordRecordsAgeElement extends LitElement {
	@property({ type: Object }) date?: Date;

	constructor() {
		super();
		divcordService.addEventListener('state-updated', () => {
			if (divcordService.state === 'updated') {
				this.lastUpdated.run();
			}
		});
	}

	lastUpdated = new Task(this, {
		async task() {
			return await divcordService.cacheDate();
		},
		args: () => [],
	});

	render() {
		return this.lastUpdated.render({
			complete: date => {
				if (date === null) {
					return nothing;
				}

				return html`<p>Last updated: <e-relative-time .date=${date}></e-relative-time> <slot></slot></p> `;
			},
		});
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'e-update-divcord-data': UpdateDivcordDataElement;
	}
}

@customElement('e-update-divcord-data')
export class UpdateDivcordDataElement extends LitElement {
	@state() loaderState!: DivcordServiceState;

	constructor() {
		super();
		this.loaderState = divcordService.state;
		divcordService.addEventListener('state-updated', () => {
			this.loaderState = divcordService.state;
		});
	}

	task = new Task<never, void>(this, {
		task: async () => {
			const records = await divcordService.update();
			const event = new CustomEvent('records-updated', { detail: records, bubbles: true, composed: true });
			this.dispatchEvent(event);
		},
	});

	protected loadBtn() {
		return html`<sl-button .loading=${this.loaderState === 'updating'} @click=${this.task.run.bind(this.task)}>
			<p class="reload">Load divcord data</p>
		</sl-button>`;
	}

	render() {
		const t = this.task.render({
			initial: () => this.loadBtn(),
			pending: () => html`<sl-button class="sl-theme-dark" loading>Loading</sl-button>`,
			complete: () => {
				const btn = this.loadBtn();
				return btn;
			},
		});

		return t;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		sl-button {
			font: inherit;
			font-family: 'geist';
		}

		sl-button::part(button) {
			display: none;
		}

		.reload {
			font-family: 'geist';
		}
	`;
}
