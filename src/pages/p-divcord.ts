import { linkStyles } from './../linkStyles';
import { LitElement, PropertyValueMap, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { DivcordTable } from '../context/divcord/DivcordTable';
import '../elements/e-card-with-divcord-records';
import '../elements/e-pagination';
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
import { paginate } from '../utils';
import { Storage } from '../storage';
import { classMap } from 'lit/directives/class-map.js';
import { search_cards_by_query, SEARCH_CRITERIA_VARIANTS } from '../search_cards_by_query';
import { Confidence, RemainingWork, Greynote, DivcordRecord } from '../gen/divcord';
import { DEFAULT_PRESETS, type PresetConfig } from '../elements/presets/presets';
import { toast } from '../toast';
import {
	DivcordRecordAndWeight,
	DivcordSpreadsheetElement,
} from '../elements/divcord-spreadsheet/e-divcord-spreadsheet';
import { poeData } from '../PoeData';
import { prepareWeightData } from '../elements/weights-table/lib';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { ifDefined } from 'lit/directives/if-defined.js';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { repeat } from 'lit/directives/repeat.js';
import { SignalWatcher } from '@lit-labs/signals';

declare module '../storage' {
	interface Registry {
		custom_presets: PresetConfig[];
		should_apply_filters: boolean;
		latest_preset_applied: string;
		only_show_cards_with_no_confirmed_sources: boolean;
		only_show_cards_with_sources_to_verify: boolean;
		active_view: ActiveView;
	}
}

/**
 * @csspart active_divination_card
 */
@customElement('p-divcord')
export class DivcordPage extends SignalWatcher(LitElement) {
	#storage = {
		custom_presets: new Storage('custom_presets', []),
		should_apply_filters: new Storage('should_apply_filters', true),
		latest_preset_applied: new Storage('latest_preset_applied', ''),
		only_show_cards_with_no_confirmed_sources: new Storage('only_show_cards_with_no_confirmed_sources', false),
		only_show_cards_with_sources_to_verify: new Storage('only_show_cards_with_sources_to_verify', false),
		showCards: new Storage('weightsPageShowCards', true),
		active_view: new Storage('active_view', 'table'),
	};
	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number }) per_page = 10;
	@property({ reflect: true }) filter: string = '';
	@property({ type: Boolean }) should_apply_filters = this.#storage.should_apply_filters.load();
	@property({ type: Boolean }) only_show_cards_with_no_confirmed_sources: boolean =
		this.#storage.only_show_cards_with_no_confirmed_sources.load();
	@property({ type: Boolean }) only_show_cards_with_sources_to_verify: boolean =
		this.#storage.only_show_cards_with_sources_to_verify.load();
	@property({ type: Boolean }) showCards: boolean = this.#storage.showCards.load();
	@property({ reflect: true }) active_view: ActiveView = this.#storage.active_view.load();

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	@state() records_for_table_view: DivcordRecordAndWeight[] = [];
	@state() filtered: string[] = [];
	@state() paginated: string[] = [];

	@state() config: Omit<PresetConfig, 'name'> = DEFAULT_PRESETS[0];
	@state() custom_presets: PresetConfig[] = this.#storage.custom_presets.load() ?? [];

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('showCards')) {
			this.#storage.showCards.save(this.showCards);
		}

		if (map.has('active_view')) {
			this.#storage.active_view.save(this.active_view);
		}

		if (map.has('should_apply_filters')) {
			this.#storage.should_apply_filters.save(this.should_apply_filters);
		}

		if (map.has('should_apply_filters')) {
			if (this.should_apply_filters) {
				const latestAppliedPresetName = this.#storage.latest_preset_applied.load() ?? '';
				const preset = this.find_preset(latestAppliedPresetName);
				if (preset) {
					this.#apply_preset(preset);
				}
			}
		}

		if (map.has('custom_presets')) {
			this.#storage.custom_presets.save(this.custom_presets);
		}

		const keys: PropertyKey[] = [
			'config',
			'filter',
			'divcordTable',
			'should_apply_filters',
			'only_show_cards_with_no_confirmed_sources',
			'only_show_cards_with_sources_to_verify',
			'page',
			'perPage',
			'active_view',
		];
		if (Array.from(map.keys()).some(k => keys.includes(k))) {
			this.filtered = createFilteredCards({
				filter: this.filter,
				divcordTable: this.divcordTable,
				config: this.config,
				should_apply_filters: this.should_apply_filters,
				only_show_cards_with_no_confirmed_sources: this.only_show_cards_with_no_confirmed_sources,
				only_show_cards_with_sources_to_verify: this.only_show_cards_with_sources_to_verify,
			});
			this.paginated = paginate(this.filtered, this.page, this.per_page);

			if (this.active_view === 'table') {
				const set = new Set(this.filtered);

				this.records_for_table_view = prepareDivcordRecordsAndWeight(
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
				<div class="join-divcord">
					<sl-icon name="discord"></sl-icon>
					<a class="join-divcord" href="https://discord.gg/mpnYHbxHXs">Join Divcord!</a>
				</div>
				<e-sheets-link
					href="https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0"
					>Divcord Spreadsheet</e-sheets-link
				>
				<div class="load">
					<div class="load_btn-and-status">
						<e-update-divcord-data @records-updated=${this.#on_records_updated}></e-update-divcord-data>
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
						'select-filters-section--open': this.should_apply_filters,
					})}
				>
					<div class="apply-select-filters-control">
						<sl-checkbox
							.checked=${this.should_apply_filters}
							@sl-input=${this.#on_should_apply_select_filters_change}
							>Apply filters</sl-checkbox
						>
					</div>
					${this.should_apply_filters
						? html`<div class="select-filters">
								<e-divcord-presets
									.custom_presets=${this.custom_presets}
									@preset-applied=${this.#on_preset_apply}
									@config-updated=${this.#on_config_update}
									@custom-presets-updated=${this.#on_custom_preset_update}
								></e-divcord-presets>
								<sl-checkbox
									.checked=${this.only_show_cards_with_no_confirmed_sources}
									@sl-input=${this.#on_only_show_cards_with_no_confirmed_sources_change}
									>Only show cards with no confirmed sources</sl-checkbox
								>
								<sl-checkbox
									.checked=${this.only_show_cards_with_sources_to_verify}
									@sl-input=${this.#on_only_show_cards_with_sources_to_verify_change}
									>Only show cards with sources to verify</sl-checkbox
								>
						  </div> `
						: nothing}
				</section>
			</header>

			<sl-radio-group
				@sl-change=${this.#on_active_view_change}
				class="select-view-controls"
				size="large"
				label="Select the view"
				name="a"
				value=${this.active_view}
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
				${this.active_view === 'list'
					? html`<e-pagination
								.n=${this.filtered.length}
								page=${this.page}
								per_page=${this.per_page}
							></e-pagination>
							<ul>
								${repeat(
									this.paginated,
									card => card,
									card => {
										return html`<li>
											<e-card-with-divcord-records
												.card=${card}
												.records=${this.divcordTable.recordsByCard(card)}
												exportparts=${ifDefined(
													this.view_transition_names.active_divination_card === slug(card)
														? 'card:active_divination_card'
														: undefined
												)}
											></e-card-with-divcord-records>
										</li>`;
									}
								)}
							</ul>`
					: html`<e-divcord-spreadsheet
							exportparts="active_divination_card"
							.active_divination_card=${this.view_transition_names.active_divination_card}
							@show-cards-changed=${this.#on_show_cards_change}
							.records=${this.records_for_table_view}
							.showCards=${this.showCards}
					  ></e-divcord-spreadsheet>`}
			</div>
		</div>`;
	}

	#on_records_updated() {
		this.ageEl.lastUpdated.run();
	}

	#on_config_update(e: Event) {
		const target = e.target as DivcordPresetsElement;
		this.config = { ...target.config };
	}

	#on_preset_apply(e: CustomEvent<PresetConfig>) {
		this.#apply_preset(e.detail);
	}

	#on_custom_preset_update(e: CustomEvent<PresetConfig[]>) {
		this.custom_presets = e.detail;
	}

	#on_show_cards_change(e: Event) {
		this.showCards = (e.target as DivcordSpreadsheetElement).showCards;
	}

	find_preset(name: string): PresetConfig | null {
		return [...DEFAULT_PRESETS, ...this.custom_presets].find(p => p.name === name) ?? null;
	}

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	#on_should_apply_select_filters_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.should_apply_filters = target.checked;
		}
	}

	#apply_preset(preset: PresetConfig) {
		this.#storage.latest_preset_applied.save(preset.name);
		this.config = preset;
		toast(`"${preset.name}" applied`, 'primary', 3000);
	}

	#on_only_show_cards_with_no_confirmed_sources_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.only_show_cards_with_no_confirmed_sources = target.checked;
			this.#storage.only_show_cards_with_no_confirmed_sources.save(target.checked);
		}
	}

	#on_only_show_cards_with_sources_to_verify_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.only_show_cards_with_sources_to_verify = target.checked;
			this.#storage.only_show_cards_with_sources_to_verify.save(target.checked);
		}
	}

	#on_active_view_change(e: InputEvent) {
		const target = e.target as EventTarget & { value: string };
		if (target && target.value) {
			if (target.value === 'list' || target.value === 'table') {
				this.active_view = target.value;
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

		@layer links {
			${linkStyles}
		}

		.join-divcord {
			font-size: 1rem;
			display: flex;
			align-items: center;
			gap: 0.3rem;
			a {
				text-decoration: underline;
			}
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
			list-style: none;
		}
	`;
}

function createFilteredCards({
	filter,
	divcordTable,
	config,
	should_apply_filters,
	only_show_cards_with_sources_to_verify,
	only_show_cards_with_no_confirmed_sources,
}: {
	filter: string;
	divcordTable: DivcordTable;
	config: Omit<PresetConfig, 'name'>;
	should_apply_filters: boolean;
	only_show_cards_with_sources_to_verify: boolean;
	only_show_cards_with_no_confirmed_sources: boolean;
}): string[] {
	const query = filter.trim().toLowerCase();

	const cardsByQuery = search_cards_by_query(query, Array.from(SEARCH_CRITERIA_VARIANTS), divcordTable);

	const cards = cardsByQuery
		.filter(card => {
			if (should_apply_filters && only_show_cards_with_sources_to_verify) {
				const records = divcordTable.recordsByCard(card);
				return records.some(r => r.verifySources.length > 0);
			} else {
				return true;
			}
		})
		.filter(card => {
			if (should_apply_filters && only_show_cards_with_no_confirmed_sources) {
				const records = divcordTable.recordsByCard(card);
				const allRecordsHaveNoSources = records.every(s => s.sources.length === 0);
				return allRecordsHaveNoSources;
			} else {
				return true;
			}
		})
		.filter(card => {
			if (should_apply_filters) {
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
