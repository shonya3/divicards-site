import type { ISourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord';
import { IDivcordData, poeDataJson } from './jsons/jsons';
const ONE_DAY_MILLISECONDS = 86_400_000;

const sheetUrl = () => {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const range = `${sheet}!A3:Z`;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	return url;
};

const richUrl = () => {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}?&ranges=${sheet}!F3:F&includeGridData=true&key=${key}`;
	return url;
};

export type DivcordResponses = {
	rich: Response;
	sheet: Response;
};

async function loadCachedResponses(cache: Cache): Promise<DivcordResponses | null> {
	const rich = await cache.match(richUrl());
	const sheet = await cache.match(sheetUrl());
	if (!rich || !sheet) return null;
	return { rich, sheet };
}

async function serializeDivcordResponses(responses: DivcordResponses): Promise<IDivcordData> {
	const [rich_sources_column, sheet] = await Promise.all([responses.rich.json(), responses.sheet.json()]);
	return { rich_sources_column, sheet };
}

export async function divcordDataAgeMilliseconds(cache?: Cache) {
	if (!cache) {
		cache = await caches.open('divcord');
	}
	const responses = await loadCachedResponses(cache);
	if (!responses) return null;
	const { rich, sheet } = responses;

	const richTimestamp = new Date(rich.headers.get('date')!).getTime();
	const sheetTimestamp = new Date(sheet.headers.get('date')!).getTime();
	const oldest = Math.min(richTimestamp, sheetTimestamp);
	const difference = Date.now() - oldest;
	return difference;
}

export async function updateDivcordRecords(cache: Cache) {
	await Promise.all([cache.add(richUrl()), cache.add(sheetUrl())]);
	const responses = await loadCachedResponses(cache);

	const divcordTableData = await serializeDivcordResponses(responses!);
	const { default: initWasmModule, parsed_records } = await import('./pkg/sources_wasm.js');
	await initWasmModule();
	const records = parsed_records(divcordTableData, poeDataJson) as ISourcefulDivcordTableRecord[];
	localStorage.setItem('records', JSON.stringify(records));
	return records;
}

export async function loadDivcordRecords() {
	const cache = await caches.open('divcord');
	const recordsFromLocalStorage = localStorage.getItem('records');

	if (!recordsFromLocalStorage) {
		updateDivcordRecords(cache);
		return await import('../src/jsons/jsons').then(r => r.divcordRecords);
	} else {
		const age = await divcordDataAgeMilliseconds(cache);
		if (age! >= ONE_DAY_MILLISECONDS) {
			updateDivcordRecords(cache);
		}

		return JSON.parse(recordsFromLocalStorage) as ISourcefulDivcordTableRecord[];
	}
}
