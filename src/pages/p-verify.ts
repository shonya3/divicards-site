import { LitElement, PropertyValueMap, TemplateResult, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { DivcordTable } from '../DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { PoeData, poeData } from '../PoeData';
import { SOURCE_TYPE_VARIANTS, Source } from '../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';
import '../elements/e-need-to-verify';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import type { Card } from '../gen/poeData';
import { RowDataForWeightsTableVerifySources } from '../elements/weights-table/types';
import '../elements/weights-table/e-weights-table-verify-sources';
import { DivcordRecord } from '../gen/divcord';
import { prepareWeightDataSources } from '../elements/weights-table/lib';
import type { SourceSize } from '../elements/e-source/types';
import { styles } from './p-verify.styles';

declare global {
	interface HTMLElementTagNameMap {
		'p-verify': VerifyPage;
	}
}

function weightsTableData(records: DivcordRecord[], poeData: PoeData): RowDataForWeightsTableVerifySources[] {
	return Object.entries(groupBy(records, ({ card }) => card))
		.map(([card, records]) => ({
			card: poeData.find.card(card),
			sources: records.flatMap(record =>
				record.verifySources.filter(({ type }) => type === 'Map' || type === 'Act')
			),
		}))
		.filter((obj): obj is { card: Card; sources: Source[] } => obj.card !== null && obj.sources.length > 0)
		.map(({ card, sources }) => prepareWeightDataSources(card, sources));
}

@customElement('p-verify')
export class VerifyPage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() detailsOfContentsOpen = true;
	@state() cardSize: CardSize = 'small';
	@state() sourceSize: SourceSize = 'medium';
	@state() byCategory: {
		maps: SourceAndCards[];
		acts: SourceAndCards[];
		other: SourceAndCards[];
	} = Object.create({});
	@state() verifyTableData: RowDataForWeightsTableVerifySources[] = [];

	@state() cardWeightsGrouped: Record<string, { card: string; weight: number; source: Source }[]> = Object.create({});

	@query('.table-of-contents') detailsOfContents!: HTMLDetailsElement;
	@query('details ul') contentsLinksList!: HTMLElement;
	@query('.list') sourceWithCardsList!: HTMLElement;

	constructor() {
		super();

		this.addEventListener('click', e => {
			const target = e.composedPath()[0];
			if (target instanceof HTMLAnchorElement) {
				const { hash } = new URL(target.href);
				const el = this.shadowRoot?.getElementById(hash.slice(1));
				if (el && el instanceof HTMLElement) {
					el.style.setProperty('scroll-margin-top', '50px');
					el.scrollIntoView({ behavior: 'smooth' });
				}
			}
		});
	}

	protected async firstUpdated(_changedProperties: PropertyValueMap<this>): Promise<void> {
		const { hash } = new URL(window.location.href);
		if (hash) {
			const el = this.shadowRoot?.getElementById(hash.slice(1));
			if (el && el instanceof HTMLElement) {
				await new Promise(r => setTimeout(r, 0));
				el.style.setProperty('scroll-margin-top', '50px');
				el.scrollIntoView();
			}
		}

		if (window.innerWidth < 1600) {
			this.detailsOfContentsOpen = false;
			this.detailsOfContents.style.setProperty('height', 'auto');
		}
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('divcordTable')) {
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
			this.byCategory.acts = cards.filter(({ source }) => source.type === 'Act' || source.type === 'Act Boss');
			this.byCategory.maps = cards.filter(({ source }) => source.type === 'Map' || source.type === 'Map Boss');
			this.byCategory.other = cards.filter(({ source }) =>
				['Act', 'Map', 'Act Boss', 'Map Boss'].every(type => type !== source.type)
			);

			this.verifyTableData = weightsTableData(this.divcordTable.records, poeData);
			this.sourcesAndCards = structuredClone(cards);
		}
	}

	protected render(): TemplateResult {
		return html`<div class="page">
			<main class="main">
				<h1 class="heading">Need to verify</h1>
				<e-verify-faq-alert></e-verify-faq-alert>
				<details class="table-of-contents" ?open=${this.detailsOfContentsOpen}>
					<summary class="table-of-contents__summary">Table of contents</summary>
					<div class="table-of-contents__inner">
						<ol class="brief-table-of-contents" start="1">
							<li>
								<a href="#maps"> Maps</a>
							</li>
							<li>
								<a href="#acts"> Acts</a>
							</li>
							<li>
								<a href="#other"> Other</a>
							</li>

							<li class="li-link-to-weights-table"><a href="#details-weights-table">Weights Table</a></li>
						</ol>

						<a class="category-heading-link" href="#maps">Maps</a>
						${this.ContentsList(this.byCategory.maps)}
						<a class="category-heading-link" href="#acts">Acts</a>
						${this.ContentsList(this.byCategory.acts)}
						<a class="category-heading-link" href="#other">Other</a>
						${this.ContentsList(this.byCategory.other)}
					</div>
				</details>

				<h3 class="category-heading" id="maps">Maps</h3>
				${this.SourceWithCardsList(this.byCategory.maps)}
				<h3 class="category-heading" id="acts">Acts</h3>
				${this.SourceWithCardsList(this.byCategory.acts)}
				<h3 class="category-heading" id="other">Other</h3>
				${this.SourceWithCardsList(this.byCategory.other)}
				<details id="details-weights-table" class="details-weights-table" open>
					<summary class="details-weights-table__summary">Weights Table</summary>
					<e-weights-table-verify-sources .rows=${this.verifyTableData}></e-weights-table-verify-sources>
				</details>
			</main>
		</div>`;
	}

	protected SourceWithCardsList(sourcesAndCards: SourceAndCards[]): TemplateResult {
		return html`<ul class="source-with-cards-list">
			${sourcesAndCards.map(({ source, cards }: SourceAndCards) => {
				let name = source.id;
				if (source.type === 'Act') {
					const area = poeData.find.actArea(source.id);
					if (area) {
						name = area.name;
					}
				}
				const hash = name.replaceAll(' ', '_');
				return html`
					<li id="${hash}">
						<e-source-with-cards
							card-size=${this.cardSize}
							source-size=${this.sourceSize}
							.source=${source}
							.cards=${cards}
						></e-source-with-cards>
					</li>
				`;
			})}
		</ul>`;
	}

	protected ContentsList(sourcesAndCards: SourceAndCards[]): TemplateResult {
		return html`<ul>
			${sourcesAndCards.map(({ source, cards }) => {
				let name = source.id;
				if (source.type === 'Act') {
					const area = poeData.find.actArea(source.id);
					if (area) {
						name = area.name;
					}
				}
				const hash = name.replaceAll(' ', '_');
				const cardsString = cards.map(({ card }) => card).join(', ');
				return html`<li>
					<a href="#${hash}">${name} <span style="font-size: 11px; color: #999">${cardsString}</span></a>
				</li> `;
			})}
		</ul>`;
	}

	static styles = styles;
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

// #activeScrollEl: HTMLElement | null = null;
// get activeScrollEl(): HTMLElement | null {
// 	return this.#activeScrollEl;
// }
// set activeScrollEl(val: HTMLElement | null) {
// 	if (val === null) return;

// 	this.#activeScrollEl?.classList.remove('active');
// 	this.#activeScrollEl = val;
// 	this.#activeScrollEl.classList.add('active');

// 	if (!this.#InView(this.detailsOfContents, val)) {
// 		val.scrollIntoView();
// 	}
// }
// #InView(container: HTMLElement, el: HTMLElement) {
// 	const containerScrollTop = container.scrollTop;
// 	const rect = el.getBoundingClientRect();

// 	if (rect.top < 100) {
// 		return false;
// 	}

// 	return containerScrollTop + Math.abs(rect.y) < container.clientHeight;
// }
// const obs = new IntersectionObserver(
// 	entries => {
// 		entries.forEach(e => {
// 			if (e.intersectionRatio === 1) {
// 				const a = this.contentsLinksList.querySelector(`[href = "#${e.target.id}"]`);
// 				if (a instanceof HTMLAnchorElement) {
// 					this.activeScrollEl = a;
// 				}
// 			}
// 		});
// 	},
// 	{ threshold: 1 }
// );

// for (const li of this.sourceWithCardsList.querySelectorAll('li')) {
// 	obs.observe(li);
// }
