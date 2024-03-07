import { linkStyles } from './../linkStyles';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { DivcordTable } from '../DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { poeData } from '../PoeData';
import { SOURCE_TYPE_VARIANTS, Source } from '../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';
import '../elements/e-need-to-verify';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import type { Card } from '../gen/poeData';

declare global {
	interface HTMLElementTagNameMap {
		'p-verify': VerifyPage;
	}
}

@customElement('p-verify')
export class VerifyPage extends LitElement {
	@consume({ context: divcordTableContext, subscribe: true })
	@state()
	divcordTable!: DivcordTable;

	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() detailsOfContentsOpen = true;
	@state() cardSize: CardSize = 'small';
	@state() sourceSize: CardSize = 'medium';
	@state() byCategory: {
		maps: SourceAndCards[];
		acts: SourceAndCards[];
		other: SourceAndCards[];
	} = Object.create({});

	@state() cardWeightsGrouped: Record<string, { card: string; weight: number; source: Source }[]> = Object.create({});

	@query('.table-of-contents') detailsOfContents!: HTMLDetailsElement;
	@query('details ul') contentsLinksList!: HTMLElement;
	@query('.list') sourceWithCardsList!: HTMLElement;

	#activeScrollEl: HTMLElement | null = null;
	get activeScrollEl() {
		return this.#activeScrollEl;
	}
	set activeScrollEl(val: HTMLElement | null) {
		if (val === null) return;

		this.#activeScrollEl?.classList.remove('active');
		this.#activeScrollEl = val;
		this.#activeScrollEl.classList.add('active');

		if (!this.#InView(this.detailsOfContents, val)) {
			val.scrollIntoView();
		}
	}

	constructor() {
		super();

		this.addEventListener('click', e => {
			const target = e.composedPath()[0];
			if (target instanceof HTMLAnchorElement) {
				const { hash } = new URL(target.href);
				const el = this.shadowRoot?.getElementById(hash.slice(1));
				if (el) {
					el.scrollIntoView({ behavior: 'smooth' });
				}
			}
		});
	}

	#InView(container: HTMLElement, el: HTMLElement) {
		const containerScrollTop = container.scrollTop;
		const rect = el.getBoundingClientRect();

		if (rect.top < 100) {
			return false;
		}

		return containerScrollTop + Math.abs(rect.y) < container.clientHeight;
	}

	protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		const { hash } = new URL(window.location.href);
		if (hash) {
			const el = this.shadowRoot?.getElementById(hash.slice(1));
			if (el) {
				await new Promise(r => setTimeout(r, 0));
				el.scrollIntoView();
			}
		}

		if (window.innerWidth < 1600) {
			this.detailsOfContentsOpen = false;
			this.detailsOfContents.style.setProperty('height', 'auto');
		}

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
			let cards = sourcesAndCards.filter(c => {
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

			// Prepare card weights for the Table
			const cardWeights = cards
				.filter(({ source }) => source.type === 'Map' || source.type === 'Act')
				.flatMap(({ cards, source }) =>
					cards
						.filter(({ transitiveSource }) => transitiveSource === undefined)
						.map(({ card }) => ({ card, source }))
				)
				.map(({ card, source }) => ({ card: poeData.find.card(card), source }))
				.filter((arg): arg is { card: Card; source: Source } => arg.card !== null)
				.map(({ card, source }) => ({
					card: card.name,
					source,
					weight: card.weight,
				}));
			cardWeights.sort((a, b) => b.weight - a.weight);
			this.cardWeightsGrouped = groupBy(cardWeights, ({ card }) => card);

			this.sourcesAndCards = structuredClone(cards);
		}
	}

	protected render() {
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
					${this.WeightsTable()}
				</details>
			</main>
		</div>`;
	}

	protected SourceWithCardsList(sourcesAndCards: SourceAndCards[]) {
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

	protected ContentsList(sourcesAndCards: SourceAndCards[]) {
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

	protected WeightsTable() {
		return html`<table class="weights-table">
			<thead>
				<tr>
					<th class="weights-table__th" scope="col">№</th>
					<th class="weights-table__th" scope="col">Card</th>
					<th class="weights-table__th">Weight</th>
					<th class="weights-table__th">Source</th>
				</tr>
			</thead>
			<tbody>
				${Object.entries(this.cardWeightsGrouped).map(([card, arr], index) => {
					const weight: number = arr[0].weight;
					const weightStr =
						weight > 5
							? weight.toLocaleString('ru', { maximumFractionDigits: 0 })
							: weight.toLocaleString('ru', { maximumFractionDigits: 2 });
					const sources = html`<ul class="sources-list">
						${arr.map(({ source }) => html`<li><e-source size="medium" .source=${source}></e-source></li>`)}
					</ul>`;

					return html`<tr>
						<td class="weights-table__td">${index + 1}</td>
						<td class="weights-table__td">
							<e-need-to-verify
								><e-divination-card size="small" name=${card}></e-divination-card
							></e-need-to-verify>
						</td>
						<td class="weights-table__td td-weight">${weightStr}</td>
						<td class="weights-table__td td-sources">${sources}</td>
					</tr>`;
				})}
			</tbody>
		</table>`;
	}

	static weightsTableCss = css`
		.weights-table {
			border-collapse: collapse;
			border: 1px solid rgba(140, 140, 140, 0.3);
		}

		.weights-table__th,
		.weights-table__td {
			padding: 1rem;
			border: 1px solid rgba(160, 160, 160, 0.2);
			text-align: center;
		}

		.td-weight {
			font-weight: 700;
			font-size: 20px;
		}

		.td-sources {
		}

		.sources-list {
			display: flex;
			flex-wrap: wrap;
			gap: 2rem;
		}
	`;

	static styles = css`
		@layer reset {
			* {
				padding: 0;
				margin: 0;
			}

			ul {
				list-style: none;
			}
		}

		@layer weights-table {
			${VerifyPage.weightsTableCss}
		}

		:host {
			--need-to-verify-border: none;
		}

		${linkStyles}

		e-source-with-cards {
			--cards-margin-top: 0rem;
			width: fit-content;
		}

		.page {
			padding: 2rem;
		}

		.heading {
			text-align: center;
		}

		e-verify-faq-alert {
			margin-top: 3rem;
			margin-inline: auto;
			display: block;
		}

		.main {
			max-width: 1400px;
		}

		.source-with-cards-list {
			margin-top: 2rem;
			margin-left: 1rem;

			list-style: none;
			display: flex;
			justify-content: center;
			column-gap: 5rem;
			row-gap: 3rem;
			flex-wrap: wrap;
		}

		.category-heading:first-of-type {
			margin-top: 4rem;
		}

		.category-heading {
			display: block;
			font-size: 1.5rem;
			margin-inline: auto;
			width: fit-content;
		}

		/** Table of contents */

		.table-of-contents {
			position: fixed;
			max-width: 400px;
			right: 100px;
			top: 100px;
			z-index: 200000;
			border: 1px solid rgba(255, 255, 255, 0.4);
		}

		.table-of-contents__summary {
			padding: 1rem;
		}

		.table-of-contents__inner {
			height: calc(80vh - 100px);
			max-height: calc(80vh - 100px);
			padding: 2rem;
			overflow-y: scroll;
		}

		.brief-table-of-contents {
			margin-left: 2rem;
			display: grid;
			gap: 0.1rem;
		}

		details:not([open]) {
			overflow-y: initial;
		}

		a.active {
			color: var(--link-color-hover, blue);
		}

		.category-heading-link {
			display: block;
			margin-block: 2rem;
			font-size: 1.5rem;
			margin-inline: auto;
			width: fit-content;
		}

		/** details for weights table */
		.details-weights-table {
			padding: 1rem;
		}

		.details-weights-table__summary {
			font-size: 1.5rem;
		}

		.li-link-to-weights-table a {
			color: orangered;
		}

		/** media */

		@media (width <= 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			.list {
				margin-left: 0;
			}

			.table-of-contents {
				max-width: calc(100% - 2rem);
			}
		}

		@media (width <= 1950px) {
			.table-of-contents {
				margin-top: 2rem;
				position: initial;
			}
		}

		@media (width < 900px) {
			.details-weights-table,
			.li-link-to-weights-table {
				display: none;
			}
		}
	`;
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
