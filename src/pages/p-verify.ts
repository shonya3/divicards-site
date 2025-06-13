import { LitElement, PropertyValueMap, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sort_by_weight } from '../cards';
import { PoeData, poeData } from '../PoeData';
import { SOURCE_TYPE_VARIANTS, Source } from '../../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';
import '../elements/e-need-to-verify';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import type { Card } from '../../gen/poeData';
import '../elements/weights-table/e-weights-table-verify-sources';
import { DivcordRecord } from '../../gen/divcord';
import type { SourceSize } from '../elements/e-source/types';
import { styles } from './p-verify.styles';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import { prepare_weight_data } from '../elements/weights-table/lib';
import { RowData } from '../elements/weights-table/e-weights-table-verify-sources';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';
import { computed, signal, SignalWatcher } from '@lit-labs/signals';
import { divcord_store } from '../stores/divcord';
import { use_local_storage } from '../composables/use_local_storage';

declare module '../storage' {
	interface Registry {
		pVerifyMinimumWeight: number;
	}
}

/**
 * @csspart active_divination_card
 * @csspart active_drop_source
 */
@customElement('p-verify')
export class VerifyPage extends SignalWatcher(LitElement) {
	@property({ reflect: true }) card_size: CardSize = 'small';
	@property({ reflect: true }) source_size: SourceSize = 'medium';
	@property({ reflect: true }) activeView: ActiveView = 'weights-table';

	#minimum_weight = use_local_storage('pVerifyMinimumWeight', 10000);
	#active_view = signal<ActiveView>('weights-table');

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	#weights_table_data = computed<Array<RowData>>(() => {
		return weightsTableData(divcord_store.records.get(), poeData);
	});
	#filtered_weights_table_data = computed<Array<RowData>>(() => {
		return this.#weights_table_data
			.get()
			.filter(({ weight }) => weight >= this.#minimum_weight.get())
			.sort((a, b) => b.weight - a.weight);
	});

	#sources_and_cards = computed(() => {
		const sourcesAndCards = cardsBySourceTypes(
			Array.from(SOURCE_TYPE_VARIANTS),
			divcord_store.records.get(),
			poeData
		)
			.map(({ cards, source }) => ({
				cards: cards.filter(c => c.status === 'verify'),
				source,
			}))
			.filter(({ cards }) => cards.length > 0)
			.sort((a, b) => b.cards.length - a.cards.length);
		for (const { cards } of sourcesAndCards) {
			sort_by_weight(cards, poeData);
		}

		// move sources with solo Rebirth cards to the end
		// to make it less spammy
		const rebirth: SourceAndCards[] = [];
		let cards: SourceAndCards[] = sourcesAndCards.filter(c => {
			if (c.cards.length === 1 && c.cards.map(c => c.card).includes('Rebirth')) {
				rebirth.push(c);
				return false;
			} else {
				return true;
			}
		});
		return [...cards, ...rebirth];
	});

	/** Split by category */
	#by_category = computed<{
		maps: SourceAndCards[];
		acts: SourceAndCards[];
		other: SourceAndCards[];
	}>(() => {
		const cards = this.#sources_and_cards.get();
		return {
			acts: cards.filter(({ source }) => source.type === 'Act' || source.type === 'Act Boss'),
			maps: cards.filter(({ source }) => source.type === 'Map' || source.type === 'Map Boss'),
			other: cards.filter(({ source }) =>
				['Act', 'Map', 'Act Boss', 'Map Boss'].every(type => type !== source.type)
			),
		};
	});

	protected willUpdate(map: PropertyValueMap<this>): void {
		map.has('activeView') && this.#active_view.set(this.activeView);
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<header>
				<h1 class="heading">Need to verify</h1>
				<div>
					<nav class="nav">
						${ACTIVE_VIEW_VARIANTS.map(
							variant =>
								html`<a class=${classMap({
									'nav-link--active': variant === this.#active_view.get(),
								})} href=/verify/${variant}>${linkLabel(variant)}</a>`
						)}
					</nav>
					<e-verify-faq-alert></e-verify-faq-alert>
				</div>
			</header>

			<main class="main">
				${choose(this.#active_view.get(), [
					['acts', () => this.#SourceWithCardsList(this.#by_category.get().acts)],
					['maps', () => this.#SourceWithCardsList(this.#by_category.get().maps)],
					['others', () => this.#SourceWithCardsList(this.#by_category.get().other)],
					[
						'weights-table',
						() => html`<sl-range @sl-change=${
							this.#change_minimum_weight
						} .value=${this.#minimum_weight.get()} min="0" step="100" max="10000">
                    <div slot="label">
                        <p class="min-weight">weight <span>${formatWeight(this.#minimum_weight.get())}+</span></p>
                        <p class="cards-found">
                             <span>${this.#filtered_weights_table_data.get().length}</span> cards
                        </p>
                    </div>    
                    </sl-range>
								<e-weights-table-verify-sources
                                    .active_divination_card=${this.view_transition_names.active_divination_card}
                                    exportparts="active_divination_card"
									.rows=${this.#filtered_weights_table_data.get()}
								></e-weights-table-verify-sources>
							</sl-sl>
						`,
					],
				])}
			</main>
		</div>`;
	}

	#SourceWithCardsList(source_and_cards: Array<SourceAndCards>) {
		return html`<ul class="source-with-cards-list">
			${source_and_cards.map(({ source, cards }: SourceAndCards) => {
				return html`
					<li>
						<e-source-with-cards
							.active_divination_card=${this.view_transition_names.active_divination_card}
							.card_size=${this.card_size}
							.source_size=${this.source_size}
							.source=${source}
							.cards=${cards}
							exportparts=${this.view_transition_names.active_drop_source === source.idSlug
								? 'active_divination_card,drop_source:active_drop_source'
								: 'active_divination_card'}
						></e-source-with-cards>
					</li>
				`;
			})}
		</ul>`;
	}

	#change_minimum_weight(e: Event): void {
		const value = Number((e.target as HTMLInputElement).value);
		this.#minimum_weight.set(value);
	}

	static styles = styles;
}

function weightsTableData(records: DivcordRecord[], poeData: PoeData): RowData[] {
	return Object.entries(groupBy(records, ({ card }) => card))
		.map(([card, records]) => ({
			card: poeData.find.card(card),
			sources: records.flatMap(record =>
				record.verifySources.filter(({ type }) => type === 'Map' || type === 'Act')
			),
		}))
		.filter((obj): obj is { card: Card; sources: Source[] } => obj.card !== null && obj.sources.length > 0)
		.map(({ card, sources }) => ({
			...prepare_weight_data(card),
			sources,
		}));
}

type GroupBy = <T, Key extends string>(
	arr: Array<T>,
	cb: (el: T, index: number, arr: Array<T>) => Key
) => Record<Key, T[]>;

declare global {
	interface Object {
		groupBy: GroupBy;
	}
}

const groupBy = <T>(arr: T[], cb: (el: T, index: number, arr: T[]) => string): Record<string, T[]> => {
	const record: Record<string, T[]> = Object.create({});

	for (let i = 0; i < arr.length; i++) {
		const el = arr[i];
		const key = cb(el, i, arr);

		const groupedByKey = record[key] ?? [];
		groupedByKey.push(el);
		record[key] = groupedByKey;
	}

	return record;
};

declare global {
	interface HTMLElementTagNameMap {
		'p-verify': VerifyPage;
	}
}

export const ACTIVE_VIEW_VARIANTS = ['weights-table', 'maps', 'acts', 'others'] as const;
export type ActiveView = (typeof ACTIVE_VIEW_VARIANTS)[number];

function linkLabel(activeView: ActiveView) {
	switch (activeView) {
		case 'acts':
			return 'acts';
		case 'maps':
			return 'maps';
		case 'others':
			return 'others';
		case 'weights-table':
			return 'weights';
	}
}

const fmts = {
	'0': new Intl.NumberFormat('en', { maximumFractionDigits: 0 }),
	'2': new Intl.NumberFormat('en', { maximumFractionDigits: 2 }),
};
function formatWeight(weight: number, formatters: Record<0 | 2, Intl.NumberFormat> = fmts) {
	const maximumFractionDigits = weight > 5 ? 0 : 2;
	return formatters[maximumFractionDigits].format(weight);
}
