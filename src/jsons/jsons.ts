import type { ISourcefulDivcordTableRecord } from '../divcord';
import type { IPoeData } from '../PoeData';
import _poeDataJson from '../jsons/poeData.json';
import divcordRecordsJson from '../jsons/records.json';

export const divcordRecords = divcordRecordsJson as ISourcefulDivcordTableRecord[];
export const poeDataJson = _poeDataJson as IPoeData;
