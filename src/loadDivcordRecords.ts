import { ISourcefulDivcordTableRecord } from './data/records.types.js';
import { poeDataJson } from './jsons/jsons.js';
import initWasmPackage, { parsed_records } from './pkg/sources_wasm.js';
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

async function loadCachedResponses(cache: Cache) {
	const _richUrl = richUrl();
	const _sheetUrl = sheetUrl();

	const richResponse = await cache.match(_richUrl);
	const sheetResponse = await cache.match(_sheetUrl);

	return { richResponse, sheetResponse };
}

async function serializeResponses(richResponse: Response, sheetResponse: Response) {
	const [rich_sources_column, sheet] = await Promise.all([richResponse.json(), sheetResponse.json()]);
	return { rich_sources_column, sheet };
}

export async function divcordDataAgeMilliseconds(cache: Cache) {
	const { richResponse, sheetResponse } = await loadCachedResponses(cache);
	if (!richResponse || !sheetResponse) return null;

	const richTimestamp = new Date(richResponse.headers.get('date')!).getTime();
	const sheetTimestamp = new Date(sheetResponse.headers.get('date')!).getTime();
	const oldest = Math.min(richTimestamp, sheetTimestamp);
	const difference = Date.now() - oldest;
	return difference;
}

export async function updateDivcordRecords(cache: Cache) {
	await Promise.all([cache.add(richUrl()), cache.add(sheetUrl())]);
	const { richResponse, sheetResponse } = await loadCachedResponses(cache);

	const divcordTableData = await serializeResponses(richResponse!, sheetResponse!);
	await initWasmPackage();
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
