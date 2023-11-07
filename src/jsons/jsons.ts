import { ISourcefulDivcordTableRecord } from '../data/records.types';
import { IPoeData } from '../data/poeData.types';

import divcordRecordsJson from '../jsons/records.json';
export const divcordRecords = divcordRecordsJson as ISourcefulDivcordTableRecord[];

import poeDataJson from '../jsons/poeData.json';

export const poeData = poeDataJson as IPoeData;

import divcordDataJson from './divcord.json';
import { IDivcordData } from '../data/types';
export const divcordData = divcordDataJson as IDivcordData;
