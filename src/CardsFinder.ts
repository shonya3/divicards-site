import { SourcefulDivcordTable } from './divcord';
import { DivcordRecord } from './gen/divcordRecordsFromJson';
import { SourceWithMember, ISource, SourceType, sourceTypes } from './gen/ISource.interface';
import { PoeData, poeData, IMapBoss } from './PoeData';

export const includesMap = (name: string, maps: string[]): boolean => {
	const short = name.replace('Map', '').trim();

	return maps.some(
		m =>
			m.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
			m.toLowerCase().trim().includes(short.toLowerCase().trim())
	);
};

export type VerificationStatus = 'done' | 'verify';
/** Card name and some source metadata */
export type CardBySource = { card: string; transitiveSource?: SourceWithMember; status: VerificationStatus };

export class CardsFinder {
	divcordTable: SourcefulDivcordTable;
	constructor(divcordTable: SourcefulDivcordTable) {
		this.divcordTable = divcordTable;
	}

	get records(): DivcordRecord[] {
		return this.divcordTable.records;
	}

	cardsByMaps(): Record<string, CardBySource[]> {
		const sourcesAndCards = cardsBySourceTypes(['Map'], this.divcordTable.records, poeData);
		const entries = sourcesAndCards.map(({ source, cards }) => [source.id, cards]);
		return Object.fromEntries(entries);
	}

	cardsBySource(source: ISource): CardBySource[] {
		return cardsBySource(source, this.divcordTable.records, poeData);
	}
}

export function sortByWeight(cards: { card: string }[] | string[], poeData: Readonly<PoeData>): void {
	const SORT_TO_THE_END_VALUE = 1_000_000;
	cards.sort((a, b) => {
		const aWeight = poeData.card(typeof a === 'string' ? a : a.card)?.weight || SORT_TO_THE_END_VALUE;
		const bWeight = poeData.card(typeof b === 'string' ? b : b.card)?.weight || SORT_TO_THE_END_VALUE;
		return Number(aWeight) - Number(bWeight);
	});
}

export function bossesInMap(map: string, poeData: PoeData): IMapBoss[] {
	const imap = poeData.maps.find(m => m.name === map);
	if (!imap) return [];
	return poeData.mapbosses.filter(b => b.maps.includes(imap.name));
}

export function cardsByMapboss(boss: string, records: DivcordRecord[], poeData: PoeData): CardBySource[] {
	const cards: CardBySource[] = [];
	if (!poeData.mapbosses.some(b => b.name === boss)) {
		return cards;
	}

	for (const record of records) {
		if ((record.sources ?? []).some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'done' });
		}

		if (record.verifySources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	return cards;
}

export function isGlobalDropApplies(level: number, source: ISource): boolean {
	if (source.type !== 'Global Drop') throw new Error('Expected Global Drop sourcetype');
	const minLevel = source.min_level ?? 0;
	const maxLevel = source.max_level ?? 100;
	return level >= minLevel && level <= maxLevel;
}

export function cardsByActboss(boss: string, records: DivcordRecord[]): CardBySource[] {
	const cards: CardBySource[] = [];

	for (const record of records) {
		if ((record.sources ?? []).some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'done' });
		}

		if (record.verifySources.some(s => s.id === boss)) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	return cards;
}

export type SourceAndCards = {
	source: ISource;
	cards: Array<CardBySource>;
};

export function cardsBySource(source: ISource, records: DivcordRecord[], poeData: PoeData): CardBySource[] {
	const cards: CardBySource[] = [];

	if (source.type === 'Map') {
		for (const boss of bossesInMap(source.id, poeData)) {
			for (const card of cardsByMapboss(boss.name, records, poeData)) {
				cards.push({
					...card,
					transitiveSource: { id: boss.name, kind: 'source-with-member', type: 'Map Boss' },
				});
			}
		}
	}

	if (source.type === 'Act') {
		const actArea = poeData.acts.find(a => a.id === source.id)!;
		for (const fight of actArea.bossfights) {
			for (const card of cardsByActboss(fight.name, records)) {
				cards.push({
					...card,
					transitiveSource: { id: fight.name, kind: 'source-with-member', type: 'Act Boss' },
				});
			}
		}
	}

	for (const record of records) {
		// for DONE sources
		const sourcePresentsInRecord = (record.sources ?? []).some(
			s => s.id === source.id && s.kind === source.kind && s.type === source.type
		);

		if (sourcePresentsInRecord) {
			cards.push({ card: record.card, status: 'done' });
			continue;
		}

		// for VERIFY sources
		const verifySourcePresentsInRecord = record.verifySources.some(
			s => s.id === source.id && s.kind === source.kind && s.type === source.type
		);

		if (verifySourcePresentsInRecord) {
			cards.push({ card: record.card, status: 'verify' });
		}
	}

	return cards;
}

export function cardsBySourceTypes(
	sourceTypes: SourceType[],
	records: DivcordRecord[],
	poeData: PoeData
): SourceAndCards[] {
	const map: Map<string, CardBySource[]> = new Map();
	const sourceMap: Map<string, ISource> = new Map();
	const set: Set<string> = new Set();

	for (const record of records) {
		const fileteredSources = (record.sources ?? []).filter(s => sourceTypes.includes(s.type));
		for (const source of fileteredSources) {
			sourceMap.set(source.id, source);
			const cards = map.get(source.id) ?? [];
			cards.push({ card: record.card, status: 'done' });
			if (source.type === 'Map') {
				if (!set.has(source.id)) {
					set.add(source.id);
					for (const boss of bossesInMap(source.id, poeData)) {
						for (const card of cardsByMapboss(boss.name, records, poeData)) {
							cards.push({
								transitiveSource: { id: boss.name, kind: 'source-with-member', type: 'Map Boss' },
								...card,
							});
						}
					}
				}
			}
			if (source.type === 'Act') {
				if (!set.has(source.id)) {
					set.add(source.id);
					const actArea = poeData.acts.find(a => a.id === source.id)!;
					for (const fight of actArea.bossfights) {
						for (const card of cardsByActboss(fight.name, records)) {
							cards.push({
								...card,
								transitiveSource: { id: fight.name, kind: 'source-with-member', type: 'Act Boss' },
							});
						}
					}
				}
			}

			map.set(source.id, cards);
		}

		const filteredVerifySources = record.verifySources.filter(s => sourceTypes.includes(s.type));
		for (const source of filteredVerifySources) {
			sourceMap.set(source.id, source);
			const cards = map.get(source.id) ?? [];
			cards.push({ card: record.card, status: 'verify' });

			map.set(source.id, cards);
		}
	}

	// If act area directly drops no cards, but some of ot's bosses can
	if (sourceTypes.includes('Act')) {
		for (const area of poeData.acts) {
			if (!map.has(area.id)) {
				const cards = map.get(area.id) ?? [];
				for (const fight of area.bossfights) {
					for (const card of cardsByActboss(fight.name, records)) {
						cards.push({
							...card,
							transitiveSource: { id: fight.name, kind: 'source-with-member', type: 'Act Boss' },
						});
					}
				}

				map.set(area.id, cards);
				sourceMap.set(area.id, { id: area.id, type: 'Act', kind: 'source-with-member' });
			}
		}
	}

	// If map area directly drops no cards, but some of ot's bosses can
	if (sourceTypes.includes('Map')) {
		for (const boss of poeData.mapbosses) {
			for (const atlasMapName of boss.maps) {
				if (!map.has(atlasMapName)) {
					const cardsFromBoss: CardBySource[] = cardsByMapboss(boss.name, records, poeData).map(card => {
						return {
							...card,
							transitiveSource: { id: boss.name, type: 'Map Boss', kind: 'source-with-member' },
						};
					});

					map.set(atlasMapName, cardsFromBoss);
					sourceMap.set(atlasMapName, { id: atlasMapName, type: 'Map', kind: 'source-with-member' });
				}
			}
		}
	}

	const sourcesAndCards = Array.from(map.entries()).map(([sourceId, cards]) => {
		const source = sourceMap.get(sourceId)!;
		return { source, cards };
	});

	return sourcesAndCards;
}

/**
 * Creates a map with key: SourceType and value: number of sources of this type.
 * For Example, key: "Map", and it's value: 177 mean, that there are 177 maps overall
 * @param records Records from divcord table
 * @param poeData
 * @returns
 */
export function sourcetypesMap(records: DivcordRecord[], poeData: PoeData): Map<SourceType, number> {
	const sourcesAndCards = cardsBySourceTypes(Array.from(sourceTypes), records, poeData);
	return _sourcetypesMap(sourcesAndCards);
}

/**
 * Creates a map with key: SourceType and value: number of sources of this type.
 * For Example, key: "Map", and it's value: 177 mean, that there are 177 maps overall
 * @param sourcesAndCards
 */
export function _sourcetypesMap(sourcesAndCards: SourceAndCards[]): Map<SourceType, number> {
	let map: Map<SourceType, number> = new Map();

	for (const { source } of sourcesAndCards) {
		const sourceType = source.type;
		const count = map.get(sourceType) ?? 0;
		map.set(sourceType, count + 1);
	}

	const entries = Array.from(map);
	entries.sort(([_, aCount], [__, bCount]) => {
		return bCount - aCount;
	});

	map = new Map(entries);

	return map;
}
