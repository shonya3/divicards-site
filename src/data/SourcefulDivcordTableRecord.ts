import { EmptySourceKind, ISource, SourceType, SourceWithMemberKind } from './ISource.interface';
import { ISourcefulDivcordTableRecord, IGreynote, IConfidence, IRemaininWork } from './records.types';

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

	cardsBySourceTypes2(...types: SourceType[]) {
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

	cardsBySourceType(type: SourceType) {
		let kind: ISource['kind'];
		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				if (source.type === type) {
					kind = source.kind;
					break;
				}
			}
		}

		if (!kind!) {
			throw new Error('Kind is not defined');
		}

		if (kind === 'empty-source') {
			return this.cardsByEmptySource(type);
		} else if (kind === 'source-with-member') {
			return this.cardsBySourceWithMember(type);
		} else throw new Error('Unsupported source kind');
	}
	cardsByEmptySource(type: SourceType): { kind: EmptySourceKind; cards: string[] } {
		const cards: string[] = [];
		for (const record of this.records) {
			if ((record.sources ?? []).some(s => s.type === type)) {
				cards.push(record.card);
			}
		}

		return {
			kind: 'empty-source',
			cards: Array.from(new Set(cards)),
		};
	}
	cardsBySourceWithMember(type: SourceType): { kind: SourceWithMemberKind; cards: [string, string[]][] } {
		const map: Map<string, Set<string>> = new Map();
		for (const record of this.records) {
			for (const source of record.sources ?? []) {
				if (source.kind === 'source-with-member' && source.type === type) {
					const set = map.get(source.id) ?? new Set();
					set.add(record.card);
					map.set(source.id, set);
				}
			}
		}

		const outMap: Map<string, string[]> = new Map();
		for (const [id, cards] of map) {
			outMap.set(id, Array.from(cards));
		}

		return {
			kind: 'source-with-member',
			cards: Array.from(outMap),
		};
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
