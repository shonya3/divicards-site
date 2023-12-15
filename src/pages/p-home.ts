import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardSize } from '../elements/divination-card/e-divination-card';
import { SourcefulDivcordTable } from '../divcord';
import '../elements/e-page-controls';
import './e-card-with-sources';
import { consume } from '@lit/context';
import { divcordTableContext } from '../context';
import { SlConverter, paginate } from '../utils';
import '../elements/input/e-input';
import inputStyles from '../elements/input/input.styles';
import { cardsDataMap } from '../elements/divination-card/data';

declare global {
	interface HTMLElementTagNameMap {
		'p-home': HomePage;
	}
}

@customElement('p-home')
export class HomePage extends LitElement {
	@property({ reflect: true, type: Number, attribute: 'page' }) page = 1;
	@property({ reflect: true, type: Number, attribute: 'per-page' }) perPage = 10;
	@property({ reflect: true }) size: CardSize = 'medium';
	@property({ reflect: true }) filter: string = '';
	@property({ type: Array }) searchCriterias: SearchCardsCriteria[] = searchCriteriaVariants.map(r => r);

	@consume({ context: divcordTableContext, subscribe: true })
	divcordTable!: SourcefulDivcordTable;

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	get filtered() {
		const query = this.filter.trim().toLowerCase();
		return findCards(query, this.searchCriterias, this.divcordTable);
	}

	get paginated() {
		return paginate(this.filtered, this.page, this.perPage);
	}

	#onCriteriasSelect(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<SearchCardsCriteria>(opt));
		this.searchCriterias = options;
	}

	render() {
		console.log(this.searchCriterias);
		return html`<div class="page">
			<header>
				<form>
					<div style="max-width: 600px">
						<e-input
							autofocus
							label="Search"
							.datalistItems=${this.divcordTable.cards()}
							@input="${this.#onCardnameInput}"
							type="text"
						>
						</e-input>
						<sl-select
							label="By"
							.value=${this.searchCriterias.map(c => SlConverter.toSlValue(c))}
							@sl-change=${this.#onCriteriasSelect}
							multiple
							clearable
						>
							${Array.from(searchCriteriaVariants).map(c => {
								return html`<sl-option value=${SlConverter.toSlValue(c)}>${c}</sl-option>`;
							})}
						</sl-select>
					</div>
				</form>
				<e-page-controls
					.n=${this.filtered.length}
					page=${this.page}
					per-page=${this.perPage}
				></e-page-controls>
			</header>
			<ul class="cards">
				${this.paginated.map(card => {
					return html`<li>
						<e-card-with-sources
							.name=${card}
							.divcordTable=${this.divcordTable}
							.size=${this.size}
						></e-card-with-sources>
					</li>`;
				})}
			</ul>
		</div>`;
	}

	static styles = css`
		${inputStyles}
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			display: block;
		}

		@media (max-width: 600px) {
			.page {
				margin-top: 1rem;
				padding: 0.5rem;
			}
		}

		header {
			margin-top: 1rem;
			justify-content: center;
			max-width: 600px;
			margin-inline: auto;
		}

		@media (max-width: 600px) {
			header {
				padding: 0.2rem;
			}
		}

		.cards {
			margin-top: 3rem;
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			gap: 4rem;
			max-width: 1600px;
			margin-inline: auto;
			justify-content: center;
		}
	`;
}

export const searchCriteriaVariants = ['name', 'flavour text', 'source', 'reward', 'stack size'] as const;
export type SearchCardsCriteria = (typeof searchCriteriaVariants)[number];

function findByFlavourText(query: string): string[] {
	const cards: string[] = [];

	for (const { name, flavourText } of cardsDataMap.values()) {
		if (flavourText.toLowerCase().includes(query)) {
			cards.push(name);
		}
	}

	return cards;
}

export function escapeHtml(htmlText: string) {
	return htmlText.replace(/<[^>]+>/g, '');
}

function findByReward(query: string): string[] {
	const cards: string[] = [];

	for (const { name, rewardHtml } of cardsDataMap.values()) {
		const reward = escapeHtml(rewardHtml);
		if (reward.toLowerCase().includes(query)) {
			cards.push(name);
		}
	}

	return cards;
}

function findByName(query: string): string[] {
	const cards: string[] = [];

	for (const { name } of cardsDataMap.values()) {
		if (name.toLowerCase().includes(query)) {
			cards.push(name);
		}
	}

	return cards;
}

function findByStackSize(query: string): string[] {
	const cards: string[] = [];

	const queryStackSize = parseInt(query);
	if (!Number.isInteger(queryStackSize)) {
		return cards;
	}

	for (const { name, stackSize } of cardsDataMap.values()) {
		if (stackSize === null && queryStackSize === 1) {
			cards.push(name);
		}

		if (stackSize === queryStackSize) {
			cards.push(name);
		}
	}

	return cards;
}

function findBySourceId(query: string, divcordTable: SourcefulDivcordTable): string[] {
	const cards: string[] = [];

	for (const [card, sourceIds] of divcordTable.sourceIdsMap()) {
		if (sourceIds.some(id => id.toLowerCase().includes(query)) && !cards.includes(card)) {
			cards.push(card);
		}
	}

	return cards;
}

export function findCards(query: string, criterias: SearchCardsCriteria[], divcordTable: SourcefulDivcordTable) {
	const q = query.trim().toLowerCase();
	const cards: string[] = [];

	if (criterias.includes('name')) {
		cards.push(...findByName(q));
	}

	if (criterias.includes('flavour text')) {
		cards.push(...findByFlavourText(q));
	}

	if (criterias.includes('reward')) {
		cards.push(...findByReward(q));
	}

	if (criterias.includes('source')) {
		cards.push(...findBySourceId(q, divcordTable));
	}

	if (criterias.includes('stack size')) {
		cards.push(...findByStackSize(q));
	}

	return Array.from(new Set(cards));
}
