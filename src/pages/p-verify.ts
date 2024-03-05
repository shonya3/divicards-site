import { linkStyles } from './../linkStyles';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { DivcordTable } from '../DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { poeData } from '../PoeData';
import { SOURCE_TYPE_VARIANTS } from '../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';
import type { CardSize } from '../elements/divination-card/e-divination-card';

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
	@state() detailsOpen = true;
	@state() cardSize: CardSize = 'small';
	@state() sourceSize: CardSize = 'medium';
	@state() byCategory: {
		maps: SourceAndCards[];
		acts: SourceAndCards[];
		other: SourceAndCards[];
	} = Object.create({});

	@query('.contents') details!: HTMLDetailsElement;
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

		if (!this.#InView(this.details, val)) {
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
			this.detailsOpen = false;
			this.details.style.setProperty('height', 'auto');
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

			this.byCategory.acts = cards.filter(({ source }) => source.type === 'Act' || source.type === 'Act Boss');
			this.byCategory.maps = cards.filter(({ source }) => source.type === 'Map' || source.type === 'Map Boss');
			this.byCategory.other = cards.filter(({ source }) =>
				['Act', 'Map', 'Act Boss', 'Map Boss'].every(type => type !== source.type)
			);

			this.sourcesAndCards = structuredClone(cards);
		}
	}

	protected render() {
		return html`<div class="page">
			<main class="main">
				<h1 class="heading">Need to verify</h1>
				<e-verify-faq-alert></e-verify-faq-alert>
				<h3 class="category-heading" id="Maps">Maps</h3>
				${this.SourceAndCardsList(this.byCategory.maps)}
				<h3 class="category-heading" id="Acts">Acts</h3>
				${this.SourceAndCardsList(this.byCategory.acts)}
				<h3 class="category-heading" id="Other">Other</h3>
				${this.SourceAndCardsList(this.byCategory.other)}
			</main>

			<details class="contents" ?open=${this.detailsOpen}>
				<summary>Table of contents</summary>
				<ol class="brief-table-of-contents" start="1">
					<li>
						<a href="#Maps"> Maps</a>
					</li>
					<li>
						<a href="#Acts"> Acts</a>
					</li>
					<li>
						<a href="#Other"> Other</a>
					</li>
				</ol>

				<a class="category-heading-link" href="#Maps">Maps</a>
				${this.ContentsList(this.byCategory.maps)}
				<a class="category-heading-link" href="#Acts">Acts</a>
				${this.ContentsList(this.byCategory.acts)}
				<a class="category-heading-link" href="#Other">Other</a>
				${this.ContentsList(this.byCategory.other)}
			</details>
		</div>`;
	}

	protected SourceAndCardsList(sourcesAndCards: SourceAndCards[]) {
		return html`<ul class="list">
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

	static styles = css`
		* {
			padding: 0;
			margin: 0;
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

		ul {
			list-style: none;
		}

		.list {
			margin-top: 2rem;
			margin-left: 1rem;

			list-style: none;
			display: flex;
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

		.brief-table-of-contents {
			margin-left: 2rem;
			display: grid;
			gap: 0.1rem;
		}

		.contents {
			position: fixed;
			width: 400px;
			right: 100px;
			height: calc(80vh - 100px);
			max-height: calc(80vh - 100px);
			overflow-y: scroll;
			top: 100px;
			z-index: 200000;
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

		.contents summary {
			margin-bottom: 1rem;
		}

		details:not([open]) {
			overflow-y: initial;
		}

		@media (max-width <= 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}

			.list {
				margin-left: 0;
			}
		}

		@media (width <= 1600px) {
			.contents {
				margin-top: 2rem;
				position: initial;
			}
		}
	`;
}
