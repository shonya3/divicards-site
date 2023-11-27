import type { ISourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord.js';
import { IDivcordData, poeDataJson } from './jsons/jsons.js';
import { SourcefulDivcordTableRecord } from './data/SourcefulDivcordTableRecord.js';
import { IPoeData } from './PoeData.js';

export type DivcordResponses = {
	rich: Response;
	sheet: Response;
};

const ONE_DAY_MILLISECONDS = 86_400_000;
const CACHE_KEY = import.meta.env.PACKAGE_VERSION;
const LOCAL_STORAGE_KEY = 'divcord';

export type CacheValidity = 'valid' | 'stale' | 'not exist';
export type DivcordServiceEventType = 'state-updated';
export type DivcordServiceState = 'idle' | 'updating' | 'updated' | 'error';

export class DivcordServiceEvent extends Event {
	constructor(type: DivcordServiceEventType) {
		super(type);
	}
}

export class DivcordService extends EventTarget {
	#state: DivcordServiceState = 'idle';
	addEventListener(type: DivcordServiceEventType, callback: (e: DivcordServiceEvent) => void): void {
		super.addEventListener(type, callback);
	}

	get state() {
		return this.#state;
	}

	set state(val: DivcordServiceState) {
		this.#state = val;
		this.dispatchEvent(new DivcordServiceEvent('state-updated'));
	}

	async read(cache?: Cache): Promise<SourcefulDivcordTableRecord[]> {
		if (!cache) cache = await this.#cache();

		const validity = await this.checkValidity(cache);
		switch (validity) {
			case 'valid': {
				return this.#fromLocalStorage();
			}
			case 'stale': {
				this.update(cache);
				return this.#fromLocalStorage();
			}
			case 'not exist': {
				this.update(cache);
				return await this.#fromStaticJson();
			}
		}
	}

	async update(cache?: Cache): Promise<SourcefulDivcordTableRecord[]> {
		if (!cache) cache = await this.#cache();

		try {
			this.state = 'updating';
			await Promise.all([cache.add(richUrl()), cache.add(sheetUrl())]);
			const resp = await this.#cachedResponses(cache);
			const divcordData = await this.#serializeResponses(resp!);
			const records = await parseRecords(divcordData, poeDataJson);
			this.#saveLocalStorage(records);
			const recs = records.map(r => new SourcefulDivcordTableRecord(r));
			this.state = 'updated';
			return recs;
		} catch (err) {
			this.state = 'error';
			throw err;
		}
	}

	async cacheDate(cache?: Cache): Promise<Date | null> {
		if (!cache) cache = await this.#cache();
		const resp = await this.#cachedResponses(cache);
		if (!resp) {
			return null;
		}

		return new Date(resp.rich.headers.get('date')!);
	}

	async cacheAge(cache?: Cache): Promise<number | null> {
		if (!cache) cache = await this.#cache();
		const date = await this.cacheDate(cache);
		if (!date) {
			return null;
		}

		return Date.now() - date.getTime();
	}

	async checkValidity(cache?: Cache): Promise<CacheValidity> {
		if (!cache) cache = await this.#cache();
		const millis = await this.cacheAge(cache);
		if (millis === null || localStorage.getItem(CACHE_KEY) === null) {
			return 'not exist';
		}

		return millis < ONE_DAY_MILLISECONDS ? 'valid' : 'stale';
	}

	async #cache(): Promise<Cache> {
		return await caches.open(CACHE_KEY);
	}

	async #cachedResponses(cache?: Cache): Promise<DivcordResponses | null> {
		if (!cache) cache = await this.#cache();
		const rich = await cache.match(richUrl());
		const sheet = await cache.match(sheetUrl());
		if (!rich || !sheet) return null;
		return {
			rich,
			sheet,
		};
	}

	async #serializeResponses(r: DivcordResponses): Promise<IDivcordData> {
		const [rich_sources_column, sheet] = await Promise.all([r.rich.json(), r.sheet.json()]);
		return { rich_sources_column, sheet };
	}

	#fromLocalStorage(): SourcefulDivcordTableRecord[] {
		const records = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (!records) {
			throw new Error(`No divcord in LocalStorage, key: ${CACHE_KEY}`);
		}

		const iRecords = JSON.parse(records) as ISourcefulDivcordTableRecord[];
		return iRecords.map(r => new SourcefulDivcordTableRecord(r));
	}

	async #fromStaticJson(): Promise<SourcefulDivcordTableRecord[]> {
		const { divcordRecords } = await import('./jsons/jsons.js');
		return divcordRecords.map(r => new SourcefulDivcordTableRecord(r));
	}

	#saveLocalStorage(records: ISourcefulDivcordTableRecord[]) {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
	}
}

function sheetUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const range = `${sheet}!A3:Z`;
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}?key=${key}`;
	return url;
}

function richUrl(): string {
	const key = 'AIzaSyBVoDF_twBBT_MEV5nfNgekVHUSn9xodfg';
	const spreadsheet_id = '1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU';
	const sheet = 'Cards_and_Hypotheses';
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}?&ranges=${sheet}!F3:F&includeGridData=true&key=${key}`;
	return url;
}

async function parseRecords(divcord: IDivcordData, poeData: IPoeData): Promise<ISourcefulDivcordTableRecord[]> {
	const { default: initWasmModule, parsed_records } = await import('./pkg/sources_wasm.js');
	await initWasmModule();
	const records = parsed_records(divcord, poeData) as ISourcefulDivcordTableRecord[];
	return records;
}

export const divcordService = new DivcordService();
