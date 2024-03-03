import { linkStyles } from './../linkStyles';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { divcordTableContext } from '../context';
import { DivcordTable } from '../DivcordTable';
import { consume } from '@lit/context';
import { SourceAndCards, cardsBySourceTypes, sortByWeight } from '../cards';
import { poeData } from '../PoeData';
import { ArrayAsyncRenderer } from '../utils';
import { SOURCE_TYPE_VARIANTS } from '../gen/Source';
import '../elements/e-source-with-cards';
import '../elements/e-verify-faq-alert';

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

	@state() sourcesAndCardsRenderer!: ArrayAsyncRenderer<SourceAndCards>;
	@state() sourcesAndCards: SourceAndCards[] = [];
	@state() detailsOpen = true;

	@query('.contents') details!: HTMLDetailsElement;

	constructor() {
		super();

		this.addEventListener('click', e => {
			const target = e.composedPath()[0];
			if (target instanceof HTMLAnchorElement) {
				const { hash } = new URL(target.href);
				const el = this.shadowRoot?.getElementById(hash.slice(1));
				console.log({ hash, el });
				if (el) {
					el.scrollIntoView({ behavior: 'smooth' });
				}
			}
		});
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
			this.sourcesAndCardsRenderer = new ArrayAsyncRenderer(sourcesAndCards);
		}
	}

	nav() {
		return html`
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
		`;
	}

	render() {
		// with async renderer
		const list = this.sourcesAndCardsRenderer.render(({ source, cards }: SourceAndCards) => {
			let name = source.id;
			if (source.type === 'Act') {
				const area = poeData.find.actArea(source.id);
				if (area) {
					name = area.name;
				}
			}
			const hash = name.replaceAll(' ', '_');
			return html`<li id="${hash}">
				<e-source-with-cards .source=${source} .cards=${cards}></e-source-with-cards>
			</li>`;
		});

		// with arr
		// const list = this.sourcesAndCards.map(({ source, cards }: SourceAndCards) => {
		// 	let name = source.id;
		// 	if (source.type === 'Act') {
		// 		const area = poeData.find.actArea(source.id);
		// 		if (area) {
		// 			name = area.name;
		// 		}
		// 	}
		// 	const hash = name.replaceAll(' ', '_');
		// 	return html`<li id="${hash}">
		// 		<e-source-with-cards .source=${source} .cards=${cards}></e-source-with-cards>
		// 	</li>`;
		// });

		return html`<div class="page">
			<e-verify-faq-alert></e-verify-faq-alert>
			${this.nav()}
			<ul class="list">
				${list}
			</ul>
		</div>`;
	}

	static styles = css`
		* {
			padding: 0;
			margin: 0;
		}

		:host {
		}

		${linkStyles}

		e-source-with-cards {
			--cards-margin-top: 0rem;
		}

		.page {
			padding: 2rem;
		}

		ul {
			list-style: none;
		}

		.list {
			margin-top: 2rem;
			margin-left: 1rem;

			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			max-width: 950px;
		}

		.contents {
			position: fixed;
			width: 400px;
			left: 1100px;
			height: calc(80vh - 100px);
			max-height: calc(80vh - 100px);
			overflow-y: scroll;
			top: 100px;
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
