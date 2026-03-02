import { DivcordRecord } from '../gen/divcord';
import { Source } from '../gen/Source';

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

	/** Returns Array of records, accociated with given card */
	recordsByCard(card: string): DivcordRecord[] {
		return this.records.filter(record => record.card === card);
	}
}
