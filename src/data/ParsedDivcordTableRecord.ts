import { IParsedDivcordTableRecord, IGreynote, IConfidence, IRemaininWork, ISource } from './records.types';

export class ParsedDivcordTableRecord implements IParsedDivcordTableRecord {
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
	constructor(record: IParsedDivcordTableRecord) {
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

	static sourcesByCard(records: IParsedDivcordTableRecord[]): Record<string, ISource[]> {
		const sourcesByCardRecord: Record<string, ISource[]> = {};

		for (const record of records) {
			const card = record.card;
			const sources = sourcesByCardRecord[card] ?? [];
			sourcesByCardRecord[card] = sources.concat(record.sources ?? []);
		}

		return sourcesByCardRecord;
	}
}

// class DivcordTable {
// 	records: ParsedDivcordTableRecord[];
// 	constructor(records: ParsedDivcordTableRecord[]) {
// 		this.records = records;
// 	}

// 	bossesByMap(map: string) {}
// }
