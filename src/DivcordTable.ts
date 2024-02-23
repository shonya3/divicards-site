import type { Source } from './gen/Source';
import type { DivcordRecord } from './gen/divcordRecordsFromJson';

type CardName = string;

/** Represents the divcord spreadsheet https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0  */
export class DivcordTable {
	records: DivcordRecord[];
	constructor(records: DivcordRecord[]) {
		this.records = records;
	}

	/** Returns Map, where key is card name and value is Source object with global drop type and information about min and max level drop */
	globalDrops(): Map<CardName, Source> {
		const drops: Map<CardName, Source> = new Map();
		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				if (source.type === 'Global Drop') {
					drops.set(record.card, source);
				}
			}
		}

		return drops;
	}

	/** Returns Array of all card names */
	cards(): CardName[] {
		return Array.from(new Set(this.records.map(r => r.card)));
	}

	/** Returns Array of sources from all records, accociated with given card */
	sourcesByCard(card: string): Source[] {
		let sources: Source[] = [];
		for (const record of this.records) {
			if (record.card === card) {
				sources.push(...(record.sources ?? []));
			}
		}

		return Array.from(new Set(sources));
	}

	/** Returns Map, where key is card name and value is Array of sources from all records, accociated with given card */
	cardSourcesMap(): Map<CardName, Source[]> {
		const map: Map<string, Source[]> = new Map();

		for (const record of this.records) {
			const entry = map.get(record.card) ?? [];
			for (const source of record.sources ?? []) {
				entry.push(source);
			}
			map.set(record.card, entry);
		}

		return map;
	}

	/** Returns Array of records, accociated with given card */
	recordsByCard(card: string): DivcordRecord[] {
		return this.records.filter(record => record.card === card);
	}
}
