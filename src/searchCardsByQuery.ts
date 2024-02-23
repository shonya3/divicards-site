import { cardsByMapboss, cardsByActboss, sortByWeight, cardsBySourceTypes } from './cards';
import { poeData, PoeData } from './PoeData';
import { DivcordTable } from './DivcordTable';
import { SOURCE_TYPE_VARIANTS } from './gen/Source';
import type { DivcordRecord } from './gen/divcord';
import type { ActArea } from './gen/poeData';
import { cardElementDataFromJson as cardElementData } from './gen/cardElementData';

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

export function findByReleaseLeague(query: string, allCards: Readonly<string[]>): string[] {
	return allCards.filter(name => {
		const league = poeData.find.card(name)?.league;
		if (league) {
			return league.name.toLowerCase().includes(query);
		}
	});
}

function findByReleaseVersion(matches: RegExpMatchArray, allCards: Readonly<string[]>): string[] {
	return allCards.filter(name => {
		const league = poeData.find.card(name)?.league;
		if (league) {
			const [[major, minor]] = matches.map(match => match.split('.').map(Number));
			const [maj, min] = league.version.split('.').map(s => Number(s));
			return major === maj && minor == min;
		}
	});
}

function findByFlavourText(query: string): string[] {
	return cardElementData
		.filter(({ flavourText }) => flavourText.toLowerCase().includes(query))
		.map(({ name }) => name);
}

function findByReward(query: string): string[] {
	return cardElementData.filter(({ rewardHtml }) => rewardHtml.toLowerCase().includes(query)).map(({ name }) => name);
}

function findByName(query: string, allCards: Readonly<string[]>): string[] {
	return allCards.filter(name => name.toLowerCase().includes(query));
}

export function findByStackSize(query: string): string[] {
	const queryStackSize = parseInt(query);
	if (!Number.isInteger(queryStackSize)) {
		return [];
	}

	return cardElementData
		.filter(({ stackSize }) => {
			const stack = stackSize ?? 1;
			return stack === queryStackSize;
		})
		.map(({ name }) => name);
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
							.flatMap(({ name }) => cardsByMapboss(name, divcordTable.records, poeData))
							.filter(({ status }) => status === 'done')
							.map(({ card }) => card),
					];
				}
				if (source.type === 'Act') {
					const actArea = poeData.acts.find(a => a.id === source.id)!;
					for (const fight of actArea.bossfights) {
						for (const card of cardsByActboss(fight.name, divcordTable.records)
							.filter(({ status }) => status === 'done')
							.map(({ card }) => card)) {
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

	// If act area directly drops no cards, but some of its bosses can
	const cardsFromActBosses = poeData.acts
		.filter(
			actArea =>
				actArea.id === query ||
				actArea.name.toLowerCase().includes(query) ||
				(query.includes('a') && actNumber === actArea.act)
		)
		.flatMap(({ bossfights }) => bossfights)
		.flatMap(({ name }) => cardsByActboss(name, divcordTable.records))
		.filter(({ status }) => status === 'done')
		.map(({ card }) => card);

	return cards.concat(cardsFromActBosses);
}

function findBySourceType(query: string, records: DivcordRecord[], poeData: PoeData): string[] {
	const types = SOURCE_TYPE_VARIANTS.filter(type => type.toLowerCase().includes(query));
	return cardsBySourceTypes(types, records, poeData).flatMap(({ cards }) => cards.map(({ card }) => card));
}
