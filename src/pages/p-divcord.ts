import { LitElement, PropertyValueMap, PropertyValues, TemplateResult, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { DivcordTable } from '../context/divcord/DivcordTable';
import '../elements/e-card-with-divcord-records';
import '../elements/e-pagination';
import '../elements/e-update-divcord-data';
import '../elements/e-divcord-records-age';
import '../elements/presets/e-divcord-presets';
import '../elements/divcord-spreadsheet/e-divcord-spreadsheet';
import '../elements/e-sheets-link';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { DivcordRecordsAgeElement } from '../elements/e-divcord-records-age';
import { DivcordPresetsElement } from '../elements/presets/e-divcord-presets';
import { paginate } from '../utils';
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
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { ifDefined } from 'lit/directives/if-defined.js';
import { slug } from '../gen/divcordWasm/divcord_wasm';
import { repeat } from 'lit/directives/repeat.js';
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { use_local_storage } from '../composables/use_local_storage';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import { styles } from './p-divcord.styles';

declare module '../storage' {
	interface Registry {
		custom_presets: PresetConfig[];
		should_apply_filters: boolean;
		latest_preset_applied: string;
		only_show_cards_with_no_confirmed_sources: boolean;
		only_show_cards_with_sources_to_verify: boolean;
		active_view: ActiveView;
		show_cards_images: boolean;
	}
}

/**
 * @csspart active_divination_card
 */
@customElement('p-divcord')
export class DivcordPage extends SignalWatcher(LitElement) {
	static styles = styles;

	@property({ reflect: true, type: Number }) page = 1;
	@property({ reflect: true, type: Number }) per_page = 10;
	@property({ reflect: true }) filter: string = '';

	#page = signal(1);
	#per_page = signal(10);
	#filter = signal('');
	#divcord_table = signal(new DivcordTable([]));

	active_view = use_local_storage('active_view', 'table');
	show_cards_images = use_local_storage('show_cards_images', true);
	should_apply_filters = use_local_storage('should_apply_filters', true);
	only_show_cards_with_no_confirmed_sources = use_local_storage('only_show_cards_with_no_confirmed_sources', false);
	only_show_cards_with_sources_to_verify = use_local_storage('only_show_cards_with_sources_to_verify', false);
	latest_preset_applied = use_local_storage('latest_preset_applied', '');
	custom_presets = use_local_storage('custom_presets', []);
	config = signal<Omit<PresetConfig, 'name'>>(DEFAULT_PRESETS[0]);

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcord_table!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	records_for_table_view = computed(() => {
		if (this.active_view.get() !== 'table') {
			return [];
		}
		const set = new Set(this.filtered.get());
		return prepareDivcordRecordsAndWeight(this.#divcord_table.get().records.filter(record => set.has(record.card)));
	});

	filtered = computed(() => {
		return createFilteredCards({
			filter: this.#filter.get(),
			divcordTable: this.#divcord_table.get(),
			config: this.config.get(),
			should_apply_filters: this.should_apply_filters.get(),
			only_show_cards_with_no_confirmed_sources: this.only_show_cards_with_no_confirmed_sources.get(),
			only_show_cards_with_sources_to_verify: this.only_show_cards_with_sources_to_verify.get(),
		});
	});

	paginated = computed(() => {
		return paginate(this.filtered.get(), this.#page.get(), this.#per_page.get());
	});

	@query('e-divcord-records-age') ageEl!: DivcordRecordsAgeElement;

	protected firstUpdated(_changedProperties: PropertyValues): void {
		const preset = this.find_preset(this.latest_preset_applied.get());
		this.#apply_preset(preset);
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		map.has('page') && this.#page.set(this.page);
		map.has('per_page') && this.#per_page.set(this.per_page);
		map.has('filter') && this.#filter.set(this.filter);
		map.has('divcord_table') && this.#divcord_table.set(this.divcord_table);
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
						'select-filters-section--open': this.should_apply_filters.get(),
					})}
				>
					<!-- <div class="apply-select-filters-control">
						<sl-checkbox
							.checked=${this.should_apply_filters.get()}
							@sl-input=${this.#on_should_apply_select_filters_change}
							>Apply filters</sl-checkbox
						>
					</div> -->
					${this.should_apply_filters
						? html`<div class="select-filters">
								<e-divcord-presets
									.custom_presets=${this.custom_presets.get()}
									@preset-applied=${this.#on_preset_apply}
									@config-updated=${this.#on_config_update}
									@custom-presets-updated=${this.#on_custom_preset_update}
								></e-divcord-presets>
								<sl-checkbox
									.checked=${this.only_show_cards_with_no_confirmed_sources.get()}
									@sl-input=${this.#on_only_show_cards_with_no_confirmed_sources_change}
									>Only show cards with no confirmed sources</sl-checkbox
								>
								<sl-checkbox
									.checked=${this.only_show_cards_with_sources_to_verify.get()}
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
				label="Select the view"
				name="a"
				value=${this.active_view.get()}
			>
				<sl-radio-button value="list">List</sl-radio-button>
				<sl-radio-button value="table">Table</sl-radio-button>
			</sl-radio-group>

			<section class="search">
				<sl-input
					label="Search by anything"
					.value=${this.#filter.get()}
					@input="${this.#h_search}"
					type="text"
				>
				</sl-input>
			</section>

			<div class="active-view">
				${this.active_view.get() === 'list'
					? html`<e-pagination
								.n=${this.filtered.get().length}
								page=${this.#page.get()}
								per_page=${this.#per_page.get()}
							></e-pagination>
							<ul>
								${repeat(
									this.paginated.get(),
									card => card,
									card => {
										return html`<li>
											<e-card-with-divcord-records
												.card=${card}
												.records=${this.#divcord_table.get().recordsByCard(card)}
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
							.records=${this.records_for_table_view.get()}
							.showCards=${this.show_cards_images.get()}
					  ></e-divcord-spreadsheet>`}
			</div>
		</div>`;
	}

	#on_records_updated() {
		this.ageEl.lastUpdated.run();
	}

	#on_config_update(e: Event) {
		const target = e.target as DivcordPresetsElement;
		this.config.set({ ...target.config });
	}

	#on_preset_apply(e: CustomEvent<PresetConfig>) {
		this.#apply_preset(e.detail);
	}

	#on_custom_preset_update(e: CustomEvent<PresetConfig[]>) {
		this.custom_presets.set(e.detail);
	}

	#on_show_cards_change(e: Event) {
		this.show_cards_images.set((e.target as DivcordSpreadsheetElement).showCards);
	}

	find_preset(name: string): PresetConfig | null {
		return [...DEFAULT_PRESETS, ...this.custom_presets.get()].find(p => p.name === name) ?? null;
	}

	async #h_search(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.#page.set(1);
		this.#filter.set(input.value);
	}

	#on_should_apply_select_filters_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.should_apply_filters.set(target.checked);
		}
	}

	#apply_preset(preset: PresetConfig | null) {
		if (!this.should_apply_filters.get() || !preset) {
			return;
		}

		this.latest_preset_applied.set(preset.name);
		this.config.set(preset);
		toast(`"${preset.name}" applied`, 'primary', 3000);
	}

	#on_only_show_cards_with_no_confirmed_sources_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.only_show_cards_with_no_confirmed_sources.set(target.checked);
		}
	}

	#on_only_show_cards_with_sources_to_verify_change(e: InputEvent) {
		const target = e.composedPath()[0] as EventTarget & { checked: boolean };
		if (typeof target.checked === 'boolean') {
			this.only_show_cards_with_sources_to_verify.set(target.checked);
		}
	}

	#on_active_view_change(e: InputEvent) {
		const target = e.target as EventTarget & { value: string };
		if (target && target.value) {
			if (target.value === 'list' || target.value === 'table') {
				this.active_view.set(target.value);
			}
		}
	}
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
