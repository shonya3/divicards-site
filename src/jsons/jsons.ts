import type { ISourcefulDivcordTableRecord } from '../data/SourcefulDivcordTableRecord';
import divcordDataJson from './divcord.json';
import type { IPoeData } from '../PoeData';
import _poeDataJson from '../jsons/poeData.json';
import divcordRecordsJson from '../jsons/records.json';

export interface IDivcordData {
	sheet: object;
	rich_sources_column: object;
}

export const divcordRecords = divcordRecordsJson as ISourcefulDivcordTableRecord[];
export const poeDataJson = _poeDataJson as IPoeData;
export const divcordData = divcordDataJson as IDivcordData;
