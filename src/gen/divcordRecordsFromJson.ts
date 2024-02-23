import { ISource } from './ISource.interface';
import json from './records.json';
export const divcordRecordsFromJson = json as DivcordRecord[];

/** Represents one row from divcord spreadsheet https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0  */
export type DivcordRecord = {
	id: number;
	card: string;
	greynote: IGreynote;
	tagHypothesis?: string;
	confidence: IConfidence;
	remainingWork: IRemainingWork;
	wikiDisagreements?: string;
	sourcesWithTagButNotOnWiki?: string;
	verifySources: ISource[];
	notes?: string;
	sources?: ISource[];
};

export type IGreynote = (typeof GREYNOTE_VARIANTS)[number];
export type IConfidence = (typeof CONFIDENCE_VARIANTS)[number];
export type IRemainingWork = (typeof REMAINING_WORK_VARIANTS)[number];

export const GREYNOTE_VARIANTS = [
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
export const REMAINING_WORK_VARIANTS = [
	'n/a',
	'confirm',
	'unclear hypothesis',
	'no hypothesis',
	'story only',
	'legacy tag',
	'open ended',
] as const;
export const CONFIDENCE_VARIANTS = ['none', 'low', 'ok', 'done'] as const;
