import { ISource, SourceType } from './ISource.interface';

export type IGreynote = (typeof greynoteVariants)[number];
export type IConfidence = (typeof confidenceVariants)[number];
export type IRemainingWork = (typeof remainingWorkVariants)[number];

export const greynoteVariants = [
	'Empty',
	'Monster-specific',
	'Area-specific',
	'disabled',
	'story',
	'Delirium_reward',
	'Chest_object',
	'strongbox',
	'Global Drop',
	'Vendor',
] as const;
export const remainingWorkVariants = [
	'n/a',
	'confirm',
	'unclear hypothesis',
	'no hypothesis',
	'story only',
	'legacy tag',
	'open ended',
] as const;
export const confidenceVariants = ['none', 'low', 'ok', 'done'] as const;

export interface ISourcefulDivcordTableRecord {
	id: number;
	card: string;
	greynote: IGreynote;
	tagHypothesis?: string;
	confidence: IConfidence;
	remainingWork: IRemainingWork;
	wikiDisagreements?: string;
	sourcesWithTagButNotOnWiki?: string;
	notes?: string;
	sources?: ISource[];
}

export const createDivcordTable = (recordsData: ISourcefulDivcordTableRecord[]) => {
	return new SourcefulDivcordTable(recordsData.map(r => new SourcefulDivcordTableRecord(r)));
};

export class SourcefulDivcordTable {
	records: SourcefulDivcordTableRecord[];
	constructor(records: SourcefulDivcordTableRecord[]) {
		this.records = records;
	}

	cards() {
		return Array.from(new Set(this.records.map(r => r.card)));
	}

	sourcesByCard(card: string): ISource[] {
		const sources: ISource[] = [];
		for (const record of this.records) {
			if (record.card === card) {
				sources.push(...(record.sources ?? []));
			}
		}

		return Array.from(new Set(sources));
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

	cardsBySourceTypes(...types: SourceType[]) {
		const cards: string[] = [];
		for (const record of this.records) {
			const cardHasSomeSourceType = (record.sources ?? []).some(source => {
				return types.some(type => source.type === type);
			});
			if (cardHasSomeSourceType) {
				cards.push(record.card);
			}
		}

		return Array.from(new Set(cards));
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
