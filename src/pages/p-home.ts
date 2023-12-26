import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
import { poeData } from '../PoeData';
import { sortByWeight } from '../CardsFinder';

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

	@state() filtered: string[] = [];
	@state() paginated: string[] = [];

	async #onCardnameInput(e: InputEvent) {
		const input = e.target as HTMLInputElement;
		this.page = 1;
		this.filter = input.value;
	}

	protected willUpdate(map: PropertyValueMap<this>): void {
		if (map.has('filter') || map.has('searchCriterias') || map.has('divcordTable')) {
			const query = this.filter.trim().toLowerCase();
			const cards = findCards(query, this.searchCriterias, this.divcordTable);
			sortByWeight(cards, poeData);
			this.filtered = cards;
		}

		if (map.has('filtered') || map.has('page') || map.has('perPage')) {
			this.paginated = paginate(this.filtered, this.page, this.perPage);
		}
	}

	#onCriteriasSelect(e: Event) {
		const target = e.target as EventTarget & { value: string[] };
		const options = target.value.map(opt => SlConverter.fromSlValue<SearchCardsCriteria>(opt));
		this.searchCriterias = options;
	}

	render() {
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

function findByReleaseLeague(query: string, allCards: Readonly<string[]>): string[] {
	const cards: string[] = [];

	for (const name of allCards) {
		const card = poeData.card(name);
		const league = card?.league;
		if (league) {
			const leagueName = league.name.toLowerCase();
			if (leagueName.includes(query)) {
				cards.push(card.name);
			}
		}
	}

	return cards;
}

function findByReleaseVersion(matches: RegExpMatchArray, allCards: Readonly<string[]>): string[] {
	const cards: string[] = [];

	for (const name of allCards) {
		const card = poeData.card(name);
		const league = card?.league;
		if (league) {
			const [[major, minor]] = matches.map(match => match.split('.').map(Number));

			const [maj, min] = league.version.split('.').map(s => Number(s));
			if (major === maj && minor === min) {
				cards.push(card.name);
			}
		}
	}

	return cards;
}

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

function findByName(query: string, allCards: Readonly<string[]>): string[] {
	const cards: string[] = [];

	for (const name of allCards) {
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

	let actNumber: number | null = null;

	const digits = query.match(/\d+/g);
	if (digits) {
		const digit = parseInt(digits[0]);
		if (Number.isInteger(digit)) {
			actNumber = digit;
		}
	}

	for (const [card, sourceIds] of divcordTable.sourceIdsMap()) {
		if (sourceIds.some(id => id.toLowerCase().includes(query)) && !cards.includes(card)) {
			cards.push(card);
			continue;
		}

		const containsActArea = sourceIds
			.filter(id => id.includes('_'))
			.some(id => {
				const actArea = poeData.findActAreaById(id);
				if (actArea) {
					if (actArea.name.toLowerCase().includes(query)) {
						return true;
					}

					if (query.includes('a')) {
						if (actNumber === actArea.act) {
							return true;
						}
					}
				}
			});

		if (containsActArea) {
			cards.push(card);
		}
	}

	return cards;
}

export const searchCriteriaVariants = [
	'name',
	'flavour text',
	'source',
	'reward',
	'stack size',
	'release version',
	'release league',
] as const;
export type SearchCardsCriteria = (typeof searchCriteriaVariants)[number];

export function findCards(query: string, criterias: SearchCardsCriteria[], divcordTable: SourcefulDivcordTable) {
	const allCards = divcordTable.cards();
	// sortByWeight(allCards, poeData);
	const q = query.trim().toLowerCase();
	const cards: string[] = [];

	// 3.22 version pattern
	const leagueVersionPattern = /\b\d+\.\d+\b/g;
	const matchesVersionPattern = q.match(leagueVersionPattern);
	if (matchesVersionPattern && criterias.includes('release version')) {
		// if query matches version pattern, early return this exact list
		return findByReleaseVersion(matchesVersionPattern, allCards);
	}

	if (criterias.includes('release league')) {
		cards.push(...findByReleaseLeague(q, allCards));
	}

	if (criterias.includes('stack size')) {
		cards.push(...findByStackSize(q));
	}

	if (criterias.includes('name')) {
		cards.push(...findByName(q, allCards));
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

	return Array.from(new Set(cards));
}
