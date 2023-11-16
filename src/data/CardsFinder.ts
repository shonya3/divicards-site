import { SourcefulDivcordTableRecord } from './SourcefulDivcordTableRecord';
import { PoeData } from '../PoeData';
import { ICard, IMap } from './poeData.types';
import { ISource, SourceWithMember } from './ISource.interface';

export const includesMap = (name: string, maps: string[]): boolean => {
	const short = name.replace('Map', '').trim();

	return maps.some(
		m =>
			m.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
			m.toLowerCase().trim().includes(short.toLowerCase().trim())
	);
};

export type CardByActArea = FromArea | FromAreaBoss;
export type FromAreaBoss = {
	from: 'Act Boss';
	card: string;
	actBoss: string;
};

export type FromArea = {
	from: 'Act';
	card: string;
};

export class CardsFinder {
	#cardsByMaps: Record<IMap['name'], Array<ICard['name']>> = {};
	poeData: PoeData;
	records: SourcefulDivcordTableRecord[];
	constructor(poeData: PoeData, records: SourcefulDivcordTableRecord[]) {
		this.poeData = poeData;
		this.records = records;

		this.#cardsByMaps = this.#createCardsByMaps();
	}

	cardsByMaps() {
		return this.#cardsByMaps;
	}

	cardsByMap(map: string) {
		return this.#cardsByMaps[map];
	}

	mapnames() {
		return this.poeData.maps.map(m => m.name);
	}

	#cardsByMap(map: string): string[] {
		const cards: string[] = [];

		for (const record of this.records) {
			for (const source of record?.sources ?? []) {
				if (source.type === 'Map' && source.kind === 'source-with-member' && source.id === map) {
					cards.push(record.card);
				}
			}
		}

		const bosses = this.poeData.bossesByMap(map);
		for (const bossname of bosses) {
			cards.push(...this.cardsByBoss(bossname));
		}

		return Array.from(new Set(cards));
	}

	#createCardsByMaps(): Record<string, string[]> {
		const map = new Map();
		for (const m of this.mapnames()) {
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

	cardsByActArea(actId: string): CardByActArea[] {
		const cards: CardByActArea[] = [];

		for (const record of this.records) {
			for (const source of record?.sources ?? []) {
				if (source.type === 'Act' && source.kind === 'source-with-member' && source.id === actId) {
					cards.push({ from: 'Act', card: record.card });
				}
			}
		}

		const area = this.poeData.acts.find(act => act.id === actId);
		if (area) {
			for (const bossfight of area.bossfights) {
				const cardsByActBoss = this.cardsByActBoss(bossfight.name);
				for (const card of cardsByActBoss) {
					cards.push({
						actBoss: bossfight.name,
						card: card,
						from: 'Act Boss',
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
}
