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
import { ArrayAsyncRenderer, paginate } from '../utils';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import { Storage } from '../storage';
import { classMap } from 'lit/directives/class-map.js';
import { searchCardsByQuery, SEARCH_CRITERIA_VARIANTS } from '../searchCardsByQuery';
import { Confidence, RemainingWork, Greynote } from '../gen/divcord';
import { DEFAULT_PRESETS, type PresetConfig } from '../elements/presets/presets';
import '../elements/presets/e-divcord-presets';
import { DivcordPresetsElement } from '../elements/presets/e-divcord-presets';
import { toast } from '../toast';

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

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	#onRecordsUpdated() {
		this.ageEl.lastUpdated.run();
	}

	#onConfigUpdated(e: Event) {
		const target = e.target as DivcordPresetsElement;
		this.config = { ...target.config };
	}

	#onPresetApplied(e: CustomEvent<PresetConfig>) {
		this.#applyPreset(e.detail);
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

	#onshouldApplySelectFiltersCheckbox(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.shouldApplySelectFilters = target.checked;
		}
	}

	#applyPreset(preset: PresetConfig) {
		this.#storage.latestPresetApplied.save(preset.name);
		this.config = preset;
		toast(`"${preset.name}" applied`, 'primary', 3000);
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
								<e-divcord-presets
									@preset-applied=${this.#onPresetApplied}
									@config-updated=${this.#onConfigUpdated}
								></e-divcord-presets>
								<sl-checkbox
									.checked=${this.onlyShowCardsWithNoConfirmedSources}
									@sl-input=${this.#ononlyShowCardsWithNoConfirmedSourcesCheckbox}
									>Only show cards with no confirmed sources</sl-checkbox
								>
								<sl-checkbox
									.checked=${this.onlyShowCardsWithSourcesToVerify}
									@sl-input=${this.#onOnlyShowCardsWithSourcesToVerifyCheckbox}
									>Only show cards with sources to verify</sl-checkbox
								>
						  </div> `
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

		.select-filters {
			display: grid;
			gap: 1rem;
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
