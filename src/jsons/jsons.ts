import { IParsedDivcordTableRecord } from '../data/records.types';
import { IPoeData } from '../data/poeData.types';

import divcordRecordsJson from '../jsons/records.json';
export const divcordRecords = divcordRecordsJson as IParsedDivcordTableRecord[];

import poeDataJson from '../jsons/poeData.json';

export const poeData = poeDataJson as IPoeData;

import divcordTableJson from './divcord_table.json';
import { IDivcordTable } from '../data/types';
export const divcordTable = divcordTableJson as IDivcordTable;
