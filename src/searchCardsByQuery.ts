import { cardsByMapboss, cardsByActboss, sortByWeight, cardsBySourceTypes } from './cards';
import { poeData, PoeData } from './PoeData';
import { DivcordTable } from './DivcordTable';
import { cardsDataMap } from './elements/divination-card/data';
import { SOURCE_TYPE_VARIANTS } from './gen/Source';
import type { DivcordRecord } from './gen/divcord';
import type { ActArea } from './gen/poeData';

export const SEARCH_CRITERIA_VARIANTS = [
	'name',
	'flavour text',
	'source',
	'source type',
	'reward',
	'stack size',
	'release version',
	'release league',
] as const;
export type SearchCardsCriteria = (typeof SEARCH_CRITERIA_VARIANTS)[number];

let allCards: string[] = [];
export function searchCardsByQuery(
	query: string,
	criterias: SearchCardsCriteria[],
	divcordTable: DivcordTable
): string[] {
	if (!allCards.length) {
		allCards = divcordTable.cards();
		sortByWeight(allCards, poeData);
	}

	if (!query && criterias.length === SEARCH_CRITERIA_VARIANTS.length) {
		return allCards;
	}

	// sortByWeight(allCards, poeData);
	const q = query.trim().toLowerCase();
	let cards: string[] = [];

	// 3.22 version pattern
	const leagueVersionPattern = /\b\d+\.\d+\b/g;
	const matchesVersionPattern = q.match(leagueVersionPattern);
	if (matchesVersionPattern && criterias.includes('release version')) {
		// if query matches version pattern, early return this exact list
		return findByReleaseVersion(matchesVersionPattern, allCards);
	}

	if (criterias.includes('release league')) {
		cards = cards.concat(findByReleaseLeague(q, allCards));
	}

	if (criterias.includes('stack size')) {
		cards = cards.concat(findByStackSize(q));
	}

	if (criterias.includes('name')) {
		cards = cards.concat(findByName(q, allCards));
	}

	if (criterias.includes('flavour text')) {
		cards = cards.concat(findByFlavourText(q));
	}

	if (criterias.includes('reward')) {
		cards = cards.concat(findByReward(q));
	}

	if (criterias.includes('source')) {
		cards = cards.concat(findBySourceId(q, divcordTable));
	}

	if (criterias.includes('source type')) {
		cards = cards.concat(findBySourceType(q, divcordTable.records, poeData));
	}

	return Array.from(new Set(cards));
}

function findByReleaseLeague(query: string, allCards: Readonly<string[]>): string[] {
	const cards: string[] = [];

	for (const name of allCards) {
		const card = poeData.find.card(name);
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
		const card = poeData.find.card(name);
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

function findBySourceId(query: string, divcordTable: DivcordTable): string[] {
	let cards: string[] = [];

	let actNumber: number | null = null;

	const digits = query.match(/\d+/g);
	if (digits) {
		const digit = parseInt(digits[0]);
		if (Number.isInteger(digit)) {
			actNumber = digit;
		}
	}

	for (const [card, sources] of divcordTable.cardSourcesMap()) {
		for (const source of sources) {
			if (source.id.toLowerCase().includes(query)) {
				cards.push(card);

				if (source.type === 'Map') {
					const bosses = poeData.find.bossesOfMap(source.id);
					cards = [
						...cards,
						...bosses
							.flatMap(b => cardsByMapboss(b.name, divcordTable.records, poeData))
							.filter(c => c.status === 'done')
							.map(c => c.card),
					];
				}
				if (source.type === 'Act') {
					const actArea = poeData.acts.find(a => a.id === source.id)!;
					for (const fight of actArea.bossfights) {
						for (const card of cardsByActboss(fight.name, divcordTable.records)
							.filter(c => c.status === 'done')
							.map(c => c.card)) {
							cards.push(card);
						}
					}
				}
			}
		}

		const actAreas = sources
			.filter(s => s.type === 'Act')
			.map(s => poeData.find.actArea(s.id))
			.filter((a): a is ActArea => a !== undefined);

		let containsSomeActArea = false;
		for (const actArea of actAreas) {
			const lowerName = actArea.name.toLowerCase();
			if (lowerName.includes(query)) {
				containsSomeActArea = true;

				for (const fight of actArea.bossfights) {
					for (const card of cardsByActboss(fight.name, divcordTable.records)
						.filter(c => c.status === 'done')
						.map(c => c.card)) {
						cards.push(card);
					}
				}
			}

			if (query.includes('a')) {
				if (actNumber === actArea.act) {
					containsSomeActArea = true;
				}
			}
		}

		if (containsSomeActArea) {
			cards.push(card);
		}
	}

	// If act area directly drops no cards, but some of ot's bosses can
	for (const actArea of poeData.acts.filter(
		actArea =>
			actArea.id === query ||
			actArea.name.toLowerCase().includes(query) ||
			(query.includes('a') && actNumber === actArea.act)
	)) {
		for (const boss of actArea.bossfights) {
			for (const card of cardsByActboss(boss.name, divcordTable.records)
				.filter(c => c.status === 'done')
				.map(c => c.card)) {
				if (!cards.includes(card)) {
					cards.push(card);
				}
			}
		}
	}

	return cards;
}

function findBySourceType(query: string, records: DivcordRecord[], poeData: PoeData): string[] {
	const cards: string[] = [];
	const types = SOURCE_TYPE_VARIANTS.filter(sourcetype => sourcetype.toLowerCase().includes(query));

	for (const { cards: cardsFromSource } of cardsBySourceTypes(types, records, poeData)) {
		for (const { card } of cardsFromSource) {
			cards.push(card);
		}
	}

	return cards;
}
