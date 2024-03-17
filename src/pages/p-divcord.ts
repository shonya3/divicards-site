import { LitElement, PropertyValueMap, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import { consume } from '@lit/context';
import { DivcordTable } from '../DivcordTable';
import { divcordTableContext } from '../context';
import '../elements/e-card-with-divcord-records';
import '../elements/e-page-controls';
import '../elements/input/e-input';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { type State as DivcordLoaderState, divcordLoader } from '../DivcordLoader';
import { ArrayAsyncRenderer, SlConverter, paginate } from '../utils';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { Storage } from '../storage';
import { classMap } from 'lit/directives/class-map.js';
import { toast } from '../toast';
import { searchCardsByQuery, SEARCH_CRITERIA_VARIANTS } from '../searchCardsByQuery';
import {
	Confidence,
	RemainingWork,
	Greynote,
	GREYNOTE_VARIANTS,
	CONFIDENCE_VARIANTS,
	REMAINING_WORK_VARIANTS,
} from '../gen/divcord';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord': DivcordPage;
	}
}

export function someCardRecordHasConfidenceVariant(
	card: string,
	confidenceVariants: Confidence[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => confidenceVariants.includes(record.confidence));
}

export function someCardRecordHasRemainingWorkVariant(
	card: string,
	remainingWorkVariants: RemainingWork[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => remainingWorkVariants.includes(record.remainingWork));
}

export function someCardRecordHasGreynoteWorkVariant(
	card: string,
	greynoteVariants: Greynote[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => greynoteVariants.includes(record.greynote));
}

export type PresetConfig = {
	name: string;
	greynote: Greynote[];
	confidence: Confidence[];
	remainingWork: RemainingWork[];
};

const DEFAULT_PRESETS: PresetConfig[] = [
	{
		name: 'Show All',
		greynote: Array.from(GREYNOTE_VARIANTS),
		confidence: Array.from(CONFIDENCE_VARIANTS),
		remainingWork: Array.from(REMAINING_WORK_VARIANTS),
	},
	{
		name: 'Divcord Preset',
		greynote: ['Empty', 'Area-specific', 'Chest_object', 'disabled', 'Monster-specific'],
		confidence: ['low', 'none', 'ok'],
		remainingWork: Array.from(REMAINING_WORK_VARIANTS),
	},
];

declare module '../storage' {
	interface Registry {
		presets: PresetConfig[];
		shouldApplyFilters: boolean;
		latestPresetApplied: string;
		onlyShowCardsWithNoConfirmedSources: boolean;
		onlyShowCardsWithSourcesToVerify: boolean;
	}
}

@customElement('p-divcord')
export class DivcordPage extends LitElement {
	#storage = {
		presets: new Storage('presets', []),
		shouldApplyFilters: new Storage('shouldApplyFilters', true),
		latestPresetApplied: new Storage('latestPresetApplied', ''),
		onlyShowCardsWithNoConfirmedSources: new Storage('onlyShowCardsWithNoConfirmedSources', false),
		onlyShowCardsWithSourcesToVerify: new Storage('onlyShowCardsWithSourcesToVerify', false),
	};
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) shouldApplySelectFilters = this.#storage.shouldApplyFilters.load();
	@property({ type: Boolean }) onlyShowCardsWithNoConfirmedSources: boolean =
		this.#storage.onlyShowCardsWithNoConfirmedSources.load();
	@property({ type: Boolean }) onlyShowCardsWithSourcesToVerify: boolean =
		this.#storage.onlyShowCardsWithSourcesToVerify.load();

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() filtered: string[] = [];
	@state() paginated: string[] = [];
	@state() paginatedCardsRenderer!: ArrayAsyncRenderer<string>;

	@state() config: Omit<PresetConfig, 'name'> = DEFAULT_PRESETS[0];
	@state() presets: PresetConfig[] = [...DEFAULT_PRESETS];
	@state() customPresets: PresetConfig[] = this.#storage.presets.load() ?? [];
	@state() presetActionState: 'adding' | 'deleting' | 'idle' = 'idle';
	@state() presetsForDelete: Set<string> = new Set();

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener('keydown', this.#onKeydown.bind(this));
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.#onKeydown.bind(this));
	}

	#onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			this.presetActionState = 'idle';
		}
	}

	#onPresetChecked(e: Event) {
		const target = e.target as EventTarget & { checked: boolean; value: string };
		const name = target.value;
		const checked = target.checked;
		checked ? this.presetsForDelete.add(name) : this.presetsForDelete.delete(name);
		this.presetsForDelete = new Set(this.presetsForDelete);
	}

	#onRecordsUpdated() {
		this.ageEl.lastUpdated.run();
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('shouldApplySelectFilters')) {
			this.#storage.shouldApplyFilters.save(this.shouldApplySelectFilters);
		}

		if (map.has('shouldApplySelectFilters')) {
			if (this.shouldApplySelectFilters) {
				const latestAppliedPresetName = this.#storage.latestPresetApplied.load() ?? '';
				const preset = this.findPreset(latestAppliedPresetName);
				if (preset) {
					this.#applyPreset(preset);
				}
			}
		}

		if (map.has('customPresets')) {
			this.#storage.presets.save(this.customPresets);
		}

		const keys: PropertyKey[] = [
			'config',
			'filter',
			'divcordTable',
			'shouldApplySelectFilters',
			'onlyShowCardsWithNoConfirmedSources',
			'onlyShowCardsWithSourcesToVerify',
			'page',
			'perPage',
		];
		if (Array.from(map.keys()).some(k => keys.includes(k))) {
			this.filtered = this.createFilteredCards();
			this.paginated = paginate(this.filtered, this.page, this.perPage);
			this.paginatedCardsRenderer = new ArrayAsyncRenderer(this.paginated);
		}
	}

	findPreset(name: string): PresetConfig | null {
		return [...this.presets, ...this.customPresets].find(p => p.name === name) ?? null;
	}

	createFilteredCards(): string[] {
		const query = this.filter.trim().toLowerCase();

		const cardsByQuery = searchCardsByQuery(query, Array.from(SEARCH_CRITERIA_VARIANTS), this.divcordTable);

		return cardsByQuery
			.filter(card => {
				if (this.shouldApplySelectFilters && this.onlyShowCardsWithSourcesToVerify) {
					const records = this.divcordTable.recordsByCard(card);
					return records.some(r => r.verifySources.length > 0);
				} else {
					return true;
				}
			})
			.filter(card => {
				if (this.shouldApplySelectFilters && this.onlyShowCardsWithNoConfirmedSources) {
					const records = this.divcordTable.recordsByCard(card);
					const allRecordsHasNoSources = records.every(s => (s.sources ?? []).length === 0);
					return allRecordsHasNoSources;
				} else {
					return true;
				}
			})
			.filter(card => {
				if (this.shouldApplySelectFilters) {
					return (
						someCardRecordHasConfidenceVariant(card, this.config.confidence, this.divcordTable) &&
						someCardRecordHasGreynoteWorkVariant(card, this.config.greynote, this.divcordTable) &&
						someCardRecordHasRemainingWorkVariant(card, this.config.remainingWork, this.divcordTable)
					);
				} else {
					return true;
				}
			});
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	#onGreynotesSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<Greynote>(opt));
		this.config = { ...this.config, greynote: options };
	}
	#onRemainingWorkSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<RemainingWork>(opt));
		this.config = { ...this.config, remainingWork: options };
	}
	#onConfidenceSelectChange(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<Confidence>(opt));
		this.config = { ...this.config, confidence: options };
	}

	#onshouldApplySelectFiltersCheckbox(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.shouldApplySelectFilters = target.checked;
		}
	}

	#onPlusPresetClicked() {
		this.presetActionState = 'adding';
	}

	#onDeleteModeActivate() {
		this.presetActionState = 'deleting';
	}

	#onCancelClicked() {
		this.presetActionState = 'idle';
	}

	protected async updated(map: PropertyValueMap<this>): Promise<void> {
		if (map.has('presetActionState')) {
			if (this.presetActionState === 'adding') {
				await this.updateComplete;
				this.inputNewPresetNameEl.focus();
			}
		}
	}

	@query('#input-new-preset-name') inputNewPresetNameEl!: HTMLInputElement;
	#onSubmitNewPreset(e: SubmitEvent) {
		e.preventDefault();
		const name = this.inputNewPresetNameEl.value;
		if (!name) {
			return;
		}

		if (this.findPreset(name)) {
			this.inputNewPresetNameEl.setCustomValidity('Duplicate names');
			return;
		}

		this.inputNewPresetNameEl.value = '';

		const newPreset = { ...this.config, name };

		this.customPresets = [...this.customPresets, newPreset];
		this.presetActionState = 'idle';
	}

	#applyPreset(preset: PresetConfig) {
		this.#storage.latestPresetApplied.save(preset.name);
		this.config = preset;
		toast(`"${preset.name}" applied`, 'primary', 3000);
	}

	#onTrashClicked() {
		this.customPresets = this.customPresets.filter(preset => {
			return !this.presetsForDelete.has(preset.name);
		});

		this.presetsForDelete = new Set();
		this.presetActionState = 'idle';
	}

	#ononlyShowCardsWithNoConfirmedSourcesCheckbox(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.onlyShowCardsWithNoConfirmedSources = target.checked;
			this.#storage.onlyShowCardsWithNoConfirmedSources.save(target.checked);
		}
	}

	#onOnlyShowCardsWithSourcesToVerifyCheckbox(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.onlyShowCardsWithSourcesToVerify = target.checked;
			this.#storage.onlyShowCardsWithSourcesToVerify.save(target.checked);
		}
	}

	protected renderDeletingPresets() {
		if (this.customPresets.length === 0) return nothing;

		switch (this.presetActionState) {
			case 'idle': {
				return html`<sl-button @click=${this.#onDeleteModeActivate}>Delete some presets</sl-button>`;
			}

			case 'adding': {
				return nothing;
			}

			case 'deleting': {
				return html`<sl-icon-button
					@click=${this.#onTrashClicked}
					class="preset-action-btn"
					name="trash3"
					.disabled=${this.presetsForDelete.size === 0}
				></sl-icon-button>`;
			}
		}
	}

	protected renderAddingPresets() {
		switch (this.presetActionState) {
			case 'idle': {
				return html` <sl-icon-button
					@click=${this.#onPlusPresetClicked}
					class="preset-action-btn"
					name="plus-lg"
					>next</sl-icon-button
				>`;
			}

			case 'adding': {
				return html`<form @submit=${this.#onSubmitNewPreset} class="adding-new-preset">
					<sl-input
						class="adding-new-preset_input"
						required
						id="input-new-preset-name"
						label="name for your preset"
						.helpText=${'set configs and then confirm'}
					></sl-input>
					<sl-button type="submit" class="adding-new-preset_confirm-btn">Confirm</sl-button>
				</form>`;
			}

			case 'deleting': {
				return nothing;
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

				<section
					class=${classMap({
						'select-filters-section': true,
						'select-filters-section--open': this.shouldApplySelectFilters,
					})}
				>
					<div class="apply-select-filters-control">
						<sl-checkbox
							.checked=${this.shouldApplySelectFilters}
							@sl-input=${this.#onshouldApplySelectFiltersCheckbox}
							>Apply filters</sl-checkbox
						>
					</div>
					${this.shouldApplySelectFilters
						? html`<div class="select-filters">
									<div class="select-filters_presets">
										<h3>Presets</h3>

										<div class="presets-buttons">
											${this.presets.map(
												preset =>
													html`<sl-button @click=${this.#applyPreset.bind(this, preset)}
														>${preset.name}</sl-button
													>`
											)}
											${this.customPresets.map(preset => {
												const btn = html`<sl-button
													@click=${this.#applyPreset.bind(this, preset)}
													>${preset.name}</sl-button
												>`;

												const select = html`<sl-checkbox
													@sl-input=${this.#onPresetChecked}
													.value=${preset.name}
													>${preset.name}</sl-checkbox
												>`;
												return this.presetActionState === 'deleting' ? select : btn;
											})}
											${this.renderAddingPresets()} ${this.renderDeletingPresets()}
											${this.presetActionState !== 'idle'
												? html`<sl-button @click=${this.#onCancelClicked}>Cancel</sl-button>`
												: nothing}
										</div>
									</div>

									<div class="select-filters_filters">
										<sl-select
											label="Greynote"
											.value=${this.config.greynote.map(c => SlConverter.toSlValue(c))}
											@sl-change=${this.#onGreynotesSelectChange}
											multiple
											clearable
										>
											${Array.from(GREYNOTE_VARIANTS).map(variant => {
												return html` <sl-option value=${SlConverter.toSlValue(variant)}
													>${variant}</sl-option
												>`;
											})}
										</sl-select>
										<sl-select
											label="Confidence"
											.value=${this.config.confidence.map(c => SlConverter.toSlValue(c))}
											@sl-change=${this.#onConfidenceSelectChange}
											multiple
											clearable
										>
											${Array.from(CONFIDENCE_VARIANTS).map(variant => {
												return html` <sl-option value=${SlConverter.toSlValue(variant)}
													>${variant}</sl-option
												>`;
											})}
										</sl-select>

										<sl-select
											.value=${this.config.remainingWork.map(c => SlConverter.toSlValue(c))}
											@sl-change=${this.#onRemainingWorkSelectChange}
											label="Remaining Work"
											multiple
											clearable
										>
											${Array.from(REMAINING_WORK_VARIANTS).map(variant => {
												return html` <sl-option value=${SlConverter.toSlValue(variant)}
													>${variant}</sl-option
												>`;
											})}
										</sl-select>
									</div>
								</div>
								<sl-checkbox
									.checked=${this.onlyShowCardsWithNoConfirmedSources}
									@sl-input=${this.#ononlyShowCardsWithNoConfirmedSourcesCheckbox}
									>Only show cards with no confirmed sources</sl-checkbox
								>
								<sl-checkbox
									.checked=${this.onlyShowCardsWithSourcesToVerify}
									@sl-input=${this.#onOnlyShowCardsWithSourcesToVerifyCheckbox}
									>Only show cards with sources to verify</sl-checkbox
								> `
						: nothing}
				</section>

				<section class="search-and-navigation">
					<e-input
						label="Search by anything"
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
				${this.paginatedCardsRenderer.render(card => {
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
			margin-top: 1rem;
			display: grid;
			gap: 1rem;
		}

		.select-filters-section--open {
			margin-top: 3rem;
		}

		.select-filters_filters {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.presets-buttons {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 0.2rem;
		}

		.preset-action-btn {
			font-size: 1.5rem;
		}

		.adding-new-preset {
			display: flex;
			gap: 0.2rem;
			align-items: center;
			justify-content: center;
			margin-left: 0.2rem;
		}

		.adding-new-preset_input {
			margin-bottom: 0.2rem;
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
		divcordLoader.addEventListener('state-updated', state => {
			if (state === 'updated') {
				this.lastUpdated.run();
			}
		});
	}

	lastUpdated = new Task(this, {
		async task() {
			return await divcordLoader.cacheDate();
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
	@state() loaderState!: DivcordLoaderState;

	constructor() {
		super();
		this.loaderState = divcordLoader.state;
		divcordLoader.addEventListener('state-updated', state => {
			this.loaderState = state;
		});
	}

	task = new Task<never, void>(this, {
		task: async () => {
			const records = await divcordLoader.update();
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
