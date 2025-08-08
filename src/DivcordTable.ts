import { DivcordRecord } from '../gen/divcord';
import { Source } from '../gen/Source';

type CardName = string;

export type Sources = {
	done: Array<Source>;
	verify: Array<Source>;
};

/** Represents the divcord spreadsheet https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0  */
export class DivcordTable {
	records: DivcordRecord[];
	constructor(records: DivcordRecord[]) {
		this.records = records;
	}

	/** Returns Array of all card names */
	cards(): CardName[] {
		return Array.from(new Set(this.records.map(r => r.card)));
	}

	/** Returns Array of sources from all records, accociated with given card */
	sourcesByCard(card: string): Source[] {
		const ids: Set<string> = new Set();
		return this.records
			.filter(record => record.card === card)
			.flatMap(({ sources }) =>
				sources.filter(source => {
					if (ids.has(source.id)) {
						return false;
					} else {
						ids.add(source.id);
						return true;
					}
				})
			);
	}

	/** Returns Array of need-to-verify sources from all records, accociated with given card */
	verifySourcesByCard(card: string): Source[] {
		const ids: Set<string> = new Set();
		return this.records
			.filter(record => record.card === card)
			.flatMap(({ verifySources }) =>
				verifySources.filter(source => {
					if (ids.has(source.id)) {
						return false;
					} else {
						ids.add(source.id);
						return true;
					}
				})
			);
	}

	/** Returns Map, where key is card name and value is Array of sources from all records, accociated with given card */
	cardSourcesAndVerifySourcesMap(): Map<CardName, Source[]> {
		const map: Map<string, Source[]> = new Map();

		for (const record of this.records) {
			const entry = map.get(record.card) ?? [];
			record.sources.forEach(s => entry.push(s));
			record.verifySources.forEach(s => entry.push(s));
			map.set(record.card, entry);
		}

		return map;
	}

	/** Returns Map, where key is card name and value is Array of sources from all records, accociated with given card */
	cardSourcesMap(): Map<CardName, Source[]> {
		const map: Map<string, Source[]> = new Map();

		for (const record of this.records) {
			const entry = map.get(record.card) ?? [];
			for (const source of record.sources) {
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
