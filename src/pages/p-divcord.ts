import { LitElement, PropertyValueMap, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { DivcordTable } from '../DivcordTable';
import { divcordTableContext } from '../context';
import '../elements/e-card-with-divcord-records';
import '../elements/e-page-controls';
import '../elements/input/e-input';
import '../elements/e-update-divcord-data';
import '../elements/e-divcord-records-age';
import '../elements/presets/e-divcord-presets';
import '../elements/divcord-spreadsheet/e-divcord-spreadsheet';
import '../elements/e-sheets-link';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { DivcordRecordsAgeElement } from '../elements/e-divcord-records-age';
import { DivcordPresetsElement } from '../elements/presets/e-divcord-presets';
import { ArrayAsyncRenderer, paginate } from '../utils';
import { Storage } from '../storage';
import { classMap } from 'lit/directives/class-map.js';
import { searchCardsByQuery, SEARCH_CRITERIA_VARIANTS } from '../searchCardsByQuery';
import { Confidence, RemainingWork, Greynote, DivcordRecord } from '../gen/divcord';
import { DEFAULT_PRESETS, type PresetConfig } from '../elements/presets/presets';
import { toast } from '../toast';
import {
	DivcordRecordAndWeight,
	DivcordSpreadsheetElement,
} from '../elements/divcord-spreadsheet/e-divcord-spreadsheet';
import { poeData } from '../PoeData';
import { prepareWeightData } from '../elements/weights-table/lib';

declare module '../storage' {
	interface Registry {
		customPresets: PresetConfig[];
		shouldApplyFilters: boolean;
		latestPresetApplied: string;
		onlyShowCardsWithNoConfirmedSources: boolean;
		onlyShowCardsWithSourcesToVerify: boolean;
		activeView: ActiveView;
	}
}

@customElement('p-divcord')
export class DivcordPage extends LitElement {
	#storage = {
		customPresets: new Storage('customPresets', []),
		shouldApplyFilters: new Storage('shouldApplyFilters', true),
		latestPresetApplied: new Storage('latestPresetApplied', ''),
		onlyShowCardsWithNoConfirmedSources: new Storage('onlyShowCardsWithNoConfirmedSources', false),
		onlyShowCardsWithSourcesToVerify: new Storage('onlyShowCardsWithSourcesToVerify', false),
		showCards: new Storage('weightsPageShowCards', true),
		activeView: new Storage('activeView', 'table'),
	};
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) shouldApplySelectFilters = this.#storage.shouldApplyFilters.load();
	@property({ type: Boolean }) onlyShowCardsWithNoConfirmedSources: boolean =
		this.#storage.onlyShowCardsWithNoConfirmedSources.load();
	@property({ type: Boolean }) onlyShowCardsWithSourcesToVerify: boolean =
		this.#storage.onlyShowCardsWithSourcesToVerify.load();
	@property({ type: Boolean }) showCards: boolean = this.#storage.showCards.load();
	@property({ reflect: true, attribute: 'active-view' }) activeView: ActiveView = this.#storage.activeView.load();

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() recordsForTableView: DivcordRecordAndWeight[] = [];
	@state() filtered: string[] = [];
	@state() paginated: string[] = [];
	@state() paginatedCardsRenderer!: ArrayAsyncRenderer<string>;

	@state() config: Omit<PresetConfig, 'name'> = DEFAULT_PRESETS[0];
	@state() customPresets: PresetConfig[] = this.#storage.customPresets.load() ?? [];

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('showCards')) {
			this.#storage.showCards.save(this.showCards);
		}

		if (map.has('activeView')) {
			this.#storage.activeView.save(this.activeView);
		}

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
			this.#storage.customPresets.save(this.customPresets);
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
			'activeView',
		];
		if (Array.from(map.keys()).some(k => keys.includes(k))) {
			this.filtered = createFilteredCards({
				filter: this.filter,
				divcordTable: this.divcordTable,
				config: this.config,
				shouldApplySelectFilters: this.shouldApplySelectFilters,
				onlyShowCardsWithNoConfirmedSources: this.onlyShowCardsWithNoConfirmedSources,
				onlyShowCardsWithSourcesToVerify: this.onlyShowCardsWithSourcesToVerify,
			});
			this.paginated = paginate(this.filtered, this.page, this.perPage);
			this.paginatedCardsRenderer = new ArrayAsyncRenderer(this.paginated);

			if (this.activeView === 'table') {
				const set = new Set(this.filtered);

				this.recordsForTableView = prepareDivcordRecordsAndWeight(
					this.divcordTable.records.filter(record => set.has(record.card))
				);
			}
		}
	}

	attributeChangedCallback(name: string, old: string | null, value: string | null): void {
		super.attributeChangedCallback(name, old, value);

		if (name === 'filter') {
			if (old === value || old == null) {
				return;
			}
			const url = new URL(window.location.href);
			url.searchParams.set('filter', this.filter);
			window.history.pushState(null, '', url);
		}
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<header>
				<e-sheets-link
					href="https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0"
					>Divcord Spreadsheet</e-sheets-link
				>
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
									.customPresets=${this.customPresets}
									@preset-applied=${this.#onPresetApplied}
									@config-updated=${this.#onConfigUpdated}
									@custom-presets-updated=${this.#onCustomPresetsUpdated}
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
			</header>

			<sl-radio-group
				@sl-change=${this.#onActiveViewChanged}
				class="select-view-controls"
				size="large"
				label="Select the view"
				name="a"
				value=${this.activeView}
			>
				<sl-radio-button value="list">List</sl-radio-button>
				<sl-radio-button value="table">Table</sl-radio-button>
			</sl-radio-group>

			<section class="search">
				<e-input
					label="Search by anything"
					.datalistItems=${this.divcordTable.cards()}
					@input="${this.#onCardnameInput}"
					type="text"
				>
				</e-input>
			</section>

			<div class="active-view">
				${this.activeView === 'list'
					? html`<e-page-controls
								.n=${this.filtered.length}
								page=${this.page}
								per-page=${this.perPage}
							></e-page-controls>
							<ul>
								${this.paginatedCardsRenderer.render(card => {
									return html`<e-card-with-divcord-records
										.card=${card}
										.records=${this.divcordTable.recordsByCard(card)}
									></e-card-with-divcord-records>`;
								})}
							</ul>`
					: html`<e-divcord-spreadsheet
							@show-cards-changed=${this.#onShowCardsChanged}
							.records=${this.recordsForTableView}
							.showCards=${this.showCards}
					  ></e-divcord-spreadsheet>`}
			</div>
		</div>`;
	}

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

	#onCustomPresetsUpdated(e: CustomEvent<PresetConfig[]>) {
		this.customPresets = e.detail;
	}

	#onShowCardsChanged(e: Event) {
		this.showCards = (e.target as DivcordSpreadsheetElement).showCards;
	}

	findPreset(name: string): PresetConfig | null {
		return [...DEFAULT_PRESETS, ...this.customPresets].find(p => p.name === name) ?? null;
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

	#onActiveViewChanged(e: InputEvent) {
		const target = e.target as EventTarget & { value: string };
		if (target && target.value) {
			if (target.value === 'list' || target.value === 'table') {
				this.activeView = target.value;
			}
		}
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			font-family: 'Geist';
		}

		e-sheets-link {
			font-size: 1rem;
		}

		.page {
			font-size: 14px;
		}

		.load {
			margin-top: 1rem;
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

		.search {
			margin-top: 2rem;
		}

		.active-view {
			margin-top: 1rem;
		}

		.select-view-controls {
			margin-top: 2rem;
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

		e-card-with-divcord-records::part(card) {
			margin-inline: auto;
			@media (width >= 460px) {
				margin-inline: 0;
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

function createFilteredCards({
	filter,
	divcordTable,
	config,
	shouldApplySelectFilters,
	onlyShowCardsWithSourcesToVerify,
	onlyShowCardsWithNoConfirmedSources,
}: {
	filter: string;
	divcordTable: DivcordTable;
	config: Omit<PresetConfig, 'name'>;
	shouldApplySelectFilters: boolean;
	onlyShowCardsWithSourcesToVerify: boolean;
	onlyShowCardsWithNoConfirmedSources: boolean;
}): string[] {
	const query = filter.trim().toLowerCase();

	const cardsByQuery = searchCardsByQuery(query, Array.from(SEARCH_CRITERIA_VARIANTS), divcordTable);

	const cards = cardsByQuery
		.filter(card => {
			if (shouldApplySelectFilters && onlyShowCardsWithSourcesToVerify) {
				const records = divcordTable.recordsByCard(card);
				return records.some(r => r.verifySources.length > 0);
			} else {
				return true;
			}
		})
		.filter(card => {
			if (shouldApplySelectFilters && onlyShowCardsWithNoConfirmedSources) {
				const records = divcordTable.recordsByCard(card);
				const allRecordsHaveNoSources = records.every(s => s.sources.length === 0);
				return allRecordsHaveNoSources;
			} else {
				return true;
			}
		})
		.filter(card => {
			if (shouldApplySelectFilters) {
				const hasConfidence = someCardRecordHasConfidenceVariant(card, config.confidence, divcordTable);
				const hasGreynote = someCardRecordHasGreynoteWorkVariant(card, config.greynote, divcordTable);
				const hasRemainingWork = someCardRecordHasRemainingWorkVariant(
					card,
					config.remainingWork,
					divcordTable
				);

				return hasConfidence && hasGreynote && hasRemainingWork;
			} else {
				return true;
			}
		});
	return cards;
}

function someCardRecordHasConfidenceVariant(
	card: string,
	confidenceVariants: Confidence[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => confidenceVariants.includes(record.confidence));
}

function someCardRecordHasRemainingWorkVariant(
	card: string,
	remainingWorkVariants: RemainingWork[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => remainingWorkVariants.includes(record.remainingWork));
}

function someCardRecordHasGreynoteWorkVariant(
	card: string,
	greynoteVariants: Greynote[],
	divcordTable: DivcordTable
): boolean {
	return divcordTable.recordsByCard(card).some(record => greynoteVariants.includes(record.greynote));
}

function prepareDivcordRecordsAndWeight(records: DivcordRecord[]): DivcordRecordAndWeight[] {
	return records.map(record => {
		return { ...record, weightData: prepareWeightData(poeData.cards[record.card]) };
	});
}

type ActiveView = 'list' | 'table';

declare global {
	interface HTMLElementTagNameMap {
		'p-divcord': DivcordPage;
	}
}
