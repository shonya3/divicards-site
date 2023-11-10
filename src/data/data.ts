import { SourcefulDivcordTableRecord } from './SourcefulDivcordTableRecord';
import { PoeData } from '../PoeData';
import { ICard, IMap } from './poeData.types';

export const includesMap = (name: string, maps: string[]): boolean => {
	const short = name.replace('Map', '').trim();

	return maps.some(
		m =>
			m.toLowerCase().trim().includes(name.toLowerCase().trim()) ||
			m.toLowerCase().trim().includes(short.toLowerCase().trim())
	);
};

export const cardsByMaps = (poeData: PoeData, records: SourcefulDivcordTableRecord[]) => {
	return new Data(poeData, records).cardsByMaps();
};

export class Data {
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
				if (source.type === 'Map' && source.id === map) {
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
				if (source.type === 'Map Boss' && bossname == source.id) {
					cards.push(record.card);
				}
			}
		}

		return cards;
	}
}
