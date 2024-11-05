import { LitElement, PropertyValueMap, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DivcordTable } from '../context/divcord/DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { PoeData, poeData } from '../PoeData';
import { SOURCE_TYPE_VARIANTS, Source } from '../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';
import '../elements/e-need-to-verify';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import type { Card } from '../gen/poeData';
import '../elements/weights-table/e-weights-table-verify-sources';
import { DivcordRecord } from '../gen/divcord';
import type { SourceSize } from '../elements/e-source/types';
import { styles } from './p-verify.styles';
import '@shoelace-style/shoelace/dist/components/details/details.js';
import { prepareWeightData } from '../elements/weights-table/lib';
import { RowData } from '../elements/weights-table/e-weights-table-verify-sources';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import { Storage } from '../storage';
import { divcordTableContext } from '../context/divcord/divcord-provider';
import {
	view_transition_names_context,
	type ViewTransitionNamesContext,
} from '../context/view-transition-name-provider';

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
export class VerifyPage extends LitElement {
	#minimumWeight = new Storage('pVerifyMinimumWeight', 10000);
	@property({ reflect: true }) card_size: CardSize = 'small';
	@property({ reflect: true }) source_size: SourceSize = 'medium';

	@property() activeView: ActiveView = 'weights-table';

	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@consume({ context: view_transition_names_context, subscribe: true })
	@state()
	view_transition_names!: ViewTransitionNamesContext;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() byCategory: {
		maps: SourceAndCards[];
		acts: SourceAndCards[];
		other: SourceAndCards[];
	} = Object.create({});
	@state() weightsTableData: RowData[] = [];
	@state() filteredWeightsTableData: RowData[] = [];
	@state() cardWeightsGrouped: Record<string, { card: string; weight: number; source: Source }[]> = Object.create({});
	/** Minimum weight for Weights Table slider */
	@state() minimumWeight = this.#minimumWeight.load();

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable') || map.has('activeView')) {
			if (this.activeView === 'weights-table') {
				this.weightsTableData = weightsTableData(this.divcordTable.records, poeData);
			} else {
				// skip if already set up
				if (this.sourcesAndCards.length > 0) {
					return;
				}

				const sourcesAndCards = cardsBySourceTypes(
					Array.from(SOURCE_TYPE_VARIANTS),
					this.divcordTable.records,
					poeData
				)
					.map(({ cards, source }) => ({
						cards: cards.filter(c => c.status === 'verify'),
						source,
					}))
					.filter(({ cards }) => cards.length > 0)
					.sort((a, b) => b.cards.length - a.cards.length);
				for (const { cards } of sourcesAndCards) {
					sortByWeight(cards, poeData);
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
				cards = [...cards, ...rebirth];

				// Split by category
				this.byCategory.acts = cards.filter(
					({ source }) => source.type === 'Act' || source.type === 'Act Boss'
				);
				this.byCategory.maps = cards.filter(
					({ source }) => source.type === 'Map' || source.type === 'Map Boss'
				);
				this.byCategory.other = cards.filter(({ source }) =>
					['Act', 'Map', 'Act Boss', 'Map Boss'].every(type => type !== source.type)
				);

				this.sourcesAndCards = structuredClone(cards);
			}
		}

		if (map.has('divcordTable') || map.has('activeView') || map.has('minimumWeight')) {
			this.filteredWeightsTableData = this.weightsTableData
				.filter(({ weight }) => weight >= this.minimumWeight)
				.sort((a, b) => b.weight - a.weight);
		}
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
									'nav-link--active': variant === this.activeView,
								})} href=/verify/${variant}>${linkLabel(variant)}</a>`
						)}
					</nav>
					<e-verify-faq-alert></e-verify-faq-alert>
				</div>
			</header>

			<main class="main">
				${choose(this.activeView, [
					['acts', () => this.#SourceWithCardsList(this.byCategory.acts)],
					['maps', () => this.#SourceWithCardsList(this.byCategory.maps)],
					['others', () => this.#SourceWithCardsList(this.byCategory.other)],
					[
						'weights-table',
						() => html`<sl-range @sl-change=${this.#changeMinimumWeight} .value=${
							this.minimumWeight
						} .label=${`Showing ${this.filteredWeightsTableData.length} cards with weight > ${formatWeight(
							this.minimumWeight
						)}`} min="0" step="100" max="10000"></sl-range>
								<e-weights-table-verify-sources
                                    .active_divination_card=${this.view_transition_names.active_divination_card}
                                    exportparts="active_divination_card"
									.rows=${this.filteredWeightsTableData}
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
							card-size=${this.card_size}
							source-size=${this.source_size}
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

	#changeMinimumWeight(e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		this.#minimumWeight.save(value);
		this.minimumWeight = value;
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
			...prepareWeightData(card),
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

export const ACTIVE_VIEW_VARIANTS = ['maps', 'acts', 'others', 'weights-table'] as const;
export type ActiveView = (typeof ACTIVE_VIEW_VARIANTS)[number];

function linkLabel(activeView: ActiveView) {
	switch (activeView) {
		case 'acts':
			return 'Acts';
		case 'maps':
			return 'Maps';
		case 'others':
			return 'Others';
		case 'weights-table':
			return 'Weights Table';
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
