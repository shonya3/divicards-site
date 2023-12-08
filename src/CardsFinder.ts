import { ISourcefulDivcordTableRecord, SourcefulDivcordTable, SourcefulDivcordTableRecord } from './divcord';
import { PoeData, poeData, IMapBoss } from './PoeData';
import { ISource, SourceType, SourceWithMember } from './ISource.interface';

export const includesMap = (name: string, maps: string[]): boolean => {
	const short = name.replace('Map', '').trim();

	return maps.some(
		m =>
			m.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
			m.toLowerCase().trim().includes(short.toLowerCase().trim())
	);
};

export type CardFromSource = { card: string; boss?: SourceWithMember };

export class CardsFinder {
	divcordTable: SourcefulDivcordTable;
	constructor(divcordTable: SourcefulDivcordTable) {
		this.divcordTable = divcordTable;
	}

	get records(): SourcefulDivcordTableRecord[] {
		return this.divcordTable.records;
	}

	cardsByMaps(): Record<string, CardFromSource[]> {
		const { sourcesAndCards } = cardsBySourceTypes(['Map'], this.divcordTable.records, poeData);
		const entries = sourcesAndCards.map(({ source, cards }) => [source.id, cards]);
		return Object.fromEntries(entries);
	}

	cardsFromSource(source: ISource): CardFromSource[] {
		return cardsBySource(source, this.divcordTable.records, poeData);
	}
}

export function sortByWeight(cards: CardFromSource[] | string[], poeData: Readonly<PoeData>): void {
	cards.sort((a, b) => {
		const aWeight = poeData.card(typeof a === 'string' ? a : a.card)?.weight;
		const bWeight = poeData.card(typeof b === 'string' ? b : b.card)?.weight;
		return Number(aWeight) - Number(bWeight);
	});
}

export function bossesInMap(map: string, poeData: PoeData): IMapBoss[] {
	const imap = poeData.maps.find(m => m.name === map);
	if (!imap) return [];
	return poeData.mapbosses.filter(b => b.maps.includes(imap.name));
}

export function cardsByMapboss(boss: string, records: ISourcefulDivcordTableRecord[], poeData: PoeData): string[] {
	const cards: string[] = [];
	if (!poeData.mapbosses.some(b => b.name === boss)) {
		return cards;
	}

	for (const record of records) {
		if ((record.sources ?? []).some(s => s.id === boss)) {
			cards.push(record.card);
		}
	}

	return cards;
}

export function cardsByActboss(boss: string, records: ISourcefulDivcordTableRecord[]): string[] {
	const cards: string[] = [];

	for (const record of records) {
		if ((record.sources ?? []).some(s => s.id === boss)) {
			cards.push(record.card);
		}
	}

	return cards;
}

export type SourceAndCards = {
	source: ISource;
	cards: Array<CardFromSource>;
};

export function cardsBySource(
	source: ISource,
	records: ISourcefulDivcordTableRecord[],
	poeData: PoeData
): CardFromSource[] {
	const set: Set<string> = new Set();

	const cards: CardFromSource[] = [];

	for (const record of records) {
		const fileteredSources = (record.sources ?? []).filter(
			s => s.id === source.id && s.kind === source.kind && s.type === source.type
		);
		for (const source of fileteredSources) {
			cards.push({ card: record.card });
			if (source.type === 'Map') {
				if (!set.has(source.id)) {
					set.add(source.id);
					for (const boss of bossesInMap(source.id, poeData)) {
						for (const card of cardsByMapboss(boss.name, records, poeData)) {
							cards.push({
								card,
								boss: { id: boss.name, kind: 'source-with-member', type: 'Map Boss' },
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
								card,
								boss: { id: fight.name, kind: 'source-with-member', type: 'Act Boss' },
							});
						}
					}
				}
			}
		}
	}

	return cards;
}

export function cardsBySourceTypes(
	sourceTypes: SourceType[],
	records: ISourcefulDivcordTableRecord[],
	poeData: PoeData
): { sourcetypesCountsMap: Map<SourceType, number>; sourcesAndCards: SourceAndCards[] } {
	const map: Map<string, CardFromSource[]> = new Map();
	const sourceMap: Map<string, ISource> = new Map();
	const set: Set<string> = new Set();

	for (const record of records) {
		const fileteredSources = (record.sources ?? []).filter(s => sourceTypes.includes(s.type));
		for (const source of fileteredSources) {
			sourceMap.set(source.id, source);
			const cards = map.get(source.id) ?? [];
			cards.push({ card: record.card });
			if (source.type === 'Map') {
				if (!set.has(source.id)) {
					set.add(source.id);
					for (const boss of bossesInMap(source.id, poeData)) {
						for (const card of cardsByMapboss(boss.name, records, poeData)) {
							cards.push({
								card,
								boss: { id: boss.name, kind: 'source-with-member', type: 'Map Boss' },
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
								card,
								boss: { id: fight.name, kind: 'source-with-member', type: 'Act Boss' },
							});
						}
					}
				}
			}
			map.set(source.id, cards);
		}
	}

	let sourcetypesCountsMap: Map<SourceType, number> = new Map();
	const sourcesAndCards = Array.from(map.entries()).map(([sourceId, cards]) => {
		const source = sourceMap.get(sourceId)!;
		const count = sourcetypesCountsMap.get(source.type) ?? 0;
		sourcetypesCountsMap.set(source.type, count + 1);
		return { source, cards };
	});

	const entries = Array.from(sourcetypesCountsMap);
	entries.sort(([_, aCount], [__, bCount]) => {
		return bCount - aCount;
	});

	sourcetypesCountsMap = new Map(entries);

	return { sourcetypesCountsMap, sourcesAndCards };
}
