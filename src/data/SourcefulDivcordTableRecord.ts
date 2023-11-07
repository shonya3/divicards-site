import { ISource } from './ISource.interface.ts.ts';
import { ISourcefulDivcordTableRecord, IGreynote, IConfidence, IRemaininWork } from './records.types.ts';

export const createDivcordTable = (recordsData: ISourcefulDivcordTableRecord[]) => {
	return new SourcefulDivcordTable(recordsData.map(r => new SourcefulDivcordTableRecord(r)));
};

export class SourcefulDivcordTable {
	records: SourcefulDivcordTableRecord[];
	constructor(records: SourcefulDivcordTableRecord[]) {
		this.records = records;
	}

	sourcesByCards(): Record<string, ISource[]> {
		const sourcesByCardRecord: Record<string, ISource[]> = {};

		for (const record of this.records) {
			const card = record.card;
			const sources = sourcesByCardRecord[card] ?? [];
			sourcesByCardRecord[card] = sources.concat(record.sources ?? []);
		}

		return sourcesByCardRecord;
	}

	recordsByCard(card: string): SourcefulDivcordTableRecord[] {
		return this.records.filter(record => record.card === card);
	}
}

export class SourcefulDivcordTableRecord implements ISourcefulDivcordTableRecord {
	id: number;
	card: string;
	greynote?: IGreynote | undefined;
	tagHypothesis?: string | undefined;
	confidence: IConfidence;
	remainingWork?: IRemaininWork | undefined;
	sources?: ISource[] | undefined;
	wikiDisagreements?: string | undefined;
	sourcesWithTagButNotOnWiki?: string | undefined;
	notes?: string | undefined;
	constructor(record: ISourcefulDivcordTableRecord) {
		this.id = record.id;
		this.card = record.card;
		this.greynote = record.greynote;
		this.tagHypothesis = record.tagHypothesis;
		this.confidence = record.confidence;
		this.sources = record.sources;
		this.wikiDisagreements = record.wikiDisagreements;
		this.sourcesWithTagButNotOnWiki = record.sourcesWithTagButNotOnWiki;
		this.notes = record.notes;
	}

	source(type: 'mapBoss' | 'map' | 'act' | 'actBoss'): ISource[] {
		//@ts-ignore
		return Object.groupBy(this.sources ?? [], ({ type }) => type)[type] ?? [];
	}

	mapBosses(): ISource[] {
		return this.source('mapBoss');
	}

	maps(): ISource[] {
		return this.source('map');
	}

	acts(): ISource[] {
		return this.source('act');
	}

	actBosses(): ISource[] {
		return this.source('act');
	}
}

// class DivcordTable {
// 	records: SourcefulDivcordTableRecord[];
// 	constructor(records: SourcefulDivcordTableRecord[]) {
// 		this.records = records;
// 	}

// 	bossesByMap(map: string) {}
// }
