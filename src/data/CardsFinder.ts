import { SourcefulDivcordTable, SourcefulDivcordTableRecord } from './SourcefulDivcordTableRecord';
import { IMap, PoeData, poeData } from '../PoeData';
import { ISource, SourceWithMember } from './ISource.interface';

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
			map.set(m, this.#cardsByMap(m));
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
				if (s.type === source.type && s.kind === 'source-with-member' && s.id == source.id) {
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

		return arr;
	}

	cardsFromSource(source: ISource): CardFromSource[] {
		const cardsFromSource: CardFromSource[] = [];
		for (const record of this.records) {
			for (const s of record.sources ?? []) {
				if (s.kind === 'source-with-member') {
					if (s.kind === source.kind && s.type === source.type && s.id === source.id) {
						if (s.type === 'Map') {
							const cards = this.cardsByMap(s.id);
							for (const card of cards) {
								cardsFromSource.push(card);
							}
						} else if (s.type === 'Act') {
							const cards = this.cardsByActArea(s.id);
							for (const card of cards) {
								cardsFromSource.push(card);
							}
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
}

export function sortByWeight(cards: CardFromSource[], poeData: Readonly<PoeData>): void {
	cards.sort((a, b) => {
		const aWeight = poeData.card(a.card)?.weight;
		const bWeight = poeData.card(b.card)?.weight;
		return Number(aWeight) - Number(bWeight);
	});
}
