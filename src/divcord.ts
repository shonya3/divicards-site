import type { ISource } from './gen/ISource.interface';
import { ISourcefulDivcordTableRecord, IGreynote, IConfidence, IRemainingWork } from './gen/divcordRecordsFromJson';

type CardName = string;

/** Represents the divcord spreadsheet https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0  */
export class SourcefulDivcordTable {
	records: SourcefulDivcordTableRecord[];
	constructor(records: SourcefulDivcordTableRecord[]) {
		this.records = records;
	}

	/** Returns Map, where key is card name and value is Source object with global drop type and information about min and max level drop */
	globalDrops(): Map<CardName, ISource> {
		const drops: Map<CardName, ISource> = new Map();
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
	sourcesByCard(card: string): ISource[] {
		let sources: ISource[] = [];
		for (const record of this.records) {
			if (record.card === card) {
				sources.push(...(record.sources ?? []));
			}
		}

		return Array.from(new Set(sources));
	}

	/** Returns Map, where key is card name and value is Array of sources from all records, accociated with given card */
	cardSourcesMap(): Map<CardName, ISource[]> {
		const map: Map<string, ISource[]> = new Map();

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
	recordsByCard(card: string): SourcefulDivcordTableRecord[] {
		return this.records.filter(record => record.card === card);
	}
}

export class SourcefulDivcordTableRecord implements ISourcefulDivcordTableRecord {
	id: number;
	card: string;
	greynote: IGreynote;
	tagHypothesis?: string | undefined;
	confidence: IConfidence;
	remainingWork: IRemainingWork;
	sources?: ISource[] | undefined;
	wikiDisagreements?: string | undefined;
	verifySources: ISource[];
	sourcesWithTagButNotOnWiki?: string | undefined;
	notes?: string | undefined;
	constructor(record: ISourcefulDivcordTableRecord) {
		this.id = record.id;
		this.card = record.card;
		this.greynote = record.greynote;
		this.tagHypothesis = record.tagHypothesis;
		this.confidence = record.confidence;
		this.remainingWork = record.remainingWork;
		this.sources = record.sources;
		this.wikiDisagreements = record.wikiDisagreements;
		this.sourcesWithTagButNotOnWiki = record.sourcesWithTagButNotOnWiki;
		this.verifySources = record.verifySources;
		this.notes = record.notes;
	}
}
