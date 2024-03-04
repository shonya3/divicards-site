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

		const obs = new IntersectionObserver(
			entries => {
				entries.forEach(e => {
					if (e.intersectionRatio === 1) {
						const a = this.contentsLinksList.querySelector(`[href = "#${e.target.id}"]`);
						if (a instanceof HTMLAnchorElement) {
							this.activeScrollEl = a;
						}
					}
				});
			},
			{ threshold: 1 }
		);

		for (const li of this.sourceWithCardsList.querySelectorAll('li')) {
			obs.observe(li);
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

			this.sourcesAndCards = structuredClone(sourcesAndCards);
		}
	}

	render() {
		return html`<div class="page">
			<main class="main">
				<h1 class="heading">Need to verify</h1>
				<e-verify-faq-alert></e-verify-faq-alert>
				<ul class="list">
					${this.sourcesAndCards.map(({ source, cards }: SourceAndCards) => {
						let name = source.id;
						if (source.type === 'Act') {
							const area = poeData.find.actArea(source.id);
							if (area) {
								name = area.name;
							}
						}
						const hash = name.replaceAll(' ', '_');
						return html`<li id="${hash}">
							<e-source-with-cards
								card-size=${this.cardSize}
								source-size=${this.sourceSize}
								.source=${source}
								.cards=${cards}
							></e-source-with-cards>
						</li>`;
					})}
				</ul>
			</main>
			<details class="contents" ?open=${this.detailsOpen}>
				<summary>Need to verify</summary>
				<ul>
					${this.sourcesAndCards.map(({ source, cards }) => {
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
							<a href="#${hash}"
								>${name} <span style="font-size: 11px; color: #999">${cardsString}</span></a
							>
						</li> `;
					})}
				</ul>
			</details>
		</div>`;
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
			margin-top: 2rem;
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
			margin-top: 6rem;
			margin-left: 1rem;

			list-style: none;
			display: flex;
			column-gap: 5rem;
			row-gap: 3rem;
			flex-wrap: wrap;
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
