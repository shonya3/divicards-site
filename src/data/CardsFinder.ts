import {
	ISourcefulDivcordTableRecord,
	SourcefulDivcordTable,
	SourcefulDivcordTableRecord,
} from './SourcefulDivcordTableRecord';
import { IMap, PoeData, poeData, IMapBoss } from '../PoeData';
import { EmptySourceKind, ISource, SourceType, SourceWithMember, SourceWithMemberKind } from './ISource.interface';

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
	#cardsByMaps: Record<IMap['name'], CardFromSource[]> = {};
	divcordTable: SourcefulDivcordTable;
	constructor(divcordTable: SourcefulDivcordTable) {
		this.divcordTable = divcordTable;

		this.#cardsByMaps = this.#createCardsByMaps();
	}

	get records(): SourcefulDivcordTableRecord[] {
		return this.divcordTable.records;
	}

	cardsByMaps() {
		return this.#cardsByMaps;
	}

	cardsByMap(map: string) {
		return this.#cardsByMaps[map];
	}

	mapnames() {
		return poeData.maps.map(m => m.name);
	}

	#cardsByMap(map: string): CardFromSource[] {
		const cards: CardFromSource[] = [];

		for (const record of this.records) {
			for (const source of record?.sources ?? []) {
				if (source.type === 'Map' && source.kind === 'source-with-member' && source.id === map) {
					cards.push({ card: record.card });
				}
			}
		}

		const bosses = poeData.bossesByMap(map);
		for (const bossname of bosses) {
			for (const card of this.cardsByBoss(bossname)) {
				cards.push({ card, boss: { id: bossname, kind: 'source-with-member', type: 'Map Boss' } });
			}
		}

		return cards;
	}

	#createCardsByMaps(): Record<string, CardFromSource[]> {
		const map: Map<string, CardFromSource[]> = new Map();
		for (const m of this.mapnames()) {
			const cards = this.#cardsByMap(m);
			sortByWeight(cards, poeData);
			map.set(m, cards);
		}

		return Object.fromEntries(map);
	}

	cardsByBoss(bossname: string): string[] {
		const cards: string[] = [];

		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				if (source.type === 'Map Boss' && source.kind === 'source-with-member' && bossname == source.id) {
					cards.push(record.card);
				}
			}
		}

		return cards;
	}

	cardsByActArea(actId: string): CardFromSource[] {
		const cards: CardFromSource[] = [];

		for (const record of this.records) {
			for (const source of record?.sources ?? []) {
				if (source.type === 'Act' && source.kind === 'source-with-member' && source.id === actId) {
					cards.push({ card: record.card });
				}
			}
		}

		const area = poeData.acts.find(act => act.id === actId);
		if (area) {
			for (const bossfight of area.bossfights) {
				const cardsByActBoss = this.cardsByActBoss(bossfight.name);
				for (const card of cardsByActBoss) {
					cards.push({
						card,
						boss: { id: bossfight.name, type: 'Act Boss', kind: 'source-with-member' },
					});
				}
			}
		}

		return cards;
	}

	cardsByActBoss(bossname: string): string[] {
		const cards: string[] = [];

		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				if (source.type === 'Act Boss' && source.kind === 'source-with-member' && bossname == source.id) {
					cards.push(record.card);
				}
			}
		}

		return cards;
	}

	cardsByIdSource(source: SourceWithMember): string[] {
		const cards: string[] = [];

		if (!source.id) {
			return cards;
		}

		for (const record of this.records) {
			for (const s of record.sources ?? []) {
				if (s.type === source.type && s.id == source.id) {
					cards.push(record.card);
				}
			}
		}

		return cards;
	}

	cardsBySources(): [ISource, string[]][] {
		const map: Map<string, string[]> = new Map();
		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				const json = JSON.stringify(source);
				const arr = map.get(json) ?? [];
				arr.push(record.card);
				map.set(json, arr);
			}
		}

		// const resultMap: Map<ISource, string[]> = new Map();
		// for (const [sourceJson, cards] of map) {
		// 	const source = JSON.parse(sourceJson);
		// 	resultMap.set(source, cards);
		// }

		// return resultMap;

		const arr: [ISource, string[]][] = [];
		for (const [sourceJson, cards] of map) {
			const source = JSON.parse(sourceJson);
			arr.push([source, cards]);
		}

		for (const [_source, cards] of arr) {
			sortByWeight(cards, poeData);
		}

		return arr;
	}

	cardsFromSource(source: ISource): CardFromSource[] {
		const cardsFromSource: CardFromSource[] = [];
		for (const record of this.records) {
			for (const s of record.sources ?? []) {
				if (s.kind === 'source-with-member') {
					if (s.kind === source.kind && s.type === source.type && s.id === source.id) {
						if (s.type === 'Map') {
							cardsFromSource.push(...this.cardsByMap(s.id));
						} else if (s.type === 'Act') {
							cardsFromSource.push(...this.cardsByActArea(s.id));
						} else {
							cardsFromSource.push({ card: record.card });
						}
					}
				} else {
					if (s.type === source.type) {
						cardsFromSource.push({ card: record.card });
					}
				}
			}
		}

		const unique: CardFromSource[] = Array.from(new Set(cardsFromSource.map(el => JSON.stringify(el)))).map(el =>
			JSON.parse(el)
		);
		sortByWeight(unique, poeData);

		return unique;
	}

	// cardsBySourceType(type: SourceType) {
	// 	let kind: ISource['kind'];
	// 	for (const record of this.records) {
	// 		for (const source of record.sources ?? []) {
	// 			if (source.type === type) {
	// 				kind = source.kind;
	// 				break;
	// 			}
	// 		}
	// 	}

	// 	if (!kind!) {
	// 		throw new Error('Kind is not defined');
	// 	}

	// 	if (kind === 'empty-source') {
	// 		const c = this.cardsByEmptySource(type);
	// 		sortByWeight(c.cards, poeData);
	// 		return c;
	// 	} else if (kind === 'source-with-member') {
	// 		const c = this.cardsBySourceWithMember(type);
	// 		for (const [_map, cards] of c.cards) {
	// 			sortByWeight(cards, poeData);
	// 		}
	// 		return c;
	// 	} else throw new Error('Unsupported source kind');
	// }
	// cardsByEmptySource(type: SourceType): { kind: EmptySourceKind; cards: string[] } {
	// 	const cards: string[] = [];
	// 	for (const record of this.records) {
	// 		if ((record.sources ?? []).some(s => s.type === type)) {
	// 			cards.push(record.card);
	// 		}
	// 	}

	// 	return {
	// 		kind: 'empty-source',
	// 		cards: Array.from(new Set(cards)),
	// 	};
	// }
	// cardsBySourceWithMember(type: SourceType): { kind: SourceWithMemberKind; cards: [string, string[]][] } {
	// 	const map: Map<string, Set<string>> = new Map();
	// 	for (const record of this.records) {
	// 		for (const source of record.sources ?? []) {
	// 			if (source.kind === 'source-with-member' && source.type === type) {
	// 				const set = map.get(source.id) ?? new Set();
	// 				set.add(record.card);
	// 				map.set(source.id, set);
	// 			}
	// 		}
	// 	}

	// 	const outMap: Map<string, string[]> = new Map();
	// 	for (const [id, cards] of map) {
	// 		outMap.set(id, Array.from(cards));
	// 	}

	// 	return {
	// 		kind: 'source-with-member',
	// 		cards: Array.from(outMap),
	// 	};
	// }
}

export function sortByWeight(cards: CardFromSource[] | string[], poeData: Readonly<PoeData>): void {
	cards.sort((a, b) => {
		const aWeight = poeData.card(typeof a === 'string' ? a : a.card)?.weight;
		const bWeight = poeData.card(typeof b === 'string' ? b : b.card)?.weight;
		return Number(aWeight) - Number(bWeight);
	});
}

function bossesInMap(map: string, poeData: PoeData): IMapBoss[] {
	const imap = poeData.maps.find(m => m.name === map);
	if (!imap) return [];
	return poeData.mapbosses.filter(b => b.maps.includes(imap.name));
}

function cardsByMapboss(boss: string, records: ISourcefulDivcordTableRecord[], poeData: PoeData): string[] {
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

function cardsByActboss(boss: string, records: ISourcefulDivcordTableRecord[]): string[] {
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

export function cardsBySourceTypes(
	sourceTypes: SourceType[],
	records: ISourcefulDivcordTableRecord[],
	poeData: PoeData
): SourceAndCards[] {
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

	return Array.from(map.entries()).map(([sourceId, cards]) => {
		const source = sourceMap.get(sourceId)!;
		return { source, cards };
	});
}
